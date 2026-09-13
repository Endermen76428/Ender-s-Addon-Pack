import { world } from "@minecraft/server"

export const stringFormat = new class StringFormat {
  sameNames(name: string, waypoints: string[], excludeAt?: number): string {
    if(excludeAt) waypoints.splice(excludeAt, 1)

    let newName = name
    let counter = 1

    while(waypoints.includes(newName)){
      newName = `${name} (${counter})`
      counter++
    }

    return newName
  }
}