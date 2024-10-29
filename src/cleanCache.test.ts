import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanCache } from './cleanCache'
import { getCacheSize } from './getCacheSize'
import { dispatchEventOnDocument } from './dispatchEventOnDocument'

// Mock dependencies
vi.mock('./getCacheSize')
vi.mock('./dispatchEventOnDocument')

describe('cleanCache', () => {
	// Setup localStorage mock
	const localStorageMock = (() => {
		let store: Record<string, string | undefined> = {}
		return {
			getItem: vi.fn((key: string) => store[key] ?? null),
			setItem: vi.fn((key: string, value: string) => {
				store[key] = value
			}),
			removeItem: vi.fn((key: string) => {
				store[key] = undefined
			}),
			clear: vi.fn(() => {
				store = {}
			}),
			key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
			get length() {
				return Object.keys(store).length
			}
		}
	})()

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks()

		// Setup global localStorage mock
		Object.defineProperty(window, 'localStorage', {
			value: localStorageMock
		})

		// Clear localStorage
		localStorageMock.clear()
	})

	it('should not clean cache if enough space is available', () => {
		vi.mocked(getCacheSize).mockReturnValue(1_000_000)

		cleanCache(1_000_000)

		expect(localStorageMock.removeItem).not.toHaveBeenCalled()
		expect(dispatchEventOnDocument).toHaveBeenCalledTimes(1)
		expect(dispatchEventOnDocument).toHaveBeenCalledWith(
			'pageCache-cleaned'
		)
	})

	it('should remove oldest page when cache is full', () => {
		// Mock initial cache size
		vi.mocked(getCacheSize).mockReturnValueOnce(300_500_000)

		// Setup test data
		const oldPage = {
			owner: 'Loda',
			content: 'old content',
			lastUsed: Date.now() - 1000
		}
		const newPage = {
			owner: 'Loda',
			content: 'new content',
			lastUsed: Date.now()
		}

		localStorageMock.setItem('page1', JSON.stringify(oldPage))
		localStorageMock.setItem('page2', JSON.stringify(newPage))

		cleanCache(100_000_000)

		expect(localStorageMock.removeItem).toHaveBeenCalledWith('page1')
		expect(dispatchEventOnDocument).toHaveBeenCalledWith(
			'pageCache-trimmed',
			{
				page: 'page1'
			}
		)
		expect(dispatchEventOnDocument).toHaveBeenCalledWith(
			'pageCache-cleaned'
		)
	})

	it('should ignore non-Loda pages', () => {
		vi.mocked(getCacheSize).mockReturnValueOnce(300_500_000)

		const nonLodaPage = {
			owner: 'Other',
			content: 'other content',
			lastUsed: Date.now() - 1000
		}
		const lodaPage = {
			owner: 'Loda',
			content: 'loda content',
			lastUsed: Date.now()
		}

		localStorageMock.setItem('page1', JSON.stringify(nonLodaPage))
		localStorageMock.setItem('page2', JSON.stringify(lodaPage))

		cleanCache(1_000_000)

		expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('page1')
	})

	it('should handle invalid JSON in localStorage', () => {
		vi.mocked(getCacheSize).mockReturnValueOnce(3_500_000)

		localStorageMock.setItem('invalidPage', 'invalid json')
		localStorageMock.setItem(
			'validPage',
			JSON.stringify({
				owner: 'Loda',
				content: 'content',
				lastUsed: Date.now()
			})
		)

		expect(() => {
			cleanCache(1_000_000)
		}).not.toThrow()
	})
})
