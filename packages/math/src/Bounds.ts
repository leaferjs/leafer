import { IBounds, IBoundsData, IMatrixData, IPointData, IBoundsDataHandle, IObject, IMatrix, IRadiusPointData, IMatrixWithLayoutData } from '@leafer/interface'
import { BoundsHelper as B } from './BoundsHelper'


export class Bounds implements IBounds {

    public x: number
    public y: number
    public width: number
    public height: number

    public get right(): number { return B.right(this) }
    public get bottom(): number { return B.bottom(this) }

    constructor(x?: number | IBoundsData, y?: number, width?: number, height?: number) {
        this.set(x, y, width, height)
    }

    public set(x?: number | IBoundsData, y?: number, width?: number, height?: number): IBounds {
        typeof x === 'object' ? B.copy(this, x) : B.set(this, x, y, width, height)
        return this
    }

    public get(): IBoundsData {
        const { x, y, width, height } = this
        return { x, y, width, height }
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
        B.setList(this, boundsList, true)
        return this
    }

    public setList(boundsList: IBounds[]): IBounds {
        B.setList(this, boundsList)
        return this
    }

    public addListWithHandle(list: IObject[], boundsDataHandle: IBoundsDataHandle): IBounds {
        B.setListWithHandle(this, list, boundsDataHandle, true)
        return this
    }

    public setListWithHandle(list: IObject[], boundsDataHandle: IBoundsDataHandle): IBounds {
        B.setListWithHandle(this, list, boundsDataHandle)
        return this
    }


    public setPoints(points: IPointData[]): IBounds {
        B.setPoints(this, points)
        return this
    }

    public getPoints(): IPointData[] {
        return B.getPoints(this)
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