import { ILeafMatrixModule, ILayoutData, IScrollPointData } from '@leafer/interface'
import { AroundHelper, MatrixHelper } from '@leafer/math'


const { setLayout, multiplyParent, translateInner, defaultWorld } = MatrixHelper
const { toPoint, tempPoint } = AroundHelper

export const LeafMatrix: ILeafMatrixModule = {

    __updateWorldMatrix(): void {

        multiplyParent(this.__local || this.__layout, this.parent ? this.parent.__world : defaultWorld, this.__world, !!this.__layout.affectScaleOrRotation, this.__ as ILayoutData, this.parent && this.parent.__ as IScrollPointData)

    },

    __updateLocalMatrix(): void {

        if (this.__local) {

            const layout = this.__layout, local = this.__local, data = this.__

            if (layout.affectScaleOrRotation) {

                if (layout.scaleChanged || layout.rotationChanged) {
                    setLayout(local, data as ILayoutData, null, layout.affectRotation)
                    layout.scaleChanged = layout.rotationChanged = false
                }

            }

            local.e = data.x + data.offsetX
            local.f = data.y + data.offsetY

            if (data.around || data.origin) {
                toPoint(data.around || data.origin, layout.boxBounds, tempPoint)
                translateInner(local, -tempPoint.x, -tempPoint.y, data.origin as unknown as boolean)
            }

        }

        this.__layout.matrixChanged = false

    }

}


