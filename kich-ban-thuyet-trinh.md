# Kịch bản thuyết trình — Vietnam Climate Pulse (20 phút)

> Đồ án Trực quan hóa dữ liệu · Nhóm 1
> Mục tiêu: trình bày mạch lạc, có "câu chuyện dữ liệu", kết thúc bằng demo AI trực tiếp.

## Phân vai & thời lượng

| Thời gian | Người | Nội dung |
|-----------|-------|----------|
| 0:00 – 1:30 | Trưởng nhóm (Đức) | Mở đầu: đề tài, bối cảnh, câu hỏi phân tích, phân vai |
| 1:30 – 5:00 | **Người 1** (Việt) | Tập dữ liệu + quy trình tiền xử lý |
| 5:00 – 9:00 | **Người 2** (Đức) | Tab 1 Tổng quan + Tab 2 Khám phá khí hậu |
| 9:00 – 13:00 | **Người 3** (Thế Vinh) | Tab 3 Thời tiết cực đoan + Tab 4 Tương quan |
| 13:00 – 18:30 | **Người 4** (Q. Vinh) | Tích hợp AI + **demo trực tiếp** |
| 18:30 – 20:00 | Trưởng nhóm | Kết luận + mời hỏi đáp |

> Tên chỉ là gợi ý theo phân công — nhóm tự đổi tùy ý. Mỗi người **canh giờ**, quá 30s là mất nhịp.

---

## 0:00 – 1:30 · MỞ ĐẦU (Trưởng nhóm)

**Lời thoại mẫu:**
> "Kính chào thầy/cô. Nhóm 1 xin trình bày đồ án **Vietnam Climate Pulse** — một dashboard trực quan hóa và phân tích khí hậu Việt Nam giai đoạn 2020–2025, tích hợp trợ lý AI hoạt động dưới sự kiểm soát của con người.
>
> Việt Nam là một trong những nước chịu ảnh hưởng nặng nề nhất của biến đổi khí hậu. Dữ liệu khí tượng thô thì phức tạp và khó tiếp cận, nên nhóm xây dựng công cụ biến số liệu thành tri thức dễ hiểu.
>
> Cả bài trình bày xoay quanh **4 câu hỏi phân tích**: (1) đặc trưng nhiệt độ ba miền khác nhau ra sao; (2) mùa mưa dịch chuyển thế nào và có dấu hiệu nóng lên không; (3) quan hệ vật lý giữa bức xạ–nhiệt độ–mưa; (4) thiên tai cực đoan tập trung ở đâu, khi nào.
>
> Nhóm chia phần: bạn Việt nói dữ liệu, bạn Đức và bạn Thế Vinh trình bày dashboard, bạn Quang Vinh trình bày AI. Xin mời bạn Việt."

**Slide chiếu:** trang bìa / tiêu đề + 4 câu hỏi phân tích.

---

## 1:30 – 5:00 · NGƯỜI 1 — DỮ LIỆU & TIỀN XỬ LÝ (Việt)

**Màn hình:** slide sơ đồ pipeline + Chương 2 báo cáo (bảng từ điển dữ liệu) hoặc file `locations.csv`.

**Ý chính cần nói:**
- **Nguồn:** Open-Meteo Historical Weather API — dựa trên mô hình tái phân tích **ERA5 của ECMWF** (châu Âu), giấy phép **CC BY 4.0**, miễn phí, minh bạch. → *Đây là điểm ăn tiêu chí "nguồn đáng tin cậy".*
- **Quy mô:** **28 trạm** trải đều Bắc–Trung–Nam, **6 năm** (01/2020–12/2025), tổng **61.376 dòng**, **12 cột**.
  - 5 biến định danh: `date, location, region, latitude, longitude`
  - **7 biến đo** (đúng yêu cầu ≥7): nhiệt độ max/min/mean, tổng mưa, mưa rào, gió max, bức xạ mặt trời.
