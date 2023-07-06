import { IFunction } from '../function/IFunction'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { ILeaf } from '../display/ILeaf'

export interface IPlatform {
    requestRender?(render: IFunction): void
    canvas?: ILeaferCanvas
    isWorker?: boolean
    devicePixelRatio?: number
    intWheelDeltaY?: boolean // firxfox need
    conicGradientSupport?: boolean
    conicGradientRotate90?: boolean // fixfox need rotate
    fullImageShadow?: boolean // safari need 
    layout(target: ILeaf): void
    origin?: {
        createCanvas: ICreateCanvasFunction,
        loadImage: ILoadImageFunction
    }
}

interface ICreateCanvasFunction {
    (width: number, height: number, format?: 'svg' | 'pdf'): any
}

interface ILoadImageFunction {
    (url: string): Promise<any>
}