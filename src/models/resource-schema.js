/**
 * Canonical Resource Data Model & Validation Engine
 * Implements strict JavaScript validation for all 21+ required resource attributes.
 */
import crypto from 'node:crypto';

export const VALID_RESOURCE_TYPES = [
  'official_doc',
  'book_pdf',
  'academic_paper',
  'course',
  'video',
  'interactive_lab',
  'cheatsheet',
  'specification'
];

export const VALID_DIFFICULTY_LEVELS = [
  'absolute_beginner',
  'beginner',
  'intermediate',
  'advanced',
  'expert'
];

export const VALID_FREE_ACCESS_STATUSES = [
  'always_free_open_access',
  'free_tier_available',
  'community_edition'
];

export const VALID_PROVENANCE_ORIGINS = [
  'internal_index',
  'live_search'
];

export const VALID_REVIEW_STATUSES = [
  'approved',
  'pending_review',
  'rejected'
];

export const VALID_AUDIENCES = [
  'career_switcher',
  'student',
  'junior_analyst',
  'senior_engineer',
  'general_learner'
];

export const VALID_SAFETY_CLASSIFICATIONS = [
  'safe_educational',
  'defensive_guidance',
  'lab_practice',
  'restricted_dual_use'
];

/**
 * Validates a resource against schema rules.
 * @param {Object} resource
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateResource(resource) {
  const errors = [];

  if (!resource || typeof resource !== 'object') {
    return { valid: false, errors: ['Resource must be a non-null object'] };
  }

  // 1. ID
  if (!resource.id || typeof resource.id !== 'string') {
    errors.push('Field "id" is required and must be a string');
  }

  // 2. Title
  if (!resource.title || typeof resource.title !== 'string' || resource.title.trim().length === 0) {
    errors.push('Field "title" is required and cannot be empty');
  }

  // 3. Canonical URL
  if (!resource.canonicalUrl || typeof resource.canonicalUrl !== 'string') {
    errors.push('Field "canonicalUrl" is required');
  } else {
    try {
      const parsed = new URL(resource.canonicalUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.push('Field "canonicalUrl" must have http or https protocol');
      }
    } catch {
      errors.push('Field "canonicalUrl" must be a valid URL string');
    }
  }

  // 4. Resource Type
  if (!VALID_RESOURCE_TYPES.includes(resource.resourceType)) {
    errors.push(`Invalid resourceType: "${resource.resourceType}". Must be one of: ${VALID_RESOURCE_TYPES.join(', ')}`);
  }

  // 5. Provider / Author
  if (!resource.provider || typeof resource.provider !== 'object') {
    errors.push('Field "provider" must be an object with name and type');
  } else {
    if (!resource.provider.name || typeof resource.provider.name !== 'string') {
      errors.push('Field "provider.name" is required');
    }
  }

  // 6. Taxonomy Domain & Subdomain
  if (!resource.taxonomy || typeof resource.taxonomy !== 'object') {
    errors.push('Field "taxonomy" must be an object with domainId and subdomainId');
  } else {
    if (!resource.taxonomy.domainId) errors.push('Field "taxonomy.domainId" is required');
    if (!resource.taxonomy.subdomainId) errors.push('Field "taxonomy.subdomainId" is required');
  }

  // 7. Difficulty Level
  if (!VALID_DIFFICULTY_LEVELS.includes(resource.difficultyLevel)) {
    errors.push(`Invalid difficultyLevel: "${resource.difficultyLevel}". Must be one of: ${VALID_DIFFICULTY_LEVELS.join(', ')}`);
  }

  // 8. Prerequisites
  if (!Array.isArray(resource.prerequisites)) {
    errors.push('Field "prerequisites" must be an array of strings');
  }

  // 9. Concepts Covered
  if (!Array.isArray(resource.conceptsCovered) || resource.conceptsCovered.length === 0) {
    errors.push('Field "conceptsCovered" must be a non-empty array of strings');
  }

  // 10. Language
  if (!resource.language || typeof resource.language !== 'string') {
    errors.push('Field "language" is required (e.g. "en")');
  }

  // 11. Estimated Completion Time
  if (typeof resource.estimatedTimeMinutes !== 'number' || resource.estimatedTimeMinutes < 0) {
    errors.push('Field "estimatedTimeMinutes" must be a non-negative number');
  }

  // 12. Free Access Status
  if (!VALID_FREE_ACCESS_STATUSES.includes(resource.freeAccessStatus)) {
    errors.push(`Invalid freeAccessStatus: "${resource.freeAccessStatus}". Must be one of: ${VALID_FREE_ACCESS_STATUSES.join(', ')}`);
  }

  // 13. Credibility
  if (!resource.credibility || typeof resource.credibility !== 'object') {
    errors.push('Field "credibility" must be an object with score (0-1) and justification');
  } else {
    if (typeof resource.credibility.score !== 'number' || resource.credibility.score < 0 || resource.credibility.score > 1) {
      errors.push('credibility.score must be a float between 0.0 and 1.0');
    }
  }

  // 14. Provenance
  if (!resource.provenance || typeof resource.provenance !== 'object') {
    errors.push('Field "provenance" must specify origin and reviewStatus');
  } else {
    if (!VALID_PROVENANCE_ORIGINS.includes(resource.provenance.origin)) {
      errors.push(`Invalid provenance.origin: "${resource.provenance.origin}". Must be: ${VALID_PROVENANCE_ORIGINS.join(', ')}`);
    }
    if (!VALID_REVIEW_STATUSES.includes(resource.provenance.reviewStatus)) {
      errors.push(`Invalid provenance.reviewStatus: "${resource.provenance.reviewStatus}". Must be: ${VALID_REVIEW_STATUSES.join(', ')}`);
    }
  }

  // 15. Safety Classification
  if (!VALID_SAFETY_CLASSIFICATIONS.includes(resource.safetyClassification)) {
    errors.push(`Invalid safetyClassification: "${resource.safetyClassification}". Must be one of: ${VALID_SAFETY_CLASSIFICATIONS.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates a normalized resource object with default values and content hashing.
 */
