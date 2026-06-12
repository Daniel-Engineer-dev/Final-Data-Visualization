const pages = ["Tổng quan", "Khám phá khí hậu", "Sự kiện cực đoan", "AI Analyst"];

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <p className="eyebrow">Vietnam Climate Pulse</p>
        <h1>Khí hậu Việt Nam qua dữ liệu</h1>
        <nav>
          {pages.map((page, index) => (
            <button className={index === 0 ? "active" : ""} key={page}>
              {page}
            </button>
          ))}
        </nav>
      </aside>

      <main>
        <header>
          <div>
            <p className="eyebrow">Dashboard tổng quan</p>
            <h2>Bức tranh khí hậu Việt Nam</h2>
          </div>
          <button className="primary">Mở AI Analyst</button>
        </header>

        <section className="kpi-grid">
          <article><span>Địa điểm</span><strong>Chưa có dữ liệu</strong></article>
          <article><span>Khoảng thời gian</span><strong>Chưa cấu hình</strong></article>
          <article><span>Trạng thái dataset</span><strong>Đang chờ pipeline</strong></article>
        </section>

        <section className="panel-grid">
          <article className="panel map-placeholder">
            <p className="eyebrow">Bản đồ tương tác</p>
            <h3>Không gian dành cho bản đồ khí hậu Việt Nam</h3>
          </article>
          <article className="panel">
            <p className="eyebrow">Xu hướng</p>
            <h3>Biểu đồ chuỗi thời gian sẽ xuất hiện tại đây</h3>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;

