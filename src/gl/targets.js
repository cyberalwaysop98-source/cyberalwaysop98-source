/* Morph targets — every shape the light takes, as point clouds of the
   same size. Stored as rows of one float texture; the vertex shader reads
   a particle's position in two shapes and blends between them.

   World units: the camera sits at z = 6 with a 35° vertical field, so the
   viewport is ~3.8 units tall at z = 0. */

export const T = {
  DUST: 0, // the field: deep volume, wraps as the camera moves through it
  RING: 1, // the gate
  CODE: 2, // </>
  TYPE: 3, // Aa
  WAVE: 4, // a twisting ribbon
  SPHERE: 5, // a wireframe globe
  POINT: 6, // one point, with a lens streak
  DISC: 7, // contact: a slow disc around the light
}
export const TARGET_COUNT = 8

// seeded so every visit draws the same constellation
function rng(seed = 1337) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const gauss = (r) => {
  const u = Math.max(r(), 1e-6)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

function dust(out, n, r) {
  for (let i = 0; i < n; i++) {
    const o = i * 4
    // 70% in a broad ellipsoid around the axis, 30% thinly everywhere
    if (r() < 0.7) {
      out[o] = gauss(r) * 2.6
      out[o + 1] = gauss(r) * 1.5
    } else {
      out[o] = (r() * 2 - 1) * 7
      out[o + 1] = (r() * 2 - 1) * 4.5
    }
    out[o + 2] = -14 + r() * 17 // [-14, 3], wrapped in the shader
    out[o + 3] = r()
  }
}

function ring(out, n, r) {
  for (let i = 0; i < n; i++) {
    const o = i * 4
    const a = r() * Math.PI * 2
    const rad = 1.32 + gauss(r) * 0.055 + (r() < 0.12 ? gauss(r) * 0.22 : 0)
    out[o] = Math.cos(a) * rad
    out[o + 1] = Math.sin(a) * rad
    out[o + 2] = gauss(r) * 0.08
    out[o + 3] = r()
  }
}

/* sample filled pixels of text drawn on a canvas */
function glyph(out, n, r, text, font, width) {
  const W = 1024
  const H = 512
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let size = 420
  ctx.font = font(size)
  const m = ctx.measureText(text).width
  size = Math.min(size, (size * (W * 0.86)) / m)
  ctx.font = font(size)
  ctx.fillText(text, W / 2, H / 2 + size * 0.04)
  const data = ctx.getImageData(0, 0, W, H).data
  const pts = []
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) if (data[(y * W + x) * 4 + 3] > 140) pts.push(x, y)
  }
  if (!pts.length) return ring(out, n, r) // font failed: never leave the target empty
  const scale = width / (W * 0.86)
  for (let i = 0; i < n; i++) {
    const o = i * 4
    if (r() < 0.05) {
      // a little loose dust around the form, so it reads as light and not as a font
      out[o] = gauss(r) * 1.6
      out[o + 1] = gauss(r) * 0.9
      out[o + 2] = gauss(r) * 0.6
    } else {
      const k = (Math.floor(r() * (pts.length / 2)) | 0) * 2
      out[o] = (pts[k] + r() * 2 - W / 2) * scale
      out[o + 1] = -(pts[k + 1] + r() * 2 - H / 2) * scale
      out[o + 2] = gauss(r) * 0.07
    }
    out[o + 3] = r()
  }
}

function wave(out, n, r) {
  for (let i = 0; i < n; i++) {
    const o = i * 4
    const u = r() * 2 - 1
    const strand = Math.floor(r() * 5) // five strands, phase-shifted: a ribbon of signal
    const v = (strand - 2) / 2 + gauss(r) * 0.03
    const x = u * 2.5
    const twist = u * Math.PI * 1.25
    out[o] = x
    out[o + 1] = Math.sin(u * Math.PI * 1.6) * 0.55 + Math.cos(twist) * v * 0.32
    out[o + 2] = Math.sin(twist) * v * 0.32
    out[o + 3] = r()
  }
}

