import { LoadingAnimation } from './LoadingAnimation'

export class Cache {
	// Cache of downloaded pages.
	html = new Map<string, string>()

	// Pages that are currently being cached.
	started = new Set<string>()

	loadingAnimation = new LoadingAnimation()
}
