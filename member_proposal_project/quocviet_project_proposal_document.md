# Đề xuất đề tài của Quốc Việt

> **Người đề xuất:** Quốc Việt  
> **Ngày đánh giá:** 13/06/2026  
> **Đề tài đề xuất:** Vietnam Trade Flow Pulse  
> **Chủ đề:** Dòng chảy xuất nhập khẩu hàng hóa Việt Nam theo tháng  
> **Nguồn dữ liệu chính:** National Statistics Office of Vietnam (NSO/GSO), e-DSBB/NSDP  
> **Quyết định cá nhân:** **PHÊ DUYỆT CÓ ĐIỀU KIỆN**

---
Dataset mới được đề xuất là **dữ liệu ngoại thương hàng hóa Việt Nam theo tháng**.
Dataset này phù hợp hơn vì:

- Có tần suất **hàng tháng**, dễ thể hiện xu hướng liên tục.
- Có thể chọn giai đoạn lõi **2010-01 đến 2021-12** để đảm bảo dữ liệu đầy đủ.
- Sau khi lọc các chỉ tiêu có đủ toàn bộ tháng, vẫn còn **86 chỉ tiêu x 144 tháng =
  12.384 dòng**.
- Dữ liệu đến từ nguồn thống kê chính thức của Việt Nam.
- Dạng dữ liệu rất hợp với SQL, DuckDB, dashboard và module AI.

---

## 2. Tóm tắt đề tài

Dashboard giúp **sinh viên, nhà phân tích dữ liệu và người quan tâm đến kinh tế Việt
Nam** hiểu **xu hướng xuất nhập khẩu hàng hóa của Việt Nam thay đổi như thế nào theo
tháng và theo nhóm mặt hàng** bằng cách phân tích dữ liệu ngoại thương chính thức
trong phạm vi **Việt Nam giai đoạn 2010-2021**.

Tên sản phẩm gợi ý:

```text
Vietnam Trade Flow Pulse
```

Câu hỏi trung tâm:

> Dòng chảy xuất khẩu, nhập khẩu và cán cân thương mại hàng hóa của Việt Nam thay đổi
> như thế nào trong giai đoạn 2010-2021, và nhóm mặt hàng nào đóng vai trò nổi bật?

---

## 3. Nguồn dữ liệu

### Nguồn chính

| Trường | Nội dung |
|---|---|
| Tên nguồn | Merchandise Trade / MET Vietnam |
| Đơn vị cung cấp | National Statistics Office of Vietnam (NSO/GSO) |
| Cổng dữ liệu | https://nsdp.nso.gov.vn/index.htm |
| File/XML tham chiếu | https://nsdp.gso.gov.vn/GSO-chung/SDMXFiles/GSO/METVNM.xml |
| Loại dữ liệu | Chỉ tiêu ngoại thương hàng hóa theo tháng |
| Phạm vi đề xuất | 2010-01 đến 2021-12 |
| Tần suất | Tháng |
| Đơn vị chính | Triệu USD, không điều chỉnh mùa vụ (NSA) |

### Nguồn hỗ trợ để tải nhanh

| Nguồn | Vai trò |
|---|---|
| https://github.com/thanhqtran/gso-macro-monitor | Script/cache hỗ trợ đọc dữ liệu GSO |
| `all_data_gso_20250606.json.zip` | Snapshot tiện để spike nhanh |
| `dsbb_indicator_desc.csv` | Mô tả tên chỉ tiêu tiếng Anh/tiếng Việt |

Khi viết báo cáo, nên ghi nguồn dữ liệu chính là **NSO/GSO e-DSBB/NSDP**. Repo GitHub
chỉ nên được ghi là công cụ hỗ trợ tải và chuyển đổi dữ liệu.

---

## 4. Kiểm chứng nhanh bằng code

Từ snapshot `all_data_gso_20250606.json.zip`, kiểm tra nhóm dữ liệu `MET` có:

| Chỉ số | Kết quả |
|---|---:|
| Tổng số chuỗi chỉ tiêu MET theo tháng | 106 |
| Tổng quan sát MET theo tháng trong toàn snapshot | 17.418 |
| Khoảng thời gian có trong snapshot | 2010-01 đến 2024-12 |
| Giai đoạn lõi đề xuất | 2010-01 đến 2021-12 |
| Số tháng trong giai đoạn lõi | 144 |
| Số chỉ tiêu có đủ toàn bộ 144 tháng | 86 |
| Số dòng sau lọc giai đoạn lõi | 12.384 |

