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

<div class="min-h-screen gradient-bg">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
            {#if isLoading}
                <div class="text-center py-20">
                    <div class="loading-modern mx-auto mb-4"></div>
                    <p class="text-secondary text-lg">Loading your results...</p>
                </div>
            {:else if error}
                <div class="alert-modern alert-error max-w-2xl mx-auto">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{error}</span>
                </div>
            {:else if !sessionData?.isGameComplete}
                <div class="text-center py-20">
                    <div class="w-24 h-24 bg-gradient-purple rounded-full flex items-center justify-center mx-auto mb-6">
                        <span class="text-5xl">⏳</span>
                    </div>
                    <h1 class="text-4xl font-bold text-gradient mb-6">
                        Results Not Ready Yet
                    </h1>
                    <p class="text-xl text-secondary mb-8 max-w-2xl mx-auto">
                        {#if !sessionData?.isPlayer2Joined}
                            Waiting for <span class="font-bold text-primary">{sessionData?.player2Name}</span> to join the game...
                        {:else if !sessionData?.isPlayer2Completed}
                            Waiting for <span class="font-bold text-primary">{sessionData?.player2Name}</span> to finish answering...
                        {:else}
                            Calculating your compatibility score...
                        {/if}
                    </p>
                    <button 
                        class="btn-primary-modern px-8 py-3"
                        on:click={() => window.location.reload()}
                    >
                        Check Again →
                    </button>
                </div>
            {:else}
                <!-- Results Header -->
                <div class="text-center mb-16">
                    <div class="text-9xl mb-6">{emoji}</div>
                    <h1 class="text-6xl font-bold text-gradient mb-6">
                        {compatibilityScore}% Compatible!
                    </h1>
                    <p class="text-2xl text-secondary">
                        <span class="font-bold text-primary">{sessionData.player1Name}</span> and <span class="font-bold text-primary">{sessionData.player2Name}</span>
                    </p>
                </div>
                
                <!-- Compatibility Score Card -->
                <div class="card-modern p-12 mb-12 text-center">
                    <div class="relative inline-block mb-8">
                        <div class="w-48 h-48 rounded-full bg-gradient-purple flex items-center justify-center text-6xl font-bold text-white shadow-2xl">
                            {compatibilityScore}%
                        </div>
                        <div class="absolute -top-2 -right-2 w-16 h-16 bg-gradient-purple rounded-full flex items-center justify-center">
                            <span class="text-2xl">{emoji}</span>
                        </div>
                    </div>
                    <h2 class="text-3xl font-bold text-primary mb-4">
                        Compatibility Score
                    </h2>
                    <p class="text-lg text-secondary max-w-2xl mx-auto">
                        Based on matching "Yay!" and "I don't care!" answers from both players
                    </p>
                </div>
                
                <!-- Shared Answers -->
                {#if sharedAnswers.length > 0}
                    <div class="mb-12">
                        <h2 class="text-4xl font-bold text-center mb-12 text-gradient">
                            What You Both Agree On
                        </h2>
                        
                        <div class="grid gap-8">
                            {#each sharedAnswers as { section, items }}
                                <div class="card-modern overflow-hidden">
                                    <div class="bg-gradient-purple p-6">
                                        <h3 class="text-2xl font-bold text-white flex items-center">
                                            <span class="text-3xl mr-3">🎯</span>
                                            {section}
                                        </h3>
                                    </div>
                                    <div class="p-8">
                                        <div class="grid gap-4">
                                            {#each items as item}
                                                <div class="flex items-center space-x-4 p-4 bg-secondary-bg rounded-lg border border-border-color">
                                                    <div class="badge-modern">
                                                        {item.response}
                                                    </div>
                                                    <span class="text-lg text-primary font-medium">
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
                    <div class="card-modern p-12 mb-12 text-center">
                        <div class="w-24 h-24 bg-gradient-purple rounded-full flex items-center justify-center mx-auto mb-6">
                            <span class="text-4xl">🤷‍♀️</span>
                        </div>
                        <h3 class="text-3xl font-bold text-primary mb-4">
                            No Shared Preferences
                        </h3>
                        <p class="text-lg text-secondary max-w-2xl mx-auto">
                            You didn't match on any "Yay!" or "I don't care!" answers, 
                            but that's okay! Opposites can attract too. 💕
                        </p>
                    </div>
                {/if}
                
                <!-- Action Buttons -->
                <div class="text-center space-x-4">
                    <button 
                        class="btn-primary-modern px-8 py-4 text-lg"
                        on:click={() => window.location.href = '/'}
                    >
                        Play Again →
                    </button>
                    <button 
                        class="btn-secondary-modern px-8 py-4 text-lg"
                        on:click={() => window.location.reload()}
                    >
                        Refresh Results
                    </button>
                </div>
            {/if}
        </div>
    </div>
</div>
