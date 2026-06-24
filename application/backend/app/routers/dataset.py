from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from app.services.db import get_db_connection

router = APIRouter()

@router.get("/metadata")
def dataset_metadata() -> dict[str, object]:
    try:
        conn = get_db_connection()
        res = conn.execute("SELECT count(*), min(date), max(date) FROM climate_daily").fetchone()
        row_count = res[0] if res else 0
        min_date = res[1].strftime("%Y-%m-%d") if res and res[1] else None
        max_date = res[2].strftime("%Y-%m-%d") if res and res[2] else None
        conn.close()
        return {
            "name": "Vietnam Climate Daily",
            "grain": "one location per day",
            "available": True,
            "row_count": row_count,
            "min_date": min_date,
            "max_date": max_date,
            "dimensions": ["date", "location", "region", "latitude", "longitude"],
            "metrics": [
                "temperature_2m_max",
                "temperature_2m_min",
                "temperature_2m_mean",
                "precipitation_sum",
                "rain_sum",
                "wind_speed_10m_max",
                "shortwave_radiation_sum"
            ]
        }
    except Exception as e:
        return {
            "name": "Vietnam Climate Daily",
            "available": False,
            "error": str(e)
        }

@router.get("/overview")
def get_overview() -> List[Dict[str, Any]]:
    """
    Returns summary metrics for each station location to populate maps and KPIs.
    """
    query = """
        SELECT 
            location, region, latitude, longitude,
            round(mean(temperature_2m_mean), 2) as avg_temp,
            round(max(temperature_2m_max), 2) as max_temp,
            round(min(temperature_2m_min), 2) as min_temp,
            round(sum(precipitation_sum) / 6.0, 2) as annual_precip, -- 6 years
            round(mean(wind_speed_10m_max), 2) as avg_wind,
            round(mean(shortwave_radiation_sum), 2) as avg_radiation,
            count(*) as total_days
        FROM climate_daily
        GROUP BY location, region, latitude, longitude
        ORDER BY location
    """
    try:
        conn = get_db_connection()
        cursor = conn.execute(query)
        cols = [desc[0] for desc in cursor.description]
        records = [dict(zip(cols, row)) for row in cursor.fetchall()]
        conn.close()
        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")

