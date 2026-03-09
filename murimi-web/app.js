/**
 * Murimi Web Preview Logic
 * Handles API interactions and dynamic UI updates
 */

const API_BASE = '/api';

// State management
let state = {
    language: 'en',
    user: { name: 'Farai', location: 'Harare, Zimbabwe' },
    recentDetections: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Murimi Web Preview Initialized');

    // Check which page we are on
    const path = window.location.pathname;

    if (path.includes('index.html') || path === '/') {
        initDashboard();
    } else if (path.includes('history.html')) {
        initHistory();
    } else if (path.includes('shops.html')) {
        initShops();
    }
});

function initDashboard() {
    const scanBtn = document.getElementById('scan-button');
    if (scanBtn) {
        scanBtn.addEventListener('click', () => {
            alert('AI Scanner: In a real app, this would open the camera or file picker.\nIntegrating with Gemini API...');
            // Mocking a scan process
            setTimeout(() => {
                window.location.href = 'history.html';
            }, 1500);
        });
    }

    fetchRecentDetections();
}

async function fetchRecentDetections() {
    try {
        const response = await fetch(`${API_BASE}/disease/history`);
        if (response.ok) {
            const data = await response.json();
            renderDetections(data.slice(0, 3));
        }
    } catch (err) {
        console.warn('API not available, using mock data');
    }
}

function renderDetections(detections) {
    const container = document.getElementById('recent-detections');
    if (!container || !detections.length) return;

    // Clear static mockups if we have real data
    container.innerHTML = '';

    detections.forEach(d => {
        const item = document.createElement('div');
        item.className = 'flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700';
        item.innerHTML = `
            <div class="size-16 rounded-lg overflow-hidden shrink-0">
                <img src="${d.image_url || 'https://via.placeholder.com/64'}" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-slate-900 dark:text-slate-100">${d.disease_name || 'Healthy'}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400">${d.crop_type || 'Crop'}</p>
            </div>
            <div class="px-3 py-1 rounded-full ${d.confidence > 0.8 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} text-xs font-bold">
                ${Math.round(d.confidence * 100)}%
            </div>
        `;
        container.appendChild(item);
    });
}

function initHistory() {
    console.log('History view loaded');
    // Implementation for history page filtering etc.
}

function initShops() {
    console.log('Shop finder loaded');
    // Implementation for map markers etc.
}
