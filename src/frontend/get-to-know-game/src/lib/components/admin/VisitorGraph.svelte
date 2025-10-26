<script>
    import { onMount } from 'svelte';
    
    export let data = [];
    export let period = 'day';
    
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
        
        const width = chartContainer.clientWidth;
        const height = 300;
        const padding = 60;
        
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
        
        // Create gradient
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'visitorGradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#8A2BE2');
        stop1.setAttribute('stop-opacity', '0.4');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#8A2BE2');
        stop2.setAttribute('stop-opacity', '0');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.appendChild(defs);
        
        // Create area path
        let areaPath = '';
        data.forEach((point, index) => {
            const x = padding + index * xScale;
            const y = height - padding - (point.uniqueVisitors - minValue) * yScale;
            
            if (index === 0) {
                areaPath += `M ${x} ${y}`;
            } else {
                areaPath += ` L ${x} ${y}`;
            }
        });
        areaPath += ` L ${padding + (data.length - 1) * xScale} ${height - padding} L ${padding} ${height - padding} Z`;
        
        const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        area.setAttribute('d', areaPath);
        area.setAttribute('fill', 'url(#visitorGradient)');
        svg.appendChild(area);
        
        // Create line path
        let linePath = '';
        data.forEach((point, index) => {
            const x = padding + index * xScale;
            const y = height - padding - (point.uniqueVisitors - minValue) * yScale;
            
            if (index === 0) {
                linePath += `M ${x} ${y}`;
            } else {
                linePath += ` L ${x} ${y}`;
            }
        });
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', linePath);
        line.setAttribute('stroke', '#8A2BE2');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('fill', 'none');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(line);
        
        // Add data points
        data.forEach((point, index) => {
            const x = padding + index * xScale;
            const y = height - padding - (point.uniqueVisitors - minValue) * yScale;
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '5');
            circle.setAttribute('fill', '#8A2BE2');
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '2');
            svg.appendChild(circle);
            
            // Add tooltip on hover
            circle.addEventListener('mouseenter', (e) => {
                showTooltip(e, point);
            });
            circle.addEventListener('mouseleave', hideTooltip);
        });
        
        // Add Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const value = minValue + (range * i / 5);
            const y = height - padding - (range * i / 5) * yScale;
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', padding - 10);
            text.setAttribute('y', y + 4);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('font-size', '12');
            text.setAttribute('fill', '#9CA3AF');
            text.textContent = Math.round(value).toString();
            svg.appendChild(text);
        }
        
        // Add X-axis labels (sample dates)
        const labelInterval = Math.max(1, Math.floor(data.length / 6));
        for (let i = 0; i < data.length; i += labelInterval) {
            const x = padding + i * xScale;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', height - padding + 20);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '10');
            text.setAttribute('fill', '#9CA3AF');
            text.textContent = data[i].date;
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
    
    function showTooltip(event, point) {
        // Simple tooltip implementation
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.innerHTML = `
            <div><strong>${point.date}</strong></div>
            <div>Visitors: ${point.uniqueVisitors}</div>
            <div>Page Views: ${point.totalPageViews}</div>
        `;
        tooltip.style.position = 'absolute';
        tooltip.style.left = event.pageX + 10 + 'px';
        tooltip.style.top = event.pageY - 10 + 'px';
        tooltip.style.background = 'var(--mailgo-bg-secondary)';
        tooltip.style.border = '1px solid var(--mailgo-border)';
        tooltip.style.borderRadius = '0.25rem';
        tooltip.style.padding = '0.5rem';
        tooltip.style.fontSize = '0.75rem';
        tooltip.style.color = 'var(--mailgo-text-primary)';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
        
        document.body.appendChild(tooltip);
    }
    
    function hideTooltip() {
        const tooltip = document.querySelector('.chart-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    const getPeriodLabel = (period) => {
        const labels = {
            'day': 'Daily',
            'month': 'Monthly',
            '3month': '3 Months',
            '6month': '6 Months',
            'year': 'Yearly',
            '5year': '5 Years'
        };
        return labels[period] || period;
    };
</script>

<div class="visitor-graph">
    <div class="chart-header">
        <div class="chart-info">
            <span class="chart-period">{getPeriodLabel(period)} Visitor Trends</span>
            {#if data && data.length > 0}
                <span class="chart-total">
                    Total: {data.reduce((sum, d) => sum + d.uniqueVisitors, 0)} visitors
                </span>
            {/if}
        </div>
    </div>
    
    {#if data && data.length > 0}
        <div class="chart-container" bind:this={chartContainer}></div>
    {:else}
        <div class="no-data">
            <div class="no-data-icon">📊</div>
            <p>No visitor data available for the selected period</p>
        </div>
    {/if}
</div>

<style>
    .visitor-graph {
        width: 100%;
    }
    
    .chart-header {
        margin-bottom: 1rem;
    }
    
    .chart-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .chart-period {
        font-size: 1rem;
        color: var(--mailgo-text-primary);
        font-weight: 600;
    }
    
    .chart-total {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
    }
    
    .chart-container {
        width: 100%;
        height: 300px;
        overflow: hidden;
        position: relative;
    }
    
    .no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        color: var(--mailgo-text-muted);
    }
    
    .no-data-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .no-data p {
        margin: 0;
        font-size: 1rem;
        text-align: center;
    }
</style>
