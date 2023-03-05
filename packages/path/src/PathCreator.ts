import { IPathCommandData } from '@leafer/interface'
import { PathCommandMap } from './PathCommandMap'


let data: IPathCommandData
const { M, L, C, Q, Z, rect, roundRect, ellipse, arc, arcTo } = PathCommandMap

export const PathCreator = {

    begin(commandData: IPathCommandData): void {
        data = commandData
    },

    end(): void {
        data = undefined
    },

    // draw

    moveTo(x: number, y: number): void {
        data.push(M, x, y)
    },

    lineTo(x: number, y: number): void {
        data.push(L, x, y)
    },

    bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void {
        data.push(C, x1, y1, x2, y2, x, y)
    },

    quadraticCurveTo(x1: number, y1: number, x: number, y: number): void {
        data.push(Q, x1, y1, x, y)
    },

    close(end?: boolean): void {
        data.push(Z)
        if (end) data = undefined
    },


    // 非svg标准的canvas绘图命令

    rect(x: number, y: number, width: number, height: number): void {
        data.push(rect, x, y, width, height)
    },

    roundRect(x: number, y: number, width: number, height: number, cornerRadius?: number | number[]): void {
        data.push(roundRect, x, y, width, height, cornerRadius as unknown as number)
    },

    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
        data.push(ellipse, x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise as unknown as number)
    },

    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
        data.push(arc, x, y, radius, startAngle, endAngle, counterclockwise as unknown as number)
    },

    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
        data.push(arcTo, x1, y1, x2, y2, radius)
    }

}
