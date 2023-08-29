import { IScreenSizeData, IHitCanvasManager, ILeaf, IHitCanvas, ILeafList } from '@leafer/interface'
import { LeafList } from '@leafer/list'
import { Creator } from '@leafer/platform'

import { CanvasManager } from './CanvasManager'


export class HitCanvasManager extends CanvasManager implements IHitCanvasManager {

    protected pathTypeList: ILeafList = new LeafList()
    protected imageTypeList: ILeafList = new LeafList()

    public getImageType(leaf: ILeaf, size: IScreenSizeData): IHitCanvas {
        this.imageTypeList.push(leaf)
        return Creator.hitCanvas(size)
    }

    public getPathType(leaf: ILeaf): IHitCanvas {
        this.pathTypeList.push(leaf)
        return Creator.hitCanvas()
    }

    public clearImageType(): void {
        this.__clearLeafList(this.imageTypeList)
    }

    public clearPathType(): void {
        this.__clearLeafList(this.pathTypeList)
    }

    protected __clearLeafList(leafList: ILeafList): void {
        if (leafList.length) {
            leafList.forEach(leaf => {
                if (leaf.__hitCanvas) {
                    leaf.__hitCanvas.destroy()
                    leaf.__hitCanvas = null
                }
            })
            leafList.reset()
        }
    }

    public clear(): void {
        this.clearPathType()
        this.clearImageType()
    }

}