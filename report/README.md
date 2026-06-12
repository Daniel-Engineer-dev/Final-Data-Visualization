# Sườn báo cáo LaTeX

Sườn này dùng chung cho mọi đề tài trực quan hóa và phân tích dữ liệu liên quan đến
Việt Nam, đồng thời bao phủ các yêu cầu tích hợp AI của đề bài.

## Cập nhật thông tin

Sửa các lệnh trong khối `THONG TIN CAN CAP NHAT` ở đầu `main.tex`. Nội dung từng
chương nằm trong `chapters/`; phụ lục nằm trong `appendices/`.

Các đoạn trong dấu ngoặc vuông là nội dung nhóm cần thay thế. Xóa những hướng dẫn
viết trước khi nộp báo cáo.

## Biên dịch

Báo cáo sử dụng XeLaTeX để hỗ trợ tiếng Việt và `biber` để tạo tài liệu tham khảo:

```powershell
latexmk main.tex
```

Chạy lệnh tại thư mục `report`. File `.latexmkrc` sẽ tự động chọn XeLaTeX và đưa toàn bộ file
trung gian vào thư mục `build/`; file kết quả duy nhất ở thư mục báo cáo là `main.pdf`. VS Code
LaTeX Workshop dùng recipe `Build XeLaTeX and clean`: khi nhấn Build, extension sẽ tạo
`main.pdf` rồi tự động xóa các file trung gian trong `build/`.

## Cấu trúc

- `coverpage.tex`: trang bìa giữ thiết kế khung viền đôi và tông xanh của mẫu.
- `chapters/`: nội dung chính từ giới thiệu đến kết luận.
- `appendices/`: data dictionary, AI logs và phân công đóng góp.
- `references.bib`: nguồn dữ liệu và tài liệu tham khảo.
- `images/`: logo, ảnh dashboard, sơ đồ và biểu đồ dùng trong báo cáo.
