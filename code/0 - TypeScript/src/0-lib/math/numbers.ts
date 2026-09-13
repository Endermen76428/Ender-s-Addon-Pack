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
}