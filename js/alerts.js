// ===================== ALARM STATE =====================

let alarmAudioCtx = null;
let alarmIsPlaying = false;

// Prevents repeat alarm until value recovers below/above threshold
let alertFired = { temp: false, humi: false, co2: false, ffmc: false, fwi: false, batt: false };

// ===================== ALERT SETTINGS (localStorage) =====================

const ALERT_DEFAULTS = {
    temp: { on: false, val: 42 },
    humi: { on: false, val: 20 },
    co2:  { on: false, val: 1500 },
    ffmc: { on: false, val: 95 },
    fwi:  { on: false, val: 50 },
    batt: { on: false, val: 20 }
};

function getAlertSettings() {
    try {
        const saved = localStorage.getItem('fireAlertSettings');
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return JSON.parse(JSON.stringify(ALERT_DEFAULTS)); // return a fresh copy
}

function saveAlertSettings() {
    const current = getAlertSettings();

    // safeFloat: fallback to current saved value if input is not a valid number
    function safeFloat(id, fallback) {
        const v = parseFloat(document.getElementById(id).value);
        return isNaN(v) ? fallback : v;
    }

    const settings = {
        temp: { on: document.getElementById('alert-temp-on').checked,  val: safeFloat('alert-temp-val', current.temp.val) },
        humi: { on: document.getElementById('alert-humi-on').checked,  val: safeFloat('alert-humi-val', current.humi.val) },
        co2:  { on: document.getElementById('alert-co2-on').checked,   val: safeFloat('alert-co2-val',  current.co2.val) },
        ffmc: { on: document.getElementById('alert-ffmc-on').checked,  val: safeFloat('alert-ffmc-val', current.ffmc.val) },
        fwi:  { on: document.getElementById('alert-fwi-on').checked,   val: safeFloat('alert-fwi-val',  current.fwi.val) },
        batt: { on: document.getElementById('alert-batt-on').checked,  val: safeFloat('alert-batt-val', current.batt.val) }
    };

    localStorage.setItem('fireAlertSettings', JSON.stringify(settings));
}

function loadAlertSettingsToUI() {
    const s = getAlertSettings();
    document.getElementById('alert-temp-on').checked  = s.temp.on;
    document.getElementById('alert-temp-val').value   = s.temp.val;
    document.getElementById('alert-humi-on').checked  = s.humi.on;
    document.getElementById('alert-humi-val').value   = s.humi.val;
    document.getElementById('alert-co2-on').checked   = s.co2.on;
    document.getElementById('alert-co2-val').value    = s.co2.val;
    document.getElementById('alert-ffmc-on').checked  = s.ffmc.on;
    document.getElementById('alert-ffmc-val').value   = s.ffmc.val;
    document.getElementById('alert-fwi-on').checked   = s.fwi.on;
    document.getElementById('alert-fwi-val').value    = s.fwi.val;
    document.getElementById('alert-batt-on').checked  = s.batt.on;
    document.getElementById('alert-batt-val').value   = s.batt.val;
}

// ===================== ALARM SOUND =====================

function playAlarmSound() {
    if (alarmIsPlaying) return;
    try {
        alarmAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const gainNode = alarmAudioCtx.createGain();
        gainNode.gain.value = 0.3;
        gainNode.connect(alarmAudioCtx.destination);

        function beepCycle() {
            if (!alarmIsPlaying) return;
            const osc = alarmAudioCtx.createOscillator();
            osc.type = 'square';
            osc.frequency.value = 880;
            osc.connect(gainNode);
            osc.start();
            osc.stop(alarmAudioCtx.currentTime + 0.15);

            setTimeout(() => {
                if (!alarmIsPlaying) return;
                const osc2 = alarmAudioCtx.createOscillator();
                osc2.type = 'square';
                osc2.frequency.value = 660;
                osc2.connect(gainNode);
                osc2.start();
                osc2.stop(alarmAudioCtx.currentTime + 0.15);
            }, 200);

            setTimeout(() => beepCycle(), 1500);
        }

        alarmIsPlaying = true;
        beepCycle();
    } catch (e) {
        console.error('Audio alarm failed:', e);
    }
}

function stopAlarmSound() {
    alarmIsPlaying = false;
    if (alarmAudioCtx) {
        alarmAudioCtx.close().catch(() => {});
        alarmAudioCtx = null;
    }
}

function dismissAlarm() {
    stopAlarmSound();
    document.getElementById('alarm-banner').classList.remove('active');
}

// ===================== ALERT CHECKING =====================

function checkAlerts(sensorData, ffmcVal, fwiVal) {
    const s = getAlertSettings();
    const triggers = [];

    // Temperature: alert when ABOVE threshold
    if (s.temp.on) {
        const val = parseFloat(sensorData.temp);
        if (val > s.temp.val) {
            if (!alertFired.temp) {
                triggers.push(`อุณหภูมิ ${val}°C (> ${s.temp.val}°C)`);
                alertFired.temp = true;
            }
        } else {
            alertFired.temp = false;
        }
    }

    // Humidity: alert when BELOW threshold
    if (s.humi.on) {
        const val = parseFloat(sensorData.humidity);
        if (val < s.humi.val) {
            if (!alertFired.humi) {
                triggers.push(`ความชื้น ${val}% (< ${s.humi.val}%)`);
                alertFired.humi = true;
            }
        } else {
            alertFired.humi = false;
        }
    }

    // CO2: alert when ABOVE threshold
    if (s.co2.on) {
        const val = parseFloat(sensorData.co2);
        if (val > s.co2.val) {
            if (!alertFired.co2) {
                triggers.push(`CO2 ${val} ppm (> ${s.co2.val} ppm)`);
                alertFired.co2 = true;
            }
        } else {
            alertFired.co2 = false;
        }
    }

    // FFMC: alert when ABOVE threshold
    if (s.ffmc.on) {
        if (ffmcVal > s.ffmc.val) {
            if (!alertFired.ffmc) {
                triggers.push(`FFMC ${ffmcVal.toFixed(2)} (> ${s.ffmc.val})`);
                alertFired.ffmc = true;
            }
        } else {
            alertFired.ffmc = false;
        }
    }

    // FWI: alert when ABOVE threshold
    if (s.fwi.on) {
        if (fwiVal > s.fwi.val) {
            if (!alertFired.fwi) {
                triggers.push(`FWI ${fwiVal.toFixed(2)} (> ${s.fwi.val})`);
                alertFired.fwi = true;
            }
        } else {
            alertFired.fwi = false;
        }
    }

    // Battery: alert when BELOW threshold
    if (s.batt.on && sensorData.battery_pct !== undefined) {
        const val = parseFloat(sensorData.battery_pct);
        if (val < s.batt.val) {
            if (!alertFired.batt) {
                triggers.push(`แบตเตอรี่ ${val}% (< ${s.batt.val}%)`);
                alertFired.batt = true;
            }
        } else {
            alertFired.batt = false;
        }
    }

    if (triggers.length > 0) {
        document.getElementById('alarm-detail').textContent = triggers.join(' | ');
        document.getElementById('alarm-banner').classList.add('active');
        playAlarmSound();
    }
}
