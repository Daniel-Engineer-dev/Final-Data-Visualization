# Application

Thư mục này chứa toàn bộ phần ứng dụng dashboard và AI:

```text
backend/            FastAPI, DuckDB, AI proposal/approval/execution
frontend/           React/Vite dashboard
infra/              Dockerfiles
docs/               Kiến trúc và quyết định kỹ thuật của ứng dụng
docker-compose.yml  Chạy ứng dụng local bằng Docker
.env.example        Biến môi trường mẫu của ứng dụng
```

Ứng dụng đọc dữ liệu đã xử lý từ `../data/` và không sở hữu pipeline thu thập dữ
liệu. Pipeline nằm tại `../data_pipeline/`.

## Chạy local

```powershell
docker compose -f application/docker-compose.yml up --build
```

Sao chép `application/.env.example` thành `application/.env` khi cần cấu hình model
AI hoặc ghi đè đường dẫn dữ liệu.
