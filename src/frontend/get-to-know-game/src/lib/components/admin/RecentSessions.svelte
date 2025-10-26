<script>
    import { onMount } from 'svelte';
    
    export let sessions = [];
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };
    
    const formatDuration = (createdAt, completedAt) => {
        if (!completedAt) return 'In Progress';
        
        const start = new Date(createdAt);
        const end = new Date(completedAt);
        const duration = Math.round((end - start) / 1000 / 60); // minutes
        
        if (duration < 60) {
            return `${duration}m`;
        } else {
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            return `${hours}h ${minutes}m`;
        }
    };
    
    const getScoreColor = (score) => {
        if (!score) return 'var(--mailgo-text-muted)';
        if (score >= 80) return 'var(--mailgo-success)';
        if (score >= 60) return '#F59E0B';
        return 'var(--mailgo-error)';
    };
</script>

<div class="recent-sessions">
    {#if sessions && sessions.length > 0}
        <div class="sessions-table">
            <div class="table-header">
                <div class="header-cell">Session ID</div>
                <div class="header-cell">Players</div>
                <div class="header-cell">Created</div>
                <div class="header-cell">Duration</div>
                <div class="header-cell">Score</div>
                <div class="header-cell">Status</div>
            </div>
            
            <div class="table-body">
                {#each sessions.slice(0, 10) as session}
                    <div class="table-row">
                        <div class="table-cell session-id">
                            <span class="id-short">{session.sessionId.substring(0, 8)}...</span>
                        </div>
                        <div class="table-cell players">
                            <div class="player-info">
                                <span class="player-name">{session.player1Name || 'Player 1'}</span>
                                {#if session.player2Name}
                                    <span class="player-separator">+</span>
                                    <span class="player-name">{session.player2Name}</span>
                                {:else}
                                    <span class="waiting">Waiting for Player 2</span>
                                {/if}
                            </div>
                        </div>
                        <div class="table-cell created">
                            {formatDate(session.createdAt)}
                        </div>
                        <div class="table-cell duration">
                            {formatDuration(session.createdAt, session.completedAt)}
                        </div>
                        <div class="table-cell score">
                            {#if session.score !== null && session.score !== undefined}
                                <span class="score-value" style="color: {getScoreColor(session.score)}">
                                    {session.score}%
                                </span>
                            {:else}
                                <span class="no-score">-</span>
                            {/if}
                        </div>
                        <div class="table-cell status">
                            {#if session.completedAt}
                                <span class="status-badge completed">Completed</span>
                            {:else if session.player2Name}
                                <span class="status-badge in-progress">In Progress</span>
                            {:else}
                                <span class="status-badge waiting">Waiting</span>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        
        {#if sessions.length > 10}
            <div class="table-footer">
                <p class="showing-info">Showing 10 of {sessions.length} recent sessions</p>
            </div>
        {/if}
    {:else}
        <div class="no-sessions">
            <div class="no-sessions-icon">🎮</div>
            <p>No recent sessions found</p>
        </div>
    {/if}
</div>

<style>
    .recent-sessions {
        width: 100%;
    }
    
    .sessions-table {
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.5rem;
        overflow: hidden;
    }
    
    .table-header {
        display: grid;
        grid-template-columns: 1fr 2fr 1.5fr 1fr 1fr 1fr;
        gap: 1rem;
        padding: 1rem;
        background-color: var(--mailgo-bg-secondary);
        border-bottom: 1px solid var(--mailgo-border);
        font-weight: 600;
        color: var(--mailgo-text-primary);
        font-size: 0.875rem;
    }
    
    .table-body {
        max-height: 400px;
        overflow-y: auto;
    }
    
    .table-row {
        display: grid;
        grid-template-columns: 1fr 2fr 1.5fr 1fr 1fr 1fr;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid var(--mailgo-border);
        transition: background-color 0.2s;
    }
    
    .table-row:hover {
        background-color: var(--mailgo-bg-secondary);
    }
    
    .table-row:last-child {
        border-bottom: none;
    }
    
    .table-cell {
        display: flex;
        align-items: center;
        font-size: 0.875rem;
        color: var(--mailgo-text-primary);
    }
    
    .session-id {
        font-family: monospace;
        font-size: 0.75rem;
    }
    
    .id-short {
        background-color: var(--mailgo-bg-secondary);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        color: var(--mailgo-text-muted);
    }
    
    .player-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .player-name {
        font-weight: 500;
    }
    
    .player-separator {
        color: var(--mailgo-text-muted);
        font-weight: 600;
    }
    
    .waiting {
        color: var(--mailgo-text-muted);
        font-style: italic;
        font-size: 0.75rem;
    }
    
    .score-value {
        font-weight: 600;
        font-family: monospace;
    }
    
    .no-score {
        color: var(--mailgo-text-muted);
    }
    
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .status-badge.completed {
        background-color: var(--mailgo-success);
        color: white;
    }
    
    .status-badge.in-progress {
        background-color: #F59E0B;
        color: white;
    }
    
    .status-badge.waiting {
        background-color: var(--mailgo-text-muted);
        color: white;
    }
    
    .table-footer {
        padding: 1rem;
        text-align: center;
        border-top: 1px solid var(--mailgo-border);
    }
    
    .showing-info {
        margin: 0;
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
    }
    
    .no-sessions {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        color: var(--mailgo-text-muted);
    }
    
    .no-sessions-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .no-sessions p {
        margin: 0;
        font-size: 1rem;
    }
    
    @media (max-width: 768px) {
        .table-header,
        .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
        }
        
        .header-cell,
        .table-cell {
            padding: 0.5rem 0;
        }
        
        .header-cell:not(:first-child)::before {
            content: attr(data-label) ': ';
            font-weight: 600;
            color: var(--mailgo-text-muted);
        }
    }
</style>
