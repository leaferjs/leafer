import { IPathCommandData, IPointData } from '@leafer/interface'
import { PathCommandMap } from './PathCommandMap'
import { BezierHelper } from './BezierHelper'
import { MathHelper } from '@leafer/math'


const { M, L, C, Q, Z, N, D, X, G, F, O, P, U } = PathCommandMap
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
        if (typeof cornerRadius === 'number') {
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
        if (rotation === undefined) {
            data.push(F, x, y, radiusX, radiusY)
        } else {
            if (startAngle === undefined) startAngle = 0
            if (endAngle === undefined) endAngle = 360
            data.push(G, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise ? 1 : 0)
        }
    },

    arc(data: IPathCommandData, x: number, y: number, radius: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): void {
        if (startAngle === undefined) {
            data.push(P, x, y, radius)
        } else {
            if (endAngle === undefined) endAngle = 360
            data.push(O, x, y, radius, startAngle, endAngle, anticlockwise ? 1 : 0)
        }
    },

    moveToEllipse(data: IPathCommandData, x: number, y: number, radiusX: number, radiusY: number, rotation?: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): void {
        if (rotation === undefined) rotation = 0
        if (startAngle === undefined) startAngle = 0
        if (endAngle === undefined) endAngle = 360
        BezierHelper.ellipse(null, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise, null, null, startPoint)
        data.push(M, startPoint.x, startPoint.y)
        ellipse(data, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
    },

    moveToArc(data: IPathCommandData, x: number, y: number, radius: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): void {
        if (startAngle === undefined) startAngle = 0
        if (endAngle === undefined) endAngle = 360
        BezierHelper.arc(null, x, y, radius, startAngle, endAngle, anticlockwise, null, null, startPoint)
        data.push(M, startPoint.x, startPoint.y)
        arc(data, x, y, radius, startAngle, endAngle, anticlockwise)
    },

    arcTo(data: IPathCommandData, x1: number, y1: number, x2: number, y2: number, radius: number): void {
        data.push(U, x1, y1, x2, y2, radius)
    },

    // new
    points(data: IPathCommandData, point: number[], _curve: number): void {
        for (let i = 0, len = point.length; i < len; i += 2) {
            if (i === 0) {
                data.push(M, point[i], point[i + 1])
            } else {
                data.push(L, point[i], point[i + 1])
            }
        }
    }
}

const { ellipse, arc } = PathCommandDataHelper
