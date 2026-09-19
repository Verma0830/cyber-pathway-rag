/**
 * CyberPathway RAG - Frontend Application Logic
 * Pure modern JavaScript (ES Modules) connecting to Fastify REST & RAG endpoints.
 */

// State
const state = {
  activeTab: 'tab-roadmap',
  taxonomy: [],
  currentRoadmap: null,
  resources: [],
  userProfile: JSON.parse(localStorage.getItem('cyber_user_profile') || '{}'),
  roadmapProgress: JSON.parse(localStorage.getItem('cyber_roadmap_progress') || '{}')
};

// DOM Elements
const elements = {
  navTabs: document.querySelectorAll('.nav-tab'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  quizForm: document.getElementById('quiz-form'),
  recResults: document.getElementById('recommendation-results'),
  recList: document.getElementById('recommended-tracks-list'),
  roadmapPlaceholder: document.getElementById('roadmap-placeholder'),
  roadmapContent: document.getElementById('roadmap-content'),
  stagesContainer: document.getElementById('stages-container'),
  rmTitle: document.getElementById('rm-title'),
  rmRationale: document.getElementById('rm-rationale'),
  rmTime: document.getElementById('rm-time'),
  rmRoles: document.getElementById('rm-roles'),
  rmImmediateActionText: document.getElementById('rm-immediate-action-text'),
  
  // Chat
  chatForm: document.getElementById('chat-form'),
  chatInput: document.getElementById('chat-input'),
  chatMessages: document.getElementById('chat-messages'),
  sufficiencyBadge: document.getElementById('rag-sufficiency-indicator'),
  chipButtons: document.querySelectorAll('.btn-chip'),

  // Catalog
  catalogSearch: document.getElementById('catalog-search'),
  domainFilter: document.getElementById('catalog-domain-filter'),
  levelFilter: document.getElementById('catalog-level-filter'),
  typeFilter: document.getElementById('catalog-type-filter'),
  resourcesGrid: document.getElementById('resources-grid'),
  visibleCount: document.getElementById('catalog-visible-count'),

  // Admin
  adminTotal: document.getElementById('admin-total-res'),
  adminPending: document.getElementById('admin-pending-res'),
  adminDead: document.getElementById('admin-dead-links'),
  adminPendingTable: document.getElementById('admin-pending-table'),
  adminFeedbackTable: document.getElementById('admin-feedback-table'),

  // Modal
  feedbackModal: document.getElementById('feedback-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  feedbackForm: document.getElementById('feedback-form'),
  modalResId: document.getElementById('modal-res-id'),
  modalResTitle: document.getElementById('modal-res-title')
};

// --- Initialization ---
async function init() {
  setupTabs();
  setupEventListeners();
  await loadTaxonomy();
  await loadResources();
  await loadAdminOverview();
}

// Tabs setup
function setupTabs() {
  elements.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      elements.navTabs.forEach(t => t.classList.remove('active'));
      elements.tabPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(target).classList.add('active');
      state.activeTab = target;

      if (target === 'tab-admin') {
        loadAdminOverview();
      }
    });
  });
}

// Load taxonomy & populate dropdowns
async function loadTaxonomy() {
  try {
    const res = await fetch('/api/taxonomy');
    const data = await res.json();
    state.taxonomy = data.domains || [];

    // Populate catalog domain filter
    elements.domainFilter.innerHTML = '<option value="">All 26 Domains</option>';
    state.taxonomy.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.name;
      elements.domainFilter.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load taxonomy:', err);
  }
}

