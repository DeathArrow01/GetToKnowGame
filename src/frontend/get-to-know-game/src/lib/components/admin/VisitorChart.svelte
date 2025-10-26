<script>
    import { onMount } from 'svelte';
    
    export let data = [];
    
    let chartContainer;
    let chart;
    
    onMount(() => {
        if (data && data.length > 0) {
            createChart();
        }
    });
    
    $: if (data && data.length > 0) {
        if (chart) {
            updateChart();
        } else {
            createChart();
        }
    }
    
    function createChart() {
        if (!chartContainer || !data || data.length === 0) return;
        
        // Simple SVG-based chart since we don't have Chart.js installed
        const width = chartContainer.clientWidth;
        const height = 200;
        const padding = 40;
        
        const maxValue = Math.max(...data.map(d => d.uniqueVisitors));
        const minValue = Math.min(...data.map(d => d.uniqueVisitors));
        const range = maxValue - minValue || 1;
        
        const xScale = (width - 2 * padding) / (data.length - 1);
        const yScale = (height - 2 * padding) / range;
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.style.background = 'transparent';
        
        // Create path for line
        let pathData = '';
        data.forEach((point, index) => {
            const x = padding + index * xScale;
            const y = height - padding - (point.uniqueVisitors - minValue) * yScale;
            
            if (index === 0) {
                pathData += `M ${x} ${y}`;
            } else {
                pathData += ` L ${x} ${y}`;
            }
        });
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#8A2BE2');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
        
        // Add gradient fill
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'chartGradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#8A2BE2');
        stop1.setAttribute('stop-opacity', '0.3');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#8A2BE2');
        stop2.setAttribute('stop-opacity', '0');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.appendChild(defs);
        
        // Add area fill
        const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const areaData = pathData + ` L ${padding + (data.length - 1) * xScale} ${height - padding} L ${padding} ${height - padding} Z`;
        areaPath.setAttribute('d', areaData);
        areaPath.setAttribute('fill', 'url(#chartGradient)');
        svg.insertBefore(areaPath, path);
        
        // Add data points
        data.forEach((point, index) => {
            const x = padding + index * xScale;
            const y = height - padding - (point.uniqueVisitors - minValue) * yScale;
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', '#8A2BE2');
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '2');
            svg.appendChild(circle);
        });
        
        // Add Y-axis labels
        for (let i = 0; i <= 4; i++) {
            const value = minValue + (range * i / 4);
            const y = height - padding - (range * i / 4) * yScale;
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', padding - 10);
            text.setAttribute('y', y + 4);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('font-size', '12');
            text.setAttribute('fill', '#9CA3AF');
            text.textContent = Math.round(value).toString();
            svg.appendChild(text);
        }
        
        // Clear container and add chart
        chartContainer.innerHTML = '';
        chartContainer.appendChild(svg);
        chart = svg;
    }
    
    function updateChart() {
        if (chart) {
            createChart();
        }
    }
</script>

<div class="visitor-chart">
    {#if data && data.length > 0}
        <div class="chart-header">
            <div class="chart-info">
                <span class="chart-period">Last 30 Days</span>
                <span class="chart-total">Total: {data.reduce((sum, d) => sum + d.uniqueVisitors, 0)} visitors</span>
            </div>
        </div>
        <div class="chart-container" bind:this={chartContainer}></div>
    {:else}
        <div class="no-data">
            <div class="no-data-icon">📊</div>
            <p>No visitor data available</p>
        </div>
    {/if}
</div>

<style>
    .visitor-chart {
        width: 100%;
    }
    
    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .chart-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .chart-period {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
        font-weight: 500;
    }
    
    .chart-total {
        font-size: 0.75rem;
        color: var(--mailgo-text-muted);
    }
    
    .chart-container {
        width: 100%;
        height: 200px;
        overflow: hidden;
    }
    
    .no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--mailgo-text-muted);
    }
    
    .no-data-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    
    .no-data p {
        margin: 0;
        font-size: 0.875rem;
    }
</style>
