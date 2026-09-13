import { world, Block, BlockComponentTypes, Container, ItemComponentTypes, ItemPotionComponent, Potions, ItemStack } from "@minecraft/server"
import { brewingStandInputOutput } from "../lib/variables/recipes/brewingStandRecipes"
import { apiItemAmount } from "../lib/item/amount"

export const temporalBottleFuncBrewStand = new class TemporalBottleFuncBrewStand {
  brewing(block: Block): void {
    const blockInv = block.getComponent(BlockComponentTypes.Inventory)?.container
    if(!blockInv) return

    const input = blockInv.getItem(0)
    if(!input) return

    const thrownType: ThrownType | undefined = input.typeId == "minecraft:gunpowder" ? "ThrownSplash" : input.typeId == "minecraft:dragon_breath" ? "ThrownLingering" : undefined
    let transformed = false

    for(let i = 0; i < 3; i++){
      const slotBase = blockInv.getItem(i +1)

      const addonRecipeId = brewingStandInputOutput[slotBase?.typeId + "/" + input.typeId]
      if(!addonRecipeId?.startsWith("minecraft:")){
        if(addonRecipeId){
          blockInv.setItem(i +1, new ItemStack(addonRecipeId))
          transformed = true
        }
        continue
      }

      const base = slotBase?.getComponent(ItemComponentTypes.Potion)
      if(!base) continue

      if(thrownType && base.potionDeliveryType.id == transformDeliveryRequirements[thrownType]){
        this.transformDeliveryType(blockInv, base, i +1, thrownType)
        transformed = true
        continue
      }

      const vanillaRecipeId = brewingStandInputOutput[base.potionEffectType.id + "/" + input.typeId]
      if(!vanillaRecipeId) continue

      blockInv.setItem(i +1, Potions.resolve(vanillaRecipeId, base.potionDeliveryType))
      transformed = true
    }

    if(!transformed) return
    const reducedItem = apiItemAmount.decrease(input, 1)
    blockInv.setItem(0, reducedItem)
  }

  transformDeliveryType(inventory: Container, potion: ItemPotionComponent, index: number, type: ThrownType): void {
    inventory.setItem(index, Potions.resolve(potion.potionEffectType, type))
  }
}

const transformDeliveryRequirements: Record<ThrownType, string> = {
  "ThrownSplash": "Consume",
  "ThrownLingering": "ThrownSplash"
}

type ThrownType = "ThrownSplash" | "ThrownLingering"