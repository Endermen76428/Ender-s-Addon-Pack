import { Block, GameMode, ItemComponentTypes, ItemStack, Player, PlayerBreakBlockBeforeEvent, system, world } from "@minecraft/server"
import { warpstonePedestalInfo } from "../lib/warpstonePedestal/info"
import { teleporterPadCache } from "../lib/cache/teleporter"
import { teleporterPadSpace } from "../lib/teleporter/space"
import { teleporterPadInfo } from "../lib/teleporter/info"
import { waystoneCache } from "../lib/cache/waystone"
import { waystoneInfo } from "../lib/waystone/info"
import { apiWarn } from "../../0-lib/player/warn"

world.beforeEvents.playerBreakBlock.subscribe(ev => {
  const hasSilk = ev.itemStack?.getComponent(ItemComponentTypes.Enchantable)?.hasEnchantment("minecraft:silk_touch") ?? false

  if(ev.block.hasTag("ws:waystone")) return breakBlockController["ws:waystone"]?.(ev.player, ev.block, hasSilk, ev)
  if(ev.block.hasTag("simple_waystone:warpstone_pedestal")) return breakBlockController["simple_waystone:warpstone_pedestal"]?.(ev.player, ev.block, hasSilk, ev)

  if(ev.block.hasTag("simple_waystone:teleporter_pad")){
    if(hasSilk) ev.cancel = true
    return breakBlockController["simple_waystone:teleporter_pad"]?.(ev.player, ev.block, hasSilk, ev)
  }
})

const breakBlockController: { [key: string]: (player: Player, block: Block, hasSilk: boolean, event: PlayerBreakBlockBeforeEvent) => void } = {
  "ws:waystone": (player, block, hasSilk, event) => {
    const bottom = block.permutation.getState("ws:waystone") == 1 ? block : block.below(1)
    if(bottom == undefined) return

    const drop = block.getItemStack()
    const info = waystoneCache.getWaystone(`${bottom.dimension.id.replace("minecraft:", "")}/${bottom.x},${bottom.y},${bottom.z}`)
    if(info == undefined){
      system.run(() => { if(drop && player.getGameMode() != GameMode.Creative) block.dimension.spawnItem(drop, {x: block.x +0.5, y: block.y +0.5, z: block.z +0.5}) })
      return
    }
    if(info.lock == true && player.id != info.owner && !player.hasTag("admin")){
      event.cancel = true
      system.run(() => {
        apiWarn.notify(player, "block.warn.simple_waystone:waystone.locked", {type: "actionbar", sound: "warn.ender_addon_pack:break"})
      })
      return
    }

    system.run(() => { if(drop && !hasSilk && player.getGameMode() != GameMode.Creative) block.dimension.spawnItem(drop, {x: block.x +0.5, y: block.y +0.5, z: block.z +0.5}) })

    if(block.permutation.getState("ws:waystone_on") == false) return

    const bottomBlock = block.permutation.getState("ws:waystone") == 1 ? block : block.below(1)
    if(!bottomBlock) return
    system.run(() => {
      waystoneInfo.removeWaystone(bottomBlock.location, bottomBlock.dimension.id)
      player.dimension.playSound("block.simple_waystone:waystone.break", bottomBlock.bottomCenter())
    })
  },

  "simple_waystone:warpstone_pedestal": (player, block) => {
    system.run(() => warpstonePedestalInfo.remove(block.location, block.dimension.id) )
  },

  "simple_waystone:teleporter_pad": (player, block, hasSilk) => {
    const isEmpty = !hasSilk && block.typeId.endsWith("_empty")
    system.run(() => {
      block.setType("minecraft:air")
      const teleporter = teleporterPadCache.getTeleporter(`${block.dimension.id.replace("minecraft:", "")}/${block.x},${block.y},${block.z}`)
      if(teleporter && teleporter != true) teleporterPadSpace.spawnShard(block, teleporter.dimension, teleporter.pos)

      teleporterPadInfo.remove(block)
      if(!isEmpty && player.getGameMode() != GameMode.Creative) block.dimension.spawnItem(new ItemStack("ws:teleporter_pad_empty"), block.center())
    })
  }
}