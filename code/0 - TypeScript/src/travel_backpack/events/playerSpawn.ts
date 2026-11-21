import { feedUpgradeFunctions } from "../functions/upgrades/feed/upFeedHandler"
import { EntityComponentTypes, EquipmentSlot, world } from "@minecraft/server"
import { backpackUpgradesIndex } from "../lib/variables"
import { addPlayerHoldListen } from "../functions/hold"

world.afterEvents.playerSpawn.subscribe(({player, initialSpawn}) => {
  if(initialSpawn){
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
    }
  }
})