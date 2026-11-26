/* ═══════════════════════════════════════════════════════════════
   THE STAGE — raw WebGL2, no 3D library.

   One fixed canvas behind every section's content draws four passes:
     1. the light   — a hot core with halo and an anamorphic streak
     2. the dust    — up to 48k points in ONE draw call. Every point reads
                      its position in two morph targets from a float
                      texture (texelFetch by gl_VertexID) and blends.
     3. the sheets  — the work, on planes that bend like paper as they
                      enter, ripple with scroll speed, lift under the
                      cursor and play their reel on hover
     4. the veil    — the flood into the lit chapter and the iris out
   What each pass does is decided every frame by direct(): a pure
   function of scroll position, time, and the gate state in lib/stage.
   ═══════════════════════════════════════════════════════════════ */
import { stage } from '../lib/stage'
import { getLenis } from '../lib/hooks'
import { T, TARGET_COUNT, buildTargets, buildGlyphTargets } from './targets'

const TEX_W = 256
export const TIERS = {
  high: { rows: 188, dpr: 1.75, size: 2.0 },
  mid: { rows: 96, dpr: 1.5, size: 2.4 },
  low: { rows: 48, dpr: 1.25, size: 2.9 },
}

export function pickTier() {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
  const w = window.innerWidth
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 8
  if (!fine && w < 768) return 'low'
  if (!fine || w < 1100 || cores <= 4 || mem <= 4) return 'mid'
  return 'high'
}

const BONE = [0.91, 0.902, 0.878]
const VOID = [0.035, 0.035, 0.043]

/* ── shaders ─────────────────────────────────────────────────── */

const DUST_VS = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
layout(location = 0) in float aSeed;
uniform sampler2D uTargets;
uniform int uW;
uniform int uRows;
uniform int uFrom;
uniform int uTo;
uniform float uMix;
uniform mat4 uProj;
uniform mat4 uView;
uniform float uTime;
uniform float uCamZ;
uniform float uTurb;
uniform float uSpin;
uniform float uTilt;
uniform float uShape;
uniform float uSize;
uniform float uDpr;
uniform float uAlpha;
uniform float uCoreI;
uniform vec3 uCore;
uniform vec3 uOffset;
uniform float uForm;
uniform vec2 uRes;
uniform vec4 uTrail[8];
uniform vec3 uMouse;
out vec3 vColor;
out float vAlpha;

vec3 fetchT(int t, int id) {
  return texelFetch(uTargets, ivec2(id % uW, id / uW + t * uRows), 0).xyz;
}
vec3 place(int t, vec3 p) {
  if (t == 0) {
    // the field wraps through depth, so the camera can travel forever
    p.z = mod(p.z + uCamZ + 14.0, 17.0) - 14.0;
    return p;
  }
  p *= uShape;
  float c = cos(uSpin), s = sin(uSpin);
  p.xz = mat2(c, s, -s, c) * p.xz;
  c = cos(uTilt); s = sin(uTilt);
  p.yz = mat2(c, s, -s, c) * p.yz;
  return p + uOffset;
}

