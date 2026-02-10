import { IPathCommandData } from '@leafer/interface'
import { PointHelper } from '@leafer/math'
import { isArray } from '@leafer/data'

import { PathCommandMap as Command, PathNumberCommandLengthMap } from './PathCommandMap'
import { PathCommandDataHelper } from './PathCommandDataHelper'


const { M, L, Z } = Command
const { getCenterX, getCenterY } = PointHelper
const { arcTo } = PathCommandDataHelper

export const PathCorner = {

    smooth(data: IPathCommandData, cornerRadius: number, _cornerSmoothing?: number): IPathCommandData {

        let command: number, lastCommand: number, commandLen
        let i = 0, x = 0, y = 0, startX = 0, startY = 0, secondX = 0, secondY = 0, lastX = 0, lastY = 0
        if (isArray(cornerRadius)) cornerRadius = cornerRadius[0] || 0

        const len = data.length, three = len === 9 // 3个点时可以加大圆角
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
                        three ? smooth.push(M, startX, startY) : smooth.push(M, getCenterX(startX, secondX), getCenterY(startY, secondY))
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
                            arcTo(smooth, x, y, data[i + 1], data[i + 2], cornerRadius, lastX, lastY, three) // use arcTo(x1, y1, x2, y2, radius)
                            break
                        case Z: // closePath()
                            arcTo(smooth, x, y, startX, startY, cornerRadius, lastX, lastY, three) // use arcTo(x1, y1, x2, y2, radius)
                            break
                        default:
                            smooth.push(L, x, y)
                    }
                    lastX = x
                    lastY = y
                    break
                case Z:  //closepath()
                    if (lastCommand !== Z) { // fix: 重复的 Z 导致的问题
                        arcTo(smooth, startX, startY, secondX, secondY, cornerRadius, lastX, lastY, three) // use arcTo(x1, y1, x2, y2, radius)
                        smooth.push(Z)
                    }
                    i += 1
                    break
                default:
                    commandLen = PathNumberCommandLengthMap[command]
                    for (let j = 0; j < commandLen; j++) smooth.push(data[i + j])
                    i += commandLen
            }
            lastCommand = command
        }

        if (command !== Z) {
            smooth[1] = startX
            smooth[2] = startY
        }

        return smooth
    }

}