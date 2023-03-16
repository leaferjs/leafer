import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { ILeaf } from '../display/ILeaf'
import { IBounds, IMatrix } from '../math/IMath'
import { IFunction } from '../function/IFunction'

export interface IRenderOptions {
    bounds?: IBounds,
    hideBounds?: IBounds,
    matrix?: IMatrix,
    inCamera?: boolean
}

export interface IRendererConfig {
    usePartRender?: boolean
    maxFPS?: number
}

export interface IRenderer {
    target: ILeaf
    canvas: ILeaferCanvas
    updateBlocks: IBounds[]

    FPS: number
    totalTimes: number
    times: number

    running: boolean
    changed: boolean

    config: IRendererConfig

    start(): void
    stop(): void
    update(): void

    requestLayout(): void

    render(callback?: IFunction): void
    renderOnce(callback?: IFunction): void
    partRender(): void
    clipRender(bounds: IBounds, fullMode?: boolean): void
    fullRender(bounds?: IBounds): void

    addBlock(block: IBounds): void
    mergeBlocks(): void

    destroy(): void
}