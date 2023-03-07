import { ILeafHitModule, IRadiusPointData } from '@leafer/interface'
import { PointHelper } from '@leafer/math'


const { toLocalRadiusPoint } = PointHelper
const innerPoint = {} as IRadiusPointData

export const LeafHit: ILeafHitModule = {

    __updateHitCanvas(): void {
        if (!this.__hitCanvas) this.__hitCanvas = this.leafer.hitCanvasManager.getPathType(this)
        this.__drawRenderPath(this.__hitCanvas)
    },

    __hitWorld(point: IRadiusPointData): boolean {
        if (this.__layout.hitCanvasChanged) {
            this.__updateHitCanvas()
            this.__layout.hitCanvasChanged = false
        }
        toLocalRadiusPoint(point, this.__world, innerPoint)
        return this.__hit(innerPoint)
    }

}
