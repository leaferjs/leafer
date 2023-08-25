import { IImageManager, ILeaferImageConfig, ILeaferImage } from '@leafer/interface'
import { Creator } from '@leafer/platform'
import { TaskProcessor } from '@leafer/task'

export const ImageManager: IImageManager = {

    map: {},

    recycledList: [],

    tasker: new TaskProcessor(),

    patternTasker: new TaskProcessor(),

    get isComplete() { return I.tasker.isComplete && I.patternTasker.isComplete },

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
        setTimeout(() => { if (!image.use) I.recycledList.push(image) }, 0)
    },

    clearRecycled(): void {
        const list = I.recycledList
        if (list.length) {
            list.forEach(image => {
                if (!image.use) {
                    delete I.map[image.url]
                    image.destroy()
                }
            })
            list.length = 0
        }
    },

    destroy(): void {
        I.map = {}
        I.tasker = null
    }

}

const I = ImageManager