import { IAround, IPointData, IBoundsData } from '@leafer/interface'

const center: IPointData = { x: 0.5, y: 0.5 }

export const AroundHelper = {

    center,

    tempPoint: {} as IPointData,

    toPoint(around: IAround, bounds: IBoundsData, to?: IPointData, onlySize?: boolean) {
        to || (to = {} as IPointData)

        switch (around) {
            case 'center':
                around = center
                break
        }

        to.x = around.x * bounds.width
        to.y = around.y * bounds.height

        if (!onlySize) {
            to.x += bounds.x
            to.y += bounds.y
        }
    }
}