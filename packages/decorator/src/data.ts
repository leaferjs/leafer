import { ILeafData, ILeaf, IObject, IValue, ILeafAttrDescriptor, ILeafAttrDescriptorFn } from '@leafer/interface'
import { defineKey, getDescriptor } from './object'
import { Debug } from '@leafer/debug'


// name

export function decorateLeafAttr(defaultValue?: IValue, descriptorFn?: ILeafAttrDescriptorFn) {
    return (target: ILeaf, key: string) => defineLeafAttr(target, key, defaultValue, descriptorFn && descriptorFn(key))
}

export function attr(partDescriptor?: ILeafAttrDescriptor): ILeafAttrDescriptor {
    return partDescriptor
}


export function defineLeafAttr(target: ILeaf, key: string, defaultValue?: IValue, partDescriptor?: ILeafAttrDescriptor): void {
    const defaultDescriptor: ILeafAttrDescriptor = {
        get() { return this.__getAttr(key) },
        set(value: IValue) { this.__setAttr(key, value) },
        configurable: true,
        enumerable: true
    }
    defineKey(target, key, Object.assign(defaultDescriptor, partDescriptor || {}))
    defineDataProcessor(target, key, defaultValue)
}


export function dataType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue)
}

export function positionType(defaultValue?: IValue, checkFiniteNumber?: boolean) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value, checkFiniteNumber)
            this.__layout.matrixChanged || this.__layout.matrixChange()
        }
    }))
}

export function autoLayoutType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value)
            this.__layout.matrixChanged || this.__layout.matrixChange()
            this.__hasAutoLayout = !!value
            if (!this.__local) this.__layout.createLocal()
        }
    }))
}

export function scaleType(defaultValue?: IValue, checkFiniteNumber?: boolean) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value, checkFiniteNumber)
            this.__layout.scaleChanged || this.__layout.scaleChange()
        }
    }))
}

export function rotationType(defaultValue?: IValue, checkFiniteNumber?: boolean) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value, checkFiniteNumber)
            this.__layout.rotationChanged || this.__layout.rotationChange()
        }

    }))
}

export function boundsType(defaultValue?: IValue, checkFiniteNumber?: boolean) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value, checkFiniteNumber) && doBoundsType(this)
        }
    }))
}

export function naturalBoundsType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value)
            doBoundsType(this)
            this.__.__removeNaturalSize()
        }
    }))
}

export function doBoundsType(leaf: ILeaf): void {
    leaf.__layout.boxChanged || leaf.__layout.boxChange()
    if (leaf.__hasAutoLayout) leaf.__layout.matrixChanged || leaf.__layout.matrixChange()
}

export function pathInputType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            if (this.__.__pathInputed !== 2) this.__.__pathInputed = value ? 1 : 0
            this.__setAttr(key, value)
            doBoundsType(this)
        }
    }))
}

export const pathType = boundsType


export function affectStrokeBoundsType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value) && doStrokeType(this)
        }
    }))
}

export function doStrokeType(leaf: ILeaf): void {
    leaf.__layout.strokeChanged || leaf.__layout.strokeChange()
    if (leaf.__.__useArrow) doBoundsType(leaf)
}

export const strokeType = affectStrokeBoundsType

export function affectRenderBoundsType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value)
            this.__layout.renderChanged || this.__layout.renderChange()
        }
    }))
}

export function surfaceType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value)
            this.__layout.surfaceChanged || this.__layout.surfaceChange()
        }
    }))
}

export function opacityType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value)
            this.__layout.opacityChanged || this.__layout.opacityChange()
        }
    }))
}

export function visibleType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            const oldValue = this.visible
            this.__setAttr(key, value)
            this.__layout.opacityChanged || this.__layout.opacityChange()
            if (oldValue === 0 || value === 0) doBoundsType(this) // 0 = display: none
        }
    }))
}

export function sortType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value)
            this.__layout.surfaceChanged || this.__layout.surfaceChange()
            this.waitParent(() => { this.parent.__layout.childrenSortChange() })
        }
    }))
}

export function maskType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: boolean) {
            this.__setAttr(key, value)
            this.__layout.boxChanged || this.__layout.boxChange()
            this.waitParent(() => { this.parent.__updateMask(value) })
        }
    }))
}

export function eraserType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: boolean) {
            this.__setAttr(key, value)
            this.waitParent(() => { this.parent.__updateEraser(value) })
        }
    }))
}

export function hitType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value)
            if (Debug.showHitView) { this.__layout.surfaceChanged || this.__layout.surfaceChange() }
            if (this.leafer) this.leafer.updateCursor()
        }
    }))
}

export function cursorType(defaultValue?: IValue) {
    return decorateLeafAttr(defaultValue, (key: string) => attr({
        set(value: IValue) {
            this.__setAttr(key, value)
            if (this.leafer) this.leafer.updateCursor()
        }
    }))
}


// get

export function dataProcessor(processor: IObject) {
    return (target: IObject, _key?: string) => {
        defineKey(target, '__DataProcessor', {
            get() { return processor }
        })
    }
}

export function layoutProcessor(processor: IObject) {
    return (target: IObject, _key?: string) => {
        defineKey(target, '__LayoutProcessor', {
            get() { return processor }
        })
    }
}


// other 

function getSetMethodName(key: string): string {
    return 'set' + key.charAt(0).toUpperCase() + key.slice(1)
}


// define leaf.__[key] getter/setter
export function defineDataProcessor(target: ILeaf, key: string, defaultValue?: IValue): void {

    const data = target.__DataProcessor.prototype
    const computedKey = '_' + key
    const setMethodName = getSetMethodName(key)

    const property: IObject & ThisType<ILeafData> = {
        get() {
            const v = (this as IObject)[computedKey]
            return v === undefined ? defaultValue : v
        },
        set(value: IValue) {
            (this as IObject)[computedKey] = value
        },
        configurable: true,
        enumerable: true
    }

    if (defaultValue === undefined) {
        property.get = function () { return this[computedKey] }
    } else if (key === 'width') {
        property.get = function () {
            const v = this[computedKey]
            return v === undefined ? ((this as ILeafData).__naturalWidth || defaultValue) : v
        }
    } else if (key === 'height') {
        property.get = function () {
            const v = this[computedKey]
            return v === undefined ? ((this as ILeafData).__naturalHeight || defaultValue) : v
        }
    }

    // find parent proto
    let descriptor, find = data
    while (!descriptor && find) {
        descriptor = getDescriptor(find, key)
        find = find.__proto__
    }

    if (descriptor && descriptor.set) property.set = descriptor.set // use exist set

    if (data[setMethodName]) {
        property.set = data[setMethodName] // first use custom setKey(value)
        delete data[setMethodName]
    }

    Object.defineProperty(data, key, property)

}

