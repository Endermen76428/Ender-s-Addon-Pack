import { world, Player, Vector3 } from "@minecraft/server"
import { waystoneCache } from "../cache/waystone"
import { AddonConfig } from "../../variables"
import { apiOrganize } from "../apiOrganize"
import { apiConfig } from "../apiConfig"
import { WaystoneInfo } from "./info"

const showDimension = [["minecraft:overworld", "minecraft:nether", "minecraft:the_end"], ["minecraft:overworld"], ["minecraft:nether"], ["minecraft:the_end"]]

export const waystonesList = new class WaystonesList {
  /** @returns Return private Waystones in the list of the player. */
  getPrivateWaystones(player: Player): WaystoneInfo[] {
    const config = apiConfig.getConfig(player)
    const dimensionToShow = AddonConfig.tpBetweenDimension ? showDimension[config.showDimension] ?? [] : [player.dimension.id]
    const waystones: WaystoneInfo[] = []

    const {private: pri, claim} = waystoneCache.getPlayerWaystoneIds(player.id)
    for(const set of [pri, claim]){
      for(const id of set){
        const value = waystoneCache.getWaystone(id)
        if(value && dimensionToShow.includes(value.dimension)) waystones.push(value)
      }
    }

    return apiOrganize.organizeDimension(player, waystones)
  }

  /** @returns Return public Waystones. */
  getPublicWaystones(player: Player): WaystoneInfo[] {
    const config = apiConfig.getConfig(player)
    const dimensionToShow = AddonConfig.tpBetweenDimension ? showDimension[config.showDimension] ?? [] : [player.dimension.id]
    const waystones: WaystoneInfo[] = waystoneCache.getPublicWaystones().filter(value => dimensionToShow.includes(value.dimension))

    return apiOrganize.organizeDimension(player, waystones)
  }

  /** @returns Return only Waystones created by the player. */
  getPlayerWaystones(playerId: string): WaystoneInfo[] {
    const waystones: WaystoneInfo[] = []
    const { private: pri, public: pub } = waystoneCache.getPlayerWaystoneIds(playerId)

    for(const set of [pri, pub]){
      for(const id of set){
        const value = waystoneCache.getWaystone(id)
        if(value) waystones.push(value)
      }
    }
    return waystones
  }

  /** @returns Return a specific Waystones from the waystone list. */
  findWaystone(dimension: string, pos: Vector3): WaystoneInfo | undefined {
    return waystoneCache.getWaystone(`${dimension.replace("minecraft:", "")}/${pos.x},${pos.y},${pos.z}`)
  }
}