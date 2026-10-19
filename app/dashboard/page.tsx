"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
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
  FiImage,
  FiLayers,
  FiLogOut,
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
import { DEFAULT_PRICING, type PricingSettings } from "@/lib/pricing";

type CatalogImage = {
  id: string;
  category: "fabric" | "project";
  title: string;
  src: string;
};

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

type SalesPoint = {
  label: string;
  revenue: number;
  orders: number;
};

type SalesRange = "12-months" | "30-days";

const sectionNames: Record<Section, string> = {
  Overview: "لوحة المعلومات",
  Orders: "الطلبات",
  "Fabric requests": "طلبات الأقمشة",
  Settings: "الإعدادات",
};

const navItems: { label: Section; title: string; icon: typeof FiGrid }[] = [
  { label: "Overview", title: sectionNames.Overview, icon: FiGrid },
  { label: "Orders", title: sectionNames.Orders, icon: FiPackage },
  { label: "Fabric requests", title: sectionNames["Fabric requests"], icon: FiLayers },
];

const formatMoney = (amount: number) =>
  `${new Intl.NumberFormat("ar-MA", { maximumFractionDigits: 0 }).format(amount)} درهم`;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("ar-MA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`));

const getNextOrderId = (orders: Order[]) => {
  const highestId = orders.reduce((highest, order) => {
    const match = /^DM-(\d+)$/.exec(order.id);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `DM-${String(highestId + 1).padStart(4, "0")}`;
};

function getSalesData(orders: Order[], range: SalesRange): SalesPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedOrders = orders.filter((order) => order.status === "Completed");

  if (range === "12-months") {
    return Array.from({ length: 12 }, (_, index) => {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - 11 + index, 1);
      const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      const monthOrders = completedOrders.filter((order) => {
        const orderDate = new Date(`${order.date}T00:00:00`);
        return `${orderDate.getFullYear()}-${orderDate.getMonth()}` === key;
      });
      return {
        label: new Intl.DateTimeFormat("ar-MA", { month: "short" }).format(monthDate),
        revenue: monthOrders.reduce((total, order) => total + order.amount, 0),
        orders: monthOrders.length,
      };
    });
  }

  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - 29);
  return Array.from({ length: 10 }, (_, index) => {
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() + index * 3);
    const end = new Date(start);
    end.setDate(start.getDate() + 2);
    const endOfRange = new Date(end);
    endOfRange.setHours(23, 59, 59, 999);
    const rangeOrders = completedOrders.filter((order) => {
      const orderDate = new Date(`${order.date}T00:00:00`);
      return orderDate >= start && orderDate <= endOfRange;
    });
    const label = start.getMonth() === end.getMonth()
      ? `${start.getDate()}–${end.getDate()}`
      : `${start.getDate()} ${new Intl.DateTimeFormat("ar-MA", { month: "short" }).format(start)}–${end.getDate()} ${new Intl.DateTimeFormat("ar-MA", { month: "short" }).format(end)}`;
    return {
      label,
      revenue: rangeOrders.reduce((total, order) => total + order.amount, 0),
      orders: rangeOrders.length,
    };
  });
}

function StatusBadge({ status }: { status: Status }) {
  const labels: Record<Status, string> = { Pending: "قيد الانتظار", Completed: "مكتمل", Cancelled: "ملغي" };
  return <span className={`status-badge status-${status.toLowerCase()}`}><span />{labels[status]}</span>;
}

function Avatar({ initials, tone }: { initials: string; tone: string }) {
  return <span className={`avatar avatar-${tone}`}>{initials}</span>;
}

function TrendChart({ data, range }: { data: SalesPoint[]; range: SalesRange }) {
  const maxRevenue = Math.max(0, ...data.map((point) => point.revenue));
  const maxOrders = Math.max(0, ...data.map((point) => point.orders));
  const hasSales = data.some((point) => point.orders > 0);
  const line = data.map((point, index) => {
    const x = data.length === 1 ? 308 : (index / (data.length - 1)) * 616;
    const y = maxRevenue ? 130 - (point.revenue / maxRevenue) * 112 : 130;
    return `${x},${y}`;
  }).join(" ");
  const firstPoint = line.split(" ")[0];
  const lastPoint = line.split(" ").at(-1);
  const area = `${firstPoint} ${line} ${lastPoint?.split(",")[0]},130`;
  return (
    <div className="chart-wrap">
      <div className="chart-legend">
        <span><i className="legend-dot revenue-dot" />الإيرادات</span>
        <span><i className="legend-dot orders-dot" />الطلبات</span>
      </div>
      <div className="chart">
        <div className="chart-y-labels"><span>{formatCompactMoney(maxRevenue)}</span><span>{formatCompactMoney(maxRevenue * .75)}</span><span>{formatCompactMoney(maxRevenue * .5)}</span><span>{formatCompactMoney(maxRevenue * .25)}</span><span>0</span></div>
        <div className="chart-plot">
          <div className="chart-grid"><i /><i /><i /><i /><i /></div>
          <div className="chart-bars">{data.map((point) => <span key={point.label} style={{ height: `${maxOrders ? (point.orders / maxOrders) * 78 : 0}%` }} />)}</div>
          <svg className="chart-line" viewBox="0 0 616 130" preserveAspectRatio="none" role="img" aria-label={`الإيرادات والطلبات خلال ${range === "12-months" ? "الأشهر الاثني عشر الماضية" : "الثلاثين يوماً الماضية"}`}>
            <defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b28154" stopOpacity=".2" /><stop offset="100%" stopColor="#b28154" stopOpacity="0" /></linearGradient></defs>
            <polygon points={`0,130 ${area}`} fill="url(#revenue-fill)" />
            <polyline points={line} fill="none" stroke="#a87549" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <circle cx={lastPoint?.split(",")[0]} cy={lastPoint?.split(",")[1]} r="4" fill="#a87549" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="chart-x-labels">{data.map((point) => <span key={point.label}>{point.label}</span>)}</div>
          {!hasSales && <span className="chart-empty-state">لا توجد مبيعات مكتملة خلال هذه الفترة</span>}
        </div>
      </div>
    </div>
  );
}

