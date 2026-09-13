import { EntityComponentTypes, EquipmentSlot, ItemStack, ScoreboardObjective, system, world } from "@minecraft/server"
import { restartFurnaceFunction } from "../functions/upgrades/furnace/restart"
import { BACSLoadFurnaceRecipe } from "../functions/upgrades/furnace/recipes"
import { createFurnaceIcons } from "../functions/upgrades/furnace/visual"
import { apiScoreboard } from "../../0-lib/math/scoreboard"
import { addPlayerHoldListen } from "../functions/hold"

export let lockSlotItem: ItemStack
export let coalItem: ItemStack

export const backpackSizeFill: { [key: number]: number } = {
  0: 28,  // 27  slot padrão + 1 upgrade slot
  1: 38,  // 36  slot padrão + 2 upgrade slot
  2: 57,  // 54  slot padrão + 3 upgrade slot
  3: 85,  // 81  slot padrão + 4 upgrade slot
  4: 105, // 100 slot padrão + 5 upgrade slot
  5: 126  // 120 slot padrão + 6 upgrade slot
}

export const backpackTypeTier: { [key: number]: string } = {
  0: "travel_backpack:leather_backpack",
  1: "travel_backpack:copper_backpack",
  2: "travel_backpack:iron_backpack",
  3: "travel_backpack:gold_backpack",
  4: "travel_backpack:diamond_backpack",
  5: "travel_backpack:netherite_backpack"
}

export const backpackSizeTier: { [key: number]: number } = {
  62:  0,
  74:  1,
  89:  2,
  116: 3,
  135: 4,
  155: 5
}

export const backpackUpgradesIndex: { [key: number]: [number, number] } = {
  62:  [27,  1], // Backpack Size, Upgrade Amount
  74:  [36,  2],
  89:  [54,  3],
  116: [81,  4],
  135: [100, 5],
  155: [120, 6]
}

export let furnaceReloadScore: ScoreboardObjective
export let furnaceRecipeScore: ScoreboardObjective
export let BACSFurnaceRecipeScore: ScoreboardObjective
export let BACSFurnaceRecipeDenyScore: ScoreboardObjective

system.run(() => {
  world.gameRules.showTags = false

  furnaceReloadScore = apiScoreboard.getObj("travel_backpack:furnace")
  furnaceRecipeScore = apiScoreboard.getObj("travel_backpack:furnace_r")
  BACSFurnaceRecipeScore = apiScoreboard.getObj("BACS:furnace_recipes")
  BACSFurnaceRecipeDenyScore = apiScoreboard.getObj("BACS:furnace_recipes_deny")

  BACSLoadFurnaceRecipe(BACSFurnaceRecipeScore, BACSFurnaceRecipeDenyScore)

  const players = world.getAllPlayers()

  lockSlotItem = new ItemStack("travel_backpack:lock_slot")
  coalItem = new ItemStack("minecraft:coal")
  createFurnaceIcons()

  restartFurnaceFunction(furnaceReloadScore)

  if(players.length > 0){
    // Adiciona os jogadores ao Listener caso executem um /reload
    for(let i = 0, len = players.length; i < len; i++){
      const player = players[i]
      if(!player) continue

      const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
      if(item?.hasTag("travel_backpack:backpack")){
        addPlayerHoldListen(player, item, player.selectedSlotIndex)
      }
    }
  }
})