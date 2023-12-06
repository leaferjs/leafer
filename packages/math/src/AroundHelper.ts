import { IAround, IPointData, IBoundsData } from '@leafer/interface'
import { Direction9 } from './Direction'


const directionData: IPointData[] = [
    { x: 0, y: 0 },  //topLeft
    { x: 0.5, y: 0 },//top
    { x: 1, y: 0 },  //topRight
    { x: 1, y: 0.5 },// right
    { x: 1, y: 1 },  //bottomRight
    { x: 0.5, y: 1 },//bottom
    { x: 0, y: 1 },  //bottomLeft
    { x: 0, y: 0.5 },//left
    { x: 0.5, y: 0.5 } // center
]

export const AroundHelper = {

    directionData, // index Direction9

    tempPoint: {} as IPointData,

    get,

    toPoint(around: IAround, bounds: IBoundsData, to?: IPointData, onlySize?: boolean) {
        to || (to = {} as IPointData)

        const point = get(around)
        to.x = point.x * bounds.width
        to.y = point.y * bounds.height

        if (!onlySize) {
            to.x += bounds.x
            to.y += bounds.y
        }
    }
}

function get(around: IAround): IPointData {
    return typeof around === 'string' ? directionData[Direction9[around]] : around
}