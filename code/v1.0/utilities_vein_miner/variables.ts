import { Vector3 } from "@minecraft/server"

// Config
export const Variables = {
  maxSize: 1024,
  maxTunnel: 16,
  maxTunnelMedium: 16,
  maxMiningTunnel: 16,
  maxEscapingTunnel: 16
}

// Vectors
export const defaultFaceDirection: [ Vector3, Vector3, Vector3, Vector3, Vector3, Vector3 ] = [
  {x: 0, y: 0, z: -1}, // North
  {x: 1, y: 0, z: 0}, // East
  {x: 0, y: 0, z: 1}, // South
  {x: -1, y: 0, z: 0}, // West
  {x: 0, y: 1, z: 0}, // Up
  {x: 0, y: -1, z: 0}, // Down
]

// Special Blocks

const leaves = [
  "minecraft:acacia_leaves",
  "minecraft:azalea_leaves",
  "minecraft:azalea_leaves_flowered",
  "minecraft:birch_leaves",
  "minecraft:cherry_leaves",
  "minecraft:dark_oak_leaves",
  "minecraft:jungle_leaves",
  "minecraft:mangrove_leaves",
  "minecraft:oak_leaves",
  "minecraft:pale_oak_leaves",
  "minecraft:spruce_leaves"
]

export const canDropNone = new Set([
  ...leaves,
  "minecraft:short_grass",
  "minecraft:tall_grass",
  "minecraft:fern",
  "minecraft:large_fern",
  "minecraft:deadbush",
  "minecraft:sculk",
  "minecraft:sculk_catalyst",
  "minecraft:sculk_sensor",
  "minecraft:sculk_shrieker",
  "minecraft:sculk_vein",
  "minecraft:calibrated_sculk_sensor"
])

export const autoEnableAll = [
  "minecraft:ancient_debris",
  "minecraft:coal_ore",
  "minecraft:copper_ore",
  "minecraft:deepslate_coal_ore",
  "minecraft:deepslate_copper_ore",
  "minecraft:deepslate_diamond_ore",
  "minecraft:deepslate_emerald_ore",
  "minecraft:deepslate_gold_ore",
  "minecraft:deepslate_iron_ore",
  "minecraft:deepslate_lapis_ore",
  "minecraft:deepslate_redstone_ore",
  "minecraft:diamond_ore",
  "minecraft:emerald_ore",
  "minecraft:gold_ore",
  "minecraft:gravel",
  "minecraft:iron_ore",
  "minecraft:lapis_ore",
  "minecraft:nether_gold_ore",
  "minecraft:quartz_ore",
  "minecraft:redstone_ore",
  "minecraft:red_sand",
  "minecraft:sand"
]

export const worksOnlyOres: Set<string> = new Set([
  "minecraft:ancient_debris",
  "minecraft:coal_ore",
  "minecraft:copper_ore",
  "minecraft:deepslate_coal_ore",
  "minecraft:deepslate_copper_ore",
  "minecraft:deepslate_diamond_ore",
  "minecraft:deepslate_emerald_ore",
  "minecraft:deepslate_gold_ore",
  "minecraft:deepslate_iron_ore",
  "minecraft:deepslate_lapis_ore",
  "minecraft:deepslate_redstone_ore",
  "minecraft:diamond_ore",
  "minecraft:emerald_ore",
  "minecraft:gold_ore",
  "minecraft:iron_ore",
  "minecraft:lapis_ore",
  "minecraft:nether_gold_ore",
  "minecraft:quartz_ore",
  "minecraft:redstone_ore",

  "minecraft:andesite",
  "minecraft:diorite",
  "minecraft:granite",
  "minecraft:gravel",
  "minecraft:dirt",
  "minecraft:stone",
  "minecraft:deepslate",
  "minecraft:tuff",

  "minecraft:netherrack"
])
export const worksOnlyLogs: Set<string> = new Set([
  "minecraft:oak_wood",
  "minecraft:oak_log",
  "minecraft:stripped_oak_wood",
  "minecraft:stripped_oak_log",
  "minecraft:spruce_wood",
  "minecraft:spruce_log",
  "minecraft:stripped_spruce_wood",
  "minecraft:stripped_spruce_log",
  "minecraft:birch_wood",
  "minecraft:birch_log",
  "minecraft:stripped_birch_wood",
  "minecraft:stripped_birch_log",
  "minecraft:jungle_wood",
  "minecraft:jungle_log",
  "minecraft:stripped_jungle_wood",
  "minecraft:stripped_jungle_log",
  "minecraft:acacia_wood",
  "minecraft:acacia_log",
  "minecraft:stripped_acacia_wood",
  "minecraft:stripped_acacia_log",
  "minecraft:dark_oak_wood",
  "minecraft:dark_oak_log",
  "minecraft:stripped_dark_oak_wood",
  "minecraft:stripped_dark_oak_log",
  "minecraft:mangrove_wood",
  "minecraft:mangrove_log",
  "minecraft:stripped_mangrove_wood",
  "minecraft:stripped_mangrove_log",
  "minecraft:pale_oak_wood",
  "minecraft:pale_oak_log",
  "minecraft:stripped_pale_oak_wood",
  "minecraft:stripped_pale_oak_log",
  "minecraft:cherry_wood",
  "minecraft:cherry_log",
  "minecraft:stripped_cherry_wood",
  "minecraft:stripped_cherry_log",
  "minecraft:bamboo_block",
  "minecraft:stripped_bamboo_block",
  "minecraft:bamboo_mosaic",
  "minecraft:bamboo_planks",
  "minecraft:crimson_hyphae",
  "minecraft:crimson_stem",
  "minecraft:stripped_crimson_hyphae",
  "minecraft:stripped_crimson_stem",
  "minecraft:warped_hyphae",
  "minecraft:warped_stem",
  "minecraft:stripped_warped_hyphae",
  "minecraft:stripped_warped_stem"
])

export const blocksWithExperience: { [key: string]: [number, number] } = {
  "minecraft:coal_ore": [0, 2],
  "minecraft:deepslate_coal_ore": [0, 2],
  "minecraft:nether_gold_ore": [0, 1],
  "minecraft:diamond_ore": [3, 7],
  "minecraft:deepslate_diamond_ore": [3, 7],
  "minecraft:emerald_ore": [3, 7],
  "minecraft:deepslate_emerald_ore": [3, 7],
  "minecraft:lapis_ore": [2, 5],
  "minecraft:deepslate_lapis_ore": [2, 5],
  "minecraft:quartz_ore": [2, 5],
  "minecraft:redstone_ore": [1, 5],
  "minecraft:deepslate_redstone_ore": [1, 5],
  "minecraft:mob_spawner": [15, 43],
  "minecraft:sculk": [1, 1],
  "minecraft:sculk_sensor": [5, 5],
  "minecraft:sculk_shrieker": [5, 5],
  "minecraft:sculk_catalyst": [5, 5],
  "minecraft:calibrated_sculk_sensor": [5, 5]
}