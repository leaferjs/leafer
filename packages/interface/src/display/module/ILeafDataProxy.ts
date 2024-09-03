import { ILeaf } from '../ILeaf'
import { IValue } from '../../data/IData'

export type ILeafDataProxyModule = ILeafDataProxy & ThisType<ILeaf>

export interface ILeafDataProxy {
    __setAttr?(name: string, newValue: IValue): boolean
    __getAttr?(name: string): IValue
    __realSetAttr?(name: string, newValue: IValue): void
    setProxyAttr?(name: string, newValue: IValue): void
    getProxyAttr?(name: string): IValue
}

