import { IImageManager, ILeaferImageConfig, ILeaferImage } from '@leafer/interface'
import { Creator } from '@leafer/platform'
import { TaskProcessor } from '@leafer/task'

export const ImageManager: IImageManager = {

    map: {},

    tasker: new TaskProcessor(),

    patternTasker: new TaskProcessor(),

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
    },

    clearRecycled(): void {
        Object.values(I.map).forEach(image => {
            if (!image.use) {
                I.map[image.url] = undefined
                image.destroy()
            }
        })
    },

    destroy(): void {
        I.map = {}
        I.tasker = null
    }

}

const I = ImageManager