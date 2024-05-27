type State = {
	//Is true if the hash is currently being changed
	changingHash: boolean
	//Is true if the load binder is trying to run
	binderTimeout?: NodeJS.Timeout
	//Loaded first time
	loaded: boolean
	//Cache of downloaded pages.
	pageCache: Record<string, string>
	//Pages that are currently being cached.
	cachingPages: Record<string, boolean>
	//Pages that already have the RML-generated list of pages to pageCache retrieved.
	loadedFor: string[]
	//Used for time-delay hover cachingPages. Currently unused.
	cacheTimer?: NodeJS.Timeout

	//Automatically set by retrieving value from the Loda script tag.
	//Required for RML, and requires Loda account.
	//Not required for any other features.
	LODA_ID?: string | null

	//Keeps track of what page was just navigated away from.
	LAST_PAGE?: string

	//Stores the page that will be shown after load if link is clicked.
	queuedPage?: string

	//Override this to pass API calls through a custom proxy to protect your
	//API key and to allow you to filter requests to prevent DoS and other abuse
	// Default server used to be 'https://api.loda.rocks', I may bring it back
	SERVER?: string
	USING_PROXY: boolean
	deferredPageLoadSpooler?: NodeJS.Timeout
}
export const state: State = {
	changingHash: false,

	loaded: false,

	pageCache: {},

	cachingPages: {},

	loadedFor: [],
	USING_PROXY: false
}
