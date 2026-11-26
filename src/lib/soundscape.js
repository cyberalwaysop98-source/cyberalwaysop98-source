/* The site's sound — only ever an answer to a click. Pure Web Audio, no
   files, nothing playing in the background.

     press     any link or button: a soft tock with a faint glass overtone,
               pitched a little higher toward the right of the screen
     menu      opening or closing the menu: a short airy sweep
     confirm   copying the address: two notes, a fifth apart

   Signal path: voices → bus → high-pass → glue compressor → limiter (last,
   the ceiling) → out, with one small dark reverb fed by sends and returned
   low. Every method takes an optional start time so it renders offline. */

// A minor pentatonic, low on the left of the screen, high on the right
const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]

function noiseBuffer(ctx, seconds) {
  const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
  const d = b.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) {
    last = last * 0.82 + (Math.random() * 2 - 1) * 0.18
    d[i] = last * 3.2
  }
  return b
}

function impulse(ctx, seconds) {
  const rate = ctx.sampleRate
  const len = Math.floor(rate * seconds)
  const b = ctx.createBuffer(2, len, rate)
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch)
    let lp = 0
    for (let i = 0; i < len; i++) {
      const t = i / rate
      lp = lp * 0.55 + (Math.random() * 2 - 1) * 0.45
      d[i] = lp * Math.pow(1 - t / seconds, 2.8) * Math.min(1, t / 0.012)
    }
  }
  return b
}

export function createSoundscape(ctx, out) {
  const T = (t) => (t == null ? ctx.currentTime : t)
  const gain = (v = 1) => {
    const g = ctx.createGain()
    g.gain.value = v
    return g
  }
  const biq = (type, f, q = 0.707) => {
    const b = ctx.createBiquadFilter()
    b.type = type
    b.frequency.value = f
    b.Q.value = q
    return b
  }
  const comp = (threshold, knee, ratio, attack, release) => {
    const c = ctx.createDynamicsCompressor()
    c.threshold.value = threshold
    c.knee.value = knee
    c.ratio.value = ratio
    c.attack.value = attack
    c.release.value = release
    return c
  }
  const pan = (v = 0) => {
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : gain(1)
    if (p.pan) p.pan.value = v
    return p
  }
  const chain = (...nodes) => {
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1])
    return nodes[nodes.length - 1]
  }

  /* ── bus ── */
  const bus = gain(1)
  chain(bus, biq('highpass', 60), comp(-18, 10, 2.2, 0.005, 0.15), comp(-3, 0, 20, 0.002, 0.08), out)

  /* ── a small room, returned low ── */
  const send = gain(1)
  const verb = ctx.createConvolver()
  verb.buffer = impulse(ctx, 1.6)
  chain(send, verb, biq('highpass', 400), biq('lowpass', 5000), gain(0.18), bus)

  const noise = noiseBuffer(ctx, 1)

  // a struck glass: a few partials, the upper ones dying first
  function bell(freq, at, level, panTo = 0, wet = 0.4) {
    const t = T(at)
    const p = pan(panTo)
    chain(p, bus)
    p.connect(gain(wet)).connect(send)
    ;[
      [1, 1, 0.5],
      [2.76, 0.18, 0.22],
      [5.4, 0.05, 0.1],
    ].forEach(([ratio, lv, decay]) => {
      const o = ctx.createOscillator()
      o.frequency.value = freq * ratio
      const e = gain(0)
      e.gain.setValueAtTime(0, t)
      e.gain.linearRampToValueAtTime(level * lv, t + 0.004)
      e.gain.setTargetAtTime(0, t + 0.004, decay / 4)
      chain(o, e, p)
      o.start(t)
      o.stop(t + decay * 2.2)
    })
  }

  // filtered noise moving through the spectrum
  function sweep(from, to, dur, level, at, q = 1.4, wet = 0.35) {
    const t = T(at)
    const s = ctx.createBufferSource()
    s.buffer = noise
    s.loop = true
    const bp = biq('bandpass', from, q)
    bp.frequency.setValueAtTime(from, t)
    bp.frequency.exponentialRampToValueAtTime(to, t + dur)
    const e = gain(0)
    e.gain.setValueAtTime(0.0001, t)
    e.gain.exponentialRampToValueAtTime(level, t + dur * 0.6)
    e.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    chain(s, bp, e, bus)
    e.connect(gain(wet)).connect(send)
    s.start(t)
    s.stop(t + dur + 0.05)
  }

  let lastPress = -1
  return {
    /* any click on a link or button */
    press(x = 0.5, at) {
      const t = T(at)
      if (t - lastPress < 0.04) return
      lastPress = t
      const k = Math.max(0, Math.min(NOTES.length - 1, Math.floor(x * NOTES.length)))
      const panTo = (x * 2 - 1) * 0.5
      // the body of the tock
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.setValueAtTime(NOTES[k] * 0.5, t)
      o.frequency.exponentialRampToValueAtTime(NOTES[k] * 0.25, t + 0.08)
      const e = gain(0)
      e.gain.setValueAtTime(0, t)
      e.gain.linearRampToValueAtTime(0.09, t + 0.003)
      e.gain.setTargetAtTime(0, t + 0.003, 0.025)
      const p = pan(panTo)
      chain(o, e, p, bus)
      o.start(t)
      o.stop(t + 0.2)
      // a faint glass overtone on top, so it reads as a material, not a beep
      bell(NOTES[k] * 2, t + 0.002, 0.018, panTo, 0.3)
    },

    menu(open, at) {
      const t = T(at)
      sweep(open ? 600 : 2400, open ? 2400 : 600, 0.38, 0.065, t)
      bell(open ? 1318.51 : 880, t + 0.04, 0.032, 0.4)
    },

    /* the address is copied */
    confirm(at) {
      const t = T(at)
      bell(1318.51, t, 0.035, 0.2)
      bell(1760, t + 0.09, 0.04, 0.3)
    },
  }
}