- **Vượt yêu cầu đề:** cần ≥7 biến (có 7), ≥2000 dòng (có 61k), >50% liên quan VN (**100% là VN**).
- **Quy trình tiền xử lý (nói theo sơ đồ):**
  1. Đọc `locations.csv` (toạ độ 28 trạm)
  2. Gọi API từng trạm, **xử lý giới hạn tần suất (HTTP 429)** bằng cơ chế chờ + cache JSON gốc
  3. Làm sạch: chuẩn hoá kiểu dữ liệu, **gán vùng miền** (Bắc/Trung/Nam), sắp xếp
  4. Lưu **Parquet** (nén cột) để truy vấn nhanh
- **Chất lượng dữ liệu (số liệu để nói):** **0% giá trị khuyết, 0% trùng lặp**; miền giá trị hợp lệ: nhiệt độ 4.5–41.8°C, mưa 0–267.5 mm, gió 2.9–72.4 km/h — khớp thực tế VN.
- **Vì sao Parquet + DuckDB:** kiến trúc *local-first*, không cần cài server CSDL, truy vấn tệp trực tiếp cực nhanh.

**Câu chuyển tiếp:**
> "Dữ liệu sạch này được nạp vào dashboard. Mời bạn Đức trình bày hai màn hình đầu."

---

## 5:00 – 9:00 · NGƯỜI 2 — TAB TỔNG QUAN & KHÁM PHÁ (Đức)

> **Chiếu app thật, thao tác trực tiếp** (đẹp hơn slide). Mở sẵn `localhost:5173`.

### Tab 1 — Tổng quan trạm đo (~2 phút)
**Thao tác + lời:**
- Chỉ vào **bản đồ GeoJSON thật** của VN với 28 trạm, màu phân theo miền, kích thước điểm theo nhiệt độ TB.
- **Click vào 1 trạm (vd Hà Nội)** → panel chi tiết cập nhật tức thì: TB 24.14°C, cao nhất 40.2°C, thấp nhất 6.1°C, mưa ~2.235 mm/năm. → *Đây là minh hoạ tiêu chí "liên kết giữa các thành phần".*
- Ba thẻ KPI: **28 trạm · 61.376 bản ghi · 6 năm**.
- Đọc phần "Kết luận & câu chuyện dữ liệu" phía dưới: **nóng nhất TP.HCM (27.55°C), mát nhất Đà Lạt (18.86°C) — chênh 8.7°C**; mưa nhiều nhất Huế (~3.015 mm/năm), khô nhất Phan Thiết (~1.407 mm); gió mạnh nhất Vũng Tàu.

### Tab 2 — Khám phá khí hậu (~2 phút)
- **Dropdown** chọn từng trạm hoặc toàn quốc (nhấn tính tương tác/điều hướng).
- **Chu kỳ nhiệt độ theo tháng:** dạng hình chuông, đỉnh mùa hè (tháng 5–8), 3 đường max/mean/min thể hiện biên độ ngày.
- **Lượng mưa theo tháng:** biểu đồ cột — chọn đúng loại biểu đồ cho dữ liệu tích luỹ.
- **Xu hướng theo năm:** *nói thật* — nhiệt độ dao động quanh 25°C, **KHÔNG tăng đơn điệu**; 6 năm là quá ngắn để kết luận nóng lên. → *Điểm trung thực, ghi điểm "phân tích".*
- **Heatmap Tháng × Năm:** ô màu giúp phát hiện nhanh **tháng 4/2024 nóng bất thường**.
- Nhấn tương tác: **nút phóng to ⛶** từng biểu đồ, tooltip đồng bộ khi rê chuột.

**Câu chuyển tiếp:**
> "Từ bức tranh tổng quan, ta đi sâu vào thiên tai cực đoan và quan hệ giữa các biến — mời bạn Thế Vinh."

---

## 9:00 – 13:00 · NGƯỜI 3 — TAB CỰC ĐOAN & TƯƠNG QUAN (Thế Vinh)

