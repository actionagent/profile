import { PROFILE, IMPACT, PROJECTS, LOOP, CAREER, SKILLS, EDUCATION, buildCorpus } from "./data.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const h = (tag, attrs = {}, html = "") => { const e = document.createElement(tag); Object.assign(e, attrs); if (html) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const NS = "http://www.w3.org/2000/svg";
const svgEl = (t, a = {}) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
const log = (...a) => console.info("[site]", ...a);

const CFG = {
  bootLineMs: 110,       // delay between boot-log lines
  countUpMs: 1100,
  typeMs: 70, eraseMs: 35, holdMs: 1600,
  loopOrbitMs: 6000,
  edgeGap: 7,            // px between a diagram node and its arrow
  ragTopK: 3,
  ragMinScore: 0.02,
};

/* ---------- 3D scene (optional, loaded after first paint, never blocks content) ---------- */
let scene = { setProgress() {}, pulse() {} };
function loadScene() {
  import("./scene.js").then(m => { scene = m.initScene($("#scene")); onScroll(); }).catch(e => log("scene disabled:", e.message));
}

/* ---------- boot sequence (short, once per session, click to skip) ---------- */
function boot() {
  const lines = [
    `> indexing ${buildCorpus().length} documents ........ <b>ok</b>`,
    `> evaluation gates .............. <b>passed</b>`,
    `> agent "${PROFILE.handle}" ready.`,
  ];
  const el = $("#boot-log"), box = $("#boot");
  let seen = false; try { seen = !!sessionStorage.getItem("booted"); } catch {}
  if (REDUCED || seen) { box.classList.add("done"); return; }
  let i = 0;
  const step = () => {
    if (i < lines.length) { el.innerHTML += lines[i++] + "\n"; setTimeout(step, CFG.bootLineMs); }
    else setTimeout(() => { box.classList.add("done"); try { sessionStorage.setItem("booted", "1"); } catch {} }, 250);
  };
  step();
  box.addEventListener("click", () => box.classList.add("done"));
}

/* ---------- hero + about ---------- */
function renderHero() {
  $("#hero-name").textContent = PROFILE.name;
  $("#hero-role").textContent = PROFILE.role;
  $("#hero-tag").textContent = PROFILE.tagline;
  $("#hero-intro").textContent = PROFILE.intro;
  $("#summary").textContent = PROFILE.summary;
  $("#loc").textContent = PROFILE.location;
  $("#facts").innerHTML = PROFILE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");

  // every resume link/button on the page
  $$("[data-resume]").forEach(a => {
    if (!PROFILE.resume) return a.remove();
    a.href = PROFILE.resume; a.setAttribute("download", PROFILE.resume.split("/").pop());
  });

  const tick = () => $("#clock").textContent = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
  tick(); setInterval(tick, 30000);

  const el = $("#typer"); let w = 0, c = 0, del = false;
  const type = () => {
    const word = PROFILE.rotating[w % PROFILE.rotating.length];
    el.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(type, CFG.holdMs); }
    if (del && c === 0) { del = false; w++; }
    c += del ? -1 : 1; setTimeout(type, del ? CFG.eraseMs : CFG.typeMs);
  };
  REDUCED ? (el.textContent = PROFILE.rotating[0]) : type();
}

