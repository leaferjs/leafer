import { IMatrix, IMatrixData, IPointData, IMatrixDecompositionData } from '@leafer/interface'
import { OneRadian } from './MathHelper'


const { sin, cos, acos, atan, sqrt, PI } = Math
const tempPoint = {} as IPointData

function get(): IMatrixData {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
}

export const MatrixHelper = {

    defaultMatrix: get(),

    tempMatrix: {} as IMatrixData,

    set(t: IMatrixData, a = 1, b = 0, c = 0, d = 1, e = 0, f = 0): void {
        t.a = a
        t.b = b
        t.c = c
        t.d = d
        t.e = e
        t.f = f
    },

    get,

    copy(t: IMatrixData, matrix: IMatrixData): void {
        t.a = matrix.a
        t.b = matrix.b
        t.c = matrix.c
        t.d = matrix.d
        t.e = matrix.e
        t.f = matrix.f
    },


    translate(t: IMatrixData, x: number, y: number): void {
        t.e += x
        t.f += y
    },

    translateInner(t: IMatrixData, x: number, y: number): void {
        t.e += t.a * x + t.c * y
        t.f += t.b * x + t.d * y
    },


    scale(t: IMatrixData, x: number, y: number = x): void {
        t.a *= x
        t.d *= y
        t.c *= x
        t.b *= y
    },

    scaleOfOuter(t: IMatrixData, origin: IPointData, x: number, y: number = x): void {
        M.toInnerPoint(t, origin, tempPoint)
        M.scaleOfInner(t, tempPoint, x, y)
    },

    scaleOfInner(t: IMatrixData, origin: IPointData, x: number, y: number = x): void {
        M.translateInner(t, origin.x, origin.y)
        M.scale(t, x, y)
        M.translateInner(t, -origin.x, -origin.y)
    },


    rotate(t: IMatrixData, angle: number): void {
        angle *= OneRadian
        const cosR = cos(angle)
        const sinR = sin(angle)

        const { a, b, c, d } = t
        t.a = (a * cosR) - (b * sinR)
        t.b = (a * sinR) + (b * cosR)
        t.c = (c * cosR) - (d * sinR)
        t.d = (c * sinR) + (d * cosR)
    },

    rotateOfOuter(t: IMatrixData, origin: IPointData, angle: number): void {
        M.toInnerPoint(t, origin, tempPoint)
        M.rotateOfInner(t, tempPoint, angle)
    },

    rotateOfInner(t: IMatrixData, origin: IPointData, angle: number): void {
        M.translateInner(t, origin.x, origin.y)
        M.rotate(t, angle)
        M.translateInner(t, -origin.x, -origin.y)
    },


    skew(t: IMatrixData, x: number, y?: number): void {
        const { a, b, c, d } = t
        if (y) {
            y *= OneRadian
            t.a = a + c * y
            t.b = b + d * y
        }
        if (x) {
            x *= OneRadian
            t.c = c + a * x
            t.d = d + b * x
        }
    },

    skewOfOuter(t: IMatrixData, origin: IPointData, x: number, y?: number): void {
        M.toInnerPoint(t, origin, tempPoint)
        M.skewOfInner(t, tempPoint, x, y)
    },

    skewOfInner(t: IMatrixData, origin: IPointData, x: number, y?: number): void {
        M.translateInner(t, origin.x, origin.y)
        M.skew(t, x, y)
        M.translateInner(t, -origin.x, -origin.y)
    },


    multiply(t: IMatrixData, matrix: IMatrixData): void {
        const { a, b, c, d, e, f } = t

        t.a = matrix.a * a + matrix.b * c
        t.b = matrix.a * b + matrix.b * d
        t.c = matrix.c * a + matrix.d * c
        t.d = matrix.c * b + matrix.d * d
        t.e = matrix.e * a + matrix.f * c + e
        t.f = matrix.e * b + matrix.f * d + f
    },

    preMultiply(t: IMatrixData, matrix: IMatrixData): void {
        const { a, b, c, d, e, f } = t

        if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1) {
            t.a = (a * matrix.a) + (b * matrix.c)
            t.b = (a * matrix.b) + (b * matrix.d)
            t.c = (c * matrix.a) + (d * matrix.c)
            t.d = (c * matrix.b) + (d * matrix.d)
        }

        t.e = (e * matrix.a) + (f * matrix.c) + matrix.e
        t.f = (e * matrix.b) + (f * matrix.d) + matrix.f
    },

    divide(t: IMatrixData, matrix: IMatrixData): void {
        M.multiply(t, M.tempInvert(matrix))
    },

    tempInvert(t: IMatrixData): IMatrixData {
        const { tempMatrix: temp } = M
        M.copy(temp, t)
        M.invert(temp)
        return temp
    },

    invert(t: IMatrixData): void {
        const { a, b, c, d, e, f } = t
        const s = 1 / (a * d - b * c)
        t.a = d * s
        t.b = -b * s
        t.c = -c * s
        t.d = a * s
        t.e = -(e * d - f * c) * s
        t.f = -(f * a - e * b) * s
    },


    toOuterPoint(t: IMatrixData, inner: IPointData, to?: IPointData, isMovePoint?: boolean): void {
        const { x, y } = inner

        // outer
        to || (to = inner)
        to.x = (x * t.a) + (y * t.c)
        to.y = (x * t.b) + (y * t.d)

        if (!isMovePoint) {
            to.x += t.e
            to.y += t.f
        }
    },

    toInnerPoint(t: IMatrixData, outer: IPointData, to?: IPointData, isMovePoint?: boolean): void {
        const { x, y } = outer
        const { a, b, c, d } = t
        const s = 1 / (a * d - b * c)

        // inner
        to || (to = outer)
        to.x = (x * d - y * c) * s
        to.y = (y * a - x * b) * s

        if (!isMovePoint) {
            const { e, f } = t
            to.x -= (e * d - f * c) * s
            to.y -= (f * a - e * b) * s
        }
    },


    decompose(t: IMatrixData): IMatrixDecompositionData {
        const { a, b, c, d } = t
        let scaleX = a, scaleY = d, rotation = 0, skewX = 0, skewY = 0
        if (b || c) {

            const s = a * d - b * c
            const k = a * c + b * d

            if (b) {
                const ab = a * a + b * b
                scaleX = sqrt(ab)
                scaleY = s / scaleX

                const r = a / scaleX
                rotation = b > 0 ? acos(r) : -acos(r)
                skewX = atan(k / ab) / OneRadian
            } else {
                const cd = c * c + d * d
                scaleY = sqrt(cd)
                scaleX = s / scaleY

                const r = c / scaleY
                rotation = PI / 2 - (d > 0 ? acos(-r) : -acos(r))
                skewY = atan(k / cd) / OneRadian
            }

            rotation /= OneRadian
        }

        return { x: t.e, y: t.f, scaleX, scaleY, rotation, skewX, skewY }
    },

    reset(t: IMatrix): void {
        M.set(t)
    }
}

const M = MatrixHelper