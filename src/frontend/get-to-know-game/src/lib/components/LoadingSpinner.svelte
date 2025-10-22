<script>
    export let size = 'lg';
    export let text = 'Loading...';
</script>

<div class="flex flex-col items-center justify-center p-8">
    <div class="loading-modern"></div>
    {#if text}
        <p class="mt-4 text-secondary">{text}</p>
    {/if}
</div>
