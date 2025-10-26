<script>
    import { onMount } from 'svelte';
    import SessionTable from '$lib/components/admin/SessionTable.svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    import { adminApi } from '$lib/services/adminApi.js';
    
    let sessions = [];
    let totalSessions = 0;
    let currentPage = 1;
    let pageSize = 20;
    let isLoading = false;
    let error = null;
    
    onMount(() => {
        loadSessions();
    });
    
    async function loadSessions(page = 1) {
        try {
            isLoading = true;
            error = null;
            
            const data = await adminApi.getSessions(page, pageSize);
            sessions = data.sessions || [];
            totalSessions = data.total || 0;
            currentPage = data.page || 1;
            
        } catch (err) {
            console.error('Sessions loading error:', err);
            error = err.message || 'Failed to load sessions';
        } finally {
            isLoading = false;
        }
    }
    
    function handlePageChange(page) {
        loadSessions(page);
    }
    
    function handlePageSizeChange(newSize) {
        pageSize = newSize;
        loadSessions(1);
    }
    
    function refreshSessions() {
        loadSessions(currentPage);
    }
</script>

<svelte:head>
    <title>Sessions - Admin Dashboard</title>
</svelte:head>

<div class="sessions-page">
    <div class="sessions-header">
        <h1 class="page-title">Session Management</h1>
        <div class="header-actions">
            <select bind:value={pageSize} on:change={() => handlePageSizeChange(pageSize)} class="page-size-select">
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
            </select>
            <button class="refresh-btn" on:click={refreshSessions} disabled={isLoading}>
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
    {:else if isLoading}
        <div class="loading-container">
            <LoadingSpinner />
            <p>Loading sessions...</p>
        </div>
    {:else}
        <div class="sessions-content">
            <!-- Session Statistics -->
            <div class="sessions-stats">
                <div class="stat-card">
                    <div class="stat-icon">🎮</div>
                    <div class="stat-content">
                        <div class="stat-value">{totalSessions}</div>
                        <div class="stat-label">Total Sessions</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <div class="stat-value">{sessions.filter(s => s.completedAt).length}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-content">
                        <div class="stat-value">{sessions.filter(s => !s.completedAt).length}</div>
                        <div class="stat-label">In Progress</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <div class="stat-value">
                            {sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.filter(s => s.score).length) : 0}%
                        </div>
                        <div class="stat-label">Avg Score</div>
                    </div>
                </div>
            </div>
            
            <!-- Sessions Table -->
            <div class="sessions-table-container">
                <SessionTable 
                    {sessions} 
                    {currentPage}
                    {pageSize}
                    {totalSessions}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    {/if}
</div>

<style>
    .sessions-page {
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .sessions-header {
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
    
    .page-size-select {
        padding: 0.5rem;
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.25rem;
        color: var(--mailgo-text-primary);
        font-size: 0.875rem;
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
    
    .sessions-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .sessions-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
    }
    
    .stat-card {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .stat-icon {
        font-size: 2rem;
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.5rem;
    }
    
    .stat-content {
        flex: 1;
    }
    
    .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--mailgo-text-primary);
        line-height: 1;
        margin-bottom: 0.25rem;
    }
    
    .stat-label {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
        font-weight: 500;
    }
    
    .sessions-table-container {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
    }
    
    @media (max-width: 768px) {
        .sessions-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
        }
        
        .header-actions {
            justify-content: space-between;
        }
        
        .sessions-stats {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }
        
        .stat-card {
            padding: 1rem;
        }
        
        .stat-icon {
            font-size: 1.5rem;
            width: 2.5rem;
            height: 2.5rem;
        }
        
        .stat-value {
            font-size: 1.5rem;
        }
    }
</style>
