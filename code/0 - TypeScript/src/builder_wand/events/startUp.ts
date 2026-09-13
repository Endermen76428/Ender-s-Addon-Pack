import { world, system, Player } from "@minecraft/server"
import { GetBlocks2D } from "../lib/block/getBlocks"
import { ModalFormData } from "@minecraft/server-ui"
import { apiBlock } from "../lib/block/apiBlock"
import { apiConfig } from "../lib/player/config"
import { apiWandInfo } from "../lib/wand"

let ItemUsedOn = false

system.beforeEvents.startup.subscribe(({itemComponentRegistry: customI}) => {
  customI.registerCustomComponent("builder_wand:on_use_on", {
    onUseOn: ({source: player, block, blockFace, itemStack: item}) => {
      ItemUsedOn = true

      if(!(player instanceof Player)) return

      GetBlocks2D.getBlocks({
        type: "place",
        player,
        item,
        block,
        blockFace,
        blockIds: new Set(apiBlock.formatId(block.typeId)),
        config: apiConfig.get(item)
      })
    },

    onUse: ({source: player, itemStack: item}) => {
      if(!(player instanceof Player) || !item) return

      system.run(() => {
        if(ItemUsedOn){ ItemUsedOn = false; return }

        const config = apiConfig.get(item)

        new ModalFormData()
        .title("ui.builder_wand:config.wand.title")
        .slider({translate: "ui.builder_wand:config.wand.slider"}, 3, apiWandInfo.getMaxSize(item), {valueStep: 2, defaultValue: config.size})
        .toggle("ui.builder_wand:config.wand.toggle", {defaultValue: config.connect})
        .show(player).then(({canceled, formValues}) => {
          if(canceled || formValues == undefined) return

          const [ size, connect ] = formValues
          if(typeof size != "number") return
          if(typeof connect != "boolean") return

          config.size = size
          config.connect = connect

          apiConfig.set(player, item, config)
        })
      })
    }
  })
})