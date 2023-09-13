export const MathHelper = {

    within(value: number, min: number, max: number): number {
        if (value < min) value = min
        if (value > max) value = max
        return value
    },

    fourNumber(num: number | number[]): number[] {
        let one: number, two: number, three: number, four: number // = top right bottom left || topLeft, topRight, bottomRight, bottomLeft
        if (num instanceof Array) {
            switch (num.length) {
                case 4:
                    return num
                case 2:
                    one = three = num[0]
                    two = four = num[1]
                    break
                case 3:
                    one = num[0]
                    two = four = num[1]
                    three = num[2]
                    break
                case 1:
                    num = num[0]
                    break
                default:
                    num = 0
            }
        }
        return one === undefined ? [num as number, num as number, num as number, num as number] : [one, two, three, four]
    },

    formatRotation(rotation: number, unsign?: boolean): number {
        rotation %= 360
        if (unsign) {
            if (rotation < 0) rotation += 360
        } else {
            if (rotation > 180) rotation -= 360
            if (rotation < -180) rotation += 360
        }
        return rotation
    },

    formatSkew(skew: number): number {
        return MathHelper.within(skew, -90, 90)
    }

}

export const OneRadian = Math.PI / 180
export const PI2 = Math.PI * 2
export const PI_2 = Math.PI / 2