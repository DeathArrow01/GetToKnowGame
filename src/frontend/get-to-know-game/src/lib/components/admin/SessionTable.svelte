<script>
    export let sessions = [];
    export let currentPage = 1;
    export let pageSize = 20;
    export let totalSessions = 0;
    export let onPageChange = () => {};
    
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
    
    const getStatusBadge = (session) => {
        if (session.completedAt) {
            return { text: 'Completed', class: 'completed' };
        } else if (session.player2Id) {
            return { text: 'In Progress', class: 'in-progress' };
        } else {
            return { text: 'Waiting', class: 'waiting' };
        }
    };
    
    const totalPages = Math.ceil(totalSessions / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalSessions);
</script>

<div class="session-table">
    <div class="table-header">
        <div class="table-info">
            <h3 class="table-title">Sessions</h3>
            <p class="table-subtitle">
                Showing {startIndex}-{endIndex} of {totalSessions} sessions
            </p>
        </div>
    </div>
    
    {#if sessions.length > 0}
        <div class="table-container">
            <table class="sessions-table">
                <thead>
                    <tr>
                        <th>Session ID</th>
                        <th>Players</th>
                        <th>Created</th>
                        <th>Duration</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>IP Address</th>
                    </tr>
                </thead>
                <tbody>
                    {#each sessions as session}
                        <tr>
                            <td class="session-id">
                                <span class="id-short">{session.sessionId.substring(0, 8)}...</span>
                            </td>
                            <td class="players">
                                <div class="player-info">
                                    <span class="player-name">Player 1</span>
                                    {#if session.player2Id}
                                        <span class="player-separator">+</span>
                                        <span class="player-name">Player 2</span>
                                    {:else}
                                        <span class="waiting">Waiting for Player 2</span>
                                    {/if}
                                </div>
                            </td>
                            <td class="created">
                                {formatDate(session.createdAt)}
                            </td>
                            <td class="duration">
                                {formatDuration(session.createdAt, session.completedAt)}
                            </td>
                            <td class="score">
                                {#if session.score !== null && session.score !== undefined}
                                    <span class="score-value" style="color: {getScoreColor(session.score)}">
                                        {session.score}%
                                    </span>
                                {:else}
                                    <span class="no-score">-</span>
                                {/if}
                            </td>
                            <td class="status">
                                {@const status = getStatusBadge(session)}
                                <span class="status-badge {status.class}">{status.text}</span>
                            </td>
                            <td class="ip-address">
                                <span class="ip-text">{session.ipAddress}</span>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        {#if totalPages > 1}
            <div class="pagination">
                <div class="pagination-info">
                    Page {currentPage} of {totalPages}
                </div>
                
                <div class="pagination-controls">
                    <button 
                        class="pagination-btn"
                        disabled={currentPage <= 1}
                        on:click={() => onPageChange(currentPage - 1)}
                    >
                        ← Previous
                    </button>
                    
                    <div class="page-numbers">
                        {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                            const start = Math.max(1, currentPage - 2);
                            return start + i;
                        }).filter(page => page <= totalPages) as pageNum}
                            <button 
                                class="page-number"
                                class:active={pageNum === currentPage}
                                on:click={() => onPageChange(pageNum)}
                            >
                                {pageNum}
                            </button>
                        {/each}
                    </div>
                    
                    <button 
                        class="pagination-btn"
                        disabled={currentPage >= totalPages}
                        on:click={() => onPageChange(currentPage + 1)}
                    >
                        Next →
                    </button>
                </div>
            </div>
        {/if}
    {:else}
        <div class="empty-state">
            <div class="empty-icon">🎮</div>
            <h3>No Sessions Found</h3>
            <p>No game sessions have been created yet.</p>
        </div>
    {/if}
</div>

<style>
    .session-table {
        width: 100%;
    }
    
    .table-header {
        margin-bottom: 1rem;
    }
    
    .table-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
        margin: 0 0 0.25rem 0;
    }
    
    .table-subtitle {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
        margin: 0;
    }
    
    .table-container {
        overflow-x: auto;
        border-radius: 0.5rem;
        border: 1px solid var(--mailgo-border);
    }
    
    .sessions-table {
        width: 100%;
        border-collapse: collapse;
        background-color: var(--mailgo-bg-tertiary);
    }
    
    .sessions-table th {
        background-color: var(--mailgo-bg-secondary);
        color: var(--mailgo-text-primary);
        font-weight: 600;
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid var(--mailgo-border);
        font-size: 0.875rem;
    }
    
    .sessions-table td {
        padding: 1rem;
        border-bottom: 1px solid var(--mailgo-border);
        color: var(--mailgo-text-primary);
        font-size: 0.875rem;
    }
    
    .sessions-table tr:hover {
        background-color: var(--mailgo-bg-secondary);
    }
    
    .sessions-table tr:last-child td {
        border-bottom: none;
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
    
    .ip-text {
        font-family: monospace;
        font-size: 0.75rem;
        color: var(--mailgo-text-muted);
    }
    
    .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding: 1rem;
        background-color: var(--mailgo-bg-secondary);
        border-radius: 0.5rem;
    }
    
    .pagination-info {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
    }
    
    .pagination-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .pagination-btn {
        padding: 0.5rem 1rem;
        background-color: var(--mailgo-bg-tertiary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.25rem;
        color: var(--mailgo-text-primary);
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
    }
    
    .pagination-btn:hover:not(:disabled) {
        background-color: var(--mailgo-bg-secondary);
    }
    
    .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .page-numbers {
        display: flex;
        gap: 0.25rem;
    }
    
    .page-number {
        width: 2rem;
        height: 2rem;
        background-color: var(--mailgo-bg-tertiary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.25rem;
        color: var(--mailgo-text-primary);
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
    }
    
    .page-number:hover {
        background-color: var(--mailgo-bg-secondary);
    }
    
    .page-number.active {
        background-color: var(--mailgo-purple);
        color: white;
        border-color: var(--mailgo-purple);
    }
    
    .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        color: var(--mailgo-text-muted);
    }
    
    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .empty-state h3 {
        margin: 0 0 0.5rem 0;
        color: var(--mailgo-text-primary);
        font-size: 1.25rem;
    }
    
    .empty-state p {
        margin: 0;
        font-size: 1rem;
    }
    
    @media (max-width: 768px) {
        .pagination {
            flex-direction: column;
            gap: 1rem;
        }
        
        .pagination-controls {
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .sessions-table th,
        .sessions-table td {
            padding: 0.75rem 0.5rem;
        }
        
        .player-info {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>
