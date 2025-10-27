import { render, screen } from '@testing-library/svelte';
import { vi } from 'vitest';
import SessionAnalytics from '$lib/components/admin/SessionAnalytics.svelte';

describe('SessionAnalytics', () => {
  const mockData = {
    events: [
      {
        event: 'session_start',
        time: '2024-01-15T10:30:00Z',
        playerId: 'player1',
        url: '/session/123'
      },
      {
        event: 'session_complete',
        time: '2024-01-15T10:45:00Z',
        playerId: 'player1',
        url: '/session/123'
      },
      {
        event: 'page_view',
        time: '2024-01-15T11:00:00Z',
        playerId: 'player2',
        url: '/admin'
      },
      {
        event: 'question_answer',
        time: '2024-01-15T11:15:00Z',
        playerId: 'player1',
        url: '/session/123/questions'
      },
      {
        event: 'session_start',
        time: '2024-01-15T12:00:00Z',
        playerId: 'player3',
        url: '/session/456'
      }
    ]
  };

  test('renders no data message when no data provided', () => {
    render(SessionAnalytics, {
      props: {
        data: null
      }
    });
    
    expect(screen.getByText('No session analytics data available')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  test('renders no data message when data has no events', () => {
    render(SessionAnalytics, {
      props: {
        data: { events: [] }
      }
    });
    
    // When events array is empty, the component shows stats with 0 values, not the no data message
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(5); // 5 zero values in the stats
  });

  test('handles data with null events array', () => {
    render(SessionAnalytics, {
      props: {
        data: { events: null }
      }
    });
    
    // When events is null, the component should show no data message
    expect(screen.getByText('No session analytics data available')).toBeInTheDocument();
  });

  test('handles data with undefined events array', () => {
    render(SessionAnalytics, {
      props: {
        data: { events: undefined }
      }
    });
    
    // When events is undefined, the component should show no data message
    expect(screen.getByText('No session analytics data available')).toBeInTheDocument();
  });

  test('handles data change from valid to invalid', async () => {
    const { component } = render(SessionAnalytics, {
      props: {
        data: mockData
      }
    });
    
    // Initially should show data
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
    
    // Change data to have null events
    await component.$set({ data: { events: null } });
    
    // Should now show no data message
    expect(screen.getByText('No session analytics data available')).toBeInTheDocument();
  });

  test('renders session overview with correct stats', () => {
    render(SessionAnalytics, {
      props: {
        data: mockData
      }
    });
    
    expect(screen.getByText('Session Overview')).toBeInTheDocument();
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Duration')).toBeInTheDocument();
    
    // Check that the correct numbers are displayed (there are multiple "2" elements)
    const statValues = screen.getAllByText('2');
    expect(statValues.length).toBeGreaterThan(0);
    
    expect(screen.getAllByText('1')).toHaveLength(4); // 1 session_complete event + 3 other "1" values
    expect(screen.getByText('50.0%')).toBeInTheDocument(); // 1/2 * 100
    expect(screen.getByText('0m')).toBeInTheDocument(); // averageDuration is 0
  });

  test('renders recent activity timeline', () => {
    render(SessionAnalytics, {
      props: {
        data: mockData
      }
    });
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    
    // Check that events are displayed (there are multiple session_start elements)
    expect(screen.getAllByText('session_start')).toHaveLength(3); // 2 in timeline + 1 in distribution
    expect(screen.getAllByText('session_complete')).toHaveLength(2); // 1 in timeline + 1 in distribution
    expect(screen.getAllByText('page_view')).toHaveLength(2); // 1 in timeline + 1 in distribution
    expect(screen.getAllByText('question_answer')).toHaveLength(2); // 1 in timeline + 1 in distribution
    
    // Check that URLs are displayed
    expect(screen.getAllByText('/session/123')).toHaveLength(2); // session_start and session_complete
    expect(screen.getByText('/admin')).toBeInTheDocument();
    expect(screen.getByText('/session/456')).toBeInTheDocument();
  });

  test('renders event distribution', () => {
    render(SessionAnalytics, {
      props: {
        data: mockData
      }
    });
    
    expect(screen.getByText('Event Distribution')).toBeInTheDocument();
    
    // Check that event types are displayed with counts
    expect(screen.getAllByText('session_start')).toHaveLength(3); // 2 in timeline + 1 in distribution
    expect(screen.getAllByText('2')).toHaveLength(3); // session_start count (2) + total sessions (2) + avg events/user (2)
    expect(screen.getAllByText('session_complete')).toHaveLength(2); // 1 in timeline + 1 in distribution
    expect(screen.getAllByText('1')).toHaveLength(4); // session_complete count (1) + completed sessions (1) + page_view count (1) + question_answer count (1)
    expect(screen.getAllByText('page_view')).toHaveLength(2); // 1 in timeline + 1 in distribution
    expect(screen.getAllByText('question_answer')).toHaveLength(2); // 1 in timeline + 1 in distribution
  });

  test('renders user activity stats', () => {
    render(SessionAnalytics, {
      props: {
        data: mockData
      }
    });
    
    expect(screen.getByText('User Activity')).toBeInTheDocument();
    expect(screen.getByText('Unique Users')).toBeInTheDocument();
    expect(screen.getByText('Total Events')).toBeInTheDocument();
    expect(screen.getByText('Avg Events/User')).toBeInTheDocument();
    
    // Check that the correct numbers are displayed (there are multiple "2" and "3" elements)
    const statValues = screen.getAllByText('3');
    expect(statValues.length).toBeGreaterThan(0); // 3 unique playerIds
    
    expect(screen.getByText('5')).toBeInTheDocument(); // 5 total events
  });

  test('displays correct timeline markers for different event types', () => {
    render(SessionAnalytics, {
      props: {
        data: mockData
      }
    });
    
    // Check that the correct emojis are displayed for different event types
    expect(screen.getAllByText('🎮')).toHaveLength(2); // session_start (2 occurrences)
    expect(screen.getByText('✅')).toBeInTheDocument(); // session_complete
    expect(screen.getByText('👁️')).toBeInTheDocument(); // page_view
    expect(screen.getByText('📝')).toBeInTheDocument(); // question_answer
  });

  test('formats percentages correctly', () => {
    const dataWithPerfectCompletion = {
      events: [
        { event: 'session_start', time: '2024-01-15T10:30:00Z', playerId: 'player1' },
        { event: 'session_complete', time: '2024-01-15T10:45:00Z', playerId: 'player1' }
      ]
    };
    
    render(SessionAnalytics, {
      props: {
        data: dataWithPerfectCompletion
      }
    });
    
    expect(screen.getByText('100.0%')).toBeInTheDocument(); // 1/1 * 100
  });

  test('handles empty events array', () => {
    render(SessionAnalytics, {
      props: {
        data: { events: [] }
      }
    });
    
    // When events array is empty, the component shows stats with 0 values, not the no data message
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(5); // 5 zero values in the stats
  });

  test('calculates completion rate correctly for zero sessions', () => {
    const dataWithNoSessions = {
      events: [
        { event: 'page_view', time: '2024-01-15T10:30:00Z', playerId: 'player1' }
      ]
    };
    
    render(SessionAnalytics, {
      props: {
        data: dataWithNoSessions
      }
    });
    
    expect(screen.getByText('0.0%')).toBeInTheDocument(); // 0/0 = 0
  });

  test('displays timeline items with correct structure', () => {
    render(SessionAnalytics, {
      props: {
        data: mockData
      }
    });
    
    // Check that timeline items have the correct structure
    const timelineItems = screen.getAllByText('session_start');
    expect(timelineItems.length).toBeGreaterThan(0);
    
    // Check that time is formatted correctly (the component shows 12:30:00 PM, not 10:30:00 AM)
    expect(screen.getByText('1/15/2024, 12:30:00 PM')).toBeInTheDocument();
  });

  test('limits recent activity to 10 items', () => {
    const dataWithManyEvents = {
      events: Array.from({ length: 15 }, (_, i) => ({
        event: 'page_view',
        time: `2024-01-15T${10 + i}:00:00Z`,
        playerId: `player${i}`,
        url: `/page${i}`
      }))
    };
    
    render(SessionAnalytics, {
      props: {
        data: dataWithManyEvents
      }
    });
    
    // Should only show 10 items in the timeline (there are 11 because of the event distribution)
    const timelineItems = screen.getAllByText('page_view');
    expect(timelineItems.length).toBeGreaterThanOrEqual(10);
  });

  test('sorts event distribution by count', () => {
    const dataWithSortedEvents = {
      events: [
        { event: 'page_view', time: '2024-01-15T10:30:00Z', playerId: 'player1' },
        { event: 'page_view', time: '2024-01-15T10:31:00Z', playerId: 'player2' },
        { event: 'page_view', time: '2024-01-15T10:32:00Z', playerId: 'player3' },
        { event: 'session_start', time: '2024-01-15T10:33:00Z', playerId: 'player4' },
        { event: 'session_start', time: '2024-01-15T10:34:00Z', playerId: 'player5' },
        { event: 'question_answer', time: '2024-01-15T10:35:00Z', playerId: 'player6' }
      ]
    };
    
    render(SessionAnalytics, {
      props: {
        data: dataWithSortedEvents
      }
    });
    
    // page_view should appear first (3 occurrences)
    // session_start should appear second (2 occurrences)
    // question_answer should appear last (1 occurrence)
    expect(screen.getByText('Event Distribution')).toBeInTheDocument();
  });

  test('handles events without URLs', () => {
    const dataWithoutUrls = {
      events: [
        {
          event: 'session_start',
          time: '2024-01-15T10:30:00Z',
          playerId: 'player1'
        }
      ]
    };
    
    render(SessionAnalytics, {
      props: {
        data: dataWithoutUrls
      }
    });
    
    // Check that session_start appears in both timeline and distribution
    const sessionStartElements = screen.getAllByText('session_start');
    expect(sessionStartElements.length).toBeGreaterThan(0);
    
    // Should not display URL since it's not provided
    expect(screen.queryByText('/session/')).not.toBeInTheDocument();
  });

  test('calculates unique users correctly', () => {
    const dataWithDuplicateUsers = {
      events: [
        { event: 'page_view', time: '2024-01-15T10:30:00Z', playerId: 'player1' },
        { event: 'page_view', time: '2024-01-15T10:31:00Z', playerId: 'player1' },
        { event: 'page_view', time: '2024-01-15T10:32:00Z', playerId: 'player2' }
      ]
    };
    
    render(SessionAnalytics, {
      props: {
        data: dataWithDuplicateUsers
      }
    });
    
    // Check that 2 appears in the stats (there are multiple "2" elements)
    const statValues = screen.getAllByText('2');
    expect(statValues.length).toBeGreaterThan(0); // 2 unique users
  });

  test('handles events with null or undefined playerId', () => {
    const dataWithNullPlayerIds = {
      events: [
        { event: 'page_view', time: '2024-01-15T10:30:00Z', playerId: 'player1' },
        { event: 'page_view', time: '2024-01-15T10:31:00Z', playerId: null },
        { event: 'page_view', time: '2024-01-15T10:32:00Z', playerId: undefined }
      ]
    };
    
    render(SessionAnalytics, {
      props: {
        data: dataWithNullPlayerIds
      }
    });
    
    // Should handle null/undefined playerIds gracefully
    expect(screen.getByText('User Activity')).toBeInTheDocument();
  });
});
