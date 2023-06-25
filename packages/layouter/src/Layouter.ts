import { ILayouter, ILeaf, ILayoutBlockData, IEventListenerId, ILayouterConfig, ILeafList } from '@leafer/interface'
import { LayoutEvent, WatchEvent } from '@leafer/event'
import { LeafLevelList, LeafList } from '@leafer/list'
import { BranchHelper, LeafHelper } from '@leafer/helper'
import { DataHelper } from '@leafer/data'
import { Run, Debug } from '@leafer/debug'

import { updateBounds, updateMatrix, updateChange } from './LayouterHelper'
import { LayoutBlockData } from './LayoutBlockData'


const { updateAllWorldMatrix, updateAllChange } = LeafHelper
const { pushAllBranchStack, updateWorldBoundsByBranchStack } = BranchHelper

const debug = Debug.get('Layouter')

export class Layouter implements ILayouter {

    public target: ILeaf
    public layoutedBlocks: ILayoutBlockData[]

    public totalTimes: number = 0
    public times: number

    public disabled: boolean
    public running: boolean
    public layouting: boolean

    public waitAgain: boolean

    public config: ILayouterConfig = {}

    protected __updateList: ILeafList
    protected __levelList: LeafLevelList = new LeafLevelList()
    protected __eventIds: IEventListenerId[]

    constructor(target: ILeaf, userConfig?: ILayouterConfig) {
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

    public layout(): void {
        if (!this.running) return
        const { target } = this
        this.times = 0

        try {
            target.emit(LayoutEvent.START)
            this.layoutOnce()
            target.emitEvent(new LayoutEvent(LayoutEvent.END, this.layoutedBlocks, this.times))
        } catch (e) {
            debug.error(e)
        }

        this.layoutedBlocks = null
    }

    public layoutAgain(): void {
        if (this.layouting) {
            this.waitAgain = true
        } else {
            this.layoutOnce()
        }
    }

    public layoutOnce(): void {

        if (this.layouting) return debug.warn('layouting')
        if (this.times > 3) return debug.warn('layout max times')

        this.times++
        this.totalTimes++

        this.layouting = true

        this.target.emit(WatchEvent.REQUEST)

        if (this.totalTimes > 1) {
            this.partLayout()
        } else {
            this.fullLayout()
        }

        this.layouting = false

        if (this.waitAgain) {
            this.waitAgain = false
            this.layoutOnce()
        }

    }

    public partLayout(): void {
        if (!this.__updateList?.length) return

        const t = Run.start('PartLayout')
        const { target, __updateList: updateList } = this
        const { BEFORE, LAYOUT, AFTER } = LayoutEvent

        const blocks = this.getBlocks(updateList)
        blocks.forEach(item => { item.setBefore() })
        target.emitEvent(new LayoutEvent(BEFORE, blocks, this.times))

        updateList.sort()
        updateMatrix(updateList, this.__levelList)
        updateBounds(this.__levelList)
        updateChange(updateList)

        blocks.forEach(item => item.setAfter())

        target.emitEvent(new LayoutEvent(LAYOUT, blocks, this.times))
        target.emitEvent(new LayoutEvent(AFTER, blocks, this.times))

        this.addBlocks(blocks)

        this.__levelList.reset()
        this.__updateList = null
        Run.end(t)

    }

    public fullLayout(): void {
        const t = Run.start('FullLayout')

        const { target } = this
        const { BEFORE, LAYOUT, AFTER } = LayoutEvent

        const blocks = this.getBlocks(new LeafList(target))
        target.emitEvent(new LayoutEvent(BEFORE, blocks, this.times))

        Layouter.fullLayout(target)

        blocks.forEach(item => { item.setAfter() })
        target.emitEvent(new LayoutEvent(LAYOUT, blocks, this.times))
        target.emitEvent(new LayoutEvent(AFTER, blocks, this.times))

        this.addBlocks(blocks)

        Run.end(t)

    }

    static fullLayout(target: ILeaf): void {
        updateAllWorldMatrix(target)

        if (target.isBranch) {
            const branchStack: ILeaf[] = [target]
            pushAllBranchStack(target, branchStack)
            updateWorldBoundsByBranchStack(branchStack)
        } else {
            target.__updateWorldBounds()
        }

        updateAllChange(target)
    }


    public createBlock(data: ILeafList | ILeaf[]): ILayoutBlockData {
        return new LayoutBlockData(data)
    }

    public getBlocks(list: ILeafList): ILayoutBlockData[] {
        return [this.createBlock(list)]
    }

    public addBlocks(current: ILayoutBlockData[]) {
        this.layoutedBlocks ? this.layoutedBlocks.push(...current) : this.layoutedBlocks = current
    }

    protected __onReceiveWatchData(event: WatchEvent): void {
        this.__updateList = event.data.updatedList
    }

    protected __listenEvents(): void {
        const { target } = this
        this.__eventIds = [
            target.on_(LayoutEvent.REQUEST, this.layout, this),
            target.on_(LayoutEvent.AGAIN, this.layoutAgain, this),
            target.on_(WatchEvent.DATA, this.__onReceiveWatchData, this)
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
            this.config = null
        }
    }

}


