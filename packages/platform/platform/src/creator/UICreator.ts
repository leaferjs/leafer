import { ILeaf, IObject } from '@leafer/interface'
import { Debug } from '@leafer/debug'


const debug = Debug.get('UICreator')

export const UICreator = {

    list: {} as IObject,

    register(UI: IObject): void {
        const { tag } = UI.prototype as ILeaf
        if (list[tag]) {
            debug.error('register the repeat UI: ', tag)
        } else {
            list[tag] = UI
        }
    },

    get(tag: string, data: IObject): ILeaf {
        return new list[tag](data)
    }

}

const { list } = UICreator