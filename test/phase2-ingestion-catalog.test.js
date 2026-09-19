/**
 * Phase 2 Test Suite: Seed Catalog, Normalizer, Chunker, & Ingestion Pipeline
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_RESOURCES } from '../src/data/seed-catalog.js';
import { validateResource } from '../src/models/resource-schema.js';
import { getAllDomains } from '../src/taxonomy/cybersecurity-taxonomy.js';
import { normalizeContent, computeContentHash, computeSimilarity } from '../src/ingestion/normalizer.js';
import { chunkDocument } from '../src/ingestion/chunker.js';
import { SQLiteStore } from '../src/db/sqlite-store.js';
import { IngestionPipeline } from '../src/ingestion/pipeline.js';

test('Seed Catalog Integrity & Full Domain Coverage', async (t) => {
  await t.test('contains at least 50 curated resources', () => {
    assert.ok(SEED_RESOURCES.length >= 50, `Expected at least 50 resources, got ${SEED_RESOURCES.length}`);
  });

  await t.test('every single resource conforms to strict canonical schema', () => {
    for (const res of SEED_RESOURCES) {
      const val = validateResource(res);
      assert.equal(val.valid, true, `Resource ${res.id} (${res.title}) failed validation: ${val.errors.join(', ')}`);
    }
  });

  await t.test('every one of the 26 domains is covered by at least one resource', () => {
    const allDomains = getAllDomains();
    const coveredDomains = new Set(SEED_RESOURCES.map(r => r.taxonomy.domainId));

    for (const domain of allDomains) {
      assert.ok(
        coveredDomains.has(domain.id),
        `Domain '${domain.id}' (${domain.name}) has no seeded resources in catalog!`
      );
    }
  });

  await t.test('100% of resources are free and legal', () => {
    for (const res of SEED_RESOURCES) {
      assert.ok(
        ['always_free_open_access', 'free_tier_available'].includes(res.freeAccessStatus),
        `Resource ${res.id} has invalid free access status: ${res.freeAccessStatus}`
      );
      assert.ok(
        res.canonicalUrl.startsWith('http://') || res.canonicalUrl.startsWith('https://'),
        `Resource ${res.id} has invalid URL protocol`
      );
    }
  });
});

test('Content Normalizer & Deduplication', async (t) => {
  await t.test('strips HTML boilerplate, scripts, and navigation tags', () => {
    const raw = `
      <html>
        <head><script>alert('malicious')</script></head>
        <nav><a href="/">Home</a></nav>
        <body>
          <h1>OWASP Top 10</h1>
          <p>Broken Access Control is the <b>#1</b> risk.</p>
          <footer>Copyright 2026</footer>
        </body>
      </html>
    `;

    const cleaned = normalizeContent(raw);
    assert.ok(!cleaned.includes('alert'), 'Must strip script tags');
    assert.ok(!cleaned.includes('Home'), 'Must strip nav tags');
    assert.ok(!cleaned.includes('Copyright'), 'Must strip footer tags');
    assert.ok(cleaned.includes('OWASP Top 10'));
    assert.ok(cleaned.includes('Broken Access Control is the #1 risk.'));
  });

  await t.test('computes deterministic content hashes', () => {
    const text1 = "Linux file permissions use chmod and chown commands.";
    const text2 = "Linux file permissions use chmod and chown commands.";
    const text3 = "Different text entirely.";

    assert.equal(computeContentHash(text1), computeContentHash(text2));
    assert.notEqual(computeContentHash(text1), computeContentHash(text3));
  });

  await t.test('computes near-duplicate Jaccard similarity', () => {
    const textA = "Wireshark packet analysis reveals TCP three-way handshakes and SYN flags.";
    const textB = "Wireshark packet analysis reveals TCP three-way handshakes and SYN packets.";
    const textC = "Cooking recipes with olive oil and fresh garlic.";

    const simHigh = computeSimilarity(textA, textB);
    const simLow = computeSimilarity(textA, textC);

    assert.ok(simHigh > 0.4, `Expected high similarity between related texts, got ${simHigh}`);
    assert.equal(simLow, 0.0, `Expected 0 similarity for completely unrelated texts, got ${simLow}`);
  });
});

test('Semantic Chunker', async (t) => {
  await t.test('chunks document and preserves section headings', () => {
    const doc = `
# Introduction
Cybersecurity fundamentals require solid understanding of TCP/IP protocols.

# Hands-on Practice
Use OverTheWire Bandit to practice command-line commands.
    `;

    const chunks = chunkDocument({
      resourceId: 'test-res-101',
      text: doc,
      metadata: { title: 'Test Guide', domainId: 'fundamentals' },
      maxWords: 50
    });

    assert.ok(chunks.length >= 2, `Expected at least 2 chunks, got ${chunks.length}`);
    assert.ok(chunks[0].text.includes('Cybersecurity fundamentals'));
    assert.ok(chunks[1].heading.includes('Hands-on Practice'));
  });
});

test('Ingestion Pipeline Integration with SQLite', async () => {
  const store = new SQLiteStore(':memory:');
  await store.initialize();

  const pipeline = new IngestionPipeline({ db: store });

  const batchResult = await pipeline.ingestBatch(SEED_RESOURCES.slice(0, 10));
  assert.equal(batchResult.successful, 10);
  assert.equal(batchResult.failed, 0);

  const stored = await store.getAllResources();
  assert.equal(stored.length, 10);

  // Attempt duplicate ingestion
  const duplicate = await pipeline.ingestResource(SEED_RESOURCES[0]);
  // Should succeed via update or handle duplicate URL
  assert.ok(duplicate.success, 'Updating existing resource with same ID should succeed');

  await store.close();
});
