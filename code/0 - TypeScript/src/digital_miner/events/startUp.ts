import { world, system } from "@minecraft/server"
import { startUpBlock } from "./custom/block"
import { startUpItem } from "./custom/item"

system.beforeEvents.startup.subscribe(({blockComponentRegistry: customB, itemComponentRegistry: customI, customCommandRegistry: customC}) => {
  customB.registerCustomComponent("digital_miner:miner", startUpBlock.digitalMiner)
  customB.registerCustomComponent("digital_miner:dig", startUpBlock.digitalMinerDig)

  customI.registerCustomComponent("digital_miner:ore_scanner", startUpItem.oreScanner)
  customI.registerCustomComponent("digital_miner:guidebook", startUpItem.guidebook)
})