import { IBounds } from '../math/IMath'
import { ILeaf } from '../display/ILeaf'
import { ILeafList } from '../data/IList'
import { IControl } from '../control/IControl'

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

export interface ILayouter extends IControl {
    target: ILeaf
    layoutedBlocks: ILayoutBlockData[]

    totalTimes: number
    times: number

    disabled: boolean
    running: boolean
    layouting: boolean

    waitAgain: boolean

    config: ILayouterConfig

    disable(): void

    layout(): void
    layoutAgain(): void
    layoutOnce(): void
    partLayout(): void
    fullLayout(): void

    createBlock(data: ILeafList | ILeaf[]): ILayoutBlockData
    getBlocks(list: ILeafList): ILayoutBlockData[]
    addBlocks(current: ILayoutBlockData[]): void
}