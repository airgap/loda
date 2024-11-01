import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		lib: {
			entry: resolve('src/index.ts'),
			name: 'Loda',
			fileName: 'index'
		},
		rollupOptions: {
			output: {
				globals: {}
			}
		},
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
				pure_funcs: [
					'console.log',
					'console.info',
					'console.debug',
					'console.trace'
				],
				passes: 2
			},
			mangle: {
				properties: true
			},
			format: {
				comments: false
			}
		}
	},
	plugins: [dts()],
	test: {
		environment: 'happy-dom'
		// SetupFiles: ["./setupTests.ts"],
	}
})
