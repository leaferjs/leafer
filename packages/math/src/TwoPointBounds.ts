import { ITwoPointBounds, ITwoPointBoundsData } from '@leafer/interface'
import { TwoPointBoundsHelper as P } from './TwoPointBoundsHelper'

export class TwoPointBounds implements ITwoPointBounds {

    public minX: number
    public minY: number
    public maxX: number
    public maxY: number

    constructor(x: number, y: number) {
        P.setPoint(this, x, y)
    }

    addPoint(x: number, y: number): void {
        P.addPoint(this, x, y)
    }

    addBounds(x: number, y: number, width: number, height: number): void {
        P.addBounds(this, x, y, width, height)
    }

    add(pb: ITwoPointBoundsData): void {
        P.add(this, pb)
    }

}