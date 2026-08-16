import { world, Player, Vector3, EntityComponentTypes } from "@minecraft/server"
import { InvetoryItems } from "../lib/player/inventory"
import { apiWarn } from "../../0-lib/player/warn"

export function* placeBlocks(player: Player, blockIds: string[], blocks: Vector3[], direction: Vector3, items: InvetoryItems): Generator<void> {
  // const date = Date.now()
  const dimension = player.dimension

  const blockId = blockIds[0]
  if(!blockId) return

  if(items.amount != Infinity){
    const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container
    if(!inventory) return

    let executed = 0

    for(let i = 0, len = items.list.length; i < len; i++){
      const item = items.list[i]
      if(!item) continue

      let removedItemAmount = 0

      for(let i2 = 0; i2 < item.amount; i2++){
        const pos = blocks[executed++]
        if(!pos){
          removedItemAmount = i2
          break
        }

        dimension.setBlockType({x: pos.x - direction.x, y: pos.y - direction.y, z: pos.z - direction.z}, blockId)
      }

      if(removedItemAmount == 0){
        inventory.setItem(item.slot, undefined)
      } else {
        const slotItem = inventory.getItem(item.slot)
        if(!slotItem) break

        slotItem.amount -= removedItemAmount
        inventory.setItem(item.slot, slotItem)
        break
      }

      yield
    }

    apiWarn.notify(player, {translate: "warning.builder_wand:placed", with: [String(executed == blocks.length ? executed : executed -1)]}, {type: "actionbar"})
    // console.warn(`Placed ${blocks.length} Blocks in <${Date.now() - date}ms>`)
    return
  }

  for(let i = 0, len = blocks.length; i < len; i++){
    const pos = blocks[i]
    if(!pos) continue

    dimension.setBlockType({x: pos.x - direction.x, y: pos.y - direction.y, z: pos.z - direction.z}, blockId)

    yield
  }

  apiWarn.notify(player, {translate: "warning.builder_wand:placed", with: [String(blocks.length)]}, {type: "actionbar"})
  // console.warn(`Placed ${blocks.length} Blocks in <${Date.now() - date}ms>`)
}