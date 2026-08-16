import { apiWaypointCreate } from "../lib/waypoints/info/create"
import { waypointsEntity } from "../lib/waypoints/entity/entity"
import { waypointsInfo } from "../lib/waypoints/info/general"
import { world, system, Player } from "@minecraft/server"
import { apiScoreboard } from "../lib/math/scoreboard"

system.afterEvents.scriptEventReceive.subscribe(({id, message}) => {
  const args = message.match(/"([^"]*)"|[^\s]+/g)?.map(a => a.replace(/^"|"$/g, ""))
  const player = world.getPlayers({name: args?.[0] ?? ""})[0]
  if(!player) return console.warn(`[§cAdvanced Waypoints§r]: Target is not a Player.`)

  const execute = scriptEventsFunction[id]
  if(typeof execute != "function") return console.warn(`[§cAdvanced Waypoints§r]: Unknown command "${id}"`)

  execute(player, args?.slice(1))
}, {namespaces: ["advanced_waypoints"]})

const scriptEventsFunction: { [key: string]: (player: Player, args: string[] | undefined) => void } = {
  "advanced_waypoints:create": (player, args) => {
    if(!args || args.length == 0) return console.warn(`[§cAdvanced Waypoints§r]: Syntax error. Expected this Structure: "§e/scriptevent advanced_waypoints:create <player_name: string> <waypoint_name: string> [location: x y z] [icon: int] [color: int] [turn_off: boolean]§r"`)

    const [ name, posX, posY, posZ, iconStr, colorStr, turnOffStr ] = args
    if(!name) return

    const x = parseInt(posX ?? ""), y = parseInt(posY ?? ""), z = parseInt(posZ ?? "")
    if(isNaN(x) || isNaN(y) || isNaN(z)) return apiWaypointCreate.create(player, {name: name, pos: player.location, icon: 1, color: Math.floor(Math.random() * 16), turnOff: false})

    const iconRaw = parseInt(iconStr ?? "")
    const icon = iconRaw < 0 || iconRaw > 2 ? 1 : iconRaw
    if(isNaN(icon)) return apiWaypointCreate.create(player, {name: name, pos: {x, y, z}, icon: 1, color: Math.floor(Math.random() * 16), turnOff: false})

    const colorRaw = parseInt(colorStr ?? "")
    const color = colorRaw < 0 || colorRaw > 15 ? 0 : colorRaw
    if(isNaN(color)) return apiWaypointCreate.create(player, {name: name, pos: {x, y, z}, icon: icon, color: Math.floor(Math.random() * 16), turnOff: false})

    apiWaypointCreate.create(player, {name: name, pos: {x, y, z}, icon: icon, color: color, turnOff: turnOffStr == "true"})
  },

  "advanced_waypoints:delete": (player, args) => {
    const name = args?.[0]
    if(!name) return console.warn(`[§cAdvanced Waypoints§r]: Syntax error. Expected this Structure: "§e/scriptevent advanced_waypoints:delete <player_name: string> <waypoint_name: string>§r"`)

    if(!apiScoreboard.hasObj("advanced_waypoints/" + player.id + "/" + player.dimension.id.replace("minecraft:", "") + "/" + name)) return

    waypointsEntity.remove(player, name)
    waypointsInfo.remove(player, name)
  }
}