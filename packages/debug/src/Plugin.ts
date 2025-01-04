import { IBooleanMap } from '@leafer/interface'


const check = [] as string[]

export const Plugin = {

    list: {} as IBooleanMap,

    add(name: string, ...needPlugins: string[]) {
        this.list[name] = true
        check.push(...needPlugins)
    },

    has(name: string, tip?: boolean): boolean {
        const rs = this.list[name]
        if (!rs && tip) this.need(name)
        return rs
    },

    need(name: string): any {
        console.error('need plugin: @leafer-in/' + name)
    }

}

setTimeout(() => check.forEach(name => Plugin.has(name, true)))