import { IObject, IFunction } from '@leafer/interface'
import { Debug } from '@leafer/debug'
import { getDescriptor, getNames } from './object'

interface IRewriteItem {
    name: string
    run: IFunction
}

const debug = new Debug('rewrite')

const list: IRewriteItem[] = []
const excludeNames = ['destroy', 'constructor']


// method

export function rewrite(method: IFunction) {
    return (target: IObject, key: string) => {
        list.push({ name: target.constructor.name + '.' + key, run: () => { target[key] = method } })
    }
}

export function rewriteAble() {
    return (target: IObject) => {
        doRewrite()
    }
}

function doRewrite(error?: boolean): void {
    if (list.length) {
        list.forEach(item => {
            if (error) debug.error(item.name, '需在Class上装饰@rewriteAble()')
            item.run()
        })
        list.length = 0
    }
}

setTimeout(() => doRewrite(true))


// class

export function useModule(child: IObject) {
    return (target: IObject) => {
        const names = child.prototype ? getNames(child.prototype) : Object.keys(child)
        names.forEach(name => {
            if (!excludeNames.includes(name)) {
                if (child.prototype) {
                    const d = getDescriptor(child.prototype, name)
                    if (d.writable) target.prototype[name] = child.prototype[name]
                } else {
                    target.prototype[name] = child[name]
                }
            }
        })
    }
}