import { ILeaf, IWatcher, IEventListenerId, ILeafList, IWatcherConfig } from '@leafer/interface'
import { PropertyEvent, ChildEvent, RenderEvent, WatchEvent, LeafList, DataHelper } from '@leafer/core'


export class Watcher implements IWatcher {

    public target: ILeaf

    public totalTimes: number = 0

    public disabled: boolean
    public running: boolean
    public changed: boolean

    public hasVisible: boolean
    public hasAdd: boolean
    public hasRemove: boolean
    public get childrenChanged() { return this.hasAdd || this.hasRemove || this.hasVisible }

    public config: IWatcherConfig = {}

    public get updatedList(): ILeafList {
        if (this.hasRemove && this.config.usePartLayout) {
            const updatedList = new LeafList()
            this.__updatedList.list.forEach(item => { if (item.leafer) updatedList.add(item) })
            return updatedList
        } else {
            return this.__updatedList
        }
    }

    protected __eventIds: IEventListenerId[]
    protected __updatedList: ILeafList = new LeafList()

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
        if (this.config.usePartLayout) this.__updatedList.add(event.target as ILeaf)
        this.update()
    }

    protected __onChildEvent(event: ChildEvent): void {
        if (this.config.usePartLayout) {
            if (event.type === ChildEvent.ADD) {
                this.hasAdd = true
                this.__pushChild(event.child)
            } else {
                this.hasRemove = true
                this.__updatedList.add(event.parent)
            }
        }
        this.update()
    }

    protected __pushChild(child: ILeaf): void {
        this.__updatedList.add(child)
        if (child.isBranch) this.__loopChildren(child)
    }

    protected __loopChildren(parent: ILeaf): void {
        const { children } = parent
        for (let i = 0, len = children.length; i < len; i++) this.__pushChild(children[i])
    }

    public __onRquestData(): void {
        this.target.emitEvent(new WatchEvent(WatchEvent.DATA, { updatedList: this.updatedList }))
        this.__updatedList = new LeafList()
        this.totalTimes++
        this.changed = this.hasVisible = this.hasRemove = this.hasAdd = false
    }

    protected __listenEvents(): void {
        this.__eventIds = [
            this.target.on_([
                [PropertyEvent.CHANGE, this.__onAttrChange, this],
                [[ChildEvent.ADD, ChildEvent.REMOVE], this.__onChildEvent, this],
                [WatchEvent.REQUEST, this.__onRquestData, this]
            ])
        ]
    }

    protected __removeListenEvents(): void {
        this.target.off_(this.__eventIds)
    }

    public destroy(): void {
        if (this.target) {
            this.stop()
            this.__removeListenEvents()
            this.target = this.__updatedList = null
        }
    }

}