import { ITwoPointBounds, ITwoPointBoundsData, IBounds } from '@leafer/interface'
import { TwoPointBoundsHelper as P } from './TwoPointBoundsHelper'
import { Bounds } from './Bounds'

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

    getBounds(): IBounds {
        const bounds = new Bounds()
        P.toBounds(this, bounds)
        return bounds
    }

}