# Script thuyết trình ĐẦY ĐỦ — Vietnam Climate Pulse

> Bản trình bày trọn vẹn, **không giới hạn thời gian**, bám sát toàn bộ yêu cầu của đề.
> Lời thoại verbatim (đọc gần như nguyên văn). Phần `[...]` là **thao tác trên app**, không đọc ra.
> Cuối file có **bảng đối chiếu yêu cầu** để kiểm tra không sót mục nào.

---

## ① MỞ ĐẦU — Trưởng nhóm

Em kính chào thầy/cô. Em là [tên], đại diện Nhóm 1. Hôm nay nhóm em xin trình bày đồ án cuối kỳ môn Trực quan hóa dữ liệu, với tên gọi **Vietnam Climate Pulse** — "Nhịp đập khí hậu Việt Nam".

**Bối cảnh và động lực.** Việt Nam là một trong những quốc gia chịu ảnh hưởng nặng nề nhất bởi biến đổi khí hậu, với nắng nóng gay gắt, hạn mặn và mưa lũ ngày càng thất thường. Tuy nhiên, dữ liệu khí tượng thô lại rất phức tạp, phân tán và khó tiếp cận với công chúng, học sinh sinh viên hay người làm truyền thông môi trường. Vì vậy, nhóm em xây dựng một dashboard giúp biến những con số khô khan thành tri thức khí hậu trực quan, dễ hiểu — đồng thời tích hợp một trợ lý AI cho phép hỏi dữ liệu bằng tiếng Việt một cách an toàn.

**Đối tượng sử dụng** mà nhóm hướng tới gồm: sinh viên khối ngành địa lý và môi trường cần số liệu trực quan; các tuyên truyền viên về biến đổi khí hậu; và cộng đồng quan tâm đến thời tiết địa phương.

**Mục tiêu** là xây dựng một dashboard tương tác theo kiến trúc cục bộ, tối ưu hiệu năng, tích hợp trợ lý AI hỗ trợ phân tích bằng ngôn ngữ tự nhiên.

Toàn bộ phần trình bày sẽ xoay quanh **bốn câu hỏi phân tích** làm mạch xuyên suốt:
1. Nhiệt độ ba miền Bắc – Trung – Nam khác nhau như thế nào?
2. Mùa mưa dịch chuyển ra sao, và liệu có dấu hiệu nóng lên không?
3. Bức xạ, nhiệt độ và lượng mưa có quan hệ vật lý gì với nhau?
4. Thiên tai cực đoan tập trung ở đâu, vào thời điểm nào?

Nhóm em gồm bốn thành viên. Bạn Việt trình bày tập dữ liệu và quy trình xử lý; bạn Đức và bạn Thế Vinh trình bày các màn hình phân tích của dashboard cùng phần thiết kế; bạn Quang Vinh trình bày phần tích hợp AI. Sau đây em xin mời bạn Việt.

---

## ② TẬP DỮ LIỆU & TIỀN XỬ LÝ — Người 1

Em cảm ơn. Em xin trình bày về tập dữ liệu — phần nền tảng cho toàn bộ đồ án.

### Nguồn dữ liệu và độ tin cậy

Nguồn dữ liệu chính là **Open-Meteo Historical Weather API**. Đây là dịch vụ dựa trên mô hình tái phân tích khí tượng **ERA5** của Trung tâm Dự báo Thời tiết châu Âu ECMWF — kết hợp mô hình khí hậu toàn cầu và quan trắc vệ tinh, nên độ tin cậy rất cao. Dữ liệu được cấp miễn phí theo giấy phép **Creative Commons Attribution 4.0**, hoàn toàn minh bạch và có thể trích dẫn. Nhóm cũng công khai toàn bộ dữ liệu gốc trên Google Drive để thầy/cô và bất kỳ ai cũng có thể đối chiếu, tái lập.

### Quy mô và cấu trúc

Nhóm thu thập dữ liệu của **28 trạm** quan trắc trải đều khắp ba miền, trong **sáu năm** liên tục từ đầu 2020 đến hết 2025. Kết quả là bộ dữ liệu **61.376 dòng** và **12 cột**, gồm:
- **5 biến định danh:** ngày, địa điểm, vùng miền, kinh độ, vĩ độ;
- **7 biến đo lường:** nhiệt độ cao nhất, thấp nhất, trung bình, tổng lượng mưa, lượng mưa rào, tốc độ gió, và bức xạ mặt trời.

