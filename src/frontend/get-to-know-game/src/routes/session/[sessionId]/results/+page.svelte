<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { sessionService } from '$lib/services/sessionService.js';
    import { questionService } from '$lib/services/questionService.js';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    
    let sessionData = null;
    let questions = [];
    let sharedAnswers = [];
    let isLoading = true;
    let error = null;
    let sessionId = '';
    
    // Get session ID from URL params
    $: {
        sessionId = $page.params.sessionId || '';
    }
    
    // Load data when component mounts and sessionId is available
    onMount(() => {
        if (sessionId) {
            loadData();
        }
    });
    
    $: compatibilityScore = sessionData?.compatibilityScore || 0;
    $: emoji = getCompatibilityEmoji(compatibilityScore);
    
    function getCompatibilityEmoji(score) {
        if (score >= 80) return '❤️';
        if (score >= 50) return '🙂';
        if (score >= 20) return '😬';
        return '💀';
    }
    
    async function loadData() {
        try {
            console.log('Loading results for session ID:', sessionId);
            if (!sessionId) {
                error = 'Session ID is missing from URL';
                isLoading = false;
                return;
            }
            
            const [sessionResult, questionsResult] = await Promise.all([
                sessionService.getSession(sessionId),
                questionService.getAllQuestions()
            ]);
            
            sessionData = sessionResult;
            questions = questionsResult;
            
            if (sessionData.player1Answers && sessionData.player2Answers) {
                calculateSharedAnswers();
            }
            
        } catch (err) {
            console.error('Error loading results:', err);
            error = err.message || 'Failed to load results';
        } finally {
            isLoading = false;
        }
    }
    
    function calculateSharedAnswers() {
        const shared = [];
        const questionsMap = new Map(questions.map(q => [q.id, q]));
        
        for (let i = 0; i < sessionData.player1Answers.length; i++) {
            const answer1 = sessionData.player1Answers[i];
            const answer2 = sessionData.player2Answers.find(a => a.questionId === answer1.questionId);
            
            if (answer2 && 
                (answer1.response === 'Yay!' || answer1.response === "I don't care!") &&
                answer1.response === answer2.response) {
                
                const question = questionsMap.get(answer1.questionId);
                if (question) {
                    shared.push({
                        question,
                        response: answer1.response
                    });
                }
            }
        }
        
        // Group by section
        const grouped = shared.reduce((acc, item) => {
            const section = item.question.section;
            if (!acc[section]) {
                acc[section] = [];
            }
            acc[section].push(item);
            return acc;
        }, {});
        
        sharedAnswers = Object.entries(grouped).map(([section, items]) => ({
            section,
            items
        }));
    }
</script>

<svelte:head>
    <title>Results - Get to Know Game</title>
</svelte:head>

