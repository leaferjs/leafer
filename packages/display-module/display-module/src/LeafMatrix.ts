import { IBoundsData, ILeafMatrixModule, IOrientPointData } from '@leafer/interface'
import { AroundHelper, MatrixHelper } from '@leafer/math'


const { setLayout, multiplyParent, translateInner, defaultWorld } = MatrixHelper
const { toPoint, tempPoint } = AroundHelper

export const LeafMatrix: ILeafMatrixModule = {

    __updateWorldMatrix(): void {

        if (this.__layout.matrixChanged) this.__updateLocalMatrix()

        multiplyParent(this.__local, this.parent ? this.parent.__world : defaultWorld, this.__world, this.__layout.affectScaleOrRotation, this.__ as IOrientPointData)
    },

    __updateLocalMatrix(): void {

        const layout = this.__layout, local = this.__local, data = this.__

        if (layout.affectScaleOrRotation) {

            if (layout.scaleChanged || layout.rotationChanged) {

                setLayout(local, data as IOrientPointData, null, layout.affectRotation)
                layout.scaleChanged = layout.rotationChanged = false

            }

        }

        local.e = data.x
        local.f = data.y

        if (data.around) {
            toPoint(data.around, data as IBoundsData, tempPoint, true)
            translateInner(local, -tempPoint.x, -tempPoint.y)
        }

        layout.matrixChanged = false
    }


}


