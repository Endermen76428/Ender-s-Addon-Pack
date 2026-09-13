import { brewingStandInputOutput } from "../../variables/recipes/brewingStandRecipes"
import { world, ItemTypes } from "@minecraft/server"

export const registerTemporalBottleBrewingStandRecipe = new class RegisterTemporalBottleBrewingStandRecipe {
  tryRegister(item: string, rawInfo: any): void {
    const errorMessage = `[§cTemporal Bottle§r] Error: Failed to register the brewing stand recipe in "${item}" item.`
    const base = rawInfo["base"]
    const reagent = rawInfo["reagent"]
    const output = rawInfo["output"]

    // I won't explain it, it's very hard
    if(typeof base != "string"){
      if(base == undefined){
        console.warn(`${errorMessage} Missing "base" property`)
      } else {
        console.warn(`${errorMessage} Invalid value "${base}" on "base" property, expected type: String`)
      }
      return
    } else if(ItemTypes.get(base) == undefined){
      console.warn(`${errorMessage} Invalid base item ID "${base}", this item is not registered in any addon currently available in this world`)
      return
    }

    if(typeof reagent != "string"){
      if(reagent == undefined){
        console.warn(`${errorMessage} Missing "reagent" property`)
      } else {
        console.warn(`${errorMessage} Invalid value "${reagent}" on "reagent" property, expected type: String`)
      }
      return
    } else if(ItemTypes.get(reagent) == undefined){
      console.warn(`${errorMessage} Invalid reagent item ID "${reagent}", this item is not registered in any addon currently available in this world`)
      return
    }

    if(typeof output != "string"){
      if(output == undefined){
        console.warn(`${errorMessage} Missing "output" property`)
      } else {
        console.warn(`${errorMessage} Invalid value "${output}" on "output" property, expected type: String`)
      }
      return
    } else if(ItemTypes.get(output) == undefined){
      console.warn(`${errorMessage} Invalid output item ID "${output}", this item is not registered in any addon currently available in this world`)
      return
    }

    this.register(base, reagent, output)
  }

  private register(base: string, reagent: string, output: string): void {
    // If the recipe already exist, it won't be registered again
    const id = base + "/" + reagent
    const hasRecipe = brewingStandInputOutput[id]
    if(hasRecipe) return

    // console.warn(`[§aTemporal Bottle§r] Success: Registered potion "${output}" with reagent "${reagent}" on base "${base}"`)

    brewingStandInputOutput[id] = output
  }
}