// ===================== MAIN / INIT =====================

let autoRefreshInterval = null;

function formatDate(d) {
    return d.toISOString().split('T')[0];
}

function setDefaultDates() {
    const today     = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    document.getElementById('history-end').value   = formatDate(today);
    document.getElementById('history-start').value = formatDate(yesterday);
}

function refreshAll() {
    fetchLastRecord();
    fetchImages();
}

function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        fetchLastRecord();
    }, AUTO_REFRESH_INTERVAL_MS);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

// Boot
document.addEventListener('DOMContentLoaded', () => {
    setDefaultDates();
    loadAlertSettingsToUI();
    fetchLastRecord();
    fetchImages();
    startAutoRefresh();
});
