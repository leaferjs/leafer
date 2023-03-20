import { IPointData, IMatrixData, IRadiusPointData } from '@leafer/interface'
import { OneRadian } from './MathHelper'

import { MatrixHelper as M } from './MatrixHelper'

const { toLocalPoint, toWorldPoint } = M
const { sin, cos, abs, sqrt, atan2 } = Math


export const PointHelper = {

    defaultPoint: { x: 0, y: 0 } as IPointData,

    tempPoint: {} as IPointData,
    tempRadiusPoint: {} as IRadiusPointData,

    set(t: IPointData, x = 0, y = 0): void {
        t.x = x
        t.y = y
    },

    copy(t: IPointData, point: IPointData): void {
        t.x = point.x
        t.y = point.y
    },


    rotate(point: IPointData, rotation: number, center?: IPointData): void {
        if (!center) center = P.defaultPoint
        const cosR = cos(rotation * OneRadian)
        const sinR = sin(rotation * OneRadian)
        const rx = point.x - center.x
        const ry = point.y - center.y
        point.x = center.x + rx * cosR - ry * sinR
        point.y = center.y + rx * sinR - ry * cosR
    },

    tempToLocal(t: IPointData, matrix: IMatrixData): IPointData {
        const { tempPoint: temp } = P
        P.copy(temp, t)
        toLocalPoint(matrix, temp, temp)
        return temp
    },

    tempToLocalRadiusPoint(t: IRadiusPointData, matrix: IMatrixData): IRadiusPointData {
        const { tempRadiusPoint: temp } = P
        P.copy(temp, t)
        P.toLocalRadiusPoint(t, matrix, temp)
        return temp
    },

    toLocalRadiusPoint(t: IRadiusPointData, matrix: IMatrixData, to?: IRadiusPointData): void {
        to || (to = t)
        toLocalPoint(matrix, t, to)
        to.radiusX = t.radiusX / matrix.a
        to.radiusY = t.radiusY / matrix.d
    },


    toLocal(t: IPointData, matrix: IMatrixData, to?: IPointData): void {
        toLocalPoint(matrix, t, to)
    },

    toWorld(t: IPointData, matrix: IMatrixData, to?: IPointData): void {
        toWorldPoint(matrix, t, to)
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

    getAtan2(t: IPointData, to: IPointData): number {
        return atan2(to.y - t.y, to.x - t.x)
    },


    getDistancePoint(t: IPointData, to: IPointData, distance: number): IPointData {
        const r = P.getAtan2(t, to)
        return { x: t.x + cos(r) * distance, y: t.y + sin(r) * distance }
    }

}

const P = PointHelper