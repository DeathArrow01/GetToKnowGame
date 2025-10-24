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

<div class="min-h-screen bg-[#0F0F23]">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-20">
                <div class="flex items-center justify-center mb-8">
                    <div class="w-16 h-16 bg-[#8A2BE2] rounded-2xl flex items-center justify-center mr-4">
                        <span class="text-3xl">🎯</span>
                    </div>
                    <h1 class="text-7xl font-bold text-white">
                        Get to Know <span class="text-[#8A2BE2]">Game</span>
                    </h1>
                </div>
                <p class="text-xl text-[#9CA3AF] max-w-3xl mx-auto leading-relaxed">
                    Discover how compatible you are with your friends through our AI-powered compatibility assessment!
                </p>
            </div>
            
            <!-- Main Card -->
            <div class="bg-[#1A1A2E] border border-[#374151] rounded-3xl p-12 mb-16 shadow-2xl">
                <div class="text-center mb-10">
                    <h2 class="text-4xl font-bold text-white mb-6">
                        Start a New Game
                    </h2>
                    <p class="text-[#9CA3AF] text-lg">
                        Enter your names and begin your compatibility journey
                    </p>
                </div>
                
                {#if error}
                    <div class="bg-[#2C2C4A] border border-red-500 rounded-xl p-4 mb-8">
                        <div class="flex items-center text-red-400">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                {/if}
                
                {#if isLoading}
                    <div class="text-center py-16">
                        <div class="loading-modern mx-auto mb-4"></div>
                        <p class="text-[#9CA3AF]">Creating your game session...</p>
                    </div>
                {:else}
                    <form on:submit|preventDefault={createSession} class="space-y-8">
                        <div class="grid md:grid-cols-2 gap-8">
                            <div class="space-y-3">
                                <label class="block text-lg font-semibold text-white" for="player1">
                                    Your Name
                                </label>
                                <input 
                                    type="text" 
                                    id="player1"
                                    bind:value={player1Name}
                                    placeholder="Enter your name"
                                    class="w-full p-4 bg-[#2C2C4A] border border-[#374151] rounded-xl text-white placeholder-[#9CA3AF] focus:border-[#8A2BE2] focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                            
                            <div class="space-y-3">
                                <label class="block text-lg font-semibold text-white" for="player2">
                                    Friend's Name
                                </label>
                                <input 
                                    type="text" 
                                    id="player2"
                                    bind:value={player2Name}
                                    placeholder="Enter your friend's name"
                                    class="w-full p-4 bg-[#2C2C4A] border border-[#374151] rounded-xl text-white placeholder-[#9CA3AF] focus:border-[#8A2BE2] focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div class="text-center mt-10">
                            <button 
                                type="submit"
                                class="bg-[#8A2BE2] hover:bg-[#7C3AED] text-white font-semibold px-12 py-4 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                                disabled={isLoading}
                            >
                                Start Game →
                            </button>
                        </div>
                    </form>
                {/if}
            </div>
            
            <!-- Features Grid -->
            <div class="grid md:grid-cols-3 gap-8 mb-16">
                <div class="bg-[#1A1A2E] border border-[#374151] rounded-2xl p-8 text-center hover:border-[#8A2BE2] transition-all duration-300">
                    <div class="w-20 h-20 bg-[#8A2BE2] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span class="text-3xl">❓</span>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-4">Answer Questions</h3>
                    <p class="text-[#9CA3AF] leading-relaxed">Share your preferences and opinions on various topics</p>
                </div>
                
                <div class="bg-[#1A1A2E] border border-[#374151] rounded-2xl p-8 text-center hover:border-[#8A2BE2] transition-all duration-300">
                    <div class="w-20 h-20 bg-[#8A2BE2] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span class="text-3xl">🔗</span>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-4">Share & Compare</h3>
                    <p class="text-[#9CA3AF] leading-relaxed">Send the link to your friend and compare answers</p>
                </div>
                
                <div class="bg-[#1A1A2E] border border-[#374151] rounded-2xl p-8 text-center hover:border-[#8A2BE2] transition-all duration-300">
                    <div class="w-20 h-20 bg-[#8A2BE2] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span class="text-3xl">💝</span>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-4">Get Results</h3>
                    <p class="text-[#9CA3AF] leading-relaxed">Discover your compatibility score and shared interests</p>
                </div>
            </div>
        </div>
    </div>
</div>
