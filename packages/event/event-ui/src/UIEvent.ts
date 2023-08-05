import { ILeaf, ILeafList, IObject, IPointData, IUIEvent } from '@leafer/interface'
import { Event } from '@leafer/event'
import { EventCreator } from '@leafer/platform'

import { Keyboard } from './Keyboard'
import { PointerButton as B } from './PointerButton'


const point = {} as IPointData

export class UIEvent extends Event implements IUIEvent {

    readonly x: number
    readonly y: number

    readonly path: ILeafList
    readonly throughPath?: ILeafList

    readonly altKey: boolean
    readonly ctrlKey: boolean
    readonly shiftKey: boolean
    readonly metaKey: boolean
    public get spaceKey(): boolean { return Keyboard.isHoldSpaceKey() }

    public get left(): boolean { return B.left(this) }
    public get right(): boolean { return B.right(this) }
    public get middle(): boolean { return B.middle(this) }
    readonly buttons: number

    readonly target: ILeaf
    readonly current: ILeaf
    readonly bubbles: boolean = true

    readonly origin: IObject

    constructor(params: IUIEvent) {
        super(params.type)
        Object.assign(this, params)
    }

    public getInner(target?: ILeaf): IPointData {
        if (!target) target = this.current
        target.worldToInner(this, point)
        return { ...point }
    }

    public getLocal(target?: ILeaf): IPointData {
        if (!target) target = this.current
        target.worldToLocal(this, point)
        return { ...point }
    }

    static changeName(oldName: string, newName: string): void {
        EventCreator.changeName(oldName, newName)
    }

}