<script>
    export let stats;
    
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };
    
    const formatPercentage = (num) => {
        return (num * 100).toFixed(1) + '%';
    };
</script>

<div class="stats-cards">
    <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
            <div class="stat-value">{formatNumber(stats.totalPlayers)}</div>
            <div class="stat-label">Total Players</div>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="stat-icon">🎮</div>
        <div class="stat-content">
            <div class="stat-value">{formatNumber(stats.totalSessions)}</div>
            <div class="stat-label">Total Sessions</div>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
            <div class="stat-value">{formatNumber(stats.completedSessions)}</div>
            <div class="stat-label">Completed Sessions</div>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
            <div class="stat-value">{stats.averageScore ? stats.averageScore.toFixed(1) : '0'}</div>
            <div class="stat-label">Average Score</div>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="stat-icon">👁️</div>
        <div class="stat-content">
            <div class="stat-value">{formatNumber(stats.uniqueVisitors)}</div>
            <div class="stat-label">Unique Visitors</div>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="stat-icon">📄</div>
        <div class="stat-content">
            <div class="stat-value">{formatNumber(stats.totalPageViews)}</div>
            <div class="stat-label">Page Views</div>
        </div>
    </div>
</div>

<style>
    .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
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
    
    @media (max-width: 768px) {
        .stats-cards {
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
