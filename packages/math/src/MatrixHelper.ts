import { IMatrix, IMatrixData, IPointData } from '@leafer/interface'
import { OneRadian } from './MathHelper'


const { sin, cos } = Math

export const MatrixHelper = {

    defaultMatrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 } as IMatrixData,

    tempMatrix: {} as IMatrixData,

    set(t: IMatrixData, a = 1, b = 0, c = 0, d = 1, e = 0, f = 0): void {
        t.a = a
        t.b = b
        t.c = c
        t.d = d
        t.e = e
        t.f = f
    },

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

    scale(t: IMatrixData, x: number, y: number = x): void {
        t.a *= x
        t.d *= y
        t.c *= x
        t.b *= y
        t.e *= x
        t.f *= y
    },

    rotate(t: IMatrixData, angle: number): void {
        const rotation = angle * OneRadian
        const cosR = cos(rotation)
        const sinR = sin(rotation)

        const { a, b, c, d, e, f } = t
        t.a = (a * cosR) - (b * sinR)
        t.b = (a * sinR) + (b * cosR)
        t.c = (c * cosR) - (d * sinR)
        t.d = (c * sinR) + (d * cosR)
        t.e = (e * cosR) - (f * sinR)
        t.f = (e * sinR) + (f * cosR)
    },

    times(t: IMatrixData, matrix: IMatrixData): void {
        const { a, b, c, d, e, f } = t

        t.a = (matrix.a * a) + (matrix.b * c)
        t.b = (matrix.a * b) + (matrix.b * d)
        t.c = (matrix.c * a) + (matrix.d * c)
        t.d = (matrix.c * b) + (matrix.d * d)
        t.e = (matrix.e * a) + (matrix.f * c) + e
        t.f = (matrix.e * b) + (matrix.f * d) + f
    },

    divide(t: IMatrixData, matrix: IMatrixData): void {
        M.times(t, M.tempInvert(matrix))
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

    toWorldPoint(t: IMatrixData, local: IPointData, setWorld?: IPointData): void {
        const { x, y } = local

        // world
        setWorld || (setWorld = local)
        setWorld.x = (x * t.a) + (y * t.c) + t.e
        setWorld.y = (x * t.b) + (y * t.d) + t.f
    },

    toLocalPoint(t: IMatrixData, world: IPointData, setLocal?: IPointData, fromOrigin?: boolean): void {
        const { x, y } = world
        const { a, b, c, d } = t
        const s = 1 / (a * d - b * c)

        // local
        setLocal || (setLocal = world)
        setLocal.x = (x * d - y * c) * s
        setLocal.y = (y * a - x * b) * s

        if (!fromOrigin) {
            const { e, f } = t
            setLocal.x -= (e * d - f * c) * s
            setLocal.y -= (f * a - e * b) * s
        }
    },

    empty(matrix: IMatrix): void {
        matrix.a = 1
        matrix.b = 0
        matrix.c = 0
        matrix.d = 1
        matrix.e = 0
        matrix.f = 0
    }
}

const M = MatrixHelper