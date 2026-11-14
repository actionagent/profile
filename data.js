// Single source of truth for site content. Edit here; no other file needs changes.
// Every claim below traces to the resume. Do not add metrics that are not verified.
export const PROFILE = {
  name: "Sabarinathan Balakrishnan",
  short: "Sabari",
  handle: "sabari",
  host: "arm",
  role: "AI & Data Platform Engineering Lead",
  tagline: "I build AI agents that leave the demo and survive production.",
  intro:
    "About 9.5 years in enterprise software engineering: SharePoint and platform engineering, Azure and enterprise integrations, then data engineering on Databricks. Today I build production AI agents (RAG, MCP, agent memory) at Arm and lead a team of 7 engineers.",
  location: "Bengaluru, India",
  email: "sabarinathan150@gmail.com",
  linkedin: "https://www.linkedin.com/in/sabarinathan-balakrishnan/",
  github: "",                            // e.g. "https://github.com/<you>"; empty hides the link
  resume: "assets/Sabarinathan_Balakrishnan_Resume.pdf", // empty hides every resume link
  rotating: ["RAG pipelines", "MCP servers", "agent memory", "evaluation gates", "OAuth for agents", "Vector Search", "a team of 7"],
  summary:
    "I work as a player-coach. I sit with business teams from discovery and prototype through production and post-launch support, and I build the agents hands-on while leading the engineers around me. My base is enterprise engineering, so identity, governance, evaluation and observability are part of the build, not an afterthought.",
  facts: [
    ["Now", "AI engineering at Arm, leading 7 engineers"],
    ["Core", "AI agents · RAG · MCP · Databricks · Azure"],
    ["Based", "Bengaluru, India"],
  ],
  metrics: [
    { value: 9.5, decimals: 1, suffix: "y", label: "enterprise software engineering" },
    { value: 7, suffix: "", label: "engineers led today (teams of up to 9)" },
    { value: 7, suffix: "", label: "agent and platform builds shown below" },
    { value: 750, suffix: "K", prefix: "$", label: "of projects delivered by my team in 6 months" },
  ],
};

// Verified outcomes only. `figure` is a real number from the resume, or a short qualitative label.
export const IMPACT = [
  { cat: "Team leadership", figure: "7", unit: "engineers", src: "Arm · Genpact · Infosys",
    text: "Lead a team of 7 at Arm as a player-coach. Before that, led 9 engineers at Genpact and 5 at Infosys." },
  { cat: "Engineering delivery", figure: "$750K", unit: "delivered", src: "Genpact",
    text: "USD 750K of projects delivered by a 9-member engineering team between June and December 2022." },
  { cat: "Production reliability", figure: "0", unit: "SLA breaches", src: "Infosys",
    text: "Led a 5-member team running a Genesys product service with zero SLA breaches." },
  { cat: "AI engineering", figure: "Eval gates", unit: "", src: "Arm",
    text: "Set business-owned acceptance thresholds for agents (accuracy, escalation misses, timeliness), backed by golden-dataset evaluation, regression tests and canary releases." },
  { cat: "Platform modernization", figure: "Legacy → ADF", unit: "", src: "Arm",
    text: "Moved legacy workflows to Azure Data Factory, modernised legacy SharePoint authentication, and ran the deprecation-impact and security-exception review ahead of platform retirement." },
  { cat: "Enterprise-scale architecture", figure: "Agent identity", unit: "", src: "Arm",
    text: "Designed the identity model for chained agents: OAuth on-behalf-of across MuleSoft, Databricks and Microsoft Graph, with service principals in place of personal tokens." },
];

// The team-wide evaluation standard, referenced by individual projects.
const EVAL_STANDARD = "Team standard I set for production agents: business-owned acceptance thresholds (accuracy, escalation misses, timeliness), golden-dataset evaluation, regression tests and canary releases.";

// Node kinds: source | step | store | human | guard.  col/row place the node on the diagram grid.
const n = (id, label, sub, col, row, kind = "step", note = "") => ({ id, label, sub, col, row, kind, note });

