// ===================== IMAGE GALLERY =====================

function renderGallery(images) {
    const grid = document.getElementById('gallery-grid');
    if (!images || images.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted); padding:20px; text-align:center;">ไม่มีภาพ</div>';
        return;
    }

    // Show most recent first
    const sorted = [...images].reverse();

    grid.innerHTML = sorted.map(img => `
        <div class="gallery-item" onclick="openLightbox('${img.image_url}')">
            <img src="${img.image_url}" alt="Capture" loading="lazy"
                 onerror="this.parentElement.style.display='none'">
            <span class="fire-badge ${img.fire == 1 ? 'fire' : 'safe'}">${img.fire == 1 ? '🔥 ไฟ' : '✓ ปลอดภัย'}</span>
            <span class="gallery-time">${img.datetime ? img.datetime.split(' ')[1] : ''}</span>
        </div>
    `).join('');
}

function openLightbox(url) {
    document.getElementById('lightbox-img').src = url;
    document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}
