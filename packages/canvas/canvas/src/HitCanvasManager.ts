import { IScreenSizeData, IHitCanvasManager, ILeaf, IHitCanvas, ILeaferCanvas, ILeafList } from '@leafer/interface'
import { LeafList } from '@leafer/list'

import { CanvasManager } from './CanvasManager'


export class HitCanvasManager extends CanvasManager implements IHitCanvasManager {

    protected pathTypeList: ILeafList = new LeafList()
    protected imageTypeList: ILeafList = new LeafList()

    public get(_size: IScreenSizeData): ILeaferCanvas { return undefined }

    public getImageType(leaf: ILeaf, size: IScreenSizeData): IHitCanvas {
        this.imageTypeList.push(leaf)
        return this.leafer.creator.hitCanvas(size)
    }

    public getPathType(leaf: ILeaf): IHitCanvas {
        this.pathTypeList.push(leaf)
        return this.leafer.creator.hitCanvas()
    }

    public clearImageType(): void {
        this.__clearLeafList(this.imageTypeList)
    }

    public clearPathType(): void {
        this.__clearLeafList(this.pathTypeList)
    }

    protected __clearLeafList(leafList: ILeafList): void {
        leafList.forEach(leaf => {
            if (leaf.__hitCanvas) {
                leaf.__hitCanvas.destroy()
                leaf.__hitCanvas = null
            }
        })
        leafList.reset()
    }

    public clear(): void {
        this.clearPathType()
        this.clearImageType()
    }

}