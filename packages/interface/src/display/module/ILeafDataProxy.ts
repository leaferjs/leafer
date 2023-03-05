import { ILeaf } from '../ILeaf'
import { __Value } from '../../data/IData'

export type ILeafDataProxyModule = ILeafDataProxy & ThisType<ILeaf>

export interface ILeafDataProxy {
    __set?(attrName: string, newValue: __Value): void
    __get?(attrName: string): __Value
    __updateAttr?(attrName: string): void
}

