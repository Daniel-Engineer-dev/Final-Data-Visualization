# Tiêu chí phê duyệt đề tài dựa trên nguồn dữ liệu

> **Mục đích:** Tài liệu này là cổng phê duyệt chính thức trước khi triển khai một đề tài đồ án Trực quan hóa dữ liệu.  
> **Nguyên tắc:** Không phê duyệt đề tài chỉ vì chủ đề hấp dẫn. Đề tài chỉ được phê duyệt khi dữ liệu đủ tin cậy, khả thi, có giá trị phân tích, hỗ trợ dashboard tương tác và phù hợp với yêu cầu tích hợp AI.  
> **Kết quả cuối cùng:** `PHÊ DUYỆT`, `PHÊ DUYỆT CÓ ĐIỀU KIỆN`, hoặc `KHÔNG PHÊ DUYỆT`.

---

## 1. Thông tin đề xuất

Điền đầy đủ trước khi bắt đầu đánh giá.

| Trường | Nội dung |
|---|---|
| Tên đề tài đề xuất | |
| Câu hỏi trung tâm | |
| Người dùng mục tiêu | |
| Quyết định/hành động dashboard hỗ trợ | |
| Nguồn dữ liệu chính | |
| Nguồn dữ liệu bổ sung | |
| Người đánh giá | |
| Ngày đánh giá | |
| Phiên bản dữ liệu được đánh giá | |

### Tóm tắt đề tài trong một câu

> Dashboard giúp **[đối tượng sử dụng]** hiểu hoặc quyết định **[vấn đề]** bằng cách phân tích **[dữ liệu]** trong phạm vi **[không gian/thời gian tại Việt Nam]**.

Nếu không thể viết câu trên một cách cụ thể, đề tài chưa đủ rõ để phê duyệt.

---

## 2. Quy trình phê duyệt

Thực hiện theo đúng thứ tự:

1. Kiểm tra điều kiện loại trực tiếp tại Mục 3.
2. Thu thập bộ dữ liệu mẫu và bằng chứng theo Mục 4.
3. Chấm từng nguồn dữ liệu theo Mục 5.
4. Chấm tính khả thi của đề tài tổng thể theo Mục 6.
5. Kiểm tra khả năng đáp ứng yêu cầu dashboard và AI tại Mục 7.
6. Ghi rủi ro, điều kiện phê duyệt và quyết định tại Mục 10.

Không được chấm điểm dựa trên mô tả hoặc lời hứa của nguồn dữ liệu. Mọi nhận định quan trọng phải có bằng chứng kiểm chứng được.

---

## 3. Điều kiện bắt buộc và tiêu chí loại trực tiếp

Đánh dấu `Đạt` hoặc `Không đạt`. Chỉ cần một tiêu chí loại trực tiếp không đạt thì đề tài **không được phê duyệt**, bất kể tổng điểm.

| Mã | Điều kiện bắt buộc | Cách kiểm chứng | Kết quả |
|---|---|---|---|
| G1 | Dữ liệu có liên quan rõ ràng đến Việt Nam | Có địa điểm, đối tượng, sự kiện hoặc phạm vi nghiên cứu tại Việt Nam | |
| G2 | Bộ dữ liệu phân tích dự kiến có ít nhất **2.000 dòng** | Chạy lệnh đếm trên dữ liệu sau khi làm sạch sơ bộ | |
| G3 | Có ít nhất **7 biến độc lập có ý nghĩa phân tích** | Lập data dictionary; không tính ID kỹ thuật, cột rỗng hoặc bản sao | |
| G4 | Có quyền sử dụng dữ liệu hợp pháp cho đồ án | Kiểm tra giấy phép, điều khoản sử dụng hoặc xác nhận công khai | |
| G5 | Dữ liệu có thể được tải và xử lý trong môi trường local | Tải thử và chạy pipeline mẫu thành công | |
| G6 | Có thể truy xuất hoặc lưu một bản dữ liệu ổn định để tái tạo kết quả | Có file snapshot, phiên bản, checksum hoặc ngày truy cập | |
| G7 | Không phụ thuộc hoàn toàn vào dữ liệu cá nhân nhạy cảm hoặc dữ liệu không được phép công bố | Kiểm tra schema, điều khoản và nội dung mẫu | |
| G8 | Có đủ thông tin để giải thích ý nghĩa các biến quan trọng | Có metadata, tài liệu chính thức hoặc định nghĩa đáng tin cậy | |
| G9 | Dữ liệu thực sự hỗ trợ ít nhất một câu hỏi phân tích có giá trị | Tạo được ít nhất một insight thử nghiệm có bằng chứng | |
| G10 | Nhóm có thể hoàn thành pipeline, dashboard, AI và báo cáo trong 14 ngày | Hoàn thành spike dữ liệu và ước lượng công việc | |

