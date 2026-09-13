import { BlockPermutation, Entity, EntityComponentTypes, EquipmentSlot, ItemStack, Player, system } from "@minecraft/server"
import { backpackSizeTier, backpackUpgradesIndex, lockSlotItem } from "../../lib/variables"
import { apiEquippable } from "../../lib/player/equippable"
import { apiWarn } from "../../../0-lib/player/warn"

export const upgradeBackpackTier = new class UpgradeBackpack {
  install(player: Player, backpack: Entity, item: ItemStack): boolean {
    const [upgradeSize, backpackType] = upgradeTier[item.typeId] ?? []

    if(upgradeSize != undefined && backpackType != undefined){
      const currentBackpackTier = backpackSizeTier[backpack.getComponent(EntityComponentTypes.Inventory)?.container.size ?? 0] ?? 0
      if(currentBackpackTier >= upgradeSize) return false

      const block = backpack.dimension.getBlock(backpack.location)
      if(!block) return false

      const backpackInv = backpack.getComponent(EntityComponentTypes.Inventory)?.container
      if(!backpackInv) return false

      const upgradeIndex = backpackUpgradesIndex[backpackInv.size]
      if(upgradeIndex == undefined) return false

      const clearIndex = upgradeIndex[0]
      const upgradesSlots: (undefined | ItemStack)[] = Array.from({length: 6})
      for(let i = clearIndex, len = clearIndex + upgradeIndex[1]; i < len; i++) upgradesSlots[i - clearIndex] = backpackInv.getItem(i)

      const functionSlots: (undefined | ItemStack)[] = Array.from({length: 21})
      for(let i = clearIndex +10, len = backpackInv.size; i < len; i++) functionSlots[i - clearIndex] = backpackInv.getItem(i)

      system.run(() => {
        block.setPermutation(BlockPermutation.resolve(backpackType, block.permutation.getAllStates()))
        block.dimension.spawnParticle("travel_backpack:upgrade_tier", block.center())

        backpack.triggerEvent(`travel_backpack:inventory${upgradeSize}`)
        backpack.nameTag = `ui.travel_backpack:backpack.size.${upgradeSize}`
        apiEquippable.decrement(player, EquipmentSlot.Mainhand)
        apiWarn.playSound(player, "warn.ender_addon_pack:levelup")

        system.run(() => {
          const inventory = backpack.getComponent(EntityComponentTypes.Inventory)?.container
          if(!inventory) return

          const index = backpackUpgradesIndex[inventory.size]
          if(!index) return

          const startFill = index[0] + index[1]
          // Limpará todos os slots antigos e adicionará a trava aos novos substituindo tudo, por isso salvamos os itens ali atras
          for(let i = clearIndex, len = startFill; i < len; i++) inventory.setItem(i)
          for(let i = startFill, len = inventory.size; i < len; i++) inventory.setItem(i, lockSlotItem)

          // Pegará os itens salvos e colocará nos novos lugares corretos
          const startIndex = index[0]
          for(let i = startIndex, len = startIndex + index[1]; i < len; i++){
            const item = upgradesSlots[i - startIndex]
            item && inventory.setItem(i, item)
          }
          for(let i = startIndex +10, len = inventory.size; i < len; i++) inventory.setItem(i, functionSlots[i - startIndex])
        })
      })
      return true
    }

    return false
  }
}

const upgradeTier: { [key: string]: [number, string] } = { // [ Backpack Event, Block TypeId ]
  "travel_backpack:copper_upgrade_tier":    [1, "travel_backpack:copper_backpack"],
  "travel_backpack:iron_upgrade_tier":      [2, "travel_backpack:iron_backpack"],
  "travel_backpack:gold_upgrade_tier":      [3, "travel_backpack:gold_backpack"],
  "travel_backpack:diamond_upgrade_tier":   [4, "travel_backpack:diamond_backpack"],
  "travel_backpack:netherite_upgrade_tier": [5, "travel_backpack:netherite_backpack"]
}