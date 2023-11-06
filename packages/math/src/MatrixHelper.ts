import { IMatrixData, IPointData, IOrientPointData, IMatrixWithLayoutData } from '@leafer/interface'
import { MathHelper, OneRadian, PI_2 } from './MathHelper'


const { sin, cos, acos, sqrt, abs } = Math
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


    scale(t: IMatrixData, scaleX: number, scaleY: number = scaleX): void {
        t.a *= scaleX
        t.b *= scaleX
        t.c *= scaleY
        t.d *= scaleY
    },

    scaleOfOuter(t: IMatrixData, origin: IPointData, scaleX: number, scaleY?: number): void {
        M.toInnerPoint(t, origin, tempPoint)
        M.scaleOfInner(t, tempPoint, scaleX, scaleY)
    },

    scaleOfInner(t: IMatrixData, origin: IPointData, scaleX: number, scaleY: number = scaleX): void {
        M.translateInner(t, origin.x, origin.y)
        M.scale(t, scaleX, scaleY)
        M.translateInner(t, -origin.x, -origin.y)
    },


    rotate(t: IMatrixData, rotation: number): void {
        const { a, b, c, d } = t

        rotation *= OneRadian
        const cosR = cos(rotation)
        const sinR = sin(rotation)

        t.a = a * cosR - b * sinR
        t.b = a * sinR + b * cosR
        t.c = c * cosR - d * sinR
        t.d = c * sinR + d * cosR
    },

    rotateOfOuter(t: IMatrixData, origin: IPointData, rotation: number): void {
        M.toInnerPoint(t, origin, tempPoint)
        M.rotateOfInner(t, tempPoint, rotation)
    },

    rotateOfInner(t: IMatrixData, origin: IPointData, rotation: number): void {
        M.translateInner(t, origin.x, origin.y)
        M.rotate(t, rotation)
        M.translateInner(t, -origin.x, -origin.y)
    },


    skew(t: IMatrixData, skewX: number, skewY?: number): void {
        const { a, b, c, d } = t

        if (skewY) {
            skewY *= OneRadian
            t.a = a + c * skewY
            t.b = b + d * skewY
        }

        if (skewX) {
            skewX *= OneRadian
            t.c = c + a * skewX
            t.d = d + b * skewX
        }
    },

    skewOfOuter(t: IMatrixData, origin: IPointData, skewX: number, skewY?: number): void {
        M.toInnerPoint(t, origin, tempPoint)
        M.skewOfInner(t, tempPoint, skewX, skewY)
    },

    skewOfInner(t: IMatrixData, origin: IPointData, skewX: number, skewY: number = 0): void {
        M.translateInner(t, origin.x, origin.y)
        M.skew(t, skewX, skewY)
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

    multiplyParent(t: IMatrixData, parent: IMatrixData, abcdChanged?: boolean | number): void { // = transform
        const { a, b, c, d, e, f } = t

        if (abcdChanged === undefined) abcdChanged = a !== 1 || b || c || d !== 1

        if (abcdChanged) {
            t.a = a * parent.a + b * parent.c
            t.b = a * parent.b + b * parent.d
            t.c = c * parent.a + d * parent.c
            t.d = c * parent.b + d * parent.d
        } else {
            t.a = parent.a
            t.b = parent.b
            t.c = parent.c
            t.d = parent.d
        }

        t.e = e * parent.a + f * parent.c + parent.e
        t.f = e * parent.b + f * parent.d + parent.f
    },

    divide(t: IMatrixData, child: IMatrixData): void {
        M.multiply(t, M.tempInvert(child))
    },

    divideParent(t: IMatrixData, parent: IMatrixData): void {
        M.multiplyParent(t, M.tempInvert(parent))
    },

    tempInvert(t: IMatrixData): IMatrixData {
        const { tempMatrix } = M
        M.copy(tempMatrix, t)
        M.invert(tempMatrix)
        return tempMatrix
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
        to.x = x * t.a + y * t.c
        to.y = x * t.b + y * t.d

        if (!distance) {
            to.x += t.e
            to.y += t.f
        }
    },

    toInnerPoint(t: IMatrixData, outer: IPointData, to?: IPointData, distance?: boolean): void {
        const { a, b, c, d } = t
        const s = 1 / (a * d - b * c)

        const { x, y } = outer

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

    setLayout(t: IMatrixData, data: IOrientPointData, origin?: IPointData, bcChanged?: boolean | number): void {
        const { x, y, scaleX, scaleY, rotation, skewX, skewY } = data

        if (bcChanged === undefined) bcChanged = rotation || skewX || skewY

        if (bcChanged) {

            const r = rotation * OneRadian
            const cosR = cos(r)
            const sinR = sin(r)

            if (skewX || skewY) {

                // rotate -> skew -> scale
                const sx = skewX * OneRadian
                const sy = skewY * OneRadian

                t.a = (cosR + sy * -sinR) * scaleX
                t.b = (sinR + sy * cosR) * scaleX
                t.c = (-sinR + sx * cosR) * scaleY
                t.d = (cosR + sx * sinR) * scaleY

            } else {

                // rotate -> scale
                t.a = cosR * scaleX
                t.b = sinR * scaleX
                t.c = -sinR * scaleY
                t.d = cosR * scaleY

            }

        } else {
            t.a = scaleX
            t.b = 0
            t.c = 0
            t.d = scaleY
        }

        t.e = x
        t.f = y

        if (origin) {
            t.e -= origin.x * t.a + origin.y * t.c
            t.f -= origin.x * t.b + origin.y * t.d
        }
    },

    getLayout(t: IMatrixData, origin?: IPointData, firstSkewY?: boolean): IOrientPointData {
        const { a, b, c, d, e, f } = t

        let x = e, y = f, scaleX: number, scaleY: number, rotation: number, skewX: number, skewY: number

        if (b || c) {

            const s = a * d - b * c

            if (c && !firstSkewY) {
                scaleX = sqrt(a * a + b * b)
                scaleY = s / scaleX

                const cosR = a / scaleX
                rotation = b > 0 ? acos(cosR) : -acos(cosR)

            } else {
                scaleY = sqrt(c * c + d * d)
                scaleX = s / scaleY

                const cosR = c / scaleY
                rotation = PI_2 - (d > 0 ? acos(-cosR) : -acos(cosR))
            }

            if (abs(scaleX) > 0.1) scaleX = float(scaleX)
            if (abs(scaleY) > 0.1) scaleY = float(scaleY)

            const cosR = cos(rotation)
            const sinR = sin(rotation)

            skewX = float((c / scaleY + sinR) / cosR / OneRadian)
            skewY = float((b / scaleX - sinR) / cosR / OneRadian)
            rotation = float(rotation / OneRadian)

        } else {
            scaleX = a
            scaleY = d
            rotation = skewX = skewY = 0
        }

        if (origin) {
            x += origin.x * a + origin.y * c
            y += origin.x * b + origin.y * d
        }

        return { x, y, scaleX, scaleY, rotation, skewX, skewY }
    },

    reset(t: IMatrixData): void {
        M.set(t)
    }
}

const M = MatrixHelper