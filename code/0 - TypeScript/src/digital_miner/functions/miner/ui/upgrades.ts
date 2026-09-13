import { globalToolCache, globalUpgradesCache } from "../../../lib/variables"
import { world, ItemStack, Block, Player, Vector3 } from "@minecraft/server"
import { ActionFormData, MessageFormData } from "@minecraft/server-ui"
import { apiScoreboard } from "../../../../0-lib/math/scoreboard"
import { apiMinerSpace } from "../../../lib/block/minerSpace"
import { apiInventory } from "../../../lib/entity/inventory"
import { apiWarn } from "../../../../0-lib/player/warn"
import { apiVec3 } from "../../../lib/math/vector3"
import { interactDigitalMiner } from "../interact"
import { apiString } from "../../../lib/string"

export const minerUIUpgrades = new class MinerUIUpgrades {
  upgradesSreen(player: Player, block: Block, center: Vector3): void {
    const scoreId = `${apiString.getDimension(block)}/${apiVec3.toString(center)}`
    const upgrades = this.getUpgrades(scoreId)
    const buttons: { id: string, lv: number, texture: string}[] = Object.entries(upgrades)
    .map(([key, value]) => {
      if(value != 0) return { id: key, lv: value, texture: `textures/digital_miner/items/machines/upgrades/${key}/${key}_${value + (key == "fortune" ? 1 : 0)}` }
      return
    })
    .filter(value => value !== undefined)

    const canAddUpgrade = buttons.length < Object.keys(upgrades).length

    const form = new ActionFormData()
    .title("ui.digital_miner:miner.upgrades")
    .body("ui.digital_miner:upgrades.body")
    buttons.forEach(button => { form.button({translate: `ui.digital_miner:upgrades.${button.id}`, with: [`${button.lv}`]}, button.texture) })
    if(canAddUpgrade) form.button("ui.digital_miner:upgrades.new_upgrade")
    form.show(player).then(({canceled, selection}) => {
      if(canceled || selection == undefined) return interactDigitalMiner.openPainel(player, block)
      if(canAddUpgrade && selection == buttons.length) return this.addUpgradeScreen(player, block, center, upgrades)

      const selected = buttons[selection]
      if(!selected) return

      new MessageFormData()
      .title("ui.digital_miner:upgrades.confirm.title")
      .body({"rawtext":[{"translate": "ui.digital_miner:upgrades.confirm.body"}, {"translate": `ui.digital_miner:upgrades.${selected.id}`, "with": [`${selected.lv}`]}, {"text": "§r?"}]})
      .button1("ui.digital_miner:no")
      .button2("ui.digital_miner:yes")
      .show(player).then(({canceled, selection}) => {
        if(canceled || !selection) return this.upgradesSreen(player, block, center)
        const scoreInfo = apiScoreboard.getObj(`digital_miner/miner/${scoreId}`)
        player.dimension.spawnItem(new ItemStack(`digital_miner:${selected.id}_upgrade_${selected.lv}`), player.location)
        apiScoreboard.setScore(scoreInfo, `info/up_${selected.id}`, 0)
        globalUpgradesCache.delete(scoreId)
        if(selected.id == "speed") apiMinerSpace.changeSpeed(block, 0, center)
        if(selected.id == "fortune" || selected.id == "silk_touch") globalToolCache.delete(scoreId)
        if(selected.id == "anchor") block.dimension.getEntities({location: {x: center.x +0.5, y: center.y +0.5, z: center.z +0.5}, maxDistance: 1.5, type: "digital_miner:anchor_upgrade"}).forEach(entity => entity.remove())
      })
    })
  }

  getUpgrades(id: string): Upgrades {
    const scoreInfo = apiScoreboard.getObj(`digital_miner/miner/${id}`)
    return {
      speed: apiScoreboard.getScore(scoreInfo, "info/up_speed"),
      stack: apiScoreboard.getScore(scoreInfo, "info/up_stack"),
      fortune: apiScoreboard.getScore(scoreInfo, "info/up_fortune"),
      silk_touch: apiScoreboard.getScore(scoreInfo, "info/up_silk_touch"),
      anchor: apiScoreboard.getScore(scoreInfo, "info/up_anchor")
    }
  }

  private addUpgradeScreen(player: Player, block: Block, center: Vector3, upgrades: Upgrades): void {
    const missingUpgrades: string[] = []
    Object.entries(upgrades).forEach(([key, value]) => { if(value == 0) missingUpgrades.push(...(upgradesId[key] ?? [])) })

    const allItems = apiInventory.getItems(player, missingUpgrades)
    if(allItems.length == 0) return apiWarn.notify(player, "warn.digital_miner:upgrades.dont_have_upgrade_item")

    const whiteList = new Set()
    const reducedList = allItems.filter(obj => {
      if (whiteList.has(obj.item.typeId)) return false
      whiteList.add(obj.item.typeId)
      return true
    })

    const items = reducedList.map(value => ({...value, type: value.item.typeId.replace("digital_miner:", "").slice(0, -10)}))

    const form = new ActionFormData()
    .title("ui.digital_miner:upgrades.new_upgrade")
    .body("ui.digital_miner:upgrades.add.body")
    items.forEach(button => {
      const lv = button.item.typeId.replace(`digital_miner:${button.type}_upgrade_`, "")
      form.button({translate: `ui.digital_miner:upgrades.${button.type}`, with: [lv]}, `textures/digital_miner/items/machines/upgrades/${button.type}/${button.type}_${lv}`)
    })
    form.show(player).then(({canceled, selection}) => {
      if(canceled || selection == undefined) return
      const selected = items[selection]
      if(!selected) return

      this.addUpgrade(player, block, center, selected)
    })
  }

  addUpgrade(player: Player, block: Block, center: Vector3, upgrade: {item: ItemStack, slot: number, type: string}): void {
    const scoreId = `${apiString.getDimension(block)}/${apiVec3.toString(center)}`
    const scoreInfo = apiScoreboard.getObj(`digital_miner/miner/${scoreId}`)

    const scoreLv = apiScoreboard.getScore(scoreInfo, `info/up_${upgrade.type}`)
    const lv = parseInt(upgrade.item.typeId.slice(-1))

    if(scoreLv != 0) if(lv <= scoreLv){
      return apiWarn.notify(player, "warn.digital_miner:upgrade.already_installed", {sound: "warn.ender_addon_pack:bass"})
    } else { player.dimension.spawnItem(new ItemStack(`digital_miner:${upgrade.type}_upgrade_${scoreLv}`), player.location) }

    apiInventory.decrementSlot(player, upgrade.slot)
    apiScoreboard.setScore(scoreInfo, `info/up_${upgrade.type}`, lv)
    globalUpgradesCache.delete(scoreId)

    apiWarn.notify(player, {translate: "warn.digital_miner:upgrade.installed", with: {"rawtext":[{"translate": `ui.digital_miner:upgrades.${upgrade.type}`, "with": [`${lv}`]}]}}, {sound: "warn.ender_addon_pack:pop"})

    if(upgrade.type == "speed"){
      apiMinerSpace.changeSpeed(block, lv, center)
      return
    }
    if(upgrade.type == "fortune"){
      const silkTouchLV = apiScoreboard.getScore(scoreInfo, "info/up_silk_touch")
      if(silkTouchLV > 0){
        globalToolCache.delete(scoreId)
        apiScoreboard.setScore(scoreInfo, "info/up_silk_touch", 0)
        player.dimension.spawnItem(new ItemStack(`digital_miner:silk_touch_upgrade_${silkTouchLV}`), player.location)
        apiWarn.notify(player, "warn.digital_miner:upgrade.put_fortune_with_silk")
      }
      return
    }
    if(upgrade.type == "silk_touch"){
      const fortuneLV = apiScoreboard.getScore(scoreInfo, "info/up_fortune")
      if(fortuneLV > 0){
        globalToolCache.delete(scoreId)
        apiScoreboard.setScore(scoreInfo, "info/up_fortune", 0)
        player.dimension.spawnItem(new ItemStack(`digital_miner:fortune_upgrade_${fortuneLV}`), player.location)
        apiWarn.notify(player, "warn.digital_miner:upgrade.put_silk_with_fortune")
      }
      return
    }
    if(upgrade.type == "anchor"){
      if(apiScoreboard.getScore(scoreInfo, "info/up_anchor") == 1){
        block.dimension.spawnEntity("digital_miner:anchor_upgrade", {x: center.x +0.5, y: center.y +0.5, z: center.z +0.5})
      }
      return
    }
  }
}

const upgradesId: { [key: string]: string[] } = {
  "speed": ["digital_miner:speed_upgrade_1", "digital_miner:speed_upgrade_2", "digital_miner:speed_upgrade_3", "digital_miner:speed_upgrade_4"],
  "stack": ["digital_miner:stack_upgrade_1", "digital_miner:stack_upgrade_2", "digital_miner:stack_upgrade_3", "digital_miner:stack_upgrade_4"],
  "fortune": ["digital_miner:fortune_upgrade_2", "digital_miner:fortune_upgrade_3", "digital_miner:fortune_upgrade_4"],
  "silk_touch": ["digital_miner:silk_touch_upgrade_1"],
  "anchor": ["digital_miner:anchor_upgrade_1"]
}

export interface Upgrades {
  speed: number
  stack: number
  fortune: number
  silk_touch: number
  anchor: number
}