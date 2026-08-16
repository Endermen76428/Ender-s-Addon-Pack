import { addPlayerUpgradeListen } from "../functions/upgrades/controller"
import { Player, world } from "@minecraft/server"

world.afterEvents.entityContainerOpened.subscribe(({entity: backpack, openSource}) => {
  const player = openSource.entity
  if(!player || !player.isValid) return
  if(!(player instanceof Player)) return

  addPlayerUpgradeListen(player, backpack)
}, {entityFilter: {type: "travel_backpack:backpack"}})