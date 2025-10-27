import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['src/test-setup.js'],
		testTimeout: 30000,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'lcov'],
			reportsDirectory: './coverage',
			exclude: [
				'node_modules/',
				'src/test-setup.js',
				'**/*.d.ts',
				'**/*.config.js',
				'**/app.html',
				'**/*.test.{js,ts}',
				'**/*.spec.{js,ts}',
				'**/__tests__/**',
				'**/coverage/**'
			],
			thresholds: {
				statements: 1,
				branches: 1,
				functions: 1,
				lines: 1
			},
			include: ['src/**/*.{js,ts,svelte}']
		}
	}
});
