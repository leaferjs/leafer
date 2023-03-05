import { IObject } from '@leafer/interface'


export const DataHelper = {

    default<T>(data: T, defaultData: IObject): T {
        assign(defaultData, data)
        assign(data, defaultData)
        return data
    },

    assign(data: IObject, merge: IObject): void {
        let value: unknown
        Object.keys(merge).forEach(key => {
            value = merge[key]
            if (value?.constructor === Object) {
                (data[key]?.constructor === Object) ? assign(data[key], merge[key]) : data[key] = merge[key]
            } else {
                data[key] = merge[key]
            }
        })
    },

    clone(data: unknown): IObject {
        return JSON.parse(JSON.stringify(data))
    }

}

const { assign } = DataHelper