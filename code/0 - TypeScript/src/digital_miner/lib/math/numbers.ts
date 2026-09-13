import { world } from "@minecraft/server"

export const apiNumbers = new class apiNumbers {
  clamp(value: number, min: number, max: number): number { return Math.min(Math.max(value, min), max) }

  wrapRange(value: number, min: number, max: number): number {
    const range = max - min + 1
    return ((value - min) % range + range) % range + min
  }
}