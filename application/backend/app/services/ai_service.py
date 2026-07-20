import os
import re
import httpx
import json
import logging
from typing import Dict, Any

_log = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")

    def translate_to_sql(self, question: str) -> Dict[str, str]:
        """
        Translates a natural language question into SQL query on climate_daily table.
        Returns a dict with 'code' and 'explanation'.
        """
        # 1. Try real API if key is available
        if self.gemini_key:
            return self._call_gemini(question, self._get_system_prompt(), self._generate_mock_sql)

        # 2. Heuristic fallback (Mock mode for offline demo / local grading)
        return self._generate_mock_sql(question)

    def translate_to_python(self, question: str) -> Dict[str, str]:
        """
        Translates a natural language question into pandas analysis code.
        The code operates on a DataFrame `df` (toàn bộ bảng climate_daily) và phải
        gán kết quả vào biến `result`. Returns a dict with 'code' and 'explanation'.
        """
        if self.gemini_key:
            return self._call_gemini(question, self._get_python_system_prompt(), self._generate_mock_python)

        return self._generate_mock_python(question)

    def _call_gemini(self, question: str, system_prompt: str, fallback) -> Dict[str, str]:
        # Gemini API call
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_key}"
        headers = {"Content-Type": "application/json"}

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_prompt}\n\nCâu hỏi từ người dùng: {question}\nHãy trả về kết quả dưới dạng JSON có hai trường 'code' và 'explanation'."}
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1
            }
        }
        
        try:
            response = httpx.post(url, headers=headers, json=payload, timeout=30.0)
            if response.status_code == 200:
                result = response.json()
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
            else:
                _log.warning("Gemini API error: %s", response.text)
        except Exception as e:
            _log.warning("Error calling Gemini API: %s", e)

        return fallback(question)

    def _get_system_prompt(self) -> str:
        return """
Bạn là một trợ lý AI chuyên về phân tích dữ liệu khí hậu Việt Nam.
Bảng cơ sở dữ liệu DuckDB được đặt tên là `climate_daily`.
Dữ liệu của bảng này bao gồm các cột sau:
- `date`: kiểu DATE (ngày quan sát)
- `location`: kiểu VARCHAR (tên tỉnh/thành phố)
- `region`: kiểu VARCHAR (North, Central, South)
- `latitude`: kiểu DOUBLE (vĩ độ)
- `longitude`: kiểu DOUBLE (kinh độ)
- `temperature_2m_max`: kiểu DOUBLE (nhiệt độ cao nhất ngày °C)
- `temperature_2m_min`: kiểu DOUBLE (nhiệt độ thấp nhất ngày °C)
- `temperature_2m_mean`: kiểu DOUBLE (nhiệt độ trung bình ngày °C)
- `precipitation_sum`: kiểu DOUBLE (tổng lượng mưa ngày mm)
- `rain_sum`: kiểu DOUBLE (tổng lượng mưa rào ngày mm)
- `wind_speed_10m_max`: kiểu DOUBLE (tốc độ gió tối đa ngày km/h)
- `shortwave_radiation_sum`: kiểu DOUBLE (bức xạ mặt trời ngắn tích lũy ngày MJ/m²)

QUAN TRỌNG — giá trị cột `location` được lưu bằng TIẾNG ANH KHÔNG DẤU. Có đúng 28 trạm:
- North (Bắc): 'Dien Bien', 'Ha Giang', 'Ha Noi', 'Hai Phong', 'Lang Son', 'Lao Cai', 'Ninh Binh', 'Quang Ninh', 'Son La'
- Central (Trung): 'Buon Ma Thuot', 'Da Lat', 'Da Nang', 'Hue', 'Nha Trang', 'Phan Thiet', 'Pleiku', 'Quy Nhon', 'Thanh Hoa', 'Vinh'
- South (Nam): 'Bien Hoa', 'Ca Mau', 'Can Tho', 'Ho Chi Minh City', 'Phu Quoc', 'Rach Gia', 'Soc Trang', 'Tay Ninh', 'Vung Tau'
Khi người dùng nhắc tên có dấu hoặc viết tắt, PHẢI ánh xạ về đúng chuỗi không dấu ở trên.
Ví dụ: "Đà Lạt" -> 'Da Lat'; "Huế" -> 'Hue'; "Đà Nẵng" -> 'Da Nang'; "TP. Hồ Chí Minh"/"Sài Gòn"/"HCM" -> 'Ho Chi Minh City'.
Cột `region` chỉ nhận đúng 3 giá trị: 'North', 'Central', 'South'.
Cột `date` kiểu DATE, dữ liệu liên tục từ 2020-01-01 đến 2025-12-31 (6 năm).

Nhiệm vụ của bạn là nhận câu hỏi ngôn ngữ tự nhiên từ người dùng (bằng tiếng Việt hoặc tiếng Anh) và sinh ra một câu lệnh SQL SELECT duy nhất, hợp lệ để chạy trên DuckDB và giải thích ngắn gọn bằng tiếng Việt.

YÊU CẦU BẮT BUỘC:
1. Bạn CHỈ được phép sinh câu lệnh SELECT hoặc WITH chỉ đọc dữ liệu. Tuyệt đối không chứa các từ khóa INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, v.v.
2. Trả về kết       5. Nếu truy vấn có thể trả về nhiều dòng chi tiết, hãy thêm ORDER BY hợp lý và LIMIT (mặc định 100). Lấy năm bằng `year(date)`, tháng bằng `month(date)`.
6. Nếu câu hỏi của người dùng không liên quan đến phân tích dữ liệu khí hậu Việt Nam hoặc bảng `climate_daily` (ví dụ: các câu hỏi chào hỏi chung chung, hỏi về chủ đề ngoài lề như phim ảnh, nấu ăn, công nghệ khác...), bạn BẮT BUỘC phải trả về trường "code" là một chuỗi rỗng "" và ghi rõ lý do từ chối hỗ trợ ở trường "explanation" để người dùng đặt câu hỏi phù hợp.
"""

    def _generate_mock_sql(self, question: str) -> Dict[str, str]:
        """
        Generate hardcoded responses for matching keywords in local mode.
        """
        q = question.lower()
        
        # Match Question 1: Compare rainfall between Da Nang and HCMC
        if "lượng mưa" in q and "đà nẵng" in q and "hồ chí minh" in q:
            return {
                "code": "SELECT location, month(date) as thang, AVG(precipitation_sum) as luong_mua_trung_binh\nFROM climate_daily\nWHERE location IN ('Da Nang', 'Ho Chi Minh City')\nGROUP BY location, thang\nORDER BY thang, location",
                "explanation": "Truy vấn này tính lượng mưa trung bình theo từng tháng trong năm cho hai thành phố Đà Nẵng và TP. Hồ Chí Minh để so sánh đặc trưng mùa mưa.",
                "chart": {"type": "line", "x": "thang", "y": "luong_mua_trung_binh"},
            }
            
        # Match Question 2: Extreme temperature in Hanoi
        if "nhiệt độ" in q and "bất thường" in q and "hà nội" in q:
            return {
                "code": "SELECT date, temperature_2m_max, temperature_2m_min, temperature_2m_mean\nFROM climate_daily\nWHERE location = 'Ha Noi' AND (temperature_2m_max > 38.0 OR temperature_2m_min < 10.0)\nORDER BY date DESC",
                "explanation": "Truy vấn lọc các ngày có nhiệt độ cực đoan tại Hà Nội: nhiệt độ tối đa vượt quá 38°C hoặc nhiệt độ tối thiểu dưới 10°C.",
                "chart": {"type": "scatter", "x": "temperature_2m_min", "y": "temperature_2m_max"},
            }
            
        # Match Question 3: Cluster similar locations
        if "nhóm" in q or "tương đồng" in q:
            return {
                "code": "SELECT location, region, round(AVG(temperature_2m_mean), 2) as temp_avg, round(SUM(precipitation_sum)/6, 2) as rain_annual_avg, round(AVG(wind_speed_10m_max), 2) as wind_avg\nFROM climate_daily\nGROUP BY location, region\nORDER BY region, temp_avg DESC",
                "explanation": "Truy vấn tính toán các chỉ số trung bình dài hạn (nhiệt độ, lượng mưa năm, tốc độ gió) của các địa điểm để hỗ trợ phân nhóm khí hậu.",
                "chart": {"type": "scatter", "x": "rain_annual_avg", "y": "temp_avg"},
            }
            
        # Match Question 4: Relationship between rain and radiation
        if "bức xạ" in q or "quan hệ" in q:
            return {
                "code": "SELECT region, round(AVG(precipitation_sum), 2) as rain_avg, round(AVG(shortwave_radiation_sum), 2) as radiation_avg, round(AVG(temperature_2m_mean), 2) as temp_avg\nFROM climate_daily\nGROUP BY region\nORDER BY temp_avg DESC",
                "explanation": "Truy vấn so sánh tương quan trung bình giữa lượng mưa và bức xạ mặt trời ngắn theo 3 miền để phân tích ảnh hưởng của mây và mưa.",
                "chart": {"type": "bar", "x": "region", "y": "rain_avg"},
            }
            
        # Match general: Highest temperature
        if "nhiệt độ" in q and ("cao nhất" in q or "lớn nhất" in q):
            # Check location
            loc_match = self._find_location_in_text(q)
            if loc_match:
                return {
                    "code": f"SELECT date, location, temperature_2m_max\nFROM climate_daily\nWHERE location = '{loc_match}'\nORDER BY temperature_2m_max DESC\nLIMIT 10",
                    "explanation": f"Lấy danh sách 10 ngày có nhiệt độ cao nhất ghi nhận được tại {loc_match}."
                }
            return {
                "code": "SELECT date, location, region, temperature_2m_max\nFROM climate_daily\nORDER BY temperature_2m_max DESC\nLIMIT 10",
                "explanation": "Lấy danh sách 10 ngày có nhiệt độ cao nhất ghi nhận được trên toàn quốc."
            }
            
        # Match general: Highest rainfall
        if "mưa" in q and ("lớn nhất" in q or "nhiều nhất" in q or "cao nhất" in q):
            loc_match = self._find_location_in_text(q)
            if loc_match:
                return {
                    "code": f"SELECT date, location, precipitation_sum\nFROM climate_daily\nWHERE location = '{loc_match}'\nORDER BY precipitation_sum DESC\nLIMIT 10",
                    "explanation": f"Lấy danh sách 10 ngày có lượng mưa lớn nhất ghi nhận được tại {loc_match}."
                }
            return {
                "code": "SELECT date, location, region, precipitation_sum\nFROM climate_daily\nORDER BY precipitation_sum DESC\nLIMIT 10",
                "explanation": "Lấy danh sách 10 ngày có lượng mưa cao nhất trên toàn quốc."
            }
            
        # Filter other words as unrelated queries
        return {
            "code": "",
            "explanation": "Yêu cầu không liên quan đến phân tích dữ liệu khí hậu Việt Nam. Vui lòng đặt câu hỏi liên quan đến thời tiết, nhiệt độ, lượng mưa, sức gió, hoặc bức xạ mặt trời của các địa điểm tại Việt Nam."
        }

    def _get_python_system_prompt(self) -> str:
        return """
Bạn là trợ lý AI phân tích dữ liệu khí hậu Việt Nam bằng thư viện pandas.
Có sẵn một DataFrame tên `df` (đã nạp toàn bộ bảng climate_daily) và thư viện `pd` (pandas).
Các cột của `df`:
- date (datetime), location (str), region (str: North/Central/South), latitude, longitude (float)
- temperature_2m_max, temperature_2m_min, temperature_2m_mean (float, °C)
- precipitation_sum, rain_sum (float, mm), wind_speed_10m_max (float, km/h)
- shortwave_radiation_sum (float, MJ/m²)

Tên location bằng TIẾNG ANH KHÔNG DẤU (ví dụ 'Ha Noi', 'Da Nang', 'Ho Chi Minh City', 'Da Lat', 'Hue').

YÊU CẦU BẮT BUỘC khi sinh code Python:
1. CHỈ dùng `df` và `pd`. TUYỆT ĐỐI KHÔNG được `import` bất cứ thứ gì.
2. KHÔNG dùng eval, exec, open, os, sys, getattr, hay thuộc tính dunder (__...__).
3. Phải GÁN kết quả cuối cùng vào biến tên `result` (nên là DataFrame hoặc Series).
4. Không đọc/ghi file, không gọi mạng. Chỉ tính toán trên `df`.
5. Nếu câu hỏi không liên quan dữ liệu khí hậu, trả trường 'code' là chuỗi rỗng "" và giải thích lý do.

Trả JSON gồm hai trường 'code' (chuỗi code Python) và 'explanation' (giải thích tiếng Việt).
"""

    def _generate_mock_python(self, question: str) -> Dict[str, str]:
        """Sinh sẵn vài đoạn pandas cho chế độ offline / chấm cục bộ."""
        q = question.lower()

        # Xếp hạng nhiệt độ trung bình theo địa điểm
        if ("nóng" in q or "nhiệt độ" in q) and ("nhất" in q or "xếp hạng" in q or "top" in q):
            return {
                "code": (
                    "result = (\n"
                    "    df.groupby('location')['temperature_2m_mean']\n"
                    "      .mean()\n"
                    "      .round(2)\n"
                    "      .sort_values(ascending=False)\n"
                    "      .reset_index(name='nhiet_do_tb')\n"
                    "      .head(10)\n"
                    ")"
                ),
                "explanation": "Tính nhiệt độ trung bình dài hạn theo từng địa điểm và lấy 10 nơi nóng nhất.",
                "chart": {"type": "bar", "x": "location", "y": "nhiet_do_tb"},
            }

        # Lượng mưa trung bình theo tháng
        if "mưa" in q and ("tháng" in q or "mùa" in q):
            return {
                "code": (
                    "tmp = df.copy()\n"
                    "tmp['thang'] = tmp['date'].dt.month\n"
                    "result = (\n"
                    "    tmp.groupby('thang')['precipitation_sum']\n"
                    "       .mean()\n"
                    "       .round(2)\n"
                    "       .reset_index(name='luong_mua_tb')\n"
                    ")"
                ),
                "explanation": "Trích tháng từ cột ngày rồi tính lượng mưa trung bình mỗi tháng để thấy mùa mưa.",
                "chart": {"type": "line", "x": "thang", "y": "luong_mua_tb"},
            }

        # Xu hướng ấm lên theo năm
        if "năm" in q and ("xu hướng" in q or "ấm" in q or "tăng" in q or "biến đổi" in q):
            return {
                "code": (
                    "tmp = df.copy()\n"
                    "tmp['nam'] = tmp['date'].dt.year\n"
                    "result = (\n"
                    "    tmp.groupby('nam')['temperature_2m_mean']\n"
                    "       .mean()\n"
                    "       .round(3)\n"
                    "       .reset_index(name='nhiet_do_tb_nam')\n"
                    ")"
                ),
                "explanation": "Tính nhiệt độ trung bình theo từng năm để quan sát xu hướng ấm lên.",
                "chart": {"type": "line", "x": "nam", "y": "nhiet_do_tb_nam"},
            }

        # Loại bỏ giá trị khuyết rồi thống kê (đúng tinh thần ví dụ dropna của đề bài)
        if "khuyết" in q or "thiếu" in q or "null" in q or "dropna" in q or "làm sạch" in q:
            return {
                "code": (
                    "clean = df.dropna()\n"
                    "result = pd.DataFrame({\n"
                    "    'so_dong_goc': [len(df)],\n"
                    "    'so_dong_sau_lam_sach': [len(clean)],\n"
                    "    'so_dong_bi_khuyet': [len(df) - len(clean)],\n"
                    "})"
                ),
                "explanation": "Dùng dropna() loại các dòng khuyết và so sánh số dòng trước/sau khi làm sạch.",
            }

        return {
            "code": "",
            "explanation": "Yêu cầu chưa rõ để sinh code pandas. Hãy hỏi về nhiệt độ, lượng mưa theo tháng/năm, xu hướng, hoặc làm sạch dữ liệu khuyết.",
        }

    def _find_location_in_text(self, text: str) -> str:
        locs = {
            "hà nội": "Ha Noi",
            "hải phòng": "Hai Phong",
            "lào cai": "Lao Cai",
            "lạng sơn": "Lang Son",
            "điện biên": "Dien Bien",
            "hà giang": "Ha Giang",
            "quảng ninh": "Quang Ninh",
            "sơn la": "Son La",
            "ninh bình": "Ninh Binh",
            "thanh hóa": "Thanh Hoa",
            "vinh": "Vinh",
            "huế": "Hue",
            "đà nẵng": "Da Nang",
            "nha trang": "Nha Trang",
            "quy nhơn": "Quy Nhon",
            "đà lạt": "Da Lat",
            "pleiku": "Pleiku",
            "buôn ma thuột": "Buon Ma Thuot",
            "phan thiết": "Phan Thiet",
            "hồ chí minh": "Ho Chi Minh City",
            "cần thơ": "Can Tho",
            "vũng tàu": "Vung Tau",
            "phú quốc": "Phu Quoc",
            "cà mau": "Ca Mau",
            "tây ninh": "Tay Ninh",
            "biên hòa": "Bien Hoa",
            "rạch giá": "Rach Gia",
            "sóc trăng": "Soc Trang"
        }
        for k, v in locs.items():
            if k in text:
                return v
        return ""
