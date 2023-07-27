import { IPlugin, IObject } from '@leafer/interface'
import { Debug } from '@leafer/debug'


const debug = Debug.get('plugin')

export const PluginManager = {
    power: {} as IObject,
    list: [] as IPlugin[]
}

export function usePlugin(plugin: IPlugin, config?: IObject) {

    const { power } = PluginManager
    PluginManager.list.push(plugin)

    const realParams: IObject = {}

    if (plugin.import) {
        plugin.import.forEach(item => {
            if (power[item]) {
                realParams[item] = power[item]
            } else {
                debug.error(item + ' non-existent')
            }
        })
    } else {
        debug.warn('no import')
    }

    try {
        plugin.run(realParams, config)
    } catch (e) {
        debug.error(e)
    }

}