Điểm quan trọng: **12.384 dòng này là dữ liệu liên tục theo tháng**, không phải dữ
liệu dài nhưng rỗng nhiều năm.

---

## 5. Cấu trúc dữ liệu đề xuất

Mỗi dòng dữ liệu đại diện cho:

```text
một chỉ tiêu ngoại thương của Việt Nam trong một tháng
```

Ví dụ:

```text
indicator = TXG_FOB_USD
period = 2019-06
value = giá trị xuất khẩu trong tháng 06/2019
```

### Các biến cốt lõi

| Biến | Kiểu | Ý nghĩa |
|---|---|---|
| `period` | date/month | Tháng quan sát |
| `year` | integer | Năm |
| `month` | integer | Tháng |
| `indicator_code` | string | Mã chỉ tiêu |
| `indicator_name_en` | string | Tên chỉ tiêu tiếng Anh |
| `indicator_name_vi` | string | Tên chỉ tiêu tiếng Việt |
| `flow_type` | string | Export, import, trade balance |
| `commodity_group` | string | Nhóm hàng hóa |
| `unit` | string | Đơn vị, chủ yếu triệu USD |
| `value` | float | Giá trị chỉ tiêu |
| `frequency` | string | Tần suất, ở đây là monthly |
| `source` | string | NSO/GSO |

Dataset vượt yêu cầu **7 biến độc lập có ý nghĩa** và **2.000 dòng**.

---

## 6. Một số chỉ tiêu dễ dùng

| Mã chỉ tiêu | Ý nghĩa |
|---|---|
| `TB_USD` | Cán cân thương mại hàng hóa |
| `TXG_FOB_USD` | Tổng xuất khẩu |
| `TMG_CIF_USD` | Tổng nhập khẩu |
| `TXGBD_FOB_USD` | Xuất khẩu hàng hóa |
| `VNM_TXG_FS_FOB_USD` | Xuất khẩu khu vực kinh tế trong nước |
| `TXG_FS_FOB_USD` | Xuất khẩu khu vực FDI |
| `TXGCOF_FOB_USD` | Xuất khẩu cà phê |
| `TXGRIN_FOB_USD` | Xuất khẩu gạo |
| `TXGCPH_FOB_USD` | Xuất khẩu điện thoại và linh kiện |
| `VNM_TXGECP_CIF_USD` | Xuất khẩu điện tử, máy tính và linh kiện |
| `TXGIOT_FOB_USD` | Xuất khẩu dệt may |
| `TXGFW_FOB_USD` | Xuất khẩu giày dép |
| `TMGPETP_CIF_USD` | Nhập khẩu xăng dầu |
| `TMGPHAM_CIF_USD` | Nhập khẩu nguyên phụ liệu dược phẩm |

---

## 7. Câu hỏi phân tích chính

1. Xuất khẩu, nhập khẩu và cán cân thương mại Việt Nam thay đổi như thế nào theo
   tháng từ 2010 đến 2021?
2. Những nhóm hàng nào đóng góp lớn nhất vào tăng trưởng xuất khẩu?
3. Khu vực FDI và khu vực kinh tế trong nước khác nhau như thế nào về đóng góp xuất
   khẩu?
4. Các mặt hàng chủ lực như điện thoại, điện tử, dệt may, giày dép, gạo, cà phê biến
   động ra sao?
5. Có tháng hoặc giai đoạn nào xuất hiện biến động bất thường trong thương mại hàng
   hóa?

---

## 8. Ý tưởng dashboard

| Trang/chức năng | Mục đích | Biểu đồ chính | Bộ lọc |
|---|---|---|---|
| Tổng quan | Xem nhanh xuất khẩu, nhập khẩu, cán cân | KPI, line chart tổng | Năm, giai đoạn |
| Xu hướng theo tháng | Theo dõi biến động dài hạn và mùa vụ | Line chart, rolling average | Chỉ tiêu, nhóm hàng |
| Cơ cấu mặt hàng | Xem nhóm hàng nào nổi bật | Bar chart, stacked chart | Export/import, top-N |
| So sánh nhóm hàng | So sánh các mặt hàng chủ lực | Multi-line, small multiples | Nhóm hàng, năm |
| AI Analyst | Hỏi câu hỏi mới bằng ngôn ngữ tự nhiên | Bảng kết quả từ SQL | Prompt người dùng |

