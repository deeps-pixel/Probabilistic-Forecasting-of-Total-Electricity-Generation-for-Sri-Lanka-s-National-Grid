document.addEventListener('DOMContentLoaded', () => {
    // Port 8001 is fixed for the FastAPI backend
    const API_BASE = "http://localhost:8001";

    const runBtn = document.getElementById('run-forecast-btn');
    const dayRibbon = document.getElementById('day-ribbon');
    const resultsContainer = document.getElementById('forecast-results');
    const datePicker = document.getElementById('forecast-date-picker');
    const loadingOverlay = document.getElementById('loading-overlay');
    const mainContent = document.getElementById('forecast-main-content');

    function showLoading() {
        if (loadingOverlay) loadingOverlay.classList.add('active');
        if (mainContent) mainContent.classList.add('blurred');
    }

    function hideLoading() {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
        if (mainContent) mainContent.classList.remove('blurred');
    }

    // 1. Initialize Date Logic (14-day window from TODAY)
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Normalize to start of day

    const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsArr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    function getLocalDateString(date) {
        return date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');
    }

    function populateDayRibbon() {
        if (!dayRibbon) return;
        dayRibbon.innerHTML = '';
        for (let i = 0; i < 14; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);

            const tile = document.createElement('div');
            tile.className = i === 0 ? 'day-tile active' : 'day-tile';
            tile.dataset.date = getLocalDateString(d);

            const dayLabel = i === 0 ? 'Today' : daysArr[d.getDay()];

            tile.innerHTML = `
                <span class="d-name">${dayLabel}</span>
                <span class="d-value">${d.getDate()}</span>
                <span class="d-month">${monthsArr[d.getMonth()]}</span>
            `;

            tile.addEventListener('click', () => {
                document.querySelectorAll('.day-tile').forEach(t => t.classList.remove('active'));
                tile.classList.add('active');
                if (datePicker) datePicker.value = tile.dataset.date;
                // Auto-refresh forecast if already visible
                if (resultsContainer.style.display !== 'none') runForecast();
            });

            dayRibbon.appendChild(tile);
        }
    }

    populateDayRibbon();
    if (datePicker) datePicker.value = getLocalDateString(startDate);

    // 2. High-Level Forecast Execution
    runBtn.addEventListener('click', runForecast);

    async function runForecast() {
        const selectedDate = datePicker.value;
        showLoading();

        try {
            const [summaryRes, chartRes] = await Promise.all([
                fetch(`${API_BASE}/api/forecast/daily-summary/${selectedDate}`),
                fetch(`${API_BASE}/api/forecast/chart/${selectedDate}`)
            ]);
            
            if (!summaryRes.ok || !chartRes.ok) throw new Error("API Offline");
            
            const data = await summaryRes.json();
            const chartData = await chartRes.json();

            // Update Global Stats
            document.getElementById('stat-total-gwh').textContent = `${data.total_expected_gwh} GWh`;
            document.getElementById('stat-renewable-share').textContent = `${Math.round(data.renewable_share * 100)}%`;
            document.getElementById('stat-peak-demand').textContent = `${data.peak_demand_mw} MW`;

            // Update Metrics
            document.getElementById('val-r2').textContent = data.accuracy_metrics.r_squared;
            document.getElementById('val-lgbm-mae').textContent = `${data.accuracy_metrics.lightgbm_mae_mw} MW`;
            document.getElementById('val-plants').textContent = `${data.plant_aggregation.total_plants} Nodes`;

            // Energy Segments
            const ren_share = data.renewable_share * 100;
            document.getElementById('seg-hydro').style.width = `${(data.renewable_gwh * 0.8 / data.total_expected_gwh) * 100}%`;
            document.getElementById('seg-wind').style.width = `${(data.renewable_gwh * 0.1 / data.total_expected_gwh) * 100}%`;
            document.getElementById('seg-solar').style.width = `${(data.renewable_gwh * 0.1 / data.total_expected_gwh) * 100}%`;

            // Reveal Container
            resultsContainer.style.display = 'block';

            // Primary Charts
            renderMainForecastChart(chartData);
            renderCategoryChart(chartData);

        } catch (err) {
            console.error('Forecast failed:', err);
            alert(`Forecasting Error: Backend Unreachable. Please ensure the server is running on port 8001.`);
        } finally {
            setTimeout(hideLoading, 800);
        }
    }

    
    let forecastChart = null;
    function renderMainForecastChart(chartData) {
        if (forecastChart) forecastChart.destroy();
        const ctx = document.getElementById('forecastChart').getContext('2d');

        const labels = chartData.map(d => d.hour);
        
        const gradHydro = ctx.createLinearGradient(0, 0, 0, 400);
        gradHydro.addColorStop(0, 'rgba(20, 184, 166, 0.8)');
        gradHydro.addColorStop(1, 'rgba(20, 184, 166, 0.1)');
        
        const gradWind = ctx.createLinearGradient(0, 0, 0, 400);
        gradWind.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
        gradWind.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
        
        const gradSolar = ctx.createLinearGradient(0, 0, 0, 400);
        gradSolar.addColorStop(0, 'rgba(245, 158, 11, 0.8)');
        gradSolar.addColorStop(1, 'rgba(245, 158, 11, 0.1)');
        
        const gradCoal = ctx.createLinearGradient(0, 0, 0, 400);
        gradCoal.addColorStop(0, 'rgba(71, 85, 105, 0.8)');
        gradCoal.addColorStop(1, 'rgba(71, 85, 105, 0.1)');
        
        const gradOil = ctx.createLinearGradient(0, 0, 0, 400);
        gradOil.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        gradOil.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
        
        const gradLng = ctx.createLinearGradient(0, 0, 0, 400);
        gradLng.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
        gradLng.addColorStop(1, 'rgba(99, 102, 241, 0.1)');
        
        forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Hydro',
                        data: chartData.map(d => d.hydro),
                        borderColor: '#14b8a6',
                        backgroundColor: gradHydro,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Wind',
                        data: chartData.map(d => d.wind),
                        borderColor: '#10b981',
                        backgroundColor: gradWind,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Solar',
                        data: chartData.map(d => d.solar),
                        borderColor: '#f59e0b',
                        backgroundColor: gradSolar,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Coal',
                        data: chartData.map(d => d.coal),
                        borderColor: '#475569',
                        backgroundColor: gradCoal,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Oil',
                        data: chartData.map(d => d.oil),
                        borderColor: '#ef4444',
                        backgroundColor: gradOil,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'LNG',
                        data: chartData.map(d => d.lng),
                        borderColor: '#6366f1',
                        backgroundColor: gradLng,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { stacked: true, beginAtZero: true, grid: { borderDash: [5, 5] }, title: { display: true, text: 'MW' } }
                }
            }
        });

        const legendContainer = document.getElementById('forecast-legend');
        if(legendContainer) {
            legendContainer.innerHTML = forecastChart.data.datasets.map(ds => 
                `<div class="legend-item"><span class="dot" style="background: ${ds.borderColor};"></span> ${ds.label}</div>`
            ).join('');
        }
    }

    let categoryChart = null;
    function renderCategoryChart(chartData) {
        if (categoryChart) categoryChart.destroy();
        const ctx = document.getElementById('categoryChart').getContext('2d');

        // Sum across the 24 hours for each category to get daily totals
        const sumType = (type) => chartData.reduce((acc, curr) => acc + curr[type], 0) / 1000; // MW to GWh

        const totals = [
            sumType('hydro'),
            sumType('solar'),
            sumType('wind'),
            sumType('coal') + sumType('oil') + sumType('lng')
        ];

        categoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Hydro', 'Solar', 'Wind', 'Thermal'],
                datasets: [{
                    label: 'Expected GWh',
                    data: totals,
                    backgroundColor: ['#0f766e', '#f59e0b', '#10b981', '#ef4444'],
                    borderRadius: 8,
                    barThickness: 'flex',
                    maxBarThickness: 50
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, grid: { borderDash: [5, 5] }, title: { display: true, text: 'GWh' } }
                }
            }
        });
    }
});
