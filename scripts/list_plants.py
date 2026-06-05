import pandas as pd
p = r'h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Final Web Aplication\data\processed\01_timeseries_data_imputed.csv'
# read a sample to avoid huge memory
df = pd.read_csv(p, usecols=['plant_id'], nrows=200000)
print('Unique plant ids (sample):')
print(df['plant_id'].drop_duplicates().tolist()[:50])
