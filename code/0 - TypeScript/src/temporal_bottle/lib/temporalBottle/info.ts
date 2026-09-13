import { timeCostByUse } from "../variables/cache"
import { world } from "@minecraft/server"

export const temporalBottleInfo = new class TemporalBottleInfo {
  timeByTier(tier: number): number {
    return timeCostByUse * (1 << tier) - (tier > 0 ? timeCostByUse * (1 << (tier - 1)) : 0)
  }

  speedMultiplyByTier(tier: number): number {
    return (2 ** (tier +1))
  }

  tickInterval(blockSpeed: number, tier: number): number {
    return Math.ceil((blockSpeed *20) / this.speedMultiplyByTier(tier))
  }
}