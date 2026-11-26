import { useEffect, useRef, useState } from 'react'
import { useActiveSection, useFinePointer, useIsMobile, useReducedMotion, getLenis } from '../../lib/hooks'
import { projector, irisAt, openIris } from '../../lib/projector'

/* The projector: one fragment shader on one full-screen triangle, raw WebGL,
   fixed behind the whole page. It began as the hero's atmosphere; now it is
   the light the entire site is shown in, and every chapter sets it
   differently — fog for the title card, a beam on whichever build is
   playing, a single low point of light for the end credits.

   Tiers keep the look and cut the cost (the field is soft noise, so a
   lower-resolution canvas upscaled by CSS reads the same):
     high — desktop: 5 octaves, 0.8× of DPR (≤1.2), pointer-driven light
     mid  — tablets / coarse pointers: 4 octaves, 0.6× resolution
     low  — phones: 3 octaves, 0.45× resolution, 30 fps */
const TIERS = {
  high: { octaves: 5, scale: () => Math.min((window.devicePixelRatio || 1) * 0.8, 1.2), fps: 60, pointer: true, power: 'high-performance' },
  mid: { octaves: 4, scale: () => 0.6, fps: 60, pointer: false, power: 'default' },
  low: { octaves: 3, scale: () => 0.45, fps: 30, pointer: false, power: 'low-power' },
}

/* Chapter lighting. focus/lamp are viewport fractions, y down.
   glow   — ember bloom in the fog        beam  — the projector cone
   dim    — overall exposure              horizon — the hero's lit floor
   point  — collapse to one low light (end credits) */
const EMBER = [1.0, 0.29, 0.11]
const SCENES = {
  top: { glow: 1, beam: 0, dim: 1, horizon: 1, point: 0, focus: [0.7, 0.7], lamp: [-0.1, -0.2] },
  work: { glow: 0.7, beam: 1, dim: 0.95, horizon: 0, point: 0, focus: [0.64, 0.5], lamp: [-0.12, -0.3] },
  experiments: { glow: 0.75, beam: 0, dim: 0.85, horizon: 0.35, point: 0, focus: [0.3, 0.4], lamp: [-0.1, -0.2] },
  capabilities: { glow: 0.45, beam: 0.3, dim: 0.75, horizon: 0, point: 0, focus: [0.78, 0.35], lamp: [1.15, -0.25] },
  about: { glow: 0.3, beam: 0, dim: 0.6, horizon: 0, point: 0, focus: [0.5, 0.5], lamp: [-0.1, -0.2], fps: 20 },
  experience: { glow: 0.55, beam: 0.5, dim: 0.8, horizon: 0, point: 0, focus: [0.22, 0.42], lamp: [1.12, -0.3] },
  statement: { glow: 1, beam: 0, dim: 1, horizon: 0.8, point: 0, focus: [0.5, 0.5], lamp: [-0.1, -0.2] },
  contact: { glow: 1, beam: 0, dim: 1, horizon: 0, point: 1, focus: [0.5, 1.04], lamp: [0.5, -0.3] },
}
export const SCENE_IDS = Object.keys(SCENES)