### Các trường hợp tự động không phê duyệt

- Không xác định được nguồn gốc dữ liệu.
- Dữ liệu được tạo ngẫu nhiên hoặc tổng hợp nhưng được trình bày như dữ liệu thực.
- Không thể tải dữ liệu hoặc API không thể truy cập sau nhiều lần kiểm tra.
- Dữ liệu vi phạm giấy phép, quyền riêng tư hoặc điều khoản sử dụng.
- Phải nhập thủ công phần lớn dữ liệu mới đạt 2.000 dòng.
- Bảy biến được tạo bằng cách sao chép hoặc biến đổi hình thức từ một biến duy nhất nhưng không có ý nghĩa phân tích mới.
- Chủ đề chỉ cho phép mô tả đơn giản, không hỗ trợ xu hướng, quan hệ biến hoặc insight chuyên môn.
- AI không thể phân tích dữ liệu mà chỉ có thể trả lời kiến thức chung ngoài dữ liệu.
- Không có phương án tái tạo kết quả nếu nguồn trực tuyến thay đổi hoặc ngừng hoạt động.

**Kết luận Gate bắt buộc:** `ĐẠT / KHÔNG ĐẠT`

---

## 4. Hồ sơ bằng chứng bắt buộc

Một đề tài chỉ được đưa vào chấm điểm khi có đủ các bằng chứng sau:

| Mã | Bằng chứng | Nội dung tối thiểu | Đã có |
|---|---|---|---|
| E1 | Liên kết và thông tin nhà cung cấp | URL, tổ chức, mô tả nguồn, giấy phép | |
| E2 | Bộ dữ liệu mẫu | Tối thiểu 500 dòng hoặc toàn bộ dữ liệu nếu nhỏ hơn | |
| E3 | Hồ sơ dữ liệu | Số dòng/cột, kiểu dữ liệu, tỷ lệ thiếu, số giá trị duy nhất | |
| E4 | Data dictionary sơ bộ | Tên biến, ý nghĩa, đơn vị, nguồn, miền giá trị | |
| E5 | Báo cáo chất lượng sơ bộ | Thiếu, trùng lặp, ngoại lệ, lỗi định dạng, tính nhất quán | |
| E6 | Ba biểu đồ thử nghiệm | Tổng quan/phân bố, xu hướng hoặc không gian, quan hệ biến | |
| E7 | Ba insight thử nghiệm | Mỗi insight có số liệu hoặc biểu đồ làm bằng chứng | |
| E8 | Hai truy vấn AI thử nghiệm | Câu hỏi, code/truy vấn dự kiến và kết quả mong muốn | |
| E9 | Ước lượng pipeline | Các bước tải, làm sạch, kết hợp, cập nhật và lưu trữ | |
| E10 | Danh sách rủi ro | Rủi ro dữ liệu, kỹ thuật, pháp lý và kế hoạch dự phòng | |

