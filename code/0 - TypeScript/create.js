import fs from "fs"
import path from "path"
import { parse } from "jsonc-parser"

const rootPath = "../0 - Addons"
const rootAddons = fs.readdirSync(rootPath)

const defaultItemCatalog = {"format_version":"1.21.60","minecraft:crafting_items_catalog":{"categories":[]}}
const defaultBlocksJson = {"format_version":"1.21.40"}
const defaultSoundsJson = {"entity_sounds":{"entities":{}}}
const defaultSoundsDefinition = {"format_version":"1.21.60","sound_definitions":{"warn.ender_addon_pack:levelup":{"category":"warn","max_distance":8,"min_distance":0,"sounds":[{"name":"sounds/random/levelup","is3D":false}],"subtitle":"subtitles.warn.ender_addon_pack:confirmed"},"warn.ender_addon_pack:bass":{"category":"warn","max_distance":8,"min_distance":0,"sounds":[{"name":"sounds/note/bass","is3D":false}],"subtitle":"subtitles.warn.ender_addon_pack:rejected"},"warn.ender_addon_pack:break":{"category":"warn","max_distance":8,"min_distance":0,"sounds":[{"name":"sounds/random/break","is3D":false}],"subtitle":"subtitles.warn.ender_addon_pack:canceled"},"warn.ender_addon_pack:pop":{"category":"warn","max_distance":8,"min_distance":0,"sounds":[{"name":"sounds/random/pop","is3D":false}],"subtitle":"subtitles.warn.ender_addon_pack:pop"},"warn.ender_addon_pack:orb":{"category":"warn","max_distance":8,"min_distance":0,"sounds":[{"name":"sounds/random/orb","is3D":false}],"subtitle":"subtitles.warn.ender_addon_pack:ping"},"warn.ender_addon_pack:break_amethyst":{"category":"warn","max_distance":8,"min_distance":0,"sounds":[{"name":"sounds/block/amethyst/break1","is3D":false},{"name":"sounds/block/amethyst/break2","is3D":false},{"name":"sounds/block/amethyst/break3","is3D":false},{"name":"sounds/block/amethyst/break4","is3D":false}],"subtitle":"subtitles.warn.ender_addon_pack:saved"},"warn.ender_addon_pack:enchanting_table":{"category":"warn","max_distance":8,"min_distance":0,"sounds":[{"name":"sounds/block/enchanting_table/enchant1","is3D":false},{"name":"sounds/block/enchanting_table/enchant2","is3D":false},{"name":"sounds/block/enchanting_table/enchant3","is3D":false}],"subtitle":"subtitles.warn.ender_addon_pack:activate"},"warn.ender_addon_pack:deactive":{"category":"warn","max_distance":8,"min_distance":0,"sounds":[{"name":"sounds/block/beacon/deactivate","is3D":false,"pitch":0.95},{"name":"sounds/block/beacon/deactivate","is3D":false,"pitch":1.0},{"name":"sounds/block/beacon/deactivate","is3D":false,"pitch":1.05}],"subtitle":"subtitles.warn.ender_addon_pack:deactiveted"}}}
const defaultMaterial = {"materials":{"version":"1.0.0"}}
const defaultItemTexture = {"resource_pack_name":"Ender's Addon Pack","texture_name":"atlas.items","texture_data":{}}
const defaultTerrainTexture = {"resource_pack_name":"Ender's Addon Pack","texture_name":"atlas.terrain","padding":8,"num_mip_levels":4,"texture_data":{}}
const defaultUiDefsDefinition = {"ui_defs":[]}
const texts = {
  "en_US.lang": "pack.description=§5Endermen76428§r don't write descriptions.",
  "pt_BR.lang": "pack.description=§5Endermen76428§r não escreveu a descrição."
}

const addonFunctions = {
  "blocks": (fullPath) => {
    const currentPath = path.join(fullPath, "blocks")
    copyFolder(currentPath, "../1 - BP/blocks")
  },

  "entities": (fullPath) => {
    const currentPath = path.join(fullPath, "entities")
    copyFolder(currentPath, "../1 - BP/entities")
  },

  "features": (fullPath) => {
    const currentPath = path.join(fullPath, "features")
    copyFolder(currentPath, "../1 - BP/features")
  },

  "feature_rules": (fullPath) => {
    const currentPath = path.join(fullPath, "feature_rules")
    copyFolder(currentPath, "../1 - BP/feature_rules")
  },

  "functions": (fullPath) => {
    const currentPath = path.join(fullPath, "functions")
    copyFolder(currentPath, "../1 - BP/functions")
  },

  "items": (fullPath) => {
    const currentPath = path.join(fullPath, "items")
    copyFolder(currentPath, "../1 - BP/items")
  },

  "item_catalog": (fullPath) => {
    const currentPath = path.join(fullPath, "item_catalog", "crafting_item_catalog.json")

    const raw = fs.readFileSync(currentPath, "utf8")
    const json = JSON.parse(raw)

    const currentList = json["minecraft:crafting_items_catalog"]["categories"]
    const list = defaultItemCatalog["minecraft:crafting_items_catalog"]["categories"]
    for(const item of currentList) list.push(item)
  },

  "loot_tables": (fullPath) => {
    const currentPath = path.join(fullPath, "loot_tables")
    copyFolder(currentPath, "../1 - BP/loot_tables")
  },

  "recipes": (fullPath) => {
    const currentPath = path.join(fullPath, "recipes")
    copyFolder(currentPath, "../1 - BP/recipes")
  },

  // "scripts": (fullPath) => {
  //   const currentPath = path.join(fullPath, "scripts")
  //   copyFolder(currentPath, "../1 - BP/scripts/ender_addon_pack")
  // },

  "structures": (fullPath) => {
    const currentPath = path.join(fullPath, "structures")
    copyFolder(currentPath, "../1 - BP/structures")
  }
}

