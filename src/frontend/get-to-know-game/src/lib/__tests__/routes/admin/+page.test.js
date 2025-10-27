import { render, screen } from '@testing-library/svelte';
import { vi } from 'vitest';
import AdminDashboard from '../../../../routes/admin/+page.svelte';

// Mock the admin API
vi.mock('$lib/services/adminApi.js', () => ({
  adminApi: {
    getStats: vi.fn(),
    getVisitorStats: vi.fn()
  }
}));

describe('AdminDashboard', () => {
  test('renders page title and heading', () => {
    render(AdminDashboard);
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
  });

  test('renders refresh button', () => {
    render(AdminDashboard);
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(AdminDashboard);
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
  });

  test('renders page structure correctly', () => {
    render(AdminDashboard);
    
    // Check that the main page structure is rendered
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
  });

  test('has proper page title in head', () => {
    render(AdminDashboard);
    
    // Check that the page title is set correctly
    const titleElement = document.querySelector('title');
    expect(titleElement).toHaveTextContent('Admin Dashboard - Get to Know Game');
  });

  test('renders loading spinner in refresh button', () => {
    render(AdminDashboard);
    
    // Check that the refresh button contains loading elements
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toBeDisabled();
  });

  test('shows loading spinner in refresh button', () => {
    render(AdminDashboard);
    
    // Check that the refresh button contains loading elements
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toBeDisabled();
  });

  test('shows loading text in multiple places', () => {
    render(AdminDashboard);
    
    // Check that loading text appears in multiple places
    expect(screen.getAllByText('Loading...')).toHaveLength(2);
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
  });

  test('has proper CSS classes applied', () => {
    render(AdminDashboard);
    
    // Check that the main container has the correct class
    const dashboardPage = document.querySelector('.dashboard-page');
    expect(dashboardPage).toBeInTheDocument();
    
    const dashboardHeader = document.querySelector('.dashboard-header');
    expect(dashboardHeader).toBeInTheDocument();
    
    const loadingContainer = document.querySelector('.loading-container');
    expect(loadingContainer).toBeInTheDocument();
  });
});