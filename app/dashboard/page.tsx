"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiBell,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiGrid,
  FiHome,
  FiLayers,
  FiMail,
  FiMenu,
  FiMoreHorizontal,
  FiPackage,
  FiPlus,
  FiSearch,
  FiSettings,
  FiSliders,
  FiX,
} from "react-icons/fi";
import "./dashboard.css";

type Section = "Overview" | "Orders" | "Fabric requests" | "Settings";
type Status = "Pending" | "Completed" | "Cancelled";

type Order = {
  id: string;
  customer: string;
  initials: string;
  email: string;
  item: string;
  date: string;
  amount: number;
  status: Status;
  tone: string;
};

type FabricRequest = {
  id: string;
  customer: string;
  initials: string;
  email: string;
  item: string;
  dimensions: string;
  fabric: string;
  date: string;
  amount: number;
  status: Status;
  tone: string;
};

const initialOrders: Order[] = [
  { id: "DM-1048", customer: "Salma Benali", initials: "SB", email: "salma.benali@email.com", item: "Salon set · 7 pieces", date: "Oct 14, 2026", amount: 4850, status: "Pending", tone: "rose" },
  { id: "DM-1047", customer: "Youssef Amrani", initials: "YA", email: "y.amrani@email.com", item: "Custom curtains", date: "Oct 14, 2026", amount: 2150, status: "Completed", tone: "blue" },
  { id: "DM-1046", customer: "Lina El Fassi", initials: "LE", email: "lina.elfassi@email.com", item: "Cushion covers · 12 pcs", date: "Oct 13, 2026", amount: 1680, status: "Pending", tone: "green" },
  { id: "DM-1045", customer: "Omar Tazi", initials: "OT", email: "omar.tazi@email.com", item: "Salon set · 5 pieces", date: "Oct 12, 2026", amount: 3720, status: "Completed", tone: "gold" },
  { id: "DM-1044", customer: "Meryem Idrissi", initials: "MI", email: "meryem.idrissi@email.com", item: "Custom curtains · 2", date: "Oct 11, 2026", amount: 2940, status: "Cancelled", tone: "purple" },
  { id: "DM-1043", customer: "Adam Alaoui", initials: "AA", email: "adam.alaoui@email.com", item: "Cushion covers · 8 pcs", date: "Oct 10, 2026", amount: 1120, status: "Completed", tone: "blue" },
  { id: "DM-1042", customer: "Nadia Chraibi", initials: "NC", email: "nadia.chraibi@email.com", item: "Salon set · 9 pieces", date: "Oct 09, 2026", amount: 6280, status: "Pending", tone: "rose" },
  { id: "DM-1041", customer: "Karim Berrada", initials: "KB", email: "karim.berrada@email.com", item: "Custom curtains", date: "Oct 08, 2026", amount: 1860, status: "Completed", tone: "green" },
  { id: "DM-1040", customer: "Imane Fassi", initials: "IF", email: "imane.fassi@email.com", item: "Salon set · 5 pieces", date: "Oct 07, 2026", amount: 3400, status: "Pending", tone: "gold" },
  { id: "DM-1039", customer: "Hamza Lahlou", initials: "HL", email: "hamza.lahlou@email.com", item: "Cushion covers · 6 pcs", date: "Oct 06, 2026", amount: 960, status: "Completed", tone: "purple" },
];

