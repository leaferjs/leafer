export interface IProgressData {
    value: number // 保留2位小数的 loaded / total 百分比值，如26.02
    loaded: number // 字节数
    total: number // 字节数
}

export interface IProgressFunction {
    (progress: IProgressData): void
}