const VERT = `
  attribute vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const frag = (octaves) => `
  precision highp float;
  uniform float uTime, uGlow, uBeam, uDim, uHorizon, uPoint, uIris, uFlicker;
  uniform vec2  uRes, uMouse, uFocus, uLamp;
  uniform vec3  uTint;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < ${octaves}; i++) { v += a * noise(p); p = p * 2.03 + 13.7; a *= 0.5; }
    return v;
  }

  // viewport fraction (y down) → centred, aspect-correct space
  vec2 toP(vec2 f){ return vec2((f.x - 0.5) * uRes.x / uRes.y, 0.5 - f.y); }

  void main(){
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 p  = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    float frame = floor(uTime * 24.0);

    // gate weave: the picture shivers a hair while the film runs fast
    p.y += (hash(vec2(frame, 4.0)) - 0.5) * 0.006 * uFlicker;

    float t = uTime * 0.055;
    vec2 q = vec2(fbm(p * 1.5 + t), fbm(p * 1.5 + vec2(5.2, 1.3) - t));
    float n = fbm(p * 1.85 + q * 1.35 + uMouse * 0.28);

    vec3 ink  = vec3(0.039, 0.039, 0.043);
    vec3 deep = vec3(0.075, 0.072, 0.094);
    vec3 col  = mix(ink, deep, smoothstep(0.15, 0.95, n));

    // ember bloom in the fog, breathing
    float bloom = smoothstep(0.58, 1.0, n) * (0.62 + 0.38 * sin(uTime * 0.35));
    col += uTint * bloom * 0.17 * uGlow;

    // the pointer carries a small light with it
    float d = length(p - uMouse);
    col += uTint * 0.085 * exp(-d * 3.4) * uGlow;
    col += vec3(0.55, 0.58, 0.7) * 0.045 * exp(-d * 8.0);

    // the beam: a cone from an off-screen lamp to wherever the picture is
    vec2 lamp = toP(uLamp), focus = toP(uFocus);
    vec2 axis = normalize(focus - lamp);
    vec2 rel = p - lamp;
    float along = dot(rel, axis);
    float across = abs(dot(rel, vec2(-axis.y, axis.x)));
    float spread = 0.02 + max(along, 0.0) * 0.19;
    float reach = length(focus - lamp);
    float cone = smoothstep(spread, spread * 0.2, across)
               * smoothstep(0.0, 0.4, along)
               * smoothstep(reach + 0.45, reach - 0.15, along);
    float dust = noise(vec2(along * 7.0 - uTime * 0.5, across * 24.0)) * 0.55 + n * 0.65;
    col += uTint * cone * (0.03 + 0.07 * dust) * uBeam;
    col += uTint * exp(-length(p - focus) * 3.2) * 0.065 * uBeam;

    // the title card's lit floor, falling away toward the top
    col *= mix(1.0, mix(1.06, 0.55, smoothstep(0.15, 1.0, uv.y)), uHorizon);

    // end credits: the room goes down to one low point of light
    vec2 lp = (p - focus) * vec2(0.5, 1.0);
    float ld = length(lp);
    vec3 dawn = uTint * (0.5 * exp(-ld * 6.5) + 0.13 * exp(-ld * 1.8)) * (0.92 + 0.08 * sin(uTime * 0.6));
    col = mix(col, col * 0.55 + dawn, uPoint);

    // exposure
    col = mix(ink, col, uDim);

    // flicker and a stray scratch when the reel is spun hard
    col *= 1.0 + (hash(vec2(frame, 1.0)) - 0.5) * 0.09 * uFlicker;
    float sx = hash(vec2(frame, 7.0));
    float scratch = (1.0 - smoothstep(0.0, 0.0011, abs(uv.x - sx))) * step(0.55, hash(vec2(frame, 3.0)));
    col += scratch * 0.05 * uFlicker;

    // the opening shot: a seven-blade aperture, turning as it opens
    if (uIris < 0.999) {
      float seg = 6.2831853 / 7.0;
      float a = atan(p.y, p.x) + uIris * 1.3;
      float pd = length(p) * cos(mod(a, seg) - seg * 0.5);
      float R = uIris * (0.5 * length(vec2(uRes.x / uRes.y, 1.0)) + 0.06);
      float open = smoothstep(R + 0.004, R - 0.004, pd);
      float rim = exp(-abs(pd - R) * 60.0) * smoothstep(0.0, 0.08, uIris) * (1.0 - smoothstep(0.55, 1.0, uIris));
      col = col * open + uTint * rim * 0.6;
    }

    // dither — dark gradients band badly without it
    col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.007;
    gl_FragColor = vec4(col, 1.0);
  }
