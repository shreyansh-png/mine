import { useEffect, useRef } from 'react'

/**
 * "Until Our Next Chapter" – dust finale.
 * 1. The sticker starts as a loose cloud of dust. Rub it and the specks fly home (and the picture sharpens).
 * 2. Tap: the same dust lifts off and spells each line of the letter, one tap per line.
 * Plain WebGL + React hooks + Tailwind utilities only (needs Tailwind 3.2+ for group-data-[...]). Nothing re-renders per frame.
 *
 * Props
 *  src     URL of the cut-out sticker (transparent .webp/.png), e.g. '/couple-sticker.webp' from /public
 *  alt     alt text for the sticker
 *  title   small title at the top
 *  font    CSS font-family used to draw the words (swap in your site's serif)
 *  slides  [{ h:[line1,line2] } | { p:'paragraph' } | { s:[line1,line2] }]  heading / paragraph / signature
 */
const DEFAULT_SLIDES = [
  { h: ['Happy Anniversary,', 'Cuckoo \u2661'] },
  { p: 'If these pages could hold every little thing I feel for you, they would never be enough' },
  { p: 'Thank you for every laugh, every random moment, every little memory, and all the happiness you bring' },
  { p: 'This isn\u2019t the end of our story \u2014 just another page' },
  { p: 'I can\u2019t wait for all the ordinary days, silly conversations, new places, and tiny moments still waiting for us' },
  { s: ['Yours, always', 'Shreyansh \u2661'] },
]

// Each speck is a point sprite: unformed = soft lavender dust, formed = sharp coloured square.
const VS = `attribute vec2 aP;attribute float aK;attribute vec3 aC;attribute float aS;
uniform vec2 uR;uniform float uD,uSz,uStep,uT,uFade,uSwY,uSp,uDust;uniform vec3 uPt;
varying vec3 vC;varying float vA,vK;
void main(){vec2 p=aP;float k=aK;
 if(uSp>.5){vC=aC;vA=aS;vK=0.;gl_PointSize=uSz*(.4+aS)*uD;}
 else{vec3 dust=mix(aC,vec3(.82,.72,.88),.55)*(.55+.35*aS);
  float bo=uPt.z>0.?smoothstep(uPt.z,0.,length(p-uPt.xy)):0.;
  float sw=smoothstep(70.,0.,abs(p.y-uSwY))*k;float sh=.05*sin(uT*1.6-p.y*.03)*k;
  vC=mix(dust,aC,k)+vec3(.45,.35,.42)*bo*.8+vec3(.55,.5,.55)*sw+vec3(sh);
  vA=clamp(mix((.3+.5*aS)*uDust,1.,k)*uFade*(1.+bo*.5),0.,1.);vK=k;
  gl_PointSize=mix(uSz*(.6+aS*1.1),uStep*1.18,k)*(1.+bo*.8)*uD;}
 gl_Position=vec4(p.x/uR.x*2.-1.,1.-p.y/uR.y*2.,0.,1.);}`
const FS = `precision mediump float;varying vec3 vC;varying float vA,vK;
void main(){vec2 c=gl_PointCoord*2.-1.;float d=mix(length(c),max(abs(c.x),abs(c.y)),vK);float a=vA*(1.-smoothstep(mix(.5,.62,vK),1.,d));gl_FragColor=vec4(clamp(vC,0.,1.)*a,a);}`

// shared look for the small pill buttons (Tailwind's preflight strips default button styling)
const BTN = 'cursor-pointer rounded-full border border-white/20 bg-transparent px-3.5 py-1.5 text-sm text-[#a398aa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6A3BC]'

