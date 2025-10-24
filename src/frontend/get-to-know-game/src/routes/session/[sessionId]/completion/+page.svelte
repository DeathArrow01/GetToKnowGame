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

<div class="min-h-screen bg-[#0F0F23]">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
            {#if isLoading}
                <div class="text-center py-20">
                    <div class="loading-modern mx-auto mb-4"></div>
                    <p class="text-[#9CA3AF] text-lg">Loading your game session...</p>
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
                <!-- Success Message -->
                <div class="text-center mb-8">
                    <div class="w-12 h-12 bg-[#8A2BE2] rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span class="text-2xl">🎉</span>
                    </div>
                    <h1 class="text-3xl font-bold text-white mb-4">
                        Thank you for playing!
                    </h1>
                    <p class="text-lg text-[#9CA3AF] max-w-2xl mx-auto">
                        Now it's time for <span class="font-bold text-[#8A2BE2]">{sessionData.player2Name}</span> to answer.
                    </p>
                </div>
                
                <!-- Share Card -->
                <div class="bg-[#1A1A2E] border border-[#374151] rounded-xl p-6 mb-8 shadow-lg">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold text-white mb-4">
                            Share the Game
                        </h2>
                        <p class="text-[#9CA3AF] text-base">
                            Send this link to {sessionData.player2Name} so they can join the game
                        </p>
                    </div>
                    
                    <div class="space-y-4 mb-6">
                        <label class="block text-base font-semibold text-white">
                            Session Link
                        </label>
                        <div class="flex gap-3">
                            <input 
                                type="text" 
                                value={shareableUrl}
                                readonly
                                class="flex-1 p-3 bg-[#2C2C4A] border border-[#374151] rounded-lg text-white focus:border-[#8A2BE2] focus:outline-none text-sm"
                            />
                            <button 
                                class="bg-[#8A2BE2] hover:bg-[#7C3AED] text-white font-semibold px-4 py-3 rounded-lg transition-all duration-200 text-sm {copySuccess ? 'bg-green-600 hover:bg-green-700' : ''}"
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
                    
                    <div class="bg-[#2C2C4A] border border-[#8A2BE2] rounded-lg p-4 mb-6">
                        <div class="flex items-start">
                            <svg class="w-5 h-5 mr-3 mt-1 text-[#8A2BE2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                                <h3 class="font-bold text-base text-white mb-2">Instructions</h3>
                                <div class="text-[#9CA3AF] text-sm leading-relaxed">
                                    Copy the link above and share it with <span class="font-bold text-[#8A2BE2]">{sessionData.player2Name}</span>. 
                                    They'll answer the same questions, and then you can both see your compatibility results!
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <button 
                            class="bg-[#2C2C4A] border border-[#374151] hover:border-[#8A2BE2] hover:bg-[#374151] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 text-sm"
                            on:click={() => window.location.href = shareableUrl}
                        >
                            View Game Link →
                        </button>
                    </div>
                </div>
                
                <!-- Next Steps -->
                <div class="grid md:grid-cols-3 gap-4">
                    <div class="bg-[#1A1A2E] border border-[#374151] rounded-xl p-4 text-center hover:border-[#8A2BE2] transition-all duration-300">
                        <div class="w-12 h-12 bg-[#8A2BE2] rounded-xl flex items-center justify-center mx-auto mb-3">
                            <span class="text-xl">📤</span>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-2">Step 1</h3>
                        <p class="text-[#9CA3AF] text-sm leading-relaxed">Share the link with your friend</p>
                    </div>
                    
                    <div class="bg-[#1A1A2E] border border-[#374151] rounded-xl p-4 text-center hover:border-[#8A2BE2] transition-all duration-300">
                        <div class="w-12 h-12 bg-[#8A2BE2] rounded-xl flex items-center justify-center mx-auto mb-3">
                            <span class="text-xl">⏳</span>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-2">Step 2</h3>
                        <p class="text-[#9CA3AF] text-sm leading-relaxed">Wait for them to answer</p>
                    </div>
                    
                    <div class="bg-[#1A1A2E] border border-[#374151] rounded-xl p-4 text-center hover:border-[#8A2BE2] transition-all duration-300">
                        <div class="w-12 h-12 bg-[#8A2BE2] rounded-xl flex items-center justify-center mx-auto mb-3">
                            <span class="text-xl">💝</span>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-2">Step 3</h3>
                        <p class="text-[#9CA3AF] text-sm leading-relaxed">Check back for results!</p>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
