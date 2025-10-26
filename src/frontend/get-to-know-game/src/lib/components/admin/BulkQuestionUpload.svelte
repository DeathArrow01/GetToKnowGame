<script>
    import { adminApi } from '$lib/services/adminApi.js';
    
    export let onComplete = () => {};
    export let onCancel = () => {};
    
    let fileInput;
    let selectedFile = null;
    let csvData = [];
    let parsedQuestions = [];
    let isLoading = false;
    let error = null;
    let success = null;
    let uploadProgress = 0;
    
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            selectedFile = file;
            parseCSV(file);
        } else {
            error = 'Please select a valid CSV file';
        }
    }
    
    function parseCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    error = 'CSV file must have at least a header row and one data row';
                    return;
                }
                
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                const requiredHeaders = ['section', 'question'];
                
                if (!requiredHeaders.every(header => headers.includes(header))) {
                    error = 'CSV file must have "section" and "question" columns';
                    return;
                }
                
                parsedQuestions = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim());
                    if (values.length >= 2) {
                        const sectionIndex = headers.indexOf('section');
                        const questionIndex = headers.indexOf('question');
                        
                        parsedQuestions.push({
                            section: values[sectionIndex] || '',
                            questionText: values[questionIndex] || ''
                        });
                    }
                }
                
                if (parsedQuestions.length === 0) {
                    error = 'No valid questions found in CSV file';
                    return;
                }
                
                error = null;
                success = `Successfully parsed ${parsedQuestions.length} questions from CSV`;
            } catch (err) {
                error = 'Error parsing CSV file: ' + err.message;
            }
        };
        reader.readAsText(file);
    }
    
    async function uploadQuestions() {
        if (parsedQuestions.length === 0) {
            error = 'No questions to upload';
            return;
        }
        
        try {
            isLoading = true;
            error = null;
            success = null;
            uploadProgress = 0;
            
            const result = await adminApi.bulkCreateQuestions(parsedQuestions);
            uploadProgress = 100;
            
            if (result.errors && result.errors.length > 0) {
                success = `Uploaded ${result.created} of ${result.total} questions. ${result.errors.length} errors occurred.`;
                error = 'Some questions failed to upload: ' + result.errors.join(', ');
            } else {
                success = `Successfully uploaded ${result.created} questions`;
            }
            
            // Auto-close after 2 seconds if successful
            if (!result.errors || result.errors.length === 0) {
                setTimeout(() => {
                    onComplete();
                }, 2000);
            }
            
        } catch (err) {
            console.error('Upload error:', err);
            error = err.message || 'Failed to upload questions';
        } finally {
            isLoading = false;
        }
    }
    
    function handleCancel() {
        onCancel();
    }
    
    function downloadTemplate() {
        const csvContent = 'section,question\n"Getting to Know You","What is your favorite hobby?"\n"Getting to Know You","If you could travel anywhere, where would you go?"\n"Values & Beliefs","What is most important to you in life?"\n"Values & Beliefs","How do you handle stress?"';
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questions_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }
</script>

