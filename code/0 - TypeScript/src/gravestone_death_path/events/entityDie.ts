import { world, Player, ItemStack, EntityComponentTypes } from "@minecraft/server"
import { gravestoneGenerateTomb } from "../functions/gravestone/generate"
import { gravestoneSaveItens } from "../functions/gravestone/saveItens"
import { apiDeathKnowledge } from "../lib/player/deathKnowledge"
import { apiScoreboard } from "../../0-lib/math/scoreboard"
import { apiItemDynamic } from "../lib/item/dynamic"
import { apiWarn } from "../../0-lib/player/warn"

world.afterEvents.entityDie.subscribe(({deadEntity: player, damageSource}) => {
  if(player.typeId != "minecraft:player" || !(player instanceof Player)) return

  // Incrise the Death Counter even if it doesn't generate a gravestone
  const deathCounter = (r => typeof r != "number" ? 1 : r +1)(player.getDynamicProperty("gravestone_death_path:death_counter"))
  player.setDynamicProperty("gravestone_death_path:death_counter", deathCounter)

  // Get all items on the inventory of the dead player (it only works because the gamerule keepInventory is True)
  const playerItems = gravestoneSaveItens.getInventory(player)
  if(!playerItems) return

  // Generate the Gravestone Block with the soil below if necessary
  const block = gravestoneGenerateTomb.generate(player, damageSource.damagingEntity?.typeId)
  if(!block) return

  // Spawn the gravestone entity to save the items
  const gravestoneEntity = player.dimension.spawnEntity("gravestone_death_path:gravestone_entity", {x: block.x +0.5, y: block.y + 0.1, z: block.z +0.5})
  const gravestoneInventory = gravestoneEntity.getComponent(EntityComponentTypes.Inventory)?.container
  if(!gravestoneInventory) return

  // Save all items on the gravestone inventory
  playerItems.forEach(({ slot, item }) => gravestoneInventory.setItem(slot, item))

  // Save the Xp on the Gravestone
  gravestoneEntity.setProperty("gravestone_death_path:xp", player.getTotalXp() * (apiDeathKnowledge.get(player, "upXp") * 0.1))
  player.resetLevel()

  // Notify the player where he died
  apiWarn.notify(player, {"rawtext":[{"translate": "dimension.gravestone_death_path:die1", with: [`§cx: ${Math.floor(player.location.x)}, §by: ${Math.floor(player.location.y)}, §az: ${Math.floor(player.location.z)}§r`]}, {"translate": `dimension.gravestone_death_path:${player.dimension.id.replace("minecraft:", "")}`}, {"translate": "dimension.gravestone_death_path:die2"}]})

  // Set the death loction on player's info
  apiScoreboard.setScore(`gravestone_death_path:${player.id}`, `${block.x},${block.y},${block.z}`, 0)

  // Set the last Death location
  player.setDynamicProperty("lastDeath", block.location)

  // Give the key to player to locate the gravestone
  const random = Math.random()
  const tpChange = (apiDeathKnowledge.get(player, "upTpKey") * 0.1)
  const keyId = tpChange == 0 ? "gravestone_death_path:gravestone_key" : tpChange == 1 ? "gravestone_death_path:gravestone_key_tp" : random < tpChange ? "gravestone_death_path:gravestone_key_tp" : "gravestone_death_path:gravestone_key"
  const key = new ItemStack(keyId)
  key.setLore([`§7Death ${deathCounter}: §cx: ${block.x}, §by: ${block.y}, §az: ${block.z}§r`])
  apiItemDynamic.transferDeathPath(player, key, block.location)
  player.getComponent(EntityComponentTypes.Inventory)?.container.addItem(key)
})