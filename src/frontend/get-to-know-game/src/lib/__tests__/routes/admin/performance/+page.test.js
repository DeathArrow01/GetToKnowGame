import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import PerformancePage from '../../../../../routes/admin/performance/+page.svelte';

// Mock the adminApi module
vi.mock('$lib/services/adminApi.js', () => ({
  adminApi: {
    getPerformanceMetrics: vi.fn()
  }
}));

// Import the mocked adminApi
import { adminApi } from '$lib/services/adminApi.js';

describe('PerformancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders page title and controls', () => {
    render(PerformancePage);
    
    expect(screen.getByText('Performance Monitoring')).toBeInTheDocument();
    expect(screen.getByText('Auto Refresh')).toBeInTheDocument();
    expect(screen.getAllByText(/Refresh/i)).toHaveLength(2); // "Auto Refresh" and "Refresh" button
  });

  test('renders basic page structure', () => {
    render(PerformancePage);
    
    // Check that the component renders the basic structure
    expect(screen.getByText('Performance Monitoring')).toBeInTheDocument();
    expect(screen.getByText('Auto Refresh')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('handles auto refresh toggle', () => {
    render(PerformancePage);
    
    // Toggle auto refresh off
    const autoRefreshCheckbox = screen.getByRole('checkbox');
    fireEvent.click(autoRefreshCheckbox);
    
    // Check that the checkbox is unchecked
    expect(autoRefreshCheckbox).not.toBeChecked();
  });

  test('handles refresh button click', () => {
    render(PerformancePage);
    
    // Click refresh button (get the button, not the label)
    const refreshButton = screen.getAllByText(/Refresh/i)[1];
    fireEvent.click(refreshButton);
    
    // The component should handle the click without crashing
    expect(screen.getByText('Performance Monitoring')).toBeInTheDocument();
  });

  test('renders with mocked data', () => {
    const mockPerformanceData = {
      systemHealth: 'healthy',
      databaseStatus: 'healthy',
      lastUpdated: '2023-01-01T00:00:00Z',
      responseTime: 150,
      errorRate: 0.02,
      requestCount: 1000,
      activeUsers: 25,
      memoryUsage: 65,
      cpuUsage: 45
    };
    
    adminApi.getPerformanceMetrics.mockResolvedValue(mockPerformanceData);
    
    render(PerformancePage);
    
    // Check that the component renders the basic structure
    expect(screen.getByText('Performance Monitoring')).toBeInTheDocument();
    expect(screen.getByText('Auto Refresh')).toBeInTheDocument();
  });

  test('handles error state gracefully', () => {
    adminApi.getPerformanceMetrics.mockRejectedValue(new Error('Network error'));
    
    render(PerformancePage);
    
    // The component should handle the error gracefully
    expect(screen.getByText('Performance Monitoring')).toBeInTheDocument();
  });

  test('handles missing data gracefully', () => {
    const mockPerformanceData = {
      systemHealth: null,
      databaseStatus: undefined,
      lastUpdated: null,
      responseTime: null,
      errorRate: null,
      requestCount: null,
      activeUsers: null,
      memoryUsage: null,
      cpuUsage: null
    };
    
    adminApi.getPerformanceMetrics.mockResolvedValue(mockPerformanceData);
    
    render(PerformancePage);
    
    // The component should render without crashing
    expect(screen.getByText('Performance Monitoring')).toBeInTheDocument();
  });

  test('handles empty endpoint metrics', () => {
    const mockPerformanceData = {
      systemHealth: 'healthy',
      databaseStatus: 'healthy',
      lastUpdated: '2023-01-01T00:00:00Z',
      responseTime: 150,
      errorRate: 0.02,
      requestCount: 1000,
      activeUsers: 25,
      memoryUsage: 65,
      cpuUsage: 45,
      endpointMetrics: {}
    };
    
    adminApi.getPerformanceMetrics.mockResolvedValue(mockPerformanceData);
    
    render(PerformancePage);
    
    // The component should render without crashing
    expect(screen.getByText('Performance Monitoring')).toBeInTheDocument();
  });

  test('handles null endpoint metrics', () => {
    const mockPerformanceData = {
      systemHealth: 'healthy',
      databaseStatus: 'healthy',
      lastUpdated: '2023-01-01T00:00:00Z',
      responseTime: 150,
      errorRate: 0.02,
      requestCount: 1000,
      activeUsers: 25,
      memoryUsage: 65,
      cpuUsage: 45,
      endpointMetrics: null
    };
    
    adminApi.getPerformanceMetrics.mockResolvedValue(mockPerformanceData);
    
    render(PerformancePage);
    
    // The component should render without crashing
    expect(screen.getByText('Performance Monitoring')).toBeInTheDocument();
  });
});