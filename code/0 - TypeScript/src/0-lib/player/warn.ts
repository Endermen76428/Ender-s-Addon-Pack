import { MolangVariableMap, Player, RawMessage, system, TitleDisplayOptions, Vector3, world } from "@minecraft/server"

export const apiWarn = new class ApiWarn {
  notify(player: Player, message: TMessage, options?: INotifyOptions): void {
    const type = options && options.type ? options.type : "chat"
    const execute = notifyTypes[type]
    if(execute && message) execute(player, message, options?.subtitle)

    system.runTimeout(() => {
      if(options?.sound) player.playSound(options.sound, {volume: options.volume})
    }, options?.delaySound)

    system.runTimeout(() => {
      if(options?.particle){
        const dimension = options.particle.dimension ? world.getDimension(options.particle.dimension) : player.dimension
        try{ dimension.spawnParticle(options.particle.id, options.particle.pos, options.particle.map) } catch {}
      }
    }, options?.delayParticle)
  }

  playSound(player: Player, sound: string, options?: ISoundOptions): void {
    system.runTimeout(() => {
      player.playSound(sound, {volume: options?.volume ?? 1, location: options?.location})
    }, options?.delaySound)
  }
}

const notifyTypes: { [key: string]: (player: Player, message: TMessage, subtitle?: TitleDisplayOptions) => void } = {
  "chat"(player, message){ player.sendMessage(typeof message == "string" ? {translate: message} : message) },

  "actionbar"(player, message){ player.onScreenDisplay.setActionBar(typeof message == "string" ? {translate: message} : message) },

  "title"(player, message, subtitle){ player.onScreenDisplay.setTitle(typeof message == "string" ? {translate: message} : message, subtitle) }
}

type TMessage = string | RawMessage

interface INotifyOptions extends ISoundOptions {
  type?: "chat" | "actionbar" | "title"
  sound?: string
  particle?: { id: string, pos: Vector3, dimension?: string, map?: MolangVariableMap }
  delayParticle?: number
  subtitle?: TitleDisplayOptions
}

interface ISoundOptions {
  volume?: number
  delaySound?: number
  location?: Vector3
}