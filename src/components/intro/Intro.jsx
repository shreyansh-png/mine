import { useEffect, useRef, useState } from "react";

/**
 * Intro: cinematic dust-signature version.
 * A glowing dust pen writes "Cuckoo" (no dot, no underline), then the rest of the intro appears.
 * Same props / same "OPEN OUR STORY" behaviour as before. Plain canvas + CSS only, no motion/react needed.
 * Phones get half the dust; slow devices drop the grain/bokeh/ray automatically.
 */

// Pet names that drift through the background now and then. Edit freely.
const WORDS = ["loveydovey", "faguinya", "meri bhondu", "baby", "kucchu pucchu"];
const WORD_COLORS = ["#D6A3BC", "#C99BB5", "#e8c9da"];
// zones as fractions [x0, x1, y0, y1]; the middle column is left alone for the name; order hops left/right
const ZONES_WIDE = [[.06,.38,.13,.27],[.62,.94,.73,.87],[.62,.94,.13,.27],[.06,.38,.73,.87],[.04,.26,.40,.58],[.74,.96,.40,.58]];
const ZONES_PHONE = [[.06,.46,.14,.23],[.54,.94,.81,.89],[.54,.94,.14,.23],[.06,.46,.81,.89]];

const CSS = `
.cin-world{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:0 24px}
.cin-world.play{animation:cin-push 12s cubic-bezier(.25,.5,.3,1) forwards;will-change:transform}
@keyframes cin-push{from{scale:1}to{scale:1.05}}
.cin-ray{position:absolute;inset:-20%;pointer-events:none;background:linear-gradient(105deg,transparent 42%,rgba(255,200,230,.07) 50%,transparent 58%);animation:cin-ray 14s ease-in-out infinite alternate}
@keyframes cin-ray{from{translate:-12% 0}to{translate:12% 0}}
.cin-bk{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(214,163,188,.16),transparent 68%);filter:blur(5px);pointer-events:none;animation:cin-bk 16s ease-in-out infinite alternate}
@keyframes cin-bk{to{translate:30px -24px;opacity:.5}}
.cin-dot{position:absolute;width:4px;height:4px;border-radius:50%;background:#DAB4C9;box-shadow:0 0 10px #C99BB577;opacity:.35;animation:cin-fl 7s ease-in-out infinite alternate}
@keyframes cin-fl{to{translate:0 -14px;opacity:.15}}
.cin-fx{position:absolute;left:0;pointer-events:none}
.cin-flare{position:absolute;left:0;top:0;width:min(60vw,560px);height:2px;margin-top:-1px;opacity:0;pointer-events:none;will-change:transform,opacity;background:linear-gradient(90deg,transparent,rgba(255,205,232,.95),transparent);box-shadow:0 0 18px 3px rgba(214,163,188,.55)}
.cin-bloom{position:absolute;left:50%;top:50%;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;border:1px solid rgba(201,155,181,.3);opacity:0;pointer-events:none}
.cin-bloom.go{animation:cin-bloom 1.1s ease-out forwards}
@keyframes cin-bloom{from{scale:.4;opacity:.5}to{scale:2.5;opacity:0}}
.cin-orbit{opacity:0;scale:.2;transition:scale 1.8s cubic-bezier(.2,.7,.2,1),opacity 1.4s}
.cin-orbit.on{opacity:1;scale:1}
.cin-eye{opacity:0;letter-spacing:.66em;filter:blur(6px);transition:opacity 2.4s ease,letter-spacing 3.4s cubic-bezier(.2,.7,.2,1),filter 2.4s ease}
.cin-eye.on{opacity:1;letter-spacing:.32em;filter:none}
.cin-rv{opacity:0;translate:0 8px;transition:opacity 1s ease,translate 1s ease}
.cin-rv.on{opacity:1;translate:0 0}.cin-rv:not(.on){pointer-events:none}
.cin-hw{clip-path:inset(-20% 100% -20% 0);padding:0 4px}
.cin-pen{position:absolute;top:50%;left:0;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:#fff;box-shadow:0 0 14px 5px #D6A3BC;opacity:0;pointer-events:none}
.cin-lb{position:absolute;left:0;right:0;z-index:20;height:50.5%;background:#000;pointer-events:none;transition:height 1.8s cubic-bezier(.7,0,.2,1)}
.cin-lb.t{top:0}.cin-lb.b{bottom:0}.cin-lb.open{height:11%}.cin-lb.gone{height:0}
.cin-vig{position:absolute;inset:0;z-index:19;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,transparent 52%,rgba(0,0,0,.6))}
.cin-grain{position:absolute;inset:-50%;z-index:19;pointer-events:none;opacity:.05;animation:cin-gr .9s steps(6) infinite;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
@keyframes cin-gr{0%{translate:0 0}20%{translate:-3% 2%}40%{translate:2% -3%}60%{translate:-2% -1%}80%{translate:3% 3%}}
.cin-words{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.cin-wd{position:absolute;font-family:'Caveat',cursive;white-space:nowrap;color:var(--c);font-size:var(--s);opacity:0;filter:blur(var(--b));text-shadow:0 0 16px rgba(214,163,188,.5);will-change:transform,opacity;animation:cin-wd var(--t) ease-in-out forwards}
@keyframes cin-wd{0%{opacity:0;transform:translate(0,0) rotate(var(--r0)) scale(.92);clip-path:inset(-30% 100% -30% 0)}
 12%{opacity:var(--o);clip-path:inset(-30% 0 -30% 0)}78%{opacity:var(--o)}
 100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--r1)) scale(1.05);clip-path:inset(-30% 0 -30% 0)}}
.cin-wd i{position:absolute;right:-.45em;top:-.35em;font-style:normal;font-size:.55em;color:#fff;opacity:0;animation:cin-tw 2.6s ease-in-out infinite}
@keyframes cin-tw{50%{opacity:.9;scale:1.5}}
.cin-skip{transition:opacity .6s}.cin-done .cin-skip{opacity:0;pointer-events:none}
.cin-lite .cin-grain,.cin-lite .cin-ray,.cin-lite .cin-bk{display:none}
@media (max-width:600px){.cin-grain{animation:none}.cin-bk:nth-child(n+4){display:none}.cin-eye{letter-spacing:.46em}.cin-eye.on{letter-spacing:.28em}}
@media (max-aspect-ratio:3/4){.cin-lb.open{height:7%}}
@media (prefers-reduced-motion:reduce){.cin-grain,.cin-ray,.cin-bk,.cin-world.play{animation:none}.cin-words{display:none}.cin-eye,.cin-rv,.cin-orbit,.cin-lb{transition:none}}
`;

