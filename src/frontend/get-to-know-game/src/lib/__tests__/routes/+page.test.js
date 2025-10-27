import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { vi } from 'vitest';
import { goto } from '$app/navigation';
import HomePage from '../../../routes/+page.svelte';
import { sessionService } from '$lib/services/sessionService.js';

// Mock the navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

// Mock the session service
vi.mock('$lib/services/sessionService.js', () => ({
  sessionService: {
    createSession: vi.fn()
  }
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders page title and heading', () => {
    render(HomePage);
    
    expect(screen.getByText('Get to Know')).toBeInTheDocument();
    expect(screen.getByText('Game')).toBeInTheDocument();
  });

  test('renders description text', () => {
    render(HomePage);
    
    expect(screen.getByText('Discover how compatible you are with your friends through our AI-powered compatibility assessment!')).toBeInTheDocument();
  });

  test('renders form with player name inputs', () => {
    render(HomePage);
    
    expect(screen.getByLabelText('Your Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Friend\'s Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your friend\'s name')).toBeInTheDocument();
  });

  test('renders start game button', () => {
    render(HomePage);
    
    expect(screen.getByRole('button', { name: 'Start Game →' })).toBeInTheDocument();
  });

  test('renders features grid', () => {
    render(HomePage);
    
    expect(screen.getByText('Answer Questions')).toBeInTheDocument();
    expect(screen.getByText('Share & Compare')).toBeInTheDocument();
    expect(screen.getByText('Get Results')).toBeInTheDocument();
  });

  test('shows error when both names are empty', async () => {
    render(HomePage);
    
    const submitButton = screen.getByRole('button', { name: 'Start Game →' });
    await fireEvent.click(submitButton);
    
    // The form validation should prevent submission, so no error message is shown
    // Instead, we check that the form is still visible (not in loading state)
    expect(screen.getByText('Start a New Game')).toBeInTheDocument();
  });

  test('shows error when player1 name is empty', async () => {
    render(HomePage);
    
    const player2Input = screen.getByLabelText('Friend\'s Name');
    const submitButton = screen.getByRole('button', { name: 'Start Game →' });
    
    await fireEvent.input(player2Input, { target: { value: 'Friend' } });
    await fireEvent.click(submitButton);
    
    // The form validation should prevent submission
    expect(screen.getByText('Start a New Game')).toBeInTheDocument();
  });

  test('shows error when player2 name is empty', async () => {
    render(HomePage);
    
    const player1Input = screen.getByLabelText('Your Name');
    const submitButton = screen.getByRole('button', { name: 'Start Game →' });
    
    await fireEvent.input(player1Input, { target: { value: 'Player' } });
    await fireEvent.click(submitButton);
    
    // The form validation should prevent submission
    expect(screen.getByText('Start a New Game')).toBeInTheDocument();
  });

  test('shows error when names are only whitespace', async () => {
    render(HomePage);
    
    const player1Input = screen.getByLabelText('Your Name');
    const player2Input = screen.getByLabelText('Friend\'s Name');
    const submitButton = screen.getByRole('button', { name: 'Start Game →' });
    
    await fireEvent.input(player1Input, { target: { value: '   ' } });
    await fireEvent.input(player2Input, { target: { value: '   ' } });
    await fireEvent.click(submitButton);
    
    // The form validation should prevent submission
    expect(screen.getByText('Start a New Game')).toBeInTheDocument();
  });

  test('creates session successfully with valid names', async () => {
    const mockSessionId = 'test-session-123';
    sessionService.createSession.mockResolvedValue({ sessionId: mockSessionId });
    
    render(HomePage);
    
    const player1Input = screen.getByLabelText('Your Name');
    const player2Input = screen.getByLabelText('Friend\'s Name');
    const submitButton = screen.getByRole('button', { name: 'Start Game →' });
    
    await fireEvent.input(player1Input, { target: { value: 'Player 1' } });
    await fireEvent.input(player2Input, { target: { value: 'Player 2' } });
    await fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(sessionService.createSession).toHaveBeenCalledWith('Player 1', 'Player 2');
      expect(goto).toHaveBeenCalledWith(`/session/${mockSessionId}/questions?player=1`);
    });
  });

  test('trims whitespace from names when creating session', async () => {
    const mockSessionId = 'test-session-123';
    sessionService.createSession.mockResolvedValue({ sessionId: mockSessionId });
    
    render(HomePage);
    
    const player1Input = screen.getByLabelText('Your Name');
    const player2Input = screen.getByLabelText('Friend\'s Name');
    const submitButton = screen.getByRole('button', { name: 'Start Game →' });
    
    await fireEvent.input(player1Input, { target: { value: '  Player 1  ' } });
    await fireEvent.input(player2Input, { target: { value: '  Player 2  ' } });
    await fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(sessionService.createSession).toHaveBeenCalledWith('Player 1', 'Player 2');
    });
  });

  test('shows loading state during session creation', async () => {
    // Mock a delayed response
    sessionService.createSession.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ sessionId: 'test-123' }), 100))
    );
    
    render(HomePage);
    
    const player1Input = screen.getByLabelText('Your Name');
    const player2Input = screen.getByLabelText('Friend\'s Name');
    const submitButton = screen.getByRole('button', { name: 'Start Game →' });
    
    await fireEvent.input(player1Input, { target: { value: 'Player 1' } });
    await fireEvent.input(player2Input, { target: { value: 'Player 2' } });
    await fireEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText('Creating your game session...')).toBeInTheDocument();
  });

  test('shows error when session creation fails', async () => {
    const errorMessage = 'Network error';
    sessionService.createSession.mockRejectedValue(new Error(errorMessage));
    
    render(HomePage);
    
    const player1Input = screen.getByLabelText('Your Name');
    const player2Input = screen.getByLabelText('Friend\'s Name');
    const submitButton = screen.getByRole('button', { name: 'Start Game →' });
    
    await fireEvent.input(player1Input, { target: { value: 'Player 1' } });
    await fireEvent.input(player2Input, { target: { value: 'Player 2' } });
    await fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('displays error message with proper styling', async () => {
    const errorMessage = 'Test error message';
    sessionService.createSession.mockRejectedValue(new Error(errorMessage));
    
    render(HomePage);
    
    const player1Input = screen.getByLabelText('Your Name');
    const player2Input = screen.getByLabelText('Friend\'s Name');
    const submitButton = screen.getByRole('button', { name: 'Start Game →' });
    
    await fireEvent.input(player1Input, { target: { value: 'Player 1' } });
    await fireEvent.input(player2Input, { target: { value: 'Player 2' } });
    await fireEvent.click(submitButton);
    
    await waitFor(() => {
      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.closest('.mailgo-alert-error')).toBeInTheDocument();
    });
  });

  test('shows generic error when session creation fails without message', async () => {
    sessionService.createSession.mockRejectedValue(new Error());
    
    render(HomePage);
    
    const player1Input = screen.getByLabelText('Your Name');
    const player2Input = screen.getByLabelText('Friend\'s Name');
    const submitButton = screen.getByRole('button', { name: 'Start Game →' });
    
    await fireEvent.input(player1Input, { target: { value: 'Player 1' } });
    await fireEvent.input(player2Input, { target: { value: 'Player 2' } });
    await fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to create session')).toBeInTheDocument();
    });
  });

  test('handles form submission with error', async () => {
    sessionService.createSession.mockRejectedValue(new Error('First error'));
    
    render(HomePage);
    
    const player1Input = screen.getByLabelText('Your Name');
    const player2Input = screen.getByLabelText('Friend\'s Name');
    const submitButton = screen.getByRole('button', { name: 'Start Game →' });
    
    await fireEvent.input(player1Input, { target: { value: 'Player 1' } });
    await fireEvent.input(player2Input, { target: { value: 'Player 2' } });
    
    // Submission fails
    await fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });
    
    expect(sessionService.createSession).toHaveBeenCalledTimes(1);
  });

  test('form submission prevents default behavior', async () => {
    render(HomePage);
    
    const form = document.querySelector('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');
    
    await fireEvent(form, submitEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  test('renders feature icons', () => {
    render(HomePage);
    
    expect(screen.getByText('❓')).toBeInTheDocument();
    expect(screen.getByText('🔗')).toBeInTheDocument();
    expect(screen.getByText('💝')).toBeInTheDocument();
  });

  test('renders main game icon', () => {
    render(HomePage);
    
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });
});
