import type { State } from './types'

export const state: State = {
	changingHash: false,

	loaded: false,

	pageCache: {},

	cachingPages: {},

	loadedFor: []
}
