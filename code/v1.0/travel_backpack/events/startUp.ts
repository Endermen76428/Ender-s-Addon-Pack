import { world, system, Player } from "@minecraft/server"
import { placeBackpack } from "../functions/place"

system.beforeEvents.startup.subscribe(({itemComponentRegistry: customI}) => {
  customI.registerCustomComponent("travel_backpack:backpack", {
    onUseOn: ({source, block, blockFace, itemStack: item}) => {
      if(source instanceof Player) placeBackpack.place(source, item, block, blockFace)
    }
  })
})