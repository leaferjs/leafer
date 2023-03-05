import { IObject } from '../data/IData'

export interface IPointData {
    x: number
    y: number
}

export interface IPoint extends IPointData {
    set(x?: number, y?: number): void
    copy(point: IPointData): IPoint
    clone(): IPoint

    rotate(angle: number, center?: IPointData): void

    toLocal(matrix: IMatrixData): void
    toWorld(matrix: IMatrixData): void

    getCenter(to: IPointData): IPointData
    getDistance(to: IPointData): number
    getAngle(to: IPointData): number
    getAtan2(to: IPointData): number
}

export interface IRadiusPointData extends IPointData {
    radiusX: number
    radiusY: number
}

export interface ISizeData {
    width: number
    height: number
}
export interface ISize extends ISizeData {

}

export interface IScreenSizeData extends ISizeData {
    pixelRatio?: number
}

export interface IBoundsData extends IPointData, ISizeData { }

export interface IOffsetBoundsData extends IBoundsData {
    offsetX: number
    offsetY: number
}

export interface IBoundsDataHandle {
    (target: any): IBoundsData
}

export interface IBounds extends IBoundsData {
    set(x?: number, y?: number, width?: number, height?: number): void
    copy(bounds: IBoundsData): IBounds
    clone(): IBounds

    timesMatrix(matrix: IMatrixData): IBounds
    divideMatrix(matrix: IMatrixData): IBounds
    getFitMatrix(put: IBoundsData): IMatrix
    spread(size: number): void
    ceil(): void

    add(bounds: IBoundsData): void
    addList(boundsList: IBounds[]): void
    setByList(boundsList: IBounds[], addMode?: boolean): void
    addListWithHandle(list: IObject[], boundsDataHandle: IBoundsDataHandle): void
    setByListWithHandle(list: IObject[], boundsDataHandle: IBoundsDataHandle, addMode: boolean): void
    setByBoundsTimesMatrix(fromBounds: IBoundsData, fromMatrix: IMatrixData): void
    setByPoints(points: IPointData[]): void

    hitPoint(point: IPointData, pointMatrix?: IMatrixData): boolean
    hitRadiusPoint(point: IRadiusPointData, pointMatrix?: IMatrixData): boolean
    hit(bounds: IBoundsData, boundsMatrix?: IMatrixData): boolean
    includes(bounds: IBoundsData, boundsMatrix?: IMatrixData): boolean

    getIntersect(bounds: IBoundsData, boundsMatrix?: IMatrixData): IBounds
    setByIntersect(bounds: IBoundsData, boundsMatrix?: IMatrixData): void

    isSame(bounds: IBoundsData): boolean
    isEmpty(): boolean
    empty(): void
}

export interface ITwoPointBoundsData {
    minX: number
    minY: number
    maxX: number
    maxY: number
}

export interface ITwoPointBounds extends ITwoPointBoundsData {
    addPoint(x: number, y: number): void
    add(pointBounds: ITwoPointBoundsData): void
}


export interface IAutoBoundsData {
    top?: number
    right?: number
    bottom?: number
    left?: number

    width?: number
    height?: number
}


export interface IAutoBounds extends IAutoBoundsData {
    set(top?: number, right?: number, bottom?: number, left?: number, width?: number, height?: number): void
    copy(auto: IAutoBoundsData): void
    getBoundsFrom(parent: ISizeData): IBounds
}


export interface IMatrixData {
    a: number
    b: number
    c: number
    d: number
    e: number
    f: number
}
export interface IMatrix extends IMatrixData {
    set(a: number, b: number, c: number, d: number, e: number, f: number): void
    copy(matrix: IMatrixData): IMatrix
    clone(): IMatrix

    translate(x: number, y: number): IMatrix
    scale(x: number, y?: number): IMatrix
    rotate(angle: number): IMatrix

    times(matrix: IMatrixData): void
    divide(matrix: IMatrixData): void
    invert(): void

    toWorldPoint(local: IPointData, world?: IPointData): void
    toLocalPoint(world: IPointData, local?: IPointData): void
}


export interface IMatrixWithBoundsData extends IMatrixData, IBoundsData { }
