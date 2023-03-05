import { ILeaf, IWatcher, IEventListenerId, ILeafList, IWatcherConfig } from '@leafer/interface'
import { AttrEvent, ChildEvent, RenderEvent, WatchEvent } from '@leafer/event'
import { LeafList } from '@leafer/list'
import { DataHelper } from '@leafer/data'


export class Watcher implements IWatcher {

    public target: ILeaf
    public updatedList: ILeafList = new LeafList()
    public totalTimes: number = 0

    public config: IWatcherConfig = {}
    public running: boolean
    public changed: boolean = true

    protected eventIds: IEventListenerId[]

    constructor(target: ILeaf, userConfig?: IWatcherConfig) {
        this.target = target
        if (userConfig) this.config = DataHelper.default(userConfig, this.config)
        this.listenEvents()
    }

    public start(): void {
        this.running = true
        this.changed = false
        this.update()
    }

    public stop(): void {
        this.running = false
    }

    private listenEvents(): void {
        const { target } = this
        this.eventIds = [
            target.on__(AttrEvent.CHANGE, this.onAttrChange, this),
            target.on__([ChildEvent.ADD, ChildEvent.REMOVE], this.onChildEvent, this),
            target.on__(WatchEvent.REQUEST, this.onRquestData, this)
        ]
    }

    private removeListenEvents(): void {
        this.target.off__(this.eventIds)
    }

    public onRquestData(): void {
        this.target.emitEvent(new WatchEvent(WatchEvent.DATA, { updatedList: this.updatedList }))
        this.updatedList = new LeafList()
        this.totalTimes++
        this.changed = false
    }

    protected onAttrChange(event: AttrEvent): void {
        this.updatedList.push(event.target as ILeaf)
        this.update()
    }

    protected onChildEvent(event: ChildEvent): void {
        this.updatedList.push(event.type === ChildEvent.REMOVE ? event.parent : event.child) // 此处可以优化
        this.update()
    }

    public update(): void {
        if (!this.running) return
        this.changed = true
        this.target.emit(RenderEvent.REQUEST)
    }

    public destroy(): void {
        if (this.target) {
            this.removeListenEvents()
            this.target = undefined
            this.updatedList = undefined
        }
    }

}