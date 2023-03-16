import { IncrementId } from '@leafer/math'
import { Debug } from './Debug'


interface ids {
    [name: string]: number
}
interface names {
    [name: string]: string
}


const debug = Debug.get('RunTime')

export class Run {

    static currentId: number
    static currentTime: number
    static currentName: string

    static idMap: ids = {}
    static nameMap: names = {}
    static nameToIdMap: ids = {}

    static start(name: string, microsecond?: boolean): number {
        const id = IncrementId.create(IncrementId.RUNTIME)
        R.currentId = R.idMap[id] = microsecond ? performance.now() : Date.now()
        R.currentName = R.nameMap[id] = name
        R.nameToIdMap[name] = id
        return id
    }

    static end(id: number, microsecond?: boolean): void {
        const time = R.idMap[id]
        const name = R.nameMap[id]
        R.idMap[id] = undefined
        R.nameMap[id] = undefined
        R.nameToIdMap[name] = undefined

        if (microsecond) {
            debug.log(name, performance.now() - time, 'µs')
        } else {
            debug.log(name, Date.now() - time, 'ms')
        }
    }

    static endOfName(name: string, microsecond?: boolean): void {
        const id = R.nameToIdMap[name]
        if (id !== undefined) R.end(id, microsecond)
    }
}

const R = Run