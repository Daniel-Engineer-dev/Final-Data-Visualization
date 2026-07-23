# Script thuyết trình đầy đủ — Vietnam Climate Pulse (20 phút)

> Lời thoại verbatim — đọc gần như nguyên văn. Phần trong `[...]` là **thao tác trên app**, không đọc ra.
> Xưng "em" với thầy/cô. Nói chậm, rõ, canh giờ.

---

## ① MỞ ĐẦU — Trưởng nhóm (≈1,5 phút)

Em kính chào thầy/cô. Em là [tên], đại diện Nhóm 1. Hôm nay nhóm em xin trình bày đồ án cuối kỳ môn Trực quan hóa dữ liệu, với tên gọi **Vietnam Climate Pulse** — "Nhịp đập khí hậu Việt Nam".

Việt Nam là một trong những quốc gia chịu ảnh hưởng nặng nề nhất bởi biến đổi khí hậu, với nắng nóng gay gắt, hạn mặn và mưa lũ ngày càng thất thường. Tuy nhiên, dữ liệu khí tượng thô lại rất phức tạp và khó tiếp cận với người bình thường. Vì vậy, nhóm em xây dựng một dashboard giúp biến những con số khô khan thành tri thức khí hậu trực quan, dễ hiểu — đồng thời tích hợp một trợ lý AI cho phép hỏi dữ liệu bằng tiếng Việt.

Toàn bộ phần trình bày sẽ xoay quanh **bốn câu hỏi phân tích**: Thứ nhất, nhiệt độ ba miền Bắc – Trung – Nam khác nhau như thế nào? Thứ hai, mùa mưa dịch chuyển ra sao, và liệu có dấu hiệu nóng lên không? Thứ ba, bức xạ, nhiệt độ và lượng mưa có quan hệ vật lý gì với nhau? Và thứ tư, thiên tai cực đoan tập trung ở đâu, vào thời điểm nào?

Nhóm em gồm bốn thành viên. Bạn Việt trình bày tập dữ liệu và quy trình xử lý; bạn Đức và bạn Thế Vinh trình bày bốn màn hình phân tích của dashboard; bạn Quang Vinh trình bày phần tích hợp AI. Sau đây, em xin mời bạn Việt.

---

## ② TẬP DỮ LIỆU & TIỀN XỬ LÝ — Người 1 (≈3,5 phút)

Em cảm ơn. Em xin trình bày về tập dữ liệu.

Nguồn dữ liệu chính của nhóm là **Open-Meteo Historical Weather API**. Đây là dịch vụ dựa trên mô hình tái phân tích khí tượng **ERA5** của Trung tâm Dự báo Thời tiết châu Âu ECMWF — kết hợp mô hình khí hậu toàn cầu và quan trắc vệ tinh, nên độ tin cậy rất cao. Dữ liệu được cấp miễn phí theo giấy phép Creative Commons, hoàn toàn minh bạch và có thể trích dẫn.

Nhóm thu thập dữ liệu của **28 trạm** quan trắc trải đều khắp ba miền, trong **sáu năm** liên tục từ đầu năm 2020 đến hết năm 2025. Kết quả là bộ dữ liệu gồm **61.376 dòng** và **12 cột**: 5 cột định danh như ngày, địa điểm, vùng miền, kinh độ, vĩ độ; và **7 biến đo lường** thời tiết gồm nhiệt độ cao nhất, thấp nhất, trung bình, tổng lượng mưa, lượng mưa rào, tốc độ gió và bức xạ mặt trời.

So với yêu cầu của đề — tối thiểu 7 biến, 2000 dòng, và trên 50% dữ liệu liên quan Việt Nam — thì bộ dữ liệu của nhóm vượt xa: đủ 7 biến đo, hơn 61 nghìn dòng, và **100% là dữ liệu Việt Nam**.

