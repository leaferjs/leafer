import { IMatrix, IMatrixData, IPointData, IOrientPointData } from '@leafer/interface'
import { MatrixHelper as M } from './MatrixHelper'


export class Matrix implements IMatrix {

    public a: number
    public b: number
    public c: number
    public d: number
    public e: number
    public f: number

    constructor(a?: number | IMatrixData, b?: number, c?: number, d?: number, e?: number, f?: number) {
        typeof a === 'object' ? M.copy(this, a) : M.set(this, a, b, c, d, e, f)
    }

    public set(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number): void {
        M.set(this, a, b, c, d, e, f)
    }

    public get(): IMatrixData {
        const { a, b, c, d, e, f } = this
        return { a, b, c, d, e, f }
    }

    public copy(matrix: IMatrixData): IMatrix {
        M.copy(this, matrix)
        return this
    }

    public clone(): IMatrix {
        return new Matrix(this)
    }


    public translate(x: number, y: number): IMatrix {
        M.translate(this, x, y)
        return this
    }

    public translateInner(x: number, y: number): IMatrix {
        M.translateInner(this, x, y)
        return this
    }

    public scale(x: number, y?: number): IMatrix {
        M.scale(this, x, y)
        return this
    }

    public scaleOfOuter(origin: IPointData, x: number, y?: number): IMatrix {
        M.scaleOfOuter(this, origin, x, y)
        return this
    }
    public scaleOfInner(origin: IPointData, x: number, y?: number): IMatrix {
        M.scaleOfInner(this, origin, x, y)
        return this
    }

    public rotate(angle: number): IMatrix {
        M.rotate(this, angle)
        return this
    }

    public rotateOfOuter(origin: IPointData, angle: number): IMatrix {
        M.rotateOfOuter(this, origin, angle)
        return this
    }

    public rotateOfInner(origin: IPointData, angle: number): IMatrix {
        M.rotateOfInner(this, origin, angle)
        return this
    }


    public skew(x: number, y?: number): IMatrix {
        M.skew(this, x, y)
        return this
    }

    public skewOfOuter(origin: IPointData, x: number, y?: number): IMatrix {
        M.skewOfOuter(this, origin, x, y)
        return this
    }

    public skewOfInner(origin: IPointData, x: number, y?: number): IMatrix {
        M.skewOfInner(this, origin, x, y)
        return this
    }


    public multiply(child: IMatrixData): IMatrix {
        M.multiply(this, child)
        return this
    }

    public multiplyParent(parent: IMatrixData): IMatrix {
        M.multiplyParent(this, parent)
        return this
    }

    public divide(child: IMatrixData): IMatrix {
        M.divide(this, child)
        return this
    }

    public divideParent(parent: IMatrixData): IMatrix {
        M.divideParent(this, parent)
        return this
    }

    public invert(): IMatrix {
        M.invert(this)
        return this
    }


    public toOuterPoint(inner: IPointData, to?: IPointData, distance?: boolean): void {
        M.toOuterPoint(this, inner, to, distance)
    }

    public toInnerPoint(outer: IPointData, to?: IPointData, distance?: boolean): void {
        M.toInnerPoint(this, outer, to, distance)
    }

    public decompose(): IOrientPointData {
        return M.decompose(this)
    }


    public reset(): void {
        M.reset(this)
    }

}