import { furnaceHasRecipe, furnaceRecipeList } from "../../variables/recipes/furnaceRecipes"
import { world, ItemTypes } from "@minecraft/server"

export const registerTemporalBottleFurnaceRecipe = new class RegisterTemporalBottleFurnaceRecipe {
  tryRegister(item: string, rawInfo: any): void {
    const errorMessage = `[§cTemporal Bottle§r] Error: Failed to register the furnace recipe in "${item}" item.`
    const blockType = rawInfo["block"]
    const input = rawInfo["input"]
    const output = rawInfo["output"]

    // I won't explain it, it's very hard
    if(typeof blockType != "string"){
      if(blockType == undefined){
        console.warn(`${errorMessage} Missing "block" property`)
      }
      return
    } else if(!furnaceHasRecipe[blockType]){
      console.warn(`${errorMessage} Invalid value "${blockType}" on "block" property, expected value: §l"minecraft:furnace", "minecraft:blast_furnace" or "minecraft:smoker"§r`)
    }

    if(typeof input != "string"){
      if(input == undefined){
        console.warn(`${errorMessage} Missing "input" property`)
      } else {
        console.warn(`${errorMessage} Invalid value "${input}" on "input" property, expected type: String`)
      }
      return
    } else if(ItemTypes.get(input) == undefined){
      console.warn(`${errorMessage} Invalid input item ID "${input}", this item is not registered in any addon currently available in this world`)
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

    this.register(blockType, input, output)
  }

  private register(blockType: string, input: string, output: string): void {
    // Get the list of accepted recipes for that furnace type
    const hasRecipe = furnaceHasRecipe[blockType]
    if(!hasRecipe) return

    // Add the output item to the list of accepted recipes for that furnace type
    hasRecipe.add(input)

    // console.warn(`[§aTemporal Bottle§r] Success: Registered item "${input}" with output "${output}" on the block "${blockType}"`)

    const recipe = furnaceRecipeList[input]
    if(!recipe){
      furnaceRecipeList[input] = output
      return
    }

    if(recipe == output) return // Avoid duplicating outputs if the user specifies more than one furnace for the same item.
    if(typeof recipe == "string"){
      furnaceRecipeList[input] = [recipe, output]
      return
    }

    if(!recipe.includes(output)) return // Avoid duplicating outputs if the user specifies more than one furnace for the same item.
    recipe.push(output)
    furnaceRecipeList[input] = recipe
  }
}