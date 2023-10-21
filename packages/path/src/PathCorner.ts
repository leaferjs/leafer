import { IPathCommandData } from '@leafer/interface'
import { PathCommandMap as Command } from './PathCommandMap'


const { M, L, C, Z, U } = Command

export const PathCorner = {

    smooth(data: IPathCommandData, cornerRadius: number, _cornerSmoothing?: number): IPathCommandData {
        let command: number
        let i: number = 0, x: number = 0, y: number = 0, startX: number, startY = 0, centerX: number = 0, centerY: number = 0

        const len = data.length
        const smooth: IPathCommandData = []

        while (i < len) {
            command = data[i]
            switch (command) {
                case M:  //moveto(x, y)
                    startX = data[i + 1]
                    startY = data[i + 2]
                    i += 3
                    if (data[i] === L) { // next lineTo
                        centerX = startX + (data[i + 1] - startX) / 2
                        centerY = startY + (data[i + 2] - startY) / 2
                        smooth.push(M, centerX, centerY)
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
                            smooth.push(U, x, y, data[i + 1], data[i + 2], cornerRadius) // use arcTo(x1, y1, x2, y2, radius)
                            break
                        case Z: // closePath()
                            smooth.push(U, x, y, startX, startY, cornerRadius) // use arcTo(x1, y1, x2, y2, radius)
                            break
                        default:
                            smooth.push(L, x, y)
                    }
                    break
                case C:  //bezierCurveTo(x1, y1, x2, y2, x, y)
                    smooth.push(C, data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], data[i + 6])
                    i += 7
                    break
                case Z:  //closepath()
                    smooth.push(U, startX, startY, centerX, centerY, cornerRadius) // use arcTo(x1, y1, x2, y2, radius)
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