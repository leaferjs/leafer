import { IPathDrawer, IPathCommandData } from '@leafer/interface'
import { OneRadian, PI2 } from '@leafer/math'
import { Debug } from '@leafer/debug'

import { PathCommandMap as Command } from './PathCommandMap'


const { M, L, C, Q, Z, N, D, X, G, F, O, P, U } = Command
const debug = Debug.get('PathDrawer')

export const PathDrawer = {

    drawPathByData(drawer: IPathDrawer, data: IPathCommandData): void {
        if (!data) return

        let command: number
        let i = 0, len = data.length

        while (i < len) {
            command = data[i]
            switch (command) {
                case M:  //moveto(x, y)
                    drawer.moveTo(data[i + 1], data[i + 2])
                    i += 3
                    break
                case L:  //lineto(x, y)
                    drawer.lineTo(data[i + 1], data[i + 2])
                    i += 3
                    break
                case C:  //bezierCurveTo(x1, y1, x2, y2, x, y)
                    drawer.bezierCurveTo(data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], data[i + 6])
                    i += 7
                    break
                case Q:  //quadraticCurveTo(x1, y1, x, y)
                    drawer.quadraticCurveTo(data[i + 1], data[i + 2], data[i + 3], data[i + 4])
                    i += 5
                    break
                case Z:  //closepath()
                    drawer.closePath()
                    i += 1
                    break

                // canvas command

                case N: // rect(x, y, width, height)
                    drawer.rect(data[i + 1], data[i + 2], data[i + 3], data[i + 4])
                    i += 5
                    break
                case D: // roundRect(x, y, width, height, radius1, radius2, radius3, radius4)
                    drawer.roundRect(data[i + 1], data[i + 2], data[i + 3], data[i + 4], [data[i + 5], data[i + 6], data[i + 7], data[i + 8]])
                    i += 9
                    break
                case X: // simple roundRect(x, y, width, height, radius)
                    drawer.roundRect(data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5])
                    i += 6
                    break
                case G: // ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
                    drawer.ellipse(data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5] * OneRadian, data[i + 6] * OneRadian, data[i + 7] * OneRadian, data[i + 8] as unknown as boolean)
                    i += 9
                    break
                case F: // simple ellipse(x, y, radiusX, radiusY)
                    drawer.ellipse(data[i + 1], data[i + 2], data[i + 3], data[i + 4], 0, 0, PI2, false)
                    i += 5
                    break
                case O: // arc(x, y, radius, startAngle, endAngle, anticlockwise)
                    drawer.arc(data[i + 1], data[i + 2], data[i + 3], data[i + 4] * OneRadian, data[i + 5] * OneRadian, data[i + 6] as unknown as boolean)
                    i += 7
                    break
                case P: // simple arc(x, y, radius)
                    drawer.arc(data[i + 1], data[i + 2], data[i + 3], 0, PI2, false)
                    i += 4
                    break
                case U: // arcTo(x1, y1, x2, y2, radius)
                    drawer.arcTo(data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5])
                    i += 6
                    break
                default:
                    debug.error(`command: ${command} [index:${i}]`, data)
                    return
            }
        }

    }

}