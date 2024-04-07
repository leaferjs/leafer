import { IRadiusPointData } from '../../math/IMath'
import { ILeaf } from '../ILeaf'
import { ILeaferCanvas } from '../../canvas/ILeaferCanvas'

export type ILeafHitModule = ILeafHit & ThisType<ILeaf>

export interface ILeafHit {
    __hitWorld?(point: IRadiusPointData): boolean
    __hit?(inner: IRadiusPointData): boolean
    __hitFill?(inner: IRadiusPointData): boolean
    __hitStroke?(inner: IRadiusPointData, strokeWidth: number): boolean
    __hitPixel(inner: IRadiusPointData): boolean
    __drawHitPath?(canvas: ILeaferCanvas): void
    __updateHitCanvas?(): void
}