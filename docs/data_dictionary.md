# Data Dictionary

Mô tả chi tiết cấu trúc, kiểu dữ liệu, đơn vị, nguồn gốc và miền giá trị của các cột trong tệp `data/processed/climate_daily.parquet`. Bảng này khớp với Từ điển dữ liệu chính thức tại `report/chapters/02-data.tex` (Chương 2 báo cáo).

Bộ dữ liệu: **61.376 dòng · 12 cột · 28 trạm quan trắc · 01/01/2020 – 31/12/2025**, gồm 5 biến định danh địa lý và 7 biến đo lường thời tiết liên tục.

| Cột | Kiểu | Đơn vị | Nguồn gốc | Miền giá trị | Mô tả |
|---|---|---|---|---|---|
| `date` | Date | ngày | Độc lập | `[2020-01-01, 2025-12-31]` | Ngày ghi nhận thời tiết |
| `location` | Varchar | - | Độc lập | 28 địa điểm | Tên trạm đo tại Việt Nam |
| `region` | Varchar | - | Dẫn xuất | `North, Central, South` | Miền hành chính (Bắc/Trung/Nam) |
| `latitude` | Double | độ | Cấu hình | `[9.18, 22.82]` | Vĩ độ địa lý trạm quan trắc |
| `longitude` | Double | độ | Cấu hình | `[103.01, 109.22]` | Kinh độ địa lý trạm quan trắc |
| `temperature_2m_max` | Double | °C | Open-Meteo | `[4.8, 41.8]` | Nhiệt độ không khí cao nhất ngày |
| `temperature_2m_min` | Double | °C | Open-Meteo | `[2.6, 31.1]` | Nhiệt độ không khí thấp nhất ngày |
| `temperature_2m_mean` | Double | °C | Open-Meteo | `[4.5, 35.3]` | Nhiệt độ không khí trung bình ngày |
| `precipitation_sum` | Double | mm | Open-Meteo | `[0.0, 267.5]` | Tổng lượng mưa ngày (gồm cả mưa rào) |
| `rain_sum` | Double | mm | Open-Meteo | `[0.0, 267.5]` | Tổng lượng mưa rào ngày |
| `wind_speed_10m_max` | Double | km/h | Open-Meteo | `[2.8, 91.0]` | Tốc độ gió mạnh nhất trong ngày |
| `shortwave_radiation_sum` | Double | MJ/m² | Open-Meteo | `[1.1, 28.5]` | Tổng bức xạ sóng ngắn mặt trời chiếu xuống mặt đất |

## Chất lượng dữ liệu

- **0.00%** giá trị khuyết thiếu trên tất cả các cột.
- **0.00%** bản ghi trùng lặp — mỗi cặp `(location, date)` là duy nhất.
- Nguồn: [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api), dựa trên mô hình tái phân tích ERA5 của ECMWF, giấy phép CC BY 4.0.

## Ghi chú

- `precipitation_sum` bao gồm cả `rain_sum`; trong bộ dữ liệu này hai cột có giá trị trùng khớp do không ghi nhận tuyết tại Việt Nam.
- Miền giá trị nhiệt độ cực trị ghi nhận: 41.8°C tại Lào Cai (29/04/2024), thấp nhất 2.6°C tại Lạng Sơn (23/01/2024).
- Miền giá trị gió cực đại: 91.0 km/h tại Quảng Ninh (07/09/2024, trùng thời điểm bão Yagi đổ bộ).
- Miền giá trị mưa cực đại: 267.5 mm tại Vinh (18/10/2020).
