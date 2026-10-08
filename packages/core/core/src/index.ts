export * from '@leafer/canvas'
export * from '@leafer/image'

export * from '@leafer/data'
export * from '@leafer/debug'
export * from '@leafer/decorator'
export * from '@leafer/display'
export * from '@leafer/display-module'

export * from '@leafer/event'

export * from '@leafer/file'
export * from '@leafer/helper'
export * from '@leafer/layout'
export * from '@leafer/list'
export * from '@leafer/math'

export * from '@leafer/path'
export * from '@leafer/platform'

export * from '@leafer/task'

export const version = "2.3.1"

import { Plugin } from '@leafer/debug'

if (typeof globalThis !== 'undefined') {
    const globalLeafer = (globalThis as any).Leafer || ((globalThis as any).Leafer = {})
    globalLeafer.version = version
    globalLeafer.Plugin = Plugin
}