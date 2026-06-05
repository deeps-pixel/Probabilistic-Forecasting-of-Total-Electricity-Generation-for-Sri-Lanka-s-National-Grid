import shutil
from pathlib import Path
import json
import pandas as pd

orig = Path(r"h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Individual Report\Codes\data\processed\01_timeseries_data_imputed.csv")
final = Path(r"h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Final Web Aplication\data\processed\01_timeseries_data_imputed.csv")
out_orig = Path(r"d:\energy_dashboard\scripts\orig_plants.json")
out_final = Path(r"d:\energy_dashboard\scripts\final_plants.json")

# List plant ids in original (chunked)
orig_ids = set()
for chunk in pd.read_csv(orig, usecols=['plant_id'], chunksize=200000):
    orig_ids.update(chunk['plant_id'].astype(str).unique())
with open(out_orig, 'w', encoding='utf-8') as f:
    json.dump(sorted(orig_ids), f)

# Copy file in chunks to avoid OS resource errors
final.parent.mkdir(parents=True, exist_ok=True)
with orig.open('rb') as fr, final.open('wb') as fw:
    while True:
        chunk = fr.read(16 * 1024 * 1024)
        if not chunk:
            break
        fw.write(chunk)

# List plant ids in final (chunked)
final_ids = set()
for chunk in pd.read_csv(final, usecols=['plant_id'], chunksize=200000):
    final_ids.update(chunk['plant_id'].astype(str).unique())
with open(out_final, 'w', encoding='utf-8') as f:
    json.dump(sorted(final_ids), f)

print('copied and listed')
