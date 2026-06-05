import sys
import os
sys.path.append('d:/energy_dashboard')
import asyncio
from backend import get_plant_forecast_detail

async def test():
    try:
        res = await get_plant_forecast_detail("Victoria Dam", "2024-04-20")
        print("Success:", res)
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
