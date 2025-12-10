import { IFunction, IStringFunction } from '../function/IFunction'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { ILeaf } from '../display/ILeaf'
import { IExportFileType, IExportImageType } from '../file/IFileType'
import { IBoundsData, ISizeData, IMatrixData } from '../math/IMath'
import { IObject } from '../data/IData'
import { ICanvasType } from '../canvas/ISkiaCanvas'
import { ISelector } from '../selector/ISelector'
import { IRenderOptions } from '../renderer/IRenderer'
import { ILeaferImage } from '../image/ILeaferImage'
import { ICanvasPattern } from '../canvas/ICanvas'


export interface IPlatform {
    name?: 'web' | 'node' | 'miniapp'
    os?: 'Mac' | 'Windows' | 'Linux'
    toURL(text: string, fileType?: 'text' | 'svg'): string

    requestRender?(render: IFunction): void
    canvas?: ILeaferCanvas
    renderCanvas?: ILeaferCanvas
    canvasType?: ICanvasType

    isWorker?: boolean
    isMobile?: boolean

    readonly devicePixelRatio?: number

    intWheelDeltaY?: boolean // firefox / Windows need
    conicGradientSupport?: boolean
    conicGradientRotate90?: boolean // firefox need rotate
    fullImageShadow?: boolean // safari need
    syncDomFont?: boolean // firefox need

    selector?: ISelector // 公共查找选择器
    getSelector?(leaf: ILeaf): ISelector
    layout?(target: ILeaf): void
    render?(target: ILeaf, canvas: ILeaferCanvas, options: IRenderOptions): void // 渲染元素，可处理内部产生的置顶渲染

    origin?: {
        createCanvas(width: number, height: number, format?: 'svg' | 'pdf'): any
        createOffscreenCanvas?(width: number, height: number, format?: 'svg' | 'pdf'): any
        canvasToDataURL(canvas: any, type?: IExportImageType, quality?: number): string | Promise<string>
        canvasToBolb(canvas: any, type?: IExportFileType, quality?: number): Promise<any>
        canvasSaveAs(canvas: any, filename: string, quality?: number): Promise<void>
        download(url: string, filename: string): Promise<void>
        loadImage(url: string, crossOrigin?: IImageCrossOrigin, leaferImage?: ILeaferImage): Promise<any>
        noRepeat?: string  // fix: 微信小程序 createPattern 直接使用 no-repeat 有bug，导致无法显示
        Image?: any
        PointerEvent?: any
        DragEvent?: any
    },

    roundRectPatch?: boolean //  fix: skia-canvas roundRect
    ellipseToCurve?: boolean, // fix: skia 绘制圆环和椭圆弧
    backgrounder?: boolean, // 后台模式运行，如 node、workder 

    event?: {
        stopDefault(origin: IObject): void
        stopNow(origin: IObject): void
        stop(origin: IObject): void
    },

    miniapp?: IMiniapp

    image: {
        hitCanvasSize: number // 图片生成碰撞画布的最大尺寸(单边)
        maxCacheSize: number // 最大等级缓存，一般取当前屏幕大小，默认2k: 2560 * 1600
        maxPatternSize: number // 最大repeat pattern缓存, 默认4k: 4096 * 2160
        prefix?: string // url加前缀
        suffix?: string  // 需要带上后缀区分dom中image标签的缓存，否则会导致浏览器缓存跨域问题
        crossOrigin: IImageCrossOrigin // 图片跨域设置
        isLarge(size: ISizeData, scaleX?: number, scaleY?: number, largeSize?: number): boolean // 比 maxCacheSize 尺寸更大
        isSuperLarge(size: ISizeData, scaleX?: number, scaleY?: number): boolean // 比 maxPatternSize 尺寸更大
        getRealURL: IStringFunction // 处理前缀、后缀
        resize(image: any, width: number, height: number, xGap?: number, yGap?: number, clip?: IBoundsData, smooth?: boolean, opacity?: number, filters?: IObject): any
        setPatternTransform(pattern: ICanvasPattern, transform?: IMatrixData, paint?: IObject): void
    },

    canCreateImageBitmap?: boolean // 是否能使用 createImageBitmap
    canClipImageBitmap?: boolean // 是否能使用 createImageBitmap 裁剪图片
}

export type IImageCrossOrigin = 'anonymous' | 'use-credentials' // 图片跨域设置


export interface IMiniappSelect extends IObject { }

export interface IMiniappSizeView extends ISizeData {
    view: any
}

export interface IMiniapp {
    select(name: string): IMiniappSelect
    getBounds(select: IMiniappSelect): Promise<IBoundsData>
    getSizeView(select: IMiniappSelect): Promise<IMiniappSizeView>
    onWindowResize(fun: IFunction): void
    offWindowResize(fun: IFunction): void
    saveToAlbum(path: string): Promise<any>
}