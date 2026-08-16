import { world, system, BlockComponentPlayerPlaceBeforeEvent, StructureRotation, EntityComponentTypes, EquipmentSlot } from "@minecraft/server"
import { apiMinerSpace } from "../../lib/block/minerSpace"
import { apiScoreboard } from "../../lib/math/scoreboard"
import { apiVec3 } from "../../lib/math/vector3"
import { apiString } from "../../lib/string"

export function placeDigitalMiner(ev: BlockComponentPlayerPlaceBeforeEvent): void {
  const { block, player } = ev
  const item = player?.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
  if(!item || item.typeId != "digital_miner:digital_miner"){
    ev.cancel = true
    return
  }

  const emptySpace = block.dimension.getBlocks(apiMinerSpace.getSize(block.location), {includeTypes: allowedBlocks}).getCapacity()

  if(emptySpace != 18 || block.dimension.heightRange.max - block.location.y == 1){
    ev.cancel = true
    return
  }

  system.run(() => {
    const rotate = rotateDirection[block.permutation.getState("minecraft:cardinal_direction") ?? "south"]
    if(rotate == undefined) return
    world.structureManager.place("mystructure:digital_miner/digital_miner_off", block.dimension, {x: block.x -1, y: block.y, z: block.z -1}, {rotation: rotate})

    const upSpeed = (r => typeof r == "number" ? r : 0)(item.getDynamicProperty("speed"))
    if(upSpeed != 0) apiMinerSpace.changeSpeed(block, upSpeed, block.location)

    const upAnchor = (r => typeof r == "number" ? r : 0)(item.getDynamicProperty("anchor"))
    if(upAnchor) block.dimension.spawnEntity("digital_miner:anchor_upgrade", {x: block.x +0.5, y: block.y +0.5, z: block.z +0.5})

    const scoreInfo = apiScoreboard.addObj(`digital_miner/miner/${apiString.getDimension(block)}/${apiVec3.toString(block.location)}`)
    scoreInfo.setScore("info/radius", (r => typeof r == "number" ? r : 32)(item.getDynamicProperty("radius")))
    scoreInfo.setScore("info/max_y", (r => typeof r == "number" ? r : block.dimension.heightRange.max)(item.getDynamicProperty("max_y")))
    scoreInfo.setScore("info/min_y", (r => typeof r == "number" ? r : block.dimension.heightRange.min)(item.getDynamicProperty("min_y")))
    scoreInfo.setScore("info/up_speed", upSpeed)
    scoreInfo.setScore("info/up_stack", (r => typeof r == "number" ? r : 0)(item.getDynamicProperty("stack")))
    scoreInfo.setScore("info/up_fortune", (r => typeof r == "number" ? r : 0)(item.getDynamicProperty("fortune")))
    scoreInfo.setScore("info/up_silk_touch", (r => typeof r == "number" ? r : 0)(item.getDynamicProperty("silk_touch")))
    scoreInfo.setScore("info/up_anchor", upAnchor)

    const typeFilter = JSON.parse((r => typeof r != "string" ? "[]" : r)(item.getDynamicProperty("type"))) as string[]
    typeFilter.forEach(type => { scoreInfo.setScore(`type/${type}`, 0) })
    const tagFilter = JSON.parse((r => typeof r != "string" ? "[]" : r)(item.getDynamicProperty("tag"))) as string[]
    tagFilter.forEach(tag => { scoreInfo.setScore(`tag/${tag}`, 0) })
  })
}

const allowedBlocks = ["minecraft:air", "minecraft:water", "minecraft:flowing_water", "minecraft:lava", "minecraft:flowing_lava", "minecraft:short_grass", "minecraft:tall_grass", "minecraft:short_dry_grass", "minecraft:leaf_litter", "minecraft:snow_layer", "minecraft:bush", "minecraft:firefly_bush"]

const rotateDirection: { [ket: string]: StructureRotation } = {
  "south": StructureRotation.None,
  "west": StructureRotation.Rotate90,
  "north": StructureRotation.Rotate180,
  "east": StructureRotation.Rotate270
}