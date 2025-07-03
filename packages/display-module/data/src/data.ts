import { IObject } from '@leafer/interface'

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

export function isString<T extends string>(value: any): value is T {
    return typeof value === 'string'
}

export const { isArray } = Array

export function isObject<T extends object>(value: any): value is T {
    return value && typeof value === 'object' // fix: null is object
}

export function isData<T extends object>(value: any): value is T { // 检测 {} 对象
    return isObject(value) && !isArray(value) // 排除数组
}

export function isEmptyData(value: any): boolean {
    return JSON.stringify(value) === '{}'
}