import { ILeaf, ILeafComputedData } from '../display/ILeaf'
import { IObject } from './IData'

export interface IDataProcessor extends IObject {
    __leaf: ILeaf
    __input: IObject
    __middle: IObject
    __setInput(name: string, value: unknown): void
    __getInput(name: string): unknown
    __setMiddle(name: string, value: unknown): void
    __getMiddle(name: string): unknown
    destroy(): void
}

export interface ILeafData extends IDataProcessor, ILeafComputedData {

}