type DebugDef = {
	event: string
	message: string
	detail?: string
}
export const lodebugger = () => {
	const target = document
	const events = [
		{
			event: 'page-queued',
			message: 'Queued page for display',
			detail: 'page'
		},
		{
			event: 'permacache-hit',
			message: 'Loaded page from permacache.',
			detail: 'page'
		},
		{
			event: 'page-cached',
			message: 'Cached page',
			detail: 'page'
		},
		{
			event: 'page-permacached',
			message: 'Saved page to permacache.',
			detail: 'page'
		},
		{
			event: 'cache-trimmed',
			message: 'Cache trimmed - removed oldest page from cache.',
			detail: 'page'
		},
		{
			event: 'page-loading',
			message: 'Cache trimmed - removed oldest page from cache.',
			detail: 'cache'
		},
		{ event: 'page-loaded', message: 'Loaded page' },
		{ event: 'page-excluded', message: 'Excluded page', detail: 'page' },
		{
			event: 'page-prepped',
			message: 'Prepped page'
		},
		{
			event: 'api-error',
			message: 'API error',
			detail: 'error'
		},
		{
			event: 'logging-enabled',
			message: 'Logging enabled.'
		}
	] satisfies DebugDef[]
	for (const event of events) listenFor(event)

	function listenFor(p: DebugDef) {
		target.addEventListener(p.event, function (e) {
			console.log(
				'[Loda] ' + p.message,
				p.detail && e instanceof CustomEvent ? e.detail[p.detail] : null
			)
		})
	}

	target.dispatchEvent(new CustomEvent('logging-enabled'))
}
