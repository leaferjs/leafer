import { ICanvasAttr, ITextMetrics, ICanvasContext2D, IPath2D, IObject, InnerId, IMatrixData, IFunction, IWindingRule, IBlendMode } from '@leafer/interface'

function contextAttr(realName?: string) {
    return (target: Canvas, key: string) => {
        if (!realName) realName = key
        const property: IObject & ThisType<Canvas> = {
            get() { return (this.context as IObject)[realName] },
            set(value: unknown) { (this.context as IObject)[realName] = value }
        }
        Object.defineProperty(target, key, property)
    }
}

const contextMethodNameList: string[] = []
function contextMethod() {
    return (_target: Canvas, key: string) => {
        contextMethodNameList.push(key)
    }
}

const emptyArray: number[] = []


export class Canvas implements ICanvasAttr {

    public readonly innerId: InnerId

    public width: number
    public height: number

    public context: ICanvasContext2D

    // canvas attr

    @contextAttr('imageSmoothingEnabled')
    public smooth: boolean

    @contextAttr('imageSmoothingQuality')
    public smoothLevel: ImageSmoothingQuality

    @contextAttr('globalAlpha')
    public opacity: number

    public set blendMode(value: IBlendMode) {
        if (value === 'normal') value = 'source-over'
        this.context.globalCompositeOperation = value as any
    }

    public get blendMode(): IBlendMode {
        return this.context.globalCompositeOperation as IBlendMode
    }

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

    public set dashPattern(value: number[]) {
        this.context.setLineDash(value || emptyArray)
    }
    public get dashPattern(): number[] {
        return this.context.getLineDash()
    }

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

    public __bindContext(): void {
        let method: IFunction
        contextMethodNameList.forEach(name => {
            method = (this.context as IObject)[name]
            if (method) (this as IObject)[name] = method.bind(this.context)
        })
        this.textBaseline = "alphabetic"
    }

    // canvas method

    @contextMethod()
    public setTransform(_a: number | IMatrixData, _b?: number, _c?: number, _d?: number, _e?: number, _f?: number): void { }

    @contextMethod()
    public resetTransform(): void { }

    @contextMethod()
    public getTransform(): IMatrixData { return void 0 }

    @contextMethod()
    public save(): void { }

    @contextMethod()
    public restore(): void { }

    @contextMethod()
    public transform(_a: number, _b: number, _c: number, _d: number, _e: number, _f: number): void { }

    @contextMethod()
    public translate(_x: number, _y: number): void { }

    @contextMethod()
    public scale(_x: number, _y: number): void { }

    @contextMethod()
    public rotate(_angle: number): void { }

    @contextMethod()
    public fill(_path2d?: IPath2D | IWindingRule, _rule?: IWindingRule): void { }

    @contextMethod()
    public stroke(_path2d?: IPath2D): void { }

    @contextMethod()
    public clip(_path2d?: IPath2D | IWindingRule, _rule?: IWindingRule): void { }

    @contextMethod()
    public fillRect(_x: number, _y: number, _width: number, _height: number): void { }

    @contextMethod()
    public strokeRect(_x: number, _y: number, _width: number, _height: number): void { }

    @contextMethod()
    public clearRect(_x: number, _y: number, _width: number, _height: number): void { }

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
    public moveTo(_x: number, _y: number): void { }

    @contextMethod()
    public lineTo(_x: number, _y: number): void { }

    @contextMethod()
    public bezierCurveTo(_cp1x: number, _cp1y: number, _cp2x: number, _cp2y: number, _x: number, _y: number): void { }

    @contextMethod()
    public quadraticCurveTo(_cpx: number, _cpy: number, _x: number, _y: number): void { }

    @contextMethod()
    public closePath(): void { }

    @contextMethod()
    public arc(_x: number, _y: number, _radius: number, _startAngle: number, _endAngle: number, _anticlockwise?: boolean): void { }

    @contextMethod()
    public arcTo(_x1: number, _y1: number, _x2: number, _y2: number, _radius: number): void { }

    @contextMethod()
    public ellipse(_x: number, _y: number, _radiusX: number, _radiusY: number, _rotation: number, _startAngle: number, _endAngle: number, _anticlockwise?: boolean): void { }

    @contextMethod()
    public rect(_x: number, _y: number, _width: number, _height: number): void { }

    @contextMethod()
    public roundRect(_x: number, _y: number, _width: number, _height: number, _radius?: number | number[]): void { }

    // end canvas draw

    // paint

    @contextMethod()
    public createConicGradient(_startAngle: number, _x: number, _y: number): CanvasGradient { return void 0 }

    @contextMethod()
    public createLinearGradient(_x0: number, _y0: number, _x1: number, _y1: number): CanvasGradient { return void 0 }

    @contextMethod()
    public createPattern(_image: CanvasImageSource, _repetition: string | null): CanvasPattern | null { return void 0 }

    @contextMethod()
    public createRadialGradient(_x0: number, _y0: number, _r0: number, _x1: number, _y1: number, _r1: number): CanvasGradient { return void 0 }

    // text
    @contextMethod()
    public fillText(_text: string, _x: number, _y: number, _maxWidth?: number): void { }

    @contextMethod()
    public measureText(_text: string): ITextMetrics { return void 0 }

    @contextMethod()
    public strokeText(_text: string, _x: number, _y: number, _maxWidth?: number): void { }

    public destroy(): void {
        this.context = null
    }
}