export * from '@leafer/core'

export * from '@leafer/canvas-web'
export * from '@leafer/interaction-web'

import { ICreator, IFunction } from '@leafer/interface'
import { Watcher, Layouter, Renderer, Selector, Platform, Creator } from '@leafer/core'

import { LeaferCanvas } from '@leafer/canvas-web'
import { Interaction } from '@leafer/interaction-web'
import { LeaferImage } from '@leafer/image/image-web'


Object.assign(Creator, {
    canvas: (options?, manager?) => new LeaferCanvas(options, manager),
    image: (options) => new LeaferImage(options),
    hitCanvas: (options?, manager?) => new LeaferCanvas(options, manager),

    watcher: (target) => new Watcher(target),
    layouter: (target) => new Layouter(target),
    renderer: (target, canvas, options?) => new Renderer(target, canvas, options),
    selector: (target) => new Selector(target),

    interaction: (target, canvas, selector, options?) => new Interaction(target, canvas, selector, options),
} as ICreator)

Platform.requestRender = function (render: IFunction): void { window.requestAnimationFrame(render) }
Platform.canvas = Creator.canvas()