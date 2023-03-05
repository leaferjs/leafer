import { IScreenSizeData, ILeaferCanvas } from '@leafer/interface'

export interface ICanvasManager {
    add(canvas: ILeaferCanvas): void
    get(size: IScreenSizeData): ILeaferCanvas
    recycle(old: ILeaferCanvas): void
    clearRecycled(): void
    clear(): void
    destory(): void
}