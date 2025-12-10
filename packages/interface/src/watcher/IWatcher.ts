import { ILeaf } from '../display/ILeaf'
import { ILeafList } from '../data/IList'
import { IControl } from '../control/IControl'
import { ILayouterConfig } from '../layouter/ILayouter'

export interface IWatchEventData {
    updatedList: ILeafList
}

export interface IWatcherConfig extends ILayouterConfig {

}

export interface IWatcher extends IControl {
    target: ILeaf

    totalTimes: number

    disabled: boolean
    running: boolean
    changed: boolean

    hasVisible: boolean
    hasAdd: boolean
    hasRemove: boolean
    readonly childrenChanged: boolean

    config: IWatcherConfig

    updatedList: ILeafList

    disable(): void

    update(): void
}