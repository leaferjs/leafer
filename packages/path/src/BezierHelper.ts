import { IPointData, ITwoPointBoundsData, IPathCommandData } from '@leafer/interface'
import { TwoPointBoundsHelper } from '@leafer/math'

import { PathCommandMap } from './PathCommandMap'


const tempPoint = {} as IPointData
const { sin, cos, sqrt, atan2, ceil, abs, PI } = Math
const { setPoint, addPoint } = TwoPointBoundsHelper

export const BezierHelper = {

    getFromACommand(fromX: number, fromY: number, rx: number, ry: number, rotateAngle: number, largeFlag: number, sweepFlag: number, toX: number, toY: number): IPathCommandData { //  [...CCommandData, ...CCommandData]

        const localToX = toX - fromX
        const localToY = toY - fromY

        const rotation = rotateAngle * PI / 180
        const sinRotation = sin(rotation)
        const cosRotation = cos(rotation)

        const ax = -cosRotation * localToX * 0.5 - sinRotation * localToY * 0.5
        const ay = -cosRotation * localToY * 0.5 + sinRotation * localToX * 0.5
        const rxSquare = rx * rx
        const rySquare = ry * ry
        const pySquare = ay * ay
        const pxSquare = ax * ax
        const a = rxSquare * rySquare - rxSquare * pySquare - rySquare * pxSquare
        let sr = 0

        if (a < 0) {
            const scale = sqrt(1 - a / (rxSquare * rySquare))
            rx *= scale
            ry *= scale
        } else {
            const sign = largeFlag === sweepFlag ? -1 : 1
            sr = sign * sqrt(a / (rxSquare * pySquare + rySquare * pxSquare))
        }

        const cx = sr * rx * ay / ry
        const cy = -sr * ry * ax / rx
        const cx1 = cosRotation * cx - sinRotation * cy + localToX * 0.5
        const cy1 = sinRotation * cx + cosRotation * cy + localToY * 0.5

        let r1 = atan2((ay - cy) / ry, (ax - cx) / rx)
        let r2 = atan2((-ay - cy) / ry, (-ax - cx) / rx)
        let totalRadian = r2 - r1

        if (sweepFlag === 0 && totalRadian > 0) {
            totalRadian -= 2 * PI
        } else if (sweepFlag === 1 && totalRadian < 0) {
            totalRadian += 2 * PI
        }

        // segments arc
        const data: IPathCommandData = []
        const segments = ceil(abs(totalRadian / PI * 2))
        const segmentRadian = totalRadian / segments
        const sinSegmentRadian2 = sin(segmentRadian / 2)
        const sinSegmentRadian4 = sin(segmentRadian / 4)
        const controlRadian = 8 / 3 * sinSegmentRadian4 * sinSegmentRadian4 / sinSegmentRadian2

        r1 = 0
        r2 = atan2((ay - cy) / ry, (ax - cx) / rx)
        let startRadian = r2 - r1
        let endRadian = startRadian + segmentRadian
        let cosStart = cos(startRadian)
        let sinStart = sin(startRadian)
        let cosEnd: number, sinEnd: number
        let startX = 0, startY = 0

        let x: number, y: number, x1: number, y1: number, x2: number, y2: number
        for (let i = 0; i < segments; i++) {

            cosEnd = cos(endRadian)
            sinEnd = sin(endRadian)

            // segment bezier
            x = cosRotation * rx * cosEnd - sinRotation * ry * sinEnd + cx1
            y = sinRotation * rx * cosEnd + cosRotation * ry * sinEnd + cy1
            x1 = startX + controlRadian * (-cosRotation * rx * sinStart - sinRotation * ry * cosStart)
            y1 = startY + controlRadian * (-sinRotation * rx * sinStart + cosRotation * ry * cosStart)
            x2 = x + controlRadian * (cosRotation * rx * sinEnd + sinRotation * ry * cosEnd)
            y2 = y + controlRadian * (sinRotation * rx * sinEnd - cosRotation * ry * cosEnd)

            data.push(PathCommandMap.C, x1 + fromX, y1 + fromY, x2 + fromX, y2 + fromY, x + fromX, y + fromY)

            startX = x
            startY = y
            startRadian = endRadian
            cosStart = cosEnd
            sinStart = sinEnd
            endRadian += segmentRadian

        }

        return data

    },

    toTwoPointBounds(fromX: number, fromY: number, x1: number, y1: number, x2: number, y2: number, toX: number, toY: number, pointBounds: ITwoPointBoundsData): void {

        const tList = []
        let a, b, c, t, t1, t2, v, sqrtV
        let f = fromX, z1 = x1, z2 = x2, o = toX

        for (let i = 0; i < 2; ++i) {

            if (i == 1) {
                f = fromY, z1 = y1, z2 = y2, o = toY
            }

            a = -3 * f + 9 * z1 - 9 * z2 + 3 * o
            b = 6 * f - 12 * z1 + 6 * z2
            c = 3 * z1 - 3 * f

            if (Math.abs(a) < 1e-12) {
                if (Math.abs(b) < 1e-12) continue
                t = -c / b
                if (0 < t && t < 1) tList.push(t)
                continue
            }

            v = b * b - 4 * c * a
            sqrtV = Math.sqrt(v)
            if (v < 0) continue

            t1 = (-b + sqrtV) / (2 * a)
            if (0 < t1 && t1 < 1) tList.push(t1)
            t2 = (-b - sqrtV) / (2 * a)
            if (0 < t2 && t2 < 1) tList.push(t2)
        }

        setPoint(pointBounds, fromX, fromY)
        addPoint(pointBounds, toX, toY)

        for (let i = 0, len = tList.length; i < len; i++) {
            B.getPointAndSet(tList[i], fromX, fromY, x1, y1, x2, y2, toX, toY, tempPoint)
            addPoint(pointBounds, tempPoint.x, tempPoint.y)
        }
    },

    getPointAndSet(t: number, fromX: number, fromY: number, x1: number, y1: number, x2: number, y2: number, toX: number, toY: number, setPoint: IPointData): void {
        const o = 1 - t, a = o * o * o, b = 3 * o * o * t, c = 3 * o * t * t, d = t * t * t
        setPoint.x = a * fromX + b * x1 + c * x2 + d * toX
        setPoint.y = a * fromY + b * y1 + c * y2 + d * toY
    },

    getPoint(t: number, fromX: number, fromY: number, x1: number, y1: number, x2: number, y2: number, toX: number, toY: number): IPointData {
        const point = {} as IPointData
        B.getPointAndSet(t, fromX, fromY, x1, y1, x2, y2, toX, toY, point)
        return point
    }

}

const B = BezierHelper