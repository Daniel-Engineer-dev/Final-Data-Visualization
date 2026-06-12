# Đề xuất lựa chọn đề tài của Trí Đức

> **Người đề xuất:** Trí Đức  
> **Ngày đánh giá:** 12/06/2026  
> **Tài liệu đầu vào:** `project_proposal_document.md` và `project_approval_criteria.md`  
> **Đề tài được đề xuất:** **Vietnam Climate Pulse: Khám phá khí hậu và thời tiết cực đoan Việt Nam**  
> **Quyết định hiện tại:** **PHÊ DUYỆT CÓ ĐIỀU KIỆN**

---

## 1. Kết luận điều hành

Sau khi đánh giá tất cả bảy đề tài theo rubric 100 điểm và các điều kiện bắt buộc,
đề tài **Khí hậu và thời tiết cực đoan Việt Nam** là lựa chọn tốt nhất.

Đề tài đạt điểm đánh giá sơ bộ cao nhất: **94/100**. Điểm mạnh quyết định gồm:

- Nguồn chính có uy tín, tài liệu phương pháp rõ và API truy cập ổn định.
- Dễ dàng vượt yêu cầu tối thiểu 2.000 dòng và 7 biến độc lập.
- Dữ liệu có đồng thời chiều thời gian, địa lý và nhiều biến định lượng.
- Hỗ trợ tốt bản đồ, chuỗi thời gian, heatmap, so sánh và phân tích quan hệ.
- Module AI có thể sinh SQL/Python chỉ đọc, minh bạch và dễ kiểm chứng.
- Pipeline có thể chạy local, tạo snapshot và tái tạo kết quả.
- Rủi ro triển khai thấp nhất trong phạm vi 14 ngày.

Quyết định chưa được nâng thành `PHÊ DUYỆT` hoàn toàn vì theo
`project_approval_criteria.md`, nhóm phải hoàn thành spike, data profile, ba biểu đồ
và ba insight thử nghiệm trước khi ký duyệt cuối cùng.

---

## 2. Phương pháp đánh giá

Mỗi đề tài được đánh giá theo chín nhóm tiêu chí:

| Nhóm tiêu chí | Điểm tối đa |
|---|---:|
| Độ tin cậy và nguồn gốc | 15 |
| Pháp lý, đạo đức và quyền riêng tư | 10 |
| Quy mô và cấu trúc | 15 |
| Chất lượng dữ liệu | 15 |
| Phạm vi Việt Nam và giá trị chuyên môn | 10 |
| Tiềm năng phân tích | 15 |
| Tiềm năng trực quan hóa và tương tác | 10 |
| Khả năng tích hợp AI | 5 |
| Khả năng tiếp cận, tái tạo và vận hành | 5 |
| **Tổng cộng** | **100** |

Điểm số trong tài liệu là đánh giá tiền spike. Đề tài có thể bị loại dù điểm cao nếu
vi phạm một điều kiện bắt buộc, đặc biệt là quy mô dữ liệu, giấy phép, quyền riêng tư
hoặc tính khả thi trong 14 ngày.

---

## 3. Bằng chứng kiểm chứng trực tiếp

Ngày 12/06/2026, các API quan trọng đã được gọi thử trực tiếp:

### Open-Meteo Historical Weather API

- Truy vấn thử cho Thành phố Hồ Chí Minh từ ngày 01/01/2025 đến 10/01/2025 thành công.
- API trả đủ 10 ngày và các trường:
  `temperature_2m_max`, `temperature_2m_min`, `temperature_2m_mean`,
  `precipitation_sum`, `rain_sum`, `wind_speed_10m_max`,
  `shortwave_radiation_sum`.
- Chỉ một truy vấn thử đã xác nhận có ít nhất 7 biến thời tiết độc lập.
- Với 20 địa điểm trong một năm, số dòng dự kiến là:

```text
20 × 365 = 7.300 dòng
```

Nguồn: [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api).

### GBIF Occurrence API

- API trả về **1.413.914** occurrence records gắn với mã quốc gia Việt Nam tại thời
  điểm kiểm tra.
- Nguồn có quy mô rất lớn và schema giàu biến.
- GBIF yêu cầu occurrence datasets mang giấy phép máy đọc được như CC0, CC BY hoặc
  CC BY-NC.

