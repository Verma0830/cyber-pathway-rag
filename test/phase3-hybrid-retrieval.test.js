/**
 * Phase 3 Test Suite: Hybrid Retrieval, Embeddings, Sufficiency, & Citations
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalSemanticEmbeddingProvider } from '../src/retrieval/local-embedding.js';
import { rewriteQuery } from '../src/retrieval/query-rewriter.js';
import { SufficiencyEvaluator } from '../src/retrieval/sufficiency-evaluator.js';
import { buildCitations, appendMarkdownCitations } from '../src/retrieval/citation-builder.js';
import { HybridRetriever } from '../src/retrieval/hybrid-retriever.js';
import { SQLiteStore } from '../src/db/sqlite-store.js';
import { IngestionPipeline } from '../src/ingestion/pipeline.js';
import { SEED_RESOURCES } from '../src/data/seed-catalog.js';

test('Local Semantic Embedding Provider', async (t) => {
  const provider = new LocalSemanticEmbeddingProvider(384);

  await t.test('generates unit-normalized 384-dim vectors', async () => {
    const vec = await provider.embedQuery('Penetration testing and ethical hacking methodologies');
    assert.equal(vec.length, 384);

    let norm = 0;
    for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
    assert.ok(Math.abs(Math.sqrt(norm) - 1.0) < 0.01, 'Vector must be L2 normalized to 1.0');
  });

  await t.test('computes higher cosine similarity for semantically related queries', async () => {
    const vecA = await provider.embedQuery('SQL injection vulnerabilities in web applications');
    const vecB = await provider.embedQuery('Exploiting SQL database injection flaws');
    const vecC = await provider.embedQuery('Baking chocolate chip cookies in an oven');

    const simRelated = LocalSemanticEmbeddingProvider.cosineSimilarity(vecA, vecB);
    const simUnrelated = LocalSemanticEmbeddingProvider.cosineSimilarity(vecA, vecC);

    assert.ok(simRelated > simUnrelated * 2, `Related sim (${simRelated}) must significantly exceed unrelated sim (${simUnrelated})`);
    assert.ok(simRelated > 0.15, `Expected related similarity > 0.15, got ${simRelated}`);
    assert.ok(simUnrelated < 0.10, `Unrelated similarity should be low (< 0.10), got ${simUnrelated}`);
  });
});

test('Query Rewriting & Temporal Detection', async (t) => {
  await t.test('expands cybersecurity acronyms correctly', () => {
    const res = rewriteQuery('How do I secure k8s pods and prevent sqli?');
    assert.ok(res.expandedQuery.includes('kubernetes'));
    assert.ok(res.expandedQuery.includes('sql injection'));
  });

  await t.test('detects demand for latest / current intelligence', () => {
    const recencyQuery = rewriteQuery('What are the latest breaking CVE vulnerabilities this year?');
    assert.equal(recencyQuery.requiresRecency, true);

    const staticQuery = rewriteQuery('Explain the OSI model and TCP three-way handshake.');
    assert.equal(staticQuery.requiresRecency, false);
  });
});

test('Sufficiency Evaluator', async (t) => {
  const evaluator = new SufficiencyEvaluator({ similarityThreshold: 0.35, minEvidenceCount: 2 });

  await t.test('considers high-score multi-evidence retrieval sufficient', () => {
    const evalResult = evaluator.evaluate({
      query: 'OWASP Top 10 Web Security',
      retrievedItems: [
        { id: '1', score: 0.85, title: 'OWASP Top 10' },
        { id: '2', score: 0.72, title: 'PortSwigger Web Security' }
      ]
    });

    assert.equal(evalResult.isSufficient, true);
    assert.equal(evalResult.triggerLiveSearch, false);
  });

  await t.test('triggers live search when evidence score is below threshold', () => {
    const evalResult = evaluator.evaluate({
      query: 'Novel Quantum-Resistant Kernel Vulnerability 2026',
      retrievedItems: [
        { id: '1', score: 0.15, title: 'Old General Linux Doc' }
      ]
    });

    assert.equal(evalResult.isSufficient, false);
    assert.equal(evalResult.triggerLiveSearch, true);
    assert.ok(evalResult.reason.includes('fell below sufficiency threshold'));
  });

  await t.test('triggers live search when recency is demanded', () => {
    const evalResult = evaluator.evaluate({
      query: 'What is the latest zero-day today?',
      retrievedItems: [{ id: '1', score: 0.90, title: 'Historical Doc' }],
      requiresRecency: true
    });

    assert.equal(evalResult.isSufficient, false);
    assert.equal(evalResult.triggerLiveSearch, true);
  });
});

test('Citation Builder & Provenance Badging', async (t) => {
  const sample = [
    {
      id: 'res-1',
      title: 'NIST CSF 2.0',
      canonicalUrl: 'https://www.nist.gov/cyberframework',
      provider: { name: 'NIST' },
      provenance: { origin: 'internal_index' },
      difficultyLevel: 'beginner',
      health: { isAlive: true }
    },
    {
      id: 'res-2',
      title: 'CISA Live Advisory',
      canonicalUrl: 'https://www.cisa.gov/news-events/cybersecurity-advisories',
      provider: { name: 'CISA' },
      provenance: { origin: 'live_search' },
      difficultyLevel: 'intermediate',
      health: { isAlive: true }
    }
  ];

  const citations = buildCitations(sample);
  assert.equal(citations.length, 2);
  assert.equal(citations[0].provenanceBadge, 'Indexed');
  assert.equal(citations[1].provenanceBadge, 'Live search');

  const markdown = appendMarkdownCitations('Here is guidance based on verified sources.', citations);
  assert.ok(markdown.includes('`[Indexed]`'));
  assert.ok(markdown.includes('`[Live search]`'));
  assert.ok(markdown.includes('https://www.nist.gov/cyberframework'));
});

test('Hybrid Retriever Integration', async () => {
  const store = new SQLiteStore(':memory:');
  await store.initialize();

  const pipeline = new IngestionPipeline({ db: store });
  // Seed first 20 items
  await pipeline.ingestBatch(SEED_RESOURCES.slice(0, 20));

  const retriever = new HybridRetriever({ db: store });

  const response = await retriever.retrieve({
    query: 'How can I learn web application security and SQL injection?',
    topK: 3
  });

  assert.ok(response.results.length > 0, 'Must retrieve matching results');
  const titles = response.results.map(r => r.title.toLowerCase());
  const foundRelevant = titles.some(t => t.includes('owasp') || t.includes('portswigger') || t.includes('web'));
  assert.ok(foundRelevant, `Expected web security resources, got: ${titles.join(', ')}`);

  assert.equal(response.sourceOrigin, 'internal_index');
  assert.equal(response.citations.length, response.results.length);

  await store.close();
});
