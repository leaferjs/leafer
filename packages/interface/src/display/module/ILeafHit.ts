import { IRadiusPointData } from '../../math/IMath'
import { ILeaf } from '../ILeaf'
import { ILeaferCanvas } from '../../canvas/ILeaferCanvas'

export type ILeafHitModule = ILeafHit & ThisType<ILeaf>

export interface ILeafHit {
    __hitWorld?(point: IRadiusPointData): boolean
    __hit?(inner: IRadiusPointData): boolean
    __hitFill?(inner: IRadiusPointData, windingRule?: string): boolean
    __hitStroke?(inner: IRadiusPointData, strokeWidth: number): boolean
    __drawHitPath?(canvas: ILeaferCanvas): void
    __updateHitCanvas?(): void
}