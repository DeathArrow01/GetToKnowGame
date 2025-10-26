<script>
    import { adminApi } from '$lib/services/adminApi.js';
    
    export let section = null;
    export let existingSections = [];
    export let onSave = () => {};
    export let onCancel = () => {};
    
    let formData = {
        newName: ''
    };
    let isLoading = false;
    let error = null;
    let isEditing = false;
    
    $: {
        if (section) {
            isEditing = true;
            formData.newName = section;
        } else {
            isEditing = false;
            formData.newName = '';
        }
    }
    
    async function handleSubmit() {
        if (!formData.newName.trim()) {
            error = 'Section name is required';
            return;
        }
        
        if (isEditing && formData.newName === section) {
            error = 'New name must be different from current name';
            return;
        }
        
        if (existingSections.includes(formData.newName)) {
            error = 'A section with this name already exists';
            return;
        }
        
        try {
            isLoading = true;
            error = null;
            
            if (isEditing) {
                // Rename existing section
                await adminApi.renameSection(section, formData.newName);
            } else {
                // Create new section using the dedicated endpoint
                await adminApi.createSection(formData.newName);
            }
            
            onSave();
        } catch (err) {
            console.error('Section save error:', err);
            error = err.message || `Failed to ${isEditing ? 'rename' : 'create'} section`;
        } finally {
            isLoading = false;
        }
    }
    
    function handleCancel() {
        onCancel();
    }
    
    function generateSectionName() {
        const baseName = 'New Section';
        let counter = 1;
        let newName = baseName;
        
        while (existingSections.includes(newName)) {
            newName = `${baseName} ${counter}`;
            counter++;
        }
        
        formData.newName = newName;
    }
</script>

<div class="section-manager">
    <div class="manager-header">
        <h3 class="manager-title">
            {isEditing ? 'Rename Section' : 'Create New Section'}
        </h3>
        <button class="close-btn" on:click={handleCancel}>
            ✕
        </button>
    </div>
    
    <form on:submit|preventDefault={handleSubmit} class="manager-form">
        {#if error}
            <div class="error-message">
                {error}
            </div>
        {/if}
        
        <div class="form-group">
            <label for="sectionName" class="form-label">
                {isEditing ? 'New Section Name' : 'Section Name'}
            </label>
            <div class="input-group">
                <input
                    id="sectionName"
                    type="text"
                    bind:value={formData.newName}
                    class="form-input"
                    placeholder="Enter section name..."
                    required
                />
                {#if !isEditing}
                    <button 
                        type="button" 
                        class="btn btn-sm btn-secondary"
                        on:click={generateSectionName}
                    >
                        Generate
                    </button>
                {/if}
            </div>
        </div>
        
        {#if isEditing}
            <div class="info-box">
                <h4>⚠️ Important</h4>
                <p>Renaming this section will update all questions in the section. This action cannot be undone.</p>
                <ul>
                    <li>Current name: <strong>{section}</strong></li>
                    <li>New name: <strong>{formData.newName}</strong></li>
                </ul>
            </div>
        {:else}
            <div class="info-box">
                <h4>ℹ️ Information</h4>
                <p>Creating a new section will add a sample question. You can edit or delete this question after creation.</p>
            </div>
        {/if}
        
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
                {isEditing ? 'Rename Section' : 'Create Section'}
            </button>
        </div>
    </form>
</div>

<style>
    .section-manager {
        background-color: var(--mailgo-bg-primary);
        border-radius: 0.75rem;
        overflow: hidden;
        max-width: 500px;
        width: 100%;
    }
    
    .manager-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background-color: var(--mailgo-bg-secondary);
        border-bottom: 1px solid var(--mailgo-border);
    }
    
    .manager-title {
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
    
    .manager-form {
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
    
    .input-group {
        display: flex;
        gap: 0.5rem;
    }
    
    .form-input {
        flex: 1;
        padding: 0.75rem;
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.25rem;
        color: var(--mailgo-text-primary);
        font-size: 0.875rem;
    }
    
    .form-input:focus {
        outline: none;
        border-color: var(--mailgo-purple);
    }
    
    .form-input::placeholder {
        color: var(--mailgo-text-muted);
    }
    
    .info-box {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.5rem;
        padding: 1rem;
    }
    
    .info-box h4 {
        margin: 0 0 0.5rem 0;
        color: var(--mailgo-text-primary);
        font-size: 0.875rem;
        font-weight: 600;
    }
    
    .info-box p {
        margin: 0 0 0.75rem 0;
        color: var(--mailgo-text-muted);
        font-size: 0.875rem;
        line-height: 1.4;
    }
    
    .info-box ul {
        margin: 0;
        padding-left: 1.5rem;
        color: var(--mailgo-text-muted);
        font-size: 0.875rem;
    }
    
    .info-box li {
        margin-bottom: 0.25rem;
    }
    
    .info-box strong {
        color: var(--mailgo-text-primary);
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
    
    .btn-sm {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
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
        .section-manager {
            max-width: 100%;
            margin: 1rem;
        }
        
        .manager-header {
            padding: 1rem;
        }
        
        .manager-form {
            padding: 1rem;
        }
        
        .input-group {
            flex-direction: column;
        }
        
        .form-actions {
            flex-direction: column;
        }
        
        .btn {
            justify-content: center;
        }
    }
</style>
