/**
 * Chuẩn hóa tên cột thô (snake_case, tiếng Anh hoặc tiếng Việt không dấu)
 * thành nhãn tiếng Việt dễ đọc cho bảng kết quả và trục biểu đồ của AI Portal.
 * Tên cột gốc vẫn được giữ làm khóa dữ liệu — chỉ đổi phần hiển thị.
 *
 * Thuật toán: [danh từ lõi] + [định ngữ], đúng trật tự tiếng Việt
 * (vd. temperature_2m_mean -> "Nhiệt độ trung bình", không phải "Trung bình nhiệt độ").
 * Token được khớp không phụ thuộc thứ tự xuất hiện trong tên cột gốc.
 */

// Cột chính xác đã biết trước (cột gốc dataset + alias thường gặp trong mock AI)
const KNOWN_COLUMN_LABELS: Record<string, string> = {
  date: "Ngày",
  location: "Địa điểm",
  region: "Miền",
  latitude: "Vĩ độ",
  longitude: "Kinh độ",
  temperature_2m_max: "Nhiệt độ cao nhất (°C)",
  temperature_2m_min: "Nhiệt độ thấp nhất (°C)",
  temperature_2m_mean: "Nhiệt độ trung bình (°C)",
  precipitation_sum: "Tổng lượng mưa (mm)",
  rain_sum: "Lượng mưa (mm)",
  wind_speed_10m_max: "Tốc độ gió tối đa (km/h)",
  shortwave_radiation_sum: "Bức xạ mặt trời (MJ/m²)",
  thang: "Tháng",
  nam: "Năm",
  so_dong_goc: "Số dòng gốc",
  so_dong_sau_lam_sach: "Số dòng sau làm sạch",
  so_dong_bi_khuyet: "Số dòng bị khuyết",
};

// Đơn vị hậu tố — tách riêng và hiển thị dạng "(mm)", "(°C)"...
const UNIT_SUFFIX: Record<string, string> = {
  mm: "mm", mj: "MJ/m²", km: "km/h", kmh: "km/h",
  c: "°C", celsius: "°C", deg: "°",
};

// Suy luận đơn vị theo danh từ lõi khi tên cột KHÔNG có sẵn hậu tố đơn vị
// (vd. "temp_avg" không có "_c" nhưng vẫn nên hiện "(°C)").
const UNIT_BY_CORE: Record<string, string> = {
  "nhiệt độ": "°C",
  "lượng mưa": "mm",
  "mưa": "mm",
  "tốc độ gió": "km/h",
  "tốc độ": "km/h",
  "gió": "km/h", // trong dataset này, "gió" luôn ám chỉ tốc độ gió (không có chỉ số hướng gió)
  "bức xạ mặt trời": "MJ/m²",
  "bức xạ": "MJ/m²",
};

// Định ngữ khiến đại lượng đổi bản chất (đếm/tỉ lệ) — không nên gắn đơn vị vật lý gốc
const UNIT_SUPPRESSING_QUALIFIERS = new Set(["số lượng", "số", "tỉ lệ", "phần trăm"]);

// Danh từ lõi (khái niệm chính) — khớp theo tập token, không phụ thuộc thứ tự,
// duyệt từ dài (nhiều token) đến ngắn để ưu tiên cụm cụ thể hơn.
const CORE_PHRASES: { need: string[]; label: string }[] = [
  { need: ["solar", "radiation"], label: "bức xạ mặt trời" },
  { need: ["wind", "speed"], label: "tốc độ gió" },
  { need: ["toc", "do", "gio"], label: "tốc độ gió" },
  { need: ["nhiet", "do"], label: "nhiệt độ" },
  { need: ["buc", "xa"], label: "bức xạ" },
  { need: ["luong", "mua"], label: "lượng mưa" },
  { need: ["dia", "diem"], label: "địa điểm" },
  { need: ["vi", "do"], label: "vĩ độ" },
  { need: ["kinh", "do"], label: "kinh độ" },
  { need: ["toc", "do"], label: "tốc độ" },
  { need: ["temperature"], label: "nhiệt độ" },
  { need: ["temp"], label: "nhiệt độ" },
  { need: ["radiation"], label: "bức xạ" },
  { need: ["precipitation"], label: "lượng mưa" },
  { need: ["precip"], label: "lượng mưa" },
  { need: ["rainfall"], label: "lượng mưa" },
  { need: ["rain"], label: "mưa" },
  { need: ["mua"], label: "mưa" },
  { need: ["wind"], label: "gió" },
  { need: ["gio"], label: "gió" },
  { need: ["speed"], label: "tốc độ" },
  { need: ["region"], label: "miền" },
  { need: ["mien"], label: "miền" },
  { need: ["location"], label: "địa điểm" },
  { need: ["station"], label: "trạm" },
  { need: ["tram"], label: "trạm" },
];

