import { world, ItemStack, Block, Player, Vector3 } from "@minecraft/server"
import { globalBlocksLocationsAmount } from "../../lib/variables"
import { apiMinerSpace } from "../../lib/block/minerSpace"
import { minerUIFilter } from "./ui/filter/mainFilterUI"
import { ActionFormData } from "@minecraft/server-ui"
import { apiVec3 } from "../../lib/math/vector3"
import { apiWarn } from "../../../0-lib/player/warn"
import { minerUISettings } from "./ui/settings"
import { minerUIUpgrades } from "./ui/upgrades"
import { filterDigitalMiner } from "./filter"
import { apiString } from "../../lib/string"
import { infoDigitalMiner } from "./info"
import { mineDigitalMiner } from "./mine"

export const interactDigitalMiner = new class InteractDigitalMiner {
  openPainel(player: Player, block: Block, item?: ItemStack): void {
    const minerCenter = apiMinerSpace.getCenter(block, block.permutation)
    const enabled = block.permutation.getState("digital_miner:enabled")
    if(!minerCenter || enabled == undefined) return

    if(item?.hasTag("digital_miner:upgrade")) return minerUIUpgrades.addUpgrade(player, block, minerCenter, {item: item, slot: player.selectedSlotIndex, type: item.typeId.replace("digital_miner:", "").slice(0, -10)})

    const upgrades = minerUIUpgrades.getUpgrades(`${apiString.getDimension(block)}/${apiVec3.toString(minerCenter)}`)

    const blockAmount = globalBlocksLocationsAmount.get(`${apiString.getDimension(block)}/${apiVec3.toString(minerCenter)}`) ?? 0
    new ActionFormData()
    .title("ui.digital_miner:miner.title")
    .body({translate: "ui.digital_miner:miner.body", with: [stackTierAmount[upgrades.stack] ?? "1", speedTierSeconds[upgrades.speed] ?? "1", `${blockAmount}`]})
    .button(`ui.digital_miner:miner.${enabled ? "stop" : "start"}`, `textures/digital_miner/ui/power_${enabled ? "off" : "on"}`)
    .button("ui.digital_miner:miner.filter", "textures/digital_miner/ui/filter")
    .button("ui.digital_miner:miner.upgrades", "textures/digital_miner/ui/upgrades")
    .button("ui.digital_miner:miner.settings", "textures/digital_miner/ui/settings")
    .show(player).then(({canceled, selection}) => {
      if(canceled || selection == undefined) return

      if(selection == 0) return this.startStopMiner(player, block, minerCenter, enabled)

      if(enabled) return apiWarn.notify(player, "warn.digital_miner:miner.filter.change_while_mine", {sound: "warn.ender_addon_pack:break"})
      if(selection == 1) minerUIFilter.filterScreen(player, block, minerCenter)
      if(selection == 2) minerUIUpgrades.upgradesSreen(player, block, minerCenter)
      if(selection == 3) minerUISettings.settingsScreen(player, block, minerCenter)
    })
  }

  private startStopMiner(player: Player, block: Block, center: Vector3, enabled: boolean): void {
    if(enabled == true) return infoDigitalMiner.turnState(block.dimension, center, false)

    const filterListType = filterDigitalMiner.getType(block.dimension, center)
    const filterListTag = filterDigitalMiner.getTag(block.dimension, center)
    if(filterListType.size + filterListTag.size < 1){
      apiWarn.notify(player, "warn.digital_miner:miner.no_filter", {sound: "warn.ender_addon_pack:bass"})
      return infoDigitalMiner.turnState(block.dimension, center, false, false)
    }

    const offset = apiVec3.offsetDirection[block.permutation.getState("minecraft:cardinal_direction") ?? ""]
    if(!offset) return infoDigitalMiner.turnState(block.dimension, center, false, false)

    const inv = apiMinerSpace.getContainer(block.dimension, {x: center.x + offset.x * 2, y: center.y, z: center.z + offset.z * 2})
    if(!inv){
      apiWarn.notify(player, "warn.digital_miner:miner.no_container", {sound: "warn.ender_addon_pack:bass"})
      return infoDigitalMiner.turnState(block.dimension, center, false, false)
    }

    if(inv.emptySlotsCount == 0){
      apiWarn.notify(player, {translate: "warn.digital_miner:miner.container_full"}, {sound: "warn.ender_addon_pack:bass"})
      return
    }

    infoDigitalMiner.turnState(block.dimension, center, true)

    const blockCenter = block.dimension.getBlock(center)
    blockCenter && mineDigitalMiner.mine(blockCenter)
  }
}

const speedTierSeconds: string[] = ["20", "15", "10", "5", "1"]
const stackTierAmount: string[] = ["1", "2", "4", "6", "8"]