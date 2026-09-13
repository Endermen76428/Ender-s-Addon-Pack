import { world, ItemStack } from "@minecraft/server"

export const apiWandInfo = new class ApiWandInfo {
  getMaxSize(item: ItemStack): number {
    return wandSize[item.typeId] ?? 3
  }
}

const wandSize: { [key: string]: number } = {
  "builder_wand:wooden_builder_wand": 3,
  "builder_wand:stone_builder_wand": 5,
  "builder_wand:golden_builder_wand": 7,
  "builder_wand:iron_builder_wand": 9,
  "builder_wand:diamond_builder_wand": 16,
  "builder_wand:netherite_builder_wand": 32,
  "builder_wand:creative_builder_wand": 64
}