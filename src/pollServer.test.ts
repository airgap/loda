import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { pollServer } from './pollServer'
import { state } from './state'
import { cachePage } from './cachePage'

// Mock dependencies
vi.mock('./state', () => ({
	state: {
		mlEndpoint: 'https://api.example.com',
		lodaId: 'test-api-key'
	}
}))

vi.mock('./cachePage', () => ({
	cachePage: vi.fn()
}))

vi.mock('./dispatchEventOnDocument', () => ({
	dispatchEventOnDocument: vi.fn()
}))

// Add type for mocked fetch
type MockResponse = {
	pages: {
		urls: string[]
	}
}

type FetchResponse = {
	json: () => Promise<MockResponse>
}

describe('pollServer', () => {
	beforeEach(() => {
		// Reset all mocks before each test
		vi.clearAllMocks()

		// Type-safe mock of fetch
		window.fetch = vi.fn() as unknown as typeof fetch
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should make a POST request with correct data for current page', async () => {
		const mockResponse = { pages: { urls: ['https://example.com/page1'] } }
		;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
			json: async () => mockResponse
		} as FetchResponse)

		await pollServer('https://example.com/page1')

		expect(window.fetch).toHaveBeenCalledWith(state.mlEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				action: 'loading_page',
				currentPage: 'https://example.com/page1',
				apiKey: state.lodaId
			})
		})
	})

	it('should include targetPageUrl in request when provided', async () => {
		const mockResponse = { pages: { urls: ['https://example.com/page2'] } }
		;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
			json: async () => mockResponse
		} as FetchResponse)

		await pollServer(
			'https://example.com/page1',
			'https://example.com/page2'
		)

		expect(window.fetch).toHaveBeenCalledWith(state.mlEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				action: 'loading_page',
				currentPage: 'https://example.com/page1',
				apiKey: state.lodaId,
				lastPage: 'https://example.com/page2'
			})
		})
	})

	it('should call cachePage for each URL in the response', async () => {
		const mockResponse = {
			pages: {
				urls: ['https://example.com/page1', 'https://example.com/page2']
			}
		}
		;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
			json: async () => mockResponse
		} as FetchResponse)

		await pollServer('https://example.com/page1')

		expect(cachePage).toHaveBeenCalledTimes(2)
		expect(cachePage).toHaveBeenCalledWith('https://example.com/page1')
		expect(cachePage).toHaveBeenCalledWith('https://example.com/page2')
	})

	it('should throw error if mlEndpoint is not set', async () => {
		vi.mocked(state).mlEndpoint = ''

		await expect(pollServer('https://example.com/page1')).rejects.toThrow(
			'No server set'
		)
	})

	it('should throw network error on network error', async () => {
		vi.mocked(state).mlEndpoint = 'fuck'
		const errorMessage = 'Network error'
		;(window.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
			new Error(errorMessage)
		)

		await expect(pollServer('https://example.com/page1')).rejects.toThrow(
			errorMessage
		)
	})
})
