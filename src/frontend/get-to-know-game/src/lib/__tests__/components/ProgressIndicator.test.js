import { render, screen } from '@testing-library/svelte';
import { vi } from 'vitest';
import ProgressIndicator from '$lib/components/ProgressIndicator.svelte';

describe('ProgressIndicator', () => {
  test('renders progress indicator with default values', () => {
    render(ProgressIndicator);
    
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
    expect(screen.getByText('100% Complete')).toBeInTheDocument();
  });

  test('renders progress indicator with custom values', () => {
    render(ProgressIndicator, {
      props: {
        currentQuestion: 3,
        totalQuestions: 10
      }
    });
    
    expect(screen.getByText('Question 3 of 10')).toBeInTheDocument();
    expect(screen.getByText('30% Complete')).toBeInTheDocument();
  });

  test('calculates progress percentage correctly', () => {
    render(ProgressIndicator, {
      props: {
        currentQuestion: 2,
        totalQuestions: 5
      }
    });
    
    expect(screen.getByText('Question 2 of 5')).toBeInTheDocument();
    expect(screen.getByText('40% Complete')).toBeInTheDocument();
  });

  test('rounds progress percentage correctly', () => {
    render(ProgressIndicator, {
      props: {
        currentQuestion: 1,
        totalQuestions: 3
      }
    });
    
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('33% Complete')).toBeInTheDocument();
  });

  test('handles zero total questions', () => {
    render(ProgressIndicator, {
      props: {
        currentQuestion: 0,
        totalQuestions: 0
      }
    });
    
    expect(screen.getByText('Question 0 of 0')).toBeInTheDocument();
    expect(screen.getByText('NaN% Complete')).toBeInTheDocument();
  });

  test('handles current question greater than total', () => {
    render(ProgressIndicator, {
      props: {
        currentQuestion: 5,
        totalQuestions: 3
      }
    });
    
    expect(screen.getByText('Question 5 of 3')).toBeInTheDocument();
    expect(screen.getByText('167% Complete')).toBeInTheDocument();
  });

  test('handles single question', () => {
    render(ProgressIndicator, {
      props: {
        currentQuestion: 1,
        totalQuestions: 1
      }
    });
    
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
    expect(screen.getByText('100% Complete')).toBeInTheDocument();
  });

  test('handles large numbers', () => {
    render(ProgressIndicator, {
      props: {
        currentQuestion: 50,
        totalQuestions: 100
      }
    });
    
    expect(screen.getByText('Question 50 of 100')).toBeInTheDocument();
    expect(screen.getByText('50% Complete')).toBeInTheDocument();
  });

  test('renders with different props', () => {
    render(ProgressIndicator, {
      props: {
        currentQuestion: 3,
        totalQuestions: 5
      }
    });
    
    expect(screen.getByText('Question 3 of 5')).toBeInTheDocument();
    expect(screen.getByText('60% Complete')).toBeInTheDocument();
  });

  test('has correct CSS classes', () => {
    const { container } = render(ProgressIndicator, {
      props: {
        currentQuestion: 2,
        totalQuestions: 4
      }
    });
    
    const progressContainer = container.querySelector('.w-full.max-w-2xl.mx-auto.mb-8');
    expect(progressContainer).toBeInTheDocument();
    
    const progressBar = container.querySelector('.progress-modern');
    expect(progressBar).toBeInTheDocument();
    
    const progressFill = container.querySelector('.progress-fill');
    expect(progressFill).toBeInTheDocument();
    expect(progressFill).toHaveStyle('width: 50%');
  });

  test('displays badge with correct styling', () => {
    const { container } = render(ProgressIndicator, {
      props: {
        currentQuestion: 3,
        totalQuestions: 7
      }
    });
    
    const badge = container.querySelector('.badge-modern');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('43% Complete');
  });
});
