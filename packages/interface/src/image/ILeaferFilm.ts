import { ILeaferImage, ILeaferImageConfig } from './ILeaferImage'
import { ILeaf } from '../display/ILeaf'
import { IPointData, IOptionPointData } from '../math/IMath'
import { ICanvasContext2D } from '../canvas/ICanvas'

export interface ILeaferFilmConfig extends ILeaferImageConfig {

}

export interface ILeaferFilm extends ILeaferImage {

}

export interface IFilmDecoder {
    width: number
    height: number

    total: number
    loop: number
    frames: IFilmFrame[]

    atlas?: any // 合并图
    atlasContext?: any // 合并图的上下文手柄
    atlasGrid?: IPointData

    decoder: any

    bufferCanvas?: any // 缓冲图
    bufferContext?: ICanvasContext2D

    createAtlas(): void
    decodeHeader(data: ArrayBuffer, type: string): Promise<void>
    decodeFrame(frameIndex: number): Promise<IFilmFrame>
    decodeOneFrame(frameIndex: number): Promise<IFilmFrame>
    mergeFrame(frameIndex: number, destoryFrameImage: boolean): void

    render(canvas: any, x: number, y: number, width: number, height: number, leaf: ILeaf, options: any): void

    destoryFrame(frameIndex: number, deleteIndex: boolean): void
    destoryFrameImage(frame: IFilmFrame): void
    destroyDecoder(): void
    close(): void
}

export interface IFilmFrame extends IOptionPointData {
    image?: any // 不存在时使用合并图
    duration: number // 毫秒
    decoding?: boolean // 正在解码中
}

export interface IFilmOptions {
    nowIndex?: number
    pauseIndex?: number // 播放到这一帧暂停
    loop?: number
    speed?: number
    autoplay?: boolean
}

export interface IFilmPlayOptions extends IFilmOptions {
    frameTime?: number
    frameTimer?: any // 下一帧的timer
    paused?: boolean
}