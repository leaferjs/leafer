import { ILeaferBase } from './ILeafer'

export interface IAppBase extends ILeaferBase {
    children: ILeaferBase[]
    realCanvas: boolean
}
