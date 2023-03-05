import { IObject } from '../data/IData'

export interface IPlugin {
    name: string
    version: string
    author: string
    license: string
    description: string
    dependencies: string[]
    run(params: IObject): void
}