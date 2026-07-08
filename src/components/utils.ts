export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

export function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}
