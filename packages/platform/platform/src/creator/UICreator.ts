import { ILeaf, IObject } from '@leafer/interface'
import { isUndefined } from '@leafer/data'
import { Debug } from '@leafer/debug'


const debug = Debug.get('UICreator')

export const UICreator = {

    list: {} as IObject,

    register(UI: IObject): void {
        const { __tag: tag } = UI.prototype as ILeaf
        if (list[tag]) debug.repeat(tag)
        list[tag] = UI
    },

    get(tag: string, data?: IObject, x?: number, y?: number, width?: number, height?: number): ILeaf {
        if (!list[tag]) debug.error('not register ' + tag)
        const ui = new list[tag](data)
        if (!isUndefined(x)) {
            ui.x = x
            if (y) ui.y = y
            if (width) ui.width = width
            if (height) ui.height = height
        }
        return ui
    }

}

const { list } = UICreator