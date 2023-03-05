export type __Number = number // number | string    will convert to number
export type __Boolean = boolean // boolean | string  will convert to boolean
export type __String = string //  string  | other   will convert to string
export type __Object = IObject // will convert to object
export type __Value = __Number | __Boolean | __String | __Object  // 


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

export interface IDataTypeHandle {
    (target: any): void
}

