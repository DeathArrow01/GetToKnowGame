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
            if (!sessionData.isPlayer2Joined) {
                // This is Player 2's first time - we need to create them
                // For now, we'll assume they can proceed
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
            // If Player 2 hasn't joined yet, this is Player 1
            // If Player 2 has joined but hasn't completed, this is Player 2
            let playerId;
            if (!sessionData.isPlayer2Joined) {
                // This is Player 1 answering
                playerId = sessionData.player1Id;
            } else if (sessionData.isPlayer2Joined && !sessionData.isPlayer2Completed) {
                // This is Player 2 answering
                playerId = sessionData.player2Id;
            } else {
                throw new Error('Invalid game state');
            }
            
            await sessionService.submitAnswers(sessionId, playerId, answers);
            
            // Redirect based on who just answered
            if (!sessionData.isPlayer2Joined) {
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

<div class="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            {#if isLoading}
                <LoadingSpinner text="Loading questions..." />
            {:else if error}
                <ErrorMessage message={error} />
            {:else if questions.length === 0}
                <ErrorMessage message="No questions available" />
            {:else}
                <!-- Progress Indicator -->
                <ProgressIndicator 
                    currentQuestion={currentQuestionIndex + 1} 
                    totalQuestions={questions.length} 
                />
                
                <!-- Question Card -->
                {#if currentQuestion}
                    <QuestionCard 
                        question={currentQuestion}
                        selectedAnswer={answers[currentQuestionIndex]?.response}
                        on:answerSelected={handleAnswerSelected}
                    />
                {/if}
                
                <!-- Navigation -->
                <div class="flex justify-between items-center mt-8 max-w-2xl mx-auto">
                    <button 
                        class="btn btn-outline"
                        disabled={currentQuestionIndex === 0}
                        on:click={() => currentQuestionIndex--}
                    >
                        Previous
                    </button>
                    
                    <div class="text-center">
                        <span class="text-sm text-base-content/70">
                            {currentQuestionIndex + 1} of {questions.length}
                        </span>
                    </div>
                    
                    {#if isLastQuestion}
                        <button 
                            class="btn btn-primary"
                            disabled={!canProceed || isSubmitting}
                            on:click={finishGame}
                        >
                            {#if isSubmitting}
                                <span class="loading loading-spinner loading-sm"></span>
                                Submitting...
                            {:else}
                                Finish
                            {/if}
                        </button>
                    {:else}
                        <button 
                            class="btn btn-primary"
                            disabled={!canProceed}
                            on:click={nextQuestion}
                        >
                            Next
                        </button>
                    {/if}
                </div>
                
                <!-- Instructions -->
                <div class="mt-8 text-center">
                    <div class="alert alert-info max-w-2xl mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                            <h3 class="font-bold">Answer honestly!</h3>
                            <div class="text-xs">
                                Choose "Yay!" if you like it, "Nay!" if you don't, or "I don't care!" if you're neutral. 
                                You must answer all questions to see your compatibility results.
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
