# Vietnam Climate Pulse

Dashboard trực quan hóa và phân tích khí hậu Việt Nam, tích hợp AI theo nguyên tắc:
code được hiển thị và giải thích, người dùng phê duyệt trước, sau đó mới thực thi
chỉ đọc trên dữ liệu local.

## Cấu trúc chính

```text
application/      Toàn bộ ứng dụng dashboard và AI
  backend/        FastAPI, truy vấn DuckDB và AI approval workflow
  frontend/       React/Vite dashboard
  infra/          Docker và cấu hình triển khai local
  docs/           Kiến trúc và quyết định kỹ thuật của ứng dụng
data_pipeline/    Thu thập, làm sạch và kiểm tra chất lượng dữ liệu
data/             Dữ liệu local theo các tầng raw/interim/processed/logs
tests/            Kiểm thử tích hợp và end-to-end
docs/             Tài liệu dữ liệu dùng chung
report/           Báo cáo LaTeX
```

## Khởi động nhanh

### Backend

```powershell
cd application/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

API docs: `http://localhost:8000/docs`

### Frontend

```powershell
cd application/frontend
npm install
npm run dev
```

Dashboard: `http://localhost:5173`

### Pipeline dữ liệu

```powershell
cd data_pipeline
pip install -e ".[dev]"
python -m climate_pipeline.cli collect
python -m climate_pipeline.cli validate
```

Chi tiết kiến trúc nằm tại `application/docs/architecture.md`.

Để chạy toàn bộ ứng dụng bằng Docker:

```powershell
docker compose -f application/docker-compose.yml up --build
```
