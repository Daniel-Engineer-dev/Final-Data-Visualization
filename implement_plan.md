# Kế hoạch triển khai và phê duyệt đề tài

> Trạng thái: Bản nháp để nhóm và giảng viên xem xét.  
> Thời lượng dự kiến: 14 ngày.  
> Mục tiêu của tài liệu này là hỗ trợ lựa chọn đề tài, chưa mặc định phê duyệt bất kỳ chủ đề cụ thể nào.

## 1. Yêu cầu bắt buộc đã xác định

### Dữ liệu và trực quan hóa

- Dự án là một ứng dụng dashboard phân tích dữ liệu có ngữ cảnh Việt Nam.
- Dữ liệu có tối thiểu 7 biến độc lập và 2.000 dòng.
- Nguồn dữ liệu phải đáng tin cậy, được mô tả minh bạch và có kiểm tra chất lượng.
- Loại biểu đồ phải phù hợp với mục đích và đối tượng sử dụng.
- Dashboard cần rõ ràng, dễ hiểu, hấp dẫn, có nhiều biểu đồ liên kết và bộ lọc dễ dùng.
- Phân tích phải thể hiện xu hướng theo thời gian, quan hệ giữa các biến và kết luận chuyên môn liên quan.

### Tích hợp AI

- AI hỗ trợ đề xuất ý tưởng, sinh code theo yêu cầu và trình bày kết quả từ dữ liệu do người dùng cung cấp.
- AI không được tự ý thay đổi dữ liệu gốc hoặc thực thi ngầm.
- Mọi code do AI sinh phải được hiển thị rõ ràng kèm giải thích bằng ngôn ngữ tự nhiên.
- Code ở trạng thái chờ cho đến khi người dùng chỉnh sửa hoặc phê duyệt.
- Code chỉ được thực thi local sau khi người dùng phê duyệt.
- Hệ thống phải lưu yêu cầu, mã nguồn, kết quả phân tích và giải thích.
- Báo cáo phải tóm tắt quá trình sử dụng AI, kết quả, thay đổi đã thực hiện và nhận xét về AI.
- Module AI phải đủ linh hoạt để trả lời câu hỏi phân tích dữ liệu trong buổi vấn đáp.

## 2. Tiêu chí phê duyệt đề tài

Mỗi phương án đề tài được chấm theo thang 1–5 cho các tiêu chí sau:

| Tiêu chí | Trọng số | Câu hỏi đánh giá |
|---|---:|---|
| Giá trị câu chuyện | 20% | Đề tài có câu hỏi trung tâm rõ và kết luận hữu ích không? |
| Chất lượng dữ liệu | 20% | Nguồn có đáng tin, đủ biến, đủ dòng và dễ tái tạo không? |
| Tiềm năng trực quan | 20% | Có bản đồ, thời gian, so sánh và quan hệ đa biến phù hợp không? |
| Giá trị của AI | 15% | AI có tạo phân tích mới thực sự hữu ích hay chỉ là chatbot trang trí? |
| Khả thi trong 14 ngày | 15% | Nhóm có thể hoàn thành, kiểm thử và chuẩn bị demo đúng hạn không? |
| Tính khác biệt | 10% | Sản phẩm có điểm nhấn đáng nhớ so với dashboard thông thường không? |

**Điều kiện phê duyệt:** tổng điểm tối thiểu 75/100 và không tiêu chí nào dưới 3/5.

## 3. Các phương án nên đánh giá

