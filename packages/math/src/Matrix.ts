import { IMatrix, IMatrixData, IPointData } from '@leafer/interface'
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

    public copy(matrix: IMatrixData): IMatrix {
        M.copy(this, matrix)
        return this
    }

    public clone(): IMatrix {
        return new Matrix(this)
    }


    public translate(x: number, y: number): IMatrix {
        this.e += x
        this.f += y
        return this
    }

    public scale(x: number, y?: number): IMatrix {
        M.scale(this, x, y)
        return this
    }

    public rotate(angle: number): IMatrix {
        M.rotate(this, angle)
        return this
    }


    public times(matrix: IMatrixData): IMatrix {
        M.times(this, matrix)
        return this
    }

    public divide(matrix: IMatrixData): IMatrix {
        M.divide(this, matrix)
        return this
    }

    public invert(): IMatrix {
        M.invert(this)
        return this
    }


    public toWorldPoint(local: IPointData, to?: IPointData): void {
        M.toWorldPoint(this, local, to)
    }

    public toLocalPoint(world: IPointData, to?: IPointData): void {
        M.toLocalPoint(this, world, to)
    }


    public empty(): void {
        M.empty(this)
    }

}