import { EntityComponentTypes, EquipmentSlot, world } from "@minecraft/server"
import { addPlayerHoldListen } from "../functions/hold"

world.afterEvents.playerSpawn.subscribe(({player, initialSpawn}) => {
  if(initialSpawn){
    const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
    if(item?.hasTag("travel_backpack:backpack")){
      addPlayerHoldListen(player, item, player.selectedSlotIndex)
    }
  }
})