export const PROJECTS = [
  {
    id: "social-intel",
    name: "Social-media intelligence agent",
    client: "Marketing",
    status: "production",
    summary: "Ingests social mentions, classifies them, routes the risky ones and drafts responses for the marketing team.",
    problem: "The marketing team needed social-media mentions ingested, classified and risk-routed, with the risky ones escalated and a response drafted for review.",
    flow: {
      nodes: [
        n("src", "Talkwalker API", "social mentions", 0, 0, "source", "Mentions are pulled in through the Talkwalker API."),
        n("bronze", "Bronze", "Delta layer", 1, 0, "store", "First landing layer of the medallion pipeline."),
        n("silver", "Silver", "Delta layer", 2, 0, "store", "Middle layer of the medallion pipeline."),
        n("gold", "Gold", "Delta layer", 3, 0, "store", "The layer the agent logic reads from."),
        n("classify", "Classification", "agent logic", 4, 0, "step", "Each item is classified before routing."),
        n("route", "Risk routing", "agent logic", 5, 0, "step", "Routing logic decides what needs escalation."),
        n("out", "Flags + drafts", "escalation, responses", 5, 1, "step", "Risky items get an escalation flag and a draft response."),
        n("review", "Marketing sign-off", "human review", 4, 1, "human", "The marketing team signs off on output quality."),
      ],
      edges: [["src", "bronze"], ["bronze", "silver"], ["silver", "gold"], ["gold", "classify"], ["classify", "route"], ["route", "out"], ["out", "review"]],
    },
    dataFlow: [
      "Talkwalker API ingestion lands mentions in the Bronze Delta layer.",
      "Data moves through the Silver and Gold layers.",
      "Classification and risk-routing logic run over each item.",
      "Risky items get escalation flags and draft responses.",
      "Marketing reviews the output and signs off on quality.",
    ],
    stack: ["Databricks", "Delta Lake", "Medallion pipeline", "Talkwalker API", "Python"],
    decisions: [
      "Medallion layers (Bronze, Silver, Gold) sit between the source API and the agent logic.",
      "Classification and risk routing are built as explicit logic, with escalation flags as a first-class output.",
      "The agent drafts; the marketing team owns the sign-off on output quality.",
    ],
    readiness: "Built and led with the marketing team, who sign off on output quality.",
    reliability: EVAL_STANDARD,
    impact: "No published metric. The verified outcome is business sign-off: marketing accepts the agent's output quality.",
  },
  {
    id: "memory",
    name: "Persistent memory for a leadership agent",
    client: "Leadership team",
    status: "production",
    summary: "A memory layer that lets a leadership-team agent keep context across conversations within a token budget.",
    problem: "A leadership-team agent needed memory that persists across conversations, fits inside a token budget, and keeps working when a component fails.",
    flow: {
      nodes: [
        n("agent", "Leadership agent", "writes memories", 0, 0, "source", "The agent this memory layer serves."),
        n("delta", "Delta memory tables", "versioned schema", 1, 0, "store", "Memories are stored in Delta tables with a versioned schema."),
        n("embed", "Embeddings", "versioned model", 2, 0, "step", "The embedding model is versioned alongside the schema."),
        n("index", "Vector Search", "indexes", 3, 0, "store", "Vector Search indexes make memories retrievable."),
        n("rank", "Ranking", "recency × confidence", 4, 0, "step", "Retrieved memories are ranked by recency and confidence."),
        n("budget", "Token budget", "caps context", 4, 1, "guard", "A token budget limits how much memory goes into the prompt."),
        n("ctx", "Agent context", "back to the agent", 3, 1, "step", "The selected memories are returned to the agent."),
        n("backup", "Backup + fallback", "graceful degradation", 1, 1, "guard", "Backup and graceful degradation are designed in."),
      ],
      edges: [["agent", "delta"], ["delta", "embed"], ["embed", "index"], ["index", "rank"], ["rank", "budget"], ["budget", "ctx"], ["delta", "backup"]],
    },
    dataFlow: [
      "The agent writes memories to Delta tables with a versioned schema.",
      "Memories are embedded with a versioned embedding model.",
      "Vector Search indexes make them retrievable.",
      "Results are ranked by recency and confidence.",
      "A token budget caps what is returned to the agent's context.",
    ],
    stack: ["Databricks", "Delta Lake", "Vector Search", "Embeddings", "Python"],
    decisions: [
      "Rank memories by recency and confidence.",
      "Enforce token budgets on what is injected into context.",
      "Version both the schema and the embedding model.",
      "Design in backup and graceful degradation.",
    ],
    readiness: "Designed and built for a leadership-team agent, with versioning, backup and graceful degradation in place.",
    reliability: "Backup and graceful degradation are part of the design, and schema and embedding-model versions are tracked. " + EVAL_STANDARD,
    impact: "No published metric.",
  },
  {
    id: "servicenow-mcp",
    name: "ServiceNow MCP server",
    client: "IT operations",
    status: "prototype",
    summary: "A prototype that lets people create, read and update ServiceNow incidents from chat, next to knowledge retrieval.",
    problem: "Can incident handling and knowledge lookup happen in one conversation? This prototype tests chat-driven incident create, read and update alongside knowledge retrieval.",
    flow: {
      nodes: [
        n("user", "User chat", "request", 0, 0, "human", "A person asks in plain language."),
        n("app", "Agent app", "Databricks Apps", 1, 0, "step", "The prototype runs as a Databricks App."),
        n("mcp", "ServiceNow MCP server", "tools", 2, 0, "step", "ServiceNow actions are exposed to the agent through an MCP server."),
        n("snow", "ServiceNow incidents", "create · read · update", 3, 0, "store", "Incidents can be created, read and updated from chat."),
        n("vs", "Vector Search", "knowledge retrieval", 2, 1, "store", "Knowledge retrieval runs alongside the incident tools."),
      ],
      edges: [["user", "app"], ["app", "mcp"], ["mcp", "snow"], ["app", "vs"]],
    },
    dataFlow: [
      "A person asks a question or requests an incident action in chat.",
      "The agent app on Databricks Apps handles the request.",
      "Incident actions go through the ServiceNow MCP server (create, read, update).",
      "Knowledge questions go to Vector Search.",
    ],
    stack: ["MCP", "Databricks Apps", "Vector Search", "ServiceNow"],
    decisions: [
      "Expose ServiceNow incident actions through an MCP server.",
      "Host the prototype on Databricks Apps.",
      "Combine tool actions and knowledge retrieval in one conversation.",
    ],
    readiness: "Prototype. It is not presented as a production system.",
    reliability: "Prototype stage. Production agents on the team go through golden-dataset evaluation, regression tests and canary releases before release.",
    impact: "Prototype: no production impact claimed.",
  },
  {
    id: "knowledge-search",
    name: "Multi-source knowledge search",
    client: "Enterprise",
    status: "pattern",
    summary: "Search across SharePoint, ServiceNow and the newsroom, packaged as reusable RAG patterns on Databricks.",
    problem: "Enterprise knowledge sits in several systems: SharePoint, ServiceNow and the newsroom. Teams needed search across them, built in a way other teams could reuse.",
    flow: {
      nodes: [
        n("sp", "SharePoint", "source", 0, 0, "source", "One of the knowledge sources."),
        n("snow", "ServiceNow", "source", 0, 1, "source", "One of the knowledge sources."),
        n("wp", "Newsroom", "WordPress REST API", 0, 2, "source", "Newsroom ingestion pages through the full history via the WordPress REST API."),
        n("ingest", "Ingestion", "reusable pattern", 1, 1, "step", "Ingestion is built as a reusable pattern."),
        n("index", "Retrieval index", "embeddings", 2, 1, "store", "Content is embedded and indexed for retrieval."),
        n("rag", "RAG pattern", "on Databricks", 3, 1, "step", "Retrieval and answering are packaged as a reusable RAG pattern."),
        n("ans", "Search answers", "for teams", 4, 1, "human", "Teams search across sources in one place."),
      ],
      edges: [["sp", "ingest"], ["snow", "ingest"], ["wp", "ingest"], ["ingest", "index"], ["index", "rag"], ["rag", "ans"]],
    },
    dataFlow: [
      "Content is ingested from SharePoint and ServiceNow.",
      "The newsroom is ingested through the WordPress REST API with full historical pagination.",
      "Content is embedded and indexed for retrieval.",
      "A reusable RAG pattern on Databricks answers searches across the sources.",
    ],
    stack: ["Databricks", "RAG", "Embeddings", "SharePoint", "ServiceNow", "WordPress REST API"],
    decisions: [
      "Package search as reusable RAG and ingestion patterns instead of a one-off build.",
      "Ingest the newsroom's full history through WordPress REST pagination.",
    ],
    readiness: "Delivered as reusable RAG patterns on Databricks.",
    reliability: EVAL_STANDARD,
    impact: "No published metric. The outcome is a pattern that is reusable by design.",
  },
  {
    id: "knowledge-inspector",
    name: "Knowledge Inspector",
    client: "Content owners",
    status: "built",
    summary: "A Databricks agent that scans enterprise knowledge sources for stale, duplicate or conflicting content and flags fixes to owners.",
    problem: "Enterprise knowledge sources collect stale, duplicate and conflicting content. Content owners need to be told what to fix.",
    flow: {
      nodes: [
        n("src", "Knowledge sources", "enterprise content", 0, 0, "source", "The enterprise knowledge sources being scanned."),
        n("auth", "Per-user authentication", "source permissions", 1, 0, "guard", "Per-user authentication means results respect each source's permissions."),
        n("agent", "Inspector agent", "Databricks", 2, 0, "step", "The agent scans the content it is allowed to see."),
        n("detect", "Findings", "stale · duplicate · conflicting", 3, 0, "step", "It looks for stale, duplicate or conflicting content."),
        n("flag", "Flagged fixes", "suggested actions", 4, 0, "step", "Each finding is turned into a flagged fix."),
        n("owner", "Content owners", "human review", 4, 1, "human", "Owners receive the flags and decide what to change."),
      ],
      edges: [["src", "auth"], ["auth", "agent"], ["agent", "detect"], ["detect", "flag"], ["flag", "owner"]],
    },
    dataFlow: [
      "The agent reads enterprise knowledge sources under the user's own identity.",
      "It scans for stale, duplicate or conflicting content.",
      "Findings are turned into flagged fixes.",
      "Flags go to the content owners, who make the change.",
    ],
    stack: ["Databricks", "AI agent", "Per-user authentication"],
    decisions: [
      "Authenticate per user, so results respect source permissions.",
      "Flag fixes to content owners instead of changing content directly.",
    ],
    readiness: "Built as a Databricks agent with per-user authentication.",
    reliability: EVAL_STANDARD,
    impact: "No published metric.",
  },
  {
    id: "interview-scheduler",
    name: "Interview-scheduling app",
    client: "Hiring teams",
    status: "built",
    summary: "A Databricks App that reads candidate details and panel availability, then books interview calls after a human approves.",
    problem: "Scheduling interviews took manual coordination between candidate details and interview-panel calendars.",
    flow: {
      nodes: [
        n("uc", "Unity Catalog tables", "candidate details", 0, 0, "store", "Candidate details are read from Unity Catalog tables."),
        n("graph", "Microsoft Graph", "panel availability", 0, 1, "source", "Panel availability is read through Microsoft Graph."),
        n("app", "Scheduling app", "Databricks Apps", 1, 0, "step", "The app brings candidate details and panel availability together."),
        n("approve", "Human approval", "human in the loop", 2, 0, "human", "A person approves before anything is booked."),
        n("book", "Calls booked", "interviews scheduled", 3, 0, "step", "Approved interviews are booked as calls."),
      ],
      edges: [["uc", "app"], ["graph", "app"], ["app", "approve"], ["approve", "book"]],
    },
    dataFlow: [
      "Candidate details are read from Unity Catalog tables.",
      "Panel availability is read through Microsoft Graph.",
      "The app prepares the booking for approval.",
      "A person approves, and the call is booked.",
    ],
    stack: ["Databricks Apps", "Unity Catalog", "Microsoft Graph"],
    decisions: [
      "Keep a human in the loop: nothing is booked without approval.",
      "Read candidate data from governed Unity Catalog tables.",
      "Read panel availability through Microsoft Graph.",
    ],
    readiness: "Built on Databricks Apps with a human approval step before booking.",
    reliability: "Human-in-the-loop approval gates every booking.",
    impact: "Verified: removes manual coordination from interview scheduling.",
  },
  {
    id: "identity",
    name: "Identity model for chained agents",
    client: "Platform",
    status: "production",
    summary: "How agents authenticate across MuleSoft, Databricks and Microsoft Graph while acting as the real user.",
    problem: "Chained agents call several systems in a row: MuleSoft, Databricks and Microsoft Graph. Each hop has to carry the real user's identity and permissions.",
    flow: {
      nodes: [
        n("user", "User", "Entra ID", 0, 0, "human", "The person the agent is acting for."),
        n("obo", "OAuth on-behalf-of", "token exchange", 1, 0, "guard", "On-behalf-of flow carries the user's identity to the next system."),
        n("mule", "MuleSoft", "API layer", 2, 0, "step", "One of the systems in the chain."),
        n("dbx", "Databricks agents", "chained", 3, 0, "step", "Agents run on Databricks and call onward."),
        n("graph", "Microsoft Graph", "downstream", 4, 0, "step", "One of the systems in the chain."),
        n("cache", "Token cache", "cuts auth latency", 1, 1, "store", "Token caching was added to cut authentication latency."),
        n("scim", "SCIM sync", "users", 2, 1, "source", "Users are synced through SCIM."),
        n("uc", "Unity Catalog", "authorization", 3, 1, "guard", "SCIM-synced users are authorized through Unity Catalog."),
      ],
      edges: [["user", "obo"], ["obo", "mule"], ["mule", "dbx"], ["dbx", "graph"], ["obo", "cache"], ["scim", "uc"], ["uc", "dbx"]],
    },
    dataFlow: [
      "A user signs in and the agent acts on their behalf through OAuth on-behalf-of.",
      "The user's identity is carried across MuleSoft, Databricks and Microsoft Graph.",
      "Users are synced through SCIM and authorized through Unity Catalog.",
      "Tokens are cached to cut authentication latency.",
    ],
    stack: ["OAuth on-behalf-of", "OAuth M2M", "Entra ID", "SCIM", "Unity Catalog", "MuleSoft", "Microsoft Graph", "Service principals"],
    decisions: [
      "Use OAuth on-behalf-of across every hop of the chain.",
      "Use service principals and OAuth M2M in place of personal tokens.",
      "Separate workspaces for read-only and read/write agents.",
      "Govern admin access and secret scopes.",
      "Cache tokens to cut authentication latency.",
    ],
    readiness: "Defines how agents are authenticated, separated and governed on the platform.",
    reliability: "Workspace separation for read-only versus read/write agents, admin and secret-scope governance, and no personal tokens.",
    impact: "Token caching was added to cut authentication latency. No published figure.",
  },
];

