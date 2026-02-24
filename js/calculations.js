// ===================== FWI / FFMC CALCULATIONS =====================

function getRainCode(rainfall) {
    if (rainfall < 2.9) return 0;
    if (rainfall < 4.7) return 1;
    if (rainfall < 6.3) return 2;
    if (rainfall < 7.9) return 3;
    return 4;
}

function calculateISI(ffmc, windspeed) {
    return -0.2398 + (1.9590 * ffmc) + (-0.0713 * ffmc) + (0.0441 * ffmc) + (0.1012 * ffmc) +
           (0.0467 * ffmc) + (-0.0848 * ffmc) + (0.1675 * ffmc) + (-0.1852 * ffmc) + (0.0898 * ffmc) +
           (0.1414 * ffmc) + (-0.1025 * ffmc) + (-0.2678 * ffmc) + (0.1665 * ffmc) + (-0.0581 * ffmc) +
           (0.0435 * ffmc) + (0.5070 * windspeed);
}

function calculateDMC(temperature, humidity, rainfall) {
    const dmcIncrementTable = {
        '0-5':     {0: 0, 1: 0, 5: 1, 10: 1},
        '5.5-10':  {0: 1, 1: 1, 5: 1, 10: 2},
        '10.5-15': {0: 2, 5: 2, 10: 3, 15: 4},
        '15.5-20': {0: 3, 5: 3, 10: 4, 15: 5},
        '20.5-25': {0: 4, 5: 5, 10: 5, 15: 6},
        '25.5-30': {0: 5, 5: 6, 10: 7, 15: 8},
        '30.5-35': {0: 6, 5: 7, 10: 8, 15: 9},
        '35.5-40': {0: 7, 5: 8, 10: 9, 15: 10}
    };
    const rainTable = {
        '0-2': 0, '3-5': 1, '6-8': 2, '9-11': 3, '12-14': 4,
        '15-17': 5, '18-20': 6, '21-23': 7, '24-26': 8, '27-29': 9, '30-33': 10
    };

    let increment = 0;
    for (const range in dmcIncrementTable) {
        const [minTemp, maxTemp] = range.split('-').map(Number);
        if (temperature >= minTemp && temperature <= maxTemp) {
            for (const rh in dmcIncrementTable[range]) {
                if (humidity <= Number(rh)) {
                    increment = dmcIncrementTable[range][rh];
                    break;
                }
            }
            break;
        }
    }

    let rainCode = 0;
    for (const range in rainTable) {
        const [minRain, maxRain] = range.split('-').map(Number);
        if (rainfall >= minRain && rainfall <= maxRain) {
            rainCode = rainTable[range];
            break;
        }
    }

    return rainfall > 0 ? 6 + increment + rainCode : increment;
}

function calculateBUI(dmc) {
    return dmc + 2;
}

function calculateFWI(isi, bui) {
    return isi + bui;
}

function computeFWI(temp, humidity, windSpeed, ffmc) {
    const rainfall = 0; // no rainfall sensor
    const isi = calculateISI(ffmc, windSpeed);
    const dmc = calculateDMC(temp, humidity, rainfall);
    const bui = calculateBUI(dmc);
    return calculateFWI(isi, bui);
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
