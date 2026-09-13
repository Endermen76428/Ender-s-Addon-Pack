import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { waypointsEntity } from "../lib/waypoints/entity/entity"
import { world, system, Player } from "@minecraft/server"
import { apiConfig } from "../lib/player/config"
import { apiWarn } from "../../0-lib/player/warn"

export function waypointUIOptions(player: Player): void {
  new ActionFormData()
  .title("ui.advanced_waypoints:options.title")
  .button("ui.advanced_waypoints:options.general.title", "textures/ui/automation_glyph")
  .button("ui.advanced_waypoints:options.recover.title", "textures/ui/refresh_hover")
  .show(player).then(r => {
    if(r.canceled || r.selection == undefined) return
    const execute = waypointOptions[r.selection]
    if(execute) execute(player)
  })
}

export const dateType = [
  "hh:mm:ss - MM:DD:YY", "hh:mm:ss - DD:MM:YY", "hh:mm:ss - YY:MM:DD",
  "hh:mm:ss - MM:DD:YYYY", "hh:mm:ss - DD:MM:YYYY", "hh:mm:ss - YYYY:MM:DD"
]

const UTCList = [
  "UTC-12", "UTC-11", "UTC-10", "UTC-9", "UTC-8", "UTC-7", "UTC-6", "UTC-5", "UTC-4", "UTC-3", "UTC-2", "UTC-1", 
  "UTC 0",
  "UTC+1", "UTC+2", "UTC+3", "UTC+4", "UTC+5", "UTC+6", "UTC+7", "UTC+8", "UTC+9", "UTC+10", "UTC+11", "UTC+12"
]

export const waypointOptions = new class waypointOptions {
  [key: number]: (player: Player) => void

  0(player: Player): void {
    const config = apiConfig.get(player)
    new ModalFormData()
    .title("ui.advanced_waypoints:options.general.title")
    .toggle("ui.advanced_waypoints:options.general.toggle.showName", {defaultValue: config.name})
    .toggle("ui.advanced_waypoints:options.general.toggle.showDistance", {defaultValue: config.dis})
    .toggle("ui.advanced_waypoints:options.general.toggle.showBeacon", {defaultValue: config.beam})
    .toggle("ui.advanced_waypoints:options.general.toggle.alwaysShowInfo", {defaultValue: config.showInfo})
    .toggle("ui.advanced_waypoints:options.general.toggle.alwaysShowBeam", {defaultValue: config.showBeam})
    .toggle("ui.advanced_waypoints:options.general.toggle.showPos", {defaultValue: config.pos})
    .toggle("ui.advanced_waypoints:options.general.toggle.reciveSharing", {defaultValue: config.share})
    .toggle("ui.advanced_waypoints:options.general.toggle.createDeathPoint", {defaultValue: config.createDP})
    .dropdown("ui.advanced_waypoints:options.general.dropdown.deathPointDate", dateType, {defaultValueIndex: config.DPType})
    .dropdown("ui.advanced_waypoints:options.general.dropdown.deathPointUTC", UTCList, {defaultValueIndex: config.utc +12})
    .submitButton("ui.advanced_waypoints:create.button_save")
    .show(player).then(r => {
      if(r.canceled || r.formValues == undefined) return apiWarn.notify(player, "warn.advanced_waypoints:cancelOptions", {type: "actionbar", sound: "warn.ender_addon_pack:break"})

      const [ showName, showDistance, showBeacon, showInfo, showBeam, showPos, reciveSharing, createDeath, deathDate, deathUTC ] = r.formValues

      config.name = typeof showName == "boolean" ? showName : true
      config.dis = typeof showDistance == "boolean" ? showDistance : true
      config.beam = typeof showBeacon == "boolean" ? showBeacon : true
      config.showInfo = typeof showInfo == "boolean" ? showInfo : false
      config.showBeam = typeof showBeam == "boolean" ? showBeam : false
      config.pos = typeof showPos == "boolean" ? showPos : true
      config.share = typeof reciveSharing == "boolean" ? reciveSharing : true
      config.createDP = typeof createDeath == "boolean" ? createDeath : true
      config.DPType = typeof deathDate == "number" ? deathDate : 0
      config.utc = typeof deathUTC == "number" ? deathUTC -12 : -3

      apiConfig.set(player, config)
      apiWarn.notify(player, "warn.advanced_waypoints:saveOptions", {type: "actionbar", sound: "warn.ender_addon_pack:break_amethyst"})

      system.runTimeout(() => { waypointsEntity.recoverWaypoints(player) })
    })
  }

  1(player: Player): void {
    waypointsEntity.recoverWaypoints(player)
  }
}