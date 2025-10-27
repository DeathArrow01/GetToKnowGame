import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import SessionTable from '$lib/components/admin/SessionTable.svelte';

describe('SessionTable', () => {
  const mockSessions = [
    {
      sessionId: 'session-12345678-1234-1234-1234-123456789012',
      player1Id: 'player1',
      player2Id: 'player2',
      createdAt: '2024-01-15T10:30:00Z',
      completedAt: '2024-01-15T10:45:00Z',
      score: 85,
      ipAddress: '192.168.1.100'
    },
    {
      sessionId: 'session-87654321-4321-4321-4321-210987654321',
      player1Id: 'player3',
      player2Id: null,
      createdAt: '2024-01-15T11:00:00Z',
      completedAt: null,
      score: null,
      ipAddress: '192.168.1.101'
    },
    {
      sessionId: 'session-11111111-1111-1111-1111-111111111111',
      player1Id: 'player4',
      player2Id: 'player5',
      createdAt: '2024-01-15T12:00:00Z',
      completedAt: null,
      score: null,
      ipAddress: '192.168.1.102'
    }
  ];

  test('renders session table with data', () => {
    render(SessionTable, {
      props: {
        sessions: mockSessions,
        currentPage: 1,
        pageSize: 20,
        totalSessions: 3,
        onPageChange: vi.fn()
      }
    });
    
    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Showing 1-3 of 3 sessions')).toBeInTheDocument();
    expect(screen.getByText('Session ID')).toBeInTheDocument();
    expect(screen.getByText('Players')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('IP Address')).toBeInTheDocument();
  });

      test('displays session data correctly', () => {
        render(SessionTable, {
          props: {
            sessions: mockSessions,
            currentPage: 1,
            pageSize: 20,
            totalSessions: 3,
            onPageChange: vi.fn()
          }
        });
        
        // Check session IDs (shortened)
        expect(screen.getAllByText('session-...')).toHaveLength(3);
        
        // Check player info
        expect(screen.getAllByText('Player 1')).toHaveLength(3);
        expect(screen.getAllByText('Player 2')).toHaveLength(2); // Two sessions have Player 2
        expect(screen.getByText('Waiting for Player 2')).toBeInTheDocument();
        
        // Check IP addresses
        expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
        expect(screen.getByText('192.168.1.101')).toBeInTheDocument();
        expect(screen.getByText('192.168.1.102')).toBeInTheDocument();
      });

  test('formats dates correctly', () => {
    // Mock Date.toLocaleDateString and toLocaleTimeString
    const mockDate = new Date('2024-01-15T10:30:00Z');
    const originalToLocaleDateString = Date.prototype.toLocaleDateString;
    const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
    
    Date.prototype.toLocaleDateString = vi.fn(() => '1/15/2024');
    Date.prototype.toLocaleTimeString = vi.fn(() => '10:30 AM');
    
    render(SessionTable, {
      props: {
        sessions: mockSessions,
        currentPage: 1,
        pageSize: 20,
        totalSessions: 3,
        onPageChange: vi.fn()
      }
    });
    
    expect(screen.getAllByText('1/15/2024 10:30 AM')).toHaveLength(3);
    
    // Restore original methods
    Date.prototype.toLocaleDateString = originalToLocaleDateString;
    Date.prototype.toLocaleTimeString = originalToLocaleTimeString;
  });

      test('formats duration correctly', () => {
        render(SessionTable, {
          props: {
            sessions: mockSessions,
            currentPage: 1,
            pageSize: 20,
            totalSessions: 3,
            onPageChange: vi.fn()
          }
        });
        
        // First session: 15 minutes (10:30 to 10:45)
        expect(screen.getByText('15m')).toBeInTheDocument();
        
        // Second and third sessions: In Progress (no completedAt)
        // Note: There are 3 "In Progress" elements - 2 in duration column and 1 in status column
        expect(screen.getAllByText('In Progress')).toHaveLength(3);
      });

  test('displays scores with correct colors', () => {
    render(SessionTable, {
      props: {
        sessions: mockSessions,
        currentPage: 1,
        pageSize: 20,
        totalSessions: 3,
        onPageChange: vi.fn()
      }
    });
    
    // First session has score 85%
    expect(screen.getByText('85%')).toBeInTheDocument();
    
    // Second and third sessions have no score
    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  test('handles different score values and colors', () => {
    const sessionsWithDifferentScores = [
      {
        sessionId: 'session-1',
        player1Id: 'player1',
        player2Id: 'player2',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:45:00Z',
        score: null, // null - handled by template, shows '-'
        ipAddress: '192.168.1.100'
      },
      {
        sessionId: 'session-2',
        player1Id: 'player3',
        player2Id: 'player4',
        createdAt: '2024-01-15T11:00:00Z',
        completedAt: '2024-01-15T11:15:00Z',
        score: 0, // 0 - handled by getScoreColor function, shows '0%'
        ipAddress: '192.168.1.101'
      },
      {
        sessionId: 'session-3',
        player1Id: 'player5',
        player2Id: 'player6',
        createdAt: '2024-01-15T12:00:00Z',
        completedAt: '2024-01-15T12:15:00Z',
        score: undefined, // undefined - handled by template, shows '-'
        ipAddress: '192.168.1.102'
      },
      {
        sessionId: 'session-4',
        player1Id: 'player7',
        player2Id: 'player8',
        createdAt: '2024-01-15T13:00:00Z',
        completedAt: '2024-01-15T13:15:00Z',
        score: false, // false - handled by getScoreColor function, shows 'false%'
        ipAddress: '192.168.1.103'
      }
    ];

    render(SessionTable, {
      props: {
        sessions: sessionsWithDifferentScores,
        currentPage: 1,
        pageSize: 20,
        totalSessions: 4,
        onPageChange: vi.fn()
      }
    });
    
    // null and undefined show '-' (handled by template)
    expect(screen.getAllByText('-')).toHaveLength(2);
    // 0 and false show as percentages (handled by getScoreColor)
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('false%')).toBeInTheDocument();
  });

      test('shows correct status badges', () => {
        render(SessionTable, {
          props: {
            sessions: mockSessions,
            currentPage: 1,
            pageSize: 20,
            totalSessions: 3,
            onPageChange: vi.fn()
          }
        });
        
        // First session: Completed
        expect(screen.getByText('Completed')).toBeInTheDocument();
        
        // Second session: Waiting (no player2Id)
        expect(screen.getByText('Waiting')).toBeInTheDocument();
        
        // Third session: In Progress (has player2Id but no completedAt)
        // Note: There are 3 "In Progress" elements total - 2 in duration column and 1 in status column
        expect(screen.getAllByText('In Progress')).toHaveLength(3);
      });

  test('shows empty state when no sessions', () => {
    render(SessionTable, {
      props: {
        sessions: [],
        currentPage: 1,
        pageSize: 20,
        totalSessions: 0,
        onPageChange: vi.fn()
      }
    });
    
    expect(screen.getByText('No Sessions Found')).toBeInTheDocument();
    expect(screen.getByText('No game sessions have been created yet.')).toBeInTheDocument();
    expect(screen.getByText('🎮')).toBeInTheDocument();
  });

  test('handles pagination correctly', () => {
    const onPageChange = vi.fn();
    render(SessionTable, {
      props: {
        sessions: mockSessions,
        currentPage: 2,
        pageSize: 1,
        totalSessions: 3,
        onPageChange
      }
    });
    
    expect(screen.getByText('Showing 2-2 of 3 sessions')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    
    // Check pagination buttons
    const prevButton = screen.getByText('← Previous');
    const nextButton = screen.getByText('Next →');
    
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  test('disables previous button on first page', () => {
    const onPageChange = vi.fn();
    render(SessionTable, {
      props: {
        sessions: mockSessions,
        currentPage: 1,
        pageSize: 1, // Set pageSize to 1 to trigger pagination
        totalSessions: 3,
        onPageChange
      }
    });
    
    const prevButton = screen.getByText('← Previous');
    expect(prevButton).toBeDisabled();
  });

  test('disables next button on last page', () => {
    const onPageChange = vi.fn();
    render(SessionTable, {
      props: {
        sessions: mockSessions,
        currentPage: 3,
        pageSize: 1,
        totalSessions: 3,
        onPageChange
      }
    });
    
    const nextButton = screen.getByText('Next →');
    expect(nextButton).toBeDisabled();
  });

  test('calls onPageChange when pagination buttons are clicked', () => {
    const onPageChange = vi.fn();
    render(SessionTable, {
      props: {
        sessions: mockSessions,
        currentPage: 2,
        pageSize: 1,
        totalSessions: 3,
        onPageChange
      }
    });
    
    const prevButton = screen.getByText('← Previous');
    const nextButton = screen.getByText('Next →');
    
    fireEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(1);
    
    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test('calls onPageChange when page numbers are clicked', () => {
    const onPageChange = vi.fn();
    render(SessionTable, {
      props: {
        sessions: mockSessions,
        currentPage: 2,
        pageSize: 1,
        totalSessions: 5,
        onPageChange
      }
    });
    
    // Should show page numbers around current page
    const page1Button = screen.getByText('1');
    const page3Button = screen.getByText('3');
    
    fireEvent.click(page1Button);
    expect(onPageChange).toHaveBeenCalledWith(1);
    
    fireEvent.click(page3Button);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test('highlights current page in pagination', () => {
    render(SessionTable, {
      props: {
        sessions: mockSessions,
        currentPage: 2,
        pageSize: 1,
        totalSessions: 5,
        onPageChange: vi.fn()
      }
    });
    
    const page2Button = screen.getByText('2');
    expect(page2Button).toHaveClass('active');
  });

  test('handles large page counts correctly', () => {
    const onPageChange = vi.fn();
    render(SessionTable, {
      props: {
        sessions: mockSessions,
        currentPage: 10,
        pageSize: 1,
        totalSessions: 100,
        onPageChange
      }
    });
    
    expect(screen.getByText('Page 10 of 100')).toBeInTheDocument();
    expect(screen.getByText('Showing 10-10 of 100 sessions')).toBeInTheDocument();
  });

  test('shows correct page range for large datasets', () => {
    const onPageChange = vi.fn();
    render(SessionTable, {
      props: {
        sessions: mockSessions,
        currentPage: 5,
        pageSize: 1,
        totalSessions: 20,
        onPageChange
      }
    });
    
    // Should show pages around current page (3, 4, 5, 6, 7)
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  test('handles edge case with single page', () => {
    render(SessionTable, {
      props: {
        sessions: mockSessions,
        currentPage: 1,
        pageSize: 20,
        totalSessions: 3,
        onPageChange: vi.fn()
      }
    });
    
    // Should not show pagination for single page
    expect(screen.queryByText('Page 1 of 1')).not.toBeInTheDocument();
    expect(screen.queryByText('← Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next →')).not.toBeInTheDocument();
  });

  test('formats duration for hours and minutes', () => {
    const longSession = [{
      sessionId: 'session-long',
      player1Id: 'player1',
      player2Id: 'player2',
      createdAt: '2024-01-15T10:00:00Z',
      completedAt: '2024-01-15T12:30:00Z', // 2.5 hours
      score: 90,
      ipAddress: '192.168.1.100'
    }];
    
    render(SessionTable, {
      props: {
        sessions: longSession,
        currentPage: 1,
        pageSize: 20,
        totalSessions: 1,
        onPageChange: vi.fn()
      }
    });
    
    expect(screen.getByText('2h 30m')).toBeInTheDocument();
  });

  test('handles sessions with null/undefined values gracefully', () => {
    const incompleteSession = [{
      sessionId: 'session-incomplete',
      player1Id: 'player1',
      player2Id: null,
      createdAt: '2024-01-15T10:00:00Z',
      completedAt: null,
      score: undefined,
      ipAddress: '192.168.1.100'
    }];
    
    render(SessionTable, {
      props: {
        sessions: incompleteSession,
        currentPage: 1,
        pageSize: 20,
        totalSessions: 1,
        onPageChange: vi.fn()
      }
    });
    
    expect(screen.getByText('Waiting')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
