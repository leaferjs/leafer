import { IBooleanMap, IObject } from '@leafer/interface'
import { isUndefined } from './data'

export const DataHelper = {

    default<T>(t: T, defaultData: IObject): T {
        assign(defaultData, t)
        assign(t, defaultData)
        return t
    },

    assign(t: IObject, merge: IObject, exclude?: IObject): void {
        let value: unknown
        Object.keys(merge).forEach(key => {
            value = merge[key]
            if (value?.constructor === Object && t[key]?.constructor === Object) return assign(t[key], merge[key], exclude && exclude[key])
            if (exclude && (key in exclude)) {
                if (exclude[key]?.constructor === Object) assign(t[key] = {}, merge[key], exclude[key])
                return
            }
            t[key] = merge[key]
        })
    },

    copyAttrs(t: IObject, from: IObject, include: string[]): IObject {
        include.forEach(key => {
            if (!isUndefined(from[key])) t[key] = from[key]
        })
        return t
    },

    clone(data: unknown): IObject {
        return JSON.parse(JSON.stringify(data))
    },

    toMap(list: string[]): IBooleanMap {
        const map = {} as IBooleanMap
        for (let i = 0, len = list.length; i < len; i++)  map[list[i]] = true
        return map
    },

    stintSet<T extends object, K extends keyof T>(data: T, attrName: K, value: T[K]): void {
        value || (value = undefined)
        data[attrName] !== value && (data[attrName] = value) // 只有值不一样时才设置，节省内存开销
    }

}

const { assign } = DataHelper