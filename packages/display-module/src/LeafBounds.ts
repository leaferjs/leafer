import { ILeafBoundsModule } from '@leafer/interface'
import { BoundsHelper } from '@leafer/math'


const { toWorld, copyAndSpread } = BoundsHelper

export const LeafBounds: ILeafBoundsModule = {

    __updateWorldBounds(): void {

        if (this.__layout.boundsChanged) {

            let resize: boolean
            const layout = this.__layout


            if (layout.boxBoundsChanged) {

                this.__updatePath()
                this.__updateRenderPath()

                this.__updateBoxBounds()
                layout.boxBoundsChanged = false
                resize = true
            }


            if (layout.localBoxBoundsChanged) { // position change

                this.__updateRelativeBoxBounds()
                layout.localBoxBoundsChanged = false

                if (layout.eventBoundsSpreadWidth) layout.eventBoundsChanged = true
                if (layout.renderBoundsSpreadWidth) layout.renderBoundsChanged = true
                this.parent?.__layout.boxBoundsChange()
            }


            if (layout.eventBoundsChanged) {

                layout.eventBoundsSpreadWidth = this.__updateEventBoundsSpreadWidth()

                if (layout.eventBoundsSpreadWidth) {

                    if (layout.eventBounds === layout.boxBounds) {
                        layout.eventBoundsSpread()
                    }

                    this.__updateEventBounds()
                    this.__updateRelativeEventBounds()
                    layout.eventBoundsChanged = false

                    if (layout.renderBoundsSpreadWidth) layout.renderBoundsChanged = true

                } else {
                    layout.eventBoundsSpreadCancel()
                }

                this.parent?.__layout.eventBoundsChange()
                resize || (resize = true)
            }


            if (layout.renderBoundsChanged) {

                layout.renderBoundsSpreadWidth = this.__updateRenderBoundsSpreadWidth()

                if (layout.renderBoundsSpreadWidth) {

                    if (layout.renderBounds === layout.boxBounds || layout.renderBounds === layout.eventBounds) {
                        layout.renderBoundsSpread()
                    }

                    this.__updateRenderBounds()
                    this.__updateRelativeRenderBounds()
                    layout.renderBoundsChanged = false

                } else {
                    layout.renderBoundsSpreadCancel()
                }

                this.parent?.__layout.renderBoundsChange()
            }


            layout.boundsChanged = false

            toWorld(this.__layout.renderBounds, this.__world, this.__world)

            if (resize) this.__onUpdateSize()

        } else {
            toWorld(this.__layout.renderBounds, this.__world, this.__world)
        }

    },

    __updateRelativeBoxBounds(): void {
        toWorld(this.__layout.boxBounds, this.__relative, this.__relative)
    },

    __updateRelativeEventBounds(): void {
        toWorld(this.__layout.eventBounds, this.__relative, this.__layout.relativeEventBounds)
    },

    __updateRelativeRenderBounds(): void {
        toWorld(this.__layout.renderBounds, this.__relative, this.__layout.relativeRenderBounds)
    },


    __updateBoxBounds(): void {
        const b = this.__layout.boxBounds
        b.x = 0
        b.y = 0
        b.width = this.__.width
        b.height = this.__.height
    },

    __updateEventBounds(): void {
        copyAndSpread(this.__layout.eventBounds, this.__layout.boxBounds, this.__layout.eventBoundsSpreadWidth)
    },

    __updateRenderBounds(): void {
        copyAndSpread(this.__layout.renderBounds, this.__layout.eventBounds, this.__layout.renderBoundsSpreadWidth)
    },

}