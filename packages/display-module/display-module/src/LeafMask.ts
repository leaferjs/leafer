import { ILeaf, ILeaferCanvas, ILeafMaskModule } from '@leafer/interface'


export const LeafMask: ILeafMaskModule = {

    __updateEraser(value?: boolean): void {
        this.__hasEraser = value ? true : this.children.some(item => item.__.isEraser)
    },

    __updateMask(value?: boolean): void {
        this.__hasMask = value ? true : this.children.some(item => item.__.isMask)
    },

    __renderMask(canvas: ILeaferCanvas, content: ILeaferCanvas, mask: ILeaferCanvas, recycle?: boolean): void {
        content.opacity = 1
        content.resetTransform()
        content.useMask(mask)

        canvas.opacity = this.__worldOpacity
        canvas.resetTransform()
        canvas.copyWorld(content)

        if (recycle) {
            content.recycle()
            mask.recycle()
        } else {
            content.clear()
            mask.clear()
        }
    },

    __removeMask(child?: ILeaf): void {
        if (child) {
            child.isMask = false
            this.remove(child)
        } else {
            const { children } = this
            for (let i = 0, len = children.length; i < len; i++) {
                child = children[i]
                if (child.isMask) {
                    this.__removeMask(child)
                    len--, i--
                }
            }
        }
    }

}