/**
 * Cybersecurity Career Diagnostic Profiler
 * Analyzes learner background, interests, hours, format preferences,
 * target timeline, and existing prerequisites to recommend the best tracks.
 */
import { getAllDomains } from '../taxonomy/cybersecurity-taxonomy.js';

export const DIAGNOSTIC_QUESTIONS = [
  {
    id: "current_background",
    question: "What is your current technical background and experience?",
    options: [
      { id: "non_tech", label: "Complete Beginner (No IT or programming experience)", skillWeight: { fundamentals: 10 } },
      { id: "it_support", label: "IT Support / Helpdesk / Systems Administration", skillWeight: { fundamentals: 5, security_operations_soc: 8, network_wireless_security: 8 } },
      { id: "software_dev", label: "Software Developer / Web / Mobile Programmer", skillWeight: { app_web_api_security: 10, secure_software_supply_chain: 9, devsecops: 8 } },
      { id: "networking", label: "Network Engineer / Telecom / Infrastructure", skillWeight: { network_wireless_security: 10, security_operations_soc: 8, cloud_container_security: 7 } },
      { id: "cs_student", label: "Computer Science or Engineering Student", skillWeight: { fundamentals: 6, penetration_testing: 7, malware_reverse_engineering: 7 } }
    ]
  },
  {
    id: "primary_interest",
    question: "Which aspect of cybersecurity excites you the most?",
    options: [
      { id: "breaking", label: "Offensive Security: Ethical hacking, penetration testing & flaw discovery", domains: ["penetration_testing", "app_web_api_security", "red_teaming"] },
      { id: "defending", label: "Defensive Security: SOC analysis, incident response & detection engineering", domains: ["security_operations_soc", "blue_team_detection", "incident_response_forensics"] },
      { id: "hunting", label: "Threat Intelligence & Threat Hunting: Adversary profiling and OSINT", domains: ["threat_intel_hunting", "osint"] },
      { id: "building", label: "Cloud & DevSecOps: Hardening Kubernetes, containers, and CI/CD pipelines", domains: ["cloud_container_security", "devsecops", "secure_software_supply_chain"] },
      { id: "reverse_eng", label: "Binary & Malware Analysis: Disassembling code and digital forensics", domains: ["malware_reverse_engineering", "exploit_development_research", "incident_response_forensics"] },
      { id: "strategy_compliance", label: "GRC & Leadership: Security policies, privacy, risk management & auditing", domains: ["grc_privacy", "leadership_consulting_career", "iam_zero_trust"] },
      { id: "hardware_industrial", label: "Hardware & Critical Infrastructure: Embedded IoT, automotive, or OT/SCADA", domains: ["iot_embedded_security", "ot_ics_scada_security", "automotive_hardware_security"] },
      { id: "emerging_ai", label: "Emerging Tech: AI/LLM safety, prompt injection defense, and Web3 security", domains: ["ai_ml_security", "blockchain_web3_security"] }
    ]
  },
  {
    id: "target_timeline",
    question: "What is your target timeline?",
    options: [
      { id: "short", label: "3 - 6 months (Focused sprint)", months: 4 },
      { id: "medium", label: "6 - 12 months (Comprehensive learning)", months: 9 },
      { id: "long", label: "12+ months (Deep mastery / Part-time long term)", months: 15 }
    ]
  },
  {
    id: "weekly_hours",
    question: "How many hours per week can you realistically dedicate to studying?",
    options: [
      { id: "casual", label: "3 - 5 hours per week (Part-time / Steady pace)", paceMultiplier: 1.8, hours: 4 },
      { id: "moderate", label: "8 - 15 hours per week (Balanced pace)", paceMultiplier: 1.0, hours: 10 },
      { id: "intensive", label: "20 - 30+ hours per week (Accelerated / Immersive)", paceMultiplier: 0.6, hours: 25 }
    ]
  },
  {
    id: "preferred_format",
    question: "What is your preferred learning format?",
    options: [
      { id: "hands_on", label: "Hands-on wargames and interactive labs (e.g. Bandit, PortSwigger)" },
      { id: "video_courses", label: "Guided video courses with visual demonstrations" },
      { id: "reading_docs", label: "Official standards, specifications, and whitepapers (NIST, OWASP)" },
      { id: "mixed", label: "Balanced blend of theory, documentation, and practical exercises" }
    ]
  },
  {
    id: "completed_prereqs",
    question: "Have you already completed any foundational prerequisites?",
    options: [
      { id: "none", label: "None yet (Starting from zero)" },
      { id: "linux_basic", label: "Basic Linux CLI & file permissions" },
      { id: "networking_basic", label: "Basic TCP/IP, DNS, and HTTP knowledge" },
      { id: "programming_basic", label: "Basic Python, Bash, or JavaScript scripting" },
      { id: "multiple", label: "Linux, Networking, and Basic Scripting already completed" }
    ]
  }
];

/**
 * Evaluates user responses and returns ranked recommended specializations.
 * @param {Object} responses e.g. { current_background: 'software_dev', primary_interest: 'breaking', ... }
 * @returns {Array<{domainId: string, domainName: string, matchScore: number, rationale: string, targetRoles: string[]}>}
 */
export function recommendSpecializations(responses = {}) {
  const allDomains = getAllDomains();
  const scores = new Map(allDomains.map(d => [d.id, 0]));

  const bgChoice = DIAGNOSTIC_QUESTIONS[0].options.find(o => o.id === responses.current_background);
  if (bgChoice?.skillWeight) {
    for (const [dom, weight] of Object.entries(bgChoice.skillWeight)) {
      scores.set(dom, (scores.get(dom) || 0) + weight);
    }
  }

  const interestChoice = DIAGNOSTIC_QUESTIONS[1].options.find(o => o.id === responses.primary_interest);
  if (interestChoice?.domains) {
    for (const dom of interestChoice.domains) {
      scores.set(dom, (scores.get(dom) || 0) + 15);
    }
  }

  // Always maintain foundational grounding
  scores.set('fundamentals', (scores.get('fundamentals') || 0) + 5);

  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([_, score]) => score > 0)
    .slice(0, 3)
    .map(([domId, score]) => {
      const domain = allDomains.find(d => d.id === domId);
      let rationale = `Matches your interest in ${interestChoice?.label || 'cybersecurity'}.`;
      if (bgChoice && bgChoice.skillWeight && bgChoice.skillWeight[domId]) {
        rationale += ` Leverages your existing background in ${bgChoice.label}.`;
      }

      return {
        domainId: domId,
        domainName: domain?.name || domId,
        matchScore: score,
        rationale,
        targetRoles: domain?.targetRoles || []
      };
    });

  return ranked;
}
