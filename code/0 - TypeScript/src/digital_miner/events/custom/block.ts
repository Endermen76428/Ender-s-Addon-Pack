import { world, system, BlockCustomComponent, EquipmentSlot } from "@minecraft/server"
import { interactDigitalMiner } from "../../functions/miner/interact"
import { breakDigitalMiner } from "../../functions/miner/break"
import { placeDigitalMiner } from "../../functions/miner/place"
import { mineDigitalMiner } from "../../functions/miner/mine"
import { apiEquippable } from "../../lib/entity/equippable"

export const startUpBlock: Record<startUpBlockIds, BlockCustomComponent> = {
  digitalMiner: {
    beforeOnPlayerPlace: (ev) => {
      placeDigitalMiner(ev)
    },

    onPlayerBreak: ({block, brokenBlockPermutation: perm}) => {
      breakDigitalMiner(block, perm)
    },

    onPlayerInteract: ({block, player}) => {
      if(!player) return
      const item = apiEquippable.getItemSlot(player, EquipmentSlot.Mainhand)
      interactDigitalMiner.openPainel(player, block, item)
    }
  },

  digitalMinerDig: {
    onTick: ({block}) => {
      mineDigitalMiner.mine(block)
    }
  }
}

type startUpBlockIds = "digitalMiner" | "digitalMinerDig"