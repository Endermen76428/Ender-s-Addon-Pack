import { world, Player, Vector3, ItemStack } from "@minecraft/server"
import { apiScoreboard } from "../../../0-lib/math/scoreboard"
import { apiWarn } from "../../../0-lib/player/warn"
import { upgradeXpDiscount } from "../../variables"
import { waystoneCache } from "../cache/waystone"
import { colorDimension } from "../../ui/listUI"
import { apiOrganize } from "../apiOrganize"
import { waystonesList } from "./list"

export const waystoneInfo = new class ApiWaystoneInfo {
  saveWaystone(player: Player, info: WaystoneCreateInfo): string {
    const name = apiOrganize.sameNames(info.name, waystonesList.getPlayerWaystones(player.id).map(value => value.name))
    const access = info.access ? 1 : 0
    const id = player.dimension.id.replace("minecraft:", "") + `/${info.pos.x},${info.pos.y},${info.pos.z}`

    const waystoneScore = apiScoreboard.getObj(`simple_waystone/w/${id}`)
    waystoneScore.setScore(`0/${player.id}`, 0) // Owner
    waystoneScore.setScore(`1/${name}`, 0) // Waystone Name
    waystoneScore.setScore(`access`, access)
    waystoneScore.setScore(`icon`, 0)
    waystoneScore.setScore(`color`, 0)
    waystoneScore.setScore(`xp_discount`, 100)
    waystoneScore.setScore(`offset`, 0)

    apiScoreboard.getObj(`simple_waystone/p/${player.id}`).setScore(`${access}/${id}`, 0)

    waystoneCache.create({
      access,
      owner: player.id,
      name: info.name,
      pos: info.pos,
      dimension: player.dimension.id,
      offset: "auto",
      xpDiscount: 1,
      icon: 0,
      color: 0,
      claim: new Set<string>(),
      favorite: new Set<string>()
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
    for(const playerId of claimed){
      apiScoreboard.removeParticipant(`simple_waystone/p/${playerId}`, `2/${id}`)
    }
    for(const playerId of favorited){
      apiScoreboard.removeParticipant(`simple_waystone/p/${playerId}`, `3/${waystone.access}/${id}`)
    }

    // Remove Waystone Info
    apiScoreboard.removeObj(score)

    // Remove from the cache
    waystoneCache.remove(id)
  }

  claimedWaystone(player: Player, waystone: WaystoneInfo): boolean {
    if(waystone.access == 1) return false
    if(waystone.owner == player.id) return false
    if(waystone.claim.has(player.id)) return false
    const id = waystone.dimension.replace("minecraft:", "") + `/${waystone.pos.x},${waystone.pos.y},${waystone.pos.z}`

    const claimScore = apiScoreboard.getObj(`simple_waystone/p/${player.id}`)
    claimScore.setScore(`2/${id}`, 0)

    const waystoneScore = apiScoreboard.getObj(`simple_waystone/w/${id}`)
    waystoneScore.setScore(`2/${player.id}`, 0)

    waystoneCache.claim(player.id, id)

    apiWarn.notify(player, {translate: "warning.simple_waystone:waystone.claimed_waystone", with: [`${colorDimension[waystone.dimension]}${waystone.name}`]}, {sound: "warn.ender_addon_pack:levelup"})
    return true
  }
}

interface WaystoneCreateInfo {
  name: string,
  access: boolean,
  pos: Vector3
}

export interface WaystoneInfo {
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
}