Nhóm có xây dựng một **từ điển dữ liệu** đầy đủ trong báo cáo, mô tả kiểu dữ liệu, đơn vị, nguồn gốc và miền giá trị của từng cột — vừa để chuẩn hóa giữa các thành phần, vừa làm ngữ cảnh cho AI hiểu cấu trúc bảng.

### Đáp ứng yêu cầu của đề

Đề yêu cầu tối thiểu 7 biến độc lập, 2000 dòng, và trên 50% dữ liệu liên quan Việt Nam. Bộ dữ liệu của nhóm **vượt xa cả ba**: đủ 7 biến đo, hơn 61 nghìn dòng, và **100% là dữ liệu Việt Nam**.

### Quy trình tiền xử lý

[Chỉ vào sơ đồ pipeline] Nhóm xây dựng một pipeline tự động, gồm bốn bước. Thứ nhất, đọc danh sách tọa độ 28 trạm từ tệp cấu hình. Thứ hai, gọi API cho từng trạm; vì API giới hạn số lần truy cập, nhóm **xử lý lỗi quá tải HTTP 429** bằng cơ chế tự động chờ và lưu đệm dữ liệu gốc dạng JSON, tránh tải lại nhiều lần. Thứ ba, làm sạch: chuẩn hóa kiểu dữ liệu, gán nhãn vùng miền Bắc – Trung – Nam, sắp xếp. Thứ tư, lưu dưới định dạng **Parquet** nén cột.

### Kiểm tra chất lượng — không bỏ sót trong xử lý

Nhóm chạy một bước kiểm định riêng và ghi nhận: **0% giá trị khuyết, 0% trùng lặp**, mỗi cặp trạm-ngày là duy nhất, và mọi giá trị nằm trong miền hợp lệ — ví dụ nhiệt độ từ 4,5 đến 41,8 độ C, lượng mưa 0 đến 267 mm, khớp hoàn toàn với thực tế khí hậu Việt Nam. Đây là bằng chứng cho việc quy trình xử lý không để lọt thiếu sót.

### Kiến trúc lưu trữ

Nhóm chọn kiến trúc **local-first**: dùng Parquet kết hợp DuckDB để truy vấn tệp trực tiếp, tốc độ phản hồi rất nhanh mà không cần cài đặt máy chủ cơ sở dữ liệu cồng kềnh. Dữ liệu sạch này chính là nền cho dashboard mà bạn Đức trình bày ngay sau đây.

---

## ③ TAB TỔNG QUAN & KHÁM PHÁ — Người 2

Em cảm ơn. Em xin demo trực tiếp trên ứng dụng đang chạy.

### Triết lý thiết kế thông tin

Trước khi vào từng màn hình, em xin nói nhanh về cách nhóm tổ chức thông tin. Nhóm tuân theo triết lý của Ben Shneiderman: **"xem tổng quan trước, lọc và phóng to, xem chi tiết khi cần"**. Vì vậy dashboard đi từ bản đồ toàn quốc, tới lọc theo địa phương, rồi tới phân tích chuyên sâu và AI.

### Tab 1 — Tổng quan trạm đo

[Mở tab **Tổng quan**] Trung tâm là **bản đồ Việt Nam thật**, vẽ từ dữ liệu địa lý GeoJSON, với 28 trạm hiển thị bằng các điểm. Về mã hóa thị giác: màu sắc phân theo ba miền, còn kích thước điểm thể hiện nhiệt độ trung bình — nghĩa là mỗi kênh thị giác đều mang một ý nghĩa.

Điểm nổi bật là **sự liên kết giữa các thành phần**. [Click vào Hà Nội] Khi em nhấp vào một trạm, ví dụ Hà Nội, bảng thông tin bên phải lập tức cập nhật: nhiệt độ trung bình 24 độ, cao nhất từng ghi nhận hơn 40 độ, thấp nhất 6 độ, lượng mưa khoảng 2.200 mm mỗi năm. Đây là ví dụ trực tiếp cho tiêu chí "tích hợp và liên kết" — một hành động trên bản đồ đồng bộ ngay sang bảng chi tiết.

Phía trên là ba chỉ số tổng: 28 trạm, hơn 61 nghìn bản ghi, 6 năm. Phía dưới, nhóm rút ra vài **kết luận chính**: nơi nóng nhất là Thành phố Hồ Chí Minh với 27,5 độ, mát nhất là Đà Lạt 18,9 độ — chênh nhau tới gần 9 độ; mưa nhiều nhất là Huế, khô nhất là Phan Thiết; gió mạnh nhất là các trạm ven biển như Vũng Tàu.

