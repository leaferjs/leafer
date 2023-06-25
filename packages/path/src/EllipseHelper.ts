import { IPathCommandData } from '@leafer/interface'
import { OneRadian, PI2 } from '@leafer/math'

import { PathCommandMap } from './PathCommandMap'
import { BezierHelper } from './BezierHelper'

const { sin, cos, sqrt, atan2 } = Math
const { ellipse } = BezierHelper

export const EllipseHelper = {

    // svg 
    ellipticalArc(data: IPathCommandData, fromX: number, fromY: number, radiusX: number, radiusY: number, rotation: number, largeFlag: number, sweepFlag: number, toX: number, toY: number, curveMode?: boolean): void {

        const halfX = (toX - fromX) / 2
        const halfY = (toY - fromY) / 2

        const rotationRadian = rotation * OneRadian
        const rotationSin = sin(rotationRadian)
        const rotationCos = cos(rotationRadian)

        const px = -rotationCos * halfX - rotationSin * halfY
        const py = -rotationCos * halfY + rotationSin * halfX
        const rxSquare = radiusX * radiusX
        const rySquare = radiusY * radiusY
        const pySquare = py * py
        const pxSquare = px * px

        const a = rxSquare * rySquare - rxSquare * pySquare - rySquare * pxSquare
        let s = 0

        if (a < 0) {
            const t = sqrt(1 - a / (rxSquare * rySquare))
            radiusX *= t
            radiusY *= t
        } else {
            s = (largeFlag === sweepFlag ? -1 : 1) * sqrt(a / (rxSquare * pySquare + rySquare * pxSquare))
        }

        const cx = s * radiusX * py / radiusY
        const cy = -s * radiusY * px / radiusX

        const startRadian = atan2((py - cy) / radiusY, (px - cx) / radiusX)
        const endRadian = atan2((-py - cy) / radiusY, (-px - cx) / radiusX)

        let totalRadian = endRadian - startRadian

        if (sweepFlag === 0 && totalRadian > 0) {
            totalRadian -= PI2
        } else if (sweepFlag === 1 && totalRadian < 0) {
            totalRadian += PI2
        }

        const centerX = fromX + halfX + rotationCos * cx - rotationSin * cy
        const centerY = fromY + halfY + rotationSin * cx + rotationCos * cy

        const anticlockwise = totalRadian < 0 ? 1 : 0

        if (curveMode) {
            ellipse(data, centerX, centerY, radiusX, radiusY, rotation, startRadian / OneRadian, endRadian / OneRadian, anticlockwise as unknown as boolean)
        } else {
            if (radiusX === radiusY && !rotation) {
                data.push(PathCommandMap.O, centerX, centerY, radiusX, startRadian / OneRadian, endRadian / OneRadian, anticlockwise)
            } else {
                data.push(PathCommandMap.G, centerX, centerY, radiusX, radiusY, rotation, startRadian / OneRadian, endRadian / OneRadian, anticlockwise)
            }
        }
    }

}
