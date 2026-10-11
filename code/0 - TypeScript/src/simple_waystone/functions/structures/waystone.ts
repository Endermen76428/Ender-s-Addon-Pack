import { apiNumbers } from "../../../0-lib/math/numbers"
import { Block, world } from "@minecraft/server"

export function generateNetherWaystone(block: Block): void {
  const waystoneId = structureIds[block.typeId]
  if(waystoneId == undefined) return console.error("Structure ID not found for block type:", block.typeId)
  block.setType("minecraft:bedrock")

  const floor = netherDepthFunction(block, 3)

  const seed = `${block.x -3},${floor},${block.z -3}`
  const random = apiNumbers.randomSeed(seed)
  const type = random < 0.1 ? "classic" : random < 0.5 ? "plates" : "normal"
  world.structureManager.place(`mystructure:simple_waystone/${type}/${waystoneId}`, block.dimension, {x: block.x -3, y: floor, z: block.z -3})
  world.structureManager.place(`mystructure:simple_waystone/${type}/placeholder/${waystoneId}`, block.dimension, {x: block.x -3, y: floor, z: block.z -3}, {integrity: Math.min(random, 0.25), integritySeed: seed})
}

const maxDepth = 5
export function netherDepthFunction(block: Block, range: number): number {
  let floor = 0
  let backupFloor = 0
  let validFloor = true
  let maxSpace = 0
  for(let y = block.dimension.heightRange.min, len = block.dimension.heightRange.max; y < len; y++){
    const target = block.dimension.getBlock({x: block.x, y, z: block.z})
    if(target == undefined || target.isValid == false) continue

    if(target.typeId == "minecraft:lava"){
      validFloor = false
      continue
    } else if(allowedNetherBlocks.has(target.typeId)){
      if(validFloor == false) continue
      maxSpace++
      if(maxSpace >= 5){
        const master = block.dimension.getBlock({x: block.x, y: y - maxSpace, z: block.z})
        if(master == undefined || master.isValid == false) break
        const corner1 = master.north(range), corner2 = master.south(range), corner3 = master.west(range), corner4 = master.east(range)
        if(allowedNetherBlocks.has(corner1?.typeId ?? "") || allowedNetherBlocks.has(corner2?.typeId ?? "") || allowedNetherBlocks.has(corner3?.typeId ?? "") || allowedNetherBlocks.has(corner4?.typeId ?? "")){
          validFloor = false
          backupFloor = y - maxSpace
          continue
        }
        floor = y - maxSpace
        break
      }
    } else {
      maxSpace = 0
      validFloor = true
    }
  }

  floor = Math.max(floor, backupFloor)
  if(floor == 0) floor = 31

  // Sistema de Depth para afundar a waystone e não nascer voando
  for(let y = floor, len = floor - maxDepth; y > len; y--){
    const master = block.dimension.getBlock({x: block.x, y, z: block.z})
    if(master == undefined || master.isValid == false) break
    const corner1 = master.north(3), corner2 = master.south(3), corner3 = master.west(3), corner4 = master.east(3)
    if(allowedNetherBlocks.has(corner1?.typeId ?? "") || allowedNetherBlocks.has(corner2?.typeId ?? "") || allowedNetherBlocks.has(corner3?.typeId ?? "") || allowedNetherBlocks.has(corner4?.typeId ?? "")) continue

    floor = y
    break
  }

  return floor
}

const structureIds: { [key: string]: string } = {
  "ws:nether_waystone_loader": "nether_waystone_structure",
  "ws:basalt_waystone_loader": "basalt_waystone_structure",
  "ws:crimson_waystone_loader": "crimson_waystone_structure"
}

const allowedNetherBlocksList = [
  "minecraft:air",
  "minecraft:lava",
  "minecraft:crimson_roots",
  "minecraft:crimson_fungus",
  "minecraft:weeping_vines",
  "minecraft:warped_roots",
  "minecraft:warped_fungus",
  "minecraft:twisting_vines",
  "minecraft:brown_mushroom",
  "minecraft:red_mushroom"
]
const allowedNetherBlocks = new Set(allowedNetherBlocksList)