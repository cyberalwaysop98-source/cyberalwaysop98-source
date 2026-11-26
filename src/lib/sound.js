/* Sound — off by default, chosen at the gate, toggled from the bottom bar.
   It only ever answers a click: one listener catches presses on links and
   buttons; the menu and the copy button play their own sound instead
   (they carry data-sound). Nothing plays in the background, and the audio
   thread sleeps whenever sound is off. */
import { createSoundscape } from './soundscape'

let ctx = null
let master = null
let scape = null
let on = false
const listeners = new Set()

const ensure = () => {
  if (ctx) return true
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return false
  ctx = new AC({ latencyHint: 'interactive' })
  master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)
  scape = createSoundscape(ctx, master)
  return true
}

const live = () => on && scape && ctx.state === 'running'

/* every press on something clickable, except controls that make their own sound */
const onPress = (e) => {
  if (e.button !== 0 && e.pointerType === 'mouse') return
  const el = e.target.closest?.('a[href], button, [role="button"], summary, label')
  if (!el || el.disabled || el.closest('[data-sound]')) return
  press(e.clientX)
}

export function setSound(next) {
  on = next
  try {
    sessionStorage.setItem('as:sound', next ? '1' : '0')
  } catch {
    /* private mode */
  }
  if (next) {
    if (!ensure()) return
    ctx.resume()
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.02)
    document.addEventListener('pointerdown', onPress, { passive: true })
  } else if (ctx) {
    document.removeEventListener('pointerdown', onPress)
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.08)
    setTimeout(() => !on && ctx.suspend(), 600)
  }
  listeners.forEach((fn) => fn(on))
}

export const soundOn = () => on
export const onSound = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const savedSound = () => {
  try {
    return sessionStorage.getItem('as:sound') === '1'
  } catch {
    return false
  }
}

/* a click, pitched by where on the screen it happened */
export const press = (clientX) => live() && scape.press((clientX ?? window.innerWidth / 2) / window.innerWidth)
export const menu = (open) => live() && scape.menu(open)
export const confirm = () => live() && scape.confirm()
