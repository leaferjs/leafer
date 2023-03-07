import { IPlugin, IObject } from '@leafer/interface'
import { Debug } from '@leafer/debug'


const debug = Debug.get('plugin')

export const Plugin = {
    list: [] as IPlugin[]
}

export function usePlugin(plugin: IPlugin, params?: IObject) {

    Plugin.list.push(plugin)
    if (plugin.dependencies) {
        const realParams: IObject = {}
        plugin.dependencies.forEach(item => {
            if (params[item]) {
                realParams[item] = params[item]
            } else {
                debug.error(item + ' non-existent')
            }
        })
        plugin.run(realParams)
    } else {
        debug.error('no dependencies')
    }

}