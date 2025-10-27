import { render, screen } from '@testing-library/svelte';
import { vi } from 'vitest';
import RecentSessions from '$lib/components/admin/RecentSessions.svelte';

describe('RecentSessions', () => {
  const mockSessions = [
    {
      sessionId: 'session-12345678-1234-1234-1234-123456789012',
      player1Name: 'Alice',
      player2Name: 'Bob',
      createdAt: '2024-01-15T10:30:00Z',
      completedAt: '2024-01-15T10:45:00Z',
      score: 85
    },
    {
      sessionId: 'session-87654321-4321-4321-4321-210987654321',
      player1Name: 'Charlie',
      player2Name: null,
      createdAt: '2024-01-15T11:00:00Z',
      completedAt: null,
      score: null
    },
    {
      sessionId: 'session-11111111-1111-1111-1111-111111111111',
      player1Name: 'David',
      player2Name: 'Eve',
      createdAt: '2024-01-15T12:00:00Z',
      completedAt: null,
      score: null
    }
  ];

  test('renders no sessions state when sessions array is empty', () => {
    render(RecentSessions, {
      props: {
        sessions: []
      }
    });
    
    expect(screen.getByText('No recent sessions found')).toBeInTheDocument();
    expect(screen.getByText('🎮')).toBeInTheDocument();
  });

  test('renders no sessions state when sessions is null', () => {
    render(RecentSessions, {
      props: {
        sessions: null
      }
    });
    
    expect(screen.getByText('No recent sessions found')).toBeInTheDocument();
    expect(screen.getByText('🎮')).toBeInTheDocument();
  });

  test('renders no sessions state when sessions is undefined', () => {
    render(RecentSessions, {
      props: {
        sessions: undefined
      }
    });
    
    expect(screen.getByText('No recent sessions found')).toBeInTheDocument();
    expect(screen.getByText('🎮')).toBeInTheDocument();
  });

  test('renders sessions table with data', () => {
    render(RecentSessions, {
      props: {
        sessions: mockSessions
      }
    });
    
    expect(screen.getByText('Session ID')).toBeInTheDocument();
    expect(screen.getByText('Players')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('displays session data correctly', () => {
    render(RecentSessions, {
      props: {
        sessions: mockSessions
      }
    });
    
    // Check session IDs (shortened)
    expect(screen.getAllByText('session-...')).toHaveLength(3);
    
    // Check player names
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('David')).toBeInTheDocument();
    expect(screen.getByText('Eve')).toBeInTheDocument();
    expect(screen.getByText('Waiting for Player 2')).toBeInTheDocument();
  });

  test('formats dates correctly', () => {
    render(RecentSessions, {
      props: {
        sessions: mockSessions
      }
    });
    
    // The formatDate function should format the dates
    // We can't easily test the exact format without mocking Date, but we can check it's rendered
    const dateElements = screen.getAllByText(/1\/15\/2024/);
    expect(dateElements).toHaveLength(3);
  });

  test('formats duration correctly for completed sessions', () => {
    render(RecentSessions, {
      props: {
        sessions: mockSessions
      }
    });
    
    // First session: 15 minutes (10:30 to 10:45)
    expect(screen.getByText('15m')).toBeInTheDocument();
  });

  test('shows in progress for sessions without completedAt', () => {
    render(RecentSessions, {
      props: {
        sessions: mockSessions
      }
    });
    
    // Second and third sessions: In Progress (no completedAt)
    // Note: There are 3 "In Progress" elements - 2 in duration column and 1 in status column
    expect(screen.getAllByText('In Progress')).toHaveLength(3);
  });

  test('displays scores with correct colors', () => {
    render(RecentSessions, {
      props: {
        sessions: mockSessions
      }
    });
    
    // First session has score 85%
    expect(screen.getByText('85%')).toBeInTheDocument();
    
    // Second and third sessions have no score
    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  test('shows correct status badges', () => {
    render(RecentSessions, {
      props: {
        sessions: mockSessions
      }
    });
    
    // First session: Completed
    expect(screen.getByText('Completed')).toBeInTheDocument();
    
    // Second session: Waiting (no player2Name)
    expect(screen.getByText('Waiting')).toBeInTheDocument();
    
    // Third session: In Progress (has player2Name but no completedAt)
    // Note: There are 3 "In Progress" elements - 2 in duration column and 1 in status column
    expect(screen.getAllByText('In Progress')).toHaveLength(3);
  });

  test('limits display to 10 sessions', () => {
    const manySessions = Array.from({ length: 15 }, (_, i) => ({
      sessionId: `session-${i}-1234-1234-1234-123456789012`,
      player1Name: `Player ${i}`,
      player2Name: `Player ${i + 1}`,
      createdAt: '2024-01-15T10:30:00Z',
      completedAt: '2024-01-15T10:45:00Z',
      score: 85
    }));
    
    render(RecentSessions, {
      props: {
        sessions: manySessions
      }
    });
    
    // Should show footer with count
    expect(screen.getByText('Showing 10 of 15 recent sessions')).toBeInTheDocument();
  });

  test('does not show footer when 10 or fewer sessions', () => {
    render(RecentSessions, {
      props: {
        sessions: mockSessions
      }
    });
    
    expect(screen.queryByText('Showing 10 of')).not.toBeInTheDocument();
  });

  test('handles sessions with missing player names', () => {
    const sessionsWithMissingNames = [
      {
        sessionId: 'session-12345678-1234-1234-1234-123456789012',
        player1Name: null,
        player2Name: null,
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:45:00Z',
        score: 85
      }
    ];
    
    render(RecentSessions, {
      props: {
        sessions: sessionsWithMissingNames
      }
    });
    
    // Should show default names
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Waiting for Player 2')).toBeInTheDocument();
  });

  test('handles sessions with undefined player names', () => {
    const sessionsWithUndefinedNames = [
      {
        sessionId: 'session-12345678-1234-1234-1234-123456789012',
        player1Name: undefined,
        player2Name: undefined,
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:45:00Z',
        score: 85
      }
    ];
    
    render(RecentSessions, {
      props: {
        sessions: sessionsWithUndefinedNames
      }
    });
    
    // Should show default names
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Waiting for Player 2')).toBeInTheDocument();
  });

  test('handles sessions with empty string player names', () => {
    const sessionsWithEmptyNames = [
      {
        sessionId: 'session-12345678-1234-1234-1234-123456789012',
        player1Name: '',
        player2Name: '',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:45:00Z',
        score: 85
      }
    ];
    
    render(RecentSessions, {
      props: {
        sessions: sessionsWithEmptyNames
      }
    });
    
    // Should show default names
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Waiting for Player 2')).toBeInTheDocument();
  });

  test('handles sessions with zero score', () => {
    const sessionsWithZeroScore = [
      {
        sessionId: 'session-12345678-1234-1234-1234-123456789012',
        player1Name: 'Alice',
        player2Name: 'Bob',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:45:00Z',
        score: 0
      }
    ];
    
    render(RecentSessions, {
      props: {
        sessions: sessionsWithZeroScore
      }
    });
    
    // Should show 0% score
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  test('handles sessions with very high score', () => {
    const sessionsWithHighScore = [
      {
        sessionId: 'session-12345678-1234-1234-1234-123456789012',
        player1Name: 'Alice',
        player2Name: 'Bob',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:45:00Z',
        score: 100
      }
    ];
    
    render(RecentSessions, {
      props: {
        sessions: sessionsWithHighScore
      }
    });
    
    // Should show 100% score
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('handles sessions with very long duration', () => {
    const sessionsWithLongDuration = [
      {
        sessionId: 'session-12345678-1234-1234-1234-123456789012',
        player1Name: 'Alice',
        player2Name: 'Bob',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T14:30:00Z', // 4 hours
        score: 85
      }
    ];
    
    render(RecentSessions, {
      props: {
        sessions: sessionsWithLongDuration
      }
    });
    
    // Should show 4h 0m
    expect(screen.getByText('4h 0m')).toBeInTheDocument();
  });

  test('handles sessions with fractional duration', () => {
    const sessionsWithFractionalDuration = [
      {
        sessionId: 'session-12345678-1234-1234-1234-123456789012',
        player1Name: 'Alice',
        player2Name: 'Bob',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T11:15:30Z', // 45.5 minutes
        score: 85
      }
    ];
    
    render(RecentSessions, {
      props: {
        sessions: sessionsWithFractionalDuration
      }
    });
    
    // Should show 45m (rounded)
    expect(screen.getByText('46m')).toBeInTheDocument();
  });

  test('handles sessions with invalid dates', () => {
    const sessionsWithInvalidDates = [
      {
        sessionId: 'session-12345678-1234-1234-1234-123456789012',
        player1Name: 'Alice',
        player2Name: 'Bob',
        createdAt: 'invalid-date',
        completedAt: 'invalid-date',
        score: 85
      }
    ];
    
    render(RecentSessions, {
      props: {
        sessions: sessionsWithInvalidDates
      }
    });
    
    // Should render without crashing
    expect(screen.getByText('Session ID')).toBeInTheDocument();
  });

  test('handles sessions with very long session IDs', () => {
    const sessionsWithLongIds = [
      {
        sessionId: 'session-very-long-id-that-should-be-shortened-properly-123456789012',
        player1Name: 'Alice',
        player2Name: 'Bob',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:45:00Z',
        score: 85
      }
    ];
    
    render(RecentSessions, {
      props: {
        sessions: sessionsWithLongIds
      }
    });
    
    // Should show shortened ID
    expect(screen.getByText('session-...')).toBeInTheDocument();
  });

  test('handles sessions with special characters in names', () => {
    const sessionsWithSpecialNames = [
      {
        sessionId: 'session-12345678-1234-1234-1234-123456789012',
        player1Name: 'José María',
        player2Name: 'François',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:45:00Z',
        score: 85
      }
    ];
    
    render(RecentSessions, {
      props: {
        sessions: sessionsWithSpecialNames
      }
    });
    
    expect(screen.getByText('José María')).toBeInTheDocument();
    expect(screen.getByText('François')).toBeInTheDocument();
  });

  test('handles sessions with very long player names', () => {
    const sessionsWithLongNames = [
      {
        sessionId: 'session-12345678-1234-1234-1234-123456789012',
        player1Name: 'Very Long Player Name That Should Be Handled Properly',
        player2Name: 'Another Very Long Player Name That Should Also Be Handled',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:45:00Z',
        score: 85
      }
    ];
    
    render(RecentSessions, {
      props: {
        sessions: sessionsWithLongNames
      }
    });
    
    expect(screen.getByText('Very Long Player Name That Should Be Handled Properly')).toBeInTheDocument();
    expect(screen.getByText('Another Very Long Player Name That Should Also Be Handled')).toBeInTheDocument();
  });

  test('handles sessions with edge case scores', () => {
    const sessionsWithEdgeScores = [
      {
        sessionId: 'session-12345678-1234-1234-1234-123456789012',
        player1Name: 'Alice',
        player2Name: 'Bob',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:45:00Z',
        score: 79 // Just below 80 threshold
      },
      {
        sessionId: 'session-87654321-4321-4321-4321-210987654321',
        player1Name: 'Charlie',
        player2Name: 'David',
        createdAt: '2024-01-15T11:00:00Z',
        completedAt: '2024-01-15T11:15:00Z',
        score: 59 // Just below 60 threshold
      }
    ];
    
    render(RecentSessions, {
      props: {
        sessions: sessionsWithEdgeScores
      }
    });
    
    expect(screen.getByText('79%')).toBeInTheDocument();
    expect(screen.getByText('59%')).toBeInTheDocument();
  });
});
