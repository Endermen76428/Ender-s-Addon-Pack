import { furnaceUpgradeFunctions } from "../functions/upgrades/furnace/upFurnaceHandler"
import { craftUpgradeFunctions } from "../functions/upgrades/craft/upCraftHandler"
import { removePlayerUpgradeListen } from "../functions/upgrades/controller"
import { world, EntityComponentTypes, Player } from "@minecraft/server"
import { backpackUpgradesIndex } from "../lib/variables"

world.afterEvents.entityContainerClosed.subscribe(({entity: backpack, closeSource}) => {
  const player = closeSource.entity
  if(!player || !player.isValid) return
  if(!(player instanceof Player)) return

  const inventory = backpack.getComponent(EntityComponentTypes.Inventory)?.container
  if(!inventory) return

  const [lastSlot] = backpackUpgradesIndex[inventory.size] ?? []
  if(!lastSlot) return

  const ignoreCraft = lastSlot +20
  const ignoreFurnace = lastSlot +27
  for(let i = 0, len = inventory.size; i < len; i++){
    if(i == ignoreCraft || i == ignoreFurnace) continue
    const item = inventory.getItem(i)
    if(item && item.hasTag("travel_backpack:backpack")){
      player.dimension.spawnItem(item, player.location)
      inventory.setItem(i)
    }
  }

  removePlayerUpgradeListen(player)
  craftUpgradeFunctions.remove(backpack)
  furnaceUpgradeFunctions.enableTryStop(backpack)
}, {entityFilter: {type: "travel_backpack:backpack"}})