import { IPathCommandData } from './IPathCommand'
export interface IPathDrawer {
    beginPath?(): void

    moveTo(x: number, y: number): void
    lineTo(x: number, y: number): void
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void
    closePath(): void

    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void

    rect(x: number, y: number, width: number, height: number): void
    roundRect(x: number, y: number, width: number, height: number, radius?: number | number[]): void
}

export interface IPathCreator {
    path: IPathCommandData
    __path: IPathCommandData

    beginPath(): IPathCreator

    moveTo(x: number, y: number): IPathCreator
    lineTo(x: number, y: number): IPathCreator
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): IPathCreator
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): IPathCreator
    closePath(): IPathCreator

    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): IPathCreator
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): IPathCreator
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): IPathCreator

    rect(x: number, y: number, width: number, height: number): IPathCreator
    roundRect(x: number, y: number, width: number, height: number, radius?: number | number[]): IPathCreator

    // new
    drawEllipse(x: number, y: number, radiusX: number, radiusY: number, rotation?: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): IPathCreator
    drawArc(x: number, y: number, radius: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): IPathCreator
    drawPoints(points: number[], curve?: boolean | number, close?: boolean): IPathCreator
}