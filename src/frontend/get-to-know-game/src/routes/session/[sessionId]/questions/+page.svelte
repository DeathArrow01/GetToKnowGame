<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { sessionService } from '$lib/services/sessionService.js';
    import { questionService } from '$lib/services/questionService.js';
    import QuestionCard from '$lib/components/QuestionCard.svelte';
    import ProgressIndicator from '$lib/components/ProgressIndicator.svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    
    let sessionData = null;
    let questions = [];
    let currentQuestionIndex = 0;
    let answers = [];
    let isLoading = true;
    let isSubmitting = false;
    let error = null;
    let sessionId = '';
    let isPlayer1 = false;
    
    // Get session ID from URL params
    $: {
        sessionId = $page.params.sessionId || '';
        const playerParam = $page.url.searchParams.get('player');
        isPlayer1 = playerParam === '1';
    }
    
    // Load data when component mounts and sessionId is available
    onMount(() => {
        if (sessionId) {
            loadData();
        }
    });
    
    $: currentQuestion = questions[currentQuestionIndex];
    $: isLastQuestion = currentQuestionIndex === questions.length - 1;
    $: canProceed = answers[currentQuestionIndex] !== undefined;
    
    async function loadData() {
        try {
            console.log('Loading data for session ID:', sessionId);
            if (!sessionId) {
                error = 'Session ID is missing from URL';
                isLoading = false;
                return;
            }
            
            // Load session and questions in parallel
            const [sessionResult, questionsResult] = await Promise.all([
                sessionService.getSession(sessionId),
                questionService.getAllQuestions()
            ]);
            
            sessionData = sessionResult;
            questions = questionsResult;
            
            // Initialize answers array
            answers = new Array(questions.length).fill(undefined);
            
            // Check if this is Player 2 and they haven't joined yet
            // Only try to join if this is Player 2 (player=2 parameter) and they haven't joined
            if (!isPlayer1 && !sessionData.isPlayer2Joined && sessionData.player2Name) {
                // This is Player 2's first time - create them
                try {
                    const joinResult = await sessionService.joinSession(sessionId, sessionData.player2Name);
                    sessionData.player2Id = joinResult.player2Id;
                    sessionData.isPlayer2Joined = true;
                } catch (joinErr) {
                    console.error('Error joining session:', joinErr);
                    error = 'Failed to join session. Please try again.';
                    return;
                }
            }
            
        } catch (err) {
            console.error('Error loading data:', err);
            error = err.message || 'Failed to load game data';
        } finally {
            isLoading = false;
        }
    }
    
    function handleAnswerSelected(event) {
        const { answer } = event.detail;
        answers[currentQuestionIndex] = {
            questionId: currentQuestion.id,
            response: answer
        };
    }
    
    function nextQuestion() {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
        }
    }
    
    async function finishGame() {
        isSubmitting = true;
        error = null;
        
        try {
            // Determine which player is answering
            let playerId;
            
            console.log('finishGame called');
            console.log('isPlayer1:', isPlayer1);
            console.log('sessionData:', sessionData);
            console.log('sessionData.player1Id:', sessionData?.player1Id);
            console.log('sessionData.player2Id:', sessionData?.player2Id);
            
            if (isPlayer1) {
                // This is Player 1 answering
                playerId = sessionData.player1Id;
            } else {
                // This is Player 2 answering
                playerId = sessionData.player2Id;
            }
            
            console.log('playerId to send:', playerId);
            console.log('answers to send:', answers);
            
            await sessionService.submitAnswers(sessionId, playerId, answers);
            
            // Redirect based on who just answered
            if (isPlayer1) {
                // Player 1 just finished, go to completion page
                await goto(`/session/${sessionId}/completion`);
            } else {
                // Player 2 just finished, go to results page
                await goto(`/session/${sessionId}/results`);
            }
        } catch (err) {
            error = err.message || 'Failed to submit answers';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<svelte:head>
    <title>Answer Questions - Get to Know Game</title>
</svelte:head>

<div class="min-h-screen gradient-bg">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            {#if isLoading}
                <div class="text-center py-20">
                    <div class="loading-modern mx-auto mb-4"></div>
                    <p class="text-secondary text-lg">Loading questions...</p>
                </div>
            {:else if error}
                <div class="alert-modern alert-error max-w-2xl mx-auto">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{error}</span>
                </div>
            {:else if questions.length === 0}
                <div class="alert-modern alert-error max-w-2xl mx-auto">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>No questions available</span>
                </div>
            {:else}
                <!-- Progress Indicator -->
                <div class="bg-[#1A1A2E] border border-[#374151] rounded-2xl p-6 mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-xl font-bold text-white">Question {currentQuestionIndex + 1} of {questions.length}</h2>
                        <div class="bg-[#8A2BE2] text-white px-3 py-1 rounded-lg text-sm font-medium">
                            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                        </div>
                    </div>
                    <div class="bg-[#2C2C4A] rounded-full h-2 overflow-hidden">
                        <div class="bg-[#8A2BE2] h-full transition-all duration-300 ease-out" style="width: {((currentQuestionIndex + 1) / questions.length) * 100}%"></div>
                    </div>
                </div>
                
                <!-- Question Card -->
                {#if currentQuestion}
                    <div class="bg-[#1A1A2E] border border-[#374151] rounded-2xl p-8 mb-8 shadow-lg">
                        <div class="text-center mb-8">
                            <div class="inline-flex items-center justify-center w-16 h-16 bg-[#8A2BE2] rounded-2xl mb-6">
                                <span class="text-2xl">❓</span>
                            </div>
                            <h3 class="text-sm font-medium text-[#9CA3AF] uppercase tracking-wider mb-3">{currentQuestion.section}</h3>
                            <h2 class="text-2xl font-bold text-white leading-tight">{currentQuestion.questionText}</h2>
                        </div>
                        
                        <div class="space-y-3 max-w-2xl mx-auto">
                            <button 
                                class="w-full p-4 text-left transition-all duration-200 rounded-xl border border-[#374151] bg-[#2C2C4A] hover:border-[#8A2BE2] hover:bg-[#374151] {answers[currentQuestionIndex]?.response === 'Yay!' ? 'border-[#8A2BE2] bg-[#8A2BE2] text-white' : 'text-white'}"
                                on:click={() => handleAnswerSelected({detail: {answer: 'Yay!'}})}
                            >
                                <div class="flex items-center">
                                    <span class="text-xl mr-3">😍</span>
                                    <span class="font-medium">Yay!</span>
                                </div>
                            </button>
                            
                            <button 
                                class="w-full p-4 text-left transition-all duration-200 rounded-xl border border-[#374151] bg-[#2C2C4A] hover:border-[#8A2BE2] hover:bg-[#374151] {answers[currentQuestionIndex]?.response === 'Nay!' ? 'border-[#8A2BE2] bg-[#8A2BE2] text-white' : 'text-white'}"
                                on:click={() => handleAnswerSelected({detail: {answer: 'Nay!'}})}
                            >
                                <div class="flex items-center">
                                    <span class="text-xl mr-3">😒</span>
                                    <span class="font-medium">Nay!</span>
                                </div>
                            </button>
                            
                            <button 
                                class="w-full p-4 text-left transition-all duration-200 rounded-xl border border-[#374151] bg-[#2C2C4A] hover:border-[#8A2BE2] hover:bg-[#374151] {answers[currentQuestionIndex]?.response === 'I don\'t care!' ? 'border-[#8A2BE2] bg-[#8A2BE2] text-white' : 'text-white'}"
                                on:click={() => handleAnswerSelected({detail: {answer: 'I don\'t care!'}})}
                            >
                                <div class="flex items-center">
                                    <span class="text-xl mr-3">🤷</span>
                                    <span class="font-medium">I don't care!</span>
                                </div>
                            </button>
                        </div>
                    </div>
                {/if}
                
                <!-- Navigation -->
                <div class="flex justify-between items-center max-w-2xl mx-auto">
                    <button
                        class="px-6 py-3 rounded-xl border border-[#374151] bg-[#2C2C4A] text-white font-medium transition-all duration-200 hover:border-[#8A2BE2] hover:bg-[#374151] {currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed hover:border-[#374151] hover:bg-[#2C2C4A]' : ''}"
                        disabled={currentQuestionIndex === 0}
                        on:click={() => currentQuestionIndex--}
                    >
                        ← Previous
                    </button>
                    
                    {#if isLastQuestion}
                        <button 
                            class="px-6 py-3 rounded-xl border border-[#8A2BE2] bg-[#8A2BE2] text-white font-medium transition-all duration-200 hover:bg-[#7C3AED] {!canProceed || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
                            disabled={!canProceed || isSubmitting}
                            on:click={finishGame}
                        >
                            {#if isSubmitting}
                                <div class="loading-modern inline-block mr-2"></div>
                                Submitting...
                            {:else}
                                Finish Game →
                            {/if}
                        </button>
                    {:else}
                        <button 
                            class="px-6 py-3 rounded-xl border border-[#8A2BE2] bg-[#8A2BE2] text-white font-medium transition-all duration-200 hover:bg-[#7C3AED] {!canProceed ? 'opacity-50 cursor-not-allowed' : ''}"
                            disabled={!canProceed}
                            on:click={nextQuestion}
                        >
                            Next →
                        </button>
                    {/if}
                </div>
                
                <!-- Instructions -->
                <div class="mt-8 text-center">
                    <div class="bg-[#2C2C4A] border border-[#374151] rounded-xl p-4 max-w-2xl mx-auto">
                        <div class="flex items-center justify-center text-[#9CA3AF]">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-sm">Answer honestly! Choose your true preference for each question. Your compatibility score depends on matching answers!</span>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
