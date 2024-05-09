import { IPointData, IBoundsData, IAlign } from '@leafer/interface'
import { AroundHelper } from './AroundHelper'

const { toPoint } = AroundHelper

export const AlignHelper = {
    toPoint(align: IAlign, alignBounds: IBoundsData, bounds: IBoundsData, to?: IPointData, onlySize?: boolean): void {
        toPoint(align, bounds, to, onlySize, alignBounds)
    }
}