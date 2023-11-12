import { IPathCommandData } from '@leafer/interface'
import { PointHelper } from '@leafer/math'

import { PathCommandMap as Command } from './PathCommandMap'
import { PathCommandDataHelper } from './PathCommandDataHelper'


const { M, L, C, Z } = Command
const { getCenterX, getCenterY } = PointHelper
const { arcTo } = PathCommandDataHelper

export const PathCorner = {

    smooth(data: IPathCommandData, cornerRadius: number, _cornerSmoothing?: number): IPathCommandData {
        let command: number
        let i = 0, x = 0, y = 0, startX = 0, startY = 0, secondX = 0, secondY = 0, lastX = 0, lastY = 0

        const len = data.length
        const smooth: IPathCommandData = []

        while (i < len) {
            command = data[i]
            switch (command) {
                case M:  //moveto(x, y)
                    startX = lastX = data[i + 1]
                    startY = lastY = data[i + 2]
                    i += 3
                    if (data[i] === L) { // next lineTo
                        secondX = data[i + 1]
                        secondY = data[i + 2]
                        smooth.push(M, getCenterX(startX, secondX), getCenterY(startY, secondY))
                    } else {
                        smooth.push(M, startX, startY)
                    }
                    break
                case L:  //lineto(x, y)
                    x = data[i + 1]
                    y = data[i + 2]
                    i += 3
                    switch (data[i]) { // next command
                        case L: // lineTo()
                            arcTo(smooth, x, y, data[i + 1], data[i + 2], cornerRadius, lastX, lastY) // use arcTo(x1, y1, x2, y2, radius)
                            break
                        case Z: // closePath()
                            arcTo(smooth, x, y, startX, startY, cornerRadius, lastX, lastY) // use arcTo(x1, y1, x2, y2, radius)
                            break
                        default:
                            smooth.push(L, x, y)
                    }
                    lastX = x
                    lastY = y
                    break
                case C:  //bezierCurveTo(x1, y1, x2, y2, x, y)
                    smooth.push(C, data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], data[i + 6])
                    i += 7
                    break
                case Z:  //closepath()
                    arcTo(smooth, startX, startY, secondX, secondY, cornerRadius, lastX, lastY) // use arcTo(x1, y1, x2, y2, radius)
                    smooth.push(Z)
                    i += 1
                    break

            }
        }

        if (command !== Z) {
            smooth[1] = startX
            smooth[2] = startY
        }

        return smooth
    }

}