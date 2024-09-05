export * from './Run'
export * from './Debug'

export function needPlugin(name: string): any {
    console.error('need plugin: @leafer-in/' + name)
}