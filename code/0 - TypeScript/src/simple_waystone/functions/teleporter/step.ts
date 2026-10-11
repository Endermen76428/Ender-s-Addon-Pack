import { Block, Entity, Player, system, world } from "@minecraft/server"
import { teleporterPadCache } from "../../lib/cache/teleporter"
import { teleporterPadSpace } from "../../lib/teleporter/space"
import { teleporterPadInfo } from "../../lib/teleporter/info"
import { apiWarn } from "../../../0-lib/player/warn"
import { teleporterPadTimer } from "./place"

const lastDate: { [key: string]: number } = {}

export const teleporterPadStep = new class TeleporterPadStep {
  stepOn(block: Block, entity: Entity): void {
    if(entity.hasTag("simple_waystone:teleporter")) return

    const id = `${block.dimension.id.replace("minecraft:", "")}/${block.x},${block.y},${block.z}`
    const teleporter = teleporterPadCache.getTeleporter(id)
    if(teleporter == undefined || teleporter == true) return

    const { pos, dimension } = teleporter
    if(pos == undefined || dimension == undefined) return
    if(teleporterPadCache.getTeleporter(`${dimension.replace("minecraft:", "")}/${pos.x},${pos.y},${pos.z}`) == undefined){
      teleporterPadInfo.removeShard(block)
      teleporterPadSpace.spawnShard(block)
      entity instanceof Player && apiWarn.notify(entity, "block.warn.simple_waystone:teleporter.place_shard.target_no_longer_exist", {sound: "warn.ender_addon_pack:bass"})
      return
    }

    entity.setDynamicProperty("tp_block", block.location)

    const bottomCenter = block.bottomCenter()
    if(teleporterPadTimer.has(id) == false){
      block.dimension.playSound("block.simple_waystone:teleporter_pad.teleporting", bottomCenter)
      block.dimension.spawnParticle("simple_waystone:teleporter_pad_ring", bottomCenter)
    }
    teleporterPadTimer.set(id, system.runTimeout(() => {
      if(!entity.isValid) return
      const lastPos = (r => typeof r == "object" ? r : entity.location)(entity.getDynamicProperty("tp_block"))
      const disX = (entity.location.x - (lastPos.x +0.5)), disZ = (entity.location.z - (lastPos.z +0.5))
      const distance = disX * disX + disZ * disZ // 0.64 = 0.8 * 0.8

      const newBlock = entity.dimension.getBlock(distance < 0.64 ? lastPos : entity.location)
      if(newBlock?.typeId == "ws:teleporter_pad"){
        if(teleporter.broken){
          teleporterPadSpace.setEmptyPad(block)
          teleporterPadInfo.removeShard(block)
          block.dimension.playSound("block.simple_waystone:teleporter_pad.shard_break", bottomCenter)
          system.run(() => {
            block.dimension.playSound("block.simple_waystone:teleporter_pad.shard_break", entity.location)
          })
        }
        block.dimension.playSound("block.simple_waystone:waystone.teleport", bottomCenter)
        system.run(() => {
          block.dimension.playSound("block.simple_waystone:waystone.teleport", entity.location)
        })

        entity.addTag("simple_waystone:teleporter")
        entity.teleport({x: pos.x +0.5, y: pos.y +0.5, z: pos.z +0.5}, {dimension: world.getDimension(teleporter.dimension)})
      }
      teleporterPadTimer.delete(id)
    }, 20 * 3))
  }

  stepOff(block: Block, entity: Entity): void {
    if(Date.now() - (lastDate[entity.id] ?? 0) < 150) return
    lastDate[entity.id] = Date.now()

    const lastPos = (r => typeof r == "object" ? r : undefined)(entity.getDynamicProperty("tp_block"))
    if(lastPos){
      if(lastPos.x != block.x || lastPos.y != block.y || lastPos.z != block.z){
        entity.removeTag("simple_waystone:teleporter")
      }
    } else entity.removeTag("simple_waystone:teleporter")

    const id = `${block.dimension.id.replace("minecraft:", "")}/${block.x},${block.y},${block.z}`
    const teleporter = teleporterPadCache.getTeleporter(id)
    if(teleporter == undefined || teleporter == true) return

    const timerId = teleporterPadTimer.get(id)
    if(timerId) system.clearRun(timerId)
    teleporterPadTimer.delete(id)
  }
}