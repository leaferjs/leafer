import { ITwoPointBoundsData, IPathCommandData, IBoundsData, IPointData } from '@leafer/interface'
import { TwoPointBoundsHelper } from '@leafer/math'
import { Debug } from '@leafer/debug'

import { BezierHelper } from './BezierHelper'
import { PathCommandMap as Command } from './PathCommandMap'


const { M, L, C, Q, Z, N, D, X, G, F, O, P, U } = Command
const { toTwoPointBounds, toTwoPointBoundsByQuadraticCurve, arcTo, arc, ellipse } = BezierHelper
const { addPointBounds, copy, addPoint, setPoint, addBounds, toBounds } = TwoPointBoundsHelper
const debug = Debug.get('PathBounds')

let radius: number, radiusX: number, radiusY: number
const tempPointBounds = {} as ITwoPointBoundsData
const setPointBounds = {} as ITwoPointBoundsData
const setEndPoint = {} as IPointData

export const PathBounds = {

    toBounds(data: IPathCommandData, setBounds: IBoundsData): void {
        PathBounds.toTwoPointBounds(data, setPointBounds)
        toBounds(setPointBounds, setBounds)
    },

    toTwoPointBounds(data: IPathCommandData, setPointBounds: ITwoPointBoundsData): void {
        if (!data || !data.length) return setPoint(setPointBounds, 0, 0)

        let i = 0, x = 0, y = 0, x1: number, y1: number, toX: number, toY: number, command: number

        const len = data.length

        while (i < len) {
            command = data[i]

            if (i === 0) {
                if (command === Z || command === C || command === Q) {
                    setPoint(setPointBounds, x, y)
                } else {
                    setPoint(setPointBounds, data[i + 1], data[i + 2])
                }
            }

            switch (command) {
                case M: //moveto(x, y)
                case L: //lineto(x, y)
                    x = data[i + 1]
                    y = data[i + 2]
                    addPoint(setPointBounds, x, y)
                    i += 3
                    break
                case C: //bezierCurveTo(x1, y1, x2, y2, x,y)
                    toX = data[i + 5]
                    toY = data[i + 6]
                    toTwoPointBounds(x, y, data[i + 1], data[i + 2], data[i + 3], data[i + 4], toX, toY, tempPointBounds)
                    addPointBounds(setPointBounds, tempPointBounds)
                    x = toX
                    y = toY
                    i += 7
                    break
                case Q: //quadraticCurveTo(x1, y1, x, y)
                    x1 = data[i + 1]
                    y1 = data[i + 2]
                    toX = data[i + 3]
                    toY = data[i + 4]
                    toTwoPointBoundsByQuadraticCurve(x, y, x1, y1, toX, toY, tempPointBounds)
                    addPointBounds(setPointBounds, tempPointBounds)
                    x = toX
                    y = toY
                    i += 5
                    break
                case Z: //closepath()
                    i += 1
                    break

                // canvas command

                case N: // rect(x, y, width, height)
                    x = data[i + 1]
                    y = data[i + 2]
                    addBounds(setPointBounds, x, y, data[i + 3], data[i + 4])
                    i += 5
                    break
                case D: // roundRect(x, y, width, height, radius1, radius2, radius3, radius4)
                case X: // simple roundRect(x, y, width, height, radius)
                    x = data[i + 1]
                    y = data[i + 2]
                    addBounds(setPointBounds, x, y, data[i + 3], data[i + 4])
                    i += (command === D ? 9 : 6)
                    break
                case G: // ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
                    ellipse(null, data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], data[i + 6], data[i + 7], data[i + 8] as unknown as boolean, tempPointBounds, setEndPoint)
                    i === 0 ? copy(setPointBounds, tempPointBounds) : addPointBounds(setPointBounds, tempPointBounds)
                    x = setEndPoint.x
                    y = setEndPoint.y
                    i += 9
                    break
                case F: // simple ellipse(x, y, radiusX, radiusY)
                    x = data[i + 1]
                    y = data[i + 2]
                    radiusX = data[i + 3]
                    radiusY = data[i + 4]
                    addBounds(setPointBounds, x - radiusX, y - radiusY, radiusX * 2, radiusY * 2)
                    x += radiusX
                    i += 5
                    break
                case O: // arc(x, y, radius, startAngle, endAngle, anticlockwise)
                    arc(null, data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], data[i + 6] as unknown as boolean, tempPointBounds, setEndPoint)
                    i === 0 ? copy(setPointBounds, tempPointBounds) : addPointBounds(setPointBounds, tempPointBounds)
                    x = setEndPoint.x
                    y = setEndPoint.y
                    i += 7
                    break
                case P: // simple arc(x, y, radius)
                    x = data[i + 1]
                    y = data[i + 2]
                    radius = data[i + 3]
                    addBounds(setPointBounds, x - radius, y - radius, radius * 2, radius * 2)
                    x += radius
                    i += 4
                    break
                case U: // arcTo(x1, y1, x2, y2, radius)
                    arcTo(null, x, y, data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], tempPointBounds, setEndPoint)
                    i === 0 ? copy(setPointBounds, tempPointBounds) : addPointBounds(setPointBounds, tempPointBounds)
                    x = setEndPoint.x
                    y = setEndPoint.y
                    i += 6
                    break
                default:
                    debug.error(`command: ${command} [index:${i}]`, data)
                    return
            }
        }

    }

}