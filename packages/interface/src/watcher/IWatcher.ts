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

    running: boolean
    changed: boolean

    config: IWatcherConfig

    start(): void
    stop(): void

    update(): void
    destroy(): void
}