void main() {
  int id = gl_VertexID;
  float s = aSeed;
  vec3 A = place(uFrom, fetchT(uFrom, id));
  vec3 B = place(uTo, fetchT(uTo, id));
  float st = 0.6;
  float m = clamp(uMix * (1.0 + st) - s * st, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  vec3 p = mix(A, B, m);
  // in transit every point swings out on its own arc instead of sliding
  vec3 h = vec3(fract(s * 91.7), fract(s * 53.3), fract(s * 27.1)) * 2.0 - 1.0;
  p += h * sin(m * 3.14159) * 0.85;

  float t = uTime;
  p += uTurb * vec3(
    sin(t * 0.31 + s * 40.0 + p.y * 0.8),
    cos(t * 0.27 + s * 31.0 + p.x * 0.7),
    sin(t * 0.23 + s * 17.0 + p.z * 0.5)
  ) * (0.35 + 0.65 * fract(s * 7.0));

  vec4 mv = uView * vec4(p, 1.0);
  vec4 clip = uProj * mv;
  float depth = -mv.z;

  // the cursor's wake, in screen space: carried along the path, swirled around it
  vec2 ndc = clip.xy / clip.w;
  float asp = uRes.x / uRes.y;
  vec2 off = vec2(0.0);
  for (int i = 0; i < 8; i++) {
    vec4 tr = uTrail[i];
    vec2 d = (ndc - tr.xy) * vec2(asp, 1.0);
    float f = exp(-dot(d, d) * 18.0);
    float sp = length(tr.zw);
    off += (tr.zw * 5.0 + vec2(-d.y, d.x) * sp * 9.0) * f;
  }
  vec2 dm = (ndc - uMouse.xy) * vec2(asp, 1.0);
  float fm = exp(-dot(dm, dm) * 30.0) * uMouse.z;
  off += normalize(dm + 1e-5) * fm * 0.09;
  off *= clamp(6.0 / max(depth, 0.1), 0.35, 2.0);
  clip.xy += off * vec2(1.0 / asp, 1.0) * clip.w;
  gl_Position = clip;

  float big = step(0.986, s);
  float v = fract(s * 3.7);
  float size = uSize * (0.55 + 1.3 * v * v) * (1.0 + big * 3.2);
  // capped: a point that drifts into the lens must not turn into a screen-sized quad
  gl_PointSize = clamp(size * uDpr * 6.0 / max(depth, 0.1), 1.0, 34.0 * uDpr);

  float fade = smoothstep(17.0, 7.0, depth) * smoothstep(0.3, 1.8, depth);
  float tw = 0.75 + 0.25 * sin(t * 2.1 + s * 80.0);
  float near = exp(-length(p - uCore) * 0.85) * uCoreI;
  vAlpha = uAlpha * (fade * tw * (0.28 + 0.72 * fract(s * 13.7)) * (1.0 - big * 0.8) + near * 0.4 * fade);
  // the grade: warm near the lens, neutral in the middle, cool steel far away
  float dn = clamp((depth - 3.0) / 11.0, 0.0, 1.0);
  vec3 warm = vec3(1.0, 0.86, 0.7);
  vec3 neutral = vec3(0.95, 0.94, 0.91);
  vec3 cool = vec3(0.58, 0.69, 0.86);
  vec3 base = dn < 0.5 ? mix(warm, neutral, dn * 2.0) : mix(neutral, cool, (dn - 0.5) * 2.0);
  // the forms are split-toned: lit warm from the right, cool on the shadow side
  float side = smoothstep(-1.7, 1.7, p.x - p.z * 0.45 - uOffset.x);
  base = mix(base, mix(cool * 1.08, warm * 1.04, side), uForm);
  bool accent = fract(s * 7.13) > 0.92;
  vColor = accent ? vec3(1.0, 0.4, 0.15) : mix(base, vec3(1.0, 0.84, 0.66), clamp(near, 0.0, 1.0));
}`

const DUST_FS = /* glsl */ `#version 300 es
precision highp float;
in vec3 vColor;
in float vAlpha;
out vec4 o;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float r = dot(c, c);
  if (r > 1.0) discard;
  float a = vAlpha * pow(1.0 - r, 1.8);
  o = vec4(vColor * a, a);
}`

const FULL_VS = /* glsl */ `#version 300 es
const vec2 P[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(P[gl_VertexID], 0.0, 1.0); }`

const GLOW_FS = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uCoreS;
uniform float uCoreI;
uniform float uFlash;
uniform vec2 uRes;
uniform float uTime;
out vec4 o;
void main() {
  vec2 d = (gl_FragCoord.xy - uCoreS) / uRes.y;
  float r2 = dot(d, d);
  float r = sqrt(r2);
  float hot = 0.0007 / (r2 + 0.0004);
  float halo = exp(-r * 5.5) * 0.3 + exp(-r * 1.7) * 0.07;
  float streak = exp(-abs(d.y) * 300.0) * exp(-abs(d.x) * 2.4) * 0.55;
  vec3 col = vec3(1.0, 0.96, 0.9) * hot + vec3(1.0, 0.78, 0.58) * halo + vec3(1.0, 0.55, 0.28) * streak;
  // a faint lens-dispersion ring: red a touch wider than blue
  vec3 disp = vec3(
    exp(-pow((r - 0.152) * 42.0, 2.0)),
    exp(-pow((r - 0.146) * 42.0, 2.0)),
    exp(-pow((r - 0.14) * 42.0, 2.0))
  ) * 0.07;
  col += disp;
  col *= uCoreI * (0.97 + 0.03 * sin(uTime * 9.0));
  col += vec3(1.0, 0.95, 0.9) * uFlash * (exp(-r * 1.4) + 0.08);
  // filmic shoulder: highlights roll off instead of clipping
  col = 1.0 - exp(-col * 1.35);
  o = vec4(col, max(col.r, max(col.g, col.b)));
}`

const VEIL_FS = /* glsl */ `#version 300 es
precision highp float;
uniform int uMode;
uniform float uR;
uniform vec2 uC;
uniform vec3 uColor;
uniform vec2 uRes;
uniform float uTime;
out vec4 o;
void main() {
  vec2 d = (gl_FragCoord.xy - uC) / uRes.y;
  float r = length(d);
  float ang = atan(d.y, d.x);
  float wob = (sin(ang * 6.0 + uTime * 1.1) * 0.5 + sin(ang * 11.0 - uTime * 1.7) * 0.3) * 0.014 * smoothstep(0.0, 0.25, uR);
  float e = r + wob;
  float aa = 1.5 / uRes.y;
  float inside = 1.0 - smoothstep(uR - aa, uR + aa, e);
  float cover = uMode == 1 ? inside : 1.0 - inside;
  float rim = exp(-abs(e - uR) * 70.0) * smoothstep(0.0, 0.04, uR) * (1.0 - smoothstep(0.9, 1.3, uR));
  vec3 col = uColor * cover + vec3(1.0, 0.8, 0.6) * rim * 0.85 * (1.0 - cover * 0.55);
  float a = clamp(max(cover, max(col.r, max(col.g, col.b))), 0.0, 1.0);
  o = vec4(min(col, vec3(a)), a);
}`