Nếu thiếu bất kỳ bằng chứng nào từ `E1` đến `E7`, chưa được ra quyết định `PHÊ DUYỆT`.

---

## 5. Rubric đánh giá từng nguồn dữ liệu

### Cách chấm điểm

Mỗi tiêu chí được chấm từ `0` đến `5`:

| Điểm | Ý nghĩa |
|---:|---|
| 0 | Không có bằng chứng hoặc hoàn toàn không đáp ứng |
| 1 | Rất yếu; rủi ro nghiêm trọng; khó khắc phục |
| 2 | Yếu; cần thay đổi lớn hoặc nguồn bổ sung quan trọng |
| 3 | Đạt mức tối thiểu; có rủi ro nhưng kiểm soát được |
| 4 | Tốt; bằng chứng rõ; ít rủi ro |
| 5 | Xuất sắc; minh bạch, ổn định và hỗ trợ phân tích mạnh |

Điểm quy đổi của tiêu chí:

```text
Điểm quy đổi = Điểm đánh giá / 5 × Trọng số
```

### 5.1. Độ tin cậy và nguồn gốc — 15 điểm

| Mã | Tiêu chí | Trọng số | Hướng dẫn chấm |
|---|---|---:|---|
| S1 | Uy tín của đơn vị cung cấp | 5 | Ưu tiên cơ quan nhà nước, tổ chức nghiên cứu, tổ chức quốc tế hoặc nhà cung cấp có phương pháp rõ ràng |
| S2 | Tính minh bạch của phương pháp thu thập | 4 | Có mô tả cách đo, lấy mẫu, tổng hợp hoặc mô hình hóa |
| S3 | Khả năng truy xuất nguồn gốc | 3 | Có URL, tác giả, phiên bản, ngày phát hành và lịch sử cập nhật |
| S4 | Khả năng kiểm chứng chéo | 3 | Có thể so sánh với nguồn độc lập hoặc tài liệu chính thức |

**Điểm nguồn gốc:** `____ / 15`

Ghi chú và bằng chứng:

> 

### 5.2. Pháp lý, đạo đức và quyền riêng tư — 10 điểm

| Mã | Tiêu chí | Trọng số | Hướng dẫn chấm |
|---|---|---:|---|
| L1 | Giấy phép và quyền sử dụng | 4 | Điều khoản cho phép tải, phân tích, trình bày và chia sẻ kết quả |
| L2 | Quyền riêng tư | 3 | Không lộ dữ liệu cá nhân nhạy cảm; có ẩn danh khi cần |
| L3 | Rủi ro gây hại hoặc diễn giải sai | 3 | Có thể giải thích giới hạn, thiên lệch và tránh kết luận gây hại |

**Điểm pháp lý và đạo đức:** `____ / 10`

Ghi chú và bằng chứng:

> 

### 5.3. Quy mô và cấu trúc dữ liệu — 15 điểm

| Mã | Tiêu chí | Trọng số | Hướng dẫn chấm |
|---|---|---:|---|
| D1 | Số dòng hữu dụng sau làm sạch | 4 | Không chỉ đạt 2.000 dòng thô; cần đủ dòng sau loại lỗi |
| D2 | Số biến độc lập có ý nghĩa | 4 | Có ít nhất 7 biến hỗ trợ các góc nhìn khác nhau |
| D3 | Độ chi tiết của đơn vị quan sát | 3 | Mỗi dòng đại diện cho một đối tượng/thời điểm/sự kiện rõ ràng |
| D4 | Khả năng liên kết dữ liệu | 2 | Có khóa hoặc thuộc tính để kết hợp nguồn bổ sung |
| D5 | Định dạng và schema | 2 | CSV, JSON, Parquet, database hoặc API có cấu trúc ổn định |

**Điểm quy mô và cấu trúc:** `____ / 15`

Ghi chú và bằng chứng:

> 

### 5.4. Chất lượng dữ liệu — 15 điểm