// Mốc thời gian — nếu đứng MỘT MÌNH thì là danh từ lõi ("Năm"),
// nếu đi kèm danh từ lõi khác thì lùi thành định ngữ hậu tố ("... hàng năm").
const TIME_TOKENS: { need: string[]; bare: string; qualifier: string }[] = [
  { need: ["year"], bare: "năm", qualifier: "hàng năm" },
  { need: ["nam"], bare: "năm", qualifier: "hàng năm" },
  { need: ["month"], bare: "tháng", qualifier: "hàng tháng" },
  { need: ["thang"], bare: "tháng", qualifier: "hàng tháng" },
  { need: ["date"], bare: "ngày", qualifier: "theo ngày" },
  { need: ["ngay"], bare: "ngày", qualifier: "theo ngày" },
  { need: ["day"], bare: "ngày", qualifier: "theo ngày" },
];

// Định ngữ — khớp trên phần token còn lại sau CORE_PHRASES.
// pos "post": tính từ, đứng SAU danh từ (trung bình, cao nhất...).
// pos "pre": lượng từ, đứng TRƯỚC danh từ (tổng, số lượng...) — đúng ngữ pháp tiếng Việt.
const QUALIFIER_PHRASES: { need: string[]; label: string; pos: "pre" | "post" }[] = [
  { need: ["cao", "nhat"], label: "cao nhất", pos: "post" },
  { need: ["thap", "nhat"], label: "thấp nhất", pos: "post" },
  { need: ["lon", "nhat"], label: "lớn nhất", pos: "post" },
  { need: ["trung", "binh"], label: "trung bình", pos: "post" },
  { need: ["tb"], label: "trung bình", pos: "post" },
  { need: ["avg"], label: "trung bình", pos: "post" },
  { need: ["mean"], label: "trung bình", pos: "post" },
  { need: ["max"], label: "cao nhất", pos: "post" },
  { need: ["min"], label: "thấp nhất", pos: "post" },
  { need: ["sum"], label: "tổng", pos: "pre" },
  { need: ["total"], label: "tổng", pos: "pre" },
  { need: ["tong"], label: "tổng", pos: "pre" },
  { need: ["count"], label: "số lượng", pos: "pre" },
  { need: ["std"], label: "độ lệch chuẩn", pos: "pre" },
  { need: ["deviation"], label: "độ lệch", pos: "pre" },
  { need: ["do", "lech"], label: "độ lệch", pos: "pre" },
  { need: ["chenh", "lech"], label: "chênh lệch", pos: "pre" },
  { need: ["lech"], label: "lệch", pos: "pre" },
  { need: ["diff"], label: "chênh lệch", pos: "pre" },
  { need: ["ty", "le"], label: "tỉ lệ", pos: "pre" },
  { need: ["ratio"], label: "tỉ lệ", pos: "pre" },
  { need: ["rate"], label: "tỉ lệ", pos: "pre" },
  { need: ["percent"], label: "phần trăm", pos: "pre" },
  { need: ["phan", "tram"], label: "phần trăm", pos: "pre" },
  { need: ["so"], label: "số", pos: "pre" },
  { need: ["annual"], label: "hàng năm", pos: "post" },
  { need: ["daily"], label: "hàng ngày", pos: "post" },
  { need: ["monthly"], label: "hàng tháng", pos: "post" },
];

