import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loader } from './loader'
import { state } from './state'
import { dispatchEventOnDocument } from './dispatchEventOnDocument'

// Mock dependencies
vi.mock('./state', () => ({
	state: {
		deferredPageLoadSpooler: undefined,
		binderTimeout: undefined,
		pageCache: {}
	}
}))

vi.mock('./dispatchEventOnDocument')

describe('loader', () => {
	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks()

		// Reset state
		state.deferredPageLoadSpooler = undefined
		state.binderTimeout = undefined
	})

	it('should clear deferredPageLoadSpooler timeout if it exists', () => {
		// Setup
		const mockTimeout = setTimeout(() => {
			/* Empty */
		}, 1000)
		state.deferredPageLoadSpooler = mockTimeout
		vi.spyOn(global, 'clearTimeout')

		// Execute
		loader()

		// Verify
		expect(clearTimeout).toHaveBeenCalledWith(mockTimeout)
		expect(state.deferredPageLoadSpooler).toBeUndefined()
	})

	it('should dispatch page-loading event with pageCache', () => {
		// Execute
		loader()

		// Verify
		expect(dispatchEventOnDocument).toHaveBeenCalledWith('page-loading', {
			cache: state.pageCache
		})
	})

	it('should clear existing binderTimeout if it exists', () => {
		// Setup
		const mockTimeout = setTimeout(() => {
			/* Empty */
		}, 1000)
		state.binderTimeout = mockTimeout
		vi.spyOn(global, 'clearTimeout')

		// Execute
		loader()

		// Verify
		expect(clearTimeout).toHaveBeenCalledWith(mockTimeout)
	})

	it('should set new binderTimeout that dispatches boost-links event', () => {
		// Setup
		vi.useFakeTimers()

		// Execute
		loader()

		// Verify timeout is set
		expect(state.binderTimeout).toBeDefined()

		// Fast-forward timer
		vi.advanceTimersByTime(10)

		// Verify event is dispatched
		expect(dispatchEventOnDocument).toHaveBeenCalledWith('boost-links')

		// Cleanup
		vi.useRealTimers()
	})
})
