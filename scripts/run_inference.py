import sys, json
sys.path.insert(0, r'h:\Other computers\My Laptop\ISMF\Level 4 Semester 1\IS 4007 - Statistics in Practice II\Final Web Aplication')
from web_app.inference import predict_plant_report_model
print(json.dumps(predict_plant_report_model('P26_wcp','2024-05-01')))
