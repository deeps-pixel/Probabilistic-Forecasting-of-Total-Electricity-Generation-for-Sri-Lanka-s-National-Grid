from pathlib import Path
src = Path(r"h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Individual Report\Codes\data\processed\01_timeseries_data_imputed.csv")
dst = Path(r"h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Final Web Aplication\data\processed\01_timeseries_data_imputed.csv")

dst.parent.mkdir(parents=True, exist_ok=True)
print('src', src.exists(), 'dst_dir', dst.parent)
with src.open('rb') as fsrc, dst.open('wb') as fdst:
    chunk = fsrc.read(16 * 1024 * 1024)
    total = 0
    while chunk:
        fdst.write(chunk)
        total += len(chunk)
        print('wrote', total)
        chunk = fsrc.read(16 * 1024 * 1024)
print('done')
