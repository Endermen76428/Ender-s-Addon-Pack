import { Variables } from "../../advanced_waypoints/lib/variables"
import { Vector3 } from "@minecraft/server"

export const apiNumbers = new class apiNumbers {
  clamp(value: number, min: number, max: number): number { return Math.min(Math.max(value, min), max) }

  isOutRange(value: number, min: number, max: number): boolean { return value < min || value > max }

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

  calculateCost(playerPos: Vector3, waypointPos: Vector3): number {
    const disX = waypointPos.x - playerPos.x
    const disZ = waypointPos.z - playerPos.z
    return Math.floor(Math.sqrt((disX * disX) + (disZ * disZ)) * Variables.xpByDistance)
  }

  randomSeed(seed: string): number {
    let num = stringToSeed(seed)
    let t = num += 0x6D2B79F5
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function stringToSeed(text: string): number {
  let seed = 0
  for (let i = 0; i < text.length; i++) seed = Math.imul(seed, 31) + text.charCodeAt(i) | 0
  return seed
}