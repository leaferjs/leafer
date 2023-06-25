import { INumberMap, IStringMap } from '@leafer/interface'

export const CanvasCommandOnlyMap: INumberMap = {

    N: 21, // rect
    D: 22, // roundRect
    X: 23, // simple roundRect
    G: 24, // ellipse
    F: 25, // simple ellipse
    O: 26, // arc
    P: 27, // simple arc
    U: 28 // arcTo

}

export const PathCommandMap: INumberMap = {

    // svg and canvas

    M: 1, // moveto
    m: 10,
    L: 2, // lineto
    l: 20,
    H: 3, // horizontal lineto
    h: 30,
    V: 4, // vertical lineto
    v: 40,
    C: 5, // curveto
    c: 50,
    S: 6, // smooth curveto
    s: 60,
    Q: 7, // quadratic Belzier curve
    q: 70,
    T: 8, // smooth quadratic Belzier curveto
    t: 80,
    A: 9, //e lliptical Arc
    a: 90,
    Z: 11, // closepath
    z: 11,

    R: 12,  // Catmull Rom

    // canvas
    ...CanvasCommandOnlyMap
}

export const PathCommandLengthMap: INumberMap = {

    M: 3, //moveto
    m: 3,
    L: 3, //lineto
    l: 3,
    H: 2, //horizontal lineto
    h: 2,
    V: 2, //vertical lineto
    v: 2,
    C: 7, //curveto
    c: 7,
    S: 5, //smooth curveto
    s: 5,
    Q: 5, //quadratic Belzier curve
    q: 5,
    T: 3, //smooth quadratic Belzier curveto
    t: 3,
    A: 8, //elliptical Arc
    a: 8,
    Z: 1, //closepath
    z: 1,

    // canvas

    N: 5, // rect
    D: 9, // roundRect
    X: 6, // simple roundRect
    G: 9, // ellipse
    F: 5, // simple ellipse
    O: 7, // arc
    P: 4, // simple arc
    U: 6 // arcTo

}

export const NeedConvertToCanvasCommandMap: INumberMap = { // convert to:  M L C Q Z

    // M: 1, //moveto
    m: 10,
    // L: 2, //lineto
    l: 20,
    H: 3, //horizontal lineto
    h: 30,
    V: 4, //vertical lineto
    v: 40,
    // C: 5, //curveto
    c: 50,
    S: 6, //smooth curveto
    s: 60,
    // Q: 7, //quadratic Belzier curve
    q: 70,
    T: 8, //smooth quadratic Belzier curveto
    t: 80,
    A: 9, //elliptical Arc
    a: 90,
    // Z: 11, //closepath
    // z: 11

}


export const NeedConvertToCurveCommandMap: INumberMap = {
    ...NeedConvertToCanvasCommandMap,
    ...CanvasCommandOnlyMap
}

const P = PathCommandMap

export const PathNumberCommandMap: IStringMap = {}
for (let key in P) {
    PathNumberCommandMap[P[key]] = key
}
// {1: 'M'}

export const PathNumberCommandLengthMap: INumberMap = {}
for (let key in P) {
    PathNumberCommandLengthMap[P[key]] = PathCommandLengthMap[key]
}
// {1: 3}