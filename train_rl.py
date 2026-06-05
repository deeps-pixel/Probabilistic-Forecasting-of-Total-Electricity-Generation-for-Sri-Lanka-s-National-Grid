import os
import pandas as pd
import numpy as np
import gymnasium as gym
from gymnasium import spaces
from stable_baselines3 import PPO

PROJECT_ROOT = r"d:\energy_dashboard - uggghhhhhh"
TIMESERIES_PATH = os.path.join(PROJECT_ROOT, 'data', 'processed', '01_timeseries_data_imputed.csv')
MODEL_SAVE_PATH = os.path.join(PROJECT_ROOT, 'models', 'rl_battery')

class GridBatteryEnv(gym.Env):
    """
    A custom Gym environment for Grid Battery Dispatch.
    Goal: Smooth out the "Duck Curve" by charging during high generation (solar peak) 
    and discharging during low generation (evening peak).
    """
    def __init__(self, df):
        super(GridBatteryEnv, self).__init__()
        self.df = df
        self.max_steps = len(df) - 1
        
        # Grid parameters
        self.battery_capacity_mw = 500.0  # 500 MWh battery
        self.max_charge_rate = 100.0      # max 100 MW per hour
        self.target_smooth_mw = self.df['total_generation'].mean()
        
        # Action space: Continuous between -1 (Full Discharge) and +1 (Full Charge)
        self.action_space = spaces.Box(low=-1.0, high=1.0, shape=(1,), dtype=np.float32)
        
        # Observation space: [Hour of Day, Grid Generation, Battery State of Charge]
        self.observation_space = spaces.Box(
            low=np.array([0, 0, 0]), 
            high=np.array([23, 10000, self.battery_capacity_mw]), 
            dtype=np.float32
        )
        
        self.current_step = 0
        self.battery_charge = 0.0

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_step = 0
        self.battery_charge = 0.0
        return self._get_obs(), {}

    def _get_obs(self):
        row = self.df.iloc[self.current_step]
        return np.array([row['hour'], row['total_generation'], self.battery_charge], dtype=np.float32)

    def step(self, action):
        row = self.df.iloc[self.current_step]
        grid_gen = row['total_generation']
        
        # Action interpretation
        desired_mw = action[0] * self.max_charge_rate
        
        # Apply battery constraints
        if desired_mw > 0: # Charging
            actual_mw = min(desired_mw, self.battery_capacity_mw - self.battery_charge)
            self.battery_charge += actual_mw
        else: # Discharging
            actual_mw = max(desired_mw, -self.battery_charge)
            self.battery_charge += actual_mw
            
        # The net grid load after battery action
        net_grid_load = grid_gen - actual_mw  # If charging (actual_mw > 0), grid gen is "used" up
        
        # Reward: Penalize deviation from the smooth target average (Mean Squared Error)
        reward = -abs((net_grid_load - self.target_smooth_mw) / self.target_smooth_mw)
        
        self.current_step += 1
        terminated = bool(self.current_step >= self.max_steps)
        
        return self._get_obs(), reward, terminated, False, {}

if __name__ == '__main__':
    print("Loading Timeseries Data...")
    df = pd.read_csv(TIMESERIES_PATH)
    df['Datetime'] = pd.to_datetime(df['Datetime'])
    
    # Aggregate to grid-level total generation per hour
    grid_df = df.groupby('Datetime')['generation_mw'].sum().reset_index()
    grid_df.rename(columns={'generation_mw': 'total_generation'}, inplace=True)
    grid_df['hour'] = grid_df['Datetime'].dt.hour
    
    # Initialize Environment
    env = GridBatteryEnv(grid_df)
    
    print("Training RL Battery Agent with PPO...")
    model = PPO("MlpPolicy", env, verbose=1, learning_rate=0.001)
    
    # Train for a quick 10k steps for demonstration
    model.learn(total_timesteps=10000)
    
    print(f"Saving Model to {MODEL_SAVE_PATH}")
    model.save(MODEL_SAVE_PATH)
    print("Training Complete!")
