import { ILayouter, ILeaf, ILayoutBlockData, IEventListenerId, ILayouterConfig, ILeafList } from '@leafer/interface'
import { LayoutEvent, RenderEvent, WatchEvent } from '@leafer/event'
import { LeafLevelList, LeafList } from '@leafer/list'
import { BranchHelper, LeafHelper } from '@leafer/helper'
import { DataHelper } from '@leafer/data'
import { Run } from '@leafer/debug'

import { updateBounds, updateMatrix, updateChange } from './LayouterHelper'
import { LayoutBlockData } from './LayoutBlockData'


const { updateAllWorldMatrix, updateAllChange } = LeafHelper
const { pushAllBranchStack, updateWorldBoundsByBranchStack } = BranchHelper

export class Layouter implements ILayouter {

    public target: ILeaf
    public layoutedBlocks: ILayoutBlockData[]
    public totalTimes: number = 0
    public times: number
    public changed: boolean = true

    public config: ILayouterConfig = {
        partLayout: {
            maxTimes: 3
        }
    }

    public running: boolean

    protected updateList: ILeafList
    protected levelList: LeafLevelList = new LeafLevelList()
    protected eventIds: IEventListenerId[]

    constructor(target: ILeaf, userConfig?: ILayouterConfig) {
        this.target = target
        if (userConfig) this.config = DataHelper.default(userConfig, this.config)
        this.listenEvents()
    }

    public start(): void {
        this.running = true
    }

    public stop(): void {
        this.running = false
    }

    protected listenEvents(): void {
        const { target } = this
        this.eventIds = [
            target.on__(LayoutEvent.REQUEST, this.layout, this),
            target.on__(LayoutEvent.AGAIN, this.layoutOnce, this),
            target.on__(WatchEvent.DATA, this.onReceiveWatchData, this),
            target.on__(RenderEvent.REQUEST, this.onChange, this),
        ]
    }

    protected removeListenEvents(): void {
        this.target.off__(this.eventIds)
    }

    protected onReceiveWatchData(event: WatchEvent): void {
        this.updateList = event.data.updatedList
    }

    protected onChange(): void {
        this.changed = true
    }

    public layout(): void {
        if (!this.running) return
        const { target } = this
        const { START, LAYOUT, END } = LayoutEvent
        this.times = 0
        this.changed = false
        target.emit(START)
        this.layoutOnce()
        target.emitEvent(new LayoutEvent(LAYOUT, this.layoutedBlocks))
        target.emitEvent(new LayoutEvent(END, this.layoutedBlocks))
        this.layoutedBlocks = undefined
    }

    public layoutOnce(): void {

        this.totalTimes++
        this.times++

        this.target.emit(WatchEvent.REQUEST)
        if (this.totalTimes > 1) {
            this.partLayout()
        } else {
            this.fullLayout()
        }
    }

    public partLayout(): void {
        if (!this.updateList?.length) return

        const t = Run.start('part layout')
        const { target, updateList } = this
        const { BEFORE_ONCE, ONCE, AFTER_ONCE } = LayoutEvent

        const blocks = this.getBlocks(updateList)
        blocks.forEach(item => { item.setBefore() })
        target.emitEvent(new LayoutEvent(BEFORE_ONCE, blocks))

        updateList.sort()
        updateMatrix(updateList, this.levelList)
        updateBounds(this.levelList)
        updateChange(updateList)

        blocks.forEach(item => { item.setAfter() })
        target.emitEvent(new LayoutEvent(ONCE, blocks))
        target.emitEvent(new LayoutEvent(AFTER_ONCE, blocks))

        this.setBlocks(blocks)

        this.levelList.reset()
        this.updateList = undefined
        Run.end(t)

        this.__checkAgain()
    }

    public fullLayout(): void {
        const t = Run.start('full layout')

        const { target } = this
        const { BEFORE_ONCE, ONCE, AFTER_ONCE } = LayoutEvent

        const blocks = this.getBlocks(new LeafList(target))
        target.emitEvent(new LayoutEvent(BEFORE_ONCE, blocks))

        Layouter.fullLayout(target)

        blocks.forEach(item => { item.setAfter() })
        target.emitEvent(new LayoutEvent(ONCE, blocks))
        target.emitEvent(new LayoutEvent(AFTER_ONCE, blocks))

        this.setBlocks(blocks)

        Run.end(t)

        this.__checkAgain()
    }

    protected __checkAgain(): void {
        if (this.changed && this.times <= this.config.partLayout.maxTimes) this.target.emit(LayoutEvent.AGAIN) // 防止更新布局过程中产生了属性修改
    }


    public createBlock(data: ILeafList | ILeaf[]): ILayoutBlockData {
        return new LayoutBlockData(data)
    }

    public getBlocks(list: ILeafList): ILayoutBlockData[] {
        return [this.createBlock(list)]
    }

    public setBlocks(current: ILayoutBlockData[]) {
        this.layoutedBlocks ? this.layoutedBlocks.push(...current) : this.layoutedBlocks = current
    }


    static fullLayout(target: ILeaf): void {
        updateAllWorldMatrix(target)

        if (target.__isBranch) {
            const branchStack: ILeaf[] = [target]
            pushAllBranchStack(target, branchStack)
            updateWorldBoundsByBranchStack(branchStack)
        } else {
            target.__updateWorldBounds()
        }

        updateAllChange(target)
    }

    destroy(): void {
        if (this.target) {
            this.removeListenEvents()
            this.target = undefined
        }
    }

}


