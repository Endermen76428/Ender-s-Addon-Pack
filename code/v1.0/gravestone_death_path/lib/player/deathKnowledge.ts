import { world, Player } from "@minecraft/server"
import { apiNumber } from "../math/number"
import { apiWarn } from "../../../0-lib/player/warn"

export const maxDeathKnowledgeXp = 525
const maxPoints = (maxDeathKnowledgeXp /15 +5)

const cachePlayerDeathKnowledge = new Map<string, DeathKnowledge>()

export const apiDeathKnowledge = new class ApiDeathKnowledge {
  load(player: Player): void {
    cachePlayerDeathKnowledge.set(player.id, {
      xp: (r => typeof r != "number" ? 0 : r)(player.getDynamicProperty("dk:xp")),
      lv: (r => typeof r != "number" ? 0 : r)(player.getDynamicProperty("dk:lv")),
      points: (r => typeof r != "number" ? 0 : r)(player.getDynamicProperty("dk:points")),

      upXp: (r => typeof r != "number" ? 0 : r)(player.getDynamicProperty("dk:upXp")),
      upTpKey: (r => typeof r != "number" ? 0 : r)(player.getDynamicProperty("dk:upTpKey")),
    })
  }

  upgradeStatus(player: Player, skill: keyof DeathKnowledge): void {
    const cache = this.getAll(player)
    cache[skill] += 1
    cache["points"] -= 1
    player.setDynamicProperty(`dk:${skill}`, cache[skill])
    player.setDynamicProperty("dk:points", cache["points"])
  }

  resetStatus(player: Player): void {
    const cache = apiDeathKnowledge.getAll(player)
    const used = cache.upXp + cache.upTpKey

    cache.upXp = 0
    player.setDynamicProperty("dk:upXp", 0)
    cache.upTpKey = 0
    player.setDynamicProperty("dk:upTpKey", 0)

    cache["points"] += used
    player.setDynamicProperty("dk:points", cache["points"])
  }

  get<T extends keyof DeathKnowledge>(player: Player, info: T): DeathKnowledge[T] {
    return (cachePlayerDeathKnowledge.get(player.id) ?? defaulDeathknowledge)[info]
  }

  getAll(player: Player): DeathKnowledge {
    return (cachePlayerDeathKnowledge.get(player.id) ?? defaulDeathknowledge)
  }
}

export const apiDeathKnowledgeXp = new class ApiDeathKnowledgeXp {
  increaseXp(player: Player, amount: number): number {
    const currentXp = apiDeathKnowledge.get(player, "xp")
    const newXp = apiNumber.clamp(currentXp + amount, 0, maxDeathKnowledgeXp)
    this.setXp(player, newXp)

    return newXp
  }

  increaseDeathPoint(player: Player, value: number): void {
    const cache = apiDeathKnowledge.getAll(player)
    const used = cache.upXp + cache.upTpKey

    if(value > 0 && used >= cache.lv) return

    const points = apiNumber.clamp(cache.points + value, 0, maxPoints -used)
    player.setDynamicProperty("dk:points", points)
    if(value > 0) apiWarn.notify(player, {translate: "notification.gravestone_death_path:death_knowledge.incrised", with: [(points - cache.points).toString()]})
    cache.points = points
  }

  getXpToNextLv(lv: number): number {
    if(xpToNextLvList[lv]) return xpToNextLvList[lv]
    if(lv < 0) return 0
    return (lv -4) * necessaryXpAfterLv5
  }

  setXp(player: Player, xpAmount: number): void {
    const lastXp = apiDeathKnowledge.get(player, "xp")
    apiDeathKnowledge.getAll(player).xp = xpAmount
    player.setDynamicProperty("dk:xp", xpAmount)

    this.updateLv(player, xpAmount, lastXp > xpAmount)
  }

  private updateLv(player: Player, xpAmount: number, decrease: boolean): void {
    const cache = apiDeathKnowledge.getAll(player)
    const lastLv = cache.lv

    if(decrease) cache.lv -= cache.lv

    let nextLevelNeed = this.getXpToNextLv(cache.lv)
    let levelsUped = 0

    while(xpAmount >= nextLevelNeed){
      !decrease && levelsUped++
      cache.lv += 1
      nextLevelNeed = this.getXpToNextLv(cache.lv)
    }
    if(decrease && lastLv != cache.lv){
      if(cache.points > 0) this.increaseDeathPoint(player, cache.lv - lastLv)
    }

    player.setDynamicProperty("dk:lv", cache.lv)
    if(levelsUped) this.increaseDeathPoint(player, levelsUped)
  }
}

const defaulDeathknowledge: DeathKnowledge = {
  xp: 0,
  lv: 0,
  points: 0,

  upXp: 0,
  upTpKey: 0
}

const xpToNextLvList: { [key: number]: number } = {
  0: 2,
  1: 4,
  2: 7,
  3: 9,
  4: 12
}
const necessaryXpAfterLv5 = 15

interface DeathKnowledge {
  xp: number
  lv: number
  points: number

  upXp: number
  upTpKey: number
}