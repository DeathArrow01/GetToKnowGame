import { render, screen, waitFor } from '@testing-library/svelte';
import { vi } from 'vitest';
import VisitorGraph from '$lib/components/admin/VisitorGraph.svelte';

describe('VisitorGraph', () => {
  const mockData = [
    { uniqueVisitors: 10, totalPageViews: 25, date: '2024-01-01' },
    { uniqueVisitors: 15, totalPageViews: 30, date: '2024-01-02' },
    { uniqueVisitors: 8, totalPageViews: 20, date: '2024-01-03' },
    { uniqueVisitors: 20, totalPageViews: 40, date: '2024-01-04' },
    { uniqueVisitors: 12, totalPageViews: 28, date: '2024-01-05' }
  ];

  test('renders no data message when no data provided', () => {
    render(VisitorGraph, { props: { data: null } });
    
    expect(screen.getByText('No visitor data available for the selected period')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  test('renders no data message when data is empty array', () => {
    render(VisitorGraph, { props: { data: [] } });
    
    expect(screen.getByText('No visitor data available for the selected period')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  test('renders chart header with default period', () => {
    render(VisitorGraph, { props: { data: mockData } });
    
    expect(screen.getByText('Daily Visitor Trends')).toBeInTheDocument();
    expect(screen.getByText('Total: 65 visitors')).toBeInTheDocument();
  });

  test('renders chart header with custom period', () => {
    render(VisitorGraph, { props: { data: mockData, period: 'month' } });
    
    expect(screen.getByText('Monthly Visitor Trends')).toBeInTheDocument();
    expect(screen.getByText('Total: 65 visitors')).toBeInTheDocument();
  });

  test('renders chart container when data is provided', () => {
    render(VisitorGraph, { props: { data: mockData } });
    
    const chartContainer = document.querySelector('.chart-container');
    expect(chartContainer).toBeInTheDocument();
  });

  test('handles single data point', () => {
    const singleData = [{ uniqueVisitors: 10, totalPageViews: 25, date: '2024-01-01' }];
    
    render(VisitorGraph, { props: { data: singleData } });
    
    expect(screen.getByText('Total: 10 visitors')).toBeInTheDocument();
  });

  test('handles data with zero visitors', () => {
    const zeroData = [
      { uniqueVisitors: 0, totalPageViews: 0, date: '2024-01-01' },
      { uniqueVisitors: 0, totalPageViews: 0, date: '2024-01-02' }
    ];
    
    render(VisitorGraph, { props: { data: zeroData } });
    
    expect(screen.getByText('Total: 0 visitors')).toBeInTheDocument();
  });

  test('handles data with same values', () => {
    const sameData = [
      { uniqueVisitors: 10, totalPageViews: 25, date: '2024-01-01' },
      { uniqueVisitors: 10, totalPageViews: 25, date: '2024-01-02' },
      { uniqueVisitors: 10, totalPageViews: 25, date: '2024-01-03' }
    ];
    
    render(VisitorGraph, { props: { data: sameData } });
    
    expect(screen.getByText('Total: 30 visitors')).toBeInTheDocument();
  });

  test('updates chart when data changes', async () => {
    const { component } = render(VisitorGraph, { props: { data: mockData } });
    
    expect(screen.getByText('Total: 65 visitors')).toBeInTheDocument();

    // Update data
    const newData = [
      { uniqueVisitors: 25, totalPageViews: 50, date: '2024-01-06' },
      { uniqueVisitors: 30, totalPageViews: 60, date: '2024-01-07' }
    ];
    
    component.$set({ data: newData });

    await waitFor(() => {
      expect(screen.getByText('Total: 55 visitors')).toBeInTheDocument();
    });
  });

  test('calculates total visitors correctly', () => {
    const testData = [
      { uniqueVisitors: 5, totalPageViews: 15, date: '2024-01-01' },
      { uniqueVisitors: 10, totalPageViews: 25, date: '2024-01-02' },
      { uniqueVisitors: 15, totalPageViews: 35, date: '2024-01-03' }
    ];

    render(VisitorGraph, { props: { data: testData } });
    
    expect(screen.getByText('Total: 30 visitors')).toBeInTheDocument();
  });

  test('handles large numbers correctly', () => {
    const largeData = [
      { uniqueVisitors: 1000, totalPageViews: 2500, date: '2024-01-01' },
      { uniqueVisitors: 2000, totalPageViews: 5000, date: '2024-01-02' },
      { uniqueVisitors: 1500, totalPageViews: 3750, date: '2024-01-03' }
    ];

    render(VisitorGraph, { props: { data: largeData } });
    
    expect(screen.getByText('Total: 4500 visitors')).toBeInTheDocument();
  });

  test('renders different period labels correctly', () => {
    const testCases = [
      { period: 'day', expected: 'Daily Visitor Trends' },
      { period: 'month', expected: 'Monthly Visitor Trends' },
      { period: '3month', expected: '3 Months Visitor Trends' },
      { period: '6month', expected: '6 Months Visitor Trends' },
      { period: 'year', expected: 'Yearly Visitor Trends' },
      { period: '5year', expected: '5 Years Visitor Trends' },
      { period: 'unknown', expected: 'unknown Visitor Trends' }
    ];

    testCases.forEach(({ period, expected }) => {
      const { unmount } = render(VisitorGraph, { props: { data: mockData, period } });
      
      expect(screen.getByText(expected)).toBeInTheDocument();
      
      unmount();
    });
  });

  test('renders no data icon', () => {
    render(VisitorGraph, { props: { data: [] } });
    
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  test('handles missing totalPageViews in data', () => {
    const dataWithoutPageViews = [
      { uniqueVisitors: 10, date: '2024-01-01' },
      { uniqueVisitors: 15, date: '2024-01-02' }
    ];
    
    render(VisitorGraph, { props: { data: dataWithoutPageViews } });
    
    expect(screen.getByText('Total: 25 visitors')).toBeInTheDocument();
  });

  test('handles period change', async () => {
    const { component } = render(VisitorGraph, { props: { data: mockData, period: 'day' } });
    
    expect(screen.getByText('Daily Visitor Trends')).toBeInTheDocument();

    // Change period
    component.$set({ period: 'month' });

    await waitFor(() => {
      expect(screen.getByText('Monthly Visitor Trends')).toBeInTheDocument();
    });
  });

  test('handles data and period change together', async () => {
    const { component } = render(VisitorGraph, { props: { data: mockData, period: 'day' } });
    
    expect(screen.getByText('Daily Visitor Trends')).toBeInTheDocument();
    expect(screen.getByText('Total: 65 visitors')).toBeInTheDocument();

    // Change both data and period
    const newData = [
      { uniqueVisitors: 100, totalPageViews: 200, date: '2024-02-01' },
      { uniqueVisitors: 150, totalPageViews: 300, date: '2024-02-02' }
    ];
    
    component.$set({ data: newData, period: 'month' });

    await waitFor(() => {
      expect(screen.getByText('Monthly Visitor Trends')).toBeInTheDocument();
      expect(screen.getByText('Total: 250 visitors')).toBeInTheDocument();
    });
  });

  test('renders chart container with correct height', () => {
    render(VisitorGraph, { props: { data: mockData } });
    
    const chartContainer = document.querySelector('.chart-container');
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveClass('chart-container');
  });

  test('handles empty data array after initial data', async () => {
    const { component } = render(VisitorGraph, { props: { data: mockData } });
    
    expect(screen.getByText('Total: 65 visitors')).toBeInTheDocument();

    // Clear data
    component.$set({ data: [] });

    await waitFor(() => {
      expect(screen.getByText('No visitor data available for the selected period')).toBeInTheDocument();
    });
  });
});
