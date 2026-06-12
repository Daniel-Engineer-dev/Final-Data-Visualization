from pathlib import Path

import typer

app = typer.Typer(help="Vietnam Climate Pulse data pipeline")


@app.command()
def collect() -> None:
    """Collect raw weather data after locations and date range are approved."""
    typer.echo("Collection skeleton ready. Configure locations before downloading data.")


@app.command()
def validate(dataset: Path = Path("../data/processed/climate_daily.parquet")) -> None:
    """Validate that a processed dataset exists before running quality checks."""
    if not dataset.exists():
        raise typer.BadParameter(f"Dataset does not exist: {dataset}")
    typer.echo(f"Dataset found: {dataset}")


if __name__ == "__main__":
    app()

