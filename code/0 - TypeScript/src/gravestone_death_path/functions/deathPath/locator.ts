import { world, system, ItemStack, Block, Dimension, Player, Vector3, Entity } from "@minecraft/server"
import { apiItemDynamic, DeathPathPoint } from "../../lib/item/dynamic"
import { apiConfig } from "../../lib/player/config"
import { apiVec3 } from "../../lib/math/vector"

export const cacheDeathPathBykey = new Map<string, DeathPathPoint[]>() // Player Id + Key Lore > Path Points with smoothing
const currentPoints = new Map<number, DeathPathPoint[]>()
let pointMapIndex = 0
const animationStep = 10
const maxDistance = 5 * 5
// Smooth
const segments = 10
const invertSegments = 1 / segments

export const deathPathLocator = new class DeathPathLocator {
  start(player: Player, item: ItemStack, block: Block): void {
    player.dimension.getEntities({type: "gravestone_death_path:ghost", tags: [`gravestone_death_path.owner: ${player.id}`]}).forEach(entity => entity.remove())
    const points = apiItemDynamic.getDeathPath(item)

    if(points.length < 1) return

    const blockCenter = block.bottomCenter()
    const blockUp = {x: blockCenter.x, y: blockCenter.y +1, z: blockCenter.z}
    const index = this.getClosestPoint(block.dimension.id, blockCenter, points)

    const startPoint: DeathPathPoint | undefined = (() => {
      const info = points[index] ?? undefined
      if(!info) return undefined

      const disX = info.pos.x - blockCenter.x, disY = info.pos.y - blockCenter.y, disZ = info.pos.z - blockCenter.z
      // console.warn("Distance:", disX * disX + disY * disY + disZ * disZ, "| Max:", maxDistance)
      if(disX * disX + disY * disY + disZ * disZ < maxDistance) return undefined

      return {pos: blockUp, dimension: block.dimension.id}
    })()

    // console.warn("Normal:", JSON.stringify(points.slice(index).map(value => value.pos)))
    // console.warn("Smooth:", JSON.stringify(smoothPath(points.slice(index), 20)))

    // Verifica se é um Death Path com Reaper
    if(apiConfig.get(player, "pathType") % 2 != 0){
      const { pos, dimension } = points[index] ?? {}
      const { pos: nextPos, dimension: nextDimension } = points[index +1] ?? {}

      const ghost = block.dimension.spawnEntity("gravestone_death_path:ghost", blockUp)
      ghost.addTag(`gravestone_death_path.owner: ${player.id}`)

      currentPoints.delete(pointMapIndex -7)
      pointMapIndex++
      currentPoints.set(pointMapIndex, points)
      if(pos){
        this.updateRotate(ghost, nextPos ? nextPos : pos)
        this.startMove(ghost, index)
      }
    }

    const newPoints = startPoint ? [startPoint, ...points.slice(index)] : points.slice(index)

    const pathType = Math.floor(apiConfig.get(player, "pathType") /2)
    const flameType = (Flames[pathType] ?? Flames[0])

    flameType && this.generateParticles(player.dimension, smoothPath(newPoints), flameType)
    // this.generateParticles(player.dimension, [{pos: blockUp, dimension: block.dimension.id}, ...points.slice(index)], 0)
  }

  private async startMove(entity: Entity, index: number): Promise<void> {
    const points = currentPoints.get(pointMapIndex)
    if(!points) return
    const { pos: pos0, dimension: dimension0 } = points[index] ?? {}
    const { pos: pos1, dimension: dimension1 } = points[index +1] ?? {}
    const { pos: pos2, dimension: dimension2 } = points[index +2] ?? {}
    const { pos: pos3, dimension: dimension3 } = points[index +3] ?? {}
    if(!pos0) return entity.triggerEvent("gravestone_death_path:despawn_ghost")
    const distance1 = apiVec3.divide(apiVec3.distanceXYZ(apiVec3.bottomCenter(entity.location), apiVec3.bottomCenter(pos1 ? pos1 : pos0)), animationStep)
    const distance2 = apiVec3.divide(apiVec3.distanceXYZ(apiVec3.bottomCenter(pos1 ? pos1 : entity.location), apiVec3.bottomCenter(pos2 ? pos2 : pos0)), animationStep)
    const distance3 = apiVec3.divide(apiVec3.distanceXYZ(apiVec3.bottomCenter(pos2 ? pos2 : entity.location), apiVec3.bottomCenter(pos3 ? pos3 : pos0)), animationStep)
    try {
      await system.waitTicks(20 * 1.6)
      this.moveHere(entity, distance1)

      await system.waitTicks(11)
      if(!pos2) return entity.triggerEvent("gravestone_death_path:despawn_ghost")
      this.updateRotate(entity, pos2)
      this.moveHere(entity, distance2)

      await system.waitTicks(11)
      if(!pos3) return entity.triggerEvent("gravestone_death_path:despawn_ghost")
      this.updateRotate(entity, pos3)
      this.moveHere(entity, distance3)
    } catch {}
  }

  async continueMoving(entity: Entity): Promise<void> {
    const points = currentPoints.get(pointMapIndex)
    if(!points) return

    const index = this.getClosestPoint(entity.dimension.id, entity.location, points)
    const { pos, dimension } = points[index +1] ?? {}

    try {
      if(pos){
        const distance = apiVec3.divide(apiVec3.distanceXYZ(apiVec3.bottomCenter(entity.location), apiVec3.bottomCenter(pos ? pos : entity.location)), animationStep)

        entity.setDynamicProperty("gravestone_death_path:ghost_animation_step", 0)
        if(pos) this.updateRotate(entity, pos)

        return this.moveHere(entity, distance)
      }

      await system.waitTicks(11)
      entity.triggerEvent("gravestone_death_path:despawn_ghost")
    } catch {}
  }

  async moveHere(entity: Entity, distance: Vector3): Promise<void> {
    try {
      const step = entity.getDynamicProperty("gravestone_death_path:ghost_animation_step") ?? 0
      if(typeof step != "number" || step >= animationStep) return entity.setDynamicProperty("gravestone_death_path:ghost_animation_step", undefined)
      entity.setDynamicProperty("gravestone_death_path:ghost_animation_step", step +1)

      entity.tryTeleport(apiVec3.offset(entity.location, distance))
      await system.waitTicks(1)
      this.moveHere(entity, distance)
    } catch {}
  }

  private updateRotate(entity: Entity, nextPos: Vector3){
    const currentPos = apiVec3.bottomCenter(entity.location)
    const newPos = apiVec3.bottomCenter(nextPos)
    const degress = Math.floor(Math.atan2(currentPos.z - newPos.z, currentPos.x - newPos.x) * (180 / Math.PI)) +90
    entity.setProperty("gravestone_death_path:rotate", degress)
  }

  private async generateParticles(dimension: Dimension, points: DeathPathPoint[], flameType: string): Promise<void> {
    for(let i = 0, len = points.length; i < len; i++){
      const { pos } = points[i] ?? {}
      // Precisa fazer ele dar spawn na dimensão correta
      try {
        if(pos) dimension.spawnParticle(flameType, pos)
        // if(pos) dimension.spawnParticle("minecraft:basic_flame_particle", {x: pos.x +0.5, y: pos.y +0.25, z: pos.z +0.5})
      } catch { break }
      // if(i % 2 == 0) await system.waitTicks(1)
      await system.waitTicks(1)
    }
  }

  getPoints(player: Player, item: ItemStack): DeathPathPoint[] {
    const cacheId = `${player.id}/${item.getLore()[0] ?? ""}`
    const cache = cacheDeathPathBykey.get(cacheId)

    if(cache) return cache

    const points = smoothPath(apiItemDynamic.getDeathPath(item))
    cacheDeathPathBykey.set(cacheId, points)
    return points
  }

  private getClosestPoint(startDimension: string, startPos: Vector3, points: DeathPathPoint[]): number {
    const dimensionId = startDimension.replace("minecraft:", "")
    const distances: (number | undefined)[] = []
    let currentIndex = 0

    while(currentIndex < points.length){
      const { pos, dimension } = points[currentIndex++] ?? {}
      if(dimension != dimensionId || pos == undefined){
        distances.push(undefined)
        continue
      }

      const disX = pos.x - startPos.x, disY = pos.y - startPos.y, disZ = pos.z - startPos.z
      distances.push(disX * disX + disY * disY + disZ * disZ)
    }

    return distances.reduce((minIdx, dist, idx, arr) => {
      if(dist == undefined) return minIdx

      const min = arr[minIdx ?? 0]
      if(min == undefined) return idx

      return dist < min ? idx : minIdx
    }, 0) ?? 0
  }
}

