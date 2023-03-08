type GlobalCompositeOperation = 'color' | 'color-burn' | 'color-dodge' | 'copy' | 'darken' | 'destination-atop' | 'destination-in' | 'destination-out' | 'destination-over' | 'difference' | 'exclusion' | 'hard-light' | 'hue' | 'lighten' | 'lighter' | 'luminosity' | 'multiply' | 'overlay' | 'saturation' | 'screen' | 'soft-light' | 'source-atop' | 'source-in' | 'source-out' | 'source-over' | 'xor'
type CanvasDirection = 'inherit' | 'ltr' | 'rtl'
export type ICanvasFillRule = 'evenodd' | 'nonzero'
// type CanvasFontKerning = 'auto' | 'none' | 'normal'
// type CanvasFontStretch = 'condensed' | 'expanded' | 'extra-condensed' | 'extra-expanded' | 'normal' | 'semi-condensed' | 'semi-expanded' | 'ultra-condensed' | 'ultra-expanded'
// type CanvasFontVariantCaps = 'all-petite-caps' | 'all-small-caps' | 'normal' | 'petite-caps' | 'small-caps' | 'titling-caps' | 'unicase'
type CanvasLineCap = 'butt' | 'round' | 'square'
type CanvasLineJoin = 'bevel' | 'miter' | 'round'
type CanvasTextAlign = 'center' | 'end' | 'left' | 'right' | 'start'
type CanvasTextBaseline = 'alphabetic' | 'bottom' | 'hanging' | 'ideographic' | 'middle' | 'top'
//type CanvasTextRendering = 'auto' | 'geometricPrecision' | 'optimizeLegibility' | 'optimizeSpeed'

/** This Canvas 2D API interface is used to declare a path that can then be used on a CanvasRenderingContext2D object. The path methods of the CanvasRenderingContext2D interface are also present on this interface, which gives you the convenience of being able to retain and replay your path whenever desired. */
export interface IPath2D extends CanvasPath {
    /** Adds to the path the path given by the argument. */
    addPath(path: IPath2D, transform?: DOMMatrix2DInit): void
}

declare var IPath2D: {
    prototype: IPath2D
    new(path?: IPath2D | string): IPath2D
}

interface CanvasCompositing {
    globalAlpha: number
    globalCompositeOperation: GlobalCompositeOperation
}

type CanvasImageSource = any
interface CanvasDrawImage {
    drawImage(image: CanvasImageSource, dx: number, dy: number): void
    drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void
    drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void
}

interface CanvasDrawPath {
    beginPath(): void
    clip(fillRule?: ICanvasFillRule): void
    clip(path: IPath2D, fillRule?: ICanvasFillRule): void
    fill(fillRule?: ICanvasFillRule): void
    fill(path: IPath2D, fillRule?: ICanvasFillRule): void
    isPointInPath(x: number, y: number, fillRule?: ICanvasFillRule): boolean
    isPointInPath(path: IPath2D, x: number, y: number, fillRule?: ICanvasFillRule): boolean
    isPointInStroke(x: number, y: number): boolean
    isPointInStroke(path: IPath2D, x: number, y: number): boolean
    stroke(): void
    stroke(path: IPath2D): void
}

interface CanvasFillStrokeStyles {
    fillStyle: string | CanvasGradient | CanvasPattern
    strokeStyle: string | CanvasGradient | CanvasPattern
    createConicGradient(startAngle: number, x: number, y: number): CanvasGradient
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient
    createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient
}

interface CanvasFilters {
    filter: string
}

/** An opaque object describing a gradient. It is returned by the methods CanvasRenderingContext2D.createLinearGradient() or CanvasRenderingContext2D.createRadialGradient(). */
export interface CanvasGradient {
    /**
     * Adds a color stop with the given color to the gradient at the given offset. 0.0 is the offset at one end of the gradient, 1.0 is the offset at the other end.
     *
     * Throws an 'IndexSizeError' DOMException if the offset is out of range. Throws a 'SyntaxError' DOMException if the color cannot be parsed.
     */
    addColorStop(offset: number, color: string): void
}

declare var CanvasGradient: {
    prototype: CanvasGradient
    new(): CanvasGradient
}

interface CanvasImageData {
    createImageData(sw: number, sh: number, settings?: ImageDataSettings): ImageData
    createImageData(imagedata: ImageData): ImageData
    getImageData(sx: number, sy: number, sw: number, sh: number, settings?: ImageDataSettings): ImageData
    putImageData(imagedata: ImageData, dx: number, dy: number): void
    putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void
}

