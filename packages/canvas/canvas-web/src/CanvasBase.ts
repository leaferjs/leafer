import { ICanvasAttr, CanvasFillRule, Path2D, TextMetrics, CanvasRenderingContext2D, IObject, InnerId, IMatrixData, IFunction } from '@leafer/interface'
import { defineKey } from '@leafer/decorator'


function contextAttr(realName?: string) {
    return (target: CanvasBase, key: string) => {
        if (!realName) realName = key
        const property: IObject & ThisType<CanvasBase> = {
            get() { return (this.context as IObject)[realName] },
            set(value: unknown) { (this.context as IObject)[realName] = value }
        }
        defineKey(target, key, property)
    }
}

const contextMethodNameList: string[] = []
function contextMethod() {
    return (target: CanvasBase, key: string) => {
        contextMethodNameList.push(key)
    }
}


export class CanvasBase {

    public readonly innerId: InnerId

    public width: number
    public height: number

    public __: ICanvasAttr

    public context: CanvasRenderingContext2D

    // canvas attr

    @contextAttr('imageSmoothingEnabled')
    public smooth: boolean

    @contextAttr('imageSmoothingQuality')
    public smoothLevel: ImageSmoothingQuality

    @contextAttr('globalAlpha')
    public opacity: number

    @contextAttr('globalCompositeOperation')
    public blendMode: string


    @contextAttr()
    public fillStyle: string | object

    @contextAttr()
    public strokeStyle: string | object


    @contextAttr('lineWidth')
    public strokeWidth: number

    @contextAttr('lineCap')
    public strokeCap: string

    @contextAttr('lineJoin')
    public strokeJoin: string

    @contextAttr('lineDash')
    public dashPattern: Array<number>

    @contextAttr('lineDashOffset')
    public dashOffset: number

    @contextAttr()
    public miterLimit: number


    @contextAttr()
    public shadowBlur: number

    @contextAttr()
    public shadowColor: string

    @contextAttr()
    public shadowOffsetX: number

    @contextAttr()
    public shadowOffsetY: number

    @contextAttr()
    public filter: string


    @contextAttr()
    public font: string

    @contextAttr()
    public fontKerning: string

    @contextAttr()
    public fontStretch: string

    @contextAttr()
    public fontVariantCaps: string


    @contextAttr()
    public textAlign: string

    @contextAttr()
    public textBaseline: string

    @contextAttr()
    public textRendering: string

    @contextAttr()
    public wordSpacing: string

    @contextAttr()
    public letterSpacing: string


    @contextAttr()
    public direction: string

    // end

    public bindContextMethod(): void {
        let method: IFunction
        contextMethodNameList.forEach(name => {
            method = (this.context as IObject)[name]
            if (method) (this as IObject)[name] = method.bind(this.context)
        })
    }

    // canvas method

    @contextMethod()
    public setTransform(a: number | IMatrixData, b?: number, c?: number, d?: number, e?: number, f?: number): void { }

    @contextMethod()
    public resetTransform(): void { }

    @contextMethod()
    public getTransform(): IMatrixData { return void 0 }

    @contextMethod()
    public save(): void { }

    @contextMethod()
    public restore(): void { }

    @contextMethod()
    public translate(x: number, y: number): void { }

    @contextMethod()
    public scale(x: number, y: number): void { }

    @contextMethod()
    public rotate(angle: number): void { }

    @contextMethod()
    public fill(path2d?: Path2D | CanvasFillRule, rule?: CanvasFillRule): void { }

    @contextMethod()
    public stroke(path2d?: Path2D): void { }

    @contextMethod()
    public clip(path2d?: Path2D | CanvasFillRule, rule?: CanvasFillRule): void { }

    @contextMethod()
    public fillRect(x: number, y: number, width: number, height: number): void { }

    @contextMethod()
    public strokeRect(x: number, y: number, width: number, height: number): void { }

    @contextMethod()
    public clearRect(x: number, y: number, width: number, height: number): void { }

    public drawImage(image: CanvasImageSource, sx: number, sy: number, sw?: number, sh?: number, dx?: number, dy?: number, dw?: number, dh?: number): void {
        switch (arguments.length) {
            case 9:

                // safari: drawimage裁剪画布外的坐标会有问题, 必须是不小于0的坐标点
                if (sx < 0) {
                    const d = (-sx / sw) * dw
                    sw += sx
                    sx = 0
                    dx += d
                    dw -= d
                }

                if (sy < 0) {
                    const d = (-sy / sh) * dh
                    sh += sy
                    sy = 0
                    dy += d
                    dh -= d
                }

                this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
                break
            case 5:
                this.context.drawImage(image, sx, sy, sw, sh) // = dx, dy, dw, dh
                break
            case 3:
                this.context.drawImage(image, sx, sy)
        }
    }


    // canvas draw
    @contextMethod()
    public beginPath(): void { }

    @contextMethod()
    public moveTo(x: number, y: number): void { }

    @contextMethod()
    public lineTo(x: number, y: number): void { }

    @contextMethod()
    public bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void { }

    @contextMethod()
    public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void { }

    @contextMethod()
    public closePath(): void { }

    @contextMethod()
    public arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void { }

    @contextMethod()
    public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void { }

    @contextMethod()
    public ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void { }

    @contextMethod()
    public rect(x: number, y: number, width: number, height: number): void { }

    @contextMethod()
    public roundRect(x: number, y: number, width: number, height: number, radius?: number | number[]): void { }

    // end canvas draw

    // paint

    @contextMethod()
    public createConicGradient(startAngle: number, x: number, y: number): CanvasGradient { return void 0 }

    @contextMethod()
    public createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient { return void 0 }

    @contextMethod()
    public createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null { return void 0 }

    @contextMethod()
    public createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient { return void 0 }

    // text
    @contextMethod()
    public fillText(text: string, x: number, y: number, maxWidth?: number): void { }

    @contextMethod()
    public measureText(text: string): TextMetrics { return void 0 }

    @contextMethod()
    public strokeText(text: string, x: number, y: number, maxWidth?: number): void { }

    public destroy(): void {
        this.context = undefined
    }
}