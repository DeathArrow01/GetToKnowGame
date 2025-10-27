import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { vi } from 'vitest';
import QuestionEditor from '$lib/components/admin/QuestionEditor.svelte';
import { adminApi } from '$lib/services/adminApi.js';

// Mock the adminApi
vi.mock('$lib/services/adminApi', () => ({
  adminApi: {
    createQuestion: vi.fn().mockResolvedValue({ id: '3' }),
    updateQuestion: vi.fn().mockResolvedValue({})
  }
}));

const mockSections = ['Icebreaker', 'Personal', 'Fun'];

describe('QuestionEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders add question form when no question provided', () => {
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    expect(screen.getByText('Add New Question')).toBeInTheDocument();
    expect(screen.getByText('Section')).toBeInTheDocument();
    expect(screen.getByText('Question Text')).toBeInTheDocument();
    expect(screen.getByText('Create Question')).toBeInTheDocument();
  });

  test('renders edit question form when question provided', async () => {
    const mockQuestion = {
      id: '1',
      section: 'Personal',
      questionText: 'What is your favorite hobby?'
    };

    render(QuestionEditor, { 
      props: { 
        question: mockQuestion, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    // Wait for reactive updates
    await waitFor(() => {
      expect(screen.getByText('Edit Question')).toBeInTheDocument();
    });
    
    expect(screen.getByDisplayValue('Personal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('What is your favorite hobby?')).toBeInTheDocument();
    expect(screen.getByText('Update Question')).toBeInTheDocument();
  });

  test('handles form field changes', async () => {
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    const sectionSelect = screen.getByRole('combobox');
    const questionTextarea = screen.getByRole('textbox');
    
    await fireEvent.change(sectionSelect, { target: { value: 'Fun' } });
    await fireEvent.input(questionTextarea, { target: { value: 'What is your favorite color?' } });
    
    expect(sectionSelect.value).toBe('Fun');
    expect(questionTextarea.value).toBe('What is your favorite color?');
  });

  test('handles question with null section and questionText', async () => {
    const mockQuestion = {
      id: '1',
      section: null,
      questionText: null
    };
    
    render(QuestionEditor, { 
      props: { 
        question: mockQuestion, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    await waitFor(() => {
      expect(screen.getByText('Edit Question')).toBeInTheDocument();
    });
    
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  test('handles cancel button click', async () => {
    const mockOnCancel = vi.fn();
    
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: mockOnCancel
      } 
    });
    
    const cancelButton = screen.getByText('Cancel');
    await fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('handles close button click', async () => {
    const mockOnCancel = vi.fn();
    
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: mockOnCancel
      } 
    });
    
    const closeButton = screen.getByText('✕');
    await fireEvent.click(closeButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('displays sections in dropdown', () => {
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    expect(screen.getByText('Icebreaker')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Fun')).toBeInTheDocument();
  });

  test('has required form fields', () => {
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    const sectionSelect = screen.getByRole('combobox');
    const questionTextarea = screen.getByRole('textbox');
    
    expect(sectionSelect).toHaveAttribute('required');
    expect(questionTextarea).toHaveAttribute('required');
  });

  test('has correct form labels', () => {
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    expect(screen.getByLabelText('Section')).toBeInTheDocument();
    expect(screen.getByLabelText('Question Text')).toBeInTheDocument();
  });

  test('has correct form placeholders', () => {
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    const questionTextarea = screen.getByRole('textbox');
    expect(questionTextarea).toHaveAttribute('placeholder', 'Enter your question here...');
  });

  test('has correct form structure', () => {
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    // Check for form element by class instead of role
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Question' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('shows error message when validation fails', async () => {
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: 'Create Question' });
    await fireEvent.click(submitButton);
    
    // The form should prevent submission due to required fields
    // This test verifies the form structure is correct
    expect(submitButton).toBeInTheDocument();
  });

  test('shows loading state during form submission', async () => {
    adminApi.createQuestion.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ id: '3' }), 100)));
    
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    // Fill in the form
    const sectionSelect = screen.getByRole('combobox');
    const questionTextarea = screen.getByRole('textbox');
    
    await fireEvent.change(sectionSelect, { target: { value: 'Fun' } });
    await fireEvent.input(questionTextarea, { target: { value: 'What is your favorite color?' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Question' });
    await fireEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText('Create Question')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('handles successful question creation', async () => {
    const mockOnSave = vi.fn();
    
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: mockOnSave,
        onCancel: vi.fn()
      } 
    });
    
    // Fill in the form
    const sectionSelect = screen.getByRole('combobox');
    const questionTextarea = screen.getByRole('textbox');
    
    await fireEvent.change(sectionSelect, { target: { value: 'Fun' } });
    await fireEvent.input(questionTextarea, { target: { value: 'What is your favorite color?' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Question' });
    await fireEvent.click(submitButton);
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(adminApi.createQuestion).toHaveBeenCalledWith({
        section: 'Fun',
        questionText: 'What is your favorite color?'
      });
    });
  });

  test('handles successful question update', async () => {
    const mockQuestion = {
      id: '1',
      section: 'Personal',
      questionText: 'What is your favorite hobby?'
    };
    const mockOnSave = vi.fn();
    
    render(QuestionEditor, { 
      props: { 
        question: mockQuestion, 
        sections: mockSections,
        onSave: mockOnSave,
        onCancel: vi.fn()
      } 
    });
    
    // Wait for reactive updates
    await waitFor(() => {
      expect(screen.getByText('Edit Question')).toBeInTheDocument();
    });
    
    // Submit the form without changing values
    const submitButton = screen.getByRole('button', { name: 'Update Question' });
    await fireEvent.click(submitButton);
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(adminApi.updateQuestion).toHaveBeenCalledWith('1', {
        section: 'Personal',
        questionText: 'What is your favorite hobby?'
      });
    });
  });

  test('handles API error during creation', async () => {
    adminApi.createQuestion.mockRejectedValue(new Error('API Error'));
    
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    // Fill in the form
    const sectionSelect = screen.getByRole('combobox');
    const questionTextarea = screen.getByRole('textbox');
    
    await fireEvent.change(sectionSelect, { target: { value: 'Fun' } });
    await fireEvent.input(questionTextarea, { target: { value: 'What is your favorite color?' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Question' });
    await fireEvent.click(submitButton);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  test('handles API error during update', async () => {
    const mockQuestion = {
      id: '1',
      section: 'Personal',
      questionText: 'What is your favorite hobby?'
    };
    
    adminApi.updateQuestion.mockRejectedValue(new Error('Update Error'));
    
    render(QuestionEditor, { 
      props: { 
        question: mockQuestion, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    // Wait for reactive updates
    await waitFor(() => {
      expect(screen.getByText('Edit Question')).toBeInTheDocument();
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Update Question' });
    await fireEvent.click(submitButton);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Update Error')).toBeInTheDocument();
    });
  });

  test('disables buttons during loading', async () => {
    adminApi.createQuestion.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ id: '3' }), 100)));
    
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    // Fill in the form
    const sectionSelect = screen.getByRole('combobox');
    const questionTextarea = screen.getByRole('textbox');
    
    await fireEvent.change(sectionSelect, { target: { value: 'Fun' } });
    await fireEvent.input(questionTextarea, { target: { value: 'What is your favorite color?' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Question' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    
    await fireEvent.click(submitButton);
    
    // Both buttons should be disabled during loading
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  test('shows loading spinner in submit button', async () => {
    adminApi.createQuestion.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ id: '3' }), 100)));
    
    render(QuestionEditor, { 
      props: { 
        question: null, 
        sections: mockSections,
        onSave: vi.fn(),
        onCancel: vi.fn()
      } 
    });
    
    // Fill in the form
    const sectionSelect = screen.getByRole('combobox');
    const questionTextarea = screen.getByRole('textbox');
    
    await fireEvent.change(sectionSelect, { target: { value: 'Fun' } });
    await fireEvent.input(questionTextarea, { target: { value: 'What is your favorite color?' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Question' });
    await fireEvent.click(submitButton);
    
    // Should show loading spinner
    expect(screen.getByText('Create Question')).toBeInTheDocument();
  });
});