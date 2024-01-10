import { ILeafHitModule, IRadiusPointData } from '@leafer/interface'
import { PointHelper, BoundsHelper } from '@leafer/math'


const { toInnerRadiusPointOf, copy, setRadius } = PointHelper
const inner = {} as IRadiusPointData

export const LeafHit: ILeafHitModule = {

    __hitWorld(point: IRadiusPointData): boolean {
        if (this.__layout.hitCanvasChanged || !this.__hitCanvas) {
            this.__updateHitCanvas()
            this.__layout.hitCanvasChanged = false
        }

        if (this.__.hitRadius) {
            copy(inner, point), point = inner
            setRadius(point, this.__.hitRadius)
        }

        toInnerRadiusPointOf(point, this.__world, inner)

        if (this.__.hitBox) {
            if (BoundsHelper.hitRadiusPoint(this.__layout.boxBounds, inner)) return true
        }

        return this.__hit(inner)
    }

}
