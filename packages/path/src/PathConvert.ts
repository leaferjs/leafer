import { IPathCommandData, IPointData } from '@leafer/interface'
import { StringNumberMap } from '@leafer/math'
import { Debug } from '@leafer/debug'

import { PathCommandMap as Command, NeedConvertToCanvasCommandMap, NeedConvertToCurveCommandMap, PathCommandLengthMap, PathNumberCommandMap, PathNumberCommandLengthMap } from './PathCommandMap'
import { BezierHelper } from './BezierHelper'
import { EllipseHelper } from './EllipseHelper'


interface ICurrentCommand {
    name?: number
    length?: number
    index?: number
}


const { M, m, L, l, H, h, V, v, C, c, S, s, Q, q, T, t, A, a, Z, z, N, D, X, G, F, O, P, U } = Command
const { rect, roundRect, arcTo, arc, ellipse, quadraticCurveTo } = BezierHelper
const { ellipticalArc } = EllipseHelper
const debug = Debug.get('PathConvert')

const setEndPoint = {} as IPointData

export const PathConvert = {

    current: {} as ICurrentCommand,

    stringify(data: IPathCommandData): string {
        let i = 0, len = data.length, count: number, str: string = '', command: number, lastCommand: number
        while (i < len) {
            command = data[i]
            count = PathNumberCommandLengthMap[command]
            if (command === lastCommand) {
                str += ' ' // 重复的命令可以省略
            } else {
                str += PathNumberCommandMap[command]
            }

            for (let j = 1; j < count; j++) {
                str += data[i + j];
                (j === count - 1) || (str += ' ')
            }

            lastCommand = command
            i += count
        }
        return str
    },

    parse(pathString: string, curveMode?: boolean): IPathCommandData {

        let needConvert: boolean, char: string, lastChar: string, num = ''
        const data: IPathCommandData = []
        const convertCommand = curveMode ? NeedConvertToCurveCommandMap : NeedConvertToCanvasCommandMap

        for (let i = 0, len = pathString.length; i < len; i++) {

            char = pathString[i]

            if (StringNumberMap[char]) {

                num += char

            } else if (Command[char]) {

                if (num) { pushData(data, Number(num)); num = '' }

                current.name = Command[char]
                current.length = PathCommandLengthMap[char]
                current.index = 0
                pushData(data, current.name)

                if (!needConvert && convertCommand[char]) needConvert = true

            } else {

                if (char === '-' || char === '+') {

                    if (lastChar === 'e' || lastChar === 'E') { // L45e-12  21e+22
                        num += char
                    } else {
                        if (num) pushData(data, Number(num)) // L-34-35 L+12+28
                        num = char
                    }

                } else {
                    if (num) { pushData(data, Number(num)); num = '' }
                }

            }

            lastChar = char

        }

        if (num) pushData(data, Number(num))

        return needConvert ? PathConvert.toCanvasData(data, curveMode) : data
    },

    toCanvasData(old: IPathCommandData, curveMode?: boolean): IPathCommandData {

        let x = 0, y = 0, x1 = 0, y1 = 0, i = 0, len = old.length, controlX: number, controlY: number, command: number, lastCommand: number, smooth: boolean
        const data: IPathCommandData = []

        while (i < len) {

            command = old[i]

            switch (command) {
                //moveto(x, y)
                case m:
                    old[i + 1] += x
                    old[i + 2] += y
                case M:
                    x = old[i + 1]
                    y = old[i + 2]
                    data.push(M, x, y)
                    i += 3
                    break

                //horizontal lineto(x)
                case h:
                    old[i + 1] += x
                case H:
                    x = old[i + 1]
                    data.push(L, x, y)
                    i += 2
                    break

                //vertical lineto(y)
                case v:
                    old[i + 1] += y
                case V:
                    y = old[i + 1]
                    data.push(L, x, y)
                    i += 2
                    break

                //lineto(x,y)
                case l:
                    old[i + 1] += x
                    old[i + 2] += y
                case L:
                    x = old[i + 1]
                    y = old[i + 2]
                    data.push(L, x, y)
                    i += 3
                    break

                //smooth bezierCurveTo(x2, y2, x, y)
                case s:  //smooth
                    old[i + 1] += x
                    old[i + 2] += y
                    old[i + 3] += x
                    old[i + 4] += y
                    command = S
                case S:
                    smooth = (lastCommand === C) || (lastCommand === S)
                    x1 = smooth ? (x * 2 - controlX) : old[i + 1]
                    y1 = smooth ? (y * 2 - controlY) : old[i + 2]
                    controlX = old[i + 1]
                    controlY = old[i + 2]
                    x = old[i + 3]
                    y = old[i + 4]
                    data.push(C, x1, y1, controlX, controlY, x, y)
                    i += 5
                    break

                //bezierCurveTo(x1, y1, x2, y2, x, y)
                case c:
                    old[i + 1] += x
                    old[i + 2] += y
                    old[i + 3] += x
                    old[i + 4] += y
                    old[i + 5] += x
                    old[i + 6] += y
                    command = C
                case C:
                    controlX = old[i + 3]
                    controlY = old[i + 4]
                    x = old[i + 5]
                    y = old[i + 6]
                    data.push(C, old[i + 1], old[i + 2], controlX, controlY, x, y)
                    i += 7
                    break

                //smooth quadraticCurveTo(x, y)
                case t:
                    old[i + 1] += x
                    old[i + 2] += y
                    command = T
                case T:  //smooth
                    smooth = (lastCommand === Q) || (lastCommand === T)
                    controlX = smooth ? (x * 2 - controlX) : old[i + 1]
                    controlY = smooth ? (y * 2 - controlY) : old[i + 2]
                    curveMode ? quadraticCurveTo(data, x, y, controlX, controlY, old[i + 1], old[i + 2]) : data.push(Q, controlX, controlY, old[i + 1], old[i + 2])
                    x = old[i + 1]
                    y = old[i + 2]
                    i += 3
                    break

                //quadraticCurveTo(x1, y1, x, y)
                case q:
                    old[i + 1] += x
                    old[i + 2] += y
                    old[i + 3] += x
                    old[i + 4] += y
                    command = Q
                case Q:
                    controlX = old[i + 1]
                    controlY = old[i + 2]
                    curveMode ? quadraticCurveTo(data, x, y, controlX, controlY, old[i + 3], old[i + 4]) : data.push(Q, controlX, controlY, old[i + 3], old[i + 4])
                    x = old[i + 3]
                    y = old[i + 4]
                    i += 5
                    break

                //ellipticalArc(rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y)
                case a:
                    old[i + 6] += x
                    old[i + 7] += y
                case A:
                    ellipticalArc(data, x, y, old[i + 1], old[i + 2], old[i + 3], old[i + 4], old[i + 5], old[i + 6], old[i + 7], curveMode) // convert to canvas ellipse or curve
                    x = old[i + 6]
                    y = old[i + 7]
                    i += 8
                    break
                case z:
                case Z:
                    data.push(Z)
                    i++
                    break


                // canvas command

                case N: // rect(x, y, width, height)
                    x = old[i + 1]
                    y = old[i + 2]
                    curveMode ? rect(data, x, y, old[i + 3], old[i + 4]) : copyData(data, old, i, 5)
                    i += 5
                    break
                case D: // roundRect(x, y, width, height, radius1, radius2, radius3, radius4)
                    x = old[i + 1]
                    y = old[i + 2]
                    curveMode ? roundRect(data, x, y, old[i + 3], old[i + 4], [old[i + 5], old[i + 6], old[i + 7], old[i + 8]]) : copyData(data, old, i, 9)
                    i += 9
                    break
                case X: // simple roundRect(x, y, width, height, radius)
                    x = old[i + 1]
                    y = old[i + 2]
                    curveMode ? roundRect(data, x, y, old[i + 3], old[i + 4], old[i + 5]) : copyData(data, old, i, 6)
                    i += 6
                    break
                case G: // ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
                    ellipse(curveMode ? data : copyData(data, old, i, 9), old[i + 1], old[i + 2], old[i + 3], old[i + 4], old[i + 5], old[i + 6], old[i + 7], old[i + 8] as unknown as boolean, null, setEndPoint)
                    x = setEndPoint.x
                    y = setEndPoint.y
                    i += 9
                    break
                case F: // simple ellipse(x, y, radiusX, radiusY)
                    curveMode ? ellipse(data, old[i + 1], old[i + 2], old[i + 3], old[i + 4], 0, 0, 360, false) : copyData(data, old, i, 5)
                    x = old[i + 1] + old[i + 3]
                    y = old[i + 2]
                    i += 5
                    break
                case O: // arc(x, y, radius, startAngle, endAngle, anticlockwise)
                    arc(curveMode ? data : copyData(data, old, i, 7), old[i + 1], old[i + 2], old[i + 3], old[i + 4], old[i + 5], old[i + 6] as unknown as boolean, null, setEndPoint)
                    x = setEndPoint.x
                    y = setEndPoint.y
                    i += 7
                    break
                case P: //  simple arc(x, y, radius)
                    curveMode ? arc(data, old[i + 1], old[i + 2], old[i + 3], 0, 360, false) : copyData(data, old, i, 4)
                    x = old[i + 1] + old[i + 3]
                    y = old[i + 2]
                    i += 4
                    break
                case U: // arcTo(x1, y1, x2, y2, radius)
                    arcTo(curveMode ? data : copyData(data, old, i, 6), x, y, old[i + 1], old[i + 2], old[i + 3], old[i + 4], old[i + 5], null, setEndPoint)
                    x = setEndPoint.x
                    y = setEndPoint.y
                    i += 6
                    break
                default:
                    debug.error(`command: ${command} [index:${i}]`, old)
                    return data
            }

            lastCommand = command
        }

        return data

    },

    copyData(data: IPathCommandData, old: IPathCommandData, index: number, count: number): void {
        for (let i = index, end = index + count; i < end; i++) {
            data.push(old[i])
        }
    },

    pushData(data: IPathCommandData, num: number) {
        if (current.index === current.length) { // 单个命令，多个数据的情况
            current.index = 1
            data.push(current.name)
        }

        data.push(num)
        current.index++
    }

}

const { current, pushData, copyData } = PathConvert