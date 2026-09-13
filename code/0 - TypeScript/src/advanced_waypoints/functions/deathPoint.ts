import { apiWaypointCreate } from "../lib/waypoints/info/create"
import { world, Player } from "@minecraft/server"
import { apiConfig } from "../lib/player/config"
import { dateType } from "../ui/configUI" // Why it not accept a capital "I" ????

world.afterEvents.entityDie.subscribe(({deadEntity}) => {
  const player = deadEntity as Player
  const dynamic = player.getDynamicProperty("aw:death")
  const deathCount = typeof dynamic != "number" ? 1 : dynamic +1
  player.setDynamicProperty("aw:death", deathCount)

  const config = apiConfig.get(player)
  if(!config.createDP) return

  apiWaypointCreate.create(player, {
    name: setDate(deathCount, config.DPType, config.utc),
    pos: {x: Math.floor(player.location.x), y: Math.floor(player.location.y), z: Math.floor(player.location.z)},
    turnOff: true,
    icon: 2,
    color: 5
  }, "no")

}, {entityTypes: ["minecraft:player"]})

function setDate(deathCount: number, type: number, utc: number): string {
  const order = dateType[type]?.replace(" - ", ":").split(":")
  if(!order) return `Death ${deathCount}`
  const date = new Date()
  const dates: string[] = []
  order.forEach(d => {
    if(d == "YY") dates.push(`${Math.floor(date.getFullYear() % 0.01)}`)
    if(d == "MM") dates.push(`${date.getMonth() +1}`)
    if(d != "YY" && d != "MM"){
      const time = dateInfo[d]?.(date, utc)
      if(time) dates.push(`${time}`)
    }
  })
  return `Death ${deathCount} - ${dates[0]?.padStart(2, "0")}:${dates[1]?.padStart(2, "0")}:${dates[2]?.padStart(2, "0")} - ${dates[3]?.padStart(2, "0")}/${dates[4]?.padStart(2, "0")}/${dates[5]}`
}

const dateInfo: { [key: string]: (date: Date, utc: number) => number } = {
  "ss": (date: Date): number => { return date.getSeconds() },
  "mm": (date: Date): number => { return date.getMinutes() },
  "hh": (date: Date, utc: number): number => {
    const hour = date.getHours() + utc
    return hour >= 24 ? (hour -24) : hour < 0 ? (hour +24) : hour
  },
  "DD": (date: Date, utc: number): number => {
    const day = date.getDate()
    const hour = date.getHours() + utc
    return day + (hour >= 24 ? 1 : hour < 0 ? -1 : 0)
  },
  "MM": (date: Date): number => { return date.getMonth() },
  "YY": (date: Date): number => { return date.getFullYear() },
  "YYYY": (date: Date): number => { return date.getFullYear() }
}