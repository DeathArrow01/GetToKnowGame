<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { sessionService } from '$lib/services/sessionService.js';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    
    let sessionData = null;
    let isLoading = true;
    let error = null;
    let copySuccess = false;
    
    let sessionId = '';
    let shareableUrl = '';
    
    // Get session ID from URL params
    $: {
        sessionId = $page.params.sessionId || '';
        shareableUrl = typeof window !== 'undefined' ? `${window.location.origin}/session/${sessionId}` : '';
    }
    
    // Load session when component mounts and sessionId is available
    onMount(() => {
        if (sessionId) {
            loadSession();
        }
    });
    
    async function loadSession() {
        try {
            console.log('Loading session with ID:', sessionId);
            if (!sessionId) {
                error = 'Session ID is missing from URL';
                isLoading = false;
                return;
            }
            sessionData = await sessionService.getSession(sessionId);
        } catch (err) {
            console.error('Error loading session:', err);
            error = err.message || 'Failed to load session';
        } finally {
            isLoading = false;
        }
    }
    
    async function copyLink() {
        try {
            await navigator.clipboard.writeText(shareableUrl);
            copySuccess = true;
            setTimeout(() => copySuccess = false, 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareableUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            copySuccess = true;
            setTimeout(() => copySuccess = false, 2000);
        }
    }
</script>

<svelte:head>
    <title>Game Created - Get to Know Game</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
            {#if isLoading}
                <LoadingSpinner text="Loading your game session..." />
            {:else if error}
                <ErrorMessage message={error} />
            {:else if sessionData}
                <!-- Success Message -->
                <div class="text-center mb-8">
                    <div class="text-6xl mb-4">🎉</div>
                    <h1 class="text-4xl font-bold text-primary mb-4">
                        Thank you for playing!
                    </h1>
                    <p class="text-xl text-base-content/80">
                        Now it's time for <span class="font-bold text-secondary">{sessionData.player2Name}</span> to answer.
                    </p>
                </div>
                
                <!-- Share Card -->
                <div class="card bg-base-100 shadow-2xl">
                    <div class="card-body p-8">
                        <h2 class="card-title text-2xl mb-6 justify-center">
                            Share the Game
                        </h2>
                        
                        <div class="form-control mb-6">
                            <label class="label">
                                <span class="label-text font-semibold">Session Link</span>
                            </label>
                            <div class="input-group">
                                <input 
                                    type="text" 
                                    value={shareableUrl}
                                    readonly
                                    class="input input-bordered flex-1"
                                />
                                <button 
                                    class="btn btn-primary"
                                    on:click={copyLink}
                                    class:btn-success={copySuccess}
                                >
                                    {#if copySuccess}
                                        ✓ Copied!
                                    {:else}
                                        Copy Link
                                    {/if}
                                </button>
                            </div>
                        </div>
                        
                        <div class="alert alert-info">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                                <h3 class="font-bold">Instructions</h3>
                                <div class="text-xs">
                                    Copy the link above and share it with {sessionData.player2Name}. 
                                    They'll answer the same questions, and then you can both see your compatibility results!
                                </div>
                            </div>
                        </div>
                        
                        <div class="card-actions justify-center mt-6">
                            <button 
                                class="btn btn-outline"
                                on:click={() => window.location.href = shareableUrl}
                            >
                                View Game Link
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Next Steps -->
                <div class="mt-8">
                    <div class="stats shadow bg-base-100">
                        <div class="stat">
                            <div class="stat-title">Step 1</div>
                            <div class="stat-desc">Share the link with your friend</div>
                        </div>
                        <div class="stat">
                            <div class="stat-title">Step 2</div>
                            <div class="stat-desc">Wait for them to answer</div>
                        </div>
                        <div class="stat">
                            <div class="stat-title">Step 3</div>
                            <div class="stat-desc">Check back for results!</div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
