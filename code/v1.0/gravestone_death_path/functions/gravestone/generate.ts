import { world, Block, BlockPermutation, BlockTypes, Player, Vector3 } from "@minecraft/server"

export const gravestoneGenerateTomb = new class GravestoneGenerateTomb {
  generate(player: Player, damageId?: string): Block | undefined {
    const dimMin = player.dimension.heightRange.min, dimMax = player.dimension.heightRange.max
    const { x, y, z } = player.location
    const initialBlock = y < dimMin ? player.dimension.getBlock({x, y: dimMin, z}) : y >= dimMax ? player.dimension.getBlock({x, y: dimMax -1, z}) : player.dimension.getBlock(player.location)
    if(!initialBlock || !initialBlock.isValid) return

    const targetBlock = initialBlock.isAir || canReplace.has(initialBlock.typeId) ? initialBlock : this.getSafeBlock(initialBlock)
    const graveId = this.createGraveId(player.dimension.id, damageId)
    const rot = player.getRotation().y +180
    const dir = directions4[rot < 45 || rot > 315 ? 2 : rot > 45 && rot < 135 ? 3 : rot > 135 && rot < 225 ? 0 : 1]
    targetBlock.setPermutation(BlockPermutation.resolve(graveId, {"minecraft:cardinal_direction": dir, "gravestone_death_path:breakable": false}))

    if(targetBlock.y > dimMin){
      const targetBlockBelow = targetBlock.below(1)
      const soilType = dimensionSoil[player.dimension.id]
      targetBlockBelow && soilCanReplace.has(targetBlockBelow.typeId ?? "") && soilType && targetBlockBelow.setType(soilType)
    }

    return targetBlock
  }

  private createGraveId(dimension: string, damage?: string): string {
    const blockId = `gravestone_death_path:gravestone${dimensionIds[dimension] ?? ""}`
    if(Math.random() * 100 < 1) return `${blockId}_${gravestoneEasterEgg[Math.floor(Math.random() * gravestoneEasterEgg.length)]}`

    const graveId = `${blockId}_${damage?.replace("minecraft:", "")}`
    if(BlockTypes.get(graveId) != undefined) return graveId
    return blockId
  }

  private getSafeBlock(block: Block): Block {
    const start = block.location
    const aproved: Vector3[] = []
    const testing: Vector3[] = [start]
    const visited = new Set<number>()
    visited.add((start.x << 20) ^ (start.y << 10) ^ start.z)
    let realIndex = 0

    const limitXP = start.x +2, limitXN = start.x -2, limitzP = start.z +2, limitzN = start.z -2

    // BFS system to find a safe block without lava or water
    while(realIndex < testing.length){
      const center = testing[realIndex++]
      if(!center) continue

      aproved.push(center)

      for(const offset of preOffsets6){
        const offsetX = center.x + offset[0], offsetY = center.y + offset[1], offsetZ = center.z + offset[2]
        if(offsetX > limitXP || offsetX < limitXN || offsetZ > limitzP || offsetZ < limitzN) continue

        const offsetKey = (offsetX << 20) ^ (offsetY << 10) ^ offsetZ

        if(visited.has(offsetKey)) continue
        visited.add(offsetKey)

        const targetBlock = block.dimension.getBlock({x: offsetX, y: offsetY, z: offsetZ})
        if(!targetBlock) continue
        if(canReplace.has(targetBlock.typeId)) return targetBlock

        testing.push(targetBlock.location)
      }
    }

    return block
  }
}

const preOffsets6: [number, number, number][] = [
  [ 0,  0, -1], [ 1,  0,  0],
  [ 0,  0,  1], [-1,  0,  0],
  [ 0,  1,  0],
  [ 0, -1,  0]
]

const directions4: [string, string, string, string] = ["north", "east", "south", "west"]

const dimensionIds: { [key: string]: string } = {
  "minecraft:nether": "_nether",
  "minecraft:the_end": "_end"
}

const canReplace = new Set([
  "minecraft:air",
  "minecraft:fern",
  "minecraft:large_fern",
  "minecraft:leaf_litter",
  "minecraft:short_dry_grass",
  "minecraft:short_grass",
  "minecraft:tall_dry_grass",
  "minecraft:tall_grass",
  "minecraft:vine"
])

const soilCanReplace = new Set(["minecraft:air", "minecraft:fern", "minecraft:large_fern", "minecraft:leaf_litter", "minecraft:short_dry_grass", "minecraft:short_grass", "minecraft:tall_dry_grass", "minecraft:tall_grass", "minecraft:vine", "minecraft:flowing_lava", "minecraft:lava", "minecraft:flowing_water", "minecraft:water"])
const dimensionSoil: { [key: string]: string } = {
  "minecraft:overworld": "minecraft:dirt",
  "minecraft:nether": "minecraft:netherrack",
  "minecraft:the_end": "minecraft:end_stone"
}

const gravestoneEasterEgg: string[] = [
  "akinari_dummy",
  "akirasky2663",
  "aniralacradx",
  "endermen76428",
  "replay1977",
  "strangetnt27",
  "xuxinrui5201314",
  "xxxx41523",
]