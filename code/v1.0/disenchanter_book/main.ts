import { world, system, Enchantment, EntityComponentTypes, EntityEquippableComponent, EquipmentSlot, ItemComponentTypes, ItemStack, Player } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"

const level = ["0", " ", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]

world.beforeEvents.itemUse.subscribe((ev) => {
  const { source: player, itemStack: item } = ev
  const equippable = player.getComponent(EntityComponentTypes.Equippable)
  const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container
  if(!equippable || !inventory) return

  const enchantComp = item.getComponent(ItemComponentTypes.Enchantable)
  if(!enchantComp) return

  const enchantments = enchantComp.getEnchantments()

  if(equippable.getEquipment(EquipmentSlot.Offhand)?.typeId == "db:disenchanter_book"){
    ev.cancel = true

    if(!enchantments || enchantments.length == 0){
      system.run(() => { player.onScreenDisplay.setActionBar({translate: "disenchanter.warning.no_enchants"}) })
      return
    }

    let buttons: EnchantmentsInfo[] = []
    enchantments.forEach(e => { buttons.push({id: `disenchanter.enchant.${e.type.id}`, level: e.level > 10 ? `${e.level}` : (level[e.level] ?? "")}) })

    const form = new ModalFormData()
    .title("disenchanter.ui.title")
    buttons.forEach(b => {form.toggle({translate: b.id, with: [`${b.level}`]})})
    form.submitButton("disenchanter.ui.title")

    system.run(() => {
      form.show(player).then(({canceled, formValues}) => {
        if(canceled || formValues == undefined) return
        const emptySlot = inventory.firstEmptySlot()
        if(emptySlot == undefined) return player.onScreenDisplay.setActionBar({translate: "disenchanter.warning.no_space"})

        let newItem = new ItemStack("minecraft:enchanted_book")
        const newEnchantComp = newItem.getComponent(ItemComponentTypes.Enchantable)
        if(!newEnchantComp) return

        let enchantCount = 0
        let rejectedEnchantsList: Enchantment[] = []

        for(let i = 0; i < buttons.length; i++){
          if(formValues[i]){
            const enchant = enchantments[i]
            if(!enchant) continue
            if(enchant.level > enchant.type.maxLevel){
              const structureId = `mystructure:disenchanter_book/${enchant.type.id}${enchant.level}`
              if(!world.structureManager.get(structureId)){
                rejectedEnchantsList.push(enchant)
                enchantCount++
                continue
              }
              world.structureManager.place(structureId, player.dimension, player.location)
            } else {
              newEnchantComp.addEnchantment(enchant)
            }
            enchantComp.removeEnchantment(enchant.type.id)
            enchantCount++
          }
        }

        if(enchantCount < 1) return player.onScreenDisplay.setActionBar({translate: "disenchanter.warning.no_selected"})

        if(rejectedEnchantsList.length > 0){
          const form = new ActionFormData()
          .title("disenchanter.ui.rejected.title")
          .body("disenchanter.ui.rejected.body")
          rejectedEnchantsList.forEach(enchant => { form.label({"translate": `disenchanter.enchant.${enchant.type.id}`, "with": [`${enchant.level > 10 ? enchant.level : (level[enchant.level] ?? "")}`]})})
          form.button("disenchanter.ui.rejected.keep")
          .button("disenchanter.ui.rejected.delete")
          .show(player).then(({canceled, selection}) => {
            if(canceled || selection == 0) return

            const enchantComp2 = item.getComponent(ItemComponentTypes.Enchantable)
            if(!enchantComp2) return
            for(const enchant of rejectedEnchantsList) enchantComp2.removeEnchantment(enchant.type.id)

            let newHandItem: ItemStack | undefined
            if(item.typeId == "minecraft:enchanted_book" && enchantComp2.getEnchantments().length < 1) newHandItem = new ItemStack("minecraft:book")
            equippable.setEquipment(EquipmentSlot.Mainhand, newHandItem ?? item)
          })
        }

        let newHandItem: ItemStack | undefined
        if(item.typeId == "minecraft:enchanted_book" && enchantComp.getEnchantments().length < 1) newHandItem = new ItemStack("minecraft:book")

        decrementOffhand(equippable)

        if(newEnchantComp.getEnchantments().length > 0) inventory.setItem(emptySlot, newItem)
        equippable.setEquipment(EquipmentSlot.Mainhand, newHandItem ?? item)
      })
    })
  }
})

function decrementOffhand(equippable: EntityEquippableComponent): void {
  const item = equippable.getEquipment(EquipmentSlot.Offhand)
  if(!item) return

  if(item.amount -1 != 0){
    item.amount--
    equippable.setEquipment(EquipmentSlot.Offhand, item)
  } else {
    equippable.setEquipment(EquipmentSlot.Offhand, undefined)
  }
}

interface EnchantmentsInfo {
  id: string
  level: string
}