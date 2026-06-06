# Sri Lanka Energy Grid – AI Forecasting Dashboard

> Probabilistic, weather‑integrated electricity generation forecasting for Sri Lanka's national grid, delivered as an interactive full‑stack dashboard.

## Introduction

This project combines historical CEB operational reports, weather data, and machine‑learning models (LightGBM, Decision‑Tree baseline, and a reinforcement‑learning battery dispatch agent) to provide:

- 14‑day national‑grid generation forecasts with confidence intervals
- Plant‑level analytics with live weather overlays
- An AI‑driven conversational assistant (Gemini‑2.5‑Flash) that answers policy‑focused queries
- Scenario simulation tools for battery storage optimization

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python • FastAPI • Uvicorn |
| ML Models | LightGBM • Decision‑Tree • Stable‑Baselines3 (PPO) |
| AI / RAG | Gemini 2.5 Flash • LangChain • FAISS |
| Weather | Open‑Meteo API |
| Frontend | Vanilla HTML • CSS • JavaScript • Chart.js • Leaflet |

## Quick Start

1. Clone the repository and navigate into the project folder.

2. Create a virtual environment and install dependencies:
   ```
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Create a `.env` file** with your Gemini API key:
   ```
   ENERGY_API_KEY=your_api_key_here
   ```

4. **Download the dataset** from Google Drive:  
   [01_timeseries_data_imputed.csv](https://drive.google.com/file/d/1sBld8h21Ax2o1L39RzVt1oIeNT8cCWRZ/view?usp=sharing)
   **Place the file** in the following location inside the project folder: data/processed/01_timeseries_data_imputed.csv

5. Run the application:
   ```
   run_app.bat
   ```

6. Open your browser to `http://localhost:8000`

## .gitignore

Make sure these files are not committed:
- `.env` (contains your API key)
- `faiss_index/` (can be rebuilt)
- `.venv/` (virtual environment)

## Troubleshooting

### Backend fails to start
- Kill existing Python processes: `taskkill /f /im python.exe`
- Delete the `faiss_index` folder: `rmdir /s /q faiss_index`
- Make sure `.env` file exists with `ENERGY_API_KEY`

### Map doesn't load
- Check backend is running on port 8001
- Open browser console (F12) for errors

### RAG not working
- Delete `faiss_index` folder and restart

## Model Performance

**Weather‑dependent plants (46) – LightGBM**

| Metric | Value |
|--------|-------|
| MAE | 4.93 ± 0.24 MW |
| RMSE | 11.97 ± 2.07 MW |
| R² | 0.9905 ± 0.0058 |
| Uncertainty (80 % CI) | ±150 MW |

**Coal plants (4) – Baseline (70 % capacity)**

| Metric | Value |
|--------|-------|
| MAE | 15.6 MW |
| R² | — |

**Overall Summary**

| Metric | Value |
|--------|-------|
| Combined MAE | 10.05 MW |
| Grid‑wide R² | 0.9884 |
| LightGBM MAE (overall) | 9.68 MW |
| Baseline MAE (overall) | 10.91 MW |
| Uncertainty (80 % CI) | ±150 MW |

**Yugadhanavi (large oil) – Random Forest**

| Metric | Value |
|--------|-------|
| MAE | 7.03 MW |
| R² | 0.955 |

## Data

The full dataset (~500 MB) is too large for GitHub. A lightweight sample (`data/sample/01_timeseries_data_sample.csv`) is bundled for testing.

## Project Report

The comprehensive research report is included as `Project_Report.pdf` in the repository root.

## Usage Guide

- **Generation Forecast Page** – Select a date to view national‑grid forecasts, daily yield cards, and accuracy metrics.
- **Plant Analytics Page** – Click a plant on the map to see hourly weather, forecast charts, and the modelling method used.
- **Grid Copilot** – Ask natural‑language questions about capacity, forecasts, or policy documents.
- **Scenario Simulator** – Configure battery capacity and dispatch parameters, then run the RL agent to observe load curves.


## Contributing

Contributions are welcome. Fork the repository, make changes on a separate branch, and submit a pull request.

---

*This project was completed for educational purposes only.*
