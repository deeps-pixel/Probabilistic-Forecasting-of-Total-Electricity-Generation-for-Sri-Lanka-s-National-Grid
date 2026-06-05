from pathlib import Path
orig = Path(r"h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Individual Report\Codes\data\processed\01_timeseries_data_imputed.csv")
final = Path(r"h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Final Web Aplication\data\processed\01_timeseries_data_imputed.csv")
out = Path(r"d:\energy_dashboard\scripts\file_sizes_out.txt")
lines = []
for p,label in [(orig,'orig'),(final,'final')]:
    if p.exists():
        lines.append(f"{label} exists: True, size: {p.stat().st_size}")
    else:
        lines.append(f"{label} exists: False")
out.write_text('\n'.join(lines))
print('wrote', out)
