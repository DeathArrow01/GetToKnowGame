<script>
    import { onMount } from 'svelte';
    import StatsCards from '$lib/components/admin/StatsCards.svelte';
    import VisitorChart from '$lib/components/admin/VisitorChart.svelte';
    import RecentSessions from '$lib/components/admin/RecentSessions.svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    import { adminApi } from '$lib/services/adminApi.js';
    
    let stats = null;
    let visitorStats = null;
    let isLoading = true;
    let error = null;
    
    onMount(() => {
        loadDashboardData();
    });
    
    async function loadDashboardData() {
        try {
            isLoading = true;
            error = null;
            
            // Load main stats
            stats = await adminApi.getStats();
            
            // Load visitor stats for chart
            visitorStats = await adminApi.getVisitorStats('day');
            
        } catch (err) {
            console.error('Dashboard loading error:', err);
            error = err.message || 'Failed to load dashboard data';
        } finally {
            isLoading = false;
        }
    }
    
    function refreshData() {
        loadDashboardData();
    }
</script>

<svelte:head>
    <title>Admin Dashboard - Get to Know Game</title>
</svelte:head>

<div class="dashboard-page">
    <div class="dashboard-header">
        <h1 class="dashboard-title">Dashboard Overview</h1>
        <button class="refresh-btn" on:click={refreshData} disabled={isLoading}>
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
    {:else if isLoading}
        <div class="loading-container">
            <LoadingSpinner />
            <p>Loading dashboard data...</p>
        </div>
    {:else if stats}
        <div class="dashboard-content">
            <!-- Stats Cards -->
            <StatsCards {stats} />
            
            <!-- Charts Row -->
            <div class="charts-row">
                <div class="chart-container">
                    <h3 class="chart-title">Visitor Trends</h3>
                    <VisitorChart data={visitorStats} />
                </div>
                
                <div class="chart-container">
                    <h3 class="chart-title">System Performance</h3>
                    <div class="performance-metrics">
                        <div class="metric-item">
                            <span class="metric-label">System Health</span>
                            <span class="metric-value healthy">Healthy</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Database</span>
                            <span class="metric-value healthy">Connected</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Response Time</span>
                            <span class="metric-value">150ms</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Error Rate</span>
                            <span class="metric-value">2%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activity -->
            <div class="recent-activity">
                <h3 class="section-title">Recent Sessions</h3>
                <RecentSessions sessions={stats.recentSessions} />
            </div>
        </div>
    {/if}
</div>

<style>
    .dashboard-page {
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    
    .dashboard-title {
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
    
    .dashboard-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .charts-row {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
    }
    
    @media (max-width: 768px) {
        .charts-row {
            grid-template-columns: 1fr;
        }
    }
    
    .chart-container {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
    }
    
    .chart-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
        margin: 0 0 1rem 0;
    }
    
    .performance-metrics {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .metric-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.5rem;
    }
    
    .metric-label {
        color: var(--mailgo-text-muted);
        font-weight: 500;
    }
    
    .metric-value {
        color: var(--mailgo-text-primary);
        font-weight: 600;
        font-family: monospace;
    }
    
    .metric-value.healthy {
        color: var(--mailgo-success);
    }
    
    .recent-activity {
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
</style>