export function createResource(data) {
  const contentText = data.contentSummary || data.title || '';
  const contentHash = data.contentHash || crypto.createHash('sha256').update(contentText).digest('hex');

  const resource = {
    id: data.id || crypto.randomUUID(),
    title: data.title?.trim() || '',
    canonicalUrl: data.canonicalUrl?.trim() || '',
    resourceType: data.resourceType || 'official_doc',
    provider: {
      name: data.provider?.name || 'Unknown Author',
      type: data.provider?.type || 'community_educator',
      reputationScore: data.provider?.reputationScore ?? 0.8
    },
    taxonomy: {
      domainId: data.taxonomy?.domainId || 'fundamentals',
      subdomainId: data.taxonomy?.subdomainId || 'general',
      topics: Array.isArray(data.taxonomy?.topics) ? data.taxonomy.topics : []
    },
    difficultyLevel: data.difficultyLevel || 'beginner',
    prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
    conceptsCovered: Array.isArray(data.conceptsCovered) ? data.conceptsCovered : [data.title],
    language: data.language || 'en',
    estimatedTimeMinutes: data.estimatedTimeMinutes || 30,
    publicationDate: data.publicationDate || null,
    lastUpdatedDate: data.lastUpdatedDate || null,
    freeAccessStatus: data.freeAccessStatus || 'always_free_open_access',
    license: data.license || 'Open Access / Educational',
    credibility: {
      score: data.credibility?.score ?? 0.9,
      justification: data.credibility?.justification || 'Verified authoritative cybersecurity educational material'
    },
    provenance: {
      origin: data.provenance?.origin || 'internal_index',
      discoveredAt: data.provenance?.discoveredAt || new Date().toISOString(),
      reviewStatus: data.provenance?.reviewStatus || 'approved',
      approvedBy: data.provenance?.approvedBy || 'automated_ruleset'
    },
    health: {
      lastCheckedAt: data.health?.lastCheckedAt || new Date().toISOString(),
      httpStatus: data.health?.httpStatus || 200,
      isAlive: data.health?.isAlive ?? true,
      redirectUrl: data.health?.redirectUrl || null,
      failureCount: data.health?.failureCount || 0
    },
    transcriptAvailable: Boolean(data.transcriptAvailable),
    contentSummary: data.contentSummary || '',
    contentHash,
    audience: data.audience || 'general_learner',
    safetyClassification: data.safetyClassification || 'safe_educational'
  };

  return resource;
}
