# Giải thích chức năng các file trong `application/backend/app/`

## Gốc

- **`main.py`** — Điểm khởi chạy app FastAPI: khai báo tiêu đề API, bật CORS cho phép frontend (`localhost:5173`) gọi vào, và gắn 3 router (`health`, `dataset`, `ai`).
- **`__init__.py`** — File rỗng, chỉ đánh dấu `app` là một Python package.

## `core/` — cấu hình chung

- **`config.py`** — Đọc cấu hình từ `application/.env` qua Pydantic Settings (đường dẫn Parquet/DuckDB/SQLite log, khóa `GEMINI_API_KEY`, tên model `AI_MODEL`). Tự nạp `.env` theo **đường dẫn tuyệt đối** nên chạy backend **không cần cờ `--env-file`**. Dùng chung cho toàn backend.

## `models/` — định nghĩa kiểu dữ liệu

- **`ai.py`** — Các Pydantic model cho luồng AI: `AnalysisRequest` (câu hỏi người dùng gửi lên), `AnalysisProposal` (đề xuất code + giải thích + gợi ý biểu đồ, trạng thái DRAFT/APPROVED/REJECTED/EXECUTED), `ChartSpec` (loại biểu đồ + trục x/y do AI đề xuất), `ApprovalRequest`, `AILogEntry` (1 dòng nhật ký).

## `routers/` — các endpoint API

- **`health.py`** — Endpoint `/health` đơn giản để kiểm tra server còn sống.
- **`dataset.py`** — Các endpoint phục vụ dashboard:
  - `/metadata` — thông tin tổng quan bộ dữ liệu.
  - `/overview` — KPI + dữ liệu bản đồ 28 trạm.
  - `/explorer` — chu kỳ tháng + ma trận heatmap năm×tháng, lọc theo trạm/miền.
  - `/extreme-events` — ngày nắng nóng/mưa lớn vượt ngưỡng, xếp hạng theo trạm/năm/tháng.
  - `/relationship` — ma trận tương quan Pearson + mẫu dữ liệu scatter.
- **`ai.py`** — Endpoint cho AI Analyst Portal: tạo đề xuất (`POST /proposals`, có kiểm tra & lấy gợi ý biểu đồ của AI), phê duyệt (`/approve` — chạy guard an toàn), từ chối (`/reject`), thực thi (`/execute` — **chỉ chạy khi đề xuất đã `approved`**), và đọc nhật ký (`/logs`). Đây là nơi hiện thực hoá luồng human-in-the-loop.

## `services/` — logic nghiệp vụ

- **`db.py`** — Mở kết nối DuckDB và tạo view `climate_daily` trỏ thẳng vào file Parquet (tự dò đường dẫn nếu cấu hình sai).
- **`ai_service.py`** — Gọi Gemini API (model lấy từ `AI_MODEL`, mặc định `gemini-flash-latest`) để dịch câu hỏi tiếng Việt thành SQL hoặc code pandas, **kèm gợi ý loại biểu đồ phù hợp** (cột/đường/tròn/phân tán), dựa trên system prompt mô tả schema bảng; nếu không có API key hoặc gọi lỗi thì rơi về **chế độ mock offline** (so khớp từ khoá, trả code mẫu dựng sẵn) — chính là chế độ dự phòng ngoại tuyến.
- **`sql_guard.py`** — Guardrail cho SQL: chỉ cho `SELECT`/`WITH`, chặn các từ khoá ghi/xoá (INSERT, DROP, DELETE...), chỉ cho 1 câu lệnh mỗi lần.
- **`python_guard.py`** — Guardrail cho Python: parse AST để chặn `import`, thuộc tính dunder, các hàm nguy hiểm (`eval`, `exec`, `open`, `os`, `sys`...), bắt buộc code phải gán kết quả vào biến `result`.
- **`python_runner.py`** — Thực thi code pandas đã qua guard trong sandbox giới hạn builtin, nạp `df` từ DuckDB, chuẩn hoá kết quả trả về (DataFrame/Series/scalar) thành JSON.
- **`logger.py`** — Ghi mọi sự kiện AI (draft/approved/rejected/executed/failed) vào SQLite `ai_sessions.sqlite3` — chính là "Nhật ký AI" trong báo cáo và demo.

## Luồng tổng thể

`routers` nhận request → gọi `services` xử lý (AI dịch câu hỏi, guard kiểm tra an toàn, `db`/`python_runner` thực thi, `logger` ghi log) → trả kết quả theo `models` đã định nghĩa.
