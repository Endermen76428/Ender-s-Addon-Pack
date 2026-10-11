import { dimensionsOrder } from "../ui/settingsUI"
import { world, Player } from "@minecraft/server"
import { IWaystoneInfo } from "./waystone/info"
import { apiConfig } from "./apiConfig"

const dimensionList: { [key: string]: string } = {"overworld": "minecraft:overworld", "nether": "minecraft:nether", "the_end": "minecraft:the_end"}
const currentDimension: { [key: string]: number } = {"minecraft:overworld": 1, "minecraft:nether": 3, "minecraft:the_end": 5}

export const apiOrganize = new class apiOrganize {
  organize(list: IWaystoneInfo[], alphabetical = true): IWaystoneInfo[] {
    const waystones = list
    if(alphabetical) return waystones.sort((a, z) => { return z.name.localeCompare(a.name)})
    return waystones.sort((a, z) => { return a.name.localeCompare(z.name)})
  }

  organizeDimension(player: Player, list: IWaystoneInfo[]): IWaystoneInfo[] {
    const config = apiConfig.getConfig(player)
    const organize = config.organizeDimension
    const dimensionIndex = currentDimension[player.dimension.id] ?? 0

    const isCustomDimension = !player.dimension.id.startsWith("minecraft:")
    const dimensionOrder = dimensionsOrder[isCustomDimension ? 1 : organize == 0 ? dimensionIndex : organize]?.split("-").map(value => `${dimensionList[value]}`)
    if(!dimensionOrder) return []

    const statupOrder: Record<string, IWaystoneInfo[]> = {"favorite": []}
    if(isCustomDimension) statupOrder[player.dimension.id] = []

    const initialize = dimensionOrder.reduce((acc, dimension) => {
      acc[dimension] = []
      return acc
    }, statupOrder)

    const waystones = list.reduce<Record<string, IWaystoneInfo[]>>((acc, info) => {
      if(info.favorite.has(player.id)){
        acc["favorite"]?.push(info)
        return acc
      }

      const dimensionList = acc[info.dimension]
      if(dimensionList){
        dimensionList.push(info)
      } else (acc[info.dimension] ??= []).push(info)
      return acc
    }, initialize)

    const waystonesKeys = Object.keys(waystones)
    for(let i = 0, len = waystonesKeys.length; i < len; i++){
      const dimension = waystonesKeys[i]
      if(!dimension) continue
      if(config.organize){
        waystones[dimension]?.sort((a, b) => b.name.localeCompare(a.name))
      } else {
        waystones[dimension]?.sort((a, b) => a.name.localeCompare(b.name))
      }
    }

    return Object.values(waystones).flat()
  }

  sameNames(name: string, waystonesName: string[]){
    let newName = name

    let counter = 1
    while(waystonesName.includes(newName)) newName = `${name} (${counter++})`
    return newName
  }
}