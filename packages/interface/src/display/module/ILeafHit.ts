import { IRadiusPointData } from '../../math/IMath'
import { ILeaf } from '../ILeaf'

export type ILeafHitModule = ILeafHit & ThisType<ILeaf>

export interface ILeafHit {
    __hitWorld?(point: IRadiusPointData): boolean
    __hit?(local: IRadiusPointData): boolean
    __updateHitCanvas?(): void
}