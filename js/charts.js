// ===================== CHART STATE =====================

let historyChartTempHumi = null;
let historyChartCO2Wind  = null;

// ===================== SHARED CHART OPTIONS =====================

function getBaseChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { labels: { color: '#8899a6', font: { size: 11 } } },
            tooltip: {
                backgroundColor: '#1e2d3a',
                borderColor: '#2a3f50',
                borderWidth: 1,
                titleColor: '#e8edf2',
                bodyColor: '#8899a6',
            }
        },
        scales: {
            x: {
                ticks: { color: '#5c6f7e', font: { size: 10 }, maxTicksLimit: 10, maxRotation: 0 },
                grid: { color: 'rgba(42,63,80,0.3)' }
            },
            y: {
                ticks: { color: '#5c6f7e', font: { size: 10 } },
                grid: { color: 'rgba(42,63,80,0.3)' }
            }
        },
        elements: { point: { radius: 0 }, line: { borderWidth: 2 } }
    };
}

// ===================== HISTORY CHARTS =====================

function updateHistoryCharts(records) {
    if (!records || records.length === 0) {
        alert('ไม่พบข้อมูลในช่วงวันที่เลือก');
        return;
    }

    // Downsample for performance
    const maxPoints = 500;
    let sampled = records;
    if (records.length > maxPoints) {
        const step = Math.ceil(records.length / maxPoints);
        sampled = records.filter((_, i) => i % step === 0);
    }

    const labels = sampled.map(r => r.dateTime);
    const temps  = sampled.map(r => parseFloat(r.Temp));
    const humis  = sampled.map(r => parseFloat(r.HUMI));
    const co2s   = sampled.map(r => parseFloat(r.CO2));
    const winds  = sampled.map(r => parseFloat(r.Wind_speed));

    const base = getBaseChartOptions();

    // --- Temperature & Humidity ---
    if (historyChartTempHumi) historyChartTempHumi.destroy();
    historyChartTempHumi = new Chart(document.getElementById('chart-temp-humi'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'อุณหภูมิ (°C)',
                    data: temps,
                    borderColor: '#ff5722',
                    backgroundColor: 'rgba(255,87,34,0.1)',
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'ความชื้น (%)',
                    data: humis,
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33,150,243,0.1)',
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...base,
            scales: {
                ...base.scales,
                y: {
                    ...base.scales.y,
                    position: 'left',
                    title: { display: true, text: 'อุณหภูมิ (°C)', color: '#ff5722', font: { size: 11 } }
                },
                y1: {
                    position: 'right',
                    ticks: { color: '#5c6f7e', font: { size: 10 } },
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'ความชื้น (%)', color: '#2196f3', font: { size: 11 } }
                }
            }
        }
    });

    // --- CO2 & Wind Speed ---
    if (historyChartCO2Wind) historyChartCO2Wind.destroy();
    historyChartCO2Wind = new Chart(document.getElementById('chart-co2-wind'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'CO2 (ppm)',
                    data: co2s,
                    borderColor: '#9c27b0',
                    backgroundColor: 'rgba(156,39,176,0.1)',
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'ความเร็วลม (km/hr)',
                    data: winds,
                    borderColor: '#00bcd4',
                    backgroundColor: 'rgba(0,188,212,0.1)',
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...base,
            scales: {
                ...base.scales,
                y: {
                    ...base.scales.y,
                    position: 'left',
                    title: { display: true, text: 'CO2 (ppm)', color: '#9c27b0', font: { size: 11 } }
                },
                y1: {
                    position: 'right',
                    ticks: { color: '#5c6f7e', font: { size: 10 } },
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'ลม (km/hr)', color: '#00bcd4', font: { size: 11 } }
                }
            }
        }
    });
}
