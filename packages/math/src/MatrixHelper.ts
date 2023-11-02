import { IMatrixData, IPointData, IOrientPointData, IMatrixWithLayoutData } from '@leafer/interface'
import { MathHelper, OneRadian, PI_2 } from './MathHelper'


const { sin, cos, acos, atan, sqrt } = Math
const { float } = MathHelper
const tempPoint = {} as IPointData

function get(): IMatrixData {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
}

function getWorld(): IMatrixWithLayoutData {
    return { ...get(), x: 0, y: 0, width: 0, height: 0, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 }
}

export const MatrixHelper = {

    defaultMatrix: get(),

    defaultWorld: getWorld(),

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

    getWorld,

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
        t.b *= x
        t.c *= y
        t.d *= y
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


    multiply(t: IMatrixData, child: IMatrixData): void {
        const { a, b, c, d, e, f } = t

        t.a = child.a * a + child.b * c
        t.b = child.a * b + child.b * d
        t.c = child.c * a + child.d * c
        t.d = child.c * b + child.d * d
        t.e = child.e * a + child.f * c + e
        t.f = child.e * b + child.f * d + f
    },

    multiplyParent(t: IMatrixData, parent: IMatrixData): void {
        const { a, b, c, d, e, f } = t

        if (parent.a !== 1 || parent.b !== 0 || parent.c !== 0 || parent.d !== 1) {
            t.a = (a * parent.a) + (b * parent.c)
            t.b = (a * parent.b) + (b * parent.d)
            t.c = (c * parent.a) + (d * parent.c)
            t.d = (c * parent.b) + (d * parent.d)
        }

        t.e = (e * parent.a) + (f * parent.c) + parent.e
        t.f = (e * parent.b) + (f * parent.d) + parent.f
    },

    divide(t: IMatrixData, child: IMatrixData): void {
        M.multiply(t, M.tempInvert(child))
    },

    divideParent(t: IMatrixData, parent: IMatrixData): void {
        M.multiplyParent(t, M.tempInvert(parent))
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


    toOuterPoint(t: IMatrixData, inner: IPointData, to?: IPointData, distance?: boolean): void {
        const { x, y } = inner

        // outer
        to || (to = inner)
        to.x = (x * t.a) + (y * t.c)
        to.y = (x * t.b) + (y * t.d)

        if (!distance) {
            to.x += t.e
            to.y += t.f
        }
    },

    toInnerPoint(t: IMatrixData, outer: IPointData, to?: IPointData, distance?: boolean): void {
        const { x, y } = outer
        const { a, b, c, d } = t
        const s = 1 / (a * d - b * c)

        // inner
        to || (to = outer)
        to.x = (x * d - y * c) * s
        to.y = (y * a - x * b) * s

        if (!distance) {
            const { e, f } = t
            to.x -= (e * d - f * c) * s
            to.y -= (f * a - e * b) * s
        }
    },


    decompose(t: IMatrixData): IOrientPointData {
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
                skewX = float(atan(k / ab) / OneRadian, 6)
            } else {
                const cd = c * c + d * d
                scaleY = sqrt(cd)
                scaleX = s / scaleY

                const r = c / scaleY
                rotation = PI_2 - (d > 0 ? acos(-r) : -acos(r))
                skewY = float(atan(k / cd) / OneRadian, 6)
            }

            rotation = float(rotation / OneRadian, 6)
        }

        return { x: t.e, y: t.f, scaleX, scaleY, rotation, skewX, skewY }
    },

    reset(t: IMatrixData): void {
        M.set(t)
    }
}

const M = MatrixHelper