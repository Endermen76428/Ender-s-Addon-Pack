import { ModalFormData } from "@minecraft/server-ui"
import { apiConfigAdmin } from "../lib/configAdmin"
import { world, Player } from "@minecraft/server"
import { apiConfig } from "../lib/player/config"
import { apiWarn } from "../../0-lib/player/warn"

export function showConfigPanel(player: Player): void {
  const config = apiConfig.getAll(player)

  new ModalFormData()
  .title("ui.gravestone_death_path:config.title")
  .toggle("ui.gravestone_death_path:config.drop_gravestone", {defaultValue: config.dropGrave})
  .dropdown("ui.gravestone_death_path:config.path_type", deathPathTypes, {defaultValueIndex: config.pathType})
  .slider("ui.gravestone_death_path:config.path_check", 10, 150, {valueStep: 10, defaultValue: config.pathCheck, tooltip: "ui.gravestone_death_path:config.path_check.tooltip"})
  .show(player).then(({canceled, formValues}) => {
    if(canceled || formValues == undefined) return

    apiConfig.update(player, formValues)
    apiWarn.notify(player, "ui.warn.gravestone_death_path:config.saved", {type: "actionbar", sound: "warn.ender_addon_pack:levelup"})
  })
}

const deathPathTypes = [
  // "ui.gravestone_death_path:config.path_type.random_flame",
  // "ui.gravestone_death_path:config.path_type.random_flame_reaper",
  "ui.gravestone_death_path:config.path_type.dark_flame",
  "ui.gravestone_death_path:config.path_type.dark_flame_reaper",
  "ui.gravestone_death_path:config.path_type.basic_flame",
  "ui.gravestone_death_path:config.path_type.basic_flame_reaper",
]

export function showConfigAdminPanel(player: Player): void {
  const config = apiConfigAdmin.getAll()

  const skipRespawn = world.gameRules.doImmediateRespawn

  new ModalFormData()
  .title("ui.gravestone_death_path:config.admin.title")
  .toggle("ui.gravestone_death_path:config.admin.allow_teleport", {defaultValue: config.teleport})
  .toggle("ui.gravestone_death_path:config.admin.need_key_to_open", {defaultValue: config.needKey})
  .toggle("ui.gravestone_death_path:config.admin.skip_respawn_screen", {defaultValue: skipRespawn})
  .show(player).then(({canceled, formValues}) => {
    if(canceled || formValues == undefined) return

    world.gameRules.doImmediateRespawn = (r => typeof r != "boolean" ? false : r)(formValues[2])

    apiConfigAdmin.update(formValues)
    apiWarn.notify(player, "ui.warn.gravestone_death_path:config.saved", {type: "actionbar", sound: "warn.ender_addon_pack:levelup"})
  })
}