Nguồn:
[GBIF Occurrence API](https://techdocs.gbif.org/en/openapi/v1/occurrence) và
[GBIF Terms of Use](https://www.gbif.org/terms).

### World Bank Indicators API

- API truy cập thành công.
- Một chỉ số cấp quốc gia cho Việt Nam có khoảng 66 bản ghi năm.
- Để đạt 2.000 dòng phải giữ cấu trúc dài và kết hợp nhiều chỉ số/quốc gia.

Nguồn:
[World Bank Indicators API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation).

### NASA FIRMS API

- API FIRMS yêu cầu `MAP_KEY`; truy vấn không có key trả về `401 Unauthorized`.
- `MAP_KEY` được cấp miễn phí nhưng tạo thêm phụ thuộc vận hành.
- NASA FIRMS cho biết dữ liệu sử dụng quan sát MODIS và VIIRS để phát hiện active
  fires và thermal anomalies; điểm nóng không mặc nhiên đồng nghĩa cháy rừng.

Nguồn:
[NASA FIRMS API](https://firms.modaps.eosdis.nasa.gov/api/),
[FIRMS Map Key](https://firms.modaps.eosdis.nasa.gov/api/map_key/) và
[NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/).

---

## 4. Kết quả chấm tất cả đề tài

| Hạng | Đề tài | S | L | D | Q | V | A | Z | I | O | Tổng | Quyết định sơ bộ |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 1 | Khí hậu và thời tiết cực đoan | 14 | 9 | 15 | 13 | 9 | 14 | 10 | 5 | 5 | **94** | Phê duyệt có điều kiện |
| 2 | Điểm nóng cháy và nguy cơ cháy | 15 | 9 | 14 | 11 | 10 | 14 | 10 | 5 | 3 | **91** | Phê duyệt có điều kiện |
| 3 | Bản đồ đa dạng sinh học | 14 | 9 | 15 | 9 | 10 | 14 | 10 | 4 | 4 | **89** | Phê duyệt có điều kiện |
| 4 | Chất lượng không khí đô thị | 12 | 8 | 15 | 9 | 10 | 14 | 10 | 5 | 4 | **87** | Phê duyệt có điều kiện |
| 5 | Biến động rừng và áp lực môi trường | 14 | 9 | 11 | 11 | 10 | 14 | 10 | 4 | 2 | **85** | Phê duyệt có điều kiện |
| 6 | Việt Nam trong bức tranh phát triển khu vực | 15 | 9 | 12 | 11 | 7 | 12 | 7 | 5 | 5 | **83** | Phê duyệt có điều kiện |
| 7 | Thiên tai và mức độ dễ bị tổn thương | 12 | 8 | 7 | 8 | 10 | 13 | 9 | 4 | 3 | **74** | Không phê duyệt trước spike |

Ký hiệu:

- `S`: độ tin cậy và nguồn gốc.
- `L`: pháp lý, đạo đức và quyền riêng tư.
- `D`: quy mô và cấu trúc.
- `Q`: chất lượng dữ liệu.
- `V`: phạm vi Việt Nam và giá trị chuyên môn.
- `A`: tiềm năng phân tích.
- `Z`: tiềm năng trực quan hóa và tương tác.
- `I`: khả năng tích hợp AI.
- `O`: khả năng tiếp cận, tái tạo và vận hành.

### Giải thích thứ hạng

Mặc dù **Điểm nóng cháy** có tổng điểm gần đề tài khí hậu và gây ấn tượng trình
diễn mạnh, đề tài này phụ thuộc `MAP_KEY`, cần spatial join và phải giải thích cẩn
trọng sự khác biệt giữa thermal anomaly với cháy rừng. Rủi ro hoàn thành trong 14
ngày cao hơn.

**Đa dạng sinh học** có dữ liệu rất lớn và giá trị khoa học cao, nhưng chất lượng
tọa độ, thiên lệch quan sát và khác biệt giữa các dataset thành phần làm giảm độ chắc
chắn của kết luận.

**Chất lượng không khí** có giá trị xã hội cao nhưng phải phân biệt dữ liệu mô hình
với số đo trạm và tránh đưa ra diễn giải y tế không được dữ liệu hỗ trợ.

**Biến động rừng** có trực quan mạnh nhưng xử lý raster và spatial aggregation tạo
rủi ro kỹ thuật đáng kể.

**World Bank** là phương án dữ liệu an toàn nhưng câu chuyện Việt Nam cấp địa phương
yếu, ít tiềm năng bản đồ nội địa và dễ trở thành tập hợp biểu đồ chỉ số.

**Thiên tai** chưa chứng minh được nguồn chính có hơn 2.000 dòng hữu dụng, vì vậy
chưa vượt gate `G2`.

---

## 5. Gate bắt buộc của đề tài được chọn

### Đề tài

**Vietnam Climate Pulse: Khám phá khí hậu và thời tiết cực đoan Việt Nam**

| Mã | Điều kiện | Đánh giá hiện tại | Ghi chú |
|---|---|---|---|
| G1 | Liên quan rõ ràng đến Việt Nam | Đạt | Dữ liệu lấy tại các địa điểm Việt Nam |
| G2 | Ít nhất 2.000 dòng | Đạt về khả năng | 20 địa điểm × 365 ngày = 7.300 dòng |
| G3 | Ít nhất 7 biến độc lập | Đạt | Đã gọi thử thành công 7 biến thời tiết |
| G4 | Quyền sử dụng hợp pháp | Cần xác nhận cuối | Ghi rõ attribution và điều khoản nguồn |
| G5 | Tải và xử lý local | Đạt | API gọi thử thành công; có thể lưu Parquet |
| G6 | Có snapshot/tái tạo | Đạt về thiết kế | Lưu raw response, Parquet và metadata |
| G7 | Không có dữ liệu cá nhân nhạy cảm | Đạt | Dữ liệu môi trường theo tọa độ/thời gian |
| G8 | Có metadata giải thích biến | Đạt | Tài liệu API mô tả biến và đơn vị |
| G9 | Hỗ trợ insight có giá trị | Đạt về khả năng | Có thời gian, địa lý và quan hệ đa biến |
| G10 | Hoàn thành trong 14 ngày | Đạt | Pipeline và dashboard có độ phức tạp kiểm soát được |

**Kết luận Gate:** `ĐẠT CÓ ĐIỀU KIỆN`.

Điều kiện chưa hoàn tất là xác nhận điều khoản sử dụng trong hồ sơ nguồn và thực hiện
spike đầy đủ theo rubric.

---

## 6. Phạm vi đề tài được đề xuất

### Câu hỏi trung tâm

Khí hậu và các hiện tượng thời tiết cực đoan khác nhau như thế nào giữa các khu vực
Việt Nam, theo mùa và theo thời gian?

### Phạm vi dữ liệu

- **Nguồn chính:** Open-Meteo Historical Weather API.
- **Nguồn bổ sung:** HDX Viet Nam Administrative Boundaries.
- **Độ chi tiết:** một địa điểm trong một ngày.
- **Thời gian đề xuất:** 2020–2025.
- **Không gian đề xuất:** 20–34 thành phố hoặc điểm đại diện cho các vùng khí hậu.
- **Dữ liệu local:** raw JSON/CSV, dataset phân tích Parquet và DuckDB.

### Các biến cốt lõi

- Thời gian, địa điểm, vùng miền, vĩ độ và kinh độ.
- Nhiệt độ tối đa, tối thiểu và trung bình.
- Lượng mưa.
- Độ ẩm.
- Tốc độ gió.
- Áp suất.
- Bức xạ mặt trời.
- Các chỉ số cực đoan dẫn xuất có định nghĩa rõ.

### Câu hỏi phân tích chính

1. Khu vực nào có đặc điểm khí hậu khắc nghiệt hoặc biến động nhất?
2. Mùa vụ nhiệt độ và lượng mưa khác nhau thế nào giữa các vùng?
3. Những địa điểm và thời điểm nào xuất hiện giá trị bất thường?
4. Nhiệt độ, độ ẩm, mưa, gió và bức xạ liên hệ với nhau thế nào?
5. Có thể nhóm các địa điểm theo đặc trưng khí hậu hay không?

---

## 7. Dashboard và module AI đề xuất

### Dashboard bắt buộc

1. **Vietnam Overview:** bản đồ, KPI và bộ lọc thời gian/chỉ số.
2. **Climate Explorer:** chuỗi thời gian, heatmap mùa vụ và so sánh địa điểm.
3. **Extreme Events:** phát hiện và khám phá các giá trị cực đoan.
4. **Relationship Lab:** scatter plot, correlation matrix và phân nhóm.
5. **AI Analyst:** tạo phân tích mới theo yêu cầu người dùng.

### Luồng AI bắt buộc

```text
Câu hỏi người dùng
-> AI nhận schema và metadata
-> AI trả về SQL/Python + giải thích
-> Giao diện hiển thị trạng thái chờ phê duyệt
-> Người dùng xem/chỉnh sửa/từ chối
-> Validator chặn thao tác ghi dữ liệu
-> Code được phê duyệt chạy local
-> Trả bảng/biểu đồ và lưu logs
```

### Câu hỏi AI kiểm thử

- “So sánh lượng mưa giữa Đà Nẵng và Thành phố Hồ Chí Minh theo mùa.”
- “Tìm các tháng có nhiệt độ bất thường tại Hà Nội.”
- “Nhóm các địa điểm có đặc điểm khí hậu tương đồng.”
- “Kiểm tra quan hệ giữa độ ẩm và lượng mưa ở ba miền.”

---

## 8. Rủi ro của đề tài được chọn

| Rủi ro | Xác suất | Tác động | Mức | Phương án giảm thiểu |
|---|---:|---:|---:|---|
| Diễn giải dữ liệu tái phân tích như số đo trạm | 3 | 4 | 12 - Cao | Ghi rõ bản chất dữ liệu và giới hạn trong dashboard/báo cáo |
| API thay đổi hoặc không truy cập khi demo | 2 | 4 | 8 - Trung bình | Lưu snapshot local và không gọi API trong demo |
| Chọn địa điểm không đại diện | 3 | 3 | 9 - Trung bình | Dùng tiêu chí chọn địa điểm theo vùng khí hậu và công bố rõ |
| Chỉ số cực đoan dẫn xuất thiếu căn cứ | 2 | 4 | 8 - Trung bình | Định nghĩa bằng ngưỡng/percentile rõ và kiểm chứng bằng code |
| AI sinh truy vấn sai hoặc nguy hiểm | 3 | 4 | 12 - Cao | Chỉ đọc, parser/validator, timeout và phê duyệt con người |
| Dashboard quá nhiều biểu đồ | 3 | 3 | 9 - Trung bình | Chốt câu hỏi trung tâm và giới hạn trang/tính năng |

Không có rủi ro nghiêm trọng chưa có phương án xử lý.

---

## 9. Điều kiện để nâng thành PHÊ DUYỆT

Đề tài chỉ được nâng từ `PHÊ DUYỆT CÓ ĐIỀU KIỆN` thành `PHÊ DUYỆT` khi hoàn thành:

| Điều kiện | Bằng chứng cần có | Hạn đề xuất |
|---|---|---|
| Xác nhận điều khoản và attribution của mọi nguồn | Hồ sơ nguồn và trích dẫn | Cuối ngày 1 |
| Tải dữ liệu tối thiểu 20 địa điểm trong ít nhất một năm | Snapshot và script tải | Cuối ngày 1 |
| Xác minh số dòng sau làm sạch và ít nhất 7 biến độc lập | Data profile và data dictionary | Cuối ngày 1 |
| Đánh giá missing, duplicate, outlier và đơn vị | Báo cáo chất lượng bằng code | Cuối ngày 1 |
| Tạo ba biểu đồ thử nghiệm | Bản đồ/phân bố, xu hướng, quan hệ biến | Cuối ngày 1 |
| Viết ba insight có số liệu làm bằng chứng | Tài liệu insight thử nghiệm | Cuối ngày 1 |
| Thử hai yêu cầu AI sinh code chỉ đọc | Prompt, code, giải thích và kết quả | Cuối ngày 2 |
| Chứng minh có thể tạo snapshot và chạy local | Parquet/DuckDB và lệnh tái tạo | Cuối ngày 2 |

Nếu dữ liệu không tạo được ba insight có ý nghĩa hoặc không vượt các gate bắt buộc,
chuyển sang đề tài dự phòng **Bản đồ đa dạng sinh học Việt Nam**.

---

## 10. Quyết định cuối của người đề xuất

- [ ] PHÊ DUYỆT
- [x] **PHÊ DUYỆT CÓ ĐIỀU KIỆN**
- [ ] KHÔNG PHÊ DUYỆT

### Lý do

**Vietnam Climate Pulse** có sự cân bằng tốt nhất giữa chất lượng dữ liệu, khả năng
phân tích, trực quan hóa, giá trị của AI và tính khả thi trong 14 ngày. Đề tài không
phải phương án có hiệu ứng trình diễn lớn nhất tuyệt đối, nhưng là phương án có xác
suất cao nhất để tạo ra một sản phẩm hoàn chỉnh, minh bạch và đạt mọi yêu cầu của đề
bài.

### Đề tài dự phòng

**BioMap Vietnam: Khám phá dữ liệu ghi nhận loài**, chỉ sử dụng nếu spike khí hậu
không đáp ứng điều kiện phê duyệt cuối.
