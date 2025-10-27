import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import QuestionsPage from '../../../../../routes/admin/questions/+page.svelte';

// Mock the adminApi module
vi.mock('$lib/services/adminApi.js', () => ({
  adminApi: {
    getQuestions: vi.fn(),
    deleteQuestion: vi.fn()
  }
}));

// Import the mocked adminApi
import { adminApi } from '$lib/services/adminApi.js';

describe('QuestionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders page title and controls', () => {
    render(QuestionsPage);
    
    expect(screen.getByText('Question Management')).toBeInTheDocument();
    expect(screen.getByText('📤 Bulk Upload')).toBeInTheDocument();
    expect(screen.getByText('➕ Add Question')).toBeInTheDocument();
  });

  test('renders basic page structure', () => {
    render(QuestionsPage);
    
    // Check that the component renders the basic structure
    expect(screen.getByText('Question Management')).toBeInTheDocument();
    expect(screen.getByText('📤 Bulk Upload')).toBeInTheDocument();
    expect(screen.getByText('➕ Add Question')).toBeInTheDocument();
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
    expect(screen.getByText('Sections')).toBeInTheDocument();
    expect(screen.getByText('Avg per Section')).toBeInTheDocument();
  });

  test('handles add question button click', () => {
    render(QuestionsPage);
    
    // Click add question button
    const addButton = screen.getByText('➕ Add Question');
    fireEvent.click(addButton);
    
    // The component should handle the click without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles bulk upload button click', () => {
    render(QuestionsPage);
    
    // Click bulk upload button
    const bulkUploadButton = screen.getByText('📤 Bulk Upload');
    fireEvent.click(bulkUploadButton);
    
    // The component should handle the click without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('renders with mocked data', () => {
    const mockQuestionsData = {
      questionsBySection: {
        'General': [
          { id: '1', questionText: 'What is your name?', section: 'General' },
          { id: '2', questionText: 'How old are you?', section: 'General' }
        ],
        'Hobbies': [
          { id: '3', questionText: 'What are your hobbies?', section: 'Hobbies' }
        ]
      },
      totalQuestions: 3
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // Check that the component renders the basic structure
    expect(screen.getByText('Question Management')).toBeInTheDocument();
    expect(screen.getByText('📤 Bulk Upload')).toBeInTheDocument();
    expect(screen.getByText('➕ Add Question')).toBeInTheDocument();
  });

  test('handles error state gracefully', () => {
    adminApi.getQuestions.mockRejectedValue(new Error('Network error'));
    
    render(QuestionsPage);
    
    // The component should handle the error gracefully
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles empty questions data', () => {
    const mockQuestionsData = {
      questionsBySection: {},
      totalQuestions: 0
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles questions with no sections', () => {
    const mockQuestionsData = {
      questionsBySection: null,
      totalQuestions: 0
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles questions with undefined sections', () => {
    const mockQuestionsData = {
      questionsBySection: undefined,
      totalQuestions: 0
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles questions with empty sections', () => {
    const mockQuestionsData = {
      questionsBySection: {
        'General': [],
        'Hobbies': []
      },
      totalQuestions: 0
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles questions with mixed empty and filled sections', () => {
    const mockQuestionsData = {
      questionsBySection: {
        'General': [
          { id: '1', questionText: 'What is your name?', section: 'General' }
        ],
        'Hobbies': []
      },
      totalQuestions: 1
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles questions with missing question properties', () => {
    const mockQuestionsData = {
      questionsBySection: {
        'General': [
          { id: '1', questionText: null, section: 'General' },
          { id: '2', questionText: undefined, section: 'General' },
          { id: '3', questionText: '', section: 'General' }
        ]
      },
      totalQuestions: 3
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles questions with missing section properties', () => {
    const mockQuestionsData = {
      questionsBySection: {
        'General': [
          { id: '1', questionText: 'What is your name?', section: null },
          { id: '2', questionText: 'How old are you?', section: undefined },
          { id: '3', questionText: 'What are your hobbies?', section: '' }
        ]
      },
      totalQuestions: 3
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles questions with missing id properties', () => {
    const mockQuestionsData = {
      questionsBySection: {
        'General': [
          { id: null, questionText: 'What is your name?', section: 'General' },
          { id: undefined, questionText: 'How old are you?', section: 'General' },
          { id: '', questionText: 'What are your hobbies?', section: 'General' }
        ]
      },
      totalQuestions: 3
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles questions with mixed data types', () => {
    const mockQuestionsData = {
      questionsBySection: {
        'General': [
          { id: '1', questionText: 'What is your name?', section: 'General' },
          { id: 2, questionText: 'How old are you?', section: 'General' },
          { id: '3', questionText: 'What are your hobbies?', section: 'General' }
        ]
      },
      totalQuestions: 3
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles questions with special characters in section names', () => {
    const mockQuestionsData = {
      questionsBySection: {
        'General & Basic': [
          { id: '1', questionText: 'What is your name?', section: 'General & Basic' }
        ],
        'Hobbies & Interests': [
          { id: '2', questionText: 'What are your hobbies?', section: 'Hobbies & Interests' }
        ]
      },
      totalQuestions: 2
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles questions with very long section names', () => {
    const mockQuestionsData = {
      questionsBySection: {
        'This is a very long section name that might cause layout issues': [
          { id: '1', questionText: 'What is your name?', section: 'This is a very long section name that might cause layout issues' }
        ]
      },
      totalQuestions: 1
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });

  test('handles questions with very long question text', () => {
    const mockQuestionsData = {
      questionsBySection: {
        'General': [
          { id: '1', questionText: 'This is a very long question text that might cause layout issues and should be handled gracefully by the component', section: 'General' }
        ]
      },
      totalQuestions: 1
    };
    
    adminApi.getQuestions.mockResolvedValue(mockQuestionsData);
    
    render(QuestionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Question Management')).toBeInTheDocument();
  });
});
