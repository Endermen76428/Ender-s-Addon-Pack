import { apiWaypointsCache } from "./waypoints/info/cache"
import { world, Player, Vector3 } from "@minecraft/server"
import { waypointsEntity } from "./waypoints/entity/entity"
import { apiScoreboard } from "./math/scoreboard"
import { Variables } from "./variables"

export const backwardCompatibilityPlayer = new class BackwardCompatibilityPlayer {
  convert_v7_0(player: Player): void {
    player.setDynamicProperty("waypointConfig", undefined)
    player.setDynamicProperty("aw:death", player.getDynamicProperty("advancedWaypoint:deathCount"))
    player.setDynamicProperty("advancedWaypoint:deathCount", undefined)

    const allDynamic = player.getDynamicPropertyIds()
    for(const dynamic of allDynamic){
      if(!dynamic.startsWith("waypointList")) continue

      const info = player.getDynamicProperty(dynamic)
      if(typeof info != "string") continue

      const waypoints = JSON.parse(info) as WaypointInfoBefore7[]
      // dimension/visible/icon/color/pos/name
      for(const way of waypoints) player.setDynamicProperty(`${way.world.replace("minecraft:", "")}/${way.visible ? 1 : 0}/${way.icon == 7 ? 1 : 0}/${way.rgb.r},${way.rgb.g},${way.rgb.b}/${Math.floor(way.pos.x)},${way.pos.y},${Math.floor(way.pos.z)}/${way.id}`, true)
      player.setDynamicProperty(dynamic, undefined)
    }

    player.setDynamicProperty("aw:7.0", true)
    waypointsEntity.recoverWaypoints(player)
    this.convert_v8_0(player)
  }

  convert_v8_0(player: Player): void {
    if(!world.getDynamicProperty("aw:8.0")) backwardCompatibilityWorld.convert_v8_0()

    const allDynamic = player.getDynamicPropertyIds()
    for(const dynamic of allDynamic){
      if(dynamic.startsWith("aw:")) continue

      const info = dynamic.split("/")
      const [ dimension, visible, icon, color, pos ] = info
      if(dimension == undefined || visible == undefined || icon == undefined || color == undefined || pos == undefined) continue

      const name = info.slice(5).join("/")
      const scoreInfo = apiScoreboard.getObj(`advanced_waypoints/${player.id}/${dimension}/${name}`)

      const visibleFormat = parseInt(visible)
      const iconIndex = parseInt(icon)
      const [ red, green, blue ] = color.split(",")
      const r = parseInt(red ?? "200"), g = parseInt(green ?? "200"), b = parseInt(blue ?? "200")
      const [ posX, posY, posZ ] = pos.split(",")
      const x = parseInt(posX ?? "0"), y = parseInt(posY ?? "0"), z = parseInt(posZ ?? "0")

      apiScoreboard.setScore(scoreInfo, "visible", visibleFormat)
      apiScoreboard.setScore(scoreInfo, "icon", iconIndex < 2 ? iconIndex +26 : iconIndex -2)
      apiScoreboard.setScore(scoreInfo, "colorI", Math.floor(r / 1000))
      apiScoreboard.setScore(scoreInfo, "R", r % 1000)
      apiScoreboard.setScore(scoreInfo, "G", g)
      apiScoreboard.setScore(scoreInfo, "B", b)
      apiScoreboard.setScore(scoreInfo, "X", x)
      apiScoreboard.setScore(scoreInfo, "Y", y -1)
      apiScoreboard.setScore(scoreInfo, "Z", z)
      apiScoreboard.setScore(scoreInfo, "turnOffClose", name.startsWith("Death") ? 1 : 0)
      player.setDynamicProperty(dynamic, undefined)
    }

    apiWaypointsCache.load(player)
    player.setDynamicProperty("aw:8.0", true)
  }
}

export const backwardCompatibilityWorld = new class BackwardCompatibilityWorld {
  convert_v8_0(): void {
    const allScore = world.scoreboard.getObjectives()
    for(const scoreId of allScore){
      if(scoreId.id.startsWith("advanced_waypoints")) world.scoreboard.removeObjective(scoreId)
    }
    world.setDynamicProperty("aw:8.0", true)
    world.setDynamicProperty("aw:teleport", true)
    world.setDynamicProperty("aw:cost_xp", true)
    world.setDynamicProperty("aw:xp_distance", 500)

    this.convert_v8_1()
  }

  convert_v8_1(): void {
    world.setDynamicProperty("aw:8.1", true)
    world.setDynamicProperty("aw:teleport", true)
    Variables.teleportEnabled = true
  }
}

interface WaypointInfoBefore7 {
  id: string
  pos: Vector3
  icon: number
  rgb: {r: number, g: number, b: number}
  world: string
  visible: boolean
}