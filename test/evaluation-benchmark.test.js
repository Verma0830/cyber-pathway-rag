/**
 * Evaluation Benchmark Test
 * Tests quantitative thresholds: Recall@3 >= 85%, Zero Hallucination == 100%, Free Access == 100%.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { runEvaluationBenchmark } from '../src/scripts/evaluate.js';

test('Automated Evaluation Benchmark Suite', async () => {
  const metrics = await runEvaluationBenchmark(':memory:');

  assert.ok(metrics.recallRate >= 85, `Recall@3 (${metrics.recallRate}%) must be >= 85%`);
  assert.equal(metrics.zeroHallucinationRate, 100, `Zero-hallucination rate must be exactly 100%`);
  assert.equal(metrics.freeAccessRate, 100, `Free-access accuracy must be exactly 100%`);
  assert.ok(metrics.avgLatency < 500, `Average latency (${metrics.avgLatency}ms) must be under 500ms`);
  assert.equal(metrics.cost, '$0.00');
});
