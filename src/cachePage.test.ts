import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cachePage } from './cachePage'
import { state } from './state'
import { storedPageFor } from './storedPageFor'
import { getSiteVersion } from './getSiteVersion'
import { getCacheSize } from './getCacheSize'
import { cleanCache } from './cleanCache'
import { dispatchEventOnDocument } from './dispatchEventOnDocument'

// Mock all dependencies
vi.mock('./state', () => ({
	state: {
		cachingPages: {},
		pageCache: {}
	}
}))

vi.mock('./storedPageFor')
vi.mock('./getSiteVersion')
vi.mock('./getCacheSize')
vi.mock('./cleanCache')
vi.mock('./dispatchEventOnDocument')

describe('cachePage', () => {
	const testPage = '/test-page'
	const testContent = '<html>Test Content</html>'

	beforeEach(() => {
		// Reset all mocks before each test
		vi.clearAllMocks()
		state.cachingPages = {}
		state.pageCache = {}
		global.fetch = vi.fn()
		global.localStorage = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			clear: vi.fn(),
			removeItem: vi.fn(),
			length: 0,
			key: vi.fn()
		}
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should not cache if page is already being cached', async () => {
		state.cachingPages[testPage] = true
		await cachePage(testPage)
		expect(fetch).not.toHaveBeenCalled()
	})

	it('should load from permacache if version is valid', async () => {
		vi.mocked(getSiteVersion).mockReturnValue(1)
		vi.mocked(storedPageFor).mockReturnValue({
			content: testContent,
			version: 1,
			date: Date.now(),
			lastUsed: Date.now(),
			owner: 'Loda'
		})

		await cachePage(testPage)

		expect(state.pageCache[testPage]).toBe(testContent)
		expect(dispatchEventOnDocument).toHaveBeenCalledWith('permacache-hit', {
			page: testPage
		})
		expect(fetch).not.toHaveBeenCalled()
	})

	it('should fetch and cache page if not in permacache', async () => {
		vi.mocked(getSiteVersion).mockReturnValue(-1)
		vi.mocked(fetch).mockResolvedValue({
			text: async () => testContent
		} as Response)

		await cachePage(testPage)

		expect(fetch).toHaveBeenCalledWith(testPage)
		expect(state.pageCache[testPage]).toBe(testContent)
		expect(dispatchEventOnDocument).toHaveBeenCalledWith('page-cached', {
			page: testPage,
			content: testContent
		})
		expect(cleanCache).toHaveBeenCalledWith(testContent.length)
	})

	it('should store in localStorage if conditions are met', async () => {
		vi.mocked(getSiteVersion).mockReturnValue(1)
		vi.mocked(getCacheSize).mockReturnValue(0)
		vi.mocked(fetch).mockResolvedValue({
			text: async () => testContent
		} as Response)

		await cachePage(testPage)

		expect(localStorage.setItem).toHaveBeenCalledWith(
			testPage,
			expect.stringContaining(testContent)
		)
		expect(dispatchEventOnDocument).toHaveBeenCalledWith('page-permacached')
	})

	it('should not store in localStorage if cache size would exceed limit', async () => {
		vi.mocked(getSiteVersion).mockReturnValue(1)
		vi.mocked(getCacheSize).mockReturnValue(3_999_999) // Just below 4MB
		vi.mocked(fetch).mockResolvedValue({
			text: async () => testContent
		} as Response)

		await cachePage(testPage)

		expect(localStorage.setItem).not.toHaveBeenCalled()
		expect(dispatchEventOnDocument).not.toHaveBeenCalledWith(
			'page-permacached'
		)
	})
})
