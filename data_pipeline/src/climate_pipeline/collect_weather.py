import json
import time
from pathlib import Path
import httpx
import pandas as pd

def collect_historical_weather(
    locations_csv: Path,
    raw_dir: Path,
    processed_file: Path,
    start_date: str = "2020-01-01",
    end_date: str = "2025-12-31"
) -> None:
    """
    Collects weather data from Open-Meteo Historical API for locations specified in locations_csv,
    saves raw JSON responses, cleans the data, and writes to a final Parquet file.
    """
    # Create directories
    raw_dir.mkdir(parents=True, exist_ok=True)
    processed_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Read locations
    df_loc = pd.read_csv(locations_csv)
    print(f"Loaded {len(df_loc)} locations from {locations_csv}")
    
    combined_records = []
    
    url = "https://archive-api.open-meteo.com/v1/archive"
    
    for idx, row in df_loc.iterrows():
        loc_name = row['location']
        region = row['region']
        lat = row['latitude']
        lon = row['longitude']
        
        raw_json_path = raw_dir / f"weather_{loc_name.lower().replace(' ', '_')}.json"
        
        # Check if raw cache exists
        data = None
        if raw_json_path.exists():
            print(f"[{idx+1}/{len(df_loc)}] Loading cached raw data for {loc_name}")
            with open(raw_json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            print(f"[{idx+1}/{len(df_loc)}] Fetching data for {loc_name} ({lat}, {lon}) from API...")
            params = {
                "latitude": lat,
                "longitude": lon,
                "start_date": start_date,
                "end_date": end_date,
                "daily": [
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "temperature_2m_mean",
                    "precipitation_sum",
                    "rain_sum",
                    "wind_speed_10m_max",
                    "shortwave_radiation_sum"
                ],
                "timezone": "GMT"
            }
            
            # Request retry loop
            retries = 3
            for attempt in range(retries):
                try:
                    response = httpx.get(url, params=params, timeout=30.0)
                    if response.status_code == 200:
                        data = response.json()
                        # Cache raw json
                        with open(raw_json_path, 'w', encoding='utf-8') as f:
                            json.dump(data, f, ensure_ascii=False, indent=2)
                        break
                    elif response.status_code == 429:
                        print(f"  Rate limit hit (429). Sleeping 65 seconds before retry...")
                        time.sleep(65.0)
                    else:
                        print(f"  Attempt {attempt+1} failed with status code {response.status_code}: {response.text}")
                        time.sleep(2.0)
                except Exception as e:
                    print(f"  Attempt {attempt+1} encountered error: {e}")
                    time.sleep(2.0)
            
            # Rate limiting sleep between different locations
            time.sleep(1.5)
            
        if data and "daily" in data:
            daily_data = data["daily"]
            time_list = daily_data.get("time", [])
            temp_max = daily_data.get("temperature_2m_max", [])
            temp_min = daily_data.get("temperature_2m_min", [])
            temp_mean = daily_data.get("temperature_2m_mean", [])
            precip = daily_data.get("precipitation_sum", [])
            rain = daily_data.get("rain_sum", [])
            wind = daily_data.get("wind_speed_10m_max", [])
            rad = daily_data.get("shortwave_radiation_sum", [])
            
            # Check length matching
            n_records = len(time_list)
            for i in range(n_records):
                combined_records.append({
                    "date": time_list[i],
                    "location": loc_name,
                    "region": region,
                    "latitude": lat,
                    "longitude": lon,
                    "temperature_2m_max": temp_max[i] if i < len(temp_max) else None,
                    "temperature_2m_min": temp_min[i] if i < len(temp_min) else None,
                    "temperature_2m_mean": temp_mean[i] if i < len(temp_mean) else None,
                    "precipitation_sum": precip[i] if i < len(precip) else None,
                    "rain_sum": rain[i] if i < len(rain) else None,
                    "wind_speed_10m_max": wind[i] if i < len(wind) else None,
                    "shortwave_radiation_sum": rad[i] if i < len(rad) else None
                })
        else:
            print(f"  Warning: No valid daily data found for {loc_name}")
            
    if not combined_records:
        raise ValueError("No records collected. Pipeline execution failed.")
        
    df = pd.DataFrame(combined_records)
    
    # Simple data cleaning
    df['date'] = pd.to_datetime(df['date'])
    
    # Sort for consistency
    df = df.sort_values(by=['location', 'date']).reset_index(drop=True)
    
    # Save as Parquet
    df.to_parquet(processed_file, index=False)
    print(f"Successfully processed {len(df)} rows and saved to {processed_file}")
    
if __name__ == "__main__":
    locations_path = Path("config/locations.csv")
    raw_path = Path("../data/raw")
    processed_path = Path("../data/processed/climate_daily.parquet")
    
    # If run directly inside d:\Final-Data-Visulization\data_pipeline
    collect_historical_weather(locations_path, raw_path, processed_path)
