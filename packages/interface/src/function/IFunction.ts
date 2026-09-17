import { IObject, IValue } from '../data/IData'
import { IPointData } from '../math/IMath'
import { ILeaf } from '../display/ILeaf'

export interface IFunction {
    (...arg: any): any
}

export interface INumberFunction {
    (...arg: any): number
}

export interface IStringFunction {
    (...arg: any): string
}

export interface IObjectFunction {
    (...arg: any): IObject
}

export interface IValueFunction {
    (leaf: any): IValue
}

export interface IPointDataFunction {
    (...arg: any): IPointData
}


export interface IAttrDecorator {
    (...arg: any): IAttrDecoratorInner
}


export interface IParentChangeFunction {
    (parent: ILeaf, child: ILeaf): any
}


interface IAttrDecoratorInner {
    (target: any, key: string): any
}