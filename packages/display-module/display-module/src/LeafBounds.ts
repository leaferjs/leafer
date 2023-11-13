import { ILeafBoundsModule } from '@leafer/interface'
import { BoundsHelper } from '@leafer/math'
import { LeafHelper } from '@leafer/helper'


const { toOuterOf, copyAndSpread } = BoundsHelper

export const LeafBounds: ILeafBoundsModule = {

    __updateWorldBounds(): void {

        toOuterOf(this.__layout.renderBounds, this.__world, this.__world)

        if (this.__layout.resized) {
            this.__onUpdateSize()
            this.__layout.resized = false
        }

    },

    __updateLocalBounds(): void {

        const layout = this.__layout

        if (layout.boxChanged) {

            this.__updatePath()
            this.__updateRenderPath()

            this.__updateBoxBounds()
            layout.boxChanged = false
            layout.resized = true
        }


        if (layout.localBoxChanged) { // position change

            if (this.__local) this.__updateLocalBoxBounds()
            layout.localBoxChanged = false

            if (layout.strokeSpread) layout.strokeChanged = true
            if (layout.renderSpread) layout.renderChanged = true
            if (this.parent) this.parent.__layout.boxChange()
        }


        if (layout.strokeChanged) {

            layout.strokeSpread = this.__updateStrokeSpread()

            if (layout.strokeSpread) {

                if (layout.strokeBounds === layout.boxBounds) {
                    layout.spreadStroke()
                }

                this.__updateStrokeBounds()
                this.__updateLocalStrokeBounds()

            } else {
                layout.spreadStrokeCancel()
            }

            layout.strokeChanged = false
            if (layout.renderSpread) layout.renderChanged = true

            if (this.parent) this.parent.__layout.strokeChange()
            layout.resized = true
        }


        if (layout.renderChanged) {

            layout.renderSpread = this.__updateRenderSpread()

            if (layout.renderSpread) {

                if (layout.renderBounds === layout.boxBounds || layout.renderBounds === layout.strokeBounds) {
                    layout.spreadRender()
                }

                this.__updateRenderBounds()
                this.__updateLocalRenderBounds()

            } else {
                layout.spreadRenderCancel()
            }

            layout.renderChanged = false

            if (this.parent) this.parent.__layout.renderChange()
        }

    },

    __updateLocalBoxBounds(): void {
        toOuterOf(this.__layout.boxBounds, this.__local, this.__local)
    },

    __updateLocalStrokeBounds(): void {
        toOuterOf(this.__layout.strokeBounds, this.__localMatrix, this.__layout.localStrokeBounds)
    },

    __updateLocalRenderBounds(): void {
        toOuterOf(this.__layout.renderBounds, this.__localMatrix, this.__layout.localRenderBounds)
    },


    __updateBoxBounds(): void {
        const b = this.__layout.boxBounds
        const { width, height } = this.__
        b.x = 0
        b.y = 0
        b.width = width
        b.height = height
    },

    __updateNaturalSize(): void {
        const { __: data, __layout: layout } = this
        data.__naturalWidth = layout.boxBounds.width
        data.__naturalHeight = layout.boxBounds.height

        if (this.around) {
            this.__layout.matrixChanged = true
            LeafHelper.updateAllWorldMatrix(this)
        }
    },

    __updateStrokeBounds(): void {
        copyAndSpread(this.__layout.strokeBounds, this.__layout.boxBounds, this.__layout.strokeSpread)
    },

    __updateRenderBounds(): void {
        copyAndSpread(this.__layout.renderBounds, this.__layout.strokeBounds, this.__layout.renderSpread)
    },

}