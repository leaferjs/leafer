import { IRadiusPointData } from '../../math/IMath'
import { ILeaf } from '../ILeaf'
import { ILeaferCanvas } from '../../canvas/ILeaferCanvas'

export type ILeafHitModule = ILeafHit & ThisType<ILeaf>

export interface ILeafHit {
    __hitWorld?(point: IRadiusPointData): boolean
    __hit?(local: IRadiusPointData): boolean
    __drawHitPath?(canvas: ILeaferCanvas): void
    __updateHitCanvas?(): void
}