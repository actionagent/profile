import { PROFILE, AGENTS, LOOP, TIMELINE, SKILLS, EDUCATION, buildCorpus } from "./data.js";

const $ = (s, el = document) => el.querySelector(s);
const h = (tag, attrs = {}, html = "") => { const e = document.createElement(tag); Object.assign(e, attrs); if (html) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const log = (...a) => console.info("[site]", ...a);

/* ---------- 3D scene (optional, never blocks content) ---------- */
let scene = { setProgress() {}, pulse() {} };
import("./scene.js").then(m => { scene = m.initScene($("#scene")); }).catch(e => log("scene disabled:", e.message));

/* ---------- boot sequence ---------- */
function boot() {
  const lines = [
    `> loading weights ......................... <b>ok</b>`,
    `> mounting unity_catalog.career ........... <b>ok</b>`,
    `> indexing ${buildCorpus().length} documents into vector store ... <b>ok</b>`,
    `> oauth on-behalf-of(visitor) ............. <b>granted</b>`,
    `> agent "${PROFILE.handle}" ready.`,
  ];
  const el = $("#boot-log"), box = $("#boot");
  if (REDUCED || sessionStorage.getItem("booted")) { box.classList.add("done"); return; }
  let i = 0;
  const step = () => {
    if (i < lines.length) { el.innerHTML += lines[i++] + "\n"; setTimeout(step, 180 + Math.random() * 160); }
    else setTimeout(() => { box.classList.add("done"); try { sessionStorage.setItem("booted", "1"); } catch {} }, 350);
  };
  step();
  box.addEventListener("click", () => box.classList.add("done"));
}

/* ---------- static content ---------- */
function renderHero() {
  $("#hero-name").textContent = PROFILE.name;
  $("#hero-role").textContent = PROFILE.role;
  $("#hero-tag").textContent = PROFILE.tagline;
  $("#loc").textContent = PROFILE.location;
  $("#summary").textContent = PROFILE.summary;
  const tick = () => $("#clock").textContent = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  tick(); setInterval(tick, 1000);

  // typewriter
  const el = $("#typer"); let w = 0, c = 0, del = false;
  const type = () => {
    const word = PROFILE.rotating[w % PROFILE.rotating.length];
    el.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(type, 1600); }
    if (del && c === 0) { del = false; w++; }
    c += del ? -1 : 1; setTimeout(type, del ? 35 : 70);
  };
  REDUCED ? (el.textContent = PROFILE.rotating.join(" · ")) : type();
}

