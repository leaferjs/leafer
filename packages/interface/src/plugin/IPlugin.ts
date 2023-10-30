import { ILeaferBase } from '../app/ILeafer'
import { IObject } from '../data/IData'

export interface IPlugin extends IObject {
    name?: string
    importVersion: string
    import: string[]
    run(LeaferUI: IObject, config: IObject): void
    onLeafer?(leafer: ILeaferBase): void
}