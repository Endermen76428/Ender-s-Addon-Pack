import { Container, Dimension, EntityComponentTypes, EquipmentSlot, ItemStack, ScoreboardObjective, system, world } from "@minecraft/server"
import { feedUpgradeFunctions } from "../functions/upgrades/feed/upFeedHandler"
import { restartFurnaceFunction } from "../functions/upgrades/furnace/restart"
import { createFurnaceIcons } from "../functions/upgrades/furnace/visual"
import { apiScoreboard } from "./../../0-lib/math/scoreboard"
import { addPlayerHoldListen } from "../functions/hold"

export let lockSlotItem: ItemStack
export let coalItem: ItemStack
export let BackpackDimension: Dimension
export const dimensionCenter = {x: 0, y: 0, z: 0}

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
  250: 0,
  251: 1,
  252: 2,
  253: 3,
  255: 4,
  256: 5
}

export const backpackUpgradesIndex: { [key: number]: [number, number] } = {
  250: [27,  1], // [ Backpack Size, Upgrade Amount ]
  251: [36,  2],
  252: [54,  3],
  253: [81,  4],
  255: [100, 5],
  256: [120, 6]
}

export let furnaceReloadScore: ScoreboardObjective

export const openedBackpacks: { [key: string]: [string, Container, number] } = {} // Player ID > [ Backpack Id, Backpack Inventory, Backpack Size]

system.run(() => {
  world.gameRules.showTags = false

  BackpackDimension = world.getDimension("travel_backpack:backpack")
  furnaceReloadScore = apiScoreboard.getObj("travel_backpack:furnace")

  lockSlotItem = new ItemStack("travel_backpack:lock_slot")
  coalItem = new ItemStack("minecraft:coal")
  createFurnaceIcons()

  restartFurnaceFunction(furnaceReloadScore)

  world.tickingAreaManager.createTickingArea("backpack", {from: {x: 0, y: 0, z: 0}, to: {x: 0, y: 0, z: 0}, dimension: world.getDimension("travel_backpack:backpack")})

  const players = world.getAllPlayers()
  if(players.length > 0){
    // Adiciona os jogadores aos seus respectivos Listener caso executem um /reload, para quando entra no mapa é no arquivo playerSpawn.ts
    for(let i = 0, len = players.length; i < len; i++){
      const player = players[i]
      if(!player) continue

      const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
      if(item?.hasTag("travel_backpack:backpack")) addPlayerHoldListen(player, item, player.selectedSlotIndex)

      const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container
      if(inventory == undefined) return

      for(let i = 0, len = inventory.size; i < len; i++){
        const item = inventory.getItem(i)
        if(item == undefined) continue
        if(item.hasTag("travel_backpack:backpack") == false) continue
        if(item.getDynamicProperty("pattern") == undefined) continue

        const backpackId = item.getDynamicProperty("id")
        if(typeof backpackId != "string") continue

        const backpackEntity = world.getEntity(backpackId)
        if(backpackEntity == undefined || backpackEntity.isValid == false) continue

        const backpackInv = backpackEntity.getComponent(EntityComponentTypes.Inventory)?.container
        if(backpackInv == undefined) continue

        const firstSlot = backpackUpgradesIndex[backpackInv.size]?.[0]
        if(firstSlot == undefined) continue

        feedUpgradeFunctions.add(player, backpackEntity, backpackInv, firstSlot +32, i, true)
        world.sendMessage(player.nameTag + " possui backpack com feed upgrade")
      }
    }
  }
})