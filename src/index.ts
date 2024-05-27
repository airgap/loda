import { load } from './utils'
import { loader } from './loader'
import { popPage } from './popPage'

// Trigger the loader on page load
load(loader)
// Listen for back and forward button clicks
try {
	window.removeEventListener('popstate', popPage)
} catch {
	console.log('popstate rebound')
}

window.addEventListener('popstate', popPage)
