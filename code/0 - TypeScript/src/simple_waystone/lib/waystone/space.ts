import { Block, BlockPermutation, Dimension, EntityComponentTypes, EquipmentSlot, GameMode, ItemStack, Player, system, Vector3 } from "@minecraft/server"
import { AddonConfig, upgradeXpDiscount } from "../../variables"
import { apiScoreboard } from "../../../0-lib/math/scoreboard"
import { MessageFormData } from "@minecraft/server-ui"
import { apiWarn } from "../../../0-lib/player/warn"
import { apiItemAmount } from "../item/itemAmount"
import { waystoneCache } from "../cache/waystone"
import { waystoneInfo } from "./info"

export const apiWaystoneSpace = new class ApiWaystoneSpace {
  setOff(player: Player, block: Block){
    const above = block.above(1)
    if(!above) return
    this.setBlock(player.dimension, block.typeId, block.location, {"ws:waystone": 1})
    this.setBlock(player.dimension, block.typeId, above.location, {"ws:waystone": 2})
  }

  setOn(player: Player, block: Block){
    const above = block.above(1)
    if(!above) return
    this.setBlock(player.dimension, block.typeId, block.location, {"ws:waystone": 1, "ws:waystone_on": true})
    this.setBlock(player.dimension, block.typeId, above.location, {"ws:waystone": 2, "ws:waystone_on": true})
  }

  setBlock(dimension: Dimension, type: string, pos: Vector3, permutation: Record<string, string | number | boolean>){
    dimension.setBlockPermutation(pos, BlockPermutation.resolve(type, permutation))
  }

  paintWaystone(player: Player, waystone: Block): void {
    const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
    if(!item) return

    const indexColor = dyesList.findIndex(value => value == item.typeId)
    if(indexColor == -1 || waystone.permutation.getState("ws:waystone_color") == indexColor) return

    const id = `${waystone.dimension.id.replace("minecraft:", "")}/${waystone.x},${waystone.y},${waystone.z}`
    waystoneCache.updateColor(indexColor, id)
    apiScoreboard.setScore(`simple_waystone/w/${id}`, "color", indexColor)
    waystone.setPermutation(waystone.permutation.withState("ws:waystone_color", indexColor))
    player.dimension.playSound("block.simple_waystone:waystone.paint", waystone.bottomCenter())

    if(player.getGameMode() == GameMode.Creative) return
    if(item.amount -1 < 1){ player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, undefined); return }
    item.amount -= 1
    player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, item)
  }

  upgradeXp(player: Player, waystone: Block, discount: number, item: string): void {
    const id = `${waystone.dimension.id.replace("minecraft:", "")}/${waystone.x},${waystone.y},${waystone.z}`

    const currentDiscount = (waystoneCache.getWaystone(id)?.xpDiscount ?? 1) *100
    if(currentDiscount <= discount) return

    const upgradeItem = upgradeXpDiscount[currentDiscount]
    if(upgradeItem) waystone.dimension.spawnItem(new ItemStack(upgradeItem), player.location)

    waystoneCache.updateDiscount(discount, id)
    waystoneCache.updateLock(true, id)
    apiScoreboard.setScore(`simple_waystone/w/${id}`, "lock", 1)
    apiScoreboard.setScore(`simple_waystone/w/${id}`, "xp_discount", discount)

    apiWarn.notify(player, {translate: "block.warn.simple_waystone:upgrades.xp_cost.success", with: [`${100 - discount}`]}, {sound: "warn.ender_addon_pack:levelup"})

    apiItemAmount.decreaseHand(player, item)
  }

  waystoneToWarpstone(player: Player, waystone: Block): void {
    new MessageFormData()
    .title("ui.simple_waystone:waystone.transform.title")
    .body("ui.simple_waystone:waystone.transform.body")
    .button1("ui.simple_waystone:waystone.yes")
    .button2("ui.simple_waystone:waystone.no")
    .show(player).then(({canceled, selection}) => {
      if(canceled || selection == 1 || !waystone.isValid) return
      player.dimension.playSound("warn.ender_addon_pack:deactive", waystone.bottomCenter())
      waystone.dimension.spawnItem(new ItemStack("ws:warpstone"), waystone.center())

      waystoneInfo.removeWaystone(waystone.location, waystone.dimension.id.replace("minecraft:", ""))
      waystone.setType("minecraft:air")
      waystone.above(1)?.setType("minecraft:air")
    })
  }

  calculateCost(pos: Vector3, waystone: Vector3): {cost: number, distance: number} {
    const disX = waystone.x - pos.x +0.5
    const disZ = waystone.z - pos.z +0.5
    const distance = Math.floor(Math.sqrt(disX * disX + disZ * disZ))
    const cost = Math.floor(distance / AddonConfig.xpByDistance)

    return cost < AddonConfig.xpMax ? {cost, distance} : {cost: AddonConfig.xpMax, distance}
  }
}

export const dyesList = [
  "minecraft:white_dye",
  "minecraft:light_gray_dye",
  "minecraft:gray_dye",
  "minecraft:black_dye",
  "minecraft:brown_dye",
  "minecraft:red_dye",
  "minecraft:orange_dye",
  "minecraft:yellow_dye",
  "minecraft:lime_dye",
  "minecraft:green_dye",
  "minecraft:cyan_dye",
  "minecraft:light_blue_dye",
  "minecraft:blue_dye",
  "minecraft:purple_dye",
  "minecraft:magenta_dye",
  "minecraft:pink_dye"
]