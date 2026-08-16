import { world } from "@minecraft/server"

world.afterEvents.entityLoad.subscribe(({entity}) => {
  entity.isValid && entity.removeTag("simple_waystone:teleporter")
})