Về quy trình xử lý [chỉ vào sơ đồ pipeline], nhóm xây dựng một pipeline tự động. Đầu tiên đọc danh sách tọa độ 28 trạm, sau đó gọi API cho từng trạm. Vì API giới hạn số lần truy cập, nhóm xử lý lỗi quá tải bằng cơ chế tự động chờ và lưu đệm dữ liệu gốc. Tiếp theo, dữ liệu thô được làm sạch, chuẩn hóa kiểu, gán nhãn vùng miền, rồi lưu dưới định dạng **Parquet** nén cột.

Về chất lượng, sau khi kiểm tra, bộ dữ liệu đạt **0% giá trị khuyết, 0% trùng lặp**, và mọi giá trị đều nằm trong miền hợp lệ — ví dụ nhiệt độ từ 4,5 đến 41,8 độ C, khớp hoàn toàn với thực tế khí hậu Việt Nam.

Cuối cùng, nhóm chọn kiến trúc **local-first**: dùng Parquet kết hợp DuckDB để truy vấn tệp trực tiếp, cực nhanh mà không cần máy chủ cơ sở dữ liệu cồng kềnh. Dữ liệu sạch này chính là nền cho dashboard mà bạn Đức trình bày ngay sau đây.

---

## ③ TAB TỔNG QUAN & KHÁM PHÁ — Người 2 (≈4 phút)

Em cảm ơn. Em xin demo trực tiếp trên ứng dụng.

[Mở tab **Tổng quan**] Đây là màn hình Tổng quan. Trung tâm là **bản đồ Việt Nam thật**, được vẽ từ dữ liệu địa lý GeoJSON, với 28 trạm hiển thị bằng các điểm. Màu sắc phân theo ba miền, còn kích thước điểm thể hiện nhiệt độ trung bình.

Điểm nổi bật là **tính tương tác**. [Click vào Hà Nội] Khi em nhấp vào một trạm, ví dụ Hà Nội, bảng thông tin bên phải lập tức cập nhật: nhiệt độ trung bình 24 độ, cao nhất từng ghi nhận hơn 40 độ, thấp nhất 6 độ, lượng mưa khoảng 2.200 mm mỗi năm. Đây là ví dụ về sự liên kết giữa các thành phần trong dashboard.

Phía trên là các chỉ số tổng: 28 trạm, hơn 61 nghìn bản ghi, 6 năm. Phía dưới, nhóm rút ra vài kết luận chính: nơi nóng nhất là Thành phố Hồ Chí Minh với 27,5 độ, mát nhất là Đà Lạt 18,9 độ — chênh nhau tới gần 9 độ; mưa nhiều nhất là Huế, khô nhất là Phan Thiết.

[Chuyển tab **Khám phá khí hậu**] Màn hình thứ hai đi sâu vào xu hướng theo thời gian. Em có thể chọn từng trạm hoặc xem toàn quốc bằng ô chọn này. [Chỉ biểu đồ đường] Biểu đồ chu kỳ nhiệt độ theo tháng có dạng hình chuông, đỉnh vào mùa hè; ba đường thể hiện nhiệt độ cao nhất, trung bình và thấp nhất.

[Chỉ biểu đồ cột] Lượng mưa theo tháng dùng biểu đồ cột, phù hợp với dữ liệu tích lũy.

[Chỉ biểu đồ xu hướng năm] Một điểm nhóm muốn trung thực: biểu đồ xu hướng nhiệt độ theo năm cho thấy nhiệt độ chỉ dao động quanh 25 độ, chứ **không tăng đơn điệu**. Sáu năm là quá ngắn để kết luận về nóng lên toàn cầu, nên nhóm không cường điệu số liệu.

[Chỉ heatmap] Cuối cùng, ma trận nhiệt độ Tháng nhân Năm giúp phát hiện nhanh những tháng nóng bất thường — như tháng 4 năm 2024. Mọi biểu đồ đều có nút phóng to và tooltip đồng bộ khi rê chuột. Em xin mời bạn Thế Vinh trình bày hai màn hình tiếp theo.

---

