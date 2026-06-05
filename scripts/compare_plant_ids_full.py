import pandas as pd
from pathlib import Path

master = Path(r'h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Individual Report\Codes\data\processed\02_plant_master_clean.csv')
series_final = Path(r'h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Final Web Aplication\data\processed\01_timeseries_data_imputed.csv')
series_original = Path(r'h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Individual Report\Codes\data\processed\01_timeseries_data_imputed.csv')

master_ids = pd.read_csv(master, usecols=['plant_id'])['plant_id'].astype(str).unique()
series_final_ids = pd.read_csv(series_final, usecols=['plant_id'])['plant_id'].astype(str).unique()
series_orig_ids = pd.read_csv(series_original, usecols=['plant_id'])['plant_id'].astype(str).unique()

print('master_count', len(master_ids))
print('final_series_count', len(series_final_ids))
print('orig_series_count', len(series_orig_ids))
print('P26_wcp in master', 'P26_wcp' in master_ids)
print('P26_wcp in final_series', 'P26_wcp' in series_final_ids)
print('P26_wcp in orig_series', 'P26_wcp' in series_orig_ids)
print('common master/final', len(set(master_ids) & set(series_final_ids)))
print('common master/orig', len(set(master_ids) & set(series_orig_ids)))
print('common final/orig', len(set(series_final_ids) & set(series_orig_ids)))
print('only in master count', len(set(master_ids) - set(series_orig_ids)))
print('only in orig count', len(set(series_orig_ids) - set(master_ids)))
print('only in final count', len(set(series_final_ids) - set(series_orig_ids)))
print('first 20 orig ids', list(series_orig_ids[:20]))
print('first 20 final ids', list(series_final_ids[:20]))
