import { getLocalStorageSize } from './getLocalStorageSize'

export const doesLocalStorageHaveRoom = (room: number) =>
	getLocalStorageSize() + room < 4_000_000
