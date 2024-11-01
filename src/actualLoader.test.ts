import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { actualLoader } from './actualLoader'
import { state } from './state'
import { startHover } from './startHover'
import { clickLink } from './clickLink'
import { pollServer } from './pollServer'
import { dispatchEventOnDocument } from './dispatchEventOnDocument'

// Mock dependencies
vi.mock('./state', () => ({
	state: {
		loaded: false,
		lastPage: '',
		lodaId: undefined,
		mlEndpoint: undefined,
		loadedFor: []
	}
}))

vi.mock('./startHover')
vi.mock('./clickLink')
vi.mock('./pollServer')
vi.mock('./dispatchEventOnDocument')

describe('actualLoader', () => {
	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks()

		// Reset state
		state.loaded = false
		state.lastPage = ''
		state.lodaId = undefined
		state.mlEndpoint = undefined
		state.loadedFor = []

		// Mock document methods
		document.getElementsByTagName = vi.fn().mockReturnValue([])

		// Mock location
		Object.defineProperty(window, 'location', {
			value: {
				href: 'https://example.com',
				protocol: 'https:',
				hostname: 'example.com'
			},
			writable: true
		})
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should dispatch load events when state.loaded is true', () => {
		state.loaded = true

		actualLoader()

		expect(dispatchEventOnDocument).toHaveBeenCalledWith('page-loaded')
	})

	it('should update state.lastPage with current location', () => {
		actualLoader()
		expect(state.lastPage).toBe('https://example.com')
	})

	it('should process valid links and add event listeners', () => {
		const mockLink = document.createElement('a')
		mockLink.href = 'https://example.com/page'

		document.getElementsByTagName = vi.fn().mockReturnValue([mockLink])

		actualLoader()

		expect(mockLink.getAttribute('loda-bound')).toBe('true')
		expect(mockLink.hasAttribute('loda-disabled')).toBe(false)
	})

	it('should not process links with loda-disabled attribute', () => {
		const mockLink = document.createElement('a')
		mockLink.href = 'https://example.com/page'
		mockLink.setAttribute('loda-disabled', 'true')

		document.getElementsByTagName = vi.fn().mockReturnValue([mockLink])

		actualLoader()

		expect(mockLink.getAttribute('loda-bound')).toBeNull()
	})

	it('should handle hash changes correctly', async () => {
		const mockLink = document.createElement('a')
		mockLink.href = 'https://example.com#section'

		document.getElementsByTagName = vi.fn().mockReturnValue([mockLink])
		window.location.href = 'https://example.com'

		actualLoader()
		mockLink.click()

		expect(state.changingHash).toBe(true)
	})

	it('should update Loda configuration from script tag', () => {
		const mockScript = document.createElement('script')
		mockScript.id = 'loda-script'
		mockScript.setAttribute('loda-id', 'test-id')
		mockScript.setAttribute('ml-endpoint', 'https://custom-api.example.com')
		document.body.append(mockScript)

		actualLoader()

		expect(state.lodaId).toBe('test-id')
		expect(state.mlEndpoint).toBe('https://custom-api.example.com')

		mockScript.remove()
	})

	it('should poll server when conditions are met', () => {
		state.lodaId = 'test-id'
		state.loadedFor = []
		window.location.href = 'https://example.com/new-page'

		actualLoader()

		expect(pollServer).toHaveBeenCalledWith('https://example.com/new-page')
		expect(state.loadedFor).toContain('https://example.com/new-page')
	})

	it('should not poll server for already loaded pages', () => {
		state.lodaId = 'test-id'
		state.loadedFor = ['https://example.com']
		window.location.href = 'https://example.com'

		actualLoader()

		expect(pollServer).not.toHaveBeenCalled()
	})

	it('should dispatch page-prepped event and set loaded state', () => {
		actualLoader()

		expect(dispatchEventOnDocument).toHaveBeenCalledWith('page-prepped')
		expect(state.loaded).toBe(true)
	})
})
