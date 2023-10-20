import { IBounds, IBoundsData, IMatrixData, IPointData, IBoundsDataHandle, IObject, IMatrix, IRadiusPointData, IMatrixWithLayoutData } from '@leafer/interface'
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


    public scale(scaleX: number, scaleY?: number): IBounds {
        B.scale(this, scaleX, scaleY)
        return this
    }

    public scaleOf(origin: IPointData, scaleX: number, scaleY?: number): IBounds {
        B.scaleOf(this, origin, scaleX, scaleY)
        return this
    }

    public toOuterOf(matrix: IMatrixData, to?: IBoundsData): IBounds {
        B.toOuterOf(this, matrix, to)
        return this
    }

    public getFitMatrix(put: IBoundsData): IMatrix {
        return B.getFitMatrix(this, put)
    }

    public spread(spreadX: number, spreadY?: number): IBounds {
        B.spread(this, spreadX, spreadY)
        return this
    }

    public ceil(): IBounds {
        B.ceil(this)
        return this
    }

    public unsign(): IBounds {
        B.unsign(this)
        return this
    }



    public add(bounds: IBoundsData): IBounds {
        B.add(this, bounds)
        return this
    }

    public addList(boundsList: IBounds[]): IBounds {
        B.setByList(this, boundsList, true)
        return this
    }

    public setByList(boundsList: IBounds[], addMode?: boolean): IBounds {
        B.setByList(this, boundsList, addMode)
        return this
    }

    public addListWithHandle(list: IObject[], boundsDataHandle: IBoundsDataHandle): IBounds {
        B.setByListWithHandle(this, list, boundsDataHandle, true)
        return this
    }

    public setByListWithHandle(list: IObject[], boundsDataHandle: IBoundsDataHandle, addMode?: boolean): IBounds {
        B.setByListWithHandle(this, list, boundsDataHandle, addMode)
        return this
    }

    public setByPoints(points: IPointData[]): IBounds {
        B.setByPoints(this, points)
        return this
    }



    public hitPoint(point: IPointData, pointMatrix?: IMatrixData): boolean {
        return B.hitPoint(this, point, pointMatrix)
    }

    public hitRadiusPoint(point: IRadiusPointData, pointMatrix?: IMatrixWithLayoutData): boolean {
        return B.hitRadiusPoint(this, point, pointMatrix)
    }

    public hit(bounds: IBoundsData, boundsMatrix?: IMatrixData): boolean {
        return B.hit(this, bounds, boundsMatrix)
    }

    public includes(bounds: IBoundsData, boundsMatrix?: IMatrixData): boolean {
        return B.includes(this, bounds, boundsMatrix)
    }


    public intersect(bounds: IBoundsData, boundsMatrix?: IMatrixData): IBounds {
        B.intersect(this, bounds, boundsMatrix)
        return this
    }

    public getIntersect(bounds: IBoundsData, boundsMatrix?: IMatrixData): IBounds {
        return new Bounds(B.getIntersectData(this, bounds, boundsMatrix))
    }


    public isSame(bounds: IBoundsData): boolean {
        return B.isSame(this, bounds)
    }

    public isEmpty(): boolean {
        return B.isEmpty(this)
    }

    public reset(): void {
        B.reset(this)
    }

}