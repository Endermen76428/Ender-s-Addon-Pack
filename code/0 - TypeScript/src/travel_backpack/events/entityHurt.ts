import { world } from "@minecraft/server"

world.beforeEvents.entityHurt.subscribe(ev => {
  ev.cancel = true
}, {entityFilter: {type: "travel_backpack:backpack"}})