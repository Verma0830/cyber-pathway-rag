/**
 * Production Fastify API Server
 * Exposes RAG chat, roadmap generation, diagnostic profiling,
 * resource search, link feedback, and admin portal APIs.
 */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SQLiteStore } from './db/sqlite-store.js';
import { getAllDomains, getDomainById } from './taxonomy/cybersecurity-taxonomy.js';
import { recommendSpecializations, DIAGNOSTIC_QUESTIONS } from './roadmap/diagnostic-profiler.js';
import { RoadmapGenerator } from './roadmap/roadmap-generator.js';
import { HybridRetriever } from './retrieval/hybrid-retriever.js';
import { ConversationalAssistant } from './assistant/conversational-assistant.js';
import { SEED_RESOURCES } from './data/seed-catalog.js';
import { IngestionPipeline } from './ingestion/pipeline.js';
import { validateLinkHealth } from './ingestion/link-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildServer(options = {}) {
  const app = Fastify({
    logger: options.logger ?? false
  });

  await app.register(cors, { origin: true });
  await app.register(cookie, { secret: 'cyber-pathway-secret-zero-cost' });
  await app.register(rateLimit, {
    max: 60,
    timeWindow: '1 minute'
  });
  await app.register(helmet, {
    contentSecurityPolicy: false
  });

  // Database initialization
  const dbPath = options.dbPath || path.resolve(process.cwd(), 'data', 'cyber_rag.db');
  const db = new SQLiteStore(dbPath);
  await db.initialize();

  // Auto-seed missing seed catalog items
  const pipeline = new IngestionPipeline({ db });
  for (const seed of SEED_RESOURCES) {
    const exists = await db.getResourceById(seed.id);
    if (!exists) {
      await pipeline.ingestResource(seed);
    }
  }

  // Core services
  const retriever = new HybridRetriever({ db });
  const assistant = new ConversationalAssistant();
  const roadmapGen = new RoadmapGenerator({ db });

  // Serve static UI from public/
  const publicDir = path.resolve(__dirname, '..', 'public');
  await app.register(fastifyStatic, {
    root: publicDir,
    prefix: '/'
  });

  // --- API Routes ---

  // Health check
  app.get('/api/health', async () => {
    const resCount = (await db.getAllResources()).length;
    return {
      status: 'healthy',
      runtime: 'Node.js (Pure JavaScript ESM)',
      cost: '$0.00 (Zero-Charge Architecture)',
      indexedResources: resCount,
      llmProvider: assistant.providerMode
    };
  });

  // Taxonomy & Diagnostics
  app.get('/api/taxonomy', async () => {
    return { domains: getAllDomains() };
  });

  app.get('/api/taxonomy/:id', async (req, reply) => {
    const domain = getDomainById(req.params.id);
    if (!domain) return reply.status(404).send({ error: 'Domain not found' });
    return domain;
  });

  app.get('/api/diagnostic-questions', async () => {
    return { questions: DIAGNOSTIC_QUESTIONS };
  });

  app.post('/api/profile/recommend', async (req) => {
    const responses = req.body || {};
    const recommendations = recommendSpecializations(responses);
    return { recommendations };
  });

  // Roadmaps
  app.post('/api/roadmap/generate', async (req, reply) => {
    const { domainId, userProfile } = req.body || {};
    if (!domainId) {
      return reply.status(400).send({ error: 'Field "domainId" is required' });
    }

    try {
      const roadmap = await roadmapGen.generateRoadmap({ domainId, userProfile });
      await db.saveRoadmap(roadmap);
      return roadmap;
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  app.get('/api/roadmap/:id', async (req, reply) => {
    const roadmap = await db.getRoadmapById(req.params.id);
    if (!roadmap) return reply.status(404).send({ error: 'Roadmap not found' });
    return roadmap;
  });

  app.post('/api/roadmap/:id/step', async (req, reply) => {
    const { stepId, status } = req.body || {};
    if (!stepId || !status) {
      return reply.status(400).send({ error: 'Fields "stepId" and "status" are required' });
    }
    const updated = await db.updateStepProgress(req.params.id, stepId, status);
    return updated;
  });

  // RAG Conversational Assistant
  app.post('/api/chat', async (req, reply) => {
    const { query, filter = {}, userProfile = {}, chatHistory = [], apiKey = '' } = req.body || {};
    if (!query || query.trim().length === 0) {
      return reply.status(400).send({ error: 'Query cannot be empty' });
    }

    // 1. Hybrid Retrieval (internal first, with sufficiency check)
    const retrieval = await retriever.retrieve({
      query,
      filter,
      topK: 4
    });

    // 2. Safe Conversational Synthesis
    const answer = await assistant.synthesizeEvidence({
      query,
      evidence: retrieval.results,
      userProfile,
      chatHistory,
      sourceOrigin: retrieval.sourceOrigin,
      apiKey
    });

    return {
      answer: answer.text,
      citations: answer.citations?.length ? answer.citations : retrieval.citations,
      sufficiency: retrieval.sufficiency,
      sourceOrigin: retrieval.sourceOrigin,
      blocked: answer.blocked,
      safetyReason: answer.safetyReason
    };
  });

  // Resources Catalog & Filters
  app.get('/api/resources', async (req) => {
    const { domainId, difficultyLevel, resourceType, reviewStatus } = req.query || {};
    const resources = await db.getAllResources({
      domainId,
      difficultyLevel,
      resourceType,
      reviewStatus
    });
    return { count: resources.length, resources };
  });

  // Feedback & Broken Link Reporting
  app.post('/api/feedback/link', async (req, reply) => {
    const { resourceId, issueType, details } = req.body || {};
    if (!resourceId || !issueType) {
      return reply.status(400).send({ error: 'resourceId and issueType are required' });
    }
    const feedback = await db.recordLinkFeedback({ resourceId, issueType, details });
    return { success: true, feedback };
  });

  // Admin Portal Endpoints
  app.get('/api/admin/overview', async () => {
    const all = await db.getAllResources();
    const pending = all.filter(r => r.provenance?.reviewStatus === 'pending_review');
    const dead = all.filter(r => r.health && !r.health.isAlive);
    const feedback = await db.getLinkFeedback();

    return {
      totalResources: all.length,
      pendingReviewCount: pending.length,
      deadLinkCount: dead.length,
      pendingResources: pending,
      deadResources: dead,
      userFeedback: feedback
    };
  });

  app.post('/api/admin/approve/:id', async (req, reply) => {
    const updated = await db.updateResourceReviewStatus(req.params.id, 'approved', 'admin_manual');
    if (!updated) return reply.status(404).send({ error: 'Resource not found' });
    return { success: true, resource: updated };
  });

  app.post('/api/admin/recheck-link/:id', async (req, reply) => {
    const res = await db.getResourceById(req.params.id);
    if (!res) return reply.status(404).send({ error: 'Resource not found' });

    const health = await validateLinkHealth(res.canonicalUrl, 6000);
    const updated = await db.updateResourceHealth(res.id, {
      httpStatus: health.httpStatus,
      isAlive: health.isAlive,
      lastCheckedAt: new Date().toISOString(),
      errorMessage: health.error
    });

    return { success: true, health, resource: updated };
  });

  return { app, db };
}

// Direct runner
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  buildServer({ logger: true }).then(({ app }) => {
    app.listen({ port: Number(PORT), host: HOST }, (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`\n======================================================`);
      console.log(`🛡️  CyberPathway RAG Platform running at: ${address}`);
      console.log(`💰 Architecture Cost: $0.00 (Zero Charge Guaranteed)`);
      console.log(`📚 Open your browser to explore roadmaps & verified RAG!`);
      console.log(`======================================================\n`);
    });
  });
}
