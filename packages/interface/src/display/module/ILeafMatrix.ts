import { ILeaf } from '../ILeaf'

export type ILeafMatrixModule = ILeafMatrix & ThisType<ILeaf>

export interface ILeafMatrix {
    __updateWorldMatrix?(): void
    __updateLocalMatrix?(): void
}