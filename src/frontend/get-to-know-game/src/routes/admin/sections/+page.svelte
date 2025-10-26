<script>
    import { onMount } from 'svelte';
    import SectionManager from '$lib/components/admin/SectionManager.svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    import { adminApi } from '$lib/services/adminApi.js';
    
    let sections = {};
    let totalSections = 0;
    let totalQuestions = 0;
    let isLoading = false;
    let error = null;
    let showManager = false;
    let editingSection = null;
    
    onMount(() => {
        loadSections();
    });
    
    async function loadSections() {
        try {
            isLoading = true;
            error = null;
            
            const data = await adminApi.getSections();
            sections = data.sections || {};
            totalSections = data.totalSections || 0;
            totalQuestions = Object.values(sections).reduce((sum, count) => sum + count, 0);
            
        } catch (err) {
            console.error('Sections loading error:', err);
            error = err.message || 'Failed to load sections';
        } finally {
            isLoading = false;
        }
    }
    
    function openManager(section = null) {
        editingSection = section;
        showManager = true;
    }
    
    function closeManager() {
        showManager = false;
        editingSection = null;
    }
    
    async function handleSectionSaved() {
        closeManager();
        await loadSections();
    }
    
    async function deleteSection(sectionName) {
        if (!confirm(`Are you sure you want to delete the section "${sectionName}" and all its questions? This action cannot be undone.`)) {
            return;
        }
        
        try {
            await adminApi.deleteSection(sectionName);
            await loadSections();
        } catch (err) {
            console.error('Delete error:', err);
            error = err.message || 'Failed to delete section';
        }
    }
    
    const sortedSections = Object.entries(sections).sort((a, b) => b[1] - a[1]);
</script>

<svelte:head>
    <title>Sections - Admin Dashboard</title>
</svelte:head>

