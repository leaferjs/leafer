import { IEvent, IObject } from '@leafer/interface'
import { Debug } from '@leafer/debug'


const debug = Debug.get('EventCreator')

export const EventCreator = {

    nameList: {} as IObject,

    register(Event: IObject): void {
        let name: string
        Object.keys(Event).forEach(key => {
            name = Event[key]
            if (typeof name === 'string') nameList[name] && debug.repeat(name), nameList[name] = Event
        })
    },

    changeName(oldName: string, newName: string): void {
        const Event = nameList[oldName]
        if (Event) {
            const constName = Object.keys(Event).find(key => Event[key] === oldName)
            if (constName) {
                Event[constName] = newName
                nameList[newName] = Event
            }
        }
    },

    has(type: string): boolean {
        return !!this.nameList[type]
    },

    get(type: string, ...params: unknown[]): IEvent {
        return new nameList[type](...params)
    }

}

const { nameList } = EventCreator