### Ba biểu đồ quan trọng nhất

| Biểu đồ | Câu hỏi trả lời | Insight dự kiến |
|---|---|---|
| Line chart xuất khẩu, nhập khẩu, cán cân | Việt Nam thặng dư/thâm hụt vào giai đoạn nào? | Thấy rõ thay đổi cán cân thương mại qua thời gian |
| Top nhóm hàng xuất khẩu theo năm | Nhóm hàng nào là động lực xuất khẩu chính? | Điện thoại, điện tử, dệt may, giày dép có thể nổi bật |
| Heatmap tháng x năm cho cán cân thương mại | Có mùa vụ hoặc tháng bất thường không? | Phát hiện giai đoạn biến động mạnh |

---

## 9. Giá trị của AI

Dataset này rất phù hợp cho module AI vì dữ liệu đã ở dạng bảng chỉ đọc. AI có thể
sinh SQL để trả lời các câu hỏi ngoài dashboard cố định.

| Câu hỏi người dùng | Truy vấn AI cần sinh | Kết quả mong đợi |
|---|---|---|
| Tháng nào có thặng dư thương mại cao nhất? | Lọc `TB_USD`, sắp xếp `value` giảm dần | Bảng top tháng |
| Nhóm hàng nào tăng xuất khẩu nhanh nhất 2010-2021? | Tính CAGR hoặc chênh lệch theo `indicator_code` | Top nhóm hàng tăng mạnh |
| So sánh xuất khẩu FDI và trong nước theo thời gian | Lọc 2 indicator, nhóm theo tháng/năm | Bảng hoặc chart so sánh |

Luồng AI vẫn đúng yêu cầu:

```text
Người dùng nhập câu hỏi
-> AI nhận schema dữ liệu
-> AI sinh SQL + giải thích
-> Giao diện hiển thị code ở trạng thái chờ
-> Người dùng chỉnh sửa/phê duyệt
-> Backend kiểm tra SQL chỉ đọc
-> Chạy local trên DuckDB
-> Trả kết quả và lưu log
```

---

## 10. Đánh giá gate bắt buộc

| Mã | Điều kiện | Kết quả | Ghi chú |
|---|---|---|---|
| G1 | Liên quan rõ ràng đến Việt Nam | Đạt | Dữ liệu ngoại thương Việt Nam |
| G2 | Ít nhất 2.000 dòng | Đạt | 12.384 dòng sau lọc giai đoạn liên tục |
| G3 | Ít nhất 7 biến độc lập | Đạt | Có thời gian, chỉ tiêu, nhóm hàng, flow, đơn vị, value, source... |
| G4 | Quyền sử dụng hợp pháp | Đạt có điều kiện | Dữ liệu công bố công khai; cần trích nguồn NSO/GSO rõ |
| G5 | Xử lý local được | Đạt | JSON/XML nhẹ, dễ chuyển CSV/Parquet/DuckDB |
| G6 | Có snapshot/tái tạo | Đạt | Có thể lưu snapshot và checksum |
| G7 | Không có dữ liệu cá nhân | Đạt | Dữ liệu thống kê tổng hợp cấp quốc gia |
| G8 | Có metadata biến | Đạt | Có mô tả chỉ tiêu tiếng Anh/tiếng Việt |
| G9 | Hỗ trợ insight có giá trị | Đạt | Có xu hướng, mùa vụ, so sánh nhóm hàng, ngoại lệ |
| G10 | Khả thi trong 14 ngày | Đạt | Không cần API key, không cần bản đồ, không cần xử lý dữ liệu lớn |

**Kết luận Gate:** ĐẠT CÓ ĐIỀU KIỆN.

---

## 11. Chấm điểm sơ bộ theo rubric

