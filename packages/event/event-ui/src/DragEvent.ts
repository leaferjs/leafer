import { IDragEvent, IPointData, ILeaf } from '@leafer/interface'
import { registerUIEvent } from '@leafer/decorator'

import { PointerEvent } from './PointerEvent'


const move = {} as IPointData
const point = {} as IPointData

@registerUIEvent()
export class DragEvent extends PointerEvent implements IDragEvent {

    static DRAG = 'drag'

    static START = 'drag.start'
    static END = 'drag.end'

    static OVER = 'drag.over'
    static OUT = 'drag.out'

    static ENTER = 'drag.enter'
    static LEAVE = 'drag.leave'

    readonly moveX: number
    readonly moveY: number
    readonly totalX: number
    readonly totalY: number

    public getInnerMove(target?: ILeaf): IPointData {
        if (!target) target = this.current
        move.x = this.moveX
        move.y = this.moveY
        target.worldToInner(move, point, true)
        return { ...point }
    }

    public getLocalMove(target?: ILeaf): IPointData {
        if (!target) target = this.current
        move.x = this.moveX
        move.y = this.moveY
        target.worldToLocal(move, point, true)
        return { ...point }
    }

}