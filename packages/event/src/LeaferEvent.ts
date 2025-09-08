import { ILeaferEvent, IStringMap } from '@leafer/interface'

import { Event } from './Event'


export class LeaferEvent extends Event implements ILeaferEvent {

    static START = 'leafer.start'

    static BEFORE_READY = 'leafer.before_ready'
    static READY = 'leafer.ready'
    static AFTER_READY = 'leafer.after_ready'

    static VIEW_READY = 'leafer.view_ready'

    static VIEW_COMPLETED = 'leafer.view_completed'

    static STOP = 'leafer.stop'
    static RESTART = 'leafer.restart'

    static END = 'leafer.end'

    static UPDATE_MODE = 'leafer.update_mode'

    // 变换操作
    static TRANSFORM = 'leafer.transform'
    static MOVE = 'leafer.move'
    static SCALE = 'leafer.scale'
    static ROTATE = 'leafer.rotate'
    static SKEW = 'leafer.skew'
}


const { MOVE, SCALE, ROTATE, SKEW } = LeaferEvent

export const leaferTransformAttrMap: IStringMap = {
    x: MOVE,
    y: MOVE,
    scaleX: SCALE,
    scaleY: SCALE,
    rotation: ROTATE,
    skewX: SKEW,
    skewY: SKEW
}