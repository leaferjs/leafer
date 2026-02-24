import { ILeaferImage, ILeaferFilm, ILeaferVideo, IFilmFileType, IVideoFileType, IResource, IObject, ILeaferCanvas, IExportFileType, ILeaferImageConfig } from '@leafer/interface'

import { Creator } from '@leafer/platform'
import { TaskProcessor } from '@leafer/task'
import { isString } from '@leafer/data'
import { Debug } from '@leafer/debug'


const debug = Debug.get('Resource')

export const Resource: IResource = {

    tasker: new TaskProcessor(), // 会并行的异步加载任务

    queue: new TaskProcessor({ parallel: 1 }), // 全局按顺序执行的任务队列，防止阻塞主线程

    map: {},

    get isComplete() { return R.tasker.isComplete },

    // 通用

    set(key: string, value: any): void {
        if (R.map[key]) debug.repeat(key)
        R.map[key] = value
    },

    get(key: string): any {
        return R.map[key]
    },

    remove(key: string) {
        const r = R.map[key]
        if (r) {
            if (r.destroy) r.destroy()
            delete R.map[key]
        }
    },

    // image

    loadImage(key: string, format?: IExportFileType): Promise<ILeaferImage> {
        return new Promise((resolve, reject) => {
            const image = this.setImage(key, key, format)
            image.load(() => resolve(image), (e: any) => reject(e))
        })
    },

    setImage(key: string, value: string | IObject | ILeaferImage | ILeaferCanvas, format?: IExportFileType): ILeaferImage {
        let config: ILeaferImageConfig
        if (isString(value)) config = { url: value }
        else if (!value.url) config = { url: key, view: value }
        if (config) format && (config.format = format), value = Creator.image(config)
        R.set(key, value)
        return value as ILeaferImage
    },

    // film

    loadFilm(_key: string, _format?: IFilmFileType): Promise<ILeaferFilm> { return undefined },

    // video

    loadVideo(_key: string, _format?: IVideoFileType): Promise<ILeaferVideo> { return undefined },

    destroy(): void {
        R.map = {}
    }

}

const R = Resource