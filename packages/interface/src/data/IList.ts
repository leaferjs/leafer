import { ILeaf } from '../display/ILeaf'
import { INumberMap } from './IData'

export interface ILeafMap {
    [name: string]: ILeaf
}

export interface ILeafArrayMap {
    [name: string]: ILeaf[]
}

export type ILeafListItemCallback = (item: ILeaf, index?: number) => void

export interface ILeafList {
    list: ILeaf[]
    keys: INumberMap
    readonly length: number
    has(leaf: ILeaf): boolean
    indexAt(index: number): ILeaf
    indexOf(leaf: ILeaf): number
    unshift(leaf: ILeaf): void
    pushList(list: ILeaf[]): void
    push(leaf: ILeaf): void
    sort(reverse?: boolean): void
    remove(leaf: ILeaf): void
    forEach(itemCallback: ILeafListItemCallback): void
    clone(): ILeafList
    reset(): void
    destroy(): void
}

export interface ILeafLevelList {
    levelMap: ILeafArrayMap
    keys: INumberMap
    levels: number[]
    readonly length: number
    has(leaf: ILeaf): boolean
    without(leaf: ILeaf): boolean
    sort(reverse?: boolean): void
    pushList(list: ILeaf[]): void
    push(leaf: ILeaf): void
    forEach(itemCallback: ILeafListItemCallback): void
    reset(): void
    destroy(): void
}