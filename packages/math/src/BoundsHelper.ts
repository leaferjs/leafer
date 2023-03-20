import { IPointData, IBoundsData, IMatrixData, IBoundsDataHandle, IObject, IMatrix, IOffsetBoundsData, IRadiusPointData } from '@leafer/interface'
import { Matrix } from './Matrix'
import { MatrixHelper as M } from './MatrixHelper'
import { TwoPointBoundsHelper as TB } from './TwoPointBoundsHelper'
import { PointHelper as P } from './PointHelper'


const { tempPointBounds, setPoint, addPoint, toBounds } = TB
const { toWorldPoint } = M

let right: number, bottom: number, boundsRight: number, boundsBottom: number
const point = {} as IPointData
const toPoint = {} as IPointData

export const BoundsHelper = {

    tempBounds: {} as IBoundsData,

    set(t: IBoundsData, x = 0, y = 0, width = 0, height = 0): void {
        t.x = x
        t.y = y
        t.width = width
        t.height = height
    },

    copy(t: IBoundsData, bounds: IBoundsData): void {
        t.x = bounds.x
        t.y = bounds.y
        t.width = bounds.width
        t.height = bounds.height
    },

    copyAndSpread(t: IBoundsData, bounds: IBoundsData, spread: number): void {
        B.set(t, bounds.x - spread, bounds.y - spread, bounds.width + spread * 2, bounds.height + spread * 2)
    },

    right(t: IBoundsData): number {
        return t.x + t.width
    },

    bottom(t: IBoundsData): number {
        return t.y + t.height
    },

    move(t: IBoundsData, x: number, y: number): void {
        t.x += x
        t.y += y
    },

    getByMove(t: IBoundsData, x: number, y: number): IBoundsData {
        t = { ...t }
        B.move(t, x, y)
        return t
    },

    getOutOfBounds(t: IBoundsData, bounds: IBoundsData): IOffsetBoundsData {
        const offsetX = -(B.right(bounds) - t.x)
        const offsetY = -(B.bottom(bounds) - t.y)
        const ot = { ...t, offsetX, offsetY }
        B.move(ot, -offsetX, -offsetY)
        return ot
    },

    scale(t: IBoundsData, scale: number): void {
        t.x *= scale
        t.y *= scale
        t.width *= scale
        t.height *= scale
    },

    tempToWorld(t: IBoundsData, matrix: IMatrixData): IBoundsData {
        B.copy(B.tempBounds, t)
        B.toWorld(B.tempBounds, matrix)
        return B.tempBounds
    },

    getWorld(t: IBoundsData, matrix: IMatrixData): IBoundsData {
        t = { ...t }
        B.toWorld(t, matrix)
        return t
    },

    toWorld(t: IBoundsData, matrix: IMatrixData, to?: IBoundsData): void {

        to || (to = t)

        if (matrix.b === 0 && matrix.c === 0) {

            to.x = matrix.e + t.x * matrix.a
            to.y = matrix.f + t.y * matrix.d
            to.width = t.width * matrix.a
            to.height = t.height * matrix.d

        } else {

            point.x = t.x
            point.y = t.y

            toWorldPoint(matrix, point, toPoint)
            setPoint(tempPointBounds, toPoint.x, toPoint.y)

            point.x = t.x + t.width

            toWorldPoint(matrix, point, toPoint)
            addPoint(tempPointBounds, toPoint.x, toPoint.y)

            point.y = t.y + t.height

            toWorldPoint(matrix, point, toPoint)
            addPoint(tempPointBounds, toPoint.x, toPoint.y)

            point.x = t.x

            toWorldPoint(matrix, point, toPoint)
            addPoint(tempPointBounds, toPoint.x, toPoint.y)

            toBounds(tempPointBounds, to)
        }
    },

    /**toLocal(t: IBoundsData, matrix: IMatrixData): void {
        t.x = (t.x - matrix.e) / matrix.a
        t.y = (t.y - matrix.f) / matrix.d
        t.width /= matrix.a
        t.height /= matrix.d
    },*/

    getFitMatrix(t: IBoundsData, put: IBoundsData): IMatrix {
        const scale = Math.min(1, Math.min(t.width / put.width, t.height / put.height))
        return new Matrix(scale, 0, 0, scale, -put.x * scale, -put.y * scale)
    },

    getSpread(t: IBoundsData, size: number): IBoundsData {
        const n = {} as IBoundsData
        B.copyAndSpread(n, t, size)
        return n
    },

    spread(t: IBoundsData, size: number): void {
        B.copyAndSpread(t, t, size)
    },

    ceil(t: IBoundsData): void {
        t.x = Math.floor(t.x)
        t.y = Math.floor(t.y)
        t.width = Math.ceil(t.width)
        t.height = Math.ceil(t.height)
    },

    add(t: IBoundsData, bounds: IBoundsData): void {
        right = t.x + t.width
        bottom = t.y + t.height
        boundsRight = bounds.x + bounds.width
        boundsBottom = bounds.y + bounds.height

        right = right > boundsRight ? right : boundsRight
        bottom = bottom > boundsBottom ? bottom : boundsBottom

        t.x = t.x < bounds.x ? t.x : bounds.x
        t.y = t.y < bounds.y ? t.y : bounds.y
        t.width = right - t.x
        t.height = bottom - t.y
    },

    addList(t: IBoundsData, list: IBoundsData[]): void {
        B.setByListWithHandle(t, list, undefined, true)
    },

    setByList(t: IBoundsData, list: IBoundsData[], addMode = false): void {
        B.setByListWithHandle(t, list, undefined, addMode)
    },

    addListWithHandle(t: IBoundsData, list: IObject[], boundsDataHandle: IBoundsDataHandle): void {
        B.setByListWithHandle(t, list, boundsDataHandle, true)
    },

    setByListWithHandle(t: IBoundsData, list: IObject[], boundsDataHandle: IBoundsDataHandle, addMode = false): void {
        if (!list.length) {
            B.empty(t)
            return
        }

        let bounds: IBoundsData, first = true
        for (let i = 0, len = list.length; i < len; i++) {
            bounds = boundsDataHandle ? boundsDataHandle(list[i]) : list[i] as IBoundsData
            if (bounds.width || bounds.height) { // 必须有效的bounds
                if (first) {
                    first = false
                    if (!addMode) copy(t, bounds)
                } else {
                    add(t, bounds)
                }
            }
        }
    },

    setByPoints(t: IBoundsData, points: IPointData[]): void {
        points.forEach((point, index) => {
            index === 0 ? setPoint(tempPointBounds, point.x, point.y) : addPoint(tempPointBounds, point.x, point.y)
        })
        toBounds(tempPointBounds, t)
    },

    hitRadiusPoint(t: IBoundsData, point: IRadiusPointData, pointMatrix?: IMatrixData): boolean {
        if (pointMatrix) point = P.tempToLocalRadiusPoint(point, pointMatrix)
        return (point.x >= t.x - point.radiusX && point.x <= t.x + t.width + point.radiusX) && (point.y >= t.y - point.radiusY && point.y <= t.y + t.height + point.radiusY)
    },

    hitPoint(t: IBoundsData, point: IPointData, pointMatrix?: IMatrixData): boolean {
        if (pointMatrix) point = P.tempToLocal(point, pointMatrix)
        return (point.x >= t.x && point.x <= t.x + t.width) && (point.y >= t.y && point.y <= t.y + t.height)
    },


    hit(t: IBoundsData, other: IBoundsData, otherMatrix?: IMatrixData): boolean {
        if (otherMatrix) other = B.tempToWorld(other, otherMatrix)
        return !((t.y + t.height < other.y) || (other.y + other.height < t.y) || (t.x + t.width < other.x) || (other.x + other.width < t.x))
    },

    includes(t: IBoundsData, other: IBoundsData, otherMatrix?: IMatrixData): boolean {
        if (otherMatrix) other = B.tempToWorld(other, otherMatrix)
        return (t.x <= other.x) && (t.y <= other.y) && (t.x + t.width >= other.x + other.width) && (t.y + t.height >= other.y + other.height)
    },

    getIntersectData(t: IBoundsData, other: IBoundsData, otherMatrix?: IMatrixData): IBoundsData {
        if (otherMatrix) other = B.tempToWorld(other, otherMatrix)
        let { x, y, width, height } = other

        right = x + width
        bottom = y + height
        boundsRight = t.x + t.width
        boundsBottom = t.y + t.height

        x = x > t.x ? x : t.x
        y = y > t.y ? y : t.y
        right = right < boundsRight ? right : boundsRight
        bottom = bottom < boundsBottom ? bottom : boundsBottom

        width = right - x
        height = bottom - y

        return { x, y, width, height }
    },

    intersect(t: IBoundsData, other: IBoundsData, otherMatrix?: IMatrixData): void {
        B.copy(t, B.getIntersectData(t, other, otherMatrix))
    },

    isSame(t: IBoundsData, bounds: IBoundsData): boolean {
        return t.x === bounds.x && t.y === bounds.y && t.width === bounds.width && t.height === bounds.height
    },

    isEmpty(t: IBoundsData): boolean {
        return t.x === 0 && t.y === 0 && t.width === 0 && t.height === 0
    },

    empty(bounds: IBoundsData): void {
        bounds.x = 0
        bounds.y = 0
        bounds.width = 0
        bounds.height = 0
    }
}

const B = BoundsHelper
const { add, copy } = B