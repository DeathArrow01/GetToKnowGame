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

<div class="min-h-screen bg-[#0F0F23]">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
            {#if isLoading}
                <div class="text-center py-20">
                    <div class="loading-modern mx-auto mb-4"></div>
                    <p class="text-[#9CA3AF] text-lg">Loading game session...</p>
                </div>
            {:else if error}
                <div class="bg-[#2C2C4A] border border-red-500 rounded-xl p-4 max-w-2xl mx-auto">
                    <div class="flex items-center text-red-400">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            {:else if sessionData}
                <!-- Welcome Message -->
                <div class="text-center mb-8">
                    <div class="w-12 h-12 bg-[#8A2BE2] rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span class="text-2xl">👋</span>
                    </div>
                    <h1 class="text-3xl font-bold text-white mb-4">
                        Hi there <span class="mailgo-accent">{sessionData.player2Name || 'there'}</span>!
                    </h1>
                    <p class="text-lg text-[#9CA3AF] max-w-2xl mx-auto">
                        <span class="font-bold text-[#8A2BE2]">{sessionData.player1Name}</span> has started a compatibility game for you.
                    </p>
                </div>
                
                <!-- Welcome Card -->
                <div class="bg-[#1A1A2E] border border-[#374151] rounded-xl p-6 mb-8 shadow-lg">
                    <div class="text-center">
                        <h2 class="text-2xl font-bold text-white mb-6">
                            Ready to Play?
                        </h2>
                        
                        <p class="text-base text-[#9CA3AF] mb-6 max-w-2xl mx-auto leading-relaxed">
                            You'll answer the same questions as <span class="font-bold text-[#8A2BE2]">{sessionData.player1Name}</span> to discover how compatible you are!
                        </p>
                        
                        <div class="grid md:grid-cols-3 gap-4 mb-6">
                            <div class="flex flex-col items-center space-y-3">
                                <div class="w-12 h-12 bg-[#8A2BE2] rounded-xl flex items-center justify-center">
                                    <span class="text-lg font-bold text-white">1</span>
                                </div>
                                <span class="text-center text-[#9CA3AF] text-sm leading-relaxed">Answer questions about your preferences</span>
                            </div>
                            <div class="flex flex-col items-center space-y-3">
                                <div class="w-12 h-12 bg-[#8A2BE2] rounded-xl flex items-center justify-center">
                                    <span class="text-lg font-bold text-white">2</span>
                                </div>
                                <span class="text-center text-[#9CA3AF] text-sm leading-relaxed">Compare your answers with {sessionData.player1Name}</span>
                            </div>
                            <div class="flex flex-col items-center space-y-3">
                                <div class="w-12 h-12 bg-[#8A2BE2] rounded-xl flex items-center justify-center">
                                    <span class="text-lg font-bold text-white">3</span>
                                </div>
                                <span class="text-center text-[#9CA3AF] text-sm leading-relaxed">See your compatibility score!</span>
                            </div>
                        </div>
                        
                        <div class="text-center">
                            <button 
                                class="bg-[#8A2BE2] hover:bg-[#7C3AED] text-white font-semibold px-8 py-3 rounded-xl text-base transition-all duration-200 transform hover:scale-105 shadow-lg"
                                on:click={startGame}
                            >
                                Start Answering →
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Game Info -->
                <div class="bg-[#2C2C4A] border border-[#8A2BE2] rounded-lg p-4 max-w-2xl mx-auto">
                    <div class="flex items-start">
                        <svg class="w-5 h-5 mr-3 mt-1 text-[#8A2BE2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                            <h3 class="font-bold text-base text-white mb-2">Game Rules</h3>
                            <div class="text-[#9CA3AF] text-sm leading-relaxed">
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
