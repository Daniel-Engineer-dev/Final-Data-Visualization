# Giải thích chức năng các file trong `application/frontend/src/`

## `main.tsx`
Điểm khởi chạy của ứng dụng React: gắn component `App` vào thẻ `#root` trong `index.html`, bọc trong `StrictMode`, và nạp `styles.css` toàn cục.

## `App.tsx` (≈2050 dòng — component chính, chứa toàn bộ dashboard)
Một component duy nhất quản lý cả 5 phân hệ qua state của React (không dùng router riêng, chuyển tab bằng `activeTab`):

- **State theo từng tab**: dữ liệu trạm đo (`stations`), dữ liệu Khám phá khí hậu (`explorerData` + bộ lọc trạm), dữ liệu Cực đoan (`extremeData` + 2 ngưỡng nhiệt/mưa), dữ liệu Tương quan (`relationshipData`), và toàn bộ state của AI Portal (câu hỏi, đề xuất hiện tại, kết quả thực thi, nhật ký...).
- **`useEffect` gọi API**: mỗi khi tab hoặc bộ lọc thay đổi, gọi sang các endpoint backend (`/api/dataset/...`, `/api/ai/...`) tương ứng đã liệt kê trong `giai-thich-backend-app.md`.
- **`useMemo` tính insight**: từ dữ liệu thô trả về, tự tính các câu kết luận hiển thị trong khung "Kết luận & câu chuyện dữ liệu" (tháng nóng nhất, xu hướng năm, hệ số tương quan...) — đây chính là nơi có insight về xu hướng nhiệt độ đã được sửa lỗi logic trước đó.
- **Cấu hình biểu đồ ECharts**: mỗi biểu đồ (bản đồ trạm, đường xu hướng, heatmap, boxplot, scatter, ma trận tương quan...) được định nghĩa dạng object `option` ngay trong file, dùng chung màu sắc/token từ `theme.ts`.
- **Luồng AI Portal**: gọi tạo đề xuất → hiển thị code (SQL/Python) + **gợi ý biểu đồ của AI** ở trạng thái DRAFT → cho sửa trực tiếp (sửa sau khi duyệt sẽ tự quay lại DRAFT) → bấm **Phê duyệt** (chạy guard an toàn, chuyển APPROVED) rồi **Chạy local** (nút Chạy chỉ mở sau khi đã duyệt) → hiển thị bảng/biểu đồ kết quả (ưu tiên loại biểu đồ AI đề xuất, người dùng đổi được) → tải nhật ký. Bấm một dòng nhật ký sẽ nạp lại đề xuất đó **đúng trạng thái đã lưu** (draft/approved/executed).
- **Render JSX**: toàn bộ giao diện 5 tab, sidebar điều hướng, các card KPI, modal phóng to biểu đồ (`expandedChart`).

## `Icon.tsx`
Bộ icon dạng đường nét (line-icon, style Lucide) tự vẽ bằng SVG thay cho emoji — mỗi icon là một tập path cố định (compass, trend, alert, sun, droplet...), dùng chung một component `<Icon name="..." />` xuyên suốt app để đồng bộ hình ảnh.

## `Select.tsx`
Component dropdown tuỳ biến (thay cho `<select>` mặc định của trình duyệt) để khớp giao diện Editorial Climate Almanac — tự xử lý mở/đóng khi click ra ngoài, điều hướng bằng phím mũi tên, và style theo theme sáng của app. Dùng ở các bộ lọc chọn trạm/miền.

## `theme.ts`
Nơi định nghĩa toàn bộ **design token** dùng chung cho các biểu đồ ECharts: font chữ (Fraunces cho serif, Instrument Sans cho sans), bảng màu nền giấy ấm (`PALETTE`), màu theo vùng miền (`REGION_COLORS`: teal=Bắc, hổ phách=Trung, xanh rừng=Nam), thang màu nhiệt độ và thang màu tương quan phân kỳ, cùng style dùng chung cho tooltip/trục/legend/tiêu đề biểu đồ. Đây là "nguồn sự thật" cho mọi màu sắc trong dashboard.

## `columnLabels.ts`
Bộ chuyển đổi tên cột kỹ thuật (`temperature_2m_mean`, `precipitation_sum`...) sang nhãn tiếng Việt dễ đọc (`"Nhiệt độ trung bình (°C)"`, `"Tổng lượng mưa (mm)"`) để hiển thị trong bảng kết quả và trục biểu đồ của AI Portal — vì AI có thể trả về cột với tên biến đa dạng, cần chuẩn hoá nhãn hiển thị mà vẫn giữ nguyên khoá dữ liệu gốc.

## `echarts-boxplot.d.ts`
File khai báo kiểu TypeScript (type declaration) cho module phụ trợ `prepareBoxplotData` của thư viện ECharts — vì thư viện không có sẵn type cho phần mở rộng này, cần khai báo thủ công để TypeScript không báo lỗi khi import.

## `styles.css`
File CSS toàn cục (~1400 dòng) định nghĩa toàn bộ giao diện: biến CSS cho màu/font, layout sidebar + nội dung chính bằng CSS Grid, style cho từng loại card/KPI/badge/nút, và các Media Query để chuyển bố cục responsive trên điện thoại/tablet.

## `vietnam-geo.json`
Dữ liệu địa lý dạng GeoJSON vẽ đường biên giới thật của Việt Nam — dùng làm nền cho bản đồ 28 trạm quan trắc ở tab Tổng quan và bản đồ điểm nóng ở tab Thời tiết cực đoan (không phải bản đồ ảnh tĩnh, mà là polygon vẽ bằng ECharts).

## Luồng tổng thể

`main.tsx` khởi chạy `App.tsx` → `App.tsx` gọi API backend, tính insight, dựng cấu hình biểu đồ (màu lấy từ `theme.ts`, nhãn cột qua `columnLabels.ts`) → render bằng các component dùng chung (`Icon`, `Select`) → toàn bộ được style bởi `styles.css`, riêng bản đồ dùng `vietnam-geo.json` làm nền địa lý.
