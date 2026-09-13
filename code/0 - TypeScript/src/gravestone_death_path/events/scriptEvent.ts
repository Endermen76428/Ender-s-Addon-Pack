import { world, system, ScriptEventCommandMessageAfterEvent } from "@minecraft/server"
import { deathPathLocator } from "../functions/deathPath/locator"
import { apiInventory } from "../lib/player/inventory"

const denyList = new Map<string, boolean>()

system.afterEvents.scriptEventReceive.subscribe(ev => {
  const execute = scriptEventList[ev.id]
  if(execute) execute(ev)
})

const scriptEventList = new class scriptEventList {
  [key: string]: (callback: ScriptEventCommandMessageAfterEvent) => void

  async "gravestone_death_path:drop_all"(callback: ScriptEventCommandMessageAfterEvent): Promise<void> {
    const {sourceEntity: entity} = callback
    if(entity && !denyList.has(entity.id)){
      const id = entity.id
      denyList.set(id, true)

      await system.waitTicks(5)
      const newEntity = world.getEntity(id)
      if(!newEntity) return

      try{
        const block = newEntity.dimension.getBlock(newEntity.location)
        if(block == undefined || block.getTags().includes("gravestone_death_path:gravestone")) return

        apiInventory.dropInventory(id)
        denyList.delete(id)
        return
      } catch {
        apiInventory.dropInventory(newEntity.id)
      }
    }
  }

  "gravestone_death_path:ghost_move"(callback: ScriptEventCommandMessageAfterEvent): void {
    const {sourceEntity: entity} = callback
    if(entity) deathPathLocator.continueMoving(entity)
  }
}