interface CanvasImageSmoothing {
    imageSmoothingEnabled: boolean
    imageSmoothingQuality: ImageSmoothingQuality
}

interface CanvasPath {
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void
    closePath(): void
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void
    lineTo(x: number, y: number): void
    moveTo(x: number, y: number): void
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void
    rect(x: number, y: number, w: number, h: number): void
    roundRect(x: number, y: number, width: number, height: number, radius?: number | number[]): void
}

interface CanvasPathDrawingStyles {
    lineCap: CanvasLineCap
    lineDashOffset: number
    lineJoin: CanvasLineJoin
    lineWidth: number
    miterLimit: number
    getLineDash(): number[]
    setLineDash(segments: number[]): void
}

/** An opaque object describing a pattern, based on an image, a canvas, or a video, created by the CanvasRenderingContext2D.createPattern() method. */
export interface CanvasPattern {
    /** Sets the transformation matrix that will be used when rendering the pattern during a fill or stroke painting operation. */
    setTransform(transform?: DOMMatrix2DInit): void
}

declare var CanvasPattern: {
    prototype: CanvasPattern
    new(): CanvasPattern
}

interface CanvasRect {
    clearRect(x: number, y: number, w: number, h: number): void
    fillRect(x: number, y: number, w: number, h: number): void
    strokeRect(x: number, y: number, w: number, h: number): void
}

type PredefinedColorSpace = 'display-p3' | 'srgb'
interface CanvasRenderingContext2DSettings {
    alpha?: boolean
    colorSpace?: PredefinedColorSpace
    desynchronized?: boolean
    willReadFrequently?: boolean
}

/** The CanvasRenderingContext2D interface, part of the Canvas API, provides the 2D rendering context for the drawing surface of a <canvas> element. It is used for drawing shapes, text, images, and other objects. */
export interface ICanvasRenderingContext2D extends CanvasCompositing, CanvasDrawImage, CanvasDrawPath, CanvasFillStrokeStyles, CanvasFilters, CanvasImageData, CanvasImageSmoothing, CanvasPath, CanvasPathDrawingStyles, CanvasRect, CanvasShadowStyles, CanvasState, CanvasText, CanvasTextDrawingStyles, CanvasTransform, CanvasUserInterface {
    readonly canvas: HTMLCanvasElement
    getContextAttributes(): CanvasRenderingContext2DSettings
}

declare var ICanvasRenderingContext2D: {
    prototype: ICanvasRenderingContext2D
    new(): ICanvasRenderingContext2D
}

interface CanvasShadowStyles {
    shadowBlur: number
    shadowColor: string
    shadowOffsetX: number
    shadowOffsetY: number
}

interface CanvasState {
    restore(): void
    save(): void
}

interface CanvasUserInterface {
    drawFocusIfNeeded(element: any): void
    drawFocusIfNeeded(path: IPath2D, element: any): void
}


/** The dimensions of a piece of text in the canvas, as created by the CanvasRenderingContext2D.measureText() method. */
export interface ITextMetrics {
    /** Returns the measurement described below. */
    readonly actualBoundingBoxAscent: number
    /** Returns the measurement described below. */
    readonly actualBoundingBoxDescent: number
    /** Returns the measurement described below. */
    readonly actualBoundingBoxLeft: number
    /** Returns the measurement described below. */
    readonly actualBoundingBoxRight: number
    /** Returns the measurement described below. */
    readonly fontBoundingBoxAscent: number
    /** Returns the measurement described below. */
    readonly fontBoundingBoxDescent: number
    /** Returns the measurement described below. */
    readonly width: number
}

declare var TextMetrics: {
    prototype: ITextMetrics
    new(): ITextMetrics
}

interface CanvasText {
    fillText(text: string, x: number, y: number, maxWidth?: number): void
    measureText(text: string): ITextMetrics
    strokeText(text: string, x: number, y: number, maxWidth?: number): void
}

interface CanvasTextDrawingStyles {
    direction: CanvasDirection
    font: string
    textAlign: CanvasTextAlign
    textBaseline: CanvasTextBaseline
}

interface CanvasTransform {
    getTransform(): DOMMatrix
    resetTransform(): void
    rotate(angle: number): void
    scale(x: number, y: number): void
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void
    setTransform(transform?: DOMMatrix2DInit): void
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void
    translate(x: number, y: number): void
}



