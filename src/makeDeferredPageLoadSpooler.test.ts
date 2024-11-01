import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { makeDeferredPageLoadSpooler } from './makeDeferredPageLoadSpooler'
import { state } from './state'

describe('makeDeferredPageLoadSpooler', () => {
	beforeEach(() => {
		// Reset state before each test
		state.deferredPageLoadSpooler = undefined

		// Reset document.body styles
		document.body.style.cursor = ''
		document.body.style.pointerEvents = ''
		document.body.style.opacity = ''

		// Mock setTimeout
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('should set a timeout if none exists', () => {
		makeDeferredPageLoadSpooler()
		expect(state.deferredPageLoadSpooler).toBeDefined()
	})

	it('should not create new timeout if one already exists', () => {
		makeDeferredPageLoadSpooler()
		const firstTimeout = state.deferredPageLoadSpooler
		makeDeferredPageLoadSpooler()
		expect(state.deferredPageLoadSpooler).toBe(firstTimeout)
	})

	it('should modify body styles after timeout completes', () => {
		makeDeferredPageLoadSpooler()

		// Verify styles are not changed immediately
		expect(document.body.style.cursor).toBe('')
		expect(document.body.style.pointerEvents).toBe('')
		expect(document.body.style.opacity).toBe('')

		// Advance timers by 500ms
		vi.advanceTimersByTime(500)

		// Verify styles are changed after timeout
		expect(document.body.style.cursor).toBe('none')
		expect(document.body.style.pointerEvents).toBe('none')
		expect(document.body.style.opacity).toBe('.5')
	})
})
