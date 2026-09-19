/**
 * Phase 5 Test Suite: Fastify Server REST & RAG API Integration
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../src/server.js';

test('Fastify Server REST & RAG API Endpoints', async (t) => {
  const { app, db } = await buildServer({ dbPath: ':memory:' });

  await t.test('GET /api/health reports healthy status and zero cost', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.status, 'healthy');
    assert.ok(body.cost.includes('$0.00'));
    assert.ok(body.indexedResources > 0);
  });

  await t.test('GET /api/taxonomy returns all 26 domains', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/taxonomy' });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.domains.length, 26);
  });

  await t.test('POST /api/profile/recommend returns top specialization matches', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/profile/recommend',
      payload: {
        current_background: 'software_dev',
        primary_interest: 'breaking',
        weekly_hours: 'moderate'
      }
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(body.recommendations.length > 0);
  });

  await t.test('POST /api/roadmap/generate creates 4-stage personalized roadmap', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/roadmap/generate',
      payload: {
        domainId: 'penetration_testing',
        userProfile: { weeklyHours: 10 }
      }
    });

    assert.equal(res.statusCode, 200);
    const roadmap = JSON.parse(res.body);
    assert.equal(roadmap.domainId, 'penetration_testing');
    assert.equal(roadmap.stages.length, 5);
    assert.ok(roadmap.immediateNextAction);
  });

  await t.test('POST /api/chat provides grounded response with citations', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/chat',
      payload: {
        query: 'What is the OWASP Top 10 web security standard?'
      }
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(body.answer.includes('OWASP'));
    assert.ok(body.citations.length > 0);
    assert.ok(body.citations[0].canonicalUrl.startsWith('http'));
  });

  await t.test('GET /api/resources filters by domain', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/resources?domainId=fundamentals'
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(body.count > 0);
    for (const r of body.resources) {
      assert.equal(r.taxonomy.domainId, 'fundamentals');
    }
  });

  await t.test('POST /api/feedback/link registers broken link report', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/feedback/link',
      payload: {
        resourceId: 'seed-fund-001',
        issueType: 'broken_link',
        details: 'Testing feedback endpoint'
      }
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
  });

  await t.test('GET /api/admin/overview & POST /api/admin/approve/:id', async () => {
    const overviewRes = await app.inject({ method: 'GET', url: '/api/admin/overview' });
    assert.equal(overviewRes.statusCode, 200);
    const overview = JSON.parse(overviewRes.body);
    assert.ok(overview.totalResources > 0);

    // Test approval endpoint
    const approveRes = await app.inject({ method: 'POST', url: '/api/admin/approve/seed-fund-001' });
    assert.equal(approveRes.statusCode, 200);
    const approveBody = JSON.parse(approveRes.body);
    assert.equal(approveBody.resource.provenance.reviewStatus, 'approved');
  });

  await app.close();
  await db.close();
});