function renderMetrics() {
  const box = $("#metrics");
  PROFILE.metrics.forEach(m => box.append(h("div", { className: "metric" }, `<b data-to="${m.value}" data-pre="${m.prefix || ""}" data-suf="${m.suffix}">${m.prefix || ""}0${m.suffix}</b><span>${esc(m.label)}</span>`)));
}
function countUp(el) {
  const to = +el.dataset.to, pre = el.dataset.pre, suf = el.dataset.suf, t0 = performance.now(), dur = 1200;
  const f = now => { const p = Math.min(1, (now - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = pre + v + suf; if (p < 1) requestAnimationFrame(f); };
  REDUCED ? (el.textContent = pre + to + suf) : requestAnimationFrame(f);
}

function renderAgents() {
  const list = $("#agent-list");
  AGENTS.forEach((a, i) => {
    let offset = 0;
    const spans = a.trace.map(([k, label, w]) => { const s = `<div class="span-row"><span class="k">${esc(k)}</span><div class="span-bar"><i style="left:${offset}%" data-w="${w}">${esc(label)}</i></div></div>`; offset += w; return s; }).join("");
    const card = h("button", { className: "agent reveal", type: "button" }, `
      <div class="agent-head"><span class="agent-idx">0${i + 1}</span><h3>${esc(a.name)}</h3><span class="badge ${a.status}">${a.status}</span></div>
      <div class="agent-body"><div>
        <p>${esc(a.summary)}</p>
        <div class="trace" aria-label="Pipeline trace">${spans}</div>
        <div class="tags">${a.tags.map(t => `<span>${esc(t)}</span>`).join("")}<span>for: ${esc(a.client)}</span></div>
      </div></div>`);
    card.setAttribute("aria-expanded", "false");
    card.addEventListener("click", () => toggleAgent(card));
    list.append(card);
  });
}
function toggleAgent(card) {
  const open = card.getAttribute("aria-expanded") !== "true";
  document.querySelectorAll(".agent[aria-expanded='true']").forEach(c => { c.setAttribute("aria-expanded", "false"); c.querySelectorAll(".span-bar i").forEach(b => b.style.width = 0); });
  if (!open) return;
  card.setAttribute("aria-expanded", "true");
  scene.pulse();
  // replay spans sequentially, like a trace viewer
  card.querySelectorAll(".span-bar i").forEach((b, i) => setTimeout(() => b.style.width = b.dataset.w + "%", REDUCED ? 0 : 150 + i * 220));
}

function renderLoop() {
  const svg = $("#loop-svg"), NS = "http://www.w3.org/2000/svg", cx = 200, cy = 200, r = 150;
  const mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  svg.append(mk("circle", { cx, cy, r, class: "ring" }));
  const orbit = mk("circle", { r: 4, class: "orbit" }); svg.append(orbit);
  const center = mk("text", { x: cx, y: cy + 4, class: "center" }); center.textContent = "∞ Iterate"; svg.append(center);
  const nodes = LOOP.map((l, i) => {
    const a = (i / LOOP.length) * Math.PI * 2 - Math.PI / 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    const g = mk("g", { class: "node", tabindex: 0, role: "button", "aria-label": l.label });
    g.append(mk("circle", { cx: x, cy: y, r: 34 }));
    const t = mk("text", { x, y: y + 4 }); t.textContent = l.label; g.append(t);
    const pick = () => select(i); g.addEventListener("click", pick); g.addEventListener("focus", pick);
    svg.append(g); return g;
  });
  let current = 0, userPicked = false;
  function select(i, auto = false) {
    if (!auto) userPicked = true;
    current = i; nodes.forEach((n, j) => n.classList.toggle("active", j === i));
    const l = LOOP[i];
    $("#loop-detail").innerHTML = `<span class="mono">step 0${i + 1} / 0${LOOP.length}</span><h4>${esc(l.label)}</h4><p>${esc(l.body)}</p>`;
  }
  select(0, true);
  // orbiting token + auto-advance until the visitor takes over
  let t0 = performance.now();
  const anim = now => {
    const a = ((now - t0) / 6000) * Math.PI * 2 - Math.PI / 2;
    orbit.setAttribute("cx", cx + Math.cos(a) * r); orbit.setAttribute("cy", cy + Math.sin(a) * r);
    if (!userPicked) { const frac = (((a + Math.PI / 2) / (Math.PI * 2)) % 1 + 1) % 1; const idx = Math.floor(frac * LOOP.length) % LOOP.length; if (idx !== current) select(idx, true); }
    requestAnimationFrame(anim);
  };
  if (!REDUCED) requestAnimationFrame(anim);
}

function renderTrajectory() {
  $("#timeline").innerHTML = TIMELINE.map(t => `<li class="reveal"><span class="y">${esc(t.years)}</span><h4>${esc(t.org)} <span>· ${esc(t.role)}</span></h4><p>${esc(t.note)}</p></li>`).join("");
  $("#skills").innerHTML = Object.entries(SKILLS).map(([k, v]) => `<div class="skill-col"><h5>${esc(k)}</h5><ul>${v.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>`).join("");
  $("#edu").innerHTML = EDUCATION.map(e => `<li>${esc(e)}</li>`).join("");
}

function contactLinks() {
  return [
    { label: "email", href: `mailto:${PROFILE.email}`, text: PROFILE.email },
    { label: "linkedin", href: PROFILE.linkedin, text: "LinkedIn" },
    { label: "github", href: PROFILE.github, text: "GitHub" },
    { label: "resume", href: PROFILE.resume, text: "Résumé (PDF)" },
  ].filter(l => l.href);
}
function renderContact() {
  $("#contact-links").innerHTML = contactLinks().map((l, i) => `<a class="btn${i === 0 ? " primary" : ""}" href="${esc(l.href)}" ${l.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${esc(l.text)} ↗</a>`).join("");
}

/* ---------- client-side retrieval (TF-IDF + cosine) ---------- */
const STOP = new Set("a an the and or of to in on for with at by from is are was were be been i you your my me we our it its this that how what do does did can could would should have has had about into as than then so".split(" "));
const SYN = { eval: ["evaluate", "evaluation", "golden", "regression", "canary"], evaluate: ["evaluation", "golden", "regression"], test: ["regression", "golden", "canary"],
  auth: ["oauth", "identity", "token"], security: ["oauth", "identity", "secret", "governance"], lead: ["led", "team", "coaching", "leadership"], manage: ["led", "team", "leadership"],
  memory: ["memory", "recency", "vector"], rag: ["retrieval", "search", "vector"], search: ["retrieval", "vector"], ml: ["random", "forest", "forecast", "learning"],
  observability: ["latency", "adoption", "confidence", "kpis"], monitor: ["observability", "latency", "kpis"], hire: ["hiring", "assessments"] };
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
    search(q, k = 3) {
      const raw = q.toLowerCase().match(/[a-z0-9]+/g) || [];
      const expanded = [...raw, ...raw.flatMap(w => SYN[w] || SYN[stem(w)] || [])].join(" ");
      const qt = tokens(expanded); const qv = new Map(); qt.forEach(t => qv.set(t, (qv.get(t) || 0) + idf(t)));
      const qn = Math.sqrt([...qv.values()].reduce((s, w) => s + w * w, 0)) || 1;
      return vecs.map((d, i) => { let dot = 0; qv.forEach((w, t) => { if (d.v.has(t)) dot += w * d.v.get(t); }); return { doc: docs[i], score: dot / (qn * (d.norm || 1)), terms: new Set(qt) }; })
        .filter(r => r.score > 0.02).sort((a, b) => b.score - a.score).slice(0, k);
    },
  };
}
const INDEX = buildIndex();
const highlight = (text, terms) => esc(text).replace(/[A-Za-z0-9]+/g, w => terms.has(stem(w.toLowerCase())) ? `<mark>${w}</mark>` : w);

