import { world } from "@minecraft/server"

export const apiNumbers = new class apiNumbers {
  clamp(value: number, min: number, max: number): number { return Math.min(Math.max(value, min), max) }

  wrapRange(value: number, min: number, max: number): number {
    const range = max - min + 1
    return ((value - min) % range + range) % range + min
  }

  random(range: number): number {
    return Math.random() * range
  }

  randomBetween(min: number, max: number): number {
    return Math.random() * (max - min +1) + min
  }
}