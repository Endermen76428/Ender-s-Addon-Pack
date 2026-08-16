import { furnaceFuelList } from "../../variables/recipes/fuelInfo"
import { world, ItemTypes } from "@minecraft/server"

export const registerTemporalBottleFuel = new class RegisterTemporalBottleFuel {
  tryRegister(item: string, rawInfo: any): void {
    const errorMessage = `[§cTemporal Bottle§r] Error: Failed to register the fuel time in "${item}" item.`
    const itemType = rawInfo["item"]
    const amount = rawInfo["amount"]

    // I won't explain it, it's very hard
    if(typeof itemType != "string"){
      if(itemType == undefined){
        console.warn(`${errorMessage} Missing "item" property`)
      } else {
        console.warn(`${errorMessage} Invalid value "${itemType}" on "item" property, expected type: String`)
      }
      return
    } else if(ItemTypes.get(itemType) == undefined){
      console.warn(`${errorMessage} Invalid item ID "${itemType}", this item is not registered in any addon currently available in this world`)
      return
    }

    if(typeof amount != "number"){
      if(amount == undefined){
        console.warn(`${errorMessage} Missing "amount" property`)
      } else {
        console.warn(`${errorMessage} Invalid value "${amount}" on "amount" property, expected type: Number`)
      }
      return
    }

    this.register(itemType, amount)
  }

  private register(item: string, amount: number): void {
    // If the recipe already exist, it won't be registered again
    const hasRecipe = furnaceFuelList[item]
    if(hasRecipe) return

    // console.warn(`[§aTemporal Bottle§r] Success: Registered fuel "${item}" with amount "${amount}"`)

    furnaceFuelList[item] = amount
  }
}