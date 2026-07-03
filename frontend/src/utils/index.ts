export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
