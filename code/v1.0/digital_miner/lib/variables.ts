import { world, system, ItemTypes, ItemStack, BlockLocationIterator } from "@minecraft/server"
import { filterDigitalMiner } from "../functions/miner/filter"
import { Upgrades } from "../functions/miner/ui/upgrades"

export const digitalMinerMaxRadius = 32



// --------------------------------
// Cache
// --------------------------------

export const globalFilterTypeCache = new Map<string, Set<string>>()
export const globalFilterTagCache = new Map<string, Set<string>>()
export const globalFilterTypeTagCache = new Map<string, {type: string[], tag: string[]}>()
export const globalBlocksLocations = new Map<string, BlockLocationIterator[]>()
export const globalBlocksLocationsAmount = new Map<string, number>()
export const globalUpgradesCache = new Map<string, Upgrades>()
export const globalToolCache = new Map<string, ItemStack>()



// --------------------------------
// Filter Block Type
// --------------------------------

const filterTypePageSize = 50
export const blockTypeIdCategory = new Map<string, BlockTypeIdCategory[][]>()
export let addonNamePriority: string[] = []

const changeId: { [key: string]: string } = {
  "bp": "simple_backpack",
  "ws": "simple_waystone"
}

system.run(() => {
  const generalBlockCategory: { [key: string]: string[] } = {}

  ItemTypes.getAll().forEach(value => {
    const [ identifier, id ] = value.id.split(":")
    if(identifier && id){
      if(filterDigitalMiner.isBlock(value.id)){
        const blocks = (generalBlockCategory[changeId[identifier] ?? identifier] ?? [])
        blocks.push(value.id)
        generalBlockCategory[changeId[identifier] ?? identifier] = blocks
      }
    }
  })

  addonNamePriority = Object.keys(generalBlockCategory).sort((a, b) => {
    if(a === "minecraft") return 1
    if(b === "minecraft") return -1
    return a.localeCompare(b)
  })

  Object.entries(generalBlockCategory).forEach(([key, value]) => {
    const addonBlocks = value.sort()
    const blocks: BlockTypeIdCategory[][] = Array.from({ length: Math.ceil(addonBlocks.length / filterTypePageSize) },
    (_, i) => {
      return addonBlocks
      .slice(i * filterTypePageSize, i * filterTypePageSize + filterTypePageSize)
      .map(value => {
        return {
          id: value,
          translate: new ItemStack(value).localizationKey
        }
      })
    })
    blockTypeIdCategory.set(key, blocks)
  })
})

interface BlockTypeIdCategory {
  id: string
  translate: string
}