| Nhóm tiêu chí | Điểm tối đa | Điểm đề xuất | Lý do |
|---|---:|---:|---|
| Độ tin cậy và nguồn gốc | 15 | 14 | Nguồn thống kê chính thức NSO/GSO |
| Pháp lý, đạo đức và quyền riêng tư | 10 | 9 | Dữ liệu công khai, tổng hợp, không cá nhân |
| Quy mô và cấu trúc | 15 | 14 | 12.384 dòng liên tục, schema đơn giản |
| Chất lượng dữ liệu | 15 | 13 | Chọn chỉ tiêu đủ 144 tháng để giảm missing |
| Phạm vi Việt Nam và giá trị chuyên môn | 10 | 10 | Ngoại thương là chủ đề kinh tế cốt lõi của Việt Nam |
| Tiềm năng phân tích | 15 | 14 | Có xu hướng, mùa vụ, so sánh, bất thường |
| Tiềm năng trực quan hóa và tương tác | 10 | 9 | Line, heatmap, bar, top-N, filter rất rõ |
| Khả năng tích hợp AI | 5 | 5 | Rất hợp SQL chỉ đọc |
| Khả năng tiếp cận, tái tạo và vận hành | 5 | 4 | Có snapshot dễ dùng; cần ghi rõ pipeline từ nguồn |
| **Tổng cộng** | **100** | **92** | Rất phù hợp để đề xuất |

---

## 12. Rủi ro và cách xử lý

| Rủi ro | Mức | Cách xử lý |
|---|---|---|
| Bản dữ liệu đầy đủ đến 2024 có một số tháng thiếu | Trung bình | Dùng giai đoạn lõi 2010-2021 đã kiểm tra liên tục |
| Mã chỉ tiêu khó đọc | Trung bình | Join với bảng mô tả `dsbb_indicator_desc.csv` |
| Có nhiều chỉ tiêu gây rối dashboard | Trung bình | Chỉ chọn 20-30 chỉ tiêu quan trọng cho giao diện chính |
| Dễ diễn giải số liệu thương mại quá mức | Thấp/Trung bình | Ghi rõ đây là thống kê mô tả, không kết luận nguyên nhân chính sách |
| Phụ thuộc snapshot GitHub nếu không tải được XML | Thấp | Lưu snapshot local và ghi rõ nguồn chính NSO/GSO |

---

## 13. Spike kiểm chứng cần làm

1. Tải snapshot hoặc XML dữ liệu MET.
2. Chuyển dữ liệu về bảng long: `period`, `indicator_code`, `value`.
3. Join metadata mô tả chỉ tiêu.
4. Lọc giai đoạn 2010-01 đến 2021-12.
5. Chỉ giữ các chỉ tiêu có đủ 144 tháng.
6. Xuất CSV/Parquet và tạo DuckDB.
7. Tạo 3 biểu đồ thử nghiệm:
   - Xuất khẩu, nhập khẩu, cán cân theo tháng.
   - Top nhóm hàng xuất khẩu theo năm.
   - Heatmap cán cân thương mại theo tháng x năm.
8. Viết 3 insight có số liệu.
9. Tạo 2 SQL mẫu cho AI Analyst.

Điều kiện spike thành công:

| Điều kiện | Ngưỡng |
|---|---:|
| Số dòng sau làm sạch | >= 2.000 |
| Số biến độc lập có ý nghĩa | >= 7 |
| Chuỗi thời gian liên tục | 2010-01 đến 2021-12 |
| Biểu đồ thử nghiệm | >= 3 |
| Insight kiểm chứng được | >= 3 |
| Truy vấn AI chỉ đọc | >= 2 |

---

## 14. Mục tiêu chung của nhóm

Mục tiêu chung của nhóm là xây dựng một dashboard phân tích dữ liệu ngoại thương hàng
hóa Việt Nam theo tháng, giúp người dùng hiểu rõ xu hướng xuất khẩu, nhập khẩu, cán
cân thương mại và vai trò của các nhóm hàng chủ lực trong giai đoạn 2010-2021.

Sản phẩm cuối cùng cần đạt các mục tiêu sau:

1. Tạo được bộ dữ liệu sạch, liên tục theo tháng, có thể tái tạo từ nguồn NSO/GSO.
2. Thiết kế dashboard trực quan, dễ hiểu, có bộ lọc theo thời gian, loại dòng chảy
   thương mại và nhóm hàng.
3. Trình bày được ít nhất ba insight có bằng chứng số liệu hoặc biểu đồ rõ ràng.
4. Thể hiện được xu hướng theo thời gian, so sánh giữa các nhóm hàng và phát hiện
   biến động bất thường.
5. Tích hợp module AI Analyst để sinh SQL/phân tích theo yêu cầu người dùng, hiển thị
   code và giải thích trước khi phê duyệt chạy local.
