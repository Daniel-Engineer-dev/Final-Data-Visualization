# ADR 0001: Thực thi AI theo mô hình local-first

## Trạng thái

Được chấp nhận.

## Quyết định

AI chỉ tạo đề xuất code và giải thích. Code ở trạng thái chờ, được hiển thị để người
dùng chỉnh sửa hoặc phê duyệt. Chỉ code đã được duyệt và vượt kiểm tra chỉ đọc mới
được thực thi trên DuckDB local.

## Lý do

Quyết định đáp ứng yêu cầu không thực thi ngầm, bảo vệ dữ liệu gốc và tạo audit trail
phục vụ báo cáo cùng buổi vấn đáp.

