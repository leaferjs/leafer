import { IImageEvent, IObject, ILeaferImage } from '@leafer/interface'

import { Event } from './Event'

export class ImageEvent extends Event implements IImageEvent {

    static LOAD = 'image.load'
    static LOADED = 'image.loaded'
    static ERROR = 'image.error'

    readonly image: ILeaferImage
    readonly error: string | IObject

    readonly attrName: string
    readonly attrValue: IObject

    constructor(type: string, data: IImageEvent) {
        super(type)
        Object.assign(this, data)
    }

}