<div class="bulk-upload">
    <div class="upload-header">
        <h3 class="upload-title">Bulk Question Upload</h3>
        <button class="close-btn" on:click={handleCancel}>
            ✕
        </button>
    </div>
    
    <div class="upload-content">
        <!-- Instructions -->
        <div class="instructions">
            <h4>Instructions</h4>
            <ol>
                <li>Download the CSV template to see the required format</li>
                <li>Fill in your questions with sections and question text</li>
                <li>Upload the CSV file to bulk create questions</li>
            </ol>
            <button class="btn btn-secondary" on:click={downloadTemplate}>
                📥 Download Template
            </button>
        </div>
        
        <!-- File Upload -->
        <div class="file-upload">
            <h4>Upload CSV File</h4>
            <div class="upload-area" class:has-file={selectedFile}>
                <input 
                    type="file" 
                    accept=".csv"
                    bind:this={fileInput}
                    on:change={handleFileSelect}
                    class="file-input"
                />
                {#if selectedFile}
                    <div class="file-info">
                        <span class="file-name">📄 {selectedFile.name}</span>
                        <span class="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                {:else}
                    <div class="upload-placeholder">
                        <span class="upload-icon">📁</span>
                        <p>Click to select CSV file or drag and drop</p>
                        <small>CSV files only</small>
                    </div>
                {/if}
            </div>
        </div>
        
        <!-- Preview -->
        {#if parsedQuestions.length > 0}
            <div class="preview">
                <h4>Preview ({parsedQuestions.length} questions)</h4>
                <div class="preview-list">
                    {#each parsedQuestions.slice(0, 5) as question, index}
                        <div class="preview-item">
                            <span class="preview-section">{question.section}</span>
                            <span class="preview-question">{question.questionText}</span>
                        </div>
                    {/each}
                    {#if parsedQuestions.length > 5}
                        <div class="preview-more">
                            ... and {parsedQuestions.length - 5} more questions
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
        
        <!-- Messages -->
        {#if error}
            <div class="error-message">
                {error}
            </div>
        {/if}
        
        {#if success}
            <div class="success-message">
                {success}
            </div>
        {/if}
        
        <!-- Progress -->
        {#if isLoading}
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {uploadProgress}%"></div>
                </div>
                <span class="progress-text">Uploading questions...</span>
            </div>
        {/if}
        
        <!-- Actions -->
        <div class="upload-actions">
            <button 
                class="btn btn-secondary"
                on:click={handleCancel}
                disabled={isLoading}
            >
                Cancel
            </button>
            <button 
                class="btn btn-primary"
                on:click={uploadQuestions}
                disabled={isLoading || parsedQuestions.length === 0}
            >
                {#if isLoading}
                    <span class="loading-spinner"></span>
                {/if}
                Upload {parsedQuestions.length} Questions
            </button>
        </div>
    </div>
</div>

<style>
    .bulk-upload {
        background-color: var(--mailgo-bg-primary);
        border-radius: 0.75rem;
        overflow: hidden;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .upload-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background-color: var(--mailgo-bg-secondary);
        border-bottom: 1px solid var(--mailgo-border);
    }
    
    .upload-title {
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
    
    .upload-content {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .instructions {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.5rem;
        padding: 1rem;
    }
    
    .instructions h4 {
        margin: 0 0 0.75rem 0;
        color: var(--mailgo-text-primary);
        font-size: 1rem;
        font-weight: 600;
    }
    
    .instructions ol {
        margin: 0 0 1rem 0;
        padding-left: 1.5rem;
        color: var(--mailgo-text-muted);
        font-size: 0.875rem;
    }
    
    .instructions li {
        margin-bottom: 0.25rem;
    }
    
    .file-upload h4 {
        margin: 0 0 0.75rem 0;
        color: var(--mailgo-text-primary);
        font-size: 1rem;
        font-weight: 600;
    }
    
    .upload-area {
        border: 2px dashed var(--mailgo-border);
        border-radius: 0.5rem;
        padding: 2rem;
        text-align: center;
        transition: all 0.2s;
        cursor: pointer;
        position: relative;
    }
    
    .upload-area:hover {
        border-color: var(--mailgo-purple);
        background-color: var(--mailgo-bg-secondary);
    }
    
    .upload-area.has-file {
        border-color: var(--mailgo-success);
        background-color: var(--mailgo-bg-secondary);
    }
    
    .file-input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
    }
    
    .file-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .file-name {
        font-weight: 500;
        color: var(--mailgo-text-primary);
    }
    
    .file-size {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
    }
    
    .upload-placeholder {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .upload-icon {
        font-size: 2rem;
    }
    
    .upload-placeholder p {
        margin: 0;
        color: var(--mailgo-text-primary);
        font-weight: 500;
    }
    
    .upload-placeholder small {
        color: var(--mailgo-text-muted);
    }
    
    .preview {
        background-color: var(--mailgo-bg-secondary);
        border: 1px solid var(--mailgo-border);
        border-radius: 0.5rem;
        padding: 1rem;
    }
    
    .preview h4 {
        margin: 0 0 0.75rem 0;
        color: var(--mailgo-text-primary);
        font-size: 1rem;
        font-weight: 600;
    }
    
    .preview-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .preview-item {
        display: flex;
        gap: 1rem;
        padding: 0.5rem;
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.25rem;
    }
    
    .preview-section {
        font-weight: 500;
        color: var(--mailgo-purple);
        min-width: 120px;
        font-size: 0.875rem;
    }
    
    .preview-question {
        color: var(--mailgo-text-primary);
        font-size: 0.875rem;
    }
    
    .preview-more {
        text-align: center;
        color: var(--mailgo-text-muted);
        font-style: italic;
        font-size: 0.875rem;
        padding: 0.5rem;
    }
    
    .error-message {
        padding: 0.75rem;
        background-color: var(--mailgo-error);
        color: white;
        border-radius: 0.25rem;
        font-size: 0.875rem;
    }
    
    .success-message {
        padding: 0.75rem;
        background-color: var(--mailgo-success);
        color: white;
        border-radius: 0.25rem;
        font-size: 0.875rem;
    }
    
    .progress-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .progress-bar {
        height: 0.5rem;
        background-color: var(--mailgo-bg-tertiary);
        border-radius: 0.25rem;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background-color: var(--mailgo-purple);
        transition: width 0.3s ease;
    }
    
    .progress-text {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
        text-align: center;
    }
    
    .upload-actions {
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
        .bulk-upload {
            max-width: 100%;
            margin: 1rem;
        }
        
        .upload-header {
            padding: 1rem;
        }
        
        .upload-content {
            padding: 1rem;
        }
        
        .upload-actions {
            flex-direction: column;
        }
        
        .btn {
            justify-content: center;
        }
        
        .preview-item {
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .preview-section {
            min-width: auto;
        }
    }
</style>
