<script>
    export let currentQuestion = 1;
    export let totalQuestions = 1;
    
    $: progress = (currentQuestion / totalQuestions) * 100;
</script>

<div class="w-full max-w-2xl mx-auto mb-8">
    <div class="flex justify-between items-center mb-4">
        <span class="text-lg font-semibold text-primary">
            Question {currentQuestion} of {totalQuestions}
        </span>
        <div class="badge-modern">
            {Math.round(progress)}% Complete
        </div>
    </div>
    
    <div class="progress-modern">
        <div 
            class="progress-fill"
            style="width: {progress}%"
        ></div>
    </div>
</div>
