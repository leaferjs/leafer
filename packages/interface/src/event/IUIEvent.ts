import { IObject } from '../data/IData'
import { ILeafList } from '../data/IList'
import { IEvent } from './IEvent'
import { ILeaferImage } from '../image/ILeaferImage'
import { ILeaf } from '../display/ILeaf'
import { IPointData, IBoundsData } from '../math/IMath'

export interface IUIEvent extends IEvent {
    x: number
    y: number

    altKey?: boolean
    ctrlKey?: boolean
    shiftKey?: boolean
    metaKey?: boolean
    readonly spaceKey?: boolean

    readonly left?: boolean
    readonly right?: boolean
    readonly middle?: boolean
    buttons?: number

    path?: ILeafList
    throughPath?: ILeafList // 穿透path，不受层级影响，从上到下只要碰撞到区域就算，一般点击的时候

    time?: number

    isHoldKeys?(shortcutKeys?: IShortcutKeysCheck | IShortcutKeys): boolean

    getBoxPoint?(relative?: ILeaf): IPointData
    getInnerPoint?(relative?: ILeaf): IPointData
    getLocalPoint?(relative?: ILeaf): IPointData
    getPagePoint?(): IPointData

    // 兼容代码，未来可移除
    getInner?(relative?: ILeaf): IPointData
    getLocal?(relative?: ILeaf): IPointData
    getPage?(): IPointData
}


export interface IPointerEvent extends IUIEvent {
    width?: number
    height?: number
    pointerType?: PointerType
    moving?: boolean // 是否处于平移视图状态
    dragging?: boolean // 是否处于拖拽状态
    multiTouch?: boolean
    pressure?: number
    tangentialPressure?: number
    tiltX?: number
    tiltY?: number
    twist?: number
    isCancel?: boolean
}
export type PointerType = 'mouse' | 'pen' | 'touch'

export interface ITouchEvent extends IUIEvent {

}

export interface IDragEvent extends IPointerEvent {
    moveX: number
    moveY: number
    totalX?: number
    totalY?: number

    getPageMove?(total?: boolean): IPointData
    getInnerMove?(relative?: ILeaf): IPointData
    getLocalMove?(relative?: ILeaf): IPointData

    getPageTotal?(): IPointData
    getInnerTotal?(relative?: ILeaf): IPointData
    getLocalTotal?(relative?: ILeaf): IPointData

    getPageBounds?(): IBoundsData
}

export interface IDropEvent extends IPointerEvent {
    list: ILeafList
    data?: IObject
}

export interface IRotateEvent extends IPointerEvent {
    rotation: number
    totalRotation?: number
}

export interface IZoomEvent extends IPointerEvent {
    scale: number
    totalScale?: number
}

export interface IMoveEvent extends IDragEvent {
    moveType?: 'drag' | 'move'
}

export interface IWheelEvent extends IUIEvent {
    deltaX: number
    deltaY: number
}

export interface ISwipeEvent extends IDragEvent {

}

export interface IKeyEvent extends IUIEvent {
    code?: IKeyCodes
    key?: string
}

export type IShortcutKeys = IShortcutStringKeys | IShortcutArrayKeys

export type IShortcutStringKeys = string

export type IShortcutArrayKeys = IShortcutKeyCodes[] | IShortcutKeyCodes[][] // 二维数组表示或 [ [Shift, A] or [Ctrl, A] ]

export type IShortcutKeyCodes =
    | IKeyCodes
    | 'A' // 增加更友好的键名
    | 'B'
    | 'C'
    | 'D'
    | 'E'
    | 'F'
    | 'G'
    | 'H'
    | 'I'
    | 'J'
    | 'K'
    | 'L'
    | 'M'
    | 'N'
    | 'O'
    | 'P'
    | 'Q'
    | 'R'
    | 'S'
    | 'T'
    | 'U'
    | 'V'
    | 'W'
    | 'X'
    | 'Y'
    | 'Z'
    | '0' // 包含小键盘上的 0
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '!' // Shift + 1
    | '@'
    | '#'
    | '$'
    | '%'
    | '^'
    | '&'
    | '*'
    | '('
    | ')'
    | 'Esc'
    | 'Caps'
    | 'Shift' // 包含 ShiftLeft 和 ShiftRight
    | 'Ctrl'
    | 'Alt'
    | 'Meta'
    | '⌘' // = Meta
    | 'Win' // = Meta
    | '↑'
    | '↓'
    | '←'
    | '→'
    | 'Scroll'
    | 'Num'
    | '-'
    | '_'
    | '='
    | '+'
    | '['
    | '{'
    | ']'
    | '}'
    | '\\'
    | '|'
    | ';'
    | ':'
    | "'"
    | '"'
    | ','
    | '<'
    | '.'
    | '>'
    | '/'
    | '?'
    | '`'
    | '~'