| Mã | Tiêu chí | Trọng số | Hướng dẫn chấm |
|---|---|---:|---|
| Q1 | Mức độ đầy đủ | 4 | Tỷ lệ thiếu thấp hoặc có chiến lược xử lý hợp lý |
| Q2 | Tính chính xác và hợp lệ | 3 | Giá trị nằm trong miền hợp lý; đơn vị và kiểu dữ liệu đúng |
| Q3 | Tính nhất quán | 3 | Tên địa phương, thời gian, mã định danh và đơn vị nhất quán |
| Q4 | Trùng lặp và ngoại lệ | 3 | Có thể nhận diện, giải thích và xử lý |
| Q5 | Mức độ thiên lệch và đại diện | 2 | Phạm vi dữ liệu phù hợp với kết luận dự kiến |

**Điểm chất lượng:** `____ / 15`

#### Ngưỡng cảnh báo chất lượng

- Tỷ lệ thiếu trên 30% ở một biến cốt lõi: tối đa 2/5 cho `Q1`.
- Không xác định được đơn vị của biến cốt lõi: tối đa 1/5 cho `Q2`.
- Không có cách phân biệt bản ghi trùng: tối đa 2/5 cho `Q4`.
- Dữ liệu chỉ đại diện cho một nhóm nhỏ nhưng đề tài muốn kết luận toàn Việt Nam: tối đa 1/5 cho `Q5`.

Ghi chú và bằng chứng:

> 

### 5.5. Phạm vi Việt Nam và giá trị chuyên môn — 10 điểm

| Mã | Tiêu chí | Trọng số | Hướng dẫn chấm |
|---|---|---:|---|
| V1 | Mức độ liên quan đến Việt Nam | 4 | Ngữ cảnh Việt Nam là cốt lõi, không chỉ được thêm làm nhãn |
| V2 | Giá trị xã hội/chuyên môn | 3 | Kết quả có ý nghĩa đối với người dùng hoặc lĩnh vực cụ thể |
| V3 | Khả năng đưa ra kết luận có trách nhiệm | 3 | Có nền tảng để giải thích kết quả và giới hạn |

**Điểm phạm vi và giá trị:** `____ / 10`

Ghi chú và bằng chứng:

> 

### 5.6. Tiềm năng phân tích — 15 điểm

| Mã | Tiêu chí | Trọng số | Hướng dẫn chấm |
|---|---|---:|---|
| A1 | Khả năng phân tích phân bố và so sánh | 3 | Có nhóm, danh mục, địa điểm hoặc đối tượng để so sánh |
| A2 | Khả năng phân tích xu hướng/thay đổi | 3 | Có thời gian, phiên bản hoặc thứ tự quan sát có ý nghĩa |
| A3 | Khả năng phân tích quan hệ giữa biến | 3 | Có nhiều biến định lượng/định tính liên quan |
| A4 | Khả năng phát hiện ngoại lệ hoặc mẫu hình | 3 | Có độ chi tiết đủ để tìm điểm bất thường hoặc phân nhóm |
| A5 | Khả năng tạo insight chuyên môn | 3 | Insight vượt qua việc chỉ đọc giá trị lớn nhất/nhỏ nhất |

**Điểm tiềm năng phân tích:** `____ / 15`

#### Điều kiện tối thiểu

Nguồn dữ liệu chính phải hỗ trợ ít nhất:

- Một phân tích tổng quan hoặc so sánh.
- Một phân tích xu hướng/thay đổi hoặc không gian.
- Một phân tích quan hệ giữa các biến.
- Ba insight thử nghiệm có thể kiểm chứng.

Ghi chú và bằng chứng:

> 

### 5.7. Tiềm năng trực quan hóa và tương tác — 10 điểm

