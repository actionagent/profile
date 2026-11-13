// Single source of truth for site content. Edit here; no other file needs changes.
export const PROFILE = {
  name: "Sabarinathan Balakrishnan",
  short: "Sabari",
  handle: "sabari",
  host: "arm",
  role: "AI Engineering Lead",
  tagline: "I build AI agents that leave the demo and survive production.",
  location: "Bengaluru, India",
  email: "sabarinathan150@gmail.com",
  linkedin: "",                          // TODO: "https://www.linkedin.com/in/<you>"; empty hides the link
  github: "",                            // TODO: "https://github.com/<you>"; empty hides the link
  resume: "",                            // e.g. "assets/resume.pdf" (put the file in assets/); empty hides the link
  rotating: ["RAG pipelines", "MCP servers", "agent memory", "eval gates", "OAuth for agents", "vector search", "teams of 7"],
  summary:
    "Hands-on AI engineering lead with 11 years in enterprise delivery. At Arm I build and lead production AI agents on Databricks: RAG, vector search, model serving, MCP and agent memory. I work directly with business teams from discovery through production and post-launch support, then turn one-off builds into reusable patterns other teams adopt.",
  metrics: [
    { value: 11, suffix: "y", label: "enterprise delivery" },
    { value: 7, suffix: "", label: "engineers led today (up to 9)" },
    { value: 5, suffix: "+", label: "agents shipped to business teams" },
    { value: 750, suffix: "K", prefix: "$", label: "project value delivered in 6 months" },
  ],
};

// Each agent renders as a card with an expandable "trace" (pipeline spans).
export const AGENTS = [
  {
    id: "social-intel",
    name: "Social-media intelligence agent",
    client: "Marketing",
    status: "production",
    summary: "Talkwalker ingestion into Bronze/Silver/Gold Delta layers, classification and risk routing, escalation flags and draft responses. Marketing signs off on output quality.",
    trace: [
      ["ingest", "Talkwalker API → Bronze", 18],
      ["refine", "Silver / Gold Delta", 22],
      ["classify", "topic + sentiment + risk", 26],
      ["route", "escalation flags", 12],
      ["draft", "LLM response drafts", 22],
    ],
    tags: ["Delta Lake", "Classification", "Risk routing"],
  },
  {
    id: "memory",
    name: "Persistent memory for a leadership agent",
    client: "Leadership team",
    status: "production",
    summary: "Delta schemas and Vector Search indexes with recency- and confidence-based ranking, token budgets, schema and embedding-model versioning, backup and graceful degradation.",
    trace: [
      ["write", "Delta memory schema", 16],
      ["embed", "versioned embeddings", 20],
      ["index", "Vector Search", 18],
      ["rank", "recency × confidence", 24],
      ["budget", "token budget + fallback", 22],
    ],
    tags: ["Vector Search", "Agent memory", "Versioning"],
  },
  {
    id: "servicenow-mcp",
    name: "ServiceNow MCP server",
    client: "IT operations",
    status: "prototype",
    summary: "MCP server plus vector-search prototype on Databricks Apps: chat-driven incident create/read/update alongside knowledge retrieval.",
    trace: [
      ["chat", "user intent", 14],
      ["mcp", "tool call → ServiceNow", 30],
      ["retrieve", "KB vector search", 28],
      ["respond", "grounded answer", 28],
    ],
    tags: ["MCP", "Databricks Apps", "Tool use"],
  },
  {
    id: "knowledge",
    name: "Multi-source knowledge search",
    client: "Enterprise",
    status: "pattern",
    summary: "Search over SharePoint and ServiceNow, packaged as reusable RAG patterns on Databricks. Plus newsroom (WordPress REST, full historical pagination) and legal-document ingestion.",
    trace: [
      ["crawl", "SharePoint + ServiceNow + WP", 24],
      ["chunk", "normalise + chunk", 18],
      ["embed", "embeddings", 18],
      ["retrieve", "hybrid retrieval", 20],
      ["answer", "cited answer", 20],
    ],
    tags: ["RAG", "Ingestion", "Reusable pattern"],
  },
  {
    id: "identity",
    name: "Identity model for chained agents",
    client: "Platform",
    status: "production",
    summary: "OAuth on-behalf-of across MuleSoft, Databricks and Microsoft Graph; SCIM-synced users authorised via Unity Catalog; token caching to cut auth latency; M2M service principals instead of personal tokens.",
    trace: [
      ["user", "Entra ID sign-in", 16],
      ["obo", "OAuth on-behalf-of", 26],
      ["mulesoft", "API layer", 18],
      ["uc", "Unity Catalog authz", 20],
      ["cache", "token cache", 20],
    ],
    tags: ["OAuth OBO", "SCIM", "Unity Catalog"],
  },
];

