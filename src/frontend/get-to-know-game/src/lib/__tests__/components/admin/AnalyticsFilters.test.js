import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import AnalyticsFilters from '$lib/components/admin/AnalyticsFilters.svelte';

describe('AnalyticsFilters', () => {
  const defaultFilters = {
    startDate: '',
    endDate: '',
    period: 'day',
    eventTypes: [],
    limit: 100
  };

  test('renders analytics filters component', () => {
    render(AnalyticsFilters, {
      props: {
        filters: defaultFilters,
        onFiltersChange: vi.fn()
      }
    });
    
    expect(screen.getByText('Filter Analytics')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Time Period')).toBeInTheDocument();
    expect(screen.getByText('Event Types')).toBeInTheDocument();
    expect(screen.getByText('Results Limit')).toBeInTheDocument();
  });

  test('renders date range inputs', () => {
    render(AnalyticsFilters, {
      props: {
        filters: defaultFilters,
        onFiltersChange: vi.fn()
      }
    });
    
    const startDateInput = screen.getByPlaceholderText('Start Date');
    const endDateInput = screen.getByPlaceholderText('End Date');
    
    expect(startDateInput).toBeInTheDocument();
    expect(endDateInput).toBeInTheDocument();
    expect(startDateInput).toHaveAttribute('type', 'date');
    expect(endDateInput).toHaveAttribute('type', 'date');
  });

  test('renders period select with all options', () => {
    render(AnalyticsFilters, {
      props: {
        filters: defaultFilters,
        onFiltersChange: vi.fn()
      }
    });
    
    const periodSelects = screen.getAllByRole('combobox');
    expect(periodSelects).toHaveLength(2); // Period and limit selects
    
    // Check all period options are present
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('3 Months')).toBeInTheDocument();
    expect(screen.getByText('6 Months')).toBeInTheDocument();
    expect(screen.getByText('Yearly')).toBeInTheDocument();
    expect(screen.getByText('5 Years')).toBeInTheDocument();
  });

  test('renders event type checkboxes', () => {
    render(AnalyticsFilters, {
      props: {
        filters: defaultFilters,
        onFiltersChange: vi.fn()
      }
    });
    
    // Check all event types are present
    expect(screen.getByText('page_view')).toBeInTheDocument();
    expect(screen.getByText('session_start')).toBeInTheDocument();
    expect(screen.getByText('session_complete')).toBeInTheDocument();
    expect(screen.getByText('question_answer')).toBeInTheDocument();
    expect(screen.getByText('pixel_view')).toBeInTheDocument();
    expect(screen.getByText('new_player')).toBeInTheDocument();
    expect(screen.getByText('returning_player')).toBeInTheDocument();
  });

  test('renders limit select with all options', () => {
    render(AnalyticsFilters, {
      props: {
        filters: defaultFilters,
        onFiltersChange: vi.fn()
      }
    });
    
    // Check all limit options are present
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  test('updates start date when changed', async () => {
    const onFiltersChange = vi.fn();
    render(AnalyticsFilters, {
      props: {
        filters: defaultFilters,
        onFiltersChange
      }
    });
    
    const startDateInput = screen.getByPlaceholderText('Start Date');
    fireEvent.input(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      startDate: '2024-01-01'
    });
  });

  test('updates end date when changed', async () => {
    const onFiltersChange = vi.fn();
    render(AnalyticsFilters, {
      props: {
        filters: defaultFilters,
        onFiltersChange
      }
    });
    
    const endDateInput = screen.getByPlaceholderText('End Date');
    fireEvent.input(endDateInput, { target: { value: '2024-12-31' } });
    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      endDate: '2024-12-31'
    });
  });

  test('updates period when changed', async () => {
    const onFiltersChange = vi.fn();
    render(AnalyticsFilters, {
      props: {
        filters: defaultFilters,
        onFiltersChange
      }
    });
    
    const periodSelects = screen.getAllByRole('combobox');
    const periodSelect = periodSelects[0]; // First select is for period
    fireEvent.change(periodSelect, { target: { value: 'month' } });
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      period: 'month'
    });
  });

  test('updates event types when checkbox is checked', async () => {
    const onFiltersChange = vi.fn();
    render(AnalyticsFilters, {
      props: {
        filters: defaultFilters,
        onFiltersChange
      }
    });
    
    const pageViewCheckbox = screen.getByLabelText('page_view');
    fireEvent.click(pageViewCheckbox);
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      eventTypes: ['page_view']
    });
  });

  test('updates event types when checkbox is unchecked', async () => {
    const onFiltersChange = vi.fn();
    const filtersWithEventTypes = {
      ...defaultFilters,
      eventTypes: ['page_view', 'session_start']
    };
    
    render(AnalyticsFilters, {
      props: {
        filters: filtersWithEventTypes,
        onFiltersChange
      }
    });
    
    const pageViewCheckbox = screen.getByLabelText('page_view');
    fireEvent.click(pageViewCheckbox);
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      eventTypes: ['session_start']
    });
  });

  test('updates limit when changed', async () => {
    const onFiltersChange = vi.fn();
    render(AnalyticsFilters, {
      props: {
        filters: defaultFilters,
        onFiltersChange
      }
    });
    
    const limitSelects = screen.getAllByRole('combobox');
    const limitSelect = limitSelects[1]; // Second select is for limit
    fireEvent.change(limitSelect, { target: { value: '250' } });
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      limit: 250
    });
  });

  test('clears all filters when clear button is clicked', async () => {
    const onFiltersChange = vi.fn();
    const filtersWithData = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      period: 'month',
      eventTypes: ['page_view', 'session_start'],
      limit: 500
    };
    
    render(AnalyticsFilters, {
      props: {
        filters: filtersWithData,
        onFiltersChange
      }
    });
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      startDate: '',
      endDate: '',
      period: 'day',
      eventTypes: [],
      limit: 100
    });
  });

  test('disables all inputs when disabled prop is true', () => {
    render(AnalyticsFilters, {
      props: {
        filters: defaultFilters,
        onFiltersChange: vi.fn(),
        disabled: true
      }
    });
    
    const startDateInput = screen.getByPlaceholderText('Start Date');
    const endDateInput = screen.getByPlaceholderText('End Date');
    const periodSelects = screen.getAllByRole('combobox');
    const pageViewCheckbox = screen.getByLabelText('page_view');
    const clearButton = screen.getByText('Clear All');
    
    expect(startDateInput).toBeDisabled();
    expect(endDateInput).toBeDisabled();
    expect(periodSelects[0]).toBeDisabled(); // Period select
    expect(periodSelects[1]).toBeDisabled(); // Limit select
    expect(pageViewCheckbox).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  test('shows correct initial values', () => {
    const filtersWithData = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      period: 'month',
      eventTypes: ['page_view', 'session_start'],
      limit: 250
    };
    
    render(AnalyticsFilters, {
      props: {
        filters: filtersWithData,
        onFiltersChange: vi.fn()
      }
    });
    
    const startDateInput = screen.getByPlaceholderText('Start Date');
    const endDateInput = screen.getByPlaceholderText('End Date');
    const periodSelects = screen.getAllByRole('combobox');
    const periodSelect = periodSelects[0]; // Period select
    const pageViewCheckbox = screen.getByLabelText('page_view');
    const sessionStartCheckbox = screen.getByLabelText('session_start');
    const questionAnswerCheckbox = screen.getByLabelText('question_answer');
    
    expect(startDateInput.value).toBe('2024-01-01');
    expect(endDateInput.value).toBe('2024-12-31');
    expect(periodSelect.value).toBe('month');
    expect(pageViewCheckbox.checked).toBe(true);
    expect(sessionStartCheckbox.checked).toBe(true);
    expect(questionAnswerCheckbox.checked).toBe(false);
  });

  test('handles multiple event type selections', async () => {
    const onFiltersChange = vi.fn();
    const initialFilters = { ...defaultFilters, eventTypes: [] };
    render(AnalyticsFilters, {
      props: {
        filters: initialFilters,
        onFiltersChange
      }
    });
    
    const pageViewCheckbox = screen.getByLabelText('page_view');
    const sessionStartCheckbox = screen.getByLabelText('session_start');
    const questionAnswerCheckbox = screen.getByLabelText('question_answer');
    
    // Select multiple event types
    fireEvent.click(pageViewCheckbox);
    fireEvent.click(sessionStartCheckbox);
    fireEvent.click(questionAnswerCheckbox);
    
    // Check that the callback was called 3 times
    expect(onFiltersChange).toHaveBeenCalledTimes(3);
    
    // Check that each call includes the expected event type
    expect(onFiltersChange).toHaveBeenNthCalledWith(1, expect.objectContaining({
      eventTypes: expect.arrayContaining(['page_view'])
    }));
    
    expect(onFiltersChange).toHaveBeenNthCalledWith(2, expect.objectContaining({
      eventTypes: expect.arrayContaining(['session_start'])
    }));
    
    expect(onFiltersChange).toHaveBeenNthCalledWith(3, expect.objectContaining({
      eventTypes: expect.arrayContaining(['question_answer'])
    }));
  });

  test('handles empty event types array', () => {
    const filtersWithEmptyEventTypes = {
      ...defaultFilters,
      eventTypes: []
    };
    
    render(AnalyticsFilters, {
      props: {
        filters: filtersWithEmptyEventTypes,
        onFiltersChange: vi.fn()
      }
    });
    
    // All checkboxes should be unchecked
    const pageViewCheckbox = screen.getByLabelText('page_view');
    const sessionStartCheckbox = screen.getByLabelText('session_start');
    
    expect(pageViewCheckbox.checked).toBe(false);
    expect(sessionStartCheckbox.checked).toBe(false);
  });

  test('handles undefined event types', () => {
    const filtersWithUndefinedEventTypes = {
      ...defaultFilters,
      eventTypes: undefined
    };
    
    render(AnalyticsFilters, {
      props: {
        filters: filtersWithUndefinedEventTypes,
        onFiltersChange: vi.fn()
      }
    });
    
    // All checkboxes should be unchecked
    const pageViewCheckbox = screen.getByLabelText('page_view');
    const sessionStartCheckbox = screen.getByLabelText('session_start');
    
    expect(pageViewCheckbox.checked).toBe(false);
    expect(sessionStartCheckbox.checked).toBe(false);
  });

  test('handles null event types', () => {
    const filtersWithNullEventTypes = {
      ...defaultFilters,
      eventTypes: null
    };
    
    render(AnalyticsFilters, {
      props: {
        filters: filtersWithNullEventTypes,
        onFiltersChange: vi.fn()
      }
    });
    
    // All checkboxes should be unchecked
    const pageViewCheckbox = screen.getByLabelText('page_view');
    const sessionStartCheckbox = screen.getByLabelText('session_start');
    
    expect(pageViewCheckbox.checked).toBe(false);
    expect(sessionStartCheckbox.checked).toBe(false);
  });

  test('handles event type checkbox change with null eventTypes', async () => {
    const onFiltersChange = vi.fn();
    const filtersWithNullEventTypes = {
      ...defaultFilters,
      eventTypes: null
    };
    
    render(AnalyticsFilters, {
      props: {
        filters: filtersWithNullEventTypes,
        onFiltersChange
      }
    });
    
    const pageViewCheckbox = screen.getByLabelText('page_view');
    fireEvent.click(pageViewCheckbox);
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      eventTypes: ['page_view']
    });
  });

  test('handles event type checkbox change with undefined eventTypes', async () => {
    const onFiltersChange = vi.fn();
    const filtersWithUndefinedEventTypes = {
      ...defaultFilters,
      eventTypes: undefined
    };
    
    render(AnalyticsFilters, {
      props: {
        filters: filtersWithUndefinedEventTypes,
        onFiltersChange
      }
    });
    
    const pageViewCheckbox = screen.getByLabelText('page_view');
    fireEvent.click(pageViewCheckbox);
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      eventTypes: ['page_view']
    });
  });

  test('handles event type checkbox check with null eventTypes', async () => {
    const onFiltersChange = vi.fn();
    const filtersWithNullEventTypes = {
      ...defaultFilters,
      eventTypes: null
    };
    
    render(AnalyticsFilters, {
      props: {
        filters: filtersWithNullEventTypes,
        onFiltersChange
      }
    });
    
    const pageViewCheckbox = screen.getByLabelText('page_view');
    fireEvent.click(pageViewCheckbox);
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      eventTypes: ['page_view']
    });
  });

  test('handles event type checkbox check with undefined eventTypes', async () => {
    const onFiltersChange = vi.fn();
    const filtersWithUndefinedEventTypes = {
      ...defaultFilters,
      eventTypes: undefined
    };
    
    render(AnalyticsFilters, {
      props: {
        filters: filtersWithUndefinedEventTypes,
        onFiltersChange
      }
    });
    
    const pageViewCheckbox = screen.getByLabelText('page_view');
    fireEvent.click(pageViewCheckbox);
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      eventTypes: ['page_view']
    });
  });

  test('handles period select binding correctly', async () => {
    const onFiltersChange = vi.fn();
    const filtersWithPeriod = {
      ...defaultFilters,
      period: 'month'
    };
    
    render(AnalyticsFilters, {
      props: {
        filters: filtersWithPeriod,
        onFiltersChange
      }
    });
    
    const periodSelects = screen.getAllByRole('combobox');
    const periodSelect = periodSelects[0]; // First select is for period
    
    // Verify the period is bound correctly
    expect(periodSelect.value).toBe('month');
    
    // Change the period
    fireEvent.change(periodSelect, { target: { value: 'year' } });
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      period: 'year'
    });
  });

  test('handles limit select with parseInt conversion', async () => {
    const onFiltersChange = vi.fn();
    const filtersWithLimit = {
      ...defaultFilters,
      limit: 250
    };
    
    render(AnalyticsFilters, {
      props: {
        filters: filtersWithLimit,
        onFiltersChange
      }
    });
    
    const limitSelects = screen.getAllByRole('combobox');
    const limitSelect = limitSelects[1]; // Second select is for limit
    
    // Verify the limit is bound correctly
    expect(limitSelect.value).toBe('250');
    
    // Change the limit
    fireEvent.change(limitSelect, { target: { value: '500' } });
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      limit: 500
    });
  });
});
