// Single source of truth for the /resume page, the About page and the generated PDF
// (npm run resume:pdf). Edit here, then regenerate the PDF so both stay in sync.
// Deliberately excludes the phone number: visitors reach out via the contact form.

export const resume = {
  name: "Mridul Gulati",
  title: "AI Technical Lead",
  location: "Delhi NCR, India",
  links: [
    { label: "linkedin.com/in/mridul-gulati", href: "https://www.linkedin.com/in/mridul-gulati" },
    { label: "github.com/Mridul-Gulati", href: "https://github.com/Mridul-Gulati" },
  ],
  summary:
    "AI Technical Lead specialising in multi-agent orchestration, agent runtime security and LLM evaluation. I design end-to-end agent pipelines with LangGraph and Google ADK, and have scaled them to 30,000+ daily runs while cutting latency by over 50%. I ship agents with guardrails, token-cost observability and automated quality benchmarks in place before release.",

  experience: [
    {
      company: "HCLTech",
      location: "Noida, India",
      role: "AI Technical Lead",
      period: "Mar 2026 – Present",
      points: [
        "Built an intelligent SRE agent integrating ServiceNow and Datadog (via MCP) for automated six-step root cause analysis and remediation planning, taking it from requirements to client demo in under three weeks.",
        "Cut the SRE agent's data-gathering phase by 55% with tool caching; hardened input/output guardrails with callbacks and Model Armor.",
        "Implemented pre-production agent evaluation and simulation using custom quality metrics and simulated user personas.",
        "Added per-agent token cost observability, optimising expensive turns and reporting through BigQuery.",
        "Designed a multi-agent candidate screening system: CV and JD parsing, match scoring, question generation and a first-round AI interview agent on Google Meet.",
        "Deployed 10+ enterprise-grade agentic solutions with guardrails and observability in place before release.",
        "Worked with presales to turn new agent capabilities into client-facing solutions; interviewed mid-to-senior GenAI engineering candidates.",
      ],
      award: "Trailblazer Award, Q2 2026: highest quarterly recognition from the CTO and Ecosystems team, across 500+ employees.",
    },
    {
      company: "Turing",
      location: "Remote",
      role: "Data Scientist",
      period: "Sep 2024 – Jan 2026",
      points: [
        "Built an agent that reviews LLM training notebooks and scores hallucination, accuracy, instruction following and language quality, returning a score, a done/rework decision and specific feedback.",
        "Grounded the agent with RAG on client-approved reference notebooks to reduce hallucination; scaled it to 30,000+ runs per day.",
        "Adopted voluntarily by data trainers as a pre-submission check, cutting average review time from ~60 to 30–40 minutes, with 98% satisfaction across 1,000 reviewers.",
        "Re-architected the system from LangGraph to Google ADK after ADK's release.",
        "Promoted to Pod Lead within six months; led 5–6 AI engineers, owned code review and onboarding.",
        "Worked with client stakeholders to define the evaluation criteria the agent enforced.",
      ],
    },
  ],

  education: [
    {
      school: "Guru Gobind Singh Indraprastha University",
      location: "New Delhi",
      degree: "B.Tech in Computer Science and Engineering, minor in AI/ML",
      detail: "CGPA 8.99",
      period: "2021 – 2025",
    },
  ],

  skills: [
    { group: "Agents and orchestration", items: ["LangGraph", "Google ADK", "LangChain", "MCP", "A2A", "A2UI"] },
    { group: "Evaluation and safety", items: ["LLM-as-judge evals", "Simulated personas", "Guardrails", "Model Armor", "LangSmith"] },
    { group: "Models and platforms", items: ["Gemini", "Vertex AI", "Agent Runtime", "Gemini Enterprise", "Memory Bank", "Document AI"] },
    { group: "Engineering", items: ["Python", "SQL", "FastAPI", "Docker", "Cloud Run", "BigQuery", "Firestore", "Streamlit", "Playwright"] },
    { group: "Integrations", items: ["ServiceNow", "Datadog"] },
  ],

  certifications: [
    "Google Cloud Professional Machine Learning Engineer",
    "Google Professional Agentic AI Architect",
    "Gemini Enterprise Forward Deployed Engineer program",
    "Google Cloud Partner Specialist (CPS)",
    "18 Google Cloud skill badges",
  ],
};

// Headline numbers used on the home and about pages.
export const highlights = [
  { value: "30,000+", label: "agent runs per day at production scale" },
  { value: "10+", label: "enterprise agentic systems deployed" },
  { value: "55%", label: "faster data gathering via tool caching" },
  { value: "98%", label: "satisfaction across 1,000 human reviewers" },
];
