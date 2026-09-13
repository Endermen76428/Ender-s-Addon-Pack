import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { world, Block, Player } from "@minecraft/server"
import { SubpackAdminPanelEnabled } from "../variables"
import { waystoneUIFavorite } from "./favoriteUI"
import { waystoneUIRemove } from "./removeUI"
import { apiWarn } from "../../0-lib/player/warn"
import { apiConfig } from "../lib/apiConfig"
import { waystoneUIAdmin } from "./adminUI"
import { waystoneUIInfo } from "./infoUI"

export const dimensionsOrder = ["current", "overworld-nether-the_end", "overworld-the_end-nether", "nether-overworld-the_end", "nether-the_end-overworld", "the_end-overworld-nether", "the_end-nether-overworld"]

export function waystoneUISettings(player: Player, owner: string, block: Block): void {
  if(owner != player.id) return apiWarn.notify(player, "warning.simple_waystone:waystone.not_owner", {sound: "warn.ender_addon_pack:bass"})

  const form = new ActionFormData()
  .title("ui.simple_waystone:waystone.settings_menu.title")
  .body("ui.simple_waystone:waystone.settings_menu.body")
  .button("ui.simple_waystone:waystone.info.title", "textures/simple_waystone/ui/icons/waystone")
  .button("ui.simple_waystone:waystone.settings_menu.title", "textures/ui/automation_glyph_color")
  .button("ui.simple_waystone:waystone.remove_waystone.title", "textures/ui/icon_trash")
  .button("ui.simple_waystone:favorite.title", "textures/ui/permissions_member_star")
  if(SubpackAdminPanelEnabled ? true : player.hasTag("admin")) form.button("ui.simple_waystone:admin.settings.title", "textures/ui/permissions_op_crown")
  form.show(player).then(({canceled, selection}) => {
    if(canceled || selection == undefined) return
    if(selection == 0) return waystoneUIInfo(player, block)
    if(selection == 1) return waystoneUIConfig(player)
    if(selection == 2) return waystoneUIRemove(player)
    if(selection == 3) return waystoneUIFavorite(player)
    return waystoneUIAdmin(player)
  })
}

function waystoneUIConfig(player: Player): void {
  const config = apiConfig.getConfig(player)
  new ModalFormData()
  .title("ui.simple_waystone:waystone.settings_menu.title")
  .toggle("ui.simple_waystone:waystone.settings.toggle.organize", {defaultValue: config.organize})
  .dropdown("ui.simple_waystone:waystone.settings.dropdown.organizeDimension", dimensionsOrder.map(value => (`ui.simple_waystone:waystone.settings.dropdown.organize_dimension.${value}`)), {defaultValueIndex: config.organizeDimension})
  .dropdown("ui.simple_waystone:waystone.settings.dropdown.show_dimension", ["ui.simple_waystone:waystone.settings.dropdown.show_dimension.all", "ui.simple_waystone:waystone.settings.dropdown.show_dimension.overworld", "ui.simple_waystone:waystone.settings.dropdown.show_dimension.nether", "ui.simple_waystone:waystone.settings.dropdown.show_dimension.the_end"], {defaultValueIndex: config.showDimension})
  .submitButton("ui.simple_waystone:waystone.create.button")
  .show(player).then(({canceled, formValues}) => {
    if(canceled || formValues == undefined) return apiWarn.notify(player, "warning.simple_waystone:waystone.cancel_settings", {type: "actionbar", sound: "warn.ender_addon_pack:break"})

    apiConfig.setConfig(player, {
      organize: (r => typeof r == "boolean" ? r : apiConfig.defaultConfig.organize)(formValues[0]),
      organizeDimension: (r => typeof r == "number" ? r : apiConfig.defaultConfig.organizeDimension)(formValues[1]),
      showDimension: (r => typeof r == "number" ? r : apiConfig.defaultConfig.showDimension)(formValues[2])
    })
    apiWarn.notify(player, "warning.simple_waystone:waystone.save_settings", {type: "actionbar", sound: "warn.ender_addon_pack:levelup"})
  })
}