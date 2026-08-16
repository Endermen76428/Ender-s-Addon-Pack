import { world, Entity, EntityComponentTypes, Player } from "@minecraft/server"
import { Variables, WaypointsInfo } from "../../variables"
import { apiConfig } from "../../player/config"
import { apiWaypointsEdit } from "../info/edit"
import { forceUpdateList } from "../../../functions/locator"

export class WaypointLocatorManager {
  private entity: Entity
  private waypoint: WaypointLocatorManagerInfo
  private player: Player

  public forceUpdate = false

  constructor(waypoint: WaypointsInfo, entity: Entity, player: Player, forceUpdate = false){
    const config = apiConfig.get(player)
    const deathpoint = waypoint.name.split(" - ")
    const nameShowed = deathpoint.length == 3 ? (deathpoint[0] ?? "Death") : waypoint.name.trim().slice(0, Variables.maxName).normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    this.waypoint = {
      ...waypoint,
      stopExpression:
        // Distance
        "v.waypoint_x=" + (waypoint.pos.x) + ";" +
        "v.waypoint_y=" + (waypoint.pos.y) + ";" +
        "v.waypoint_z=" + (waypoint.pos.z) + ";" +

        // Name
        nameShowed.split("").map((value, index) => `v.letter${nameShowed.length - index}=${(value.codePointAt(0) ?? 32) -32};`).join("") + ";" +
        "v.name_amount=" + (nameShowed.length) + ";" +

        // Config
        "v.need_look_show_info=" + (!config.showInfo) + ";" +
        "v.need_look_show_beam=" + (!config.showBeam) + ";" +
        "v.show_name=" + (config.name) + ";" +
        "v.show_distance=" + (config.dis) + ";" +
        "v.show_beam=" + (config.beam) + ";" +
        "v.max_distance=" + (Variables.maxDistance) + ";" +

        // Others
        "v.waypoint_scale_default=" + (config.scale /25) + ";" +
        "v.color_r=" + (waypoint.rgb.red) + ";" +
        "v.color_g=" + (waypoint.rgb.green) + ";" +
        "v.color_b=" + (waypoint.rgb.blue) + ";" +
        "v.icon=" + (waypoint.icon) + ";" +
        "v.is_visible = true;"
    }
    this.entity = entity
    this.player = player

    this.forceUpdate = forceUpdate
  }

  public update(dirX = 0, dirZ = 0): void {
    if(!this.entity.isValid) return this.respawn(dirX, dirZ)

    this.entity.playAnimation("animation.advanced_waypoints.waypoint.offset", {
      players: [this.player],
      nextState: "none",
      stopExpression: this.waypoint.stopExpression
    })

    const WDisX = this.waypoint.pos.x - this.player.location.x
    const WDisY = this.waypoint.pos.y - this.player.location.y
    const WDisZ = this.waypoint.pos.z - this.player.location.z
    const WDistance = (WDisX * WDisX) + (WDisY * WDisY) + (WDisZ * WDisZ)

    if(this.waypoint.turnOffClose && WDistance <= Variables.turnOffDistance){
      if((this.player.getComponent(EntityComponentTypes.Health)?.currentValue ?? 0) > 0){
        return apiWaypointsEdit.edit(this.player, this.waypoint, {
          name: this.waypoint.name,
          pos: this.waypoint.pos,
          turnOff: false,
          icon: this.waypoint.icon < 26 ? 0 : this.waypoint.icon -25,
          color: this.waypoint.color,
          colorR: this.waypoint.rgb.red,
          colorG: this.waypoint.rgb.green,
          colorB: this.waypoint.rgb.blue,
          visible: false
        }, false)
      }
    }

    const EDisX = this.entity.location.x - this.player.location.x
    const EDisY = this.entity.location.y - this.player.location.y
    const EDisZ = this.entity.location.z - this.player.location.z
    const EDistance = (EDisX * EDisX) + (EDisY * EDisY) + (EDisZ * EDisZ)

    if(EDistance < Variables.minRenderDistance) return

    this.respawn(dirX, dirZ)
  }

  public despawn(): void {
    this.entity.isValid && this.entity.remove()
  }

  private respawn(dirX = 0, dirZ = 0): void {
    if(this.entity.isValid) this.entity.triggerEvent("advanced_waypoints:start_despawn")

    try {
      this.entity = this.player.dimension.spawnEntity("advanced_waypoints:waypoint", {
        x: Math.floor(this.player.location.x) + (dirX *0.75) + 0.5,
        y: Math.floor(this.player.location.y) + 8.5,
        z: Math.floor(this.player.location.z) + (dirZ *0.75) + 0.5
      })
      this.entity.addTag(`waypointOwner: ${this.player.id}`)
      this.entity.addTag(`waypointName: ${this.waypoint.name}`)
      this.forceUpdate = true
      forceUpdateList.add(this.player.id)
    } catch {}
  }
}

interface WaypointLocatorManagerInfo extends WaypointsInfo {
  stopExpression: string
}