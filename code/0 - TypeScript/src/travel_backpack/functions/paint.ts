import { BlockPermutation, Entity } from "@minecraft/server"
import { getBackpackTier } from "../lib/backpack/tier"
import { backpackTypeTier } from "../lib/variables"

export function paintBackpack(entity: Entity, dye: string): void {
  const block = entity.dimension.getBlock(entity.location)
  if(block == undefined || !block.isValid) return

  const tier = getBackpackTier(block.typeId)
  const type = backpackTypeTier[tier]
  if(type == undefined) return

  block.setPermutation(BlockPermutation.resolve(dye == "undye" ? type : type.replace(":", `:${dye}_`), block.permutation.getAllStates()))
}