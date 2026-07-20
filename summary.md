# Báo Cáo Tổng Quan Đồ Án - Vietnam Climate Pulse

Tài liệu này cung cấp cái nhìn tổng quan về đồ án Trực quan hóa dữ liệu khí hậu Việt Nam, bao gồm cấu trúc bộ dữ liệu (dataset), ý nghĩa các biến số, mục tiêu phân tích của từng tab trên Dashboard, chi tiết về cơ chế hoạt động của tính năng AI Analyst Portal, và kiến trúc thư mục của ứng dụng.

---

## 1. Cấu Trúc Bộ Dữ Liệu (Dataset)

Dữ liệu được thu thập từ API nguồn mở Open-Meteo, bao gồm dữ liệu khí hậu thực tế hàng ngày của 28 tỉnh/thành phố trải dài khắp 3 miền (Bắc, Trung, Nam) tại Việt Nam trong giai đoạn 6 năm (2020 - 2025). 

Toàn bộ dữ liệu được lưu trữ trong một tệp `climate_daily.parquet` (hơn 61.376 bản ghi) nhằm tối ưu hóa tốc độ truy vấn phân tích.

### Ý nghĩa của từng biến (Data Dictionary):

| Tên biến | Kiểu dữ liệu | Mô tả chi tiết |
| :--- | :--- | :--- |
| `date` | Timestamp | Ngày ghi nhận dữ liệu thời tiết. |
| `location` | String | Tên địa điểm/thành phố (VD: Hà Nội, Đà Nẵng, TP.HCM). |
| `region` | String | Vùng miền tương ứng (North, Central, South). |
| `latitude` | Double | Vĩ độ của trạm đo. |
| `longitude` | Double | Kinh độ của trạm đo. |
| `temperature_2m_mean` | Double | Nhiệt độ trung bình ngày (°C) đo ở độ cao 2m. |
| `temperature_2m_max` | Double | Nhiệt độ cao nhất trong ngày (°C). |
| `temperature_2m_min` | Double | Nhiệt độ thấp nhất trong ngày (°C). |
| `precipitation_sum` | Double | Tổng lượng giáng thủy trong ngày (mm). |
| `rain_sum` | Double | Tổng lượng mưa trong ngày (mm). |
| `wind_speed_10m_max` | Double | Tốc độ gió cực đại trong ngày (km/h) đo ở độ cao 10m. |
| `shortwave_radiation_sum` | Double | Tổng bức xạ sóng ngắn (MJ/m²) - thước đo mức độ nắng. |

---

## 2. Mục Tiêu Phân Tích Của Từng Tab Trên Dashboard

Dashboard được thiết kế theo tư duy từ tổng quan đến chi tiết, chia thành 5 tab riêng biệt, mỗi tab giải quyết một mục tiêu phân tích cụ thể:

### 2.1. Tab Tổng Quan Trạm Đo (Overview)
* **Mục tiêu:** Cung cấp cái nhìn toàn cảnh về bộ dữ liệu. Giúp người dùng nắm bắt nhanh các chỉ số KPI cơ bản (nhiệt độ trung bình, lượng mưa tổng) của các trạm đo trên bản đồ Việt Nam.
* **Biểu đồ chính:** Bản đồ phân bố trạm đo, Bảng tóm tắt chỉ số trung bình theo miền.

### 2.2. Tab Khám Phá Khí Hậu (Explorer)
* **Mục tiêu:** Phân tích xu hướng (Trend) và tính mùa vụ (Seasonality) của thời tiết qua các năm. Trả lời câu hỏi: Khí hậu thay đổi ra sao theo chu kỳ tháng/năm? 
* **Biểu đồ chính:** Heatmap biến thiên nhiệt độ theo tháng, Line chart/Bar chart theo dõi nhiệt độ, lượng mưa, và bức xạ theo chuỗi thời gian.

### 2.3. Tab Thời Tiết Cực Đoan (Extreme Weather)
* **Mục tiêu:** Nhận diện và thống kê các dị thường thời tiết (Outliers). Phân tích sự phân bố của các đợt nắng nóng gay gắt hoặc mưa bão lớn.
* **Biểu đồ chính:** Boxplot so sánh độ phân tán nhiệt độ giữa các miền, Biểu đồ cột đếm số ngày cực đoan dựa trên ngưỡng do người dùng tự điều chỉnh (Interactive Slider).

### 2.4. Tab Tương Quan Khí Hậu (Relationship)
* **Mục tiêu:** Khám phá mối quan hệ tuyến tính/phi tuyến giữa các biến khí hậu với nhau, hoặc giữa biến khí hậu và yếu tố địa lý. Trả lời câu hỏi: "Nhiệt độ có tương quan thế nào với bức xạ mặt trời?" hay "Vĩ độ ảnh hưởng thế nào đến nhiệt độ?".
* **Biểu đồ chính:** Ma trận tương quan (Correlation Heatmap), Biểu đồ phân tán (Scatter plot) kết hợp đường hồi quy.

### 2.5. Tab AI Analyst Portal (Tương tác động)
* **Mục tiêu:** Vượt ra khỏi các biểu đồ tĩnh được lập trình sẵn. Cho phép người dùng đặt câu hỏi bằng ngôn ngữ tự nhiên (Tiếng Việt) để truy vấn bất kỳ thông tin insight nào chưa có trên Dashboard.

---

## 3. Kiến Trúc & Cách Triển Khai AI Analyst Portal

Tính năng **AI Analyst Portal** là điểm nhấn của đồ án, được xây dựng theo mô hình **Human-in-the-loop (Con người trong vòng lặp)** nhằm đảm bảo tính an toàn và minh bạch tuyệt đối.