function smoothPath(points: DeathPathPoint[]): DeathPathPoint[] {
  const result: DeathPathPoint[] = []

  for(let i = 0, len = points.length -1; i < len; i++) smoothPoint(points, result, i)

  const lastPoint = points[points.length - 1]
  if(lastPoint) result.push(lastPoint)

  return result
}

function smoothPoint(points: DeathPathPoint[], result: DeathPathPoint[], i: number): void {
  const p0 = (points[i - 1] ?? points[i])?.pos
  const p1 = (points[i])?.pos
  const p2 = (points[i + 1])?.pos
  const p3 = (points[i + 2]?.pos ?? p2)

  if(!p0) return
  if(!p1) return
  if(!p2) return
  if(!p3) return

  for(let j = 0; j < segments; j++) {
    const t = j * invertSegments
    result.push({pos: catmullRom(p0, p1, p2, p3, t), dimension: points[i]?.dimension ?? ""})
  }
}

function catmullRom(p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, t: number): Vector3 {
  const t2 = t * t
  const t3 = t2 * t

  return {
    x: 0.5 * (
      (2 * p1.x) +
      (-p0.x + p2.x) * t +
      (2*p0.x - 5*p1.x + 4*p2.x - p3.x) * t2 +
      (-p0.x + 3*p1.x - 3*p2.x + p3.x) * t3
    ),

    y: 0.5 * (
      (2 * p1.y) +
      (-p0.y + p2.y) * t +
      (2*p0.y - 5*p1.y + 4*p2.y - p3.y) * t2 +
      (-p0.y + 3*p1.y - 3*p2.y + p3.y) * t3
    ),

    z: 0.5 * (
      (2 * p1.z) +
      (-p0.z + p2.z) * t +
      (2*p0.z - 5*p1.z + 4*p2.z - p3.z) * t2 +
      (-p0.z + 3*p1.z - 3*p2.z + p3.z) * t3
    )
  }
}

const Flames = [
  "gravestone_death_path:ghost_shadow",
  "minecraft:basic_flame_particle"
]