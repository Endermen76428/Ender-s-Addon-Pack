import { world, Player } from "@minecraft/server"

export const apiDeleteBlocks = new class ApiDeleteBlocks {
  allBlocks = ["minecraft:stone", "minecraft:dirt", "minecraft:gravel", "minecraft:deepslate", "minecraft:andesite", "minecraft:diorite", "minecraft:granite", "minecraft:tuff"]

  get(player: Player): Set<string> {
    const dynamic = player.getDynamicProperty("utilities_vein_miner:delete_blocks")
    if(typeof dynamic != "string") return new Set()

    const array = JSON.parse(dynamic)
    if(this.isValid(array)) return new Set(array)

    return new Set(this.allBlocks)
  }

  set(player: Player, value: string[]): void {
    player.setDynamicProperty("utilities_vein_miner:delete_blocks", JSON.stringify(value))
  }

  private isValid(arr: any[]): arr is string[] {
    return arr.every(value => typeof value === "string")
  }
}