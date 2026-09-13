import fs from "fs"

fs.rmSync("../1 - BP", {recursive: true, force: true}) 
fs.cp("../0 - Base/Ender Addon Pack (Addon)", "../1 - BP", {recursive: true, errorOnExist: false, force: true}, () => {})
fs.rmSync("../2 - RP", {recursive: true, force: true})
fs.cp("../0 - Base/Ender Addon Pack (Texture)", "../2 - RP", {recursive: true, errorOnExist: false, force: true}, () => {})

console.warn("--------------------------------\nResetado os Arquivos!\n--------------------------------")