### Tab 3 — Thời tiết cực đoan (~2 phút)
- **Hai thanh trượt ngưỡng** (nắng nóng 38°C, mưa lớn 100 mm) — kéo trượt để thầy/cô thấy dữ liệu tải lại động (tương tác mạnh, gọi API backend).
- KPI: **302 ngày nắng nóng cực đoan, 95 ngày mưa lớn lịch sử, Huế là nơi khắc nghiệt nhất**.
- **Biểu đồ cột xếp hạng:** **Huế dẫn đầu** số ngày ≥38°C, bỏ xa phần còn lại.
- **Bản đồ điểm nóng:** kích thước điểm = số ngày vượt ngưỡng → dải nắng nóng tập trung ở **Bắc Trung Bộ – Trung Trung Bộ** (hiệu ứng phơn).
- Kỷ lục để nhấn mạnh: **Lào Cai 41.8°C (29/04/2024)**, **Vinh mưa 267.5 mm/ngày (18/10/2020)** gây ngập lụt.

### Tab 4 — Tương quan khí hậu (~2 phút)
- **Ma trận tương quan Pearson:** ô **Bức xạ–Nhiệt độ = 0.56** (cam đậm, thuận vừa–mạnh); ô **Mưa–Bức xạ = −0.34** (xanh, nghịch).
- **Scatter Bức xạ vs Nhiệt độ:** đám mây điểm dốc lên → bức xạ cao thì nóng; phân màu 3 miền cho thấy **miền Nam co cụm ở nhiệt độ cao & ổn định**.
- **Vĩ độ vs Nhiệt độ ("càng ra Bắc càng lạnh?"):** vĩ độ tăng → dải nhiệt trải rộng xuống thấp.
- **Boxplot phân bố 3 miền:** hộp miền Nam ngắn & cao (ổn định, std 1.32°C); **miền Bắc hộp dài nhất (std 4.91°C, từ 7.4°C đến 31.9°C)** do rét đậm mùa đông.
- **Ý nghĩa vật lý (nói 1 câu):** bức xạ nhiều → đất hấp thụ nhiệt → nóng; ngày mưa nhiều mây → chắn bức xạ → tương quan âm.

**Câu chuyển tiếp:**
> "Ngoài các biểu đồ tĩnh, dashboard còn cho phép hỏi dữ liệu bằng ngôn ngữ tự nhiên qua trợ lý AI — phần quan trọng nhất, mời bạn Quang Vinh."

---

## 13:00 – 18:30 · NGƯỜI 4 — TÍCH HỢP AI + DEMO (Quang Vinh)

### Phần nói (~2 phút)
- **Vai trò:** trợ lý phân tích, dịch câu hỏi tiếng Việt → mã **SQL hoặc Python** chỉ đọc, kèm giải thích.
- **Công nghệ:** mô hình **Google Gemini** (`gemini-flash-latest`) qua API; có **chế độ mock offline** dự phòng khi mất mạng → luôn demo được.
- **3 nguyên tắc cốt lõi của đề (nhấn mạnh — đây là phần chấm nặng):**
  1. **Human-in-the-loop:** AI chỉ *đề xuất*, con người *quyết định*.
  2. **Không thực thi ngầm:** code hiện tường minh ở trạng thái **CHỜ DUYỆT**, chạy xong mới thôi.
  3. **Không bịa số liệu, không sửa dữ liệu gốc** (chỉ đọc).
- **Kiến trúc (tách đúng gợi ý đề):** Frontend + **3 API** — `proposals` (sinh code), `approve` (kiểm tra an toàn), `execute` (chạy local) + **API logs** lưu toàn bộ.
- **Bộ kiểm soát an toàn (guard):** SQL chỉ cho `SELECT`, chặn `DROP/DELETE...`, cấm nhiều lệnh; Python phân tích **AST** chặn `import/eval/exec/open`.

### Demo trực tiếp (~3 phút) — kịch bản chắc ăn

> Chuẩn bị: backend + frontend đang chạy, **đã cắm Gemini key**, đang ở tab AI Analyst Portal.

1. **Gõ câu hỏi:** *"So sánh nhiệt độ trung bình giữa ba miền Bắc, Trung, Nam."* → bấm **Sinh đề xuất (SQL)**.
2. Chỉ cho thầy/cô thấy: **code SQL hiện ra** + **ô giải thích tiếng Việt** + badge **DRAFT** → *"AI chưa chạy gì cả, đang chờ con người."*
3. **Sửa nhẹ code** ngay trên giao diện (vd thêm `LIMIT` hoặc đổi thứ tự sắp xếp) → *"con người toàn quyền chỉnh."*
4. Bấm **Phê duyệt & chạy local** → kết quả ra bảng/biểu đồ: **Nam nóng nhất > Trung > Bắc**.
5. Mở **Nhật ký AI** phía dưới → *"mọi câu hỏi, code, kết quả đều được lưu để truy xuất."*

