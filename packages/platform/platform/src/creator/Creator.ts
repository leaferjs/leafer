import { ICreator, IObject, ILeaf } from '@leafer/interface'
import { Plugin } from '@leafer/debug'


export const Creator: ICreator = {
    editor(_options?: IObject): ILeaf {
        return Plugin.need('editor')
    }
}