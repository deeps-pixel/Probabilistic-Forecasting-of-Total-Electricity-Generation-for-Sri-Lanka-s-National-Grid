# Sri Lanka Energy Grid – AI Forecasting Dashboard

> Probabilistic, weather‑integrated electricity generation forecasting for Sri Lanka’s national grid, delivered as an interactive full‑stack dashboard.

## Introduction
This project combines historical CEB operational reports, NASA‑POWER weather data, and modern machine‑learning models (LightGBM, Decision‑Tree baseline, and a reinforcement‑learning battery dispatch agent) to provide:
- 14‑day national‑grid generation forecasts with confidence intervals.
- Plant‑level analytics with live weather overlays.
- An AI‑driven conversational assistant (Gemini‑2.5‑Flash) that answers policy‑focused queries.
- Scenario simulation tools for future‑year planning.

## Quick Start
1. **Clone the repository** and navigate into the project folder.
2. **Create a virtual environment** and install dependencies:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   ```
3. **Run the application** (the helper script starts both backend and frontend):
   ```batch
   run_app.bat
   ```
   The FastAPI backend will listen on **http://localhost:8001** and the UI will be served at **http://localhost:8000**.

## Troubleshooting

### Backend fails to start
- Ensure no other program is using port 8001: `netstat -ano | findstr :8001`
- Delete the `faiss_index` folder if you get pydantic errors: `rmdir /s /q faiss_index`
- Make sure you have a `.env` file with `ENERGY_API_KEY=your_key`

### Map doesn't load on Plant Analytics page
- Check that backend is running on port 8001
- Open browser console (F12) to see specific errors

### RAG / Copilot document search not working
- Add PDF files to the `docs/` folder
- Delete `faiss_index` folder and restart - it will rebuild

### Port conflicts
- Change backend port: `python backend.py --port 8002`
- Update frontend API calls to use the new port

## Technical Stack
| Layer | Technology |
|---|---|
| **Backend** | Python • FastAPI • Uvicorn |
| **ML Models** | LightGBM • Decision‑Tree (baseline) • Stable‑Baselines3 (PPO) |
| **AI / RAG** | Gemini 2.5 Flash • LangChain • FAISS |
| **Weather** | NASA‑POWER API (open‑meteo fallback) |
| **Frontend** | Vanilla HTML • CSS (glass‑morphism) • JavaScript • Chart.js • Leaflet |

## Model Performance Highlights
- **Combined MAE:** 10.05 MW
- **R² (grid‑wide):** 0.9884
- **LightGBM (35 plants) MAE:** 9.68 MW
- **Baseline Decision‑Tree (15 plants) MAE:** 10.91 MW

## Data
The full dataset (~500 MB) is too large for GitHub. A lightweight sample (`data/sample/01_timeseries_data_sample.csv`) is bundled for quick validation. Update the `DATA_PATH` constant in `backend.py` if you wish to point to a custom dataset.

## Project Report
The comprehensive research report is included as **`Project_Report.pdf`** in the repository root. It covers:
- Data preprocessing and feature engineering.
- Model architecture and training methodology.
- Forecast evaluation and error analysis.
- Business‑impact discussion and future work.

## Usage Guide
- **Generation Forecast Page** – Select a date to view national‑grid forecasts, daily yield cards, and model‑specific accuracy metrics.
- **Plant Analytics Page** – Click a plant on the map or list to see hourly weather, forecast charts, and a detailed explanation of the modelling method used for that plant.
- **Grid Copilot** – Ask natural‑language questions about capacity, forecasts, or policy documents. The AI will embed citations and metric values (e.g., “Tomorrow’s forecast is 1.2 GWh, with 96 % accuracy (MAE = 9.68 MW)”).
- **Scenario Simulator** – Configure battery capacity and dispatch parameters, then run the RL agent to observe flattened load curves.

## Configuration
Create a local `.env` file in the project root containing your API key:
```text
ENERGY_API_KEY=your_api_key_here
```
Ensure `.env` is listed in `.gitignore` so it is not committed.

## Contributing
Contributions are welcome. Please fork the repository, make your changes on a separate branch, and submit a pull request. Follow the existing code‑style guidelines and ensure all unit tests (if added) pass.

---
---
*This project was done for education purposes only.*