function initRag() {
  const out = $("#rag-out"), input = $("#rag-q");
  const samples = ["How do you evaluate agents?", "Agent memory design", "OAuth for chained agents", "Team leadership", "MCP experience", "Machine learning before LLMs"];
  $("#rag-chips").innerHTML = samples.map(s => `<button type="button">${esc(s)}</button>`).join("");
  $("#rag-chips").addEventListener("click", e => { if (e.target.tagName === "BUTTON") { input.value = e.target.textContent; run(); } });
  $("#rag-form").addEventListener("submit", e => { e.preventDefault(); run(); });
  function run() {
    const q = input.value.trim(); if (!q) return;
    const t0 = performance.now(); const hits = INDEX.search(q); const ms = (performance.now() - t0).toFixed(2);
    scene.pulse(2);
    out.innerHTML = hits.length
      ? hits.map((r, i) => `<div class="hit" style="animation-delay:${i * 120}ms"><span class="score">${r.score.toFixed(3)}</span><div><span class="src">${esc(r.doc.src)}</span><p>${highlight(r.doc.text, r.terms)}</p></div></div>`).join("")
        + `<div class="rag-meta">top-${hits.length} of ${INDEX.size} chunks · ${ms} ms · tf-idf cosine · retrieval only, grounded by construction</div>`
      : `<div class="hit"><span class="score">0.000</span><div><p>No grounded match. A good agent says "I don't know" instead of guessing. Try <i>evaluation</i>, <i>memory</i>, <i>MCP</i> or <i>leadership</i>, or just <a href="mailto:${esc(PROFILE.email)}">email me</a>.</p></div></div>`;
  }
}

