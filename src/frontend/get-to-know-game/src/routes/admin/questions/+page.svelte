<script>
    import { onMount } from 'svelte';
    import QuestionEditor from '$lib/components/admin/QuestionEditor.svelte';
    import BulkQuestionUpload from '$lib/components/admin/BulkQuestionUpload.svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    import { adminApi } from '$lib/services/adminApi.js';
    
    let questions = {};
    let sections = [];
    let totalQuestions = 0;
    let isLoading = false;
    let error = null;
    let showEditor = false;
    let showBulkUpload = false;
    let editingQuestion = null;
    let selectedSection = '';
    
    onMount(() => {
        loadQuestions();
    });
    
    async function loadQuestions() {
        try {
            isLoading = true;
            error = null;
            
            const data = await adminApi.getQuestions();
            questions = data.questionsBySection || {};
            totalQuestions = data.totalQuestions || 0;
            
            // Extract sections
            sections = Object.keys(questions).sort();
            
        } catch (err) {
            console.error('Questions loading error:', err);
            error = err.message || 'Failed to load questions';
        } finally {
            isLoading = false;
        }
    }
    
    function openEditor(question = null) {
        editingQuestion = question;
        showEditor = true;
    }
    
    function closeEditor() {
        showEditor = false;
        editingQuestion = null;
    }
    
    function openBulkUpload() {
        showBulkUpload = true;
    }
    
    function closeBulkUpload() {
        showBulkUpload = false;
    }
    
    async function handleQuestionSaved() {
        closeEditor();
        await loadQuestions();
    }
    
    async function handleBulkUploadComplete() {
        closeBulkUpload();
        await loadQuestions();
    }
    
    async function deleteQuestion(questionId) {
        if (!confirm('Are you sure you want to delete this question?')) {
            return;
        }
        
        try {
            await adminApi.deleteQuestion(questionId);
            await loadQuestions();
        } catch (err) {
            console.error('Delete error:', err);
            error = err.message || 'Failed to delete question';
        }
    }
    
    function filterBySection(section) {
        selectedSection = section;
    }
    
    function clearFilter() {
        selectedSection = '';
    }
</script>

<svelte:head>
    <title>Questions - Admin Dashboard</title>
</svelte:head>

