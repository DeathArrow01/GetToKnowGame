import { render, screen } from '@testing-library/svelte';
import { vi } from 'vitest';
import StatsCards from '$lib/components/admin/StatsCards.svelte';

describe('StatsCards', () => {
  test('renders stats cards with data', () => {
    const mockStats = {
      totalPlayers: 100,
      totalSessions: 50,
      completedSessions: 30,
      averageScore: 75.5,
      uniqueVisitors: 200,
      totalPageViews: 500
    };

    render(StatsCards, { props: { stats: mockStats } });
    
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('75.5')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  test('shows zero values for empty stats', () => {
    const mockStats = {
      totalPlayers: 0,
      totalSessions: 0,
      completedSessions: 0,
      averageScore: 0,
      uniqueVisitors: 0,
      totalPageViews: 0
    };

    render(StatsCards, { props: { stats: mockStats } });
    
    // Check for specific stat values
    expect(screen.getByText('Total Players')).toBeInTheDocument();
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
    expect(screen.getByText('Completed Sessions')).toBeInTheDocument();
    expect(screen.getByText('Average Score')).toBeInTheDocument();
    expect(screen.getByText('Unique Visitors')).toBeInTheDocument();
    expect(screen.getByText('Page Views')).toBeInTheDocument();
  });

  test('handles null stats gracefully', () => {
    const mockStats = {
      totalPlayers: 0,
      totalSessions: 0,
      completedSessions: 0,
      averageScore: 0,
      uniqueVisitors: 0,
      totalPageViews: 0
    };

    render(StatsCards, { props: { stats: mockStats } });
    
    // Should not crash and show some default values
    expect(screen.getByText('Total Players')).toBeInTheDocument();
  });

  test('formats large numbers correctly', () => {
    const mockStats = {
      totalPlayers: 1500000, // Should show as 1.5M
      totalSessions: 2500,   // Should show as 2.5K
      completedSessions: 150000, // Should show as 150.0K
      averageScore: 85.7,
      uniqueVisitors: 500000, // Should show as 500.0K
      totalPageViews: 1000000 // Should show as 1.0M
    };

    render(StatsCards, { props: { stats: mockStats } });
    
    expect(screen.getByText('1.5M')).toBeInTheDocument();
    expect(screen.getByText('2.5K')).toBeInTheDocument();
    expect(screen.getByText('150.0K')).toBeInTheDocument();
    expect(screen.getByText('500.0K')).toBeInTheDocument();
    expect(screen.getByText('1.0M')).toBeInTheDocument();
  });

  test('handles averageScore when undefined', () => {
    const mockStats = {
      totalPlayers: 100,
      totalSessions: 50,
      completedSessions: 30,
      averageScore: undefined, // Should show as '0'
      uniqueVisitors: 200,
      totalPageViews: 500
    };

    render(StatsCards, { props: { stats: mockStats } });
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