// Event Listeners
function setupEventListeners() {
  // Quiz submit
  elements.quizForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bg = document.getElementById('quiz-bg').value;
    const interest = document.getElementById('quiz-interest').value;
    const hours = document.getElementById('quiz-hours').value;
    const timeline = document.getElementById('quiz-timeline').value;
    const prereqs = document.getElementById('quiz-prereqs').value;

    state.userProfile = {
      current_background: bg,
      primary_interest: interest,
      weekly_hours: hours,
      weeklyHours: hours === 'casual' ? 4 : (hours === 'intensive' ? 25 : 10),
      target_timeline: timeline,
      completed_prerequisites: prereqs
    };
    localStorage.setItem('cyber_user_profile', JSON.stringify(state.userProfile));

    await getRecommendations(state.userProfile);
  });

  // Chat submit
  elements.chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = elements.chatInput.value.trim();
    if (!query) return;

    appendUserMessage(query);
    elements.chatInput.value = '';
    await sendChatQuery(query);
  });

  // Quick chips in chat
  elements.chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      elements.chatInput.value = q;
      elements.chatForm.dispatchEvent(new Event('submit'));
    });
  });

  // Catalog filters
  elements.catalogSearch.addEventListener('input', filterAndRenderCatalog);
  elements.domainFilter.addEventListener('change', filterAndRenderCatalog);
  elements.levelFilter.addEventListener('change', filterAndRenderCatalog);
  elements.typeFilter.addEventListener('change', filterAndRenderCatalog);

  // Modal
  elements.btnCloseModal.addEventListener('click', () => {
    elements.feedbackModal.classList.add('hidden');
  });

  elements.feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const resourceId = elements.modalResId.value;
    const issueType = document.getElementById('feedback-issue').value;
    const details = document.getElementById('feedback-details').value;

    try {
      await fetch('/api/feedback/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, issueType, details })
      });
      alert('Thank you! Issue report submitted for administrator review.');
      elements.feedbackModal.classList.add('hidden');
      elements.feedbackForm.reset();
    } catch (err) {
      alert('Error submitting report: ' + err.message);
    }
  });
}

// --- Roadmap & Career Profiler ---

async function getRecommendations(profile) {
  try {
    const res = await fetch('/api/profile/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    renderRecommendations(data.recommendations || []);
  } catch (err) {
    console.error('Error getting recommendations:', err);
  }
}

function renderRecommendations(recs) {
  elements.recResults.classList.remove('hidden');
  elements.recList.innerHTML = '';

  recs.forEach(rec => {
    const item = document.createElement('div');
    item.className = 'track-item';
    item.innerHTML = `
      <div class="track-name">
        <span>${rec.domainName}</span>
        <span class="track-match">Match Score: ${rec.matchScore}</span>
      </div>
      <div class="track-rationale">${rec.rationale}</div>
    `;
    item.addEventListener('click', () => generateAndDisplayRoadmap(rec.domainId, rec.rationale));
    elements.recList.appendChild(item);
  });

  // Auto-generate for top track
  if (recs.length > 0) {
    generateAndDisplayRoadmap(recs[0].domainId, recs[0].rationale);
  }
}

async function generateAndDisplayRoadmap(domainId, rationale) {
  try {
    const res = await fetch('/api/roadmap/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domainId,
        userProfile: { ...state.userProfile, rationale }
      })
    });
    const roadmap = await res.json();
    state.currentRoadmap = roadmap;
    renderRoadmap(roadmap);
  } catch (err) {
    console.error('Error generating roadmap:', err);
  }
}

