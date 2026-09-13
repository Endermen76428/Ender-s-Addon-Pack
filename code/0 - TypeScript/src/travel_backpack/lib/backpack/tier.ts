export function getBackpackTier(item: string): number {
  const length = item.length
  if(item.endsWith("leather_backpack", length)) return 0
  if(item.endsWith("copper_backpack", length)) return 1
  if(item.endsWith("iron_backpack", length)) return 2
  if(item.endsWith("gold_backpack", length)) return 3
  if(item.endsWith("diamond_backpack", length)) return 4
  if(item.endsWith("netherite_backpack", length)) return 5
  return 0
}