6. Hoàn thiện báo cáo, kiểm thử và kịch bản demo để bảo vệ trong buổi vấn đáp.

### Mục tiêu phân tích cụ thể

| Mục tiêu | Cách đo hoặc bằng chứng |
|---|---|
| Phân tích xu hướng thương mại | Line chart xuất khẩu, nhập khẩu, cán cân theo tháng |
| So sánh nhóm hàng chủ lực | Top-N bar chart và multi-line chart |
| Phân tích mùa vụ/bất thường | Heatmap tháng x năm và bảng tháng biến động mạnh |
| Đánh giá vai trò khu vực FDI/nội địa | So sánh chỉ tiêu xuất khẩu theo khu vực kinh tế |
| Hỗ trợ câu hỏi ngoài dashboard | AI sinh SQL chỉ đọc và trả bảng kết quả |

---

## 15. Phân công cho nhóm 4 thành viên

| Thành viên | Vai trò chính | Công việc cụ thể | Sản phẩm bàn giao |
|---|---|---|---|
| Thành viên 1 | Dữ liệu và pipeline | Tải dữ liệu MET, đọc snapshot/XML, chuẩn hóa bảng long, lọc giai đoạn 2010-2021, kiểm tra missing/duplicate | `trade_monthly.csv` hoặc Parquet, data profile, data dictionary |
| Thành viên 2 | Phân tích và insight | Chọn chỉ tiêu quan trọng, tạo EDA, tính tăng trưởng, top nhóm hàng, tháng bất thường, viết insight | 3-5 insight có số liệu, notebook/script phân tích |
| Thành viên 3 | Dashboard frontend | Thiết kế giao diện, tạo biểu đồ line/bar/heatmap, bộ lọc, tooltip, trạng thái rỗng | Dashboard tương tác hoàn chỉnh |
| Thành viên 4 | Backend, AI và báo cáo | Xây API dữ liệu, DuckDB, AI proposal/approval, SQL guard, logs; tổng hợp báo cáo và demo | API hoạt động, AI Analyst, test an toàn, phần báo cáo AI |

### Phân công theo giai đoạn

| Giai đoạn | Thành viên phụ trách chính | Kết quả cần đạt |
|---|---|---|
| Ngày 1-2 | Thành viên 1, Thành viên 2 | Dataset sạch, đủ dòng/biến, có profile và 3 chart thử |
| Ngày 3-5 | Thành viên 2, Thành viên 3 | Câu chuyện dữ liệu, wireframe, biểu đồ chính |
| Ngày 6-9 | Thành viên 3, Thành viên 4 | Dashboard và API dữ liệu hoạt động |
| Ngày 10-11 | Thành viên 4, Thành viên 1 | AI Analyst, phê duyệt SQL, logs, kiểm thử an toàn |
| Ngày 12-14 | Cả nhóm | Hoàn thiện báo cáo, kiểm thử, demo và chuẩn bị vấn đáp |

### Nguyên tắc phối hợp

- Mỗi biểu đồ phải gắn với một câu hỏi phân tích rõ ràng.
- Mọi insight phải có số liệu hoặc truy vấn kiểm chứng.
- Dữ liệu gốc không chỉnh sửa trực tiếp; mọi bước xử lý phải có script tái tạo.
- AI không được tự chạy code; chỉ chạy sau khi người dùng phê duyệt.
- Báo cáo cần ghi rõ phần đóng góp của từng thành viên.

---

## 16. Kết luận đề xuất

Nên chọn **Vietnam Trade Flow Pulse** thay cho dataset FAOSTAT vì dataset này:

1. Có chuỗi tháng liên tục rõ ràng hơn.
2. Vẫn vượt xa yêu cầu 2.000 dòng và 7 biến.
3. Có nguồn chính thức từ Việt Nam.
4. Dễ làm dashboard, dễ viết insight, dễ tích hợp AI.
5. Không cần API key, không có dữ liệu cá nhân, không cần xử lý địa lý phức tạp.

Quyết định phù hợp ở bước đề xuất là **PHÊ DUYỆT CÓ ĐIỀU KIỆN**. Sau khi hoàn thành
spike dữ liệu và chứng minh 3 biểu đồ, 3 insight, 2 truy vấn AI mẫu, có thể nâng lên
**PHÊ DUYỆT**.
