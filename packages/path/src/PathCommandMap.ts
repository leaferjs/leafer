import { INumberMap, IStringMap } from '@leafer/interface'


export const PathCommandMap: INumberMap = {
    M: 1, //moveto
    m: 10,
    L: 2, //lineto
    l: 20,
    H: 3, //horizontal lineto
    h: 30,
    V: 4, //vertical lineto
    v: 40,
    C: 5, //curveto
    c: 50,
    S: 6, //smooth curveto
    s: 60,
    Q: 7, //quadratic Belzier curve
    q: 70,
    T: 8, //smooth quadratic Belzier curveto
    t: 80,
    A: 9, //elliptical Arc
    a: 90,
    Z: 11, //closepath
    z: 11,

    // 非svg标准的canvas绘图命令
    rect: 100,
    roundRect: 101,
    ellipse: 102,
    arc: 103,
    arcTo: 104
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

    // 非svg标准的canvas绘图命令
    rect: 5,
    roundRect: 6,
    ellipse: 9,
    arc: 7,
    arcTo: 6
}

export const PathCommandNeedConvertMap: INumberMap = { // convert to:  M L C Q Z
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

    // 非svg标准的canvas绘图命令
    rect: 100,
    roundRect: 101,
    ellipse: 102,
    arc: 103,
    arcTo: 104
}


const P = PathCommandMap

export const NumberPathCommandMap: IStringMap = {}
for (let key in P) {
    NumberPathCommandMap[P[key]] = key
}
// {1: 'M'}

export const NumberPathCommandLengthMap: INumberMap = {}
for (let key in P) {
    NumberPathCommandLengthMap[P[key]] = PathCommandLengthMap[key]
}
// {1: 3}