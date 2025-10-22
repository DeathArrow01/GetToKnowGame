<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { sessionService } from '$lib/services/sessionService.js';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    
    let sessionData = null;
    let isLoading = true;
    let error = null;
    let sessionId = '';
    
    // Get session ID from URL params
    $: {
        sessionId = $page.params.sessionId || '';
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
            
            // Redirect based on session state
            if (sessionData.isGameComplete) {
                await goto(`/session/${sessionId}/results`);
            } else if (sessionData.isPlayer2Completed) {
                // Player 2 has completed, but game isn't finished yet
                await goto(`/session/${sessionId}/waiting`);
            } else if (sessionData.isPlayer2Joined) {
                // Player 2 has joined but hasn't completed
                await goto(`/session/${sessionId}/questions`);
            }
        } catch (err) {
            console.error('Error loading session:', err);
            error = err.message || 'Failed to load session';
        } finally {
            isLoading = false;
        }
    }
    
    async function startGame() {
        await goto(`/session/${sessionId}/questions?player=2`);
    }
</script>

<svelte:head>
    <title>Welcome - Get to Know Game</title>
</svelte:head>

<div class="min-h-screen gradient-bg">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            {#if isLoading}
                <div class="text-center py-20">
                    <div class="loading-modern mx-auto mb-4"></div>
                    <p class="text-secondary text-lg">Loading game session...</p>
                </div>
            {:else if error}
                <div class="alert-modern alert-error max-w-2xl mx-auto">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{error}</span>
                </div>
            {:else if sessionData}
                <!-- Welcome Message -->
                <div class="text-center mb-12">
                    <div class="w-20 h-20 bg-gradient-purple rounded-full flex items-center justify-center mx-auto mb-6">
                        <span class="text-4xl">👋</span>
                    </div>
                    <h1 class="text-5xl font-bold text-gradient mb-6">
                        Hi there!
                    </h1>
                    <p class="text-xl text-secondary max-w-2xl mx-auto">
                        <span class="font-bold text-primary">{sessionData.player1Name}</span> has started a compatibility game for you.
                    </p>
                </div>
                
                <!-- Welcome Card -->
                <div class="card-modern p-8 mb-8">
                    <div class="text-center">
                        <h2 class="text-3xl font-bold text-primary mb-6">
                            Ready to Play?
                        </h2>
                        
                        <p class="text-lg text-secondary mb-8 max-w-2xl mx-auto">
                            You'll answer the same questions as <span class="font-bold text-primary">{sessionData.player1Name}</span> to discover how compatible you are!
                        </p>
                        
                        <div class="grid md:grid-cols-3 gap-6 mb-8">
                            <div class="flex flex-col items-center space-y-3">
                                <div class="w-12 h-12 bg-gradient-purple rounded-full flex items-center justify-center">
                                    <span class="text-xl font-bold">1</span>
                                </div>
                                <span class="text-center text-secondary">Answer questions about your preferences</span>
                            </div>
                            <div class="flex flex-col items-center space-y-3">
                                <div class="w-12 h-12 bg-gradient-purple rounded-full flex items-center justify-center">
                                    <span class="text-xl font-bold">2</span>
                                </div>
                                <span class="text-center text-secondary">Compare your answers with {sessionData.player1Name}</span>
                            </div>
                            <div class="flex flex-col items-center space-y-3">
                                <div class="w-12 h-12 bg-gradient-purple rounded-full flex items-center justify-center">
                                    <span class="text-xl font-bold">3</span>
                                </div>
                                <span class="text-center text-secondary">See your compatibility score!</span>
                            </div>
                        </div>
                        
                        <div class="text-center">
                            <button 
                                class="btn-primary-modern px-12 py-4 text-lg"
                                on:click={startGame}
                            >
                                Start Answering →
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Game Info -->
                <div class="alert-modern alert-info max-w-2xl mx-auto">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                        <h3 class="font-bold text-lg mb-2">Game Rules</h3>
                        <div class="text-sm text-secondary">
                            Answer all questions honestly. You can choose "Yay!", "Nay!", or "I don't care!" for each question. 
                            Your compatibility score will be based on matching "Yay!" and "I don't care!" answers.
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
