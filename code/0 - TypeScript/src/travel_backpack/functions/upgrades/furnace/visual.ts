import { ItemStack } from "@minecraft/server"

export const furnaceFlameIcons: ItemStack[] = Array.from({length: 13})
export const furnaceArrowIcons: ItemStack[] = Array.from({length: 22})

const flameId = "travel_backpack:flame_"
const arrowId = "travel_backpack:arrow_"
export function createFurnaceIcons(): void {
  for(let i = 0; i < 13; i++){
    furnaceFlameIcons[i] = new ItemStack(flameId + i)
  }
  for(let i = 0; i < 22; i++){
    furnaceArrowIcons[i] = new ItemStack(arrowId + i)
  }
}