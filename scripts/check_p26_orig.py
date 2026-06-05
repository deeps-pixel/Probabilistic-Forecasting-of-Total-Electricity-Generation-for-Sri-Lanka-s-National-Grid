import pandas as pd
p = r'h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Individual Report\Codes\data\processed\01_timeseries_data_imputed.csv'
for chunk in pd.read_csv(p, usecols=['plant_id'], chunksize=200000):
    if 'P26_wcp' in chunk['plant_id'].astype(str).values:
        print('FOUND')
        break
else:
    print('NOT_FOUND')