| Mã | Tiêu chí | Trọng số | Hướng dẫn chấm |
|---|---|---:|---|
| Z1 | Đa dạng biểu đồ phù hợp | 3 | Hỗ trợ nhiều loại biểu đồ có mục đích, không lặp lại hình thức |
| Z2 | Khả năng tạo biểu đồ liên kết | 3 | Có chiều dữ liệu dùng chung để cross-filter/highlight/drill-down |
| Z3 | Khả năng tạo bộ lọc hữu ích | 2 | Có các bộ lọc thời gian, địa lý, nhóm hoặc chỉ số |
| Z4 | Khả năng kể câu chuyện dữ liệu | 2 | Có luồng từ tổng quan đến chi tiết và kết luận |

**Điểm trực quan hóa:** `____ / 10`

Ghi chú và bằng chứng:

> 

### 5.8. Khả năng tích hợp AI — 5 điểm

| Mã | Tiêu chí | Trọng số | Hướng dẫn chấm |
|---|---|---:|---|
| I1 | Schema có thể mô tả cho AI | 1 | Tên biến, kiểu, đơn vị và ý nghĩa đủ rõ |
| I2 | AI có thể sinh phân tích mới dựa trên dữ liệu | 2 | Có thể tạo SQL/Python chỉ đọc cho câu hỏi ngoài dashboard cố định |
| I3 | Kết quả AI có thể kiểm chứng | 1 | Code và kết quả có thể xem, chỉnh sửa và đối chiếu |
| I4 | Có thể bảo vệ dữ liệu gốc | 1 | Cho phép thực thi local, chỉ đọc và lưu logs |

**Điểm tích hợp AI:** `____ / 5`

Ghi chú và bằng chứng:

> 

### 5.9. Khả năng tiếp cận, tái tạo và vận hành — 5 điểm

| Mã | Tiêu chí | Trọng số | Hướng dẫn chấm |
|---|---|---:|---|
| O1 | Khả năng tải và cập nhật | 2 | Có API/file ổn định; không yêu cầu thao tác thủ công phức tạp |
| O2 | Khả năng tái tạo | 2 | Có snapshot, script, phiên bản và hướng dẫn |
| O3 | Hiệu năng local | 1 | Kích thước và định dạng phù hợp để phân tích trong demo |

**Điểm vận hành:** `____ / 5`

Ghi chú và bằng chứng:

> 

### Tổng điểm nguồn dữ liệu

| Nhóm tiêu chí | Điểm tối đa | Điểm đạt |
|---|---:|---:|
| Độ tin cậy và nguồn gốc | 15 | |
| Pháp lý, đạo đức và quyền riêng tư | 10 | |
| Quy mô và cấu trúc | 15 | |
| Chất lượng dữ liệu | 15 | |
| Phạm vi Việt Nam và giá trị chuyên môn | 10 | |
| Tiềm năng phân tích | 15 | |
| Tiềm năng trực quan hóa và tương tác | 10 | |
| Khả năng tích hợp AI | 5 | |
| Khả năng tiếp cận, tái tạo và vận hành | 5 | |
| **Tổng cộng** | **100** | **____** |

---

## 6. Đánh giá đề tài tổng thể khi sử dụng nhiều nguồn

Một nguồn tốt chưa đảm bảo đề tài khả thi. Nếu sử dụng nhiều nguồn, đánh giá thêm:

| Mã | Tiêu chí tích hợp | Đạt/Không đạt | Bằng chứng |
|---|---|---|---|
| M1 | Có nguồn chính đủ mạnh ngay cả khi nguồn bổ sung thất bại | | |
| M2 | Có khóa kết hợp đáng tin cậy giữa các nguồn | | |
| M3 | Địa danh, thời gian và đơn vị có thể chuẩn hóa | | |
| M4 | Không tạo ra nhiều giá trị thiếu sau phép join | | |
| M5 | Giấy phép giữa các nguồn không xung đột | | |
| M6 | Pipeline kết hợp có thể chạy lại local | | |
| M7 | Kết quả sau kết hợp vẫn có ý nghĩa chuyên môn | | |

