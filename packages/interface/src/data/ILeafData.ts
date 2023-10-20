import { ILeaf, ILeafComputedData } from '../display/ILeaf'
import { IObject } from './IData'

export interface IDataProcessor extends IObject {
    __leaf: ILeaf
    __input: IObject
    __middle: IObject

    __single: boolean
    __checkSingle(): void

    __get(name: string): any

    __setInput(name: string, value: any): void
    __getInput(name: string): any
    __removeInput(name: string): void
    __getInputData(options?: ILeafDataOptions): IObject

    __setMiddle(name: string, value: any): void
    __getMiddle(name: string): any

    destroy(): void
}

export interface ILeafDataOptions {
    attrs?: 'all' | string[]
    children?: boolean
}

export interface ILeafData extends IDataProcessor, ILeafComputedData {

}