### Tab 2 — Khám phá khí hậu

[Chuyển tab **Khám phá khí hậu**] Màn hình này đi sâu vào xu hướng theo thời gian, trả lời **câu hỏi phân tích số 2**.

Trước hết là **điều hướng**: em có thể chọn từng trạm hoặc xem toàn quốc bằng ô chọn này; mọi biểu đồ tự cập nhật đồng bộ.

[Chỉ biểu đồ đường] **Chu kỳ nhiệt độ theo tháng** dùng biểu đồ đường — phù hợp để theo dõi biến động theo thời gian. Nó có dạng hình chuông, đỉnh vào mùa hè; ba đường thể hiện nhiệt độ cao nhất, trung bình, thấp nhất, cho thấy cả biên độ ngày.

[Chỉ biểu đồ cột] **Lượng mưa theo tháng** dùng biểu đồ cột — vì dữ liệu mưa mang tính tích lũy, biểu đồ cột là lựa chọn phù hợp nhất, đúng tinh thần "chọn đúng biểu đồ cho mục đích".

[Chỉ biểu đồ xu hướng năm] Về câu hỏi "có nóng lên không", nhóm xin **trung thực**: biểu đồ xu hướng nhiệt độ theo năm cho thấy nhiệt độ chỉ dao động quanh 25 độ, **không tăng đơn điệu**. Sáu năm là quá ngắn để kết luận về nóng lên toàn cầu, nên nhóm không cường điệu số liệu.

[Chỉ heatmap] Cuối cùng, **ma trận nhiệt độ Tháng nhân Năm** dùng bản đồ nhiệt, giúp phát hiện nhanh những tháng nóng bất thường — như tháng 4 năm 2024.

Về **tương tác**: mọi biểu đồ đều có nút phóng to để xem lớn, và tooltip đồng bộ hiển thị số liệu khi rê chuột. Em xin mời bạn Thế Vinh trình bày hai màn hình tiếp theo.

---

## ④ TAB CỰC ĐOAN & TƯƠNG QUAN — Người 3

Em cảm ơn. [Mở tab **Thời tiết cực đoan**] Màn hình thứ ba trả lời **câu hỏi phân tích số 4** — thiên tai cực đoan.

### Tab 3 — Thời tiết cực đoan

Điểm mạnh ở đây là **tương tác động qua hai thanh trượt ngưỡng**. [Kéo thử] Khi em kéo ngưỡng nắng nóng hoặc mưa lớn, hệ thống gửi tham số mới về backend và tải lại dữ liệu theo thời gian thực. Với ngưỡng mặc định 38 độ và 100 mm, hệ thống ghi nhận **302 ngày nắng nóng** cực đoan và **95 ngày mưa lớn**, trong đó Huế là địa phương khắc nghiệt nhất.

[Chỉ biểu đồ cột] Biểu đồ xếp hạng cho thấy **Huế dẫn đầu cả nước** về số ngày trên 38 độ, bỏ xa các trạm còn lại. [Chỉ bản đồ điểm nóng] Bản đồ điểm nóng — kích thước điểm tỉ lệ số ngày vượt ngưỡng — cho thấy dải nắng nóng tập trung ở **Bắc Trung Bộ và Trung Trung Bộ**, nơi chịu hiệu ứng gió phơn. Ngoài ra còn hai biểu đồ phụ thống kê số ngày cực đoan theo năm và theo tháng, thể hiện tính mùa vụ của thiên tai.

Hai kỷ lục đáng chú ý: Lào Cai từng đạt **41,8 độ** vào ngày 29 tháng 4 năm 2024, và Vinh có ngày mưa tới **267 mm** gây ngập lụt nghiêm trọng.

### Tab 4 — Tương quan khí hậu

[Chuyển tab **Tương quan khí hậu**] Màn hình thứ tư là phòng thí nghiệm phân tích quan hệ giữa các biến — trả lời **câu hỏi phân tích số 3**.

[Chỉ ma trận] **Ma trận tương quan Pearson** cho thấy bức xạ mặt trời và nhiệt độ có hệ số **0,56** — tương quan thuận khá mạnh; còn lượng mưa và bức xạ có hệ số **âm 0,34** — tương quan nghịch.

[Chỉ scatter] **Biểu đồ phân tán** bức xạ và nhiệt độ cho thấy đám mây điểm dốc lên rõ; khi phân màu theo miền, miền Nam co cụm ở vùng nhiệt độ cao và ổn định.

