import { loader } from './loader'
import { popPage } from './popPage'
import { actualLoader } from './actualLoader'

// Trigger the loader on page load
// window.addEventListener('load', loader)
window.addEventListener('boost-links', () => {
	console.log('ff')
	actualLoader()
})
loader()
// Listen for back and forward button clicks
try {
	window.removeEventListener('popstate', popPage)
} catch {
	// Nothing to remove, A-OK
}

window.addEventListener('popstate', popPage)