const initialRequests: FabricRequest[] = [
  { id: "FR-208", customer: "Salma Benali", initials: "SB", email: "salma.benali@email.com", item: "Moroccan salon · sdadir", dimensions: "7 pieces · 70 cm width", fabric: "Velvet · Olive", date: "Oct 14, 2026", amount: 4850, status: "Pending", tone: "rose" },
  { id: "FR-207", customer: "Lina El Fassi", initials: "LE", email: "lina.elfassi@email.com", item: "Cushion covers", dimensions: "12 pieces · 45 × 45 cm", fabric: "Jacquard · Sand", date: "Oct 13, 2026", amount: 1680, status: "Pending", tone: "green" },
  { id: "FR-206", customer: "Nadia Chraibi", initials: "NC", email: "nadia.chraibi@email.com", item: "Moroccan salon · sdadir", dimensions: "9 pieces · 70 cm width", fabric: "Classic weave · Terracotta", date: "Oct 12, 2026", amount: 6280, status: "Pending", tone: "rose" },
  { id: "FR-205", customer: "Omar Tazi", initials: "OT", email: "omar.tazi@email.com", item: "Living room curtains", dimensions: "2 panels · 240 × 180 cm", fabric: "Linen · Natural", date: "Oct 11, 2026", amount: 2940, status: "Completed", tone: "gold" },
  { id: "FR-204", customer: "Youssef Amrani", initials: "YA", email: "y.amrani@email.com", item: "Cushion covers", dimensions: "8 pieces · 50 × 50 cm", fabric: "Velvet · Midnight", date: "Oct 10, 2026", amount: 1120, status: "Completed", tone: "blue" },
];

const navItems: { label: Section; icon: typeof FiGrid }[] = [
  { label: "Overview", icon: FiGrid },
  { label: "Orders", icon: FiPackage },
  { label: "Fabric requests", icon: FiLayers },
];

const formatMoney = (amount: number) =>
  `${new Intl.NumberFormat("en-MA", { maximumFractionDigits: 0 }).format(amount)} MAD`;

function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}><span />{status}</span>;
}

function Avatar({ initials, tone }: { initials: string; tone: string }) {
  return <span className={`avatar avatar-${tone}`}>{initials}</span>;
}

function TrendChart() {
  const bars = [34, 48, 40, 62, 47, 56, 39, 72, 52, 65, 48, 82];
  const line = "0,113 56,100 112,106 168,77 224,91 280,70 336,84 392,49 448,61 504,37 560,49 616,16";
  return (
    <div className="chart-wrap">
      <div className="chart-legend">
        <span><i className="legend-dot revenue-dot" />Revenue</span>
        <span><i className="legend-dot orders-dot" />Orders</span>
      </div>
      <div className="chart">
        <div className="chart-y-labels"><span>12k</span><span>9k</span><span>6k</span><span>3k</span><span>0</span></div>
        <div className="chart-plot">
          <div className="chart-grid"><i /><i /><i /><i /><i /></div>
          <div className="chart-bars">{bars.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
          <svg className="chart-line" viewBox="0 0 616 130" preserveAspectRatio="none" role="img" aria-label="Revenue increased steadily over the last 12 months">
            <defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b28154" stopOpacity=".2" /><stop offset="100%" stopColor="#b28154" stopOpacity="0" /></linearGradient></defs>
            <polygon points={`0,130 ${line} 616,130`} fill="url(#revenue-fill)" />
            <polyline points={line} fill="none" stroke="#a87549" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <circle cx="616" cy="16" r="4" fill="#a87549" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="chart-x-labels">{["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"].map((month) => <span key={month}>{month}</span>)}</div>
        </div>
      </div>
    </div>
  );
}

function OrdersTable({
  orders,
  onSelect,
  compact = false,
}: {
  orders: Order[];
  onSelect: (order: Order) => void;
  compact?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Date</th><th>Amount</th><th>Status</th><th /></tr></thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="order-id">{order.id}</td>
              <td><div className="customer-cell"><Avatar initials={order.initials} tone={order.tone} /><div><strong>{order.customer}</strong><small>{order.email}</small></div></div></td>
              <td>{order.item}</td><td className="muted-cell">{order.date}</td><td className="amount-cell">{formatMoney(order.amount)}</td>
              <td><StatusBadge status={order.status} /></td>
              <td><button className="icon-button row-action" aria-label={`View order ${order.id}`} onClick={() => onSelect(order)}><FiMoreHorizontal /></button></td>
            </tr>
          ))}
          {!orders.length && <tr><td colSpan={7} className="empty-state">No orders match your search.</td></tr>}
        </tbody>
      </table>
      {compact && <div className="table-footer"><span>Showing {orders.length} of 248 orders</span><button className="text-link" type="button">View all orders <FiArrowRight /></button></div>}
    </div>
  );
}

