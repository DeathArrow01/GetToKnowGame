import { describe, it, expect, vi } from 'vitest';

describe('Example Test', () => {
	it('should pass', () => {
		expect(1 + 1).toBe(2);
	});

	it('should test basic functionality', () => {
		const mockFunction = vi.fn();
		mockFunction('test');
		expect(mockFunction).toHaveBeenCalledWith('test');
	});
});
