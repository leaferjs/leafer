export const Plugin = {

    list: {} as any,

    add(name: string) {
        this.list[name] = true
    },

    check(name: string, tip?: boolean): boolean {
        const rs = this.list[name]
        if (!rs && tip) this.need(name)
        return rs
    },

    need(name: string): any {
        console.error('need plugin: @leafer-in/' + name)
    }

}