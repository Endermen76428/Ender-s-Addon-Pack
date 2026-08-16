import { ScoreboardObjective, world } from "@minecraft/server"
import { TeleporterPadStructure } from "./teleporter"
import { PlayerCacheStructure } from "./waystone"
import { WaystoneInfo } from "../waystone/info"
import { AddonConfig } from "../../variables"
import { apiScoreboard } from "../math/scoreboard"

export const globalCacheWaystones = new Map<string, WaystoneInfo>() // Dimension/Location > Info
export const globalCachePlayerWaystones = new Map<string, PlayerCacheStructure>() // Player Id > Dimension/Location
export const globalCacheTeleporterPad = new Map<string, TeleporterPadStructure>() // Dimension/Location > Info
export const globalCacheWaystonesPublic = new Set<string>() // Dimension/Location

export const apiGlobalCache = new class ApiGlobalCache {
  load(): void {
    AddonConfig.xpMax = (r => typeof r == "number" ? r : AddonConfig.xpMax)(world.getDynamicProperty("config:xp_max"))
    AddonConfig.xpByDistance = (r => typeof r == "number" ? r : AddonConfig.xpByDistance)(world.getDynamicProperty("config:xp_distance"))
    AddonConfig.xpByDimension = (r => typeof r == "number" ? r : AddonConfig.xpByDimension)(world.getDynamicProperty("config:xp_dimension"))
    AddonConfig.tpByBlock = (r => typeof r == "boolean" ? r : AddonConfig.tpByBlock)(world.getDynamicProperty("config:tp_by_block"))
    AddonConfig.tpBetweenDimension = (r => typeof r == "boolean" ? r : AddonConfig.tpBetweenDimension)(world.getDynamicProperty("config:tp_betw_dimension"))
    AddonConfig.tpCooldown = (r => typeof r == "number" ? r : AddonConfig.tpCooldown)(world.getDynamicProperty("config:tp_cooldown"))
    AddonConfig.itemCooldown = (r => typeof r == "number" ? r : AddonConfig.itemCooldown)(world.getDynamicProperty("config:item_cooldown"))
    AddonConfig.disableDiscount = (r => typeof r == "boolean" ? r : AddonConfig.disableDiscount)(world.getDynamicProperty("config:disable_discount"))

    const scoreboards = world.scoreboard.getObjectives()

    // let date = new Date().getTime()
    const { players, waystones, teleporter } = scoreboards.reduce<{players: ScoreboardObjective[], waystones: ScoreboardObjective[], teleporter: ScoreboardObjective[]}>((acc, score) => {
      const type = score.id.slice(15, 18)
      switch(type){
        case "/p/": { acc.players.push(score); return acc }
        case "/w/": { acc.waystones.push(score); return acc }
        case "/t/": { acc.teleporter.push(score); return acc }
      }
      return acc
    }, { players: [], waystones: [], teleporter: [] })
    // world.sendMessage(`Separou as Waystone em <${new Date().getTime() - date}> ms`)
    // date = new Date().getTime()

    this.loadWaystone(waystones)
    this.loadPlayer(players)
    this.loadTeleporter(teleporter)
    // world.sendMessage(`Carregou as Waystone em <${new Date().getTime() - date}> ms`)
    // world.sendMessage(`----------\nPlayer: ${globalCachePlayerWaystones.size}\n${JSON.stringify([...globalCachePlayerWaystones.entries()].map(([key, value]) => `Onwer: ${key} = Pri: ${value.private.size}, Pub: ${value.public.size}, Claim: ${value.claim.size}`), null, 2)}`)
  }

  private loadWaystone(waystoneScoreList: ScoreboardObjective[]): void {
    for(const waystoneScore of waystoneScoreList){
      const id = waystoneScore.id.replace("simple_waystone/w/", "")
      const [ dimensionRaw, pos ] = id.split("/")
      if(dimensionRaw == undefined || pos == undefined) continue

      const [ rawX, rawY, rawZ ] = pos.split(",")
      if(!rawX || !rawY || !rawZ) continue
      const x = parseInt(rawX), y = parseInt(rawY), z = parseInt(rawZ)

      const { owner, name, claim, favorite } = waystoneScore.getParticipants().reduce((acc, {displayName}) => {
        if(displayName[1] != "/") return acc
        const prefix = displayName.slice(0, 2)
        const value = displayName.slice(2)
        switch (prefix) {
          case "0/":
            acc.owner = value
            break
          case "1/":
            acc.name = value
            break
          case "2/":
            acc.claim.add(value)
            break
          case "3/":
            acc.favorite.add(value)
            break
        }
        return acc
      }, { owner: "", name: "", claim: new Set<string>(), favorite: new Set<string>() })

      const offset = waystoneScore.getScore("offset") ?? 0

      globalCacheWaystones.set(id, {
        access: waystoneScore.getScore("access") == 1 ? 1 : 0,
        owner,
        name,
        pos: {x, y, z},
        dimension: dimensionRaw.includes(":") ? dimensionRaw : ("minecraft:" + dimensionRaw),
        offset: offset == 1 ? "north" : offset == 2 ? "east" : offset == 3 ? "south" : offset == 4 ? "west" : "auto",
        xpDiscount: (waystoneScore.getScore("xp_discount") ?? 100) / 100,
        icon: waystoneScore.getScore("icon") ?? 0,
        color: waystoneScore.getScore("color") ?? 0,
        claim,
        favorite
      })
    }
  }

  private loadPlayer(playerScoreList: ScoreboardObjective[]): void {
    for(const playerScore of playerScoreList){
      const playerId = playerScore.id.replace("simple_waystone/p/", "")
      const privateWay = new Set<string>(), publicWay = new Set<string>(), claimWay = new Set<string>(), favoritePriWay = new Set<string>(), favoritePubWay = new Set<string>()

      for(const value of playerScore.getParticipants()){
        const type = value.displayName.charAt(0)
        switch(type){
          case "0": { privateWay.add(value.displayName.slice(2)); continue }
          case "1": { globalCacheWaystonesPublic.add(value.displayName.slice(2)); publicWay.add(value.displayName.slice(2)); continue }
          case "2": { claimWay.add(value.displayName.slice(2)); continue }
          case "3": {
            const internalType = value.displayName.slice(2, 3)
            if(internalType == "0"){ favoritePriWay.add(value.displayName.slice(4)); continue }
            if(internalType == "1") favoritePubWay.add(value.displayName.slice(4))
          }
        }
      }

      globalCachePlayerWaystones.set(playerId, {private: privateWay, public: publicWay, claim: claimWay, favorite: {private: favoritePriWay, public: favoritePubWay}})
    }
  }

  private loadTeleporter(teleporterList: ScoreboardObjective[]): void {
    for(const score of teleporterList){
      const padId = score.id.replace("simple_waystone/t/", "")
      const participants = score.getParticipants()

      const owner = participants.find(value => value.displayName.startsWith("0/"))?.displayName.slice(2)
      const dimensionRaw = participants.find(value => value.displayName.startsWith("1/"))?.displayName.slice(2)
      const posRaw = participants.find(value => value.displayName.startsWith("2/"))?.displayName.slice(2)

      if(!owner || !dimensionRaw || !posRaw){ globalCacheTeleporterPad.set(padId, true); continue }

      const [ rawX, rawY, rawZ ] = posRaw.split(",")
      if(!rawX || !rawY || !rawZ) continue
      const x = parseInt(rawX), y = parseInt(rawY), z = parseInt(rawZ)

      globalCacheTeleporterPad.set(padId, {
        owner,
        dimension: dimensionRaw.includes(":") ? dimensionRaw : ("minecraft:" + dimensionRaw),
        pos: {x, y, z},
        broken: apiScoreboard.getScore(score, "3/broken") == 1 ? true : false
      })
    }
  }
}