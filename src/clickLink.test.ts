import { describe, it, expect, vi } from 'vitest'
import { clickLink } from './clickLink'
import { state } from './state'
import { showPage } from './showPage'
import { cachePage } from './cachePage'
import { pollServer } from './pollServer'

// Mock dependencies
vi.mock('./showPage')
vi.mock('./cachePage')
vi.mock('./pollServer')

describe('clickLink', () => {
	it('should handle string URL input', async () => {
		const url = 'http://example.com'
		state.pageCache[url] = 'true' // Mock cache

		await clickLink(url)

		expect(state.lastPage).toBe(url)
		expect(showPage).toHaveBeenCalledWith(url)
	})

	it('should handle MouseEvent input', async () => {
		const url = 'http://example.com/'
		const anchor = document.createElement('a')
		anchor.href = url
		const event = new MouseEvent('click', {
			bubbles: true,
			cancelable: true
		})
		Object.defineProperty(event, 'target', { value: anchor })

		state.pageCache[url] = 'true' // Mock cache

		await clickLink(event)

		expect(state.lastPage).toBe(url)
		expect(showPage).toHaveBeenCalledWith(url)
	})

	it('should cache and show page if not cached', async () => {
		const url = 'http://example.com/'
		const anchor = document.createElement('a')
		anchor.href = url
		const event = new MouseEvent('click', {
			bubbles: true,
			cancelable: true
		})
		Object.defineProperty(event, 'target', { value: anchor })

		state.pageCache[url] = undefined as unknown as string

		await clickLink(event)

		expect(cachePage).toHaveBeenCalledWith(url)
		expect(showPage).toHaveBeenCalledWith(url)
	})

	it('should poll server if lodaId is a string', async () => {
		const url = 'http://example.com'
		const lastPage = 'http://lastpage.com'
		state.lodaId = 'someId'
		state.lastPage = lastPage

		await clickLink(url)

		expect(pollServer).toHaveBeenCalledWith(url, lastPage)
	})

	it('should throw an error if href is not found', async () => {
		const event = new MouseEvent('click', {
			bubbles: true,
			cancelable: true
		})
		Object.defineProperty(event, 'target', { value: null })

		await expect(clickLink(event)).rejects.toThrow('Oops')
	})
})
