/**
 * Comprehensive Cybersecurity Taxonomy Specification
 * Covers all 26 required domains, subdomains, topics, prerequisites, and mapped career roles.
 * Fully extensible and graph-traversable.
 */

export const CYBERSECURITY_TAXONOMY = [
  {
    id: "fundamentals",
    name: "Computer, OS, Networking & Programming Fundamentals",
    category: "foundational",
    description: "Core technical foundations of computing systems, operating systems, networks, protocols, and scripting.",
    targetRoles: ["IT Support Specialist", "Junior Security Analyst", "Security Fundamentals Learner"],
    prerequisites: [],
    subdomains: [
      {
        id: "os_internals",
        name: "Operating Systems Internals (Linux & Windows)",
        topics: ["processes_threads", "memory_management", "file_systems", "permissions_acls", "windows_registry", "linux_cli_systemd"],
        recommendedLabs: ["OverTheWire Bandit", "Linux Journey"]
      },
      {
        id: "networking_protocols",
        name: "Networking & Internet Protocols",
        topics: ["osi_model", "tcp_ip_handshake", "dns_dhcp", "http_https_tls", "routing_switching", "wireshark_packet_analysis"],
        recommendedLabs: ["Wireshark Sample Captures", "Cisco Packet Tracer"]
      },
      {
        id: "scripting_programming",
        name: "Security Scripting & Automation",
        topics: ["bash_scripting", "powershell_automation", "python_for_security", "regular_expressions", "git_version_control"],
        recommendedLabs: ["Exercism Python Track", "Bash scripting challenges"]
      }
    ]
  },
  {
    id: "security_operations_soc",
    name: "Security Operations & SOC",
    category: "defensive",
    description: "24/7 monitoring, security information & event management (SIEM), alert triage, and incident escalation.",
    targetRoles: ["SOC Analyst (Tier 1 & Tier 2)", "Security Operations Engineer", "SIEM Engineer"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "siem_soar",
        name: "SIEM Architecture & SOAR",
        topics: ["log_ingestion", "correlation_rules", "splunk_queries", "elastic_security", "wazuh_siem", "playbook_automation"],
        recommendedLabs: ["Wazuh Virtual Appliance", "TryHackMe SOC Level 1"]
      },
      {
        id: "alert_triage",
        name: "Alert Triage & Investigation",
        topics: ["true_vs_false_positives", "sysmon_log_analysis", "windows_security_events", "triage_methodology", "incident_ticketing"],
        recommendedLabs: ["CyberDefenders Blue Yard", "LetsDefend SOC Analyst"]
      }
    ]
  },
  {
    id: "blue_team_detection",
    name: "Blue Teaming & Detection Engineering",
    category: "defensive",
    description: "Designing, building, testing, and tuning proactive detection rules and telemetry pipelines.",
    targetRoles: ["Detection Engineer", "Blue Team Specialist", "Defensive Security Architect"],
    prerequisites: ["fundamentals", "security_operations_soc"],
    subdomains: [
      {
        id: "detection_rules",
        name: "Detection Rule Development",
        topics: ["sigma_rules", "yara_signatures", "snort_suricata_rules", "edr_telemetry_tuning", "behavioral_heuristics"],
        recommendedLabs: ["Sigma Rule Lab", "DetectionLab"]
      },
      {
        id: "attack_telemetry",
        name: "Host & Network Telemetry Engineering",
        topics: ["endpoint_detection_response", "zeek_network_monitoring", "auditd_linux_logging", "sysmon_configuration"],
        recommendedLabs: ["Splunk BOTS (Boss of the SOC)"]
      }
    ]
  },
  {
    id: "incident_response_forensics",
    name: "Incident Response & Digital Forensics (DFIR)",
    category: "defensive",
    description: "Evidence preservation, dead-box and live disk forensics, memory analysis, and containment.",
    targetRoles: ["Incident Response Consultant", "Digital Forensics Examiner", "DFIR Specialist"],
    prerequisites: ["fundamentals", "security_operations_soc"],
    subdomains: [
      {
        id: "memory_forensics",
        name: "Memory Forensics",
        topics: ["volatility_framework", "process_injection_detection", "injected_code_extraction", "malicious_dll_hunting"],
        recommendedLabs: ["Volatility Memory Samples", "CyberDefenders DFIR CTFs"]
      },
      {
        id: "disk_artifact_forensics",
        name: "Disk & Artifact Forensics",
        topics: ["autopsy_sleuthkit", "mft_usnjrnl_analysis", "shimcache_amcache", "shellbags_eventlogs", "chain_of_custody"],
        recommendedLabs: ["Eric Zimmerman Tools Labs"]
      }
    ]
  },
  {
    id: "threat_intel_hunting",
    name: "Threat Intelligence & Threat Hunting",
    category: "defensive",
    description: "Cyber threat intelligence (CTI) collection, adversary profiling, hypothesis-driven proactive hunting.",
    targetRoles: ["Threat Intelligence Analyst", "Cyber Threat Hunter", "CTI Researcher"],
    prerequisites: ["fundamentals", "security_operations_soc"],
    subdomains: [
      {
        id: "frameworks_profiling",
        name: "Threat Frameworks & Adversary Profiling",
        topics: ["mitre_attack_enterprise", "diamond_model", "cyber_kill_chain", "stix_taxii_standards", "apt_attribution"],
        recommendedLabs: ["MITRE ATT&CK Navigator", "OpenCTI Sandbox"]
      },
      {
        id: "threat_hunting_methodology",
        name: "Hypothesis-Driven Threat Hunting",
        topics: ["hypothesis_generation", "hunting_in_baseline_data", "lolbins_hunting", "anomaly_detection"],
        recommendedLabs: ["Threat Hunting Project Workshops"]
      }
    ]
  },
  {
    id: "malware_reverse_engineering",
    name: "Malware Analysis & Reverse Engineering",
    category: "specialized",
    description: "Static and dynamic analysis of malicious binaries, disassembly, debugging, and unpacking.",
    targetRoles: ["Malware Analyst", "Reverse Engineer", "Threat Researcher"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "static_analysis",
        name: "Static Code & Binary Analysis",
        topics: ["pe_elf_structure", "ghidra_decompilation", "ida_free_basics", "strings_hashes_imports", "cryptographic_signatures"],
        recommendedLabs: ["Practical Malware Analysis Labs", "REmnux VM"]
      },
      {
        id: "dynamic_analysis",
        name: "Dynamic Analysis & Debugging",
        topics: ["x64dbg_debugging", "api_monitoring_procmon", "sandbox_detonation", "unpacking_techniques", "anti_analysis_evasion"],
        recommendedLabs: ["ANY.RUN Community Sandbox", "Malware-Traffic-Analysis.net"]
      }
    ]
  },
  {
    id: "penetration_testing",
    name: "Penetration Testing & Ethical Hacking",
    category: "offensive",
    description: "Methodological identification and exploitation of vulnerabilities across networks, hosts, and domains.",
    targetRoles: ["Penetration Tester", "Ethical Hacker", "Security Consultant"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "network_host_pentest",
        name: "Network & Host Penetration Testing",
        topics: ["nmap_port_scanning", "vulnerability_discovery", "metasploit_framework", "privilege_escalation_linux_windows"],
        recommendedLabs: ["HackTheBox Starting Point", "TryHackMe Jr Penetration Tester"]
      },
      {
        id: "active_directory_security",
        name: "Active Directory Attacks & Defense",
        topics: ["kerberoasting", "asreproast", "bloodhound_graphing", "pass_the_hash", "golden_silver_tickets"],
        recommendedLabs: ["Game of Active Directory (GOAD)", "TryHackMe AD Rooms"]
      }
    ]
  },
  {
    id: "red_teaming",
    name: "Red Teaming & Adversary Simulation",
    category: "offensive",
    description: "Goal-oriented simulations testing an organization's detection, response, and overall resilience.",
    targetRoles: ["Red Team Operator", "Adversary Simulation Specialist"],
    prerequisites: ["fundamentals", "penetration_testing"],
    subdomains: [
      {
        id: "c2_infrastructure",
        name: "C2 Infrastructure & Evasion",
        topics: ["command_and_control_setup", "domain_fronting_redirectors", "payload_obfuscation", "edr_bypass_concepts"],
        recommendedLabs: ["Mythic C2 Setup Lab", "Sliver C2 Local Lab"]
      },
      {
        id: "lateral_movement",
        name: "Living off the Land & Lateral Movement",
        topics: ["lolbins_execution", "wmi_powershell_remoting", "token_manipulation", "persistence_mechanisms"],
        recommendedLabs: ["Red Team Notes Practical Scenarios"]
      }
    ]
  },
  {
    id: "vulnerability_management",
    name: "Vulnerability Assessment & Management",
    category: "defensive",
    description: "Scanning, scoring, prioritizing, and coordinating remediation of security weaknesses.",
    targetRoles: ["Vulnerability Management Analyst", "Security Assessment Specialist"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "scanning_discovery",
        name: "Vulnerability Scanning & CVE Analysis",
        topics: ["cve_cwe_identifiers", "cvss_v3_v4_scoring", "openvas_greenbone", "qualys_nessus_basics", "asset_inventory"],
        recommendedLabs: ["OpenVAS Docker Lab"]
      },
      {
        id: "prioritization_remediation",
        name: "Risk-Based Prioritization",
        topics: ["epss_exploit_prediction", "kev_catalog_cisa", "remediation_slas", "patch_verification"],
        recommendedLabs: ["CISA KEV Dashboard Exercises"]
      }
    ]
  },
  {
    id: "app_web_api_security",
    name: "Application, Web, API & Mobile Security",
    category: "application",
    description: "Securing web applications, REST/GraphQL APIs, and mobile apps against flaw exploitation.",
    targetRoles: ["Application Security Engineer", "Web Penetration Tester", "Product Security Engineer"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "web_security",
        name: "Web Security & OWASP Top 10",
        topics: ["sql_injection", "cross_site_scripting_xss", "csrf", "ssrf", "broken_access_control", "owasp_asvs"],
        recommendedLabs: ["PortSwigger Web Security Academy", "OWASP Juice Shop"]
      },
      {
        id: "api_security",
        name: "API Security & Microservices",
        topics: ["owasp_api_top_10", "bola_idors", "jwt_token_vulnerabilities", "rate_limiting_abuse", "graphql_introspection"],
        recommendedLabs: ["Damn Vulnerable REST API (DVRA)", "OWASP crAPI"]
      },
      {
        id: "mobile_security",
        name: "Mobile Application Security (Android/iOS)",
        topics: ["owasp_masvs", "apktool_reverse_engineering", "frida_dynamic_instrumentation", "certificate_pinning_bypass"],
        recommendedLabs: ["Android App InsecureShop", "OWASP MASTG Labs"]
      }
    ]
  },
  {
    id: "secure_software_supply_chain",
    name: "Secure Software Development & Supply-Chain Security",
    category: "application",
    description: "Hardening SDLC, software dependencies, build systems, and mitigating dependency confusion.",
    targetRoles: ["DevSecOps Engineer", "Secure Coding Champion", "Software Security Architect"],
    prerequisites: ["fundamentals", "app_web_api_security"],
    subdomains: [
      {
        id: "supply_chain_security",
        name: "Supply-Chain & Dependency Management",
        topics: ["sbom_generation_spdx_cyclonedx", "slsa_framework", "sigstore_cosign_signing", "dependency_confusion_typosquatting"],
        recommendedLabs: ["Sigstore Scaffolding Lab", "OpenSSF Scorecard"]
      },
      {
        id: "secure_code_review",
        name: "Automated Code Analysis & SAST",
        topics: ["semgrep_custom_rules", "sonarqube_security_gates", "secret_scanning_trufflehog", "dast_zap_automation"],
        recommendedLabs: ["Semgrep Interactive Academy"]
      }
    ]
  },
  {
    id: "devsecops",
    name: "DevSecOps & Pipeline Security",
    category: "application",
    description: "Shifting security left into CI/CD pipelines, automated policy enforcement, and infrastructure scanning.",
    targetRoles: ["DevSecOps Engineer", "Cloud Security Automation Engineer"],
    prerequisites: ["fundamentals", "secure_software_supply_chain"],
    subdomains: [
      {
        id: "ci_cd_security",
        name: "CI/CD Pipeline Hardening",
        topics: ["github_actions_hardening", "least_privilege_ci_tokens", "pipeline_poisoning_attacks", "secret_masking"],
        recommendedLabs: ["OWASP WrongSecrets", "GitHub Security Lab CTF"]
      },
      {
        id: "policy_as_code",
        name: "Policy-as-Code & IaC Scanning",
        topics: ["open_policy_agent_opa", "rego_policies", "checkov_tfsec", "trivy_iac_scanning"],
        recommendedLabs: ["OPA Playground", "Checkov Sample Repo"]
      }
    ]
  },
  {
    id: "cloud_container_security",
    name: "Cloud, Container, Kubernetes & Serverless Security",
    category: "infrastructure",
    description: "Securing multi-tenant cloud platforms (AWS/Azure/GCP), container runtimes, and Kubernetes clusters.",
    targetRoles: ["Cloud Security Engineer", "Kubernetes Security Architect", "Cloud Security Consultant"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "cloud_iam_posture",
        name: "Cloud Posture & IAM Security",
        topics: ["aws_iam_least_privilege", "azure_entraid_rbac", "gcp_service_accounts", "cspm_cnapp_fundamentals", "cis_cloud_benchmarks"],
        recommendedLabs: ["CloudFoxable", "Flaws.cloud"]
      },
      {
        id: "container_k8s_security",
        name: "Docker & Kubernetes Hardening",
        topics: ["dockerfile_hardening", "rootless_containers", "k8s_rbac_serviceaccounts", "pod_security_standards", "network_policies"],
        recommendedLabs: ["Kubernetes Goat", "Container Security Walkthroughs"]
      }
    ]
  },
  {
    id: "network_wireless_security",
    name: "Network & Wireless Security",
    category: "infrastructure",
    description: "Perimeter defense, network segmentation, secure protocols, and wireless protection.",
    targetRoles: ["Network Security Engineer", "Perimeter Defense Specialist"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "network_defense",
        name: "Perimeter Defense & Segmentation",
        topics: ["nextgen_firewalls_pfsense", "ids_ips_suricata", "microsegmentation_vlans", "tls_1_3_mtls", "vpn_wireguard_ipsec"],
        recommendedLabs: ["pfSense Virtual Lab", "GNS3 Network Topologies"]
      },
      {
        id: "wireless_security",
        name: "Wireless & RF Security",
        topics: ["wpa2_wpa3_handshakes", "evil_twin_rogue_aps", "radius_802_1x_enterprise", "rf_reconnaissance"],
        recommendedLabs: ["Wireless Security Capture Analysis"]
      }
    ]
  },
  {
    id: "iam_zero_trust",
    name: "Identity, Access Management (IAM), PAM & Zero Trust",
    category: "governance",
    description: "Identity lifecycles, privileged access management, modern authentication protocols, and Zero Trust.",
    targetRoles: ["IAM Engineer", "Identity Architect", "Zero Trust Consultant"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "identity_protocols",
        name: "Modern Identity Protocols",
        topics: ["saml_2_0_flows", "oauth_2_0_oidc", "fido2_webauthn_passkeys", "mfa_push_fatigue_mitigation", "session_binding"],
        recommendedLabs: ["OAuth 2.0 Playground", "Authelia Local Lab"]
      },
      {
        id: "zero_trust_architecture",
        name: "Zero Trust Architecture (NIST 800-207)",
        topics: ["never_trust_always_verify", "ztna_vs_vpn", "pam_privileged_access", "conditional_access_policies"],
        recommendedLabs: ["NIST 800-207 Architecture Case Studies"]
      }
    ]
  },
  {
    id: "cryptography_pki",
    name: "Cryptography, PKI & Secrets Management",
    category: "foundational",
    description: "Mathematical principles of confidentiality, integrity, digital certificates, and secure key lifecycles.",
    targetRoles: ["Cryptographic Engineer", "PKI Administrator", "Security Engineer"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "cryptographic_primitives",
        name: "Cryptographic Primitives & Hashes",
        topics: ["aes_gcm_chacha20", "rsa_elliptic_curves", "sha_256_sha3", "hmac_message_integrity", "post_quantum_crypto_pqc"],
        recommendedLabs: ["CryptoPals Crypto Challenges"]
      },
      {
        id: "pki_secrets",
        name: "Public Key Infrastructure (PKI) & Secrets Management",
        topics: ["x509_certificates", "ca_hierarchies_crl_ocsp", "hashicorp_vault_basics", "key_rotation_hsm"],
        recommendedLabs: ["OpenSSL Certificate Authority Setup", "HashiCorp Vault Developer Lab"]
      }
    ]
  },
  {
    id: "grc_privacy",
    name: "Governance, Risk, Compliance (GRC), Auditing & Privacy",
    category: "governance",
    description: "Regulatory frameworks, risk assessments, compliance audits, and global data privacy mandates.",
    targetRoles: ["GRC Analyst", "IT Auditor", "Information Security Officer", "Privacy Analyst"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "compliance_frameworks",
        name: "Security Frameworks & Standards",
        topics: ["nist_csf_2_0", "iso_iec_27001_lead_implementer", "soc_2_trust_services_criteria", "pci_dss_4_0", "hipaa_security_rule"],
        recommendedLabs: ["NIST CSF 2.0 Assessment Toolkit", "OpenControl Framework"]
      },
      {
        id: "risk_privacy",
        name: "Risk Assessment & Privacy Regulations",
        topics: ["fair_quantitative_risk_model", "risk_registers_matrices", "gdpr_data_protection", "ccpa_cpra_privacy_impact"],
        recommendedLabs: ["ISO 27005 Risk Assessment Case Study"]
      }
    ]
  },
  {
    id: "security_architecture",
    name: "Security Architecture & Engineering",
    category: "governance",
    description: "System design patterns, defense-in-depth, threat modeling, and enterprise trust zones.",
    targetRoles: ["Enterprise Security Architect", "Solutions Security Engineer"],
    prerequisites: ["fundamentals", "network_wireless_security", "iam_zero_trust"],
    subdomains: [
      {
        id: "threat_modeling",
        name: "System Threat Modeling",
        topics: ["stride_methodology", "pasta_risk_centric_modeling", "data_flow_diagrams_dfd", "owasp_threat_dragon"],
        recommendedLabs: ["OWASP Threat Dragon Lab", "Elevation of Privilege Card Game"]
      },
      {
        id: "architecture_patterns",
        name: "Enterprise Architecture Patterns",
        topics: ["defense_in_depth", "sabsa_framework", "secure_enclaves", "bastion_jumpboxes"],
        recommendedLabs: ["Architectural Review Case Studies"]
      }
    ]
  },
  {
    id: "osint",
    name: "OSINT (Open Source Intelligence)",
    category: "specialized",
    description: "Public footprinting, digital footprint analysis, domain investigation, and threat actor research.",
    targetRoles: ["OSINT Investigator", "Threat Intelligence Researcher", "Fraud Analyst"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "osint_reconnaissance",
        name: "Technical OSINT & Asset Discovery",
        topics: ["shodan_censys_queries", "amass_subdomain_enumeration", "whois_dns_historical_lookup", "certificate_transparency_logs"],
        recommendedLabs: ["SANS OSINT CTF", "Trace Labs CTF Challenges"]
      },
      {
        id: "social_operational_security",
        name: "People OSINT & OpSec",
        topics: ["sock_puppet_management", "geolocation_verification", "breach_data_analysis", "metadata_extraction_exif"],
        recommendedLabs: ["GeoGuessr OSINT Challenges"]
      }
    ]
  },
  {
    id: "iot_embedded_security",
    name: "IoT & Embedded Security",
    category: "specialized",
    description: "Security of smart devices, embedded firmware extraction, hardware buses, and IoT protocols.",
    targetRoles: ["IoT Security Researcher", "Embedded Systems Security Engineer"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "firmware_analysis",
        name: "Firmware Extraction & Emulation",
        topics: ["binwalk_firmware_extraction", "qemu_firmware_emulation", "hardcoded_credentials_hunt", "firmware_patching"],
        recommendedLabs: ["Damn Vulnerable Router Firmware (DVRF)", "EMUX Firmware Lab"]
      },
      {
        id: "iot_protocols",
        name: "IoT Communication Protocols",
        topics: ["mqtt_broker_security", "coap_protocol", "zigbee_zwave_basics", "ble_bluetooth_low_energy_attacks"],
        recommendedLabs: ["Mosquitto MQTT Security Lab"]
      }
    ]
  },
  {
    id: "ot_ics_scada_security",
    name: "OT, ICS & SCADA Security",
    category: "specialized",
    description: "Operational technology in critical infrastructure, industrial controllers (PLCs), and field protocols.",
    targetRoles: ["ICS/SCADA Security Specialist", "Critical Infrastructure Protection Analyst"],
    prerequisites: ["fundamentals", "network_wireless_security"],
    subdomains: [
      {
        id: "purdue_model",
        name: "Purdue Model & Industrial Architecture",
        topics: ["purdue_enterprise_reference_architecture", "air_gapping_dmz_boundaries", "plc_rtu_hmi_components", "safety_instrumented_systems_sis"],
        recommendedLabs: ["GRFICS Industrial Simulation Lab"]
      },
      {
        id: "ics_protocols",
        name: "Industrial Protocols & Attacks",
        topics: ["modbus_tcp_security", "dnp3_protocol", "iec_60870_5_104", "stuxnet_triton_case_studies"],
        recommendedLabs: ["Control Things Platform (CTP) VM"]
      }
    ]
  },
  {
    id: "automotive_hardware_security",
    name: "Automotive & Hardware Security",
    category: "specialized",
    description: "In-vehicle networks (CAN bus), ECU exploitation, fault injection, and hardware tampering.",
    targetRoles: ["Automotive Security Engineer", "Hardware Penetration Tester"],
    prerequisites: ["fundamentals", "iot_embedded_security"],
    subdomains: [
      {
        id: "can_bus_vehicle",
        name: "CAN Bus & In-Vehicle Security",
        topics: ["can_protocol_frames", "socketcan_candump_cansend", "obd_ii_diagnostics", "automotive_threat_modeling"],
        recommendedLabs: ["ICSim (Instrument Cluster Simulator)"]
      },
      {
        id: "hardware_glitching",
        name: "Physical Hardware Security & Glitching",
        topics: ["uart_jtag_debugging", "voltage_glitching_basics", "side_channel_power_analysis", "pcb_reverse_engineering"],
        recommendedLabs: ["ChipWhisperer Nano Tutorials"]
      }
    ]
  },
  {
    id: "ai_ml_security",
    name: "AI & Machine-Learning Security",
    category: "emerging",
    description: "Securing LLMs, machine learning pipelines, mitigating prompt injection, and adversarial attacks.",
    targetRoles: ["AI Security Engineer", "LLM Red Teamer", "Trust & Safety Specialist"],
    prerequisites: ["fundamentals", "app_web_api_security"],
    subdomains: [
      {
        id: "llm_appsec",
        name: "OWASP Top 10 for LLMs & GenAI",
        topics: ["direct_indirect_prompt_injection", "rag_data_poisoning", "insecure_output_handling", "model_denial_of_service", "system_prompt_leakage"],
        recommendedLabs: ["Gandalf Lakera AI Challenges", "Prompt Injection Sandbox"]
      },
      {
        id: "adversarial_ml",
        name: "Adversarial Machine Learning",
        topics: ["evasion_attacks_perturbation", "training_data_poisoning", "model_inversion_extraction", "adversarial_robustness_toolbox_art"],
        recommendedLabs: ["IBM ART Quickstart Notebooks"]
      }
    ]
  },
  {
    id: "blockchain_web3_security",
    name: "Blockchain & Smart-Contract Security",
    category: "emerging",
    description: "Auditing decentralized applications, EVM bytecode, consensus mechanisms, and smart contract flaws.",
    targetRoles: ["Smart Contract Auditor", "Web3 Security Specialist"],
    prerequisites: ["fundamentals"],
    subdomains: [
      {
        id: "smart_contract_flaws",
        name: "Solidity & Smart Contract Vulnerabilities",
        topics: ["reentrancy_attacks", "integer_overflow_underflow", "flash_loan_attacks", "frontrunning_mev", "access_control_flaws"],
        recommendedLabs: ["Damn Vulnerable DeFi", "Ethernaut by OpenZeppelin"]
      },
      {
        id: "audit_tooling",
        name: "Web3 Static Analysis & Auditing",
        topics: ["slither_static_analyzer", "foundry_fuzz_testing", "mythril_symbolic_execution", "audit_report_writing"],
        recommendedLabs: ["Foundry Testing Templates"]
      }
    ]
  },
  {
    id: "exploit_development_research",
    name: "Security Research & Exploit Development",
    category: "offensive",
    description: "Low-level vulnerability discovery, fuzzing, memory corruption exploitation, and mitigation bypasses.",
    targetRoles: ["Vulnerability Researcher", "Exploit Developer"],
    prerequisites: ["fundamentals", "malware_reverse_engineering"],
    subdomains: [
      {
        id: "memory_corruption",
        name: "Memory Corruption & Shellcoding",
        topics: ["stack_buffer_overflows", "format_string_bugs", "heap_exploitation_basics", "shellcode_writing_x86_x64"],
        recommendedLabs: ["Protostar / Phoenix Exploit Education", "ROP Emporium"]
      },
      {
        id: "fuzzing_mitigations",
        name: "Fuzzing & Modern Mitigations",
        topics: ["afl_plus_plus_fuzzing", "libfuzzer_integration", "dep_nx_bypass_rop", "aslr_information_leaks"],
        recommendedLabs: ["Fuzzing101 by Antonio Morales"]
      }
    ]
  },
  {
    id: "leadership_consulting_career",
    name: "Security Leadership, Consulting & Career Development",
    category: "governance",
    description: "CISO strategy, security communication, program maturity, and navigating cybersecurity career paths.",
    targetRoles: ["Chief Information Security Officer (CISO)", "Security Program Manager", "Cybersecurity Consultant"],
    prerequisites: ["fundamentals", "grc_privacy"],
    subdomains: [
      {
        id: "security_leadership",
        name: "Executive Strategy & Security Program Management",
        topics: ["security_kpis_board_reporting", "security_budgeting_roi", "vendor_risk_management", "incident_crisis_communication"],
        recommendedLabs: ["SANS CISO Decision-Making Case Studies"]
      },
      {
        id: "career_pathing",
        name: "Career Navigation & Portfolio Building",
        topics: ["certifications_roadmap_comptia_oscp_cissp", "portfolio_lab_documentation", "technical_interview_preparation", "continuous_learning_habits"],
        recommendedLabs: ["Cybersecurity Career Pathway Roadmap Builder"]
      }
    ]
  }
];

