import { IObject } from '@leafer/interface'


export class Debug {

    static enable: boolean

    static filterList: string[] = []
    static excludeList: string[] = []

    // other
    static __: IObject = {}

    @debugAttr()
    static showRepaint: boolean


    public name: string

    constructor(name: string) {
        this.name = name
    }

    static get(name: string): Debug {
        return new Debug(name)
    }

    static set filter(name: string | string[]) {
        if (!name) name = []
        else if (typeof name === 'string') name = [name]
        this.filterList = name
    }

    static set exclude(name: string | string[]) {
        if (!name) name = []
        else if (typeof name === 'string') name = [name]
        this.excludeList = name
    }

    log(...messages: unknown[]): void {
        if (D.enable) {
            if (D.filterList.length && D.filterList.every(name => name !== this.name)) return
            if (D.excludeList.length && D.excludeList.some(name => name === this.name)) return
            console.log('%c' + this.name, 'color:#21ae62', ...messages)
        }
    }

    warn(...messages: unknown[]): void {
        console.warn(this.name, ...messages)
    }

    error(...messages: unknown[]): void {
        console.error(this.name, ...messages)
    }
}

const D = Debug

function debugAttr(defaultValue?: unknown) {
    return (target: IObject, key: string) => {
        Object.defineProperty(target, key, {
            get() { return target.enable ? target.__[key] : defaultValue },
            set(value: unknown) { this.__[key] = value }
        })
    }
}