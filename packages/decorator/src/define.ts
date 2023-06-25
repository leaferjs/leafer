import { ILeaf, IObject, __Value } from '@leafer/interface'

import * as types from './data'

interface IDataTypeFunction {
    (target: ILeaf, key: string): void
}

interface IDataTypeDecorator {
    (...arg: any): IDataTypeFunction
}

interface IDataTypeDecoratorMap {
    [key: string]: IDataTypeDecorator
}

export const DataTypeDecorator = {

    list: {} as IDataTypeDecoratorMap,

    register(name: string, decorator: IDataTypeDecorator): void {
        this.list[name] = decorator
    },

    get(name: string): IDataTypeDecorator {
        const decorator = this.list[name]
        return decorator
    }
}

Object.keys(types).forEach(key => {
    if (key.includes('Type')) {
        DataTypeDecorator.register(key, (types as IObject)[key] as IDataTypeDecorator)
    }
})