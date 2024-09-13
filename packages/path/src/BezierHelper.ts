import { IPointData, ITwoPointBoundsData, IPathCommandData } from '@leafer/interface'
import { OneRadian, PI2, PI_2, PointHelper, TwoPointBoundsHelper } from '@leafer/math'

import { PathCommandMap } from './PathCommandMap'
import { RectHelper } from './RectHelper'
import { PathHelper } from './PathHelper'


const { sin, cos, atan2, ceil, abs, PI, sqrt, pow } = Math
const { setPoint, addPoint } = TwoPointBoundsHelper
const { set } = PointHelper
const { M, L, C, Q, Z } = PathCommandMap
const tempPoint = {} as IPointData

export const BezierHelper = {

    points(data: IPathCommandData, points: number[], curve?: boolean | number, close?: boolean): void {
        data.push(M, points[0], points[1])

        if (curve && points.length > 5) {

            let aX: number, aY: number, bX: number, bY: number, cX: number, cY: number, c1X: number, c1Y: number, c2X: number, c2Y: number
            let ba: number, cb: number, d: number, len = points.length
            const t = curve === true ? 0.5 : curve as number

            if (close) {
                points = [points[len - 2], points[len - 1], ...points, points[0], points[1], points[2], points[3]]
                len = points.length
            }

            for (let i = 2; i < len - 2; i += 2) {
                aX = points[i - 2]
                aY = points[i - 1]

                bX = points[i]
                bY = points[i + 1]

                cX = points[i + 2]
                cY = points[i + 3]

                ba = sqrt(pow(bX - aX, 2) + pow(bY - aY, 2))
                cb = sqrt(pow(cX - bX, 2) + pow(cY - bY, 2))

                d = ba + cb
                ba = (t * ba) / d
                cb = (t * cb) / d

                cX -= aX
                cY -= aY

                c1X = bX - ba * cX
                c1Y = bY - ba * cY

                if (i === 2) {
                    if (!close) data.push(Q, c1X, c1Y, bX, bY)
                } else {
                    data.push(C, c2X, c2Y, c1X, c1Y, bX, bY)
                }

                c2X = bX + cb * cX
                c2Y = bY + cb * cY
            }

            if (!close) data.push(Q, c2X, c2Y, points[len - 2], points[len - 1])

        } else {

            for (let i = 2, len = points.length; i < len; i += 2) {
                data.push(L, points[i], points[i + 1])
            }

        }

        if (close) data.push(Z)
    },

    rect(data: IPathCommandData, x: number, y: number, width: number, height: number) {
        PathHelper.creator.path = data
        PathHelper.creator.moveTo(x, y).lineTo(x + width, y).lineTo(x + width, y + height).lineTo(x, y + height).lineTo(x, y)
    },

    roundRect(data: IPathCommandData, x: number, y: number, width: number, height: number, radius: number | number[]): void {
        PathHelper.creator.path = []
        RectHelper.drawRoundRect(PathHelper.creator, x, y, width, height, radius)
        data.push(...PathHelper.convertToCanvasData(PathHelper.creator.path, true))
    },

    arcTo(data: IPathCommandData | null | void, fromX: number, fromY: number, x1: number, y1: number, toX: number, toY: number, radius: number, setPointBounds?: ITwoPointBoundsData, setEndPoint?: IPointData, setStartPoint?: IPointData): void {
        const BAx = x1 - fromX
        const BAy = y1 - fromY
        const CBx = toX - x1
        const CBy = toY - y1

        let startRadian = atan2(BAy, BAx)
        let endRadian = atan2(CBy, CBx)
        let totalRadian = endRadian - startRadian
        if (totalRadian < 0) totalRadian += PI2

        if (totalRadian === PI || (abs(BAx + BAy) < 1.e-12) || (abs(CBx + CBy) < 1.e-12)) { // invalid
            if (data) data.push(L, x1, y1)
            if (setPointBounds) {
                setPoint(setPointBounds, fromX, fromY)
                addPoint(setPointBounds, x1, y1)
            }
            if (setStartPoint) set(setStartPoint, fromX, fromY)
            if (setEndPoint) set(setEndPoint, x1, y1)
            return
        }

        const anticlockwise = BAx * CBy - CBx * BAy < 0
        const sign = anticlockwise ? -1 : 1
        const c = radius / cos(totalRadian / 2)

        const centerX = x1 + c * cos(startRadian + totalRadian / 2 + PI_2 * sign)
        const centerY = y1 + c * sin(startRadian + totalRadian / 2 + PI_2 * sign)
        startRadian -= PI_2 * sign
        endRadian -= PI_2 * sign

        return ellipse(data, centerX, centerY, radius, radius, 0, startRadian / OneRadian, endRadian / OneRadian, anticlockwise, setPointBounds, setEndPoint, setStartPoint)
    },

    arc(data: IPathCommandData | null | void, x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean, setPointBounds?: ITwoPointBoundsData, setEndPoint?: IPointData, setStartPoint?: IPointData): void {
        return ellipse(data, x, y, radius, radius, 0, startAngle, endAngle, anticlockwise, setPointBounds, setEndPoint, setStartPoint)
    },

    ellipse(data: IPathCommandData | null | void, cx: number, cy: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean, setPointBounds?: ITwoPointBoundsData, setEndPoint?: IPointData, setStartPoint?: IPointData): void {
        const rotationRadian = rotation * OneRadian
        const rotationSin = sin(rotationRadian)
        const rotationCos = cos(rotationRadian)

        let startRadian = startAngle * OneRadian
        let endRadian = endAngle * OneRadian

        if (startRadian > PI) startRadian -= PI2
        if (endRadian < 0) endRadian += PI2

        let totalRadian = endRadian - startRadian
        if (totalRadian < 0) totalRadian += PI2
        else if (totalRadian > PI2) totalRadian -= PI2

        if (anticlockwise) totalRadian -= PI2


        const parts = ceil(abs(totalRadian / PI_2))
        const partRadian = totalRadian / parts
        const partRadian4Sin = sin(partRadian / 4)
        const control = 8 / 3 * partRadian4Sin * partRadian4Sin / sin(partRadian / 2)

        endRadian = startRadian + partRadian

        let startCos = cos(startRadian)
        let startSin = sin(startRadian)
        let endCos: number, endSin: number

        let x: number, y: number, x1: number, y1: number, x2: number, y2: number

        let startX = x = rotationCos * radiusX * startCos - rotationSin * radiusY * startSin
        let startY = y = rotationSin * radiusX * startCos + rotationCos * radiusY * startSin

        let fromX = cx + x, fromY = cy + y

        if (data) data.push(data.length ? L : M, fromX, fromY)
        if (setPointBounds) setPoint(setPointBounds, fromX, fromY)
        if (setStartPoint) set(setStartPoint, fromX, fromY)

        for (let i = 0; i < parts; i++) {

            endCos = cos(endRadian)
            endSin = sin(endRadian)

            x = rotationCos * radiusX * endCos - rotationSin * radiusY * endSin
            y = rotationSin * radiusX * endCos + rotationCos * radiusY * endSin
            x1 = cx + startX - control * (rotationCos * radiusX * startSin + rotationSin * radiusY * startCos)
            y1 = cy + startY - control * (rotationSin * radiusX * startSin - rotationCos * radiusY * startCos)
            x2 = cx + x + control * (rotationCos * radiusX * endSin + rotationSin * radiusY * endCos)
            y2 = cy + y + control * (rotationSin * radiusX * endSin - rotationCos * radiusY * endCos)

            if (data) data.push(C, x1, y1, x2, y2, cx + x, cy + y)
            if (setPointBounds) toTwoPointBounds(cx + startX, cy + startY, x1, y1, x2, y2, cx + x, cy + y, setPointBounds, true)

            startX = x
            startY = y
            startCos = endCos
            startSin = endSin
            startRadian = endRadian
            endRadian += partRadian
        }

        if (setEndPoint) set(setEndPoint, cx + x, cy + y)

    },

    quadraticCurveTo(data: IPathCommandData, fromX: number, fromY: number, x1: number, y1: number, toX: number, toY: number): void {
        data.push(C, (fromX + 2 * x1) / 3, (fromY + 2 * y1) / 3, (toX + 2 * x1) / 3, (toY + 2 * y1) / 3, toX, toY)
    },

    toTwoPointBoundsByQuadraticCurve(fromX: number, fromY: number, x1: number, y1: number, toX: number, toY: number, pointBounds: ITwoPointBoundsData, addMode?: boolean): void {
        toTwoPointBounds(fromX, fromY, (fromX + 2 * x1) / 3, (fromY + 2 * y1) / 3, (toX + 2 * x1) / 3, (toY + 2 * y1) / 3, toX, toY, pointBounds, addMode)
    },

    toTwoPointBounds(fromX: number, fromY: number, x1: number, y1: number, x2: number, y2: number, toX: number, toY: number, pointBounds: ITwoPointBoundsData, addMode?: boolean): void {

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

        addMode ? addPoint(pointBounds, fromX, fromY) : setPoint(pointBounds, fromX, fromY)
        addPoint(pointBounds, toX, toY)

        for (let i = 0, len = tList.length; i < len; i++) {
            getPointAndSet(tList[i], fromX, fromY, x1, y1, x2, y2, toX, toY, tempPoint)
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
        getPointAndSet(t, fromX, fromY, x1, y1, x2, y2, toX, toY, point)
        return point
    }

}

const { getPointAndSet, toTwoPointBounds, ellipse } = BezierHelper