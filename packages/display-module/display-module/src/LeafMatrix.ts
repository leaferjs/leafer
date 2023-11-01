import { ILeafMatrixModule } from '@leafer/interface'
import { AroundHelper, MatrixHelper } from '@leafer/math'


const { scale, rotate, skew, defaultWorld } = MatrixHelper

export const LeafMatrix: ILeafMatrixModule = {

    __updateWorldMatrix(): void {

        const pw = this.parent ? this.parent.__world : defaultWorld
        const r = this.__local
        const w = this.__world

        if (this.__layout.matrixChanged) this.__updateLocalMatrix()

        if (this.__layout.affectScaleOrRotation) {
            w.a = r.a * pw.a + r.b * pw.c
            w.b = r.a * pw.b + r.b * pw.d
            w.c = r.c * pw.a + r.d * pw.c
            w.d = r.c * pw.b + r.d * pw.d
            w.e = r.e * pw.a + r.f * pw.c + pw.e
            w.f = r.e * pw.b + r.f * pw.d + pw.f

            const data = this.__
            w.scaleX = pw.scaleX * data.scaleX
            w.scaleY = pw.scaleY * data.scaleY

            w.rotation = pw.rotation + data.rotation
            w.skewX = pw.skewX + data.skewX
            w.skewY = pw.skewY + data.skewY
        } else {
            w.a = pw.a
            w.b = pw.b
            w.c = pw.c
            w.d = pw.d
            w.e = r.e * pw.a + r.f * pw.c + pw.e
            w.f = r.e * pw.b + r.f * pw.d + pw.f

            w.scaleX = pw.scaleX
            w.scaleY = pw.scaleY

            w.rotation = pw.rotation
            w.skewX = pw.skewX
            w.skewY = pw.skewY
        }
    },

    __updateLocalMatrix(): void {

        const r = this.__local
        const layout = this.__layout

        if (layout.affectScaleOrRotation) {

            const { scaleX, scaleY } = this.__

            if (layout.affectRotation) {

                if (layout.scaleChanged || layout.rotationChanged) {

                    let { rotation, skewX, skewY } = this.__

                    r.b = 0
                    r.c = 0

                    if (rotation || skewX || skewY) {

                        r.a = 1
                        r.d = 1

                        if (rotation) rotate(r, rotation)
                        if (skewX || skewY) skew(r, skewX, skewY)
                        scale(r, scaleX, scaleY)

                    } else {

                        r.a = scaleX
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

        const { x, y, around } = this.__

        r.e = x
        r.f = y

        if (around) {
            const { width, height } = this.__
            if (width && height) {
                const origin = AroundHelper.read(around)
                const offsetX = width * origin.x, offsetY = height * origin.y
                r.e -= offsetX * r.a + offsetY * r.c
                r.f -= offsetX * r.b + offsetY * r.d
            }
        }

        this.__layout.matrixChanged = false
    }


}


