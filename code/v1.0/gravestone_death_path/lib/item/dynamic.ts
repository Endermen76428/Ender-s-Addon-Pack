import { world, ItemStack, Player, Vector3 } from "@minecraft/server"

export const apiItemDynamic = new class apiItemDynamic {
  transferDeathPath(player: Player, item: ItemStack, lastPos: Vector3): void {
    const count = (r => typeof r != "number" ? 0 : r)(player.getDynamicProperty("count"))

    // Get the index of the oldest location to be easier to make some math later
    item.setDynamicProperty("first", (r => r > 300 ? r -300 : 1)(count))
    item.setDynamicProperty("last", lastPos)
    item.setDynamicProperty("lastD", player.dimension.id)
    item.setDynamicProperty("owner", Number(player.id))

    // Trasnfer all locations to item
    player.getDynamicPropertyIds().filter(value => value.startsWith("p:")).forEach(value => {
      item.setDynamicProperty(value, player.getDynamicProperty(value))
      player.setDynamicProperty(value, undefined)
    })

    // Save the last location before the death
    item.setDynamicProperty(`p:${count +1}`, {x: Math.floor(lastPos.x), y: Math.floor(lastPos.y), z: Math.floor(lastPos.z)})
    item.setDynamicProperty(`p:${count +1}.5`, player.dimension.id.replace("minecraft:", ""))

    // Reset the tracking system
    player.setDynamicProperty("count", undefined)

    return
  }

  getDeathPath(item: ItemStack): DeathPathPoint[] {
    const info: DeathPathPoint[] = []
    const first = (r => typeof r != "number" ? 1 : r)(item.getDynamicProperty("first"))

    for(let i = first; i < first +300; i++){
      const pos = item.getDynamicProperty(`p:${i}`)
      if(typeof pos != "object") break

      const dimension = item.getDynamicProperty(`p:${i}.5`)
      if(typeof dimension != "string") break

      info.push({pos, dimension})
    }
    return info
  }

  getKeyOwner(item: ItemStack): number | undefined {
    const dynamic = item.getDynamicProperty("owner")
    return typeof dynamic == "number" ? dynamic : undefined
  }
}

export interface DeathPathPoint {
  pos: Vector3,
  dimension: string
}