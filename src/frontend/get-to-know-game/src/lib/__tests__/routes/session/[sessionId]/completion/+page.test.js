import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { vi } from 'vitest';
import CompletionPage from '../../../../../../routes/session/[sessionId]/completion/+page.svelte';

// Mock the page store
vi.mock('$app/stores', () => ({
  page: {
    subscribe: vi.fn()
  }
}));

// Mock the sessionService
vi.mock('$lib/services/sessionService.js', () => ({
  sessionService: {
    getSession: vi.fn()
  }
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000/session/test-session-123/completion'
  },
  writable: true
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue()
  },
  writable: true
});

describe('CompletionPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Reset the page mock to default
    const { page } = await import('$app/stores');
    vi.mocked(page.subscribe).mockImplementation((callback) => {
      callback({ 
        params: { sessionId: 'test-session-123' },
        url: { pathname: '/session/test-session-123/completion' }
      });
      return () => {};
    });
    
    // Reset sessionService mock
    const { sessionService } = await import('$lib/services/sessionService.js');
    sessionService.getSession.mockClear();
  });

  test('renders loading state initially', async () => {
    const { sessionService } = await import('$lib/services/sessionService.js');
    sessionService.getSession.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(CompletionPage);
    
    expect(screen.getByText('Loading your game session...')).toBeInTheDocument();
  });

  test('renders with mocked session data', async () => {
    const { sessionService } = await import('$lib/services/sessionService.js');
    const mockSessionData = {
      sessionId: 'test-session-123',
      player1Name: 'Alice',
      player2Name: 'Bob',
      questions: [],
      createdAt: new Date().toISOString()
    };
    
    sessionService.getSession.mockResolvedValue(mockSessionData);
    
    render(CompletionPage);
    
    // Wait for the component to process the sessionId and call loadSession
    await waitFor(() => {
      expect(sessionService.getSession).toHaveBeenCalledWith('test-session-123');
    }, { timeout: 2000 });
    
    // Then wait for the success state
    await waitFor(() => {
      expect(screen.getByText('Thank you for playing!')).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('handles error state gracefully', async () => {
    const { sessionService } = await import('$lib/services/sessionService.js');
    sessionService.getSession.mockRejectedValue(new Error('Session not found'));
    
    render(CompletionPage);
    
    await waitFor(() => {
      expect(screen.getByText('Session not found')).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('handles missing session ID', async () => {
    const { page } = await import('$app/stores');
    vi.mocked(page.subscribe).mockImplementationOnce((callback) => {
      callback({ 
        params: {},
        url: { pathname: '/session//completion' }
      });
      return () => {};
    });
    
    render(CompletionPage);
    
    await waitFor(() => {
      expect(screen.getByText('Session ID is missing from URL')).toBeInTheDocument();
    }, { timeout: 10000 });
  });
});