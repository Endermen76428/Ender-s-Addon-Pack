import { registerTemporalBottleRecipe } from "../temporalBottle/register/registerHandler"
import { ItemStack, ItemTypes, system } from "@minecraft/server"

export const timeCostByUse = 30 // Base of time cost
export const maxSpeedTier = 8 // Max amount of acelerations

// Last slot with a Temporal Bottle
export const cachePlayerBottleSlot = new Map<string, number>() // Player Id > Slot Index

// Fuel stored in a furnace
export const furnaceFuelStoredAmount = new Map<number, number>() // Pos BitShift > Fuel Amount

system.run(() => {
  // Get all registered items/blocks in the current world, including from addons
  for(const value of ItemTypes.getAll()){
    // Ignore vanilla items, because they can't have their tags changed, optimizing the process
    if(value.id.startsWith("minecraft:")) continue

    // Create the item instance to get its tags and check if it has some tag with BACS comapatibility
    const item = new ItemStack(value)
    const allTags = item.getTags()
    if(allTags.length == 0) continue

    const tags = allTags.filter(tag => tag.startsWith("bedrock_awakening:temporal_bottle"))
    for(const tag of tags){
      // Try register the tag
      registerTemporalBottleRecipe(item.typeId, tag.replace("bedrock_awakening:temporal_bottle:", "").replaceAll("'", "\""))
    }
  }
})