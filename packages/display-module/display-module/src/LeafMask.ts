import { ILeaf, ILeaferCanvas, ILeafMaskModule, IRenderOptions } from '@leafer/interface'


export const LeafMask: ILeafMaskModule = {

    __updateEraser(value?: boolean): void {
        this.__hasEraser = value ? true : this.children.some(item => item.__.isEraser)
    },

    __updateMask(value?: boolean): void {
        this.__hasMask = value ? true : this.children.some(item => item.__.isMask)
    },

    __renderMask(canvas: ILeaferCanvas, options: IRenderOptions, content: ILeaferCanvas, mask: ILeaferCanvas, recycle?: boolean): void {
        content.resetTransform()
        content.opacity = 1

        canvas.resetTransform()
        canvas.opacity = 1

        if (options.matrix) {
            content.useMask(mask)
            canvas.copyWorld(content)
        } else {
            content.useMask(mask, this.__world)
            canvas.copyWorld(content, this.__world)
        }

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