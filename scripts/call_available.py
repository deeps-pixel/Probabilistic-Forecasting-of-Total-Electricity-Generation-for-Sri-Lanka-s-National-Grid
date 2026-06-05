import requests, json
r = requests.get('http://localhost:8001/api/forecast/available_plants', timeout=20)
with open(r'd:\energy_dashboard\scripts\available_plants_response.json','w',encoding='utf-8') as f:
    f.write(r.text)
print('WROTE')
