import { resolve } from 'path'
import { sync } from 'glob'
import { plugin, Mode } from 'vite-plugin-markdown'

export default {
	root: '.',
	build: {
		tsconfig: 'demo/tsconfig.json',
		rollupOptions: {
			input: sync(resolve(__dirname, 'demo', '*.html'))
		}
	},
	plugins: [plugin({ mode: [Mode.HTML] })]

	// entryPoints: 'index.html'
}
