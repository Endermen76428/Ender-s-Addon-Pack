import { world } from "@minecraft/server"

export const apiNumber = new class ApiNumber {
  clamp(value: number, min: number, max: number): number {
    return Math.max(Math.min(value, max), min)
  }
}