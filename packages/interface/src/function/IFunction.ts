import { IPointData } from '../math/IMath'

export interface IFunction {
    (...arg: any): any
}

export interface INumberFunction {
    (...arg: any): number
}

export interface IPointDataFunction {
    (...arg: any): IPointData
}


export interface IAttrDecorator {
    (...arg: any): IAttrDecoratorInner
}

interface IAttrDecoratorInner {
    (target: any, key: string): any
}