import { IPoint, IPointData, IMatrixData } from '@leafer/interface'
import { PointHelper as P } from './PointHelper'

export class Point implements IPoint {

    public x: number
    public y: number

    constructor(x?: number | IPointData, y?: number) {
        this.set(x, y)
    }

    public set(x?: number | IPointData, y?: number): IPointData {
        typeof x === 'object' ? P.copy(this, x) : P.set(this, x, y)
        return this
    }

    public get(): IPointData {
        const { x, y } = this
        return { x, y }
    }

    public copy(point: IPointData): IPoint {
        P.copy(this, point)
        return this
    }

    public clone(): IPoint {
        return new Point(this)
    }

    public rotate(angle: number, center?: IPointData): IPoint {
        P.rotate(this, angle, center)
        return this
    }


    public toInnerOf(matrix: IMatrixData, to?: IPointData): IPoint {
        P.toInnerOf(this, matrix, to)
        return this
    }

    public toOuterOf(matrix: IMatrixData, to?: IPointData): IPoint {
        P.toOuterOf(this, matrix, to)
        return this
    }

    public getCenter(to: IPointData): IPointData {
        return P.getCenter(this, to)
    }

    public getDistance(to: IPointData): number {
        return P.getDistance(this, to)
    }

    public getAngle(to: IPointData): number {
        return P.getAngle(this, to)
    }

    public getAtan2(to: IPointData): number {
        return P.getAtan2(this, to)
    }

    public reset(): void {
        P.reset(this)
    }

}