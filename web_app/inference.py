import os
import pickle
from datetime import datetime
from pathlib import Path
import pandas as pd
import numpy as np

# Get dynamic base directory (web_app folder -> project root)
BASE_DIR = Path(__file__).parent.parent.absolute()

# Dynamic paths
MODEL_PATH = BASE_DIR / "models" / "final_lightgbm.pkl"
FEATURES_PATH = BASE_DIR / "models" / "feature_names.pkl"
TIMESERIES_PATH = BASE_DIR / "data" / "processed" / "01_timeseries_data_imputed.csv"

_model = None
_feature_names = None
_timeseries = None


def _load_model():
    global _model, _feature_names
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            # Try alternative model name if final_lightgbm.pkl doesn't exist
            alt_model_path = BASE_DIR / "models" / "dt_model.pkl"
            if os.path.exists(alt_model_path):
                print(f"Using alternative model: {alt_model_path}")
                with open(alt_model_path, 'rb') as f:
                    _model = pickle.load(f)
            else:
                raise FileNotFoundError(f"Report model not found at {MODEL_PATH} or {alt_model_path}")
        else:
            with open(MODEL_PATH, 'rb') as f:
                _model = pickle.load(f)
    
    if _feature_names is None:
        if not os.path.exists(FEATURES_PATH):
            print(f"Feature names not found at {FEATURES_PATH}, will use model's internal features")
            _feature_names = None
        else:
            with open(FEATURES_PATH, 'rb') as f:
                _feature_names = pickle.load(f)


def _load_timeseries():
    global _timeseries
    if _timeseries is None:
        if not os.path.exists(TIMESERIES_PATH):
            raise FileNotFoundError(f"Timeseries data not found at {TIMESES_PATH}")
        _timeseries = pd.read_csv(TIMESERIES_PATH)
        _timeseries['Datetime'] = pd.to_datetime(_timeseries['Datetime'])
        _timeseries.set_index('Datetime', inplace=True)
    return _timeseries


def create_features(df_plant):
    """Create the same features used in the notebook `00_master_forecast.ipynb`.

    This mirrors CELL 4 in the notebook: time cyclical encodings, lags, and rolling
    statistics for the same lags/windows used during training.
    """
    df = df_plant.copy()

    # Time features (cyclical encoding)
    df['hour_sin'] = np.sin(2 * np.pi * df.index.hour / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df.index.hour / 24)
    df['dow_sin'] = np.sin(2 * np.pi * df.index.dayofweek / 7)
    df['dow_cos'] = np.cos(2 * np.pi * df.index.dayofweek / 7)
    df['month_sin'] = np.sin(2 * np.pi * df.index.month / 12)
    df['month_cos'] = np.cos(2 * np.pi * df.index.month / 12)
    df['is_weekend'] = (df.index.dayofweek >= 5).astype(int)

    # Lag features (past generation values)
    for lag in [1, 2, 3, 4, 6, 12, 24, 48, 96]:
        df[f'gen_lag_{lag}'] = df['generation_mw'].shift(lag)

    # Rolling statistics
    for window in [6, 12, 24, 48, 96]:
        df[f'rolling_{window}_mean'] = df['generation_mw'].rolling(window).mean()
        df[f'rolling_{window}_std'] = df['generation_mw'].rolling(window).std()

    # Drop rows with NaNs produced by lags/rolling
    df = df.dropna()
    return df


def predict_plant_report_model(plant_id: str, date_str: str, weather_dict: dict = None):
    """Run the report LightGBM model exactly like the notebook.

    Steps:
    - Load the saved LightGBM model and `feature_names.pkl` produced by the notebook.
    - Load the report timeseries, filter for the plant, run feature engineering (same lags/rollings).
    - Select rows corresponding to the target date (after feature engineering). If 24
      hourly rows are available, align columns to `feature_names` and predict.
    - If engineered rows for the date are not available (missing historical data),
      fallback to historical hourly means for that plant.
    """
    _load_model()
    ts = _load_timeseries()

    # Ensure plant exists
    plant_df = ts[ts['plant_id'] == plant_id].copy()
    if plant_df.empty:
        raise ValueError(f"Plant {plant_id} not found in report timeseries data")

    # Parse date
    target_date = datetime.strptime(date_str, '%Y-%m-%d').date()

    # Build features for the plant (identical to notebook)
    plant_features = create_features(plant_df)

    # Filter rows for the target_date
    day_mask = (plant_features.index.date == target_date)
    day_rows = plant_features[day_mask].sort_index()

    sparkline = []
    used_model = False

    if len(day_rows) >= 24:
        # Align to feature names from training
        X = day_rows.copy()
        
        if _feature_names is not None:
            for col in _feature_names:
                if col not in X.columns:
                    X[col] = 0.0
        
        # Overlay live weather data if provided
        if weather_dict:
            for i in range(24):
                if i < len(X):
                    if 'temp_C' in weather_dict and len(weather_dict['temp_C']) > i:
                        if 'temp_C' in X.columns:
                            X.iloc[i, X.columns.get_loc('temp_C')] = weather_dict['temp_C'][i]
                    if 'solar_W_m2' in weather_dict and len(weather_dict['solar_W_m2']) > i:
                        if 'solar_W_m2' in X.columns:
                            X.iloc[i, X.columns.get_loc('solar_W_m2')] = weather_dict['solar_W_m2'][i]
                    if 'wind_m_s' in weather_dict and len(weather_dict['wind_m_s']) > i:
                        if 'wind_m_s' in X.columns:
                            X.iloc[i, X.columns.get_loc('wind_m_s')] = weather_dict['wind_m_s'][i]
                    if 'precip_mm' in weather_dict and len(weather_dict['precip_mm']) > i:
                        if 'precip_mm' in X.columns:
                            X.iloc[i, X.columns.get_loc('precip_mm')] = weather_dict['precip_mm'][i]
                    if 'humidity_pct' in weather_dict and len(weather_dict['humidity_pct']) > i:
                        if 'humidity_pct' in X.columns:
                            X.iloc[i, X.columns.get_loc('humidity_pct')] = weather_dict['humidity_pct'][i]

        if _feature_names is not None:
            X = X[_feature_names]
        X = X.astype(float)
        preds = _model.predict(X)
        sparkline = [float(x) for x in preds[:24]]
        used_model = True
    else:
        # Fallback: use historical hourly means from the raw plant_df
        hourly_means = plant_df.groupby(plant_df.index.hour)['generation_mw'].mean()
        for hr in range(24):
            if hr in hourly_means.index and not np.isnan(hourly_means.loc[hr]):
                sparkline.append(float(hourly_means.loc[hr]))
            else:
                sparkline.append(float(plant_df['generation_mw'].mean()))

    total_mwh = sum(sparkline)

    return {
        'plant_id': plant_id,
        'date': date_str,
        'model': 'report_lightgbm',
        'used_model': used_model,
        'sparkline_mw': sparkline,
        'expected_daily_mwh': round(total_mwh, 2),
        'note': 'Exact notebook feature engineering implemented; fallback to historical hourly means when required.'
    }
