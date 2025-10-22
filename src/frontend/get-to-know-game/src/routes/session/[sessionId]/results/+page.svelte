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

<div class="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            {#if isLoading}
                <LoadingSpinner text="Loading your results..." />
            {:else if error}
                <ErrorMessage message={error} />
            {:else if !sessionData?.isGameComplete}
                <div class="text-center">
                    <div class="text-6xl mb-4">⏳</div>
                    <h1 class="text-3xl font-bold text-primary mb-4">
                        Results Not Ready Yet
                    </h1>
                    <p class="text-lg text-base-content/80 mb-8">
                        {#if !sessionData?.isPlayer2Joined}
                            Waiting for {sessionData?.player2Name} to join the game...
                        {:else if !sessionData?.isPlayer2Completed}
                            Waiting for {sessionData?.player2Name} to finish answering...
                        {:else}
                            Calculating your compatibility score...
                        {/if}
                    </p>
                    <button 
                        class="btn btn-primary"
                        on:click={() => window.location.reload()}
                    >
                        Check Again
                    </button>
                </div>
            {:else}
                <!-- Results Header -->
                <div class="text-center mb-12">
                    <div class="text-8xl mb-4">{emoji}</div>
                    <h1 class="text-5xl font-bold text-primary mb-4">
                        {compatibilityScore}% Compatible!
                    </h1>
                    <p class="text-xl text-base-content/80">
                        {sessionData.player1Name} and {sessionData.player2Name}
                    </p>
                </div>
                
                <!-- Compatibility Score Card -->
                <div class="card bg-base-100 shadow-2xl mb-8">
                    <div class="card-body text-center p-8">
                        <div class="radial-progress text-6xl font-bold text-primary" 
                             style="--value: {compatibilityScore}; --size: 12rem;">
                            {compatibilityScore}%
                        </div>
                        <h2 class="card-title text-2xl justify-center mt-4">
                            Compatibility Score
                        </h2>
                        <p class="text-base-content/70">
                            Based on matching "Yay!" and "I don't care!" answers
                        </p>
                    </div>
                </div>
                
                <!-- Shared Answers -->
                {#if sharedAnswers.length > 0}
                    <div class="mb-8">
                        <h2 class="text-3xl font-bold text-center mb-8">
                            What You Both Agree On
                        </h2>
                        
                        {#each sharedAnswers as { section, items }}
                            <div class="card bg-base-100 shadow-xl mb-6">
                                <div class="card-header bg-primary/10 p-4">
                                    <h3 class="card-title text-xl text-primary">
                                        {section}
                                    </h3>
                                </div>
                                <div class="card-body p-6">
                                    <div class="space-y-3">
                                        {#each items as item}
                                            <div class="flex items-center space-x-3 p-3 bg-base-200 rounded-lg">
                                                <div class="badge badge-primary badge-lg">
                                                    {item.response}
                                                </div>
                                                <span class="text-lg">
                                                    {item.question.questionText}
                                                </span>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="card bg-base-100 shadow-xl mb-8">
                        <div class="card-body text-center p-8">
                            <div class="text-4xl mb-4">🤷‍♀️</div>
                            <h3 class="text-xl font-bold mb-2">
                                No Shared Preferences
                            </h3>
                            <p class="text-base-content/70">
                                You didn't match on any "Yay!" or "I don't care!" answers, 
                                but that's okay! Opposites can attract too.
                            </p>
                        </div>
                    </div>
                {/if}
                
                <!-- Action Buttons -->
                <div class="text-center">
                    <div class="btn-group">
                        <button 
                            class="btn btn-primary"
                            on:click={() => window.location.href = '/'}
                        >
                            Play Again
                        </button>
                        <button 
                            class="btn btn-outline"
                            on:click={() => window.location.reload()}
                        >
                            Refresh Results
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
