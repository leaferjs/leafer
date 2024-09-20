import { IAround, IPointData, IBoundsData, IUnitPointData } from '@leafer/interface'
import { Direction9 } from './Direction'


const directionData: IUnitPointData[] = [
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
directionData.forEach(item => item.type = 'percent')

export const AroundHelper = {

    directionData, // index Direction9

    tempPoint: {} as IPointData,

    get,

    toPoint(around: IAround, bounds: IBoundsData, to: IPointData, onlySize?: boolean, pointBounds?: IBoundsData) {
        const point = get(around)

        to.x = point.x
        to.y = point.y

        if (point.type === 'percent') {
            to.x *= bounds.width
            to.y *= bounds.height

            if (pointBounds) { // align
                to.x -= pointBounds.x
                to.y -= pointBounds.y
                if (point.x) to.x -= (point.x === 1) ? pointBounds.width : (point.x === 0.5 ? point.x * pointBounds.width : 0)
                if (point.y) to.y -= (point.y === 1) ? pointBounds.height : (point.y === 0.5 ? point.y * pointBounds.height : 0)
            }
        }

        if (!onlySize) {
            to.x += bounds.x
            to.y += bounds.y
        }
    }
}

function get(around: IAround): IUnitPointData {
    return typeof around === 'string' ? directionData[Direction9[around]] : around
}