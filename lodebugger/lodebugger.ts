(() => {
	const target = document;
	const events: Array<[event: string, message: string, detail?: string]> = [
		['page-queued', 'Queued page for display', 'page'],
		['permacache-hit', 'Loaded page from permacache.', 'page'],
		['page-cached', 'Cached page', 'page'],
		['page-permacached', 'Saved page to permacache.', 'page'],
		[
			'cache-trimmed',
			'Cache trimmed - removed oldest page from cache.',
			'page',
		],
		['page-loading', 'Loading page with cache.', 'cache'],
		['page-loaded', 'Loaded page'],
		['page-excluded', 'Excluded page', 'page'],
		['page-prepped', 'Prepped page'],
		['api-error', 'API error', 'error'],
		['logging-enabled', 'Logging enabled.'],
	];
	for (const event in events) {
		listenFor(events[event]);
	}

	function listenFor(p) {
		target.addEventListener(p[0], function (e) {
			console.log('[Loda] ' + p[1], p[2] ? e.detail[p[2]] : null);
		});
	}

	target.dispatchEvent(new CustomEvent('logging-enabled'));
})();
