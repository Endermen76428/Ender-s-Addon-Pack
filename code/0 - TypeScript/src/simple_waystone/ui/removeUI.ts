import { ActionFormData, MessageFormData } from "@minecraft/server-ui"
import { colorDimension, waystoneListIconPath } from "./listUI"
import { waystonesList } from "../lib/waystone/list"
import { waystoneInfo } from "../lib/waystone/info"
import { world, Player } from "@minecraft/server"
import { apiOrganize } from "../lib/apiOrganize"
import { apiWarn } from "../../0-lib/player/warn"

export function waystoneUIRemove(player: Player): void {
  const allWaystones = apiOrganize.organizeDimension(player, waystonesList.getPlayerWaystones(player.id))
  if(allWaystones.length < 1) return

  const form = new ActionFormData()
  .title("ui.simple_waystone:waystone.remove_waystone.title")
  .body("ui.simple_waystone:waystone.remove_waystone.body")
  allWaystones.forEach(button => { form.button({"rawtext":[{"text":`${colorDimension[button.dimension]}${button.name.length > 20 ? button.name.slice(0, 19) + "..." : button.name}§r\n`},{"translate":`ui.simple_waystone:waystone.list.${button.access}`}]}, `textures/simple_waystone/ui/icons/${waystoneListIconPath[button.icon]}${button.favorite.has(player.id) ? "_fav" : ""}`) })
  form.show(player).then(r => {
    if(r.canceled || r.selection == undefined) return

    const selected = allWaystones[r.selection]
    if(!selected) return

    new MessageFormData()
    .title("ui.simple_waystone:waystone.remove_waystone.title")
    .body({translate: "ui.simple_waystone:waystone.remove_waystone.confirm.body", with: [`${colorDimension[selected.dimension]}${selected.name}§r`]})
    .button1("ui.simple_waystone:waystone.no")
    .button2("ui.simple_waystone:waystone.yes")
    .show(player).then(r => {
      if(r.canceled || r.selection == 0) return apiWarn.notify(player, "warning.simple_waystone:waystone.dont_deleted_waystones", {type: "actionbar", sound: "warn.ender_addon_pack:break"})

      waystoneInfo.removeWaystone(selected.pos, selected.dimension)
      apiWarn.notify(player, {translate: "warning.simple_waystone:waystone.deleted_waystones", with: [`${colorDimension[selected.dimension]}${selected.name}§r`]}, {sound: "simple_waystone.block.waystone.unregistered"})
    })
  })
}