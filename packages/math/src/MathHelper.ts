export const MathHelper = {

    within(value: number, min: number, max: number): number {
        if (value < min) value = min
        if (value > max) value = max
        return value
    }

}

export const OneRadian = Math.PI / 180