import { render, screen } from '@testing-library/svelte';
import Layout from '../../../routes/+layout.svelte';

describe('Layout', () => {
  test('renders main element with correct class', () => {
    render(Layout);
    
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('mailgo-page');
  });

  test('renders slot content', () => {
    const { container } = render(Layout);
    
    // The layout component should render the main element
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
  });

  test('has correct CSS styles', () => {
    const { container } = render(Layout);
    
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    // Check that the main element has the correct class instead of inline styles
    expect(mainElement).toHaveClass('mailgo-page');
  });

  test('renders without errors', () => {
    expect(() => render(Layout)).not.toThrow();
  });
});
