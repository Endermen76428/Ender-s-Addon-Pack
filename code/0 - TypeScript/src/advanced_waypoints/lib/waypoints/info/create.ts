import { world, Player, RGB, Vector3 } from "@minecraft/server"
import { forceUpdateList } from "../../../functions/locator"
import { apiWarn } from "../../../../0-lib/player/warn"
import { waypointsEntity } from "../entity/entity"
import { stringFormat } from "../../stringFormat"
import { apiVec3 } from "../../math/vector"
import { colorRBG } from "../../variables"
import { waypointsInfo } from "./general"

export const apiWaypointCreate = new class ApiWaypointCreate {
  create(player: Player, info: WaypointInfoCreate, message = "create", isShare = false): void {
    const name = stringFormat.sameNames(info.name, waypointsInfo.getAllName(player))

    const icon = waypointsEntity.getIcon(info.icon, info.name)
    const color: RGB = colorRBG[info.color] ?? {red: 200, green: 200, blue: 200}
    const turnOff = name.startsWith("Death") ? 1 : info.turnOff ? 1 : 0

    const waypointInfo = {
      name,
      dimension: player.dimension.id,
      icon,
      color: info.color,
      rgb: color,
      turnOffClose: !!turnOff,
      visible: true
    }

    waypointsInfo.set(player, {...waypointInfo, pos: apiVec3.floor(info.pos)})

    if(message == "create") apiWarn.notify(player, {translate: "warn.advanced_waypoints:createPoint", with: [name]}, {sound: "warn.ender_addon_pack:enchanting_table"})
    if(isShare) apiWarn.notify(player, {translate: "warn.advanced_waypoints:reciveWaypoint", with: [name, message]}, {sound: "warn.ender_addon_pack:enchanting_table"})

    forceUpdateList.add(player.id)
    waypointsEntity.spawn(player, {...waypointInfo, pos: apiVec3.bottomCenter(info.pos)}, true)
  }
}

export interface WaypointInfoCreate {
  name: string
  pos: Vector3
  icon: number
  color: number
  turnOff: boolean
}