Nếu `M1`, `M2`, `M3`, `M5` hoặc `M6` không đạt, đề tài tối đa chỉ được `PHÊ DUYỆT CÓ ĐIỀU KIỆN`.

### Ma trận nguồn dữ liệu

| Nguồn | Vai trò | Điểm /100 | Nếu nguồn thất bại | Nguồn thay thế |
|---|---|---:|---|---|
| Nguồn chính | | | | |
| Nguồn bổ sung 1 | | | | |
| Nguồn bổ sung 2 | | | | |

---

## 7. Kiểm tra khả năng đáp ứng đầy đủ đề bài

### 7.1. Dashboard và phân tích

| Yêu cầu đề bài | Dữ liệu hỗ trợ bằng cách nào? | Bằng chứng mẫu | Đạt |
|---|---|---|---|
| Dashboard phân tích dữ liệu Việt Nam | | | |
| Nguồn dữ liệu đáng tin cậy và minh bạch | | | |
| Biểu đồ phù hợp với mục đích và đối tượng | | | |
| Truyền đạt thông điệp rõ ràng, dễ hiểu | | | |
| Nhiều biểu đồ/đồ thị có liên kết | | | |
| Tương tác và điều hướng dễ sử dụng | | | |
| Thiết kế hấp dẫn, màu sắc có ý nghĩa | | | |
| Thể hiện thay đổi và xu hướng theo thời gian | | | |
| Thể hiện mối quan hệ giữa các biến | | | |
| Có kết luận và insight chuyên môn liên quan | | | |

### 7.2. Tích hợp AI

| Yêu cầu AI | Dữ liệu/hệ thống hỗ trợ bằng cách nào? | Rủi ro | Đạt |
|---|---|---|---|
| AI đề xuất ý tưởng phân tích | | | |
| AI sinh code theo yêu cầu người dùng | | | |
| AI chỉ sử dụng số liệu/hình ảnh do người dùng cung cấp | | | |
| Code AI được hiển thị rõ ràng | | | |
| Code AI có giải thích bằng ngôn ngữ tự nhiên | | | |
| Người dùng có thể chỉnh sửa hoặc từ chối code | | | |
| Code chỉ chạy local sau khi được phê duyệt | | | |
| AI không thay đổi dữ liệu gốc | | | |
| Lưu prompt, code, kết quả và giải thích | | | |
| AI đủ linh hoạt cho câu hỏi trong buổi vấn đáp | | | |

Nếu bất kỳ yêu cầu AI cốt lõi nào không thể triển khai với nguồn dữ liệu, đề tài chưa đủ điều kiện phê duyệt.

---

## 8. Spike kiểm chứng bắt buộc

Thực hiện spike tối đa một ngày trước khi phê duyệt.

### 8.1. Kiểm tra dữ liệu bằng code

Ghi lại kết quả thực tế:

| Chỉ số | Kết quả |
|---|---:|
| Số dòng thô | |
| Số dòng sau làm sạch sơ bộ | |
| Số cột tổng cộng | |
| Số biến độc lập có ý nghĩa | |
| Số biến định lượng | |
| Số biến định tính | |
| Số biến thời gian | |
| Số biến địa lý | |
| Tỷ lệ thiếu trung bình | |
| Tỷ lệ thiếu lớn nhất ở biến cốt lõi | |
| Số bản ghi trùng | |
| Kích thước dữ liệu | |
| Thời gian tải và xử lý mẫu | |

### 8.2. Ba biểu đồ bắt buộc

| Biểu đồ thử nghiệm | Câu hỏi trả lời | Insight thu được | Có giá trị |
|---|---|---|---|
| Biểu đồ 1: tổng quan/phân bố | | | |
| Biểu đồ 2: thời gian/không gian | | | |
| Biểu đồ 3: quan hệ giữa biến | | | |

