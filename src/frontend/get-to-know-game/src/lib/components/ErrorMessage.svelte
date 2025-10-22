<script>
    export let message = 'An error occurred';
    export let onRetry = null;
</script>

<div class="alert-modern alert-error max-w-2xl mx-auto">
    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <div class="flex-1">
        <h3 class="font-bold text-lg">Error!</h3>
        <div class="text-sm text-secondary">{message}</div>
    </div>
    {#if onRetry}
        <button class="btn-secondary-modern px-4 py-2 text-sm" on:click={onRetry}>Retry</button>
    {/if}
</div>
