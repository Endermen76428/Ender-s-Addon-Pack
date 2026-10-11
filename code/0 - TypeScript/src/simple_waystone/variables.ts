export let SubpackAdminPanelEnabled = false

export const AddonConfig = {
  xpMax: 3,
  xpByDistance: 700,
  xpByDimension: 3,
  tpByBlock: true,
  tpBetweenDimension: true,
  tpCooldown: 0,
  itemCooldown: 60,
  disableDiscount: false
}

export const upgradeXpDiscountItem: { [key: string]: number } = {
  "minecraft:iron_block": 70,
  "minecraft:diamond_block": 50,
  "minecraft:netherite_block": 0
}

export const upgradeXpDiscount: { [key: number]: string } = {
  70: "minecraft:iron_block",
  50: "minecraft:diamond_block",
  0: "minecraft:netherite_block"
}