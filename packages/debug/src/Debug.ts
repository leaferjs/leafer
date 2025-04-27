import { IBooleanMap, IBoundsData, ILeaferCanvas, IRenderOptions, ILeaf } from '@leafer/interface'
import { MathHelper } from '@leafer/math'


const { randColor } = MathHelper
export class Debug {

    static enable: boolean

    static filterList: string[] = []
    static excludeList: string[] = []

    // other
    static showWarn = true
    static showRepaint: boolean | string
    static showBounds: boolean | string | 'hit'

    public name: string

    public repeatMap: IBooleanMap = {}

    constructor(name: string) {
        this.name = name
    }

    static get(name: string): Debug {
        return new Debug(name)
    }

    static set filter(name: string | string[]) {
        this.filterList = getNameList(name)
    }

    static set exclude(name: string | string[]) {
        this.excludeList = getNameList(name)
    }

    static drawRepaint(canvas: ILeaferCanvas, bounds: IBoundsData): void {
        const color = randColor()
        canvas.fillWorld(bounds, color.replace('1)', '.1)'))
        canvas.strokeWorld(bounds, color)
    }

    static drawBounds(leaf: ILeaf, canvas: ILeaferCanvas, _options: IRenderOptions): void {
        const showHit = Debug.showBounds === 'hit', w = leaf.__nowWorld, color = randColor()
        if (showHit) canvas.setWorld(w), leaf.__drawHitPath(canvas), canvas.fillStyle = color.replace('1)', '.2)'), canvas.fill()

        canvas.resetTransform()
        canvas.setStroke(color, 2)
        showHit ? canvas.stroke() : canvas.strokeWorld(w, color)
    }


    log(...messages: unknown[]): void {
        if (D.enable) {
            if (D.filterList.length && D.filterList.every(name => name !== this.name)) return
            if (D.excludeList.length && D.excludeList.some(name => name === this.name)) return
            console.log('%c' + this.name, 'color:#21ae62', ...messages)
        }
    }

    tip(...messages: unknown[]): void {
        if (D.enable) this.warn(...messages)
    }

    warn(...messages: unknown[]): void {
        if (D.showWarn) console.warn(this.name, ...messages)
    }

    repeat(name: string, ...messages: unknown[]) {
        if (!this.repeatMap[name]) {
            this.warn('repeat:' + name, ...messages)
            this.repeatMap[name] = true
        }
    }

    error(...messages: unknown[]): void {
        try {
            throw new Error()
        } catch (e) {
            console.error(this.name, ...messages, e)
        }
    }
}

function getNameList(name: string | string[]): string[] {
    if (!name) name = []
    else if (typeof name === 'string') name = [name]
    return name
}

const D = Debug