export default function Intro({ onStartMusic }) {
  const [leaving, setLeaving] = useState(false);
  const timeoutRef = useRef(null);
  const rootRef = useRef(null), worldRef = useRef(null), dotsRef = useRef(null), wordsRef = useRef(null);
  const cvRef = useRef(null), fxRef = useRef(null), flareRef = useRef(null), nmRef = useRef(null);
  const hwRef = useRef(null), penRef = useRef(null), bloomRef = useRef(null), skipRef = useRef(null);

  function beginStory() {
    if (leaving) return;
    onStartMusic?.();
    const b = bloomRef.current;
    if (b) { b.classList.remove("go"); void b.offsetWidth; b.classList.add("go"); }
    setLeaving(true);
    timeoutRef.current = window.setTimeout(() => {
      document.getElementById("particle-portrait")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setLeaving(false);
    }, 550);
  }
  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  useEffect(() => {
    const root = rootRef.current, world = worldRef.current, nm = nmRef.current, cv = cvRef.current, fx = fxRef.current;
    const hw = hwRef.current, pen = penRef.current, fl = flareRef.current, dotsEl = dotsRef.current, wl = wordsRef.current;
    const cx = cv.getContext("2d"), fc = fx.getContext("2d");
    const ac = new AbortController(), { signal } = ac;
    const R = Math.random, cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cin = k => root.querySelector(`[data-cin="${k}"]`);
    const ALL = ["eye", "orbit", "days", "open", "foot"];
    const bars = s => root.querySelectorAll(".cin-lb").forEach(e => { e.classList.remove("open", "gone"); if (s !== "close") e.classList.add(s); });

    let W, H, Wr, Hr, N = 0, hx, hy, px, py, vx, vy, kk, rest, col, order, rel = 0, sz = 2, x0 = 0, x1 = 0, nb = 1, sumY, cnt;
    let penX = 0, penY = 0, pbuf, pimg, sparks = [], fired = [], last = 0, sweep = -999, midY = 0, top0 = 0;
    let T = 0, restN = 0, lite = false, fr = 0, fsum = 0, chk = 0, CAP = 13000;
    let raf = 0, vis = false, ready = false, ro = null, rz = 0;

    // ---------- background: soft bokeh + fireflies (fewer on phones)
    function decorate() {
      dotsEl.innerHTML = "";
      for (let i = 0; i < 7; i++) {
        const d = document.createElement("i"), s = 70 + R() * 110;
        d.className = "cin-bk";
        d.style.cssText = `left:${R() * 100}%;top:${R() * 100}%;width:${s}px;height:${s}px;animation-delay:${-R() * 16}s;opacity:${.4 + R() * .5}`;
        dotsEl.appendChild(d);
      }
      for (let i = 0; i < (innerWidth < 600 ? 6 : 10); i++) {
        const d = document.createElement("i");
        d.className = "cin-dot";
        d.style.cssText = `left:${R() * 100}%;top:${R() * 100}%;animation-delay:${-R() * 7}s;scale:${.6 + R()}`;
        dotsEl.appendChild(d);
      }
    }

    // ---------- 1) draw "Cuckoo" where the heading sits, 2) turn its pixels into dust that waits for the pen
    function build() {
      const rr = root.getBoundingClientRect(), r = nm.getBoundingClientRect(), cs = getComputedStyle(nm), fs = parseFloat(cs.fontSize);
      W = root.clientWidth; H = root.clientHeight; CAP = W < 600 ? 6500 : 13000; restN = 0;
      const nl = r.left - rr.left, nt = r.top - rr.top, top = Math.max(0, nt - 90);
      top0 = top; midY = nt + r.height * .52; Hr = Math.round(Math.min(H - top, r.height + 180)); Wr = W;
      [cv, fx].forEach(c => { c.width = Wr; c.height = Hr; c.style.top = top + "px"; c.style.width = Wr + "px"; c.style.height = Hr + "px"; });
      const m = document.createElement("span"); m.style.cssText = "display:inline-block;width:0;height:0"; nm.appendChild(m);
      const base = m.getBoundingClientRect().top - rr.top - top; m.remove();
      const a = document.createElement("canvas"); a.width = Wr; a.height = Hr;
      const c = a.getContext("2d", { willReadFrequently: true }), ls = parseFloat(cs.letterSpacing) || 0;
      c.font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`; c.textBaseline = "alphabetic"; c.fillStyle = "#F2EEF2";
      let x = nl; [..."Cuckoo"].forEach(ch => { c.fillText(ch, x, base); x += c.measureText(ch).width + ls; });
      x0 = nl - 30; x1 = x + 30;
      const d = c.getImageData(0, 0, Wr, Hr).data; let ts = 1.6, L;
      for (let tr = 0; tr < 8; tr++) {
        L = [];
        for (let y = ts / 2; y < Hr; y += ts) for (let xx = ts / 2; xx < Wr; xx += ts) {
          const i = ((y | 0) * Wr + (xx | 0)) * 4; if (d[i + 3] > 120) L.push(xx, y, d[i], d[i + 1], d[i + 2]);
        }
        if (L.length / 5 < CAP) break; ts *= 1.15;
      }
      N = L.length / 5; sz = Math.max(2, Math.round(ts * 1.3));
      hx = new Float32Array(N); hy = new Float32Array(N); px = new Float32Array(N); py = new Float32Array(N);
      vx = new Float32Array(N); vy = new Float32Array(N); kk = new Float32Array(N); rest = new Uint8Array(N); col = new Uint32Array(N);
      nb = Math.ceil(Wr / 6); sumY = new Float32Array(nb); cnt = new Uint16Array(nb);
      for (let i = 0; i < N; i++) {
        const j = i * 5; hx[i] = L[j]; hy[i] = L[j + 1]; col[i] = ((L[j + 4] << 16) | (L[j + 3] << 8) | L[j + 2]) >>> 0;
        const b = (hx[i] / 6) | 0; sumY[b] += hy[i]; cnt[b]++;
      }
      order = Array.from({ length: N }, (_, i) => i).sort((p, q) => hx[p] - hx[q]);
      pbuf = new Uint32Array(Wr * Hr); pimg = new ImageData(new Uint8ClampedArray(pbuf.buffer), Wr, Hr);
      rel = 0; penX = x0; penY = hy[order[0]] || Hr / 2; sparks = [];
    }
    function render() {
      pbuf.fill(0);
      for (let j = 0; j < rel; j++) {
        const i = order[j], x = px[i] | 0, y = py[i] | 0; if (x < 0 || y < 0 || x >= Wr - sz || y >= Hr - sz) continue;
        let c0 = col[i];
        if (sweep > -900) {   // the light glint passing over the name
          const d = Math.abs(x - sweep);
          if (d < 60) { const w = (1 - d / 60) * 130; c0 = ((Math.min(255, ((c0 >> 16) & 255) + w) << 16) | (Math.min(255, ((c0 >> 8) & 255) + w) << 8) | Math.min(255, (c0 & 255) + w)) >>> 0; }
        }
        const c = (((110 + 145 * kk[i]) << 24) | c0) >>> 0;
        for (let a = 0; a < sz; a++) { const o = (y + a) * Wr + x; for (let b = 0; b < sz; b++) pbuf[o + b] = c; }
      }
      cx.putImageData(pimg, 0, 0);
    }
    function step(dt, t) {
      const u = cl((t - 2.4) / 3), ig = cl((t - 1.8) / .6) * (1 - cl((t - 5.4) / .5)); penX = x0 + (x1 - x0) * u;
      const b = cl((penX / 6) | 0, 0, nb - 1), ty = cnt[b] ? sumY[b] / cnt[b] : penY; penY += (ty + Math.sin(t * 13) * 9 - penY) * .22;
      while (u > 0 && rel < N && hx[order[rel]] <= penX + 14) {   // dust leaves the pen
        const i = order[rel++]; px[i] = penX + (R() - .5) * 8; py[i] = penY + (R() - .5) * 14; vx[i] = (R() - .5) * 140; vy[i] = (R() - .5) * 140 - 30;
      }
      for (let j = 0; j < rel; j++) {
        const i = order[j]; if (rest[i]) continue;
        const k = Math.min(1, kk[i] + dt * 1.7), ex = hx[i] - px[i], ey = hy[i] - py[i], s2 = 14 * k * (1 - k);
        vx[i] += (ex * 60 * k - ey * s2) * dt; vy[i] += (ey * 60 * k + ex * s2) * dt;   // spring + a little swirl: curved flight
        const dm = Math.exp(-(1.5 + 10 * k) * dt); vx[i] *= dm; vy[i] *= dm; px[i] += vx[i] * dt; py[i] += vy[i] * dt; kk[i] = k;
        if (k >= 1 && ex * ex + ey * ey < .04 && vx[i] * vx[i] + vy[i] * vy[i] < 4) { px[i] = hx[i]; py[i] = hy[i]; rest[i] = 1; restN++; }
      }
      fc.clearRect(0, 0, Wr, Hr);
      if (ig > 0) {   // the pen ignites, writes, then dims
        if (u > 0 && u < 1) for (let q = 0; q < 2; q++) sparks.push({ x: penX, y: penY, vx: (R() - .5) * 60, vy: 20 + R() * 50, l: 1 });
        const rr = 34 * ig, g = fc.createRadialGradient(penX, penY, 0, penX, penY, rr);
        g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(.25, "rgba(214,163,188,.6)"); g.addColorStop(1, "rgba(214,163,188,0)");
        fc.fillStyle = g; fc.fillRect(penX - rr, penY - rr, rr * 2, rr * 2);
      }
      sparks = sparks.filter(s => s.l > 0);
      sparks.forEach(s => { s.l -= dt * 1.4; s.x += s.vx * dt; s.y += s.vy * dt; fc.fillStyle = `rgba(236,200,222,${s.l * .8})`; fc.fillRect(s.x, s.y, 2, 2); });
      return [u, ig];
    }

    // ---------- pet names: only now and then, one or two at a time, hopping between left and right
    let wq = [], wOn = false, wt = 0, wz = 0, wcnt = 0;
    const pickWord = () => { if (!wq.length) wq = WORDS.slice().sort(() => R() - .5); return wq.pop(); };
    function spawn() {
      const w = root.clientWidth, h = root.clientHeight, mob = w < 600, Z = mob ? ZONES_PHONE : ZONES_WIDE, z = Z[wz++ % Z.length];
      if (!wOn || document.hidden || !vis || wcnt >= (lite ? 1 : mob ? 2 : 3)) return;
      const x = w * (z[0] + (z[1] - z[0]) * R()), y = h * (z[2] + (z[3] - z[2]) * R()), right = z[0] > .5, d = R();
      const el = document.createElement("span"), S = el.style;
      el.className = "cin-wd"; el.textContent = pickWord(); S.top = y + "px";
      if (right) S.right = (w - x) + "px"; else S.left = x + "px";   // right-hand words anchor by their right edge so they never run off-screen
      S.setProperty("--s", ((mob ? 17 : 20) + (1 - d) * (mob ? 10 : 22)).toFixed(1) + "px");
      S.setProperty("--b", (d > .6 ? 1.8 : .5) + "px");
      S.setProperty("--o", (.14 + (1 - d) * .16).toFixed(2));
      S.setProperty("--t", (9 + R() * 4).toFixed(1) + "s");
      S.setProperty("--dx", ((R() - .5) * 60).toFixed(0) + "px"); S.setProperty("--dy", (-(30 + R() * 50)).toFixed(0) + "px");
      S.setProperty("--r0", ((R() - .5) * 10).toFixed(1) + "deg"); S.setProperty("--r1", ((R() - .5) * 12).toFixed(1) + "deg");
      S.setProperty("--c", WORD_COLORS[(R() * 3) | 0]);
      if (R() < .4) { const s = document.createElement("i"); s.textContent = "\u2726"; s.style.animationDelay = -R() * 2 + "s"; el.appendChild(s); }
      wl.appendChild(el); wcnt++;
      el.addEventListener("animationend", ev => { if (ev.target === el) { el.remove(); wcnt--; } });
    }
    const wloop = () => { spawn(); wt = window.setTimeout(wloop, 4200 + R() * 3600); };
    const stopWords = () => { clearTimeout(wt); wl.innerHTML = ""; wcnt = 0; wq = []; };
    const startWords = () => { stopWords(); wOn = !RM; if (wOn) { wz = (R() * 6) | 0; wt = window.setTimeout(wloop, 5200); } };

    // ---------- timeline
    const STEPS = [[.3, () => bars("open")], [1.2, () => cin("eye").classList.add("on")], [5.9, () => cin("orbit").classList.add("on")],
      [8.4, () => cin("days").classList.add("on")], [8.8, () => cin("open").classList.add("on")], [9, () => bars("gone")],
      [9.3, () => cin("foot").classList.add("on")], [9.6, () => root.classList.add("cin-done")]];
    function loop(now) {
      if (!vis) { raf = 0; return; }   // sleeps while off-screen
      const dt = Math.min(.033, (now - last) / 1000); last = now; T += dt; const t = T;   // own clock: pauses with the tab
      if (t >= 2.4 && t < 5.4) { fr++; fsum += dt; }
      else if (t >= 5.4 && !chk) { chk = 1; if (fr && fsum / fr > .024) { lite = true; root.classList.add("cin-lite"); } }   // writing is the heavy moment: if it ran slow, drop the extras
      const idle = rel >= N && restN >= N && t > 7.3;   // everything settled: stop simulating and redrawing
      let u = 1, ig = 0; if (!idle) [u, ig] = step(dt, t);
      const sq = cl((t - 5.8) / 1.3); sweep = sq > 0 && sq < 1 ? x0 + (x1 - x0) * sq : -999; if (!idle) render();
      if (!idle) {   // anamorphic streak rides the pen, then sweeps the finished name
        let fxp = penX, fyp = penY + top0, fo = 0;
        if (ig > 0 && u < 1) fo = .85 * ig; else if (sweep > -900) { fxp = sweep; fyp = midY; fo = .7 * Math.sin(Math.PI * sq); }
        fl.style.opacity = fo; fl.style.transform = `translate(${fxp}px,${fyp}px) translate(-50%,-50%)`;
      }
      const q = cl((t - 6.6) / 1.6), w = hw.offsetWidth;   // the handwritten line is "written" by a glowing pen
      hw.style.clipPath = `inset(-20% ${100 - q * 100}% -20% 0)`;
      pen.style.left = hw.offsetLeft + q * w + "px"; pen.style.marginTop = -5 + Math.sin(q * 34) * 5 * (1 - q) + "px"; pen.style.opacity = q > 0 && q < 1 ? 1 : 0;
      STEPS.forEach(([at, fn], i) => { if (!fired[i] && t >= at) { fired[i] = 1; fn(); } });
      if (t < 11) raf = requestAnimationFrame(loop); else raf = 0;
    }
    const wake = () => { if (vis && !raf && ready && T < 11 && !finished) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    let finished = false;
    function finish() {   // jump to the finished intro (reduced motion, Skip, resize after the show)
      finished = true; cancelAnimationFrame(raf); raf = 0; world.classList.remove("play");
      if (!N) build();
      for (let i = 0; i < N; i++) { px[i] = hx[i]; py[i] = hy[i]; kk[i] = 1; rest[i] = 1; } rel = N; restN = N; sweep = -999;
      render(); fc.clearRect(0, 0, Wr, Hr); fl.style.opacity = 0; bars("gone");
      ALL.forEach(k => cin(k).classList.add("on")); hw.style.clipPath = "inset(-20% 0 -20% 0)"; pen.style.opacity = 0; root.classList.add("cin-done");
    }
    function restart() {
      cancelAnimationFrame(raf); raf = 0; finished = false; world.classList.remove("play"); root.classList.remove("cin-done");
      ALL.forEach(k => cin(k).classList.remove("on")); bars("close"); fired = []; sweep = -999; T = 0; fr = fsum = chk = 0;
      hw.style.clipPath = ""; pen.style.opacity = 0; fl.style.opacity = 0; void world.offsetWidth;
      build(); startWords(); world.classList.add("play"); wake();
    }

    // ---------- start
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) wake(); }, { threshold: .1 });
    io.observe(root);
    skipRef.current.addEventListener("click", () => { stopWords(); finish(); }, { signal });
    let lw = 0;
    (async () => {
      decorate();
      try { await Promise.race([document.fonts.load(`italic 600 100px "Cormorant Garamond"`).then(() => document.fonts.ready), new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* use fallback font */ }
      if (signal.aborted) return;
      build(); ready = true; lw = root.clientWidth;
      if (RM) finish(); else { startWords(); world.classList.add("play"); wake(); }
      ro = new ResizeObserver(() => {
        const w = root.clientWidth; if (Math.abs(w - lw) < 20) return; lw = w;
        clearTimeout(rz); rz = window.setTimeout(() => { decorate(); if (finished || T >= 11) { build(); finish(); startWords(); } else restart(); }, 250);
      });
      ro.observe(root);
    })();

    return () => {
      ac.abort(); io.disconnect(); ro && ro.disconnect(); cancelAnimationFrame(raf); clearTimeout(rz); clearTimeout(wt);
      wl.innerHTML = ""; dotsEl.innerHTML = "";
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className={`cin relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#111119] px-6 text-[#F2EEF2] transition-opacity duration-700 ${leaving ? "opacity-70" : "opacity-100"}`}
    >
      <style>{CSS}</style>

      {/* ambient colour */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,#261725_0%,#111119_65%)]" />

      <div ref={worldRef} className="cin-world">
        <div ref={dotsRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="cin-ray" aria-hidden="true" />
        <div ref={wordsRef} className="cin-words" aria-hidden="true" />

        {/* orbital lines: appear once the name is written */}
        <svg
          data-cin="orbit"
          viewBox="0 0 500 500"
          className="cin-orbit pointer-events-none absolute left-1/2 top-1/2 h-[min(85vw,500px)] w-[min(85vw,500px)] -translate-x-1/2 -translate-y-1/2"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="250" cy="250" r="190" stroke="#C99BB5" strokeOpacity="0.09" />
          <ellipse cx="250" cy="250" rx="125" ry="190" transform="rotate(-32 250 250)" stroke="#C99BB5" strokeOpacity="0.07" />
        </svg>

        <canvas ref={cvRef} className="cin-fx" aria-hidden="true" />
        <canvas ref={fxRef} className="cin-fx" aria-hidden="true" />
        <div ref={flareRef} className="cin-flare" aria-hidden="true" />
        <div ref={bloomRef} className="cin-bloom" aria-hidden="true" />

        <main className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
          <p data-cin="eye" className="cin-eye mb-7 text-[10px] text-white/45 sm:text-xs">
            A LITTLE WORLD, JUST FOR
          </p>

          {/* the heading keeps the layout and the accessible name; the dust draws it */}
          <h1
            ref={nmRef}
            className="relative select-none whitespace-nowrap font-['Cormorant_Garamond'] text-[clamp(4.5rem,17vw,9rem)] font-semibold italic leading-none tracking-[-0.045em] text-transparent"
          >
            Cuckoo
          </h1>

          <div className="relative mt-5">
            <p ref={hwRef} className="cin-hw font-['Caveat'] text-2xl text-[#C99BB5] sm:text-3xl">
              my favourite person ♡
            </p>
            <span ref={penRef} className="cin-pen" aria-hidden="true" />
          </div>

          <div data-cin="days" className="cin-rv mt-5">
            <p className="text-[10px] tracking-[0.18em] text-white/35">365 DAYS OF US</p>
          </div>

          <div data-cin="open" className="cin-rv mt-12 sm:mt-14">
            <button
              type="button"
              onClick={beginStory}
              className="group inline-flex items-center gap-3 border-b border-[#C99BB5]/40 pb-2 text-[10px] tracking-[0.22em] text-white/60 transition-colors hover:border-[#C99BB5] hover:text-white active:scale-[0.97]"
            >
              OPEN OUR STORY
              <span className="text-[#C99BB5] transition-transform duration-300 group-hover:translate-x-1">↗</span>
            </button>
          </div>
        </main>
      </div>

      {/* cinematic frame: letterbox, vignette, grain */}
      <div className="cin-lb t" aria-hidden="true" />
      <div className="cin-lb b" aria-hidden="true" />
      <div className="cin-vig" aria-hidden="true" />
      <div className="cin-grain" aria-hidden="true" />

      <button
        ref={skipRef}
        type="button"
        className="cin-skip absolute right-3 top-3 z-30 rounded-full border border-white/15 px-3 py-2 text-[10px] tracking-[0.2em] text-white/45 hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D6A3BC]"
      >
        SKIP
      </button>

      <footer className="absolute bottom-7 left-0 right-0 z-10 text-center">
        <p data-cin="foot" className="cin-rv text-[9px] tracking-[0.2em] text-white/30">
          17 OCTOBER · MADE FOR CUCKOO
        </p>
      </footer>
    </section>
  );
}