| Phương án | Câu hỏi trung tâm | Điểm mạnh | Rủi ro chính |
|---|---|---|---|
| Khí hậu và thời tiết Việt Nam | Khí hậu thay đổi thế nào theo không gian, thời gian và vùng miền? | Dữ liệu dồi dào; bản đồ và chuỗi thời gian đẹp | Cần giải thích rõ dữ liệu mô hình/tái phân tích |
| Chất lượng không khí đô thị | Khi nào và ở đâu ô nhiễm nghiêm trọng, yếu tố nào liên quan? | Có ý nghĩa xã hội; AI phân tích nguyên nhân tốt | Dữ liệu lịch sử có thể thiếu hoặc không đồng đều |
| Du lịch Việt Nam | Mùa vụ và đặc điểm địa phương ảnh hưởng lượng khách thế nào? | Dễ kể chuyện; phù hợp người dùng phổ thông | Khó tìm bộ dữ liệu chi tiết, đồng nhất và trên 2.000 dòng |
| Kinh tế - xã hội cấp tỉnh | Các tỉnh khác nhau ra sao và hình thành nhóm phát triển nào? | Insight chính sách tốt; phù hợp clustering | Dữ liệu thường chỉ có ít dòng theo tỉnh/năm |
| Giao thông và tai nạn | Mẫu hình tai nạn thay đổi theo địa điểm, thời gian và điều kiện nào? | Bản đồ và phân tích rủi ro ấn tượng | Khả năng tiếp cận dữ liệu chi tiết là rủi ro lớn |

## 4. Spike kiểm chứng trước khi phê duyệt

Thực hiện một spike tối đa 1 ngày cho hai phương án có điểm cao nhất:

1. Tải thử dữ liệu và lập bảng data dictionary.
2. Xác minh số dòng, số biến, phạm vi thời gian, phạm vi địa lý và giấy phép.
3. Kiểm tra tỷ lệ thiếu, trùng lặp và tính nhất quán.
4. Tạo nhanh ba biểu đồ: xu hướng, bản đồ hoặc không gian, quan hệ hai biến.
5. Viết ba insight có thể kiểm chứng từ dữ liệu.
6. Thử hai câu hỏi AI và xác định code cần sinh để trả lời.
7. Chấm lại theo bảng tiêu chí và ghi quyết định phê duyệt.

## 5. Phạm vi sản phẩm sau khi phê duyệt

### Must have

- Pipeline thu thập/làm sạch dữ liệu có thể chạy lại.
- Dashboard gồm tổng quan, khám phá chi tiết và phân tích quan hệ.
- Các biểu đồ liên kết bằng bộ lọc chung.
- Module AI tạo code/truy vấn, giải thích, chờ phê duyệt rồi mới chạy local.
- Chỉ cho phép thao tác phân tích đọc dữ liệu; không sửa dữ liệu gốc.
- Nhật ký đầy đủ prompt, code, quyết định phê duyệt, kết quả và lỗi.
- Báo cáo LaTeX và kịch bản trình bày/vấn đáp.

### Should have

- Bản đồ Việt Nam hoặc biểu diễn không gian phù hợp.
- Lưu phiên phân tích và xuất kết quả.
- Câu hỏi gợi ý để hỗ trợ người dùng chưa biết nên phân tích gì.
- Kiểm thử các luồng AI quan trọng và các truy vấn nguy hiểm.

### Không ưu tiên trong 14 ngày

- Chatbot kiến thức tổng quát không dựa trên dữ liệu.
- Huấn luyện mô hình ngôn ngữ riêng.
- Hệ thống tài khoản/phân quyền phức tạp.
- Hạ tầng cloud production hoặc xử lý dữ liệu thời gian thực.

## 6. Kiến trúc tham chiếu

Kiến trúc cuối cùng có thể thay đổi theo đề tài, nhưng cần giữ các ranh giới sau:

```text
Nguồn dữ liệu
  -> pipeline thu thập/làm sạch
  -> dữ liệu phân tích local
  -> API truy vấn chỉ đọc
  -> dashboard tương tác

Yêu cầu người dùng
  -> API AI tạo đề xuất + code + giải thích
  -> giao diện xem/chỉnh sửa/phê duyệt
  -> bộ kiểm tra an toàn
  -> thực thi local
  -> kết quả trực quan + nhật ký
```

Stack tham chiếu: React/Next.js hoặc Streamlit; FastAPI; DuckDB/Parquet; Plotly/ECharts; SQLite cho logs. Nhóm chỉ chốt stack sau khi đánh giá kỹ năng thành viên và tốc độ triển khai.

## 7. Kế hoạch 14 ngày

