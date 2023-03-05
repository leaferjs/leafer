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