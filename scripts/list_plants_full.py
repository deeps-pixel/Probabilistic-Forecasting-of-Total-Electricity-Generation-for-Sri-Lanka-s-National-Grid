import pandas as pd
from pathlib import Path
p = Path(r'h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Final Web Aplication\data\processed\01_timeseries_data_imputed.csv')
ids = set()
for chunk in pd.read_csv(p, usecols=['plant_id'], chunksize=100000):
    ids.update(chunk['plant_id'].astype(str).unique())
print('count', len(ids))
for plant in sorted(ids):
    print(plant)
