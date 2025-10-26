<script>
    import { onMount } from 'svelte';
    import { adminApi } from '$lib/services/adminApi.js';
    
    export let question = null;
    export let sections = [];
    export let onSave = () => {};
    export let onCancel = () => {};
    
    let formData = {
        section: '',
        questionText: ''
    };
    let isLoading = false;
    let error = null;
    let isEditing = false;
    
    onMount(() => {
        if (question) {
            isEditing = true;
            formData = {
                section: question.section || '',
                questionText: question.questionText || ''
            };
        } else {
            isEditing = false;
            formData = {
                section: '',
                questionText: ''
            };
        }
    });
    
    async function handleSubmit() {
        if (!formData.section.trim() || !formData.questionText.trim()) {
            error = 'Section and question text are required';
            return;
        }
        
        try {
            isLoading = true;
            error = null;
            
            if (isEditing) {
                await adminApi.updateQuestion(question.id, formData);
            } else {
                await adminApi.createQuestion(formData);
            }
            
            onSave();
        } catch (err) {
            console.error('Question save error:', err);
            error = err.message || `Failed to ${isEditing ? 'update' : 'create'} question`;
        } finally {
            isLoading = false;
        }
    }
    
    function handleCancel() {
        onCancel();
    }
</script>

<div class="question-editor">
    <div class="editor-header">
        <h3 class="editor-title">
            {isEditing ? 'Edit Question' : 'Add New Question'}
        </h3>
        <button class="close-btn" on:click={handleCancel}>
            ✕
        </button>
    </div>
    
    <form on:submit|preventDefault={handleSubmit} class="editor-form">
        {#if error}
            <div class="error-message">
                {error}
            </div>
        {/if}
        
        <div class="form-group">
            <label for="section" class="form-label">Section</label>
            <select 
                id="section"
                bind:value={formData.section}
                class="form-select"
                required
            >
                <option value="">Select a section</option>
                {#each sections as section}
                    <option value={section}>{section}</option>
                {/each}
            </select>
        </div>
        
        <div class="form-group">
            <label for="questionText" class="form-label">Question Text</label>
            <textarea
                id="questionText"
                bind:value={formData.questionText}
                class="form-textarea"
                placeholder="Enter your question here..."
                rows="4"
                required
            ></textarea>
        </div>
        
        <div class="form-actions">
            <button 
                type="button" 
                class="btn btn-secondary"
                on:click={handleCancel}
                disabled={isLoading}
            >
                Cancel
            </button>
            <button 
                type="submit" 
                class="btn btn-primary"
                disabled={isLoading}
            >
                {#if isLoading}
                    <span class="loading-spinner"></span>
                {/if}
                {isEditing ? 'Update Question' : 'Create Question'}
            </button>
        </div>
    </form>
</div>

<style>
    .question-editor {
        background-color: var(--mailgo-bg-primary);
        border-radius: 0.75rem;
        overflow: hidden;
        max-width: 500px;
        width: 100%;
    }
    
    .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background-color: var(--mailgo-bg-secondary);
        border-bottom: 1px solid var(--mailgo-border);
    }
    
    .editor-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
        margin: 0;
    }
    
    .close-btn {
        background: none;
        border: none;
        color: var(--mailgo-text-muted);
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.25rem;
        transition: background-color 0.2s;
    }
    
    .close-btn:hover {
        background-color: var(--mailgo-bg-tertiary);
    }
    
    .editor-form {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .error-message {
        padding: 0.75rem;
        background-color: var(--mailgo-error);
        color: white;
        border-radius: 0.25rem;
        font-size: 0.875rem;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .form-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--mailgo-text-primary);
    }
    
    .form-select {
        padding: 0.75rem;
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.25rem;
        color: var(--mailgo-text-primary);
        font-size: 0.875rem;
        cursor: pointer;
    }
    
    .form-select:focus {
        outline: none;
        border-color: var(--mailgo-purple);
    }
    
    .form-textarea {
        padding: 0.75rem;
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.25rem;
        color: var(--mailgo-text-primary);
        font-size: 0.875rem;
        font-family: inherit;
        resize: vertical;
        min-height: 100px;
    }
    
    .form-textarea:focus {
        outline: none;
        border-color: var(--mailgo-purple);
    }
    
    .form-textarea::placeholder {
        color: var(--mailgo-text-muted);
    }
    
    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
    
    .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .btn-primary {
        background-color: var(--mailgo-purple);
        color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
        background-color: var(--mailgo-purple-hover);
    }
    
    .btn-secondary {
        background-color: var(--mailgo-bg-tertiary);
        color: var(--mailgo-text-primary);
        border: 1px solid var(--mailgo-border);
    }
    
    .btn-secondary:hover:not(:disabled) {
        background-color: var(--mailgo-bg-secondary);
    }
    
    .loading-spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    
    @media (max-width: 768px) {
        .question-editor {
            max-width: 100%;
            margin: 1rem;
        }
        
        .editor-header {
            padding: 1rem;
        }
        
        .editor-form {
            padding: 1rem;
        }
        
        .form-actions {
            flex-direction: column;
        }
        
        .btn {
            justify-content: center;
        }
    }
</style>
