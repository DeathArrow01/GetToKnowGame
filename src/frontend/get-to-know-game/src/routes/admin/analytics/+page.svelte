<script>
    import { onMount } from 'svelte';
    import AnalyticsFilters from '$lib/components/admin/AnalyticsFilters.svelte';
    import VisitorGraph from '$lib/components/admin/VisitorGraph.svelte';
    import SessionAnalytics from '$lib/components/admin/SessionAnalytics.svelte';
    import GeographicMap from '$lib/components/admin/GeographicMap.svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    import { adminApi } from '$lib/services/adminApi.js';
    
    let filters = {
        startDate: '',
        endDate: '',
        period: 'day',
        eventTypes: [],
        limit: 100
    };
    
    let analyticsData = null;
    let visitorStats = null;
    let geographicData = null;
    let isLoading = false;
    let error = null;
    
    onMount(() => {
        loadAnalyticsData();
    });
    
    async function loadAnalyticsData() {
        try {
            isLoading = true;
            error = null;
            
            // Load filtered analytics
            analyticsData = await adminApi.getFilteredAnalytics(filters);
            
            // Load visitor stats
            visitorStats = await adminApi.getVisitorStats(filters.period);
            
            // Load geographic data
            const geoResult = await adminApi.getGeographicAnalytics();
            geographicData = geoResult.geographicData;
            
        } catch (err) {
            console.error('Analytics loading error:', err);
            error = err.message || 'Failed to load analytics data';
        } finally {
            isLoading = false;
        }
    }
    
    function handleFiltersChange(newFilters) {
        filters = { ...filters, ...newFilters };
        loadAnalyticsData();
    }
</script>

<svelte:head>
    <title>Analytics - Admin Dashboard</title>
</svelte:head>

<div class="analytics-page">
    <div class="analytics-header">
        <h1 class="page-title">Analytics Dashboard</h1>
        <button class="refresh-btn" on:click={loadAnalyticsData} disabled={isLoading}>
            {#if isLoading}
                <LoadingSpinner size="sm" />
            {:else}
                🔄
            {/if}
            Refresh
        </button>
    </div>
    
    {#if error}
        <ErrorMessage message={error} />
    {:else}
        <!-- Filters -->
        <div class="filters-section">
            <AnalyticsFilters 
                {filters} 
                onFiltersChange={handleFiltersChange}
                disabled={isLoading}
            />
        </div>
        
        {#if isLoading}
            <div class="loading-container">
                <LoadingSpinner />
                <p>Loading analytics data...</p>
            </div>
        {:else}
            <div class="analytics-content">
                <!-- Visitor Trends Chart -->
                <div class="chart-section">
                    <h3 class="section-title">Visitor Trends</h3>
                    <VisitorGraph data={visitorStats} period={filters.period} />
                </div>
                
                <!-- Session Analytics -->
                <div class="chart-section">
                    <h3 class="section-title">Session Analytics</h3>
                    <SessionAnalytics data={analyticsData} />
                </div>
                
                <!-- Geographic Distribution -->
                <div class="chart-section">
                    <h3 class="section-title">Geographic Distribution</h3>
                    <GeographicMap data={geographicData} />
                </div>
                
                <!-- Event Analytics -->
                {#if analyticsData && analyticsData.events}
                    <div class="chart-section">
                        <h3 class="section-title">Event Analytics</h3>
                        <div class="events-summary">
                            <div class="event-stats">
                                <div class="event-stat">
                                    <span class="stat-label">Total Events</span>
                                    <span class="stat-value">{analyticsData.events.length}</span>
                                </div>
                                <div class="event-stat">
                                    <span class="stat-label">Unique Users</span>
                                    <span class="stat-value">
                                        {new Set(analyticsData.events.map(e => e.playerId)).size}
                                    </span>
                                </div>
                                <div class="event-stat">
                                    <span class="stat-label">Event Types</span>
                                    <span class="stat-value">
                                        {new Set(analyticsData.events.map(e => e.event)).size}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="event-types">
                                <h4>Event Types</h4>
                                <div class="event-type-list">
                                    {#each Object.entries(
                                        analyticsData.events.reduce((acc, event) => {
                                            acc[event.event] = (acc[event.event] || 0) + 1;
                                            return acc;
                                        }, {})
                                    ) as [eventType, count]}
                                        <div class="event-type-item">
                                            <span class="event-type-name">{eventType}</span>
                                            <span class="event-type-count">{count}</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    {/if}
</div>

<style>
    .analytics-page {
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .analytics-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    
    .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--mailgo-text-primary);
        margin: 0;
    }
    
    .refresh-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background-color: var(--mailgo-purple);
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }
    
    .refresh-btn:hover:not(:disabled) {
        background-color: var(--mailgo-purple-hover);
    }
    
    .refresh-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .filters-section {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
    }
    
    .loading-container p {
        margin-top: 1rem;
        color: var(--mailgo-text-muted);
    }
    
    .analytics-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .chart-section {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
    }
    
    .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
        margin: 0 0 1rem 0;
    }
    
    .events-summary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
    
    @media (max-width: 768px) {
        .events-summary {
            grid-template-columns: 1fr;
        }
    }
    
    .event-stats {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .event-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.5rem;
    }
    
    .stat-label {
        color: var(--mailgo-text-muted);
        font-weight: 500;
    }
    
    .stat-value {
        color: var(--mailgo-text-primary);
        font-weight: 600;
        font-size: 1.125rem;
    }
    
    .event-types h4 {
        color: var(--mailgo-text-primary);
        margin: 0 0 1rem 0;
        font-size: 1rem;
        font-weight: 600;
    }
    
    .event-type-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .event-type-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0.75rem;
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.25rem;
    }
    
    .event-type-name {
        color: var(--mailgo-text-primary);
        font-weight: 500;
    }
    
    .event-type-count {
        color: var(--mailgo-purple);
        font-weight: 600;
        font-family: monospace;
    }
</style>
