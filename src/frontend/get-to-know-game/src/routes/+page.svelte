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

<div class="mailgo-page">
    <div class="mailgo-container-wide">
        <!-- Header -->
        <div class="mailgo-text-center mailgo-spacing-bottom-lg">
            <div class="mailgo-flex-center mailgo-spacing-bottom-md">
                <div class="mailgo-icon-container mailgo-spacing-bottom-sm">
                    <span class="text-2xl">🎯</span>
                </div>
                <h1 class="mailgo-title-lg">
                    Get to Know <span class="mailgo-accent">Game</span>
                </h1>
            </div>
            <p class="mailgo-text-md max-w-2xl mx-auto">
                Discover how compatible you are with your friends through our AI-powered compatibility assessment!
            </p>
        </div>
            
        <!-- Main Card -->
        <div class="mailgo-card mailgo-spacing-bottom-lg">
            <div class="mailgo-text-center mailgo-spacing-bottom-md">
                <h2 class="mailgo-title-md mailgo-spacing-bottom-sm">
                    Start a New Game
                </h2>
                <p class="mailgo-text-md">
                    Enter your names and begin your compatibility journey
                </p>
            </div>
            
            {#if error}
                <div class="mailgo-alert mailgo-alert-error mailgo-spacing-bottom-lg">
                    <svg class="mailgo-icon mailgo-spacing-bottom-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{error}</span>
                </div>
            {/if}
            
            {#if isLoading}
                <div class="mailgo-text-center py-16">
                    <div class="mailgo-loading mx-auto mailgo-spacing-bottom-sm"></div>
                    <p class="mailgo-text-md">Creating your game session...</p>
                </div>
            {:else}
                <form on:submit|preventDefault={createSession} class="space-y-6">
                    <div class="mailgo-grid mailgo-grid-responsive">
                        <div class="space-y-2">
                            <label class="mailgo-label" for="player1">
                                Your Name
                            </label>
                            <input 
                                type="text" 
                                id="player1"
                                bind:value={player1Name}
                                placeholder="Enter your name"
                                class="mailgo-input"
                                required
                            />
                        </div>
                        
                        <div class="space-y-2">
                            <label class="mailgo-label" for="player2">
                                Friend's Name
                            </label>
                            <input 
                                type="text" 
                                id="player2"
                                bind:value={player2Name}
                                placeholder="Enter your friend's name"
                                class="mailgo-input"
                                required
                            />
                        </div>
                    </div>
                    
                    <div class="mailgo-text-center mailgo-spacing-top-md">
                        <button 
                            type="submit"
                            class="mailgo-btn mailgo-btn-primary"
                            disabled={isLoading}
                        >
                            Start Game →
                        </button>
                    </div>
                </form>
            {/if}
        </div>
            
        <!-- Features Grid -->
        <div class="mailgo-grid mailgo-grid-3 mailgo-spacing-bottom-lg">
            <div class="mailgo-card-sm mailgo-text-center mailgo-card-hover">
                <div class="mailgo-icon-container mx-auto mailgo-spacing-bottom-sm">
                    <span class="text-xl">❓</span>
                </div>
                <h3 class="mailgo-title-sm mailgo-spacing-bottom-xs">Answer Questions</h3>
                <p class="mailgo-text-sm">Share your preferences and opinions on various topics</p>
            </div>
            
            <div class="mailgo-card-sm mailgo-text-center mailgo-card-hover">
                <div class="mailgo-icon-container mx-auto mailgo-spacing-bottom-sm">
                    <span class="text-xl">🔗</span>
                </div>
                <h3 class="mailgo-title-sm mailgo-spacing-bottom-xs">Share & Compare</h3>
                <p class="mailgo-text-sm">Send the link to your friend and compare answers</p>
            </div>
            
            <div class="mailgo-card-sm mailgo-text-center mailgo-card-hover">
                <div class="mailgo-icon-container mx-auto mailgo-spacing-bottom-sm">
                    <span class="text-xl">💝</span>
                </div>
                <h3 class="mailgo-title-sm mailgo-spacing-bottom-xs">Get Results</h3>
                <p class="mailgo-text-sm">Discover your compatibility score and shared interests</p>
            </div>
        </div>
    </div>
</div>
