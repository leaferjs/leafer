import { ILeafEventerModule } from '@leafer/interface'
import { Eventer } from '@leafer/event'

const { on, on_, off, off_, once, emit, emitEvent, hasEvent, destroy } = Eventer.prototype

export const LeafEventer: ILeafEventerModule = { on, on_, off, off_, once, emit, emitEvent, hasEvent, destroyEventer: destroy }