const textureFunctions = {
  "animations": (fullPath) => {
    const currentPath = path.join(fullPath, "animations")
    copyFolder(currentPath, "../2 - RP/animations")
  },

  "animation_controllers": (fullPath) => {
    const currentPath = path.join(fullPath, "animation_controllers")
    copyFolder(currentPath, "../2 - RP/animation_controllers")
  },

  "block_culling": (fullPath) => {
    const currentPath = path.join(fullPath, "block_culling")
    copyFolder(currentPath, "../2 - RP/block_culling")
  },

  "blocks.json": (fullPath) => {
    const currentPath = path.join(fullPath, "blocks.json")

    const raw = fs.readFileSync(currentPath, "utf8")
    const json = parse(raw)

    const blocks = Object.entries(json)
    for(let i = 0, len = blocks.length; i < len; i++){
      const [ key, value ] = blocks[i]
      // console.warn(keys, values)
      if(!key || !value) continue

      defaultBlocksJson[key] = value
    }
  },

  "entity": (fullPath) => {
    const currentPath = path.join(fullPath, "entity")
    copyFolder(currentPath, "../2 - RP/entity")
  },

  "font": (fullPath) => {
    const currentPath = path.join(fullPath, "font")
    copyFolder(currentPath, "../2 - RP/font")
  },

  "materials": (fullPath) => {
    const currentPath = path.join(fullPath, "materials", "entity.material")
    const raw = fs.readFileSync(currentPath, "utf8")
    const json = parse(raw)["materials"]

    const currentMaterial = defaultMaterial["materials"]
    const materials = Object.entries(json)
    for(let i = 0, len = materials.length; i < len; i++){
      const [ key, value ] = materials[i]
      // console.warn(keys, values)
      if(!key || key == "version" || !value) continue

      currentMaterial[key] = value
    }
  },

  "models": (fullPath) => {
    const currentPath = path.join(fullPath, "models")
    copyFolder(currentPath, "../2 - RP/models")
  },

  "particles": (fullPath) => {
    const currentPath = path.join(fullPath, "particles")
    copyFolder(currentPath, "../2 - RP/particles")
  },

  "render_controllers": (fullPath) => {
    const currentPath = path.join(fullPath, "render_controllers")
    copyFolder(currentPath, "../2 - RP/render_controllers")
  },

  "sounds": (fullPath) => {
    const currentPath = path.join(fullPath, "sounds")
    const files = fs.readdirSync(currentPath)

    const data = defaultSoundsDefinition["sound_definitions"]

    for(let i = 0, len = files.length; i < len; i++){
      const file = files[i]
      if(!file) continue

      if(!file.endsWith(".json")){
        copyFolder(currentPath, "../2 - RP/sounds")
        continue
      }

      const filePath = path.join(currentPath, file)

      const raw = fs.readFileSync(filePath, "utf-8")
      const json = parse(raw)["sound_definitions"]
      const items = Object.entries(json)

      for(let i2 = 0, len2 = items.length; i2 < len2; i2++){
        const [key, value] = items[i2]
        if(!key || !value) continue

        if(json[key]["category"] == "warn") continue

        data[key] = value
      }
    }
  },

  "sounds.json": (fullPath) => {
    // No meu só tem o entities, mas tem muito mais outros, olha no minecraft samples
    const currentPath = path.join(fullPath, "sounds.json")

    const raw = fs.readFileSync(currentPath, "utf8")
    const json = parse(raw)["entity_sounds"]["entities"]

    const entitySounds = defaultSoundsJson["entity_sounds"]["entities"]

    const sounds = Object.entries(json)
    for(let i = 0, len = sounds.length; i < len; i++){
      const [ key, value ] = sounds[i]
      // console.warn(keys, values)
      if(!key || !value) continue

      entitySounds[key] = value
    }
  },

  "texts": (fullPath) => {
    const currentPath = path.join(fullPath, "texts")
    const files = fs.readdirSync(currentPath)
    for(const file of files){
      if(file.endsWith(".json")) continue
      const content = fs.readFileSync(path.join(currentPath, file)).toString("utf-8")
      const sliceIndex = content.indexOf("pack.description=")

      texts[file] += "\n\n\n\n" + (sliceIndex != -1 ? content.slice(0, sliceIndex) : content)
    }
    // texts.push(content)
    // copyFolder(currentPath, "../2 - RP/texts")
  },

  "textures": (fullPath) => {
    const currentPath = path.join(fullPath, "textures")
    const files = fs.readdirSync(currentPath)

    for(let i = 0, len = files.length; i < len; i++){
      const file = files[i]
      if(!file) continue

      const filePath = path.join(currentPath, file)

      if(!file.endsWith(".json")){
        if(file.endsWith(".png")){
          copyFolder(filePath, path.join("../2 - RP/textures", file))
        } else {
          copyFolder(currentPath, "../2 - RP/textures")
        }
        continue
      }

      if(file == "texture_list.json"){
        console.warn("Texture List Criar")
        continue
      }

      const raw = fs.readFileSync(filePath, "utf-8")
      const json = parse(raw)["texture_data"]
      const items = Object.entries(json)

      const data = file.startsWith("item") ? defaultItemTexture["texture_data"] : defaultTerrainTexture["texture_data"]

      for(let i2 = 0, len2 = items.length; i2 < len2; i2++){
        const [key, value] = items[i2]
        if(!key || !value) continue

        data[key] = value
      }
    }
  },

  "ui": (fullPath) => {
    const currentPath = path.join(fullPath, "ui")
    const files = fs.readdirSync(currentPath)

    const data = defaultUiDefsDefinition["ui_defs"]

    for(let i = 0, len = files.length; i < len; i++){
      const file = files[i]
      if(!file) continue

      // Tem que fazer ele entrar dentro de cada arquivo da pasta root
      // Para procurar por algum que tenha o modification e juntar, se não só copia normal ou as outras funções daquele arquivo
      // os que tão dentro de pasta pode ignorar
      if(file != "_ui_defs.json"){
        copyFolder(currentPath, "../2 - RP/ui")
        continue
      }

      const filePath = path.join(currentPath, file)

      const raw = fs.readFileSync(filePath, "utf-8")
      const json = parse(raw)["ui_defs"]

      data.push(...json)
    }
  }
}

