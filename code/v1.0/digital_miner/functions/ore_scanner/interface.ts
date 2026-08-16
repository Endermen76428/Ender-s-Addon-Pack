import { world, system, BlockTypes, ItemStack, ItemTypes, EquipmentSlot, Player } from "@minecraft/server"
import { apiEquippable } from "../../lib/entity/equippable"
import { ModalFormData } from "@minecraft/server-ui"
import { oreScannerFindBlocks } from "./findBlocks"

export const oreScannerInterface = new class OreScannerInterface {
  open(player: Player, item: ItemStack): void {
    const itemDynamics = item.getDynamicPropertyIds()
    const oreList = oreListTranslated.map(value => {
      if(value.id.startsWith("ui.divider:")) return {id: {id: value.id, name: `ui.digital_miner:ore_scanner.addon.${value.id.replace("ui.divider:", "")}`}, enabled: true}
      return {id: value, enabled: itemDynamics.includes(value.id)}
    })

    let indexOffset = 0

    const form = new ModalFormData()
    .title("ui.digital_miner:ore_scanner.title")
    .label("§l§9Minecraft")
    oreList.forEach(value => {
      if(value.id.id.startsWith("ui.divider:")){
        form.divider()
        .label(value.id.name)
      } else {
        form.toggle(value.id.name, {defaultValue: value.enabled})
      }
    })
    form.submitButton("ui.digital_miner:ore_scanner.submit")
    .show(player).then(({canceled, formValues}) => {
      if(canceled || !formValues) return

      item.clearDynamicProperties()
      formValues.forEach((value, index) => {
        if(value == true){
          const oreId = oreList[index - indexOffset]?.id.id
          if(oreId){
            const blockIds = [oreId, ...(blockVariants[oreId] ?? [])]
            for(const id of blockIds) item.setDynamicProperty(id, true)
          }
        } else if (value == undefined) indexOffset++
      })

      apiEquippable.setItem(player, item, EquipmentSlot.Mainhand)
      if(item.getDynamicPropertyIds().length > 0) oreScannerFindBlocks(player, item)
    })
  }
}

const blockVariants: { [key: string]: string[] } = {
  "minecraft:iron_ore": ["minecraft:deepslate_iron_ore"],
  "minecraft:gold_ore": ["minecraft:deepslate_gold_ore"],
  "minecraft:diamond_ore": ["minecraft:deepslate_diamond_ore"],
  "minecraft:lapis_ore": ["minecraft:deepslate_lapis_ore"],
  "minecraft:redstone_ore": ["minecraft:lit_redstone_ore", "minecraft:deepslate_redstone_ore", "minecraft:lit_deepslate_redstone_ore"],
  "minecraft:coal_ore": ["minecraft:deepslate_coal_ore"],
  "minecraft:copper_ore": ["minecraft:deepslate_copper_ore"],
  "minecraft:emerald_ore": ["minecraft:deepslate_emerald_ore"]
}

// ------------------

const vanillaOre = [
  "minecraft:coal_ore",
  "minecraft:copper_ore",
  "minecraft:iron_ore",
  "minecraft:lapis_ore",
  "minecraft:gold_ore",
  "minecraft:redstone_ore",
  "minecraft:diamond_ore",
  "minecraft:emerald_ore",
  "minecraft:quartz_ore",
  "minecraft:nether_gold_ore",
  "minecraft:ancient_debris",
]

const oreListId = [
  ...vanillaOre
  // "ui.divider:better_on_bedrock",
]

let oreListTranslated: {id: string, name: string}[]
system.run(() => {
  oreListTranslated = oreListId
  .map(value => {
    const blockType = BlockTypes.get(value)
    if(!blockType) return {id: value, name: value}
    const itemType = new ItemStack(ItemTypes.get(blockType.id) ?? "digital_miner:null")
    if(itemType.typeId == "digital_miner:null") return {id: value, name: value}
    return {id: value, name: itemType.localizationKey}
  })
})