const PLANE_VS = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 aUv;
uniform vec4 uRect;
uniform vec2 uViewport;
uniform float uVel;
uniform float uHover;
uniform vec2 uHoverPt;
out vec2 vUv;
out float vShade;
void main() {
  vec2 local = (aUv - 0.5) * uRect.zw;
  vec2 center = uRect.xy + uRect.zw * 0.5;
  float vy = (center.y + local.y) / uViewport.y;
  float cy = center.y / uViewport.y;
  // the sheet curls back as it enters at the bottom and leaves at the top
  float below = max(vy - 0.7, 0.0);
  float above = max(0.28 - vy, 0.0);
  float z = -below * below * 2800.0 - above * above * 1700.0;
  // and rolls past the lens like a drum
  z += (aUv.y - 0.5) * uRect.w * (cy - 0.5) * -0.32;
  // scroll speed ripples through it
  z += sin(aUv.x * 3.14159) * sin(aUv.y * 3.14159 + 0.6) * uVel * 6.0;
  // and it lifts toward you under the cursor
  vec2 ar = vec2(uRect.z / uRect.w, 1.0);
  float hd = distance(aUv * ar, uHoverPt * ar);
  z += uHover * (70.0 * exp(-hd * hd * 4.0) + 14.0);
  float k = 1600.0 / (1600.0 - z);
  vec2 pos = center + local * k;
  pos.y -= below * below * 240.0;
  pos.y += above * above * 160.0;
  gl_Position = vec4(pos.x / uViewport.x * 2.0 - 1.0, 1.0 - pos.y / uViewport.y * 2.0, 0.0, 1.0);
  vUv = aUv;
  vShade = clamp(-z / 520.0, 0.0, 1.0);
}`

const PLANE_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
in float vShade;
uniform sampler2D uTex;
uniform sampler2D uReel;
uniform float uReelOn;
uniform float uFrame;
uniform float uReveal;
uniform float uHover;
uniform vec2 uHoverPt;
uniform float uVel;
uniform float uTime;
out vec4 o;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
vec3 img(vec2 uv) {
  uv = clamp(uv, 0.001, 0.999);
  vec3 still = texture(uTex, uv).rgb;
  if (uReelOn < 0.002) return still;
  float fa = floor(uFrame);
  float fb = mod(fa + 1.0, 6.0);
  float x = smoothstep(0.72, 1.0, fract(uFrame));
  vec3 a = texture(uReel, vec2(uv.x, (fa * 818.0 + uv.y * 800.0) / 4890.0)).rgb;
  vec3 b = texture(uReel, vec2(uv.x, (fb * 818.0 + uv.y * 800.0) / 4890.0)).rgb;
  return mix(still, mix(a, b, x), uReelOn);
}
void main() {
  vec2 uv = (vUv - uHoverPt) / (1.0 + 0.07 * uHover) + uHoverPt;
  float sh = clamp(uVel * 0.0011, -0.025, 0.025);
  vec3 col = vec3(img(uv + vec2(0.0, sh)).r, img(uv).g, img(uv - vec2(0.0, sh)).b);
  // developed by light: a noisy edge climbs the sheet, hot where it burns through
  float q = 1.0 - vUv.y + noise(vUv * vec2(9.0, 3.0) + uTime * 0.15) * 0.18;
  float edge = uReveal * 1.3;
  float mask = 1.0 - smoothstep(edge - 0.06, edge, q);
  float rim = exp(-abs(q - edge) * 34.0) * (1.0 - step(0.999, uReveal)) * step(0.001, uReveal);
  // the grade: S-curve, a little less saturation, warm highlights, teal shadows
  vec3 raw = col;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 g = mix(vec3(l), col, 0.88);
  g = mix(g, g * g * (3.0 - 2.0 * g), 0.35);
  g += vec3(0.045, 0.012, -0.03) * smoothstep(0.45, 1.0, l);
  g += vec3(-0.02, 0.012, 0.04) * (1.0 - smoothstep(0.0, 0.42, l));
  // halation: the brightest parts bleed a warm red into their surroundings
  float hl = 0.0;
  for (int k = 0; k < 4; k++) {
    vec2 o = vec2(cos(float(k) * 1.5708), sin(float(k) * 1.5708)) * 0.012;
    vec3 c = texture(uTex, clamp(uv + o, 0.001, 0.999)).rgb;
    hl += smoothstep(0.72, 1.0, dot(c, vec3(0.299, 0.587, 0.114)));
  }
  g += vec3(0.16, 0.05, 0.0) * hl * 0.25;
  // grain
  g += (hash(gl_FragCoord.xy + fract(uTime * 7.0) * 113.0) - 0.5) * 0.045;
  // hover releases the grade: the real colours of the real site
  col = mix(g, raw, uHover * 0.85);
  col *= 1.0 - vShade * 0.62;
  vec2 e = vUv * (1.0 - vUv);
  col *= mix(0.86, 1.0, pow(clamp(e.x * e.y * 16.0, 0.0, 1.0), 0.15));
  col += vec3(1.0, 0.62, 0.34) * rim * 0.9;
  float a = clamp(mask + rim * 0.6, 0.0, 1.0);
  o = vec4(min(col, vec3(1.0)) * a, a);
}`

