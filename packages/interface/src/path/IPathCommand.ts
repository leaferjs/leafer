type Command = number
type x = number
type y = number
type x1 = number
type y1 = number
type x2 = number
type y2 = number
type radiusX = number
type radiusY = number
type xAxisRotation = number
type largeArcFlag = number
type sweepFlag = number


export type MCommandData = [Command, x, y]
export type HCommandData = [Command, x]
export type VCommandData = [Command, y]
export type LCommandData = MCommandData

export type CCommandData = [Command, x1, y1, x2, y2, x, y]
export type SCommandData = [Command, x2, y2, x, y]

export type QCommandData = [Command, x1, y1, x, y]
export type TCommandData = [Command, x, y]

export type ZCommandData = [Command]

export type ACommandData = [Command, radiusX, radiusY, xAxisRotation, largeArcFlag, sweepFlag, x, y]


// 非svg标准的canvas绘图命令
type width = number
type height = number
type rotation = number
type startAngle = number
type endAngle = number
type counterclockwise = boolean
type cornerRadius = number | number[]
type radius = number

export type RectCommandData = [Command, x, y, width, height]
export type RoundRectCommandData = [Command, x, y, width, height, cornerRadius]
export type EllipseCommandData = [Command, x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise]
export type ArcCommandData = [Command, x, y, radius, startAngle, endAngle, counterclockwise]
export type ArcToCommandData = [Command, x1, y1, x2, y2, radius]


export type CanvasPathCommand = 1 | 2 | 5 | 7 | 11 // M | L | C | Q | Z   canvas可以绘制的命令

export type IPathCommandData = number[] // ...(MCommandData | LCommandData | CCommandData | QCommandData | ZCommandData)