function renderMetrics() {
  const box = $("#metrics");
  PROFILE.metrics.forEach(m => {
    const final = `${m.prefix || ""}${m.value}${m.suffix}`;
    box.append(h("div", { className: "metric" }, `<b data-to="${m.value}" data-dec="${m.decimals || 0}" data-pre="${m.prefix || ""}" data-suf="${m.suffix}" aria-label="${esc(final)}">${esc(final)}</b><span>${esc(m.label)}</span>`));
  });
}
function countUp(el) {
  const to = +el.dataset.to, dec = +el.dataset.dec, pre = el.dataset.pre, suf = el.dataset.suf, t0 = performance.now();
  if (REDUCED) return;
  const f = now => { const p = Math.min(1, (now - t0) / CFG.countUpMs), v = to * (1 - Math.pow(1 - p, 3)); el.textContent = pre + v.toFixed(dec) + suf; if (p < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}

/* ---------- selected impact ---------- */
function renderImpact() {
  $("#impact-grid").innerHTML = IMPACT.map(i => {
    const numeric = /\d/.test(i.figure);
    return `<article class="impact-card reveal">
      <p class="impact-cat mono">${esc(i.cat)}</p>
      <p class="impact-fig ${numeric ? "" : "qual"}">${esc(i.figure)}${i.unit ? ` <span>${esc(i.unit)}</span>` : ""}</p>
      <p class="impact-text">${esc(i.text)}</p>
      <p class="impact-src mono">${esc(i.src)}</p>
    </article>`;
  }).join("");
}

/* ---------- projects: expandable cards with interactive architecture diagrams ---------- */
const KIND_LABEL = { source: "Source", step: "Processing", store: "Data store", human: "Human", guard: "Control" };

function projectCard(p, i) {
  const idx = String(i + 1).padStart(2, "0");
  const kinds = [...new Set(p.flow.nodes.map(n => n.kind))];
  const card = h("article", { className: "agent reveal", id: `project-${p.id}` }, `
    <h3 class="agent-h">
      <button class="agent-head" type="button" aria-expanded="false" aria-controls="panel-${p.id}" id="head-${p.id}">
        <span class="agent-idx" aria-hidden="true">${idx}</span>
        <span class="agent-title">${esc(p.name)}<span class="agent-sum">${esc(p.summary)}</span></span>
        <span class="badge ${p.status}">${esc(p.status)}</span>
        <span class="chev" aria-hidden="true">+</span>
      </button>
    </h3>
    <div class="agent-body" id="panel-${p.id}" role="region" aria-labelledby="head-${p.id}" inert><div class="agent-inner">
      <div class="pj-block"><h4>Problem</h4><p>${esc(p.problem)}</p></div>
      <div class="pj-block">
        <h4>Solution architecture</h4>
        <div class="flow" data-flow="${p.id}" role="group" aria-label="Architecture diagram for ${esc(p.name)}. Select a box for detail."></div>
        <p class="flow-note" aria-live="polite"></p>
        <ul class="legend mono" aria-label="Diagram legend">${kinds.map(k => `<li class="${k}"><i></i>${KIND_LABEL[k]}</li>`).join("")}</ul>
      </div>
      <div class="pj-grid two">
        <div class="pj-block"><h4>Data flow</h4><ol>${p.dataFlow.map(s => `<li>${esc(s)}</li>`).join("")}</ol></div>
        <div class="pj-block"><h4>Key engineering decisions</h4><ul>${p.decisions.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>
      </div>
      <div class="pj-grid three">
        <div class="pj-block"><h4>Production readiness</h4><p>${esc(p.readiness)}</p></div>
        <div class="pj-block"><h4>Reliability and evaluation</h4><p>${esc(p.reliability)}</p></div>
        <div class="pj-block"><h4>Business impact</h4><p>${esc(p.impact)}</p></div>
      </div>
      <div class="pj-block"><h4>Technology stack</h4><div class="tags">${p.stack.map(t => `<span>${esc(t)}</span>`).join("")}<span>For: ${esc(p.client)}</span></div></div>
    </div></div>`);
  $(".agent-head", card).addEventListener("click", () => toggleProject(card));
  buildFlow($(".flow", card), $(".flow-note", card), p);
  return card;
}

function toggleProject(card, force, { pulse = true } = {}) {
  const head = $(".agent-head", card), panel = $(".agent-body", card);
  const open = force ?? head.getAttribute("aria-expanded") !== "true";
  head.setAttribute("aria-expanded", String(open));
  card.classList.toggle("open", open);
  panel.inert = !open;
  $(".chev", card).textContent = open ? "–" : "+";
  if (open) { if (pulse) scene.pulse(); requestAnimationFrame(() => drawEdges($(".flow", card))); }
}

function renderProjects() {
  const list = $("#project-list");
  PROJECTS.forEach((p, i) => list.append(projectCard(p, i)));
  const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
  $("#project-count").textContent = words[PROJECTS.length] || PROJECTS.length;
  toggleProject(list.firstElementChild, true, { pulse: false }); // first one open so the architecture is visible without a click
}

// Nodes are real buttons on a CSS grid (wraps text, keyboard-accessible); edges are an SVG layer measured from the DOM.
function buildFlow(box, note, p) {
  const svg = svgEl("svg", { class: "flow-edges", "aria-hidden": "true" });
  box.append(svg);
  const select = id => {
    const node = p.flow.nodes.find(n => n.id === id);
    $$(".fnode", box).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
    $$("path[data-a]", svg).forEach(e => e.classList.toggle("hot", e.dataset.a === id || e.dataset.b === id));
    note.innerHTML = `<b>${esc(node.label)}</b><span class="mono">${esc(KIND_LABEL[node.kind])}</span>${esc(node.note || node.sub)}`;
  };
  p.flow.nodes.forEach(nd => {
    const b = h("button", { className: `fnode ${nd.kind}`, type: "button" }, `<b>${esc(nd.label)}</b><span>${esc(nd.sub)}</span>`);
    b.dataset.id = nd.id; b.style.setProperty("--c", nd.col + 1); b.style.setProperty("--r", nd.row + 1);
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => select(nd.id));
    box.append(b);
  });
  box._edges = p.flow.edges; box._select = select; box._first = p.flow.nodes[0].id;
  if ("ResizeObserver" in window) new ResizeObserver(() => drawEdges(box)).observe(box);
}

function drawEdges(box) {
  const svg = $(".flow-edges", box), W = box.clientWidth, H = box.clientHeight;
  if (!W || !H) return;
  const origin = box.getBoundingClientRect();
  const rect = id => { const r = $(`.fnode[data-id="${id}"]`, box).getBoundingClientRect(); return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height, cx: r.left - origin.left + r.width / 2, cy: r.top - origin.top + r.height / 2 }; };
  // point where the centre-to-centre line leaves rectangle r, pushed out by the gap
  const exit = (r, tx, ty) => { const dx = tx - r.cx, dy = ty - r.cy; const s = Math.min(dx ? (r.w / 2 + CFG.edgeGap) / Math.abs(dx) : Infinity, dy ? (r.h / 2 + CFG.edgeGap) / Math.abs(dy) : Infinity); return [r.cx + dx * s, r.cy + dy * s]; };
  const mid = `arrow-${box.dataset.flow}`;
  const hot = new Set($$("path.hot", svg).map(e => e.dataset.a + ">" + e.dataset.b));
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = `<defs><marker id="${mid}" viewBox="0 0 8 8" refX="7" refY="4" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0 8 4 0 8z"/></marker></defs>`;
  box._edges.forEach(([a, b]) => {
    const ra = rect(a), rb = rect(b), [x1, y1] = exit(ra, rb.cx, rb.cy), [x2, y2] = exit(rb, ra.cx, ra.cy);
    const e = svgEl("path", { d: `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`, "marker-end": `url(#${mid})`, "data-a": a, "data-b": b });
    if (hot.has(a + ">" + b)) e.classList.add("hot");
    svg.append(e);
  });
  if (!$(".fnode[aria-pressed='true']", box)) box._select(box._first);
}

