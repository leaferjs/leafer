export * from '@leafer/core'
export * from '@leafer/partner'

export * from '@leafer/canvas-web'
export * from '@leafer/image-web'
export * from '@leafer/interaction-web'

import { ICreator, IFunction } from '@leafer/interface'
import { Platform, Creator } from '@leafer/core'

import { LeaferCanvas } from '@leafer/canvas-web'
import { LeaferImage } from '@leafer/image-web'
import { Interaction } from '@leafer/interaction-web'


Object.assign(Creator, {
    canvas: (options?, manager?) => new LeaferCanvas(options, manager),
    image: (options) => new LeaferImage(options),
    hitCanvas: (options?, manager?) => new LeaferCanvas(options, manager),

    interaction: (target, canvas, selector, options?) => new Interaction(target, canvas, selector, options),
} as ICreator)

Platform.requestRender = function (render: IFunction): void { window.requestAnimationFrame(render) }
Platform.canvas = Creator.canvas()
Platform.devicePixelRatio = devicePixelRatio
Platform.conicGradientSupport = !!Platform.canvas.context.createConicGradient

const { userAgent } = navigator

if (userAgent.indexOf("Firefox") > -1) {
    Platform.conicGradientRotate90 = true
    Platform.intWheelDeltaY = true
} else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
    Platform.fullImageShadow = true
}
