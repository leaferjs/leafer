import { IDragEvent, IPointData, ILeaf } from '@leafer/interface'
import { registerUIEvent } from '@leafer/decorator'

import { PointerEvent } from './PointerEvent'


const move = {} as IPointData

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

    public getInnerMove(target?: ILeaf, total?: boolean): IPointData {
        if (!target) target = this.current
        this.assignMove(total)
        return target.getInnerPoint(move, null, true)
    }

    public getLocalMove(target?: ILeaf, total?: boolean): IPointData {
        if (!target) target = this.current
        this.assignMove(total)
        return target.getWorldPoint(move, target.parent, true)
    }

    public getInnerTotal(target?: ILeaf): IPointData {
        return this.getInnerMove(target)
    }

    public getLocalTotal(target?: ILeaf): IPointData {
        return this.getLocalMove(target)
    }

    protected assignMove(total: boolean): void {
        move.x = total ? this.totalX : this.moveX
        move.y = total ? this.totalY : this.moveY
    }

}