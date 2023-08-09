import { IPlugin, IObject, ILeafer } from '@leafer/interface'
import { Debug } from '@leafer/debug'


const debug = Debug.get('plugin')

export const PluginManager = {
    power: {} as IObject,
    list: [] as IPlugin[],
    onLeafer(leafer: ILeafer): void {
        PluginManager.list.forEach(plugin => {
            if (plugin.onLeafer) plugin.onLeafer(leafer)
        })
    }
}

export function usePlugin(plugin: IPlugin, config?: IObject) {

    const { power } = PluginManager
    const clonePlugin = { ...plugin }
    PluginManager.list.push(clonePlugin)

    const realParams: IObject = {}

    if (clonePlugin.import) {
        clonePlugin.import.forEach(item => {
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
        clonePlugin.run(realParams, config)
    } catch (e) {
        debug.error(e)
    }

}