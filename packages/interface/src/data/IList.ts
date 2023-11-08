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

    add(leaf: ILeaf): void
    addAt(leaf: ILeaf, index: number): void
    addList(list: ILeaf[]): void
    remove(leaf: ILeaf): void

    forEach(itemCallback: ILeafListItemCallback): void
    sort(reverse?: boolean): void
    clone(): ILeafList
    update(): void
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
    addList(list: ILeaf[]): void
    add(leaf: ILeaf): void
    forEach(itemCallback: ILeafListItemCallback): void
    reset(): void
    destroy(): void
}