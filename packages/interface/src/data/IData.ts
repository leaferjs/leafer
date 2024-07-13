import { IPointData } from '../math/IMath'
import { IFunction } from '../function/IFunction'

export type INumber = number // number | string    will convert to number
export type IBoolean = boolean // boolean | string  will convert to boolean
export type IString = string //  string  | other   will convert to string
export type IValue = INumber | IBoolean | IString | IObject
export type ITimer = any

export type IPathString = string

export type IFourNumber = number | number[]

export interface IObject {
    [name: string]: any
}

export interface IBooleanMap {
    [name: string]: boolean
}

export interface INumberMap {
    [name: string]: number
}

export interface IStringMap {
    [name: string]: string
}

export interface IFunctionMap {
    [name: string]: IFunction
}


export interface IPointDataMap {
    [name: string]: IPointData
}

export interface IDataTypeHandle {
    (target: any): void
}