import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import prepareBoxplotData from "echarts/extension/dataTool/prepareBoxplotData";
import "./styles.css";
import vietnamGeo from "./vietnam-geo.json";
import { Icon } from "./Icon";
import { Select } from "./Select";
import { humanizeColumn } from "./columnLabels";
import {
  PALETTE,
  REGION_COLORS,
  TEMP_GRADIENT,
  CORR_GRADIENT,
  SANS_FONT,
  tooltipStyle,
  axisLabel,
  axisLineSoft,
  splitLineSoft,
  nameTextStyle,
  legendStyle,
  chartTitle,
} from "./theme";

// Register the Vietnam outline once so the overview map renders on a real map.
echarts.registerMap("vietnam", vietnamGeo as any);

const API_BASE_URL = "http://localhost:8000";

const REGION_VI: Record<string, string> = {
  North: "Miền Bắc",
  Central: "Miền Trung",
  South: "Miền Nam",
};

const STATION_VI: Record<string, string> = {
  "Ha Noi": "Hà Nội",
  "Hai Phong": "Hải Phòng",
  "Lao Cai": "Lào Cai",
  "Lang Son": "Lạng Sơn",
  "Dien Bien": "Điện Biên",
  "Ha Giang": "Hà Giang",
  "Quang Ninh": "Quảng Ninh",
  "Son La": "Sơn La",
  "Ninh Binh": "Ninh Bình",
  "Thanh Hoa": "Thanh Hóa",
  "Vinh": "Vinh",
  "Hue": "Huế",
  "Da Nang": "Đà Nẵng",
  "Nha Trang": "Nha Trang",
  "Quy Nhon": "Quy Nhơn",
  "Da Lat": "Đà Lạt",
  "Pleiku": "Pleiku",
  "Buon Ma Thuot": "Buôn Ma Thuột",
  "Phan Thiet": "Phan Thiết",
  "Ho Chi Minh City": "TP. Hồ Chí Minh",
  "Can Tho": "Cần Thơ",
  "Vung Tau": "Vũng Tàu",
  "Phu Quoc": "Phú Quốc",
  "Ca Mau": "Cà Mau",
  "Tay Ninh": "Tây Ninh",
  "Bien Hoa": "Biên Hòa",
  "Rach Gia": "Rạch Giá",
  "Soc Trang": "Sóc Trăng",
};

// inline custom-property helper for staggered reveals
const stagger = (i: number) => ({ "--i": i }) as React.CSSProperties;

type StationOverview = {
  location: string;
  region: string;
  latitude: number;
  longitude: number;
  avg_temp: number;
  max_temp: number;
  min_temp: number;
  annual_precip: number;
  avg_wind: number;
  avg_radiation: number;
  total_days: number;
};

type AnalysisKind = "sql" | "python";
type ChartType = "bar" | "line" | "pie" | "scatter";

type ChartSpec = { type: ChartType; x: string; y: string };

type Proposal = {
  id: string;
  question: string;
  code: string;
  explanation: string;
  kind: AnalysisKind;
  chart?: ChartSpec | null;
  status: string;
};

type AILog = {
  id: number;
  session_id: string;
  timestamp: string;
  question: string;
  sql_code: string;
  explanation: string;
  kind: string;
  status: string;
  error_message: string | null;
  row_count: number | null;
};

