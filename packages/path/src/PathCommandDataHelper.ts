import { IPathCommandData, IPointData } from '@leafer/interface'
import { PathCommandMap } from './PathCommandMap'
import { BezierHelper } from './BezierHelper'
import { MathHelper } from '@leafer/math'


const { sqrt, pow } = Math
const { M, L, C, Q, Z, N, D, X, G, F, O, P, U } = PathCommandMap
const startPoint = {} as IPointData, a = {} as IPointData, b = {} as IPointData, c = {} as IPointData, c1 = {} as IPointData, c2 = {} as IPointData

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

    arcTo(data: IPathCommandData, x1: number, y1: number, x2: number, y2: number, radius: number): void {
        data.push(U, x1, y1, x2, y2, radius)
    },

    // new

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

    points(data: IPathCommandData, points: number[], curve?: boolean | number, close?: boolean): void {
        if (curve && points.length > 5) {

            let ba: number, cb: number, d: number, len = points.length, t = curve === true ? 0.5 : curve as number

            data.push(M, points[0], points[1])

            if (close) {
                points = [points[len - 2], points[len - 1], ...points, points[0], points[1], points[2], points[3]]
                len = points.length
            }

            for (let i = 2; i < len - 2; i += 2) {
                a.x = points[i - 2]
                a.y = points[i - 1]

                b.x = points[i]
                b.y = points[i + 1]

                c.x = points[i + 2]
                c.y = points[i + 3]

                ba = sqrt(pow(b.x - a.x, 2) + pow(b.y - a.y, 2))
                cb = sqrt(pow(c.x - b.x, 2) + pow(c.y - b.y, 2))

                d = ba + cb
                ba = (t * ba) / d
                cb = (t * cb) / d

                c.x -= a.x
                c.y -= a.y

                c1.x = b.x - ba * c.x
                c1.y = b.y - ba * c.y

                if (i === 2) {
                    if (!close) data.push(Q, c1.x, c1.y, b.x, b.y)
                } else {
                    data.push(C, c2.x, c2.y, c1.x, c1.y, b.x, b.y)
                }

                c2.x = b.x + cb * c.x
                c2.y = b.y + cb * c.y
            }

            if (!close) data.push(Q, c2.x, c2.y, points[len - 2], points[len - 1])

        } else {

            for (let i = 0, len = points.length; i < len; i += 2) {
                if (i === 0) {
                    data.push(M, points[i], points[i + 1])
                } else {
                    data.push(L, points[i], points[i + 1])
                }
            }

        }

        if (close) data.push(Z)
    }

}

const { ellipse, arc } = PathCommandDataHelper
