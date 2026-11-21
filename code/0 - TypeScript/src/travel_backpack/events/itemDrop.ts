import { Container, EntityComponentTypes, ItemStack, Player, world } from "@minecraft/server"
import { craftUpgradeFunctions } from "../functions/upgrades/craft/upCraftHandler"
import { openedBackpacks } from "../lib/variables"
import { backpackOrganize } from "../functions/organize"

world.afterEvents.entityItemDrop.subscribe(({entity: player, items}) => {
  if(player instanceof Player == false) return
  if(items.length > 1) return

  const item = items[0]?.getComponent(EntityComponentTypes.Item)
  if(item == undefined) return

  const exe = itemDroppedFunctions[item.itemStack.typeId]
  if(exe){
    const info = openedBackpacks[player.id]
    if(info == undefined) return
    exe(player, ...info)
    item.entity.isValid && item.entity.remove()
  }
}, {entityFilter: {type: "minecraft:player"}})

const itemDroppedFunctions: { [key: string]: (player: Player, id: string, inventory: Container, size: number) => void } = {
  "travel_backpack:ui_mode_default": (player, id, inventory, size) => { inventory.setItem(size +6, new ItemStack("travel_backpack:ui_mode_scrolling")), player.setDynamicProperty("uimode", "scrolling") },
  "travel_backpack:ui_mode_scrolling": (player, id, inventory, size) => { inventory.setItem(size +6, new ItemStack("travel_backpack:ui_mode_default")), player.setDynamicProperty("uimode", "default") },

  "travel_backpack:organize_alphabetical": (player, id, inventory, size) => { inventory.setItem(size +7, new ItemStack("travel_backpack:organize_alphabetical")), backpackOrganize.alphabetical(inventory, size) },
  "travel_backpack:organize_numeric": (player, id, inventory, size) => { inventory.setItem(size +8, new ItemStack("travel_backpack:organize_numeric")), backpackOrganize.numeric(inventory, size) },

  "travel_backpack:craft_amount_1": (player, id, inventory, size) => { inventory.setItem(size +21, new ItemStack("travel_backpack:craft_amount_2")), craftUpgradeFunctions.updateAmount(id, 2) },
  "travel_backpack:craft_amount_2": (player, id, inventory, size) => { inventory.setItem(size +21, new ItemStack("travel_backpack:craft_amount_4")), craftUpgradeFunctions.updateAmount(id, 4) },
  "travel_backpack:craft_amount_4": (player, id, inventory, size) => { inventory.setItem(size +21, new ItemStack("travel_backpack:craft_amount_8")), craftUpgradeFunctions.updateAmount(id, 8) },
  "travel_backpack:craft_amount_8": (player, id, inventory, size) => { inventory.setItem(size +21, new ItemStack("travel_backpack:craft_amount_16")), craftUpgradeFunctions.updateAmount(id, 16) },
  "travel_backpack:craft_amount_16": (player, id, inventory, size) => { inventory.setItem(size +21, new ItemStack("travel_backpack:craft_amount_32")), craftUpgradeFunctions.updateAmount(id, 32) },
  "travel_backpack:craft_amount_32": (player, id, inventory, size) => { inventory.setItem(size +21, new ItemStack("travel_backpack:craft_amount_64")), craftUpgradeFunctions.updateAmount(id, 64) },
  "travel_backpack:craft_amount_64": (player, id, inventory, size) => { inventory.setItem(size +21, new ItemStack("travel_backpack:craft_amount_1")), craftUpgradeFunctions.updateAmount(id, 1) }
}