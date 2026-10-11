import { ItemStack, Player, Vector3, world } from "@minecraft/server"
import { apiScoreboard } from "../../../0-lib/math/scoreboard"
import { apiNumbers } from "../../../0-lib/math/numbers"
import { apiWarn } from "../../../0-lib/player/warn"
import { upgradeXpDiscount } from "../../variables"
import { waystoneCache } from "../cache/waystone"
import { colorDimension } from "../../ui/listUI"
import { exitDirection } from "../../ui/infoUI"
import { apiOrganize } from "../apiOrganize"
import { waystonesList } from "./list"

const turnDegress = 180 / Math.PI
const inveseSplit = 1 / 90

export const waystoneInfo = new class ApiWaystoneInfo {
  saveWaystone(player: Player, info: IWaystoneCreateInfo): string {
    const name = apiOrganize.sameNames(info.name, waystonesList.getPlayerWaystones(player.id).map(value => value.name))
    const access = info.access ? 1 : 0
    const id = player.dimension.id.replace("minecraft:", "") + `/${info.pos.x},${info.pos.y},${info.pos.z}`

    const disX = player.location.x - (info.pos.x +0.5)
    const disZ = player.location.z - (info.pos.z +0.5)
    const degress = Math.atan2(-disX, disZ) * turnDegress +225
    const offsetIndex = apiNumbers.wrapRange(Math.floor(degress * inveseSplit) +1, 1, 4)
    const offset = exitDirection[offsetIndex] ?? "auto"

    const waystoneScore = apiScoreboard.getObj(`simple_waystone/w/${id}`)
    waystoneScore.setScore(`0/${player.id}`, 0) // Owner
    waystoneScore.setScore(`1/${name}`, 0) // Waystone Name
    waystoneScore.setScore("access", access)
    waystoneScore.setScore("icon", 0)
    waystoneScore.setScore("color", 0)
    waystoneScore.setScore("xp_discount", 100)
    waystoneScore.setScore("offset", offsetIndex)
    waystoneScore.setScore("lock", 0)

    apiScoreboard.getObj(`simple_waystone/p/${player.id}`).setScore(`${access}/${id}`, 0)

    waystoneCache.create({
      access,
      owner: player.id,
      name: info.name,
      pos: info.pos,
      dimension: player.dimension.id,
      offset,
      xpDiscount: 1,
      icon: 0,
      color: 0,
      claim: new Set<string>(),
      favorite: new Set<string>(),
      lock: false
    })

    return name
  }

  removeWaystone(pos: Vector3, dimension: string): void {
    const id = `${dimension.replace("minecraft:", "")}/${pos.x},${pos.y},${pos.z}`
    const waystone = waystoneCache.getWaystone(id)
    if(!waystone) return

    // Remove the Waystone Id from owner list
    apiScoreboard.getObj(`simple_waystone/p/${waystone.owner}`).removeParticipant(`${waystone.access}/${id}`)

    // Remove the Waystone Id from the Players that claimed this Waystone
    const score = apiScoreboard.getObj(`simple_waystone/w/${id}`)
    const itemId = upgradeXpDiscount[score.getScore("xp_discount") ?? 0]
    if(itemId) try { world.getDimension(dimension).spawnItem(new ItemStack(itemId), {x: pos.x +0.5, y: pos.y +0.5, z: pos.z +0.5}) } catch {}

    const { claimed, favorited } = score.getParticipants().reduce((acc, {displayName}) => {
      if(displayName[1] != "/") return acc
      const prefix = displayName.slice(0, 2)
      const value = displayName.slice(2)
      switch (prefix) {
        case "2/":
          acc.claimed.add(value)
          break
        case "3/":
          acc.favorited.add(value)
          break
      }
      return acc
    }, { claimed: new Set<string>(), favorited: new Set<string>() })

    const claim = claimed.values()
    for(let i = 0, len = claimed.size; i < len; i++){
      const playerId = claim.next().value
      playerId && apiScoreboard.removeParticipant(`simple_waystone/p/${playerId}`, `2/${id}`)
    }
    const favorite = favorited.values()
    for(let i = 0, len = favorited.size; i < len; i++){
      const playerId = favorite.next().value
      playerId && apiScoreboard.removeParticipant(`simple_waystone/p/${playerId}`, `3/${waystone.access}/${id}`)
    }

    // Remove Waystone Info
    apiScoreboard.removeObj(score)

    // Remove from the cache
    waystoneCache.remove(id)
  }

  claimedWaystone(player: Player, waystone: IWaystoneInfo): boolean {
    if(waystone.access == 1) return false
    if(waystone.owner == player.id) return false
    if(waystone.claim.has(player.id)) return false
    const id = waystone.dimension.replace("minecraft:", "") + `/${waystone.pos.x},${waystone.pos.y},${waystone.pos.z}`

    const claimScore = apiScoreboard.getObj(`simple_waystone/p/${player.id}`)
    claimScore.setScore(`2/${id}`, 0)

    const waystoneScore = apiScoreboard.getObj(`simple_waystone/w/${id}`)
    waystoneScore.setScore(`2/${player.id}`, 0)

    waystoneCache.claim(player.id, id)

    apiWarn.notify(player, {translate: "block.warn.simple_waystone:waystone.claimed_waystone", with: [`${colorDimension[waystone.dimension] ?? ""}${waystone.name}`]})
    player.dimension.playSound("block.simple_waystone:waystone.claim", waystone.pos)
    return true
  }
}

interface IWaystoneCreateInfo {
  name: string,
  access: boolean,
  pos: Vector3
}

export interface IWaystoneInfo {
  access: 0 | 1 // Private | Public
  owner: string // Player Id
  name: string
  pos: Vector3
  dimension: string // Dimension Id
  offset: "auto" | "north" | "south" | "east" | "west"
  xpDiscount: number
  icon: number
  color: number
  claim: Set<string>
  favorite: Set<string>
  lock: boolean
}