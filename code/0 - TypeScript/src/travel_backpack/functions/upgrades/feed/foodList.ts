import { ItemStack, ItemComponentTypes } from "@minecraft/server"
import { IFoodInfo, TFoodEffect } from "./feedListener"

export function getFoodInfo(item: ItemStack): IFoodInfo | undefined {
  const cache = foodList[item.typeId]
  if(cache) return {...cache, type: item.typeId}

  const foodComp = item.getComponent(ItemComponentTypes.Food)
  if(foodComp == undefined) return

  const convert = foodComp.usingConvertsTo == "" ? getConvert(item) : foodComp.usingConvertsTo
  const effects = getEffect(item)

  const info: TfoodList = {
    food: Math.max(foodComp.nutrition, 1),
    saturation: foodComp.nutrition * foodComp.saturationModifier * 2, // Esse é o calculo da saturação que ta na documentação, é muito estranho
    convert,
    effects
  }

  foodList[item.typeId] = info
  return {
    type: item.typeId,
    ...info
  }
}

function getEffect(item: ItemStack): TFoodEffect | undefined {
  const id = item.typeId.split(":", 1)[0]
  if(id == undefined) return

  const exe = effectsByAddon[id]
  return exe && exe(item)
}

const effectsByAddon: { [key: string]: (item: ItemStack) => TFoodEffect | undefined } = {
  "ax_brd": (item) => {
    const convertComp = item.getComponent("ax_brd:drinkable")
    if(convertComp == undefined) return

    const info = convertComp.customComponentParameters.params as IBrazilianDelightEffects
    return [
      {
        id: info.effect,
        time: info.duration /20,
        amplifier: info.amplifier,
        chance: 1
      }
    ]
  },
  "farmersdelight": (item) => {
    const convertComp = item.getComponent("farmersdelight:consume_effects")
    if(convertComp == undefined) return

    const effectList = convertComp.customComponentParameters.params as IFarmersDelightEffects[]
    const effects: TFoodEffect = []
    for(let i = 0, len = effectList.length; i < len; i++){
      const info = effectList[i]
      if(info == undefined) continue

      effects.push({
        id: info.effect,
        time: info.duration /20,
        amplifier: 1,
        chance: 1
      })
    }
    return effects
  }
}

interface IBrazilianDelightEffects { effect: string, duration: number, amplifier: number }
interface IFarmersDelightEffects { effect: string, duration: number }

function getConvert(item: ItemStack): string | undefined {
  const id = item.typeId.split(":", 1)[0]
  if(id == undefined) return

  const exe = convertByAddon[id]
  return exe && exe(item)
}

const convertByAddon: { [key: string]: (item: ItemStack) => string | undefined } = {
  "ax_brd": (item) => {
    const convertComp = item.getComponent("ax_brd:food_return_item")
    if(convertComp == undefined) return

    return (convertComp.customComponentParameters.params as IBrazilianDelightConvert).item
  }
}

interface IBrazilianDelightConvert { item: string }

