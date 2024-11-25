import { ILeaf, ILeafComputedData } from '../display/ILeaf'
import { IJSONOptions } from '../file/IExport'
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
    __getInputData(names?: string[] | IObject, options?: IJSONOptions): IObject

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
    readonly __hasMultiPaint?: boolean // fill 、stroke 、shadow 等同时存在两次以上外观绘制的情况
    __checkSingle(): void
    __removeNaturalSize(): void
}