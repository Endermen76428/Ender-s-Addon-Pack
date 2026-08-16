import { apiWaystoneSpace } from "../lib/waystone/space"
import { world, Block, Player } from "@minecraft/server"
import { waystoneInfo } from "../lib/waystone/info"
import { ModalFormData } from "@minecraft/server-ui"
import { colorDimension } from "./listUI"
import { apiWarn } from "../../0-lib/player/warn"

export function waystoneUICreate(player: Player, block: Block){
  new ModalFormData()
  .title(`ui.simple_waystone:waystone.create.title`)
  .textField("ui.simple_waystone:waystone.create.textField", "ui.simple_waystone:waystone.create.textFieldHold")
  .toggle("ui.simple_waystone:waystone.create.toggle")
  .submitButton("ui.simple_waystone:waystone.create.button")
  .show(player).then(r => {
    if(r.canceled || r.formValues == undefined) return
    const [ name, access ] = r.formValues
    if(typeof name != "string" || typeof access != "boolean") return apiWarn.notify(player, "warning.simple_waystone:waystone.fail_create_waystone", {type: "actionbar", sound: "warn.ender_addon_pack:break"})

    if(!name || name.replaceAll(/§./g, "").replaceAll("§", "").length < 1) return apiWarn.notify(player, "warning.simple_waystone:waystone.fail_create_waystone", {type: "actionbar", sound: "warn.ender_addon_pack:break"})

    const created = waystoneInfo.saveWaystone(player, {name, access, pos: block.location})

    apiWaystoneSpace.setOn(player, block)
    apiWarn.notify(player, {translate: "warning.simple_waystone:waystone.create_waystone", with: [`${colorDimension[player.dimension.id]}${created}`]}, {sound: "simple_waystone.block.waystone.registered"})
  })
}