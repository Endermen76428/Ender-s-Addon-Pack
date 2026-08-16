import { world, system, EntityComponentTypes, EquipmentSlot, ItemStack } from "@minecraft/server"
import { addPlayerHoldListen } from "../functions/hold"

export const globalBackpackPos = {x: 0.5, y: 384, z: 0.5}
export let lockSlotItem: ItemStack

export const backpackSizeFill: { [key: number]: number } = {
  0: 28,  // 27  slot padrão + 1 upgrade slot
  1: 38,  // 36  slot padrão + 2 upgrade slot
  2: 57,  // 54  slot padrão + 3 upgrade slot
  3: 85,  // 81  slot padrão + 4 upgrade slot
  4: 105, // 100 slot padrão + 5 upgrade slot
  5: 126  // 120 slot padrão + 6 upgrade slot
}

export const backpackSizeTier: { [key: number]: number } = {
  49:  0,
  57:  1,
  75:  2,
  102: 3,
  121: 4,
  141: 5
}

export const backpackUpgradesIndex: { [key: number]: [number, number] } = {
  49:  [27,  1], // Backpack Size, Upgrade Amount
  57:  [36,  2],
  75:  [54,  3],
  102: [81,  4],
  121: [100, 5],
  141: [120, 6]
}

system.run(() => {
  world.gameRules.showTags = false

  const players = world.getAllPlayers()

  lockSlotItem = new ItemStack("travel_backpack:lock_slot")

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