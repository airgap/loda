import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'Use Future',
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
		// setupFiles: ["./setupTests.ts"],
	}
})