/* ---------- approach: production loop ---------- */
function renderLoop() {
  const svg = $("#loop-svg"), cx = 200, cy = 200, r = 150;
  svg.append(svgEl("circle", { cx, cy, r, class: "ring" }));
  const orbit = svgEl("circle", { r: 4, class: "orbit" }); svg.append(orbit);
  const center = svgEl("text", { x: cx, y: cy + 4, class: "center" }); center.textContent = "∞ Iterate"; svg.append(center);
  let current = 0, userPicked = false;
  const nodes = LOOP.map((l, i) => {
    const a = (i / LOOP.length) * Math.PI * 2 - Math.PI / 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    const g = svgEl("g", { class: "node", tabindex: 0, role: "button", "aria-label": `Step ${i + 1}: ${l.label}` });
    g.append(svgEl("circle", { cx: x, cy: y, r: 36 }));
    const t = svgEl("text", { x, y: y + 4 }); t.textContent = l.label; g.append(t);
    const pick = () => select(i);
    g.addEventListener("click", pick); g.addEventListener("focus", pick);
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    svg.append(g); return g;
  });
  function select(i, auto = false) {
    if (!auto) userPicked = true;
    current = i; nodes.forEach((n, j) => { n.classList.toggle("active", j === i); n.setAttribute("aria-pressed", String(j === i)); });
    const l = LOOP[i];
    $("#loop-detail").innerHTML = `<span class="mono">Step 0${i + 1} / 0${LOOP.length}</span><h3>${esc(l.label)}</h3><p>${esc(l.body)}</p>`;
  }
  select(0, true);
  orbit.setAttribute("cx", cx); orbit.setAttribute("cy", cy - r);
  if (REDUCED) return;
  const t0 = performance.now();
  $("#loop-detail").setAttribute("aria-live", "off"); // auto-advance must not spam screen readers
  const anim = now => {
    const a = ((now - t0) / CFG.loopOrbitMs) * Math.PI * 2 - Math.PI / 2;
    orbit.setAttribute("cx", cx + Math.cos(a) * r); orbit.setAttribute("cy", cy + Math.sin(a) * r);
    if (!userPicked) { const frac = (((a + Math.PI / 2) / (Math.PI * 2)) % 1 + 1) % 1; const idx = Math.floor(frac * LOOP.length) % LOOP.length; if (idx !== current) select(idx, true); }
    else $("#loop-detail").setAttribute("aria-live", "polite");
    requestAnimationFrame(anim);
  };
  requestAnimationFrame(anim);
}

