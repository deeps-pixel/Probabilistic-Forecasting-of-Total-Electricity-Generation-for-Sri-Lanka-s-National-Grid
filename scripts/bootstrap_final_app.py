"""Bootstrap script to assemble the Final Web Application folder.

Run this on the host machine to copy the required model binaries and data files
into the Final Web Aplication folder. This script preserves timestamps and will
create missing directories.

Usage (PowerShell or CMD):
    python scripts\bootstrap_final_app.py

"""
import os
import shutil
from pathlib import Path

# Source locations
ENERGY_DASH = Path(r"d:/energy_dashboard")
REPORT_CODES = Path(r"h:/Other computers/My Laptop/ISMF/Level 4 Semester 1/IS 4007 - Statistics in Practice II/Individual Report/Codes")

# Destination Final Web App
FINAL_APP = Path(r"h:/Other computers/My Laptop/ISMF/Level 4 Semester 1/IS 4007 - Statistics in Practice II/Final Web Aplication")

# Ensure dest exists
FINAL_APP.mkdir(parents=True, exist_ok=True)
(FINAL_APP / 'models').mkdir(parents=True, exist_ok=True)
(FINAL_APP / 'data' / 'processed').mkdir(parents=True, exist_ok=True)
(FINAL_APP / 'static' / 'js').mkdir(parents=True, exist_ok=True)
(FINAL_APP / 'static' / 'css').mkdir(parents=True, exist_ok=True)
(FINAL_APP / 'web_app').mkdir(parents=True, exist_ok=True)

def copy_file(src: Path, dst: Path):
    if not src.exists():
        print(f"Skipping missing: {src}")
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    try:
        shutil.copy2(src, dst)
    except OSError as exc:
        print(f"Standard copy failed for {src}: {exc}. Falling back to chunked copy.")
        with src.open('rb') as fsrc, dst.open('wb') as fdst:
            while True:
                buf = fsrc.read(16 * 1024 * 1024)
                if not buf:
                    break
                fdst.write(buf)
    print(f"Copied: {src} -> {dst}")

# 1) Copy model artifacts from Individual Report
report_models = ["final_lightgbm.pkl", "feature_names.pkl"]
for m in report_models:
    copy_file(REPORT_CODES / 'models' / m, FINAL_APP / 'models' / m)

# 2) Copy energy_dashboard model files
if (ENERGY_DASH / 'models').exists():
    for f in (ENERGY_DASH / 'models').iterdir():
        if f.is_file():
            copy_file(f, FINAL_APP / 'models' / f.name)

# 3) Copy timeseries and plant master
# Timeseries is in report codes
copy_file(REPORT_CODES / 'data' / 'processed' / '01_timeseries_data_imputed.csv', FINAL_APP / 'data' / 'processed' / '01_timeseries_data_imputed.csv')
copy_file(ENERGY_DASH / 'data' / 'processed' / '02_plant_master_clean.csv', FINAL_APP / 'data' / 'processed' / '02_plant_master_clean.csv')

# 4) Copy static assets (js, css, assets)
if (ENERGY_DASH / 'js').exists():
    for f in (ENERGY_DASH / 'js').iterdir():
        if f.is_file():
            copy_file(f, FINAL_APP / 'static' / 'js' / f.name)

if (ENERGY_DASH / 'css').exists():
    for f in (ENERGY_DASH / 'css').iterdir():
        if f.is_file():
            copy_file(f, FINAL_APP / 'static' / 'css' / f.name)

# Copy html pages
for page in ['index.html','generation-forecasts.html','plant-analytics.html','grid-copilot.html','scenario-simulator.html','about.html']:
    copy_file(ENERGY_DASH / page, FINAL_APP / page)

# Copy web_app Python inference if exists
if (ENERGY_DASH / 'web_app' / 'inference.py').exists():
    copy_file(ENERGY_DASH / 'web_app' / 'inference.py', FINAL_APP / 'web_app' / 'inference.py')

# 5) Copy faiss_index if present
if (ENERGY_DASH / 'faiss_index').exists():
    dst = FINAL_APP / 'faiss_index'
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(ENERGY_DASH / 'faiss_index', dst)
    print(f"Copied faiss_index -> {dst}")

print('\nBootstrap copy complete.')
print('Next: cd to the Final Web Aplication folder and run run_app.bat to start the server (ensure dependencies installed).')
