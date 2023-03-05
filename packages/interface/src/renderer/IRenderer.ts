import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { ILeaf } from '../display/ILeaf'
import { IBounds, IMatrix } from '../math/IMath'
import { IFunction } from '../function/IFunction'
import { ILayoutBlockData } from '../layouter/ILayouter'

export interface IRenderOptions {
    bounds?: IBounds,
    hideBounds?: IBounds,
    matrix?: IMatrix,
    inCamera?: boolean
}

export interface IRendererConfig {
    maxFPS?: number
}

export interface IRenderer {
    canvas: ILeaferCanvas
    target: ILeaf
    layoutedBlocks: ILayoutBlockData[]
    running: boolean
    totalTimes: number
    times: number
    config: IRendererConfig

    FPS: number

    start(): void
    stop(): void

    requestLayout(): void
    render(callback?: IFunction): void
    clipRender(bounds: IBounds): void
    fullRender(bounds?: IBounds): void
    destroy(): void
}