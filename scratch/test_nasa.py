import requests
import json
import datetime

lat, lon = 6.86917, 80.52793
date_str = "20240420"
url = f"https://power.larc.nasa.gov/api/temporal/hourly/point?parameters=T2M,ALLSKY_SFC_SW_DWN,WS10M,PRECTOTCORR,RH2M&community=RE&longitude={lon}&latitude={lat}&start={date_str}&end={date_str}&format=JSON"

try:
    res = requests.get(url)
    print("Status:", res.status_code)
    data = res.json()
    if 'properties' in data:
        print("Success! Keys in properties:", data['properties']['parameter'].keys())
        # Print first element for temps
        t2m = data['properties']['parameter']['T2M']
        first_key = list(t2m.keys())[0]
        print(f"Data at {first_key}: Temp={t2m[first_key]}")
    else:
        print("Failed to get properties:", data)
except Exception as e:
    print("Error:", e)
