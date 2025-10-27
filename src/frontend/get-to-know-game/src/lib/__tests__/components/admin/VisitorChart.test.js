import { render, screen, waitFor } from '@testing-library/svelte';
import { vi } from 'vitest';
import VisitorChart from '$lib/components/admin/VisitorChart.svelte';

describe('VisitorChart', () => {
  const mockData = [
    { uniqueVisitors: 10, date: '2024-01-01' },
    { uniqueVisitors: 15, date: '2024-01-02' },
    { uniqueVisitors: 8, date: '2024-01-03' },
    { uniqueVisitors: 20, date: '2024-01-04' },
    { uniqueVisitors: 12, date: '2024-01-05' }
  ];

  test('renders no data message when no data provided', () => {
    render(VisitorChart, { props: { data: null } });
    
    expect(screen.getByText('No visitor data available')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  test('renders no data message when data is empty array', () => {
    render(VisitorChart, { props: { data: [] } });
    
    expect(screen.getByText('No visitor data available')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  test('renders chart header with correct information', () => {
    render(VisitorChart, { props: { data: mockData } });
    
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    expect(screen.getByText('Total: 65 visitors')).toBeInTheDocument();
  });

  test('renders chart container when data is provided', () => {
    render(VisitorChart, { props: { data: mockData } });
    
    const chartContainer = document.querySelector('.chart-container');
    expect(chartContainer).toBeInTheDocument();
  });

  test('renders chart container when data is provided', () => {
    render(VisitorChart, { props: { data: mockData } });
    
    const chartContainer = document.querySelector('.chart-container');
    expect(chartContainer).toBeInTheDocument();
  });

  test('renders chart header with correct information', () => {
    render(VisitorChart, { props: { data: mockData } });
    
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    expect(screen.getByText('Total: 65 visitors')).toBeInTheDocument();
  });

  test('handles single data point', () => {
    const singleData = [{ uniqueVisitors: 10, date: '2024-01-01' }];
    
    render(VisitorChart, { props: { data: singleData } });
    
    expect(screen.getByText('Total: 10 visitors')).toBeInTheDocument();
  });

  test('handles data with zero visitors', () => {
    const zeroData = [
      { uniqueVisitors: 0, date: '2024-01-01' },
      { uniqueVisitors: 0, date: '2024-01-02' }
    ];
    
    render(VisitorChart, { props: { data: zeroData } });
    
    expect(screen.getByText('Total: 0 visitors')).toBeInTheDocument();
  });

  test('handles data with same values', () => {
    const sameData = [
      { uniqueVisitors: 10, date: '2024-01-01' },
      { uniqueVisitors: 10, date: '2024-01-02' },
      { uniqueVisitors: 10, date: '2024-01-03' }
    ];
    
    render(VisitorChart, { props: { data: sameData } });
    
    expect(screen.getByText('Total: 30 visitors')).toBeInTheDocument();
  });

  test('handles data with identical values triggering range fallback', async () => {
    const identicalData = [
      { uniqueVisitors: 5, date: '2024-01-01' },
      { uniqueVisitors: 5, date: '2024-01-02' },
      { uniqueVisitors: 5, date: '2024-01-03' },
      { uniqueVisitors: 5, date: '2024-01-04' }
    ];
    
    const { component } = render(VisitorChart, { props: { data: identicalData } });
    
    // Wait for the component to process the data
    await waitFor(() => {
      expect(screen.getByText('Total: 20 visitors')).toBeInTheDocument();
    });
    
    // The chart should still render even with identical values
    const chartContainer = document.querySelector('.chart-container');
    expect(chartContainer).toBeInTheDocument();
  });

  test('handles edge case with single data point', () => {
    const singleData = [
      { uniqueVisitors: 10, date: '2024-01-01' }
    ];
    
    render(VisitorChart, { props: { data: singleData } });
    
    expect(screen.getByText('Total: 10 visitors')).toBeInTheDocument();
    const chartContainer = document.querySelector('.chart-container');
    expect(chartContainer).toBeInTheDocument();
  });

  test('updates chart when data changes', async () => {
    const { component } = render(VisitorChart, { props: { data: mockData } });
    
    expect(screen.getByText('Total: 65 visitors')).toBeInTheDocument();

    // Update data
    const newData = [
      { uniqueVisitors: 25, date: '2024-01-06' },
      { uniqueVisitors: 30, date: '2024-01-07' }
    ];
    
    component.$set({ data: newData });

    await waitFor(() => {
      expect(screen.getByText('Total: 55 visitors')).toBeInTheDocument();
    });
  });

  test('calculates total visitors correctly', () => {
    const testData = [
      { uniqueVisitors: 5, date: '2024-01-01' },
      { uniqueVisitors: 10, date: '2024-01-02' },
      { uniqueVisitors: 15, date: '2024-01-03' }
    ];

    render(VisitorChart, { props: { data: testData } });
    
    expect(screen.getByText('Total: 30 visitors')).toBeInTheDocument();
  });

  test('handles large numbers correctly', () => {
    const largeData = [
      { uniqueVisitors: 1000, date: '2024-01-01' },
      { uniqueVisitors: 2000, date: '2024-01-02' },
      { uniqueVisitors: 1500, date: '2024-01-03' }
    ];

    render(VisitorChart, { props: { data: largeData } });
    
    expect(screen.getByText('Total: 4500 visitors')).toBeInTheDocument();
  });

  test('renders chart period text', () => {
    render(VisitorChart, { props: { data: mockData } });
    
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
  });

  test('renders no data icon', () => {
    render(VisitorChart, { props: { data: [] } });
    
    expect(screen.getByText('📊')).toBeInTheDocument();
  });
});
