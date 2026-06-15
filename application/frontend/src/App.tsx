import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import "./styles.css";

const API_BASE_URL = "http://localhost:8000";

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
        if (!res.ok) throw new Error("Gửi câu hỏi thất bại hoặc câu hỏi quá ngắn.");
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
        if (!res.ok) return res.json().then(e => { throw new Error(e.detail || "Không thể phê duyệt mã SQL") });
        return res.json();
      })
      .then((approvedProposal) => {
        // 2. Execute approved query
        return fetch(`${API_BASE_URL}/api/ai/proposals/${approvedProposal.id}/execute`, {
          method: "POST"
        });
      })
      .then((res) => {
        if (!res.ok) return res.json().then(e => { throw new Error(e.detail || "Thực thi SQL thất bại") });
        return res.json();
      })
      .then((data) => {
        setAiExecResults(data.results);
        setCurrentProposal(prev => prev ? { ...prev, status: "executed" } : null);
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
      method: "POST"
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

  // ECharts Configurations
  // 1. Geographic Vietnam Station Map Scatter Plot
  const getMapOption = () => {
    const data = stations.map((s) => ({
      name: s.location,
      value: [s.longitude, s.latitude, s.avg_temp, s.annual_precip],
      itemStyle: {
        color: s.region === "North" ? "#5470c6" : s.region === "Central" ? "#fac858" : "#ee6666"
      }
    }));

    return {
      title: {
        text: "Mạng lưới Trạm khí hậu Việt Nam (Click trạm đo trên bản đồ)",
        left: "center",
        textStyle: { color: "#ffffff", fontSize: 13 }
      },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `${params.name}<br/>Kinh độ: ${params.value[0]}<br/>Vĩ độ: ${params.value[1]}<br/>Nhiệt độ TB: ${params.value[2]}°C<br/>Lượng mưa năm: ${params.value[3]} mm`;
        }
      },
      xAxis: {
        min: 102,
        max: 110,
        show: false
      },
      yAxis: {
        min: 8,
        max: 23,
        show: false
      },
      series: [
        {
          name: "Trạm đo",
          type: "scatter",
          coordinateSystem: "cartesian2d",
          data: data,
          symbolSize: (val: any) => Math.max(12, val[2] * 0.5),
          label: {
            show: true,
            formatter: "{b}",
            position: "right",
            color: "#ffffff",
            fontSize: 10
          },
          emphasis: {
            scale: true,
            label: { show: true, fontWeight: "bold" }
          }
        }
      ]
    };
  };

  const onChartClick = (params: any) => {
    if (params.seriesType === "scatter" && params.name) {
      setSelectedStation(params.name);
    }
  };

  // 2. Line Chart: Temperature trends by month
  const getTempTrendOption = () => {
    if (!explorerData || !explorerData.monthly_trends) return {};
    const months = explorerData.monthly_trends.map((t: any) => `T${t.month_num}`);
    const avgTemps = explorerData.monthly_trends.map((t: any) => t.avg_temp);
    const maxTemps = explorerData.monthly_trends.map((t: any) => t.avg_max_temp);
    const minTemps = explorerData.monthly_trends.map((t: any) => t.avg_min_temp);

    return {
      tooltip: { trigger: "axis" },
      legend: { data: ["Nhiệt độ tối đa", "Nhiệt độ trung bình", "Nhiệt độ tối thiểu"], textStyle: { color: "#ffffff" } },
      xAxis: { type: "category", data: months, axisLabel: { color: "#ffffff" } },
      yAxis: { type: "value", name: "°C", axisLabel: { color: "#ffffff" }, nameTextStyle: { color: "#ffffff" } },
      series: [
        { name: "Nhiệt độ tối đa", type: "line", data: maxTemps, color: "#f44336", smooth: true },
        { name: "Nhiệt độ trung bình", type: "line", data: avgTemps, color: "#ff9800", smooth: true, lineStyle: { width: 3 } },
        { name: "Nhiệt độ tối thiểu", type: "line", data: minTemps, color: "#2196f3", smooth: true }
      ]
    };
  };

  // 3. Bar Chart: Rainfall by month
  const getRainTrendOption = () => {
    if (!explorerData || !explorerData.monthly_trends) return {};
    const months = explorerData.monthly_trends.map((t: any) => `T${t.month_num}`);
    const rain = explorerData.monthly_trends.map((t: any) => t.avg_rain);

    return {
      tooltip: { trigger: "axis" },
      legend: { data: ["Lượng mưa"], textStyle: { color: "#ffffff" } },
      xAxis: { type: "category", data: months, axisLabel: { color: "#ffffff" } },
      yAxis: { type: "value", name: "mm", axisLabel: { color: "#ffffff" }, nameTextStyle: { color: "#ffffff" } },
      series: [
        { name: "Lượng mưa", type: "bar", data: rain, color: "#00bcd4", barWidth: "60%" }
      ]
    };
  };

  // 4. Heatmap: Month x Year Average Temperature
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
        position: "top",
        formatter: (params: any) => {
          return `Năm ${years[params.value[1]]} Th${params.value[0] + 1}<br/>Nhiệt độ: ${params.value[2]}°C`;
        }
      },
      grid: { height: "70%", top: "10%" },
      xAxis: {
        type: "category",
        data: months.map(m => `Th${m}`),
        splitArea: { show: true },
        axisLabel: { color: "#ffffff" }
      },
      yAxis: {
        type: "category",
        data: years.map(String),
        splitArea: { show: true },
        axisLabel: { color: "#ffffff" }
      },
      visualMap: {
        min: 15,
        max: 32,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "0%",
        textStyle: { color: "#ffffff" },
        inRange: { color: ["#313695", "#4575b4", "#e0f3f8", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"] }
      },
      series: [
        {
          name: "Nhiệt độ TB",
          type: "heatmap",
          data: data,
          label: { show: true, color: "#000", fontSize: 9 },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ]
    };
  };

  // 5. Heatmap: Pearson Correlation Matrix
  const getCorrOption = () => {
    if (!relationshipData || !relationshipData.correlation_matrix) return {};
    const variables = ["Nhiệt độ", "Lượng mưa", "Sức gió", "Bức xạ mặt trời"];
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
        formatter: (params: any) => {
          return `${variables[params.value[1]]} vs ${variables[params.value[0]]}<br/>Hệ số tương quan: ${params.value[2]}`;
        }
      },
      xAxis: { type: "category", data: variables, axisLabel: { color: "#ffffff", rotate: 20 } },
      yAxis: { type: "category", data: variables, axisLabel: { color: "#ffffff" } },
      visualMap: {
        min: -1,
        max: 1,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "0%",
        textStyle: { color: "#ffffff" },
        inRange: { color: ["#4575b4", "#f7f7f7", "#d73027"] }
      },
      series: [
        {
          name: "Tương quan Pearson",
          type: "heatmap",
          data: data,
          label: { show: true, formatter: (p: any) => p.value[2].toFixed(2), color: "#000000", fontWeight: "bold" }
        }
      ]
    };
  };

  // 6. Scatter Plot: Temperature vs Radiation
  const getScatterOption = () => {
    if (!relationshipData || !relationshipData.scatter_sample) return {};
    const samplesByRegion = {
      North: relationshipData.scatter_sample.filter((s: any) => s.region === "North"),
      Central: relationshipData.scatter_sample.filter((s: any) => s.region === "Central"),
      South: relationshipData.scatter_sample.filter((s: any) => s.region === "South")
    };

    return {
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `Miền: ${params.seriesName}<br/>Bức xạ: ${params.value[0]} MJ/m²<br/>Nhiệt độ: ${params.value[1]}°C`;
        }
      },
      legend: { data: ["North", "Central", "South"], textStyle: { color: "#ffffff" } },
      xAxis: { type: "value", name: "Bức xạ (MJ/m²)", axisLabel: { color: "#ffffff" }, nameTextStyle: { color: "#ffffff" } },
      yAxis: { type: "value", name: "Nhiệt độ TB (°C)", axisLabel: { color: "#ffffff" }, nameTextStyle: { color: "#ffffff" } },
      series: [
        {
          name: "North",
          type: "scatter",
          data: samplesByRegion.North.map((s: any) => [s.shortwave_radiation_sum, s.temperature_2m_mean]),
          color: "#5470c6",
          symbolSize: 6,
          opacity: 0.7
        },
        {
          name: "Central",
          type: "scatter",
          data: samplesByRegion.Central.map((s: any) => [s.shortwave_radiation_sum, s.temperature_2m_mean]),
          color: "#fac858",
          symbolSize: 6,
          opacity: 0.7
        },
        {
          name: "South",
          type: "scatter",
          data: samplesByRegion.South.map((s: any) => [s.shortwave_radiation_sum, s.temperature_2m_mean]),
          color: "#ee6666",
          symbolSize: 6,
          opacity: 0.7
        }
      ]
    };
  };

  return (
    <div className="app-shell dark-mode">
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-dot"></div>
          <span className="logo-text">Vietnam Climate Pulse</span>
        </div>
        <nav className="nav-menu">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            📊 Tổng quan trạm đo
          </button>
          <button
            className={activeTab === "explorer" ? "active" : ""}
            onClick={() => setActiveTab("explorer")}
          >
            📈 Khám phá khí hậu
          </button>
          <button
            className={activeTab === "extreme" ? "active" : ""}
            onClick={() => setActiveTab("extreme")}
          >
            ⚠️ Thời tiết cực đoan
          </button>
          <button
            className={activeTab === "relationship" ? "active" : ""}
            onClick={() => setActiveTab("relationship")}
          >
            🔬 Tương quan khí hậu
          </button>
          <button
            className={activeTab === "ai" ? "active" : ""}
            onClick={() => setActiveTab("ai")}
          >
            🤖 AI Analyst Portal
          </button>
        </nav>
        <div className="sidebar-footer">
          <p className="team-text">Nhóm Đồ án trực quan hóa</p>
          <p className="version-text">v0.1.0 (DuckDB + Parquet)</p>
        </div>
      </aside>

      <main className="content-area">
        {error ? (
          <div className="error-screen card">
            <span className="error-icon">⚠️</span>
            <h2>Không thể tải Dashboard</h2>
            <p>{error}</p>
            <p className="hint">Hãy chắc chắn rằng FastAPI Backend đang chạy tại {API_BASE_URL} và dữ liệu climate_daily.parquet đã sẵn sàng.</p>
          </div>
        ) : loading ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu khí hậu Việt Nam...</p>
          </div>
        ) : (
          <>
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="tab-pane animate-fade">
                <header className="page-header">
                  <div>
                    <span className="eyebrow">Trang chính</span>
                    <h2>Bức tranh Khí hậu Việt Nam</h2>
                  </div>
                  <button className="btn-primary" onClick={() => setActiveTab("ai")}>
                    💬 Hỏi AI Analyst
                  </button>
                </header>

                <div className="kpi-grid">
                  <div className="kpi-card hover-glow">
                    <span className="kpi-label">Tổng số trạm đo</span>
                    <strong className="kpi-value">{stations.length} Trạm</strong>
                  </div>
                  <div className="kpi-card hover-glow">
                    <span className="kpi-label">Tổng số bản ghi ngày</span>
                    <strong className="kpi-value">61.376 Ngày</strong>
                  </div>
                  <div className="kpi-card hover-glow">
                    <span className="kpi-label">Khoảng thời gian</span>
                    <strong className="kpi-value">2020 - 2025 (6 năm)</strong>
                  </div>
                </div>

                <div className="panel-grid">
                  <div className="panel card map-container">
                    <ReactECharts
                      option={getMapOption()}
                      style={{ height: "450px", width: "100%" }}
                      onEvents={{ click: onChartClick }}
                    />
                  </div>
                  <div className="panel card station-detail">
                    <span className="eyebrow">Chi tiết trạm đo</span>
                    <h3>📍 {activeStationData?.location} ({activeStationData?.region})</h3>
                    <div className="station-kpis">
                      <div className="station-kpi-item">
                        <span className="skpi-lbl">Nhiệt độ trung bình</span>
                        <strong className="skpi-val">{activeStationData?.avg_temp}°C</strong>
                      </div>
                      <div className="station-kpi-item">
                        <span className="skpi-lbl">Nhiệt độ cao nhất lịch sử</span>
                        <strong className="skpi-val heat-text">{activeStationData?.max_temp}°C</strong>
                      </div>
                      <div className="station-kpi-item">
                        <span className="skpi-lbl">Nhiệt độ thấp nhất lịch sử</span>
                        <strong className="skpi-val cold-text">{activeStationData?.min_temp}°C</strong>
                      </div>
                      <div className="station-kpi-item">
                        <span className="skpi-lbl">Lượng mưa trung bình năm</span>
                        <strong className="skpi-val rain-text">{activeStationData?.annual_precip} mm</strong>
                      </div>
                      <div className="station-kpi-item">
                        <span className="skpi-lbl">Tốc độ gió trung bình</span>
                        <strong className="skpi-val">{activeStationData?.avg_wind} km/h</strong>
                      </div>
                      <div className="station-kpi-item">
                        <span className="skpi-lbl">Bức xạ mặt trời trung bình</span>
                        <strong className="skpi-val">{activeStationData?.avg_radiation} MJ/m²</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EXPLORER */}
            {activeTab === "explorer" && (
              <div className="tab-pane animate-fade">
                <header className="page-header">
                  <div>
                    <span className="eyebrow">Khám phá</span>
                    <h2>Xu hướng & Mùa vụ Khí hậu</h2>
                  </div>
                  <div className="filter-controls">
                    <label>Chọn trạm đo: </label>
                    <select
                      className="form-select"
                      value={explorerLocation}
                      onChange={(e) => setExplorerLocation(e.target.value)}
                    >
                      <option value="All">Tất cả trạm</option>
                      {stations.map((s) => (
                        <option key={s.location} value={s.location}>
                          {s.location} ({s.region})
                        </option>
                      ))}
                    </select>
                  </div>
                </header>

                <div className="charts-grid-2">
                  <div className="panel card">
                    <span className="eyebrow">Chu kỳ Nhiệt độ theo Tháng</span>
                    <div className="chart-wrapper">
                      {explorerData ? (
                        <ReactECharts option={getTempTrendOption()} style={{ height: "300px" }} />
                      ) : (
                        <p>Đang tải biểu đồ...</p>
                      )}
                    </div>
                  </div>
                  <div className="panel card">
                    <span className="eyebrow">Phân bố Lượng mưa trung bình theo Tháng</span>
                    <div className="chart-wrapper">
                      {explorerData ? (
                        <ReactECharts option={getRainTrendOption()} style={{ height: "300px" }} />
                      ) : (
                        <p>Đang tải biểu đồ...</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="panel card heatmap-panel">
                  <span className="eyebrow">Heatmap Mùa vụ: Nhiệt độ trung bình Tháng x Năm</span>
                  <div className="chart-wrapper" style={{ marginTop: "15px" }}>
                    {explorerData ? (
                      <ReactECharts option={getHeatmapOption()} style={{ height: "350px" }} />
                    ) : (
                      <p>Đang tải heatmap...</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EXTREME EVENTS */}
            {activeTab === "extreme" && (
              <div className="tab-pane animate-fade">
                <header className="page-header">
                  <div>
                    <span className="eyebrow">Cảnh báo</span>
                    <h2>Thời tiết và Thiên tai cực đoan</h2>
                  </div>
                  <div className="filter-controls">
                    <label>Lọc địa điểm: </label>
                    <select
                      className="form-select"
                      value={extremeLocFilter}
                      onChange={(e) => setExtremeLocFilter(e.target.value)}
                      style={{ marginRight: "15px" }}
                    >
                      <option value="All">Tất cả địa điểm</option>
                      {stations.map((s) => (
                        <option key={s.location} value={s.location}>
                          {s.location}
                        </option>
                      ))}
                    </select>
                    
                    <label style={{ marginLeft: "15px" }}>Ngưỡng nóng (°C): </label>
                    <input
                      type="range"
                      min="35"
                      max="42"
                      step="0.5"
                      value={tempThreshold}
                      onChange={(e) => setTempThreshold(parseFloat(e.target.value))}
                    />
                    <span className="threshold-val">{tempThreshold}°C</span>
                    
                    <label style={{ marginLeft: "15px" }}>Ngưỡng mưa ngày (mm): </label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="10"
                      value={rainThreshold}
                      onChange={(e) => setRainThreshold(parseFloat(e.target.value))}
                    />
                    <span className="threshold-val">{rainThreshold} mm</span>
                  </div>
                </header>

                <div className="panel-grid-2">
                  <div className="panel card counts-panel">
                    <span className="eyebrow">Tổng số ngày cực đoan theo Trạm đo</span>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Địa điểm</th>
                            <th>Nắng nóng cực đoan (≥38.0°C)</th>
                            <th>Mưa lớn lịch sử (≥100.0mm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extremeData?.counts_by_location.slice(0, 10).map((c: any) => (
                            <tr key={c.location}>
                              <td><strong>{c.location}</strong></td>
                              <td className="heat-text">{c.hot_days_count} ngày</td>
                              <td className="rain-text">{c.wet_days_count} ngày</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="panel card logs-panel">
                    <span className="eyebrow">Nhật ký các ngày thời tiết cực đoan vượt ngưỡng lọc</span>
                    <div className="extreme-tabs">
                      <div className="extreme-tab-sec">
                        <h4>🔥 Đợt nắng nóng vượt ngưỡng ({extremeData?.hot_days.length || 0} ngày)</h4>
                        <div className="scroll-box">
                          {extremeData?.hot_days.slice(0, 30).map((h: any, idx: number) => (
                            <div className="log-item" key={idx}>
                              <span className="log-date">{h.date}</span>
                              <span className="log-loc">{h.location}</span>
                              <strong className="log-val heat-text">{h.temperature_2m_max}°C</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="extreme-tab-sec">
                        <h4>🌧️ Đợt mưa lớn vượt ngưỡng ({extremeData?.wet_days.length || 0} ngày)</h4>
                        <div className="scroll-box">
                          {extremeData?.wet_days.slice(0, 30).map((w: any, idx: number) => (
                            <div className="log-item" key={idx}>
                              <span className="log-date">{w.date}</span>
                              <span className="log-loc">{w.location}</span>
                              <strong className="log-val rain-text">{w.precipitation_sum} mm</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: RELATIONSHIP LAB */}
            {activeTab === "relationship" && (
              <div className="tab-pane animate-fade">
                <header className="page-header">
                  <div>
                    <span className="eyebrow">Phòng thí nghiệm</span>
                    <h2>Tương quan & Quan hệ đa biến</h2>
                  </div>
                </header>

                <div className="panel-grid">
                  <div className="panel card">
                    <span className="eyebrow">Ma trận tương quan Pearson</span>
                    <div className="chart-wrapper" style={{ marginTop: "15px" }}>
                      {relationshipData ? (
                        <ReactECharts option={getCorrOption()} style={{ height: "380px" }} />
                      ) : (
                        <p>Đang tính toán hệ số tương quan...</p>
                      )}
                    </div>
                  </div>
                  <div className="panel card">
                    <span className="eyebrow">Tương quan: Bức xạ mặt trời vs Nhiệt độ trung bình ngày</span>
                    <div className="chart-wrapper" style={{ marginTop: "15px" }}>
                      {relationshipData ? (
                        <ReactECharts option={getScatterOption()} style={{ height: "380px" }} />
                      ) : (
                        <p>Đang tải biểu đồ scatter...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AI ANALYST PORTAL */}
            {activeTab === "ai" && (
              <div className="tab-pane animate-fade">
                <header className="page-header">
                  <div>
                    <span className="eyebrow">AI Portal</span>
                    <h2>AI Analyst Portal (Human-in-the-loop)</h2>
                  </div>
                </header>

                <div className="ai-layout">
                  <div className="panel card ai-chat-panel">
                    <span className="eyebrow">Khung yêu cầu phân tích</span>
                    <form onSubmit={handleAskAI} className="ai-input-form">
                      <textarea
                        className="ai-textarea"
                        placeholder="Hãy nhập câu hỏi phân tích dữ liệu khí hậu (Ví dụ: So sánh lượng mưa giữa Đà Nẵng và Thành phố Hồ Chí Minh theo mùa...)"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                      />
                      <button type="submit" className="btn-primary" disabled={aiLoading}>
                        {aiLoading ? "Đang xử lý..." : "⚡ Sinh đề xuất phân tích (SQL)"}
                      </button>
                    </form>

                    <div className="suggested-questions">
                      <p>💡 Gợi ý phân tích nhanh:</p>
                      <button onClick={() => handleSuggestQuestion("So sánh lượng mưa giữa Đà Nẵng và Thành phố Hồ Chí Minh theo mùa.")}>
                        ⛈️ So sánh mưa Đà Nẵng và HCMC
                      </button>
                      <button onClick={() => handleSuggestQuestion("Tìm các tháng có nhiệt độ bất thường tại Hà Nội.")}>
                        🔥 Nhiệt độ bất thường Hà Nội
                      </button>
                      <button onClick={() => handleSuggestQuestion("Nhóm các địa điểm có đặc điểm khí hậu tương đồng.")}>
                        🌍 Phân cụm khí hậu tương đồng
                      </button>
                      <button onClick={() => handleSuggestQuestion("Kiểm tra quan hệ lượng mưa và bức xạ mặt trời ở ba miền.")}>
                        ☀️ Quan hệ mưa & bức xạ mặt trời
                      </button>
                    </div>
                  </div>

                  {aiError && (
                    <div className="ai-error card">
                      <strong>Lỗi:</strong> {aiError}
                    </div>
                  )}

                  {currentProposal && (
                    <div className="panel card ai-proposal-panel animate-slide-up">
                      <span className="proposal-badge">{currentProposal.status.toUpperCase()}</span>
                      <span className="eyebrow">Đề xuất phân tích được tạo</span>
                      <h3>Câu hỏi: "{currentProposal.question}"</h3>
                      
                      <div className="proposal-details">
                        <div className="sql-box">
                          <label>Câu lệnh SQL đề xuất (Bạn có thể sửa trực tiếp):</label>
                          <textarea
                            className="sql-textarea"
                            value={proposalSql}
                            onChange={(e) => setProposalSql(e.target.value)}
                            disabled={currentProposal.status === "executed"}
                          />
                        </div>
                        <div className="explanation-box">
                          <p><strong>Giải thích ý nghĩa:</strong></p>
                          <p>{currentProposal.explanation}</p>
                        </div>
                      </div>

                      {currentProposal.status !== "executed" && (
                        <div className="proposal-actions">
                          <button className="btn-danger" onClick={handleRejectProposal}>
                            ✖️ Hủy bỏ đề xuất
                          </button>
                          <button className="btn-success" onClick={handleApproveAndExecute} disabled={aiExecLoading}>
                            {aiExecLoading ? "Đang thực thi..." : "✔️ Phê duyệt & Chạy local"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {aiExecResults && (
                    <div className="panel card ai-results-panel animate-fade">
                      <span className="eyebrow">Kết quả phân tích SQL cục bộ</span>
                      <h3>Có {aiExecResults.length} dòng dữ liệu được trả về</h3>
                      
                      <div className="table-wrapper ai-results-table">
                        <table>
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
                        {aiExecResults.length > 15 && <p className="table-hint">... chỉ hiển thị 15 dòng đầu tiên.</p>}
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