[Chỉ biểu đồ vĩ độ] Biểu đồ **vĩ độ và nhiệt độ** minh họa: càng ra Bắc, dải nhiệt độ càng trải rộng xuống thấp.

[Chỉ boxplot] **Biểu đồ hộp** phân bố nhiệt độ ba miền cho thấy miền Nam có hộp ngắn và cao — nền nhiệt rất ổn định, độ lệch chuẩn chỉ 1,3 độ; ngược lại miền Bắc có hộp dài nhất, dao động từ 7 tới 32 độ, độ lệch chuẩn tới 4,9 độ, do những đợt rét đậm mùa đông.

Về **ý nghĩa vật lý**: bức xạ nhiều thì mặt đất hấp thụ nhiệt nhiều nên nóng hơn — giải thích tương quan thuận; còn ngày mưa nhiều mây thì mây chắn bức xạ — giải thích tương quan nghịch. Đó là toàn bộ bốn màn hình phân tích. Tiếp theo, em xin nói ngắn về thiết kế thẩm mỹ trước khi sang phần AI.

---

## ⑤ THIẾT KẾ THẨM MỸ & KHẢ NĂNG TIẾP CẬN — Người 3 (hoặc Người 2)

Về tổng thể, dashboard theo phong cách **"Editorial Climate Almanac"** — tông sáng, nền giấy ấm, kiểu chữ serif, tạo cảm giác trang nhã như một ấn phẩm khí hậu chứ không rối mắt.

**Màu sắc đều có ý nghĩa** chứ không trang trí tùy tiện: màu xanh teal cho miền Bắc mát lạnh, hổ phách cho miền Trung nắng nóng, xanh rừng cho miền Nam ẩm; thang nhiệt độ chuyển từ xanh lạnh sang đất nung nóng; thang tương quan phân kỳ từ xanh âm qua kem tới cam dương. Nhóm cố ý dùng hệ màu đất dịu, **tránh quá tải màu**.

Ứng dụng cũng **thiết kế đáp ứng** (responsive) bằng CSS Grid, tự chuyển bố cục trên điện thoại và máy tính bảng, đảm bảo dễ tiếp cận trên mọi thiết bị. Em xin mời bạn Quang Vinh trình bày phần AI.

---

## ⑥ TÍCH HỢP AI — Người 4 (phần trọng tâm)

Em cảm ơn. Phần cuối và cũng là điểm nhấn: module trợ lý AI. Em sẽ trình bày theo đúng các nguyên tắc mà đề bài đặt ra.

### 6.1. Vai trò của AI và của con người

Nhóm thiết kế theo mô hình **Human-in-the-loop**, phân vai rất rõ:
- **AI đóng vai trò:** gợi ý ý tưởng phân tích, viết code theo yêu cầu người dùng, và trình bày kết quả **chỉ dựa trên số liệu và hình ảnh do hệ thống cung cấp** — tuyệt đối không tự bịa thêm số liệu.
- **Con người đóng vai trò:** định hướng, đặt yêu cầu phân tích, và **ra quyết định** thực thi.

Và một điểm quan trọng: **code chỉ chạy trên môi trường local** của người dùng, ngay trên máy, không chạy trên môi trường online.

### 6.2. Kiến trúc — tách Frontend và API

Theo đúng gợi ý thiết kế của đề, nhóm tách riêng phần giao diện và phần API. Frontend đảm nhận: nhận yêu cầu, hiển thị và cho **sửa mã nguồn**, nút phê duyệt, và hiển thị kết quả. Phía sau là **ba API bắt buộc**:
- **API AI** — nhận câu hỏi, gửi kèm ngữ cảnh cấu trúc dữ liệu cho mô hình, trả về code và giải thích;
- **API Thực thi** — nhận code đã được con người duyệt, chạy trên dữ liệu local, thu kết quả;
- **API Logs** — lưu lại toàn bộ.

Về mô hình, nhóm dùng **Google Gemini** qua API, kèm chế độ dự phòng ngoại tuyến để luôn hoạt động kể cả khi mất mạng. Hệ thống hỗ trợ cả hai loại mã: **SQL** trên DuckDB và **Python/pandas**.

### 6.3. Nguyên tắc "không thực thi ngầm"