@router.get("/explorer")
def get_explorer(
    location: Optional[str] = None,
    region: Optional[str] = None
) -> Dict[str, Any]:
    """
    Returns time-series and monthly matrices for explorer charts.
    """
    where_clauses = []
    params = []
    if location:
        where_clauses.append("location = ?")
        params.append(location)
    if region:
        where_clauses.append("region = ?")
        params.append(region)
        
    where_str = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
    
    query_monthly = f"""
        SELECT 
            month(date) as month_num,
            round(mean(temperature_2m_mean), 2) as avg_temp,
            round(mean(temperature_2m_max), 2) as avg_max_temp,
            round(mean(temperature_2m_min), 2) as avg_min_temp,
            round(sum(precipitation_sum) / 6.0, 2) as avg_rain,
            round(mean(shortwave_radiation_sum), 2) as avg_radiation
        FROM climate_daily
        {where_str}
        GROUP BY month_num
        ORDER BY month_num
    """
    
    query_matrix = f"""
        SELECT 
            year(date) as year_val,
            month(date) as month_val,
            round(mean(temperature_2m_mean), 2) as avg_temp,
            round(sum(precipitation_sum), 2) as total_rain
        FROM climate_daily
        {where_str}
        GROUP BY year_val, month_val
        ORDER BY year_val, month_val
    """
    
    try:
        conn = get_db_connection()
        
        cursor_monthly = conn.execute(query_monthly, params)
        cols_monthly = [desc[0] for desc in cursor_monthly.description]
        monthly_trends = [dict(zip(cols_monthly, row)) for row in cursor_monthly.fetchall()]
        
        cursor_matrix = conn.execute(query_matrix, params)
        cols_matrix = [desc[0] for desc in cursor_matrix.description]
        heatmap_matrix = [dict(zip(cols_matrix, row)) for row in cursor_matrix.fetchall()]
        
        conn.close()
        
        return {
            "monthly_trends": monthly_trends,
            "heatmap_matrix": heatmap_matrix
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")

@router.get("/extreme-events")
def get_extreme_events(
    temp_threshold: float = 38.0,
    rain_threshold: float = 100.0,
    location: Optional[str] = None
) -> Dict[str, Any]:
    """
    Returns extreme weather logs and counts.
    """
    where_clauses_temp = ["temperature_2m_max >= ?"]
    params_temp = [temp_threshold]
    
    where_clauses_rain = ["precipitation_sum >= ?"]
    params_rain = [rain_threshold]
    
    if location:
        where_clauses_temp.append("location = ?")
        params_temp.append(location)
        where_clauses_rain.append("location = ?")
        params_rain.append(location)
        
    where_temp_str = f"WHERE {' AND '.join(where_clauses_temp)}"
    where_rain_str = f"WHERE {' AND '.join(where_clauses_rain)}"
    
    query_hot = f"""
        SELECT date, location, region, temperature_2m_max
        FROM climate_daily
        {where_temp_str}
        ORDER BY temperature_2m_max DESC, date DESC
        LIMIT 100
    """
    
    query_wet = f"""
        SELECT date, location, region, precipitation_sum
        FROM climate_daily
        {where_rain_str}
        ORDER BY precipitation_sum DESC, date DESC
        LIMIT 100
    """
    
    where_clauses_counts = []
    params_counts = [temp_threshold, rain_threshold]
    if location:
        where_clauses_counts.append("location = ?")
        params_counts.append(location)
        
    where_counts_str = f"WHERE {' AND '.join(where_clauses_counts)}" if where_clauses_counts else ""
    
    query_counts = f"""
        SELECT 
            location,
            sum(CASE WHEN temperature_2m_max >= ? THEN 1 ELSE 0 END) as hot_days_count,
            sum(CASE WHEN precipitation_sum >= ? THEN 1 ELSE 0 END) as wet_days_count
        FROM climate_daily
        {where_counts_str}
        GROUP BY location
        ORDER BY hot_days_count DESC, wet_days_count DESC
    """
    
    try:
        conn = get_db_connection()
        
        cursor_hot = conn.execute(query_hot, params_temp)
        cols_hot = [desc[0] for desc in cursor_hot.description]
        hot_days = []
        for row in cursor_hot.fetchall():
            d = dict(zip(cols_hot, row))
            d['date'] = d['date'].strftime('%Y-%m-%d')
            hot_days.append(d)
            
        cursor_wet = conn.execute(query_wet, params_rain)
        cols_wet = [desc[0] for desc in cursor_wet.description]
        wet_days = []
        for row in cursor_wet.fetchall():
            d = dict(zip(cols_wet, row))
            d['date'] = d['date'].strftime('%Y-%m-%d')
            wet_days.append(d)
            
        cursor_counts = conn.execute(query_counts, params_counts)
        cols_counts = [desc[0] for desc in cursor_counts.description]
        counts = [dict(zip(cols_counts, row)) for row in cursor_counts.fetchall()]
        
        # Calculate total matching count in the DB without LIMIT 100
        total_hot = conn.execute(f"SELECT count(*) FROM climate_daily {where_temp_str}", params_temp).fetchone()[0]
        total_wet = conn.execute(f"SELECT count(*) FROM climate_daily {where_rain_str}", params_rain).fetchone()[0]

        conn.close()
        
        return {
            "hot_days": hot_days,
            "wet_days": wet_days,
            "total_hot_count": total_hot,
            "total_wet_count": total_wet,
            "counts_by_location": counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")

@router.get("/relationship")
def get_relationship() -> Dict[str, Any]:
    """
    Returns correlation metrics and a sampled dataset for interactive scatter plots.
    """
    query_sample = """
        SELECT 
            date, location, region,
            temperature_2m_mean, precipitation_sum, wind_speed_10m_max, shortwave_radiation_sum
        FROM climate_daily
        USING SAMPLE 1500;
    """
    
    corr_query = """
        SELECT 
            round(corr(temperature_2m_mean, temperature_2m_mean), 4),
            round(corr(temperature_2m_mean, precipitation_sum), 4),
            round(corr(temperature_2m_mean, wind_speed_10m_max), 4),
            round(corr(temperature_2m_mean, shortwave_radiation_sum), 4),
            
            round(corr(precipitation_sum, temperature_2m_mean), 4),
            round(corr(precipitation_sum, precipitation_sum), 4),
            round(corr(precipitation_sum, wind_speed_10m_max), 4),
            round(corr(precipitation_sum, shortwave_radiation_sum), 4),
            
            round(corr(wind_speed_10m_max, temperature_2m_mean), 4),
            round(corr(wind_speed_10m_max, precipitation_sum), 4),
            round(corr(wind_speed_10m_max, wind_speed_10m_max), 4),
            round(corr(wind_speed_10m_max, shortwave_radiation_sum), 4),
            
            round(corr(shortwave_radiation_sum, temperature_2m_mean), 4),
            round(corr(shortwave_radiation_sum, precipitation_sum), 4),
            round(corr(shortwave_radiation_sum, wind_speed_10m_max), 4),
            round(corr(shortwave_radiation_sum, shortwave_radiation_sum), 4)
        FROM climate_daily
    """
    
    try:
        conn = get_db_connection()
        
        cursor_sample = conn.execute(query_sample)
        cols_sample = [desc[0] for desc in cursor_sample.description]
        scatter_sample = []
        for row in cursor_sample.fetchall():
            d = dict(zip(cols_sample, row))
            d['date'] = d['date'].strftime('%Y-%m-%d')
            scatter_sample.append(d)
            
        row = conn.execute(corr_query).fetchone()
        conn.close()
        
        if not row:
            raise ValueError("Failed to compute correlations")
            
        corr_matrix = {
            "temperature_2m_mean": {
                "temperature_2m_mean": row[0],
                "precipitation_sum": row[1],
                "wind_speed_10m_max": row[2],
                "shortwave_radiation_sum": row[3]
            },
            "precipitation_sum": {
                "temperature_2m_mean": row[4],
                "precipitation_sum": row[5],
                "wind_speed_10m_max": row[6],
                "shortwave_radiation_sum": row[7]
            },
            "wind_speed_10m_max": {
                "temperature_2m_mean": row[8],
                "precipitation_sum": row[9],
                "wind_speed_10m_max": row[10],
                "shortwave_radiation_sum": row[11]
            },
            "shortwave_radiation_sum": {
                "temperature_2m_mean": row[12],
                "precipitation_sum": row[13],
                "wind_speed_10m_max": row[14],
                "shortwave_radiation_sum": row[15]
            }
        }
        
        return {
            "scatter_sample": scatter_sample,
            "correlation_matrix": corr_matrix
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")
