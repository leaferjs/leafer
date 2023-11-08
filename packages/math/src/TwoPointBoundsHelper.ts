import { ITwoPointBoundsData, IBoundsData } from '@leafer/interface'

export const TwoPointBoundsHelper = {

    tempPointBounds: {} as ITwoPointBoundsData,

    setPoint(t: ITwoPointBoundsData, minX: number, minY: number): void {
        t.minX = t.maxX = minX
        t.minY = t.maxY = minY
    },

    addPoint(t: ITwoPointBoundsData, x: number, y: number): void {
        t.minX = x < t.minX ? x : t.minX
        t.minY = y < t.minY ? y : t.minY
        t.maxX = x > t.maxX ? x : t.maxX
        t.maxY = y > t.maxY ? y : t.maxY
    },

    addBounds(t: ITwoPointBoundsData, x: number, y: number, width: number, height: number): void {
        addPoint(t, x, y)
        addPoint(t, x + width, y + height)
    },

    copy(t: ITwoPointBoundsData, pb: ITwoPointBoundsData): void {
        t.minX = pb.minX
        t.minY = pb.minY
        t.maxX = pb.maxX
        t.maxY = pb.maxY
    },

    addPointBounds(t: ITwoPointBoundsData, pb: ITwoPointBoundsData): void {
        t.minX = pb.minX < t.minX ? pb.minX : t.minX
        t.minY = pb.minY < t.minY ? pb.minY : t.minY
        t.maxX = pb.maxX > t.maxX ? pb.maxX : t.maxX
        t.maxY = pb.maxY > t.maxY ? pb.maxY : t.maxY
    },

    toBounds(t: ITwoPointBoundsData, setBounds: IBoundsData): void {
        setBounds.x = t.minX
        setBounds.y = t.minY
        setBounds.width = t.maxX - t.minX
        setBounds.height = t.maxY - t.minY
    }

}

const { addPoint } = TwoPointBoundsHelper