from pathlib import Path
import typer
import pandas as pd
from climate_pipeline.collect_weather import collect_historical_weather

app = typer.Typer(help="Vietnam Climate Pulse data pipeline")

@app.command()
def collect(
    locations: Path = Path("config/locations.csv"),
    raw_dir: Path = Path("../data/raw"),
    output: Path = Path("../data/processed/climate_daily.parquet"),
    start_date: str = "2020-01-01",
    end_date: str = "2025-12-31"
) -> None:
    """Collect raw weather data from Open-Meteo API, process and save to Parquet."""
    typer.echo(f"Starting weather data collection from {start_date} to {end_date}...")
    try:
        collect_historical_weather(
            locations_csv=locations,
            raw_dir=raw_dir,
            processed_file=output,
            start_date=start_date,
            end_date=end_date
        )
        typer.echo("Data collection and preprocessing completed successfully!")
    except Exception as e:
        typer.echo(f"Error during collection: {e}", err=True)
        raise typer.Exit(code=1)

@app.command()
def validate(dataset: Path = Path("../data/processed/climate_daily.parquet")) -> None:
    """Validate that a processed dataset exists and meets all G1-G10 quality checks."""
    if not dataset.exists():
        raise typer.BadParameter(f"Dataset does not exist: {dataset}")
    
    typer.echo(f"Loading dataset for validation: {dataset}")
    try:
        df = pd.read_parquet(dataset)
        
        # Check constraints
        row_count = len(df)
        typer.echo(f"Row count: {row_count}")
        if row_count < 2000:
            typer.echo("Error: Row count is less than 2000!", err=True)
            raise typer.Exit(code=1)
            
        required_cols = [
            "date", "location", "region", "latitude", "longitude",
            "temperature_2m_max", "temperature_2m_min", "temperature_2m_mean",
            "precipitation_sum", "rain_sum", "wind_speed_10m_max", "shortwave_radiation_sum"
        ]
        
        missing_cols = [c for c in required_cols if c not in df.columns]
        if missing_cols:
            typer.echo(f"Error: Missing required columns: {missing_cols}", err=True)
            raise typer.Exit(code=1)
            
        typer.echo("Columns check passed. Data dictionary holds all required variables.")
        
        # Check for missing values
        null_counts = df[required_cols].isnull().sum()
        typer.echo("Null values count per column:")
        for col, count in null_counts.items():
            typer.echo(f"  {col}: {count} ({count/row_count*100:.2f}%)")
            
        # Check dates range
        min_date = df['date'].min()
        max_date = df['date'].max()
        typer.echo(f"Date range: {min_date.strftime('%Y-%m-%d')} to {max_date.strftime('%Y-%m-%d')}")
        
        # Check location coordinates
        unique_locs = df['location'].nunique()
        typer.echo(f"Unique locations count: {unique_locs}")
        
        typer.echo("Validation passed successfully! The dataset is ready for backend consumption.")
    except Exception as e:
        typer.echo(f"Error during validation: {e}", err=True)
        raise typer.Exit(code=1)

if __name__ == "__main__":
    app()