Đây là nguyên tắc cốt lõi. AI **không bao giờ** được tự ý thay đổi dữ liệu gốc hay âm thầm chạy thuật toán. Cụ thể, hệ thống bắt buộc:
- **Hiển thị code** — mỗi khi AI sinh code, nó phải hiện ra rõ ràng trên giao diện;
- **Giải thích bằng ngôn ngữ tự nhiên** — ngay cạnh đoạn code luôn có phần giải thích tiếng Việt về việc code làm gì.

### 6.4. Nguyên tắc phê duyệt

Code AI sinh ra ban đầu ở trạng thái **"Chờ duyệt" (DRAFT)**. Con người có thể **chỉnh sửa** trực tiếp, rồi mới **chấp nhận và thực thi**. Chỉ khi con người bấm đồng ý, code mới được chạy và trả kết quả.

### 6.5. Nguyên tắc lưu trữ

Hệ thống lưu lại **tất cả**: câu hỏi, ngữ cảnh, mã nguồn AI đề xuất, mã thực tế con người duyệt chạy, kết quả, và giải thích — vào một cơ sở dữ liệu nhật ký, để có thể truy xuất lại bất cứ lúc nào.

### 6.6. Kiểm soát an toàn (Guardrails)

Trước khi chạy, mọi mã đều qua bộ lọc an toàn. Với SQL: chỉ cho phép câu lệnh đọc, chặn mọi lệnh xóa/sửa như DROP hay DELETE, và chỉ cho một câu lệnh mỗi lần. Với Python: phân tích cú pháp để chặn các lệnh nguy hiểm như import, eval, exec, và việc đọc/ghi tệp.

---

## ⑦ DEMO AI TRỰC TIẾP — Người 4

Bây giờ em xin demo để thầy/cô thấy tất cả nguyên tắc trên vận hành thật.

**Demo 1 — Luồng phê duyệt đầy đủ.**
[Gõ] Em hỏi: "So sánh nhiệt độ trung bình giữa ba miền Bắc, Trung, Nam." [Bấm sinh đề xuất]
- AI trả về **một câu lệnh SQL** [chỉ vào code] và **một đoạn giải thích tiếng Việt** [chỉ vào ô giải thích], đang ở trạng thái **DRAFT — chờ duyệt, chưa chạy gì cả**. Đây là nguyên tắc "hiển thị code + giải thích + không thực thi ngầm".
- [Sửa nhẹ code] Em sửa trực tiếp đoạn mã — thể hiện con người toàn quyền can thiệp.
- [Bấm Phê duyệt & chạy local] Giờ em duyệt. Hệ thống kiểm tra an toàn, chạy trên dữ liệu local, và trả kết quả: **miền Nam nóng nhất, tới miền Trung, thấp nhất là miền Bắc** — đúng như phân tích. Lưu ý kết quả này hoàn toàn từ dữ liệu thật, AI không bịa.
- [Cuộn xuống nhật ký] Và toàn bộ phiên vừa rồi đã được lưu vào nhật ký này.

**Demo 2 — AI biết từ chối câu ngoài phạm vi.**
[Gõ] Em thử hỏi một câu ngoài lề: "Hôm nay ăn gì ngon?" [Bấm] AI trả về code rỗng và **từ chối** vì câu hỏi không liên quan dữ liệu khí hậu — cho thấy AI có ràng buộc phạm vi.

**Demo 3 — Guard chặn lệnh nguy hiểm.**
[Trong ô code, gõ] Nếu ai đó cố chèn lệnh `DROP TABLE`, [bấm duyệt] hệ thống **chặn ngay** với thông báo chỉ cho phép câu lệnh đọc — bảo vệ dữ liệu gốc.

**Demo 4 — Chế độ Python (nếu còn thời gian).**
[Chuyển sang Python, hỏi "Xu hướng nhiệt độ trung bình theo năm"] Hệ thống cũng sinh được code pandas, qua đúng luồng duyệt như trên.

Nếu thầy/cô muốn ra một câu hỏi bất kỳ, em sẵn sàng gõ và chạy ngay tại đây ạ.

### Quá trình sử dụng AI trong phát triển

Ngoài AI trong sản phẩm, trong quá trình làm đồ án nhóm cũng dùng AI như công cụ hỗ trợ viết code và rà soát — nhưng mọi quyết định thiết kế, số liệu và kết luận đều do nhóm kiểm chứng. Chi tiết về các yêu cầu đã đặt cho AI, kết quả nhận được và nhận xét, nhóm đã tổng hợp trong chương tương ứng của báo cáo.

Em xin mời bạn trưởng nhóm kết luận.

---

## ⑧ KẾT LUẬN — Trưởng nhóm

