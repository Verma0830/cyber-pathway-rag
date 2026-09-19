/**
 * IDatabase - Abstract Interface for Relational / Metadata Persistence
 * Encapsulates resource catalog, user profiles, roadmaps, and link health logs.
 */
export class IDatabase {
  constructor(name = 'base-database') {
    this.name = name;
  }

  async initialize() {
    throw new Error(`initialize() not implemented on ${this.name}`);
  }

  // Resources
  async insertResource(resource) {
    throw new Error(`insertResource() not implemented on ${this.name}`);
  }
  async getResourceById(id) {
    throw new Error(`getResourceById() not implemented on ${this.name}`);
  }
  async getResourceByUrl(url) {
    throw new Error(`getResourceByUrl() not implemented on ${this.name}`);
  }
  async getAllResources(filter) {
    throw new Error(`getAllResources() not implemented on ${this.name}`);
  }
  async updateResourceHealth(id, healthData) {
    throw new Error(`updateResourceHealth() not implemented on ${this.name}`);
  }
  async updateResourceReviewStatus(id, reviewStatus, approvedBy) {
    throw new Error(`updateResourceReviewStatus() not implemented on ${this.name}`);
  }

  // Users & Profiles
  async createOrUpdateUser(user) {
    throw new Error(`createOrUpdateUser() not implemented on ${this.name}`);
  }
  async getUserById(id) {
    throw new Error(`getUserById() not implemented on ${this.name}`);
  }

  // Roadmaps & Progress
  async saveRoadmap(roadmap) {
    throw new Error(`saveRoadmap() not implemented on ${this.name}`);
  }
  async getRoadmapById(id) {
    throw new Error(`getRoadmapById() not implemented on ${this.name}`);
  }
  async getUserRoadmaps(userId) {
    throw new Error(`getUserRoadmaps() not implemented on ${this.name}`);
  }
  async updateStepProgress(roadmapId, stepId, status) {
    throw new Error(`updateStepProgress() not implemented on ${this.name}`);
  }

  // Audit & Feedback
  async recordLinkFeedback(feedback) {
    throw new Error(`recordLinkFeedback() not implemented on ${this.name}`);
  }
  async getLinkFeedback() {
    throw new Error(`getLinkFeedback() not implemented on ${this.name}`);
  }
}
