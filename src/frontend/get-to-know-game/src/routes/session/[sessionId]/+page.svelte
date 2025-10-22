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
        await goto(`/session/${sessionId}/questions`);
    }
</script>

<svelte:head>
    <title>Welcome - Get to Know Game</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
            {#if isLoading}
                <LoadingSpinner text="Loading game session..." />
            {:else if error}
                <ErrorMessage message={error} />
            {:else if sessionData}
                <!-- Welcome Message -->
                <div class="text-center mb-8">
                    <div class="text-6xl mb-4">👋</div>
                    <h1 class="text-4xl font-bold text-primary mb-4">
                        Hi there!
                    </h1>
                    <p class="text-xl text-base-content/80">
                        <span class="font-bold text-secondary">{sessionData.player1Name}</span> has started a game for you.
                    </p>
                </div>
                
                <!-- Welcome Card -->
                <div class="card bg-base-100 shadow-2xl">
                    <div class="card-body p-8 text-center">
                        <h2 class="card-title text-2xl mb-6 justify-center">
                            Ready to Play?
                        </h2>
                        
                        <p class="text-lg mb-8">
                            You'll answer the same questions as {sessionData.player1Name} to discover how compatible you are!
                        </p>
                        
                        <div class="space-y-4 mb-8">
                            <div class="flex items-center justify-center space-x-3">
                                <div class="badge badge-primary badge-lg">1</div>
                                <span>Answer questions about your preferences</span>
                            </div>
                            <div class="flex items-center justify-center space-x-3">
                                <div class="badge badge-primary badge-lg">2</div>
                                <span>Compare your answers with {sessionData.player1Name}</span>
                            </div>
                            <div class="flex items-center justify-center space-x-3">
                                <div class="badge badge-primary badge-lg">3</div>
                                <span>See your compatibility score!</span>
                            </div>
                        </div>
                        
                        <div class="card-actions justify-center">
                            <button 
                                class="btn btn-primary btn-lg px-12"
                                on:click={startGame}
                            >
                                Start Answering
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Game Info -->
                <div class="mt-8">
                    <div class="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                            <h3 class="font-bold">Game Rules</h3>
                            <div class="text-xs">
                                Answer all questions honestly. You can choose "Yay!", "Nay!", or "I don't care!" for each question. 
                                Your compatibility score will be based on matching "Yay!" and "I don't care!" answers.
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