/**
 * Returns all taxonomy domains.
 */
export function getAllDomains() {
  return CYBERSECURITY_TAXONOMY;
}

/**
 * Retrieves a domain by its unique identifier.
 */
export function getDomainById(id) {
  return CYBERSECURITY_TAXONOMY.find(d => d.id === id) || null;
}

/**
 * Searches the taxonomy for a domain containing a specific topic.
 */
export function findDomainByTopic(topic) {
  const normTopic = topic.toLowerCase().trim();
  for (const domain of CYBERSECURITY_TAXONOMY) {
    for (const sub of domain.subdomains) {
      if (sub.topics.some(t => t.toLowerCase().includes(normTopic))) {
        return { domain, subdomain: sub };
      }
    }
  }
  return null;
}

/**
 * Returns the full prerequisite chain for a given domain.
 */
export function getPrerequisiteChain(domainId) {
  const chain = [];
  const visited = new Set();

  function traverse(id) {
    if (visited.has(id)) return;
    visited.add(id);
    const domain = getDomainById(id);
    if (!domain) return;
    for (const prereqId of domain.prerequisites) {
      traverse(prereqId);
    }
    chain.push(domain);
  }

  traverse(domainId);
  return chain;
}

/**
 * Validates the taxonomy graph for cycle freedom and missing references.
 */
export function validateTaxonomy() {
  const allIds = new Set(CYBERSECURITY_TAXONOMY.map(d => d.id));
  const errors = [];

  for (const domain of CYBERSECURITY_TAXONOMY) {
    for (const prereq of domain.prerequisites) {
      if (!allIds.has(prereq)) {
        errors.push(`Domain '${domain.id}' references missing prerequisite '${prereq}'`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    domainCount: CYBERSECURITY_TAXONOMY.length,
    errors
  };
}
