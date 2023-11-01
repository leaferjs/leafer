import { IAround, IPointData } from '@leafer/interface'

const center: IPointData = { x: 0.5, y: 0.5 }

export const AroundHelper = {
    center,
    read(around: IAround): IPointData {
        switch (around) {
            case 'center':
                return center
            default:
                return around as IPointData
        }
    }
}