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

<div class="min-h-screen gradient-bg">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            {#if isLoading}
                <div class="text-center py-20">
                    <div class="loading-modern mx-auto mb-4"></div>
                    <p class="text-secondary text-lg">Loading your game session...</p>
                </div>
            {:else if error}
                <div class="alert-modern alert-error max-w-2xl mx-auto">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{error}</span>
                </div>
            {:else if sessionData}
                <!-- Success Message -->
                <div class="text-center mb-12">
                    <div class="w-24 h-24 bg-gradient-purple rounded-full flex items-center justify-center mx-auto mb-6">
                        <span class="text-5xl">🎉</span>
                    </div>
                    <h1 class="text-5xl font-bold text-gradient mb-6">
                        Thank you for playing!
                    </h1>
                    <p class="text-xl text-secondary max-w-2xl mx-auto">
                        Now it's time for <span class="font-bold text-primary">{sessionData.player2Name}</span> to answer.
                    </p>
                </div>
                
                <!-- Share Card -->
                <div class="card-modern p-8 mb-8">
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold text-primary mb-4">
                            Share the Game
                        </h2>
                        <p class="text-secondary">
                            Send this link to {sessionData.player2Name} so they can join the game
                        </p>
                    </div>
                    
                    <div class="space-y-4 mb-8">
                        <label class="block text-lg font-semibold text-primary">
                            Session Link
                        </label>
                        <div class="flex gap-3">
                            <input 
                                type="text" 
                                value={shareableUrl}
                                readonly
                                class="input-modern flex-1"
                            />
                            <button 
                                class="btn-primary-modern px-6 py-3 {copySuccess ? 'bg-green-600' : ''}"
                                on:click={copyLink}
                            >
                                {#if copySuccess}
                                    ✓ Copied!
                                {:else}
                                    Copy Link
                                {/if}
                            </button>
                        </div>
                    </div>
                    
                    <div class="alert-modern alert-info mb-8">
                        <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                            <h3 class="font-bold text-lg mb-2">Instructions</h3>
                            <div class="text-sm text-secondary">
                                Copy the link above and share it with <span class="font-bold text-primary">{sessionData.player2Name}</span>. 
                                They'll answer the same questions, and then you can both see your compatibility results!
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <button 
                            class="btn-secondary-modern px-8 py-3"
                            on:click={() => window.location.href = shareableUrl}
                        >
                            View Game Link →
                        </button>
                    </div>
                </div>
                
                <!-- Next Steps -->
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="card-modern p-6 text-center">
                        <div class="w-16 h-16 bg-gradient-purple rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl">📤</span>
                        </div>
                        <h3 class="text-xl font-bold text-primary mb-2">Step 1</h3>
                        <p class="text-secondary">Share the link with your friend</p>
                    </div>
                    
                    <div class="card-modern p-6 text-center">
                        <div class="w-16 h-16 bg-gradient-purple rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl">⏳</span>
                        </div>
                        <h3 class="text-xl font-bold text-primary mb-2">Step 2</h3>
                        <p class="text-secondary">Wait for them to answer</p>
                    </div>
                    
                    <div class="card-modern p-6 text-center">
                        <div class="w-16 h-16 bg-gradient-purple rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl">💝</span>
                        </div>
                        <h3 class="text-xl font-bold text-primary mb-2">Step 3</h3>
                        <p class="text-secondary">Check back for results!</p>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
