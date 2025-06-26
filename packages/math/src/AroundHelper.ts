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

    toPoint(around: IAround, box: IBoundsData, to: IPointData, onlyBoxSize?: boolean, content?: IBoundsData, onlyContentSize?: boolean) {
        const point = get(around)

        to.x = point.x
        to.y = point.y


        if (point.type === 'percent') {
            to.x *= box.width
            to.y *= box.height

            if (content) { // align
                if (!onlyContentSize) to.x -= content.x, to.y -= content.y
                if (point.x) to.x -= (point.x === 1) ? content.width : (point.x === 0.5 ? point.x * content.width : 0)
                if (point.y) to.y -= (point.y === 1) ? content.height : (point.y === 0.5 ? point.y * content.height : 0)
            }
        }

        if (!onlyBoxSize) to.x += box.x, to.y += box.y
    },

    getPoint(around: IAround, box: IBoundsData, to?: IPointData): IPointData {
        if (!to) to = {} as IPointData
        AroundHelper.toPoint(around, box, to, true)
        return to
    }
}

function get(around: IAround): IUnitPointData {
    return typeof around === 'string' ? directionData[Direction9[around]] : around
}