/**
 * CLI Script: Ingest Curated Seed Catalog into SQLite Database
 */
import path from 'node:path';
import { SQLiteStore } from '../db/sqlite-store.js';
import { IngestionPipeline } from '../ingestion/pipeline.js';
import { SEED_RESOURCES } from '../data/seed-catalog.js';

async function main() {
  const dbPath = path.resolve(process.cwd(), 'data', 'cyber_rag.db');
  console.log(`[INGEST] Initializing SQLite database at: ${dbPath}`);

  const store = new SQLiteStore(dbPath);
  await store.initialize();

  const pipeline = new IngestionPipeline({ db: store });

  console.log(`[INGEST] Ingesting ${SEED_RESOURCES.length} curated resources across all 26 domains...`);
  const result = await pipeline.ingestBatch(SEED_RESOURCES);

  console.log(`[INGEST] Batch Ingestion Complete!`);
  console.log(` - Total Seed Items: ${result.total}`);
  console.log(` - Successfully Ingested: ${result.successful}`);
  console.log(` - Failed: ${result.failed}`);

  if (result.errors.length > 0) {
    console.error(`[INGEST] Errors:`, result.errors);
  }

  const allInDb = await store.getAllResources();
  console.log(`[INGEST] Database now contains ${allInDb.length} verified resources.`);

  await store.close();
}

main().catch(err => {
  console.error('[INGEST ERROR]', err);
  process.exit(1);
});