interface DOMMatrix2DInit {
    a?: number
    b?: number
    c?: number
    d?: number
    e?: number
    f?: number
    m11?: number
    m12?: number
    m21?: number
    m22?: number
    m41?: number
    m42?: number
}

interface DOMMatrixInit extends DOMMatrix2DInit {
    is2D?: boolean
    m13?: number
    m14?: number
    m23?: number
    m24?: number
    m31?: number
    m32?: number
    m33?: number
    m34?: number
    m43?: number
    m44?: number
}

interface DOMMatrixReadOnly {
    readonly a: number
    readonly b: number
    readonly c: number
    readonly d: number
    readonly e: number
    readonly f: number
    readonly is2D: boolean
    readonly isIdentity: boolean
    readonly m11: number
    readonly m12: number
    readonly m13: number
    readonly m14: number
    readonly m21: number
    readonly m22: number
    readonly m23: number
    readonly m24: number
    readonly m31: number
    readonly m32: number
    readonly m33: number
    readonly m34: number
    readonly m41: number
    readonly m42: number
    readonly m43: number
    readonly m44: number
    flipX(): DOMMatrix
    flipY(): DOMMatrix
    inverse(): DOMMatrix
    multiply(other?: DOMMatrixInit): DOMMatrix
    rotate(rotX?: number, rotY?: number, rotZ?: number): DOMMatrix
    rotateAxisAngle(x?: number, y?: number, z?: number, angle?: number): DOMMatrix
    rotateFromVector(x?: number, y?: number): DOMMatrix
    scale(scaleX?: number, scaleY?: number, scaleZ?: number, originX?: number, originY?: number, originZ?: number): DOMMatrix
    scale3d(scale?: number, originX?: number, originY?: number, originZ?: number): DOMMatrix
    /** @deprecated */
    scaleNonUniform(scaleX?: number, scaleY?: number): DOMMatrix
    skewX(sx?: number): DOMMatrix
    skewY(sy?: number): DOMMatrix
    toFloat32Array(): Float32Array
    toFloat64Array(): Float64Array
    toJSON(): any
    transformPoint(point?: DOMPointInit): DOMPoint
    translate(tx?: number, ty?: number, tz?: number): DOMMatrix
    toString(): string
}

declare var DOMMatrixReadOnly: {
    prototype: DOMMatrixReadOnly
    new(init?: string | number[]): DOMMatrixReadOnly
    fromFloat32Array(array32: Float32Array): DOMMatrixReadOnly
    fromFloat64Array(array64: Float64Array): DOMMatrixReadOnly
    fromMatrix(other?: DOMMatrixInit): DOMMatrixReadOnly
    toString(): string
}

interface DOMMatrix extends DOMMatrixReadOnly {
    a: number
    b: number
    c: number
    d: number
    e: number
    f: number
    m11: number
    m12: number
    m13: number
    m14: number
    m21: number
    m22: number
    m23: number
    m24: number
    m31: number
    m32: number
    m33: number
    m34: number
    m41: number
    m42: number
    m43: number
    m44: number
    invertSelf(): DOMMatrix
    multiplySelf(other?: DOMMatrixInit): DOMMatrix
    preMultiplySelf(other?: DOMMatrixInit): DOMMatrix
    rotateAxisAngleSelf(x?: number, y?: number, z?: number, angle?: number): DOMMatrix
    rotateFromVectorSelf(x?: number, y?: number): DOMMatrix
    rotateSelf(rotX?: number, rotY?: number, rotZ?: number): DOMMatrix
    scale3dSelf(scale?: number, originX?: number, originY?: number, originZ?: number): DOMMatrix
    scaleSelf(scaleX?: number, scaleY?: number, scaleZ?: number, originX?: number, originY?: number, originZ?: number): DOMMatrix
    setMatrixValue(transformList: string): DOMMatrix
    skewXSelf(sx?: number): DOMMatrix
    skewYSelf(sy?: number): DOMMatrix
    translateSelf(tx?: number, ty?: number, tz?: number): DOMMatrix
}

declare var DOMMatrix: {
    prototype: DOMMatrix
    new(init?: string | number[]): DOMMatrix
    fromFloat32Array(array32: Float32Array): DOMMatrix
    fromFloat64Array(array64: Float64Array): DOMMatrix
    fromMatrix(other?: DOMMatrixInit): DOMMatrix
}