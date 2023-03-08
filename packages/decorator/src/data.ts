import { ILeafData, ILeaf, IObject, __Value } from '@leafer/interface'
import { defineKey, getDescriptor } from './object'

// name

export function aliasType(name: string) { return (target: ILeaf, key: string) => aliasType__(target, key, name) }
export function aliasType__(target: ILeaf, key: string, name: string) {
    defineKey(target, key, {
        get() { return this.__get(name) },
        set(value: __Value) {
            this.root ? this.__set(name, value) : this.__[name] = value
        }
    })
}

export function dataType(defaultValue?: __Value) { return (target: ILeaf, key: string) => dataType__(target, key, defaultValue) }
export function dataType__(target: ILeaf, key: string, defaultValue?: __Value) {
    defineKey(target, key, {
        get() { return this.__get(key) },
        set(value: __Value) {
            this.root ? this.__set(key, value) : this.__[key] = value
        }
    })
    defineDataProcessor(target, key, defaultValue)
}


export function positionType(defaultValue?: __Value) { return (target: ILeaf, key: string) => positionType__(target, key, defaultValue) }
export function positionType__(target: ILeaf, key: string, defaultValue?: __Value) {
    defineKey(target, key, {
        get() { return this.__get(key) },
        set(value: __Value) {
            this.root ? this.__set(key, value) : this.__[key] = value
            this.__layout.positionChanged || this.__layout.positionChange()
        }
    })
    defineDataProcessor(target, key, defaultValue)
}


export function scaleType(defaultValue?: __Value) { return (target: ILeaf, key: string) => scaleType__(target, key, defaultValue) }
export function scaleType__(target: ILeaf, key: string, defaultValue?: __Value) {
    defineKey(target, key, {
        get() { return this.__get(key) },
        set(value: __Value) {
            this.root ? this.__set(key, value) : this.__[key] = value
            this.__layout.scaleChanged || this.__layout.scaleChange()
        }
    })
    defineDataProcessor(target, key, defaultValue)
}

export function rotationType(defaultValue?: __Value) { return (target: ILeaf, key: string) => rotationType__(target, key, defaultValue) }
export function rotationType__(target: ILeaf, key: string, defaultValue?: __Value) {
    defineKey(target, key, {
        get() { return this.__get(key) },
        set(value: __Value) {
            this.root ? this.__set(key, value) : this.__[key] = value
            this.__layout.rotationChanged || this.__layout.rotationChange()

        }
    })
    defineDataProcessor(target, key, defaultValue)
}

export function boundsType(defaultValue?: __Value) { return (target: ILeaf, key: string) => boundsType__(target, key, defaultValue) }
export function boundsType__(target: ILeaf, key: string, defaultValue?: __Value) {
    defineKey(target, key, {
        get() { return this.__get(key) },
        set(value: __Value) {
            this.root ? this.__set(key, value) : this.__[key] = value
            this.__layout.boxBoundsChanged || this.__layout.boxBoundsChange()
        }
    })
    defineDataProcessor(target, key, defaultValue)
}

export const pathType = boundsType
export const pathType__ = boundsType__


export function affectEventBoundsType(defaultValue?: __Value) { return (target: ILeaf, key: string) => affectEventBoundsType__(target, key, defaultValue) }
export function affectEventBoundsType__(target: ILeaf, key: string, defaultValue?: __Value) {
    defineKey(target, key, {
        get() { return this.__get(key) },
        set(value: __Value) {
            this.root ? this.__set(key, value) : this.__[key] = value
            this.__layout.eventBoundsChanged || this.__layout.eventBoundsChange()
        }
    })
    defineDataProcessor(target, key, defaultValue)
}

export function affectRenderBoundsType(defaultValue?: __Value) { return (target: ILeaf, key: string) => affectRenderBoundsType__(target, key, defaultValue) }
export function affectRenderBoundsType__(target: ILeaf, key: string, defaultValue?: __Value) {
    defineKey(target, key, {
        get() { return this.__get(key) },
        set(value: __Value) {
            this.root ? this.__set(key, value) : this.__[key] = value
            this.__layout.renderBoundsChanged || this.__layout.renderBoundsChange()
        }
    })
    defineDataProcessor(target, key, defaultValue)
}

export function surfaceType(defaultValue?: __Value) { return (target: ILeaf, key: string) => surfaceType__(target, key, defaultValue) }
export function surfaceType__(target: ILeaf, key: string, defaultValue?: __Value) {
    defineKey(target, key, {
        get() { return this.__get(key) },
        set(value: __Value) {
            this.root ? this.__set(key, value) : this.__[key] = value
            this.__layout.surfaceChanged || this.__layout.surfaceChange()
        }
    })
    defineDataProcessor(target, key, defaultValue)
}

export function opacityType(defaultValue?: __Value) { return (target: ILeaf, key: string) => opacityType__(target, key, defaultValue) }
export function opacityType__(target: ILeaf, key: string, defaultValue?: __Value) {
    defineKey(target, key, {
        get() { return this.__get(key) },
        set(value: __Value) {
            this.root ? this.__set(key, value) : this.__[key] = value
            this.__layout.opacityChanged || this.__layout.opacityChange()
        }
    })
    defineDataProcessor(target, key, defaultValue)
}

export function sortType(defaultValue?: __Value) { return (target: ILeaf, key: string) => { sortType__(target, key, defaultValue) } }
export function sortType__(target: ILeaf, key: string, defaultValue?: __Value) {
    defineKey(target, key, {
        get() { return this.__get(key) },
        set(value: __Value) {
            this.root ? this.__set(key, value) : this.__[key] = value
            this.__layout.surfaceChanged || this.__layout.surfaceChange()

            if (this.parent) {
                this.parent.__layout.childrenSortChanged || (this.parent.__layout.childrenSortChanged = true)
            } else {
                this.__addParentWait(() => { this.parent.__layout.childrenSortChanged || (this.parent.__layout.childrenSortChanged = true) })
            }
        }
    })
    defineDataProcessor(target, key, defaultValue)
}


// get

export function dataProcessor(processor: IObject) { return (target: ILeaf, _key: string) => dataProcessor__(target, processor) }
export function dataProcessor__(target: ILeaf, processor: IObject) {
    defineKey(target, '__DataProcessor', {
        get() { return processor }
    })
}

export function layoutProcessor(processor: IObject) { return (target: ILeaf, _key: string) => layoutProcessor__(target, processor) }
export function layoutProcessor__(target: ILeaf, processor: IObject) {
    defineKey(target, '__LayoutProcessor', {
        get() { return processor }
    })
}


// other 

function getSetMethodName(key: string): string {
    return 'set' + key.charAt(0).toUpperCase() + key.slice(1)
}

// define leaf.__[key] getter/setter
export function defineDataProcessor(target: ILeaf, key: string, defaultValue: __Value): void {

    const data = target.__DataProcessor.prototype as ILeafData
    const computedKey = '_' + key
    const setMethodName = getSetMethodName(key)

    const property: IObject & ThisType<ILeafData> = {
        get() {
            const v = this[computedKey]
            return v === undefined ? defaultValue : v
        },
        set(value: __Value) {
            this[computedKey] = value
        }
    }

    if (defaultValue === undefined) property.get = function () { return this[computedKey] }

    const descriptor = getDescriptor(data, key)

    if (descriptor) {
        if (descriptor.set) property.set = descriptor.set // use custom set
        if (descriptor.get) property.get = descriptor.get // use custom get
    }

    if (data[setMethodName]) {
        property.set = data[setMethodName] //  use custom setKey(value)
        delete data[setMethodName]
    }

    Object.defineProperty(data, key, property)

}
