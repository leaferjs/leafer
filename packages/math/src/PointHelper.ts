import { IPointData, IMatrixData, IRadiusPointData, IMatrixWithScaleData } from '@leafer/interface'
import { isObject, isUndefined } from '@leafer/data'

import { OneRadian, getPointData } from './MathHelper'
import { MatrixHelper as M } from './MatrixHelper'


const { toInnerPoint, toOuterPoint } = M
const { sin, cos, abs, sqrt, atan2, min, round } = Math


export const PointHelper = {

    defaultPoint: getPointData(),

    tempPoint: {} as IPointData,
    tempRadiusPoint: {} as IRadiusPointData,

    set(t: IPointData, x = 0, y = 0): void {
        t.x = x
        t.y = y
    },

    setRadius(t: IRadiusPointData, x: number, y?: number): void {
        t.radiusX = x
        t.radiusY = isUndefined(y) ? x : y
    },

    copy(t: IPointData, point: IPointData): void {
        t.x = point.x
        t.y = point.y
    },

    copyFrom(t: IPointData, x: number, y: number): void {
        t.x = x
        t.y = y
    },

    round(t: IPointData, halfPixel?: boolean): void {
        t.x = halfPixel ? round(t.x - 0.5) + 0.5 : round(t.x)
        t.y = halfPixel ? round(t.y - 0.5) + 0.5 : round(t.y)
    },

    move(t: IPointData, x: number | IPointData, y?: number): void {
        if (isObject(x)) t.x += x.x, t.y += x.y
        else t.x += x, t.y += y
    },


    scale(t: IPointData, scaleX: number, scaleY = scaleX): void {
        if (t.x) t.x *= scaleX
        if (t.y) t.y *= scaleY
    },

    scaleOf(t: IPointData, origin: IPointData, scaleX: number, scaleY = scaleX): void {
        t.x += (t.x - origin.x) * (scaleX - 1)
        t.y += (t.y - origin.y) * (scaleY - 1)
    },

    rotate(t: IPointData, rotation: number, origin?: IPointData): void {
        if (!origin) origin = P.defaultPoint
        rotation *= OneRadian
        const cosR = cos(rotation)
        const sinR = sin(rotation)
        const rx = t.x - origin.x
        const ry = t.y - origin.y
        t.x = origin.x + rx * cosR - ry * sinR
        t.y = origin.y + rx * sinR + ry * cosR
    },


    tempToInnerOf(t: IPointData, matrix: IMatrixData): IPointData {
        const { tempPoint: temp } = P
        copy(temp, t)
        toInnerPoint(matrix, temp, temp)
        return temp
    },

    tempToOuterOf(t: IPointData, matrix: IMatrixData): IPointData {
        const { tempPoint: temp } = P
        copy(temp, t)
        toOuterPoint(matrix, temp, temp)
        return temp
    },

    tempToInnerRadiusPointOf(t: IRadiusPointData, matrix: IMatrixWithScaleData): IRadiusPointData {
        const { tempRadiusPoint: temp } = P
        copy(temp, t)
        P.toInnerRadiusPointOf(t, matrix, temp)
        return temp
    },

    toInnerRadiusPointOf(t: IRadiusPointData, matrix: IMatrixWithScaleData, to?: IRadiusPointData): void {
        to || (to = t)
        toInnerPoint(matrix, t, to)
        to.radiusX = Math.abs(t.radiusX / matrix.scaleX)
        to.radiusY = Math.abs(t.radiusY / matrix.scaleY)
    },


    toInnerOf(t: IPointData, matrix: IMatrixData, to?: IPointData): void {
        toInnerPoint(matrix, t, to)
    },

    toOuterOf(t: IPointData, matrix: IMatrixData, to?: IPointData): void {
        toOuterPoint(matrix, t, to)
    },


    getCenter(t: IPointData, to: IPointData): IPointData {
        return { x: t.x + (to.x - t.x) / 2, y: t.y + (to.y - t.y) / 2 }
    },

    getCenterX(x1: number, x2: number): number {
        return x1 + (x2 - x1) / 2
    },

    getCenterY(y1: number, y2: number): number {
        return y1 + (y2 - y1) / 2
    },

    getDistance(t: IPointData, point: IPointData): number {
        return getDistanceFrom(t.x, t.y, point.x, point.y)
    },

    getDistanceFrom(x1: number, y1: number, x2: number, y2: number): number {
        const x = abs(x2 - x1)
        const y = abs(y2 - y1)
        return sqrt(x * x + y * y)
    },

    getMinDistanceFrom(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
        return min(getDistanceFrom(x1, y1, x2, y2), getDistanceFrom(x2, y2, x3, y3))
    },

    getAngle(t: IPointData, to: IPointData): number {
        return getAtan2(t, to) / OneRadian
    },

    getRotation(t: IPointData, origin: IPointData, to: IPointData, toOrigin?: IPointData): number {
        if (!toOrigin) toOrigin = origin
        return P.getRadianFrom(t.x, t.y, origin.x, origin.y, to.x, to.y, toOrigin.x, toOrigin.y) / OneRadian
    },

    getRadianFrom(fromX: number, fromY: number, originX: number, originY: number, toX: number, toY: number, toOriginX?: number, toOriginY?: number): number {
        if (isUndefined(toOriginX)) toOriginX = originX, toOriginY = originY
        const a = fromX - originX
        const b = fromY - originY
        const c = toX - toOriginX
        const d = toY - toOriginY
        return Math.atan2(a * d - b * c, a * c + b * d)
    },

    getAtan2(t: IPointData, to: IPointData): number {
        return atan2(to.y - t.y, to.x - t.x)
    },


    getDistancePoint(t: IPointData, to: IPointData, distance: number, changeTo: boolean): IPointData {
        const r = getAtan2(t, to)
        to = changeTo ? to : {} as IPointData
        to.x = t.x + cos(r) * distance
        to.y = t.y + sin(r) * distance
        return to
    },

    toNumberPoints(originPoints: number[] | IPointData[]): number[] {
        let points = originPoints as number[]
        if (isObject(originPoints[0])) points = [], (originPoints as IPointData[]).forEach(p => points.push(p.x, p.y))
        return points
    },

    reset(t: IPointData): void {
        P.reset(t)
    }
}

const P = PointHelper
const { getDistanceFrom, copy, getAtan2 } = P