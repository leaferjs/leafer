import { IFourNumber, IObject } from '../data/IData'

export interface IPointData {
    x: number
    y: number
}

export interface IPoint extends IPointData {
    set(x?: number | IPointData, y?: number): IPoint
    get(): IPointData
    clone(): IPoint

    move(x: number, y: number): IPoint
    scale(scaleX: number, scaleY?: number): IPoint
    scaleOf(origin: IPointData, scaleX: number, scaleY?: number): IPoint
    rotate(rotation: number, origin?: IPointData): IPoint
    rotateOf(origin: IPointData, rotation: number): IPoint
    getRotation(origin: IPointData, to: IPointData, toOrigin?: IPointData): number

    toInnerOf(matrix: IMatrixData, to?: IPointData): IPoint
    toOuterOf(matrix: IMatrixData, to?: IPointData): IPoint

    getCenter(to: IPointData): IPoint
    getDistance(to: IPointData): number
    getDistancePoint(to: IPointData, distance: number, changeTo?: boolean): IPoint

    getAngle(to: IPointData): number
    getAtan2(to: IPointData): number

    reset(): IPoint
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

export interface IBoundsDataFn {
    (target: any): IBoundsData
}

export interface IBounds extends IBoundsData, ITwoPointBoundsData {
    set(x?: number | IBoundsData, y?: number, width?: number, height?: number): IBounds
    get(): IBoundsData
    clone(): IBounds

    move(x: number, y: number): IBounds
    scale(scaleX: number, scaleY?: number): IBounds
    scaleOf(origin: IPointData, scaleX: number, scaleY?: number): IBounds
    toOuterOf(matrix: IMatrixData, to?: IBoundsData): IBounds
    toInnerOf(matrix: IMatrixData, to?: IBoundsData): IBounds
    getFitMatrix(put: IBoundsData, baseScale?: number): IMatrix

    spread(fourNumber: IFourNumber, spreadY?: number): IBounds
    shrink(fourNumber: IFourNumber): IBounds
    ceil(): IBounds
    unsign(): IBounds
    float(maxLength?: number): IBounds

    add(bounds: IBoundsData): IBounds
    addList(boundsList: IBoundsData[]): IBounds
    setList(boundsList: IBoundsData[]): IBounds
    addListWithFn(list: IObject[], boundsDataHandle: IBoundsDataFn): IBounds
    setListWithFn(list: IObject[], boundsDataHandle: IBoundsDataFn): IBounds

    setPoints(points: IPointData[]): IBounds
    addPoint(point: IPointData): IBounds
    getPoints(): IPointData[] // topLeft, topRight, bottomRight, bottomLeft

    hitPoint(point: IPointData, pointMatrix?: IMatrixData): boolean
    hitRadiusPoint(point: IRadiusPointData, pointMatrix?: IMatrixWithLayoutData): boolean
    hit(bounds: IBoundsData, boundsMatrix?: IMatrixData): boolean
    includes(bounds: IBoundsData, boundsMatrix?: IMatrixData): boolean

    intersect(bounds: IBoundsData, boundsMatrix?: IMatrixData): IBounds
    getIntersect(bounds: IBoundsData, boundsMatrix?: IMatrixData): IBounds

    isSame(bounds: IBoundsData): boolean
    isEmpty(): boolean
    reset(): void
}

export interface ITwoPointBoundsData {
    minX: number
    minY: number
    maxX: number
    maxY: number
}

export interface IAutoBoxData {
    top?: number
    right?: number
    bottom?: number
    left?: number
}


export interface IAutoBoundsData extends IAutoBoxData {
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

export interface IScaleData {
    scaleX: number
    scaleY: number
}

export interface IScaleRotationData extends IScaleData {
    rotation: number
}

export interface ISkewData {
    skewX: number
    skewY: number
}

export interface ILayoutData extends IScaleRotationData, ISkewData, IPointData {
}

export type ILayoutAttr =
    | 'x'
    | 'y'
    | 'scaleX'
    | 'scaleY'
    | 'rotation'
    | 'skewX'
    | 'skewY'


export interface ILayoutBoundsData extends ILayoutData, IBoundsData {
}
export interface IMatrix extends IMatrixWithScaleData {

    set(a: number | IMatrixData, b: number, c: number, d: number, e: number, f: number): IMatrix
    setWith(dataWithScale: IMatrixWithScaleData): IMatrix  // set scaleX scaleY
    get(): IMatrixData
    clone(): IMatrix

    translate(x: number, y: number): IMatrix
    translateInner(x: number, y: number): IMatrix

    scale(x: number, y?: number): IMatrix
    scaleWith(x: number, y?: number): IMatrix // change scaleX scaleY
    scaleOfOuter(origin: IPointData, x: number, y?: number): IMatrix
    scaleOfInner(origin: IPointData, x: number, y?: number): IMatrix

    rotate(angle: number): IMatrix
    rotateOfOuter(origin: IPointData, angle: number): IMatrix
    rotateOfInner(origin: IPointData, angle: number): IMatrix

    skew(x: number, y?: number): IMatrix
    skewOfOuter(origin: IPointData, x: number, y?: number): IMatrix
    skewOfInner(origin: IPointData, x: number, y?: number): IMatrix

    multiply(child: IMatrixData): IMatrix
    multiplyParent(parent: IMatrixData): IMatrix

    divide(child: IMatrixData): IMatrix
    divideParent(parent: IMatrixData): IMatrix
    invert(): IMatrix
    invertWith(): IMatrix  // change scaleX scaleY

    toOuterPoint(inner: IPointData, to?: IPointData, distance?: boolean): void
    toInnerPoint(outer: IPointData, to?: IPointData, distance?: boolean): void

    setLayout(data: ILayoutData, origin?: IPointData): IMatrix
    getLayout(origin?: IPointData, firstSkewY?: boolean): ILayoutData

    withScale(scaleX?: number, scaleY?: number): IMatrixWithScaleData

    reset(): void
}

export interface IMatrixWithBoundsData extends IMatrixData, IBoundsData { }

export interface IMatrixWithScaleData extends IMatrixData, IScaleData { }

export interface IMatrixWithOptionScaleData extends IMatrixData {
    scaleX?: number
    scaleY?: number
}

export interface IMatrixWithBoundsScaleData extends IMatrixData, IBoundsData, IScaleData { }

export interface IMatrixWithLayoutData extends IMatrixData, ILayoutBoundsData { }
