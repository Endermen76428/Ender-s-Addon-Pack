import { world, system, ItemStack, Player, BlockVolume, ItemComponentTypes } from "@minecraft/server"
import { apiWarn } from "../../../0-lib/player/warn"

export function oreScannerFindBlocks(player: Player, item: ItemStack): void {
  item.getComponent(ItemComponentTypes.Cooldown)?.startCooldown(player)
  player.runCommand("event entity @e[type=digital_miner:block_outline,r=43] digital_miner:despawn")

  const oreIds = item.getDynamicPropertyIds()
  if(oreIds.length < 1) return apiWarn.notify(player, "warn.digital_miner:ore_scanner.no_filters", {sound: "warn.ender_addon_pack:bass"})

  const pos1 = {x: player.location.x -16, y: player.location.y -16, z: player.location.z -16}
  const pos2 = {x: player.location.x +15, y: player.location.y +15, z: player.location.z +15}
  const blocks = player.dimension.getBlocks(new BlockVolume(pos1, pos2), {includeTypes: oreIds}, true).getBlockLocationIterator()
  system.runJob(function* execute(): Generator<void> {
    for(const pos of blocks){
      player.dimension.spawnEntity("digital_miner:block_outline", {x: pos.x + 0.5, y: pos.y + 0.5, z: pos.z + 0.5})
      yield
    }
  }())
}