function App() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [stations, setStations] = useState<StationOverview[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("Ha Noi");

  // States for Explorer tab
  const [explorerLocation, setExplorerLocation] = useState<string>("All");
  const [explorerData, setExplorerData] = useState<any>(null);

  // States for Extreme Events tab
  const [tempThreshold, setTempThreshold] = useState<number>(38.0);
  const [rainThreshold, setRainThreshold] = useState<number>(100.0);
  const [extremeData, setExtremeData] = useState<any>(null);
  const [extremeLocFilter, setExtremeLocFilter] = useState<string>("All");

  // States for Relationship Lab tab
  const [relationshipData, setRelationshipData] = useState<any>(null);

  // States for AI Analyst tab
  const [aiQuestion, setAiQuestion] = useState<string>("");
  const [aiKind, setAiKind] = useState<AnalysisKind>("sql");
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
  const [proposalSql, setProposalSql] = useState<string>("");
  const [aiExecResults, setAiExecResults] = useState<any[] | null>(null);
  const [resultView, setResultView] = useState<"table" | "chart">("table");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [chartX, setChartX] = useState<string>("");
  const [chartY, setChartY] = useState<string>("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiExecLoading, setAiExecLoading] = useState<boolean>(false);
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [logPage, setLogPage] = useState<number>(1);
  const LOG_PAGE_SIZE = 5;

  // General Loading/Error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Biểu đồ đang được phóng to toàn màn hình (null = không có)
  const [expandedChart, setExpandedChart] = useState<{ title: string; option: any } | null>(null);

  // Đóng modal phóng to bằng phím Esc + khóa cuộn trang nền khi đang mở
  useEffect(() => {
    if (!expandedChart) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedChart(null);
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [expandedChart]);

  // Map chart ref (for resetting zoom/pan reliably)
  const mapRef = useRef<any>(null);
  // Ref tới khung đề xuất để cuộn tới khi xem lại một phiên nhật ký
  const proposalRef = useRef<HTMLDivElement>(null);

  // Fetch Overview Data on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dataset/overview`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể kết nối đến Backend API");
        return res.json();
      })
      .then((data) => {
        setStations(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Fetch Explorer Data when activeTab or explorerLocation changes
  useEffect(() => {
    if (activeTab === "explorer") {
      let url = `${API_BASE_URL}/api/dataset/explorer`;
      if (explorerLocation !== "All") {
        url += `?location=${encodeURIComponent(explorerLocation)}`;
      }
      fetch(url)
        .then((res) => res.json())
        .then((data) => setExplorerData(data))
        .catch((err) => console.error(err));
    }
  }, [activeTab, explorerLocation]);

  // Fetch Extreme Events Data
  useEffect(() => {
    if (activeTab === "extreme") {
      let url = `${API_BASE_URL}/api/dataset/extreme-events?temp_threshold=${tempThreshold}&rain_threshold=${rainThreshold}`;
      if (extremeLocFilter !== "All") {
        url += `&location=${encodeURIComponent(extremeLocFilter)}`;
      }
      fetch(url)
        .then((res) => res.json())
        .then((data) => setExtremeData(data))
        .catch((err) => console.error(err));
    }
  }, [activeTab, tempThreshold, rainThreshold, extremeLocFilter]);

  // Fetch Relationship Data
  useEffect(() => {
    if (activeTab === "relationship") {
      fetch(`${API_BASE_URL}/api/dataset/relationship`)
        .then((res) => res.json())
        .then((data) => setRelationshipData(data))
        .catch((err) => console.error(err));
    }
  }, [activeTab]);

  const activeStationData = stations.find((s) => s.location === selectedStation) || stations[0];

  // ============================================================
  //  Kết luận & câu chuyện dữ liệu — tính tự động từ số liệu thật
  // ============================================================
  const viName = (loc: string) => STATION_VI[loc] || loc;

  // Hồi quy tuyến tính đơn giản: trả về hệ số góc (đơn vị / năm)
  const linearSlope = (pts: { x: number; y: number }[]): number => {
    const n = pts.length;
    if (n < 2) return 0;
    const sx = pts.reduce((a, p) => a + p.x, 0);
    const sy = pts.reduce((a, p) => a + p.y, 0);
    const sxx = pts.reduce((a, p) => a + p.x * p.x, 0);
    const sxy = pts.reduce((a, p) => a + p.x * p.y, 0);
    const denom = n * sxx - sx * sx;
    return denom === 0 ? 0 : (n * sxy - sx * sy) / denom;
  };

  const overviewInsights = useMemo<string[]>(() => {
    if (!stations.length) return [];
    const hottest = [...stations].sort((a, b) => b.avg_temp - a.avg_temp)[0];
    const coolest = [...stations].sort((a, b) => a.avg_temp - b.avg_temp)[0];
    const wettest = [...stations].sort((a, b) => b.annual_precip - a.annual_precip)[0];
    const driest = [...stations].sort((a, b) => a.annual_precip - b.annual_precip)[0];
    const windiest = [...stations].sort((a, b) => b.avg_wind - a.avg_wind)[0];
    return [
      `Nóng nhất: ${viName(hottest.location)} (${hottest.avg_temp}°C TB) — mát nhất: ${viName(coolest.location)} (${coolest.avg_temp}°C), chênh lệch ${(hottest.avg_temp - coolest.avg_temp).toFixed(1)}°C giữa các vùng.`,
      `Mưa nhiều nhất: ${viName(wettest.location)} (~${Math.round(wettest.annual_precip).toLocaleString("vi-VN")} mm/năm) — khô nhất: ${viName(driest.location)} (~${Math.round(driest.annual_precip).toLocaleString("vi-VN")} mm/năm).`,
      `Gió mạnh nhất ghi nhận tại ${viName(windiest.location)} (${windiest.avg_wind} km/h TB), thường là các trạm ven biển.`,
    ];
  }, [stations]);

  // Nhiệt độ TB theo năm (dùng chung cho insight text và biểu đồ xu hướng năm)
  const yearlyTempTrend = useMemo<{ x: number; y: number }[]>(() => {
    const matrix = explorerData?.heatmap_matrix || [];
    if (!matrix.length) return [];
    const byYear: Record<number, number[]> = {};
    matrix.forEach((h: any) => {
      (byYear[h.year_val] ||= []).push(h.avg_temp);
    });
    return Object.entries(byYear)
      .map(([y, arr]) => ({ x: Number(y), y: arr.reduce((a, v) => a + v, 0) / arr.length }))
      .sort((a, b) => a.x - b.x);
  }, [explorerData]);

  const explorerInsights = useMemo<string[]>(() => {
    if (!explorerData?.monthly_trends?.length) return [];
    const mt = explorerData.monthly_trends;
    const hotMonth = [...mt].sort((a: any, b: any) => b.avg_temp - a.avg_temp)[0];
    const rainMonth = [...mt].sort((a: any, b: any) => b.avg_rain - a.avg_rain)[0];
    const out = [
      `Tháng nóng nhất là Tháng ${hotMonth.month_num} (${hotMonth.avg_temp}°C TB); mùa mưa đỉnh điểm vào Tháng ${rainMonth.month_num} (~${Math.round(rainMonth.avg_rain)} mm).`,
    ];
    if (yearlyTempTrend.length >= 2) {
      const slope = linearSlope(yearlyTempTrend);
      const first = yearlyTempTrend[0];
      const last = yearlyTempTrend[yearlyTempTrend.length - 1];
      const dir = slope >= 0 ? "tăng" : "giảm";
      out.push(
        `Nhiệt độ TB năm ${dir} khoảng ${Math.abs(slope).toFixed(2)}°C/năm (${first.y.toFixed(1)}°C năm ${first.x} → ${last.y.toFixed(1)}°C năm ${last.x}), phản ánh xu hướng ấm lên.`,
      );
    }
    return out;
  }, [explorerData, yearlyTempTrend]);

  const explorerSummary = useMemo(() => {
    if (!explorerData?.monthly_trends?.length) return null;
    const trends = explorerData.monthly_trends;
    const avgTemp = trends.reduce((acc: number, cur: any) => acc + cur.avg_temp, 0) / trends.length;
    const maxRain = Math.max(...trends.map((t: any) => t.avg_rain));
    const highestTemp = Math.max(...trends.map((t: any) => t.avg_max_temp));
    return {
      avgTemp: avgTemp.toFixed(1),
      maxRain: maxRain.toFixed(1),
      highestTemp: highestTemp.toFixed(1)
    };
  }, [explorerData]);

  const extremeInsights = useMemo<string[]>(() => {
    if (!extremeData) return [];
    const topHot = (extremeData.counts_by_location || [])
      .slice()
      .sort((a: any, b: any) => b.hot_days_count - a.hot_days_count)[0];
    const topWet = (extremeData.counts_by_location || [])
      .slice()
      .sort((a: any, b: any) => b.wet_days_count - a.wet_days_count)[0];
    const out = [
      `Với ngưỡng hiện tại: ${Number(extremeData.total_hot_count || 0).toLocaleString("vi-VN")} ngày nắng nóng và ${Number(extremeData.total_wet_count || 0).toLocaleString("vi-VN")} ngày mưa lớn trên toàn bộ dữ liệu.`,
    ];
    if (topHot) out.push(`Nhiều ngày nắng nóng nhất: ${viName(topHot.location)} (${topHot.hot_days_count} ngày).`);
    if (topWet) out.push(`Nhiều ngày mưa lớn nhất: ${viName(topWet.location)} (${topWet.wet_days_count} ngày).`);
    return out;
  }, [extremeData]);

  const relationshipInsights = useMemo<string[]>(() => {
    const cm = relationshipData?.correlation_matrix;
    if (!cm) return [];
    const labels: Record<string, string> = {
      temperature_2m_mean: "nhiệt độ",
      precipitation_sum: "lượng mưa",
      wind_speed_10m_max: "tốc độ gió",
      shortwave_radiation_sum: "bức xạ mặt trời",
    };
    const keys = Object.keys(cm);
    let best: { a: string; b: string; v: number } | null = null;
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const v = cm[keys[i]]?.[keys[j]];
        if (typeof v === "number" && (!best || Math.abs(v) > Math.abs(best.v))) {
          best = { a: keys[i], b: keys[j], v };
        }
      }
    }
    if (!best) return [];
    const strength = Math.abs(best.v) >= 0.6 ? "mạnh" : Math.abs(best.v) >= 0.3 ? "trung bình" : "yếu";
    const dir = best.v >= 0 ? "thuận" : "nghịch";
    return [
      `Tương quan nổi bật nhất: ${labels[best.a]} ↔ ${labels[best.b]} (r = ${best.v}), quan hệ ${dir} mức ${strength}.`,
      `Bức xạ mặt trời và lượng mưa thường tương quan nghịch: ngày nhiều mây/mưa nhận ít bức xạ hơn.`,
    ];
  }, [relationshipData]);

  const relationshipSummary = useMemo(() => {
    const cm = relationshipData?.correlation_matrix;
    if (!cm) return null;
    const tempRain = cm.temperature_2m_mean?.precipitation_sum ?? 0;
    const tempRadiation = cm.temperature_2m_mean?.shortwave_radiation_sum ?? 0;
    const rainWind = cm.precipitation_sum?.wind_speed_10m_max ?? 0;
    return {
      tempRain: tempRain.toFixed(2),
      tempRadiation: tempRadiation.toFixed(2),
      rainWind: rainWind.toFixed(2)
    };
  }, [relationshipData]);

  // AI Analyst flows
  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setCurrentProposal(null);
    setAiExecResults(null);

    fetch(`${API_BASE_URL}/api/ai/proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: aiQuestion, kind: aiKind }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((e) => {
            throw new Error(e.detail || "Gửi câu hỏi thất bại hoặc câu hỏi quá ngắn.");
          });
        }
        return res.json();
      })
      .then((data) => {
        setCurrentProposal(data);
        setProposalSql(data.code);
        setAiLoading(false);
      })
      .catch((err) => {
        setAiError(err.message);
        setAiLoading(false);
      });
  };

  const handleApproveAndExecute = () => {
    if (!currentProposal) return;
    setAiExecLoading(true);
    setAiError(null);

    // 1. Approve Code
    fetch(`${API_BASE_URL}/api/ai/proposals/${currentProposal.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: proposalSql }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => { throw new Error(e.detail || "Không thể phê duyệt mã SQL"); });
        return res.json();
      })
      .then((approvedProposal) => {
        // 2. Execute approved query
        return fetch(`${API_BASE_URL}/api/ai/proposals/${approvedProposal.id}/execute`, {
          method: "POST",
        });
      })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => { throw new Error(e.detail || "Thực thi SQL thất bại"); });
        return res.json();
      })
      .then((data) => {
        setAiExecResults(data.results);
        applyChartSuggestion(data.results, currentProposal?.chart ?? null);
        setResultView("table");
        setCurrentProposal((prev) => (prev ? { ...prev, status: "executed" } : null));
        setAiExecLoading(false);
        fetchLogs();
      })
      .catch((err) => {
        setAiError(err.message);
        setAiExecLoading(false);
      });
  };

  const handleRejectProposal = () => {
    if (!currentProposal) return;
    fetch(`${API_BASE_URL}/api/ai/proposals/${currentProposal.id}/reject`, {
      method: "POST",
    })
      .then(() => {
        setCurrentProposal(null);
        setAiQuestion("");
      })
      .catch((err) => console.error(err));
  };

  const handleSuggestQuestion = (qText: string) => {
    setAiQuestion(qText);
  };

  // Xem lại một phiên nhật ký: nạp câu hỏi/code/giải thích vào khung đề xuất để chạy lại
  const handleViewLog = (logRow: AILog) => {
    const restored: Proposal = {
      id: logRow.session_id,
      question: logRow.question,
      code: logRow.sql_code,
      explanation: logRow.explanation,
      kind: (logRow.kind as AnalysisKind) || "sql",
      chart: null,
      status: "draft",
    };
    setAiKind(restored.kind);
    setCurrentProposal(restored);
    setProposalSql(restored.code);
    setAiExecResults(null);
    setAiError(null);
    setTimeout(() => proposalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const fetchLogs = () => {
    setLogsLoading(true);
    fetch(`${API_BASE_URL}/api/ai/logs?limit=100`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải nhật ký AI");
        return res.json();
      })
      .then((data) => {
        setAiLogs(data);
        setLogPage(1);
        setLogsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLogsLoading(false);
      });
  };

  // Tải lại nhật ký AI mỗi khi mở tab AI Portal
  useEffect(() => {
    if (activeTab === "ai") fetchLogs();
  }, [activeTab]);

  // ============================================================
  //  Sinh biểu đồ từ kết quả AI (Phase A: frontend tự dựng)
  // ============================================================
  const isNumericColumn = (rows: any[], col: string) =>
    rows.length > 0 && rows.every((r) => r[col] === null || typeof r[col] === "number");

  const initChartAxes = (rows: any[]) => {
    if (!rows || rows.length === 0) {
      setChartX("");
      setChartY("");
      return;
    }
    const cols = Object.keys(rows[0]);
    const numeric = cols.filter((c) => isNumericColumn(rows, c));
    const categorical = cols.filter((c) => !numeric.includes(c));
    const x = categorical[0] || cols[0];
    const y = numeric.find((c) => c !== x) || numeric[0] || cols[1] || cols[0];
    setChartX(x);
    setChartY(y);
    setChartType(numeric.length >= 2 && categorical.length === 0 ? "scatter" : "bar");
  };

  // Ưu tiên biểu đồ AI gợi ý nếu hợp lệ, nếu không thì tự suy ra
  const applyChartSuggestion = (rows: any[], suggestion: ChartSpec | null) => {
    if (rows && rows.length > 0 && suggestion) {
      const cols = Object.keys(rows[0]);
      if (cols.includes(suggestion.x) && cols.includes(suggestion.y)) {
        setChartType(suggestion.type);
        setChartX(suggestion.x);
        setChartY(suggestion.y);
        return;
      }
    }
    initChartAxes(rows);
  };

  const getResultChartOption = () => {
    const rows = aiExecResults || [];
    if (!rows.length || !chartX || !chartY) return {};
    const capped = rows.slice(0, 100);

    if (chartType === "pie") {
      return {
        tooltip: { ...tooltipStyle, trigger: "item" },
        legend: { ...legendStyle, type: "scroll", bottom: 0 },
        series: [
          {
            type: "pie",
            radius: ["38%", "68%"],
            center: ["50%", "46%"],
            data: capped.map((r) => ({ name: String(r[chartX]), value: r[chartY] })),
            label: { color: PALETTE.ink, fontFamily: SANS_FONT },
          },
        ],
      };
    }

    if (chartType === "scatter") {
      // Scatter cần trục số; nếu X là cột phân loại (chữ) thì dùng trục category
      const xIsNumeric = isNumericColumn(capped, chartX);
      return {
        tooltip: { ...tooltipStyle, trigger: "item" },
        grid: { left: 70, right: 30, top: 24, bottom: 60 },
        xAxis: {
          type: xIsNumeric ? "value" : "category",
          data: xIsNumeric ? undefined : capped.map((r) => String(r[chartX])),
          name: humanizeColumn(chartX),
          nameLocation: "middle",
          nameGap: 34,
          nameTextStyle,
          axisLabel,
          axisLine: axisLineSoft,
          splitLine: splitLineSoft,
        },
        yAxis: {
          type: "value",
          name: humanizeColumn(chartY),
          nameLocation: "middle",
          nameGap: 52,
          nameTextStyle,
          axisLabel,
          axisLine: axisLineSoft,
          splitLine: splitLineSoft,
        },
        series: [
          {
            type: "scatter",
            symbolSize: 11,
            itemStyle: { color: PALETTE.clay, opacity: 0.75 },
            data: capped.map((r) => [xIsNumeric ? r[chartX] : String(r[chartX]), r[chartY]]),
          },
        ],
      };
    }

    // bar / line
    return {
      tooltip: { ...tooltipStyle, trigger: "axis" },
      grid: { left: 76, right: 24, top: 36, bottom: 70 },
      xAxis: {
        type: "category",
        data: capped.map((r) => String(r[chartX])),
        name: humanizeColumn(chartX),
        nameLocation: "middle",
        nameGap: 44,
        nameTextStyle,
        axisLabel: { ...axisLabel, rotate: capped.length > 8 ? 40 : 0 },
        axisLine: axisLineSoft,
      },
      yAxis: {
        type: "value",
        name: humanizeColumn(chartY),
        nameLocation: "middle",
        nameGap: 56,
        nameTextStyle,
        axisLabel,
        axisLine: axisLineSoft,
        splitLine: splitLineSoft,
      },
      series: [
        {
          type: chartType,
          smooth: chartType === "line",
          data: capped.map((r) => r[chartY]),
          itemStyle: { color: PALETTE.clay },
          areaStyle: chartType === "line" ? { opacity: 0.12 } : undefined,
        },
      ],
    };
  };

  // Thẻ biểu đồ dùng chung cho lưới 2×2 — kèm nút phóng to toàn màn hình
  const renderChartCard = (
    title: string,
    option: any,
    ready: boolean,
    opts?: { span2?: boolean; onEvents?: any; notMerge?: boolean; placeholder?: string; caption?: string; height?: number },
  ) => {
    const height = opts?.height ?? 340;
    return (
      <div className={`panel chart-card reveal ${opts?.span2 ? "span-2" : ""}`} key={title}>
        <div className="chart-card__head">
          <div>
            <span className="panel__label" style={{ margin: 0 }}>{title}</span>
            {opts?.caption && <span className="chart-card__caption">{opts.caption}</span>}
          </div>
          <button
            type="button"
            className="chart-expand-btn"
            title="Phóng to biểu đồ"
            aria-label={`Phóng to ${title}`}
            onClick={() => setExpandedChart({ title, option })}
            disabled={!ready}
          >
            <Icon name="expand" size={14} />
          </button>
        </div>
        <div className="chart-wrap" style={{ height }}>
          {ready ? (
            <ReactECharts
              option={option}
              style={{ height: "100%", width: "100%" }}
              onEvents={opts?.onEvents}
              notMerge={opts?.notMerge}
            />
          ) : (
            <div className="chart-placeholder" style={{ height: "100%" }}>
              {opts?.placeholder || "Đang dựng biểu đồ…"}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInsights = (items: string[]) => {
    if (!items.length) return null;
    return (
      <div className="panel insights reveal">
        <span className="panel__label">
          Kết luận &amp; câu chuyện dữ liệu
        </span>
        <ul className="insights__list">
          {items.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      </div>
    );
  };

  // ============================================================
  //  ECharts configurations — Editorial Climate Almanac palette
  // ============================================================

  // 1. Stations plotted on the real Vietnam map, coloured by region
  const getMapOption = () => {
    const regionSeries = (region: string, label: string) => ({
      name: label,
      type: "scatter",
      coordinateSystem: "geo",
      data: stations
        .filter((s) => s.region === region)
        .map((s) => ({
          name: s.location,
          value: [s.longitude, s.latitude, s.avg_temp, s.annual_precip],
        })),
      symbolSize: 13,
      itemStyle: {
        color: REGION_COLORS[region],
        borderColor: PALETTE.surface,
        borderWidth: 2,
        shadowColor: "rgba(40,50,30,0.30)",
        shadowBlur: 5,
      },
      label: {
        show: true,
        formatter: (p: any) => STATION_VI[p.name] || p.name,
        position: "right",
        color: PALETTE.ink,
        fontFamily: SANS_FONT,
        fontSize: 10.5,
        textBorderColor: PALETTE.surface,
        textBorderWidth: 3,
      },
      labelLayout: { hideOverlap: true, moveOverlap: "shiftY" },
      emphasis: {
        scale: 1.5,
        label: { show: true, fontWeight: "bold", fontSize: 12 },
      },
    });

    const selected = stations.find((s) => s.location === selectedStation);

    return {
      title: {
        ...chartTitle("Mạng lưới 28 trạm khí hậu"),
        subtext: "Cuộn để phóng to · kéo để di chuyển · click để chọn trạm",
        subtextStyle: { color: PALETTE.inkFaint, fontFamily: SANS_FONT, fontSize: 11 },
      },
      tooltip: {
        ...tooltipStyle,
        trigger: "item",
        formatter: (p: any) =>
          p.value && p.value.length >= 4
            ? `<strong>${STATION_VI[p.name] || p.name}</strong><br/>Nhiệt độ TB: ${p.value[2]}°C<br/>Lượng mưa năm: ${p.value[3]} mm`
            : STATION_VI[p.name] || p.name,
      },
      legend: {
        ...legendStyle,
        data: ["Miền Bắc", "Miền Trung", "Miền Nam"],
        bottom: 4,
        left: "center",
      },
      geo: {
        map: "vietnam",
        roam: true,
        scaleLimit: { min: 1, max: 8 },
        top: 58,
        bottom: 42,
        label: { show: false },
        itemStyle: {
          areaColor: "#E9EFE3",
          borderColor: "#A9BAA0",
          borderWidth: 1,
        },
        emphasis: { disabled: true },
      },
      series: [
        regionSeries("North", "Miền Bắc"),
        regionSeries("Central", "Miền Trung"),
        regionSeries("South", "Miền Nam"),
        {
          // ring marking the currently selected station (links map to detail panel)
          name: "__selected",
          type: "scatter",
          coordinateSystem: "geo",
          silent: true,
          z: 6,
          symbolSize: 26,
          itemStyle: {
            color: "transparent",
            borderColor: PALETTE.clay,
            borderWidth: 2.5,
          },
          data: selected ? [{ value: [selected.longitude, selected.latitude] }] : [],
        },
      ],
    };
  };

  const onChartClick = (params: any) => {
    if (params.seriesType === "scatter" && params.name) {
      setSelectedStation(params.name);
    }
  };

  const onExtremeChartClick = (params: any) => {
    if (params.name) {
      // Find the English key corresponding to the Vietnamese name clicked on the chart
      const engLoc = Object.keys(STATION_VI).find(key => STATION_VI[key] === params.name) || params.name;
      setExtremeLocFilter(engLoc);
    }
  };

  // Reset map zoom/pan to default by re-applying the current option (notMerge).
  const resetMapView = () => {
    mapRef.current?.getEchartsInstance?.().setOption(getMapOption(), { notMerge: true });
  };

  // 2. Monthly temperature trend
  const getTempTrendOption = () => {
    if (!explorerData || !explorerData.monthly_trends) return {};
    const months = explorerData.monthly_trends.map((t: any) => `Th${t.month_num}`);
    const avgTemps = explorerData.monthly_trends.map((t: any) => t.avg_temp);
    const maxTemps = explorerData.monthly_trends.map((t: any) => t.avg_max_temp);
    const minTemps = explorerData.monthly_trends.map((t: any) => t.avg_min_temp);

    return {
      tooltip: { ...tooltipStyle, trigger: "axis" },
      legend: { ...legendStyle, data: ["Tối đa", "Trung bình", "Tối thiểu"], top: 0 },
      grid: { left: 10, right: 18, top: 44, bottom: 10, containLabel: true },
      xAxis: { type: "category", data: months, axisLabel, axisLine: axisLineSoft },
      yAxis: {
        type: "value",
        name: "°C",
        scale: true,
        axisLabel,
        nameTextStyle,
        splitLine: splitLineSoft,
      },
      series: [
        { name: "Tối đa", type: "line", data: maxTemps, color: PALETTE.clay, smooth: true, symbol: "none", lineStyle: { width: 2 } },
        { name: "Trung bình", type: "line", data: avgTemps, color: PALETTE.amber, smooth: true, symbol: "circle", symbolSize: 6, lineStyle: { width: 3 }, areaStyle: { color: "rgba(201,138,30,0.10)" } },
        { name: "Tối thiểu", type: "line", data: minTemps, color: PALETTE.sky, smooth: true, symbol: "none", lineStyle: { width: 2 } },
      ],
    };
  };

  // 3. Monthly rainfall bars
  const getRainTrendOption = () => {
    if (!explorerData || !explorerData.monthly_trends) return {};
    const months = explorerData.monthly_trends.map((t: any) => `Th${t.month_num}`);
    const rain = explorerData.monthly_trends.map((t: any) => t.avg_rain);

    return {
      tooltip: { ...tooltipStyle, trigger: "axis" },
      grid: { left: 10, right: 18, top: 24, bottom: 10, containLabel: true },
      xAxis: { type: "category", data: months, axisLabel, axisLine: axisLineSoft },
      yAxis: { type: "value", name: "mm", axisLabel, nameTextStyle, splitLine: splitLineSoft },
      series: [
        {
          name: "Lượng mưa",
          type: "bar",
          data: rain,
          color: PALETTE.sky,
          barWidth: "56%",
          itemStyle: { borderRadius: [5, 5, 0, 0] },
          emphasis: { itemStyle: { color: PALETTE.forest } },
        },
      ],
    };
  };

  // 4. Month × Year temperature heatmap
  const getHeatmapOption = () => {
    if (!explorerData || !explorerData.heatmap_matrix) return {};
    const years = Array.from(new Set(explorerData.heatmap_matrix.map((h: any) => h.year_val))).sort();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const data = explorerData.heatmap_matrix.map((h: any) => {
      const yIdx = years.indexOf(h.year_val);
      const mIdx = h.month_val - 1;
      return [mIdx, yIdx, h.avg_temp];
    });

    return {
      tooltip: {
        ...tooltipStyle,
        position: "top",
        formatter: (p: any) => `Năm ${years[p.value[1]]} · Th${p.value[0] + 1}<br/><strong>${p.value[2]}°C</strong>`,
      },
      grid: { height: "66%", top: "8%", left: 48, right: 24 },
      xAxis: { type: "category", data: months.map((m) => `Th${m}`), splitArea: { show: true }, axisLabel, axisLine: axisLineSoft },
      yAxis: { type: "category", data: years.map(String), splitArea: { show: true }, axisLabel, axisLine: axisLineSoft },
      visualMap: {
        min: 15,
        max: 32,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "2%",
        textStyle: { color: PALETTE.inkSoft, fontFamily: SANS_FONT },
        inRange: { color: TEMP_GRADIENT },
      },
      series: [
        {
          name: "Nhiệt độ TB",
          type: "heatmap",
          data,
          label: { show: true, color: PALETTE.ink, fontFamily: SANS_FONT, fontSize: 9 },
          itemStyle: { borderColor: PALETTE.surface, borderWidth: 2 },
          emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(40,50,30,0.25)" } },
        },
      ],
    };
  };

  // 4b. Xu hướng nhiệt độ trung bình theo năm
  const getYearlyTempTrendOption = () => {
    if (!yearlyTempTrend.length) return {};
    return {
      tooltip: { ...tooltipStyle, trigger: "axis", formatter: (p: any) => `Năm ${p[0].axisValue}<br/><strong>${p[0].data}°C</strong>` },
      grid: { left: 52, right: 24, top: 24, bottom: 40 },
      xAxis: {
        type: "category",
        data: yearlyTempTrend.map((p) => String(p.x)),
        axisLabel,
        axisLine: axisLineSoft,
      },
      yAxis: { type: "value", name: "°C", scale: true, nameTextStyle, axisLabel, axisLine: axisLineSoft, splitLine: splitLineSoft },
      series: [
        {
          type: "line",
          smooth: true,
          symbolSize: 8,
          data: yearlyTempTrend.map((p) => Number(p.y.toFixed(2))),
          lineStyle: { color: PALETTE.clay, width: 3 },
          itemStyle: { color: PALETTE.clay },
          areaStyle: { opacity: 0.1, color: PALETTE.clay },
        },
      ],
    };
  };

  // 5. Pearson correlation matrix
  const getCorrOption = () => {
    if (!relationshipData || !relationshipData.correlation_matrix) return {};
    const variables = ["Nhiệt độ", "Lượng mưa", "Sức gió", "Bức xạ"];
    const varKeys = ["temperature_2m_mean", "precipitation_sum", "wind_speed_10m_max", "shortwave_radiation_sum"];

    const data: any[] = [];
    varKeys.forEach((k1, i1) => {
      varKeys.forEach((k2, i2) => {
        const val = relationshipData.correlation_matrix[k1][k2];
        data.push([i2, i1, val]);
      });
    });

    return {
      tooltip: {
        ...tooltipStyle,
        formatter: (p: any) => `${variables[p.value[1]]} × ${variables[p.value[0]]}<br/>Hệ số: <strong>${p.value[2]}</strong>`,
      },
      grid: { height: "62%", top: "6%", left: 70, right: 24 },
      xAxis: { type: "category", data: variables, axisLabel: { ...axisLabel, rotate: 18 }, axisLine: axisLineSoft },
      yAxis: { type: "category", data: variables, axisLabel, axisLine: axisLineSoft },
      visualMap: {
        min: -1,
        max: 1,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "2%",
        textStyle: { color: PALETTE.inkSoft, fontFamily: SANS_FONT },
        inRange: { color: CORR_GRADIENT },
      },
      series: [
        {
          name: "Tương quan Pearson",
          type: "heatmap",
          data,
          label: { show: true, formatter: (p: any) => p.value[2].toFixed(2), color: PALETTE.ink, fontFamily: SANS_FONT, fontWeight: "bold" },
          itemStyle: { borderColor: PALETTE.surface, borderWidth: 2 },
        },
      ],
    };
  };

  // 6. Radiation vs temperature scatter by region
  const getScatterOption = () => {
    if (!relationshipData || !relationshipData.scatter_sample) return {};
    const byRegion = {
      North: relationshipData.scatter_sample.filter((s: any) => s.region === "North"),
      Central: relationshipData.scatter_sample.filter((s: any) => s.region === "Central"),
      South: relationshipData.scatter_sample.filter((s: any) => s.region === "South"),
    };

    const mkSeries = (region: keyof typeof byRegion, label: string) => ({
      name: label,
      type: "scatter",
      data: byRegion[region].map((s: any) => [s.shortwave_radiation_sum, s.temperature_2m_mean]),
      color: REGION_COLORS[region],
      symbolSize: 7,
      itemStyle: { opacity: 0.62 },
    });

    return {
      tooltip: {
        ...tooltipStyle,
        trigger: "item",
        formatter: (p: any) => `${p.seriesName}<br/>Bức xạ: ${p.value[0]} MJ/m²<br/>Nhiệt độ: ${p.value[1]}°C`,
      },
      legend: { ...legendStyle, data: ["Miền Bắc", "Miền Trung", "Miền Nam"], top: 0 },
      grid: { left: 14, right: 20, top: 44, bottom: 14, containLabel: true },
      xAxis: { type: "value", name: "Bức xạ (MJ/m²)", axisLabel, nameTextStyle, splitLine: splitLineSoft },
      yAxis: { type: "value", name: "Nhiệt độ TB (°C)", scale: true, axisLabel, nameTextStyle: { ...nameTextStyle, align: "left", padding: [0, 0, 0, 10] }, splitLine: splitLineSoft },
      series: [mkSeries("North", "Miền Bắc"), mkSeries("Central", "Miền Trung"), mkSeries("South", "Miền Nam")],
    };
  };

  // 6b. Vĩ độ vs nhiệt độ trung bình — càng ra Bắc càng lạnh?
  const getLatTempScatterOption = () => {
    if (!relationshipData?.scatter_sample || !stations.length) return {};
    const latByLocation: Record<string, number> = {};
    stations.forEach((s) => { latByLocation[s.location] = s.latitude; });

    const byRegion = { North: [] as any[], Central: [] as any[], South: [] as any[] };
    relationshipData.scatter_sample.forEach((s: any) => {
      const lat = latByLocation[s.location];
      if (lat === undefined) return;
      const bucket = byRegion[s.region as keyof typeof byRegion];
      if (bucket) bucket.push([lat, s.temperature_2m_mean]);
    });

    const mkSeries = (region: keyof typeof byRegion, label: string) => ({
      name: label,
      type: "scatter",
      data: byRegion[region],
      color: REGION_COLORS[region],
      symbolSize: 7,
      itemStyle: { opacity: 0.62 },
    });

    return {
      tooltip: {
        ...tooltipStyle,
        trigger: "item",
        formatter: (p: any) => `${p.seriesName}<br/>Vĩ độ: ${p.value[0]}°<br/>Nhiệt độ: ${p.value[1]}°C`,
      },
      legend: { ...legendStyle, data: ["Miền Bắc", "Miền Trung", "Miền Nam"], top: 0 },
      grid: { left: 14, right: 20, top: 44, bottom: 14, containLabel: true },
      xAxis: { type: "value", name: "Vĩ độ (°)", scale: true, axisLabel, nameTextStyle, splitLine: splitLineSoft },
      yAxis: { type: "value", name: "Nhiệt độ TB (°C)", scale: true, axisLabel, nameTextStyle: { ...nameTextStyle, align: "left", padding: [0, 0, 0, 10] }, splitLine: splitLineSoft },
      series: [mkSeries("North", "Miền Bắc"), mkSeries("Central", "Miền Trung"), mkSeries("South", "Miền Nam")],
    };
  };

  // 6c. Phân bố nhiệt độ theo miền (box plot — thấy được độ trải, không chỉ trung bình)
  const getRegionBoxplotOption = () => {
    if (!relationshipData?.scatter_sample?.length) return {};
    const regions: (keyof typeof REGION_COLORS)[] = ["North", "Central", "South"];
    const regionLabels = ["Miền Bắc", "Miền Trung", "Miền Nam"];
    const raw = regions.map((r) =>
      relationshipData.scatter_sample
        .filter((s: any) => s.region === r)
        .map((s: any) => s.temperature_2m_mean),
    );
    if (raw.some((arr) => arr.length === 0)) return {};

    const { boxData, outliers } = prepareBoxplotData(raw);

    return {
      tooltip: { ...tooltipStyle, trigger: "item" },
      grid: { left: 14, right: 20, top: 24, bottom: 14, containLabel: true },
      xAxis: { type: "category", data: regionLabels, axisLabel, axisLine: axisLineSoft, boundaryGap: true },
      yAxis: { type: "value", name: "Nhiệt độ TB (°C)", scale: true, axisLabel, nameTextStyle: { ...nameTextStyle, align: "left", padding: [0, 0, 0, 10] }, splitLine: splitLineSoft },
      series: [
        {
          name: "Phân bố nhiệt độ",
          type: "boxplot",
          data: boxData,
          itemStyle: { color: "#e7efe7", borderColor: PALETTE.forest, borderWidth: 1.6 },
        },
        {
          name: "Giá trị ngoại lệ",
          type: "scatter",
          data: outliers,
          symbolSize: 6,
          itemStyle: { color: PALETTE.clay, opacity: 0.55 },
        },
      ],
    };
  };

  // 7. Extreme events bar chart
  const getExtremeChartOption = () => {
    if (!extremeData || !extremeData.counts_by_location) return {};
    const isAll = extremeLocFilter === "All";
    // Khi xem "tất cả", chỉ hiện Top 10 trạm cực đoan nhất (dữ liệu đã sort sẵn từ backend)
    // để tránh nhồi 28 nhãn trạm + thanh cuộn vào một thẻ nhỏ trong lưới 2×2.
    const topData = isAll ? extremeData.counts_by_location.slice(0, 10) : extremeData.counts_by_location;
    const locations = topData.map((c: any) => STATION_VI[c.location] || c.location);
    const hotDays = topData.map((c: any) => c.hot_days_count);
    const wetDays = topData.map((c: any) => c.wet_days_count);

    return {
      tooltip: { ...tooltipStyle, trigger: "axis" },
      legend: { ...legendStyle, data: ["Nắng nóng (≥38°C)", "Mưa lớn (≥100mm)"], top: 0 },
      grid: { left: 10, right: 18, top: 44, bottom: isAll ? 54 : 20, containLabel: true },
      xAxis: {
        type: "category",
        data: locations,
        axisLabel: { ...axisLabel, interval: 0, rotate: isAll ? 26 : 0 },
        axisLine: axisLineSoft,
      },
      yAxis: {
        type: "value",
        name: "Số ngày",
        axisLabel,
        nameTextStyle,
        splitLine: splitLineSoft,
      },
      series: [
        {
          name: "Nắng nóng (≥38°C)",
          type: "bar",
          data: hotDays,
          color: PALETTE.clay,
          barWidth: "28%",
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
        {
          name: "Mưa lớn (≥100mm)",
          type: "bar",
          data: wetDays,
          color: PALETTE.sky,
          barWidth: "28%",
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  };

  // Bản đồ điểm nóng cực đoan — kích thước điểm theo tổng số ngày vượt ngưỡng
  const getExtremeMapOption = () => {
    const counts = extremeData?.counts_by_location || [];
    if (!counts.length || !stations.length) return {};

    const byLocation: Record<string, StationOverview> = {};
    stations.forEach((s) => { byLocation[s.location] = s; });

    const points = counts
      .map((c: any) => {
        const s = byLocation[c.location];
        if (!s) return null;
        const total = (c.hot_days_count || 0) + (c.wet_days_count || 0);
        return {
          name: c.location,
          value: [s.longitude, s.latitude, total, c.hot_days_count, c.wet_days_count],
        };
      })
      .filter(Boolean);

    const maxTotal = Math.max(1, ...points.map((p: any) => p.value[2]));

    return {
      tooltip: {
        ...tooltipStyle,
        trigger: "item",
        formatter: (p: any) =>
          `<strong>${STATION_VI[p.name] || p.name}</strong><br/>Nắng nóng: ${p.value[3]} ngày<br/>Mưa lớn: ${p.value[4]} ngày`,
      },
      geo: {
        map: "vietnam",
        roam: true,
        scaleLimit: { min: 1, max: 8 },
        top: 10,
        bottom: 10,
        label: { show: false },
        itemStyle: { areaColor: "#D9E6D3", borderColor: "#7E9B76", borderWidth: 1.3 },
        emphasis: { disabled: true },
      },
      series: [
        {
          type: "scatter",
          coordinateSystem: "geo",
          data: points,
          symbolSize: (val: number[]) => 12 + (val[2] / maxTotal) * 28,
          itemStyle: {
            color: PALETTE.clay,
            opacity: 0.75,
            borderColor: PALETTE.surface,
            borderWidth: 1.5,
            shadowColor: "rgba(40,50,30,0.30)",
            shadowBlur: 5,
          },
          emphasis: { scale: 1.2 },
        },
      ],
    };
  };

  // Xu hướng ngày cực đoan theo năm
  const getExtremeYearlyOption = () => {
    const rows = extremeData?.counts_by_year || [];
    if (!rows.length) return {};
    return {
      tooltip: { ...tooltipStyle, trigger: "axis" },
      legend: { ...legendStyle, data: ["Nắng nóng", "Mưa lớn"], top: 0 },
      grid: { left: 10, right: 18, top: 44, bottom: 10, containLabel: true },
      xAxis: { type: "category", data: rows.map((r: any) => String(r.year_val)), axisLabel, axisLine: axisLineSoft },
      yAxis: { type: "value", name: "Số ngày", axisLabel, nameTextStyle, splitLine: splitLineSoft },
      series: [
        {
          name: "Nắng nóng",
          type: "line",
          smooth: true,
          data: rows.map((r: any) => r.hot_days_count),
          lineStyle: { color: PALETTE.clay, width: 3 },
          itemStyle: { color: PALETTE.clay },
        },
        {
          name: "Mưa lớn",
          type: "line",
          smooth: true,
          data: rows.map((r: any) => r.wet_days_count),
          lineStyle: { color: PALETTE.sky, width: 3 },
          itemStyle: { color: PALETTE.sky },
        },
      ],
    };
  };

  // Phân bố ngày cực đoan theo tháng (tính mùa vụ)
  const getExtremeMonthlyOption = () => {
    const rows = extremeData?.counts_by_month || [];
    if (!rows.length) return {};
    return {
      tooltip: { ...tooltipStyle, trigger: "axis" },
      legend: { ...legendStyle, data: ["Nắng nóng", "Mưa lớn"], top: 0 },
      grid: { left: 10, right: 18, top: 44, bottom: 10, containLabel: true },
      xAxis: { type: "category", data: rows.map((r: any) => `Th${r.month_val}`), axisLabel, axisLine: axisLineSoft },
      yAxis: { type: "value", name: "Số ngày", axisLabel, nameTextStyle, splitLine: splitLineSoft },
      series: [
        {
          name: "Nắng nóng",
          type: "bar",
          data: rows.map((r: any) => r.hot_days_count),
          color: PALETTE.clay,
          barWidth: "28%",
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
        {
          name: "Mưa lớn",
          type: "bar",
          data: rows.map((r: any) => r.wet_days_count),
          color: PALETTE.sky,
          barWidth: "28%",
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  };

  // ============================================================
  //  Render
  // ============================================================
  const navItems = [
    { id: "overview", label: "Tổng quan trạm đo", icon: "compass" as const },
    { id: "explorer", label: "Khám phá khí hậu", icon: "trend" as const },
    { id: "extreme", label: "Thời tiết cực đoan", icon: "alert" as const },
    { id: "relationship", label: "Tương quan khí hậu", icon: "scatter" as const },
    { id: "ai", label: "AI Analyst Portal", icon: "sparkle" as const },
  ];

  return (
    <div className="app">
      <aside className="rail">
        <div className="rail__brand">
          <span className="brand__mark">
            <Icon name="leaf" size={22} />
          </span>
          <span>
            <span className="brand__name">Climate Almanac</span>
            <span className="brand__sub">Việt Nam · 2020–2025</span>
          </span>
        </div>

        <nav className="rail__nav">
          {navItems.map((item, idx) => (
            <button
              key={item.id}
              className={`nav__item ${activeTab === item.id ? "is-active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav__index">{String(idx + 1).padStart(2, "0")}</span>
              <Icon name={item.icon} size={19} />
              <span className="nav__label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="rail__foot">
          <p className="foot__team">Nhóm Đồ án Trực quan hóa</p>
          <p className="foot__ver">v0.1.0 · DuckDB + Parquet</p>
        </div>
      </aside>

      <main className="canvas">
        {error ? (
          <div className="screen screen--error">
            <div className="screen__inner">
              <Icon name="alert" size={36} />
              <h2 className="display">Không thể tải bảng số liệu</h2>
              <p>{error}</p>
              <p className="screen__hint">
                Hãy chắc chắn FastAPI Backend đang chạy tại {API_BASE_URL} và tệp
                climate_daily.parquet đã sẵn sàng.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="screen">
            <div className="screen__inner">
              <div className="spinner"></div>
              <p>Đang đọc dữ liệu khí hậu Việt Nam…</p>
            </div>
          </div>
        ) : (
          <>
            {/* ---------- OVERVIEW ---------- */}
            {activeTab === "overview" && (
              <div className="tab">
                <header className="masthead masthead--row">
                  <div>
                    <p className="eyebrow">Trang chính</p>
                    <h1 className="display">Bức tranh khí hậu Việt Nam</h1>
                  </div>
                  <button className="btn btn--primary" onClick={() => setActiveTab("ai")}>
                    <Icon name="message" size={18} /> Hỏi AI Analyst
                  </button>
                </header>

                <section className="stat-strip">
                  <div className="stat reveal" style={stagger(0)}>
                    <span className="stat__num tnum">
                      {stations.length}
                      <small>trạm</small>
                    </span>
                    <span className="stat__lbl">Mạng lưới quan trắc</span>
                  </div>
                  <div className="stat reveal" style={stagger(1)}>
                    <span className="stat__num tnum">61.376</span>
                    <span className="stat__lbl">Bản ghi theo ngày</span>
                  </div>
                  <div className="stat reveal" style={stagger(2)}>
                    <span className="stat__num tnum">
                      6<small>năm liên tục</small>
                    </span>
                    <span className="stat__lbl">Phạm vi 2020 – 2025</span>
                  </div>
                </section>

                <div className="overview-grid">
                  <figure className="panel map-figure reveal" style={stagger(3)}>
                    <button className="map-reset" onClick={resetMapView} title="Đưa bản đồ về mặc định">
                      <Icon name="compass" size={14} /> Đặt lại
                    </button>
                    <ReactECharts
                      ref={mapRef}
                      option={getMapOption()}
                      style={{ height: "480px", width: "100%" }}
                      onEvents={{ click: onChartClick }}
                    />
                  </figure>

                  <aside className="panel station reveal" style={stagger(4)}>
                    <span className="panel__label">Chi tiết trạm đo</span>
                    <div className="station__head">
                      <h3 className="station__name">{STATION_VI[activeStationData?.location] || activeStationData?.location}</h3>
                      <span
                        className="region-chip"
                        style={{ color: REGION_COLORS[activeStationData?.region] }}
                      >
                        {REGION_VI[activeStationData?.region] || activeStationData?.region}
                      </span>
                    </div>
                    <div className="station__metrics">
                      <div className="metric">
                        <span className="metric__lbl">
                          <Icon name="thermometer" size={17} /> Nhiệt độ trung bình
                        </span>
                        <span className="metric__val tnum">{activeStationData?.avg_temp}°C</span>
                      </div>
                      <div className="metric">
                        <span className="metric__lbl">
                          <Icon name="thermometer" size={17} /> Cao nhất lịch sử
                        </span>
                        <span className="metric__val tnum is-hot">{activeStationData?.max_temp}°C</span>
                      </div>
                      <div className="metric">
                        <span className="metric__lbl">
                          <Icon name="thermometer" size={17} /> Thấp nhất lịch sử
                        </span>
                        <span className="metric__val tnum is-cold">{activeStationData?.min_temp}°C</span>
                      </div>
                      <div className="metric">
                        <span className="metric__lbl">
                          <Icon name="droplet" size={17} /> Lượng mưa trung bình năm
                        </span>
                        <span className="metric__val tnum is-rain">{activeStationData?.annual_precip} mm</span>
                      </div>
                      <div className="metric">
                        <span className="metric__lbl">
                          <Icon name="wind" size={17} /> Tốc độ gió trung bình
                        </span>
                        <span className="metric__val tnum">{activeStationData?.avg_wind} km/h</span>
                      </div>
                      <div className="metric">
                        <span className="metric__lbl">
                          <Icon name="sun" size={17} /> Bức xạ mặt trời trung bình
                        </span>
                        <span className="metric__val tnum">{activeStationData?.avg_radiation} MJ/m²</span>
                      </div>
                    </div>
                  </aside>
                </div>

                {renderInsights(overviewInsights)}
              </div>
            )}

            {/* ---------- EXPLORER ---------- */}
            {activeTab === "explorer" && (
              <div className="tab">
                <header className="masthead masthead--row">
                  <div>
                    <p className="eyebrow">Khám phá</p>
                    <h1 className="display">Xu hướng &amp; mùa vụ khí hậu</h1>
                  </div>
                  <div className="filters">
                    <label className="field">
                      <span>Trạm đo</span>
                      <Select
                        ariaLabel="Trạm đo"
                        value={explorerLocation}
                        onChange={setExplorerLocation}
                        options={[
                          { value: "All", label: "Tất cả trạm" },
                          ...stations.map((s) => ({
                            value: s.location,
                            label: `${STATION_VI[s.location] || s.location} (${REGION_VI[s.region]})`,
                          })),
                        ]}
                      />
                    </label>
                  </div>
                </header>

                {/* Stat strip for explorer */}
                {explorerSummary && (
                  <section className="stat-strip" style={{ marginBottom: 22 }}>
                    <div className="stat reveal" style={stagger(0)}>
                      <span className="stat__num tnum" style={{ color: "var(--orange)" }}>
                        {explorerSummary.avgTemp}
                        <small>°C</small>
                      </span>
                      <span className="stat__lbl">Nhiệt độ trung bình</span>
                    </div>
                    <div className="stat reveal" style={stagger(1)}>
                      <span className="stat__num tnum" style={{ color: "var(--pink)" }}>
                        {explorerSummary.highestTemp}
                        <small>°C</small>
                      </span>
                      <span className="stat__lbl">Nhiệt độ cao nhất (TB tháng)</span>
                    </div>
                    <div className="stat reveal" style={stagger(2)}>
                      <span className="stat__num tnum" style={{ color: "var(--sky)" }}>
                        {explorerSummary.maxRain}
                        <small>mm</small>
                      </span>
                      <span className="stat__lbl">Lượng mưa tháng cao nhất</span>
                    </div>
                  </section>
                )}

                <div className="chart-grid-2x2">
                  {renderChartCard("Chu kỳ nhiệt độ theo tháng", getTempTrendOption(), !!explorerData, { height: 300 })}
                  {renderChartCard("Lượng mưa trung bình theo tháng", getRainTrendOption(), !!explorerData, { height: 300 })}
                  {renderChartCard("Xu hướng nhiệt độ trung bình theo năm", getYearlyTempTrendOption(), yearlyTempTrend.length > 0, { height: 300 })}
                  {renderChartCard("Heatmap mùa vụ · nhiệt độ TB (Tháng × Năm)", getHeatmapOption(), !!explorerData, { height: 300 })}
                </div>

                {renderInsights(explorerInsights)}
              </div>
            )}

            {/* ---------- EXTREME EVENTS ---------- */}
            {activeTab === "extreme" && (
              <div className="tab">
                <header className="masthead">
                  <p className="eyebrow">Cảnh báo</p>
                  <h1 className="display">Thời tiết &amp; thiên tai cực đoan</h1>
                  <div className="filters" style={{ marginTop: 22 }}>
                    <label className="field">
                      <span>Địa điểm</span>
                      <Select
                        ariaLabel="Địa điểm"
                        value={extremeLocFilter}
                        onChange={setExtremeLocFilter}
                        options={[
                          { value: "All", label: "Tất cả địa điểm" },
                          ...stations.map((s) => ({
                            value: s.location,
                            label: STATION_VI[s.location] || s.location,
                          })),
                        ]}
                      />
                    </label>
                    <div className="range-field">
                      <div className="range-field__top">
                        <span>Ngưỡng nắng nóng</span>
                        <span className="range__val tnum">{tempThreshold}°C</span>
                      </div>
                      <input type="range" min="35" max="42" step="0.5" value={tempThreshold} onChange={(e) => setTempThreshold(parseFloat(e.target.value))} />
                    </div>
                    <div className="range-field">
                      <div className="range-field__top">
                        <span>Ngưỡng mưa ngày</span>
                        <span className="range__val tnum">{rainThreshold} mm</span>
                      </div>
                      <input type="range" min="50" max="200" step="10" value={rainThreshold} onChange={(e) => setRainThreshold(parseFloat(e.target.value))} />
                    </div>
                  </div>
                </header>

                {/* Stat strip for extreme events */}
                <section className="stat-strip" style={{ marginBottom: 22 }}>
                  <div className="stat reveal" style={stagger(0)}>
                    <span className="stat__num tnum" style={{ color: "var(--clay)" }}>
                      {extremeData?.total_hot_count ?? 0}
                      <small>ngày</small>
                    </span>
                    <span className="stat__lbl">Tổng ngày nắng nóng cực đoan</span>
                  </div>
                  <div className="stat reveal" style={stagger(1)}>
                    <span className="stat__num tnum" style={{ color: "var(--sky)" }}>
                      {extremeData?.total_wet_count ?? 0}
                      <small>ngày</small>
                    </span>
                    <span className="stat__lbl">Tổng ngày mưa lớn lịch sử</span>
                  </div>
                  <div className="stat reveal" style={stagger(2)}>
                    <span className="stat__num tnum" style={{ fontSize: "1.6rem", lineHeight: "1.4" }}>
                      {extremeData?.counts_by_location?.[0]
                        ? `${STATION_VI[extremeData.counts_by_location[0].location] || extremeData.counts_by_location[0].location}`
                        : "N/A"}
                    </span>
                    <span className="stat__lbl">Địa điểm thời tiết khắc nghiệt nhất</span>
                  </div>
                </section>

                <div className="chart-grid-2x2">
                  {renderChartCard(
                    "So sánh ngày cực đoan giữa các trạm",
                    getExtremeChartOption(),
                    !!extremeData,
                    {
                      onEvents: { click: onExtremeChartClick },
                      notMerge: true,
                      height: 420,
                      caption: extremeLocFilter === "All" ? "Top 10 trạm cực đoan nhất" : undefined,
                    },
                  )}
                  {renderChartCard(
                    "Bản đồ điểm nóng thời tiết cực đoan",
                    getExtremeMapOption(),
                    !!(extremeData && stations.length),
                    { caption: "Kích thước điểm = tổng số ngày vượt ngưỡng", placeholder: "Đang dựng bản đồ…", height: 420 },
                  )}
                  {renderChartCard(
                    "Xu hướng ngày cực đoan theo năm",
                    getExtremeYearlyOption(),
                    !!extremeData?.counts_by_year?.length,
                    { height: 300 },
                  )}
                  {renderChartCard(
                    "Phân bố ngày cực đoan theo tháng",
                    getExtremeMonthlyOption(),
                    !!extremeData?.counts_by_month?.length,
                    { height: 300 },
                  )}
                </div>

                {renderInsights(extremeInsights)}
              </div>
            )}

            {/* ---------- RELATIONSHIP LAB ---------- */}
            {activeTab === "relationship" && (
              <div className="tab">
                <header className="masthead">
                  <p className="eyebrow">Phòng thí nghiệm</p>
                  <h1 className="display">Tương quan &amp; quan hệ đa biến</h1>
                </header>

                {/* Stat strip for relationship */}
                {relationshipSummary && (
                  <section className="stat-strip" style={{ marginBottom: 22 }}>
                    <div className="stat reveal" style={stagger(0)}>
                      <span className="stat__num tnum" style={{ color: "var(--teal)" }}>
                        {relationshipSummary.tempRadiation}
                      </span>
                      <span className="stat__lbl">Nhiệt độ & Bức xạ (r)</span>
                    </div>
                    <div className="stat reveal" style={stagger(1)}>
                      <span className="stat__num tnum" style={{ color: "var(--sky)" }}>
                        {relationshipSummary.tempRain}
                      </span>
                      <span className="stat__lbl">Nhiệt độ & Lượng mưa (r)</span>
                    </div>
                    <div className="stat reveal" style={stagger(2)}>
                      <span className="stat__num tnum" style={{ color: "var(--purple)" }}>
                        {relationshipSummary.rainWind}
                      </span>
                      <span className="stat__lbl">Lượng mưa & Gió (r)</span>
                    </div>
                  </section>
                )}

                <div className="chart-grid-2x2">
                  {renderChartCard("Ma trận tương quan Pearson", getCorrOption(), !!relationshipData, { placeholder: "Đang tính hệ số tương quan…", height: 380 })}
                  {renderChartCard("Bức xạ mặt trời vs nhiệt độ TB ngày", getScatterOption(), !!relationshipData, { placeholder: "Đang tải biểu đồ phân tán…", height: 380 })}
                  {renderChartCard(
                    "Vĩ độ vs nhiệt độ TB — càng ra Bắc càng lạnh?",
                    getLatTempScatterOption(),
                    !!(relationshipData && stations.length),
                    { placeholder: "Đang tải biểu đồ phân tán…", height: 380 },
                  )}
                  {renderChartCard("Phân bố nhiệt độ theo miền", getRegionBoxplotOption(), !!relationshipData, { placeholder: "Đang tính phân bố…", height: 380 })}
                </div>

                {renderInsights(relationshipInsights)}
              </div>
            )}

            {/* ---------- AI ANALYST PORTAL ---------- */}
            {activeTab === "ai" && (
              <div className="tab">
                <header className="masthead">
                  <p className="eyebrow">AI Portal · Human-in-the-loop</p>
                  <h1 className="display">Trợ lý phân tích AI</h1>
                  <p className="lede">
                    AI đề xuất mã <b>SQL</b> hoặc code <b>Python (pandas)</b> kèm giải thích. Bạn xem,
                    chỉnh sửa và phê duyệt trước — code chỉ chạy cục bộ, đã qua kiểm soát an toàn,
                    sau khi bạn đồng ý.
                  </p>
                </header>

                <div className="ai">
                  <div className="panel">
                    <span className="panel__label">Khung yêu cầu phân tích</span>
                    <div className="mode-toggle">
                      <button
                        type="button"
                        className={`mode-toggle__btn ${aiKind === "sql" ? "is-active" : ""}`}
                        onClick={() => setAiKind("sql")}
                      >
                        SQL
                      </button>
                      <button
                        type="button"
                        className={`mode-toggle__btn ${aiKind === "python" ? "is-active" : ""}`}
                        onClick={() => setAiKind("python")}
                      >
                        Python
                      </button>
                    </div>
                    <form onSubmit={handleAskAI} className="ask__form">
                      <textarea
                        className="ask__input"
                        placeholder="Nhập câu hỏi phân tích khí hậu (ví dụ: So sánh lượng mưa giữa Đà Nẵng và TP. Hồ Chí Minh theo mùa…)"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                      />
                      <button type="submit" className="btn btn--primary" disabled={aiLoading}>
                        <Icon name="sparkle" size={18} />
                        {aiLoading
                          ? "Đang xử lý…"
                          : `Sinh đề xuất phân tích (${aiKind === "python" ? "Python" : "SQL"})`}
                      </button>
                    </form>

                    <div className="suggest">
                      <p className="suggest__title">Gợi ý phân tích nhanh</p>
                      <div className="chips">
                        {aiKind === "sql" ? (
                          <>
                            <button className="chip" onClick={() => handleSuggestQuestion("So sánh lượng mưa giữa Đà Nẵng và Thành phố Hồ Chí Minh theo mùa.")}>
                              <Icon name="droplet" size={15} /> So sánh mưa Đà Nẵng &amp; HCMC
                            </button>
                            <button className="chip" onClick={() => handleSuggestQuestion("Tìm các tháng có nhiệt độ bất thường tại Hà Nội.")}>
                              <Icon name="thermometer" size={15} /> Nhiệt độ bất thường Hà Nội
                            </button>
                            <button className="chip" onClick={() => handleSuggestQuestion("Nhóm các địa điểm có đặc điểm khí hậu tương đồng.")}>
                              <Icon name="compass" size={15} /> Phân cụm khí hậu tương đồng
                            </button>
                            <button className="chip" onClick={() => handleSuggestQuestion("Kiểm tra quan hệ lượng mưa và bức xạ mặt trời ở ba miền.")}>
                              <Icon name="sun" size={15} /> Quan hệ mưa &amp; bức xạ
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="chip" onClick={() => handleSuggestQuestion("Xếp hạng các địa điểm nóng nhất theo nhiệt độ trung bình.")}>
                              <Icon name="thermometer" size={15} /> Xếp hạng nơi nóng nhất
                            </button>
                            <button className="chip" onClick={() => handleSuggestQuestion("Tính lượng mưa trung bình theo từng tháng.")}>
                              <Icon name="droplet" size={15} /> Mưa trung bình theo tháng
                            </button>
                            <button className="chip" onClick={() => handleSuggestQuestion("Xu hướng nhiệt độ trung bình theo năm.")}>
                              <Icon name="compass" size={15} /> Xu hướng ấm lên theo năm
                            </button>
                            <button className="chip" onClick={() => handleSuggestQuestion("Làm sạch dữ liệu khuyết bằng dropna và đếm số dòng.")}>
                              <Icon name="sparkle" size={15} /> Làm sạch dữ liệu (dropna)
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {aiError && (
                    <div className="ai-alert">
                      <Icon name="alert" size={18} /> {aiError}
                    </div>
                  )}

                  {currentProposal && (
                    <div className="panel proposal" ref={proposalRef}>
                      <div className="proposal__top">
                        <span className={`status-badge ${currentProposal.status === "executed" ? "is-executed" : ""}`}>
                          {currentProposal.status.toUpperCase()}
                        </span>
                        <span className="panel__label" style={{ margin: 0 }}>Đề xuất phân tích</span>
                      </div>
                      <h3 className="proposal__q">“{currentProposal.question}”</h3>

                      <div className="sql">
                        <label className="sql__label">
                          <Icon name="edit" size={13} />{" "}
                          {currentProposal.kind === "python"
                            ? "Code Python (pandas) — có thể chỉnh trực tiếp"
                            : "Câu lệnh SQL — có thể chỉnh trực tiếp"}
                        </label>
                        <textarea
                          className="sql__editor"
                          value={proposalSql}
                          onChange={(e) => setProposalSql(e.target.value)}
                          disabled={currentProposal.status === "executed"}
                          spellCheck={false}
                        />
                      </div>

                      <div className="explain">
                        <span className="explain__label">Giải thích</span>
                        <p>{currentProposal.explanation}</p>
                      </div>

                      {currentProposal.status !== "executed" && (
                        <div className="proposal__actions">
                          <button className="btn btn--danger" onClick={handleRejectProposal}>
                            <Icon name="close" size={17} /> Hủy đề xuất
                          </button>
                          <button className="btn btn--success" onClick={handleApproveAndExecute} disabled={aiExecLoading}>
                            <Icon name="play" size={17} />
                            {aiExecLoading ? "Đang thực thi…" : "Phê duyệt & chạy local"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {aiExecResults && (
                    <div className="panel results">
                      <div className="proposal__top">
                        <span className="panel__label" style={{ margin: 0 }}>Kết quả truy vấn cục bộ</span>
                        <div className="mode-toggle">
                          <button
                            type="button"
                            className={`mode-toggle__btn ${resultView === "table" ? "is-active" : ""}`}
                            onClick={() => setResultView("table")}
                          >
                            Bảng
                          </button>
                          <button
                            type="button"
                            className={`mode-toggle__btn ${resultView === "chart" ? "is-active" : ""}`}
                            onClick={() => setResultView("chart")}
                          >
                            Biểu đồ
                          </button>
                        </div>
                      </div>
                      <p className="results__count">
                        Trả về <b>{aiExecResults.length}</b> dòng dữ liệu
                      </p>

                      {resultView === "table" ? (
                        <div className="table-scroll">
                          <table className="table">
                            <thead>
                              <tr>
                                {Object.keys(aiExecResults[0] || {}).map((col) => (
                                  <th key={col} title={col}>{humanizeColumn(col)}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {aiExecResults.slice(0, 15).map((row, idx) => (
                                <tr key={idx}>
                                  {Object.values(row).map((val: any, vIdx) => (
                                    <td key={vIdx}>{typeof val === "number" ? val.toFixed(2) : String(val)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {aiExecResults.length > 15 && (
                            <p className="table-hint">… chỉ hiển thị 15 dòng đầu tiên.</p>
                          )}
                        </div>
                      ) : (
                        <div className="chart-builder">
                          <div className="chart-controls">
                            <label className="field">
                              <span>Loại biểu đồ</span>
                              <Select
                                ariaLabel="Loại biểu đồ"
                                value={chartType}
                                onChange={(v) => setChartType(v as ChartType)}
                                options={[
                                  { value: "bar", label: "Cột" },
                                  { value: "line", label: "Đường" },
                                  { value: "pie", label: "Tròn" },
                                  { value: "scatter", label: "Phân tán" },
                                ]}
                              />
                            </label>
                            <label className="field">
                              <span>{chartType === "pie" ? "Nhãn" : "Trục X"}</span>
                              <Select
                                ariaLabel="Trục X"
                                value={chartX}
                                onChange={setChartX}
                                options={Object.keys(aiExecResults[0] || {}).map((col) => ({ value: col, label: humanizeColumn(col) }))}
                              />
                            </label>
                            <label className="field">
                              <span>{chartType === "pie" ? "Giá trị" : "Trục Y"}</span>
                              <Select
                                ariaLabel="Trục Y"
                                value={chartY}
                                onChange={setChartY}
                                options={Object.keys(aiExecResults[0] || {}).map((col) => ({ value: col, label: humanizeColumn(col) }))}
                              />
                            </label>
                          </div>
                          <ReactECharts
                            option={getResultChartOption()}
                            style={{ height: "380px", width: "100%" }}
                            notMerge={true}
                          />
                          {aiExecResults.length > 100 && (
                            <p className="table-hint">… biểu đồ hiển thị 100 điểm dữ liệu đầu tiên.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ---------- AI SESSION LOGS (audit trail) ---------- */}
                  <div className="panel logs">
                    <div className="proposal__top">
                      <span className="panel__label" style={{ margin: 0 }}>
                        Nhật ký phiên AI · truy xuất lại
                      </span>
                      <button className="btn btn--ghost" onClick={fetchLogs} disabled={logsLoading}>
                        <Icon name="compass" size={15} />
                        {logsLoading ? "Đang tải…" : "Làm mới"}
                      </button>
                    </div>
                    <p className="results__count">
                      Mọi yêu cầu, mã nguồn, giải thích và kết quả đều được lưu cục bộ.
                      Bấm vào một dòng để xem lại và chạy lại phân tích đó.
                    </p>
                    {aiLogs.length === 0 ? (
                      <p className="table-hint">Chưa có phiên AI nào được ghi lại.</p>
                    ) : (
                      <>
                        <div className="table-scroll">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Thời gian (UTC)</th>
                                <th>Trạng thái</th>
                                <th>Câu hỏi</th>
                                <th>Loại</th>
                                <th>Mã nguồn</th>
                                <th>Số dòng</th>
                              </tr>
                            </thead>
                            <tbody>
                              {aiLogs
                                .slice((logPage - 1) * LOG_PAGE_SIZE, logPage * LOG_PAGE_SIZE)
                                .map((logRow) => (
                                  <tr
                                    key={logRow.id}
                                    className="log-row"
                                    onClick={() => handleViewLog(logRow)}
                                    title="Bấm để xem lại phân tích này"
                                  >
                                    <td>{logRow.timestamp.replace("T", " ").slice(0, 19)}</td>
                                    <td>
                                      <span className={`status-badge ${logRow.status === "executed" ? "is-executed" : ""}`}>
                                        {logRow.status.toUpperCase()}
                                      </span>
                                    </td>
                                    <td>{logRow.question}</td>
                                    <td>
                                      <span className="kind-badge">{(logRow.kind || "sql").toUpperCase()}</span>
                                    </td>
                                    <td>
                                      <code className="log-sql">{logRow.sql_code || "—"}</code>
                                    </td>
                                    <td>{logRow.status === "executed" ? logRow.row_count : "—"}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="pager">
                          <button
                            className="btn btn--ghost"
                            onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                            disabled={logPage <= 1}
                          >
                            ‹ Trước
                          </button>
                          <span className="pager__info">
                            Trang {logPage} / {Math.max(1, Math.ceil(aiLogs.length / LOG_PAGE_SIZE))} ·{" "}
                            {aiLogs.length} bản ghi
                          </span>
                          <button
                            className="btn btn--ghost"
                            onClick={() =>
                              setLogPage((p) =>
                                Math.min(Math.ceil(aiLogs.length / LOG_PAGE_SIZE), p + 1),
                              )
                            }
                            disabled={logPage >= Math.ceil(aiLogs.length / LOG_PAGE_SIZE)}
                          >
                            Sau ›
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {expandedChart && (
        <div className="chart-modal-backdrop" onClick={() => setExpandedChart(null)}>
          <div className="chart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chart-modal__head">
              <h3>{expandedChart.title}</h3>
              <button
                type="button"
                className="chart-modal__close"
                aria-label="Đóng"
                onClick={() => setExpandedChart(null)}
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="chart-modal__body">
              <ReactECharts option={expandedChart.option} style={{ height: "100%", width: "100%" }} notMerge={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
