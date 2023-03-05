import { ICreator, IObject, IEvent, ILeaf } from '@leafer/interface'
import { EventCreator } from './EventCreator'
import { UICreator } from './UICreator'


export const Creator: ICreator = {

    ui(tag: string, data?: IObject): ILeaf {
        return UICreator.get(tag, data)
    },

    event(type: string, ...params: unknown[]): IEvent {
        return EventCreator.get(type, ...params)
    }

}