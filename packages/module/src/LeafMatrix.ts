import { ILeafMatrixModule } from '@leafer/interface'

import { OneRadian, MatrixHelper } from '@leafer/math'


const { defaultMatrix } = MatrixHelper
const { sin, cos } = Math

export const LeafMatrix: ILeafMatrixModule = {

    __updateWorldMatrix(): void {

        const pw = this.parent ? this.parent.__world : defaultMatrix
        const r = this.__relative
        const w = this.__world

        if (this.__layout.matrixChanged) this.__updateRelativeMatrix()

        if (this.__layout.affectScaleOrRotation) {
            w.a = r.a * pw.a + r.b * pw.c
            w.b = r.a * pw.b + r.b * pw.d
            w.c = r.c * pw.a + r.d * pw.c
            w.d = r.c * pw.b + r.d * pw.d
            w.e = r.e * pw.a + r.f * pw.c + pw.e
            w.f = r.e * pw.b + r.f * pw.d + pw.f
        } else {
            w.a = pw.a
            w.b = pw.b
            w.c = pw.c
            w.d = pw.d
            w.e = r.e * pw.a + r.f * pw.c + pw.e
            w.f = r.e * pw.b + r.f * pw.d + pw.f
        }
    },

    __updateRelativeMatrix(): void {

        const r = this.__relative
        const layout = this.__layout

        if (layout.affectScaleOrRotation) {

            const { scaleX, scaleY } = this.__

            if (layout.affectRotation) {

                if (layout.scaleChanged || layout.rotationChanged) {

                    let { rotation, skewX, skewY } = this.__

                    if (rotation || skewX || skewY) {

                        rotation *= OneRadian
                        if (skewX) skewX *= OneRadian
                        if (skewY) skewY *= OneRadian

                        r.a = scaleX * cos(rotation + skewY)
                        r.b = scaleX * sin(rotation + skewY)
                        r.c = scaleY * -sin(rotation - skewX)
                        r.d = scaleY * cos(rotation - skewX)

                    } else {

                        r.a = scaleX
                        r.b = 0
                        r.c = 0
                        r.d = scaleY

                        layout.affectRotation = false
                    }

                    layout.scaleChanged = false
                    layout.rotationChanged = false

                }

            } else {

                if (layout.scaleChanged) {
                    r.a = scaleX
                    r.d = scaleY
                    layout.scaleChanged = false
                }

            }

        }

        if (layout.positionChanged) {
            r.e = this.__.x
            r.f = this.__.y
            layout.positionChanged = false
        }

        this.__layout.matrixChanged = false
    }

}


