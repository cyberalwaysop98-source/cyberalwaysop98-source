/* The page-wide projector light, as shared state.

   Sections write to this object; the canvas in components/projector reads it
   once per frame. Nothing here triggers a React render — the light is driven
   from the animation loop, the way a lamp is driven by a dimmer, not by a
   re-shoot. */

export const projector = {
  tint: null, // [r, g, b] 0..1 — a section's override for the light colour
  focus: null, // [x, y] viewport fractions (y down) — where the light lands
  lamp: null, // [x, y] viewport fractions — where it comes from
  covered: false, // an opaque layer fills the screen: skip drawing
  iris: 0, // aperture, 0 closed → 1 open
  irisFrom: 0,
  irisStart: 0,
  irisDur: 0,
}

export const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/* The opening shot: a seven-blade aperture opens on the atmosphere. */
export function openIris(ms = 1900) {
  projector.irisFrom = projector.iris
  projector.irisStart = performance.now()
  projector.irisDur = ms
}

// expo-out, the site's entrance curve
const expoOut = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

export function irisAt(now) {
  if (!projector.irisDur) return projector.iris
  const t = Math.min(1, (now - projector.irisStart) / projector.irisDur)
  projector.iris = projector.irisFrom + (1 - projector.irisFrom) * expoOut(t)
  if (t >= 1) projector.irisDur = 0
  return projector.iris
}