// Nodes of the interactive "production loop" diagram.
export const LOOP = [
  { id: "discover", label: "Discover", body: "Sit with the business team. Agree what 'good' means before writing code: business-owned acceptance criteria." },
  { id: "prototype", label: "Prototype", body: "Rapid prototype on Databricks Apps so stakeholders react to something real." },
  { id: "evaluate", label: "Evaluate", body: "Golden datasets, regression tests and canary releases. Thresholds on accuracy, escalation misses and timeliness." },
  { id: "ship", label: "Ship", body: "Production hand-off with workspace separation, service principals, secret governance and per-user identity." },
  { id: "observe", label: "Observe", body: "Observability KPIs: efficiency, confidence, latency, adoption and tool performance, reported to leadership on Databricks dashboards." },
  { id: "pattern", label: "Patternise", body: "Turn the one-off into reusable RAG and ingestion patterns and engineering standards other teams can adopt." },
];

// Oldest first: the career section reads as a climb. Chronology is exact.
export const CAREER = [
  { years: "2015 – 2018", org: "Accenture", role: "Application Development Analyst", phase: "Enterprise software engineering", scope: "Hands-on engineer",
    points: ["Built responsive SharePoint applications.", "Migrated content, permissions and workflows with ShareGate."] },
  { years: "2018 – 2021", org: "IBM", role: "Senior Systems Engineer", phase: "Platform engineering", scope: "Platform design + forecasting",
    points: ["Designed SharePoint Online sites and Power Automate workflows, including OAuth token generation for external databases.", "Forecast incident volume from ServiceNow history, letting the client merge support groups and cut fixed-group spend.", "Manager's Choice Award 2019."] },
  { years: "2021 – 2022", org: "Infosys", role: "Technology Lead", phase: "Technical leadership", scope: "Team of 5",
    points: ["Led a 5-member team delivering a Genesys product service with zero SLA breaches.", "Built a Random Forest model predicting P1/P2 tickets and a time-series forecaster for change-request volume."] },
  { years: "2022 – 2023", org: "Genpact", role: "Manager", phase: "People leadership", scope: "Team of 9 · USD 750K",
    points: ["Led a 9-member engineering team delivering USD 750K of projects in June–December 2022.", "Led SPFx/React collaboration platforms for Pfizer business units, with Azure Functions, Blob storage and Adobe Analytics reporting."] },
  { years: "2024 – now", org: "Arm", role: "AI DevOps Engineer · player-coach", phase: "Data and AI engineering leadership", scope: "Team of 7 · agents, data, identity",
    points: ["Builds enterprise AI agents and data products on Databricks while leading 7 engineers.", "Defined the agent observability framework, evaluation thresholds and the identity model for chained agents.", "Moved legacy workflows to Azure Data Factory ahead of platform retirement."] },
];

