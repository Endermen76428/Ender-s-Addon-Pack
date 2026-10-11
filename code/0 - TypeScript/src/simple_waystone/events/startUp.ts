import { EntityComponentTypes, EquipmentSlot, GameMode, ItemComponentTypes, ItemStack, system } from "@minecraft/server"
import { boundScrollRegister, boundScrollTeleport } from "../functions/boundScroll"
import { structureLoaderManager } from "../functions/structures/manager"
import { teleporterPadInteract } from "../functions/teleporter/interact"
import { warpstonePedestalInfo } from "../lib/warpstonePedestal/info"
import { apiWaystoneSpace, dyesList } from "../lib/waystone/space"
import { teleporterPadPlace } from "../functions/teleporter/place"
import { AddonConfig, upgradeXpDiscountItem } from "../variables"
import { teleporterPadStep } from "../functions/teleporter/step"
import { waystoneUISettings } from "../ui/settingsUI"
import { waystonesList } from "../lib/waystone/list"
import { waystoneInfo } from "../lib/waystone/info"
import { apiWarn } from "../../0-lib/player/warn"
import { waystoneUICreate } from "../ui/createUI"
import { apiCooldown } from "../lib/apiCooldown"
import { waystoneUIList } from "../ui/listUI"
import { apiConfig } from "../lib/apiConfig"

const replaceBlock = ["minecraft:air", "minecraft:lava", "minecraft:water"]

