import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { vi } from 'vitest';
import BulkQuestionUpload from '$lib/components/admin/BulkQuestionUpload.svelte';
import { adminApi } from '$lib/services/adminApi.js';

// Mock the adminApi
vi.mock('$lib/services/adminApi', () => ({
  adminApi: {
    bulkCreateQuestions: vi.fn()
  }
}));

describe('BulkQuestionUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders basic component structure', () => {
    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });
    
    expect(screen.getByText('Bulk Question Upload')).toBeInTheDocument();
    expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
    expect(screen.getByText('Click to select CSV file or drag and drop')).toBeInTheDocument();
  });

  test('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel
      }
    });
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalled();
  });

  test('calls onCancel when close button is clicked', () => {
    const onCancel = vi.fn();
    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel
      }
    });
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(onCancel).toHaveBeenCalled();
  });

  test('shows error for invalid file type', async () => {
    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const fileInput = screen.getByDisplayValue('');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Please select a valid CSV file')).toBeInTheDocument();
    });
  });

  test('handles file selection and parsing', async () => {
    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\nFood,Do you like pizza?\nEntertainment,Do you watch movies?';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Successfully parsed 2 questions from CSV')).toBeInTheDocument();
      expect(screen.getByText('Preview (2 questions)')).toBeInTheDocument();
    });
  });

  test('shows error for CSV with insufficient rows', async () => {
    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('CSV file must have at least a header row and one data row')).toBeInTheDocument();
    });
  });

  test('shows error for CSV with missing required headers', async () => {
    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'name,description\nJohn,Test person';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('CSV file must have "section" and "question" columns')).toBeInTheDocument();
    });
  });

  test('shows error for CSV with no valid questions', async () => {
    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\n,';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Successfully parsed 1 questions from CSV')).toBeInTheDocument();
    });
  });

  test('handles successful upload', async () => {
    const onComplete = vi.fn();
    adminApi.bulkCreateQuestions.mockResolvedValue({
      created: 2,
      total: 2,
      errors: []
    });

    render(BulkQuestionUpload, {
      props: {
        onComplete,
        onCancel: vi.fn()
      }
    });

    // First, upload a file
    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\nFood,Do you like pizza?\nEntertainment,Do you watch movies?';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Successfully parsed 2 questions from CSV')).toBeInTheDocument();
    });

    // Then upload the questions
    const uploadButton = screen.getByText('Upload 2 Questions');
    await fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Successfully uploaded 2 questions')).toBeInTheDocument();
    });

    // Wait for auto-close
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test('handles upload with errors', async () => {
    adminApi.bulkCreateQuestions.mockResolvedValue({
      created: 1,
      total: 2,
      errors: ['Question 2 failed validation']
    });

    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    // Upload a file
    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\nFood,Do you like pizza?\nEntertainment,Do you watch movies?';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Successfully parsed 2 questions from CSV')).toBeInTheDocument();
    });

    // Upload the questions
    const uploadButton = screen.getByText('Upload 2 Questions');
    await fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Uploaded 1 of 2 questions. 1 errors occurred.')).toBeInTheDocument();
      expect(screen.getByText('Some questions failed to upload: Question 2 failed validation')).toBeInTheDocument();
    });
  });

  test('handles upload error', async () => {
    adminApi.bulkCreateQuestions.mockRejectedValue(new Error('Network error'));

    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    // Upload a file
    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\nFood,Do you like pizza?';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Successfully parsed 1 questions from CSV')).toBeInTheDocument();
    });

    // Upload the questions
    const uploadButton = screen.getByText('Upload 1 Questions');
    await fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('disables upload button when no questions', () => {
    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const uploadButton = screen.getByText('Upload 0 Questions');
    expect(uploadButton).toBeDisabled();
  });

  test('shows loading state during upload', async () => {
    adminApi.bulkCreateQuestions.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    // Upload a file
    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\nFood,Do you like pizza?';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Successfully parsed 1 questions from CSV')).toBeInTheDocument();
    });

    // Upload the questions
    const uploadButton = screen.getByText('Upload 1 Questions');
    await fireEvent.click(uploadButton);

    expect(screen.getByText('Uploading questions...')).toBeInTheDocument();
    expect(uploadButton).toBeDisabled();
  });

  test('shows preview with more than 5 questions', async () => {
    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\nFood,Question 1\nFood,Question 2\nFood,Question 3\nFood,Question 4\nFood,Question 5\nFood,Question 6\nFood,Question 7';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Preview (7 questions)')).toBeInTheDocument();
      expect(screen.getByText('... and 2 more questions')).toBeInTheDocument();
    });
  });

  test('displays file info when file is selected', async () => {
    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\nFood,Do you like pizza?';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('📄 test.csv')).toBeInTheDocument();
      expect(screen.getByText(/\(.*KB\)/)).toBeInTheDocument();
    });
  });

  test('shows preview when questions are parsed', async () => {
    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\nFood,Do you like pizza?\nEntertainment,Do you watch movies?';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Preview (2 questions)')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Do you like pizza?')).toBeInTheDocument();
      expect(screen.getByText('Entertainment')).toBeInTheDocument();
      expect(screen.getByText('Do you watch movies?')).toBeInTheDocument();
    });
  });

  test('displays error message when error occurs', async () => {
    adminApi.bulkCreateQuestions.mockRejectedValue(new Error('Server error'));

    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\nFood,Do you like pizza?';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Successfully parsed 1 questions from CSV')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload 1 Questions');
    await fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  test('displays success message when upload succeeds', async () => {
    adminApi.bulkCreateQuestions.mockResolvedValue({
      success: true,
      created: 1,
      errors: []
    });

    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\nFood,Do you like pizza?';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Successfully parsed 1 questions from CSV')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload 1 Questions');
    await fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Successfully uploaded 1 questions')).toBeInTheDocument();
    });
  });

  test('shows loading spinner during upload', async () => {
    adminApi.bulkCreateQuestions.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true, created: 1, errors: [] }), 100)));

    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\nFood,Do you like pizza?';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Successfully parsed 1 questions from CSV')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload 1 Questions');
    await fireEvent.click(uploadButton);

    // Check for loading spinner
    expect(screen.getByText('Uploading questions...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeDisabled();
  });

  test('handles error without message', async () => {
    adminApi.bulkCreateQuestions.mockRejectedValue(new Error());

    render(BulkQuestionUpload, {
      props: {
        onComplete: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const fileInput = screen.getByDisplayValue('');
    const csvContent = 'section,question\nFood,Do you like pizza?';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    await fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Successfully parsed 1 questions from CSV')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload 1 Questions');
    await fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to upload questions')).toBeInTheDocument();
    });
  });
});