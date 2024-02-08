import { IPoint, IPointData, IMatrixData } from '@leafer/interface'
import { PointHelper as P } from './PointHelper'

export class Point implements IPoint {

    public x: number
    public y: number

    constructor(x?: number | IPointData, y?: number) {
        this.set(x, y)
    }

    public set(x?: number | IPointData, y?: number): IPoint {
        typeof x === 'object' ? P.copy(this, x) : P.set(this, x, y)
        return this
    }

    public get(): IPointData {
        const { x, y } = this
        return { x, y }
    }


    public clone(): IPoint {
        return new Point(this)
    }


    public move(x: number, y: number): IPoint {
        P.move(this, x, y)
        return this
    }

    public scale(scaleX: number, scaleY?: number): IPoint {
        P.scale(this, scaleX, scaleY)
        return this
    }

    public scaleOf(origin: IPointData, scaleX: number, scaleY?: number): IPoint {
        P.scaleOf(this, origin, scaleX, scaleY)
        return this
    }

    public rotate(rotation: number, origin?: IPointData): IPoint {
        P.rotate(this, rotation, origin)
        return this
    }

    public rotateOf(origin: IPointData, rotation: number): IPoint {
        P.rotate(this, rotation, origin)
        return this
    }

    public getRotation(origin: IPointData, to: IPointData, toOrigin?: IPointData): number {
        return P.getRotation(this, origin, to, toOrigin)
    }


    public toInnerOf(matrix: IMatrixData, to?: IPointData): IPoint {
        P.toInnerOf(this, matrix, to)
        return this
    }

    public toOuterOf(matrix: IMatrixData, to?: IPointData): IPoint {
        P.toOuterOf(this, matrix, to)
        return this
    }


    public getCenter(to: IPointData): IPoint {
        return new Point(P.getCenter(this, to))
    }

    public getDistance(to: IPointData): number {
        return P.getDistance(this, to)
    }

    public getDistancePoint(to: IPointData, distance: number, changeTo?: boolean): IPoint {
        return new Point(P.getDistancePoint(this, to, distance, changeTo))
    }

    public getAngle(to: IPointData): number {
        return P.getAngle(this, to)
    }

    public getAtan2(to: IPointData): number {
        return P.getAtan2(this, to)
    }


    public reset(): IPoint {
        P.reset(this)
        return this
    }

}