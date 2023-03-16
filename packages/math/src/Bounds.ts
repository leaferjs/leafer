import { IBounds, IBoundsData, IMatrixData, IPointData, IBoundsDataHandle, IObject, IMatrix, IRadiusPointData } from '@leafer/interface'
import { BoundsHelper as B } from './BoundsHelper'


export class Bounds implements IBounds {

    public x: number
    public y: number
    public width: number
    public height: number

    constructor(x?: number | IBoundsData, y?: number, width?: number, height?: number) {
        typeof x === 'object' ? B.copy(this, x) : B.set(this, x, y, width, height)
    }

    public set(x?: number, y?: number, width?: number, height?: number): void {
        B.set(this, x, y, width, height)
    }

    public copy(bounds: IBoundsData): IBounds {
        B.copy(this, bounds)
        return this
    }

    public clone(): IBounds {
        return new Bounds(this)
    }


    public scale(scale: number): IBounds {
        B.scale(this, scale)
        return this
    }

    public timesMatrix(matrix: IMatrixData): IBounds {
        B.timesMatrix(this, matrix)
        return this
    }

    public getFitMatrix(put: IBoundsData): IMatrix {
        return B.getFitMatrix(this, put)
    }

    public spread(size: number): void {
        B.spread(this, size)
    }

    public ceil(): void {
        B.ceil(this)
    }



    public add(bounds: IBoundsData): void {
        B.add(this, bounds)
    }

    public addList(boundsList: IBounds[]): void {
        B.setByList(this, boundsList, true)
    }

    public setByList(boundsList: IBounds[], addMode?: boolean): void {
        B.setByList(this, boundsList, addMode)
    }

    public addListWithHandle(list: IObject[], boundsDataHandle: IBoundsDataHandle): void {
        B.setByListWithHandle(this, list, boundsDataHandle, true)
    }

    public setByListWithHandle(list: IObject[], boundsDataHandle: IBoundsDataHandle, addMode?: boolean): void {
        B.setByListWithHandle(this, list, boundsDataHandle, addMode)
    }

    public setByBoundsTimesMatrix(fromBounds: IBoundsData, fromMatrix: IMatrixData): void {
        B.setByBoundsTimesMatrix(this, fromBounds, fromMatrix)
    }

    public setByPoints(points: IPointData[]): void {
        B.setByPoints(this, points)
    }



    public hitPoint(point: IPointData, pointMatrix?: IMatrixData): boolean {
        return B.hitPoint(this, point, pointMatrix)
    }

    public hitRadiusPoint(point: IRadiusPointData, pointMatrix?: IMatrixData): boolean {
        return B.hitRadiusPoint(this, point, pointMatrix)
    }

    public hit(bounds: IBoundsData, boundsMatrix?: IMatrixData): boolean {
        return B.hit(this, bounds, boundsMatrix)
    }

    public includes(bounds: IBoundsData, boundsMatrix?: IMatrixData): boolean {
        return B.includes(this, bounds, boundsMatrix)
    }


    public getIntersect(bounds: IBoundsData, boundsMatrix?: IMatrixData): IBounds {
        return new Bounds(B.getIntersectData(this, bounds, boundsMatrix))
    }

    public setByIntersect(bounds: IBoundsData, boundsMatrix?: IMatrixData): void {
        B.setByIntersect(this, bounds, boundsMatrix)
    }



    public isSame(bounds: IBoundsData): boolean {
        return B.isSame(this, bounds)
    }

    public isEmpty(): boolean {
        return B.isEmpty(this)
    }

    public empty(): void {
        B.empty(this)
    }

}