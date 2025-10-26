<script>
    export let filters = {};
    export let onFiltersChange = () => {};
    export let disabled = false;
    
    const periods = [
        { value: 'day', label: 'Daily' },
        { value: 'month', label: 'Monthly' },
        { value: '3month', label: '3 Months' },
        { value: '6month', label: '6 Months' },
        { value: 'year', label: 'Yearly' },
        { value: '5year', label: '5 Years' }
    ];
    
    const eventTypes = [
        'page_view',
        'session_start',
        'session_complete',
        'question_answer',
        'pixel_view',
        'new_player',
        'returning_player'
    ];
    
    function updateFilter(key, value) {
        const newFilters = { ...filters, [key]: value };
        onFiltersChange(newFilters);
    }
    
    function clearFilters() {
        const clearedFilters = {
            startDate: '',
            endDate: '',
            period: 'day',
            eventTypes: [],
            limit: 100
        };
        onFiltersChange(clearedFilters);
    }
</script>

<div class="analytics-filters">
    <div class="filters-header">
        <h3 class="filters-title">Filter Analytics</h3>
        <button class="clear-btn" on:click={clearFilters} disabled={disabled}>
            Clear All
        </button>
    </div>
    
    <div class="filters-grid">
        <!-- Date Range -->
        <div class="filter-group">
            <label class="filter-label">Date Range</label>
            <div class="date-inputs">
                <input
                    type="date"
                    bind:value={filters.startDate}
                    on:change={() => updateFilter('startDate', filters.startDate)}
                    disabled={disabled}
                    class="date-input"
                    placeholder="Start Date"
                />
                <span class="date-separator">to</span>
                <input
                    type="date"
                    bind:value={filters.endDate}
                    on:change={() => updateFilter('endDate', filters.endDate)}
                    disabled={disabled}
                    class="date-input"
                    placeholder="End Date"
                />
            </div>
        </div>
        
        <!-- Period -->
        <div class="filter-group">
            <label class="filter-label">Time Period</label>
            <select
                bind:value={filters.period}
                on:change={() => updateFilter('period', filters.period)}
                disabled={disabled}
                class="select-input"
            >
                {#each periods as period}
                    <option value={period.value}>{period.label}</option>
                {/each}
            </select>
        </div>
        
        <!-- Event Types -->
        <div class="filter-group">
            <label class="filter-label">Event Types</label>
            <div class="checkbox-group">
                {#each eventTypes as eventType}
                    <label class="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.eventTypes?.includes(eventType) || false}
                            on:change={(e) => {
                                const newEventTypes = e.target.checked
                                    ? [...(filters.eventTypes || []), eventType]
                                    : (filters.eventTypes || []).filter(et => et !== eventType);
                                updateFilter('eventTypes', newEventTypes);
                            }}
                            disabled={disabled}
                            class="checkbox-input"
                        />
                        <span class="checkbox-text">{eventType}</span>
                    </label>
                {/each}
            </div>
        </div>
        
        <!-- Limit -->
        <div class="filter-group">
            <label class="filter-label">Results Limit</label>
            <select
                bind:value={filters.limit}
                on:change={() => updateFilter('limit', parseInt(filters.limit))}
                disabled={disabled}
                class="select-input"
            >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
            </select>
        </div>
    </div>
</div>

<style>
    .analytics-filters {
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.5rem;
        padding: 1rem;
    }
    
    .filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .filters-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
        margin: 0;
    }
    
    .clear-btn {
        padding: 0.5rem 1rem;
        background-color: var(--mailgo-text-muted);
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }
    
    .clear-btn:hover:not(:disabled) {
        background-color: var(--mailgo-error);
    }
    
    .clear-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }
    
    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .filter-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--mailgo-text-primary);
    }
    
    .date-inputs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .date-input {
        flex: 1;
        padding: 0.5rem;
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.25rem;
        color: var(--mailgo-text-primary);
        font-size: 0.875rem;
    }
    
    .date-input:focus {
        outline: none;
        border-color: var(--mailgo-purple);
    }
    
    .date-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .date-separator {
        color: var(--mailgo-text-muted);
        font-size: 0.875rem;
    }
    
    .select-input {
        padding: 0.5rem;
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.25rem;
        color: var(--mailgo-text-primary);
        font-size: 0.875rem;
        cursor: pointer;
    }
    
    .select-input:focus {
        outline: none;
        border-color: var(--mailgo-purple);
    }
    
    .select-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 150px;
        overflow-y: auto;
    }
    
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 0.875rem;
    }
    
    .checkbox-input {
        width: 1rem;
        height: 1rem;
        accent-color: var(--mailgo-purple);
    }
    
    .checkbox-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .checkbox-text {
        color: var(--mailgo-text-primary);
        font-family: monospace;
        font-size: 0.75rem;
    }
    
    @media (max-width: 768px) {
        .filters-grid {
            grid-template-columns: 1fr;
        }
        
        .date-inputs {
            flex-direction: column;
            align-items: stretch;
        }
        
        .date-separator {
            text-align: center;
        }
    }
</style>
