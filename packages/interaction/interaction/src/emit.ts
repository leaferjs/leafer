import { IUIEvent, ILeaf, ILeafList } from '@leafer/interface'
import { Creator } from '@leafer/platform'

export function emit(type: string, data: IUIEvent, path?: ILeafList, excludePath?: ILeafList): void {
    if (!path && !data.path) return

    let leaf: ILeaf
    data.type = type
    if (path) {
        data = { ...data, path }
    } else {
        path = data.path
    }

    data.target = path.indexAt(0)

    // 捕获阶段
    for (let i = path.length - 1; i > -1; i--) {
        leaf = path.list[i]

        if (leaf.hasEvent(type, true) && (!excludePath || !excludePath.has(leaf))) {
            data.phase = 1
            const event = Creator.event(type, data)
            leaf.emitEvent(event, true)
            if (event.isStop) return
        }
    }

    // 冒泡阶段
    for (let i = 0, len = path.length; i < len; i++) {
        leaf = path.list[i]

        if (leaf.hasEvent(type, false) && (!excludePath || !excludePath.has(leaf))) {
            data.phase = (leaf === data.target) ? 2 : 3
            const event = Creator.event(type, data)
            leaf.emitEvent(event)
            if (event.isStop) return
        }
    }

}