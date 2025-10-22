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

<div class="min-h-screen gradient-bg">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-16">
                <div class="flex items-center justify-center mb-6">
                    <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                        <span class="text-2xl">🎯</span>
                    </div>
                    <h1 class="text-6xl font-bold text-gradient">
                        Get to Know Game
                    </h1>
                </div>
                <p class="text-xl text-secondary max-w-2xl mx-auto">
                    Discover how compatible you are with your friends through our AI-powered compatibility assessment!
                </p>
            </div>
            
            <!-- Main Card -->
            <div class="card-modern p-8 mb-12">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-primary mb-4">
                        Start a New Game
                    </h2>
                    <p class="text-secondary">
                        Enter your names and begin your compatibility journey
                    </p>
                </div>
                
                {#if error}
                    <div class="alert-modern alert-error mb-6">
                        <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{error}</span>
                    </div>
                {/if}
                
                {#if isLoading}
                    <div class="text-center py-12">
                        <div class="loading-modern mx-auto mb-4"></div>
                        <p class="text-secondary">Creating your game session...</p>
                    </div>
                {:else}
                    <form on:submit|preventDefault={createSession} class="space-y-6">
                        <div class="grid md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="block text-lg font-semibold text-primary" for="player1">
                                    Your Name
                                </label>
                                <input 
                                    type="text" 
                                    id="player1"
                                    bind:value={player1Name}
                                    placeholder="Enter your name"
                                    class="input-modern w-full"
                                    required
                                />
                            </div>
                            
                            <div class="space-y-2">
                                <label class="block text-lg font-semibold text-primary" for="player2">
                                    Friend's Name
                                </label>
                                <input 
                                    type="text" 
                                    id="player2"
                                    bind:value={player2Name}
                                    placeholder="Enter your friend's name"
                                    class="input-modern w-full"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div class="text-center mt-8">
                            <button 
                                type="submit"
                                class="btn-primary-modern px-12 py-4 text-lg"
                                disabled={isLoading}
                            >
                                Start Game →
                            </button>
                        </div>
                    </form>
                {/if}
            </div>
            
            <!-- Features Grid -->
            <div class="grid md:grid-cols-3 gap-6 mb-12">
                <div class="card-modern p-6 text-center">
                    <div class="w-16 h-16 bg-gradient-purple rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="text-2xl">❓</span>
                    </div>
                    <h3 class="text-xl font-bold text-primary mb-2">Answer Questions</h3>
                    <p class="text-secondary">Share your preferences and opinions on various topics</p>
                </div>
                
                <div class="card-modern p-6 text-center">
                    <div class="w-16 h-16 bg-gradient-purple rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="text-2xl">🔗</span>
                    </div>
                    <h3 class="text-xl font-bold text-primary mb-2">Share & Compare</h3>
                    <p class="text-secondary">Send the link to your friend and compare answers</p>
                </div>
                
                <div class="card-modern p-6 text-center">
                    <div class="w-16 h-16 bg-gradient-purple rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="text-2xl">💝</span>
                    </div>
                    <h3 class="text-xl font-bold text-primary mb-2">Get Results</h3>
                    <p class="text-secondary">Discover your compatibility score and shared interests</p>
                </div>
            </div>
        </div>
    </div>
</div>
