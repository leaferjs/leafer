import { ILeaf, ILeafComputedData } from '../display/ILeaf'
import { IObject } from './IData'

export interface IDataProcessor {
    __leaf: ILeaf
    __input: IObject
    __middle: IObject

    __get(name: string): any
    __getData(): IObject

    __setInput(name: string, value: any): void
    __getInput(name: string): any
    __removeInput(name: string): void
    __getInputData(): IObject

    __setMiddle(name: string, value: any): void
    __getMiddle(name: string): any

    destroy(): void
}

export interface ILeafDataOptions {
    attrs?: 'all' | string[]
    children?: boolean
}

export interface ILeafData extends IDataProcessor, ILeafComputedData {
    __single?: boolean
    __checkSingle(): void
    __removeNaturalSize(): void
}