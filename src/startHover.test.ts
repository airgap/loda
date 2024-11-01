import { describe, it, expect, beforeEach, vi } from 'vitest'
import { startHover } from './startHover'
import { state } from './state'
import { cachePage } from './cachePage'

vi.useFakeTimers()

// Mock dependencies
vi.mock('./state', () => ({
	state: {
		cacheTimer: undefined
	}
}))
vi.mock('./cachePage')

describe('startHover', () => {
	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks()
		// Reset timer
		state.cacheTimer = undefined
	})

	it('should find anchor element and trigger page cache', () => {
		// Create test DOM elements
		const anchor = document.createElement('a')
		anchor.href = 'https://example.com'
		const child = document.createElement('span')
		anchor.append(child)

		// Call startHover with the child element
		startHover({ target: child })

		// Wait for any setTimeout to complete
		vi.runAllTimers()

		// Verify cachePage was called with correct href
		expect(cachePage).toHaveBeenCalledWith('https://example.com/')
	})

	it('should clear existing cache timer before starting new one', () => {
		// Setup
		const anchor = document.createElement('a')
		anchor.href = 'https://example.com'
		state.cacheTimer = setTimeout(() => {
			// Nop
		}, 1000)

		// Spy on clearTimeout
		const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')

		// Action
		startHover({ target: anchor })

		// Assert
		expect(clearTimeoutSpy).toHaveBeenCalled()
	})

	it('should throw error if no anchor element is found', () => {
		// Create a div element with no anchor parent
		const div = document.createElement('div')

		// Assert that startHover throws an error
		expect(() => {
			startHover({ target: div })
		}).toThrow('Cannot find anchor')
	})
})
