import { IPointData, IMatrixData, IRadiusPointData, IMatrixWithScaleData } from '@leafer/interface'
import { OneRadian, PI2 } from './MathHelper'

import { MatrixHelper as M } from './MatrixHelper'


const { toInnerPoint, toOuterPoint } = M
const { sin, cos, abs, sqrt, atan2, min, PI } = Math


export const PointHelper = {

    defaultPoint: { x: 0, y: 0 } as IPointData,

    tempPoint: {} as IPointData,
    tempRadiusPoint: {} as IRadiusPointData,

    set(t: IPointData, x = 0, y = 0): void {
        t.x = x
        t.y = y
    },

    setRadius(t: IRadiusPointData, x: number, y?: number): void {
        t.radiusX = x
        t.radiusY = y === undefined ? x : y
    },

    copy(t: IPointData, point: IPointData): void {
        t.x = point.x
        t.y = point.y
    },

    move(t: IPointData, x: number, y: number): void {
        t.x += x
        t.y += y
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
        P.copy(temp, t)
        toInnerPoint(matrix, temp, temp)
        return temp
    },

    tempToOuterOf(t: IPointData, matrix: IMatrixData): IPointData {
        const { tempPoint: temp } = P
        P.copy(temp, t)
        toOuterPoint(matrix, temp, temp)
        return temp
    },

    tempToInnerRadiusPointOf(t: IRadiusPointData, matrix: IMatrixWithScaleData): IRadiusPointData {
        const { tempRadiusPoint: temp } = P
        P.copy(temp, t)
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
        return P.getDistanceFrom(t.x, t.y, point.x, point.y)
    },

    getDistanceFrom(x1: number, y1: number, x2: number, y2: number): number {
        const x = abs(x2 - x1)
        const y = abs(y2 - y1)
        return sqrt(x * x + y * y)
    },

    getMinDistanceFrom(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
        return min(P.getDistanceFrom(x1, y1, x2, y2), P.getDistanceFrom(x2, y2, x3, y3))
    },

    getAngle(t: IPointData, to: IPointData): number {
        return P.getAtan2(t, to) / OneRadian
    },

    getRotation(t: IPointData, origin: IPointData, to: IPointData, toOrigin?: IPointData): number {
        if (!toOrigin) toOrigin = origin
        return P.getRadianFrom(t.x, t.y, origin.x, origin.y, to.x, to.y, toOrigin.x, toOrigin.y) / OneRadian
    },

    getRadianFrom(fromX: number, fromY: number, originX: number, originY: number, toX: number, toY: number, toOriginX?: number, toOriginY?: number): number {
        if (toOriginX === undefined) toOriginX = originX, toOriginY = originY
        let fromAngle = atan2(fromY - originY, fromX - originX)
        let toAngle = atan2(toY - toOriginY, toX - toOriginX)
        const radian = toAngle - fromAngle
        return radian < -PI ? radian + PI2 : radian
    },

    getAtan2(t: IPointData, to: IPointData): number {
        return atan2(to.y - t.y, to.x - t.x)
    },


    getDistancePoint(t: IPointData, to: IPointData, distance: number): IPointData {
        const r = P.getAtan2(t, to)
        return { x: t.x + cos(r) * distance, y: t.y + sin(r) * distance }
    },

    reset(t: IPointData): void {
        P.reset(t)
    }
}

const P = PointHelper