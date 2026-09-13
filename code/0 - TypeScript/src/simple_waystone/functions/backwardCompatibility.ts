// This file will execute once time, only to convert the old saved waystones to the new format
import { apiScoreboard } from "../../0-lib/math/scoreboard"
import { apiGlobalCache } from "../lib/cache/global"
import { world, system } from "@minecraft/server"
import { AddonConfig } from "../variables"

system.run(() => {
  if(world.getDynamicProperty("sw:8.0")) apiGlobalCache.load()

  if(!world.getDynamicProperty("sw:7.0")) return convert_v7_0()
  if(!world.getDynamicProperty("sw:7.3")) return convert_v7_3()
  if(!world.getDynamicProperty("sw:8.0")) return convert_v8_0()
})

function convert_v7_0(): void {
  const allDynamics = world.getDynamicPropertyIds().filter(id => id.startsWith("ws:waystone"))
  for(const waystonePoints of allDynamics){
    const dynamic = world.getDynamicProperty(waystonePoints)
    if(typeof dynamic != "string") continue
    const allWaystones = JSON.parse(dynamic) as WaystoneInfoArrayBeforeV7_0[]
    for(const waystone of allWaystones) world.setDynamicProperty(`simple_waystone:${waystone[4]}:${waystone[2]}:${waystone[1][0]},${waystone[1][1]},${waystone[1][2]}`, JSON.stringify({name: waystone[0], owner: waystone[3]}))
    world.setDynamicProperty(waystonePoints, undefined)
  }

  const allWaystone = world.getDynamicPropertyIds().filter(id => id.startsWith("simple_waystone:private:") || id.startsWith("simple_waystone:public:"))
  const allClaimWaystone = world.getDynamicPropertyIds().filter(id => id.startsWith("ws:{'x':"))
  for(const claimWay of allClaimWaystone){
    const dynamic = world.getDynamicProperty(claimWay)
    if(typeof dynamic != "string") continue
    const allPlayers = JSON.parse(dynamic) as string[]

    const match = claimWay.match(/\{.*?\}/)
    const pos = JSON.parse((match ? match[0] : "").replaceAll("'", "\""))

    const oldWaystone = allWaystone.find(id => id.endsWith(`:${pos.x},${pos.y},${pos.z}`))
    const dimension = oldWaystone ? (oldWaystone.split(":")[3] ? `minecraft:${oldWaystone.split(":")[3]}` : "minecraft:overworld") : "minecraft:overworld"
    for(const playerId of allPlayers) world.setDynamicProperty(`simple_waystone:claim:${dimension}:${pos.x},${pos.y},${pos.z}:${playerId}`, 0)
    world.setDynamicProperty(claimWay, undefined)
  }

  world.setDynamicProperty("sw:7.0", true)
  convert_v7_3()
}

function convert_v7_3(): void {
  world.setDynamicProperty("simple_waystone:conversion_v7.0", undefined)

  const allDynamics = world.getDynamicPropertyIds().filter(id => id.startsWith("simple_waystone:"))
  for(const waystonePoints of allDynamics){
    const dynamic = world.getDynamicProperty(waystonePoints)
    if(typeof dynamic != "string" && typeof dynamic != "number") continue

    const info = typeof dynamic == "number" ? 0 : JSON.parse(dynamic) as WaystoneInfoBeforeV7_3 | number | undefined
    if(info == undefined) continue

    const [ prefix, access, dimensionPre, dimensionId, pos, id ] = waystonePoints.split(":")
    world.setDynamicProperty(`${access}/${dimensionId}/${pos}${id ? `/${id}` : ""}`, typeof info != "number" ? `${info.owner}/${info.name}` : true)
    world.setDynamicProperty(waystonePoints, undefined)
  }

  world.setDynamicProperty("sw:7.3", true)
  convert_v8_0()
}

function convert_v8_0(): void {
  const dynamics = world.getDynamicPropertyIds()

  for(const id of dynamics){
    if(id.startsWith("sw:")) continue

    if(id.startsWith("pr") || id.startsWith("pu")){ // Private or Public
      const value = world.getDynamicProperty(id)
      if(typeof value != "string") continue

      const [ accessId, dimension, pos ] = id.split("/")
      const ownerId = value.split("/")[0]
      const name = value.split("/").slice(1).join("/")
      if(accessId == undefined || dimension == undefined || pos == undefined || ownerId == undefined) continue
      const access = accessId == "private" ? 0 : 1

      const claimScore = apiScoreboard.getObj(`simple_waystone/p/${ownerId}`)
      claimScore.setScore(`${access}/${dimension}/${pos}`, 0)

      const waystoneScore = apiScoreboard.getObj(`simple_waystone/w/${dimension}/${pos}`)
      waystoneScore.setScore(`0/${ownerId}`, 0) // Owner
      waystoneScore.setScore(`1/${name}`, 0) // Waystone Name
      waystoneScore.setScore(`access`, access)
      waystoneScore.setScore(`icon`, 0)
      waystoneScore.setScore(`color`, -1)
      waystoneScore.setScore(`xp_discount`, 100)
      waystoneScore.setScore(`offset`, 0)

      world.setDynamicProperty(id, undefined)
      continue
    }

    if(id.startsWith("cl")){ // Claim
      const [ _, dimension, pos, playerId ] = id.split("/")
      if(dimension == undefined || pos == undefined || playerId == undefined) continue

      const claimScore = apiScoreboard.getObj(`simple_waystone/p/${playerId}`)
      claimScore.setScore(`2/${dimension}/${pos}`, 0)

      const waystoneScore = apiScoreboard.getObj(`simple_waystone/w/${dimension}/${pos}`)
      waystoneScore.setScore(`2/${playerId}`, 0) // Claimed

      world.setDynamicProperty(id, undefined)
      continue
    }
  }

  world.setDynamicProperty("config:xp_max", AddonConfig.xpMax)
  world.setDynamicProperty("config:xp_distance", AddonConfig.xpByDistance)
  world.setDynamicProperty("config:xp_dimension", AddonConfig.xpByDimension)
  world.setDynamicProperty("config:tp_by_block", AddonConfig.tpByBlock)
  world.setDynamicProperty("config:tp_betw_dimension", AddonConfig.tpBetweenDimension)
  world.setDynamicProperty("config:tp_cooldown", AddonConfig.tpCooldown)
  world.setDynamicProperty("config:item_cooldown", AddonConfig.itemCooldown)
  world.setDynamicProperty("config:disable_discount", AddonConfig.disableDiscount)
  world.setDynamicProperty("sw:8.0", true)
  apiGlobalCache.load()
}



interface WaystoneInfoArrayBeforeV7_0 {
  0: string, // Name
  1: [number, number, number], // Position
  2: string, // Dimension
  3: string, // Owner
  4: "public" | "private" // Type Access
}

interface WaystoneInfoBeforeV7_3 {
  name: string
  owner: string
}