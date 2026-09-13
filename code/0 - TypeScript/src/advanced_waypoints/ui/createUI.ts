import { apiWaypointCreate } from "../lib/waypoints/info/create"
import { apiWaypointsEdit } from "../lib/waypoints/info/edit"
import { apiNumbers } from "../../0-lib/math/numbers"
import { ModalFormData } from "@minecraft/server-ui"
import { Player, Vector3 } from "@minecraft/server"
import { apiWarn } from "../../0-lib/player/warn"
import { WaypointsInfo } from "../lib/variables"
import { waypointsUIEdit } from "./editUI"

export function waypointsUICreate(player: Player, edit?: WaypointsInfo): void {
  const location = edit?.pos ?? player.location
  const form = new ModalFormData()
  .title(`ui.advanced_waypoints:${!edit ? "create" : "edit"}.title`)
  .textField("ui.advanced_waypoints:create.name", "ui.advanced_waypoints:create.name_hold", {defaultValue: edit?.name})
  .textField("ui.advanced_waypoints:create.pos", "ui.advanced_waypoints:create.pos_hold", {defaultValue: `${Math.floor(location.x)}, ${Math.floor(location.y)}, ${Math.floor(location.z)}`})
  .toggle("ui.advanced_waypoints:create.turn_off_close", {defaultValue: edit?.turnOffClose ?? false})
  .dropdown("ui.advanced_waypoints:create.icon", icons, {defaultValueIndex: edit?.icon ? apiNumbers.clamp(edit.icon -25, 0, 99) : Math.floor(Math.random() *2)})
  .dropdown("ui.advanced_waypoints:create.color", colorList, {defaultValueIndex: edit?.color ?? Math.floor(Math.random() * 16)})
  if(edit){
    form.slider({translate: "ui.advanced_waypoints:create.slider_r"}, 0, 255, {valueStep: 1, defaultValue: edit.rgb.red})
    .slider({translate: "ui.advanced_waypoints:create.slider_g"}, 0, 255, {valueStep: 1, defaultValue: edit.rgb.green})
    .slider({translate: "ui.advanced_waypoints:create.slider_b"}, 0, 255, {valueStep: 1, defaultValue: edit.rgb.blue})
  }
  form.submitButton("ui.advanced_waypoints:create.button_save")
  .show(player).then(r => {
    if(r.canceled || r.formValues == undefined) return edit ? waypointsUIEdit(player) : apiWarn.notify(player, "warn.advanced_waypoints:cancelCreatePoint", {type: "actionbar", "sound": "warn.advanced_waypoints:break"})

    const [ name, position, turnOff, icon, color, colorR, colorG, colorB ] = r.formValues

    if(typeof name != "string" || !name) return apiWarn.notify(player, "warn.advanced_waypoints:invalidName", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})
    if(typeof position != "string" || !name) return apiWarn.notify(player, "warn.advanced_waypoints:invalidName", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})

    const xyz = position
      .split(/[^0-9.,-]+/)
      .filter(p => p !== ",")
      .map(p => parseInt(p))
      .map((n, index) => isNaN(n) ? location[vectorLoc[index] ?? "x"] : n)

    let pos = {x: xyz[0] ?? location.x, y: xyz[1] ?? location.y, z: xyz[2] ?? location.z}
    // if(!apiVec3.isValid(pos)) apiWarn.notify(player, "warn.advanced_waypoints:invalidPos", {type: "chat", sound: "warn.ender_addon_pack:bass"})

    if(typeof icon != "number") return apiWarn.notify(player, "warn.advanced_waypoints:failCreatePoint", {type: "actionbar", sound: "warn.ender_addon_pack:break"})
    if(typeof color != "number") return apiWarn.notify(player, "warn.advanced_waypoints:failCreatePoint", {type: "actionbar", sound: "warn.ender_addon_pack:break"})

    if(edit){
      return apiWaypointsEdit.edit(player, edit, {
        name: name,
        pos: pos,
        turnOff: typeof turnOff != "boolean" ? false : turnOff,
        icon: icon,
        color: color,
        colorR: typeof colorR != "number" ? 200 : colorR,
        colorG: typeof colorG != "number" ? 200 : colorG,
        colorB: typeof colorB != "number" ? 200 : colorB,
        visible: edit.visible
      })
    }

    apiWaypointCreate.create(player, {
      name: name,
      pos: pos,
      turnOff: typeof turnOff != "boolean" ? false : turnOff,
      icon: icon,
      color: color
    })
  })
}

const vectorLoc: (keyof Vector3)[] = ["x", "y", "z"]
const colorList = Array(16).fill(0).map((value, index) => `ui.advanced_waypoints.create.color.${index}`)
const icons = ["first_letter", "default", "death", "house", "sword", "pickaxe", "axe"].map(value => `ui.advanced_waypoints:create.icon.${value}`)