<div class="sections-page">
    <div class="sections-header">
        <h1 class="page-title">Section Management</h1>
        <div class="header-actions">
            <button class="btn btn-primary" on:click={() => openManager()}>
                ➕ Add Section
            </button>
        </div>
    </div>
    
    {#if error}
        <ErrorMessage message={error} />
    {:else if isLoading}
        <div class="loading-container">
            <LoadingSpinner />
            <p>Loading sections...</p>
        </div>
    {:else}
        <div class="sections-content">
            <!-- Statistics -->
            <div class="sections-stats">
                <div class="stat-card">
                    <div class="stat-icon">📁</div>
                    <div class="stat-content">
                        <div class="stat-value">{totalSections}</div>
                        <div class="stat-label">Total Sections</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">❓</div>
                    <div class="stat-content">
                        <div class="stat-value">{totalQuestions}</div>
                        <div class="stat-label">Total Questions</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <div class="stat-value">
                            {totalSections > 0 ? Math.round(totalQuestions / totalSections) : 0}
                        </div>
                        <div class="stat-label">Avg per Section</div>
                    </div>
                </div>
            </div>
            
            <!-- Sections List -->
            <div class="sections-list">
                <div class="list-header">
                    <h3>All Sections</h3>
                    <p>Manage question sections and their content</p>
                </div>
                
                {#if sortedSections.length > 0}
                    <div class="sections-grid">
                        {#each sortedSections as [sectionName, questionCount]}
                            <div class="section-card">
                                <div class="section-header">
                                    <h4 class="section-name">{sectionName}</h4>
                                    <span class="question-count">{questionCount} questions</span>
                                </div>
                                
                                <div class="section-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">Questions</span>
                                        <span class="stat-value">{questionCount}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Percentage</span>
                                        <span class="stat-value">
                                            {totalQuestions > 0 ? Math.round((questionCount / totalQuestions) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="section-actions">
                                    <button 
                                        class="btn btn-sm btn-secondary"
                                        on:click={() => openManager(sectionName)}
                                    >
                                        ✏️ Rename
                                    </button>
                                    <button 
                                        class="btn btn-sm btn-danger"
                                        on:click={() => deleteSection(sectionName)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="empty-state">
                        <div class="empty-icon">📁</div>
                        <h3>No Sections Found</h3>
                        <p>Create your first section to organize questions</p>
                        <button class="btn btn-primary" on:click={() => openManager()}>
                            ➕ Create First Section
                        </button>
                    </div>
                {/if}
            </div>
            
            <!-- Section Usage Chart -->
            {#if sortedSections.length > 0}
                <div class="usage-chart">
                    <h3>Section Distribution</h3>
                    <div class="chart-container">
                        {#each sortedSections as [sectionName, questionCount]}
                            <div class="chart-item">
                                <div class="chart-label">
                                    <span class="section-name">{sectionName}</span>
                                    <span class="section-count">{questionCount} questions</span>
                                </div>
                                <div class="chart-bar">
                                    <div 
                                        class="chart-fill" 
                                        style="width: {totalQuestions > 0 ? (questionCount / totalQuestions) * 100 : 0}%"
                                    ></div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {/if}
    
    <!-- Section Manager Modal -->
    {#if showManager}
        <div class="modal-overlay" on:click={closeManager}>
            <div class="modal-content" on:click|stopPropagation>
                <SectionManager 
                    section={editingSection}
                    existingSections={Object.keys(sections)}
                    onSave={handleSectionSaved}
                    onCancel={closeManager}
                />
            </div>
        </div>
    {/if}
</div>

<style>
    .sections-page {
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .sections-header {
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
        gap: 1rem;
    }
    
    .btn {
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .btn-primary {
        background-color: var(--mailgo-purple);
        color: white;
    }
    
    .btn-primary:hover {
        background-color: var(--mailgo-purple-hover);
    }
    
    .btn-secondary {
        background-color: var(--mailgo-bg-tertiary);
        color: var(--mailgo-text-primary);
        border: 1px solid var(--mailgo-border);
    }
    
    .btn-secondary:hover {
        background-color: var(--mailgo-bg-secondary);
    }
    
    .btn-sm {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
    }
    
    .btn-danger {
        background-color: var(--mailgo-error);
        color: white;
    }
    
    .btn-danger:hover {
        background-color: #dc2626;
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
    
    .sections-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .sections-stats {
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
    
    .sections-list {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
    }
    
    .list-header {
        margin-bottom: 1.5rem;
    }
    
    .list-header h3 {
        margin: 0 0 0.5rem 0;
        color: var(--mailgo-text-primary);
        font-size: 1.25rem;
        font-weight: 600;
    }
    
    .list-header p {
        margin: 0;
        color: var(--mailgo-text-muted);
        font-size: 0.875rem;
    }
    
    .sections-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    
    .section-card {
        background-color: var(--mailgo-bg-tertiary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.5rem;
        padding: 1.5rem;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .section-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .section-name {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
        margin: 0;
    }
    
    .question-count {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
        background-color: var(--mailgo-bg-secondary);
        padding: 0.25rem 0.75rem;
        border-radius: 0.25rem;
    }
    
    .section-stats {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding: 1rem;
        background-color: var(--mailgo-bg-secondary);
        border-radius: 0.25rem;
    }
    
    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    
    .stat-item .stat-label {
        font-size: 0.75rem;
        color: var(--mailgo-text-muted);
        margin-bottom: 0.25rem;
    }
    
    .stat-item .stat-value {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
    }
    
    .section-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }
    
    .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        color: var(--mailgo-text-muted);
    }
    
    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    
    .empty-state h3 {
        margin: 0 0 0.5rem 0;
        color: var(--mailgo-text-primary);
        font-size: 1.25rem;
    }
    
    .empty-state p {
        margin: 0 0 1.5rem 0;
    }
    
    .usage-chart {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
    }
    
    .usage-chart h3 {
        margin: 0 0 1rem 0;
        color: var(--mailgo-text-primary);
        font-size: 1.25rem;
        font-weight: 600;
    }
    
    .chart-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .chart-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .chart-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .chart-label .section-name {
        font-weight: 500;
        color: var(--mailgo-text-primary);
    }
    
    .chart-label .section-count {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
    }
    
    .chart-bar {
        height: 0.5rem;
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.25rem;
        overflow: hidden;
    }
    
    .chart-fill {
        height: 100%;
        background-color: var(--mailgo-purple);
        transition: width 0.3s ease;
    }
    
    /* Modal Styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }
    
    .modal-content {
        background-color: var(--mailgo-bg-primary);
        border-radius: 0.75rem;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    @media (max-width: 768px) {
        .sections-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
        }
        
        .sections-stats {
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
        
        .sections-grid {
            grid-template-columns: 1fr;
        }
        
        .section-actions {
            flex-direction: column;
        }
    }
</style>