system.beforeEvents.startup.subscribe(({blockComponentRegistry: customB, itemComponentRegistry: customI}) => {
  customB.registerCustomComponent("ws:waystone", {
    beforeOnPlayerPlace: e => {
      const { block, dimension, player} = e
      const up = block.above(1)
      if(!up || !player) return
      if(!replaceBlock.includes(up.typeId) || up.location.y >= dimension.heightRange.max){ e.cancel = true; return }
      system.runTimeout(() => {
        apiWaystoneSpace.setOff(player, block)
        waystoneUICreate(player, block)
      })
    },

    onPlayerInteract: e => {
      const { block: b, player } = e
      const perm = b.permutation.getAllStates()
      const block = perm["ws:waystone"] == 1 ? b : b.below(1)
      if(!player || !block) return
      if(perm["ws:waystone_on"] == false) return waystoneUICreate(player, block)

      const waystone = waystonesList.findWaystone(block.dimension.id, block.location)

      if(!waystone){
        apiWaystoneSpace.setOff(player, block)
        return apiWarn.notify(player, "block.warn.simple_waystone:waystone.corrupted", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})
      }

      const equippable = player.getComponent(EntityComponentTypes.Equippable)
      if(!equippable) return
      const itemStack = equippable.getEquipment(EquipmentSlot.Mainhand)
      if(itemStack != undefined){
        const itemId = itemStack.typeId
        if(itemId == "ws:return_scroll" || itemId == "ws:bound_scroll") return boundScrollRegister(player, itemStack, block)
        if(player.id == waystone.owner){
          if(dyes.has(itemId)) return apiWaystoneSpace.paintWaystone(player, block)
          if(itemId == "minecraft:brush") return apiWaystoneSpace.waystoneToWarpstone(player, block)

          const discountValue = upgradeXpDiscountItem[itemId]
          if(discountValue != undefined && !AddonConfig.disableDiscount) return apiWaystoneSpace.upgradeXp(player, block, discountValue, itemId)
        }
      }

      if(waystoneInfo.claimedWaystone(player, waystone)) return
      if(player.isSneaking) return waystoneUISettings(player, waystone.owner, block)

      if(!AddonConfig.tpByBlock) return apiWarn.notify(player, "block.warn.simple_waystone:waystone.disabled", {sound: "warn.ender_addon_pack:bass"})

      const cooldown = apiCooldown.timeUp(player, "waystoneCooldown")
      if(!cooldown.end) return apiWarn.notify(player, {translate: "block.warn.simple_waystone:waystone.teleport_cooldown", with: [`${cooldown.time}s`]}, {type: "actionbar"})

      waystoneUIList(player, block, waystone, undefined, apiConfig.getConfig(player, "publicFirst"))
    }
  })

  customB.registerCustomComponent("ws:warpstone_pedestal", {
    beforeOnPlayerPlace: ({block, player}) => {
      if(!player) return
      system.run(() => warpstonePedestalInfo.create(block, player))
    },

    onPlayerInteract: ({block, player}) => {
      if(!player) return

      if(player.isSneaking) return waystoneUISettings(player, player.id, block)

      if(!AddonConfig.tpByBlock) return apiWarn.notify(player, "block.warn.simple_waystone:waystone.disabled", {sound: "warn.ender_addon_pack:bass"})

      const cooldown = apiCooldown.timeUp(player, "waystoneCooldown")
      if(!cooldown.end) return apiWarn.notify(player, {translate: "block.warn.simple_waystone:waystone.teleport_cooldown", with: [`${cooldown.time}s`]}, {type: "actionbar"})

      waystoneUIList(player, block, undefined, undefined)
    }
  })

  customB.registerCustomComponent("ws:teleporter_pad", {
    onPlace: ({block}) => { teleporterPadPlace(block) },

    onStepOn: ({block, entity}) => { if(entity && entity.isValid) teleporterPadStep.stepOn(block, entity) },
    onStepOff: ({block, entity}) => { if(entity && entity.isValid) teleporterPadStep.stepOff(block, entity) },
    onPlayerInteract: ({block, player}) => { if(player) teleporterPadInteract.remove(block, player) }
  })

  customB.registerCustomComponent("ws:teleporter_pad_empty", {
    onPlace: ({block}) => { teleporterPadPlace(block) },
    onStepOff: ({block, entity}) => { if(entity && entity.isValid) teleporterPadStep.stepOff(block, entity) },
    onPlayerInteract: ({block, player}) => { if(player) teleporterPadInteract.place(block, player) }
  })

  customB.registerCustomComponent("ws:structure_loader", {
    onTick: ({block}) => { structureLoaderManager(block) }
  })

  customI.registerCustomComponent("ws:warpstone", {
    onUse: ({source: player, itemStack: item}) => {
      if(!item) return
      if(player.getGameMode() == GameMode.Creative){
        player.setDynamicProperty("warpstoneCooldown", Math.floor(new Date().getTime() / 1000) -1)
        return waystoneUIList(player, undefined, undefined, item)
      }
      const cooldown = apiCooldown.timeUp(player, "warpstoneCooldown")
      if(item.typeId == "ws:warpstone" && !cooldown.end) return apiWarn.notify(player, {translate: "item.warn.simple_waystone:teleport_item.cooldown", with: [`${cooldown.time}s`]}, {type: "actionbar"})
      waystoneUIList(player, undefined, undefined, item)
    }
  })

  customI.registerCustomComponent("ws:return_scroll", {
    onUse: ({source: player, itemStack: item}) => {
      waystoneUIList(player, undefined, undefined, item)
    },

    onHitEntity: ({attackingEntity: player, itemStack: item}) => {
      if(item == undefined){
        const newItem = new ItemStack("ws:return_scroll")
        const durability = newItem.getComponent(ItemComponentTypes.Durability)
        if(!durability) return
        durability.damage = 31
        player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, newItem)
        return
      }
      const durability = item.getComponent(ItemComponentTypes.Durability)
      if(!durability) return
      durability.damage = durability.damage -2
      player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, item)
    }
  })

  customI.registerCustomComponent("ws:bound_scroll", {
    onUse: ({source: player, itemStack: item}) => {
      item && boundScrollTeleport(player, item)
    },

    onHitEntity: ({attackingEntity: player, itemStack: item}) => {
      if(item == undefined){
        const newItem = new ItemStack("ws:bound_scroll")
        const durability = newItem.getComponent(ItemComponentTypes.Durability)
        if(!durability) return
        durability.damage = 31
        player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, newItem)
        return
      }
      const durability = item.getComponent(ItemComponentTypes.Durability)
      if(!durability) return
      durability.damage = durability.damage -2
      player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, item)
    }
  })
})

const dyes = new Set(dyesList)