function formatCompactMoney(amount: number) {
  return amount >= 1000
    ? `${new Intl.NumberFormat("ar-MA", { maximumFractionDigits: 1 }).format(amount / 1000)} ألف`
    : new Intl.NumberFormat("ar-MA", { maximumFractionDigits: 0 }).format(amount);
}

function OrdersTable({
  orders,
  onSelect,
  onViewAll,
  compactTotal,
  compact = false,
}: {
  orders: Order[];
  onSelect: (order: Order) => void;
  onViewAll?: () => void;
  compactTotal?: number;
  compact?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr><th>رقم الطلب</th><th>العميل</th><th>المنتج</th><th>التاريخ</th><th>المبلغ</th><th>الحالة</th><th /></tr></thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="order-id" dir="ltr">{order.id}</td>
              <td><div className="customer-cell"><Avatar initials={order.initials} tone={order.tone} /><div><strong>{order.customer}</strong><small>{order.email}</small></div></div></td>
              <td>{order.item}</td><td className="muted-cell">{formatDate(order.date)}</td><td className="amount-cell">{formatMoney(order.amount)}</td>
              <td><StatusBadge status={order.status} /></td>
              <td><button className="icon-button row-action" aria-label={`عرض الطلب ${order.id}`} onClick={() => onSelect(order)}><FiMoreHorizontal /></button></td>
            </tr>
          ))}
          {!orders.length && <tr><td colSpan={7} className="empty-state">لا توجد طلبات مطابقة للبحث.</td></tr>}
        </tbody>
      </table>
      {compact && <div className="table-footer"><span>عرض {orders.length} من أصل {compactTotal ?? orders.length} طلبات مطابقة</span><button className="text-link" type="button" onClick={onViewAll}>عرض جميع الطلبات <FiArrowRight /></button></div>}
    </div>
  );
}

