import { IPointData, IMatrixData, IRadiusPointData, IMatrixWithLayoutData } from '@leafer/interface'
import { OneRadian } from './MathHelper'

import { MatrixHelper as M } from './MatrixHelper'

const { toInnerPoint, toOuterPoint } = M
const { sin, cos, abs, sqrt, atan2 } = Math


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

    rotate(t: IPointData, rotation: number, center?: IPointData): void {
        if (!center) center = P.defaultPoint
        const cosR = cos(rotation * OneRadian)
        const sinR = sin(rotation * OneRadian)
        const rx = t.x - center.x
        const ry = t.y - center.y
        t.x = center.x + rx * cosR - ry * sinR
        t.y = center.y + rx * sinR + ry * cosR
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

    tempToInnerRadiusPointOf(t: IRadiusPointData, matrix: IMatrixWithLayoutData): IRadiusPointData {
        const { tempRadiusPoint: temp } = P
        P.copy(temp, t)
        P.toInnerRadiusPointOf(t, matrix, temp)
        return temp
    },

    toInnerRadiusPointOf(t: IRadiusPointData, matrix: IMatrixWithLayoutData, to?: IRadiusPointData): void {
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

    getDistance(t: IPointData, point: IPointData): number {
        const x = abs(point.x - t.x)
        const y = abs(point.y - t.y)
        return sqrt(x * x + y * y)
    },

    getAngle(t: IPointData, to: IPointData): number {
        return P.getAtan2(t, to) / OneRadian
    },

    getChangeAngle(t: IPointData, orign: IPointData, to: IPointData, toOrigin?: IPointData): number {
        if (!toOrigin) toOrigin = orign

        let fromAngle = P.getAngle(t, orign)
        let toAngle = P.getAngle(to, toOrigin)

        const angle = toAngle - fromAngle
        return angle < -180 ? angle + 360 : angle
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