import { ICanvasDrawPath, ITwoPointBoundsData, IPathCommandData } from '@leafer/interface'
import { TwoPointBoundsHelper } from '@leafer/math'

import { BezierHelper } from './BezierHelper'
import { PathCommandMap as Command } from './PathCommandMap'


const { M, L, C, Q, Z, ellipse: E } = Command
const { toTwoPointBounds } = BezierHelper
const { add, addPoint, setPoint } = TwoPointBoundsHelper

const tempPointBounds = {} as ITwoPointBoundsData

export const PathHelper = {

    applyCorner(data: IPathCommandData, cornerRadius: number, cornerSmoothing?: number): IPathCommandData {
        return data
    },

    toTwoPointBounds(data: IPathCommandData, setPointBounds: ITwoPointBoundsData): void {

        let command: number
        let i: number = 0, x: number, y: number, x1: number, y1: number, toX: number, toY: number

        const len = data.length

        while (i < len) {
            command = data[i]

            if (i === 0) {
                (command === M) ? setPoint(setPointBounds, data[1], data[2]) : setPoint(setPointBounds, 0, 0)
            }

            switch (command) {
                case M: //moveto x,y
                case L: //lineto x,y
                    x = data[i + 1]
                    y = data[i + 2]
                    addPoint(setPointBounds, x, y)
                    i += 3
                    break
                case C: //bezierCurveTo x1,y1,x2,y2,x,y
                    toX = data[i + 5]
                    toY = data[i + 6]
                    toTwoPointBounds(x, y, data[i + 1], data[i + 2], data[i + 3], data[i + 4], toX, toY, tempPointBounds)
                    add(setPointBounds, tempPointBounds)
                    x = toX
                    y = toY
                    i += 7
                    break
                case Q: //quadraticCurveTo x1,y1,x,y
                    x1 = data[i + 1]
                    y1 = data[i + 2]
                    toX = data[i + 3]
                    toY = data[i + 4]
                    toTwoPointBounds(x, y, x1, y1, x1, y1, toX, toY, tempPointBounds)
                    add(setPointBounds, tempPointBounds)
                    x = toX
                    y = toY
                    i += 5
                    break
                case Z: //closepath
                    i += 1
                    break
            }
        }

        //  增加1px的扩展，否则会有问题
        setPointBounds.minX--
        setPointBounds.minY--
        setPointBounds.maxX++
        setPointBounds.maxY++

    },

    drawData(drawer: ICanvasDrawPath, data: IPathCommandData): void {
        let command: number
        let i = 0, len = data.length

        while (i < len) {
            command = data[i]
            switch (command) {
                case M:  //moveto x,y
                    drawer.moveTo(data[i + 1], data[i + 2])
                    i += 3
                    break
                case L:  //lineto x,y
                    drawer.lineTo(data[i + 1], data[i + 2])
                    i += 3
                    break
                case C:  //bezierCurveTo x1,y1,x2,y2,x,y
                    drawer.bezierCurveTo(data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], data[i + 6])
                    i += 7
                    break
                case Q:  //quadraticCurveTo x1,y1,x,y
                    drawer.quadraticCurveTo(data[i + 1], data[i + 2], data[i + 3], data[i + 4])
                    i += 5
                    break
                case Z:  //closepath
                    drawer.closePath()
                    i += 1
                    break

                // 非svg标准的canvas绘图命令
                case E:
                    drawer.ellipse(data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], data[i + 6], data[i + 7], data[i + 8] as unknown as boolean)
                    i += 9
                    break
            }
        }
    }

}