// Dự phòng: dịch từng âm tiết còn sót lại sau khi đã khớp cụm ở trên,
// chủ yếu để khôi phục dấu cho tiếng Việt không dấu (vd. "do" -> "độ").
const FALLBACK_TOKENS: Record<string, string> = {
  do: "độ", ty: "tỉ", le: "lệ", so: "số", lon: "lớn", nho: "nhỏ",
  du: "dự", bao: "báo", nhom: "nhóm", tuong: "tương", dong: "đồng",
  quan: "quan", he: "hệ", bat: "bất", thuong: "thường", cuc: "cực",
  doan: "đoạn", muc: "mức", gia: "giá", tri: "trị", khoang: "khoảng",
  cach: "cách", phan: "phần", loai: "loại", kieu: "kiểu", chi: "chỉ",
  correlation: "tương quan", coefficient: "hệ số", score: "điểm",
  index: "chỉ số", level: "mức độ", category: "loại", group: "nhóm",
  cluster: "cụm", anomaly: "bất thường", outlier: "ngoại lệ",
  trend: "xu hướng", change: "thay đổi", growth: "tăng trưởng",
};

const cache = new Map<string, string>();

function titleCaseFirst(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Nếu mọi token trong `need` có mặt trong `remaining`, xóa chúng khỏi `remaining` và trả true. */
function tryConsume(remaining: string[], need: string[]): boolean {
  const idxs: number[] = [];
  const pool = [...remaining];
  for (const t of need) {
    const idx = pool.indexOf(t);
    if (idx === -1) return false;
    pool.splice(idx, 1);
  }
  for (const t of need) {
    idxs.push(remaining.indexOf(t));
  }
  idxs
    .sort((a, b) => b - a)
    .forEach((idx) => remaining.splice(idx, 1));
  return true;
}

export function humanizeColumn(col: string): string {
  if (!col) return col;
  const cached = cache.get(col);
  if (cached) return cached;

  const known = KNOWN_COLUMN_LABELS[col];
  if (known) {
    cache.set(col, known);
    return known;
  }

  // Phòng trường hợp AI đặt tên kiểu camelCase thay vì snake_case
  const snakeCased = col.replace(/([a-z0-9])([A-Z])/g, "$1_$2");
  let tokens = snakeCased.split("_").filter(Boolean).map((t) => t.toLowerCase());

  // Tách hậu tố đơn vị (token cuối)
  let unit = "";
  const last = tokens[tokens.length - 1];
  if (last && UNIT_SUFFIX[last] && tokens.length > 1) {
    unit = UNIT_SUFFIX[last];
    tokens = tokens.slice(0, -1);
  }

  const remaining = [...tokens];

  // 1) Khớp danh từ lõi (dài trước, để ưu tiên cụm cụ thể hơn)
  const coreParts: string[] = [];
  for (const phrase of CORE_PHRASES) {
    if (tryConsume(remaining, phrase.need)) coreParts.push(phrase.label);
  }

  // 2) Khớp định ngữ (trung bình / cao nhất...) — tách trước/sau danh từ
  const preParts: string[] = [];
  const postParts: string[] = [];
  for (const phrase of QUALIFIER_PHRASES) {
    if (tryConsume(remaining, phrase.need)) {
      (phrase.pos === "pre" ? preParts : postParts).push(phrase.label);
    }
  }

  // 3) Mốc thời gian: đứng một mình -> danh từ lõi; đi kèm danh từ khác -> định ngữ hậu tố
  for (const phrase of TIME_TOKENS) {
    if (tryConsume(remaining, phrase.need)) {
      if (coreParts.length === 0) coreParts.push(phrase.bare);
      else postParts.push(phrase.qualifier);
    }
  }

  // 4) Token không nhận diện được — dịch dự phòng theo từng âm tiết, giữ nguyên nếu không rõ
  const leftover = remaining.map((t) => FALLBACK_TOKENS[t] || t);

  // 5) Nếu tên cột không có sẵn hậu tố đơn vị, suy luận đơn vị theo danh từ lõi
  //    (bỏ qua khi định ngữ đã đổi bản chất đại lượng thành đếm/tỉ lệ)
  const hasSuppressingQualifier = [...preParts, ...postParts].some((p) => UNIT_SUPPRESSING_QUALIFIERS.has(p));
  if (!unit && !hasSuppressingQualifier && coreParts.length > 0) {
    unit = UNIT_BY_CORE[coreParts[0]] || "";
  }

  const parts = [...preParts, ...coreParts, ...postParts, ...leftover].filter(Boolean);
  let label = parts.length ? titleCaseFirst(parts.join(" ")) : titleCaseFirst(tokens.join(" "));
  if (unit) label += ` (${unit})`;

  cache.set(col, label);
  return label;
}