Em xin tóm tắt. Qua đồ án này, nhóm đã đạt ba kết quả then chốt: một là bộ dữ liệu khí hậu Việt Nam sạch với hơn 61 nghìn dòng, nguồn tin cậy và công khai; hai là một dashboard năm phân hệ trả lời trọn vẹn bốn câu hỏi phân tích; ba là một trợ lý AI minh bạch, an toàn, hoạt động dưới sự kiểm soát của con người theo đúng các nguyên tắc của đề.

Nhóm cũng xin thẳng thắn về **hạn chế**: dữ liệu là loại tái phân tích dạng lưới nên có thể sai lệch nhỏ ở những vùng vi khí hậu đặc thù; và sáu năm là chưa đủ dài để kết luận về xu hướng khí hậu dài hạn. **Hướng phát triển**: kết nối thêm dữ liệu trạm đo thực tế, nâng cấp AI để tự sinh biểu đồ và báo cáo, và triển khai lên nền tảng đám mây.

Toàn bộ mã nguồn và dữ liệu đã được công khai trên GitHub và Google Drive. Phần trình bày của nhóm em đến đây là hết. Nhóm em xin cảm ơn thầy/cô đã lắng nghe và rất mong nhận được câu hỏi cũng như góp ý ạ.

---

## 📋 BẢNG ĐỐI CHIẾU YÊU CẦU (để nhóm tự kiểm, không đọc ra)

### 8 tiêu chí đánh giá
| Tiêu chí | Được thể hiện ở |
|----------|-----------------|
| 1. Nguồn dữ liệu đáng tin cậy, minh bạch, không sót xử lý | ② (ERA5/CC-BY, kiểm tra 0% khuyết, công khai Drive) |
| 2. Phù hợp mục đích (đúng biểu đồ, đúng đối tượng) | ① (đối tượng), ③ (đường/cột/heatmap đúng loại) |
| 3. Rõ ràng, dễ hiểu | ③⑤ (bố cục Shneiderman, tooltip, insight ngắn gọn) |
| 4. Tích hợp và liên kết | ③ (click bản đồ → panel), đồng bộ dropdown |
| 5. Tương tác và điều hướng | ③ (dropdown, phóng to), ④ (thanh trượt động) |
| 6. Thiết kế hấp dẫn, màu có ý nghĩa | ⑤ (theme sáng, hệ màu đất, tránh quá tải, responsive) |
| 7. Phân tích dữ liệu (xu hướng, quan hệ, câu chuyện) | ③④ (xu hướng năm, tương quan Pearson, 4 câu hỏi) |
| 8. Tích hợp AI (thiết kế + vận hành) | ⑥⑦ (kiến trúc 3 API + demo trực tiếp) |

### Nguyên tắc AI
| Yêu cầu AI của đề | Được thể hiện ở |
|-------------------|-----------------|
| Vai trò AI (gợi ý, viết code, không bịa số liệu) | 6.1 |
| Vai trò con người (định hướng, quyết định) | 6.1 |
| Thực thi code trên local | 6.1, Demo 1 |
| Không thực thi ngầm (hiển thị code + giải thích NL) | 6.3, Demo 1 |
| Nguyên tắc phê duyệt (chờ duyệt → sửa → chạy) | 6.4, Demo 1 |
| Nguyên tắc lưu trữ (log tất cả) | 6.5, Demo 1 |
| Tách Frontend + 3 API (AI/Thực thi/Logs) | 6.2 |
| Dùng AI trả lời câu hỏi trong vấn đáp | ⑦ (sẵn sàng nhận đề của thầy/cô) |
| Tóm tắt dùng AI trong báo cáo | ⑦ (đoạn cuối) + chương báo cáo |

---

## Ghi chú diễn đạt & chuẩn bị

- Bản này **không giới hạn thời gian** — trình bày trọn vẹn. Nếu buổi vấn đáp có giới hạn, dùng bản `kich-ban-thuyet-trinh.md` (đã canh 20 phút).
- **Checklist trước khi trình bày:** backend + frontend đang chạy; đã cắm Gemini key; mở sẵn 5 tab; có mạng dự phòng; báo cáo PDF mở ở tab khác.
- Nếu **demo lỗi mạng:** nói "hệ thống chuyển sang chế độ ngoại tuyến dự phòng" và tiếp tục — vẫn ra kết quả.
- Điền tên thật vào `[tên]` ở phần mở đầu; nhóm tự đổi phân vai nếu cần.
