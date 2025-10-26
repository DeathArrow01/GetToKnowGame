<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { adminApi } from '$lib/services/adminApi.js';
    
    let adminKey = '';
    let sidebarOpen = false;
    let currentPath = '';
    let isAuthenticated = false;
    
    // Update current path when page changes
    $: currentPath = $page.url.pathname;
    
    onMount(async () => {
        // Check localStorage for stored admin key
        const stored = localStorage.getItem('admin_key');
        if (stored) {
            adminKey = stored;
            adminApi.setAdminKey(stored);
            // Test if the key works by making a test API call
            try {
                await adminApi.getStats();
                isAuthenticated = true;
            } catch (error) {
                // Key is invalid, clear it
                localStorage.removeItem('admin_key');
                adminKey = '';
                promptForAdminKey();
            }
        } else {
            promptForAdminKey();
        }
    });
    
    async function promptForAdminKey() {
        const key = prompt('Enter admin key:') || '';
        if (key) {
            adminKey = key;
            adminApi.setAdminKey(key);
            // Test the key
            try {
                await adminApi.getStats();
                isAuthenticated = true;
                localStorage.setItem('admin_key', key);
            } catch (error) {
                alert('Invalid admin key. Please try again.');
                promptForAdminKey();
            }
        } else {
            // Redirect to home if no key provided
            window.location.href = '/';
        }
    }
    
    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }
    
    function logout() {
        adminApi.setAdminKey(null);
        adminKey = '';
        isAuthenticated = false;
        window.location.href = '/';
    }
    
    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
        { path: '/admin/sessions', label: 'Sessions', icon: '🎮' },
        { path: '/admin/questions', label: 'Questions', icon: '❓' },
        { path: '/admin/sections', label: 'Sections', icon: '📁' },
        { path: '/admin/performance', label: 'Performance', icon: '⚡' }
    ];
</script>

<svelte:head>
    <title>Admin Dashboard - Get to Know Game</title>
