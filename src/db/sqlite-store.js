/**
 * SQLite Database Store implementing IDatabase
 * Uses Node.js native DatabaseSync (zero external C++ dependencies, 100% zero-cost).
 */
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { IDatabase } from '../adapters/IDatabase.js';
import { createResource, validateResource } from '../models/resource-schema.js';

export class SQLiteStore extends IDatabase {
  constructor(dbPath = ':memory:') {
    super('sqlite-store');
    this.dbPath = dbPath;
    this.db = null;
  }

  async initialize() {
    if (this.dbPath !== ':memory:') {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new DatabaseSync(this.dbPath);

    // Enable WAL mode and foreign keys for high concurrent performance
    this.db.exec('PRAGMA foreign_keys = ON;');

    // 1. Resources Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        canonical_url TEXT NOT NULL UNIQUE,
        resource_type TEXT NOT NULL,
        provider_name TEXT NOT NULL,
        provider_type TEXT,
        provider_reputation REAL DEFAULT 0.8,
        domain_id TEXT NOT NULL,
        subdomain_id TEXT NOT NULL,
        topics_json TEXT DEFAULT '[]',
        difficulty_level TEXT NOT NULL,
        prerequisites_json TEXT DEFAULT '[]',
        concepts_json TEXT DEFAULT '[]',
        language TEXT DEFAULT 'en',
        estimated_time_minutes INTEGER DEFAULT 30,
        publication_date TEXT,
        last_updated_date TEXT,
        free_access_status TEXT DEFAULT 'always_free_open_access',
        license TEXT,
        credibility_score REAL DEFAULT 0.9,
        credibility_justification TEXT,
        provenance_origin TEXT DEFAULT 'internal_index',
        review_status TEXT DEFAULT 'approved',
        approved_by TEXT DEFAULT 'automated_ruleset',
        discovered_at TEXT,
        last_checked_at TEXT,
        http_status INTEGER DEFAULT 200,
        is_alive INTEGER DEFAULT 1,
        failure_count INTEGER DEFAULT 0,
        transcript_available INTEGER DEFAULT 0,
        content_summary TEXT,
        content_hash TEXT,
        audience TEXT DEFAULT 'general_learner',
        safety_classification TEXT DEFAULT 'safe_educational',
        raw_json TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_resources_domain ON resources (domain_id);
      CREATE INDEX IF NOT EXISTS idx_resources_difficulty ON resources (difficulty_level);
      CREATE INDEX IF NOT EXISTS idx_resources_review ON resources (review_status);
      CREATE INDEX IF NOT EXISTS idx_resources_url ON resources (canonical_url);
    `);

    // 2. Resource Vectors Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS resource_vectors (
        resource_id TEXT PRIMARY KEY,
        dimension INTEGER NOT NULL,
        vector_json TEXT NOT NULL,
        updated_at TEXT,
        FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
      );
    `);

    // 3. Users Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        role TEXT DEFAULT 'learner',
        profile_json TEXT,
        created_at TEXT,
        updated_at TEXT
      );
    `);

    // 4. Roadmaps Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS roadmaps (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        domain_id TEXT NOT NULL,
        title TEXT NOT NULL,
        roadmap_json TEXT NOT NULL,
        progress_json TEXT DEFAULT '{}',
        created_at TEXT,
        updated_at TEXT
      );
    `);

    // 5. Link Health & Feedback Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS link_health_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resource_id TEXT NOT NULL,
        checked_at TEXT NOT NULL,
        http_status INTEGER,
        is_alive INTEGER,
        error_message TEXT
      );

      CREATE TABLE IF NOT EXISTS link_feedback (
        id TEXT PRIMARY KEY,
        resource_id TEXT NOT NULL,
        reported_by TEXT,
        issue_type TEXT NOT NULL,
        details TEXT,
        created_at TEXT NOT NULL,
        resolved INTEGER DEFAULT 0
      );
    `);

    return true;
  }

  // Resources implementation
  async insertResource(resourceData) {
    const resource = createResource(resourceData);
    const val = validateResource(resource);
    if (!val.valid) {
      throw new Error(`Resource validation failed: ${val.errors.join(', ')}`);
    }

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO resources (
        id, title, canonical_url, resource_type,
        provider_name, provider_type, provider_reputation,
        domain_id, subdomain_id, topics_json,
        difficulty_level, prerequisites_json, concepts_json,
        language, estimated_time_minutes, publication_date, last_updated_date,
        free_access_status, license,
        credibility_score, credibility_justification,
        provenance_origin, review_status, approved_by, discovered_at,
        last_checked_at, http_status, is_alive, failure_count,
        transcript_available, content_summary, content_hash,
        audience, safety_classification, raw_json
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?
      )
    `);

    stmt.run(
      resource.id,
      resource.title,
      resource.canonicalUrl,
      resource.resourceType,
      resource.provider.name,
      resource.provider.type,
      resource.provider.reputationScore,
      resource.taxonomy.domainId,
      resource.taxonomy.subdomainId,
      JSON.stringify(resource.taxonomy.topics || []),
      resource.difficultyLevel,
      JSON.stringify(resource.prerequisites || []),
      JSON.stringify(resource.conceptsCovered || []),
      resource.language,
      resource.estimatedTimeMinutes,
      resource.publicationDate,
      resource.lastUpdatedDate,
      resource.freeAccessStatus,
      resource.license,
      resource.credibility.score,
      resource.credibility.justification,
      resource.provenance.origin,
      resource.provenance.reviewStatus,
      resource.provenance.approvedBy,
      resource.provenance.discoveredAt,
      resource.health.lastCheckedAt,
      resource.health.httpStatus,
      resource.health.isAlive ? 1 : 0,
      resource.health.failureCount,
      resource.transcriptAvailable ? 1 : 0,
      resource.contentSummary,
      resource.contentHash,
      resource.audience,
      resource.safetyClassification,
      JSON.stringify(resource)
    );

    return resource;
  }

  async getResourceById(id) {
    const stmt = this.db.prepare('SELECT raw_json FROM resources WHERE id = ?');
    const row = stmt.get(id);
    return row ? JSON.parse(row.raw_json) : null;
  }

  async getResourceByUrl(url) {
    const stmt = this.db.prepare('SELECT raw_json FROM resources WHERE canonical_url = ?');
    const row = stmt.get(url);
    return row ? JSON.parse(row.raw_json) : null;
  }

  async getAllResources(filter = {}) {
    let query = 'SELECT raw_json FROM resources WHERE 1=1';
    const params = [];

    if (filter.domainId) {
      query += ' AND domain_id = ?';
      params.push(filter.domainId);
    }
    if (filter.subdomainId) {
      query += ' AND subdomain_id = ?';
      params.push(filter.subdomainId);
    }
    if (filter.difficultyLevel) {
      query += ' AND difficulty_level = ?';
      params.push(filter.difficultyLevel);
    }
    if (filter.resourceType) {
      query += ' AND resource_type = ?';
      params.push(filter.resourceType);
    }
    if (filter.reviewStatus) {
      query += ' AND review_status = ?';
      params.push(filter.reviewStatus);
    }
    if (filter.isAlive !== undefined) {
      query += ' AND is_alive = ?';
      params.push(filter.isAlive ? 1 : 0);
    }

    query += ' ORDER BY credibility_score DESC';

    if (filter.limit) {
      query += ' LIMIT ?';
      params.push(filter.limit);
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    return rows.map(r => JSON.parse(r.raw_json));
  }

  async updateResourceHealth(id, healthData) {
    const res = await this.getResourceById(id);
    if (!res) return null;

    res.health.lastCheckedAt = healthData.lastCheckedAt || new Date().toISOString();
    res.health.httpStatus = healthData.httpStatus || 200;
    res.health.isAlive = healthData.isAlive ?? true;
    if (!res.health.isAlive) {
      res.health.failureCount = (res.health.failureCount || 0) + 1;
    } else {
      res.health.failureCount = 0;
    }

    const stmt = this.db.prepare(`
      UPDATE resources
      SET last_checked_at = ?, http_status = ?, is_alive = ?, failure_count = ?, raw_json = ?
      WHERE id = ?
    `);
    stmt.run(
      res.health.lastCheckedAt,
      res.health.httpStatus,
      res.health.isAlive ? 1 : 0,
      res.health.failureCount,
      JSON.stringify(res),
      id
    );

    // Record health log
    const logStmt = this.db.prepare(`
      INSERT INTO link_health_log (resource_id, checked_at, http_status, is_alive, error_message)
      VALUES (?, ?, ?, ?, ?)
    `);
    logStmt.run(id, res.health.lastCheckedAt, res.health.httpStatus, res.health.isAlive ? 1 : 0, healthData.errorMessage || null);

    return res;
  }

  async updateResourceReviewStatus(id, reviewStatus, approvedBy = 'admin') {
    const res = await this.getResourceById(id);
    if (!res) return null;

    res.provenance.reviewStatus = reviewStatus;
    res.provenance.approvedBy = approvedBy;

    const stmt = this.db.prepare(`
      UPDATE resources
      SET review_status = ?, approved_by = ?, raw_json = ?
      WHERE id = ?
    `);
    stmt.run(reviewStatus, approvedBy, JSON.stringify(res), id);
    return res;
  }

  // Vector storage operations
  async saveVector(resourceId, vector) {
    const vectorArray = Array.from(vector);
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO resource_vectors (resource_id, dimension, vector_json, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(resourceId, vectorArray.length, JSON.stringify(vectorArray), new Date().toISOString());
  }

  async getAllVectors() {
    const stmt = this.db.prepare('SELECT resource_id, dimension, vector_json FROM resource_vectors');
    const rows = stmt.all();
    return rows.map(r => ({
      resourceId: r.resource_id,
      dimension: r.dimension,
      vector: JSON.parse(r.vector_json)
    }));
  }

  // Roadmaps
  async saveRoadmap(roadmap) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO roadmaps (
        id, user_id, domain_id, title, roadmap_json, progress_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    stmt.run(
      roadmap.id,
      roadmap.userId || 'anonymous',
      roadmap.domainId,
      roadmap.title,
      JSON.stringify(roadmap),
      JSON.stringify(roadmap.progress || {}),
      roadmap.createdAt || now,
      now
    );
    return roadmap;
  }

  async getRoadmapById(id) {
    const stmt = this.db.prepare('SELECT roadmap_json FROM roadmaps WHERE id = ?');
    const row = stmt.get(id);
    return row ? JSON.parse(row.roadmap_json) : null;
  }

  async updateStepProgress(roadmapId, stepId, status) {
    const roadmap = await this.getRoadmapById(roadmapId);
    if (!roadmap) return null;

    roadmap.progress = roadmap.progress || {};
    roadmap.progress[stepId] = {
      status,
      updatedAt: new Date().toISOString()
    };

    const stmt = this.db.prepare('UPDATE roadmaps SET roadmap_json = ?, progress_json = ?, updated_at = ? WHERE id = ?');
    stmt.run(JSON.stringify(roadmap), JSON.stringify(roadmap.progress), new Date().toISOString(), roadmapId);
    return roadmap;
  }

  // Users
  async createOrUpdateUser(userData) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO users (id, username, role, profile_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    stmt.run(
      userData.id,
      userData.username || 'learner_' + userData.id.slice(0, 6),
      userData.role || 'learner',
      JSON.stringify(userData.profile || {}),
      userData.createdAt || now,
      now
    );
    return userData;
  }

  async getUserById(id) {
    const stmt = this.db.prepare('SELECT id, username, role, profile_json, created_at, updated_at FROM users WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      role: row.role,
      profile: JSON.parse(row.profile_json || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Feedback
  async recordLinkFeedback(data) {
    const stmt = this.db.prepare(`
      INSERT INTO link_feedback (id, resource_id, reported_by, issue_type, details, created_at, resolved)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);
    const id = data.id || 'fb_' + Date.now();
    stmt.run(id, data.resourceId, data.reportedBy || 'learner', data.issueType, data.details || '', new Date().toISOString());
    return { id, ...data };
  }

  async getLinkFeedback() {
    const stmt = this.db.prepare('SELECT * FROM link_feedback ORDER BY created_at DESC');
    return stmt.all();
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
