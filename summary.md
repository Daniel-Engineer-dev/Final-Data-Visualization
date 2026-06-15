# Hướng dẫn Tổng quan và Vận hành Dự án - Vietnam Climate Pulse

Tài liệu này giải thích chi tiết toàn bộ các công việc đã thực hiện, cấu trúc thư mục ứng dụng, cơ chế hoạt động của pipeline dữ liệu, cách tải dữ liệu kiểm chứng và cách khởi chạy toàn bộ dự án.

---

## 1. Các công việc đã thực hiện
Dự án **Vietnam Climate Pulse** đã được thiết lập đầy đủ tất cả các thành phần để tạo ra một ứng dụng phân tích dữ liệu khí hậu hoàn chỉnh:
1. **Thiết lập cấu hình trạm đo:** Chọn 28 địa điểm đại diện cho 3 miền Bắc, Trung, Nam tại Việt Nam.
2. **Xây dựng Pipeline Dữ liệu:** Viết CLI tự động gọi API Open-Meteo để tải dữ liệu lịch sử từ 2020 đến 2025. Xử lý thành công lỗi rate-limit bằng cơ chế tự động ngủ 65 giây và thử lại.
3. **Phân tích EDA & Trực quan hóa:** Chạy phân tích phân bố nhiệt độ, lượng mưa mùa vụ và tương quan đa biến, tạo ra các biểu đồ lưu trong báo cáo.
4. **Xây dựng Backend API:** FastAPI + DuckDB cho phép truy vấn trực tiếp file Parquet tốc độ cao mà không cần cơ sở dữ liệu cồng kềnh.
5. **Tích hợp AI Analyst (Human-in-the-loop):** Module AI chuyển câu hỏi tự nhiên thành SQL chỉ đọc, giao diện cho phép người dùng xem, chỉnh sửa và phê duyệt mã SQL trước khi thực thi local để bảo vệ dữ liệu.
6. **Thiết kế Frontend Dashboard:** Xây dựng giao diện React + ECharts sử dụng phong cách Dark Mode và Glassmorphism cao cấp.
7. **Kiểm thử tự động:** Viết bộ test và xác minh an toàn SQL (pass 11/11 test cases).

---

## 2. Giải thích cấu trúc thư mục dự án

Sơ đồ cấu trúc các thư mục chính trong dự án:

```text
Final-Data-Visulization/
├── data/                       # Lưu trữ dữ liệu dự án
│   ├── raw/                    # Dữ liệu JSON thô tải từ API cho từng trạm
│   ├── processed/              # Dữ liệu sạch dạng climate_daily.parquet
│   └── logs/                   # Nhật ký SQLite lưu các phiên làm việc của AI
├── data_pipeline/              # Pipeline tải, làm sạch và xác thực dữ liệu
│   ├── config/                 # Chứa file cấu hình locations.csv (28 trạm đo)
│   ├── src/climate_pipeline/   # Code Python thực thi thu thập và làm sạch
│   └── tests/                  # Bộ kiểm thử cho pipeline
├── application/                # Ứng dụng web
│   ├── backend/                # FastAPI Web Server (Python)
│   │   ├── app/                # Chứa core, routers, models và services
│   │   └── tests/              # Bộ kiểm thử API backend và SQL guard
│   └── frontend/               # Giao diện dashboard React + TypeScript
│       ├── src/App.tsx         # Giao diện chính và tích hợp ECharts
│       └── src/styles.css      # CSS phong cách Dark Mode & Glassmorphism
└── report/                     # Báo cáo Latex của đồ án
```

### Chi tiết chức năng từng thư mục:

### 2.1. Thư mục `data/`
Lưu trữ toàn bộ dữ liệu của dự án local, đảm bảo tính tái tạo kết quả mà không cần truy vấn online liên tục:
* **`data/raw/`**: Chứa 28 file JSON thô (ví dụ: `weather_ha_noi.json`, `weather_da_nang.json`) tương ứng với 28 địa điểm đã tải về. Đây là bằng chứng dữ liệu thô phục vụ cho việc kiểm chứng.
* **`data/processed/`**: Chứa tệp dữ liệu duy nhất [climate_daily.parquet](file:///d:/Final-Data-Visulization/data/processed/climate_daily.parquet) đã làm sạch (61.376 dòng, không có giá trị khuyết). Định dạng Parquet giúp truy vấn cực nhanh qua DuckDB.
* **`data/logs/`**: Chứa tệp SQLite [ai_sessions.sqlite3](file:///d:/Final-Data-Visulization/data/logs/ai_sessions.sqlite3) lưu toàn bộ nhật ký prompt của người dùng, mã SQL sinh ra bởi AI và số lượng dòng kết quả trả về.

### 2.2. Thư mục `data_pipeline/`
Chứa mã nguồn chịu trách nhiệm tự động hóa quy trình thu thập dữ liệu (ETL):
* **`config/locations.csv`**: File chứa thông tin 28 trạm khí hậu gồm: tên địa điểm, miền (North/Central/South), vĩ độ và kinh độ.
* **`src/climate_pipeline/collect_weather.py`**: Chứa logic gọi API Open-Meteo, lưu dữ liệu thô vào `data/raw/`, gộp dữ liệu, chuẩn hóa định dạng thời gian và xuất ra file Parquet. Script có cơ chế tự động nạp dữ liệu từ cache JSON local nếu đã tồn tại để tránh gọi API trùng lặp.
* **`src/climate_pipeline/cli.py`**: Xây dựng giao diện dòng lệnh (CLI). Cung cấp 2 lệnh:
  * `collect`: Thực thi tải dữ liệu từ API và tiền xử lý.
  * `validate`: Chạy kiểm tra chất lượng dữ liệu (đếm số dòng >= 2000, kiểm tra 7 cột bắt buộc, thống kê tỷ lệ khuyết).

### 2.3. Thư mục `application/`
Chứa mã nguồn của toàn bộ ứng dụng web (Backend FastAPI và Frontend React):

#### A. Backend (`application/backend/`)
* **`app/main.py`**: Điểm khởi chạy FastAPI, cấu hình CORS và nạp các router.
* **`app/core/config.py`**: Nạp các cấu hình và biến môi trường đường dẫn dữ liệu.
* **`app/services/db.py`**: Quản lý kết nối DuckDB và đăng ký View `climate_daily` trỏ đến file Parquet.
* **`app/services/ai_service.py`**: Nhận câu hỏi tự nhiên từ người dùng và dịch thành mã SQL. Hỗ trợ gọi API OpenAI/Gemini hoặc chạy chế độ **Mock fallback** dịch các câu hỏi gợi ý ngoại tuyến.
* **`app/services/sql_guard.py`**: Bộ kiểm soát an toàn (Guardrails). Kiểm tra mã SQL và chặn các câu lệnh ghi/xóa dữ liệu độc hại để bảo vệ an toàn hệ thống.
* **`app/services/logger.py`**: Khởi tạo và ghi nhật ký hoạt động của AI Analyst vào SQLite.
* **`app/routers/dataset.py`**: Định nghĩa các API endpoint trả dữ liệu phân tích cho dashboard (Overview, Explorer, Extreme Events, Relationship Lab).
* **`app/routers/ai.py`**: Định nghĩa API điều phối luồng đề xuất, phê duyệt và thực thi SQL của AI Analyst.
* **`tests/`**: Chứa unit tests kiểm tra tính đúng đắn của các API và bộ lọc SQL an toàn.

#### B. Frontend (`application/frontend/`)
* **`src/App.tsx`**: File giao diện React chính. Quản lý trạng thái tab hoạt động, gọi các API backend và định hình cấu trúc biểu đồ ECharts cho từng tab.
* **`src/styles.css`**: File CSS chứa toàn bộ mã trang trí giao diện Dark Mode, hiệu ứng Glassmorphism, bóng mờ neon, scrollbars và các hiệu ứng chuyển động mượt mà.

---

## 3. Hướng dẫn Tải và Kiểm chứng dữ liệu

Để tự chạy quy trình tải và xác thực dữ liệu khí hậu, hãy thực hiện theo các bước sau:

1. Mở terminal và di chuyển vào thư mục `data_pipeline`:
   ```bash
   cd d:\Final-Data-Visulization\data_pipeline
   ```
2. Kích hoạt môi trường ảo Python:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
3. **Chạy lệnh tải dữ liệu (Collect):**
   *(Lệnh này sẽ quét danh sách trong locations.csv, kiểm tra cache local trong data/raw, tải các địa điểm còn thiếu từ API và xuất ra file Parquet)*
   ```bash
   climate-pipeline collect
   ```
4. **Chạy lệnh xác thực chất lượng (Validate):**
   *(Lệnh này sẽ kiểm tra xem file Parquet có đủ điều kiện như số dòng >= 2000, đủ 7 cột bắt buộc, không bị rỗng dữ liệu hay không)*
   ```bash
   climate-pipeline validate
   ```

---

## 4. Hướng dẫn Chạy dự án

Để chạy toàn bộ ứng dụng web trên môi trường local, bạn cần chạy đồng thời FastAPI Backend và Vite Frontend:

### Bước 1: Khởi động Backend API
1. Mở một cửa sổ Terminal mới và di chuyển vào thư mục `application/backend`:
   ```bash
   cd d:\Final-Data-Visulization\application\backend
   ```
2. Kích hoạt môi trường ảo:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
3. Chạy uvicorn server:
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *Backend API sẽ chạy tại địa chỉ: `http://localhost:8000`*

### Bước 2: Khởi động Frontend Dashboard
1. Mở thêm một cửa sổ Terminal thứ hai và di chuyển vào thư mục `application/frontend`:
   ```bash
   cd d:\Final-Data-Visulization\application\frontend
   ```
2. Khởi chạy Vite dev server:
   ```bash
   npm run dev
   ```
   *Frontend Server sẽ chạy tại địa chỉ: `http://localhost:5173`*

### Bước 3: Truy cập và Kiểm thử
* Mở trình duyệt và truy cập vào địa chỉ: `http://localhost:5173`.
* Bạn sẽ thấy giao diện Dashboard thời tiết Dark Mode hiển thị đầy đủ biểu đồ.
* Di chuyển qua các tab để kiểm tra tính năng. Tại tab **AI Analyst Portal**, bạn có thể bấm vào các câu hỏi gợi ý và nhấn nút **"Phê duyệt & Chạy local"** để xem AI dịch mã SQL và truy vấn DuckDB trả kết quả trực tiếp lên bảng dữ liệu.
