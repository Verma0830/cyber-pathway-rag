/**
 * Personalized Cybersecurity Roadmap Generator
 * Builds custom 5-stage roadmaps (Foundations, Beginner, Intermediate, Advanced, Expert)
 * adhering strictly to the Runtime RAG System Prompt rules.
 */
import { getDomainById, getPrerequisiteChain } from '../taxonomy/cybersecurity-taxonomy.js';

export class RoadmapGenerator {
  /**
   * @param {Object} options
   * @param {import('../adapters/IDatabase.js').IDatabase} options.db
   */
  constructor({ db }) {
    this.db = db;
  }

  /**
   * Generates a personalized roadmap adhering to the 5 required stages.
   * @param {Object} params
   * @param {string} params.domainId Target specialization domain
   * @param {Object} [params.userProfile] Learner profile
   * @returns {Promise<Object>} Complete structured roadmap
   */
  async generateRoadmap({ domainId, userProfile = {} }) {
    const domain = getDomainById(domainId);
    if (!domain) {
      throw new Error(`Invalid domainId: ${domainId}`);
    }

    const prereqChain = getPrerequisiteChain(domainId);
    const weeklyHours = userProfile.weeklyHours || 10;
    // Pace multiplier: 10 hrs/week is normalized to 1.0
    const paceMultiplier = weeklyHours > 0 ? (10 / weeklyHours) : 1.0;

    // Fetch verified resources for target and foundational domains
    const targetResources = await this.db.getAllResources({ domainId });
    const fundResources = await this.db.getAllResources({ domainId: 'fundamentals' });

    // Segregate resources by difficulty
    const absBegResources = fundResources.filter(r => r.difficultyLevel === 'absolute_beginner');
    const begResources = targetResources.filter(r => ['absolute_beginner', 'beginner'].includes(r.difficultyLevel));
    const intResources = targetResources.filter(r => r.difficultyLevel === 'intermediate');
    const advResources = targetResources.filter(r => ['advanced', 'expert'].includes(r.difficultyLevel));

    // Fallback selections to ensure every stage has real, verified material
    const stage1Resources = (absBegResources.length > 0 ? absBegResources.slice(0, 2) : fundResources.slice(0, 2));
    const stage2Resources = (begResources.length > 0 ? begResources.slice(0, 2) : targetResources.slice(0, 2));
    const stage3Resources = (intResources.length > 0 ? intResources.slice(0, 2) : targetResources.slice(1, 3));
    const stage4Resources = (advResources.length > 0 ? advResources.slice(0, 2) : targetResources.slice(0, 2));
    const stage5Resources = (advResources.length > 1 ? advResources.slice(1, 3) : targetResources.slice(0, 2));

    const subdomains = domain.subdomains || [];
    const allTopics = subdomains.flatMap(s => s.topics);
    const recommendedLabs = subdomains.flatMap(s => s.recommendedLabs || []);

    // Format resource card with all required attributes and explicit relevance explanation
    const formatResource = (r, reason) => ({
      id: r.id,
      title: r.title,
      canonicalUrl: r.canonicalUrl,
      resourceType: r.resourceType,
      difficultyLevel: r.difficultyLevel,
      providerName: r.provider?.name || 'Verified Author',
      prerequisites: r.prerequisites || [],
      whyRecommended: reason || r.credibility?.justification || 'Verified canonical educational reference',
      provenanceBadge: r.provenance?.origin === 'live_search' ? 'Live search' : 'Indexed',
      lastValidationDate: r.health?.lastCheckedAt ? r.health.lastCheckedAt.slice(0, 10) : 'Recent (Active)'
    });

    const roadmap = {
      id: `roadmap_${domainId}_${Date.now()}`,
      userId: userProfile.id || 'guest',
      domainId: domain.id,
      title: `${domain.name} - Personalized Career Roadmap`,
      targetRoles: domain.targetRoles || ['Cybersecurity Specialist'],
      matchingRationale: userProfile.rationale || `Selected based on your interest and background in ${domain.name}.`,
      prerequisiteDomains: prereqChain.filter(d => d.id !== domainId).map(d => ({ id: d.id, name: d.name })),
      estimatedTotalWeeks: Math.round(26 * paceMultiplier),
      timeNotice: "All timeframes are estimates based on your study pace, not guarantees. We do not promise employment, certification success, mastery, or exact completion times.",
      
      // 5 Required Stages: Foundations, Beginner, Intermediate, Advanced, Expert
      stages: [
        {
          stageNumber: 1,
          stageName: "Foundations",
          title: "Computing, Operating Systems, Networking & Scripting Foundations",
          estimatedTimeRange: `${Math.round(3 * paceMultiplier)} - ${Math.round(5 * paceMultiplier)} weeks`,
          prerequisites: ["Basic computer literacy"],
          learningObjectives: [
            "Understand OS internals: process management, memory architecture, and permissions",
            "Grasp networking models (OSI & TCP/IP), packet headers, routing, and DNS",
            "Gain comfort navigating Linux/Bash command-line environments"
          ],
          topics: [
            "Linux shell navigation & permissions (chmod, chown)",
            "TCP/IP handshake, DNS, HTTP/HTTPS and Wireshark packet capture",
            "Basic automation scripting in Python or Bash"
          ],
          recommendedResources: stage1Resources.map(r => formatResource(r, "Provides the indispensable OS and networking baseline required before analyzing security vulnerabilities.")),
          practicalExercises: [
            "OverTheWire Bandit wargame (Levels 0 through 15) to master Linux CLI mechanics",
            "Capture and inspect HTTP vs HTTPS traffic streams in Wireshark"
          ],
          portfolioProject: {
            title: "Home Lab Architecture & Network Baseline Document",
            description: "Build a virtualized multi-VM environment (Linux + Windows) with host-only networking and author a technical documentation report on GitHub."
          },
          progressCheckpoint: "Can confidently navigate Linux directories, parse logs using grep/awk, and explain TCP three-way handshakes without consulting notes.",
          criteriaForAdvancing: "Completion of OverTheWire Bandit Level 10 and successful capture/analysis of standard protocol packets."
        },
        {
          stageNumber: 2,
          stageName: "Beginner",
          title: `${domain.name} Core Principles & Vulnerability Baseline`,
          estimatedTimeRange: `${Math.round(4 * paceMultiplier)} - ${Math.round(6 * paceMultiplier)} weeks`,
          prerequisites: ["Foundations stage completion (Linux CLI, Networking essentials)"],
          learningObjectives: [
            `Understand core vulnerability classes and defense mechanisms within ${domain.name}`,
            "Learn how to consult and interpret authoritative standards (NIST, OWASP, MITRE)",
            "Setup industry-standard open-source analysis and defensive tooling"
          ],
          topics: allTopics.slice(0, Math.max(2, Math.ceil(allTopics.length / 4))),
          recommendedResources: stage2Resources.map(r => formatResource(r, `Introduces canonical methodologies and terminology specific to ${domain.name}.`)),
          practicalExercises: [
            recommendedLabs[0] || "PortSwigger Web Security Academy introductory labs",
            "Execute and analyze baseline scans in an isolated local VM"
          ],
          portfolioProject: {
            title: "Vulnerability Triage & Remediation Report",
            description: "Analyze an intentionally vulnerable open-source app or service, document 3 distinct findings with CVSS scores, and outline defensive fixes."
          },
          progressCheckpoint: "Able to classify vulnerability types using standard CWE/CVE taxonomy and explain their architectural impact.",
          criteriaForAdvancing: "Successful completion of 5 beginner lab challenges and documentation of root cause mitigations."
        },
        {
          stageNumber: 3,
          stageName: "Intermediate",
          title: "Methodology, Tool Mastery & Threat Scenarios",
          estimatedTimeRange: `${Math.round(6 * paceMultiplier)} - ${Math.round(8 * paceMultiplier)} weeks`,
          prerequisites: ["Beginner stage completion & basic tool proficiency"],
          learningObjectives: [
            "Conduct structured investigative or testing workflows end-to-end",
            "Correlate events across multiple log sources or attack vectors",
            "Develop custom scripts, signatures (Sigma/YARA), or automated checks"
          ],
          topics: allTopics.slice(Math.ceil(allTopics.length / 4), Math.ceil((allTopics.length * 2) / 4)),
          recommendedResources: stage3Resources.map(r => formatResource(r, "Deepens practical tradecraft and tool mastery in realistic simulated environments.")),
          practicalExercises: [
            recommendedLabs[1] || "HackTheBox Starting Point or CyberDefenders blue team scenarios",
            "Configure Sysmon/Wazuh alerts to catch common privilege escalation patterns"
          ],
          portfolioProject: {
            title: "Custom Detection Rule or Automated Audit Tool",
            description: "Author and test 3 novel Sigma detection rules or a Python scanner that validates system configurations against CIS benchmarks."
          },
          progressCheckpoint: "Demonstrates independent problem solving when investigating realistic incidents or exploiting security flaws in sandbox labs.",
          criteriaForAdvancing: "Independent completion of 10 intermediate lab challenges with documented write-ups."
        },
        {
          stageNumber: 4,
          stageName: "Advanced",
          title: "Enterprise Architecture, Evasion & Incident Response",
          estimatedTimeRange: `${Math.round(7 * paceMultiplier)} - ${Math.round(9 * paceMultiplier)} weeks`,
          prerequisites: ["Intermediate stage completion & ability to script and analyze complex telemetry"],
          learningObjectives: [
            "Defend or assess complex enterprise environments (Active Directory, Multi-tenant Cloud, Kubernetes)",
            "Identify subtle evasion techniques and living-off-the-land tradecraft",
            "Integrate security controls into CI/CD pipelines and infrastructure as code"
          ],
          topics: allTopics.slice(Math.ceil((allTopics.length * 2) / 4)),
          recommendedResources: stage4Resources.map(r => formatResource(r, "Presents enterprise-scale challenges, defense-in-depth, and advanced adversary simulation.")),
          practicalExercises: [
            "Active Directory GOAD lab or Kubernetes Goat container security challenges",
            "Simulate lateral movement scenarios and verify detection coverage in Splunk/Elastic"
          ],
          portfolioProject: {
            title: "Enterprise Security Architecture Blueprint & Threat Model",
            description: "Produce a full STRIDE threat model and architectural hardening plan for a cloud-native microservices application."
          },
          progressCheckpoint: "Can explain trade-offs between security controls, business productivity, and false positive rates in enterprise systems.",
          criteriaForAdvancing: "Successful execution of an enterprise-level scenario with comprehensive remediation documentation."
        },
        {
          stageNumber: 5,
          stageName: "Expert",
          title: "Mastery, Security Strategy & Advisory Leadership",
          estimatedTimeRange: `${Math.round(6 * paceMultiplier)} - ${Math.round(8 * paceMultiplier)} weeks`,
          prerequisites: ["Advanced stage completion & multi-year equivalent technical depth"],
          learningObjectives: [
            "Architect resilient Zero Trust security programs aligned with organizational risk appetite",
            "Contribute original security research, CVE disclosures, or open-source tooling",
            "Communicate cyber risk effectively to non-technical executives and board members"
          ],
          topics: [
            "Zero Trust Architecture (NIST SP 800-207) and continuous verification",
            "Executive risk communication, ROI of security controls, and regulatory compliance",
            "Novel vulnerability research and supply-chain assurance (SLSA, SBOM)"
          ],
          recommendedResources: stage5Resources.map(r => formatResource(r, "Provides executive-level governance, cutting-edge research, and Zero Trust architectural frameworks.")),
          practicalExercises: [
            "Conduct a comprehensive risk assessment using the FAIR quantitative model",
            "Perform an OpenSSF Scorecard audit and publish remediations on a critical open-source repo"
          ],
          portfolioProject: {
            title: "Capstone Cyber Defense Strategy or Original Security Whitepaper",
            description: "Publish an original technical whitepaper, open-source security tool, or comprehensive enterprise security governance charter."
          },
          progressCheckpoint: "Recognized as a domain subject matter expert capable of designing organizational security posture and mentoring junior practitioners.",
          criteriaForAdvancing: "Peer review or public publication of capstone portfolio work."
        }
      ],

      // Prompt requirement: End roadmap responses with one concrete next action the learner can begin immediately
      immediateNextAction: "Open the OverTheWire Bandit wargame at https://overthewire.org/wargames/bandit/ and complete Level 0 to Level 1 right now to establish your Linux command-line confidence."
    };

    return roadmap;
  }
}
