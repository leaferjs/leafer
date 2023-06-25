// leafer's partner, allow replace
export * from '@leafer/watcher'
export * from '@leafer/layouter'
export * from '@leafer/renderer'
export * from '@leafer/selector'

import { Watcher } from '@leafer/watcher'
import { Layouter } from '@leafer/layouter'
import { Renderer } from '@leafer/renderer'
import { Selector } from '@leafer/selector'

import { ICreator } from '@leafer/interface'
import { Creator } from '@leafer/core'

Object.assign(Creator, {
    watcher: (target, options?) => new Watcher(target, options),
    layouter: (target, options?) => new Layouter(target, options),
    renderer: (target, canvas, options?) => new Renderer(target, canvas, options),
    selector: (target, options?) => new Selector(target, options)
} as ICreator)