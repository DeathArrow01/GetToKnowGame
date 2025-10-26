<script>
    import { onMount, onDestroy } from 'svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    import { adminApi } from '$lib/services/adminApi.js';
    
    let performanceData = null;
    let isLoading = false;
    let error = null;
    let autoRefresh = true;
    let refreshInterval;
    
    onMount(() => {
        loadPerformanceData();
        if (autoRefresh) {
            startAutoRefresh();
        }
    });
    
    onDestroy(() => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    });
    
    async function loadPerformanceData() {
        try {
            isLoading = true;
            error = null;
            
            performanceData = await adminApi.getPerformanceMetrics();
            
        } catch (err) {
            console.error('Performance loading error:', err);
            error = err.message || 'Failed to load performance data';
        } finally {
            isLoading = false;
        }
    }
    
    function startAutoRefresh() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        refreshInterval = setInterval(loadPerformanceData, 30000); // Refresh every 30 seconds
    }
    
    function stopAutoRefresh() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }
    
    function toggleAutoRefresh() {
        autoRefresh = !autoRefresh;
        if (autoRefresh) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }
    }
    
    function getHealthColor(status) {
        switch (status?.toLowerCase()) {
            case 'healthy':
                return 'var(--mailgo-success)';
            case 'warning':
                return '#F59E0B';
            case 'error':
                return 'var(--mailgo-error)';
            default:
                return 'var(--mailgo-text-muted)';
        }
    }
    
    function getHealthIcon(status) {
        switch (status?.toLowerCase()) {
            case 'healthy':
                return '✅';
            case 'warning':
                return '⚠️';
            case 'error':
                return '❌';
            default:
                return '❓';
        }
    }
    
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function formatTime(timestamp) {
        return new Date(timestamp).toLocaleString();
    }
</script>

<svelte:head>
    <title>Performance - Admin Dashboard</title>
</svelte:head>

