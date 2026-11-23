import type { Rng } from '../types'

/** RNG that always returns `value`. */
export const constantRng =
  (value: number): Rng =>
  () =>
    value

/** RNG yielding values that map to the given d`sides` faces, in order (then repeats). */
export function facesRng(faces: readonly number[], sides = 10): Rng {
  let i = 0
  return () => {
    const face = faces[i % faces.length]
    i += 1
    return (face - 0.5) / sides
  }
}

/** Small seeded PRNG (mulberry32) for reproducible fuzz-style tests. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
