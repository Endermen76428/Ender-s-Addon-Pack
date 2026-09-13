import { globalFilterTypeCache, globalFilterTagCache, globalFilterTypeTagCache } from "../../../../lib/variables"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { world, Block, Player, Vector3 } from "@minecraft/server"
import { apiScoreboard } from "../../../../lib/math/scoreboard"
import { apiVec3 } from "../../../../lib/math/vector3"
import { interactDigitalMiner } from "../../interact"
import { apiWarn } from "../../../../../0-lib/player/warn"
import { minerUIFilterType } from "./typeFilterUI"
import { apiString } from "../../../../lib/string"
import { filterDigitalMiner } from "../../filter"
import { minerUIFilterTag } from "./tagFilterUI"

export const minerUIFilter = new class MinerUIFilter {
  filterScreen(player: Player, block: Block, center: Vector3): void {
    const filterListType = filterDigitalMiner.getType(block.dimension, center)
    const filterListTag = filterDigitalMiner.getTag(block.dimension, center)

    new ActionFormData()
    .title("ui.digital_miner:miner.filter")
    .body({translate: "ui.digital_miner:miner.filter.body", with: [(filterListType.size + filterListTag.size).toString(), [...filterListType].join("\n"), [...filterListTag].join("\n")]})
    .button("ui.digital_miner:miner.filter.add_type")
    .button("ui.digital_miner:miner.filter.add_tag")
    .button("ui.digital_miner:miner.filter.remove")
    // .button("ui.digital_miner:miner.filter.addAddon")
    .label("\n")
    .divider()
    .label({translate: "ui.digital_miner:miner.filter.label", with: [(filterListType.size + filterListTag.size).toString(), [...filterListType].join("\n"), [...filterListTag].join("\n")]})
    .show(player).then(({canceled, selection}) => {
      if(canceled || selection == undefined) return interactDigitalMiner.openPainel(player, block)
      if(selection == 0) minerUIFilterType.filterTypeScreen(player, block, center)
      if(selection == 1) minerUIFilterTag.filterTagScreen(player, block, center)
      if(selection == 2) this.filterRemoveScreen(player, block, center)
    })
  }

  private filterRemoveScreen(player: Player, block: Block, center: Vector3): void {
    const scoreId = `${apiString.getDimension(block)}/${apiVec3.toString(center)}`
    const filterListType = filterDigitalMiner.getType(block.dimension, center)
    const filterListTag = filterDigitalMiner.getTag(block.dimension, center)

    const form = new ModalFormData()
    .title("ui.digital_miner:miner.filter.remove")
    .label("ui.digital_miner:miner.filter.remove.type")
    filterListType.forEach(id => { form.toggle(id) })
    form.label("ui.digital_miner:miner.filter.remove.tag")
    filterListTag.forEach(id => { form.toggle(id) })
    form.show(player).then(({canceled, formValues}) => {
      if(canceled || formValues == undefined) return this.filterScreen(player, block, center)

      const types: string[] = [...filterListType]
      const tags: string[] = [...filterListTag]

      formValues.forEach((value, index) => {
        if(value == true){
          const score = apiScoreboard.getObj(`digital_miner/miner/${scoreId}`)
          if(index > types.length +1){
            const id = tags[index - types.length -2]
            if(id){
              filterListTag.delete(id)
              apiScoreboard.setScore(score, `tag/${id}`, undefined)
            }
          } else {
            const id = types[index -1]
            if(id){
              filterListType.delete(id)
              apiScoreboard.setScore(score, `type/${id}`, undefined)
            }
          }
        }
      })
      globalFilterTypeCache.set(scoreId, filterListType)
      globalFilterTagCache.set(scoreId, filterListTag)
      globalFilterTypeTagCache.delete(scoreId)
      apiWarn.notify(player, "warn.digital_miner:miner.filter.changed", {sound: "warn.ender_addon_pack:levelup"})
      this.filterScreen(player, block, center)
    })
  }
}