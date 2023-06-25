import { IImageEvent, IObject, IEventTarget, ILeaferImage } from '@leafer/interface'

import { Event } from './Event'

export class ImageEvent extends Event implements IImageEvent {

    static LOADED = 'image.loaded'
    static ERROR = 'image.error'

    readonly image: ILeaferImage
    readonly error: string | IObject

    readonly attrName?: string
    readonly attrValue?: IObject

    constructor(type: string, target: IEventTarget, image: ILeaferImage, attrName?: string, attrValue?: IObject, error?: string | IObject) {
        super(type, target)
        this.image = image
        this.attrName = attrName
        this.attrValue = attrValue
        if (error) this.error = error
    }

}