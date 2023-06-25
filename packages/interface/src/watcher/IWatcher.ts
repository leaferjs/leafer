import { ILeaf } from '../display/ILeaf'
import { ILeafList } from '../data/IList'
import { IControl } from '../control/IControl'

export interface IWatchEventData {
    updatedList: ILeafList
}

export interface IWatcherConfig {

}

export interface IWatcher extends IControl {
    target: ILeaf
    updatedList: ILeafList

    totalTimes: number

    disabled: boolean
    running: boolean
    changed: boolean

    config: IWatcherConfig

    disable(): void

    update(): void
}