import pandas as pd
from pathlib import Path

master = Path(r'd:\energy_dashboard\data\processed\02_plant_master_clean.csv')
series = Path(r'h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Final Web Aplication\data\processed\01_timeseries_data_imputed.csv')

master_ids = pd.read_csv(master, usecols=['plant_id'])['plant_id'].astype(str).unique()
series_ids = pd.read_csv(series, usecols=['plant_id'])['plant_id'].astype(str).unique()
print('master_count', len(master_ids))
print('series_count', len(series_ids))
print('P26_wcp in master', 'P26_wcp' in master_ids)
print('P26_wcp in series', 'P26_wcp' in series_ids)
print('first 20 master ids', list(master_ids[:20]))
print('first 20 series ids', list(series_ids[:20]))
print('common count', len(set(master_ids) & set(series_ids)))
print('only in master count', len(set(master_ids) - set(series_ids)))
print('only in series count', len(set(series_ids) - set(master_ids)))
