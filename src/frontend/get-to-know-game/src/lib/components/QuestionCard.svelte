<script>
    import { createEventDispatcher } from 'svelte';
    
    export let question;
    export let selectedAnswer = null;
    
    const dispatch = createEventDispatcher();
    
    const responseTypes = ['Yay!', 'Nay!', "I don't care!"];
    
    function selectAnswer(answer) {
        selectedAnswer = answer;
        dispatch('answerSelected', { answer });
    }
    
    function getButtonClass(answer) {
        const baseClass = 'btn btn-lg w-full mb-2';
        if (selectedAnswer === answer) {
            return `${baseClass} btn-primary`;
        }
        return `${baseClass} btn-outline`;
    }
</script>

<div class="card bg-base-100 shadow-xl max-w-2xl mx-auto">
    <div class="card-body text-center">
        <h2 class="card-title justify-center text-2xl font-bold text-primary mb-4">
            {question.section}
        </h2>
        <p class="text-lg mb-8">
            {question.questionText}
        </p>
        
        <div class="space-y-3">
            {#each responseTypes as response}
                <button 
                    class={getButtonClass(response)}
                    on:click={() => selectAnswer(response)}
                >
                    {response}
                </button>
            {/each}
        </div>
    </div>
</div>
