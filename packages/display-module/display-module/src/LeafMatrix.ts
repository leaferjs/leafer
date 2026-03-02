import { ILeafMatrixModule, ILayoutData } from '@leafer/interface'
import { AroundHelper, MatrixHelper } from '@leafer/math'
import { LeafHelper } from '@leafer/helper'


const { setLayout, multiplyParent, translateInner, defaultWorld } = MatrixHelper
const { toPoint, tempPoint } = AroundHelper

export const LeafMatrix: ILeafMatrixModule = {

    __updateWorldMatrix(): void {

        const { parent, __layout, __world, __scrollWorld, __ } = this
        multiplyParent(this.__local || __layout, parent ? (parent.__scrollWorld || parent.__world) : defaultWorld, __world, !!__layout.affectScaleOrRotation, __ as ILayoutData)

        if (__scrollWorld) translateInner(Object.assign(__scrollWorld, __world), __.scrollX, __.scrollY)
        if (__layout.scaleFixed) LeafHelper.updateScaleFixedWorld(this)
    },

    __updateLocalMatrix(): void {

        if (this.__local) {

            const layout = this.__layout, local = this.__local, data = this.__

            if (layout.affectScaleOrRotation) {

                if ((layout.scaleChanged && (layout.resized || (layout.resized = 'scale'))) || layout.rotationChanged) {
                    setLayout(local, data as ILayoutData, null, null, layout.affectRotation)
                    layout.scaleChanged = layout.rotationChanged = undefined
                }

            }

            local.e = data.x + data.offsetX
            local.f = data.y + data.offsetY

            if (data.around || data.origin) {
                toPoint(data.around || data.origin, layout.boxBounds, tempPoint)
                translateInner(local, -tempPoint.x, -tempPoint.y, !data.around)
            }

        }

        this.__layout.matrixChanged = undefined

    }

}


