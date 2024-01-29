import { IChildEvent, ILeaf } from '@leafer/interface'

import { Event } from './Event'


export class ChildEvent extends Event implements IChildEvent {

    static ADD = 'child.add'
    static REMOVE = 'child.remove'

    readonly parent?: ILeaf
    readonly child?: ILeaf

    constructor(type: string, child?: ILeaf, parent?: ILeaf) {
        super(type, child)
        this.parent = parent
        this.child = child
    }

}