function renderRoadmap(rm) {
  elements.roadmapPlaceholder.classList.add('hidden');
  elements.roadmapContent.classList.remove('hidden');

  elements.rmTitle.textContent = rm.title;
  elements.rmRationale.textContent = rm.matchingRationale;
  elements.rmTime.textContent = `⏱️ ~${rm.estimatedTotalWeeks} Weeks (Est. Range)`;
  elements.rmRoles.textContent = `💼 ${rm.targetRoles.slice(0, 2).join(', ')}`;
  elements.stagesContainer.innerHTML = '';

  if (rm.immediateNextAction && elements.rmImmediateActionText) {
    elements.rmImmediateActionText.textContent = rm.immediateNextAction;
  }

  // Render the 5 Stages
  rm.stages.forEach(stage => {
    const stageCard = document.createElement('div');
    stageCard.className = 'stage-card';

    const stageKey = stage.stageName?.toLowerCase() || 'foundations';
    const levelClass = `badge-${stageKey}`;

    let resourcesHtml = '';
    (stage.recommendedResources || []).forEach(r => {
      const provBadge = r.provenanceBadge === 'Live search' ? '`[Live search]`' : '`[Indexed]`';
      resourcesHtml += `
        <div class="resource-detail-box">
          <div class="res-title-row">
            <a href="${r.canonicalUrl}" target="_blank" rel="noopener noreferrer" class="resource-link">
              📄 <strong>${r.title}</strong>
            </a>
            <span class="provenance-tag ${r.provenanceBadge === 'Live search' ? 'prov-live' : 'prov-indexed'}">${provBadge}</span>
          </div>
          <div class="res-detail-subtext">
            <span><strong>Format:</strong> ${r.resourceType}</span> |
            <span><strong>Difficulty:</strong> ${r.difficultyLevel}</span> |
            <span><strong>Provider:</strong> ${r.providerName}</span> |
            <span><strong>Validated:</strong> ${r.lastValidationDate || 'Recent'}</span>
          </div>
          <div class="res-why">💡 <em>Why it is recommended:</em> ${r.whyRecommended}</div>
        </div>
      `;
    });

    let labsHtml = '';
    (stage.practicalExercises || []).forEach(lab => {
      labsHtml += `<li>⚡ ${lab}</li>`;
    });

    let topicsHtml = '';
    (stage.topics || []).forEach(t => {
      topicsHtml += `<li>• ${t.replace(/_/g, ' ')}</li>`;
    });

    let prereqsHtml = (stage.prerequisites && stage.prerequisites.length > 0)
      ? stage.prerequisites.join('; ')
      : 'None (Foundational stage)';

    stageCard.innerHTML = `
      <div class="stage-header">
        <div class="stage-title">
          <span>Stage ${stage.stageNumber}: ${stage.stageName} — ${stage.title}</span>
          <span class="stage-level-badge ${levelClass}">${stage.stageName}</span>
        </div>
        <span class="stat-pill">${stage.estimatedTimeRange}</span>
      </div>
      <div class="stage-body">
        <div class="stage-section-title">🔑 Stage Prerequisites</div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${prereqsHtml}</p>

        <div class="stage-section-title">🎯 Key Learning Objectives</div>
        <ul class="checklist">
          ${(stage.learningObjectives || []).map(obj => `<li>✓ ${obj}</li>`).join('')}
        </ul>

        <div class="stage-section-title">📖 Core Topics (Prerequisite Order)</div>
        <ul class="checklist">
          ${topicsHtml}
        </ul>

        <div class="stage-section-title">📚 Verified Free Learning Resources</div>
        <div class="resource-chip-list">
          ${resourcesHtml}
        </div>

        <div class="stage-section-title">🧪 Practical Legal Exercises & Labs</div>
        <ul class="checklist">
          ${labsHtml}
        </ul>

        <div class="project-card">
          <h4>🏆 Milestone Portfolio Project: ${stage.portfolioProject?.title || 'Hands-on Project'}</h4>
          <p>${stage.portfolioProject?.description || 'Build and document a hands-on project.'}</p>
        </div>

        <div class="stage-section-title" style="margin-top: 1rem;">🏁 Progress Checkpoint & Advancement Criteria</div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.35rem;"><strong>Checkpoint:</strong> ${stage.progressCheckpoint}</p>
        <p style="font-size: 0.82rem; color: var(--accent-cyan);"><strong>Advancement Criteria:</strong> ${stage.criteriaForAdvancing}</p>
      </div>
    `;

    elements.stagesContainer.appendChild(stageCard);
  });
}

// --- RAG Chat ---

function appendUserMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'message message-user';
  msg.innerHTML = `
    <div class="msg-avatar">👤</div>
    <div class="msg-body"><p>${escapeHtml(text)}</p></div>
  `;
  elements.chatMessages.appendChild(msg);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function appendAssistantLoading() {
  const loading = document.createElement('div');
  loading.className = 'message message-assistant loading-msg';
  loading.id = 'loading-bubble';
  loading.innerHTML = `
    <div class="msg-avatar">🛡️</div>
    <div class="msg-body"><p>🔍 Consulting internal knowledge base and evaluating evidence...</p></div>
  `;
  elements.chatMessages.appendChild(loading);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

async function sendChatQuery(query) {
  appendAssistantLoading();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, userProfile: state.userProfile })
    });
    const data = await res.json();

    document.getElementById('loading-bubble')?.remove();

    // Update sufficiency indicator badge
    if (data.sourceOrigin === 'live_search') {
      elements.sufficiencyBadge.textContent = '🌐 Live Search Fallback';
      elements.sufficiencyBadge.style.color = 'var(--accent-amber)';
    } else {
      elements.sufficiencyBadge.textContent = '📚 Internal Index';
      elements.sufficiencyBadge.style.color = 'var(--accent-emerald)';
    }

    const msg = document.createElement('div');
    msg.className = 'message message-assistant';
    msg.innerHTML = `
      <div class="msg-avatar">🛡️</div>
      <div class="msg-body">
        <div>${formatMarkdown(data.answer)}</div>
      </div>
    `;
    elements.chatMessages.appendChild(msg);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  } catch (err) {
    document.getElementById('loading-bubble')?.remove();
    const errBubble = document.createElement('div');
    errBubble.className = 'message message-assistant';
    errBubble.innerHTML = `
      <div class="msg-avatar">⚠️</div>
      <div class="msg-body"><p>Error retrieving response: ${err.message}</p></div>
    `;
    elements.chatMessages.appendChild(errBubble);
  }
}

// --- Resource Catalog ---

async function loadResources() {
  try {
    const res = await fetch('/api/resources');
    const data = await res.json();
    state.resources = data.resources || [];
    filterAndRenderCatalog();
  } catch (err) {
    console.error('Failed to load resources:', err);
  }
}

function filterAndRenderCatalog() {
  const searchTerm = elements.catalogSearch.value.toLowerCase().trim();
  const domain = elements.domainFilter.value;
  const level = elements.levelFilter.value;
  const type = elements.typeFilter.value;

  const filtered = state.resources.filter(r => {
    if (domain && r.taxonomy?.domainId !== domain) return false;
    if (level && r.difficultyLevel !== level) return false;
    if (type && r.resourceType !== type) return false;
    if (searchTerm) {
      const corpus = `${r.title} ${r.contentSummary || ''} ${(r.conceptsCovered || []).join(' ')}`.toLowerCase();
      if (!corpus.includes(searchTerm)) return false;
    }
    return true;
  });

  elements.visibleCount.textContent = filtered.length;
  elements.resourcesGrid.innerHTML = '';

  filtered.forEach(r => {
    const card = document.createElement('div');
    card.className = 'resource-card';

    const provClass = r.provenance?.origin === 'live_search' ? 'prov-live' : 'prov-indexed';
    const provLabel = r.provenance?.origin === 'live_search' ? 'Live search' : 'Indexed';

    card.innerHTML = `
      <div>
        <div class="res-header">
          <a href="${r.canonicalUrl}" target="_blank" rel="noopener noreferrer" class="res-title">${r.title}</a>
        </div>
        <p class="res-summary">${r.contentSummary || 'No summary available.'}</p>
        <div class="res-meta">
          <span class="tag-badge">🏢 ${r.provider?.name || 'Verified'}</span>
          <span class="tag-badge">📊 ${r.difficultyLevel}</span>
          <span class="tag-badge">⏱️ ${r.estimatedTimeMinutes} min</span>
        </div>
      </div>
      <div class="res-footer">
        <span class="provenance-tag ${provClass}">${provLabel}</span>
        <button class="btn-report" onclick="window.openReportModal('${r.id}', '${escapeHtml(r.title)}')">🚩 Report Link</button>
      </div>
    `;
    elements.resourcesGrid.appendChild(card);
  });
}

