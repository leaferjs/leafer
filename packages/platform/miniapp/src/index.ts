export * from '@leafer/core'
export * from '@leafer/partner'

export * from '@leafer/canvas-miniapp'
export * from '@leafer/image-miniapp'
export * from '@leafer/interaction-miniapp'

import { ICanvasType, ICreator, IExportFileType, IExportImageType, IFunction, IObject, IMiniappSelect, IMiniappSizeView, IBoundsData } from '@leafer/interface'
import { Platform, Creator, FileHelper } from '@leafer/core'

import { LeaferCanvas } from '@leafer/canvas-miniapp'
import { LeaferImage } from '@leafer/image-miniapp'
import { Interaction } from '@leafer/interaction-miniapp'


const { mineType, fileType } = FileHelper


Object.assign(Creator, {
    canvas: (options?, manager?) => new LeaferCanvas(options, manager),
    image: (options) => new LeaferImage(options),
    hitCanvas: (options?, manager?) => new LeaferCanvas(options, manager),

    interaction: (target, canvas, selector, options?) => { return new Interaction(target, canvas, selector, options) }
} as ICreator)


export function useCanvas(_canvasType: ICanvasType, app?: IObject): void {
    if (!Platform.origin) {
        Platform.origin = {
            createCanvas: (width: number, height: number, _format?: string) => app.createOffscreenCanvas({ type: '2d', width, height }),
            canvasToDataURL: (canvas: IObject, type?: IExportImageType, quality?: number) => canvas.toDataURL(mineType(type), quality),
            canvasToBolb: (canvas: IObject, type?: IExportFileType, quality?: number) => canvas.toBuffer(type, { quality }),
            canvasSaveAs: (canvas: IObject, filePath: string, quality?: any) => {
                return new Promise((resolve, reject) => {
                    let data: string = canvas.toDataURL(mineType(fileType(filePath)), quality)
                    data = data.substring(data.indexOf('64,') + 3)
                    let toAlbum: boolean
                    if (!filePath.includes('/')) {
                        filePath = `${app.env.USER_DATA_PATH}/` + filePath
                        toAlbum = true
                    }
                    const fs = app.getFileSystemManager()
                    fs.writeFile({
                        filePath,
                        data,
                        encoding: 'base64',
                        success() {
                            if (toAlbum) {
                                Platform.miniapp.saveToAlbum(filePath).then(() => {
                                    fs.unlink({ filePath })
                                })
                            }
                            resolve()
                        },
                        fail(error: any) {
                            reject(error)
                        }
                    })
                })
            },
            loadImage(url: string): Promise<HTMLImageElement> {
                return new Promise((resolve, reject) => {
                    const img = Platform.canvas.view.createImage()
                    img.onload = () => { resolve(img) }
                    img.onerror = (error: any) => { reject(error) }
                    img.src = url
                })
            },
            noRepeat: 'repeat-x' // fix: 微信小程序 createPattern 直接使用 no-repeat 有bug，导致无法显示
        }

        Platform.miniapp = {
            select(name: string): IMiniappSelect {
                return app.createSelectorQuery().select(name)
            },
            getBounds(select: IMiniappSelect): Promise<IBoundsData> {
                return new Promise((resolve) => {
                    select.boundingClientRect().exec((res: any) => {
                        const rect = res[1]
                        resolve({ x: rect.top, y: rect.left, width: rect.width, height: rect.height })
                    })
                })
            },
            getSizeView(select: IMiniappSelect): Promise<IMiniappSizeView> {
                return new Promise((resolve) => {
                    select.fields({ node: true, size: true }).exec((res: any) => {
                        const data = res[0]
                        resolve({ view: data.node, width: data.width, height: data.height })
                    })
                })
            },
            saveToAlbum(path: string): Promise<any> {
                return new Promise((resolve) => {
                    app.getSetting({
                        success: (res: any) => {
                            if (res.authSetting['scope.writePhotosAlbum']) {
                                app.saveImageToPhotosAlbum({
                                    filePath: path,
                                    success() { resolve(true) }
                                })
                            } else {
                                app.authorize({
                                    scope: 'scope.writePhotosAlbum',
                                    success: () => {
                                        app.saveImageToPhotosAlbum({
                                            filePath: path,
                                            success() { resolve(true) }
                                        })
                                    },
                                    fail: () => { }
                                })
                            }
                        }
                    })
                })
            },
            onWindowResize(fun: IFunction): void {
                app.onWindowResize(fun)
            },
            offWindowResize(fun: IFunction): void {
                app.offWindowResize(fun)
            }
        }

        Platform.event = {
            stopDefault(_origin: IObject): void { },
            stopNow(_origin: IObject): void { },
            stop(_origin: IObject): void { }
        }

        Platform.canvas = Creator.canvas()
        Platform.conicGradientSupport = !!Platform.canvas.context.createConicGradient
    }
}

Platform.name = 'miniapp'
Platform.requestRender = function (render: IFunction): void { Platform.canvas.view.requestAnimationFrame(render) }
Platform.devicePixelRatio = wx.getSystemInfoSync().pixelRatio
