LightGBM Report Model Inference
================================

This small module exposes a helper to run the LightGBM model saved in the
Individual Report and return 24-hour plant-level predictions.

Usage (from `backend.py`):

```py
from web_app.inference import predict_plant_report_model
pred = predict_plant_report_model('P26_wcp', '2024-05-01')
```

Notes:
- The code reads model and timeseries directly from the Individual Report `Codes` folder to avoid duplicating large binary artifacts.
- Paths are absolute — update `inference.py` if you want to copy model files into the dashboard repo.
