<script>
    export let size = 'lg';
    export let text = 'Loading...';
</script>

<div class="flex flex-col items-center justify-center p-8">
    <span class="loading loading-spinner loading-{size} text-primary"></span>
    {#if text}
        <p class="mt-4 text-base-content/70">{text}</p>
    {/if}
</div>
