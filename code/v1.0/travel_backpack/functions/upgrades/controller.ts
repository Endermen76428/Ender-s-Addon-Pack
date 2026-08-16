import { world, system, Container, Entity, Player, EntityComponentTypes } from "@minecraft/server"
import { backpackUpgradesIndex, lockSlotItem } from "../../lib/variables"
import { craftUpgradeFunctions } from "./craft/upCraftHandler"

const backpackPlayersListenList: { [key: string]: IntervalInfo } = {} // Player Id > Interval Info
let amountOfListeners = 0

function startInverval(executeTime = 0): void {
  const players = Object.entries(backpackPlayersListenList)
  const length = players.length
  let invalidPlayers = 0
  amountOfListeners = length

  for(let i = 0; i < length; i++){
    const [ key, info ] = players[i] ?? []
    if(key == undefined || info == undefined) continue
    const { player, backpack, playerInv, backpackInv, slots, upgrades } = info

    // Remove o player da lista, ocorre quando o jogador sai do mundo
    if(!player.isValid || !backpack.isValid){
      invalidPlayers++
      backpackPlayersListenList[key]
      continue
    }

    // A cada 5 ticks terá uma verificação dos upgrades, para saber se foi ativou ou não
    if(executeTime == 4){ // 4 é o 5° tick
      const [ firstSlot, size ] = slots
      const newUpgrades: (undefined | string)[] = Array.from({length: 6})
      // Aqui adicionará no array os slots que mudaram, colocando "" quando for removido e o id quando adicionado
      for(let i = firstSlot, len = firstSlot + size; i < len; i++){
        const slot = i - firstSlot
        const item = backpackInv.getItem(i)
        const oldUpgrade = upgrades[slot]

        if(item != undefined && !item?.hasTag("travel_backpack:upgrade_function")){
          backpackInv.setItem(i, undefined)
          item && player.dimension.spawnItem(item, player.location)
          if(upgrades[slot] != "") newUpgrades[slot] = ""
          continue
        }

        const itemId = item?.typeId ?? ""
        if(itemId == oldUpgrade) continue

        newUpgrades[slot] = itemId
      }

      // Executa cada ação dependendo doque está no newUpgrades, se for "" ele executará a função de remoção especifica para o upgrade antigo, se não ele executará a adição do antigo upgrade
      for(let i = firstSlot, len = firstSlot + size; i < len; i++){
        const slot = i - firstSlot
        const change = newUpgrades[slot]
        if(change == undefined) continue

        if(change == ""){
          const exe = removeFunctions[upgrades[slot] ?? ""]
          exe && exe(player, backpack, backpackInv, firstSlot, upgrades)
          upgrades[slot] = ""
          continue
        }

        const exe = addFunctions[change]
        exe && exe(backpack, backpackInv, firstSlot, upgrades)
        upgrades[slot] = change
      }
    }
  }

  // Cancela o loop se não tiver mais jogadores
  if(length == invalidPlayers){
    amountOfListeners = 0
    return
  }

  // Reinicia o loop depois de 1 tick
  system.run(() => startInverval(executeTime >= 4 ? 0 : executeTime + 1))
}

export function addPlayerUpgradeListen(player: Player, backpack: Entity): void {
  const playerInv = backpack.getComponent(EntityComponentTypes.Inventory)?.container
  const backpackInv = backpack.getComponent(EntityComponentTypes.Inventory)?.container
  if(!playerInv || !backpackInv) return

  const info = backpackUpgradesIndex[backpackInv.size]
  if(info == undefined) return
  const [ firstSlot, size ] = info

  const upgradesToEnable: EnableUpgrades = { craft: false }
  const upgrades: UpgradesList = ["", "", "", "", "", ""]
  for(let i = firstSlot, len = firstSlot + size; i < len; i++){
    const item = backpackInv.getItem(i)
    if(!item) continue

    if(!item.hasTag("travel_backpack:upgrade_function")){
      backpackInv.setItem(i, undefined)
      player.dimension.spawnItem(item, player.location)
      continue
    }

    const exe = enableUpgrades[item.typeId]
    exe && exe(upgradesToEnable, backpack, backpackInv, firstSlot, upgrades)

    upgrades[i - firstSlot] = item.typeId
  }

  backpackPlayersListenList[player.id] = {player, backpack, playerInv, backpackInv, slots: info, upgrades}
  amountOfListeners == 0 && startInverval()
}

export function removePlayerUpgradeListen(player: Player): void {
  delete backpackPlayersListenList[player.id]
}

const addFunctions: { [key: string]: (entity: Entity, inventory: Container, firstSlot: number, oldUpgrades: UpgradesList) => void } = {
  "travel_backpack:craft_upgrade": (entity, inventory, firstSlot) => {
    // Evita de substituir os itens do craft terminal caso coloque outro upgrade de craft
    if(inventory.getItem(firstSlot +10)?.typeId != "travel_backpack:lock_slot") return

    for(let i = firstSlot +10, len = firstSlot +19; i < len; i++){
      inventory.setItem(i, undefined)
    }

    craftUpgradeFunctions.add(entity, inventory, firstSlot)
  }
}

const removeFunctions: { [key: string]: (player: Player, entity: Entity, inventory: Container, firstSlot: number, oldUpgrades: UpgradesList) => void } = {
  "travel_backpack:craft_upgrade": (player, entity, inventory, firstSlot, oldUpgrades) => {
    let upgradesEnabled = -1 // -1 porque o oldUpgrades mostra os ativos então o script soma esse valor pra no final ser algum numero igual a 0 ou maior pra inciar a quantia certa de upgrades ativo
    for(let i = 0, len = oldUpgrades.length; i < len; i++){
      const upgrade = oldUpgrades[i]
      if(upgrade == "travel_backpack:craft_upgrade") upgradesEnabled++
    }
    if(upgradesEnabled > 0) return

    for(let i = firstSlot +10, len = firstSlot +19; i < len; i++){
      const item = inventory.getItem(i)
      item && !item.hasTag("travel_backpack:lock_slot") && player.dimension.spawnItem(item, player.location)
      inventory.setItem(i, lockSlotItem)
    }

    craftUpgradeFunctions.remove(entity)
  }
}

const enableUpgrades: { [key: string]: (upgrades: EnableUpgrades, entity: Entity, inventory: Container, firstSlot: number, oldUpgrades: UpgradesList) => void } = {
  "travel_backpack:craft_upgrade": (upgrades, entity, inventory, firstSlot) => {
    // Se o craft já tiver ativo é porque tem mais de um então não executa pra não executar a mesma coisa já que esse upgrade é fixo
    if(upgrades.craft == true) return

    upgrades.craft = true
    craftUpgradeFunctions.add(entity, inventory, firstSlot)
  }
}



interface IntervalInfo {
  player: Player
  backpack: Entity
  playerInv: Container
  backpackInv: Container
  slots: [number, number]
  upgrades: UpgradesList
}

interface EnableUpgrades {
  craft: boolean
}

type UpgradesList = [string, string, string, string, string, string]