### 8.3. Hai truy vấn AI bắt buộc

| Câu hỏi người dùng | Code/truy vấn cần sinh | Có thể kiểm chứng | Có thể chạy chỉ đọc local |
|---|---|---|---|
| Câu hỏi chuẩn | | | |
| Câu hỏi ngoài dự kiến | | | |

### 8.4. Kết luận spike

- Dữ liệu có thể tải và xử lý lại: `Có / Không`
- Dữ liệu đủ yêu cầu tối thiểu: `Có / Không`
- Có ít nhất ba insight có ý nghĩa: `Có / Không`
- Có thể xây dashboard liên kết: `Có / Không`
- Có thể xây luồng AI phê duyệt và thực thi local: `Có / Không`
- Có nguồn hoặc snapshot dự phòng: `Có / Không`

---

## 9. Đánh giá rủi ro và phương án dự phòng

Chấm `Xác suất` và `Tác động` từ 1 đến 5.

```text
Mức rủi ro = Xác suất × Tác động

1–5: Thấp
6–10: Trung bình
11–15: Cao
16–25: Nghiêm trọng
```

| Rủi ro | Xác suất | Tác động | Mức rủi ro | Phương án giảm thiểu | Người phụ trách |
|---|---:|---:|---:|---|---|
| Nguồn ngừng hoạt động hoặc đổi schema | | | | | |
| Dữ liệu thiếu hoặc chất lượng thấp | | | | | |
| Không thể kết hợp các nguồn | | | | | |
| Không tạo được insight đủ mạnh | | | | | |
| Dashboard quá chậm | | | | | |
| AI sinh code sai hoặc nguy hiểm | | | | | |
| Vi phạm giấy phép/quyền riêng tư | | | | | |
| Không hoàn thành trong 14 ngày | | | | | |

### Quy tắc rủi ro

- Có rủi ro pháp lý/quyền riêng tư mức `Cao` hoặc `Nghiêm trọng`: `KHÔNG PHÊ DUYỆT`.
- Có rủi ro dữ liệu cốt lõi mức `Nghiêm trọng` mà không có nguồn dự phòng: `KHÔNG PHÊ DUYỆT`.
- Có từ ba rủi ro mức `Cao` trở lên: tối đa `PHÊ DUYỆT CÓ ĐIỀU KIỆN`.

---

## 10. Quy tắc ra quyết định

### PHÊ DUYỆT

Chỉ chọn khi đáp ứng tất cả:

- Toàn bộ điều kiện bắt buộc `G1–G10` đạt.
- Có đầy đủ bằng chứng `E1–E10`.
- Nguồn dữ liệu chính đạt ít nhất **80/100**.
- Không nhóm tiêu chí nào tại Mục 5 dưới **60% số điểm tối đa**.
- Tất cả yêu cầu dashboard và AI cốt lõi tại Mục 7 có phương án khả thi.
- Spike xác nhận dữ liệu tạo được ít nhất ba insight có ý nghĩa.
- Không có rủi ro nghiêm trọng chưa được xử lý.
- Có thể hoàn thành phạm vi bắt buộc trong 14 ngày.

### PHÊ DUYỆT CÓ ĐIỀU KIỆN

Chọn khi:

- Toàn bộ điều kiện bắt buộc đạt.
- Tổng điểm từ **70 đến dưới 80**; hoặc
- Thiếu bằng chứng không cốt lõi; hoặc
- Có rủi ro cao nhưng có phương án xử lý rõ ràng trong thời hạn ngắn.

Mọi điều kiện phải có người phụ trách và hạn hoàn thành. Nếu không hoàn thành đúng hạn, quyết định tự động chuyển thành `KHÔNG PHÊ DUYỆT`.

### KHÔNG PHÊ DUYỆT

Chọn khi xảy ra một trong các trường hợp:

- Có điều kiện bắt buộc không đạt.
- Nguồn dữ liệu chính dưới **70/100**.
- Một nhóm tiêu chí tại Mục 5 dưới **40% số điểm tối đa**.
- Không chứng minh được quyền sử dụng dữ liệu.
- Không đạt 2.000 dòng hoặc 7 biến độc lập có ý nghĩa.
- Không thể tạo ba insight thử nghiệm.
- Không hỗ trợ phân tích xu hướng/thay đổi và quan hệ giữa các biến.
- Không thể triển khai AI minh bạch, chờ phê duyệt và chạy local.
- Rủi ro vượt quá khả năng xử lý trong 14 ngày.

---

## 11. Biên bản quyết định

### Kết quả tổng hợp

| Nội dung | Kết quả |
|---|---|
| Gate bắt buộc | `Đạt / Không đạt` |
| Điểm nguồn dữ liệu chính | `____ / 100` |
| Điểm nguồn bổ sung thấp nhất | `____ / 100` |
| Số yêu cầu dashboard chưa có bằng chứng | |
| Số yêu cầu AI chưa có phương án | |
| Số rủi ro cao/nghiêm trọng | |
| Kết quả spike | `Đạt / Không đạt` |

### Quyết định

- [ ] **PHÊ DUYỆT**
- [ ] **PHÊ DUYỆT CÓ ĐIỀU KIỆN**
- [ ] **KHÔNG PHÊ DUYỆT**

### Lý do quyết định

> 

### Điều kiện phải hoàn thành

| Điều kiện | Người phụ trách | Hạn hoàn thành | Bằng chứng cần nộp | Trạng thái |
|---|---|---|---|---|
| | | | | |

### Phạm vi được phê duyệt

- Nguồn dữ liệu được phép sử dụng:
- Phạm vi thời gian:
- Phạm vi địa lý:
- Các câu hỏi phân tích chính:
- Các tính năng dashboard bắt buộc:
- Các tính năng AI bắt buộc:
- Nội dung không thuộc phạm vi:

### Xác nhận

| Vai trò | Họ tên | Quyết định | Ngày |
|---|---|---|---|
| Người đánh giá dữ liệu | | | |
| Đại diện nhóm dự án | | | |
| Người phê duyệt cuối | | | |

---

## 12. Checklist nhanh trước khi ký duyệt

- [ ] Chủ đề có ngữ cảnh Việt Nam rõ ràng.
- [ ] Dữ liệu sau làm sạch có ít nhất 2.000 dòng.
- [ ] Có ít nhất 7 biến độc lập có ý nghĩa.
- [ ] Nguồn và phương pháp thu thập đáng tin cậy.
- [ ] Có quyền sử dụng và trình bày dữ liệu.
- [ ] Có snapshot hoặc cách tái tạo dữ liệu.
- [ ] Data dictionary giải thích được các biến cốt lõi.
- [ ] Chất lượng dữ liệu đã được đo bằng code.
- [ ] Có ít nhất ba biểu đồ thử nghiệm phù hợp.
- [ ] Có ít nhất ba insight có bằng chứng.
- [ ] Có thể phân tích thay đổi/xu hướng.
- [ ] Có thể phân tích mối quan hệ giữa các biến.
- [ ] Có thể xây biểu đồ liên kết và bộ lọc hữu ích.
- [ ] AI có thể sinh code phân tích mới dựa trên dữ liệu.
- [ ] Code AI có thể hiển thị, giải thích và chỉnh sửa.
- [ ] Code chỉ chạy local sau khi được phê duyệt.
- [ ] Dữ liệu gốc được bảo vệ và toàn bộ phiên AI được lưu log.
- [ ] Có phương án dự phòng nếu nguồn hoặc API thất bại.
- [ ] Phạm vi khả thi trong 14 ngày.
- [ ] Quyết định và điều kiện phê duyệt đã được ghi thành văn bản.

