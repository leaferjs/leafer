import { IObject } from '../data/IData'

export type ITransition = IAnimateOptions | IAnimateEasingName | number | boolean

export interface IAnimateOptions {
    easing?: IAnimateEasing

    delay?: number
    duration?: number
    ending?: IAnimateEnding

    reverse?: boolean
    swing?: boolean | number

    loop?: boolean | number
    loopDelay?: number

    speed?: number

    join?: boolean
    jump?: boolean // 存在延时时，先跳到第一帧再延时
    autoplay?: boolean

    attrs?: string[]
    event?: IAnimateEvents
}


export interface IAnimateEasingFunction {
    (t: number): number
}

export interface ICustomEasingFunction {
    (...arg: any): IAnimateEasingFunction
}


export type IAnimateEasing =
    | IAnimateEasingName
    | ICubicBezierEasing
    | IStepsEasing
    | IObject

export interface ICubicBezierEasing {
    name: 'cubic-bezier',
    value: [number, number, number, number]
}

export interface IStepsEasing {
    name: 'steps',
    value: number | [number, 'floor' | 'round' | 'ceil']
}


export type IAnimateEasingName =
    | 'linear'
    | 'ease'
    | 'ease-in' | 'ease-out' | 'ease-in-out'
    | 'sine-in' | 'sine-out' | 'sine-in-out'
    | 'quad-in' | 'quad-out' | 'quad-in-out'
    | 'cubic-in' | 'cubic-out' | 'cubic-in-out'
    | 'quart-in' | 'quart-out' | 'quart-in-out'
    | 'quint-in' | 'quint-out' | 'quint-in-out'
    | 'expo-in' | 'expo-out' | 'expo-in-out'
    | 'circ-in' | 'circ-out' | 'circ-in-out'
    | 'back-in' | 'back-out' | 'back-in-out'
    | 'elastic-in' | 'elastic-out' | 'elastic-in-out'
    | 'bounce-in' | 'bounce-out' | 'bounce-in-out'


export type IAnimateEnding = 'auto' | 'from' | 'to'

export interface IAnimateEvents {
    created?: IAnimateEventFunction

    play?: IAnimateEventFunction
    pause?: IAnimateEventFunction
    stop?: IAnimateEventFunction
    seek?: IAnimateEventFunction

    update?: IAnimateEventFunction
    completed?: IAnimateEventFunction
}

export interface IAnimateEventFunction {
    (animate?: any): any
}