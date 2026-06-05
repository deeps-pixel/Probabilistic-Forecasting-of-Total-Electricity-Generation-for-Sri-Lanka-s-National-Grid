import requests, json
OUT_A = r'd:\energy_dashboard\scripts\available_plants_response.json'
OUT_F = r'd:\energy_dashboard\scripts\forecast_p26_response.json'

base = 'http://localhost:8001'

# available plants
try:
    r = requests.get(base + '/api/forecast/available_plants', timeout=10)
    with open(OUT_A, 'w', encoding='utf-8') as f:
        f.write(r.text)
except Exception as e:
    with open(OUT_A, 'w', encoding='utf-8') as f:
        f.write(json.dumps({'error': str(e)}))

# forecast for P26_wcp
try:
    r = requests.get(base + '/api/forecast/report_model/plant/P26_wcp/2024-05-01', timeout=20)
    with open(OUT_F, 'w', encoding='utf-8') as f:
        f.write(r.text)
except Exception as e:
    with open(OUT_F, 'w', encoding='utf-8') as f:
        f.write(json.dumps({'error': str(e)}))

print('done')
