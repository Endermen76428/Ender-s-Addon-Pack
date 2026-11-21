import { addPlayerUpgradeListen } from "../functions/upgrades/controller"
import { backpackUpgradesIndex, openedBackpacks } from "../lib/variables"
import { EntityComponentTypes, Player, world } from "@minecraft/server"

world.afterEvents.entityContainerOpened.subscribe(({entity: backpack, openSource}) => {
  const player = openSource.entity
  if(!player || !player.isValid) return
  if(!(player instanceof Player)) return

  const inventory = backpack.getComponent(EntityComponentTypes.Inventory)?.container
  if(inventory == undefined) return
  const size = backpackUpgradesIndex[inventory.size]?.[0]
  if(size == undefined) return
  openedBackpacks[player.id] = [backpack.id, inventory, size]

  addPlayerUpgradeListen(player, backpack)
}, {entityFilter: {type: "travel_backpack:backpack"}})