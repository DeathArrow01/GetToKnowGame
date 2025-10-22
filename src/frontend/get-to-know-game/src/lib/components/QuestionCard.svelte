<script>
    import { createEventDispatcher } from 'svelte';
    
    export let question;
    export let selectedAnswer = null;
    
    const dispatch = createEventDispatcher();
    
    const responseTypes = [
        { text: 'Yay!', emoji: '😍' },
        { text: 'Nay!', emoji: '😒' },
        { text: "I don't care!", emoji: '🤷' }
    ];
    
    function selectAnswer(answer) {
        selectedAnswer = answer;
        dispatch('answerSelected', { answer });
    }
    
    function getButtonClass(answer) {
        const baseClass = 'btn-secondary-modern p-6 text-left transition-all duration-300 w-full';
        if (selectedAnswer === answer) {
            return `${baseClass} bg-gradient-purple border-purple-500 text-white`;
        }
        return baseClass;
    }
</script>

<div class="card-modern p-8 max-w-2xl mx-auto">
    <div class="text-center mb-8">
        <div class="inline-block bg-gradient-purple rounded-full p-3 mb-4">
            <span class="text-2xl">❓</span>
        </div>
        <h2 class="text-lg font-semibold text-secondary mb-2">
            {question.section}
        </h2>
        <h3 class="text-3xl font-bold text-primary">
            {question.questionText}
        </h3>
    </div>
    
    <div class="grid gap-4">
        {#each responseTypes as response}
            <button 
                class={getButtonClass(response.text)}
                on:click={() => selectAnswer(response.text)}
            >
                <div class="flex items-center">
                    <span class="text-2xl mr-4">{response.emoji}</span>
                    <span class="text-xl font-semibold">{response.text}</span>
                </div>
            </button>
        {/each}
    </div>
</div>
