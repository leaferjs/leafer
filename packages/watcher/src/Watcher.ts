import { ILeaf, IWatcher, IEventListenerId, ILeafList, IWatcherConfig } from '@leafer/interface'
import { PropertyEvent, ChildEvent, RenderEvent, WatchEvent } from '@leafer/event'
import { LeafList } from '@leafer/list'
import { DataHelper } from '@leafer/data'


export class Watcher implements IWatcher {

    public target: ILeaf
    public updatedList: ILeafList = new LeafList()

    public totalTimes: number = 0

    public disabled: boolean
    public running: boolean
    public changed: boolean

    public config: IWatcherConfig = {}

    protected __eventIds: IEventListenerId[]

    constructor(target: ILeaf, userConfig?: IWatcherConfig) {
        this.target = target
        if (userConfig) this.config = DataHelper.default(userConfig, this.config)
        this.__listenEvents()
    }

    public start(): void {
        if (this.disabled) return
        this.running = true
    }

    public stop(): void {
        this.running = false
    }

    public disable(): void {
        this.stop()
        this.__removeListenEvents()
        this.disabled = true
    }

    public update(): void {
        this.changed = true
        if (this.running) this.target.emit(RenderEvent.REQUEST)
    }

    protected __onAttrChange(event: PropertyEvent): void {
        this.updatedList.push(event.target as ILeaf)
        this.update()
    }

    protected __onChildEvent(event: ChildEvent): void {
        if (event.type === ChildEvent.ADD) {
            this.__pushChild(event.child)
        } else {
            this.updatedList.push(event.parent) // 此处可以优化
        }
        this.update()
    }

    protected __pushChild(child: ILeaf): void {
        this.updatedList.push(child)
        if (child.isBranch) this.__loopChildren(child)
    }

    protected __loopChildren(parent: ILeaf): void {
        const { children } = parent
        for (let i = 0, len = children.length; i < len; i++) this.__pushChild(children[i])
    }

    public __onRquestData(): void {
        this.target.emitEvent(new WatchEvent(WatchEvent.DATA, { updatedList: this.updatedList }))
        this.updatedList = new LeafList()
        this.totalTimes++
        this.changed = false
    }

    protected __listenEvents(): void {
        const { target } = this
        this.__eventIds = [
            target.on_(PropertyEvent.CHANGE, this.__onAttrChange, this),
            target.on_([ChildEvent.ADD, ChildEvent.REMOVE], this.__onChildEvent, this),
            target.on_(WatchEvent.REQUEST, this.__onRquestData, this)
        ]
    }

    protected __removeListenEvents(): void {
        this.target.off_(this.__eventIds)
    }

    public destroy(): void {
        if (this.target) {
            this.stop()
            this.__removeListenEvents()
            this.target = null
            this.updatedList = null
        }
    }

}