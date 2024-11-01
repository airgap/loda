import { describe, it, expect, beforeEach } from 'vitest'
import { getCacheSize } from './getCacheSize'

describe('getCacheSize', () => {
	// Mock localStorage
	const localStorageMock = (() => {
		let store: Record<string, string> = {}
		return {
			getItem: (key: string) => store[key] ?? null,
			setItem(key: string, value: string) {
				store[key] = value
			},
			clear() {
				store = {}
			},
			length: 0,
			key: (index: number) => Object.keys(store)[index] ?? null
		}
	})()

	// Replace global localStorage with mock
	beforeEach(() => {
		Object.defineProperty(window, 'localStorage', {
			value: localStorageMock,
			writable: true
		})
		localStorageMock.clear()
	})

	it('should return 0 for empty localStorage', () => {
		expect(getCacheSize()).toBe(0)
	})

	it('should count only Loda owned content length', () => {
		const lodaPage = {
			owner: 'Loda',
			content: 'test content'
		}
		const otherPage = {
			owner: 'Other',
			content: 'other content'
		}

		localStorageMock.setItem('page1', JSON.stringify(lodaPage))
		localStorageMock.setItem('page2', JSON.stringify(otherPage))
		Object.defineProperty(localStorageMock, 'length', { value: 2 })

		expect(getCacheSize()).toBe(12) // Length of 'test content'
	})

	it('should skip invalid JSON data', () => {
		const lodaPage = {
			owner: 'Loda',
			content: 'valid content'
		}

		localStorageMock.setItem('page1', JSON.stringify(lodaPage))
		localStorageMock.setItem('page2', 'invalid json')
		Object.defineProperty(localStorageMock, 'length', { value: 2 })

		expect(getCacheSize()).toBe(13) // Length of 'valid content'
	})

	it('should handle null keys and values', () => {
		const lodaPage = {
			owner: 'Loda',
			content: 'test'
		}

		localStorageMock.setItem('page1', JSON.stringify(lodaPage))
		Object.defineProperty(localStorageMock, 'length', { value: 2 }) // Set length higher than actual items

		expect(getCacheSize()).toBe(4) // Length of 'test'
	})
})
