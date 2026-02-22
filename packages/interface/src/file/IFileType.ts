export type IExportImageType =
    | 'jpg'
    | 'png'
    | 'webp'
    | 'bmp'

export type IExportFileType =
    | 'svg'
    | 'pdf'
    | 'json'
    | IExportImageType

export type IFilmFileType =
    | 'gif'
    | 'webp'
    | 'png' // apng
    | 'avif'

export type IVideoFileType =
    | 'mp4'
    | 'webm'
    | 'ogv' // ogg

export type IMultimediaType =
    | 'image'
    | 'film'
    | 'video'

export type IResponseType =
    | 'text'
    | 'json'
    | 'arrayBuffer'