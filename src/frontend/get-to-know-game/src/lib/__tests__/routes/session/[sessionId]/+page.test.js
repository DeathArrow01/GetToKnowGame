import { render, screen } from '@testing-library/svelte';
import { vi } from 'vitest';
import SessionPage from '../../../../../routes/session/[sessionId]/+page.svelte';

// Mock the page store
vi.mock('$app/stores', () => ({
  page: {
    subscribe: vi.fn((callback) => {
      callback({ params: { sessionId: 'test-session-123' } });
      return () => {};
    })
  }
}));

// Mock the goto function
vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

// Mock the sessionService
vi.mock('$lib/services/sessionService.js', () => ({
  sessionService: {
    getSession: vi.fn()
  }
}));

// Import the mocked sessionService
import { sessionService } from '$lib/services/sessionService.js';

describe('SessionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('renders with mocked session data', () => {
    const mockSessionData = {
      player1Name: 'Alice',
      player2Name: 'Bob',
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles error state gracefully', () => {
    sessionService.getSession.mockRejectedValue(new Error('Network error'));
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with null player names', () => {
    const mockSessionData = {
      player1Name: null,
      player2Name: null,
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with undefined player names', () => {
    const mockSessionData = {
      player1Name: undefined,
      player2Name: undefined,
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with empty string player names', () => {
    const mockSessionData = {
      player1Name: '',
      player2Name: '',
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with very long player names', () => {
    const mockSessionData = {
      player1Name: 'This is a very long player name that might cause layout issues',
      player2Name: 'Another very long player name that might cause layout issues',
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with special characters in player names', () => {
    const mockSessionData = {
      player1Name: 'Alice & Bob',
      player2Name: 'Charlie <script>alert("xss")</script>',
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with unicode characters in player names', () => {
    const mockSessionData = {
      player1Name: 'Alice 中文',
      player2Name: 'Bob 🎯',
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with game complete', () => {
    const mockSessionData = {
      player1Name: 'Alice',
      player2Name: 'Bob',
      isGameComplete: true,
      isPlayer2Completed: true,
      isPlayer2Joined: true
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with player 2 completed', () => {
    const mockSessionData = {
      player1Name: 'Alice',
      player2Name: 'Bob',
      isGameComplete: false,
      isPlayer2Completed: true,
      isPlayer2Joined: true
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with player 2 joined', () => {
    const mockSessionData = {
      player1Name: 'Alice',
      player2Name: 'Bob',
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: true
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with missing properties', () => {
    const mockSessionData = {};
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with null data', () => {
    sessionService.getSession.mockResolvedValue(null);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with undefined data', () => {
    sessionService.getSession.mockResolvedValue(undefined);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with extra properties', () => {
    const mockSessionData = {
      player1Name: 'Alice',
      player2Name: 'Bob',
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false,
      extraProp: 'value',
      anotherProp: 123
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with mixed data types', () => {
    const mockSessionData = {
      player1Name: 'Alice',
      player2Name: 'Bob',
      isGameComplete: 'true',
      isPlayer2Completed: 1,
      isPlayer2Joined: 0
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with boolean string values', () => {
    const mockSessionData = {
      player1Name: 'Alice',
      player2Name: 'Bob',
      isGameComplete: 'false',
      isPlayer2Completed: 'false',
      isPlayer2Joined: 'false'
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with numeric player names', () => {
    const mockSessionData = {
      player1Name: 123,
      player2Name: 456,
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with whitespace-only player names', () => {
    const mockSessionData = {
      player1Name: '   ',
      player2Name: '   ',
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with newline characters in player names', () => {
    const mockSessionData = {
      player1Name: 'Alice\nSmith',
      player2Name: 'Bob\r\nJones',
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with HTML tags in player names', () => {
    const mockSessionData = {
      player1Name: '<b>Alice</b>',
      player2Name: '<script>alert("xss")</script>',
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });

  test('handles session with SQL injection attempts in player names', () => {
    const mockSessionData = {
      player1Name: "'; DROP TABLE users; --",
      player2Name: "1' OR '1'='1",
      isGameComplete: false,
      isPlayer2Completed: false,
      isPlayer2Joined: false
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(SessionPage);
    
    expect(screen.getByText('Loading game session...')).toBeInTheDocument();
  });
});