### Công nghệ sử dụng:
* **LLM (Large Language Model):** Sử dụng API của Gemini/OpenAI để dịch câu hỏi tự nhiên thành mã SQL (hoặc Python Pandas). *Tại sao?* Vì LLM có khả năng suy luận ngữ cảnh và sinh mã lập trình cực tốt.
* **DuckDB:** Cơ sở dữ liệu phân tích tại memory. *Tại sao?* Tốc độ truy vấn trực tiếp trên file `.parquet` cực kỳ nhanh mà không cần phải cài đặt một hệ quản trị CSDL cồng kềnh như PostgreSQL.
* **FastAPI:** Làm Backend Server. Đảm bảo tốc độ phản hồi nhanh, hỗ trợ async.
* **Cơ chế Guardrails:** Lớp bảo mật tự xây dựng (`sql_guard.py` và `python_guard.py`) dùng AST (Abstract Syntax Tree) và Regex để chặn các truy vấn phá hoại.

### Luồng thực thi (Execution Flow):
1. **Người dùng gõ câu hỏi:** Người dùng nhập yêu cầu bằng Tiếng Việt (Ví dụ: *"Năm 2023 miền nào có tổng lượng mưa lớn nhất?"*) và nhấn "Sinh đề xuất phân tích".
2. **AI sinh mã (Generation):** Frontend gửi câu hỏi xuống Backend (`/api/ai/ask`). Backend gọi API LLM kèm theo Schema của bảng dữ liệu `climate_daily`. LLM trả về câu lệnh SQL.
3. **Phân tích an toàn (Guardrail check):** Mã SQL được đưa qua module `sql_guard.py`. Hệ thống xác minh đây là lệnh chỉ đọc (`SELECT`), cấm các lệnh phá hoại (`DROP`, `DELETE`, `INSERT`, `UPDATE`).
4. **Đề xuất lên UI:** Backend trả mã SQL đã duyệt về Frontend. Mã này được hiển thị rõ ràng cho người dùng xem. Mã **chưa được chạy ngay**.
5. **Human-in-the-loop (Phê duyệt):** Người dùng đọc mã SQL, có thể tự chỉnh sửa (nếu hiểu SQL) để tinh chỉnh truy vấn. Sau khi chắc chắn, người dùng nhấn nút **"Phê duyệt & Chạy local"**.
6. **Thực thi cục bộ (Execution):** Frontend gửi mã SQL đã duyệt lên endpoint (`/api/ai/execute`). Backend sử dụng DuckDB chạy câu lệnh SQL trực tiếp trên file `climate_daily.parquet` của server.
7. **Trả kết quả & Ghi log:** Kết quả truy vấn được chuyển thành JSON trả về Frontend để hiển thị dưới dạng bảng dữ liệu. Đồng thời, toàn bộ phiên (Prompt, Code, Số dòng kết quả, Thời gian) được ghi nhận vào `ai_sessions.sqlite3` để kiểm toán (Audit logs).

---

## 4. Kiến Trúc Ứng Dụng (Application Architecture)

Toàn bộ mã nguồn chạy ứng dụng được đặt trong thư mục `application/`, phân tách rõ ràng thành hai phần `backend/` và `frontend/`:

### 4.1. Backend (FastAPI + Python)
Nhiệm vụ chính là cung cấp API kết nối dữ liệu (DuckDB) và xử lý logic AI.
* `app/main.py`: Điểm khởi chạy của server FastAPI.
* `app/core/`: Chứa các file cấu hình hệ thống (như đường dẫn file data, API keys).
* `app/models/`: Định nghĩa các cấu trúc dữ liệu (Pydantic models) cho API (VD: `ai.py` định nghĩa request/response cho AI, cấu trúc log).
* `app/routers/`: Chứa các API endpoints tiếp nhận request từ Frontend (VD: `/api/ai/ask`).
* `app/services/`: Nơi chứa toàn bộ logic cốt lõi (Business logic):
  * `ai_service.py`: Giao tiếp với LLM API để tạo sinh mã SQL/Python.
  * `db.py`: Khởi tạo và quản lý kết nối DuckDB đến file `climate_daily.parquet`.
  * `sql_guard.py` & `python_guard.py`: Các module bảo mật (Guardrails) phân tích cú pháp AST để chặn mã độc.
  * `logger.py`: Ghi nhận lịch sử truy vấn vào CSDL SQLite.
* `tests/`: Bộ kiểm thử (Pytest) đảm bảo API và các lớp bảo mật hoạt động đúng chuẩn.

### 4.2. Frontend (React + TypeScript + Vite)
Nhiệm vụ chính là giao diện hiển thị Dashboard và tương tác trực quan với người dùng.
* `src/App.tsx`: Trái tim của giao diện, một file duy nhất (Single Page Application) đảm nhiệm việc điều hướng 5 tab, gọi API lấy dữ liệu và render toàn bộ các biểu đồ ECharts.
* `src/styles.css` & `index.css`: Toàn bộ CSS thuần tùy chỉnh UI, áp dụng các kỹ thuật thiết kế hiện đại như Glassmorphism.
* `src/theme.ts`: Nơi cấu hình các token màu sắc (Color palette), định nghĩa font chữ và theme cho ECharts để đảm bảo sự đồng bộ trên toàn ứng dụng.
* `src/utils.ts`: Chứa các hàm hỗ trợ tính toán phía client (như tính toán trung bình, nhận diện các đợt thời tiết cực đoan (outliers), chuẩn bị dữ liệu vẽ Boxplot).
* `package.json` & `vite.config.ts`: Quản lý các thư viện (React, ECharts, Axios) và cấu hình trình đóng gói Vite.