function sphere(out, n, r) {
  const R = 1.22
  for (let i = 0; i < n; i++) {
    const o = i * 4
    let theta
    let phi
    const pick = r()
    if (pick < 0.36) {
      // latitudes
      phi = (Math.floor(r() * 9) + 1) * (Math.PI / 10)
      theta = r() * Math.PI * 2
    } else if (pick < 0.7) {
      // meridians
      theta = Math.floor(r() * 12) * (Math.PI / 6)
      phi = r() * Math.PI
    } else {
      // a fine shell between them
      theta = r() * Math.PI * 2
      phi = Math.acos(r() * 2 - 1)
    }
    const rr = R + gauss(r) * 0.012
    out[o] = rr * Math.sin(phi) * Math.cos(theta)
    out[o + 1] = rr * Math.cos(phi)
    out[o + 2] = rr * Math.sin(phi) * Math.sin(theta)
    out[o + 3] = r()
  }
}

function point(out, n, r) {
  for (let i = 0; i < n; i++) {
    const o = i * 4
    if (r() < 0.14) {
      // the anamorphic streak through the point
      out[o] = gauss(r) * 0.9
      out[o + 1] = gauss(r) * 0.006
    } else {
      out[o] = gauss(r) * 0.03
      out[o + 1] = gauss(r) * 0.03
    }
    out[o + 2] = gauss(r) * 0.03
    out[o + 3] = r()
  }
}

function disc(out, n, r) {
  for (let i = 0; i < n; i++) {
    const o = i * 4
    // denser toward the inner edge, two faint arms
    const t = Math.pow(r(), 1.8)
    const rad = 0.42 + t * 3.1
    const arm = Math.floor(r() * 2) * Math.PI
    const a = r() < 0.55 ? arm + rad * 1.35 + gauss(r) * 0.35 : r() * Math.PI * 2
    out[o] = Math.cos(a) * rad
    out[o + 1] = gauss(r) * 0.03 * (1 + rad * 0.4)
    out[o + 2] = Math.sin(a) * rad
    out[o + 3] = r()
  }
}

/* rows: particles per target = width * rows; returns one Float32Array
   holding every target back to back */
export function buildTargets(width, rows, { fontsReady = true } = {}) {
  const n = width * rows
  const all = new Float32Array(n * 4 * TARGET_COUNT)
  const slice = (t) => all.subarray(n * 4 * t, n * 4 * (t + 1))
  dust(slice(T.DUST), n, rng(11))
  ring(slice(T.RING), n, rng(22))
  if (fontsReady) {
    glyph(slice(T.CODE), n, rng(33), '</>', (s) => `500 ${s}px "Geist Mono", ui-monospace, monospace`, 3.5)
    glyph(slice(T.TYPE), n, rng(44), 'Aa', (s) => `italic 400 ${s}px "Instrument Serif", Georgia, serif`, 3.1)
  } else {
    ring(slice(T.CODE), n, rng(33))
    ring(slice(T.TYPE), n, rng(44))
  }
  wave(slice(T.WAVE), n, rng(55))
  sphere(slice(T.SPHERE), n, rng(66))
  point(slice(T.POINT), n, rng(77))
  disc(slice(T.DISC), n, rng(88))
  return all
}

/* just the two glyph targets, rebuilt once the webfonts have arrived */
export function buildGlyphTargets(width, rows) {
  const n = width * rows
  const code = new Float32Array(n * 4)
  const type = new Float32Array(n * 4)
  glyph(code, n, rng(33), '</>', (s) => `500 ${s}px "Geist Mono", ui-monospace, monospace`, 3.5)
  glyph(type, n, rng(44), 'Aa', (s) => `italic 400 ${s}px "Instrument Serif", Georgia, serif`, 3.1)
  return { code, type }
}
