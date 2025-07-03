import { IPointData, IBoundsData, IMatrixData, IFourNumber, IBoundsDataFn, IObject, IMatrix, IOffsetBoundsData, IRadiusPointData, IMatrixWithScaleData, ISide, IAlign, ISizeData } from '@leafer/interface'
import { isArray } from '@leafer/data'

import { Matrix } from './Matrix'
import { MatrixHelper as M } from './MatrixHelper'
import { TwoPointBoundsHelper as TB } from './TwoPointBoundsHelper'
import { PointHelper as P } from './PointHelper'
import { MathHelper, getBoundsData } from './MathHelper'
import { AlignHelper } from './AlignHelper'


const { tempPointBounds, setPoint, addPoint, toBounds } = TB
const { toOuterPoint } = M
const { float, fourNumber } = MathHelper
const { floor, ceil } = Math

let right: number, bottom: number, boundsRight: number, boundsBottom: number
const point = {} as IPointData
const toPoint = {} as IPointData
const tempBounds = {} as IBoundsData

export const BoundsHelper = {

    tempBounds,

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

    copyAndSpread(t: IBoundsData, bounds: IBoundsData, spread: IFourNumber, isShrink?: boolean, side?: ISide): void {
        const { x, y, width, height } = bounds
        if (isArray(spread)) {
            const four = fourNumber(spread)
            isShrink
                ? B.set(t, x + four[3], y + four[0], width - four[1] - four[3], height - four[2] - four[0])
                : B.set(t, x - four[3], y - four[0], width + four[1] + four[3], height + four[2] + four[0])
        } else {
            if (isShrink) spread = -spread
            B.set(t, x - spread, y - spread, width + spread * 2, height + spread * 2)
        }

        if (side) { // 只扩展/收缩一边
            if (side === 'width') t.y = y, t.height = height
            else t.x = x, t.width = width
        }
    },


    minX(t: IBoundsData): number { return t.width > 0 ? t.x : t.x + t.width },

    minY(t: IBoundsData): number { return t.height > 0 ? t.y : t.y + t.height },

    maxX(t: IBoundsData): number { return t.width > 0 ? t.x + t.width : t.x },

    maxY(t: IBoundsData): number { return t.height > 0 ? t.y + t.height : t.y },


    move(t: IBoundsData, x: number, y: number): void {
        t.x += x
        t.y += y
    },

    getByMove(t: IBoundsData, x: number, y: number): IBoundsData {
        t = { ...t }
        B.move(t, x, y)
        return t
    },

    toOffsetOutBounds(t: IBoundsData, to?: IOffsetBoundsData, parent?: IBoundsData): void {
        if (!to) {
            to = t as IOffsetBoundsData
        } else {
            copy(to, t)
        }
        if (parent) {
            to.offsetX = -(B.maxX(parent) - t.x)
            to.offsetY = -(B.maxY(parent) - t.y)
        } else {
            to.offsetX = t.x + t.width
            to.offsetY = t.y + t.height
        }
        B.move(to, -to.offsetX, -to.offsetY)
    },


    scale(t: IBoundsData, scaleX: number, scaleY = scaleX, onlySize?: boolean): void {
        onlySize || P.scale(t, scaleX, scaleY)
        t.width *= scaleX
        t.height *= scaleY
    },

    scaleOf(t: IBoundsData, origin: IPointData, scaleX: number, scaleY = scaleX): void {
        P.scaleOf(t, origin, scaleX, scaleY)
        t.width *= scaleX
        t.height *= scaleY
    },

    tempToOuterOf(t: IBoundsData, matrix: IMatrixData): IBoundsData {
        B.copy(tempBounds, t)
        B.toOuterOf(tempBounds, matrix)
        return tempBounds
    },

    getOuterOf(t: IBoundsData, matrix: IMatrixData): IBoundsData {
        t = { ...t }
        B.toOuterOf(t, matrix)
        return t
    },

    toOuterOf(t: IBoundsData, matrix: IMatrixData, to?: IBoundsData): void {

        to || (to = t)

        if (matrix.b === 0 && matrix.c === 0) {

            const { a, d } = matrix
            if (a > 0) {
                to.width = t.width * a
                to.x = matrix.e + t.x * a
            } else {
                to.width = t.width * -a
                to.x = matrix.e + t.x * a - to.width
            }

            if (d > 0) {
                to.height = t.height * d
                to.y = matrix.f + t.y * d
            } else {
                to.height = t.height * -d
                to.y = matrix.f + t.y * d - to.height
            }

        } else {

            point.x = t.x
            point.y = t.y

            toOuterPoint(matrix, point, toPoint)
            setPoint(tempPointBounds, toPoint.x, toPoint.y)

            point.x = t.x + t.width

            toOuterPoint(matrix, point, toPoint)
            addPoint(tempPointBounds, toPoint.x, toPoint.y)

            point.y = t.y + t.height

            toOuterPoint(matrix, point, toPoint)
            addPoint(tempPointBounds, toPoint.x, toPoint.y)

            point.x = t.x

            toOuterPoint(matrix, point, toPoint)
            addPoint(tempPointBounds, toPoint.x, toPoint.y)

            toBounds(tempPointBounds, to)
        }
    },

    toInnerOf(t: IBoundsData, matrix: IMatrixData, to?: IBoundsData): void {
        to || (to = t)
        B.move(to, -matrix.e, -matrix.f)
        B.scale(to, 1 / matrix.a, 1 / matrix.d)
    },

    getFitMatrix(t: IBoundsData, put: IBoundsData, baseScale = 1): IMatrix {
        const scale = Math.min(baseScale, B.getFitScale(t, put))
        return new Matrix(scale, 0, 0, scale, -put.x * scale, -put.y * scale)
    },

    getFitScale(t: ISizeData, put: ISizeData, isCoverMode?: boolean): number {
        const sw = t.width / put.width, sh = t.height / put.height
        return isCoverMode ? Math.max(sw, sh) : Math.min(sw, sh)
    },

    put(t: ISizeData, put: ISizeData, align: IAlign = 'center', putScale: number | 'fit' | 'cover' = 1, changeSize = true, to?: IPointData): void {
        to || (to = put as unknown as IPointData)
        if (typeof putScale === 'string') putScale = B.getFitScale(t, put, putScale === 'cover')
        tempBounds.width = changeSize ? put.width *= putScale : put.width * putScale
        tempBounds.height = changeSize ? put.height *= putScale : put.height * putScale
        AlignHelper.toPoint(align, tempBounds, t as IBoundsData, to, true, true)
    },

    getSpread(t: IBoundsData, spread: IFourNumber, side?: ISide): IBoundsData {
        const n = {} as IBoundsData
        B.copyAndSpread(n, t, spread, false, side)
        return n
    },

    spread(t: IBoundsData, spread: IFourNumber, side?: ISide): void {
        B.copyAndSpread(t, t, spread, false, side)
    },

    shrink(t: IBoundsData, shrink: IFourNumber, side?: ISide): void {
        B.copyAndSpread(t, t, shrink, true, side)
    },

    ceil(t: IBoundsData): void {
        const { x, y } = t
        t.x = floor(t.x)
        t.y = floor(t.y)
        t.width = x > t.x ? ceil(t.width + x - t.x) : ceil(t.width)
        t.height = y > t.y ? ceil(t.height + y - t.y) : ceil(t.height)
    },

    unsign(t: IBoundsData): void {
        if (t.width < 0) {
            t.x += t.width
            t.width = -t.width
        }
        if (t.height < 0) {
            t.y += t.height
            t.height = -t.height
        }
    },

    float(t: IBoundsData, maxLength?: number): void {
        t.x = float(t.x, maxLength)
        t.y = float(t.y, maxLength)
        t.width = float(t.width, maxLength)
        t.height = float(t.height, maxLength)
    },

    add(t: IBoundsData, bounds: IBoundsData, isPoint?: boolean): void {
        right = t.x + t.width
        bottom = t.y + t.height
        boundsRight = bounds.x
        boundsBottom = bounds.y

        if (!isPoint) {
            boundsRight += bounds.width
            boundsBottom += bounds.height
        }

        right = right > boundsRight ? right : boundsRight
        bottom = bottom > boundsBottom ? bottom : boundsBottom

        t.x = t.x < bounds.x ? t.x : bounds.x
        t.y = t.y < bounds.y ? t.y : bounds.y
        t.width = right - t.x
        t.height = bottom - t.y
    },

    addList(t: IBoundsData, list: IBoundsData[]): void {
        B.setListWithFn(t, list, undefined, true)
    },

    setList(t: IBoundsData, list: IBoundsData[], addMode = false): void {
        B.setListWithFn(t, list, undefined, addMode)
    },

    addListWithFn(t: IBoundsData, list: IObject[], boundsDataFn: IBoundsDataFn): void {
        B.setListWithFn(t, list, boundsDataFn, true)
    },

    setListWithFn(t: IBoundsData, list: IObject[], boundsDataFn: IBoundsDataFn, addMode = false): void {
        let bounds: IBoundsData, first = true
        for (let i = 0, len = list.length; i < len; i++) {
            bounds = boundsDataFn ? boundsDataFn(list[i]) : list[i] as IBoundsData
            if (bounds && (bounds.width || bounds.height)) {
                if (first) {
                    first = false
                    if (!addMode) copy(t, bounds)
                } else {
                    add(t, bounds)
                }
            }
        }

        if (first) B.reset(t)
    },


    setPoints(t: IBoundsData, points: IPointData[]): void {
        points.forEach((point, index) => index === 0 ? setPoint(tempPointBounds, point.x, point.y) : addPoint(tempPointBounds, point.x, point.y))
        toBounds(tempPointBounds, t)
    },

    setPoint(t: IBoundsData, point: IPointData): void {
        B.set(t, point.x, point.y)
    },

    addPoint(t: IBoundsData, point: IPointData): void {
        add(t, point as IBoundsData, true)
    },

    getPoints(t: IBoundsData): IPointData[] {
        const { x, y, width, height } = t
        return [
            { x, y }, // topLeft
            { x: x + width, y }, // topRight
            { x: x + width, y: y + height }, // bottomRight
            { x, y: y + height } // bottomLeft
        ]
    },


    hitRadiusPoint(t: IBoundsData, point: IRadiusPointData, pointMatrix?: IMatrixWithScaleData): boolean {
        if (pointMatrix) point = P.tempToInnerRadiusPointOf(point, pointMatrix)
        return (point.x >= t.x - point.radiusX && point.x <= t.x + t.width + point.radiusX) && (point.y >= t.y - point.radiusY && point.y <= t.y + t.height + point.radiusY)
    },

    hitPoint(t: IBoundsData, point: IPointData, pointMatrix?: IMatrixData): boolean {
        if (pointMatrix) point = P.tempToInnerOf(point, pointMatrix)
        return (point.x >= t.x && point.x <= t.x + t.width) && (point.y >= t.y && point.y <= t.y + t.height)
    },


    hit(t: IBoundsData, other: IBoundsData, otherMatrix?: IMatrixData): boolean {
        if (otherMatrix) other = B.tempToOuterOf(other, otherMatrix)
        return !((t.y + t.height < other.y) || (other.y + other.height < t.y) || (t.x + t.width < other.x) || (other.x + other.width < t.x))
    },

    includes(t: IBoundsData, other: IBoundsData, otherMatrix?: IMatrixData): boolean {
        if (otherMatrix) other = B.tempToOuterOf(other, otherMatrix)
        return (t.x <= other.x) && (t.y <= other.y) && (t.x + t.width >= other.x + other.width) && (t.y + t.height >= other.y + other.height)
    },

    getIntersectData(t: IBoundsData, other: IBoundsData, otherMatrix?: IMatrixData): IBoundsData {
        if (otherMatrix) other = B.tempToOuterOf(other, otherMatrix)
        if (!B.hit(t, other)) return getBoundsData()

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

    reset(t: IBoundsData): void {
        B.set(t)
    }
}

const B = BoundsHelper
const { add, copy } = B