export const SKILLS = {
  "AI engineering": ["RAG", "Agentic workflows", "MCP and A2A", "LangChain", "Embeddings", "Vector Search", "Agent memory", "Model Serving", "Golden-dataset evaluation", "Canary releases"],
  "Data & platform": ["Databricks", "Delta Lake", "Unity Catalog", "Databricks Apps", "Jobs API", "Medallion pipelines", "REST/API ingestion", "Azure Data Factory", "Python"],
  "Enterprise engineering": ["SharePoint Online", "SPFx / React", "Power Automate", "Azure Functions", "MuleSoft", "Microsoft Graph", "OAuth OBO / M2M", "SCIM · Entra ID", "OpenTelemetry"],
  "Leadership": ["Hiring and technical assessments", "Coaching", "Engineering and PR standards", "Executive reporting", "Stakeholder discovery", "Forward-deployed delivery"],
};

export const EDUCATION = [
  "Reinforcement Learning, Indian Institute of Science, Bengaluru (2019–2020): built a self-learning game agent using TD learning and minimax",
  "MBA, Marketing, IGNOU School of Management Studies (2019–2022)",
  "B.E., Electronics & Communication Engineering, Kumaraguru College of Technology (2015): CGPA 9.1, Mahatma Gandhi Meritorious Student Award",
];

