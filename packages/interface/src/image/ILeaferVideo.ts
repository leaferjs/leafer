import { ILeaferImage, ILeaferImageConfig } from './ILeaferImage'
import { ILeaf } from '../display/ILeaf'
import { ICanvasContext2D } from '../canvas/ICanvas'

export interface ILeaferVideoConfig extends ILeaferImageConfig {

}

export interface ILeaferVideo extends ILeaferImage {

}


export interface IVideoDecoder {
    width: number
    height: number

    duration: number

    currentTime: number // 当前播放进度 (秒)
    volume: number // 音量 0 ~1 

    readonly paused: boolean
    readonly ended: boolean

    loop: number

    decoder: any

    bufferCanvas?: any // 缓冲画布
    bufferContext?: ICanvasContext2D

    render(canvas: any, x: number, y: number, width: number, height: number, leaf: ILeaf, paint: any, imageScaleX: number, imageScaleY: number): void

    destroyDecoder(): void

    close(): void
}

export interface IVideoOptions {
    loop?: number
    autoplay?: boolean
}

export interface IVideoPlayOptions extends IVideoOptions {
    paused?: boolean
}