**Câu demo dự phòng (nếu thầy/cô muốn tự ra đề):** sẵn sàng gõ bất kỳ, ví dụ *"Tỉnh nào có tốc độ gió trung bình lớn nhất?"* (đáp án: Vũng Tàu ~24.83 km/h).

**Demo "AI biết từ chối" (nếu còn giờ):** gõ *"Hôm nay ăn gì ngon?"* → AI trả code rỗng + từ chối vì ngoài phạm vi khí hậu.

**Câu chuyển tiếp:**
> "Đó là toàn bộ hệ thống. Mời bạn trưởng nhóm kết luận."

---

## 18:30 – 20:00 · KẾT LUẬN (Trưởng nhóm)

> "Tóm lại, nhóm đã xây dựng bộ dữ liệu khí hậu VN sạch 61.376 dòng, một dashboard 5 phân hệ trả lời trọn vẹn 4 câu hỏi phân tích, và một trợ lý AI minh bạch theo nguyên tắc con người kiểm soát.
>
> Hạn chế: dữ liệu tái phân tích dạng lưới nên có thể lệch nhỏ ở vi khí hậu; 6 năm chưa đủ kết luận xu hướng dài hạn. Hướng phát triển: nối dữ liệu trạm đo thực, mở rộng AI sang tự sinh biểu đồ, triển khai lên đám mây.
>
> Toàn bộ mã nguồn và dữ liệu đã công khai trên GitHub và Google Drive. Nhóm xin cảm ơn và sẵn sàng nhận câu hỏi ạ."

---

## Chuẩn bị trước buổi vấn đáp (checklist)

- [ ] Backend chạy (`uvicorn ... --env-file ../.env`), **Gemini key đã cắm**, test 1 câu hỏi trước.
- [ ] Frontend chạy (`npm run dev`), mở sẵn `localhost:5173`, phóng to trình duyệt.
- [ ] Mở sẵn 5 tab một lượt để không loading khi demo.
- [ ] Có **mạng dự phòng** (điện thoại phát 4G) phòng khi wifi phòng thi yếu — hoặc nhớ chế độ mock vẫn chạy được.
- [ ] Báo cáo PDF mở sẵn ở tab khác (phòng khi thầy/cô hỏi số liệu).
- [ ] Mỗi người tập nói **đúng phần của mình + canh giờ** ít nhất 1 lần.

## Câu hỏi thầy/cô hay hỏi (chuẩn bị trả lời)

| Câu hỏi | Gợi ý trả lời |
|---------|---------------|
| "Dữ liệu này có phải đo thực không?" | Là dữ liệu **tái phân tích ERA5** (mô hình + vệ tinh), độ tin cậy cao nhưng có thể lệch nhỏ ở vi khí hậu — nhóm đã nêu ở phần hạn chế. |
| "AI có thể tự xoá/sửa dữ liệu không?" | Không. Guard chỉ cho `SELECT`/đọc; Python chặn import/ghi file. Demo `DROP TABLE` bị chặn. |
| "Nếu AI sinh code sai thì sao?" | Con người xem & sửa trước khi duyệt (human-in-the-loop) — demo bước sửa code. |
| "Màu sắc chọn theo nguyên tắc gì?" | Hệ màu đất: teal=lạnh/Bắc, hổ phách=Trung, xanh rừng=Nam, đất nung=nóng; thang nhiệt teal→đất nung. |
| "Có bao nhiêu biến, bao nhiêu dòng?" | 12 cột (7 biến đo), 61.376 dòng, 28 trạm, 6 năm. |
| "Yêu cầu dùng AI trả lời câu này…" | Gõ trực tiếp vào portal, duyệt, chạy — luôn sẵn sàng. |
