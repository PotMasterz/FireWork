// ===================== FWI / FFMC CALCULATIONS =====================

function computeFWI(temp, humidity, windSpeed, ffmc) {
    return ffmc;
}

// ===================== RISK LABELS =====================

function getFWIRisk(fwi) {
    if (fwi >= 200) return { label: 'ความรุนแรงวิกฤต',    color: '#d50000', bg: 'rgba(213,0,0,0.15)' };
    if (fwi >= 150) return { label: 'ความรุนแรงสูงมาก',   color: '#ff1744', bg: 'rgba(255,23,68,0.15)' };
    if (fwi >= 100) return { label: 'ความรุนแรงสูง',      color: '#ff9100', bg: 'rgba(255,145,0,0.15)' };
    if (fwi >= 50)  return { label: 'ความรุนแรงปานกลาง', color: '#ffd600', bg: 'rgba(255,214,0,0.15)' };
    return                  { label: 'ความรุนแรงต่ำ',     color: '#00c853', bg: 'rgba(0,200,83,0.15)' };
}

function getFFMCRisk(ffmc) {
    if (ffmc >= 96) return { label: 'ความเสี่ยงวิกฤต',    color: '#ff1744', bg: 'rgba(255,23,68,0.15)' };
    if (ffmc >= 94) return { label: 'ความเสี่ยงสูง',      color: '#ff9100', bg: 'rgba(255,145,0,0.15)' };
    if (ffmc >= 92) return { label: 'ความเสี่ยงปานกลาง', color: '#ffd600', bg: 'rgba(255,214,0,0.15)' };
    if (ffmc >= 89) return { label: 'ความเสี่ยงต่ำ',     color: '#00c853', bg: 'rgba(0,200,83,0.15)' };
    return                  { label: 'ความเสี่ยงต่ำมาก', color: '#00e5ff', bg: 'rgba(0,229,255,0.15)' };
}

// ===================== HELPERS =====================

function degToCompass(deg) {
    const dirs = [
        'เหนือ', 'เหนือ-ตะวันออกเฉียงเหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก-ตะวันออกเฉียงเหนือ',
        'ตะวันออก', 'ตะวันออก-ตะวันออกเฉียงใต้', 'ตะวันออกเฉียงใต้', 'ใต้-ตะวันออกเฉียงใต้',
        'ใต้', 'ใต้-ตะวันตกเฉียงใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก-ตะวันตกเฉียงใต้',
        'ตะวันตก', 'ตะวันตก-ตะวันตกเฉียงเหนือ', 'ตะวันตกเฉียงเหนือ', 'เหนือ-ตะวันตกเฉียงเหนือ'
    ];
    const idx = Math.round(deg / 22.5) % 16;
    return dirs[idx] + ` (${deg}°)`;
}
