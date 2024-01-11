import { IImageManager, ILeaferImageConfig, ILeaferImage, IExportFileType } from '@leafer/interface'
import { Creator } from '@leafer/platform'
import { FileHelper } from '@leafer/file'
import { TaskProcessor } from '@leafer/task'


export const ImageManager: IImageManager = {

    map: {},

    recycledList: [],

    tasker: new TaskProcessor(),

    patternTasker: new TaskProcessor(),

    get isComplete() { return I.tasker.isComplete },

    get(config: ILeaferImageConfig): ILeaferImage {
        let image = I.map[config.url]
        if (!image) {
            image = Creator.image(config)
            I.map[config.url] = image
        }
        image.use++
        return image
    },

    recycle(image: ILeaferImage): void {
        image.use--
        setTimeout(() => { if (!image.use) I.recycledList.push(image) })
    },

    clearRecycled(): void {
        const list = I.recycledList
        if (list.length) {
            list.forEach(image => {
                if (!image.use && image.url) {
                    delete I.map[image.url]
                    image.destroy()
                }
            })
            list.length = 0
        }
    },

    hasOpacityPixel(config: ILeaferImageConfig): boolean {
        return FileHelper.opacityTypes.some(item => I.isFormat(item, config))
    },

    isFormat(format: IExportFileType, config: ILeaferImageConfig): boolean {
        if (config.format === format) return true
        const { url } = config
        if (url.startsWith('data:')) {
            if (url.startsWith('data:' + FileHelper.mineType(format))) return true
        } else {
            if (url.includes('.' + format) || url.includes('.' + FileHelper.upperCaseTypeMap[format])) return true
        }
        return false
    },

    destroy(): void {
        I.map = {}
    }

}

const I = ImageManager