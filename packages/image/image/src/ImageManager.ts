import { IImageManager, ILeaferImageConfig, ILeaferImage, IExportFileType } from '@leafer/interface'
import { Creator, Platform } from '@leafer/platform'
import { FileHelper, Resource } from '@leafer/file'
import { TaskProcessor } from '@leafer/task'


export const ImageManager: IImageManager = {

    maxRecycled: 10,

    recycledList: [],

    patternTasker: new TaskProcessor(),

    get(config: ILeaferImageConfig): ILeaferImage {
        let image: ILeaferImage = Resource.get(config.url)
        if (!image) Resource.set(config.url, image = Creator.image(config))
        image.use++
        return image
    },

    recycle(image: ILeaferImage): void {
        image.use--
        setTimeout(() => {
            if (!image.use) {
                if (Platform.image.isLarge(image)) {
                    if (image.url) Resource.remove(image.url)
                } else {
                    image.clearLevels()
                    I.recycledList.push(image)
                }
            }
        })
    },

    // maybe rewrite
    recyclePaint(paint: any): void {
        I.recycle(paint.image)
    },

    clearRecycled(force?: boolean): void {
        const list = I.recycledList
        if (list.length > I.maxRecycled || force) {
            list.forEach(image => ((!image.use || force) && image.url) && Resource.remove(image.url))
            list.length = 0
        }
    },

    // need rewrite
    clearLevels(): void { },

    hasAlphaPixel(config: ILeaferImageConfig): boolean {
        return FileHelper.alphaPixelTypes.some(item => I.isFormat(item, config))
    },

    isFormat(format: IExportFileType, config: ILeaferImageConfig): boolean {
        if (config.format) return config.format === format
        const { url } = config
        if (url.startsWith('data:')) {
            if (url.startsWith('data:' + FileHelper.mineType(format))) return true
        } else {
            if (url.includes('.' + format) || url.includes('.' + FileHelper.upperCaseTypeMap[format])) return true
            else if (format === 'png' && !url.includes('.')) return true // blob: 等无后缀名协议的图片无法分析类型，直接当透明图片处理
        }
        return false
    },

    destroy(): void {
        this.clearRecycled(true)
    }

}

const I = ImageManager