/* ---------- terminal ---------- */
function initTerminal() {
  const term = $("#term"), body = $("#term-body"), input = $("#term-input");
  const prompt = `${PROFILE.handle}@${PROFILE.host}:~$`;
  $("#term-prompt").textContent = prompt; $("#term-title").textContent = `${PROFILE.handle}@${PROFILE.host} — zsh`;
  const hist = []; let hi = 0;
  const print = (html, cls = "out") => { body.append(h("div", { className: cls }, html)); body.scrollTop = body.scrollHeight; };
  const go = id => { document.getElementById(id)?.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" }); return `→ scrolled to #${id}`; };
  const CMDS = {
    help: () => "commands: whoami · agents · skills · experience · ask &lt;question&gt; · contact · resume · goto &lt;section&gt; · clear · exit\ntip: ↑/↓ for history, tab to autocomplete",
    whoami: () => `${esc(PROFILE.name)}\n${esc(PROFILE.role)} · ${esc(PROFILE.location)}\n\n${esc(PROFILE.summary)}`,
    agents: () => AGENTS.map((a, i) => `[${a.status.padEnd(10)}] 0${i + 1} ${esc(a.name)}`).join("\n"),
    skills: () => Object.entries(SKILLS).map(([k, v]) => `${k.padEnd(20)} ${v.join(", ")}`).map(esc).join("\n"),
    experience: () => TIMELINE.map(t => `${t.years.padEnd(13)} ${t.org.padEnd(10)} ${t.role}`).map(esc).join("\n"),
    ls: () => "whoami/  agents/  method/  ask/  trajectory/  contact/",
    contact: () => contactLinks().map(l => `${l.label.padEnd(9)} <a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.text)}</a>`).join("\n"),
    resume: () => PROFILE.resume ? (open(PROFILE.resume, "_blank"), "opening résumé…") : "résumé not published",
    ask: q => { if (!q) return "usage: ask &lt;question&gt;"; const r = INDEX.search(q, 2); return r.length ? r.map(x => `(${x.score.toFixed(3)}) ${esc(x.doc.src)}\n  ${esc(x.doc.text)}`).join("\n") : "no grounded answer. try: ask evaluation"; },
    goto: s => go(s || "top"),
    cd: s => go(s || "top"),
    sudo: () => "nice try. access is granted via OAuth on-behalf-of, not sudo.",
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
  function openT() { term.hidden = false; input.focus(); if (!body.childElementCount) print(`Last login: ${new Date().toDateString()} from latent-space\nType 'help' to begin.`); }
  function close() { term.hidden = true; }
  $("#term-open").addEventListener("click", () => term.hidden ? openT() : close());
  $("#term-close").addEventListener("click", close);
  $("#term-form").addEventListener("submit", e => { e.preventDefault(); const v = input.value; hist.push(v); hi = hist.length; input.value = ""; exec(v); });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") { hi = Math.max(0, hi - 1); input.value = hist[hi] || ""; e.preventDefault(); }
    else if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ""; e.preventDefault(); }
    else if (e.key === "Tab") { e.preventDefault(); const m = Object.keys(CMDS).filter(k => k.startsWith(input.value)); if (m.length === 1) input.value = m[0] + " "; else if (m.length) print(m.join("  ")); }
    else if (e.key === "Escape") close();
  });
  addEventListener("keydown", e => {
    if (e.key === "`" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); term.hidden ? openT() : close(); }
  });
}

/* ---------- scroll: reveal, nav state, scene progress ---------- */
function initScroll() {
  document.querySelectorAll(".h2, .body, .metrics, .split > svg, .rag, .skills, .display.small, .loop-detail").forEach(e => e.classList.add("reveal"));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    if (e.target.classList.contains("metrics")) e.target.querySelectorAll("b[data-to]").forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(e => io.observe(e));

  const sections = [...document.querySelectorAll("section[data-scene]")];
  const links = [...document.querySelectorAll(".nav nav a")];
  const onScroll = () => {
    const mid = innerHeight * 0.5; let p = 0;
    sections.forEach((s, i) => { const r = s.getBoundingClientRect(); if (r.top <= mid) p = i + Math.min(1, Math.max(0, (mid - r.top) / r.height)) - 0.5; });
    const sp = Math.max(0, Math.min(sections.length - 1, p));
    scene.setProgress(sp);
    document.documentElement.style.setProperty("--sky", (sp / (sections.length - 1)).toFixed(4));
    const cur = sections[Math.round(Math.max(0, p))]?.id;
    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
}

/* ---------- console easter egg for curious engineers ---------- */
function consoleHello() {
  console.log("%c" + PROFILE.handle + "@agents", "color:#ff4d2e;font:600 20px monospace");
  console.log("Reading the source? Good instinct. Press ` on the page for a shell, or email " + PROFILE.email);
}

function main() {
  try {
    boot(); renderHero(); renderMetrics(); renderAgents(); renderLoop(); renderTrajectory(); renderContact();
    initRag(); initTerminal(); initScroll(); consoleHello();
  } catch (e) { console.error("[site] init failed", e); $("#boot")?.classList.add("done"); }
}
main();
