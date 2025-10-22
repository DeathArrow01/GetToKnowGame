<script>
    export let currentQuestion = 1;
    export let totalQuestions = 1;
    
    $: progress = (currentQuestion / totalQuestions) * 100;
</script>

<div class="w-full max-w-2xl mx-auto mb-8">
    <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-base-content">
            Question {currentQuestion} of {totalQuestions}
        </span>
        <span class="text-sm font-medium text-base-content">
            {Math.round(progress)}%
        </span>
    </div>
    
    <div class="w-full bg-base-200 rounded-full h-2">
        <div 
            class="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style="width: {progress}%"
        ></div>
    </div>
</div>
