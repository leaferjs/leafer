import { IPathCommandData } from '@leafer/interface'
import { StringNumberMap } from '@leafer/math'
import { PathCommandMap as Command, PathCommandNeedConvertMap as NeedConvertCommand, PathCommandLengthMap as CommandLength, NumberPathCommandMap as CommandName, NumberPathCommandLengthMap as NumberCommandLength } from './PathCommandMap'

import { BezierHelper } from './BezierHelper'


interface ICurrentCommand {
    name?: number
    length?: number
    index?: number
}


const { M, m, L, l, H, h, V, v, C, c, S, s, Q, q, T, t, A, a, Z, z } = Command
const { getFromACommand } = BezierHelper

export const PathConvert = {

    current: {} as ICurrentCommand,

    stringify(data: IPathCommandData): string {
        let i = 0, len = data.length, count: number, str: string = '', command: number, lastCommand: number
        while (i < len) {
            command = data[i]
            count = NumberCommandLength[command]
            if (command === lastCommand) {
                str += ' ' // 重复的命令可以省略
            } else {
                str += CommandName[command]
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

    parse(pathString: string, convert: boolean = true): IPathCommandData {

        let needConvert: boolean, char: string, num = ''
        const data: IPathCommandData = []

        for (let i = 0, len = pathString.length; i < len; i++) {

            char = pathString[i]

            if (StringNumberMap[char]) {

                num += char

            } else if (Command[char]) {

                if (num) { pushData(data, Number(num)); num = '' }

                current.name = Command[char]
                current.length = CommandLength[char]
                current.index = 0
                pushData(data, current.name)

                if (!needConvert && NeedConvertCommand[char]) needConvert = true

            } else {

                if (char === '-') { // L-34-35
                    if (num) { pushData(data, Number(num)) }
                    num = char
                } else {
                    if (num) { pushData(data, Number(num)); num = '' }
                }

            }

        }

        if (num) pushData(data, Number(num))

        //console.log(pathString, P._data)
        return (convert && needConvert) ? PathConvert.convertToSimple(data) : data
    },

    convertToSimple(old: IPathCommandData): IPathCommandData {

        let x = 0, y = 0, x1 = 0, y1 = 0, i = 0, len = old.length, controlX: number, controlY: number, command: number, lastCommand: number, smooth: boolean
        const data: IPathCommandData = []

        while (i < len) {

            command = old[i]

            switch (command) {
                //moveto x,y
                case m:
                    old[i + 1] += x
                    old[i + 2] += y
                case M:
                    x = old[i + 1]
                    y = old[i + 2]
                    data.push(M, x, y)
                    i += 3
                    break

                //horizontal lineto x
                case h:
                    old[i + 1] += x
                case H:
                    x = old[i + 1]
                    data.push(L, x, y)
                    i += 2
                    break

                //vertical lineto y
                case v:
                    old[i + 1] += y
                case V:
                    y = old[i + 1]
                    data.push(L, x, y)
                    i += 2
                    break

                //lineto x,y
                case l:
                    old[i + 1] += x
                    old[i + 2] += y
                case L:
                    x = old[i + 1]
                    y = old[i + 2]
                    data.push(L, x, y)
                    i += 3
                    break

                //smooth bezierCurveTo x2,y2,x,y
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

                //bezierCurveTo x1,y1,x2,y2,x,y
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

                //smooth quadraticCurveTo x,y
                case t:
                    old[i + 1] += x
                    old[i + 2] += y
                    command = T
                case T:  //smooth
                    smooth = (lastCommand === Q) || (lastCommand === T)
                    controlX = smooth ? (x * 2 - controlX) : old[i + 1]
                    controlY = smooth ? (y * 2 - controlY) : old[i + 2]
                    x = old[i + 1]
                    y = old[i + 2]
                    data.push(Q, controlX, controlY, x, y)
                    i += 3
                    break

                //quadraticCurveTo x1,y1,x,y
                case q:
                    old[i + 1] += x
                    old[i + 2] += y
                    old[i + 3] += x
                    old[i + 4] += y
                    command = Q
                case Q:
                    controlX = old[i + 1]
                    controlY = old[i + 2]
                    x = old[i + 3]
                    y = old[i + 4]
                    data.push(Q, controlX, controlY, x, y)
                    i += 5
                    break

                //ellipticalArc rx ry x-axis-rotation large-arc-flag sweep-flag x y
                case a:
                    old[i + 6] += x
                    old[i + 7] += y
                case A:
                    data.push(...getFromACommand(x, y, old[i + 1], old[i + 2], old[i + 3], old[i + 4], old[i + 5], old[i + 6], old[i + 7])) // convert bezier
                    x = old[i + 6]
                    y = old[i + 7]
                    i += 8
                    break
                case z:
                case Z:
                    data.push(Z)
                    i++
                    break
            }

            lastCommand = command
        }

        return data

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

const { current, pushData } = PathConvert