// Nodes of the interactive "production loop" diagram.
export const LOOP = [
  { id: "discover", label: "Discover", body: "Sit with the business team. Agree what 'good' means before writing code: business-owned acceptance criteria." },
  { id: "prototype", label: "Prototype", body: "Rapid prototype on Databricks Apps so stakeholders react to something real within days." },
  { id: "evaluate", label: "Evaluate", body: "Golden datasets, regression tests and canary releases. Thresholds on accuracy, escalation misses and timeliness." },
  { id: "ship", label: "Ship", body: "Production hand-off with workspace separation, service principals, secret governance and least-privilege identity." },
  { id: "observe", label: "Observe", body: "Observability KPIs: quality, latency, confidence, adoption and tool performance, reported to leadership on Databricks dashboards." },
  { id: "pattern", label: "Patternise", body: "Turn the one-off into a reusable RAG / ingestion pattern, PR standards and a support model other teams adopt." },
];

export const TIMELINE = [
  { years: "2024 — now", role: "AI DevOps Engineer · player-coach", org: "Arm", note: "Production AI agents on Databricks. Leading 7 engineers." },
  { years: "2022 — 2023", role: "Manager", org: "Genpact", note: "Led 9 engineers, USD 750K delivered Jun–Dec 2022. Rockstar Award 2022." },
  { years: "2021 — 2022", role: "Technology Lead", org: "Infosys", note: "Random Forest P1/P2 ticket predictor; time-series forecaster for change volume. Zero SLA breaches." },
  { years: "2018 — 2021", role: "Senior Systems Engineer", org: "IBM", note: "Incident-volume forecasting that let the client merge support groups. Manager's Choice Award 2019." },
  { years: "2015 — 2018", role: "Application Development Analyst", org: "Accenture", note: "SharePoint applications and migrations." },
];

export const SKILLS = {
  "AI engineering": ["RAG", "Agentic workflows", "MCP", "A2A", "LangChain", "Embeddings", "Vector Search", "Agent memory", "Model Serving", "Golden-set evals", "Canary releases"],
  "Platform & security": ["Databricks", "Delta Lake", "Unity Catalog", "Databricks Apps", "OAuth OBO / M2M", "SCIM", "Entra ID", "OpenTelemetry"],
  "Data engineering": ["Medallion pipelines", "REST ingestion", "Azure Data Factory", "Python", "SQL", "Streamlit"],
  "Leadership": ["Hiring & assessments", "Coaching", "Engineering standards", "Exec reporting", "Forward-deployed delivery"],
};

export const EDUCATION = [
  "Reinforcement Learning, IISc Bengaluru (2019–20): self-learning game agent with TD learning + minimax",
  "MBA Marketing, IGNOU (2019–22)",
  "B.E. ECE, Kumaraguru College of Technology (2015): CGPA 9.1, Mahatma Gandhi Meritorious Student Award",
];

// Corpus for the in-browser retrieval demo. Plain text; scored with TF-IDF cosine.
export function buildCorpus() {
  const docs = [{ src: "profile/summary", text: PROFILE.summary }];
  AGENTS.forEach(a => docs.push({ src: `agents/${a.id}`, text: `${a.name}. ${a.summary} ${a.tags.join(", ")}` }));
  LOOP.forEach(l => docs.push({ src: `method/${l.id}`, text: `${l.label}: ${l.body}` }));
  TIMELINE.forEach(t => docs.push({ src: `career/${t.org.toLowerCase()}`, text: `${t.role} at ${t.org} (${t.years}). ${t.note}` }));
  Object.entries(SKILLS).forEach(([k, v]) => docs.push({ src: `skills/${k.toLowerCase().replace(/\W+/g, "-")}`, text: `${k}: ${v.join(", ")}` }));
  EDUCATION.forEach((e, i) => docs.push({ src: `education/${i}`, text: e }));
  return docs;
}
