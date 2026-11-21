import { Entity, Player, system } from "@minecraft/server"
import { placeBackpack } from "../functions/place"
import { removeBackpack } from "../functions/remove"

system.beforeEvents.startup.subscribe(({blockComponentRegistry: customB, itemComponentRegistry: customI, dimensionRegistry: customD}) => {
  customB.registerCustomComponent("travel_backpack:backpack", {
    onBreak: ({block, brokenBlockPermutation}) => {
      removeBackpack.brokenBlock(block, brokenBlockPermutation.type.id)
    }
  })

  customI.registerCustomComponent("travel_backpack:backpack", {
    onUseOn: ({source, block, blockFace, itemStack: item}) => {
      if(source instanceof Player) placeBackpack.place(source, item, block, blockFace)
    }
  })

  customD.registerCustomDimension("travel_backpack:backpack")
})