/* ── tiny GL helpers ─────────────────────────────────────────── */

function program(gl, vs, fs) {
  const p = gl.createProgram()
  for (const [type, src] of [
    [gl.VERTEX_SHADER, vs],
    [gl.FRAGMENT_SHADER, fs],
  ]) {
    const sh = gl.createShader(type)
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader')
    gl.attachShader(p, sh)
  }
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link')
  const u = {}
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i)
    const name = info.name.replace(/\[0\]$/, '')
    u[name] = gl.getUniformLocation(p, info.name)
  }
  return { p, u }
}

function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2)
  const nf = 1 / (near - far)
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0])
}
function translation(x, y, z) {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1])
}
// column-major mat4 · vec4
function project(P, V, p) {
  const v = [0, 1, 2, 3].map((r) => V[r] * p[0] + V[4 + r] * p[1] + V[8 + r] * p[2] + V[12 + r])
  return [0, 1, 2, 3].map((r) => P[r] * v[0] + P[4 + r] * v[1] + P[8 + r] * v[2] + P[12 + r] * v[3])
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const lerp = (a, b, k) => a + (b - a) * k
// the frame's length in 60Hz frames, set each frame: smoothing written as
// "k per frame at 60Hz" then feels the same at 60, 120 or 144Hz
let fk = 1
const ease = (k) => 1 - Math.pow(1 - k, fk)

/* ── the stage ───────────────────────────────────────────────── */

export function createStage(canvas, tier) {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  })
  if (!gl) return null

  const cfg = TIERS[tier]
  const rows = cfg.rows
  const N = TEX_W * rows
  const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE)

  const dust = program(gl, DUST_VS, DUST_FS)
  const glow = program(gl, FULL_VS, GLOW_FS)
  const veil = program(gl, FULL_VS, VEIL_FS)
  const plane = program(gl, PLANE_VS, PLANE_FS)

  // per-point seed — the only attribute; positions live in the texture
  const dustVao = gl.createVertexArray()
  gl.bindVertexArray(dustVao)
  const seeds = new Float32Array(N)
  for (let i = 0; i < N; i++) seeds[i] = ((i * 0.6180339887 + Math.sin(i * 12.9898) * 0.5) % 1 + 1) % 1
  const seedBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf)
  gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0)

  const fontsReady = document.fonts?.check?.('500 40px "Geist Mono"') && document.fonts?.check?.('italic 40px "Instrument Serif"')
  const targetTex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, targetTex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TEX_W, rows * TARGET_COUNT, 0, gl.RGBA, gl.FLOAT, buildTargets(TEX_W, rows, { fontsReady }))
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  // fullscreen passes draw a single triangle from gl_VertexID
  const emptyVao = gl.createVertexArray()

  // the sheet: a grid fine enough to bend smoothly
  const SX = 32
  const SY = 20
  const planeVao = gl.createVertexArray()
  gl.bindVertexArray(planeVao)
  const uv = []
  for (let y = 0; y <= SY; y++) for (let x = 0; x <= SX; x++) uv.push(x / SX, y / SY)
  const idx = []
  for (let y = 0; y < SY; y++)
    for (let x = 0; x < SX; x++) {
      const a = y * (SX + 1) + x
      idx.push(a, a + 1, a + SX + 1, a + 1, a + SX + 2, a + SX + 1)
    }
  const uvBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  const idxBuf = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW)
  gl.bindVertexArray(null)

  // a 1px placeholder so every sampler is always valid
  const blank = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, blank)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 20, 22, 255]))

  /* Textures are decoded off the main thread (createImageBitmap) and
     uploaded by the frame loop one small job at a time, so an image arriving
     never costs a frame. Reels (1280×4890) go up in strips across frames. */
  const textures = new Map() // url → { tex, ready }
  const uploads = [] // pending GPU jobs, at most one per frame
  const loadTexture = (url, done, { reel = false } = {}) => {
    if (textures.has(url)) return textures.get(url)
    const rec = { tex: null, ready: false }
    textures.set(url, rec)
    fetch(url)
      .then((r) => r.blob())
      .then((b) => createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }))
      .then((bmp) => {
        if (destroyed) return bmp.close?.()
        const tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texStorage2D(gl.TEXTURE_2D, reel ? 1 : Math.floor(Math.log2(Math.max(bmp.width, bmp.height))) + 1, gl.RGBA8, bmp.width, bmp.height)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, reel ? gl.LINEAR : gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        const strips = reel ? 6 : 1
        const rowsPer = Math.ceil(bmp.height / strips)
        for (let k = 0; k < strips; k++) {
          uploads.push(() => {
            const y0 = k * rowsPer
            const h = Math.min(rowsPer, bmp.height - y0)
            gl.bindTexture(gl.TEXTURE_2D, tex)
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
            gl.pixelStorei(gl.UNPACK_SKIP_ROWS, y0)
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, y0, bmp.width, h, gl.RGBA, gl.UNSIGNED_BYTE, bmp)
            gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0)
            if (k === strips - 1) {
              if (!reel) gl.generateMipmap(gl.TEXTURE_2D)
              bmp.close?.()
              rec.tex = tex
              rec.ready = true
              done?.()
            }
          })
        }
      })
      .catch(() => textures.delete(url))
    return rec
  }

  const V = translation(0, 0, -6) // reused every frame: no per-frame allocation

  /* ── sizing ── */
  let dpr = Math.min(window.devicePixelRatio || 1, cfg.dpr)
  let vw = 1
  let vh = 1
  let P = perspective((35 * Math.PI) / 180, 1, 0.1, 100)
  let halfH = Math.tan((17.5 * Math.PI) / 180) * 6
  const resize = () => {
    vw = window.innerWidth
    vh = window.innerHeight
    canvas.width = Math.round(vw * dpr)
    canvas.height = Math.round(vh * dpr)
    P = perspective((35 * Math.PI) / 180, vw / vh, 0.1, 100)
    halfH = Math.tan((17.5 * Math.PI) / 180) * 6
  }
  resize()

  /* ── smoothed state ── */
  const S = { form: 0, alpha: 0, coreI: 0, turb: 0.15, size: cfg.size, camX: 0, camY: 0, spin: 0, tilt: 0, mouseOn: 0, vel: 0, load: 0, flash: 0 }
  const trail = Array.from({ length: 8 }, () => [9, 9, 0, 0])
  const trailFlat = new Float32Array(32)
  let trailHead = 0
  let lastM = null
  let frameCount = 0
  let trailClock = 0
  let destroyed = false
  let slow = 0

  /* What the light is doing, as a pure function of where the page is. */
  function direct(t) {
    const y = window.scrollY
    const ch = stage.chapters
    const prog = (c) => (c ? clamp((y - c.top) / Math.max(1, c.height - vh)) : 0)
    const enter = (c) => (c ? clamp((y + vh - c.top) / vh) : 0)
    const maxR = Math.hypot(vw / vh, 1) * 0.5 + 0.06

    const d = {
      from: T.DUST,
      to: T.DUST,
      mix: 0,
      alpha: 1,
      turb: 0.16,
      size: cfg.size,
      spin: 0,
      tilt: 0,
      shape: Math.min(1, ((vw / vh) * halfH * 0.86) / 1.75),
      core: [0, 0, 0],
      offset: [0, 0, 0],
      form: 0,
      coreI: 1,
      camZ: t * 0.12,
      hard: false,
      flash: 0,
      veil: 0,
      veilR: 0,
      veilColor: BONE,
      planes: true,
    }

    // ── the gate: dust gathers into a ring as the page actually loads
    if (stage.intro < 1) {
      const k = stage.intro
      if (k <= 0) {
        S.load = lerp(S.load, stage.load, ease(0.06))
        Object.assign(d, { from: T.DUST, to: T.RING, mix: easeInOut(S.load), alpha: 0.9, coreI: 0, turb: 0.1 })
      } else if (k < 0.3) {
        const q = easeInOut(k / 0.3)
        Object.assign(d, { from: T.RING, to: T.POINT, mix: q, coreI: q * 0.9, turb: 0.06 })
      } else {
        const q = (k - 0.3) / 0.7
        Object.assign(d, { from: T.POINT, to: T.DUST, mix: easeOut(q), coreI: 1, flash: Math.max(0, 1 - q * 2.4) * 1.05 })
      }
      d.planes = false
      return d
    }

    // ── hero → intro: diving through the field, past the light
    const intro = ch.intro
    const dive = intro ? clamp(y / Math.max(1, intro.top + intro.height - vh)) : 0
    d.camZ = t * 0.12 + dive * 13
    d.core = [0, dive * 2.0, -dive * 9]
    d.coreI = 1 - smooth(0.1, 0.7, dive)

    // ── work: the field dims behind the sheets
    const work = ch.work
    if (work) {
      const w = smooth(0, 1, (y + vh - work.top) / vh) * (1 - smooth(0, 1, (y + vh * 0.3 - (work.top + work.height)) / vh))
      d.alpha *= 1 - 0.62 * w
    }

    // ── method: four forms, then one point, then the flood
    const method = ch.method
    if (method && y + vh > method.top) {
      const e = enter(method)
      const pm = prog(method)
      d.core = [0, 0, 0]
      d.alpha = 1
      d.turb = lerp(0.16, 0.025, e)
      d.size = cfg.size * 1.1
      d.form = e
      d.spin = Math.sin(t * 0.35) * 0.32 + S.camX * 1.6
      const seq = [
        [0.0, 0.12, T.CODE, T.CODE],
        [0.12, 0.22, T.CODE, T.TYPE],
        [0.22, 0.32, T.TYPE, T.TYPE],
        [0.32, 0.42, T.TYPE, T.WAVE],
        [0.42, 0.52, T.WAVE, T.WAVE],
        [0.52, 0.62, T.WAVE, T.SPHERE],
        [0.62, 0.7, T.SPHERE, T.SPHERE],
        [0.7, 0.8, T.SPHERE, T.POINT],
        [0.8, 1.01, T.POINT, T.POINT],
      ]
      if (pm <= 0) {
        Object.assign(d, { from: T.DUST, to: T.CODE, mix: e, coreI: 0 })
      } else {
        const s = seq.find((r) => pm < r[1]) || seq[seq.length - 1]
        d.from = s[2]
        d.to = s[3]
        d.mix = s[2] === s[3] ? 0 : (pm - s[0]) / (s[1] - s[0])
        if (s[2] === T.SPHERE || s[3] === T.SPHERE) d.spin += pm * 6
        d.coreI = smooth(0.74, 0.82, pm) * 1.35
      }
      // the point flares and floods the frame with light
      const f = clamp((pm - 0.86) / 0.12)
      if (f > 0) {
        d.veil = 1
        d.veilR = Math.pow(f, 2.2) * maxR
        d.flash = smooth(0, 0.25, f) * (1 - smooth(0.5, 1, f)) * 0.6
      }
      // still covered until the dark section has fully scrolled away
      if (pm >= 1 && y < method.top + method.height) {
        d.veil = 1
        d.veilR = maxR
      }
      d.planes = false
    }

    // ── the lit chapter: nothing to draw
    const paper = ch.paper
    if (paper && y >= paper.top && y + vh <= paper.top + paper.height) {
      d.alpha = 0
      d.coreI = 0
      d.veil = 0
      d.hard = true
    }

    // ── iris: the lit page condenses back into one point
    const iris = ch.iris
    if (iris && y + vh > iris.top) {
      const pi = prog(iris)
      d.hard = false
      d.veil = 2
      d.veilColor = VOID
      d.veilR = (1 - easeInOut(pi)) * maxR
      d.from = T.POINT
      d.to = T.POINT
      d.core = [0, 0, 0]
      d.coreI = smooth(0.8, 1, pi) * 1.2
      d.alpha = smooth(0.9, 1, pi)
      d.planes = false
      if (pi <= 0 && y + vh <= iris.top + vh * 0.001) d.veil = 0
      if (y >= iris.top + iris.height) d.veil = 0
    }

    // ── contact: the light returns, with a slow disc of dust around it
    const contact = ch.contact
    if (contact && y + vh > contact.top) {
      const e = enter(contact)
      // the light holds the centre until the section arrives, then travels with it
      const sy = Math.min(vh / 2, contact.top - y + Math.min(contact.height, vh) / 2)
      const wy = (1 - (2 * sy) / vh) * halfH
      Object.assign(d, { from: T.POINT, to: T.DISC, mix: e, alpha: 1, core: [0, wy, 0], offset: [0, wy, 0], coreI: 1, turb: 0.03, tilt: 0.38, hard: false, form: 1 })
      d.spin = t * 0.045 + S.camX
      // and dims as the footer comes up
      const leave = clamp((y - contact.top) / Math.max(1, contact.height))
      d.alpha *= 1 - leave * 0.7
      d.coreI *= 1 - leave * 0.75
      if (iris && y < iris.top + iris.height) {
        d.veil = 2
        d.veilColor = VOID
        d.veilR = 0
      }
    }
    return d
  }

  function drawVeil(d, t) {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.useProgram(veil.p)
    gl.bindVertexArray(emptyVao)
    gl.uniform1i(veil.u.uMode, d.veil)
    gl.uniform1f(veil.u.uR, d.veilR)
    gl.uniform2f(veil.u.uC, canvas.width / 2, canvas.height / 2)
    gl.uniform3f(veil.u.uColor, d.veilColor[0], d.veilColor[1], d.veilColor[2])
    gl.uniform2f(veil.u.uRes, canvas.width, canvas.height)
    gl.uniform1f(veil.u.uTime, t)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  function frame(time) {
    if (destroyed || stage.covered || document.hidden) return
    const t = time
    frameCount++
    const d = direct(t)

    // pointer → camera parallax and the trail
    const m = stage.mouse
    const mx = m.on ? (m.x / vw) * 2 - 1 : 0
    const my = m.on ? 1 - (m.y / vh) * 2 : 0
    S.camX = lerp(S.camX, mx * 0.16, ease(0.04))
    S.camY = lerp(S.camY, my * 0.1, ease(0.04))
    S.mouseOn = lerp(S.mouseOn, m.on ? 1 : 0, ease(0.08))
    if (m.on) {
      if (lastM) {
        const vx = (mx - lastM[0]) * (vw / vh)
        const vy = my - lastM[1]
        if (vx * vx + vy * vy > 1e-6 && (trailClock += fk) >= 2) {
          trailClock = 0
          trail[trailHead] = [mx, my, vx, vy]
          trailHead = (trailHead + 1) % 8
        }
      }
      lastM = [mx, my]
    } else lastM = null
    for (let i = 0; i < 8; i++) {
      const tr = trail[i]
      const decay = Math.pow(0.93, fk)
      tr[2] *= decay
      tr[3] *= decay
      trailFlat.set(tr, i * 4)
    }

    S.alpha = d.hard ? 0 : lerp(S.alpha, d.alpha, ease(0.07))
    S.coreI = d.hard ? 0 : lerp(S.coreI, d.coreI, ease(0.09))
    S.turb = lerp(S.turb, d.turb, ease(0.05))
    S.size = lerp(S.size, d.size, ease(0.05))
    S.flash = lerp(S.flash, d.flash, ease(0.25))
    S.tilt = lerp(S.tilt, d.tilt, ease(0.05))
    S.form = lerp(S.form, d.form, ease(0.05))
    S.vel = lerp(S.vel, getLenis()?.velocity || 0, ease(0.12))

    if (uploads.length) uploads.shift()()
    V[12] = -S.camX
    V[13] = -S.camY
    const coreClip = project(P, V, d.core)
    const cx = (coreClip[0] / coreClip[3]) * 0.5 + 0.5
    const cy = (coreClip[1] / coreClip[3]) * 0.5 + 0.5
    stage.core.x = cx * vw
    stage.core.y = (1 - cy) * vh
    stage.core.i = S.coreI

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)

    // the iris is the dark the returning light sits on: it goes first
    if (d.veil === 2) drawVeil(d, t)

    // 1 · the light
    if (S.coreI > 0.003 || S.flash > 0.003) {
      gl.blendFunc(gl.ONE, gl.ONE)
      gl.useProgram(glow.p)
      gl.bindVertexArray(emptyVao)
      gl.uniform2f(glow.u.uCoreS, cx * canvas.width, cy * canvas.height)
      gl.uniform1f(glow.u.uCoreI, S.coreI)
      gl.uniform1f(glow.u.uFlash, S.flash)
      gl.uniform2f(glow.u.uRes, canvas.width, canvas.height)
      gl.uniform1f(glow.u.uTime, t)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    // 2 · the dust
    if (S.alpha > 0.003) {
      gl.blendFunc(gl.ONE, gl.ONE)
      gl.useProgram(dust.p)
      gl.bindVertexArray(dustVao)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, targetTex)
      const u = dust.u
      gl.uniform1i(u.uTargets, 0)
      gl.uniform1i(u.uW, TEX_W)
      gl.uniform1i(u.uRows, rows)
      gl.uniform1i(u.uFrom, d.from)
      gl.uniform1i(u.uTo, d.to)
      gl.uniform1f(u.uMix, clamp(d.mix))
      gl.uniformMatrix4fv(u.uProj, false, P)
      gl.uniformMatrix4fv(u.uView, false, V)
      gl.uniform1f(u.uTime, t)
      gl.uniform1f(u.uCamZ, d.camZ)
      gl.uniform1f(u.uTurb, S.turb)
      gl.uniform1f(u.uSpin, d.spin)
      gl.uniform1f(u.uTilt, S.tilt)
      gl.uniform1f(u.uShape, d.shape)
      gl.uniform1f(u.uSize, S.size)
      gl.uniform1f(u.uDpr, dpr)
      gl.uniform1f(u.uAlpha, S.alpha)
      gl.uniform1f(u.uCoreI, S.coreI)
      gl.uniform3f(u.uCore, d.core[0], d.core[1], d.core[2])
      gl.uniform3f(u.uOffset, d.offset[0], d.offset[1], d.offset[2])
      gl.uniform1f(u.uForm, S.form)
      gl.uniform2f(u.uRes, canvas.width, canvas.height)
      gl.uniform4fv(u.uTrail, trailFlat)
      gl.uniform3f(u.uMouse, mx, my, S.mouseOn)
      gl.drawArrays(gl.POINTS, 0, drawN)
    }

    // 3 · the sheets
    if (d.planes && stage.planes.size) {
      const y = window.scrollY
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.useProgram(plane.p)
      gl.bindVertexArray(planeVao)
      const u = plane.u
      gl.uniform2f(u.uViewport, vw, vh)
      gl.uniform1f(u.uVel, S.vel)
      gl.uniform1f(u.uTime, t)
      gl.uniform1i(u.uTex, 0)
      gl.uniform1i(u.uReel, 1)
      for (const p of stage.planes.values()) {
        const top = p.top - y
        if (!p.width || top > vh + 60 || top + p.height < -60) continue
        const still = loadTexture(p.src, () => p.el.setAttribute('data-gl', 'on'))
        if (!still.ready) continue
        p.h = lerp(p.h || 0, p.hover ? 1 : 0, ease(0.075))
        let reel = null
        if (p.hover && p.reel && maxTex >= 4890) reel = loadTexture(p.reel, null, { reel: true })
        else if (p.reel && textures.has(p.reel)) reel = textures.get(p.reel)
        const reelReady = reel?.ready
        p.r = lerp(p.r || 0, p.hover && reelReady ? 1 : 0, ease(0.06))
        p.frame = ((p.frame || 0) + (p.hover ? fk / 42 : 0)) % 6
        if (m.on && p.hover) {
          p.hx = lerp(p.hx ?? 0.5, clamp((m.x - p.left) / p.width), ease(0.12))
          p.hy = lerp(p.hy ?? 0.5, clamp((m.y - top) / p.height), ease(0.12))
        }
        gl.uniform4f(u.uRect, p.left, top, p.width, p.height)
        gl.uniform1f(u.uHover, p.h)
        gl.uniform2f(u.uHoverPt, p.hx ?? 0.5, p.hy ?? 0.5)
        gl.uniform1f(u.uReveal, p.reveal ?? 1)
        gl.uniform1f(u.uReelOn, p.r)
        gl.uniform1f(u.uFrame, p.frame)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, still.tex)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, reelReady ? reel.tex : blank)
        gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0)
      }
    }

    // 4 · the flood covers everything drawn before it
    if (d.veil === 1) drawVeil(d, t)
    gl.bindVertexArray(null)
  }

  /* The frame governor. It learns the display's real refresh interval
     (8.3ms on 120Hz, 6.9ms on 144Hz, 16.7ms on 60Hz) from the first frames,
     then watches for frames that overrun it. Too many in a window and the
     light gets cheaper — first its resolution, then how many points it
     draws; a long run of headroom earns them back. The page never stutters
     to keep the light pretty. */
  let drawN = N
  let last = performance.now()
  let interval = 0
  const learn = []
  let win = 0
  let late = 0
  let calm = 0
  const DPR_MAX = dpr
  const tick = (time) => {
    const now = performance.now()
    const dt = now - last
    last = now
    if (dt > 0 && dt < 250 && !document.hidden) {
      if (!interval) {
        learn.push(dt)
        if (learn.length === 45) {
          learn.sort((a, b) => a - b)
          interval = Math.max(4, learn[22])
        }
      } else {
        win++
        if (dt > interval * 1.6) late++
        if (win >= 90) {
          const rate = late / win
          if (rate > 0.08) {
            calm = 0
            if (dpr > 1.01) {
              dpr = Math.max(1, dpr - 0.25)
              resize()
            } else if (drawN > N * 0.4) drawN = Math.floor(drawN * 0.8)
            slow++
          } else if (rate < 0.01 && ++calm >= 4) {
            calm = 0
            if (drawN < N) drawN = Math.min(N, Math.ceil(drawN * 1.15))
            else if (dpr < DPR_MAX - 0.01) {
              dpr = Math.min(DPR_MAX, dpr + 0.25)
              resize()
            }
          }
          win = 0
          late = 0
        }
      }
    }
    fk = Math.min(Math.max(dt, 1), 100) / (1000 / 60)
    frame(time)
  }

  const onFonts = () => {
    if (destroyed) return
    const g = buildGlyphTargets(TEX_W, rows)
    gl.bindTexture(gl.TEXTURE_2D, targetTex)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, T.CODE * rows, TEX_W, rows, gl.RGBA, gl.FLOAT, g.code)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, T.TYPE * rows, TEX_W, rows, gl.RGBA, gl.FLOAT, g.type)
  }

  return {
    tick,
    resize,
    onFonts,
    count: N,
    info: () => ({ tier, count: drawN, dpr: Math.round(dpr * 100) / 100, slow, refresh: interval ? Math.round(1000 / interval) : null }),
    // fetch and upload the work's stills while nothing is happening, before anyone scrolls to them
    preload: (urls) => urls.forEach((u) => loadTexture(u)),
    // Release everything this stage made, but leave the context alive: React
    // StrictMode (and hot reload) mount again on the same canvas, and a lost
    // context would leave the second mount with no light at all.
    destroy() {
      destroyed = true
      for (const prog of [dust, glow, veil, plane]) gl.deleteProgram(prog.p)
      for (const vao of [dustVao, emptyVao, planeVao]) gl.deleteVertexArray(vao)
      for (const buf of [seedBuf, uvBuf, idxBuf]) gl.deleteBuffer(buf)
      gl.deleteTexture(targetTex)
      gl.deleteTexture(blank)
      for (const rec of textures.values()) if (rec.tex) gl.deleteTexture(rec.tex)
      textures.clear()
    },
  }
}