<div class="performance-page">
    <div class="performance-header">
        <h1 class="page-title">Performance Monitoring</h1>
        <div class="header-actions">
            <label class="auto-refresh-toggle">
                <input 
                    type="checkbox" 
                    bind:checked={autoRefresh} 
                    on:change={toggleAutoRefresh}
                />
                <span class="toggle-label">Auto Refresh</span>
            </label>
            <button class="refresh-btn" on:click={loadPerformanceData} disabled={isLoading}>
                {#if isLoading}
                    <LoadingSpinner size="sm" />
                {:else}
                    🔄
                {/if}
                Refresh
            </button>
        </div>
    </div>
    
    {#if error}
        <ErrorMessage message={error} />
    {:else if isLoading && !performanceData}
        <div class="loading-container">
            <LoadingSpinner />
            <p>Loading performance data...</p>
        </div>
    {:else if performanceData}
        <div class="performance-content">
            <!-- System Health Overview -->
            <div class="health-overview">
                <h3 class="section-title">System Health</h3>
                <div class="health-cards">
                    <div class="health-card">
                        <div class="health-icon" style="color: {getHealthColor(performanceData.systemHealth)}">
                            {getHealthIcon(performanceData.systemHealth)}
                        </div>
                        <div class="health-content">
                            <div class="health-label">System Status</div>
                            <div class="health-value" style="color: {getHealthColor(performanceData.systemHealth)}">
                                {performanceData.systemHealth || 'Unknown'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="health-card">
                        <div class="health-icon" style="color: {getHealthColor(performanceData.databaseStatus)}">
                            {getHealthIcon(performanceData.databaseStatus)}
                        </div>
                        <div class="health-content">
                            <div class="health-label">Database</div>
                            <div class="health-value" style="color: {getHealthColor(performanceData.databaseStatus)}">
                                {performanceData.databaseStatus || 'Unknown'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="health-card">
                        <div class="health-icon">📊</div>
                        <div class="health-content">
                            <div class="health-label">Last Updated</div>
                            <div class="health-value">
                                {formatTime(performanceData.lastUpdated)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Performance Metrics -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-header">
                        <h4 class="metric-title">Response Time</h4>
                        <div class="metric-icon">⚡</div>
                    </div>
                    <div class="metric-value">{performanceData.responseTime || 0}ms</div>
                    <div class="metric-trend">
                        {#if performanceData.responseTime < 100}
                            <span class="trend-good">Excellent</span>
                        {:else if performanceData.responseTime < 300}
                            <span class="trend-ok">Good</span>
                        {:else}
                            <span class="trend-warning">Slow</span>
                        {/if}
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-header">
                        <h4 class="metric-title">Error Rate</h4>
                        <div class="metric-icon">📈</div>
                    </div>
                    <div class="metric-value">{(performanceData.errorRate * 100 || 0).toFixed(2)}%</div>
                    <div class="metric-trend">
                        {#if performanceData.errorRate < 0.01}
                            <span class="trend-good">Low</span>
                        {:else if performanceData.errorRate < 0.05}
                            <span class="trend-ok">Acceptable</span>
                        {:else}
                            <span class="trend-warning">High</span>
                        {/if}
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-header">
                        <h4 class="metric-title">Request Count</h4>
                        <div class="metric-icon">📊</div>
                    </div>
                    <div class="metric-value">{performanceData.requestCount || 0}</div>
                    <div class="metric-trend">Last Hour</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-header">
                        <h4 class="metric-title">Active Users</h4>
                        <div class="metric-icon">👥</div>
                    </div>
                    <div class="metric-value">{performanceData.activeUsers || 0}</div>
                    <div class="metric-trend">Currently Online</div>
                </div>
            </div>
            
            <!-- Resource Usage -->
            <div class="resource-usage">
                <h3 class="section-title">Resource Usage</h3>
                <div class="usage-grid">
                    <div class="usage-card">
                        <div class="usage-header">
                            <h4>Memory Usage</h4>
                            <span class="usage-value">{performanceData.memoryUsage || 0}%</span>
                        </div>
                        <div class="usage-bar">
                            <div 
                                class="usage-fill" 
                                style="width: {performanceData.memoryUsage || 0}%"
                                class:warning={performanceData.memoryUsage > 80}
                                class:danger={performanceData.memoryUsage > 90}
                            ></div>
                        </div>
                    </div>
                    
                    <div class="usage-card">
                        <div class="usage-header">
                            <h4>CPU Usage</h4>
                            <span class="usage-value">{performanceData.cpuUsage || 0}%</span>
                        </div>
                        <div class="usage-bar">
                            <div 
                                class="usage-fill" 
                                style="width: {performanceData.cpuUsage || 0}%"
                                class:warning={performanceData.cpuUsage > 70}
                                class:danger={performanceData.cpuUsage > 85}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Endpoint Performance -->
            {#if performanceData.endpointMetrics}
                <div class="endpoint-metrics">
                    <h3 class="section-title">Endpoint Performance</h3>
                    <div class="endpoint-list">
                        {#each Object.entries(performanceData.endpointMetrics) as [endpoint, responseTime]}
                            <div class="endpoint-item">
                                <div class="endpoint-info">
                                    <span class="endpoint-path">{endpoint}</span>
                                    <span class="endpoint-time">{responseTime}ms</span>
                                </div>
                                <div class="endpoint-bar">
                                    <div 
                                        class="endpoint-fill" 
                                        style="width: {Math.min((responseTime / 500) * 100, 100)}%"
                                        class:warning={responseTime > 200}
                                        class:danger={responseTime > 500}
                                    ></div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .performance-page {
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .performance-header {
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
    
    .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .auto-refresh-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }
    
    .auto-refresh-toggle input[type="checkbox"] {
        width: 1rem;
        height: 1rem;
        accent-color: var(--mailgo-purple);
    }
    
    .toggle-label {
        font-size: 0.875rem;
        color: var(--mailgo-text-primary);
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
    
    .performance-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
        margin: 0 0 1rem 0;
    }
    
    .health-overview {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
    }
    
    .health-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .health-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.5rem;
    }
    
    .health-icon {
        font-size: 1.5rem;
    }
    
    .health-content {
        flex: 1;
    }
    
    .health-label {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
        margin-bottom: 0.25rem;
    }
    
    .health-value {
        font-size: 1.125rem;
        font-weight: 600;
    }
    
    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }
    
    .metric-card {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .metric-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
        margin: 0;
    }
    
    .metric-icon {
        font-size: 1.25rem;
    }
    
    .metric-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--mailgo-text-primary);
        margin-bottom: 0.5rem;
    }
    
    .metric-trend {
        font-size: 0.875rem;
    }
    
    .trend-good {
        color: var(--mailgo-success);
        font-weight: 500;
    }
    
    .trend-ok {
        color: #F59E0B;
        font-weight: 500;
    }
    
    .trend-warning {
        color: var(--mailgo-error);
        font-weight: 500;
    }
    
    .resource-usage {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
    }
    
    .usage-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    
    .usage-card {
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.5rem;
        padding: 1rem;
    }
    
    .usage-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }
    
    .usage-header h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
    }
    
    .usage-value {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
    }
    
    .usage-bar {
        height: 0.5rem;
        background-color: var(--mailgo-bg-secondary);
        border-radius: 0.25rem;
        overflow: hidden;
    }
    
    .usage-fill {
        height: 100%;
        background-color: var(--mailgo-success);
        transition: width 0.3s ease;
    }
    
    .usage-fill.warning {
        background-color: #F59E0B;
    }
    
    .usage-fill.danger {
        background-color: var(--mailgo-error);
    }
    
    .endpoint-metrics {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
    }
    
    .endpoint-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .endpoint-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .endpoint-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .endpoint-path {
        font-family: monospace;
        font-size: 0.875rem;
        color: var(--mailgo-text-primary);
    }
    
    .endpoint-time {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
        font-weight: 500;
    }
    
    .endpoint-bar {
        height: 0.25rem;
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.125rem;
        overflow: hidden;
    }
    
    .endpoint-fill {
        height: 100%;
        background-color: var(--mailgo-success);
        transition: width 0.3s ease;
    }
    
    .endpoint-fill.warning {
        background-color: #F59E0B;
    }
    
    .endpoint-fill.danger {
        background-color: var(--mailgo-error);
    }
    
    @media (max-width: 768px) {
        .performance-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
        }
        
        .header-actions {
            justify-content: space-between;
        }
        
        .health-cards {
            grid-template-columns: 1fr;
        }
        
        .metrics-grid {
            grid-template-columns: 1fr;
        }
        
        .usage-grid {
            grid-template-columns: 1fr;
        }
        
        .metric-value {
            font-size: 1.5rem;
        }
    }
</style>
