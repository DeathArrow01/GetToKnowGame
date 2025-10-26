<script>
    export let data = null;
    
    let sessionStats = {
        totalSessions: 0,
        completedSessions: 0,
        averageScore: 0,
        completionRate: 0,
        averageDuration: 0
    };
    
    $: if (data && data.events) {
        calculateSessionStats();
    }
    
    function calculateSessionStats() {
        if (!data || !data.events) return;
        
        const events = data.events;
        const sessionEvents = events.filter(e => e.event === 'session_start' || e.event === 'session_complete');
        
        const sessionStarts = events.filter(e => e.event === 'session_start');
        const sessionCompletes = events.filter(e => e.event === 'session_complete');
        
        sessionStats = {
            totalSessions: sessionStarts.length,
            completedSessions: sessionCompletes.length,
            averageScore: 0, // Would need to calculate from actual session data
            completionRate: sessionStarts.length > 0 ? (sessionCompletes.length / sessionStarts.length) * 100 : 0,
            averageDuration: 0 // Would need to calculate from session timestamps
        };
    }
    
    const formatPercentage = (num) => {
        return num.toFixed(1) + '%';
    };
    
    const formatDuration = (minutes) => {
        if (minutes < 60) {
            return `${Math.round(minutes)}m`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            return `${hours}h ${mins}m`;
        }
    };
</script>

<div class="session-analytics">
    {#if data && data.events}
        <div class="analytics-grid">
            <!-- Session Overview -->
            <div class="analytics-card">
                <h4 class="card-title">Session Overview</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Total Sessions</span>
                        <span class="stat-value">{sessionStats.totalSessions}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Completed</span>
                        <span class="stat-value">{sessionStats.completedSessions}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Completion Rate</span>
                        <span class="stat-value">{formatPercentage(sessionStats.completionRate)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Avg Duration</span>
                        <span class="stat-value">{formatDuration(sessionStats.averageDuration)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Event Timeline -->
            <div class="analytics-card">
                <h4 class="card-title">Recent Activity</h4>
                <div class="activity-timeline">
                    {#each data.events.slice(0, 10) as event}
                        <div class="timeline-item">
                            <div class="timeline-marker" class:session-start={event.event === 'session_start'} class:session-complete={event.event === 'session_complete'} class:page-view={event.event === 'page_view'}>
                                {#if event.event === 'session_start'}
                                    🎮
                                {:else if event.event === 'session_complete'}
                                    ✅
                                {:else if event.event === 'page_view'}
                                    👁️
                                {:else}
                                    📝
                                {/if}
                            </div>
                            <div class="timeline-content">
                                <div class="timeline-event">{event.event}</div>
                                <div class="timeline-time">
                                    {new Date(event.time).toLocaleString()}
                                </div>
                                {#if event.url}
                                    <div class="timeline-url">{event.url}</div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
            
            <!-- Event Distribution -->
            <div class="analytics-card">
                <h4 class="card-title">Event Distribution</h4>
                <div class="event-distribution">
                    {#each Object.entries(
                        data.events.reduce((acc, event) => {
                            acc[event.event] = (acc[event.event] || 0) + 1;
                            return acc;
                        }, {})
                    ).sort((a, b) => b[1] - a[1]) as [eventType, count]}
                        <div class="distribution-item">
                            <div class="distribution-header">
                                <span class="event-type">{eventType}</span>
                                <span class="event-count">{count}</span>
                            </div>
                            <div class="distribution-bar">
                                <div 
                                    class="distribution-fill" 
                                    style="width: {(count / Math.max(...Object.values(data.events.reduce((acc, event) => {
                                        acc[event.event] = (acc[event.event] || 0) + 1;
                                        return acc;
                                    }, {})))) * 100}%"
                                ></div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
            
            <!-- User Activity -->
            <div class="analytics-card">
                <h4 class="card-title">User Activity</h4>
                <div class="user-stats">
                    <div class="user-stat">
                        <span class="stat-label">Unique Users</span>
                        <span class="stat-value">
                            {new Set(data.events.map(e => e.playerId)).size}
                        </span>
                    </div>
                    <div class="user-stat">
                        <span class="stat-label">Total Events</span>
                        <span class="stat-value">{data.events.length}</span>
                    </div>
                    <div class="user-stat">
                        <span class="stat-label">Avg Events/User</span>
                        <span class="stat-value">
                            {data.events.length > 0 ? Math.round(data.events.length / new Set(data.events.map(e => e.playerId)).size) : 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="no-data">
            <div class="no-data-icon">📊</div>
            <p>No session analytics data available</p>
        </div>
    {/if}
</div>

<style>
    .session-analytics {
        width: 100%;
    }
    
    .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    
    .analytics-card {
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.5rem;
        padding: 1.5rem;
    }
    
    .card-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
        margin: 0 0 1rem 0;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
    
    .stat-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .stat-label {
        font-size: 0.75rem;
        color: var(--mailgo-text-muted);
        font-weight: 500;
    }
    
    .stat-value {
        font-size: 1.25rem;
        color: var(--mailgo-text-primary);
        font-weight: 600;
    }
    
    .activity-timeline {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .timeline-item {
        display: flex;
        gap: 0.75rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--mailgo-border);
    }
    
    .timeline-item:last-child {
        border-bottom: none;
    }
    
    .timeline-marker {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        flex-shrink: 0;
    }
    
    .timeline-marker.session-start {
        background-color: var(--mailgo-purple);
    }
    
    .timeline-marker.session-complete {
        background-color: var(--mailgo-success);
    }
    
    .timeline-marker.page-view {
        background-color: #F59E0B;
    }
    
    .timeline-content {
        flex: 1;
        min-width: 0;
    }
    
    .timeline-event {
        font-weight: 500;
        color: var(--mailgo-text-primary);
        font-size: 0.875rem;
    }
    
    .timeline-time {
        font-size: 0.75rem;
        color: var(--mailgo-text-muted);
        margin-top: 0.25rem;
    }
    
    .timeline-url {
        font-size: 0.75rem;
        color: var(--mailgo-text-muted);
        font-family: monospace;
        margin-top: 0.25rem;
        word-break: break-all;
    }
    
    .event-distribution {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .distribution-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .distribution-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .event-type {
        font-size: 0.875rem;
        color: var(--mailgo-text-primary);
        font-family: monospace;
    }
    
    .event-count {
        font-size: 0.875rem;
        color: var(--mailgo-purple);
        font-weight: 600;
    }
    
    .distribution-bar {
        height: 0.5rem;
        background-color: var(--mailgo-bg-secondary);
        border-radius: 0.25rem;
        overflow: hidden;
    }
    
    .distribution-fill {
        height: 100%;
        background-color: var(--mailgo-purple);
        transition: width 0.3s ease;
    }
    
    .user-stats {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .user-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background-color: var(--mailgo-bg-secondary);
        border-radius: 0.25rem;
    }
    
    .no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        color: var(--mailgo-text-muted);
    }
    
    .no-data-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .no-data p {
        margin: 0;
        font-size: 1rem;
    }
    
    @media (max-width: 768px) {
        .analytics-grid {
            grid-template-columns: 1fr;
        }
        
        .stats-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