## ④ TAB CỰC ĐOAN & TƯƠNG QUAN — Người 3 (≈4 phút)

Em cảm ơn. [Mở tab **Thời tiết cực đoan**] Màn hình thứ ba là Thời tiết cực đoan.

Điểm mạnh ở đây là **hai thanh trượt ngưỡng**. [Kéo thử thanh trượt] Khi em kéo ngưỡng nắng nóng hay mưa lớn, toàn bộ dữ liệu được tải lại động từ backend theo thời gian thực. Với ngưỡng mặc định 38 độ và 100 mm, hệ thống ghi nhận **302 ngày nắng nóng** cực đoan và **95 ngày mưa lớn**, trong đó Huế là địa phương khắc nghiệt nhất.

[Chỉ biểu đồ cột] Biểu đồ xếp hạng cho thấy **Huế dẫn đầu cả nước** về số ngày trên 38 độ, bỏ xa các trạm còn lại. [Chỉ bản đồ điểm nóng] Bản đồ điểm nóng — với kích thước điểm tỉ lệ số ngày vượt ngưỡng — cho thấy dải nắng nóng tập trung ở **Bắc Trung Bộ và Trung Trung Bộ**, nơi chịu hiệu ứng gió phơn. Hai kỷ lục đáng chú ý: Lào Cai từng đạt **41,8 độ** vào ngày 29 tháng 4 năm 2024, và Vinh có ngày mưa tới **267 mm** gây ngập lụt.

[Chuyển tab **Tương quan khí hậu**] Màn hình thứ tư là phòng thí nghiệm phân tích quan hệ giữa các biến. [Chỉ ma trận] Ma trận tương quan Pearson cho thấy bức xạ mặt trời và nhiệt độ có hệ số **0,56** — tương quan thuận khá mạnh; còn lượng mưa và bức xạ có hệ số **âm 0,34** — tương quan nghịch.

[Chỉ scatter] Biểu đồ phân tán bức xạ và nhiệt độ cho thấy đám mây điểm dốc lên rõ; khi phân màu theo miền, ta thấy miền Nam co cụm ở vùng nhiệt độ cao và ổn định. [Chỉ boxplot] Biểu đồ hộp phân bố nhiệt độ ba miền cho thấy miền Nam có hộp ngắn và cao — nền nhiệt rất ổn định; ngược lại miền Bắc có hộp dài nhất, dao động từ 7 tới 32 độ, do những đợt rét đậm mùa đông.

Về ý nghĩa vật lý: bức xạ nhiều thì mặt đất hấp thụ nhiệt nhiều nên nóng hơn; còn ngày mưa nhiều mây thì mây chắn bức xạ, nên hai đại lượng này nghịch nhau. Đó là toàn bộ phần dashboard. Phần thú vị nhất — trợ lý AI — em xin mời bạn Quang Vinh.

---

## ⑤ TÍCH HỢP AI + DEMO — Người 4 (≈5,5 phút)

Em cảm ơn. Phần cuối là điểm nhấn của đồ án: module trợ lý AI.

Ý tưởng là cho phép người dùng hỏi dữ liệu bằng tiếng Việt, và AI sẽ dịch câu hỏi thành mã truy vấn — **SQL hoặc Python** — kèm giải thích. Nhóm dùng mô hình **Google Gemini** qua API, và có thêm chế độ dự phòng ngoại tuyến để luôn hoạt động kể cả khi mất mạng.

Điều quan trọng nhất mà nhóm muốn nhấn mạnh là **ba nguyên tắc an toàn** theo đúng yêu cầu của đề. Thứ nhất, **con người luôn kiểm soát** — AI chỉ đề xuất, con người mới quyết định. Thứ hai, **không thực thi ngầm** — mọi đoạn mã đều hiện rõ ở trạng thái chờ duyệt, chỉ chạy sau khi con người bấm đồng ý. Thứ ba, AI **không được bịa số liệu và không được sửa dữ liệu gốc**, chỉ được đọc.

