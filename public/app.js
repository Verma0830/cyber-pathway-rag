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
  studyProgress: JSON.parse(localStorage.getItem('cyber_study_progress') || '{}'),
  chatHistory: [],
  catalogFilters: {
    search: '',
    domain: '',
    level: '',
    type: ''
  }
};

// DOM Elements
const elements = {
  // Navigation & Drawer
  btnHamburger: document.getElementById('btn-hamburger'),
  btnOpenMenuIndicator: document.getElementById('btn-open-menu-indicator'),
  activeTabLabel: document.getElementById('active-tab-label'),
  btnCloseDrawer: document.getElementById('btn-close-drawer'),
  navDrawer: document.getElementById('nav-drawer'),
  drawerOverlay: document.getElementById('drawer-overlay'),
  drawerItems: document.querySelectorAll('.drawer-item'),
  mobileNavItems: document.querySelectorAll('.mobile-nav-item'),
  tabPanes: document.querySelectorAll('.tab-pane'),

  // Roadmap & Quiz
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
  rmProgressPercent: document.getElementById('rm-progress-percent'),
  rmProgressFill: document.getElementById('rm-progress-fill'),
  btnToggleAccordion: document.getElementById('btn-toggle-accordion'),
  btnExportMarkdown: document.getElementById('btn-export-markdown'),
  btnPrintRoadmap: document.getElementById('btn-print-roadmap'),

  // Chat
  chatForm: document.getElementById('chat-form'),
  chatInput: document.getElementById('chat-input'),
  chatMessages: document.getElementById('chat-messages'),
  sufficiencyBadge: document.getElementById('rag-sufficiency-indicator'),
  chipButtons: document.querySelectorAll('.btn-chip'),
  btnClearChat: document.getElementById('btn-clear-chat'),
  btnScrollBottom: document.getElementById('btn-scroll-bottom'),
  btnAiSettings: document.getElementById('btn-ai-settings'),
  aiModeIndicator: document.getElementById('ai-mode-indicator'),
  currentAiModeText: document.getElementById('current-ai-mode-text'),
  aiSettingsModal: document.getElementById('ai-settings-modal'),
  btnCloseAiModal: document.getElementById('btn-close-ai-modal'),
  inputGeminiKey: document.getElementById('input-gemini-key'),
  btnSaveAiKey: document.getElementById('btn-save-ai-key'),
  btnClearAiKey: document.getElementById('btn-clear-ai-key'),

  // Catalog
  catalogSearch: document.getElementById('catalog-search'),
  domainFilter: document.getElementById('catalog-domain-filter'),
  levelFilter: document.getElementById('catalog-level-filter'),
  typeFilter: document.getElementById('catalog-type-filter'),
  filterChips: document.querySelectorAll('.filter-chip'),
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
  setupNavigation();
  setupEventListeners();
  updateAiModeDisplay();
  await loadTaxonomy();
  await loadResources();
  await loadAdminOverview();
}

