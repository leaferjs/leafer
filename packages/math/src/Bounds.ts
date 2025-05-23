import { IBounds, IBoundsData, IMatrixData, IPointData, IBoundsDataFn, IObject, IMatrix, IRadiusPointData, IMatrixWithLayoutData, IFourNumber, ISide, IAlign } from '@leafer/interface'
import { BoundsHelper as B } from './BoundsHelper'


export class Bounds implements IBounds {

    public x: number
    public y: number
    public width: number
    public height: number

    public get minX(): number { return B.minX(this) }
    public get minY(): number { return B.minY(this) }
    public get maxX(): number { return B.maxX(this) }
    public get maxY(): number { return B.maxY(this) }

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


    public move(x: number, y: number): IBounds {
        B.move(this, x, y)
        return this
    }

    public scale(scaleX: number, scaleY?: number, onlySize?: boolean): IBounds {
        B.scale(this, scaleX, scaleY, onlySize)
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

    public toInnerOf(matrix: IMatrixData, to?: IBoundsData): IBounds {
        B.toInnerOf(this, matrix, to)
        return this
    }

    public getFitMatrix(put: IBoundsData, baseScale?: number): IMatrix {
        return B.getFitMatrix(this, put, baseScale)
    }

    public put(put: IBoundsData, align?: IAlign, putScale?: number | 'fit' | 'cover'): void {
        B.put(this, put, align, putScale)
    }

    public spread(fourNumber: IFourNumber, side?: ISide): IBounds {
        B.spread(this, fourNumber, side)
        return this
    }

    public shrink(fourNumber: IFourNumber, side?: ISide): IBounds {
        B.shrink(this, fourNumber, side)
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

    public float(maxLength?: number): IBounds {
        B.float(this, maxLength)
        return this
    }


    public add(bounds: IBoundsData): IBounds {
        B.add(this, bounds)
        return this
    }

    public addList(boundsList: IBoundsData[]): IBounds {
        B.setList(this, boundsList, true)
        return this
    }

    public setList(boundsList: IBoundsData[]): IBounds {
        B.setList(this, boundsList)
        return this
    }

    public addListWithFn(list: IObject[], boundsDataFn: IBoundsDataFn): IBounds {
        B.setListWithFn(this, list, boundsDataFn, true)
        return this
    }

    public setListWithFn(list: IObject[], boundsDataFn: IBoundsDataFn): IBounds {
        B.setListWithFn(this, list, boundsDataFn)
        return this
    }


    public setPoint(point: IPointData): IBounds {
        B.setPoint(this, point)
        return this
    }

    public setPoints(points: IPointData[]): IBounds {
        B.setPoints(this, points)
        return this
    }

    public addPoint(point: IPointData): IBounds {
        B.addPoint(this, point)
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

export const tempBounds = new Bounds()