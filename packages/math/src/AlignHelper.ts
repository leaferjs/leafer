import { IPointData, IBoundsData, IAlign } from '@leafer/interface'
import { AroundHelper } from './AroundHelper'

const { toPoint } = AroundHelper

export const AlignHelper = {
    toPoint(align: IAlign, content: IBoundsData, box: IBoundsData, to: IPointData, onlyBoxSize?: boolean, onlyContentSize?: boolean): void {
        toPoint(align, box, to, onlyBoxSize, content, onlyContentSize)
    }
}