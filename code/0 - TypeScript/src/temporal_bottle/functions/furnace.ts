import { world, Block, BlockComponentTypes, Container, ItemStack, Vector3, ItemTypes } from "@minecraft/server"
import { furnaceHasRecipe, furnaceRecipeList } from "../lib/variables/recipes/furnaceRecipes"
import { furnaceFuelList } from "../lib/variables/recipes/fuelInfo"
import { furnaceFuelStoredAmount } from "../lib/variables/cache"
import { apiItemAmount } from "../lib/item/amount"

export const temporalBottleFuncFurnace = new class TemporalBottleFuncFurnace {
  smelt(block: Block): void {
    const blockInv = block.getComponent(BlockComponentTypes.Inventory)?.container
    if(!blockInv) return

    // Remove the fuel even without an item on the input slot
    const currentFuel = furnaceFuelStoredAmount.get((block.x << 20) ^ (block.y << 10) ^ block.z) ?? 0
    furnaceFuelStoredAmount.set((block.x << 20) ^ (block.y << 10) ^ block.z, currentFuel <= 1 ? 0 : currentFuel -1)

    const inputSlot = blockInv.getItem(0)
    if(!inputSlot) return

    if(!(furnaceHasRecipe[block.typeId.replace("lit_", "")]?.has(inputSlot.typeId) ?? false)) return

    const expectedOutput = furnaceRecipeList[inputSlot.typeId]
    if(!expectedOutput) return

    const output = blockInv.getItem(2)

    let outputSlot: false | ItemStack | null = null
    if(Array.isArray(expectedOutput)){
      for(const outputId of expectedOutput){
        if(ItemTypes.get(outputId) && (output?.typeId == outputId || output == undefined)){
          outputSlot = apiItemAmount.increase(output ?? outputId, 1)
          break
        }
      }
    } else {
      // Cancels the execution if the current output isn't equal to the item that the current input would result in
      if(output?.typeId != expectedOutput && output != undefined) return
      if(ItemTypes.get(output?.typeId ?? expectedOutput)) outputSlot = apiItemAmount.increase(output ?? expectedOutput, 1)
    }

    if(!outputSlot) outputSlot = false
    if(outputSlot == false) return

    const newFuelAmount = this.consumeFuel(block, blockInv, blockInv.getItem(1))
    if(newFuelAmount < 1) return

    const itemInput = apiItemAmount.decrease(inputSlot, 1)

    blockInv.setItem(0, itemInput)
    blockInv.setItem(2, outputSlot)
  }

  private consumeFuel(pos: Vector3, blockInv: Container, invFuel: ItemStack | undefined): number {
    const id = (pos.x << 20) ^ (pos.y << 10) ^ pos.z
    let fuelStored = furnaceFuelStoredAmount.get(id) ?? 0

    if(fuelStored < 1 && invFuel){
      const fuelTime = furnaceFuelList[invFuel.typeId]
      if(!fuelTime) return fuelStored

      fuelStored += fuelTime
      furnaceFuelStoredAmount.set(id, fuelStored)

      const reducedItem = apiItemAmount.decrease(invFuel, 1)
      blockInv.setItem(1, reducedItem)
    }

    return fuelStored
  }
}