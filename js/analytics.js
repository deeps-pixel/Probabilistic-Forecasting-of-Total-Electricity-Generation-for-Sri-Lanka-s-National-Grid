let map;
let allPlants = [];
let currentPlant = null;
let plantChart = null;
let weatherChart = null;
let plantMarkers = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:8001/api/plants');
        if (response.ok) {
            allPlants = await response.json();
            initMap();
            renderPlantList(allPlants);
        }
    } catch (e) {
        console.error("Failed to load plants:", e);
    }
    
    document.getElementById('plant-search').addEventListener('input', applyFilters);
    document.getElementById('type-filter').addEventListener('change', applyFilters);
    
    const dDate = new Date();
    const tDay = dDate.toISOString().split('T')[0];
    dDate.setDate(dDate.getDate() + 14);
    const mDay = dDate.toISOString().split('T')[0];
    const picker = document.getElementById('detail-date');
    if (picker) {
        picker.value = tDay;
        picker.min = tDay;
        picker.max = mDay;
    }
    
    document.getElementById('detail-date').addEventListener('change', () => {
        if (currentPlant) loadPlantForecast(currentPlant);
    });
    
    document.getElementById('toggle-table-btn').addEventListener('click', () => {
        const tableContainer = document.getElementById('detailed-table-container');
        const btn = document.getElementById('toggle-table-btn');
        if (tableContainer.style.display === 'none') {
            tableContainer.style.display = 'block';
            btn.innerText = 'Hide Detailed Table';
        } else {
            tableContainer.style.display = 'none';
            btn.innerText = 'Show Detailed Table';
        }
    });
});

function initMap() {
    map = L.map('mini-map-canvas', {
        zoomControl: true,
        attributionControl: false
    }).setView([7.8731, 80.7718], 7);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);

    const validPlants = allPlants.filter(p => p.has_valid_coords);
    validPlants.forEach(plant => {
        const typeClass = plant.type.toLowerCase().replace(/[^a-z0-9]/g, '');
        const opacity = plant.is_modeled ? 1 : 0.4;
        const markerHtml = `<div class="marker-dot ${typeClass}" style="width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.3); opacity: ${opacity};"></div>`;
        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: markerHtml,
            iconSize: [8, 8]
        });
        const marker = L.marker([plant.latitude, plant.longitude], { icon: icon }).addTo(map);
        
        let popupText = `<strong>${plant.plant_name}</strong><br>${plant.type} - ${plant.capacity_mw} MW`;
        if (!plant.is_modeled) popupText += "<br><small style='color:red;'>Not Modeled</small>";
        marker.bindPopup(popupText);
        
        marker.on('click', () => {
            if (plant.is_modeled) {
                map.flyTo([plant.latitude, plant.longitude], 10, { duration: 1 });
                loadPlantForecast(plant);
            } else {
                marker.openPopup();
            }
        });
        plantMarkers.push({plant: plant, marker: marker});
    });
}

function renderPlantList(plants) {
    const list = document.getElementById('sidebar-plant-list');
    list.innerHTML = '';
    plants.forEach(plant => {
        const btn = document.createElement('div');
        btn.className = 'plant-item';
        const opacity = plant.is_modeled ? 1 : 0.5;
        btn.style.opacity = opacity;
        btn.innerHTML = `
            <div>
                <strong style="display:block; color: var(--text-primary); margin-bottom:0.2rem;">${plant.plant_name}</strong>
                <div style="font-size: 0.8rem; color: #64748b;">${plant.capacity_mw} MW</div>
            </div>
            <span class="type-badge ${plant.type.toLowerCase().replace(/[^a-z0-9]/g, '')}">${plant.type}</span>
        `;
        btn.addEventListener('click', () => {
            if (plant.is_modeled) {
                if (plant.has_valid_coords) {
                    map.flyTo([plant.latitude, plant.longitude], 10, { duration: 1 });
                    const pm = plantMarkers.find(m => m.plant.plant_id === plant.plant_id);
                    if(pm) pm.marker.openPopup();
                }
                loadPlantForecast(plant);
            }
        });
        if (!plant.is_modeled) {
            btn.style.cursor = 'not-allowed';
            btn.title = "Not Modeled";
        }
        list.appendChild(btn);
    });
}

function applyFilters() {
    const query = document.getElementById('plant-search').value.toLowerCase();
    const type = document.getElementById('type-filter').value;
    const filtered = allPlants.filter(p => {
        const matchesName = p.plant_name.toLowerCase().includes(query);
        const ptype = p.type.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchesType = (type === 'all') || ptype.includes(type);
        return matchesName && matchesType;
    });
    renderPlantList(filtered);
}