for(let i = 0, len = rootAddons.length; i < len; i++){
  const folder = rootAddons[i]
  if(!folder) continue

  const currentPath = path.join(rootPath, folder)
  const stats = fs.statSync(currentPath)
  if(!stats.isDirectory()) continue

  console.warn("------------------------------\nMerging:", folder)
  const foldersBpRp = fs.readdirSync(currentPath)

  const addonFolder = foldersBpRp.find(value => value.endsWith(" (Addon)"))
  const textureFolder = foldersBpRp.find(value => value.endsWith(" (Texture)"))
  if(!addonFolder || !textureFolder){ throw new Error("ERROR> Pasta do Addon ou Textura não encontrado") }
  console.warn("Addon:", addonFolder, "| Texture:", textureFolder)

  const addonPath = path.join(currentPath, addonFolder)
  const addonFiles = fs.readdirSync(addonPath)

  for(let i2 = 0, len2 = addonFiles.length; i2 < len2; i2++){
    const folderType = addonFiles[i2]
    if(!folderType) continue

    const addonExe = addonFunctions[folderType]
    if(addonExe) addonExe(addonPath)
  }

  const texturePath = path.join(currentPath, textureFolder)
  const textureFiles = fs.readdirSync(texturePath)

  for(let i2 = 0, len2 = textureFiles.length; i2 < len2; i2++){
    const folderType = textureFiles[i2]
    if(!folderType) continue

    const textureExe = textureFunctions[folderType]
    if(textureExe) textureExe(texturePath)
  }

  // console.log("Name:", name.padEnd(23, "-"), "| Addon:", addonFiles.length.toString().padEnd(2, " "), "| Texture:", texureFiles.length.toString())
}

fs.writeFileSync("../1 - BP/item_catalog/crafting_item_catalog.json", JSON.stringify(defaultItemCatalog), "utf8");
fs.writeFileSync("../2 - RP/blocks.json", JSON.stringify(defaultBlocksJson), "utf8");
fs.writeFileSync("../2 - RP/sounds.json", JSON.stringify(defaultSoundsJson), "utf8");
fs.writeFileSync("../2 - RP/sounds/sound_definitions.json", JSON.stringify(defaultSoundsDefinition), "utf8");
fs.writeFileSync("../2 - RP/materials/entity.material", JSON.stringify(defaultMaterial), "utf8");
fs.writeFileSync("../2 - RP/textures/item_texture.json", JSON.stringify(defaultItemTexture), "utf8");
fs.writeFileSync("../2 - RP/textures/terrain_texture.json", JSON.stringify(defaultTerrainTexture), "utf8");
fs.writeFileSync("../2 - RP/ui/_ui_defs.json", JSON.stringify(defaultUiDefsDefinition), "utf8");
fs.writeFileSync("../2 - RP/texts/en_US.lang", texts["en_US.lang"], "utf8");
fs.writeFileSync("../2 - RP/texts/pt_BR.lang", texts["pt_BR.lang"], "utf8");

console.warn("------------------------------\nFinalizado a junção de todos os addons.")

function copyFolder(origin, destination){
  fs.cpSync(origin, destination, {recursive: true, errorOnExist: false, force: true})
}