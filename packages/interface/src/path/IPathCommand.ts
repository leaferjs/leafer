import { IPointData } from '../math/IMath'

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
type anticlockwise = boolean
type cornerRadius = number | number[]
type radius = number

export type RectCommandData = [Command, x, y, width, height]
export type RoundRectCommandData = [Command, x, y, width, height, cornerRadius]
export type EllipseCommandData = [Command, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise]
export type ArcCommandData = [Command, x, y, radius, startAngle, endAngle, anticlockwise]
export type ArcToCommandData = [Command, x1, y1, x2, y2, radius]


export type CanvasPathCommand = 1 | 2 | 5 | 7 | 11 // M | L | C | Q | Z   canvas可以绘制的命令

export type IPathCommandData = number[] // ...(MCommandData | LCommandData | CCommandData | QCommandData | ZCommandData)


// 路径命令对象
export interface MoveToCommandObject {
    name: 'M'
    x: number
    y: number
}
export interface LineToCommandObject {
    name: 'L'
    x: number
    y: number
}

export interface BezierCurveToCommandObject {
    name: 'C'
    x1: number
    y1: number
    x2: number
    y2: number
    x: number
    y: number
}

export interface QuadraticCurveToCommandObject {
    name: 'Q'
    x1: number
    y1: number
    x: number
    y: number
}

export interface ClosePathCommandObject {
    name: 'Z'
}

export type IPathCommandObject = MoveToCommandObject | LineToCommandObject | BezierCurveToCommandObject | QuadraticCurveToCommandObject | ClosePathCommandObject // M | L | C | Q | Z   canvas可以绘制的命令


// 可视化路径节点

export interface IPathCommandNodeBase {
    name: 'M^' | 'L^' | 'C^' | 'Z^'
    x: number
    y: number
    a?: IPointData // 第一个手柄，连接上一个节点
    b?: IPointData // 第二个手柄，连接下一个节点
    ab?: PathNodeHandleType // 手柄类型
}

export interface MoveToCommandNode extends IPathCommandNodeBase {
    name: 'M^'
}
export interface LineToCommandNode extends IPathCommandNodeBase {
    name: 'L^'
}

export interface BezierCurveToCommandNode extends IPathCommandNodeBase {
    name: 'C^'
}

export interface ClosePathCommandNode {
    name: 'Z^'
    x?: number
    y?: number
    a?: IPointData
    b?: IPointData
    ab?: PathNodeHandleType
}

export type IPathCommandNode = MoveToCommandNode | LineToCommandNode | BezierCurveToCommandNode | ClosePathCommandNode // M | L | C | Z   路径节点命令(适合可视化编辑)

export enum PathNodeHandleType { // 手柄类型
    none = 1, // 无手柄
    free = 2, // 每个手柄自由控制
    mirrorAngle = 3, // 仅镜像角度
    mirror = 4,  // 镜像角度和长度
}

export type PathNodeHandleName = 'a' | 'b' // 手柄名称

export interface IPathNodeBase {
    pathNode: IPathCommandNode
}