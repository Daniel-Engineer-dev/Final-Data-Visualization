# Kiến trúc hệ thống

## Luồng dữ liệu

```text
Open-Meteo + metadata địa điểm
-> data_pipeline
-> data/raw
-> làm sạch và kiểm tra chất lượng
-> data/processed/climate_daily.parquet
-> DuckDB chỉ đọc
-> application/backend (FastAPI)
-> application/frontend (React dashboard)
```

## Luồng AI có phê duyệt

```text
Người dùng đặt câu hỏi
-> API AI nhận schema và metadata
-> AI tạo code + giải thích, trạng thái draft
-> người dùng xem/chỉnh sửa/phê duyệt hoặc từ chối
-> SQL guard kiểm tra chỉ đọc
-> thực thi local trên DuckDB
-> trả kết quả và lưu audit log
```

## Nguyên tắc

- Không sửa dữ liệu gốc.
- Không thực thi code AI khi chưa được phê duyệt.
- Chỉ cho phép truy vấn đọc dữ liệu.
- Lưu prompt, code, quyết định, kết quả và giải thích.
- Dashboard vẫn hoạt động với dữ liệu local khi API ngoài không khả dụng.
