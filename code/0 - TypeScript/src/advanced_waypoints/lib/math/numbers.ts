import { world, Vector3 } from "@minecraft/server"
import { Variables } from "../variables"

export const apiNumbers = new class apiNumbers {
  clamp(value: number, min: number, max: number): number { return Math.min(Math.max(value, min), max) }

  randomBetween(min: number, max: number): number {
    return Math.random() * (max - min +1) + min
  }

  calculateCost(playerPos: Vector3, waypointPos: Vector3): number {
    const disX = waypointPos.x - playerPos.x
    const disZ = waypointPos.z - playerPos.z
    return Math.floor(Math.sqrt((disX * disX) + (disZ * disZ)) * Variables.xpByDistance)
  }
}