import { IDragEvent, IPointData, ILeaf } from '@leafer/interface'
import { registerUIEvent } from '@leafer/decorator'

import { PointerEvent } from './PointerEvent'


const move = {} as IPointData

@registerUIEvent()
export class DragEvent extends PointerEvent implements IDragEvent {

    static BEFORE_DRAG = 'drag.before_drag'

    static START = 'drag.start'
    static DRAG = 'drag'
    static END = 'drag.end'

    static OVER = 'drag.over'
    static OUT = 'drag.out'

    static ENTER = 'drag.enter'
    static LEAVE = 'drag.leave'

    readonly moveX: number
    readonly moveY: number
    readonly totalX: number
    readonly totalY: number

    public getInnerMove(relative?: ILeaf, total?: boolean): IPointData {
        if (!relative) relative = this.current
        this.assignMove(total)
        return relative.getInnerPoint(move, null, true)
    }

    public getLocalMove(relative?: ILeaf, total?: boolean): IPointData {
        if (!relative) relative = this.current
        this.assignMove(total)
        return relative.getLocalPoint(move, null, true)
    }

    public getInnerTotal(relative?: ILeaf): IPointData {
        return this.getInnerMove(relative, true)
    }

    public getLocalTotal(relative?: ILeaf): IPointData {
        return this.getLocalMove(relative, true)
    }

    protected assignMove(total: boolean): void {
        move.x = total ? this.totalX : this.moveX
        move.y = total ? this.totalY : this.moveY
    }

}