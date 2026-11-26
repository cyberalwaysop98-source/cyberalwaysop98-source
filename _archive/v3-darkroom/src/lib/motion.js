/* One motion language. Every animation on the site pulls from here. */

export const ease = {
  out: [0.16, 1, 0.3, 1], // expo-out — entrances, reveals
  inOut: [0.76, 0, 0.24, 1], // quart — transitions between two states
  soft: [0.33, 1, 0.68, 1], // cubic-out — hovers, micro
}

export const dur = {
  micro: 0.22,
  ui: 0.45,
  section: 0.9,
  cinematic: 1.5,
}

export const spring = {
  soft: { type: 'spring', stiffness: 180, damping: 24, mass: 0.9 },
}

export const stagger = { text: 0.035, item: 0.07 }
