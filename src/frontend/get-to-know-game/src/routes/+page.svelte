<script>
    import { goto } from '$app/navigation';
    import { sessionService } from '$lib/services/sessionService.js';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    
    let player1Name = '';
    let player2Name = '';
    let isLoading = false;
    let error = null;
    
    async function createSession() {
        if (!player1Name.trim() || !player2Name.trim()) {
            error = 'Both player names are required';
            return;
        }
        
        isLoading = true;
        error = null;
        
        try {
            const result = await sessionService.createSession(player1Name.trim(), player2Name.trim());
            console.log('Session creation result:', result);
            console.log('Session ID:', result.sessionId);
            // Redirect to questions page for Player 1 to answer
            await goto(`/session/${result.sessionId}/questions?player=1`);
        } catch (err) {
            console.error('Session creation error:', err);
            error = err.message || 'Failed to create session';
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Get to Know Game</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-5xl font-bold text-primary mb-4">
                    Get to Know Game
                </h1>
                <p class="text-xl text-base-content/80">
                    Discover how compatible you are with your friends!
                </p>
            </div>
            
            <!-- Main Card -->
            <div class="card bg-base-100 shadow-2xl">
                <div class="card-body p-8">
                    <h2 class="card-title text-2xl mb-6 justify-center">
                        Start a New Game
                    </h2>
                    
                    {#if error}
                        <ErrorMessage message={error} />
                    {/if}
                    
                    {#if isLoading}
                        <LoadingSpinner text="Creating your game session..." />
                    {:else}
                        <form on:submit|preventDefault={createSession} class="space-y-6">
                            <div class="form-control">
                                <label class="label" for="player1">
                                    <span class="label-text text-lg font-semibold">Your Name</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="player1"
                                    bind:value={player1Name}
                                    placeholder="Enter your name"
                                    class="input input-bordered input-lg w-full"
                                    required
                                />
                            </div>
                            
                            <div class="form-control">
                                <label class="label" for="player2">
                                    <span class="label-text text-lg font-semibold">Friend's Name</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="player2"
                                    bind:value={player2Name}
                                    placeholder="Enter your friend's name"
                                    class="input input-bordered input-lg w-full"
                                    required
                                />
                            </div>
                            
                            <div class="card-actions justify-center mt-8">
                                <button 
                                    type="submit"
                                    class="btn btn-primary btn-lg px-12"
                                    disabled={isLoading}
                                >
                                    Start Game
                                </button>
                            </div>
                        </form>
                    {/if}
                </div>
            </div>
            
            <!-- Instructions -->
            <div class="mt-8 text-center">
                <div class="stats shadow bg-base-100">
                    <div class="stat">
                        <div class="stat-title">How it works</div>
                        <div class="stat-desc">Answer questions about your preferences</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Share & Compare</div>
                        <div class="stat-desc">Share the link with your friend</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Get Results</div>
                        <div class="stat-desc">See your compatibility score!</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
