// ===================== FWI / FFMC CALCULATIONS =====================

function getRainCode(rainfall) {
    if (rainfall < 2.9) return 0;
    if (rainfall < 4.7) return 1;
    if (rainfall < 6.3) return 2;
    if (rainfall < 7.9) return 3;
    return 4;
}

function calculateISI(ffmc, windSpeed) {
    // Standard Canadian FWI System ISI formula
    const m = 147.2 * (101 - ffmc) / (59.5 + ffmc);
    const fW = Math.exp(0.05039 * windSpeed);
    const fF = 91.9 * Math.exp(-0.1386 * m) * (1 + Math.pow(m, 5.31) / 4.93e7);
    return 0.208 * fW * fF;
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
    // Without Drought Code (DC) sensor, BUI approximates to DMC
    return dmc;
}

function calculateFWI(isi, bui) {
    // Standard Canadian FWI System formula
    let fD;
    if (bui <= 80) {
        fD = 0.626 * Math.pow(bui, 0.809) + 2;
    } else {
        fD = 1000 / (25 + 108.64 * Math.exp(-0.023 * bui));
    }
    const b = 0.1 * isi * fD;
    if (b > 1) {
        return Math.exp(2.72 * Math.pow(0.434 * Math.log(b), 0.647));
    }
    return b;
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
