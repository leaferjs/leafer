import { IPathCommandData, IPathDrawer, IPathString } from '@leafer/interface'
import { PathCommandDataHelper } from './PathCommandDataHelper'
import { PathHelper } from './PathHelper'


const { moveTo, lineTo, quadraticCurveTo, bezierCurveTo, closePath, beginPath, rect, roundRect, ellipse, arc, arcTo, drawEllipse, drawArc, drawPoints } = PathCommandDataHelper

export class PathCreator implements IPathDrawer {

    public path: IPathCommandData

    constructor(path?: IPathCommandData | IPathString) {
        if (path) {
            this.path = typeof path === 'string' ? PathHelper.parse(path) : path
        } else {
            this.path = []
        }
    }

    public beginPath(): PathCreator {
        beginPath(this.path)
        return this
    }

    // svg and canvas

    public moveTo(x: number, y: number): PathCreator {
        moveTo(this.path, x, y)
        return this
    }

    public lineTo(x: number, y: number): PathCreator {
        lineTo(this.path, x, y)
        return this
    }

    public bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): PathCreator {
        bezierCurveTo(this.path, x1, y1, x2, y2, x, y)
        return this
    }

    public quadraticCurveTo(x1: number, y1: number, x: number, y: number): PathCreator {
        quadraticCurveTo(this.path, x1, y1, x, y)
        return this
    }

    public closePath(): PathCreator {
        closePath(this.path)
        return this
    }

    // canvas

    public rect(x: number, y: number, width: number, height: number): PathCreator {
        rect(this.path, x, y, width, height)
        return this
    }

    public roundRect(x: number, y: number, width: number, height: number, cornerRadius: number | number[]): PathCreator {
        roundRect(this.path, x, y, width, height, cornerRadius)
        return this
    }

    public ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation?: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): PathCreator {
        ellipse(this.path, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
        return this
    }

    public arc(x: number, y: number, radius: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): PathCreator {
        arc(this.path, x, y, radius, startAngle, endAngle, anticlockwise)
        return this
    }

    public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): PathCreator {
        arcTo(this.path, x1, y1, x2, y2, radius)
        return this
    }

    // moveTo, then draw

    public drawEllipse(x: number, y: number, radiusX: number, radiusY: number, rotation?: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): PathCreator {
        drawEllipse(this.path, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
        return this
    }

    public drawArc(x: number, y: number, radius: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): PathCreator {
        drawArc(this.path, x, y, radius, startAngle, endAngle, anticlockwise)
        return this
    }

    public drawPoints(points: number[], curve?: boolean | number, close?: boolean): PathCreator {
        drawPoints(this.path, points, curve, close)
        return this
    }

}
