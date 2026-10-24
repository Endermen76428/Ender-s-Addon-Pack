import { temporalBottleFuncBrewingStand } from "../temporal_bottle/functions/blocks/brewingStand"
import { temporalBottleFuncFurnace } from "../temporal_bottle/functions/blocks/furnace"
import { system } from "@minecraft/server"

let enabledLoop = false
const enabledFunctions: IEnabledFunctions = {
  // Temporal Bottle
  temporalBottleFurnace: false,
  temporalBottleBrewingStand: false
}

function loop(tick: number): void {
  // Cancela o loop global
  if(enabledLoop == false) return

  // Temporal Bottle
  if(enabledFunctions.temporalBottleFurnace) temporalBottleFuncFurnace.update()
  if(enabledFunctions.temporalBottleBrewingStand) temporalBottleFuncBrewingStand.update()

  // Reinicia o Loop no proximo tick
  system.run(() => { loop(tick == 19 ? 0 : tick +1) })
}

export function addToGlobalLoop<T extends keyof IEnabledFunctions>(type: T): void {
  enabledFunctions[type] = true

  if(enabledLoop == false){
    enabledLoop = true
    loop(0)
  }
}

export function removeFromGlobalLoop<T extends keyof IEnabledFunctions>(type: T): void {
  enabledFunctions[type] = false

  const values = Object.values(enabledFunctions)
  let disable = true
  for(let i = 0, len = values.length; i < len; i++){
    // Se qualquer uma das funções ainda estiver ativas ele vai manter o loop ligado
    if(values[i] == true){
      disable = false
      break
    }
  }

  if(disable) enabledLoop = false
}

interface IEnabledFunctions {
  // temporal Bottle
  temporalBottleFurnace: boolean
  temporalBottleBrewingStand: boolean
}