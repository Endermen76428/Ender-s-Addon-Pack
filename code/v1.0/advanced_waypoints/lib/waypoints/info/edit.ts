import { world, Player, RGB, Vector3 } from "@minecraft/server"
import { colorRBG, WaypointsInfo } from "../../variables"
import { waypointsEntity } from "../entity/entity"
import { stringFormat } from "../../stringFormat"
import { apiVec3 } from "../../math/vector"
import { apiWarn } from "../../../../0-lib/player/warn"
import { waypointsInfo } from "./general"
import { waypointsShare } from "./share"

export const apiWaypointsEdit = new class ApiWaypointsEdit {
  edit(player: Player, oldInfo: WaypointsInfo, info: WaypointInfoEdit, message = true): void {
    waypointsInfo.remove(player, oldInfo.name)
    waypointsEntity.remove(player, oldInfo.name)
    if(oldInfo.name != info.name) waypointsShare.removeFromList(player, oldInfo.name)

    const name = stringFormat.sameNames(info.name, waypointsInfo.getAllName(player, oldInfo.name))
    const color: RGB = info.color != oldInfo.color ? (colorRBG[info.color] ?? {red: 200, green: 200, blue: 200}) : {red: info.colorR, green: info.colorG, blue: info.colorB}
    const icon = waypointsEntity.getIcon(info.icon, name)

    const waypointInfo = {
      name,
      dimension: player.dimension.id,
      icon,
      color: info.color,
      rgb: color,
      turnOffClose: info.turnOff,
      visible: info.visible
    }

    waypointsInfo.set(player, {...waypointInfo, pos: apiVec3.floor(info.pos)})

    if(info.visible) waypointsEntity.spawn(player, {...waypointInfo, pos: apiVec3.bottomCenter(info.pos)}, true)
    message && apiWarn.notify(player, {translate: `warn.advanced_waypoints:editPoint`, with: [name]}, {sound: "warn.ender_addon_pack:break_amethyst"})
  }
}

interface WaypointInfoEdit {
  name: string
  pos: Vector3
  turnOff: boolean
  icon: number
  color: number
  colorR: number
  colorG: number
  colorB: number
  visible: boolean
}