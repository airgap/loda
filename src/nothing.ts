import { promisify } from 'util'

export const nothing = promisify(window.setTimeout)