| Ngày | Mục tiêu | Tiêu chí hoàn thành |
|---:|---|---|
| 1 | Chấm phương án, chạy spike, phê duyệt đề tài | Có decision record và bộ dữ liệu khả thi |
| 2 | Hoàn thiện pipeline thu thập dữ liệu | Có dữ liệu thô, metadata và hướng dẫn tái tạo |
| 3 | Làm sạch, kiểm tra chất lượng, tạo biến | Dataset đạt yêu cầu và có data dictionary |
| 4 | EDA và xây câu chuyện dữ liệu | Có câu hỏi phân tích và insight ban đầu |
| 5 | Wireframe, visual encoding và prototype | Luồng dashboard được nhóm duyệt |
| 6 | Xây lớp dữ liệu và API truy vấn | API lọc/tổng hợp hoạt động |
| 7 | Xây trang tổng quan | KPI, biểu đồ chính và bộ lọc hoạt động |
| 8 | Xây trang khám phá chi tiết | Biểu đồ liên kết và drill-down hoạt động |
| 9 | Xây phân tích nâng cao | Quan hệ đa biến và kết luận chuyên môn |
| 10 | Xây API AI sinh code + giải thích | Đề xuất AI hiển thị nhưng chưa tự chạy |
| 11 | Xây phê duyệt, kiểm tra an toàn và logs | Code chỉ chạy local sau phê duyệt |
| 12 | Tích hợp, tối ưu UI và xử lý lỗi | Luồng demo end-to-end ổn định |
| 13 | Kiểm thử, hoàn thiện báo cáo và vấn đáp | Có bằng chứng kiểm thử và báo cáo gần hoàn chỉnh |
| 14 | Tổng duyệt, sửa lỗi, đóng gói | Demo và bản dự phòng sẵn sàng |

## 8. Các cổng kiểm soát

- **Gate 1 - cuối ngày 1:** đề tài và dữ liệu được phê duyệt.
- **Gate 2 - cuối ngày 4:** dữ liệu sạch, đủ yêu cầu và có ít nhất ba insight.
- **Gate 3 - cuối ngày 9:** dashboard không AI đã hoàn chỉnh.
- **Gate 4 - cuối ngày 11:** luồng AI đúng nguyên tắc không thực thi ngầm.
- **Gate 5 - cuối ngày 13:** kiểm thử, báo cáo và kịch bản vấn đáp đạt yêu cầu.

Nếu không qua một gate, nhóm giảm tính năng `Should have` trước khi giảm chất lượng các yêu cầu bắt buộc.

## 9. Rủi ro và phương án giảm thiểu

| Rủi ro | Dấu hiệu sớm | Phương án |
|---|---|---|
| Dữ liệu không đủ tin cậy | Thiếu metadata, nhiều giá trị trống | Spike dữ liệu trước phê duyệt; giữ nguồn dự phòng |
| Đề tài rộng, thiếu câu chuyện | Nhiều biểu đồ nhưng không có kết luận | Chốt 3–5 câu hỏi phân tích trung tâm |
| AI sinh code nguy hiểm/sai | Có lệnh ghi dữ liệu hoặc truy vấn không chạy | Allowlist thao tác đọc, parser/validator, timeout và phê duyệt |
| Quá tải kỹ thuật | Dashboard chưa xong trước ngày 9 | Ưu tiên Must have, dùng stack nhóm quen thuộc |
| Demo phụ thuộc mạng/API | AI hoặc nguồn dữ liệu không phản hồi | Cache dữ liệu, lưu kịch bản và kết quả demo dự phòng |

## 10. Definition of Done

- Tất cả yêu cầu bắt buộc có bằng chứng trong sản phẩm hoặc báo cáo.
- Dữ liệu, pipeline và nguồn được mô tả đủ để tái tạo.
- Mọi biểu đồ đều có mục đích, nhãn, đơn vị và kết luận phù hợp.
- AI không tự ý sửa dữ liệu hoặc chạy code khi chưa phê duyệt.
- Có logs chứng minh toàn bộ luồng AI.
- Nhóm trả lời được câu hỏi về dữ liệu, thiết kế trực quan, insight, hạn chế và AI.