export default function DashboardPage() {
  const [section, setSection] = useState<Section>("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState(initialOrders);
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<FabricRequest | null>(null);
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState("DÉCOR.MA");
  const [email, setEmail] = useState("bonjour@decor.ma");
  const [phone, setPhone] = useState("+212 679 299 620");
  const [instagram, setInstagram] = useState("@decor.ma");

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch = `${order.id} ${order.customer} ${order.item}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filter === "All" || order.status === filter);
  }), [orders, search, filter]);
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const pagedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const selectSection = (next: Section) => {
    setSection(next);
    setSidebarOpen(false);
    setSearch("");
    setFilter("All");
    setPage(1);
  };

  const updateRequest = (changes: Partial<FabricRequest>) => {
    setSelectedRequest((current) => current ? { ...current, ...changes } : current);
  };

  const updateOrder = (id: string, changes: Partial<Order>) => {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, ...changes } : order));
    setSelectedOrder((current) => current?.id === id ? { ...current, ...changes } : current);
  };

  const saveSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="dashboard-shell min-h-screen">
      <aside className={`sidebar${sidebarOpen ? " sidebar-open" : ""}`}>
        <a className="dashboard-brand" href="/" aria-label="DÉCOR.MA storefront">
          <span className="brand-mark">D<span>.</span></span>
          <span className="brand-copy"><strong>DÉCOR.MA</strong><small>STUDIO & HOME</small></span>
          <button className="sidebar-close icon-button" type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><FiX /></button>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-logo">D</span>
          <span><strong>DÉCOR.MA Studio</strong><small>Fez, Morocco</small></span>
          <FiChevronDown className="workspace-chevron" />
        </div>

        <p className="sidebar-label">WORKSPACE</p>
        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} type="button" className={`nav-item${section === label ? " nav-item-active" : ""}`} onClick={() => selectSection(label)}>
              <Icon /><span>{label}</span>{label === "Fabric requests" && <i className="nav-count">12</i>}
            </button>
          ))}
        </nav>

        <p className="sidebar-label sidebar-label-spaced">PREFERENCES</p>
        <nav className="sidebar-nav" aria-label="Preferences">
          <button type="button" className={`nav-item${section === "Settings" ? " nav-item-active" : ""}`} onClick={() => selectSection("Settings")}><FiSettings /><span>Settings</span></button>
        </nav>

        <div className="sidebar-promo">
          <div className="promo-icon"><FiActivity /></div>
          <strong>Your studio is growing</strong>
          <p>You’ve had 18% more orders this month. Keep up the lovely work.</p>
          <button type="button" onClick={() => selectSection("Orders")}>See your orders <FiArrowRight /></button>
          <span className="promo-orb promo-orb-one" /><span className="promo-orb promo-orb-two" />
        </div>

        <div className="sidebar-profile">
          <Avatar initials="MA" tone="sand" />
          <span><strong>Marouane A.</strong><small>Store owner</small></span>
          <button className="icon-button" type="button" aria-label="Open settings" onClick={() => selectSection("Settings")}><FiMoreHorizontal /></button>
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

      <main className="dashboard-main">
        <header className="topbar">
          <button className="icon-button mobile-menu" type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><FiMenu /></button>
          <div className="breadcrumbs"><span>Workspace</span><FiChevronRight /><strong>{section}</strong></div>
          <div className="topbar-actions">
            <a className="store-link" href="/" target="_blank" rel="noreferrer"><FiHome /><span>View storefront</span><FiArrowUpRight /></a>
            <span className="topbar-divider" />
            <button className="icon-button notification-button" type="button" aria-label="Notifications"><FiBell /><i /></button>
            <Avatar initials="MA" tone="sand" />
          </div>
        </header>

        <div className="dashboard-content">
          {section === "Overview" && (
            <>
              <div className="page-heading">
                <div><p className="eyebrow">THURSDAY, OCTOBER 15, 2026</p><h1>Good morning, Marouane <span>✦</span></h1><p className="page-subtitle">Here’s what’s happening with your store today.</p></div>
                <button className="button button-outline" type="button" onClick={() => window.print()}><FiDownload /> Export report</button>
              </div>

              <section className="metrics-grid" aria-label="Store metrics">
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-icon icon-moss"><FiPackage /></span><span className="metric-trend"><FiArrowUpRight /> 12.8%</span></div>
                  <p>Total orders</p><strong>248</strong><small>Compared to last month</small>
                  <svg className="sparkline spark-green" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,23 14,18 24,21 38,12 50,16 64,8 76,13 88,4 100,7" /></svg>
                </article>
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-icon icon-sand"><FiClock /></span><span className="metric-trend trend-neutral">Needs attention</span></div>
                  <p>Pending requests</p><strong>12</strong><small>5 quotes · 7 fabric calculations</small>
                  <svg className="sparkline spark-gold" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,21 13,17 26,19 38,11 51,14 65,9 77,13 88,5 100,8" /></svg>
                </article>
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-icon icon-terracotta"><FiActivity /></span><span className="metric-trend"><FiArrowUpRight /> 8.2%</span></div>
                  <p>Total revenue</p><strong>84,250 <small className="metric-currency">MAD</small></strong><small>Compared to last month</small>
                  <svg className="sparkline spark-terracotta" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,23 12,19 25,22 37,14 49,17 63,8 74,14 86,3 100,6" /></svg>
                </article>
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-icon icon-blue"><FiLayers /></span><span className="metric-trend"><FiArrowUpRight /> 6.4%</span></div>
                  <p>Active customers</p><strong>186</strong><small>Since the beginning of this year</small>
                  <div className="metric-avatars"><Avatar initials="SB" tone="rose" /><Avatar initials="YA" tone="blue" /><Avatar initials="LE" tone="green" /><span>+182</span></div>
                </article>
              </section>

              <section className="analytics-grid">
                <article className="panel revenue-panel">
                  <div className="panel-heading"><div><p className="eyebrow">YOUR BUSINESS AT A GLANCE</p><h2>Sales overview</h2></div><button className="select-button" type="button">Last 12 months <FiChevronDown /></button></div>
                  <div className="revenue-total"><strong>84,250 <small>MAD</small></strong><span><FiArrowUpRight /> 8.2%</span><small>vs. previous year</small></div>
                  <TrendChart />
                </article>
                <article className="panel activity-panel">
                  <div className="panel-heading"><div><p className="eyebrow">RECENT UPDATES</p><h2>Latest activity</h2></div><button className="icon-button" type="button" aria-label="More activity options"><FiMoreHorizontal /></button></div>
                  <div className="activity-list">
                    <div className="activity-item"><Avatar initials="SB" tone="rose" /><p><strong>Salma Benali</strong> sent a new fabric request.<small>Moroccan salon · 7 pieces</small><time>12 min ago</time></p><span className="activity-dot dot-gold" /></div>
                    <div className="activity-item"><Avatar initials="YA" tone="blue" /><p><strong>Youssef Amrani</strong> completed an order.<small>Custom curtains · 2 panels</small><time>1 hour ago</time></p><span className="activity-dot dot-green" /></div>
                    <div className="activity-item"><Avatar initials="LE" tone="green" /><p><strong>Lina El Fassi</strong> requested a quote.<small>Cushion covers · 12 pieces</small><time>3 hours ago</time></p><span className="activity-dot dot-gold" /></div>
                    <div className="activity-item"><Avatar initials="OT" tone="gold" /><p><strong>Omar Tazi</strong> left a note on an order.<small>Salon set · “Please call after 5pm”</small><time>Yesterday</time></p><span className="activity-dot dot-blue" /></div>
                  </div>
                  <button className="activity-link" type="button" onClick={() => selectSection("Orders")}>See all activity <FiArrowRight /></button>
                </article>
              </section>

              <section className="panel recent-orders">
                <div className="panel-heading"><div><p className="eyebrow">THE LATEST FROM YOUR SHOP</p><h2>Recent orders</h2></div><button className="button button-text" type="button" onClick={() => selectSection("Orders")}>All orders <FiArrowRight /></button></div>
                <OrdersTable orders={orders.slice(0, 4)} onSelect={setSelectedOrder} compact />
              </section>

              <section className="panel featured-fabric">
                <div className="fabric-image"><Image src="/images/image-4.jpg" alt="Warm-toned DÉCOR.MA fabric collection" fill sizes="(max-width: 760px) 100vw, 300px" /></div>
                <div className="fabric-feature-copy"><span className="eyebrow">A LITTLE STUDIO NOTE</span><h2>Made slowly.<br />Made to feel like home.</h2><p>Each piece begins with a thoughtful choice of fabric, and ends somewhere special.</p></div>
                <div className="fabric-feature-stat"><strong>12</strong><span>fabric requests<br />need your attention</span><button type="button" onClick={() => selectSection("Fabric requests")}>Review requests <FiArrowRight /></button></div>
              </section>
            </>
          )}

          {section === "Orders" && (
            <>
              <div className="page-heading">
                <div><p className="eyebrow">YOUR STUDIO, ORGANIZED</p><h1>Orders & inquiries</h1><p className="page-subtitle">Keep an eye on every conversation and creation.</p></div>
                <button className="button button-dark" type="button" onClick={() => { setSelectedOrder({ id: "New inquiry", customer: "", initials: "", email: "", item: "", date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }), amount: 0, status: "Pending", tone: "sand" }); }}><FiPlus /> New inquiry</button>
              </div>
              <section className="panel orders-panel">
                <div className="orders-toolbar"><div className="filter-tabs">{(["All", "Pending", "Completed", "Cancelled"] as const).map((status) => <button key={status} className={filter === status ? "filter-tab filter-tab-active" : "filter-tab"} type="button" onClick={() => { setFilter(status); setPage(1); }}>{status}<span>{status === "All" ? orders.length : orders.filter((order) => order.status === status).length}</span></button>)}</div>
                  <label className="search-box"><FiSearch /><input aria-label="Search orders" placeholder="Search orders..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
                </div>
                <OrdersTable orders={pagedOrders} onSelect={setSelectedOrder} />
                <div className="pagination"><span>Showing <strong>{filteredOrders.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredOrders.length)}</strong> of <strong>{filteredOrders.length}</strong> orders</span><div><button className="icon-button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><FiChevronLeft /></button><span className="page-number">{page} / {pageCount}</span><button className="icon-button" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}><FiChevronRight /></button></div></div>
              </section>
            </>
          )}

          {section === "Fabric requests" && (
            <>
              <div className="page-heading">
                <div><p className="eyebrow">TAILORED TO EVERY HOME</p><h1>Fabric requests</h1><p className="page-subtitle">Review measurements, prepare estimates, and follow up with your clients.</p></div>
                <span className="request-total"><span />{requests.filter((request) => request.status === "Pending").length} requests to review</span>
              </div>
              <div className="request-summary"><article><span className="summary-icon icon-sand"><FiClock /></span><div><small>Awaiting your quote</small><strong>{requests.filter((request) => request.status === "Pending").length} requests</strong></div></article><article><span className="summary-icon icon-moss"><FiCheck /></span><div><small>Processed this month</small><strong>18 requests</strong></div></article><article><span className="summary-icon icon-terracotta"><FiActivity /></span><div><small>Average response time</small><strong>2.4 hours</strong></div></article></div>
              <section className="panel request-panel">
                <div className="panel-heading"><div><p className="eyebrow">CLIENT MEASUREMENTS & QUOTES</p><h2>All fabric requests <span className="heading-count">{requests.length}</span></h2></div><button className="select-button" type="button" onClick={() => setRequests((current) => [...current].sort((a, b) => a.date < b.date ? 1 : -1))}><FiSliders /> Most recent <FiChevronDown /></button></div>
                <div className="request-list">{requests.map((request) => (
                  <article className="request-row" key={request.id}>
                    <Avatar initials={request.initials} tone={request.tone} />
                    <div className="request-client"><strong>{request.customer}</strong><small>{request.id} · {request.date}</small></div>
                    <div className="request-item"><strong>{request.item}</strong><small>{request.dimensions}</small></div>
                    <div className="request-fabric"><span className="fabric-swatch" /><span><strong>{request.fabric}</strong><small>Selected fabric</small></span></div>
                    <div className="request-amount"><strong>{formatMoney(request.amount)}</strong><small>Estimated quote</small></div>
                    <StatusBadge status={request.status} />
                    <button className="button button-small button-outline" type="button" onClick={() => setSelectedRequest(request)}>{request.status === "Pending" ? "Review" : "View details"} <FiArrowRight /></button>
                  </article>
                ))}</div>
                <div className="request-footer"><span>Showing {requests.length} fabric requests</span><button type="button" className="text-link" onClick={() => setRequests(initialRequests)}>Reset sample data <FiArrowRight /></button></div>
              </section>
              <aside className="calculator-note"><span className="note-icon"><FiActivity /></span><p><strong>Keep your estimates consistent</strong><br />Your current fabric rates are 80 MAD/m for single-face and 90 MAD/m for double-face, plus 50 MAD delivery.</p><button type="button" onClick={() => selectSection("Settings")}>Manage rates <FiArrowRight /></button></aside>
            </>
          )}

          {section === "Settings" && (
            <>
              <div className="page-heading"><div><p className="eyebrow">YOUR STUDIO, YOUR WAY</p><h1>Store settings</h1><p className="page-subtitle">A few details to keep your business looking its best.</p></div></div>
              <form className="panel settings-panel" onSubmit={saveSettings}>
                <div className="settings-section-heading"><span className="settings-icon"><FiHome /></span><div><h2>Store information</h2><p>How your studio appears to clients.</p></div></div>
                <div className="settings-fields">
                  <label>Store name<input value={storeName} onChange={(event) => setStoreName(event.target.value)} /></label>
                  <label>Business email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
                  <label>Phone number<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
                  <label>Instagram handle<input value={instagram} onChange={(event) => setInstagram(event.target.value)} /></label>
                </div>
                <div className="settings-section-heading settings-social-heading"><span className="settings-icon"><FiSliders /></span><div><h2>Customer experience</h2><p>Simple details that make it easy to reach you.</p></div></div>
                <label className="settings-toggle"><span><strong>Show your phone number on the storefront</strong><small>Clients can get in touch directly about their orders.</small></span><input type="checkbox" defaultChecked /><i /></label>
                <label className="settings-toggle"><span><strong>Accept new fabric requests</strong><small>Let clients submit new measurements and quote requests.</small></span><input type="checkbox" defaultChecked /><i /></label>
                <div className="settings-footer">{saved && <span className="save-confirmation"><FiCheck /> Your changes have been saved.</span>}<button className="button button-dark" type="submit"><FiCheck /> Save changes</button></div>
              </form>
              <div className="settings-help"><span className="help-icon"><FiMail /></span><div><strong>Need a hand?</strong><small>We’re always happy to help your studio grow.</small></div><a href="mailto:bonjour@decor.ma">Contact support <FiArrowUpRight /></a></div>
            </>
          )}
        </div>
      </main>

      {(selectedOrder || selectedRequest) && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSelectedOrder(null); setSelectedRequest(null); } }}>
          <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <div className="modal-heading"><div><p className="eyebrow">{selectedRequest ? "FABRIC CALCULATION" : "ORDER DETAILS"}</p><h2 id="detail-title">{selectedRequest?.id ?? selectedOrder?.id}</h2></div><button className="icon-button" type="button" aria-label="Close details" onClick={() => { setSelectedOrder(null); setSelectedRequest(null); }}><FiX /></button></div>
            <div className="modal-client">{selectedRequest ? <Avatar initials={selectedRequest.initials} tone={selectedRequest.tone} /> : selectedOrder && <Avatar initials={selectedOrder.initials || "MA"} tone={selectedOrder.tone} />}<div><strong>{selectedRequest?.customer ?? selectedOrder?.customer ?? "New client inquiry"}</strong><small>{selectedRequest?.email ?? selectedOrder?.email ?? "Add the client’s contact details after saving"}</small></div><StatusBadge status={selectedRequest?.status ?? selectedOrder?.status ?? "Pending"} /></div>
            {selectedRequest ? (
              <div className="detail-fields">
                <div className="detail-measurements"><h3>Client measurements</h3><div><span>Project</span><strong>{selectedRequest.item}</strong></div><div><span>Dimensions</span><strong>{selectedRequest.dimensions}</strong></div><div><span>Chosen fabric</span><strong>{selectedRequest.fabric}</strong></div><div><span>Submitted</span><strong>{selectedRequest.date}</strong></div></div>
                <label>Estimated price (MAD)<input type="number" min="0" step="50" value={selectedRequest.amount} onChange={(event) => updateRequest({ amount: Number(event.target.value) })} /></label>
                <label>Request status<select value={selectedRequest.status} onChange={(event) => updateRequest({ status: event.target.value as Status })}><option>Pending</option><option>Completed</option><option>Cancelled</option></select></label>
              </div>
            ) : selectedOrder ? (
              <div className="detail-fields">
                {selectedOrder.id === "New inquiry" ? <><label>Client name<input autoFocus placeholder="e.g. Amina El Fassi" onChange={(event) => setSelectedOrder({ ...selectedOrder, customer: event.target.value, initials: event.target.value.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() })} /></label><label>Product or inquiry<input placeholder="e.g. Moroccan salon · 5 pieces" onChange={(event) => setSelectedOrder({ ...selectedOrder, item: event.target.value })} /></label><label>Estimated amount (MAD)<input type="number" min="0" value={selectedOrder.amount} onChange={(event) => setSelectedOrder({ ...selectedOrder, amount: Number(event.target.value) })} /></label></> : <><div className="detail-measurements"><h3>Order summary</h3><div><span>Product</span><strong>{selectedOrder.item}</strong></div><div><span>Order date</span><strong>{selectedOrder.date}</strong></div><div><span>Customer email</span><strong>{selectedOrder.email}</strong></div><div><span>Total</span><strong>{formatMoney(selectedOrder.amount)}</strong></div></div><label>Order status<select value={selectedOrder.status} onChange={(event) => updateOrder(selectedOrder.id, { status: event.target.value as Status })}><option>Pending</option><option>Completed</option><option>Cancelled</option></select></label></>}
              </div>
            ) : null}
            <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => { setSelectedOrder(null); setSelectedRequest(null); }}>Close</button>{selectedOrder?.id === "New inquiry" && <button type="button" className="button button-dark" onClick={() => { const next: Order = { ...selectedOrder, id: `DM-${1049 + orders.length - initialOrders.length}`, customer: selectedOrder.customer || "New client", initials: selectedOrder.initials || "NC", item: selectedOrder.item || "New inquiry", email: "Client contact pending", tone: "sand" }; setOrders((current) => [next, ...current]); setSelectedOrder(null); }}>Save inquiry</button>}{selectedRequest && <button type="button" className="button button-dark" onClick={() => { setRequests((current) => current.map((request) => request.id === selectedRequest.id ? selectedRequest : request)); setSelectedRequest(null); }}>Save quote <FiCheck /></button>}</div>
          </section>
        </div>
      )}
    </div>
  );
}
