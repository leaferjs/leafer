import { IPoint, IPointData, IMatrixData } from '@leafer/interface'
import { PointHelper as P } from './PointHelper'

export class Point implements IPoint {

    public x: number
    public y: number

    constructor(x?: number | IPointData, y?: number) {
        typeof x === 'object' ? P.copy(this, x) : P.set(this, x, y)
    }

    public set(x?: number, y?: number): void {
        P.set(this, x, y)
    }

    public copy(point: IPointData): IPoint {
        P.copy(this, point)
        return this
    }

    public clone(): IPoint {
        return new Point(this)
    }

    public rotate(angle: number, center?: IPointData): void {
        P.rotate(this, angle, center)
    }


    public toLocal(matrix: IMatrixData, setLocal?: IPointData): void {
        P.toLocal(this, matrix, setLocal)
    }

    public toWorld(matrix: IMatrixData, setWorld?: IPointData): void {
        P.toWorld(this, matrix, setWorld)
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

}