// Corpus for the in-browser retrieval demo. Plain text; scored with TF-IDF cosine.
export function buildCorpus() {
  const docs = [{ src: "profile/summary", text: `${PROFILE.role}. ${PROFILE.intro} ${PROFILE.summary}` }];
  IMPACT.forEach(i => docs.push({ src: `impact/${i.cat.toLowerCase().replace(/\W+/g, "-")}`, text: `${i.cat}: ${i.text}` }));
  PROJECTS.forEach(p => {
    docs.push({ src: `projects/${p.id}`, text: `${p.name}. ${p.problem} ${p.dataFlow.join(" ")} Stack: ${p.stack.join(", ")}` });
    docs.push({ src: `projects/${p.id}/decisions`, text: `${p.name}: ${p.decisions.join(" ")} ${p.readiness} ${p.reliability}` });
  });
  LOOP.forEach(l => docs.push({ src: `approach/${l.id}`, text: `${l.label}: ${l.body}` }));
  CAREER.forEach(c => docs.push({ src: `experience/${c.org.toLowerCase()}`, text: `${c.role} at ${c.org} (${c.years}), ${c.phase}. ${c.points.join(" ")}` }));
  Object.entries(SKILLS).forEach(([k, v]) => docs.push({ src: `skills/${k.toLowerCase().replace(/\W+/g, "-")}`, text: `${k}: ${v.join(", ")}` }));
  EDUCATION.forEach((e, i) => docs.push({ src: `education/${i}`, text: e }));
  return docs;
}
