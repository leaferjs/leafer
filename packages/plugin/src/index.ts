import { IPlugin, IObject } from '@leafer/interface'
import { Debug } from '@leafer/debug'


const debug = Debug.get('plugin')

export const Plugin = {
    powers: {} as IObject,
    list: [] as IPlugin[]
}

export function usePlugin(plugin: IPlugin) {

    Plugin.list.push(plugin)
    if (plugin.import) {
        const realParams: IObject = {}
        plugin.import.forEach(item => {
            if (Plugin.powers[item]) {
                realParams[item] = Plugin.powers[item]
            } else {
                debug.error(item + ' non-existent')
            }
        })
        plugin.run(realParams)
    } else {
        debug.error('no dependencies')
    }

}