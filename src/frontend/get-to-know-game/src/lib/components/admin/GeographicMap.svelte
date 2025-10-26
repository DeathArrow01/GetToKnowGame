<script>
    export let data = [];
    
    let mapContainer;
    
    // Simple geographic visualization since we don't have a map library
    // In a real implementation, you would use Leaflet, Google Maps, or similar
    
    $: if (data && data.length > 0) {
        createGeographicVisualization();
    }
    
    function createGeographicVisualization() {
        if (!mapContainer || !data || data.length === 0) return;
        
        // Create a simple geographic grid visualization
        const container = mapContainer;
        container.innerHTML = '';
        
        // Group data by country
        const countryData = data.reduce((acc, item) => {
            const country = item.country || 'Unknown';
            if (!acc[country]) {
                acc[country] = {
                    country,
                    userCount: 0,
                    sessionCount: 0,
                    pageViews: 0
                };
            }
            acc[country].userCount += item.userCount;
            acc[country].sessionCount += item.sessionCount;
            acc[country].pageViews += item.pageViews;
            return acc;
        }, {});
        
        const countries = Object.values(countryData).sort((a, b) => b.userCount - a.userCount);
        const maxUsers = Math.max(...countries.map(c => c.userCount));
        
        // Create visualization
        const visualization = document.createElement('div');
        visualization.className = 'geo-visualization';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'geo-header';
        header.innerHTML = `
            <h4>Geographic Distribution</h4>
            <p>Users by Country</p>
        `;
        visualization.appendChild(header);
        
        // Add country list
        const countryList = document.createElement('div');
        countryList.className = 'country-list';
        
        countries.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = 'country-item';
            
            const intensity = maxUsers > 0 ? (country.userCount / maxUsers) : 0;
            const barWidth = Math.max(20, intensity * 200);
            
            countryItem.innerHTML = `
                <div class="country-info">
                    <span class="country-name">${country.country}</span>
                    <span class="country-stats">
                        ${country.userCount} users • ${country.sessionCount} sessions • ${country.pageViews} views
                    </span>
                </div>
                <div class="country-bar">
                    <div class="country-bar-fill" style="width: ${barWidth}px; opacity: ${0.3 + intensity * 0.7}"></div>
                </div>
            `;
            
            countryList.appendChild(countryItem);
        });
        
        visualization.appendChild(countryList);
        
        // Add summary stats
        const summary = document.createElement('div');
        summary.className = 'geo-summary';
        summary.innerHTML = `
            <div class="summary-stats">
                <div class="summary-stat">
                    <span class="summary-label">Total Countries</span>
                    <span class="summary-value">${countries.length}</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-label">Top Country</span>
                    <span class="summary-value">${countries[0]?.country || 'N/A'}</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-label">Total Users</span>
                    <span class="summary-value">${countries.reduce((sum, c) => sum + c.userCount, 0)}</span>
                </div>
            </div>
        `;
        
        visualization.appendChild(summary);
        
        container.appendChild(visualization);
    }
    
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };
</script>

<div class="geographic-map">
    {#if data && data.length > 0}
        <div class="map-container" bind:this={mapContainer}></div>
    {:else}
        <div class="no-data">
            <div class="no-data-icon">🌍</div>
            <p>No geographic data available</p>
            <small>Geographic data requires IP geolocation services</small>
        </div>
    {/if}
</div>

<style>
    .geographic-map {
        width: 100%;
        min-height: 300px;
    }
    
    .map-container {
        width: 100%;
    }
    
    .geo-visualization {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .geo-header {
        text-align: center;
    }
    
    .geo-header h4 {
        margin: 0 0 0.5rem 0;
        color: var(--mailgo-text-primary);
        font-size: 1.125rem;
        font-weight: 600;
    }
    
    .geo-header p {
        margin: 0;
        color: var(--mailgo-text-muted);
        font-size: 0.875rem;
    }
    
    .country-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-height: 400px;
        overflow-y: auto;
    }
    
    .country-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .country-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .country-name {
        font-weight: 600;
        color: var(--mailgo-text-primary);
        font-size: 0.875rem;
    }
    
    .country-stats {
        font-size: 0.75rem;
        color: var(--mailgo-text-muted);
    }
    
    .country-bar {
        height: 0.5rem;
        background-color: var(--mailgo-bg-secondary);
        border-radius: 0.25rem;
        overflow: hidden;
    }
    
    .country-bar-fill {
        height: 100%;
        background-color: var(--mailgo-purple);
        border-radius: 0.25rem;
        transition: width 0.3s ease;
    }
    
    .geo-summary {
        border-top: 1px solid var(--mailgo-border);
        padding-top: 1rem;
    }
    
    .summary-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }
    
    .summary-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 1rem;
        background-color: var(--mailgo-bg-secondary);
        border-radius: 0.5rem;
    }
    
    .summary-label {
        font-size: 0.75rem;
        color: var(--mailgo-text-muted);
        font-weight: 500;
        margin-bottom: 0.25rem;
    }
    
    .summary-value {
        font-size: 1.25rem;
        color: var(--mailgo-text-primary);
        font-weight: 600;
    }
    
    .no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        color: var(--mailgo-text-muted);
        text-align: center;
    }
    
    .no-data-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .no-data p {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
    }
    
    .no-data small {
        font-size: 0.75rem;
        opacity: 0.8;
    }
    
    @media (max-width: 768px) {
        .country-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
        }
        
        .summary-stats {
            grid-template-columns: 1fr;
        }
    }
</style>