// Global modal trigger
window.openReportModal = function(id, title) {
  elements.modalResId.value = id;
  elements.modalResTitle.textContent = title;
  elements.feedbackModal.classList.remove('hidden');
};

// --- Admin Overview ---

async function loadAdminOverview() {
  try {
    const res = await fetch('/api/admin/overview');
    const data = await res.json();

    elements.adminTotal.textContent = data.totalResources;
    elements.adminPending.textContent = data.pendingReviewCount;
    elements.adminDead.textContent = data.deadLinkCount;

    // Render pending table
    if (data.pendingResources.length === 0) {
      elements.adminPendingTable.innerHTML = '<p class="subtext">Zero pending resources in quarantine queue. All clean!</p>';
    } else {
      let tableHtml = `
        <table>
          <thead>
            <tr><th>Title</th><th>Canonical URL</th><th>Discovered</th><th>Action</th></tr>
          </thead>
          <tbody>
      `;
      data.pendingResources.forEach(r => {
        tableHtml += `
          <tr>
            <td><strong>${escapeHtml(r.title)}</strong></td>
            <td><a href="${r.canonicalUrl}" target="_blank">${r.canonicalUrl.slice(0, 45)}...</a></td>
            <td>${r.provenance?.discoveredAt?.slice(0, 10) || 'Recent'}</td>
            <td><button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="window.approveResource('${r.id}')">✓ Approve</button></td>
          </tr>
        `;
      });
      tableHtml += '</tbody></table>';
      elements.adminPendingTable.innerHTML = tableHtml;
    }

    // Render feedback
    if (data.userFeedback.length === 0) {
      elements.adminFeedbackTable.innerHTML = '<p class="subtext">No open broken link reports from learners.</p>';
    } else {
      let fbHtml = `
        <table>
          <thead><tr><th>Resource ID</th><th>Issue</th><th>Details</th><th>Date</th></tr></thead>
          <tbody>
      `;
      data.userFeedback.forEach(f => {
        fbHtml += `
          <tr>
            <td>${f.resource_id}</td>
            <td><span class="badge badge-verified">${f.issue_type}</span></td>
            <td>${escapeHtml(f.details || 'No details')}</td>
            <td>${f.created_at.slice(0, 10)}</td>
          </tr>
        `;
      });
      fbHtml += '</tbody></table>';
      elements.adminFeedbackTable.innerHTML = fbHtml;
    }
  } catch (err) {
    console.error('Error loading admin overview:', err);
  }
}

window.approveResource = async function(id) {
  try {
    await fetch(`/api/admin/approve/${id}`, { method: 'POST' });
    alert('Resource approved and permanently indexed into trusted knowledge base!');
    loadAdminOverview();
  } catch (err) {
    alert('Failed to approve: ' + err.message);
  }
};

// Utilities
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatMarkdown(text) {
  if (!text) return '';
  let formatted = escapeHtml(text);

  // Headers
  formatted = formatted.replace(/^### (.*$)/gim, '<h3 style="margin: 0.75rem 0 0.35rem 0; font-size: 1rem; color: var(--accent-cyan);">$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h2 style="margin: 1rem 0 0.5rem 0; font-size: 1.1rem;">$1</h2>');

  // Bold & Italic
  formatted = formatted.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Links
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: underline;">$1</a>');

  // Inline code & blockquotes
  formatted = formatted.replace(/`([^`]+)`/gim, '<code style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 4px; font-family: monospace;">$1</code>');
  formatted = formatted.replace(/^> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--accent-cyan); padding-left: 0.75rem; margin: 0.5rem 0; color: var(--text-secondary);">$1</blockquote>');

  // Lists
  formatted = formatted.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
  formatted = formatted.replace(/(<li>[\s\S]*?<\/li>)/gim, '<ul style="margin: 0.5rem 0; padding-left: 1.25rem;">$1</ul>');

  // Newlines
  formatted = formatted.replace(/\n\n/g, '<br><br>');

  return formatted;
}

// Kickoff
document.addEventListener('DOMContentLoaded', init);
