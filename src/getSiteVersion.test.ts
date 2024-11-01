import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getSiteVersion } from './getSiteVersion'

describe('getSiteVersion', () => {
	let mockScript: HTMLScriptElement

	beforeEach(() => {
		// Create a mock script element before each test
		mockScript = document.createElement('script')
		mockScript.id = 'loda-script'
		document.body.append(mockScript)
	})

	afterEach(() => {
		// Clean up after each test
		mockScript.remove()
	})

	it('returns the site version when attribute exists', () => {
		mockScript.setAttribute('site-version', '123')
		expect(getSiteVersion()).toBe(123)
	})

	it('returns -1 when script element is not found', () => {
		mockScript.remove()
		expect(getSiteVersion()).toBe(-1)
	})

	it('returns -1 when site-version attribute is not set', () => {
		expect(getSiteVersion()).toBe(-1)
	})
})