export type IKeyCodes =
    | 'KeyA' // A
    | 'KeyB' // B
    | 'KeyC' // C
    | 'KeyD' // D
    | 'KeyE' // E
    | 'KeyF' // F
    | 'KeyG' // G
    | 'KeyH' // H
    | 'KeyI' // I
    | 'KeyJ' // J
    | 'KeyK' // K
    | 'KeyL' // L
    | 'KeyM' // M
    | 'KeyN' // N
    | 'KeyO' // O
    | 'KeyP' // P
    | 'KeyQ' // Q
    | 'KeyR' // R
    | 'KeyS' // S
    | 'KeyT' // T
    | 'KeyU' // U
    | 'KeyV' // V
    | 'KeyW' // W
    | 'KeyX' // X
    | 'KeyY' // Y
    | 'KeyZ' // Z
    | 'Digit0' // 0
    | 'Digit1' // 1
    | 'Digit2' // 2
    | 'Digit3' // 3
    | 'Digit4' // 4
    | 'Digit5' // 5
    | 'Digit6' // 6
    | 'Digit7' // 7
    | 'Digit8' // 8
    | 'Digit9' // 9
    | 'F1' // F1
    | 'F2' // F2
    | 'F3' // F3
    | 'F4' // F4
    | 'F5' // F5
    | 'F6' // F6
    | 'F7' // F7
    | 'F8' // F8
    | 'F9' // F9
    | 'F10' // F10
    | 'F11' // F11
    | 'F12' // F12
    | 'F13' // F13
    | 'F14' // F14
    | 'F15' // F15
    | 'F16' // F16
    | 'F17' // F17
    | 'F18' // F18
    | 'F19' // F19
    | 'F20' // F20
    | 'F21' // F21
    | 'F22' // F22
    | 'F23' // F23
    | 'F24' // F24
    | 'Escape' // Esc
    | 'Tab' // Tab
    | 'CapsLock' // Caps Lock
    | 'ShiftLeft' // Shift (左)
    | 'ShiftRight' // Shift (右)
    | 'ControlLeft' // Ctrl (左)
    | 'ControlRight' // Ctrl (右)
    | 'AltLeft' // Alt (左)
    | 'AltRight' // Alt (右)
    | 'MetaLeft' // Meta / ⌘ / Win (左)
    | 'MetaRight' // Meta / ⌘ / Win (右)
    | 'Enter' // Enter / 回车
    | 'Space' // 空格键
    | 'Backspace' // Backspace / 删除
    | 'Insert' // Insert
    | 'Delete' // Delete
    | 'Home' // Home
    | 'End' // End
    | 'PageUp' // Page Up
    | 'PageDown' // Page Down
    | 'ArrowUp' // ↑
    | 'ArrowDown' // ↓
    | 'ArrowLeft' // ←
    | 'ArrowRight' // →
    | 'PrintScreen' // Print Screen
    | 'Pause' // Pause / Break
    | 'ScrollLock' // Scroll Lock
    | 'NumLock' // Num Lock
    | 'ContextMenu' // 菜单键
    | 'Minus' // - / _
    | 'Equal' // = / +
    | 'BracketLeft' // [ / {
    | 'BracketRight' // ] / }
    | 'Backslash' // \ / |
    | 'IntlBackslash' // 国际键盘上的 \
    | 'Semicolon' // ; / :
    | 'Quote' // ' / "
    | 'Comma' // , / <
    | 'Period' // . / >
    | 'Slash' // / / ?
    | 'Backquote' // ` / ~
    | 'Numpad0' // 小键盘 0
    | 'Numpad1' // 小键盘 1
    | 'Numpad2' // 小键盘 2
    | 'Numpad3' // 小键盘 3
    | 'Numpad4' // 小键盘 4
    | 'Numpad5' // 小键盘 5
    | 'Numpad6' // 小键盘 6
    | 'Numpad7' // 小键盘 7
    | 'Numpad8' // 小键盘 8
    | 'Numpad9' // 小键盘 9
    | 'NumpadMultiply' // *
    | 'NumpadAdd' // +
    | 'NumpadSubtract' // -
    | 'NumpadDecimal' // .
    | 'NumpadDivide' // /
    | 'NumpadEnter' // 小键盘回车
    | 'NumpadComma' // 小键盘 ,
    | 'NumpadParenLeft' // (
    | 'NumpadParenRight' // )
    | 'NumpadEqual' // =
    | 'BrowserBack' // 浏览器后退
    | 'BrowserForward' // 浏览器前进
    | 'BrowserRefresh' // 浏览器刷新
    | 'BrowserStop' // 停止加载
    | 'BrowserSearch' // 浏览器搜索
    | 'BrowserFavorites' // 浏览器收藏夹
    | 'BrowserHome' // 浏览器主页
    | 'LaunchMail' // 启动邮件客户端
    | 'LaunchMediaPlayer' // 启动媒体播放器
    | 'LaunchCalculator' // 启动计算器
    | 'MediaPlayPause' // 播放/暂停
    | 'MediaStop' // 停止播放
    | 'MediaTrackNext' // 下一首
    | 'MediaTrackPrevious' // 上一首
    | 'MediaVolumeMute' // 静音
    | 'MediaVolumeUp' // 音量+
    | 'MediaVolumeDown' // 音量-
    | 'AudioVolumeMute' // 系统静音
    | 'AudioVolumeUp' // 系统音量+
    | 'AudioVolumeDown' // 系统音量-
    | 'Select' // 已废弃
    | 'LaunchApp1' // 启动应用 1
    | 'LaunchApp2' // 启动应用 2
    | 'Help' // 帮助键
    | 'Sleep' // 休眠
    | 'WakeUp' // 唤醒
    | 'Lang1' // 韩文/日文切换
    | 'Lang2' // 韩文/日文切换
    | 'Power' // 电源键
    | 'Fn' // Fn 键（部分设备）
    | 'Eject' // 光驱弹出键（Mac）
    | 'Convert' // 日文输入：转换
    | 'NonConvert' // 日文输入：不转换
    | 'KanaMode' // 日文假名模式
    | 'Unidentified' // 未识别键
    | (string & {})


export interface IShortcutKeysCheck {
    (e: IUIEvent): boolean
}

export interface IImageEvent extends IEvent {
    image?: ILeaferImage
    attrName?: string
    attrValue?: IObject
    error?: string | IObject
}