// --- Navigation & Drawer Setup ---
function setupNavigation() {
  const TAB_LABELS = {
    'tab-roadmap': '🧭 Career Roadmap',
    'tab-chat': '💬 RAG Advisor Chat',
    'tab-catalog': '📚 Resource Explorer',
    'tab-admin': '⚙️ Admin Portal'
  };

  function switchTab(targetTab) {
    state.activeTab = targetTab;

    if (elements.activeTabLabel && TAB_LABELS[targetTab]) {
      elements.activeTabLabel.textContent = TAB_LABELS[targetTab];
    }

    elements.drawerItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === targetTab);
    });

    elements.mobileNavItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === targetTab);
    });

    elements.tabPanes.forEach(p => {
      p.classList.toggle('active', p.id === targetTab);
    });

    closeDrawer();

    if (targetTab === 'tab-admin') {
      loadAdminOverview();
    }
  }

  elements.drawerItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  elements.mobileNavItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  elements.btnOpenMenuIndicator?.addEventListener('click', toggleDrawer);

  function openDrawer() {
    elements.navDrawer?.classList.add('open');
    elements.drawerOverlay?.classList.add('open');
    elements.btnHamburger?.classList.add('active');
  }

  function closeDrawer() {
    elements.navDrawer?.classList.remove('open');
    elements.drawerOverlay?.classList.remove('open');
    elements.btnHamburger?.classList.remove('active');
  }

  function toggleDrawer() {
    if (elements.navDrawer?.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  elements.btnHamburger?.addEventListener('click', toggleDrawer);
  elements.btnCloseDrawer?.addEventListener('click', closeDrawer);
  elements.drawerOverlay?.addEventListener('click', closeDrawer);
}

// --- Event Listeners ---
function setupEventListeners() {
  // Quiz
  elements.quizForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleDiagnosticSubmit();
  });

  // Chat
  elements.chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = elements.chatInput.value.trim();
    if (!query) return;
    elements.chatInput.value = '';
    appendUserMessage(query);
    await sendChatQuery(query);
  });

  setupChipListeners();

  elements.btnClearChat?.addEventListener('click', () => {
    if (confirm('Clear conversation history?')) {
      state.chatHistory = [];
      elements.chatMessages.innerHTML = `
        <div class="message message-assistant">
          <div class="msg-avatar">🛡️</div>
          <div class="msg-body">
            <p>Welcome! I am your <strong>Cybersecurity Career & Learning Assistant</strong>.</p>
            <p>I explain concepts using grounded evidence, guide your career progression, and recommend verified, 100% free legal educational resources with direct URLs. I never invent links or promise guaranteed outcomes.</p>
            <p>Select a quick prompt or type your question below:</p>
            <ul class="quick-questions">
              <li><button class="btn-chip" data-q="What is the OWASP Top 10 and how do I start learning web security?">OWASP Top 10 Basics</button></li>
              <li><button class="btn-chip" data-q="How do I transition from IT helpdesk to a Tier 1 SOC Analyst?">Helpdesk to SOC Analyst</button></li>
              <li><button class="btn-chip" data-q="What are the best free labs to practice Linux permissions and SSH?">Free Linux Wargames</button></li>
              <li><button class="btn-chip" data-q="Explain Zero Trust Architecture according to NIST SP 800-207">NIST Zero Trust (SP 800-207)</button></li>
            </ul>
          </div>
        </div>
      `;
      setupChipListeners();
    }
  });

  // Chat Scroll-to-Bottom Floating Button
  elements.chatMessages?.addEventListener('scroll', () => {
    const fromBottom = elements.chatMessages.scrollHeight - elements.chatMessages.scrollTop - elements.chatMessages.clientHeight;
    if (fromBottom > 150) {
      elements.btnScrollBottom?.classList.remove('hidden');
    } else {
      elements.btnScrollBottom?.classList.add('hidden');
    }
  });

  elements.btnScrollBottom?.addEventListener('click', () => {
    elements.chatMessages.scrollTo({ top: elements.chatMessages.scrollHeight, behavior: 'smooth' });
  });

  // Roadmap Action Buttons
  elements.btnToggleAccordion?.addEventListener('click', () => {
    const stageCards = document.querySelectorAll('.stage-card');
    const anyOpen = Array.from(stageCards).some(c => !c.classList.contains('collapsed'));
    stageCards.forEach(c => {
      c.classList.toggle('collapsed', anyOpen);
    });
  });

  elements.btnExportMarkdown?.addEventListener('click', exportRoadmapAsMarkdown);
  elements.btnPrintRoadmap?.addEventListener('click', () => window.print());

  // Catalog Debounced Search
  let searchTimeout;
  elements.catalogSearch?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.catalogFilters.search = e.target.value.toLowerCase().trim();
      filterAndRenderCatalog();
    }, 150);
  });

  elements.domainFilter?.addEventListener('change', (e) => {
    state.catalogFilters.domain = e.target.value;
    filterAndRenderCatalog();
  });

  elements.levelFilter?.addEventListener('change', (e) => {
    state.catalogFilters.level = e.target.value;
    filterAndRenderCatalog();
  });

  elements.typeFilter?.addEventListener('change', (e) => {
    state.catalogFilters.type = e.target.value;
    filterAndRenderCatalog();
  });

  // Catalog Quick Filter Chips
  elements.filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const typeFilter = chip.dataset.typeFilter;
      const levelFilter = chip.dataset.levelFilter;

      if (typeFilter !== undefined) {
        state.catalogFilters.type = typeFilter;
        if (elements.typeFilter) elements.typeFilter.value = typeFilter;
      }
      if (levelFilter !== undefined) {
        state.catalogFilters.level = levelFilter;
        if (elements.levelFilter) elements.levelFilter.value = levelFilter;
      }

      filterAndRenderCatalog();
    });
  });

  // Modal
  elements.btnCloseModal?.addEventListener('click', () => {
    elements.feedbackModal.classList.add('hidden');
  });

  elements.feedbackModal?.addEventListener('click', (e) => {
    if (e.target === elements.feedbackModal) {
      elements.feedbackModal.classList.add('hidden');
    }
  });

  elements.feedbackForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const resourceId = elements.modalResId.value;
    const issueType = document.getElementById('feedback-issue').value;
    const details = document.getElementById('feedback-details').value;

    try {
      const res = await fetch('/api/feedback/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, issueType, details })
      });
      const data = await res.json();
      alert('Thank you! Feedback recorded: ' + (data.message || 'Report registered.'));
      elements.feedbackModal.classList.add('hidden');
      elements.feedbackForm.reset();
    } catch (err) {
      alert('Error submitting report: ' + err.message);
    }
  });

  // AI Mode Settings Modal
  elements.btnAiSettings?.addEventListener('click', () => {
    updateAiModeDisplay();
    elements.aiSettingsModal?.classList.remove('hidden');
  });

  elements.btnCloseAiModal?.addEventListener('click', () => {
    elements.aiSettingsModal?.classList.add('hidden');
  });

  elements.aiSettingsModal?.addEventListener('click', (e) => {
    if (e.target === elements.aiSettingsModal) {
      elements.aiSettingsModal.classList.add('hidden');
    }
  });

  elements.btnSaveAiKey?.addEventListener('click', () => {
    const val = (elements.inputGeminiKey?.value || '').trim();
    if (val) {
      localStorage.setItem('cyber_gemini_api_key', val);
      alert('Gemini API key saved! Chat will now use Gemini Flash with live mentor grounding.');
    } else {
      localStorage.removeItem('cyber_gemini_api_key');
      alert('Key cleared. Chat returned to high-caliber Local Mentor mode ($0).');
    }
    updateAiModeDisplay();
    elements.aiSettingsModal?.classList.add('hidden');
  });

  elements.btnClearAiKey?.addEventListener('click', () => {
    localStorage.removeItem('cyber_gemini_api_key');
    updateAiModeDisplay();
    alert('Switched to high-caliber Local Mentor mode ($0.00 zero cost).');
    elements.aiSettingsModal?.classList.add('hidden');
  });
}

