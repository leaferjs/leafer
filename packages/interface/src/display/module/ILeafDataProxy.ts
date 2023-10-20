import { ILeaf } from '../ILeaf'
import { __Value } from '../../data/IData'

export type ILeafDataProxyModule = ILeafDataProxy & ThisType<ILeaf>

export interface ILeafDataProxy {
    __setAttr?(name: string, newValue: __Value): void
    __getAttr?(name: string): __Value
    setProxyAttr?(name: string, newValue: __Value): void
    getProxyAttr?(name: string): __Value
}