</svelte:head>

        <div class="admin-layout">
            <!-- Sidebar -->
            {#if isAuthenticated}
            <aside class="sidebar" class:open={sidebarOpen}>
        <div class="sidebar-header">
            <h2 class="sidebar-title">Admin Panel</h2>
            <button class="sidebar-toggle" on:click={toggleSidebar}>
                {sidebarOpen ? '✕' : '☰'}
            </button>
        </div>
        
        <nav class="sidebar-nav">
            {#each menuItems as item}
                <a 
                    href="{item.path}" 
                    class="nav-item" 
                    class:active={currentPath === item.path}
                >
                    <span class="nav-icon">{item.icon}</span>
                    <span class="nav-label">{item.label}</span>
                </a>
            {/each}
        </nav>
        
        <div class="sidebar-footer">
            <button class="logout-btn" on:click={logout}>
                <span class="nav-icon">🚪</span>
                <span class="nav-label">Logout</span>
            </button>
        </div>
    </aside>
    {/if}
    
            <!-- Main Content -->
            <main class="main-content">
                {#if !isAuthenticated}
                    <!-- Authentication Required -->
                    <div class="auth-required">
                        <div class="auth-card">
                            <h2>🔐 Authentication Required</h2>
                            <p>Please enter your admin key to access the admin panel.</p>
                            <button class="btn btn-primary" on:click={promptForAdminKey}>
                                Enter Admin Key
                            </button>
                        </div>
                    </div>
                {:else}
                    <!-- Header -->
                    <header class="admin-header">
                        <div class="header-left">
                            <button class="mobile-menu-btn" on:click={toggleSidebar}>
                                ☰
                            </button>
                            <h1 class="page-title">
                                {#if currentPath === '/admin'}
                                    Dashboard
                                {:else if currentPath === '/admin/analytics'}
                                    Analytics
                                {:else if currentPath === '/admin/sessions'}
                                    Sessions
                                {:else if currentPath === '/admin/questions'}
                                    Questions
                                {:else if currentPath === '/admin/sections'}
                                    Sections
                                {:else if currentPath === '/admin/performance'}
                                    Performance
                                {:else}
                                    Admin
                                {/if}
                            </h1>
                        </div>
                        
                        <div class="header-right">
                            <div class="admin-key-display">
                                Key: {adminKey ? adminKey.substring(0, 8) + '...' : 'Not set'}
                            </div>
                            <button class="btn btn-sm btn-outline" on:click={logout}>
                                Logout
                            </button>
                        </div>
                    </header>
                    
                    <!-- Page Content -->
                    <div class="page-content">
                        <slot />
                    </div>
                {/if}
            </main>
</div>

<style>
    .admin-layout {
        display: flex;
        min-height: 100vh;
        background-color: var(--mailgo-bg-primary);
        color: var(--mailgo-text-primary);
    }
    
    /* Sidebar */
    .sidebar {
        width: 250px;
        background-color: var(--mailgo-bg-secondary);
        border-right: 1px solid var(--mailgo-border);
        display: flex;
        flex-direction: column;
        transition: transform 0.3s ease;
        position: fixed;
        height: 100vh;
        z-index: 1000;
    }
    
    .sidebar.open {
        transform: translateX(0);
    }
    
    @media (max-width: 768px) {
        .sidebar {
            transform: translateX(-100%);
        }
    }
    
    .sidebar-header {
        padding: 1.5rem 1rem;
        border-bottom: 1px solid var(--mailgo-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .sidebar-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
        margin: 0;
    }
    
    .sidebar-toggle {
        background: none;
        border: none;
        color: var(--mailgo-text-muted);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.25rem;
        transition: background-color 0.2s;
    }
    
    .sidebar-toggle:hover {
        background-color: var(--mailgo-bg-tertiary);
    }
    
    .sidebar-nav {
        flex: 1;
        padding: 1rem 0;
    }
    
    .nav-item {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        color: var(--mailgo-text-muted);
        text-decoration: none;
        transition: all 0.2s;
        border-left: 3px solid transparent;
    }
    
    .nav-item:hover {
        background-color: var(--mailgo-bg-tertiary);
        color: var(--mailgo-text-primary);
    }
    
    .nav-item.active {
        background-color: var(--mailgo-bg-tertiary);
        color: var(--mailgo-purple);
        border-left-color: var(--mailgo-purple);
    }
    
    .nav-icon {
        margin-right: 0.75rem;
        font-size: 1.1rem;
    }
    
    .nav-label {
        font-weight: 500;
    }
    
    .sidebar-footer {
        padding: 1rem;
        border-top: 1px solid var(--mailgo-border);
    }
    
    .logout-btn {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0.75rem 1rem;
        background: none;
        border: none;
        color: var(--mailgo-text-muted);
        cursor: pointer;
        border-radius: 0.25rem;
        transition: all 0.2s;
    }
    
    .logout-btn:hover {
        background-color: var(--mailgo-error);
        color: white;
    }
    
    /* Main Content */
    .main-content {
        flex: 1;
        margin-left: 250px;
        display: flex;
        flex-direction: column;
    }
    
    @media (max-width: 768px) {
        .main-content {
            margin-left: 0;
        }
    }
    
    .admin-header {
        background-color: var(--mailgo-bg-secondary);
        border-bottom: 1px solid var(--mailgo-border);
        padding: 1rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .mobile-menu-btn {
        display: none;
        background: none;
        border: none;
        color: var(--mailgo-text-primary);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.25rem;
    }
    
    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: block;
        }
    }
    
    .page-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--mailgo-text-primary);
        margin: 0;
    }
    
    .header-right {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .admin-key-display {
        font-size: 0.875rem;
        color: var(--mailgo-text-muted);
        background-color: var(--mailgo-bg-tertiary);
        padding: 0.5rem 0.75rem;
        border-radius: 0.25rem;
        font-family: monospace;
    }
    
    .page-content {
        flex: 1;
        padding: 1.5rem;
        overflow-y: auto;
    }
    
    /* Overlay for mobile */
    @media (max-width: 768px) {
        .sidebar.open::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: -1;
        }
    }
    
    .auth-required {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #0f172a;
    }
    
    .auth-card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 1rem;
        padding: 3rem;
        text-align: center;
        max-width: 400px;
        width: 100%;
        margin: 2rem;
    }
    
    .auth-card h2 {
        color: #f1f5f9;
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }
    
    .auth-card p {
        color: #94a3b8;
        margin-bottom: 2rem;
        line-height: 1.6;
    }
</style>
