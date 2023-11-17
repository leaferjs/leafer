import { ILeafData, ILeaf, IObject, __Value } from '@leafer/interface'
import { defineKey, getDescriptor } from './object'
import { Debug } from '@leafer/debug'


// name

export function aliasType(name: string) {
    return (target: ILeaf, key: string) => {
        defineKey(target, key, {
            get() { return this.__getAttr(name) },
            set(value: __Value) {
                this.__setAttr(name, value)
            }
        })
    }
}

export function defineLeafAttr(target: ILeaf, key: string, defaultValue?: __Value, mergeDescriptor?: IObject & ThisType<ILeaf>): void {
    const defaultDescriptor: IObject & ThisType<ILeaf> = {
        get() { return this.__getAttr(key) },
        set(value: __Value) { this.__setAttr(key, value) },
        configurable: true,
        enumerable: true
    }
    defineKey(target, key, Object.assign(defaultDescriptor, mergeDescriptor || {}))
    defineDataProcessor(target, key, defaultValue)
}

export function dataType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue)
    }
}

export function positionType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: __Value) {
                this.__setAttr(key, value)
                this.__layout.matrixChanged || this.__layout.matrixChange()
            }
        })
    }
}

export function autoLayoutType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: __Value) {
                this.__setAttr(key, value)
                this.__layout.matrixChanged || this.__layout.matrixChange()
                this.__hasAutoLayout = !!value
            }
        })
    }
}

export function scaleType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: __Value) {
                this.__setAttr(key, value)
                this.__layout.scaleChanged || this.__layout.scaleChange()
            }
        })
    }
}


export function rotationType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: __Value) {
                this.__setAttr(key, value)
                this.__layout.rotationChanged || this.__layout.rotationChange()

            }
        })
    }
}

export function boundsType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: __Value) {
                this.__setAttr(key, value)
                this.__layout.boxChanged || this.__layout.boxChange()
                if (this.__hasAutoLayout) this.__layout.matrixChanged || this.__layout.matrixChange()
            }
        })
    }
}

export const pathType = boundsType


export function affectStrokeBoundsType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: __Value) {
                this.__setAttr(key, value)
                this.__layout.strokeChanged || this.__layout.strokeChange()
            }
        })
    }
}

export const strokeType = affectStrokeBoundsType

export function affectRenderBoundsType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: __Value) {
                this.__setAttr(key, value)
                this.__layout.renderChanged || this.__layout.renderChange()
            }
        })
    }
}

export function surfaceType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: __Value) {
                this.__setAttr(key, value)
                this.__layout.surfaceChanged || this.__layout.surfaceChange()
            }
        })
    }
}

export function opacityType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: __Value) {
                this.__setAttr(key, value)
                this.__layout.opacityChanged || this.__layout.opacityChange()
            }
        })
    }
}

export function sortType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: __Value) {
                this.__setAttr(key, value)
                this.__layout.surfaceChanged || this.__layout.surfaceChange()
                this.waitParent(() => { this.parent.__layout.childrenSortChange() })
            }
        })
    }
}

export function maskType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: boolean) {
                this.__setAttr(key, value)
                this.__layout.boxChanged || this.__layout.boxChange()
                this.waitParent(() => { this.parent.__updateMask(value) })
            }
        })
    }
}

export function eraserType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: boolean) {
                this.__setAttr(key, value)
                this.waitParent(() => { this.parent.__updateEraser(value) })
            }
        })
    }
}

export function hitType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: __Value) {
                this.__setAttr(key, value)
                if (Debug.showHitView) { this.__layout.surfaceChanged || this.__layout.surfaceChange() }
                if (this.leafer) this.leafer.updateCursor()
            }
        })
    }
}

export function cursorType(defaultValue?: __Value) {
    return (target: ILeaf, key: string) => {
        defineLeafAttr(target, key, defaultValue, {
            set(value: __Value) {
                this.__setAttr(key, value)
                if (this.leafer) this.leafer.updateCursor()
            }
        })
    }
}


// get

export function dataProcessor(processor: IObject) {
    return (target: ILeaf, _key: string) => {
        defineKey(target, '__DataProcessor', {
            get() { return processor }
        })
    }
}

export function layoutProcessor(processor: IObject) {
    return (target: ILeaf, _key: string) => {
        defineKey(target, '__LayoutProcessor', {
            get() { return processor }
        })
    }
}


// other 

function getSetMethodName(key: string): string {
    return 'set' + key.charAt(0).toUpperCase() + key.slice(1)
}

export function setDefaultValue(target: IObject, key: string, defaultValue: __Value): void {
    defineDataProcessor(target.prototype, key, defaultValue)
}

// define leaf.__[key] getter/setter
export function defineDataProcessor(target: ILeaf, key: string, defaultValue?: __Value): void {

    const data = target.__DataProcessor.prototype
    const computedKey = '_' + key
    const setMethodName = getSetMethodName(key)

    const property: IObject & ThisType<ILeafData> = {
        get() {
            const v = (this as IObject)[computedKey]
            return v === undefined ? defaultValue : v
        },
        set(value: __Value) {
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

    const descriptor = getDescriptor(data, key)

    if (descriptor && descriptor.set) property.set = descriptor.set // use custom set

    if (data[setMethodName]) {
        property.set = data[setMethodName] //  use custom setKey(value)
        delete data[setMethodName]
    }

    Object.defineProperty(data, key, property)

}

