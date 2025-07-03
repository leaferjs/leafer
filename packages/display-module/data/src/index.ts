import { IObject } from '@leafer/interface'

export { DataHelper } from './DataHelper'
export { LeafData } from './LeafData'

export enum Answer {
    No = 0,
    Yes = 1,
    NoAndSkip = 2,
    YesAndSkip = 3
}

export const emptyData: IObject = {}

export function isNull(value: any): boolean {
    return value === undefined || value === null
}

export const { isArray } = Array

export function isObject<T extends object>(value: any): value is T { // 检测 {} 对象
    return value && typeof value === 'object' && !isArray(value) // fix: null is object
}

export function isEmptyData(value: any): boolean {
    return JSON.stringify(value) === '{}'
}