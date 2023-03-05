import { IEvent, IObject } from '@leafer/interface'
import { Debug } from '@leafer/debug'


const debug = Debug.get('EventCreator')

export const EventCreator = {

    typeList: {} as IObject,

    register(Event: IObject): void {
        let type: string
        Object.keys(Event).forEach(key => {
            type = Event[key]
            if (typeof type === 'string') typeList[type] ? debug.error('register the repeat EventType: ', type) : typeList[type] = Event
        })
    },

    get(type: string, ...params: unknown[]): IEvent {
        return new typeList[type](...params)
    }

}

const { typeList } = EventCreator