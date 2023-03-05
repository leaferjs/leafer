import { ILeaf } from '../display/ILeaf'
import { ILeafList } from '../data/IList'

export interface IWatchEventData {
    updatedList: ILeafList
}

export interface IWatcherConfig {

}

export interface IWatcher {
    target: ILeaf
    updatedList: ILeafList
    totalTimes: number
    config: IWatcherConfig
    running: boolean
    changed: boolean

    start(): void
    stop(): void

    update(): void
    destroy(): void
}