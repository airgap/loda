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
		}
	},
	plugins: [dts()],
	test: {
		environment: 'happy-dom'
		// SetupFiles: ["./setupTests.ts"],
	}
})