/* ---------- experience: career ladder, skills, education ---------- */
function renderExperience() {
  const last = CAREER.length - 1;
  $("#ladder").innerHTML = CAREER.map((c, i) => `<li class="rung reveal${i === last ? " now" : ""}" style="--i:${i};--n:${last}">
      <p class="rung-phase mono"><span aria-hidden="true">0${i + 1}</span> ${esc(c.phase)}</p>
      <h3>${esc(c.org)}</h3>
      <p class="rung-role">${esc(c.role)}</p>
      <p class="rung-meta mono">${esc(c.years)}${i === last ? " · current" : ""}</p>
      <p class="rung-scope mono">${esc(c.scope)}</p>
      <ul>${c.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
    </li>`).join("");
  $("#skills").innerHTML = Object.entries(SKILLS).map(([k, v]) => `<div class="skill-col"><h4>${esc(k)}</h4><ul>${v.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>`).join("");
  $("#edu").innerHTML = EDUCATION.map(e => `<li>${esc(e)}</li>`).join("");
}

function contactLinks() {
  return [
    { label: "email", href: `mailto:${PROFILE.email}`, text: PROFILE.email },
    { label: "linkedin", href: PROFILE.linkedin, text: "LinkedIn" },
    { label: "resume", href: PROFILE.resume, text: "Download resume", download: true },
    { label: "github", href: PROFILE.github, text: "GitHub" },
  ].filter(l => l.href);
}
function renderContact() {
  $("#contact-links").innerHTML = contactLinks().map((l, i) => {
    const ext = l.href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
    const dl = l.download ? ` download="${esc(l.href.split("/").pop())}"` : "";
    return `<a class="btn${i === 0 ? " primary" : ""}" href="${esc(l.href)}"${ext}${dl}>${esc(l.text)} ${l.download ? "↓" : "↗"}</a>`;
  }).join("");
}

/* ---------- client-side retrieval (TF-IDF + cosine) ---------- */
const STOP = new Set("a an the and or of to in on for with at by from is are was were be been i you your my me we our it its this that how what do does did can could would should have has had about into as than then so".split(" "));
const SYN = { eval: ["evaluate", "evaluation", "golden", "regression", "canary"], evaluate: ["evaluation", "golden", "regression"], test: ["regression", "golden", "canary"],
  auth: ["oauth", "identity", "token"], security: ["oauth", "identity", "secret", "governance"], lead: ["led", "team", "coaching", "leadership"], manage: ["led", "team", "leadership"],
  memory: ["memory", "recency", "vector"], rag: ["retrieval", "search", "vector"], search: ["retrieval", "vector"], ml: ["random", "forest", "forecast", "learning"],
  observability: ["latency", "adoption", "confidence", "kpis"], monitor: ["observability", "latency", "kpis"], hire: ["hiring", "assessments", "interview"], azure: ["azure", "adf", "functions"] };
