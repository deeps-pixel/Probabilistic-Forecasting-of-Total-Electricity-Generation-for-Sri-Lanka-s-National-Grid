let scenarioChart = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('run-sim-btn').addEventListener('click', runSimulation);
});

async function runSimulation() {
    const btn = document.getElementById('run-sim-btn');
    const statsBox = document.getElementById('sim-stats');
    const dateInput = document.getElementById('sim-date').value;
    
    btn.innerHTML = "⏳ Simulating Reinforcement Learning...";
    btn.style.opacity = '0.7';
    
    try {
        const response = await fetch(`http://localhost:8001/api/scenario/rl-battery?date=${dateInput}`);
        
        if (!response.ok) throw new Error("Simulation API failed");
        const data = await response.json();
        
        renderChart(data.simulation);
        
        statsBox.style.display = 'block';
        btn.innerHTML = "▶ Run RL Simulation";
        btn.style.opacity = '1';
        
    } catch (err) {
        alert("Error running RL Simulation: " + err);
        btn.innerHTML = "▶ Run RL Simulation";
        btn.style.opacity = '1';
    }
}

function renderChart(simData) {
    const ctx = document.getElementById('scenarioChart').getContext('2d');
    
    const labels = simData.map(d => d.hour);
    const originalLoad = simData.map(d => d.original_load);
    const netLoad = simData.map(d => d.net_load);
    const batteryActions = simData.map(d => d.battery_action);

    if (scenarioChart) {
        scenarioChart.destroy();
    }

    scenarioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Original Grid Generation (MW)',
                    data: originalLoad,
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Optimized Net Grid Load (MW)',
                    data: netLoad,
                    borderColor: '#10b981', // Emerald
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Battery Dispatch (MW)',
                    data: batteryActions,
                    type: 'bar',
                    backgroundColor: batteryActions.map(v => v > 0 ? 'rgba(13, 148, 136, 0.6)' : 'rgba(244, 63, 94, 0.6)'),
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8' }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#64748b' }
                },
                y: {
                    title: { display: true, text: 'Grid Load (MW)', color: '#94a3b8' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#64748b' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Battery Action (+Charge / -Discharge)', color: '#94a3b8' },
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#64748b' }
                }
            }
        }
    });
}
