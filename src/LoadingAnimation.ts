export class LoadingAnimation {
	// The timer that says when to kick in
	kickinTimer?: number

	/**
	 * @function makeDeferredPageLoadSpooler
	 * @memberof Loda
	 * @description Show a page spooling animation if a load is taking too long.
	 * Currently non-functional
	 */
	triggerWhenNecessary = () => {
		if (!this.kickinTimer) {
			this.kickinTimer = window.setTimeout(() => {
				const b = document.body
				b.style.cursor = 'none'
				b.style.pointerEvents = 'none'
				b.style.opacity = '.5'
			}, 500)
		}
	}

	nevermind = () => {
		// Prevent any spooling animations from displaying
		if (this.kickinTimer) {
			clearTimeout(this.kickinTimer)
			this.kickinTimer = undefined
		}
	}
}