export default function FinalChapter({
  src = '/assets/couple-sticker.webp',
  alt = 'Cuckoo and Shreyansh',
  title = 'Until Our Next Chapter',
  font = '"Cormorant Garamond",Georgia,serif',
  slides = DEFAULT_SLIDES,
}) {
  const rootRef = useRef(null), canvasRef = useRef(null), imgRef = useRef(null), gpRef = useRef(null)
  const hintRef = useRef(null), fillRef = useRef(null), dotsRef = useRef(null), srRef = useRef(null)
  const nxRef = useRef(null), foldRef = useRef(null), skipRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current, C = canvasRef.current, im = imgRef.current, gp = gpRef.current
    const hint = hintRef.current, bi = fillRef.current, dots = dotsRef.current, sr = srRef.current
    const ac = new AbortController(), { signal } = ac
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches
    const R = Math.random, cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
    const SL = slides, slText = n => { const S = SL[n]; return S.p || (S.h || S.s).join(' ') }
    const gl = C.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })

    let ASP = 1, U = {}, LOC = {}, bufM, bufS, prog
    let W, H, dpr, gw, gh, gx, gy, N = 0, step = 2, b, hx, hy, vx, vy, sd, tk, dl
    let slide = -1, t0 = 0, dust = 1, tReady = 0, FB = false, phase = 0   // phase: 0 rub, 1 finishing, 2 sweep, 3 sticker done, 4 words
    let tm = 0, ft = 0, sw = 0, swY = -999, fade = 1, touched = RM, formed = 0, lastBar = 0
    let vis = false, raf = 0, last = 0, ready = false, ro = null
    const M = 150, sb = new Float32Array(M * 7), sv = new Float32Array(M * 2), sl = new Float32Array(M * 2); let sp = 0
    const ptr = { x: 0, y: 0, on: false, spd: 0 }, ghost = { x: 0, y: 0, on: false }

    // ---------- WebGL plumbing
    function setupGL() {
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o }
      prog = gl.createProgram()
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS))
      gl.linkProgram(prog); gl.useProgram(prog)
      ;['uR', 'uD', 'uSz', 'uStep', 'uT', 'uFade', 'uSwY', 'uSp', 'uPt', 'uDust'].forEach(n => (U[n] = gl.getUniformLocation(prog, n)))
      ;['aP', 'aK', 'aC', 'aS'].forEach(n => (LOC[n] = gl.getAttribLocation(prog, n)))
      bufM = gl.createBuffer(); bufS = gl.createBuffer(); gl.enable(gl.BLEND)
    }
    function bind(buf) {   // interleaved layout: x y k r g b seed
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      ;[['aP', 2, 0], ['aK', 1, 8], ['aC', 3, 12], ['aS', 1, 24]].forEach(([n, s, o]) => {
        gl.enableVertexAttribArray(LOC[n]); gl.vertexAttribPointer(LOC[n], s, gl.FLOAT, false, 28, o)
      })
    }

    // ---------- layout + sampling the sticker into specks
    function lay() {
      W = root.clientWidth; H = root.clientHeight; dpr = Math.min(devicePixelRatio || 1, 2)
      C.width = Math.round(W * dpr); C.height = Math.round(H * dpr)
      gh = Math.min(H * 0.58, (W * 0.8) / ASP); gw = gh * ASP; gx = (W - gw) / 2; gy = Math.max(48, H * 0.1)
      Object.assign(gp.style, { left: gx + 'px', top: gy + 'px', width: gw + 'px', height: gh + 'px' })
      if (gl) gl.viewport(0, 0, C.width, C.height)
    }
    function build() {   // ~16k specks, scattered as a loose cloud around where they belong
      const tw = Math.round(gw), th = Math.round(gh)
      if (tw <= 0 || th <= 0) return
      const a = document.createElement('canvas'); a.width = tw; a.height = th
      const c = a.getContext('2d', { willReadFrequently: true }); c.drawImage(im, 0, 0, tw, th)
      const d = c.getImageData(0, 0, tw, th).data
      step = Math.max(1.6, Math.sqrt((gw * gh * 0.5) / 16000)); const L = []
      for (let y = step / 2; y < th; y += step) for (let x = step / 2; x < tw; x += step) {
        const i = ((y | 0) * tw + (x | 0)) * 4; if (d[i + 3] > 150) L.push(x, y, d[i], d[i + 1], d[i + 2])
      }
      N = L.length / 5; b = new Float32Array(N * 7)
      hx = new Float32Array(N); hy = new Float32Array(N); vx = new Float32Array(N); vy = new Float32Array(N); sd = new Float32Array(N)
      tk = new Float32Array(N).fill(1); dl = new Float32Array(N); dust = 1; slide = -1
      for (let i = 0; i < N; i++) {
        const j = i * 5, o = i * 7, s = R(), jt = (0.94 + R() * 0.12) / 255
        hx[i] = gx + L[j]; hy[i] = gy + L[j + 1]; sd[i] = s
        b[o] = hx[i] + (R() - 0.5) * gw * 0.6; b[o + 1] = hy[i] + (R() - 0.5) * gh * 0.3; b[o + 2] = 0
        b[o + 3] = L[j + 2] * jt; b[o + 4] = L[j + 3] * jt; b[o + 5] = L[j + 4] * jt; b[o + 6] = s
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, bufM); gl.bufferData(gl.ARRAY_BUFFER, b, gl.DYNAMIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, bufS); gl.bufferData(gl.ARRAY_BUFFER, sb, gl.DYNAMIC_DRAW)
    }
    function emit(x, y, vxx, vyy, life) {   // little sparkles (rubbing + sweep)
      sp = (sp + 1) % M; sv[sp * 2] = vxx; sv[sp * 2 + 1] = vyy; sl[sp * 2] = life; sl[sp * 2 + 1] = life
      const o = sp * 7; sb[o] = x; sb[o + 1] = y; sb[o + 3] = 1; sb[o + 4] = 0.82; sb[o + 5] = 0.92
    }

    // ---------- physics
    function sim(dt) {
      const on = ptr.on || ghost.on, px = ptr.on ? ptr.x : ghost.x, py = ptr.on ? ptr.y : ghost.y
      const RR = Math.max(40, gw * 0.18), fin = phase >= 1
      if (phase === 1) ft += dt
      formed = 0
      for (let i = 0; i < N; i++) {
        const o = i * 7; let x = b[o], y = b[o + 1], k = b[o + 2], ax = vx[i], ay = vy[i]
        if (phase === 4) {   // words: each speck flies to its place in the text, or drifts off as dust
          const w = tk[i]
          if (tm > t0 + dl[i]) { if (k < w) k = Math.min(w, k + dt * 1.7); else if (k > w) k = Math.max(w, k - dt * 2.2) }
        } else if (k < 1) {
          if (on && phase === 0) { const d = Math.hypot(hx[i] - px, hy[i] - py); if (d < RR) k = Math.min(1, k + dt * 3.2 * (1.15 - d / RR)) }
          if (fin && ft > ((hy[i] - gy) / gh) * 0.9) k = Math.min(1, k + dt * 2.8)
        }
        if (k < 1) {   // unformed dust wanders near its home
          const s = sd[i] * 31.4, w = 1 - k
          x += Math.cos(tm * 0.5 + s) * dt * 10 * w; y += Math.sin(tm * 0.43 + s * 1.3) * dt * 10 * w
          ax += (hx[i] - x) * 0.25 * dt * w; ay += (hy[i] - y) * 0.25 * dt * w
        }
        if (k > 0) {   // spring home + a little swirl, so specks travel on curves
          const ex = hx[i] - x, ey = hy[i] - y, s2 = 14 * k * (1 - k)
          ax += (ex * 60 * k - ey * s2) * dt; ay += (ey * 60 * k + ex * s2) * dt
        }
        const dm = Math.exp(-(1.5 + 10 * k) * dt); ax *= dm; ay *= dm; x += ax * dt; y += ay * dt
        if (k > 0.97) {
          const ex = hx[i] - x, ey = hy[i] - y
          if (ex * ex + ey * ey < 0.04 && ax * ax + ay * ay < 4) { x = hx[i]; y = hy[i]; ax = ay = 0 }
          formed++
        }
        b[o] = x; b[o + 1] = y; b[o + 2] = k; vx[i] = ax; vy[i] = ay
      }
      const p = formed / N
      if (Math.abs(p - lastBar) > 0.01) { lastBar = p; bi.style.width = cl(p / 0.8) * 100 + '%' }
      if (phase === 0 && p >= 0.8) startFin()
      if (phase === 1 && (formed >= N * 0.985 || ft > 3.4)) { phase = 2; sw = 0 }
      if (phase === 2) {
        sw += dt; swY = gy - 60 + (gh + 120) * cl(sw / 1.1)
        if (sw > 0.7) { im.style.opacity = 1; fade = Math.max(0, fade - dt / 0.9) }
        if (sw > 1.9) complete()
      }
      if (phase === 3) fade = Math.max(0, fade - dt / 0.5)
      if (!RM) {
        if (on && phase === 0) { const n = (1 + Math.min(3, ptr.spd * 0.12)) | 0; for (let q = 0; q < n; q++) emit(px + (R() - 0.5) * 20, py + (R() - 0.5) * 20, (R() - 0.5) * 50, -R() * 40, 0.5 + R() * 0.6) }
        if (phase === 2) for (let q = 0; q < 5; q++) emit(gx + R() * gw, swY, (R() - 0.5) * 40, -10 - R() * 30, 0.5 + R() * 0.5)
        if (phase === 3 && R() < 0.35) emit(gx + R() * gw, gy + gh * (0.5 + R() * 0.5), (R() - 0.5) * 14, -18 - R() * 16, 2 + R() * 1.5)
      }
      for (let q = 0; q < M; q++) {
        const o = q * 7
        if (sl[q * 2] > 0) { sl[q * 2] -= dt; sb[o] += sv[q * 2] * dt; sb[o + 1] += sv[q * 2 + 1] * dt; sv[q * 2] *= 0.98; sv[q * 2 + 1] *= 0.98; sb[o + 6] = Math.max(0, sl[q * 2] / sl[q * 2 + 1]) * 0.9 }
        else sb[o + 6] = 0
      }
    }
    function draw() {
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT)
      const on = ptr.on || ghost.on
      gl.uniform2f(U.uR, W, H); gl.uniform1f(U.uD, dpr); gl.uniform1f(U.uStep, step); gl.uniform1f(U.uT, tm)
      gl.uniform1f(U.uFade, fade); gl.uniform1f(U.uDust, dust); gl.uniform1f(U.uSwY, swY)
      gl.uniform3f(U.uPt, ptr.on ? ptr.x : ghost.x, ptr.on ? ptr.y : ghost.y, on && phase === 0 ? Math.max(40, gw * 0.18) * 0.9 : 0)
      gl.uniform1f(U.uSp, 0); gl.uniform1f(U.uSz, 2.2); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      bind(bufM); gl.bufferSubData(gl.ARRAY_BUFFER, 0, b); gl.drawArrays(gl.POINTS, 0, N)
      gl.uniform1f(U.uSp, 1); gl.uniform1f(U.uSz, 7); gl.blendFunc(gl.ONE, gl.ONE)
      bind(bufS); gl.bufferSubData(gl.ARRAY_BUFFER, 0, sb); gl.drawArrays(gl.POINTS, 0, M)
    }
    function frame(now) {
      if (!vis) { raf = 0; return }   // sleeps while the section is off-screen
      const dt = Math.min(0.033, (now - last) / 1000); last = now; tm += dt; ptr.spd *= 0.9
      dust += ((phase === 4 ? 0.28 : 1) - dust) * Math.min(1, dt * 2)
      ghost.on = !touched && phase === 0 && tm > 1.4 && tm < 4.8   // a ghost finger shows the idea first
      if (ghost.on) { const u = (tm - 1.4) / 3.4; ghost.x = gx + gw * (0.5 + 0.3 * Math.sin(u * 10)); ghost.y = gy + gh * (0.1 + 0.26 * u); ptr.spd = 14 }
      sim(dt); draw(); raf = requestAnimationFrame(frame)
    }
    const wake = () => { if (vis && !raf && ready && gl) { last = performance.now(); raf = requestAnimationFrame(frame) } }

    // ---------- flow
    function startFin() { if (phase) return; phase = 1; ft = 0; ptr.on = false; hint.style.opacity = 0; bi.style.width = '100%' }
    function complete() {
      phase = 3; tReady = tm; root.dataset.s = 'msg'; root.style.touchAction = 'pan-y'   // page can scroll again
      if (FB) { hint.style.opacity = 1; hint.textContent = 'tap to continue' }
    }
    function again() {
      root.dataset.s = 'rub'; root.style.touchAction = 'none'
      im.style.opacity = 0; phase = 0; fade = 1; swY = -999; touched = true; lastBar = 0; bi.style.width = '0'
      hint.textContent = 'rub the dust to bring us back'; hint.style.opacity = 0.85
      ;[...dots.children].forEach(d => (d.dataset.on = '0')); if (!FB) build()
    }
    function targets(n) {   // draw the words on a hidden canvas, turn their pixels into target points
      const w = Math.round(W), h = Math.round(H)
      if (w <= 0 || h <= 0) return { x: [], y: [], c: [], n: 0, ts: 1.35 }
      const a = document.createElement('canvas'); a.width = w; a.height = h
      const c = a.getContext('2d', { willReadFrequently: true }), S = SL[n], L = []
      const mw = Math.min(W * (W < 500 ? 0.88 : 0.84), 620)
      c.textAlign = 'center'; c.textBaseline = 'middle'
      if ('letterSpacing' in c) c.letterSpacing = W < 500 ? '0.04em' : '0.02em'
      if (S.p) {
        const fs = cl(W * (W < 500 ? 0.064 : 0.052), W < 500 ? 23 : 20, 30)
        c.font = `italic 500 ${fs}px ${font}`; let ln = ''
        for (const wd of S.p.split(' ')) {
          const t = ln ? ln + ' ' + wd : wd
          if (ln && c.measureText(t).width > mw) { L.push([ln, '#f9eff7', fs, 'italic 500']); ln = wd }
          else ln = t
        }
        L.push([ln, '#f9eff7', fs, 'italic 500'])
      } else {
        const hd = !!S.h, [a1, a2] = S.h || S.s
        const f1 = cl(W * (hd ? (W < 500 ? 0.088 : 0.085) : (W < 500 ? 0.068 : 0.06)), hd ? 30 : 23, hd ? 52 : 34)
        L.push(
          [a1, hd ? '#faf2f7' : '#D6A3BC', f1, hd ? '600' : 'italic 500'],
          [a2, hd ? '#D6A3BC' : '#faf2f7', f1 * (hd ? 1.15 : 1.35), 'italic 600']
        )
      }
      const lh = L.map(l => l[2] * (W < 500 ? 1.62 : 1.55))
      let y = H * (W < 500 ? 0.45 : 0.47) - lh.reduce((p, q) => p + q, 0) / 2
      L.forEach((l, i) => {
        y += lh[i] / 2
        c.font = `${l[3]} ${l[2]}px ${font}`
        c.fillStyle = l[1]
        c.fillText(l[0], W / 2, y)
        y += lh[i] / 2
      })
      const d = c.getImageData(0, 0, w, h).data
      let ts = Math.max(1.35, Math.min(1.6, W < 500 ? 1.45 : 1.35)), X, Y, K
      for (let tries = 0; tries < 4; tries++) {
        X = []; Y = []; K = []
        for (let yy = ts / 2; yy < h; yy += ts) for (let xx = ts / 2; xx < w; xx += ts) {
          const i = ((yy | 0) * w + (xx | 0)) * 4
          if (d[i + 3] > 110) {
            X.push(xx); Y.push(yy); K.push(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255)
          }
        }
        if (X.length < N * 0.9) break
        ts *= 1.2
      }
      return { x: X, y: Y, c: K, n: X.length, ts }
    }
    function assign(tg) {   // sort both sides by x so the dust flows in parallel streams instead of crossing wildly
      const T = Math.min(tg.n, N); step = tg.ts
      const idx = Array.from({ length: N }, (_, i) => i).sort((p, q) => b[p * 7] - b[q * 7])
      const ord = Array.from({ length: tg.n }, (_, j) => j).sort((p, q) => tg.x[p] - tg.x[q])
      tk.fill(0)
      for (let j = 0; j < T; j++) {
        const i = idx[Math.floor((j * N) / T)], t = ord[Math.floor((j * tg.n) / T)], o = i * 7
        hx[i] = tg.x[t]; hy[i] = tg.y[t]; b[o + 3] = tg.c[t * 3]; b[o + 4] = tg.c[t * 3 + 1]; b[o + 5] = tg.c[t * 3 + 2]
        tk[i] = 1; b[o + 2] = Math.min(b[o + 2], 0.35)
      }
      for (let i = 0; i < N; i++) { dl[i] = R() * 0.45; vx[i] += (R() - 0.5) * 260; vy[i] += (R() - 0.5) * 260; if (!tk[i]) { hx[i] = R() * W; hy[i] = R() * H } }
    }
    function show(n) {
      if (n < 0 || n >= SL.length || (slide >= 0 && tm < t0 + 0.6)) return   // let the dust settle before the next tap counts
      if (FB) { phase = 4; slide = n; hint.textContent = slText(n); return }
      const first = phase === 3; phase = 4; slide = n; t0 = tm
      if (first) { fade = 1; im.style.opacity = 0 }   // the sticker's own dust lifts off and becomes the words
      assign(targets(n))
      root.dataset.s = n === SL.length - 1 ? 'last' : 'msg'   // drives every Tailwind group-data-[s=...] style below
      ;[...dots.children].forEach((d, i) => (d.dataset.on = i === n ? '1' : '0'))
      sr.textContent = slText(n)
    }
    const next = () => { if (phase >= 3 && tm > tReady + 0.5) show(phase === 3 ? 0 : slide + 1) }
    const prev = () => { if (phase === 4) show(slide - 1) }

    // ---------- input
    const pos = e => { const r = root.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] }
    root.addEventListener('pointerdown', e => {
      if (phase > 0 || e.target.closest('button')) return
      touched = true; [ptr.x, ptr.y] = pos(e); ptr.on = true; hint.style.opacity = 0; root.setPointerCapture(e.pointerId)
    }, { signal })
    root.addEventListener('pointermove', e => { const [x, y] = pos(e); if (ptr.on) ptr.spd = Math.max(ptr.spd, Math.hypot(x - ptr.x, y - ptr.y)); ptr.x = x; ptr.y = y }, { signal })
    ;['pointerup', 'pointercancel'].forEach(v => root.addEventListener(v, () => (ptr.on = false), { signal }))
    root.addEventListener('contextmenu', e => e.preventDefault(), { signal })
    root.addEventListener('click', e => { if (!e.target.closest('button')) next() }, { signal })
    window.addEventListener('keydown', e => {
      if (!vis || phase < 3 || (e.target.closest && e.target.closest('button'))) return
      if (['ArrowRight', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next() } else if (e.key === 'ArrowLeft') prev()
    }, { signal })
    nxRef.current.addEventListener('click', next, { signal })
    foldRef.current.addEventListener('click', again, { signal })
    skipRef.current.addEventListener('click', () => { touched = true; startFin() }, { signal })

    // ---------- start
    const io = new IntersectionObserver(([en]) => { vis = en.isIntersecting; if (vis) wake() }, { threshold: 0.1 })
    io.observe(root)
    function init() {
      if (!im || !im.naturalWidth || !im.naturalHeight) return
      ASP = im.naturalWidth / im.naturalHeight; lay()
      if (!gl) {   // no WebGL: show the sticker, then the words as plain tap-through text
        FB = true; im.style.opacity = 1; ready = true; complete(); return
      }
      setupGL(); build(); ready = true
      let lw = W
      ro = new ResizeObserver(() => { const w = root.clientWidth; if (Math.abs(w - lw) > 20) { lw = w; lay(); if (phase < 3) build() } })
      ro.observe(root); wake()
    }
    if (im.complete && im.naturalWidth) {
      init()
    } else {
      im.addEventListener('load', init, { signal, once: true })
      im.addEventListener('error', () => { console.error('FinalChapter: Failed to load sticker from', src) }, { signal, once: true })
    }

    return () => {
      ac.abort(); io.disconnect(); ro && ro.disconnect(); cancelAnimationFrame(raf)
      if (gl && prog) { gl.deleteBuffer(bufM); gl.deleteBuffer(bufS); gl.deleteProgram(prog) }
      root.dataset.s = 'rub'; root.style.touchAction = ''; im.style.opacity = 0
    }
  }, [src, slides, font])

  return (
    // data-s = rub | msg | last. The engine flips it and the group-data-[s=...] variants below react to it.
    <section
      ref={rootRef}
      data-s="rub"
      aria-label={title}
      className="group relative h-[100svh] min-h-[560px] touch-none select-none overflow-hidden bg-[radial-gradient(ellipse_at_50%_38%,#1b1624_0,#111119_70%)] font-serif text-[#EDE3E8] [-webkit-touch-callout:none]"
    >
      <div className="absolute inset-x-0 top-[2.2%] text-center text-[13px] tracking-[.06em] text-[#a398aa]">{title}</div>

      <div ref={gpRef} className="absolute">
        <img ref={imgRef} src={src} alt={alt} draggable={false} className="pointer-events-none block h-full w-full opacity-0 transition-opacity duration-[900ms] motion-reduce:transition-none" />
      </div>

      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      <p ref={hintRef} className="absolute inset-x-0 bottom-[calc(8%+12px)] m-0 text-center text-[clamp(15px,4vw,19px)] italic opacity-[.85] transition-opacity duration-[600ms]">
        rub the dust to bring us back
      </p>

      <div className="absolute bottom-[8%] left-1/2 h-0.5 w-[min(40%,180px)] -translate-x-1/2 rounded-sm bg-white/[.13] transition-opacity duration-[600ms] group-data-[s=last]:opacity-0 group-data-[s=msg]:opacity-0">
        <i ref={fillRef} className="block h-full w-0 rounded-sm bg-gradient-to-r from-[#C99BB5] to-[#D6A3BC]" />
      </div>

      <button ref={skipRef} type="button" className={`${BTN} absolute bottom-[1.5%] left-1/2 -translate-x-1/2 transition-opacity duration-[600ms] group-data-[s=last]:pointer-events-none group-data-[s=last]:opacity-0 group-data-[s=msg]:pointer-events-none group-data-[s=msg]:opacity-0`}>
        reveal it for me
      </button>

      <button ref={nxRef} type="button" className={`${BTN} pointer-events-none absolute bottom-[5.5%] left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-[600ms] group-data-[s=msg]:pointer-events-auto group-data-[s=msg]:opacity-[.85]`}>
        tap to continue
      </button>

      <button ref={foldRef} type="button" className="pointer-events-none absolute bottom-[5.5%] left-1/2 -translate-x-1/2 cursor-pointer rounded-none border-0 border-b border-white/20 bg-transparent px-0 pb-2 text-[11px] uppercase tracking-[.22em] text-[#8d848f] opacity-0 transition-opacity duration-[800ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6A3BC] group-data-[s=last]:pointer-events-auto group-data-[s=last]:opacity-100 group-data-[s=last]:delay-[2600ms]">
        Fold the letter back
      </button>

      <div ref={dotsRef} aria-hidden="true" className="absolute inset-x-0 bottom-[2.4%] flex justify-center gap-2 opacity-0 transition-opacity duration-[600ms] group-data-[s=last]:opacity-100 group-data-[s=msg]:opacity-100">
        {slides.map((_, i) => (
          <i key={i} data-on="0" className="h-[5px] w-[5px] rounded-full bg-white/20 transition-all duration-[400ms] data-[on=1]:scale-150 data-[on=1]:bg-[#D6A3BC]" />
        ))}
      </div>

      <div ref={srRef} className="sr-only" aria-live="polite" />
    </section>
  )
}