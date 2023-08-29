import { ILeafHitModule, IRadiusPointData, ILeaferCanvas } from '@leafer/interface'
import { PointHelper } from '@leafer/math'


const { toInnerRadiusPointOf } = PointHelper
const inner = {} as IRadiusPointData

export const LeafHit: ILeafHitModule = {

    __hitWorld(point: IRadiusPointData): boolean {
        if (this.__layout.hitCanvasChanged || !this.__hitCanvas) {
            this.__updateHitCanvas()
            this.__layout.hitCanvasChanged = false
        }
        toInnerRadiusPointOf(point, this.__world, inner)
        return this.__hit(inner)
    },

    __drawHitPath(canvas: ILeaferCanvas): void {
        this.__drawRenderPath(canvas)
    }

}
