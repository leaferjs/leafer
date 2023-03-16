export interface ILeaferImageConfig {
    url: string
    thumb?: string
}



export interface ILeaferImage {
    //load(url: string):Promise<>
}

export type IImageStatus = 'wait' | 'thumb-loading' | 'thumb-success' | 'thumb-error' | 'loading' | 'success' | 'error' 