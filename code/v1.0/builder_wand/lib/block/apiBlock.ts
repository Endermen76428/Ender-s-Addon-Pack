import { world } from "@minecraft/server"

export const apiBlock = new class ApiBlock {
  formatId(id: string): string[] {
    if(id == "unlit_redstone_torch") return ["minecraft:redstone_torch", id]
    if(id.includes("lit_")) return [id.replace("lit_", ""), id]
    const multi = multipleBlocks[id]
    return multi ?? [id]
  }

  getFaceDregress(face: string): 0 | 1 | 2 | 3 | 4 | 5 {
    return facesList[face ?? "Down"] ?? 0
  }
}

const facesList: { [key: string]: 0 | 1 | 2 | 3 | 4 | 5 } = {
  "North": 2,
  "East": 3,
  "South": 0,
  "West": 1,
  "Up": 5,
  "Down": 4
}

const multipleBlocks: { [key: string]: string[] } = {
  "minecraft:grass_block": ["minecraft:grass_block", "minecraft:dirt"],
  "minecraft:grass_path": ["minecraft:grass_path", "minecraft:dirt"],
  "minecraft:mycelium": ["minecraft:mycelium", "minecraft:dirt"],
  "minecraft:podzol": ["minecraft:podzol", "minecraft:dirt"]
}