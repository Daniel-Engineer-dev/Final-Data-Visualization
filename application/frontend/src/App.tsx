import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import "./styles.css";
import vietnamGeo from "./vietnam-geo.json";
import { Icon } from "./Icon";
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

type Proposal = {
  id: string;
  question: string;
  code: string;
  explanation: string;
  status: string;
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
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
  const [proposalSql, setProposalSql] = useState<string>("");
  const [aiExecResults, setAiExecResults] = useState<any[] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiExecLoading, setAiExecLoading] = useState<boolean>(false);

  // General Loading/Error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Map chart ref (for resetting zoom/pan reliably)
  const mapRef = useRef<any>(null);

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
      body: JSON.stringify({ question: aiQuestion }),
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
        setCurrentProposal((prev) => (prev ? { ...prev, status: "executed" } : null));
        setAiExecLoading(false);
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
      yAxis: { type: "value", name: "Nhiệt độ TB (°C)", axisLabel, nameTextStyle, splitLine: splitLineSoft },
      series: [mkSeries("North", "Miền Bắc"), mkSeries("Central", "Miền Trung"), mkSeries("South", "Miền Nam")],
    };
  };

  // 7. Extreme events bar chart
  const getExtremeChartOption = () => {
    if (!extremeData || !extremeData.counts_by_location) return {};
    const topData = extremeData.counts_by_location;
    const locations = topData.map((c: any) => STATION_VI[c.location] || c.location);
    const hotDays = topData.map((c: any) => c.hot_days_count);
    const wetDays = topData.map((c: any) => c.wet_days_count);

    const isAll = extremeLocFilter === "All";

    const option: any = {
      tooltip: { ...tooltipStyle, trigger: "axis" },
      legend: { ...legendStyle, data: ["Nắng nóng (≥38°C)", "Mưa lớn (≥100mm)"], top: 0 },
      grid: { left: 10, right: 18, top: 44, bottom: isAll ? 65 : 45, containLabel: true },
      xAxis: {
        type: "category",
        data: locations,
        axisLabel: { ...axisLabel, interval: 0, rotate: isAll ? 30 : 0 },
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
          barWidth: isAll ? "30%" : "20%",
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
        {
          name: "Mưa lớn (≥100mm)",
          type: "bar",
          data: wetDays,
          color: PALETTE.sky,
          barWidth: isAll ? "30%" : "20%",
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    };

    if (isAll) {
      option.dataZoom = [
        {
          type: "slider",
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 35,
          bottom: 10,
          height: 18,
          borderColor: "transparent",
          fillerColor: "rgba(46, 111, 78, 0.12)",
          handleIcon: "path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
          handleSize: "120%",
          handleStyle: {
            color: "var(--forest)",
            shadowBlur: 3,
            shadowColor: "rgba(0, 0, 0, 0.15)",
          },
          textStyle: {
            color: "var(--ink-soft)",
            fontFamily: SANS_FONT,
            fontSize: 9,
          },
        },
      ];
    }

    return option;
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
                      <select
                        className="select"
                        value={explorerLocation}
                        onChange={(e) => setExplorerLocation(e.target.value)}
                      >
                        <option value="All">Tất cả trạm</option>
                        {stations.map((s) => (
                          <option key={s.location} value={s.location}>
                            {STATION_VI[s.location] || s.location} ({REGION_VI[s.region]})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </header>

                <div className="grid-2">
                  <div className="panel chart-card reveal" style={stagger(0)}>
                    <span className="panel__label">Chu kỳ nhiệt độ theo tháng</span>
                    <div className="chart-wrap">
                      {explorerData ? (
                        <ReactECharts option={getTempTrendOption()} style={{ height: "300px" }} />
                      ) : (
                        <div className="chart-placeholder" style={{ height: 300 }}>Đang dựng biểu đồ…</div>
                      )}
                    </div>
                  </div>
                  <div className="panel chart-card reveal" style={stagger(1)}>
                    <span className="panel__label">Lượng mưa trung bình theo tháng</span>
                    <div className="chart-wrap">
                      {explorerData ? (
                        <ReactECharts option={getRainTrendOption()} style={{ height: "300px" }} />
                      ) : (
                        <div className="chart-placeholder" style={{ height: 300 }}>Đang dựng biểu đồ…</div>
                      )}
                    </div>
                  </div>
                  <div className="panel chart-card span-2 reveal" style={stagger(2)}>
                    <span className="panel__label">Heatmap mùa vụ · nhiệt độ trung bình (Tháng × Năm)</span>
                    <div className="chart-wrap">
                      {explorerData ? (
                        <ReactECharts option={getHeatmapOption()} style={{ height: "360px" }} />
                      ) : (
                        <div className="chart-placeholder" style={{ height: 360 }}>Đang dựng heatmap…</div>
                      )}
                    </div>
                  </div>
                </div>
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
                      <select
                        className="select"
                        value={extremeLocFilter}
                        onChange={(e) => setExtremeLocFilter(e.target.value)}
                      >
                        <option value="All">Tất cả địa điểm</option>
                        {stations.map((s) => (
                          <option key={s.location} value={s.location}>
                            {STATION_VI[s.location] || s.location}
                          </option>
                        ))}
                      </select>
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

                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "22px" }}>
                  <div className="panel chart-card reveal" style={stagger(0)}>
                    <span className="panel__label">So sánh ngày thời tiết cực đoan giữa các trạm đo</span>
                    <div className="chart-wrap">
                      {extremeData ? (
                        <ReactECharts
                          option={getExtremeChartOption()}
                          style={{ height: "360px" }}
                          onEvents={{ click: onExtremeChartClick }}
                          notMerge={true}
                        />
                      ) : (
                        <div className="chart-placeholder" style={{ height: 360 }}>Đang dựng biểu đồ…</div>
                      )}
                    </div>
                  </div>

                  <div className="panel reveal" style={stagger(1)}>
                    <span className="panel__label">Nhật ký các ngày vượt ngưỡng lọc</span>
                    <div className="ledger">
                      <div>
                        <div className="ledger__head">
                          <Icon name="thermometer" size={18} className="ic-hot" />
                          Nắng nóng (Tìm thấy {extremeData?.total_hot_count ?? 0} ngày)
                        </div>
                        <div className="scroll" style={{ maxHeight: "320px" }}>
                          {extremeData?.hot_days.slice(0, 30).map((h: any, idx: number) => (
                            <div className="entry" key={idx}>
                              <span className="entry__date">{h.date}</span>
                              <span className="entry__loc">{STATION_VI[h.location] || h.location}</span>
                              <span className="entry__val is-hot">{h.temperature_2m_max}°C</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="ledger__head">
                          <Icon name="droplet" size={18} className="ic-rain" />
                          Mưa lớn (Tìm thấy {extremeData?.total_wet_count ?? 0} ngày)
                        </div>
                        <div className="scroll" style={{ maxHeight: "320px" }}>
                          {extremeData?.wet_days.slice(0, 30).map((w: any, idx: number) => (
                            <div className="entry" key={idx}>
                              <span className="entry__date">{w.date}</span>
                              <span className="entry__loc">{STATION_VI[w.location] || w.location}</span>
                              <span className="entry__val is-rain">{w.precipitation_sum} mm</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.76rem", color: "var(--ink-faint)", marginTop: 16, fontStyle: "italic" }}>
                      * Danh sách trên hiển thị tối đa 30 ngày có giá trị cực đoan nhất.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ---------- RELATIONSHIP LAB ---------- */}
            {activeTab === "relationship" && (
              <div className="tab">
                <header className="masthead">
                  <p className="eyebrow">Phòng thí nghiệm</p>
                  <h1 className="display">Tương quan &amp; quan hệ đa biến</h1>
                </header>

                <div className="grid-2">
                  <div className="panel chart-card reveal" style={stagger(0)}>
                    <span className="panel__label">Ma trận tương quan Pearson</span>
                    <div className="chart-wrap">
                      {relationshipData ? (
                        <ReactECharts option={getCorrOption()} style={{ height: "380px" }} />
                      ) : (
                        <div className="chart-placeholder" style={{ height: 380 }}>Đang tính hệ số tương quan…</div>
                      )}
                    </div>
                  </div>
                  <div className="panel chart-card reveal" style={stagger(1)}>
                    <span className="panel__label">Bức xạ mặt trời vs nhiệt độ trung bình ngày</span>
                    <div className="chart-wrap">
                      {relationshipData ? (
                        <ReactECharts option={getScatterOption()} style={{ height: "380px" }} />
                      ) : (
                        <div className="chart-placeholder" style={{ height: 380 }}>Đang tải biểu đồ phân tán…</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------- AI ANALYST PORTAL ---------- */}
            {activeTab === "ai" && (
              <div className="tab">
                <header className="masthead">
                  <p className="eyebrow">AI Portal · Human-in-the-loop</p>
                  <h1 className="display">Trợ lý phân tích AI</h1>
                  <p className="lede">
                    AI đề xuất mã SQL kèm giải thích. Bạn xem, chỉnh sửa và phê duyệt trước —
                    truy vấn chỉ chạy chỉ-đọc trên dữ liệu cục bộ sau khi bạn đồng ý.
                  </p>
                </header>

                <div className="ai">
                  <div className="panel">
                    <span className="panel__label">Khung yêu cầu phân tích</span>
                    <form onSubmit={handleAskAI} className="ask__form">
                      <textarea
                        className="ask__input"
                        placeholder="Nhập câu hỏi phân tích khí hậu (ví dụ: So sánh lượng mưa giữa Đà Nẵng và TP. Hồ Chí Minh theo mùa…)"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                      />
                      <button type="submit" className="btn btn--primary" disabled={aiLoading}>
                        <Icon name="sparkle" size={18} />
                        {aiLoading ? "Đang xử lý…" : "Sinh đề xuất phân tích (SQL)"}
                      </button>
                    </form>

                    <div className="suggest">
                      <p className="suggest__title">Gợi ý phân tích nhanh</p>
                      <div className="chips">
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
                      </div>
                    </div>
                  </div>

                  {aiError && (
                    <div className="ai-alert">
                      <Icon name="alert" size={18} /> {aiError}
                    </div>
                  )}

                  {currentProposal && (
                    <div className="panel proposal">
                      <div className="proposal__top">
                        <span className={`status-badge ${currentProposal.status === "executed" ? "is-executed" : ""}`}>
                          {currentProposal.status.toUpperCase()}
                        </span>
                        <span className="panel__label" style={{ margin: 0 }}>Đề xuất phân tích</span>
                      </div>
                      <h3 className="proposal__q">“{currentProposal.question}”</h3>

                      <div className="sql">
                        <label className="sql__label">
                          <Icon name="edit" size={13} /> Câu lệnh SQL — có thể chỉnh trực tiếp
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
                      <span className="panel__label">Kết quả truy vấn cục bộ</span>
                      <p className="results__count">
                        Trả về <b>{aiExecResults.length}</b> dòng dữ liệu
                      </p>
                      <div className="table-scroll">
                        <table className="table">
                          <thead>
                            <tr>
                              {Object.keys(aiExecResults[0] || {}).map((col) => (
                                <th key={col}>{col}</th>
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
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
