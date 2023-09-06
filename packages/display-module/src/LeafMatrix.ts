import { ILeafMatrixModule, IPointData } from '@leafer/interface'
import { OneRadian, MatrixHelper } from '@leafer/math'


const { sin, cos } = Math
const defaultWorld = { ...MatrixHelper.defaultMatrix, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 }
const defaultCenter: IPointData = { x: 0.5, y: 0.5 }

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
            if (this.__.byCenter) {
                const { width, height, byCenter } = this.__
                const center = (byCenter === true) ? defaultCenter : byCenter
                const offsetX = width * center.x, offsetY = height * center.y
                r.e -= offsetX * r.a + offsetY * r.c
                r.f -= offsetX * r.b + offsetY * r.d
            }
            layout.positionChanged = false
        }

        this.__layout.matrixChanged = false
    }

}


