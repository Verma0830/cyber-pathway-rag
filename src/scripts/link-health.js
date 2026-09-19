/**
 * CLI Script: Audit Link Health Across Ingested Resources
 */
import path from 'node:path';
import { SQLiteStore } from '../db/sqlite-store.js';
import { validateLinkHealth } from '../ingestion/link-validator.js';

async function main() {
  const dbPath = path.resolve(process.cwd(), 'data', 'cyber_rag.db');
  console.log(`[LINK HEALTH] Checking resources in database: ${dbPath}`);

  const store = new SQLiteStore(dbPath);
  await store.initialize();

  const resources = await store.getAllResources({ limit: 10 }); // sample check first 10
  console.log(`[LINK HEALTH] Testing sample of ${resources.length} resources...`);

  let alive = 0;
  let dead = 0;

  for (const res of resources) {
    process.stdout.write(`Checking ${res.title.slice(0, 40)}... `);
    const health = await validateLinkHealth(res.canonicalUrl, 6000);

    if (health.isAlive) {
      alive++;
      console.log(`[OK ${health.httpStatus}] (${health.responseTimeMs}ms)`);
    } else {
      dead++;
      console.log(`[FAIL ${health.httpStatus}] - ${health.error}`);
    }

    await store.updateResourceHealth(res.id, {
      httpStatus: health.httpStatus,
      isAlive: health.isAlive,
      lastCheckedAt: new Date().toISOString(),
      errorMessage: health.error
    });
  }

  console.log(`\n[LINK HEALTH SUMMARY] Sample audited: ${resources.length}, Alive: ${alive}, Failed: ${dead}`);
  await store.close();
}

main().catch(err => {
  console.error('[LINK HEALTH ERROR]', err);
  process.exit(1);
});
