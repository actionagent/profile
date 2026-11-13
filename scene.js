// Scroll-driven particle "latent space". Each section has a target shape; particles morph between them.
import * as THREE from "./vendor/three.module.min.js";

const CFG = {
  count: window.innerWidth < 700 ? 3500 : 7000,
  pointSize: 2.8,
  accentRatio: 0.12,
  colorBase: new THREE.Color("#d9d3c7"),
  colorAccent: new THREE.Color("#ff4d2e"),
  colorLive: new THREE.Color("#7cf5d6"),
  morphEase: 0.06,     // per-frame lerp toward scroll target
  mouseInfluence: 0.25,
  drift: 0.00035,
};

const rand = (a = 1) => (Math.random() * 2 - 1) * a;
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

// Shape generators: (i, n) -> [x, y, z]
const SHAPES = [
  // 0 latent sphere
  (i, n) => { const phi = Math.acos(1 - 2 * (i + 0.5) / n), th = Math.PI * (1 + Math.sqrt(5)) * i; const r = 2.4 + gauss() * 0.06;
    return [r * Math.sin(phi) * Math.cos(th), r * Math.sin(phi) * Math.sin(th), r * Math.cos(phi)]; },
  // 1 double helix (who I am)
  (i, n) => { const t = (i / n) * Math.PI * 10, s = i % 2 ? Math.PI : 0, y = (i / n) * 7 - 3.5;
    return [Math.cos(t + s) * 1.3 + gauss() * 0.05, y, Math.sin(t + s) * 1.3 + gauss() * 0.05]; },
  // 2 medallion layers: bronze / silver / gold planes
  (i) => { const layer = i % 3; return [rand(3.2), (layer - 1) * 1.4 + gauss() * 0.02, rand(2)]; },
  // 3 the loop: ring with 6 dense nodes
  (i, n) => { const nodes = 6; const onNode = i % 4 === 0; const k = onNode ? Math.floor(Math.random() * nodes) / nodes : i / n;
    const a = k * Math.PI * 2 + (onNode ? gauss() * 0.04 : 0); const r = 2.4 + (onNode ? gauss() * 0.12 : gauss() * 0.03);
    return [Math.cos(a) * r, Math.sin(a) * r, gauss() * (onNode ? 0.12 : 0.05)]; },
  // 4 embedding clusters
  (() => { const centers = Array.from({ length: 9 }, () => [rand(3), rand(2), rand(1.5)]);
    return (i) => { const c = centers[i % centers.length]; const s = 0.18 + (i % 5) * 0.04; return [c[0] + gauss() * s, c[1] + gauss() * s, c[2] + gauss() * s]; }; })(),
  // 5 rising spiral (trajectory)
  (i, n) => { const t = i / n; const a = t * Math.PI * 12; const r = 0.4 + t * 2.4; return [Math.cos(a) * r, t * 6 - 3.2, Math.sin(a) * r]; },
  // 6 handshake: tilted spiral galaxy (many signals, one centre)
  (i, n) => { const arm = i % 3; const t = Math.pow(Math.random(), 0.7); const r = 0.2 + t * 3; const a = arm * (Math.PI * 2 / 3) + t * 5 + gauss() * 0.25;
    const x = Math.cos(a) * r, z = Math.sin(a) * r, y = gauss() * 0.08 * (1.2 - t); return [x, y * 0.9 + z * 0.35, z * 0.9 - y * 0.35]; },
];

export function initScene(canvas) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" }); }
  catch (e) { console.warn("[scene] WebGL unavailable, skipping 3D", e); return { setProgress() {}, pulse() {} }; }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const n = CFG.count;
  const targets = SHAPES.map(fn => { const a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set(fn(i, n), i * 3); return a; });
  const pos = new Float32Array(targets[0]);
  const col = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = Math.random(); seed[i] = Math.random();
    const c = r < CFG.accentRatio ? CFG.colorAccent : r < CFG.accentRatio * 1.25 ? CFG.colorLive : CFG.colorBase;
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("seed", new THREE.BufferAttribute(seed, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    uniforms: { uTime: { value: 0 }, uSize: { value: CFG.pointSize * renderer.getPixelRatio() }, uPulse: { value: 0 } },
    vertexShader: `
      attribute float seed; varying vec3 vColor; varying float vAlpha; uniform float uTime, uSize, uPulse;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float tw = 0.55 + 0.45 * sin(uTime * (0.6 + seed) + seed * 40.0);
        gl_PointSize = uSize * (1.0 + uPulse * seed) * (6.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        vColor = color; vAlpha = tw * smoothstep(14.0, 4.0, -mv.z);
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vAlpha;
      void main(){ float d = length(gl_PointCoord - 0.5); if(d > 0.5) discard; gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.0, d)); }`,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let progress = 0, shown = 0, pulse = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", e => { mouse.tx = (e.clientX / innerWidth - 0.5) * 2; mouse.ty = (e.clientY / innerHeight - 0.5) * 2; });

  function resize() {
    const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w < 700 ? 11 : 8; camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize); resize();

  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    shown += (progress - shown) * (reduced ? 1 : CFG.morphEase);
    const a = Math.max(0, Math.min(SHAPES.length - 1, Math.floor(shown)));
    const b = Math.min(SHAPES.length - 1, a + 1);
    const f = shown - a, k = f * f * (3 - 2 * f); // smoothstep
    const A = targets[a], B = targets[b];
    for (let i = 0; i < n * 3; i++) pos[i] = A[i] + (B[i] - A[i]) * k;
    geo.attributes.position.needsUpdate = true;

    mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
    points.rotation.y = reduced ? 0 : t * 0.06 + mouse.x * CFG.mouseInfluence;
    points.rotation.x = reduced ? 0 : Math.sin(t * 0.1) * 0.08 + mouse.y * CFG.mouseInfluence * 0.6;
    // shift the cloud right on desktop so it frames the text instead of sitting under it
    points.position.x = innerWidth > 860 ? 1.8 : 0;
    pulse *= 0.94; mat.uniforms.uPulse.value = pulse; mat.uniforms.uTime.value = t;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();

  return {
    setProgress(p) { progress = p; },
    pulse(v = 1.5) { pulse = v; },
  };
}