<div class="questions-page">
    <div class="questions-header">
        <h1 class="page-title">Question Management</h1>
        <div class="header-actions">
            <button class="btn btn-secondary" on:click={openBulkUpload}>
                📤 Bulk Upload
            </button>
            <button class="btn btn-primary" on:click={() => openEditor()}>
                ➕ Add Question
            </button>
        </div>
    </div>
    
    {#if error}
        <ErrorMessage message={error} />
    {:else if isLoading}
        <div class="loading-container">
            <LoadingSpinner />
            <p>Loading questions...</p>
        </div>
    {:else}
        <div class="questions-content">
            <!-- Statistics -->
            <div class="questions-stats">
                <div class="stat-card">
                    <div class="stat-icon">❓</div>
                    <div class="stat-content">
                        <div class="stat-value">{totalQuestions}</div>
                        <div class="stat-label">Total Questions</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📁</div>
                    <div class="stat-content">
                        <div class="stat-value">{sections.length}</div>
                        <div class="stat-label">Sections</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <div class="stat-value">
                            {totalQuestions > 0 ? Math.round(totalQuestions / sections.length) : 0}
                        </div>
                        <div class="stat-label">Avg per Section</div>
                    </div>
                </div>
            </div>
            
            <!-- Section Filter -->
            <div class="section-filter">
                <h3>Filter by Section</h3>
                <div class="filter-buttons">
                    <button 
                        class="filter-btn" 
                        class:active={selectedSection === ''}
                        on:click={clearFilter}
                    >
                        All Sections
                    </button>
                    {#each sections as section}
                        <button 
                            class="filter-btn" 
                            class:active={selectedSection === section}
                            on:click={() => filterBySection(section)}
                        >
                            {section} ({questions[section]?.length || 0})
                        </button>
                    {/each}
                </div>
            </div>
            
            <!-- Questions by Section -->
            <div class="questions-sections">
                {#each sections as section}
                    {#if !selectedSection || selectedSection === section}
                        <div class="section-container">
                            <div class="section-header">
                                <h3 class="section-title">{section}</h3>
                                <span class="section-count">{questions[section]?.length || 0} questions</span>
                            </div>
                            
                            <div class="questions-list">
                                {#each questions[section] || [] as question}
                                    <div class="question-item">
                                        <div class="question-content">
                                            <div class="question-text">{question.questionText}</div>
                                            <div class="question-meta">
                                                <span class="question-id">ID: {question.id}</span>
                                            </div>
                                        </div>
                                        <div class="question-actions">
                                            <button 
                                                class="btn btn-sm btn-secondary"
                                                on:click={() => openEditor(question)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                class="btn btn-sm btn-danger"
                                                on:click={() => deleteQuestion(question.id)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                {/each}
                                
                                {#if (!questions[section] || questions[section].length === 0)}
                                    <div class="empty-section">
                                        <p>No questions in this section</p>
                                        <button 
                                            class="btn btn-sm btn-primary"
                                            on:click={() => openEditor({ section })}
                                        >
                                            Add First Question
                                        </button>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}
    
    <!-- Question Editor Modal -->
    {#if showEditor}
        <div class="modal-overlay" on:click={closeEditor}>
            <div class="modal-content" on:click|stopPropagation>
                <QuestionEditor 
                    question={editingQuestion}
                    {sections}
                    onSave={handleQuestionSaved}
                    onCancel={closeEditor}
                />
            </div>
        </div>
    {/if}
    
    <!-- Bulk Upload Modal -->
    {#if showBulkUpload}
        <div class="modal-overlay" on:click={closeBulkUpload}>
            <div class="modal-content" on:click|stopPropagation>
                <BulkQuestionUpload 
                    onComplete={handleBulkUploadComplete}
                    onCancel={closeBulkUpload}
                />
            </div>
        </div>
    {/if}
</div>

<style>
    .questions-page {
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .questions-header {
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
    
    .questions-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .questions-stats {
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
    
    .section-filter {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
    }
    
    .section-filter h3 {
        margin: 0 0 1rem 0;
        color: var(--mailgo-text-primary);
        font-size: 1.125rem;
        font-weight: 600;
    }
    
    .filter-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .filter-btn {
        padding: 0.5rem 1rem;
        background-color: var(--mailgo-bg-tertiary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.25rem;
        color: var(--mailgo-text-primary);
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
    }
    
    .filter-btn:hover {
        background-color: var(--mailgo-bg-secondary);
    }
    
    .filter-btn.active {
        background-color: var(--mailgo-purple);
        color: white;
        border-color: var(--mailgo-purple);
    }
    
    .questions-sections {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .section-container {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--mailgo-border);
    }
    
    .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
        margin: 0;
    }
    
    .section-count {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
        background-color: var(--mailgo-bg-tertiary);
        padding: 0.25rem 0.75rem;
        border-radius: 0.25rem;
    }
    
    .questions-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .question-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.5rem;
        transition: background-color 0.2s;
    }
    
    .question-item:hover {
        background-color: var(--mailgo-bg-secondary);
    }
    
    .question-content {
        flex: 1;
    }
    
    .question-text {
        font-size: 1rem;
        color: var(--mailgo-text-primary);
        margin-bottom: 0.5rem;
        line-height: 1.4;
    }
    
    .question-meta {
        display: flex;
        gap: 1rem;
    }
    
    .question-id {
        font-size: 0.75rem;
        color: var(--mailgo-text-muted);
        font-family: monospace;
    }
    
    .question-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .empty-section {
        text-align: center;
        padding: 2rem;
        color: var(--mailgo-text-muted);
    }
    
    .empty-section p {
        margin: 0 0 1rem 0;
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
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    @media (max-width: 768px) {
        .questions-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
        }
        
        .header-actions {
            justify-content: space-between;
        }
        
        .questions-stats {
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
        
        .question-item {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
        }
        
        .question-actions {
            justify-content: center;
        }
        
        .filter-buttons {
            justify-content: center;
        }
    }
</style>