<div class="min-h-screen bg-[#0F0F23]">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
            {#if isLoading}
                <div class="text-center py-20">
                    <div class="loading-modern mx-auto mb-4"></div>
                    <p class="text-[#9CA3AF] text-lg">Loading your results...</p>
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
            {:else if !sessionData?.isGameComplete}
                <div class="text-center py-20">
                    <div class="w-24 h-24 bg-[#8A2BE2] rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <span class="text-5xl">⏳</span>
                    </div>
                    <h1 class="text-5xl font-bold text-white mb-6">
                        Results Not Ready Yet
                    </h1>
                    <p class="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
                        {#if !sessionData?.isPlayer2Joined}
                            Waiting for <span class="font-bold text-[#8A2BE2]">{sessionData?.player2Name}</span> to join the game...
                        {:else if !sessionData?.isPlayer2Completed}
                            Waiting for <span class="font-bold text-[#8A2BE2]">{sessionData?.player2Name}</span> to finish answering...
                        {:else}
                            Calculating your compatibility score...
                        {/if}
                    </p>
                    <button 
                        class="bg-[#8A2BE2] hover:bg-[#7C3AED] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                        on:click={() => window.location.reload()}
                    >
                        Check Again →
                    </button>
                </div>
            {:else}
                <!-- Results Header -->
                <div class="text-center mb-8">
                    <div class="text-4xl mb-4">{emoji}</div>
                    <h1 class="text-3xl font-bold text-white mb-4">
                        {compatibilityScore}% Compatible!
                    </h1>
                    <p class="text-lg text-[#9CA3AF]">
                        <span class="font-bold text-[#8A2BE2]">{sessionData.player1Name}</span> and <span class="font-bold text-[#8A2BE2]">{sessionData.player2Name}</span>
                    </p>
                </div>
                
                <!-- Compatibility Score Card -->
                <div class="bg-[#1A1A2E] border border-[#374151] rounded-xl p-6 mb-8 text-center shadow-lg">
                    <div class="relative inline-block mb-4">
                        <div class="w-24 h-24 rounded-full bg-[#8A2BE2] flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                            {compatibilityScore}%
                        </div>
                        <div class="absolute -top-1 -right-1 w-8 h-8 bg-[#8A2BE2] rounded-full flex items-center justify-center">
                            <span class="text-sm">{emoji}</span>
                        </div>
                    </div>
                    <h2 class="text-xl font-bold text-white mb-2">
                        Compatibility Score
                    </h2>
                    <p class="text-sm text-[#9CA3AF] max-w-xl mx-auto">
                        Based on matching "Yay!" and "I don't care!" answers from both players
                    </p>
                </div>
                
                <!-- Shared Answers -->
                {#if sharedAnswers.length > 0}
                    <div class="mb-8">
                        <h2 class="text-2xl font-bold text-center mb-6 text-white">
                            What You Both Agree On
                        </h2>
                        
                        <div class="grid gap-4">
                            {#each sharedAnswers as { section, items }}
                                <div class="bg-[#1A1A2E] border border-[#374151] rounded-xl overflow-hidden">
                                    <div class="bg-[#8A2BE2] p-3">
                                        <h3 class="text-lg font-bold text-white flex items-center">
                                            <span class="text-xl mr-2">🎯</span>
                                            {section}
                                        </h3>
                                    </div>
                                    <div class="p-4">
                                        <div class="grid gap-2">
                                            {#each items as item}
                                                <div class="flex items-center space-x-3 p-3 bg-[#2C2C4A] rounded-lg border border-[#374151]">
                                                    <div class="bg-[#8A2BE2] text-white px-2 py-1 rounded text-xs font-semibold">
                                                        {item.response}
                                                    </div>
                                                    <span class="text-sm text-white font-medium">
                                                        {item.question.questionText}
                                                    </span>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {:else}
                    <div class="bg-[#1A1A2E] border border-[#374151] rounded-xl p-6 mb-8 text-center shadow-lg">
                        <div class="w-12 h-12 bg-[#8A2BE2] rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl">🤷‍♀️</span>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">
                            No Shared Preferences
                        </h3>
                        <p class="text-sm text-[#9CA3AF] max-w-xl mx-auto">
                            You didn't match on any "Yay!" or "I don't care!" answers, 
                            but that's okay! Opposites can attract too. 💕
                        </p>
                    </div>
                {/if}
                
                <!-- Action Buttons -->
                <div class="text-center space-x-3">
                    <button 
                        class="bg-[#8A2BE2] hover:bg-[#7C3AED] text-white font-semibold px-6 py-3 rounded-xl text-base transition-all duration-200 transform hover:scale-105 shadow-lg"
                        on:click={() => window.location.href = '/'}
                    >
                        Play Again →
                    </button>
                    <button 
                        class="bg-[#2C2C4A] border border-[#374151] hover:border-[#8A2BE2] hover:bg-[#374151] text-white font-semibold px-6 py-3 rounded-xl text-base transition-all duration-200"
                        on:click={() => window.location.reload()}
                    >
                        Refresh Results
                    </button>
                </div>
            {/if}
        </div>
    </div>
</div>
