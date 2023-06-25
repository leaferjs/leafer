import { IObject } from '@leafer/interface'


export const DataHelper = {

    default<T>(t: T, defaultData: IObject): T {
        assign(defaultData, t)
        assign(t, defaultData)
        return t
    },

    assign(t: IObject, merge: IObject): void {
        let value: unknown
        Object.keys(merge).forEach(key => {
            value = merge[key]
            if (value?.constructor === Object) {
                (t[key]?.constructor === Object) ? assign(t[key], merge[key]) : t[key] = merge[key]
            } else {
                t[key] = merge[key]
            }
        })
    },

    copyAttrs(t: IObject, from: IObject, include: string[]): IObject {
        include.forEach(key => {
            if (from[key] !== undefined) t[key] = from[key]
        })
        return t
    },

    clone(data: unknown): IObject {
        return JSON.parse(JSON.stringify(data))
    }

}

const { assign } = DataHelper