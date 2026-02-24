// ===================== API CALLS =====================

async function fetchLastRecord() {
    try {
        const res  = await fetch(API_LAST_RECORD);
        const data = await res.json();
        updateCurrentStatus(data);
    } catch (err) {
        console.error('Failed to fetch last record:', err);
    }
}

async function fetchHistory() {
    const start = document.getElementById('history-start').value;
    const end   = document.getElementById('history-end').value;

    if (!start || !end) {
        alert('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด');
        return;
    }

    const btn = document.getElementById('btn-history');
    btn.disabled    = true;
    btn.textContent = 'กำลังโหลด...';

    try {
        const res  = await fetch(`${API_HISTORY}?start=${start}&end=${end}`);
        const data = await res.json();
        document.getElementById('history-count').textContent = `${data.count.toLocaleString()} รายการ`;
        updateHistoryCharts(data.data);
    } catch (err) {
        console.error('Failed to fetch history:', err);
        alert('ไม่สามารถโหลดข้อมูลย้อนหลังได้');
    } finally {
        btn.disabled    = false;
        btn.textContent = 'โหลดข้อมูล';
    }
}

async function fetchImages() {
    try {
        const res  = await fetch(API_IMAGES);
        const data = await res.json();
        document.getElementById('gallery-count').textContent = `${data.count} ภาพ`;
        renderGallery(data.images);
    } catch (err) {
        console.error('Failed to fetch images:', err);
        document.getElementById('gallery-grid').innerHTML =
            '<div style="color:var(--text-muted); padding:20px; text-align:center;">ไม่สามารถโหลดภาพได้</div>';
    }
}
