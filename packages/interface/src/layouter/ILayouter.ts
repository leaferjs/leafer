import { IBounds } from '../math/IMath'
import { ILeaf } from '../display/ILeaf'
import { ILeafList } from '../data/IList'

export interface ILayoutChangedData {
    matrixList: ILeaf[]
    boundsList: ILeaf[]
    surfaceList: ILeaf[]
}

export interface ILayoutBlockData {
    updatedList: ILeafList
    updatedBounds: IBounds

    beforeBounds: IBounds
    afterBounds: IBounds

    setBefore?(): void
    setAfter?(): void
    merge?(data: ILayoutBlockData): void
    destroy(): void
}

export interface IPartLayoutConfig {
    maxBlocks?: number
    maxTimes?: number
}

export interface ILayouterConfig {
    partLayout?: IPartLayoutConfig
}

export interface ILayouter {
    target: ILeaf
    layoutedBlocks: ILayoutBlockData[]
    totalTimes: number
    times: number
    config: ILayouterConfig
    running: boolean

    start(): void
    stop(): void

    createBlock(data: ILeafList | ILeaf[]): ILayoutBlockData
    getBlocks(list: ILeafList): ILayoutBlockData[]
    setBlocks(current: ILayoutBlockData[]): void

    layout(): void
    partLayout(): void
    fullLayout(): void
    destroy(): void
}