const stem = w => w.replace(/(ings?|ed|es|s)$/, "").replace(/(.)\1$/, "$1");
const tokens = s => s.toLowerCase().match(/[a-z0-9]+/g)?.filter(w => !STOP.has(w) && w.length > 1).map(stem) || [];

function buildIndex() {
  const docs = buildCorpus();
  const df = new Map();
  const tfs = docs.map(d => { const tf = new Map(); tokens(d.text).forEach(t => tf.set(t, (tf.get(t) || 0) + 1)); tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1)); return tf; });
  const idf = t => Math.log(1 + docs.length / (1 + (df.get(t) || 0)));
  const vecs = tfs.map(tf => { const v = new Map(); let norm = 0; tf.forEach((c, t) => { const w = (1 + Math.log(c)) * idf(t); v.set(t, w); norm += w * w; }); return { v, norm: Math.sqrt(norm) }; });
  return {
    size: docs.length,
    search(q, k = CFG.ragTopK) {
      const raw = q.toLowerCase().match(/[a-z0-9]+/g) || [];
      const expanded = [...raw, ...raw.flatMap(w => SYN[w] || SYN[stem(w)] || [])].join(" ");
      const qt = tokens(expanded); const qv = new Map(); qt.forEach(t => qv.set(t, (qv.get(t) || 0) + idf(t)));
      const qn = Math.sqrt([...qv.values()].reduce((s, w) => s + w * w, 0)) || 1;
      return vecs.map((d, i) => { let dot = 0; qv.forEach((w, t) => { if (d.v.has(t)) dot += w * d.v.get(t); }); return { doc: docs[i], score: dot / (qn * (d.norm || 1)), terms: new Set(qt) }; })
        .filter(r => r.score > CFG.ragMinScore).sort((a, b) => b.score - a.score).slice(0, k);
    },
  };
}
const INDEX = buildIndex();
const highlight = (text, terms) => esc(text).replace(/[A-Za-z0-9]+/g, w => terms.has(stem(w.toLowerCase())) ? `<mark>${w}</mark>` : w);

function initRag() {
  const out = $("#rag-out"), input = $("#rag-q");
  const samples = ["How do you evaluate agents?", "Agent memory design", "OAuth for chained agents", "Team leadership", "MCP experience", "Azure and SharePoint work"];
  $("#rag-chips").innerHTML = samples.map(s => `<button type="button">${esc(s)}</button>`).join("");
  $("#rag-chips").addEventListener("click", e => { if (e.target.tagName === "BUTTON") { input.value = e.target.textContent; run(); } });
  $("#rag-form").addEventListener("submit", e => { e.preventDefault(); run(); });
  function run() {
    const q = input.value.trim(); if (!q) return;
    const t0 = performance.now(); const hits = INDEX.search(q); const ms = (performance.now() - t0).toFixed(2);
    scene.pulse(2);
    out.innerHTML = hits.length
      ? hits.map((r, i) => `<div class="hit" style="animation-delay:${i * 120}ms"><span class="score" title="cosine similarity">${r.score.toFixed(3)}</span><div><span class="src">${esc(r.doc.src)}</span><p>${highlight(r.doc.text, r.terms)}</p></div></div>`).join("")
        + `<div class="rag-meta">Top ${hits.length} of ${INDEX.size} passages · ${ms} ms · TF-IDF cosine · retrieval only</div>`
      : `<div class="hit"><span class="score">0.000</span><div><p>No grounded match. A good agent says "I don't know" instead of guessing. Try <i>evaluation</i>, <i>memory</i>, <i>MCP</i> or <i>leadership</i>, or <a href="mailto:${esc(PROFILE.email)}">email me</a>.</p></div></div>`;
  }
}

