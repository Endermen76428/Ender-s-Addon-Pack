import { world, ItemCustomComponent } from "@minecraft/server"
import { oreScannerInterface } from "../../functions/ore_scanner/interface"
import { oreScannerFindBlocks } from "../../functions/ore_scanner/findBlocks"
import { guidebook } from "../../functions/guidebook/guidebook"

export const startUpItem: Record<startUpItemIds, ItemCustomComponent> = {
  guidebook: {
    onUse: ({source: player, itemStack: item}) => {
      item && guidebook.open(player, [])
    }
  },

  oreScanner: {
    onUse: ({source: player, itemStack: item}) => {
      if(!item) return
      if(player.isSneaking){
        oreScannerInterface.open(player, item)
        return
      }
      oreScannerFindBlocks(player, item)
    }
  }
}

type startUpItemIds = "guidebook" | "oreScanner"