export default function DashboardPage() {
  const [section, setSection] = useState<Section>("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<FabricRequest[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [recentSearch, setRecentSearch] = useState("");
  const [recentFilter, setRecentFilter] = useState<"All" | Status>("All");
  const [salesRange, setSalesRange] = useState<SalesRange>("12-months");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<FabricRequest | null>(null);
  const [saved, setSaved] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricing, setPricing] = useState<PricingSettings>(DEFAULT_PRICING);
  const [catalog, setCatalog] = useState<CatalogImage[]>([]);
  const [uploadCategory, setUploadCategory] = useState<CatalogImage["category"]>("fabric");
  const [uploadTitle, setUploadTitle] = useState("");
  const [mediaBusyId, setMediaBusyId] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [storeName, setStoreName] = useState("DÉCOR.MA");
  const [email, setEmail] = useState("bonjour@decor.ma");
  const [phone, setPhone] = useState("+212 679 299 620");
  const [instagram, setInstagram] = useState("@decor.ma");
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/store-settings")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "تعذّر تحميل الأسعار.");
        return data as { pricing: PricingSettings };
      })
      .then((data) => {
        if (active) setPricing(data.pricing);
      })
      .catch((error: unknown) => {
        if (active) setSettingsError(error instanceof Error ? error.message : "تعذّر تحميل الأسعار.");
      })
      .finally(() => {
        if (active) setPricingLoading(false);
      });
    fetch("/api/catalog")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "تعذّر تحميل الصور.");
        return data as { catalog: CatalogImage[] };
      })
      .then((data) => {
        if (active) setCatalog(data.catalog);
      })
      .catch((error: unknown) => {
        if (active) setMediaError(error instanceof Error ? error.message : "تعذّر تحميل الصور.");
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch = `${order.id} ${order.customer} ${order.item}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filter === "All" || order.status === filter);
  }), [orders, search, filter]);
  const filteredRecentOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch = `${order.id} ${order.customer} ${order.email} ${order.item}`.toLowerCase().includes(recentSearch.trim().toLowerCase());
    return matchesSearch && (recentFilter === "All" || order.status === recentFilter);
  }), [orders, recentSearch, recentFilter]);
  const chartData = useMemo(() => getSalesData(orders, salesRange), [orders, salesRange]);
  const chartRevenue = chartData.reduce((total, point) => total + point.revenue, 0);
  const completedRevenue = orders.reduce((total, order) => total + (order.status === "Completed" ? order.amount : 0), 0);
  const activeCustomerRecords = Array.from(new Map(orders.filter((order) => order.customer).map((order) => [order.customer, order])).values());
  const activeCustomers = activeCustomerRecords.length;
  const pendingRequests = requests.filter((request) => request.status === "Pending").length;
  const latestActivity = [
    ...orders.map((order) => ({ id: order.id, customer: order.customer, initials: order.initials, tone: order.tone, action: "order" as const, detail: order.item, date: order.date })),
    ...requests.map((request) => ({ id: request.id, customer: request.customer, initials: request.initials, tone: request.tone, action: "request" as const, detail: request.item, date: request.date })),
  ].sort((left, right) => right.date.localeCompare(left.date)).slice(0, 4);
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

  const exportReport = () => {
    const headers = ["النوع", "المعرّف", "العميل", "البريد الإلكتروني", "المنتج", "التاريخ", "المبلغ (درهم)", "الحالة"];
    const rows = [
      ...orders.map((order) => ["طلب", order.id, order.customer, order.email, order.item, order.date, order.amount, order.status]),
      ...requests.map((request) => ["طلب قماش", request.id, request.customer, request.email, `${request.item} · ${request.dimensions} · ${request.fabric}`, request.date, request.amount, request.status]),
    ];
    const escapeCsvValue = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
    const file = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `decor-ma-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const logout = async () => {
    setLogoutError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout request failed.");
      window.location.assign("/admin/login");
    } catch {
      setLogoutError("تعذّر تسجيل الخروج الآن. يرجى المحاولة مرة أخرى.");
    }
  };

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsError("");
    setSaved(false);
    setSavingSettings(true);
    try {
      const response = await fetch("/api/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "تعذّر حفظ الأسعار.");
      setPricing(data.pricing);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "تعذّر حفظ الأسعار.");
    } finally {
      setSavingSettings(false);
    }
  };

  const uploadCatalogImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
    image?: CatalogImage,
  ) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setMediaError("");
    setMediaBusyId(image?.id ?? "new");
    try {
      const extension = file.type === "image/jpeg" ? "jpg" : file.type.slice("image/".length);
      await upload(`images/${crypto.randomUUID()}.${extension}`, file, {
        access: "public",
        contentType: file.type,
        handleUploadUrl: "/api/catalog/upload",
        clientPayload: JSON.stringify({
          category: image?.category ?? uploadCategory,
          title: image?.title ?? uploadTitle.trim(),
          ...(image ? { id: image.id } : {}),
        }),
      });
      const response = await fetch("/api/catalog");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "تعذّر تحميل كتالوج الصور.");
      setCatalog(data.catalog);
      setUploadTitle("");
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "تعذّر رفع الصورة.");
    } finally {
      setMediaBusyId("");
    }
  };

  const deleteCatalogImage = async (image: CatalogImage) => {
    if (!window.confirm(`هل تريدون حذف الصورة "${image.title}" من المتجر؟`)) return;
    setMediaError("");
    setMediaBusyId(image.id);
    try {
      const response = await fetch(`/api/catalog/${encodeURIComponent(image.id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "تعذّر حذف الصورة.");
      setCatalog(data.catalog);
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "تعذّر حذف الصورة.");
    } finally {
      setMediaBusyId("");
    }
  };

  return (
    <div className="dashboard-shell min-h-screen">
      <aside className={`sidebar${sidebarOpen ? " sidebar-open" : ""}`}>
        <a className="dashboard-brand" href="/" aria-label="العودة إلى متجر DÉCOR.MA">
          <Image className="brand-mark" src="/images/logo.jpg" alt="شعار DÉCOR.MA الرسمي" width={42} height={42} priority />
          <span className="brand-copy"><strong>DÉCOR.MA</strong><small>الدار والأناقة</small></span>
          <button className="sidebar-close icon-button" type="button" aria-label="إغلاق القائمة" onClick={() => setSidebarOpen(false)}><FiX /></button>
        </a>

        <div className="workspace-switcher">
          <Image className="workspace-logo" src="/images/logo.jpg" alt="" width={34} height={34} />
          <span><strong>استوديو DÉCOR.MA</strong><small>فاس، المغرب</small></span>
          <FiChevronDown className="workspace-chevron" />
        </div>

        <p className="sidebar-label">مساحة العمل</p>
        <nav className="sidebar-nav" aria-label="التنقل في لوحة التحكم">
          {navItems.map(({ label, title, icon: Icon }) => (
            <button key={label} type="button" className={`nav-item${section === label ? " nav-item-active" : ""}`} onClick={() => selectSection(label)}>
              <Icon /><span>{title}</span>{label === "Fabric requests" && <i className="nav-count">{pendingRequests}</i>}
            </button>
          ))}
        </nav>

        <p className="sidebar-label sidebar-label-spaced">التفضيلات</p>
        <nav className="sidebar-nav" aria-label="التفضيلات">
          <button type="button" className={`nav-item${section === "Settings" ? " nav-item-active" : ""}`} onClick={() => selectSection("Settings")}><FiSettings /><span>الإعدادات</span></button>
        </nav>

        <div className="sidebar-promo">
          <div className="promo-icon"><FiActivity /></div>
          <strong>{orders.length ? "استوديوكم يواصل النمو" : "استوديوكم جاهز"}</strong>
          <p>{orders.length ? `لديكم ${orders.length} طلبات مسجلة. نرجو لكم دوام التوفيق.` : "لوحة التحكم جاهزة لتسجيل طلبكم الأول."}</p>
          <button type="button" onClick={() => selectSection("Orders")}>استعراض الطلبات <FiArrowRight /></button>
          <span className="promo-orb promo-orb-one" /><span className="promo-orb promo-orb-two" />
        </div>

        <div className="sidebar-profile">
          <Avatar initials="AF" tone="sand" />
          <span><strong>أمين فاضل</strong><small>مالك المتجر</small></span>
          <button className="icon-button" type="button" aria-label="تسجيل الخروج" onClick={logout}><FiLogOut /></button>
        </div>
        {logoutError && <p className="logout-error" role="alert">{logoutError}</p>}
      </aside>

      {sidebarOpen && <button className="sidebar-backdrop" type="button" aria-label="إغلاق القائمة" onClick={() => setSidebarOpen(false)} />}

      <main className="dashboard-main">
        <header className="topbar">
          <button className="icon-button mobile-menu" type="button" aria-label="فتح القائمة" onClick={() => setSidebarOpen(true)}><FiMenu /></button>
          <div className="breadcrumbs"><span>مساحة العمل</span><FiChevronRight /><strong>{sectionNames[section]}</strong></div>
          <div className="topbar-actions">
            <a className="store-link" href="/" target="_blank" rel="noreferrer"><FiHome /><span>عرض المتجر</span><FiArrowUpRight /></a>
            <span className="topbar-divider" />
            <button className="icon-button notification-button" type="button" aria-label="الإشعارات"><FiBell /><i /></button>
            <Avatar initials="م" tone="sand" />
          </div>
        </header>

        <div className="dashboard-content">
          {section === "Overview" && (
            <>
              <div className="page-heading">
                <div><p className="eyebrow">{new Intl.DateTimeFormat("ar-MA", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date())}</p><h1>مرحباً بعودتكم، أمين فاضل <span>✦</span></h1><p className="page-subtitle">إليكم لمحة عمّا يجري في متجركم اليوم.</p></div>
                <button className="button button-outline" type="button" onClick={exportReport}><FiDownload /> تصدير التقرير</button>
              </div>

              <section className="metrics-grid" aria-label="مؤشرات المتجر">
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-icon icon-moss"><FiPackage /></span><span className="metric-trend trend-neutral">سجل الطلبات</span></div>
                  <p>إجمالي الطلبات</p><strong>{new Intl.NumberFormat("ar-MA").format(orders.length)}</strong><small>الطلبات المسجلة في المتجر</small>
                </article>
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-icon icon-sand"><FiClock /></span><span className="metric-trend trend-neutral">تتطلب المتابعة</span></div>
                  <p>الطلبات المعلّقة</p><strong>{new Intl.NumberFormat("ar-MA").format(pendingRequests)}</strong><small>بانتظار المراجعة</small>
                </article>
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-icon icon-terracotta"><FiActivity /></span><span className="metric-trend trend-neutral">مكتملة</span></div>
                  <p>إجمالي الإيرادات</p><strong>{formatMoney(completedRevenue)}</strong><small>من الطلبات المكتملة</small>
                </article>
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-icon icon-blue"><FiLayers /></span><span className="metric-trend trend-neutral">مسجلون</span></div>
                  <p>العملاء النشطون</p><strong>{new Intl.NumberFormat("ar-MA").format(activeCustomers)}</strong><small>لديهم طلب مسجل</small>
                  {activeCustomerRecords.length > 0 && <div className="metric-avatars">{activeCustomerRecords.slice(0, 3).map((customer) => <Avatar key={customer.customer} initials={customer.initials} tone={customer.tone} />)}{activeCustomers > 3 && <span>+{activeCustomers - 3}</span>}</div>}
                </article>
              </section>

              <section className="analytics-grid">
                <article className="panel revenue-panel">
                  <div className="panel-heading"><div><p className="eyebrow">لمحة عن أعمالكم</p><h2>نظرة عامة على المبيعات</h2></div><select className="select-button" aria-label="الفترة الزمنية للمبيعات" value={salesRange} onChange={(event) => setSalesRange(event.target.value as SalesRange)}><option value="12-months">آخر ١٢ شهراً</option><option value="30-days">آخر ٣٠ يوماً</option></select></div>
                  <div className="revenue-total"><strong>{formatMoney(chartRevenue)}</strong><span>{salesRange === "12-months" ? "١٢ شهراً" : "٣٠ يوماً"}</span><small>إيرادات الطلبات المكتملة</small></div>
                  <TrendChart data={chartData} range={salesRange} />
                </article>
                <article className="panel activity-panel">
                  <div className="panel-heading"><div><p className="eyebrow">آخر المستجدات</p><h2>النشاط الأخير</h2></div><button className="icon-button" type="button" aria-label="خيارات النشاط"><FiMoreHorizontal /></button></div>
                  <div className="activity-list">{latestActivity.length ? latestActivity.map((activity) => (
                    <div className="activity-item" key={activity.id}><Avatar initials={activity.initials} tone={activity.tone} /><p><strong>{activity.customer}</strong> {activity.action === "order" ? "أضاف طلباً جديداً." : "أرسل طلب أقمشة."}<small>{activity.detail}</small><time>{formatDate(activity.date)}</time></p><span className="activity-dot dot-green" /></div>
                  )) : <p className="activity-empty">ستظهر طلباتكم وطلبات الأقمشة هنا.</p>}</div>
                  <button className="activity-link" type="button" onClick={() => selectSection("Orders")}>عرض جميع الأنشطة <FiArrowRight /></button>
                </article>
              </section>

              <section className="panel recent-orders">
                <div className="panel-heading recent-orders-heading"><div><p className="eyebrow">أحدث ما في متجركم</p><h2>أحدث الطلبات</h2></div><div className="recent-order-controls"><label className="search-box"><FiSearch /><input aria-label="البحث في أحدث الطلبات" placeholder="ابحث في الطلبات..." value={recentSearch} onChange={(event) => setRecentSearch(event.target.value)} /></label><select className="select-button recent-status-select" aria-label="تصفية الطلبات حسب الحالة" value={recentFilter} onChange={(event) => setRecentFilter(event.target.value as "All" | Status)}><option value="All">الكل</option><option value="Pending">قيد الانتظار</option><option value="Completed">مكتمل</option><option value="Cancelled">ملغي</option></select><button className="button button-text" type="button" onClick={() => selectSection("Orders")}>كل الطلبات <FiArrowRight /></button></div></div>
                <OrdersTable orders={filteredRecentOrders.slice(0, 4)} compactTotal={filteredRecentOrders.length} onSelect={setSelectedOrder} onViewAll={() => selectSection("Orders")} compact />
              </section>

              <section className="panel featured-fabric">
                <div className="fabric-image"><Image src="/images/image-4.jpg" alt="تشكيلة أقمشة DÉCOR.MA بألوان دافئة" fill sizes="(max-width: 760px) 100vw, 300px" /></div>
                <div className="fabric-feature-copy"><span className="eyebrow">رسالة من الاستوديو</span><h2>صُنعت بتمهّل،<br />لتمنح البيت دفئاً.</h2><p>تبدأ كل قطعة باختيار قماش بعناية، وتنتهي في مكان يليق بكم.</p></div>
                <div className="fabric-feature-stat"><strong>{new Intl.NumberFormat("ar-MA").format(pendingRequests)}</strong><span>طلبات أقمشة<br />بانتظار المراجعة</span><button type="button" onClick={() => selectSection("Fabric requests")}>مراجعة الطلبات <FiArrowRight /></button></div>
              </section>
            </>
          )}

          {section === "Orders" && (
            <>
              <div className="page-heading">
                <div><p className="eyebrow">ترتيب أعمال الاستوديو</p><h1>الطلبات والاستفسارات</h1><p className="page-subtitle">تابعوا جميع المحادثات والطلبات الجديدة.</p></div>
                <button className="button button-dark" type="button" onClick={() => { setSelectedOrder({ id: "New inquiry", customer: "", initials: "", email: "", item: "", date: new Date().toISOString().slice(0, 10), amount: 0, status: "Pending", tone: "sand" }); }}><FiPlus /> إضافة طلب</button>
              </div>
              <section className="panel orders-panel">
                <div className="orders-toolbar"><div className="filter-tabs">{(["All", "Pending", "Completed", "Cancelled"] as const).map((status) => <button key={status} className={filter === status ? "filter-tab filter-tab-active" : "filter-tab"} type="button" onClick={() => { setFilter(status); setPage(1); }}>{status === "All" ? "الكل" : status === "Pending" ? "قيد الانتظار" : status === "Completed" ? "مكتمل" : "ملغي"}<span>{new Intl.NumberFormat("ar-MA").format(status === "All" ? orders.length : orders.filter((order) => order.status === status).length)}</span></button>)}</div>
                  <label className="search-box"><FiSearch /><input aria-label="البحث في الطلبات" placeholder="ابحث عن طلب..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
                </div>
                <OrdersTable orders={pagedOrders} onSelect={setSelectedOrder} />
                <div className="pagination"><span>عرض <strong>{new Intl.NumberFormat("ar-MA").format(filteredOrders.length ? (page - 1) * pageSize + 1 : 0)}–{new Intl.NumberFormat("ar-MA").format(Math.min(page * pageSize, filteredOrders.length))}</strong> من أصل <strong>{new Intl.NumberFormat("ar-MA").format(filteredOrders.length)}</strong> طلبات</span><div><button className="icon-button" aria-label="الصفحة السابقة" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><FiChevronRight /></button><span className="page-number">{new Intl.NumberFormat("ar-MA").format(page)} / {new Intl.NumberFormat("ar-MA").format(pageCount)}</span><button className="icon-button" aria-label="الصفحة التالية" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}><FiChevronLeft /></button></div></div>
              </section>
            </>
          )}

          {section === "Fabric requests" && (
            <>
              <div className="page-heading">
                <div><p className="eyebrow">تفاصيل تناسب كل منزل</p><h1>طلبات الأقمشة</h1><p className="page-subtitle">راجعوا المقاسات، وأعدّوا عروض الأسعار، وتابعوا طلبات العملاء.</p></div>
                <span className="request-total"><span />{new Intl.NumberFormat("ar-MA").format(pendingRequests)} طلبات بانتظار المراجعة</span>
              </div>
              <div className="request-summary"><article><span className="summary-icon icon-sand"><FiClock /></span><div><small>بانتظار عرض السعر</small><strong>{new Intl.NumberFormat("ar-MA").format(pendingRequests)} طلبات</strong></div></article><article><span className="summary-icon icon-moss"><FiCheck /></span><div><small>الطلبات المكتملة</small><strong>{new Intl.NumberFormat("ar-MA").format(requests.filter((request) => request.status === "Completed").length)} طلبات</strong></div></article><article><span className="summary-icon icon-terracotta"><FiActivity /></span><div><small>إجمالي الطلبات</small><strong>{new Intl.NumberFormat("ar-MA").format(requests.length)} طلبات</strong></div></article></div>
              <section className="panel request-panel">
                <div className="panel-heading"><div><p className="eyebrow">مقاسات العملاء وعروض الأسعار</p><h2>جميع طلبات الأقمشة <span className="heading-count">{new Intl.NumberFormat("ar-MA").format(requests.length)}</span></h2></div><button className="select-button" type="button" onClick={() => setRequests((current) => [...current].sort((a, b) => a.date < b.date ? 1 : -1))}><FiSliders /> الأحدث أولاً <FiChevronDown /></button></div>
                <div className="request-list">{requests.length ? requests.map((request) => (
                  <article className="request-row" key={request.id}>
                    <Avatar initials={request.initials} tone={request.tone} />
                      <div className="request-client"><strong>{request.customer}</strong><small><bdi>{request.id}</bdi> · {formatDate(request.date)}</small></div>
                    <div className="request-item"><strong>{request.item}</strong><small>{request.dimensions}</small></div>
                      <div className="request-fabric"><span className="fabric-swatch" /><span><strong>{request.fabric}</strong><small>القماش المختار</small></span></div>
                      <div className="request-amount"><strong>{formatMoney(request.amount)}</strong><small>السعر التقديري</small></div>
                    <StatusBadge status={request.status} />
                    <button className="button button-small button-outline" type="button" onClick={() => setSelectedRequest(request)}>{request.status === "Pending" ? "مراجعة" : "عرض التفاصيل"} <FiArrowRight /></button>
                  </article>
                )) : <p className="request-empty">لا توجد طلبات أقمشة بعد. ستظهر هنا الطلبات الجديدة من العملاء.</p>}</div>
                <div className="request-footer"><span>عرض {new Intl.NumberFormat("ar-MA").format(requests.length)} طلبات أقمشة</span></div>
              </section>
              <aside className="calculator-note"><span className="note-icon"><FiActivity /></span><p><strong>حافظوا على اتساق عروض الأسعار</strong><br />سعر المتر للوجه الواحد {formatMoney(pricing.singleFace)}، وللوجهين {formatMoney(pricing.doubleFace)}، إضافةً إلى {formatMoney(pricing.shippingCost)} للتوصيل.</p><button type="button" onClick={() => selectSection("Settings")}>إدارة الأسعار <FiArrowRight /></button></aside>
            </>
          )}

          {section === "Settings" && (
            <>
              <div className="page-heading"><div><p className="eyebrow">استوديوكم على ذوقكم</p><h1>إعدادات المتجر</h1><p className="page-subtitle">حدّثوا معلومات متجركم وطريقة تواصلكم مع العملاء.</p></div></div>
              <form className="panel settings-panel" onSubmit={saveSettings}>
                <div className="settings-section-heading"><span className="settings-icon"><FiHome /></span><div><h2>معلومات المتجر</h2><p>كيف يظهر الاستوديو للعملاء.</p></div></div>
                <div className="settings-fields">
                  <label>اسم المتجر<input value={storeName} onChange={(event) => setStoreName(event.target.value)} /></label>
                  <label>البريد الإلكتروني<input type="email" dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
                  <label>رقم الهاتف<input type="tel" dir="ltr" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
                  <label>حساب إنستغرام<input dir="ltr" value={instagram} onChange={(event) => setInstagram(event.target.value)} /></label>
                </div>
                <div className="settings-section-heading settings-social-heading"><span className="settings-icon"><FiActivity /></span><div><h2>أسعار الحاسبة</h2><p>تُحدّث هذه الأسعار حاسبة المتر في المتجر مباشرةً.</p></div></div>
                <div className="settings-fields pricing-fields">
                  <label>سعر المتر للوجه الواحد (درهم)<input type="number" min="0" max="1000000" step="0.01" value={pricing.singleFace} onChange={(event) => setPricing((current) => ({ ...current, singleFace: Number(event.target.value) }))} disabled={pricingLoading} required /></label>
                  <label>سعر المتر للوجهين (درهم)<input type="number" min="0" max="1000000" step="0.01" value={pricing.doubleFace} onChange={(event) => setPricing((current) => ({ ...current, doubleFace: Number(event.target.value) }))} disabled={pricingLoading} required /></label>
                  <label>رسوم التوصيل (درهم)<input type="number" min="0" max="1000000" step="0.01" value={pricing.shippingCost} onChange={(event) => setPricing((current) => ({ ...current, shippingCost: Number(event.target.value) }))} disabled={pricingLoading} required /></label>
                </div>
                {settingsError && <p className="settings-error" role="alert">{settingsError}</p>}
                <div className="settings-section-heading settings-social-heading"><span className="settings-icon"><FiSliders /></span><div><h2>تجربة العملاء</h2><p>تفاصيل تساعد العملاء على التواصل معكم بسهولة.</p></div></div>
                <label className="settings-toggle"><span><strong>إظهار رقم الهاتف في المتجر</strong><small>يمكن للعملاء التواصل معكم مباشرةً بشأن طلباتهم.</small></span><input type="checkbox" defaultChecked /><i /></label>
                <label className="settings-toggle"><span><strong>استقبال طلبات الأقمشة الجديدة</strong><small>اسمحوا للعملاء بإرسال المقاسات وطلبات عروض الأسعار.</small></span><input type="checkbox" defaultChecked /><i /></label>
                <div className="settings-footer">{saved && <span className="save-confirmation"><FiCheck /> تم حفظ التغييرات.</span>}<button className="button button-dark" type="submit" disabled={savingSettings || pricingLoading}>{savingSettings ? "جارٍ الحفظ..." : <><FiCheck /> حفظ التغييرات</>}</button></div>
              </form>
              <section className="panel image-manager-panel">
                <div className="settings-section-heading"><span className="settings-icon"><FiImage /></span><div><h2>إدارة صور المتجر</h2><p>حدّثوا صور الأقمشة وأعمال الصالون أو أضيفوا صوراً جديدة.</p></div></div>
                <form className="image-upload-form" onSubmit={(event) => event.preventDefault()}>
                  <label>نوع الصورة<select value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value as CatalogImage["category"])}><option value="fabric">قماش</option><option value="project">عمل / منتج</option></select></label>
                  <label>اسم الصورة<input value={uploadTitle} onChange={(event) => setUploadTitle(event.target.value)} maxLength={100} required /></label>
                  <label className="image-file-control"><FiImage /> رفع صورة جديدة<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadCatalogImage(event)} disabled={Boolean(mediaBusyId)} /></label>
                </form>
                {mediaError && <p className="settings-error" role="alert">{mediaError}</p>}
                <div className="managed-image-grid">
                  {catalog.map((image) => (
                    <article className="managed-image-card" key={image.id}>
                      <Image src={image.src} alt={image.title} width={480} height={320} unoptimized />
                      <div className="managed-image-copy"><strong>{image.title}</strong><small>{image.category === "fabric" ? "قماش" : "عمل / منتج"}</small></div>
                      <div className="managed-image-actions">
                        <label className="button button-small button-outline">{mediaBusyId === image.id ? "جارٍ التحديث..." : "تغيير الصورة"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadCatalogImage(event, image)} disabled={Boolean(mediaBusyId)} /></label>
                        <button className="button button-small button-outline image-delete-button" type="button" onClick={() => deleteCatalogImage(image)} disabled={Boolean(mediaBusyId)} aria-label={`حذف صورة ${image.title}`}>حذف</button>
                      </div>
                    </article>
                  ))}
                  {!catalog.length && !mediaError && <p className="image-catalog-empty">لا توجد صور في الكتالوج حالياً.</p>}
                </div>
                <p className="image-manager-hint">الصيغ المدعومة: JPG وPNG وWebP · الحد الأقصى: 5 ميغابايت للصورة.</p>
              </section>
              <div className="settings-help"><span className="help-icon"><FiMail /></span><div><strong>هل تحتاجون إلى المساعدة؟</strong><small>يسعدنا دائماً دعم نمو استوديوكم.</small></div><a href="mailto:bonjour@decor.ma">تواصلوا مع الدعم <FiArrowUpRight /></a></div>
            </>
          )}
        </div>
      </main>

      {(selectedOrder || selectedRequest) && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSelectedOrder(null); setSelectedRequest(null); } }}>
          <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <div className="modal-heading"><div><p className="eyebrow">{selectedRequest ? "تفاصيل طلب القماش" : "تفاصيل الطلب"}</p><h2 id="detail-title"><bdi>{selectedRequest?.id ?? selectedOrder?.id}</bdi></h2></div><button className="icon-button" type="button" aria-label="إغلاق التفاصيل" onClick={() => { setSelectedOrder(null); setSelectedRequest(null); }}><FiX /></button></div>
            <div className="modal-client">{selectedRequest ? <Avatar initials={selectedRequest.initials} tone={selectedRequest.tone} /> : selectedOrder && <Avatar initials={selectedOrder.initials || "م"} tone={selectedOrder.tone} />}<div><strong>{selectedRequest?.customer ?? selectedOrder?.customer ?? "استفسار عميل جديد"}</strong><small dir="ltr">{selectedRequest?.email ?? selectedOrder?.email ?? "أضيفوا بيانات التواصل عند الحفظ"}</small></div><StatusBadge status={selectedRequest?.status ?? selectedOrder?.status ?? "Pending"} /></div>
            {selectedRequest ? (
              <div className="detail-fields">
                <div className="detail-measurements"><h3>مقاسات العميل</h3><div><span>المشروع</span><strong>{selectedRequest.item}</strong></div><div><span>الأبعاد</span><strong>{selectedRequest.dimensions}</strong></div><div><span>القماش المختار</span><strong>{selectedRequest.fabric}</strong></div><div><span>تاريخ الإرسال</span><strong>{formatDate(selectedRequest.date)}</strong></div></div>
                <label>السعر التقديري (درهم)<input type="number" min="0" step="50" value={selectedRequest.amount} onChange={(event) => updateRequest({ amount: Number(event.target.value) })} /></label>
                <label>حالة الطلب<select value={selectedRequest.status} onChange={(event) => updateRequest({ status: event.target.value as Status })}><option value="Pending">قيد الانتظار</option><option value="Completed">مكتمل</option><option value="Cancelled">ملغي</option></select></label>
              </div>
            ) : selectedOrder ? (
              <div className="detail-fields">
                {selectedOrder.id === "New inquiry" ? <><label>اسم العميل<input autoFocus placeholder="مثال: أمينة الفاسي" onChange={(event) => setSelectedOrder({ ...selectedOrder, customer: event.target.value, initials: event.target.value.split(" ").map((part) => part[0]).join("").slice(0, 2) })} /></label><label>المنتج أو الاستفسار<input placeholder="مثال: صالون مغربي · ٥ قطع" onChange={(event) => setSelectedOrder({ ...selectedOrder, item: event.target.value })} /></label><label>السعر التقديري (درهم)<input type="number" min="0" value={selectedOrder.amount} onChange={(event) => setSelectedOrder({ ...selectedOrder, amount: Number(event.target.value) })} /></label></> : <><div className="detail-measurements"><h3>ملخص الطلب</h3><div><span>المنتج</span><strong>{selectedOrder.item}</strong></div><div><span>تاريخ الطلب</span><strong>{formatDate(selectedOrder.date)}</strong></div><div><span>البريد الإلكتروني للعميل</span><strong dir="ltr">{selectedOrder.email}</strong></div><div><span>الإجمالي</span><strong>{formatMoney(selectedOrder.amount)}</strong></div></div><label>حالة الطلب<select value={selectedOrder.status} onChange={(event) => updateOrder(selectedOrder.id, { status: event.target.value as Status })}><option value="Pending">قيد الانتظار</option><option value="Completed">مكتمل</option><option value="Cancelled">ملغي</option></select></label></>}
              </div>
            ) : null}
            <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => { setSelectedOrder(null); setSelectedRequest(null); }}>إغلاق</button>{selectedOrder?.id === "New inquiry" && <button type="button" className="button button-dark" onClick={() => { const next: Order = { ...selectedOrder, id: getNextOrderId(orders), customer: selectedOrder.customer || "عميل جديد", initials: selectedOrder.initials || "عم", item: selectedOrder.item || "استفسار جديد", email: "بيانات التواصل غير متوفرة", tone: "sand" }; setOrders((current) => [next, ...current]); setSelectedOrder(null); }}>حفظ الطلب</button>}{selectedRequest && <button type="button" className="button button-dark" onClick={() => { setRequests((current) => current.map((request) => request.id === selectedRequest.id ? selectedRequest : request)); setSelectedRequest(null); }}>حفظ العرض <FiCheck /></button>}</div>
          </section>
        </div>
      )}
    </div>
  );
}
