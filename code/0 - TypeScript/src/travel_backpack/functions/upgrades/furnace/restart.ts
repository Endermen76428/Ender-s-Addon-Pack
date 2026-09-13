import { EntityComponentTypes, ScoreboardObjective, world } from "@minecraft/server"
import { backpackUpgradesIndex } from "../../../lib/variables"
import { furnaceUpgradeFunctions } from "./upFurnaceHandler"

export function restartFurnaceFunction(score: ScoreboardObjective, backpackId?: string): void {
  const participants = score.getParticipants()
  let i = 0
  let len = participants.length

  if(backpackId != undefined){
    const index = participants.findIndex(value => value.displayName == backpackId)
    if(index != -1){
      i = index
      len = index +1
    }
  }

  for(; i < len; i++){
    const id = participants[i]?.displayName
    if(id == undefined) continue

    const entity = world.getEntity(id)
    if(entity == undefined || !entity.isValid) continue

    const backpackInv = entity.getComponent(EntityComponentTypes.Inventory)?.container
    if(!backpackInv) return
  
    const info = backpackUpgradesIndex[backpackInv.size]
    if(info == undefined) return
    const [ firstSlot ] = info
    furnaceUpgradeFunctions.add(entity, backpackInv, firstSlot +25)
  }
}