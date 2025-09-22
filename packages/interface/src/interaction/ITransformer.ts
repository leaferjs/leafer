import { IMoveEvent, IZoomEvent, IRotateEvent } from '../event/IUIEvent'

export interface ITransformer {
    readonly transforming: boolean
    readonly moving: boolean
    readonly zooming: boolean
    readonly rotating: boolean
    move(data: IMoveEvent): void
    zoom(data: IZoomEvent): void
    rotate(data: IRotateEvent): void
    transformEnd(): void
    destroy(): void
}