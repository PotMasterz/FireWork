// ===================== UI UPDATES =====================

let _latestSensorData = null;

function degToCompassEN(deg) {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(deg / 22.5) % 16;
    return dirs[idx];
}

function openFireSim() {
    if (!_latestSensorData) {
        alert('ยังไม่มีข้อมูลเซ็นเซอร์');
        return;
    }
    const s = _latestSensorData.sensor;
    const ffmc = _latestSensorData.ffmc;
    const temp = s.temp;
    const rh = s.humidity;
    const windKmh = parseFloat(s.wind_speed);
    const windDir = s.wind_direction != null ? degToCompassEN(s.wind_direction) : '--';
    const ffmcVal = typeof ffmc === 'number' ? ffmc.toFixed(2) : ffmc;

    const url = `https://techno.varee.ac.th/users/admin/fire_sim2.html?lat=18.551&lon=99.123&temp=${temp}&rh=${rh}&wind=${windKmh}&windDir=${windDir}&ffmc=${ffmcVal}`;
    window.open(url, '_blank');
}

function updateCurrentStatus(data) {
    _latestSensorData = data;
    // Timestamp
    document.getElementById('last-update-time').textContent = data.datetime;
    document.getElementById('camera-time').textContent = data.datetime;

    // Sensor values
    const s = data.sensor;

    document.getElementById('temp-value').innerHTML = `${s.temp}<span class="stat-unit">&deg;C</span>`;
    document.getElementById('temp-sub').textContent  = s.temp > 35 ? 'อุณหภูมิสูง' : s.temp > 25 ? 'อบอุ่น' : 'เย็น';

    document.getElementById('humi-value').innerHTML = `${s.humidity}<span class="stat-unit">%</span>`;
    document.getElementById('humi-sub').textContent  = s.humidity > 70 ? 'ความชื้นสูง' : s.humidity > 40 ? 'ปานกลาง' : 'ต่ำ - สภาพแห้ง';

    document.getElementById('co2-value').innerHTML = `${s.co2}<span class="stat-unit">ppm</span>`;
    document.getElementById('co2-sub').textContent  = s.co2 > 1000 ? 'สูงกว่าปกติ' : s.co2 > 600 ? 'ปานกลาง' : 'ปกติ';

    document.getElementById('wind-value').innerHTML = `${s.wind_speed}<span class="stat-unit">km/hr</span>`;

    // Wind direction compass
    const windDeg = s.wind_direction || 0;
    document.getElementById('wind-arrow').style.transform = `translate(-50%, -100%) rotate(${windDeg}deg)`;
    document.getElementById('wind-dir-text').textContent  = degToCompass(windDeg);

    // FFMC
    const ffmc     = data.ffmc;
    const ffmcNum  = parseFloat(ffmc);
    const ffmcPct  = Math.min(100, Math.max(0, ((ffmcNum - 86) / (100 - 86)) * 100));
    const riskInfo = getFFMCRisk(ffmcNum);

    document.getElementById('ffmc-value').textContent    = typeof ffmc === 'number' ? ffmc.toFixed(2) : ffmc;
    document.getElementById('ffmc-value').style.color    = riskInfo.color;
    document.getElementById('ffmc-marker').style.left    = ffmcPct + '%';

    const riskLabel = document.getElementById('ffmc-risk');
    riskLabel.textContent    = riskInfo.label;
    riskLabel.style.background = riskInfo.bg;
    riskLabel.style.color      = riskInfo.color;

    // FWI
    const fwi        = computeFWI(parseFloat(s.temp), parseFloat(s.humidity), parseFloat(s.wind_speed), ffmcNum);
    const fwiPct     = Math.min(100, Math.max(0, (fwi / 250) * 100));
    const fwiRiskInfo = getFWIRisk(fwi);

    document.getElementById('fwi-value').textContent      = fwi.toFixed(2);
    document.getElementById('fwi-value').style.color      = fwiRiskInfo.color;
    document.getElementById('fwi-marker').style.left      = fwiPct + '%';

    const fwiRiskLabel = document.getElementById('fwi-risk');
    fwiRiskLabel.textContent      = fwiRiskInfo.label;
    fwiRiskLabel.style.background = fwiRiskInfo.bg;
    fwiRiskLabel.style.color      = fwiRiskInfo.color;

    // Fire detection
    const fire       = data.fire;
    const badge      = document.getElementById('fire-status-badge');
    const icon       = document.getElementById('fire-icon');
    const text       = document.getElementById('fire-text');
    const level      = document.getElementById('fire-level');
    const statusText = document.getElementById('status-text');

    if (fire.detected) {
        badge.className      = 'status-badge danger';
        statusText.textContent = 'ตรวจพบไฟ!';
        icon.textContent     = '🔥';
        text.textContent     = 'ตรวจพบไฟ!';
        text.style.color     = 'var(--accent-red)';
        level.textContent    = `ระดับ: ${fire.level} | แหล่ง: ${fire.source}`;
    } else {
        badge.className      = 'status-badge normal';
        statusText.textContent = 'ปกติ';
        icon.textContent     = '✅';
        text.textContent     = 'ไม่พบไฟ';
        text.style.color     = 'var(--accent-green)';
        level.textContent    = `ระดับ: ${fire.level}`;
    }

    // Camera image
    if (fire.image_url) {
        document.getElementById('camera-img').src = fire.image_url;
    }

    // Check alert thresholds
    checkAlerts(s, ffmcNum, fwi);
}
