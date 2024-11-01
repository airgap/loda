import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { showPage } from './showPage'
import { state } from './state'
import { cachePage } from './cachePage'
import { loader } from './loader'

// Mock dependencies
vi.mock('./state', () => ({
	state: {
		pageCache: {}
	}
}))

vi.mock('./cachePage')
vi.mock('./loader')

describe('showPage', () => {
	beforeEach(() => {
		// Reset all mocks before each test
		vi.clearAllMocks()

		// Reset state
		state.pageCache = {}

		// Mock document methods
		document.open = vi.fn() as unknown as typeof document.open
		document.write = vi.fn()
		document.close = vi.fn()

		// Mock history.pushState
		window.history.pushState = vi.fn()

		// Mock requestAnimationFrame
		vi.spyOn(window, 'requestAnimationFrame')
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should cache index.html if no page is provided', async () => {
		await showPage('')

		expect(cachePage).toHaveBeenCalledWith('index.html')
	})

	it('should not proceed if page is not in cache', async () => {
		const testPage = '/test-page'
		state.pageCache[testPage] = undefined as unknown as string

		await showPage(testPage)

		expect(document.open).not.toHaveBeenCalled()
		expect(document.write).not.toHaveBeenCalled()
		expect(document.close).not.toHaveBeenCalled()
	})

	it('should write cached page content to document', async () => {
		const testPage = '/test-page'
		const testContent = '<html>Test Content</html>'
		state.pageCache[testPage] = testContent

		await showPage(testPage)

		expect(document.open).toHaveBeenCalled()
		expect(document.write).toHaveBeenCalledWith(testContent)
		expect(document.close).toHaveBeenCalled()
	})

	it('should push state to history if pop is false', async () => {
		const testPage = '/test-page'
		state.pageCache[testPage] = '<html>Test Content</html>'

		await showPage(testPage, false)

		expect(history.pushState).toHaveBeenCalledWith(
			{ page: testPage },
			'',
			testPage
		)
	})

	it('should not push state to history if pop is true', async () => {
		const testPage = '/test-page'
		state.pageCache[testPage] = '<html>Test Content</html>'

		await showPage(testPage, true)

		expect(history.pushState).not.toHaveBeenCalled()
	})

	it('should trigger loader function via requestAnimationFrame', async () => {
		const testPage = '/test-page'
		state.pageCache[testPage] = '<html>Test Content</html>'

		await showPage(testPage)

		expect(requestAnimationFrame).toHaveBeenCalledWith(loader)
	})
})
