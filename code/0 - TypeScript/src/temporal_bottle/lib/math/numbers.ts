import { world } from "@minecraft/server"

export const apiNumbers = new class apiNumbers {
  clamp(value: number, min: number, max: number): number { return Math.min(Math.max(value, min), max) }

  isOutRange(value: number, min: number, max: number): boolean { return value < min || value > max }

  random(range: number): number {
    return Math.random() * range
  }

  randomBetween(min: number, max: number): number {
    return Math.random() * (max - min +1) + min
  }

  distance(num1: number, num2: number): number { return Math.sqrt((num1 - num2) ** 2 + (num1 - num2) ** 2) }
}