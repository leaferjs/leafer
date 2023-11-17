import { ILeafMatrixModule, ILayoutData } from '@leafer/interface'
import { AroundHelper, MatrixHelper } from '@leafer/math'


const { setLayout, multiplyParent, translateInner, defaultWorld } = MatrixHelper
const { toPoint, tempPoint } = AroundHelper

export const LeafMatrix: ILeafMatrixModule = {

    __updateWorldMatrix(): void {

        multiplyParent(this.__local || this.__layout, this.parent ? this.parent.__world : defaultWorld, this.__world, !!this.__layout.affectScaleOrRotation, this.__ as ILayoutData)

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

            local.e = data.x
            local.f = data.y

            if (data.around) {
                toPoint(data.around, layout.boxBounds, tempPoint)
                translateInner(local, -tempPoint.x, -tempPoint.y)
            }

        }

        this.__layout.matrixChanged = false

    }

}


