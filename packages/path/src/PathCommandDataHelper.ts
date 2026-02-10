import { IPathCommandData, IPointData } from '@leafer/interface'
import { MathHelper, PointHelper } from '@leafer/math'
import { isNumber, isUndefined, isNull } from '@leafer/data'

import { PathCommandMap } from './PathCommandMap'
import { BezierHelper } from './BezierHelper'


const { M, L, C, Q, Z, N, D, X, G, F, O, P, U } = PathCommandMap
const { getMinDistanceFrom, getRadianFrom } = PointHelper
const { tan, min, abs } = Math
const startPoint = {} as IPointData

export const PathCommandDataHelper = {

    beginPath(data: IPathCommandData): void {
        data.length = 0
    },

    // svg and canvas

    moveTo(data: IPathCommandData, x: number, y: number): void {
        data.push(M, x, y)
    },

    lineTo(data: IPathCommandData, x: number, y: number): void {
        data.push(L, x, y)
    },

    bezierCurveTo(data: IPathCommandData, x1: number, y1: number, x2: number, y2: number, x: number, y: number): void {
        data.push(C, x1, y1, x2, y2, x, y)
    },

    quadraticCurveTo(data: IPathCommandData, x1: number, y1: number, x: number, y: number): void {
        data.push(Q, x1, y1, x, y)
    },

    closePath(data: IPathCommandData): void {
        data.push(Z)
    },

    // canvas

    rect(data: IPathCommandData, x: number, y: number, width: number, height: number): void {
        data.push(N, x, y, width, height)
    },

    roundRect(data: IPathCommandData, x: number, y: number, width: number, height: number, cornerRadius: number | number[]): void {
        if (isNumber(cornerRadius)) {
            data.push(X, x, y, width, height, cornerRadius)
        } else {
            const fourCorners = MathHelper.fourNumber(cornerRadius)
            if (fourCorners) {
                data.push(D, x, y, width, height, ...fourCorners)
            } else {
                data.push(N, x, y, width, height)
            }
        }
    },

    ellipse(data: IPathCommandData, x: number, y: number, radiusX: number, radiusY: number, rotation?: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): void {
        if (radiusX === radiusY) return arc(data, x, y, radiusX, startAngle, endAngle, anticlockwise)
        if (isNull(rotation)) {
            data.push(F, x, y, radiusX, radiusY)
        } else {
            if (isNull(startAngle)) startAngle = 0
            if (isNull(endAngle)) endAngle = 360
            data.push(G, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise ? 1 : 0)
        }
    },

    arc(data: IPathCommandData, x: number, y: number, radius: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): void {
        if (isNull(startAngle)) {
            data.push(P, x, y, radius)
        } else {
            if (isNull(startAngle)) startAngle = 0
            if (isNull(endAngle)) endAngle = 360
            data.push(O, x, y, radius, startAngle, endAngle, anticlockwise ? 1 : 0)
        }
    },

    arcTo(data: IPathCommandData, x1: number, y1: number, x2: number, y2: number, radius: number, lastX?: number, lastY?: number, fullRadius?: boolean): void {
        if (!isUndefined(lastX)) {
            const r = getMinDistanceFrom(lastX, lastY, x1, y1, x2, y2) / (fullRadius ? 1 : 2)
            radius = min(radius, min(r, r * abs(tan(getRadianFrom(lastX, lastY, x1, y1, x2, y2) / 2))))
        }
        data.push(U, x1, y1, x2, y2, radius)
    },

    // new

    drawEllipse(data: IPathCommandData, x: number, y: number, radiusX: number, radiusY: number, rotation?: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): void {
        BezierHelper.ellipse(null, x, y, radiusX, radiusY, isNull(rotation) ? 0 : rotation, isNull(startAngle) ? 0 : startAngle, isNull(endAngle) ? 360 : endAngle, anticlockwise, null, null, startPoint)
        data.push(M, startPoint.x, startPoint.y)
        ellipse(data, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
    },

    drawArc(data: IPathCommandData, x: number, y: number, radius: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): void {
        BezierHelper.arc(null, x, y, radius, isNull(startAngle) ? 0 : startAngle, isNull(endAngle) ? 360 : endAngle, anticlockwise, null, null, startPoint)
        data.push(M, startPoint.x, startPoint.y)
        arc(data, x, y, radius, startAngle, endAngle, anticlockwise)
    },

    drawPoints(data: IPathCommandData, points: number[] | IPointData[], curve?: boolean | number, close?: boolean): void {
        BezierHelper.points(data, points, curve, close)
    }

}

const { ellipse, arc } = PathCommandDataHelper