let lastValidDate = document.getElementById('detail-date') ? document.getElementById('detail-date').value : '';
async function loadPlantForecast(plant) {
    currentPlant = plant;
    document.getElementById('analytics-panel').style.display = 'block';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
        document.getElementById('data-state').style.display = 'block';

    document.getElementById('detail-plant-name').innerText = plant.plant_name;

    const typeBadge = document.getElementById('detail-plant-type');
    typeBadge.innerText = plant.type;
    typeBadge.className = `model-badge ${plant.type.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const dateStr = document.getElementById('detail-date').value;
    const loader = document.getElementById('loading-spinner');
    loader.style.display = 'flex';

    try {
        const res = await fetch(`http://localhost:8001/api/forecast/plant/${plant.plant_name}/${dateStr}`);
        if (!res.ok) throw new Error('Forecast unavailable for selected date');
        const data = await res.json();
        
        document.getElementById('w-temp').innerText = `${data.weather.temp} °C`;
        document.getElementById('w-wind').innerText = `${data.weather.wind_speed} m/s`;
        const solarVal = data.weather.solar_irradiance;
        document.getElementById('w-solar').innerText = solarVal && solarVal !== 0 ? `${solarVal} W/m²` : 'N/A';
        
        const expl = document.getElementById('forecast-explanation');
        if (data.used_model === true || data.used_model === 'true') {
            expl.innerHTML = "<strong>LightGBM Forecasting Model:</strong> Utilizing real-time meteorological conditions (Temp, Solar, Wind) coupled with historical capabilities to predict generation accurately.";
        } else {
            expl.innerHTML = "<strong>Baseline Ensemble Method:</strong> As a scheduled or thermal unit, generation is modeled using standard operating capacity metrics and diurnal dispatch curves.";
        }
        
        renderWeatherChart(data.weather);
        renderChart(data.sparkline);
        populateTable(data);
        lastValidDate = dateStr; 
    } catch (e) {
        alert('Failed to load forecast: ' + e.message);
        document.getElementById('detail-date').value = lastValidDate;
    } finally {
        loader.style.display = 'none';
    }
}

function renderWeatherChart(weatherData) {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    const labels = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    
    if (weatherChart) weatherChart.destroy();
    
    weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temp (°C)',
                    data: weatherData.hourly_temp,
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    yAxisID: 'y'
                },
                {
                    label: 'Solar (W/m²)',
                    data: weatherData.hourly_solar,
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    yAxisID: 'y1'
                },
                {
                    label: 'Wind (m/s)',
                    data: weatherData.hourly_wind,
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    yAxisID: 'y2'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#64748b', boxWidth: 10 } }
            },
            scales: {
                x: { display: false },
                y: { display: true, position: 'left', grid: { display: false } },
                y1: { display: true, position: 'right', grid: { display: false } },
                y2: { display: false, position: 'right', grid: { display: false } }
            }
        }
    });
}

function renderChart(sparkline) {
    const ctx = document.getElementById('plantChart').getContext('2d');
    const labels = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    
    if (plantChart) plantChart.destroy();
    
    plantChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Forecasted Generation (MW)',
                data: sparkline,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#64748b' }
                },
                y: {
                    title: { display: true, text: 'MW', color: '#94a3b8' },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#64748b' },
                    min: 0
                }
            }
        }
    });
}

function populateTable(data) {
    const tbody = document.getElementById('detailed-table-body');
    tbody.innerHTML = '';
    for(let i=0; i<24; i++) {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        
        const hr = `${i.toString().padStart(2, '0')}:00`;
        const temp = data.weather.hourly_temp && data.weather.hourly_temp.length > i ? data.weather.hourly_temp[i] : '--';
        const wind = data.weather.hourly_wind && data.weather.hourly_wind.length > i ? data.weather.hourly_wind[i] : '--';
        const solar = data.weather.hourly_solar && data.weather.hourly_solar.length > i ? data.weather.hourly_solar[i] : '--';
        const fcst = data.sparkline[i].toFixed(2);
        
        tr.innerHTML = `
            <td style="padding: 0.75rem;">${hr}</td>
            <td style="padding: 0.75rem;">${temp}</td>
            <td style="padding: 0.75rem;">${wind}</td>
            <td style="padding: 0.75rem;">${solar}</td>
            <td style="padding: 0.75rem; font-weight: 600; color: var(--cool-teal);">${fcst}</td>
        `;
        tbody.appendChild(tr);
    }
}
