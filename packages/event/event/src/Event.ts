import { IEvent, IEventTarget } from '@leafer/interface'


export class Event implements IEvent {

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
    }

    public stopNow(): void {
        this.isStopNow = true
        this.isStop = true
    }

    public stop(): void {
        this.isStop = true
    }
}