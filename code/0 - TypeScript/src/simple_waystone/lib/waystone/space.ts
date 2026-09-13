import { world, ItemStack, BlockPermutation, Block, Dimension, EntityComponentTypes, EquipmentSlot, GameMode, Player, Vector3 } from "@minecraft/server"
import { AddonConfig, upgradeXpDiscount } from "../../variables"
import { apiScoreboard } from "../../../0-lib/math/scoreboard"
import { MessageFormData } from "@minecraft/server-ui"
import { apiWarn } from "../../../0-lib/player/warn"
import { waystoneInfo, WaystoneInfo } from "./info"
import { apiItemAmount } from "../item/itemAmount"
import { waystoneCache } from "../cache/waystone"

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

  paintWaystone(player: Player, waystone: Block, dyes: string[]): void {
    const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
    if(!item) return

    const indexColor = dyes.findIndex(value => value == item.typeId)
    if(indexColor == -1 || waystone.permutation.getState("ws:waystone_color") == indexColor) return

    const id = `${waystone.dimension.id.replace("minecraft:", "")}/${waystone.x},${waystone.y},${waystone.z}`
    waystoneCache.updateColor(indexColor, id)
    apiScoreboard.setScore(`simple_waystone/w/${id}`, "color", indexColor)
    waystone.setPermutation(waystone.permutation.withState("ws:waystone_color", indexColor))
    apiWarn.playSound(player, "simple_waystone.block.waystone.paint")

    if(player.getGameMode() == GameMode.Creative) return
    if(item.amount -1 < 1){ player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, undefined); return }
    item.amount -= 1
    player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, item)
  }

  upgradeXp(player: Player, waystone: Block, discount: number): void {
    const id = `${waystone.dimension.id.replace("minecraft:", "")}/${waystone.x},${waystone.y},${waystone.z}`

    const currentDiscount = (waystoneCache.getWaystone(id)?.xpDiscount ?? 1) *100
    if(currentDiscount <= discount) return

    const upgradeItem = upgradeXpDiscount[currentDiscount]
    if(upgradeItem) waystone.dimension.spawnItem(new ItemStack(upgradeItem), player.location)

    waystoneCache.updateDiscount(discount, id)
    apiScoreboard.setScore(`simple_waystone/w/${id}`, "xp_discount", discount)

    apiWarn.notify(player, {translate: "warning.simple_waystone:upgrades.xp_cost.success", with: [`${100 - discount}`]}, {sound: "warn.ender_addon_pack:levelup"})

    apiItemAmount.decreaseHand(player, upgradeXpDiscount[discount])
  }

  waystoneToWarpstone(player: Player, waystone: Block): void {
    new MessageFormData()
    .title({translate: "ui.simple_waystone:waystone.list.title", with: [""]})
    .body("ui.simple_waystone:waystone.transform.body")
    .button1("ui.simple_waystone:waystone.yes")
    .button2("ui.simple_waystone:waystone.no")
    .show(player).then(({canceled, selection}) => {
      if(canceled || selection == 1 || !waystone.isValid) return
      apiWarn.playSound(player, "simple_waystone.block.waystone.unregistered")
      waystone.dimension.spawnItem(new ItemStack("ws:warpstone"), waystone.center())

      waystoneInfo.removeWaystone(waystone.location, waystone.dimension.id.replace("minecraft:", ""))
      waystone.setType("minecraft:air")
      waystone.above(1)?.setType("minecraft:air")
    })
  }

  calculateCost(pos: Vector3, waystone: WaystoneInfo): {cost: number, distance: number} {
    const disX = waystone.pos.x - pos.x +0.5
    const disZ = waystone.pos.z - pos.z +0.5
    const distance = Math.floor(Math.sqrt(disX * disX + disZ * disZ))
    const cost = Math.floor(distance / AddonConfig.xpByDistance)

    return cost < AddonConfig.xpMax ? {cost, distance} : {cost: AddonConfig.xpMax, distance}
  }
}