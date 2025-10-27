import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ErrorMessage from '../../components/ErrorMessage.svelte';

describe('ErrorMessage', () => {
    it('renders with default message', () => {
        render(ErrorMessage);
        
        expect(screen.getByText('Error!')).toBeInTheDocument();
        expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
        render(ErrorMessage, {
            props: {
                message: 'Something went wrong!'
            }
        });
        
        expect(screen.getByText('Error!')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    });

    it('renders without retry button when onRetry is not provided', () => {
        render(ErrorMessage, {
            props: {
                message: 'Test error'
            }
        });
        
        expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    });

    it('renders with retry button when onRetry is provided', () => {
        const mockRetry = vi.fn();
        
        render(ErrorMessage, {
            props: {
                message: 'Test error',
                onRetry: mockRetry
            }
        });
        
        expect(screen.getByText('Retry')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', async () => {
        const mockRetry = vi.fn();
        
        render(ErrorMessage, {
            props: {
                message: 'Test error',
                onRetry: mockRetry
            }
        });
        
        const retryButton = screen.getByText('Retry');
        await fireEvent.click(retryButton);
        
        expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('renders error icon', () => {
        const { container } = render(ErrorMessage);
        
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('w-6', 'h-6', 'mr-3');
    });

    it('applies correct CSS classes', () => {
        const { container } = render(ErrorMessage);
        
        const alertContainer = container.querySelector('.alert-modern.alert-error.max-w-2xl.mx-auto');
        expect(alertContainer).toBeInTheDocument();
        
        const title = container.querySelector('h3.font-bold.text-lg');
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent('Error!');
        
        const message = container.querySelector('.text-sm.text-secondary');
        expect(message).toBeInTheDocument();
    });

    it('handles empty message gracefully', () => {
        const { container } = render(ErrorMessage, {
            props: {
                message: ''
            }
        });
        
        expect(screen.getByText('Error!')).toBeInTheDocument();
        const messageDiv = container.querySelector('.text-sm.text-secondary');
        expect(messageDiv).toBeInTheDocument();
        expect(messageDiv).toHaveTextContent('');
    });

    it('handles null message gracefully', () => {
        render(ErrorMessage, {
            props: {
                message: null
            }
        });
        
        expect(screen.getByText('Error!')).toBeInTheDocument();
    });

    it('handles undefined message gracefully', () => {
        render(ErrorMessage, {
            props: {
                message: undefined
            }
        });
        
        expect(screen.getByText('Error!')).toBeInTheDocument();
    });

    it('maintains proper accessibility with button role', () => {
        const mockRetry = vi.fn();
        
        render(ErrorMessage, {
            props: {
                message: 'Test error',
                onRetry: mockRetry
            }
        });
        
        const retryButton = screen.getByRole('button');
        expect(retryButton).toBeInTheDocument();
        expect(retryButton).toHaveTextContent('Retry');
    });

    it('renders with long error message', () => {
        const longMessage = 'This is a very long error message that should still be displayed correctly and not break the layout or cause any issues with the component rendering.';
        
        render(ErrorMessage, {
            props: {
                message: longMessage
            }
        });
        
        expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles multiple retry clicks', async () => {
        const mockRetry = vi.fn();
        
        render(ErrorMessage, {
            props: {
                message: 'Test error',
                onRetry: mockRetry
            }
        });
        
        const retryButton = screen.getByText('Retry');
        
        await fireEvent.click(retryButton);
        await fireEvent.click(retryButton);
        await fireEvent.click(retryButton);
        
        expect(mockRetry).toHaveBeenCalledTimes(3);
    });
});