/* ---------- terminal: optional keyboard route through the same content ---------- */
const SECTION_ALIASES = { whoami: "about", agents: "projects", project: "projects", method: "approach", loop: "approach", career: "experience", trajectory: "experience", home: "top" };
function initTerminal() {
  const term = $("#term"), body = $("#term-body"), input = $("#term-input"), opener = $("#term-open");
  const prompt = `${PROFILE.handle}@${PROFILE.host}:~$`;
  $("#term-prompt").textContent = prompt; $("#term-title").textContent = `${PROFILE.handle}@${PROFILE.host}`;
  const hist = []; let hi = 0, lastFocus = null;
  const print = (html, cls = "out") => { body.append(h("div", { className: cls }, html)); body.scrollTop = body.scrollHeight; };
  const go = name => {
    const id = SECTION_ALIASES[name] || name; const el = document.getElementById(id);
    if (!el) return `no such section: ${esc(name)}. try: about, impact, projects, approach, experience, ask, contact`;
    el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" }); return `→ ${id}`;
  };
  const CMDS = {
    help: () => "about        who I am\nimpact       verified outcomes\nprojects     list the builds\nopen &lt;n&gt;     open project n and show its architecture\nexperience   career history\nskills       skills by area\nask &lt;q&gt;      search this site, e.g. ask evaluation\ncontact      email and links\nresume       download the resume\ngoto &lt;name&gt;  jump to a section\nclear · exit\n\ntip: ↑/↓ for history, Tab to autocomplete, Esc to close",
    about: () => `${esc(PROFILE.name)}\n${esc(PROFILE.role)} · ${esc(PROFILE.location)}\n\n${esc(PROFILE.intro)}`,
    whoami: () => CMDS.about(),
    impact: () => IMPACT.map(i => `${i.cat.padEnd(30)} ${i.text}`).map(esc).join("\n"),
    projects: () => PROJECTS.map((p, i) => `${i + 1}  [${p.status.padEnd(10)}] ${esc(p.name)}`).join("\n") + "\n\nopen &lt;n&gt; to see one",
    agents: () => CMDS.projects(),
    open: n => {
      const p = PROJECTS[parseInt(n, 10) - 1]; if (!p) return `usage: open &lt;1-${PROJECTS.length}&gt;`;
      const card = document.getElementById(`project-${p.id}`); toggleProject(card, true);
      card.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
      return `${esc(p.name)}\n${esc(p.problem)}\n\nflow: ${p.dataFlow.map(esc).join(" → ")}`;
    },
    skills: () => Object.entries(SKILLS).map(([k, v]) => `${k.padEnd(24)} ${v.join(", ")}`).map(esc).join("\n"),
    experience: () => [...CAREER].reverse().map(t => `${t.years.padEnd(13)} ${t.org.padEnd(10)} ${t.role}`).map(esc).join("\n"),
    ls: () => "about/  impact/  projects/  approach/  experience/  ask/  contact/",
    contact: () => contactLinks().map(l => `${l.label.padEnd(9)} <a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.text)}</a>`).join("\n"),
    resume: () => PROFILE.resume ? `<a href="${esc(PROFILE.resume)}" download>Download resume (PDF)</a>` : "resume not published",
    ask: q => { if (!q) return "usage: ask &lt;question&gt;"; const r = INDEX.search(q, 2); return r.length ? r.map(x => `(${x.score.toFixed(3)}) ${esc(x.doc.src)}\n  ${esc(x.doc.text)}`).join("\n") : "no grounded answer. try: ask evaluation"; },
    goto: s => go(s || "top"),
    cd: s => go((s || "top").replace(/\/$/, "")),
    sudo: () => "nice try. access here is granted through OAuth on-behalf-of, not sudo.",
    clear: () => { body.innerHTML = ""; return null; },
    exit: () => { close(); return null; },
  };
  function exec(line) {
    print(`<span class="muted">${esc(prompt)}</span> ${esc(line)}`, "cmd");
    const [cmd, ...rest] = line.trim().split(/\s+/); if (!cmd) return;
    const fn = CMDS[cmd.toLowerCase()];
    try { const res = fn ? fn(rest.join(" ")) : `command not found: ${esc(cmd)}. type 'help'`; if (res) print(res, fn ? "out" : "err"); }
    catch (e) { print(`error: ${esc(e.message)}`, "err"); }
  }
  function openT() {
    lastFocus = document.activeElement; term.hidden = false; opener.setAttribute("aria-expanded", "true"); input.focus();
    if (!body.childElementCount) print("A keyboard way to browse this site. Type 'help' to see the commands.");
  }
  function close() { term.hidden = true; opener.setAttribute("aria-expanded", "false"); lastFocus?.focus?.(); }
  const toggle = () => term.hidden ? openT() : close();
  opener.addEventListener("click", toggle);
  $("#term-open-2").addEventListener("click", toggle);
  $("#term-close").addEventListener("click", close);
  $("#term-form").addEventListener("submit", e => { e.preventDefault(); const v = input.value; if (v.trim()) hist.push(v); hi = hist.length; input.value = ""; exec(v); });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") { hi = Math.max(0, hi - 1); input.value = hist[hi] || ""; e.preventDefault(); }
    else if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ""; e.preventDefault(); }
    else if (e.key === "Tab" && input.value) { e.preventDefault(); const m = Object.keys(CMDS).filter(k => k.startsWith(input.value)); if (m.length === 1) input.value = m[0] + " "; else if (m.length) print(m.join("  ")); }
  });
  term.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  addEventListener("keydown", e => {
    if (e.key === "`" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); toggle(); }
  });
}

