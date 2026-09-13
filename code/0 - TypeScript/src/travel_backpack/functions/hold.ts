import { Container, Entity, EntityComponentTypes, ItemLockMode, ItemStack, Player, StructureSaveMode, system, world } from "@minecraft/server"
import { spawnBackpack } from "../lib/backpack/spawn"
import { apiWarn } from "../../0-lib/player/warn"

const backpackPlayersListenList: { [key: string]: [Player, Entity, Container, number] } = {} // Player Id > Player Entity, Backpack Entity, Inventory, Last Slot
const playersSneaking: { [key: string]: boolean } = {} // Player Id > Is Sneaking
let amountOfListeners = 0
const maxTick = 19 // 19 é o 20° Tick

function startInverval(executeTime = 0): void {
  const players = Object.entries(backpackPlayersListenList)
  const length = players.length
  let invalidPlayers = 0
  amountOfListeners = length

  for(let i = 0; i < length; i++){
    const [ key, info ] = players[i] ?? []
    if(key == undefined || info == undefined) continue
    const [ player, backpack, inventory, lastSlot ] = info

    // Remove o player da lista, ocorre quando o jogador sai do mundo
    if(!player.isValid || !backpack.isValid){
      invalidPlayers++
      deleteInfo(key)
      continue
    }

    const isSneaking = player.isSneaking

    if(!playersSneaking[key]){
      if(isSneaking){
        playersSneaking[key] = true
        removePlayerHoldListen(player, player.selectedSlotIndex, true)
        continue
      }
    } else {
      if(!isSneaking){
        // Quando o player levantar ele trava novamente a backpack
        const hand = inventory.getItem(player.selectedSlotIndex)
        if(hand && hand.hasTag("travel_backpack:backpack")){
          hand.lockMode = ItemLockMode.slot
          inventory.setItem(player.selectedSlotIndex, hand)
        }
        delete playersSneaking[key]
      }
      continue
    }

    if(lastSlot != player.selectedSlotIndex){
      removePlayerHoldListen(player, lastSlot)
      deleteInfo(key)
      continue
    }

    // Se o item não for mais uma backpack remove o player da lista
    const hand = inventory.getItem(player.selectedSlotIndex)
    if(!hand || !hand.hasTag("travel_backpack:backpack")){
      invalidPlayers++
      deleteInfo(key)
      continue
    }

    if(executeTime == maxTick){
      const id = `travel_backpack:${backpack.id}`
      const maxHeight = player.dimension.heightRange.max -1
      let savePos = {x: player.location.x, y: Math.min(player.location.y +5, maxHeight), z: player.location.z}
      let loop = 0
      while(loop < 10){
        if(player.dimension.getEntitiesAtBlockLocation(savePos).length == 0) break
        savePos.y = Math.min(savePos.y +5, maxHeight)
        loop++
      }
      savePos.y += 0.5
      backpack.teleport(savePos, {dimension: player.dimension})

      world.structureManager.delete(id)
      world.structureManager.createFromWorld(id, backpack.dimension, savePos, savePos, {includeBlocks: false, saveMode: StructureSaveMode.World})
    }

    const playerHead = player.getHeadLocation()

    // Teleporta a entidade na exata localização da cabeça do jogador se tiver muito longe
    if(!(playerHead.x == backpack.location.x && playerHead.y == backpack.location.y && playerHead.z == backpack.location.z)){
      backpack.teleport(playerHead, {dimension: player.dimension})
    }
  }

  // Cancela o loop se não tiver mais jogadores
  if(length == invalidPlayers){
    amountOfListeners = 0
    return
  }

  // Reinicia o loop depois de 1 tick
  system.run(() => startInverval(executeTime >= maxTick ? 0 : executeTime + 1))
}

function deleteInfo(playerId: string): void {
  delete backpackPlayersListenList[playerId]
  delete playersSneaking[playerId]
}

export function addPlayerHoldListen(player: Player, item: ItemStack, slot: number): void {
  const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container
  if(!inventory) return

  let entity: Entity | undefined

  const itemBackpackId = item.getDynamicProperty("id")
  if(typeof itemBackpackId == "string"){
    // Pega a entidade que está na região de salvamento
    entity = world.getEntity(itemBackpackId)
    if(!entity){
      const structure = world.structureManager.get(`travel_backpack:${itemBackpackId}`)
      if(structure){
        const pos = {x: player.location.x, y: player.dimension.heightRange.max -0.5, z: player.location.z}
        world.structureManager.place(structure, player.dimension, pos, {includeBlocks: false})
        entity = player.dimension.getEntities({type: "travel_backpack:backpack", location: pos, maxDistance: 1})[0]
      } else {
        if(player.dimension.isChunkLoaded(player.location) == false) return
        apiWarn.notify(player, "§cError on get backpack, resetting backpack!", {sound: "warn.ender_addon_pack:break"})
        // Gera uma mochila nova se der algum erro na hora de pegar a backpack salva
        entity = spawnBackpack(player, item.typeId)
      }
    }
  } else {
    // Gera uma mochila nova pois nunca foi colocada no chão para gerar o primeiro id
    entity = spawnBackpack(player, item.typeId)
  }

  if(!entity || !entity.isValid) return

  entity.triggerEvent("travel_backpack:remove_timer")
  if(player.isSneaking){
    entity.teleport({x: player.location.x, y: player.dimension.heightRange.min +1, z: player.location.z}, {dimension: player.dimension})
  } else {
    entity.teleport(player.getHeadLocation(), {dimension: player.dimension})
  }

  backpackPlayersListenList[player.id] = [player, entity, inventory, slot]

  item.setDynamicProperty("id", entity.id)
  item.setLore([{translate: "lore.travel_backpack:backpack.id", with: [entity.id]}])
  if(!player.isSneaking) item.lockMode = ItemLockMode.slot

  inventory.setItem(slot, item)

  amountOfListeners == 0 && startInverval()
}

function removePlayerHoldListen(player: Player, slot: number, sneaking = false): void {
  const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container
  if(!inventory) return

  const item = inventory.getItem(slot)
  if(!item || !item.hasTag("travel_backpack:backpack")) return

  const backpackId = item.getDynamicProperty("id")
  if(typeof backpackId != "string") return

  const entity = world.getEntity(backpackId)
  if(!entity || !entity.isValid) return

  if(!sneaking && !entity.hasTag("can_enable_timer")) entity.triggerEvent("travel_backpack:add_timer")

  const savePos = {x: player.location.x, y: player.dimension.heightRange.min +1, z: player.location.z}
  const maxHeight = player.dimension.heightRange.max
  let loop = 0
  while(loop < 10){
    if(player.dimension.getEntitiesAtBlockLocation(savePos).length == 0) break
    savePos.y = Math.min(savePos.y +5, maxHeight)
    loop++
  }
  savePos.y += 0.5
  entity.teleport(savePos, {dimension: player.dimension})

  const id = `travel_backpack:${entity.id}`
  world.structureManager.delete(id)
  world.structureManager.createFromWorld(id, entity.dimension, savePos, savePos, {includeBlocks: false, saveMode: StructureSaveMode.World})

  item.lockMode = ItemLockMode.none

  inventory.setItem(slot, item)
}