export const foodList: { [key: string]: TfoodList } = {
  "minecraft:apple":                  { food: 4,  saturation: 2.4 },
  "minecraft:baked_potato":           { food: 5,  saturation: 6 },
  "minecraft:beetroot":               { food: 1,  saturation: 1.2 },
  "minecraft:beetroot_soup":          { food: 6,  saturation: 7.2 },
  "minecraft:bread":                  { food: 5,  saturation: 6 },
  "minecraft:cake":                   { food: 14, saturation: 2.8 },
  "minecraft:carrot":                 { food: 3,  saturation: 3.6 },
  "minecraft:chorus_fruit":           { food: 4,  saturation: 2.4 }, // Teleporta o player
  "minecraft:cooked_chicken":         { food: 6,  saturation: 7.2 },
  "minecraft:cooked_cod":             { food: 5,  saturation: 6 },
  "minecraft:cooked_mutton":          { food: 6,  saturation: 9.6 },
  "minecraft:cooked_porkchop":        { food: 8,  saturation: 12.8 },
  "minecraft:cooked_rabbit":          { food: 5,  saturation: 6 },
  "minecraft:cooked_salmon":          { food: 6,  saturation: 9.6 },
  "minecraft:cookie":                 { food: 2,  saturation: 0.4 },
  "minecraft:dried_kelp":             { food: 1,  saturation: 0.2 },
  "minecraft:enchanted_golden_apple": { food: 4,  saturation: 9.6, effects: [
    { id: "minecraft:regeneration", time: 30, amplifier: 1, chance: 1 },
    { id: "minecraft:absorption", time: 120, amplifier: 3, chance: 1 },
    { id: "minecraft:resistance", time: 300, amplifier: 0, chance: 1 },
    { id: "minecraft:fire_resistance", time: 300, amplifier: 0, chance: 1 }
  ] },
  "minecraft:glow_berries":           { food: 2,  saturation: 0.4 },
  "minecraft:golden_apple":           { food: 4,  saturation: 9.6, effects: [
    { id: "minecraft:regeneration", time: 5, amplifier: 1, chance: 1 },
    { id: "minecraft:absorption", time: 120, amplifier: 0, chance: 1 }
  ] },
  "minecraft:golden_carrot":          { food: 6,  saturation: 14.4 },
  "minecraft:honey_bottle":           { food: 6,  saturation: 1.2, convert: "minecraft:glass_bottle" }, // Limpa efeito e é convertido pra garrafa vazia
  "minecraft:melon_slice":            { food: 2,  saturation: 1.2 },
  "minecraft:mushroom_stew":          { food: 6,  saturation: 7.2 },
  "minecraft:poisonous_potato":       { food: 2,  saturation: 1.2, effects: [
    {id: "minecraft:poison", time: 5, amplifier: 0, chance: 0.6}
  ] },
  "minecraft:potato":                 { food: 1,  saturation: 0.6 },
  "minecraft:pufferfish":             { food: 1,  saturation: 0.2, effects: [
    { id: "minecraft:poison", time: 60, amplifier: 1, chance: 1 },
    { id: "minecraft:nausea", time: 15, amplifier: 0, chance: 1 },
    { id: "minecraft:hunger", time: 15, amplifier: 2, chance: 1 }
  ] },
  "minecraft:pumpkin_pie":            { food: 8,  saturation: 4.8 },
  "minecraft:rabbit_stew":            { food: 10, saturation: 12 },
  "minecraft:beef":                   { food: 3,  saturation: 1.8 },
  "minecraft:chicken":                { food: 2,  saturation: 1.2, effects: [
    { id: "minecraft:hunger", time: 30, amplifier: 0, chance: 0.3 }
  ] },
  "minecraft:cod":                    { food: 2,  saturation: 0.4 },
  "minecraft:mutton":                 { food: 2,  saturation: 1.2 },
  "minecraft:porkchop":               { food: 3,  saturation: 1.8 },
  "minecraft:rabbit":                 { food: 3,  saturation: 1.8 },
  "minecraft:salmon":                 { food: 2,  saturation: 0.4 },
  "minecraft:rotten_flesh":           { food: 4,  saturation: 0.8, effects: [
    { id: "minecraft:hunger", time: 30, amplifier: 0, chance: 0.8 }
  ] },
  "minecraft:spider_eye":             { food: 2,  saturation: 3.2, effects: [
    {id: "minecraft:poison", time: 5, amplifier: 0, chance: 1}
  ] },
  "minecraft:cooked_beef":            { food: 8,  saturation: 12.8 },
  "minecraft:suspicious_stew":        { food: 6,  saturation: 7.2 },
  "minecraft:sweet_berries":          { food: 2,  saturation: 1.2 },
  "minecraft:tropical_fish":          { food: 1,  saturation: 0.2 }
}



type TfoodList = Omit<IFoodInfo, "type">