/* ---------- navigation: mobile menu ---------- */
function initMenu() {
  const btn = $("#menu-btn"), nav = $("#site-nav");
  const set = open => { nav.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open)); btn.textContent = open ? "Close" : "Menu"; };
  btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", e => { if (e.target.closest("a")) set(false); });
  addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) { set(false); btn.focus(); } });
}

/* ---------- scroll: reveal, nav state, scene progress ---------- */
let sections = [], navLinks = [], ticking = false;
function onScroll() {
  ticking = false;
  const mid = innerHeight * 0.5; let p = 0;
  sections.forEach((s, i) => { const r = s.getBoundingClientRect(); if (r.top <= mid) p = i + Math.min(1, Math.max(0, (mid - r.top) / r.height)) - 0.5; });
  p = Math.max(0, Math.min(sections.length - 1, p));
  // each section names the particle shape it wants (data-scene); blend between neighbours
  const i0 = Math.floor(p), i1 = Math.min(sections.length - 1, i0 + 1), f = p - i0;
  const s0 = +sections[i0].dataset.scene, s1 = +sections[i1].dataset.scene;
  scene.setProgress(s0 + (s1 - s0) * f);
  document.documentElement.style.setProperty("--sky", (p / (sections.length - 1)).toFixed(4));
  const cur = sections[Math.round(p)]?.id;
  navLinks.forEach(a => { const on = a.getAttribute("href") === "#" + cur; a.classList.toggle("active", on); on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"); });
}
function initScroll() {
  $$(".h2, .body, .metrics, .facts, .split > svg, .rag, .skills, .display.small, .loop-detail").forEach(e => { if (!e.closest(".hero")) e.classList.add("reveal"); });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    if (e.target.classList.contains("metrics")) $$("b[data-to]", e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.08 });
  $$(".reveal").forEach(e => io.observe(e));

  sections = $$("section[data-scene]");
  navLinks = $$(".nav nav a[href^='#']").filter(a => a.getAttribute("href").length > 1);
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
}

/* ---------- console note for engineers reading the source ---------- */
function consoleHello() {
  console.log("%c" + PROFILE.name, "color:#ffb36b;font:600 18px monospace");
  console.log("Reading the source? Good instinct. Press ` on the page for a terminal, or email " + PROFILE.email);
}

function main() {
  try {
    boot(); renderHero(); renderMetrics(); renderImpact(); renderProjects(); renderLoop(); renderExperience(); renderContact();
    initRag(); initTerminal(); initMenu(); initScroll(); consoleHello();
    ("requestIdleCallback" in window) ? requestIdleCallback(loadScene, { timeout: 1200 }) : setTimeout(loadScene, 200);
  } catch (e) { console.error("[site] init failed", e); $("#boot")?.classList.add("done"); }
}
main();
