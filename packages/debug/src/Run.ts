import { IncrementId } from '@leafer/math'
import { Debug } from './Debug'


interface ids {
    [name: string]: number
}
interface names {
    [name: string]: string
}


const debug = Debug.get('RunTime')

export const Run = {

    currentId: 0,
    currentName: '',

    idMap: {} as ids,
    nameMap: {} as names,
    nameToIdMap: {} as ids,

    start(name: string, microsecond?: boolean): number {
        const id = IncrementId.create(IncrementId.RUNTIME)
        R.currentId = R.idMap[id] = microsecond ? performance.now() : Date.now()
        R.currentName = R.nameMap[id] = name
        R.nameToIdMap[name] = id
        return id
    },

    end(id: number, microsecond?: boolean): void {
        const time = R.idMap[id], name = R.nameMap[id]
        const duration = microsecond ? (performance.now() - time) / 1000 : Date.now() - time
        R.idMap[id] = R.nameMap[id] = R.nameToIdMap[name] = undefined
        debug.log(name, duration, 'ms')
    },

    endOfName(name: string, microsecond?: boolean): void {
        const id = R.nameToIdMap[name]
        if (id !== undefined) R.end(id, microsecond)
    }
}

const R = Run