import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../../components/LoadingSpinner.svelte';

describe('LoadingSpinner', () => {
    it('renders with default props', () => {
        const { container } = render(LoadingSpinner);
        
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(container.querySelector('.loading-modern')).toBeInTheDocument();
    });

    it('renders with custom text', () => {
        render(LoadingSpinner, {
            props: {
                text: 'Please wait...'
            }
        });
        
        expect(screen.getByText('Please wait...')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('renders without text when text prop is empty', () => {
        const { container } = render(LoadingSpinner, {
            props: {
                text: ''
            }
        });
        
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(container.querySelector('.loading-modern')).toBeInTheDocument();
    });

    it('renders without text when text prop is null', () => {
        const { container } = render(LoadingSpinner, {
            props: {
                text: null
            }
        });
        
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(container.querySelector('.loading-modern')).toBeInTheDocument();
    });

    it('renders without text when text prop is undefined', () => {
        const { container } = render(LoadingSpinner, {
            props: {
                text: undefined
            }
        });
        
        // When text is undefined, it should still show the default text
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(container.querySelector('.loading-modern')).toBeInTheDocument();
    });

    it('applies correct CSS classes', () => {
        const { container } = render(LoadingSpinner);
        
        const spinnerContainer = container.querySelector('.flex.flex-col.items-center.justify-center.p-8');
        expect(spinnerContainer).toBeInTheDocument();
        
        const spinner = container.querySelector('.loading-modern');
        expect(spinner).toBeInTheDocument();
    });

    it('renders with different size prop (even though not used in template)', () => {
        const { container } = render(LoadingSpinner, {
            props: {
                size: 'sm',
                text: 'Small spinner'
            }
        });
        
        expect(screen.getByText('Small spinner')).toBeInTheDocument();
        expect(container.querySelector('.loading-modern')).toBeInTheDocument();
    });

    it('maintains proper structure with all elements', () => {
        const { container } = render(LoadingSpinner, {
            props: {
                text: 'Custom loading text'
            }
        });
        
        // Check main container
        const mainContainer = container.querySelector('.flex.flex-col.items-center.justify-center.p-8');
        expect(mainContainer).toBeInTheDocument();
        
        // Check spinner element
        const spinner = container.querySelector('.loading-modern');
        expect(spinner).toBeInTheDocument();
        
        // Check text element
        const textElement = container.querySelector('p.mt-4.text-secondary');
        expect(textElement).toBeInTheDocument();
        expect(textElement).toHaveTextContent('Custom loading text');
    });
});