function updateAiModeDisplay() {
  const key = localStorage.getItem('cyber_gemini_api_key');
  if (key) {
    if (elements.aiModeIndicator) {
      elements.aiModeIndicator.textContent = '✨ Gemini AI (Active)';
      elements.aiModeIndicator.className = 'ai-mode-pill gemini';
    }
    if (elements.currentAiModeText) {
      elements.currentAiModeText.textContent = '✨ Google Gemini Generative AI (Connected)';
      elements.currentAiModeText.style.color = 'var(--accent-emerald)';
    }
    if (elements.inputGeminiKey) {
      elements.inputGeminiKey.value = key;
    }
  } else {
    if (elements.aiModeIndicator) {
      elements.aiModeIndicator.textContent = '⚡ Local Mentor ($0)';
      elements.aiModeIndicator.className = 'ai-mode-pill';
    }
    if (elements.currentAiModeText) {
      elements.currentAiModeText.textContent = '⚡ Local Expert Mentor (Zero Cost)';
      elements.currentAiModeText.style.color = 'var(--accent-cyan)';
    }
    if (elements.inputGeminiKey) {
      elements.inputGeminiKey.value = '';
    }
  }
}

function setupChipListeners() {
  document.querySelectorAll('.btn-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      if (q) {
        elements.chatInput.value = q;
        elements.chatForm.dispatchEvent(new Event('submit'));
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

    elements.domainFilter.innerHTML = '<option value="">All 26 Domains</option>';
    state.taxonomy.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = `${d.name} (${d.category})`;
      elements.domainFilter.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load taxonomy:', err);
  }
}

