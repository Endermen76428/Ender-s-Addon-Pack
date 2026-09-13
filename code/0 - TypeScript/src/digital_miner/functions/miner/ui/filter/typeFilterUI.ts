import { world, Block, Player, Vector3, EquipmentSlot, ItemTypes } from "@minecraft/server"
import { addonNamePriority, blockTypeIdCategory } from "../../../../lib/variables"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { apiEquippable } from "../../../../lib/entity/equippable"
import { apiNumbers } from "../../../../../0-lib/math/numbers"
import { apiWarn } from "../../../../../0-lib/player/warn"
import { apiString } from "../../../../lib/string"
import { filterDigitalMiner } from "../../filter"
import { minerUIFilter } from "./mainFilterUI"

export const minerUIFilterType = new class MinerUIFilterType {
  filterTypeScreen(player: Player, block: Block, center: Vector3): void {
    new ActionFormData()
    .title("ui.digital_miner:miner.filter")
    .button("ui.digital_miner:miner.filter.add_type.select")
    .button("ui.digital_miner:miner.filter.add_type.write")
    .button("ui.digital_miner:miner.filter.add_type.hand")
    .show(player).then(({canceled, selection}) => {
      if(canceled || selection == undefined) return minerUIFilter.filterScreen(player, block, center)

      if(selection == 0) return this.select(player, block, center)

      if(selection == 1) return this.write(player, block, center)

      if(selection == 2) return filterDigitalMiner.addType(player, center, apiEquippable.getItemSlot(player, EquipmentSlot.Mainhand))
    })
  }

  private write(player: Player, block: Block, center: Vector3): void {
    new ModalFormData()
    .title("ui.digital_miner:miner.filter.add_type.write")
    .textField("ui.digital_miner:miner.filter.add_type.write.text", "ui.digital_miner:miner.filter.add_type.write.text_hold")
    .show(player).then(({canceled, formValues}) => {
      const [ rawType ] = formValues ?? []
      if(canceled || formValues == undefined || typeof rawType != "string") return minerUIFilter.filterScreen(player, block, center)

      if(!rawType.trim()){
        apiWarn.notify(player, "warn.digital_miner:miner.filter.invalid_text", {sound: "warn.ender_addon_pack:bass"})
        return minerUIFilter.filterScreen(player, block, center)
      }

      const type = (!rawType.includes(":") ? "minecraft:" : "") + rawType.trim().toLocaleLowerCase()
      const itemType = ItemTypes.get(type)?.id
      if(!itemType) return apiWarn.notify(player, {translate: "warn.digital_miner:miner.filter.not_block", with: [type]}, {sound: "warn.ender_addon_pack:break"})

      if(filterDigitalMiner.addType(player, center, type) != undefined) return minerUIFilter.filterScreen(player, block, center)
    })
  }

  private select(player: Player, block: Block, center: Vector3): void {
    const form = new ActionFormData()
    .title("ui.digital_miner:miner.filter.add_type.select")
    .body("ui.digital_miner:miner.filter.add_type.select.body")
    addonNamePriority.forEach(value => { form.button("§9§l" + apiString.firstUpperCase(value)) })
    form.show(player).then(({canceled, selection}) => {
      if(canceled || selection == undefined) return minerUIFilter.filterScreen(player, block, center)
      this.categoryPage(player, block, center, addonNamePriority[selection] ?? "")
    })
  }

  private categoryPage(player: Player, block: Block, center: Vector3, addonId: string, page = 0): void {
    const category = blockTypeIdCategory.get(addonId)
    if(!category) return this.select(player, block, center)

    const pageInfo = category[page]
    if(!pageInfo) return this.select(player, block, center)

    const form = new ActionFormData()
    .title("§9§l" + apiString.firstUpperCase(addonId))
    .body({translate: "ui.digital_miner:miner.filter.add_type.selection.page", with: [`${page +1}/${category.length}`]})
    .button("ui.digital_miner:miner.filter.add_type.selection.previous", "textures/digital_miner/ui/previous_page")
    .button("ui.digital_miner:miner.filter.add_type.selection.next", "textures/digital_miner/ui/next_page")
    .divider()
    pageInfo.forEach(value => { form.button({"rawtext":[{"translate": value.translate},{"text": "\n§7" + value.id}]}) })
    form.show(player).then(({canceled, selection}) => {
      if(canceled || selection == undefined) return this.select(player, block, center)

      if(selection == 0) return this.categoryPage(player, block, center, addonId, apiNumbers.wrapRange(page -1, 0, category.length -1))
      if(selection == 1) return this.categoryPage(player, block, center, addonId, apiNumbers.wrapRange(page +1, 0, category.length -1))

      const selected = pageInfo[selection -2]
      selected && filterDigitalMiner.addType(player, center, selected.id)
    })
  }
}