Về kiến trúc, hệ thống tách thành **ba API** riêng: một để sinh code, một để phê duyệt và kiểm tra an toàn, một để thực thi; cộng thêm một API ghi nhật ký toàn bộ. Bộ kiểm soát an toàn chỉ cho phép câu lệnh đọc, chặn mọi lệnh xóa sửa; với Python thì phân tích cú pháp để chặn các lệnh nguy hiểm như import hay eval.

Bây giờ em xin **demo trực tiếp**. [Gõ câu hỏi vào ô] Em hỏi: "So sánh nhiệt độ trung bình giữa ba miền Bắc, Trung, Nam." [Bấm Sinh đề xuất] AI trả về một câu lệnh SQL, kèm một đoạn giải thích bằng tiếng Việt, và đang ở trạng thái **DRAFT** — tức là chờ duyệt, chưa hề chạy.

[Sửa nhẹ đoạn code] Em có thể sửa trực tiếp đoạn mã này — ví dụ chỉnh lại cách sắp xếp — để cho thấy con người toàn quyền can thiệp. [Bấm Phê duyệt & chạy local] Bây giờ em bấm Phê duyệt và chạy local. Hệ thống kiểm tra an toàn, rồi chạy trên dữ liệu và trả kết quả: **miền Nam nóng nhất, rồi tới miền Trung, thấp nhất là miền Bắc** — đúng như phân tích lúc nãy.

[Cuộn xuống chỉ nhật ký] Và toàn bộ phiên này — câu hỏi, mã nguồn, kết quả — đều được lưu lại ở nhật ký phía dưới để có thể truy xuất. Nếu thầy/cô muốn, em sẵn sàng gõ thử bất kỳ câu hỏi nào ngay tại đây ạ. Em xin mời bạn trưởng nhóm kết luận.

---

## ⑥ KẾT LUẬN — Trưởng nhóm (≈1,5 phút)

Em xin tóm tắt. Qua đồ án này, nhóm đã xây dựng được một bộ dữ liệu khí hậu Việt Nam sạch với hơn 61 nghìn dòng; một dashboard năm phân hệ trả lời trọn vẹn bốn câu hỏi phân tích đặt ra ban đầu; và một trợ lý AI minh bạch, an toàn, hoạt động dưới sự kiểm soát của con người.

Nhóm cũng xin thẳng thắn về **hạn chế**: dữ liệu là loại tái phân tích dạng lưới nên có thể sai lệch nhỏ ở những vùng vi khí hậu đặc thù; và sáu năm là chưa đủ dài để kết luận về xu hướng khí hậu dài hạn. Trong tương lai, nhóm mong muốn kết nối thêm dữ liệu trạm đo thực tế, nâng cấp AI để tự sinh biểu đồ, và triển khai ứng dụng lên nền tảng đám mây.

Toàn bộ mã nguồn và dữ liệu đã được công khai trên GitHub và Google Drive. Phần trình bày của nhóm em đến đây là hết. Nhóm em xin cảm ơn thầy/cô đã lắng nghe, và rất mong nhận được câu hỏi cũng như góp ý ạ.

---

## Ghi chú diễn đạt

- **Đọc số tự nhiên:** "hai bảy phẩy năm độ", "sáu mươi mốt nghìn dòng" — đừng đọc kiểu máy móc.
- **Ngẩng lên nhìn thầy/cô** ở đầu và cuối mỗi phần, đừng dán mắt vào màn hình.
- **Người sau đứng sẵn** cạnh máy trước khi người trước nói hết, để chuyển mượt.
- Nếu **quá giờ**, phần được rút gọn trước là mục ý-nghĩa-vật-lý (Người 3) và phần kiến trúc API (Người 4) — giữ nguyên demo AI.
- Nếu **demo AI lỗi mạng:** bình tĩnh nói "hệ thống chuyển sang chế độ ngoại tuyến dự phòng" và tiếp tục — vẫn ra kết quả.
