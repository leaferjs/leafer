import { IEvent, IEventTarget, IObject } from '@leafer/interface'
import { Platform } from '@leafer/platform'


export class Event implements IEvent {

    readonly origin: IObject

    readonly type: string
    readonly target: IEventTarget
    readonly current: IEventTarget

    readonly bubbles: boolean = false
    readonly phase: number

    public isStopDefault: boolean
    public isStop: boolean
    public isStopNow: boolean

    constructor(type: string, target?: IEventTarget) {
        this.type = type
        if (target) this.target = target
    }

    public stopDefault(): void {
        this.isStopDefault = true
        if (this.origin) Platform.event.stopDefault(this.origin)
    }

    public stopNow(): void {
        this.isStopNow = true
        this.isStop = true
        if (this.origin) Platform.event.stopNow(this.origin)
    }

    public stop(): void {
        this.isStop = true
        if (this.origin) Platform.event.stop(this.origin)
    }
}