import { world, Block, Dimension, Entity } from "@minecraft/server"

export const apiString = new class ApiString {
  firstUpperCase(str: string): string {
    return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  }

  getDimension(dimension: Entity | Block | Dimension, noPrefix = true): string {
    const dim = dimension instanceof Dimension ? dimension : dimension.dimension
    if(noPrefix) return dim.id.replace("minecraft:", "")
    return dim.id
  }
}