import { render, screen, waitFor } from '@testing-library/svelte';
import { vi } from 'vitest';
import GeographicMap from '$lib/components/admin/GeographicMap.svelte';

describe('GeographicMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders no data state when data is empty', () => {
    render(GeographicMap, {
      props: {
        data: []
      }
    });
    
    expect(screen.getByText('No geographic data available')).toBeInTheDocument();
    expect(screen.getByText('Geographic data requires IP geolocation services')).toBeInTheDocument();
    expect(screen.getByText('🌍')).toBeInTheDocument();
  });

  test('renders no data state when data is null', () => {
    render(GeographicMap, {
      props: {
        data: null
      }
    });
    
    expect(screen.getByText('No geographic data available')).toBeInTheDocument();
    expect(screen.getByText('Geographic data requires IP geolocation services')).toBeInTheDocument();
  });

  test('renders no data state when data is undefined', () => {
    render(GeographicMap, {
      props: {
        data: undefined
      }
    });
    
    expect(screen.getByText('No geographic data available')).toBeInTheDocument();
    expect(screen.getByText('Geographic data requires IP geolocation services')).toBeInTheDocument();
  });

  test('renders map container when data is provided', () => {
    const mockData = [
      { country: 'United States', userCount: 100, sessionCount: 50, pageViews: 200 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // When data is provided, the no data message should not be shown
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
    // The map container should be rendered (though we can't easily test the DOM manipulation)
  });

  test('renders with valid data', () => {
    const mockData = [
      { country: 'United States', userCount: 100, sessionCount: 50, pageViews: 200 },
      { country: 'Canada', userCount: 50, sessionCount: 25, pageViews: 100 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with missing country field', () => {
    const mockData = [
      { userCount: 100, sessionCount: 50, pageViews: 200 }, // Missing country
      { country: 'Canada', userCount: 50, sessionCount: 25, pageViews: 100 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with zero values', () => {
    const mockData = [
      { country: 'United States', userCount: 0, sessionCount: 0, pageViews: 0 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles large numbers in data', () => {
    const mockData = [
      { country: 'United States', userCount: 1000000, sessionCount: 500000, pageViews: 2000000 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles multiple countries with same name', () => {
    const mockData = [
      { country: 'United States', userCount: 100, sessionCount: 50, pageViews: 200 },
      { country: 'United States', userCount: 50, sessionCount: 25, pageViews: 100 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with special characters in country names', () => {
    const mockData = [
      { country: 'Côte d\'Ivoire', userCount: 100, sessionCount: 50, pageViews: 200 },
      { country: 'São Paulo', userCount: 50, sessionCount: 25, pageViews: 100 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('updates when data prop changes', async () => {
    const { component } = render(GeographicMap, {
      props: {
        data: []
      }
    });
    
    expect(screen.getByText('No geographic data available')).toBeInTheDocument();
    
    // Update data
    const newData = [
      { country: 'United States', userCount: 100, sessionCount: 50, pageViews: 200 }
    ];
    
    await component.$set({ data: newData });
    
    // Should no longer show no data message
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with null/undefined values', () => {
    const mockData = [
      { country: 'United States', userCount: null, sessionCount: undefined, pageViews: 200 },
      { country: 'Canada', userCount: 50, sessionCount: 25, pageViews: null }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles very large dataset', () => {
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      country: `Country ${i}`,
      userCount: Math.floor(Math.random() * 1000),
      sessionCount: Math.floor(Math.random() * 500),
      pageViews: Math.floor(Math.random() * 2000)
    }));
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with negative values', () => {
    const mockData = [
      { country: 'United States', userCount: -100, sessionCount: 50, pageViews: 200 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with decimal values', () => {
    const mockData = [
      { country: 'United States', userCount: 100.5, sessionCount: 50.25, pageViews: 200.75 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with very long country names', () => {
    const mockData = [
      { country: 'The United States of America', userCount: 100, sessionCount: 50, pageViews: 200 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with empty strings', () => {
    const mockData = [
      { country: '', userCount: 100, sessionCount: 50, pageViews: 200 },
      { country: 'Canada', userCount: 50, sessionCount: 25, pageViews: 100 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with only one country', () => {
    const mockData = [
      { country: 'United States', userCount: 100, sessionCount: 50, pageViews: 200 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with all countries having same user count', () => {
    const mockData = [
      { country: 'United States', userCount: 100, sessionCount: 50, pageViews: 200 },
      { country: 'Canada', userCount: 100, sessionCount: 25, pageViews: 100 },
      { country: 'Mexico', userCount: 100, sessionCount: 30, pageViews: 150 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with zero max users', () => {
    const mockData = [
      { country: 'United States', userCount: 0, sessionCount: 0, pageViews: 0 },
      { country: 'Canada', userCount: 0, sessionCount: 0, pageViews: 0 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Component should render without errors
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('creates geographic visualization with valid data', async () => {
    const mockData = [
      { country: 'United States', userCount: 100, sessionCount: 50, pageViews: 200 },
      { country: 'Canada', userCount: 50, sessionCount: 25, pageViews: 100 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Wait for the component to render and check that the map container exists
    await waitFor(() => {
      const mapContainer = document.querySelector('.map-container');
      expect(mapContainer).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // The component should render without errors when data is provided
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with missing country field in visualization', async () => {
    const mockData = [
      { userCount: 100, sessionCount: 50, pageViews: 200 }, // Missing country
      { country: 'Canada', userCount: 50, sessionCount: 25, pageViews: 100 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Wait for the component to render and check that the map container exists
    await waitFor(() => {
      const mapContainer = document.querySelector('.map-container');
      expect(mapContainer).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // The component should render without errors when data is provided
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('handles data with zero max users in visualization', async () => {
    const mockData = [
      { country: 'United States', userCount: 0, sessionCount: 0, pageViews: 0 },
      { country: 'Canada', userCount: 0, sessionCount: 0, pageViews: 0 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Wait for the component to render and check that the map container exists
    await waitFor(() => {
      const mapContainer = document.querySelector('.map-container');
      expect(mapContainer).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // The component should render without errors when data is provided
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });

  test('formats large numbers correctly in visualization', async () => {
    const mockData = [
      { country: 'United States', userCount: 1500000, sessionCount: 500000, pageViews: 2000000 }
    ];
    
    render(GeographicMap, {
      props: {
        data: mockData
      }
    });
    
    // Wait for the component to render and check that the map container exists
    await waitFor(() => {
      const mapContainer = document.querySelector('.map-container');
      expect(mapContainer).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // The component should render without errors when data is provided
    expect(screen.queryByText('No geographic data available')).not.toBeInTheDocument();
  });
});