// --- Diagnostic Profiling & Roadmap ---

async function handleDiagnosticSubmit() {
  const bg = document.getElementById('quiz-bg').value;
  const interest = document.getElementById('quiz-interest').value;
  const hours = document.getElementById('quiz-hours').value;
  const timeline = document.getElementById('quiz-timeline').value;
  const prereqs = document.getElementById('quiz-prereqs').value;

  state.userProfile = {
    technicalBackground: bg,
    interestTrack: interest,
    weeklyStudyHours: hours === 'casual' ? 4 : hours === 'intensive' ? 25 : 12,
    targetTimeline: timeline,
    completedPrerequisites: prereqs === 'multiple' ? ['linux_cli', 'networking_basics', 'python_scripting'] : prereqs === 'linux_basic' ? ['linux_cli'] : prereqs === 'networking_basic' ? ['networking_basics'] : []
  };

  localStorage.setItem('cyber_user_profile', JSON.stringify(state.userProfile));

  try {
    const res = await fetch('/api/profile/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: state.userProfile })
    });
    const data = await res.json();
    renderRecommendations(data.recommendations || []);
  } catch (err) {
    console.error('Diagnostic error:', err);
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

  // Render 5 Stages
  rm.stages.forEach((stage, sIdx) => {
    const stageCard = document.createElement('div');
    stageCard.className = 'stage-card';
    if (sIdx > 0) {
      stageCard.classList.add('collapsed');
    }

    const stageKey = stage.stageName?.toLowerCase() || 'foundations';
    const levelClass = `badge-${stageKey}`;

    let resourcesHtml = '';
    (stage.recommendedResources || []).forEach((r, rIdx) => {
      const provBadge = r.provenanceBadge === 'Live search' ? 'Live search' : 'Indexed';
      const provClass = r.provenanceBadge === 'Live search' ? 'prov-live' : 'prov-indexed';
      const resKey = `res_${stage.stageNumber}_${rIdx}`;
      const isChecked = !!state.studyProgress[resKey];

      resourcesHtml += `
        <div class="resource-detail-box">
          <div class="res-title-row">
            <label class="study-item ${isChecked ? 'completed' : ''}" style="margin: 0;">
              <input type="checkbox" data-study-key="${resKey}" ${isChecked ? 'checked' : ''}>
              <a href="${r.canonicalUrl}" target="_blank" rel="noopener noreferrer" class="resource-link" onclick="event.stopPropagation();">
                ${r.title}
              </a>
            </label>
            <span class="provenance-tag ${provClass}">[${provBadge}]</span>
          </div>
          <div class="res-detail-subtext">
            <span><strong>Format:</strong> ${r.resourceType}</span> •
            <span><strong>Difficulty:</strong> ${r.difficultyLevel}</span> •
            <span><strong>Provider:</strong> ${r.providerName}</span> •
            <span><strong>Validated:</strong> ${r.lastValidationDate || 'Recent'}</span>
          </div>
          <div class="res-why">💡 ${r.whyRecommended}</div>
        </div>
      `;
    });

    let labsHtml = '';
    (stage.practicalExercises || []).forEach((lab, lIdx) => {
      const labKey = `lab_${stage.stageNumber}_${lIdx}`;
      const isChecked = !!state.studyProgress[labKey];
      labsHtml += `
        <li>
          <label class="study-item ${isChecked ? 'completed' : ''}">
            <input type="checkbox" data-study-key="${labKey}" ${isChecked ? 'checked' : ''}>
            <span>${lab}</span>
          </label>
        </li>
      `;
    });

    let topicsHtml = '';
    (stage.topics || []).forEach((t, tIdx) => {
      const topicKey = `topic_${stage.stageNumber}_${tIdx}`;
      const isChecked = !!state.studyProgress[topicKey];
      topicsHtml += `
        <li>
          <label class="study-item ${isChecked ? 'completed' : ''}">
            <input type="checkbox" data-study-key="${topicKey}" ${isChecked ? 'checked' : ''}>
            <span>${t.replace(/_/g, ' ')}</span>
          </label>
        </li>
      `;
    });

    let objectivesHtml = '';
    (stage.learningObjectives || []).forEach((obj, oIdx) => {
      const objKey = `obj_${stage.stageNumber}_${oIdx}`;
      const isChecked = !!state.studyProgress[objKey];
      objectivesHtml += `
        <li>
          <label class="study-item ${isChecked ? 'completed' : ''}">
            <input type="checkbox" data-study-key="${objKey}" ${isChecked ? 'checked' : ''}>
            <span>${obj}</span>
          </label>
        </li>
      `;
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
        <div class="stage-header-right">
          <span class="stat-pill">${stage.estimatedTimeRange}</span>
          <span class="accordion-chevron">▼</span>
        </div>
      </div>
      <div class="stage-body">
        <div class="stage-section-title">Stage Prerequisites</div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${prereqsHtml}</p>

        <div class="stage-section-title">Key Learning Objectives</div>
        <ul class="checklist">
          ${objectivesHtml}
        </ul>

        <div class="stage-section-title">Core Topics (Prerequisite Order)</div>
        <ul class="checklist">
          ${topicsHtml}
        </ul>

        <div class="stage-section-title">Verified Free Learning Resources</div>
        <div class="resource-chip-list">
          ${resourcesHtml}
        </div>

        <div class="stage-section-title">Practical Exercises & Hands-on Labs</div>
        <ul class="checklist">
          ${labsHtml}
        </ul>

        <div class="project-card">
          <h4>🏆 Milestone Portfolio Project: ${stage.portfolioProject?.title || 'Hands-on Project'}</h4>
          <p>${stage.portfolioProject?.description || 'Build and document a hands-on project.'}</p>
        </div>

        <div class="stage-section-title" style="margin-top: 1rem;">Progress Checkpoint & Advancement Criteria</div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.35rem;"><strong>Checkpoint:</strong> ${stage.progressCheckpoint}</p>
        <p style="font-size: 0.82rem; color: var(--accent-cyan);"><strong>Advancement Criteria:</strong> ${stage.criteriaForAdvancing}</p>
      </div>
    `;

    // Accordion toggle
    const header = stageCard.querySelector('.stage-header');
    header.addEventListener('click', () => {
      stageCard.classList.toggle('collapsed');
    });

    elements.stagesContainer.appendChild(stageCard);
  });

  setupProgressCheckboxes();
  updateProgressCalculation();
}

function setupProgressCheckboxes() {
  const checkboxes = elements.stagesContainer.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const key = cb.dataset.studyKey;
      state.studyProgress[key] = cb.checked;
      localStorage.setItem('cyber_study_progress', JSON.stringify(state.studyProgress));

      const parentLabel = cb.closest('.study-item');
      if (parentLabel) {
        parentLabel.classList.toggle('completed', cb.checked);
      }

      updateProgressCalculation();
    });
  });
}

function updateProgressCalculation() {
  const allCheckboxes = elements.stagesContainer.querySelectorAll('input[type="checkbox"]');
  if (allCheckboxes.length === 0) return;

  let checkedCount = 0;
  allCheckboxes.forEach(cb => {
    if (cb.checked) checkedCount++;
  });

  const percentage = Math.round((checkedCount / allCheckboxes.length) * 100);
  if (elements.rmProgressPercent) {
    elements.rmProgressPercent.textContent = `${percentage}% Completed (${checkedCount}/${allCheckboxes.length})`;
  }
  if (elements.rmProgressFill) {
    elements.rmProgressFill.style.width = `${percentage}%`;
  }
}

// Export Roadmap as Markdown
function exportRoadmapAsMarkdown() {
  const rm = state.currentRoadmap;
  if (!rm) {
    alert('Generate a roadmap first before exporting.');
    return;
  }

  let md = `# ${rm.title}\n\n`;
  md += `> **Matching Rationale:** ${rm.matchingRationale}\n\n`;
  md += `- **Estimated Duration:** ~${rm.estimatedTotalWeeks} Weeks\n`;
  md += `- **Target Career Roles:** ${rm.targetRoles.join(', ')}\n\n`;
  md += `---\n\n`;

  rm.stages.forEach(stage => {
    md += `## Stage ${stage.stageNumber}: ${stage.stageName} — ${stage.title}\n`;
    md += `*Estimated Time:* ${stage.estimatedTimeRange}\n\n`;
    
    md += `### 🎯 Learning Objectives\n`;
    (stage.learningObjectives || []).forEach(obj => {
      md += `- [ ] ${obj}\n`;
    });
    md += `\n`;

    md += `### 📖 Core Topics\n`;
    (stage.topics || []).forEach(topic => {
      md += `- [ ] ${topic.replace(/_/g, ' ')}\n`;
    });
    md += `\n`;

    md += `### 📚 Verified Resources\n`;
    (stage.recommendedResources || []).forEach(res => {
      md += `- [${res.title}](${res.canonicalUrl}) (${res.resourceType}, ${res.difficultyLevel}, ${res.providerName})\n`;
      md += `  - *Why:* ${res.whyRecommended}\n`;
    });
    md += `\n`;

    md += `### ⚡ Hands-on Labs\n`;
    (stage.practicalExercises || []).forEach(lab => {
      md += `- [ ] ${lab}\n`;
    });
    md += `\n`;

    if (stage.portfolioProject) {
      md += `### 🏆 Portfolio Project: ${stage.portfolioProject.title}\n`;
      md += `${stage.portfolioProject.description}\n\n`;
    }

    md += `---\n\n`;
  });

  if (rm.immediateNextAction) {
    md += `## ⚡ Concrete Immediate Next Action\n\n`;
    md += `${rm.immediateNextAction}\n\n`;
  }

  md += `*Generated by CyberPathway RAG • 100% Free & Legal Knowledge Base*\n`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cyber-pathway-${(rm.domainId || 'roadmap')}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
  state.chatHistory.push({ role: 'user', text: query });
  appendAssistantLoading();

  const apiKey = localStorage.getItem('cyber_gemini_api_key') || '';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        userProfile: state.userProfile,
        chatHistory: state.chatHistory.slice(-8),
        apiKey
      })
    });
    const data = await res.json();

    document.getElementById('loading-bubble')?.remove();

    if (data.answer) {
      state.chatHistory.push({ role: 'assistant', text: data.answer });
    }

    if (elements.sufficiencyBadge) {
      if (data.sourceOrigin === 'live_search') {
        elements.sufficiencyBadge.textContent = '🌐 Live Web Search';
        elements.sufficiencyBadge.style.color = 'var(--accent-amber)';
      } else if (data.sourceOrigin === 'hybrid') {
        elements.sufficiencyBadge.textContent = '⚡ Hybrid (Index + Web)';
        elements.sufficiencyBadge.style.color = 'var(--accent-cyan)';
      } else {
        elements.sufficiencyBadge.textContent = '📚 Internal Knowledge Base';
        elements.sufficiencyBadge.style.color = 'var(--accent-emerald)';
      }
    }

    const msg = document.createElement('div');
    msg.className = 'message message-assistant';
    msg.innerHTML = `
      <div class="msg-avatar">🛡️</div>
      <div class="msg-body">
        <div>${formatMarkdown(data.answer)}</div>
        <div class="msg-actions">
          <button class="btn-copy-msg" onclick="window.copyMessageText(this)">📋 Copy</button>
        </div>
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

window.copyMessageText = function(btn) {
  const msgBody = btn.closest('.msg-body');
  if (!msgBody) return;
  const text = msgBody.innerText.replace(/📋 Copy/, '').trim();
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = originalText; }, 1800);
  });
};

window.copyCodeSnippet = function(btn) {
  const pre = btn.closest('.code-block-wrapper').querySelector('pre code');
  if (!pre) return;
  navigator.clipboard.writeText(pre.innerText).then(() => {
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
  });
};

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
  const { search, domain, level, type } = state.catalogFilters;

  const filtered = state.resources.filter(r => {
    if (domain && r.taxonomy?.domainId !== domain) return false;
    if (level && r.difficultyLevel !== level) return false;
    if (type && r.resourceType !== type) return false;
    if (search) {
      const corpus = `${r.title} ${r.contentSummary || ''} ${(r.conceptsCovered || []).join(' ')}`.toLowerCase();
      if (!corpus.includes(search)) return false;
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
          <span class="tag-badge">${r.provider?.name || 'Verified'}</span>
          <span class="tag-badge">${r.difficultyLevel}</span>
          <span class="tag-badge">${r.estimatedTimeMinutes} min</span>
        </div>
      </div>
      <div class="res-footer">
        <span class="provenance-tag ${provClass}">[${provLabel}]</span>
        <button class="btn-report" onclick="window.openReportModal('${r.id}', '${escapeHtml(r.title)}')">Report Link</button>
      </div>
    `;
    elements.resourcesGrid.appendChild(card);
  });
}

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
            <td><button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="window.approveResource('${r.id}')">Approve</button></td>
          </tr>
        `;
      });
      tableHtml += '</tbody></table>';
      elements.adminPendingTable.innerHTML = tableHtml;
    }

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
            <td><span class="badge">${f.issue_type}</span></td>
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

  // Extract code blocks first to protect them from regex replacements
  const codeBlocks = [];
  let formatted = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/gim, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span>${escapeHtml(lang) || 'code'}</span>
          <button class="btn-copy-code" onclick="window.copyCodeSnippet(this)">Copy</button>
        </div>
        <pre><code>${escapeHtml(code.trim())}</code></pre>
      </div>
    `);
    return placeholder;
  });

  formatted = escapeHtml(formatted);

  // Headers
  formatted = formatted.replace(/^### (.*$)/gim, '<h3 style="margin: 0.85rem 0 0.4rem 0; font-size: 1rem; color: var(--accent-cyan);">$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h2 style="margin: 1.1rem 0 0.5rem 0; font-size: 1.1rem; color: var(--accent-cyan);">$1</h2>');

  // Bold & Italic
  formatted = formatted.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Markdown Links [Title](URL)
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: underline; font-weight: 500;">$1</a>');

  // Inline code
  formatted = formatted.replace(/`([^`]+)`/gim, '<code style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.35rem; border-radius: 4px; font-family: monospace; font-size: 0.85em;">$1</code>');

  // Blockquotes
  formatted = formatted.replace(/^> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--accent-cyan); margin: 0.65rem 0; color: var(--text-secondary); background: rgba(56, 189, 248, 0.05); border-radius: 0 4px 4px 0; padding: 0.4rem 0.75rem;">$1</blockquote>');

  // Lists (bullet points with •, -, or *)
  formatted = formatted.replace(/^\s*[•\-*]\s+(.*$)/gim, '<li>$1</li>');
  formatted = formatted.replace(/(<li>[\s\S]*?<\/li>\s*)+/gim, (match) => `<ul style="margin: 0.5rem 0; padding-left: 1.25rem;">${match}</ul>`);

  // Paragraph breaks
  formatted = formatted.replace(/\n\n/g, '<br><br>');
  formatted = formatted.replace(/\n(?!\s*<(\/?ul|\/?li|h3|h2|blockquote))/gim, '<br>');

  // Restore code blocks
  codeBlocks.forEach((block, idx) => {
    formatted = formatted.replace(`__CODE_BLOCK_${idx}__`, block);
  });

  return formatted;
}

// Kickoff
document.addEventListener('DOMContentLoaded', init);