`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader compile failed')
  return s
}

// the stand-in: reduced motion, no WebGL, or a lost context
const Still = () => (
  <div
    className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(120%_90%_at_70%_95%,#2a1109_0%,#0a0a0b_60%)]"
    aria-hidden="true"
  />
)

export default function Projector() {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()
  const mobile = useIsMobile()
  const fine = useFinePointer()
  const [failed, setFailed] = useState(false)
  const tier = mobile ? 'low' : fine ? 'high' : 'mid'

  // which chapter is on screen — the same centre-line observer the nav uses
  const scene = useActiveSection(SCENE_IDS)
  const sceneRef = useRef('top')
  sceneRef.current = scene || 'top'

  useEffect(() => {
    if (reduced || failed) return
    const canvas = canvasRef.current
    const cfg = TIERS[tier]
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: cfg.power,
    })
    if (!gl) return setFailed(true)

    let program, vs, fs, buffer
    try {
      vs = compile(gl, gl.VERTEX_SHADER, VERT)
      fs = compile(gl, gl.FRAGMENT_SHADER, frag(cfg.octaves))
      program = gl.createProgram()
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('program link failed')
    } catch {
      return setFailed(true)
    }
    gl.useProgram(program)

    // one triangle that covers the whole viewport
    buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const U = {}
    for (const name of ['uTime', 'uRes', 'uMouse', 'uFocus', 'uLamp', 'uTint', 'uGlow', 'uBeam', 'uDim', 'uHorizon', 'uPoint', 'uIris', 'uFlicker'])
      U[name] = gl.getUniformLocation(program, name)

    const size = () => {
      const s = cfg.scale()
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * s))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * s))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(U.uRes, canvas.width, canvas.height)
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(canvas)

    // aspect-corrected pointer, eased so the light trails the cursor
    const target = { x: 0.35, y: -0.1 }
    const mouse = { x: 0.35, y: -0.1 }
    const onPointer = (e) => {
      const w = window.innerWidth
      const h = window.innerHeight
      target.x = ((e.clientX / w) * 2 - 1) * (w / h) * 0.5
      target.y = -((e.clientY / h) * 2 - 1) * 0.5
    }
    if (cfg.pointer) window.addEventListener('pointermove', onPointer, { passive: true })

    // every lit quantity eases toward its chapter's value — a dimmer, not a cut
    const first = SCENES.top
    const s = {
      glow: first.glow, beam: first.beam, dim: first.dim, horizon: first.horizon, point: first.point,
      fx: first.focus[0], fy: first.focus[1], lx: first.lamp[0], ly: first.lamp[1],
      r: EMBER[0], g: EMBER[1], b: EMBER[2], flicker: 0,
    }

    let raf = 0
    let time = 0
    let last = 0
    let running = false

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const sc = SCENES[sceneRef.current] || first
      const fps = Math.min(cfg.fps, sc.fps || 60)
      if (last && now - last < 1000 / fps - 2) return
      const dt = last ? Math.min(now - last, 100) / 1000 : 0 // a paused page should not jump
      last = now
      if (projector.covered) return
      time += dt

      const k = 1 - Math.pow(1 - 0.04, dt * 60) // frame-rate independent easing
      const focus = projector.focus ?? sc.focus
      const lamp = projector.lamp ?? sc.lamp
      const tint = projector.tint ?? EMBER
      s.glow += (sc.glow - s.glow) * k
      s.beam += (sc.beam - s.beam) * k
      s.dim += (sc.dim - s.dim) * k
      s.horizon += (sc.horizon - s.horizon) * k
      s.point += (sc.point - s.point) * k
      s.fx += (focus[0] - s.fx) * k
      s.fy += (focus[1] - s.fy) * k
      s.lx += (lamp[0] - s.lx) * k
      s.ly += (lamp[1] - s.ly) * k
      s.r += (tint[0] - s.r) * k
      s.g += (tint[1] - s.g) * k
      s.b += (tint[2] - s.b) * k

      // Lenis's own per-frame delta: the faster the reel spins, the more it flickers
      const v = Math.min(Math.abs(getLenis()?.velocity ?? 0) / 45, 1)
      s.flicker += (v - s.flicker) * (v > s.flicker ? 0.25 : 0.06)

      const km = 1 - Math.pow(1 - 0.045, dt * 60)
      mouse.x += (target.x - mouse.x) * km
      mouse.y += (target.y - mouse.y) * km

      gl.uniform1f(U.uTime, time)
      gl.uniform2f(U.uMouse, mouse.x, mouse.y)
      gl.uniform2f(U.uFocus, s.fx, s.fy)
      gl.uniform2f(U.uLamp, s.lx, s.ly)
      gl.uniform3f(U.uTint, s.r, s.g, s.b)
      gl.uniform1f(U.uGlow, s.glow)
      gl.uniform1f(U.uBeam, s.beam)
      gl.uniform1f(U.uDim, s.dim)
      gl.uniform1f(U.uHorizon, s.horizon)
      gl.uniform1f(U.uPoint, s.point)
      gl.uniform1f(U.uIris, irisAt(now))
      gl.uniform1f(U.uFlicker, s.flicker)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    // nothing runs unseen: stop with the tab, resume where it left off
    const start = () => {
      if (running) return
      running = true
      last = 0
      raf = requestAnimationFrame(frame)
      canvas.dataset.state = 'running'
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
      canvas.dataset.state = 'paused'
    }
    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)
    if (!document.hidden) start()

    // the preloader opens the aperture; if anything ever skips that cue,
    // the light must not stay shut
    const safety = setTimeout(() => {
      if (projector.iris < 0.01 && !projector.irisDur) openIris(1200)
    }, 4500)

    const onLost = (e) => {
      e.preventDefault()
      stop()
      setFailed(true)
    }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      stop()
      clearTimeout(safety)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onLost)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.getExtension('WEBGL_lose_context')?.loseContext() // hand the GPU memory back now
    }
  }, [tier, reduced, failed])

  if (reduced || failed) return <Still />

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
      data-projector=""
      data-tier={tier}
    />
  )
}
