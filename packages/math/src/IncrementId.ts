import { INumberMap } from '@leafer/interface'


export const IncrementId = {

    RUNTIME: 'runtime',
    LEAF: 'leaf',
    TASK: 'task',
    CNAVAS: 'canvas',
    IMAGE: 'image',

    types: {} as INumberMap,

    create(typeName: string): number {
        const { types } = I
        if (types[typeName]) {
            return types[typeName]++
        } else {
            types[typeName] = 1
            return 0
        }
    }
}

const I = IncrementId