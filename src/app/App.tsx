import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ComposedChart, Line, ReferenceLine,
} from "recharts";
import {
  ArrowLeft, ChevronDown, ChevronRight, Download, Send, Clock,
  Users, CalendarDays, Pencil, LayoutDashboard, ClipboardList,
  Activity, Lightbulb, FolderKanban, BarChart2, UserCircle2,
  Settings, Wallet, MonitorSmartphone, Plus, TrendingUp,
  TrendingDown, Info, MoreHorizontal, Columns, X,
  Banknote, Gift, Umbrella, Minus, AlertTriangle,
} from "lucide-react";

const fmt0 = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(Math.abs(n));
const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const v1MonthlyHistory = [
  { month: "Jan", total: 52400, members: 42 },
  { month: "Feb", total: 54100, members: 43 },
  { month: "Mar", total: 49800, members: 44 },
  { month: "Apr", total: 56200, members: 45 },
  { month: "May", total: 53700, members: 47 },
];
const v1AvgMonthly   = Math.round(v1MonthlyHistory.reduce((s, m) => s + m.total, 0) / v1MonthlyHistory.length);
const v1AvgMembers   = Math.round(v1MonthlyHistory.reduce((s, m) => s + m.members, 0) / v1MonthlyHistory.length);
const v1CurrMembers  = 52;
const v1DeltaPct     = ((v1CurrMembers - v1AvgMembers) / v1AvgMembers) * 100;
const v1AdjProj      = Math.round(v1AvgMonthly * (v1CurrMembers / v1AvgMembers));

const v1PayTypes = [
  { key: "weekly",   label: "Weekly",    count: 18, color: "#0168dd" },
  { key: "biweekly", label: "Bi-weekly", count: 21, color: "#3d8ae8" },
  { key: "monthly",  label: "Monthly",   count: 13, color: "#85baf5" },
];

const v1EarningWeekData = [
  { week: "Week 1", dateLabel: "Jun 2–8",   hourly: 6200, fixed: 0,    pto: 800,  bonus: 0,    additions: 400 },
  { week: "Week 2", dateLabel: "Jun 9–15",  hourly: 6200, fixed: 7400, pto: 1200, bonus: 1400, additions: 800 },
  { week: "Week 3", dateLabel: "Jun 16–22", hourly: 6200, fixed: 0,    pto: 800,  bonus: 0,    additions: 400 },
  { week: "Week 4", dateLabel: "Jun 23–30", hourly: 6200, fixed: 7400, pto: 1200, bonus: 2800, additions: 800 },
];
const v1EarningColors: Record<string, string> = {
  hourly: "#0168dd", fixed: "#3d8ae8", pto: "#85baf5", bonus: "#f59e0b", additions: "#10b981",
};
const v1EarningLabels: Record<string, string> = {
  hourly: "Hourly pay", fixed: "Fixed pay", pto: "PTO & Holidays", bonus: "Bonuses", additions: "Additions",
};

const v1Providers = [
  { name: "Wise",     color: "#0168dd", members: 22, monthly: 24200, weeks: [4100, 7800, 4100, 8200] },
  { name: "Payoneer", color: "#0ea5a0", members: 15, monthly: 16100, weeks: [2700, 4900, 2700, 5800] },
  { name: "Deel",     color: "#f59e0b", members: 8,  monthly: 8600,  weeks: [1400, 2600, 1400, 3200] },
  { name: "Export",   color: "#8a8fa8", members: 5,  monthly: 3800,  weeks: [900,  1200, 900,  800]  },
];
const v1ProviderTotal    = v1Providers.reduce((s, p) => s + p.monthly, 0);
const v1ProviderWeekData = ["Week 1","Week 2","Week 3","Week 4"].map((w, i) => ({
  week: w, dateLabel: v1EarningWeekData[i].dateLabel,
  factual: [8400, 14200, 0, 0][i],
  ...Object.fromEntries(v1Providers.map(p => [p.name, i < 2 ? 0 : p.weeks[i]])),
}));

const v1EarningPie = [
  { name: "Hourly pay",     value: 24800, color: "#0168dd" },
  { name: "Fixed pay",      value: 14800, color: "#3d8ae8" },
  { name: "Bonuses",        value: 5800,  color: "#f59e0b" },
  { name: "PTO & Holidays", value: 4200,  color: "#85baf5" },
  { name: "Additions",      value: 2900,  color: "#10b981" },
  { name: "Deductions",     value: 1400,  color: "#ef4444" },
];
const v1EarningPieTotal = v1EarningPie.reduce((s, e) => s + e.value, 0);
const v1EarningPieData  = v1EarningPie.map(e => ({ ...e, pct: Math.round((e.value / v1EarningPieTotal) * 100) }));
const v1ProviderPieData = v1Providers.map(p => ({
  name: p.name, value: p.monthly, color: p.color,
  pct: Math.round((p.monthly / v1ProviderTotal) * 100), members: p.members,
}));

const v1TableMembers = [
  {
    name: "Adrian Goia", avatar: "AG", cycle: "Monthly", provider: "Wise", total: 15818,
    rows: [
      { type: "One-time payment",  date: "Thu, May 8, 2026",  hours: "—",    hourly: 0,     fixed: 0,    pto: 0,   additions: 0,  deductions: 0,  bonus: 400,  total: 400   },
      { type: "Automatic payment", date: "Sun, May 11, 2026", hours: "—",    hourly: 0,     fixed: 5000, pto: 388, additions: 50, deductions: 70, bonus: 0,    total: 5368  },
      { type: "Timesheets",        date: "Tue, May 6, 2026",  hours: "124h", hourly: 10000, fixed: 0,    pto: 0,   additions: 90, deductions: 0,  bonus: 0,    total: 10050 },
    ],
  },
  {
    name: "Marta Kowalski", avatar: "MK", cycle: "Bi-weekly", provider: "Payoneer", total: 8240,
    rows: [
      { type: "Automatic payment", date: "Sun, May 11, 2026", hours: "—",   hourly: 0,    fixed: 7200, pto: 0, additions: 0, deductions: 180, bonus: 0, total: 7020 },
      { type: "Timesheets",        date: "Tue, May 6, 2026",  hours: "38h", hourly: 1220, fixed: 0,    pto: 0, additions: 0, deductions: 0,   bonus: 0, total: 1220 },
    ],
  },
  {
    name: "James Okafor", avatar: "JO", cycle: "Weekly", provider: "Wise", total: 5100,
    rows: [
      { type: "Automatic payment", date: "Sun, May 11, 2026", hours: "—", hourly: 0, fixed: 4500, pto: 600, additions: 0, deductions: 0, bonus: 0, total: 5100 },
    ],
  },
];

const v1OwedDaily = [
  { date: "May 24", amount: 0 }, { date: "May 27", amount: 0 }, { date: "May 30", amount: 0 },
  { date: "Jun 2",  amount: 0 }, { date: "Jun 5",  amount: 0 }, { date: "Jun 9",  amount: 0 },
  { date: "Jun 13", amount: 0 }, { date: "Jun 16", amount: 148 }, { date: "Jun 19", amount: 12 },
  { date: "Jun 21", amount: 0 },
];
const v1OwedRows = [
  { date: "Tue, Jun 16, 2026", members: [
    { name: "Adrian Goia",                avatar: "AG", color: "#0168dd", rate: "No rate set", regular: "8:00:00", overtime: "—", total: "8:00:00", amount: 0 },
    { name: "alex.schutte@hubstaff.com S", avatar: "AS", color: "#10b981", rate: "No rate set", regular: "8:00:00", overtime: "—", total: "8:00:00", amount: 0 },
    { name: "Alex Yarotsky",               avatar: "AY", color: "#f59e0b", rate: "No rate set", regular: "8:00:00", overtime: "—", total: "8:00:00", amount: 0 },
  ]},
  { date: "Wed, Jun 17, 2026", members: [
    { name: "Adrian Goia",   avatar: "AG", color: "#0168dd", rate: "$18.00/hr", regular: "8:00:00", overtime: "—", total: "8:00:00", amount: 144 },
    { name: "Alex Yarotsky", avatar: "AY", color: "#f59e0b", rate: "No rate set", regular: "4:00:00", overtime: "—", total: "4:00:00", amount: 0 },
  ]},
];

const v1AvatarColors: Record<string, string> = { AG: "#0168dd", MK: "#e5764e", JO: "#4e9ee5", AS: "#10b981", AY: "#f59e0b" };
const v1CycleBadge: Record<string, [string,string]> = {
  Weekly:      ["#d1fae5","#059669"],
  "Bi-weekly": ["#dbeafe","#2563eb"],
  Monthly:     ["#ede9fe","#7c3aed"],
};

const v2Cycles = [
  {
    id: "FP-WISE-001",  provider: "Wise",     cycle: "Weekly",    cycleColor: "#0168dd",
    dateRange: "Jun 23–29, 2026", daysLeft: 2, pctTracked: 60, members: 15,
    confirmed: 5200, planned: 600,  projected: 4800, total: 10600,
    confirmedBreak: { hourlyTracked: 4800, overtime: 400, pastPTO: 0 },
    plannedBreak:   { fixedPay: 0, futurePTO: 200, additions: 400, deductions: 0 },
    projectedBreak: { hourly: 4800 },
  },
  {
    id: "FP-PAY-001",   provider: "Payoneer", cycle: "Monthly",   cycleColor: "#85baf5",
    dateRange: "Jun 1–30, 2026",  daysLeft: 4, pctTracked: 87, members: 9,
    confirmed: 2800, planned: 9800, projected: 900,  total: 13500,
    confirmedBreak: { hourlyTracked: 2200, overtime: 0, pastPTO: 600 },
    plannedBreak:   { fixedPay: 8800, futurePTO: 600, additions: 400, deductions: 0 },
    projectedBreak: { hourly: 900 },
  },
  {
    id: "FP-DEEL-001",  provider: "Deel",     cycle: "Bi-weekly", cycleColor: "#3d8ae8",
    dateRange: "Jun 16–29, 2026", daysLeft: 2, pctTracked: 75, members: 6,
    confirmed: 2600, planned: 1200, projected: 1200, total: 5000,
    confirmedBreak: { hourlyTracked: 2400, overtime: 200, pastPTO: 0 },
    plannedBreak:   { fixedPay: 800, futurePTO: 0, additions: 400, deductions: 0 },
    projectedBreak: { hourly: 1200 },
  },
  {
    id: "FP-EXP-001",   provider: "Export",   cycle: "Monthly",   cycleColor: "#8a8fa8",
    dateRange: "Jun 1–30, 2026",  daysLeft: 4, pctTracked: 82, members: 3,
    confirmed: 400,  planned: 1800, projected: 300,  total: 2500,
    confirmedBreak: { hourlyTracked: 400, overtime: 0, pastPTO: 0 },
    plannedBreak:   { fixedPay: 1400, futurePTO: 0, additions: 400, deductions: 0 },
    projectedBreak: { hourly: 300 },
  },
];
const v2TotalConfirmed = v2Cycles.reduce((s, c) => s + c.confirmed, 0);
const v2TotalProjected = v2Cycles.reduce((s, c) => s + c.projected, 0);
const v2TotalAll       = v2TotalConfirmed + v2TotalProjected;
const v2DraftPayments  = [
  { id: "ID00312", name: "Team Payment",   range: "Jun 9–15, 2026",  members: 3,  amount: 4120.00,  status: "Draft", provider: "Wise"     },
  { id: "ID00311", name: "Team Payment",   range: "Jun 2–8, 2026",   members: 5,  amount: 8940.50,  status: "Draft", provider: "Payoneer" },
  { id: "ID00308", name: "Global Payroll", range: "May 26–Jun 1",    members: 12, amount: 14380.00, status: "Draft", provider: "Deel"     },
];
const v2HistoryPayments = [
  { id: "ID00309", name: "Team Payment",   range: "May 26–Jun 1, 2026",  members: 47, amount: 34198.00, status: "Paid",     paidOn: "Jun 2, 2026",  provider: "Wise"     },
  { id: "ID00307", name: "Team Payment",   range: "May 19–25, 2026",     members: 46, amount: 32400.00, status: "Exported", paidOn: "—",            provider: "Wise"     },
  { id: "ID00304", name: "Global Payroll", range: "May 12–18, 2026",     members: 44, amount: 28900.00, status: "Paid",     paidOn: "May 19, 2026", provider: "Deel"     },
  { id: "ID00301", name: "Team Payment",   range: "May 5–11, 2026",      members: 45, amount: 31200.00, status: "Paid",     paidOn: "May 12, 2026", provider: "Payoneer" },
];
const v2ProviderColors: Record<string, string> = { Wise: "#0168dd", Payoneer: "#0ea5a0", Deel: "#f59e0b", Export: "#8a8fa8" };

const v2WeeklyMembers = [
  {
    name: "Alex Yarotsky", email: "alex.y@hubstaff.com",
    avatar: "AY", color: "#f59e0b", total: 720,
    items: [
      { label: "Tracked hours",      sub: "Timesheets", hours: "24:00",  rate: "$18.00/hr", status: "Confirmed" as const, amount: 432 },
      { label: "Estimated remaining",sub: "Timesheets", hours: "~16:00", rate: "$18.00/hr", status: "Projected" as const, amount: 288 },
    ],
  },
  {
    name: "Full Tseg", email: "ao.piwwhu.tan.gg@gmail.com",
    avatar: "FT", color: "#0168dd", total: 720,
    items: [
      { label: "Tracked hours",      sub: "Timesheets", hours: "22:00",  rate: "$18.00/hr", status: "Confirmed" as const, amount: 396 },
      { label: "Estimated remaining",sub: "Timesheets", hours: "~18:00", rate: "$18.00/hr", status: "Projected" as const, amount: 324 },
    ],
  },
  {
    name: "Aurora Arjomilla", email: "aurora.arjomilla@hubstaff.com",
    avatar: "AA", color: "#10b981", total: 1080,
    items: [
      { label: "Tracked hours",      sub: "Timesheets", hours: "28:00",  rate: "$22.00/hr", status: "Confirmed" as const, amount: 616 },
      { label: "Scheduled addition", sub: "Adjustment", hours: "—",      rate: "—",         status: "Planned"   as const, amount: 200 },
      { label: "Estimated remaining",sub: "Timesheets", hours: "~12:00", rate: "$22.00/hr", status: "Projected" as const, amount: 264 },
    ],
  },
  {
    name: "Marcus Chen", email: "m.chen@hubstaff.com",
    avatar: "MC", color: "#0ea5a0", total: 1000,
    items: [
      { label: "Tracked hours",      sub: "Timesheets", hours: "20:00",  rate: "$25.00/hr", status: "Confirmed" as const, amount: 500 },
      { label: "Estimated remaining",sub: "Timesheets", hours: "~20:00", rate: "$25.00/hr", status: "Projected" as const, amount: 500 },
    ],
  },
  {
    name: "Priya Nair", email: "p.nair@hubstaff.com",
    avatar: "PN", color: "#e5764e", total: 840,
    items: [
      { label: "Tracked hours",      sub: "Timesheets", hours: "30:00",  rate: "$20.00/hr", status: "Confirmed" as const, amount: 600 },
      { label: "Jun 26 — Holiday",   sub: "Holiday",    hours: "8:00",   rate: "$20.00/hr", status: "Planned"   as const, amount: 160 },
      { label: "Estimated remaining",sub: "Timesheets", hours: "~4:00",  rate: "$20.00/hr", status: "Projected" as const, amount: 80  },
    ],
  },
  {
    name: "Jordan Blake", email: "j.blake@hubstaff.com",
    avatar: "JB", color: "#8b5cf6", total: 645,
    items: [
      { label: "Tracked hours",      sub: "Timesheets", hours: "24:00",  rate: "$15.00/hr", status: "Confirmed" as const, amount: 360 },
      { label: "Overtime",           sub: "Timesheets", hours: "3:00",   rate: "$22.50/hr", status: "Confirmed" as const, amount: 68  },
      { label: "Estimated remaining",sub: "Timesheets", hours: "~16:00", rate: "$15.00/hr", status: "Projected" as const, amount: 217 },
    ],
  },
];

// ─── Shared helpers ────────────────────────────────────────────────────────────

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const header = d?.dateLabel ? `${d.week} · ${d.dateLabel}` : label;
  const visible = payload.filter((p: any) => p.value > 0);
  const total = visible.reduce((s: number, p: any) => s + p.value, 0);
  return (
    <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-[#1a1e35] mb-1.5">{header}</p>
      {visible.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 py-0.5">
          <span style={{ color: p.fill ?? p.color }}>{p.name}</span>
          <span className="font-medium text-[#1a1e35]">{fmt0(p.value)}</span>
        </div>
      ))}
      {visible.length > 1 && (
        <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e8eaf0]">
          <span className="text-[#8a8fa8]">Total</span>
          <span className="font-semibold text-[#1a1e35]">{fmt0(total)}</span>
        </div>
      )}
    </div>
  );
}

const RADIAN = Math.PI / 180;
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, pct }: any) {
  if (pct < 8) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={10} fontWeight={600}>{pct}%</text>;
}

function WeekTick({ x, y, index, data }: { x?: number; y?: number; index?: number; data: { week: string; dateLabel: string }[] }) {
  const d = data[index ?? 0];
  if (!d) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} dy={14} textAnchor="middle" fill="#1a1e35" fontSize={11} fontWeight={600}>{d.week}</text>
      <text x={0} dy={26} textAnchor="middle" fill="#8a8fa8" fontSize={10}>{d.dateLabel}</text>
    </g>
  );
}

function ChevronLeft({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <ChevronRight size={size} className={`rotate-180 ${className}`} />;
}

function Sidebar({ active }: { active: "v1" | "v1c" | "v1d" | "v1e" | "v2" }) {
  const topNav = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: ClipboardList,   label: "Timesheets" },
    { icon: Activity,        label: "Activity" },
    { icon: Lightbulb,       label: "Insights" },
    { icon: FolderKanban,    label: "Project management" },
    { icon: CalendarDays,    label: "Calendar" },
    { icon: BarChart2,       label: "Reports",  isActive: active === "v1" || active === "v1c" || active === "v1d" || active === "v1e" },
    { icon: UserCircle2,     label: "People" },
  ];
  return (
    <div className="w-[220px] flex-shrink-0 bg-[#1a1e35] flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
        <div className="w-6 h-6 rounded bg-[#0168dd] flex items-center justify-center"><div className="w-3 h-3 rounded-sm bg-white" /></div>
        <span className="text-white font-semibold text-sm tracking-wide">Hubstaff</span>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {topNav.map(({ icon: Icon, label, isActive }) => (
          <button key={label} className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive ? "bg-white/10 text-white font-medium" : "text-white/55 hover:text-white/80 hover:bg-white/5"}`}>
            <Icon size={16} />{label}
          </button>
        ))}
        <div className="mt-1">
          <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-white font-medium">
            <div className="flex items-center gap-3"><Wallet size={16} />Financials</div>
            <ChevronDown size={13} />
          </button>
          {[{ label: "Overview", badge: "New" }, { label: "Manage payroll" }, { label: "Team Payments", isActive: active === "v2" }, { label: "Payment records" }, { label: "Payroll adjustments" }, { label: "Invoices" }].map(item => (
            <button key={item.label} className={`w-full flex items-center justify-between pl-10 pr-4 py-1.5 text-xs transition-colors ${(item as any).isActive ? "text-white font-semibold" : "text-white/50 hover:text-white/75"}`}>
              <span>{item.label}</span>
              {item.badge && <span className="text-[9px] font-bold bg-[#0168dd] text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-2 mt-1 text-sm text-white/55 hover:text-white/80 hover:bg-white/5"><MonitorSmartphone size={16} />Silent app</button>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/55 hover:text-white/80 hover:bg-white/5"><Settings size={16} />Settings</button>
      </nav>
    </div>
  );
}

// ─── V1 ────────────────────────────────────────────────────────────────────────

function V1DateBar({ tab, onTab }: { tab: "ME"|"ALL"; onTab: (t:"ME"|"ALL")=>void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex">
        {(["ME","ALL"] as const).map(t => (
          <button key={t} onClick={() => onTab(t)} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${tab === t ? "bg-[#0168dd] text-white" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{t}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button className="p-1 text-[#8a8fa8] hover:text-[#1a1e35]"><ChevronLeft size={14} /></button>
        <button className="p-1 text-[#8a8fa8] hover:text-[#1a1e35]"><ChevronRight size={14} /></button>
        <div className="flex items-center gap-1.5 border border-[#e8eaf0] rounded px-3 py-1.5 text-xs text-[#1a1e35] bg-white">
          <CalendarDays size={12} className="text-[#8a8fa8]" />Sun, May 24, 2026 – Wed, Jun 24, 2026
        </div>
        <button className="text-xs border border-[#e8eaf0] rounded px-3 py-1.5 text-[#1a1e35] bg-white hover:bg-[#f5f6fa]">Today</button>
        <button className="text-xs bg-[#0168dd] text-white rounded px-3 py-1.5 flex items-center gap-1.5 hover:bg-[#0057bb]">Filters <ChevronDown size={12} /></button>
      </div>
    </div>
  );
}

function V1PredictivePanel() {
  const [mode, setMode] = useState<"earning"|"provider">("earning");
  const up = v1DeltaPct > 0;

  const activePieData = mode === "earning" ? v1EarningPieData : v1ProviderPieData;
  const legend = mode === "earning"
    ? (["hourly","fixed","pto","bonus","additions"] as const).map(k => ({ key: k, label: v1EarningLabels[k], color: v1EarningColors[k] }))
    : v1Providers.map(p => ({ key: p.name, label: p.name, color: p.color }));

  return (
    <div>
      <div className="grid grid-cols-4 divide-x divide-[#e8eaf0] border-b border-[#e8eaf0]">
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Monthly avg payout</p>
          <p className="text-3xl font-bold text-[#1a1e35] tracking-tight">{fmt0(v1AvgMonthly)}</p>
          <p className="text-[11px] text-[#8a8fa8] mt-0.5">last 5 months</p>
          <ResponsiveContainer width="100%" height={32} className="mt-2">
            <AreaChart data={v1MonthlyHistory} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" hide /><YAxis hide domain={["auto","auto"]} />
              <Area type="monotone" dataKey="total" stroke="#0168dd" strokeWidth={1.5} fill="#0168dd" fillOpacity={0.1} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Member change</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${up ? "text-emerald-600" : "text-red-500"}`}>{up ? "+" : ""}{v1DeltaPct.toFixed(0)}%</span>
            {up ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-400" />}
          </div>
          <p className="text-[11px] text-[#8a8fa8] mt-0.5">{v1CurrMembers} this cycle vs avg {v1AvgMembers}</p>
          <div className="flex gap-2 mt-2">
            {v1PayTypes.map(pt => (
              <div key={pt.key} className="flex items-center gap-1 text-[10px] text-[#8a8fa8]">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: pt.color }} />{pt.count}
              </div>
            ))}
            <span className="text-[10px] text-[#8a8fa8]">= {v1CurrMembers}</span>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Recommended projection</p>
          <p className="text-3xl font-bold text-[#0168dd] tracking-tight">{fmt0(v1AdjProj)}</p>
          <p className="text-[11px] text-[#8a8fa8] mt-0.5">avg × ({v1CurrMembers}/{v1AvgMembers} members)</p>
          <div className="mt-3 h-1.5 bg-[#e8f2fd] rounded-full overflow-hidden">
            <div className="h-full bg-[#0168dd] rounded-full" style={{ width: `${Math.min(100, (v1AdjProj / 70000) * 100)}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-[#8a8fa8] mt-0.5"><span>{fmt0(v1AvgMonthly)} avg</span><span>{fmt0(70000)} cap</span></div>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-2">By pay cycle</p>
          <div className="space-y-2">
            {v1PayTypes.map(pt => (
              <div key={pt.key} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pt.color }} />
                <div className="flex-1 h-1.5 bg-[#f0f1f5] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(pt.count / v1CurrMembers) * 100}%`, background: pt.color }} />
                </div>
                <span className="text-xs font-semibold text-[#1a1e35] w-6 text-right">{pt.count}</span>
                <span className="text-[10px] text-[#8a8fa8] w-14">{pt.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#e8eaf0] text-xs text-[#8a8fa8]">
            <Users size={11} /><span>Total: <span className="font-semibold text-[#1a1e35]">{v1CurrMembers} members</span></span>
          </div>
        </div>
      </div>
      <div className="flex divide-x divide-[#e8eaf0]">
        <div className="flex-1 px-5 py-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-0.5">Week-by-week distribution</p>
              <p className="text-[11px] text-[#8a8fa8]">{mode === "earning" ? "Stacked by earning type" : "Stacked by payment provider"}</p>
            </div>
            <div className="flex items-center bg-[#f0f1f5] rounded-md p-0.5">
              <button onClick={() => setMode("earning")} className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${mode === "earning" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8]"}`}>By earning type</button>
              <button onClick={() => setMode("provider")} className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${mode === "provider" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8]"}`}>By provider</button>
            </div>
          </div>
          {mode === "earning" && (
            <ResponsiveContainer key="v1-earning" width="100%" height={160}>
              <BarChart data={v1EarningWeekData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
                <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1EarningWeekData} />} axisLine={false} tickLine={false} interval={0} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#8a8fa8" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#f5f6fa" }} />
                <Bar dataKey="hourly"    name="Hourly pay"     stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
                <Bar dataKey="fixed"     name="Fixed pay"      stackId="s" fill="#3d8ae8" radius={[0,0,0,0]} />
                <Bar dataKey="pto"       name="PTO & Holidays" stackId="s" fill="#85baf5" radius={[0,0,0,0]} />
                <Bar dataKey="bonus"     name="Bonuses"        stackId="s" fill="#f59e0b" radius={[0,0,0,0]} />
                <Bar dataKey="additions" name="Additions"      stackId="s" fill="#10b981" radius={[0,0,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {mode === "provider" && (
            <ResponsiveContainer key="v1-provider" width="100%" height={160}>
              <BarChart data={v1ProviderWeekData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
                <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1ProviderWeekData} />} axisLine={false} tickLine={false} interval={0} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#8a8fa8" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#f5f6fa" }} />
                <Bar dataKey="Wise"     name="Wise"     stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
                <Bar dataKey="Payoneer" name="Payoneer" stackId="s" fill="#0ea5a0" radius={[0,0,0,0]} />
                <Bar dataKey="Deel"     name="Deel"     stackId="s" fill="#f59e0b" radius={[0,0,0,0]} />
                <Bar dataKey="Export"   name="Export"   stackId="s" fill="#8a8fa8" radius={[0,0,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
            {legend.map(l => (
              <div key={l.key} className="flex items-center gap-1.5 text-[11px] text-[#8a8fa8]">
                <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />{l.label}
              </div>
            ))}
          </div>
        </div>
        <div className="w-44 flex-shrink-0 px-4 py-4 flex flex-col">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">{mode === "earning" ? "Monthly mix" : "By provider"}</p>
          <ResponsiveContainer key={`v1-pie-${mode}`} width="100%" height={110}>
            <PieChart>
              <Pie data={activePieData} cx="50%" cy="50%" innerRadius={26} outerRadius={52} dataKey="value" labelLine={false} label={<PieLabel />}>
                {activePieData.map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number, name: string) => [fmt0(v), name]} contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e8eaf0" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1 flex-1">
            {activePieData.map(e => (
              <div key={e.name} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ background: e.color }} />
                  <span className="text-[#8a8fa8] truncate">{e.name}</span>
                </div>
                <span className="font-semibold text-[#1a1e35] ml-1 flex-shrink-0">{e.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function V1PaymentHistory() {
  const [tab, setTab] = useState<"ME"|"ALL">("ALL");
  const [expanded, setExpanded] = useState<string[]>(["Adrian Goia"]);
  const toggle = (n: string) => setExpanded(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n]);
  const cols = ["Payment type","Paid on","Total Hours","Hourly pay","Fixed pay","PTO & Holidays","Additions","Deductions","Bonus","Total Amount"];
  return (
    <div className="space-y-3">
      <V1DateBar tab={tab} onTab={setTab} />
      <div className="flex items-stretch bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex-1 px-6 py-4 border-r border-[#e8eaf0]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">Payments</p>
          <p className="text-2xl font-bold text-[#1a1e35] mt-0.5">47</p>
        </div>
        <div className="flex-1 px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">Amount</p>
          <p className="text-2xl font-bold text-[#0ea5a0] mt-0.5">$34,198.00</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#e8eaf0]">
          <button className="flex items-center gap-1 text-xs text-[#1a1e35] font-medium hover:text-[#0168dd]"><span>≡ Group by: Member</span><ChevronDown size={13} /></button>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-xs text-[#0168dd]"><Send size={12} /> Send</button>
            <button className="flex items-center gap-1.5 text-xs text-[#0168dd]"><Clock size={12} /> Schedule</button>
            <button className="flex items-center gap-1.5 text-xs text-[#0168dd]"><Download size={12} /> Export</button>
            <button className="text-[#8a8fa8]"><Settings size={14} /></button>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#e8eaf0] bg-[#f5f6fa]">
              {cols.map(c => <th key={c} className={`py-2 px-3 text-left font-semibold text-[#8a8fa8] whitespace-nowrap ${c === "Total Amount" ? "text-right" : ""}`}>{c}</th>)}
            </tr>
          </thead>
          {v1TableMembers.map(member => {
            const isOpen = expanded.includes(member.name);
            const [bgC, textC] = v1CycleBadge[member.cycle];
            return (
              <tbody key={member.name}>
                <tr className="border-b border-[#e8eaf0] cursor-pointer hover:bg-[#f9f9fc]" onClick={() => toggle(member.name)}>
                  <td colSpan={9} className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <ChevronRight size={14} className={`text-[#8a8fa8] transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: v1AvatarColors[member.avatar] }}>{member.avatar}</div>
                      <span className="font-semibold text-[#1a1e35]">{member.name}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: bgC, color: textC }}>{member.cycle}</span>
                      <span className="text-[10px] text-[#8a8fa8]">via {member.provider}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#1a1e35]">{fmt2(member.total)}</td>
                </tr>
                {isOpen && member.rows.map((row, i) => (
                  <tr key={i} className="border-b border-[#e8eaf0] hover:bg-[#f9f9fc]">
                    <td className="py-2 px-3 pl-10 text-[#1a1e35]">{row.type}</td>
                    <td className="py-2 px-3 text-[#8a8fa8]">{row.date}</td>
                    <td className="py-2 px-3 text-[#8a8fa8]">{row.hours}</td>
                    <td className="py-2 px-3 text-[#1a1e35]">{row.hourly ? fmt2(row.hourly) : "$0.00"}</td>
                    <td className="py-2 px-3 text-[#1a1e35]">{row.fixed ? fmt2(row.fixed) : "$0.00"}</td>
                    <td className="py-2 px-3 text-[#1a1e35]">{row.pto ? fmt2(row.pto) : "$0.00"}</td>
                    <td className="py-2 px-3 text-[#1a1e35]">{row.additions ? fmt2(row.additions) : "$0.00"}</td>
                    <td className="py-2 px-3 text-[#1a1e35]">{row.deductions ? fmt2(row.deductions) : "$0.00"}</td>
                    <td className="py-2 px-3 text-[#1a1e35]">{row.bonus ? fmt2(row.bonus) : "$0.00"}</td>
                    <td className="py-2 px-3 text-right font-medium text-[#1a1e35]">{fmt2(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
}

function V1FutureTracked() {
  const [tab, setTab] = useState<"ME"|"ALL">("ALL");
  return (
    <div className="space-y-3">
      <V1DateBar tab={tab} onTab={setTab} />
      <div className="flex items-stretch bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="px-6 py-4 border-r border-[#e8eaf0] flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">Hours</p>
          <p className="text-2xl font-bold text-[#0ea5a0] mt-0.5">248:00:00</p>
        </div>
        <div className="px-6 py-4 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">Amount</p>
          <p className="text-2xl font-bold text-[#0ea5a0] mt-0.5">$1,600.00</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#e8eaf0] px-4 py-4">
        <p className="text-xs font-medium text-[#1a1e35] mb-3">Total amount per day</p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={v1OwedDaily} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs><linearGradient id="v1owedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0168dd" stopOpacity={0.2}/><stop offset="95%" stopColor="#0168dd" stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8a8fa8" }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: "#8a8fa8" }} axisLine={false} tickLine={false} width={28} />
            <Tooltip formatter={(v: number) => [fmt2(v), "Amount"]} contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e8eaf0" }} />
            <Area type="monotone" dataKey="amount" stroke="#0168dd" strokeWidth={1.5} fill="url(#v1owedGrad)" dot={{ fill: "#0168dd", r: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#e8eaf0]">
          <span className="text-xs font-semibold text-[#1a1e35]">Hubstaff <span className="font-normal text-[#8a8fa8]">Etc · UTC</span></span>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-xs text-[#0168dd]"><Send size={12} /> Send</button>
            <button className="flex items-center gap-1.5 text-xs text-[#0168dd]"><Download size={12} /> Export</button>
            <button className="flex items-center gap-1.5 text-xs text-[#0168dd]"><Columns size={12} /> Columns</button>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#e8eaf0] bg-[#f5f6fa]">
              <th className="py-2 px-4 text-left font-semibold text-[#8a8fa8]">Member</th>
              <th className="py-2 px-4 text-left font-semibold text-[#8a8fa8]">Current rate</th>
              <th className="py-2 px-4 text-left font-semibold text-[#8a8fa8]">Regular hours</th>
              <th className="py-2 px-4 text-left font-semibold text-[#8a8fa8]">Overtime</th>
              <th className="py-2 px-4 text-left font-semibold text-[#8a8fa8]">Total hours</th>
              <th className="py-2 px-4 text-right font-semibold text-[#8a8fa8]">Amount</th>
            </tr>
          </thead>
          {v1OwedRows.map(group => (
            <tbody key={group.date}>
              <tr className="bg-[#f9f9fc] border-b border-[#e8eaf0]">
                <td colSpan={6} className="py-1.5 px-4 text-[11px] font-semibold text-[#8a8fa8]">{group.date}</td>
              </tr>
              {group.members.map((m, i) => (
                <tr key={`${group.date}-${i}`} className="border-b border-[#e8eaf0] hover:bg-[#f9f9fc]">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold" style={{ background: m.color }}>{m.avatar}</div>
                      <span className="text-[#1a1e35] font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-[#8a8fa8]">{m.rate}</td>
                  <td className="py-2.5 px-4 text-[#1a1e35]">{m.regular}</td>
                  <td className="py-2.5 px-4 text-[#8a8fa8]">{m.overtime}</td>
                  <td className="py-2.5 px-4"><div className="flex items-center gap-1 text-[#1a1e35]"><Clock size={11} className="text-[#8a8fa8]" />{m.total}</div></td>
                  <td className="py-2.5 px-4 text-right font-medium text-[#1a1e35]">{fmt2(m.amount)}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}

function Version1() {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#e8eaf0] bg-[#f9f9fc]">
          <TrendingUp size={15} className="text-[#0168dd]" />
          <span className="text-sm font-semibold text-[#1a1e35]">Predictable Cash Flow</span>
          <span className="text-xs text-[#8a8fa8]">— based on historical payments</span>
        </div>
        <V1PredictivePanel />
      </div>
      <div>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e8eaf0]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1FutureTracked />}
      </div>
    </div>
  );
}

// ─── V1B ───────────────────────────────────────────────────────────────────────

const v1bWeeklyData = [
  { week: "Week 1", dateLabel: "Jun 2–8",   factual: 8400,  tracked: 0,   projected: 0,     total: 8400  },
  { week: "Week 2", dateLabel: "Jun 9–15",  factual: 14200, tracked: 0,   projected: 0,     total: 14200 },
  { week: "Week 3", dateLabel: "Jun 16–22", factual: 0,     tracked: 1600, projected: 8200, total: 9800  },
  { week: "Week 4", dateLabel: "Jun 23–30", factual: 0,     tracked: 0,   projected: 22480, total: 22480 },
];
const v1bConfirmed = v1bWeeklyData.reduce((s, w) => s + w.factual,  0);
const v1bPlanned   = v1bWeeklyData.reduce((s, w) => s + w.tracked,  0);
const v1bProjected = v1AdjProj - v1bConfirmed - v1bPlanned;
const v1bPctC = Math.round(v1bConfirmed / v1AdjProj * 100);
const v1bPctP = Math.round(v1bPlanned   / v1AdjProj * 100);
const v1bPctR = 100 - v1bPctC - v1bPctP;

function SegmentedWeekBar(props: any) {
  const { x, y, width, height, payload } = props;
  if (!payload || height <= 0) return null;
  const { factual = 0, tracked = 0, projected = 0 } = payload;
  const total = factual + tracked + projected;
  if (total === 0) return null;
  const bw = Math.max(0, width - 2);
  const lx = x + 1;
  let curY = y + height;
  const rects: React.ReactNode[] = [];
  const addSeg = (key: string, val: number, fill: string, roundTop: boolean) => {
    if (val <= 0) return;
    const h = Math.max(1, (val / total) * height);
    curY -= h;
    rects.push(<rect key={key} x={lx} y={curY} width={bw} height={h} fill={fill} rx={roundTop ? 4 : 0} />);
  };
  addSeg("factual",   factual,   "#10b981", !tracked && !projected);
  addSeg("tracked",   tracked,   "#0168dd", !projected);
  addSeg("projected", projected, "#85baf5", true);
  return <g>{rects}</g>;
}

function ExportDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 text-xs font-medium text-[#1a1e35] border border-[#e8eaf0] rounded-md px-3 py-1.5 bg-white hover:bg-[#f5f6fa] transition-colors select-none">
        <Download size={12} className="text-[#8a8fa8]" />
        Export
        <ChevronDown size={11} className={`text-[#8a8fa8] transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1.5 z-30 bg-white rounded-lg border border-[#e8eaf0] shadow-lg w-36 py-1 overflow-hidden">
            {([
              { label: "CSV", ext: "CSV" },
              { label: "PDF", ext: "PDF" },
            ] as const).map(({ label, ext }) => (
              <button key={ext} onClick={() => setOpen(false)} className="w-full text-left px-4 py-2 text-xs text-[#1a1e35] hover:bg-[#f5f6fa] transition-colors">
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BreakdownPopover() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"earning" | "provider">("earning");
  const earningItems = [
    { name: "Hourly pay",     Icon: Clock    },
    { name: "Fixed pay",      Icon: Banknote },
    { name: "Bonuses",        Icon: Gift     },
    { name: "PTO & Holidays", Icon: Umbrella },
    { name: "Additions",      Icon: Plus     },
    { name: "Deductions",     Icon: Minus    },
  ].map(e => {
    const pct = v1EarningPieData.find(d => d.name === e.name)?.pct ?? 0;
    return { ...e, pct, amount: Math.round((pct / 100) * v1AvgMonthly) };
  });
  const providerItems = [
    { name: "Wise",     symbol: "W", color: "#10b981" },
    { name: "Payoneer", symbol: "P", color: "#3b82f6" },
    { name: "Deel",     symbol: "D", color: "#7c3aed" },
    { name: "Export",   symbol: "E", color: "#8a8fa8" },
  ].map(p => {
    const pct = v1ProviderPieData.find(d => d.name === p.name)?.pct ?? 0;
    return { ...p, pct, amount: Math.round((pct / 100) * v1AvgMonthly) };
  });
  return (
    <div className="relative mt-1.5">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:text-[#0057bb] transition-colors select-none">
        View breakdown <ChevronDown size={11} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-6 right-0 z-30 bg-white rounded-lg border border-[#e8eaf0] shadow-xl w-56 overflow-hidden">
            <div className="flex border-b border-[#e8eaf0]">
              {(["earning", "provider"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-[10px] font-semibold transition-colors border-b-2 -mb-px ${tab === t ? "text-[#0168dd] border-[#0168dd]" : "text-[#8a8fa8] border-transparent hover:text-[#1a1e35]"}`}>
                  {t === "earning" ? "By type" : "By provider"}
                </button>
              ))}
            </div>
            <div className="p-3 space-y-0.5">
              {tab === "earning" ? earningItems.map(({ name, Icon, pct, amount }) => (
                <div key={name} className="flex items-center justify-between py-1 text-[11px]">
                  <div className="flex items-center gap-2 min-w-0"><Icon size={12} className="flex-shrink-0 text-[#0168dd]" /><span className="text-[#8a8fa8] truncate">{name}</span></div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0"><span className="text-[10px] text-[#8a8fa8]">{pct}%</span><span className="font-semibold text-[#1a1e35]">{fmt0(amount)}</span></div>
                </div>
              )) : providerItems.map(({ name, symbol, color, pct, amount }) => (
                <div key={name} className="flex items-center justify-between py-1 text-[11px]">
                  <div className="flex items-center gap-2 min-w-0"><span className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center flex-shrink-0 text-white leading-none" style={{ background: color }}>{symbol}</span><span className="text-[#8a8fa8]">{name}</span></div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0"><span className="text-[10px] text-[#8a8fa8]">{pct}%</span><span className="font-semibold text-[#1a1e35]">{fmt0(amount)}</span></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function V1bPredictivePanel() {
  const up = v1DeltaPct > 0;
  const [chartView, setChartView] = useState<"a" | "b">("a");
  return (
    <div>
      <div className="grid grid-cols-3 divide-x divide-[#e8eaf0] border-b border-[#e8eaf0]">
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Monthly avg payout</p>
          <p className="text-3xl font-bold text-[#1a1e35] tracking-tight">{fmt0(v1AvgMonthly)}</p>
          <p className="text-[11px] text-[#8a8fa8] mt-0.5">last 5 months</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Member change</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${up ? "text-emerald-600" : "text-red-500"}`}>{up ? "+" : ""}{v1DeltaPct.toFixed(0)}%</span>
            {up ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-400" />}
          </div>
          <p className="text-[11px] text-[#8a8fa8] mt-0.5">{v1CurrMembers} this cycle vs avg {v1AvgMembers}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            {v1PayTypes.map(pt => (
              <div key={pt.key} className="flex items-center gap-1 text-[10px] text-[#8a8fa8]">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pt.color }} />
                <span className="font-semibold text-[#1a1e35]">{pt.count}</span><span>{pt.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 text-[10px] text-[#8a8fa8] border-l border-[#e8eaf0] pl-3 ml-1">
              <Users size={11} /><span className="font-semibold text-[#1a1e35]">{v1CurrMembers}</span>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Recommended projection</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-[#0168dd] tracking-tight">{fmt0(v1AdjProj)}</p>
            <BreakdownPopover />
          </div>
          <div className="relative group mt-3 cursor-default">
            <div className="h-2 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div className="h-full bg-emerald-500" style={{ width: `${v1bPctC}%` }} />
                <div className="h-full bg-[#0168dd]" style={{ width: `${Math.max(v1bPctP, 0.6)}%` }} />
                <div className="h-full flex-1 bg-[#85baf5]" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-[#8a8fa8] mt-0.5">
              <span>{fmt0(v1AvgMonthly)} avg</span>
              <span>{fmt0(v1AdjProj)} total</span>
            </div>
            <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-20 pointer-events-none">
              <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 w-48">
                {([
                  { label: "Confirmed",  color: "#10b981", value: v1bConfirmed, pct: v1bPctC },
                  { label: "Planned",    color: "#0168dd", value: v1bPlanned,   pct: v1bPctP },
                  { label: "~Projected", color: "#85baf5", value: v1bProjected, pct: v1bPctR },
                ] as const).map(({ label, color, value, pct }) => {
                  const k = value / 1000;
                  const fmtK = `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
                  return (
                    <div key={label} className="flex items-center justify-between text-[11px] font-semibold mb-1 last:mb-0 text-[#8a8fa8]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                        <span>{label}</span>
                      </div>
                      <span>{fmtK} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex divide-x divide-[#e8eaf0]">
        <div className="flex-1 px-5 py-4 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-0.5">Week-by-week distribution</p>
              {chartView === "a" ? (
                <p className="text-[11px] text-[#8a8fa8]">Past weeks show confirmed · current &amp; future show planned + projected</p>
              ) : (
                <p className="text-[11px] text-[#8a8fa8]">Amounts owed per payment provider per week</p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <div className="flex items-center bg-[#f0f1f5] rounded-md p-0.5">
                <button
                  onClick={() => setChartView("a")}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${chartView === "a" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8]"}`}
                >
                  By source of prediction
                </button>
                <button
                  onClick={() => setChartView("b")}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${chartView === "b" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8]"}`}
                >
                  By cash flow channel
                </button>
              </div>
            </div>
          </div>

          {chartView === "a" ? (
          <ResponsiveContainer key="v1b-bar-a" width="100%" height={160}>
            <BarChart data={v1bWeeklyData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="2 4" stroke="#e8eaf0" vertical={false} />
              <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1bWeeklyData} />} axisLine={false} tickLine={false} interval={0} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#8a8fa8" }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  if (!d) return null;
                  const items = [
                    { key: "factual",   label: "Confirmed",      color: "#10b981", value: d.factual   },
                    { key: "tracked",   label: "Planned",        color: "#0168dd", value: d.tracked   },
                    { key: "projected", label: "Projected",      color: "#85baf5", value: d.projected },
                  ].filter(i => i.value > 0);
                  const total = items.reduce((s, i) => s + i.value, 0);
                  return (
                    <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs min-w-[160px]">
                      <p className="font-semibold text-[#1a1e35] mb-1.5">{d.week} · {d.dateLabel}</p>
                      {items.map(i => (
                        <div key={i.key} className="flex justify-between gap-4 py-0.5">
                          <span style={{ color: i.color }}>{i.label}</span>
                          <span className="font-medium text-[#1a1e35]">{fmt0(i.value)}</span>
                        </div>
                      ))}
                      {items.length > 1 && (
                        <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e8eaf0]">
                          <span className="text-[#8a8fa8]">Total</span>
                          <span className="font-semibold text-[#1a1e35]">{fmt0(total)}</span>
                        </div>
                      )}
                    </div>
                  );
                }}
                cursor={{ fill: "#f5f6fa" }}
              />
              <Bar dataKey="factual"   name="Confirmed"  stackId="s" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="tracked"   name="Planned"    stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
              <Bar dataKey="projected" name="Projected"  stackId="s" fill="#85baf5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          ) : (
          <ResponsiveContainer key="v1b-bar-b" width="100%" height={160}>
            <BarChart data={v1ProviderWeekData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="2 4" stroke="#e8eaf0" vertical={false} />
              <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1ProviderWeekData} />} axisLine={false} tickLine={false} interval={0} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#8a8fa8" }} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "#f5f6fa" }} />
              <Bar dataKey="factual"  name="Confirmed"   stackId="s" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="Wise"     name="Wise"        stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
              <Bar dataKey="Payoneer" name="Payoneer"    stackId="s" fill="#0ea5a0" radius={[0,0,0,0]} />
              <Bar dataKey="Deel"     name="Deel"        stackId="s" fill="#f59e0b" radius={[0,0,0,0]} />
              <Bar dataKey="Export"   name="Export"      stackId="s" fill="#8a8fa8" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {([
                { label: "Confirmed", color: "#10b981", desc: "Payments already received"            },
                { label: "Planned",   color: "#0168dd", desc: "Upcoming tracked payments"            },
                { label: "Projected", color: "#85baf5", desc: "Estimated based on historical trends" },
              ] as const).map(({ label, color, desc }) => (
                <div key={label} className="relative group flex items-center gap-1.5 text-[11px] text-[#8a8fa8] cursor-default">
                  <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                  {label}
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 pointer-events-none whitespace-nowrap">
                    <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs">
                      <p className="font-semibold mb-0.5" style={{ color }}>{label}</p>
                      <p className="text-[#8a8fa8]">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {chartView === "a" && (
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-[#8a8fa8]">Wk 1–2: <span className="font-semibold text-emerald-600">past</span></span>
                <span className="text-[#8a8fa8]">Wk 3–4: <span className="font-semibold text-[#0168dd]">upcoming</span></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Version1B() {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8eaf0] bg-[#f9f9fc]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1a1e35]">Predictable Cash Flow</span>
            <span className="text-xs text-[#8a8fa8]">— based on historical payments</span>
          </div>
          <ExportDropdown />
        </div>
        <V1bPredictivePanel />
      </div>
      <div className="mt-6">
        <p className="text-base font-semibold text-[#1a1e35] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e8eaf0]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1FutureTracked />}
      </div>
    </div>
  );
}

type ManualAdjustment = {
  id: string;
  label: string;
  type: "add" | "reduce";
  unit: "pct" | "dollar";
  value: number;    // exact typed number
  dollars: number;  // always positive
  pct: number;      // always positive (approx when typed in dollars)
};

// ─── V1C ───────────────────────────────────────────────────────────────────────

const v1cMemberPct  = 18;
const v1cSeasonPct  = 10;
const v1cTotalPct   = 28;
const v1cProj       = Math.round(v1AvgMonthly * (1 + v1cTotalPct / 100));
const v1cMemberAmt  = Math.round(v1AvgMonthly * v1cMemberPct / 100);
const v1cSeasonAmt  = Math.round(v1AvgMonthly * v1cSeasonPct / 100);

const v1cConfirmed  = v1bConfirmed;
const v1cPlanned    = v1bPlanned;
const v1cUnconf     = v1cProj - v1cConfirmed - v1cPlanned;
const v1cPctC       = Math.round(v1cConfirmed / v1cProj * 100);
const v1cPctP       = Math.round(v1cPlanned   / v1cProj * 100);
const v1cPctR       = 100 - v1cPctC - v1cPctP;


const v1cEarningTypes = [
  { key: "hourly",  label: "Hourly pay",     color: "#0168dd", group: "stable"   },
  { key: "fixed",   label: "Fixed pay",      color: "#0ea5a0", group: "stable"   },
  { key: "bonuses", label: "Bonuses",        color: "#f59e0b", group: "variable" },
  { key: "pto",     label: "PTO & Holidays", color: "#8b5cf6", group: "variable" },
  { key: "adds",    label: "Additions",      color: "#f97316", group: "variable" },
] as const;

const v1cEarningTypeData = [
  { week: "Week 1", dateLabel: "Jun 2–8",   hourly: 4600, fixed: 2400, bonuses: 800,  pto: 400,  adds: 200,  total: 8400  },
  { week: "Week 2", dateLabel: "Jun 9–15",  hourly: 7000, fixed: 3200, bonuses: 2600, pto: 1000, adds: 400,  total: 14200 },
  { week: "Week 3", dateLabel: "Jun 16–22", hourly: 5400, fixed: 2600, bonuses: 800,  pto: 800,  adds: 200,  total: 9800  },
  { week: "Week 4", dateLabel: "Jun 23–30", hourly:11400, fixed: 5080, bonuses: 3600, pto: 1800, adds: 600,  total: 22480 },
];

const v1cBreakdownTabs = [
  {
    key: "prediction" as const,
    label: "By source of prediction",
    rows: [
      { label: "Confirmed",  color: "#10b981", value: 22600 },
      { label: "Planned",    color: "#0168dd", value:  1600 },
      { label: "~Projected", color: "#85baf5", value: 43947 },
    ],
  },
  {
    key: "channel" as const,
    label: "By cash flow channel",
    rows: [
      { label: "Wise",     color: "#0ea5a0", value: 31350 },
      { label: "Payoneer", color: "#f59e0b", value: 21806 },
      { label: "Deel",     color: "#7c3aed", value: 12266 },
      { label: "Export",   color: "#8a8fa8", value:  2725 },
    ],
  },
  {
    key: "earning" as const,
    label: "By earning type",
    rows: [
      { label: "Hourly pay",     color: "#0168dd", value: 31548 },
      { label: "Fixed pay",      color: "#0ea5a0", value: 18400 },
      { label: "Bonuses",        color: "#f59e0b", value:  9530 },
      { label: "PTO & Holidays", color: "#8b5cf6", value:  5452 },
      { label: "Additions",      color: "#f97316", value:  3217 },
    ],
  },
];

const v1cProviders = [
  { key: "Wise",     letter: "W", color: "#0ea5a0" },
  { key: "Payoneer", letter: "P", color: "#f59e0b" },
  { key: "Deel",     letter: "D", color: "#7c3aed" },
  { key: "Export",   letter: "E", color: "#8a8fa8" },
] as const;

function ProviderLetterBadge({ letter, color, size = 14 }: { letter: string; color: string; size?: number }) {
  return (
    <div className="rounded flex items-center justify-center flex-shrink-0 font-bold text-white select-none"
      style={{ width: size, height: size, background: color, fontSize: Math.round(size * 0.6) }}>
      {letter}
    </div>
  );
}

function V1cBreakdownPopover() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"prediction"|"channel"|"earning">("prediction");
  const activeTab = v1cBreakdownTabs.find(t => t.key === tab)!;
  const total = activeTab.rows.reduce((s, r) => s + r.value, 0);
  return (
    <div className="relative mt-1.5">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:text-[#0057bb] transition-colors select-none">
        View breakdown <ChevronDown size={11} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-6 right-0 z-30 bg-white rounded-lg border border-[#e8eaf0] shadow-xl w-72 overflow-hidden">
            <div className="flex border-b border-[#e8eaf0]">
              {v1cBreakdownTabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2 text-[9px] font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap px-1 ${tab === t.key ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#8a8fa8] hover:text-[#1a1e35]"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-3">
              {activeTab.rows.map(({ label, color, value }) => {
                const pct = Math.round(value / total * 100);
                const provider = tab === "channel" ? v1cProviders.find(p => p.key === label) : undefined;
                return (
                  <div key={label} className="flex items-center justify-between text-[11px] py-1.5 border-b border-[#f5f6fa] last:border-0">
                    <div className="flex items-center gap-2">
                      {provider
                        ? <ProviderLetterBadge letter={provider.letter} color={color} size={14} />
                        : <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />}
                      <span className="text-[#8a8fa8]">{label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-[10px] text-[#8a8fa8]">{pct}%</span>
                      <span className="font-semibold text-[#1a1e35] w-16 text-right">{fmt0(value)}</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-2 mt-1 border-t border-[#e8eaf0] text-[11px] font-semibold">
                <span className="text-[#8a8fa8]">Total</span>
                <span className="text-[#0168dd]">{fmt0(v1cProj)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AdjustmentsBreakdownPopover() {
  const [open, setOpen] = useState(false);
  const fmtK = (n: number) => { const k = n / 1000; return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`; };
  const drivers = [
    { label: "Member change", pct: v1cMemberPct, amt: v1cMemberAmt, color: "#10b981" },
    { label: "Seasonality",   pct: v1cSeasonPct, amt: v1cSeasonAmt, color: "#f59e0b" },
  ];
  return (
    <div className="relative mt-1.5">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:text-[#0057bb] transition-colors select-none">
        View breakdown <ChevronDown size={11} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-6 right-0 z-30 bg-white rounded-lg border border-[#e8eaf0] shadow-xl w-60 p-3">
            <div className="flex justify-between text-[11px] pb-2 mb-2 border-b border-[#e8eaf0]">
              <span className="text-[#8a8fa8]">Base avg payout</span>
              <span className="font-semibold text-[#1a1e35]">{fmt0(v1AvgMonthly)}</span>
            </div>
            {drivers.map(({ label, pct, amt, color }) => (
              <div key={label} className="flex justify-between items-center text-[11px] py-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold" style={{ color }}>+{pct}%</span>
                  <span className="text-[#8a8fa8]">{label}</span>
                </div>
                <span className="font-semibold text-[#1a1e35]">+{fmtK(amt)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-[11px] font-semibold mt-2 pt-2 border-t border-[#e8eaf0]">
              <span className="text-[#1a1e35]">Projected total <span className="font-normal text-[#8a8fa8]">(+{v1cTotalPct}%)</span></span>
              <span className="text-[#0168dd]">{fmt0(v1cProj)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const v1cProjected  = v1cProj - v1cConfirmed - v1cPlanned;
const v1cBarHoverRows = [
  { label: "Confirmed",  color: "#10b981", value: v1cConfirmed, pct: v1cPctC },
  { label: "Planned",    color: "#0168dd", value: v1cPlanned,   pct: v1cPctP },
  { label: "~Projected", color: "#85baf5", value: v1cProjected, pct: v1cPctR },
];

const v1cSourceData = [
  { week: "Week 1", dateLabel: "Jun 2–8",   paid: 6200, pending: 1000, failed: 1200, tracked: 0,    projected: 0     },
  { week: "Week 2", dateLabel: "Jun 9–15",  paid: 12800, pending: 1400, failed: 0,   tracked: 0,    projected: 0     },
  { week: "Week 3", dateLabel: "Jun 16–22", paid: 0,    pending: 0,    failed: 0,   tracked: 1600, projected: 8200  },
  { week: "Week 4", dateLabel: "Jun 23–30", paid: 0,    pending: 0,    failed: 0,   tracked: 0,    projected: 22480 },
];

type TriageItem = {
  group: "failed" | "pending";
  member: string; initials: string;
  week: string; dateLabel: string;
  method: string; reason: string; amount: number;
};

const v1cTriageItemDefs: TriageItem[] = [
  { group: "failed",  member: "Alex Ramirez",   initials: "AR", week: "Week 1", dateLabel: "Jun 2–8",  method: "Wise",     reason: "Wise verification failed",  amount: 1200 },
  { group: "pending", member: "Maria Kowalski", initials: "MK", week: "Week 1", dateLabel: "Jun 2–8",  method: "Payoneer", reason: "Processing delayed",         amount: 1000 },
  { group: "pending", member: "James Okafor",   initials: "JO", week: "Week 2", dateLabel: "Jun 9–15", method: "Wise",     reason: "Awaiting confirmation",      amount: 1400 },
];

const v1cTriagePendingAmt = v1cTriageItemDefs.reduce((s, i) => s + i.amount, 0);

function V1cTriageDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirm, setConfirm] = useState<{ item: TriageItem; action: "retry" | "process" } | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  if (!open) return null;

  const handleAction = (item: TriageItem) => {
    setConfirm({ item, action: item.group === "failed" ? "retry" : "process" });
  };
  const handleConfirm = () => {
    if (!confirm) return;
    setDone(prev => { const next = new Set(prev); next.add(confirm.item.member); return next; });
    setConfirm(null);
  };

  const failedItems  = v1cTriageItemDefs.filter(i => i.group === "failed");
  const pendingItems = v1cTriageItemDefs.filter(i => i.group === "pending");

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[360px] bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8eaf0]">
          <div>
            <p className="text-sm font-semibold text-[#1a1e35]">Payments needing attention</p>
            <p className="text-[11px] text-[#8a8fa8] mt-0.5">{v1cTriageItemDefs.length} items · {fmt0(v1cTriagePendingAmt)} total</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-[#8a8fa8] hover:bg-[#f5f6fa] hover:text-[#1a1e35] text-base leading-none">×</button>
        </div>
        {/* Confirmation overlay */}
        {confirm && (
          <div className="absolute inset-0 bg-white/95 z-10 flex items-center justify-center p-6">
            <div className="bg-white border border-[#e8eaf0] rounded-xl shadow-lg p-5 w-full">
              <p className="text-sm font-semibold text-[#1a1e35] mb-1">
                {confirm.action === "retry" ? "Retry payment?" : "Process payment now?"}
              </p>
              <p className="text-[12px] text-[#8a8fa8] mb-4">
                {confirm.item.member} · {fmt0(confirm.item.amount)} via {confirm.item.method}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirm(null)} className="flex-1 py-2 text-[12px] border border-[#e8eaf0] rounded-lg text-[#8a8fa8] hover:bg-[#f5f6fa]">Cancel</button>
                <button onClick={handleConfirm} className="flex-1 py-2 text-[12px] bg-[#0168dd] text-white rounded-lg font-semibold hover:bg-[#0158c0]">
                  {confirm.action === "retry" ? "Confirm retry" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {([
            { items: failedItems,  label: "Failed — needs retry",       accentColor: "#ef4444", bg: "bg-red-50",   border: "border-red-200",   btnCls: "bg-red-500 hover:bg-red-600",     btnLabel: "Retry" },
            { items: pendingItems, label: "Pending — ready to process", accentColor: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", btnCls: "bg-amber-500 hover:bg-amber-600", btnLabel: "Process now" },
          ]).map(({ items, label, accentColor, bg, border, btnCls, btnLabel }) => {
            if (!items.length) return null;
            return (
              <div key={label}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                  {label} ({items.length})
                </p>
                <div className="space-y-2">
                  {items.map(item => {
                    const isDone = done.has(item.member);
                    return (
                      <div key={item.member} className={`rounded-lg border p-3 transition-opacity ${isDone ? "opacity-40" : ""} ${bg} ${border}`}>
                        <div className="flex items-start justify-between mb-1.5 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                              style={{ background: accentColor }}>
                              {item.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12px] font-semibold text-[#1a1e35] truncate">{item.member}</p>
                              <p className="text-[10px] text-[#8a8fa8]">{item.week} ({item.dateLabel}) · {item.method}</p>
                            </div>
                          </div>
                          <span className="text-[12px] font-semibold text-[#1a1e35] flex-shrink-0">{fmt0(item.amount)}</span>
                        </div>
                        <p className="text-[11px] text-[#8a8fa8] mb-2">{item.reason}</p>
                        {!isDone ? (
                          <button onClick={() => handleAction(item)} className={`w-full py-1.5 text-[11px] font-semibold rounded-lg text-white ${btnCls}`}>
                            {btnLabel}
                          </button>
                        ) : (
                          <p className="text-center text-[11px] text-emerald-600 font-semibold py-1">Submitted ✓</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e8eaf0]">
          <a href="#" className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:underline">
            Open in Payment records <ChevronRight size={11} />
          </a>
        </div>
      </div>
    </>
  );
}

function AddAdjustmentDialog({
  open, onClose, onSave, base, currentProjection, initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (adj: ManualAdjustment) => void;
  base: number;
  currentProjection: number;
  initial?: ManualAdjustment;
}) {
  const [label, setLabel] = useState(initial?.label ?? "Buffer");
  const [adjType, setAdjType] = useState<"add" | "reduce">(initial?.type ?? "add");
  const [unit, setUnit] = useState<"pct" | "dollar">(initial?.unit ?? "pct");
  const [rawValue, setRawValue] = useState(initial ? String(initial.value) : "");
  const [amountTouched, setAmountTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setLabel(initial?.label ?? "Buffer");
      setAdjType(initial?.type ?? "add");
      setUnit(initial?.unit ?? "pct");
      setRawValue(initial ? String(initial.value) : "");
      setAmountTouched(false);
    }
  }, [open]);

  const parsed = parseFloat(rawValue.replace(/[^0-9.]/g, ""));
  const isValidAmount = !isNaN(parsed) && isFinite(parsed) && parsed > 0;

  let dollars = 0;
  let pct = 0;
  if (isValidAmount) {
    if (unit === "dollar") {
      dollars = parsed;
      pct = (parsed / base) * 100;
    } else {
      pct = parsed;
      dollars = base * parsed / 100;
    }
  }

  const signedDollars = adjType === "add" ? dollars : -dollars;
  const newProjection = Math.max(0, Math.round(currentProjection + signedDollars));
  const isValid = isValidAmount;
  const amountError = amountTouched && !isValidAmount ? "Enter an amount greater than 0" : null;
  const showSanityWarn = isValidAmount && dollars > base;
  const showClampWarn = adjType === "reduce" && isValidAmount && currentProjection + signedDollars < 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({ id: initial?.id ?? Math.random().toString(36).slice(2), label: label || "Adjustment", type: adjType, unit, value: parsed, dollars, pct });
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl w-96 p-6 pointer-events-auto">
          <h2 className="text-[15px] font-semibold text-[#1a1e35] mb-5">
            {initial ? "Edit adjustment" : "Add adjustment"}
          </h2>

          {/* Label */}
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1.5">Label</p>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)}
              className="w-full border border-[#e8eaf0] rounded-lg px-3 py-2 text-sm text-[#1a1e35] focus:outline-none focus:ring-2 focus:ring-[#0168dd]/20 focus:border-[#0168dd] transition-colors" />
          </div>

          {/* Type */}
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1.5">Type</p>
            <div className="flex bg-[#f0f1f5] rounded-lg p-0.5 w-fit">
              {(["add", "reduce"] as const).map(t => (
                <button key={t} onClick={() => setAdjType(t)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${adjType === t ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>
                  {t === "add" ? "Add" : "Reduce"}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1.5">Amount</p>
            <div className="flex gap-2">
              <div className="flex bg-[#f0f1f5] rounded-lg p-0.5 flex-shrink-0">
                {(["pct", "dollar"] as const).map(u => (
                  <button key={u} onClick={() => setUnit(u)}
                    className={`px-2.5 py-1.5 rounded-md text-sm font-semibold transition-all ${unit === u ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8]"}`}>
                    {u === "pct" ? "%" : "$"}
                  </button>
                ))}
              </div>
              <input type="text" inputMode="decimal" value={rawValue}
                onChange={e => setRawValue(e.target.value)}
                onBlur={() => setAmountTouched(true)}
                placeholder={unit === "pct" ? "e.g. 9" : "e.g. 5000"}
                className={`flex-1 border rounded-lg px-3 py-2 text-sm text-[#1a1e35] focus:outline-none focus:ring-2 transition-colors ${amountError ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-[#e8eaf0] focus:ring-[#0168dd]/20 focus:border-[#0168dd]"}`} />
            </div>
            {amountError && <p className="text-[11px] text-red-500 mt-1">{amountError}</p>}
          </div>

          {/* Helper line */}
          {isValidAmount && (
            <p className="text-[11px] text-[#8a8fa8] mt-2 leading-snug">
              {unit === "dollar"
                ? <>≈{Math.round(pct)}% of your {fmt0(base)} base · new projection <span className="font-semibold text-[#0168dd]">{fmt0(newProjection)}</span></>
                : <>= {fmt0(Math.round(dollars))} of your {fmt0(base)} base · new projection <span className="font-semibold text-[#0168dd]">{fmt0(newProjection)}</span></>}
            </p>
          )}

          {/* Warnings */}
          {showSanityWarn && <p className="text-[11px] text-amber-600 mt-1.5">Large adjustment — double-check the amount.</p>}
          {showClampWarn  && <p className="text-[11px] text-red-500 mt-1.5">This reduction would bring the projection below $0.</p>}

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e8eaf0]">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#8a8fa8] hover:text-[#1a1e35] transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={!isValid}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${isValid ? "bg-[#0168dd] text-white hover:bg-[#0057bb]" : "bg-[#e8eaf0] text-[#c8cad4] cursor-not-allowed"}`}>
              {initial ? "Save" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function V1cPredictivePanel({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [chartView, setChartView] = useState<"a" | "b" | "c">("a");
  const [showTriage, setShowTriage] = useState(false);
  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustment[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAdj, setEditingAdj] = useState<ManualAdjustment | null>(null);

  const manualNet = manualAdjustments.reduce((s, a) => s + (a.type === "add" ? a.dollars : -a.dollars), 0);
  const systemDollars = v1cMemberAmt + (seasonalityOn ? v1cSeasonAmt : 0);
  const totalAboveBase = systemDollars + manualNet;
  const adjProj = Math.max(0, Math.round(v1AvgMonthly + totalAboveBase));
  const adjPct = Math.round(totalAboveBase / v1AvgMonthly * 100);
  const adjPctC = Math.round(v1cConfirmed / adjProj * 100);
  const adjPctP = Math.round(v1cPlanned   / adjProj * 100);
  const projForDialog = editingAdj
    ? adjProj - (editingAdj.type === "add" ? editingAdj.dollars : -editingAdj.dollars)
    : adjProj;
  const mergedSourceData = v1cSourceData.map(d => ({
    week: d.week, dateLabel: d.dateLabel,
    factual: d.paid + d.pending + d.failed, tracked: d.tracked, projected: d.projected,
  }));
  return (
    <div>
      <div className="grid grid-cols-3 divide-x divide-[#e8eaf0] border-b border-[#e8eaf0]">
        {/* Card 1 — base */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Monthly avg payout</p>
          <p className="text-3xl font-bold text-[#1a1e35] tracking-tight">{fmt0(v1AvgMonthly)}</p>
          <p className="text-[11px] text-[#8a8fa8] mt-0.5">last 5 months</p>
          <div className="flex items-center gap-x-2 gap-y-1 mt-2 flex-wrap text-[10px] text-[#8a8fa8]">
            <div className="flex items-center gap-1 border-r border-[#e8eaf0] pr-2 mr-1">
              <UserCircle2 size={13} className="text-[#1a1e35]" /><span className="font-semibold text-[#1a1e35]">{v1CurrMembers}</span>
            </div>
            {v1PayTypes.map((pt, i) => (
              <div key={pt.key} className="flex items-center gap-1">
                {i > 0 && <span className="text-[#c8cad4]">·</span>}
                <span className="font-semibold text-[#1a1e35]">{pt.count}</span><span>{pt.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 — adjustments */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">Adjustments</p>
            <button onClick={() => { setEditingAdj(null); setShowAddDialog(true); }}
              className="flex items-center gap-0.5 text-[10px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2 py-0.5 hover:bg-[#0168dd]/5 transition-colors select-none">
              <Plus size={10} /> Add adjustment
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${adjPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>{adjPct >= 0 ? "+" : ""}{adjPct}%</span>
            {adjPct >= 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-400" />}
          </div>
          <div className="mt-2 divide-y divide-[#f0f1f5]">
            {([
              { label: "Member change", pct: v1cMemberPct, note: `${v1CurrMembers} this cycle vs avg ${v1AvgMembers}`, positive: true },
              { label: "Seasonality",   pct: v1cSeasonPct, note: "May is typically above avg.",                       positive: true },
            ] as const).map(({ label, pct, note, positive }) => {
              const isSeason = label === "Seasonality";
              if (isSeason && !seasonalityOn) return null;
              return (
                <div key={label} className="flex items-center gap-1.5 text-[11px] py-1.5 min-w-0">
                  <span className={`font-semibold flex-shrink-0 ${positive ? "text-emerald-600" : "text-red-500"}`}>{positive ? "+" : ""}{pct}%</span>
                  <span className="text-[#1a1e35] font-medium flex-shrink-0">{label}</span>
                  <span className="text-[#d0d3de] flex-shrink-0">—</span>
                  <span className="text-[#8a8fa8] truncate">{note}</span>
                </div>
              );
            })}
            {manualAdjustments.map(adj => (
              <div key={adj.id} className="flex items-center gap-1.5 text-[11px] py-1.5 min-w-0">
                <span className={`font-semibold flex-shrink-0 ${adj.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{adj.type === "add" ? "+" : "−"}{adj.unit === "pct" ? `${adj.value}%` : `≈${Math.round(adj.pct)}%`}</span>
                <span className="text-[#1a1e35] font-medium flex-shrink-0">{adj.label}</span>
                <span className="text-[#d0d3de] flex-shrink-0">—</span>
                <span className="text-[#8a8fa8] flex-shrink-0">{adj.unit === "dollar" ? fmt0(Math.round(adj.dollars)) : `≈${fmt0(Math.round(adj.dollars))}`}</span>
                <span className="text-[9px] font-medium bg-[#f0f1f5] text-[#8a8fa8] rounded px-1.5 py-0.5 flex-shrink-0">Added by you</span>
                <button onClick={() => { setEditingAdj(adj); setShowAddDialog(true); }} className="ml-auto flex-shrink-0 p-0.5 rounded text-[#8a8fa8] hover:text-[#0168dd] hover:bg-[#f0f1f5] transition-colors"><Pencil size={11} /></button>
                <button onClick={() => setManualAdjustments(prev => prev.filter(a => a.id !== adj.id))} className="flex-shrink-0 p-0.5 rounded text-[#8a8fa8] hover:text-red-500 hover:bg-red-50 transition-colors"><X size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 — projection */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Recommended projection</p>
          <p className="text-3xl font-bold text-[#0168dd] tracking-tight">{fmt0(adjProj)}</p>
          <V1cBreakdownPopover />
          <div className="relative group mt-3 cursor-default">
            <div className="h-2 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div className="h-full bg-emerald-500" style={{ width: `${adjPctC}%` }} />
                <div className="h-full bg-[#0168dd]" style={{ width: `${Math.max(adjPctP, 0.6)}%` }} />
                <div className="h-full flex-1 bg-[#85baf5]" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-[#8a8fa8] mt-0.5">
              <span>{fmt0(v1AvgMonthly)} avg</span>
              <span>{fmt0(adjProj)} total</span>
            </div>
            <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-20 pointer-events-none">
              <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 w-48">
                {v1cBarHoverRows.map(({ label, color, value, pct }) => {
                  const k = value / 1000;
                  const fmtK = `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
                  return (
                    <div key={label} className="flex items-center justify-between text-[11px] font-semibold mb-1 last:mb-0 text-[#8a8fa8]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                        <span>{label}</span>
                      </div>
                      <span>{fmtK} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart — identical to V1B */}
      <div className="flex divide-x divide-[#e8eaf0]">
        <div className="flex-1 px-5 py-4 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-0.5">Week-by-week distribution</p>
              {chartView === "a" ? (
                <p className="text-[11px] text-[#8a8fa8]">
                  {showStatusBreakdown
                    ? "Past weeks: paid · pending · failed — future: planned + projected"
                    : "Past weeks show confirmed · current & future show planned + projected"}
                </p>
              ) : chartView === "b" ? (
                <p className="text-[11px] text-[#8a8fa8]">Amounts owed per payment provider per week</p>
              ) : (
                <p className="text-[11px] text-[#8a8fa8]">Stable base sits at the bottom · variable earnings stack on top</p>
              )}
            </div>
            <div className="flex items-center bg-[#f0f1f5] rounded-md p-0.5 flex-shrink-0 ml-4">
              {([["a","By source of prediction"],["b","By cash flow channel"],["c","By earning type"]] as const).map(([v, lbl]) => (
                <button key={v} onClick={() => setChartView(v)} className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${chartView === v ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8]"}`}>{lbl}</button>
              ))}
            </div>
          </div>
          {chartView === "a" && showStatusBreakdown && v1cTriageItemDefs.length > 0 && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                <span className="text-[11px] text-amber-800 truncate">
                  {`${v1cTriageItemDefs.length} payments pending · $${(v1cTriagePendingAmt / 1000).toFixed(1)}k from Weeks 1–2 still need processing`}
                </span>
              </div>
              <button
                onClick={() => setShowTriage(true)}
                className="text-[11px] text-[#0168dd] font-semibold flex-shrink-0 hover:underline flex items-center gap-0.5"
              >Review <ChevronRight size={11} /></button>
            </div>
          )}
          {chartView === "a" ? (
            showStatusBreakdown ? (
              <ResponsiveContainer key="v1c-bar-a-status" width="100%" height={160}>
                <BarChart data={v1cSourceData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="2 4" stroke="#e8eaf0" vertical={false} />
                  <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1cSourceData} />} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#8a8fa8" }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload as typeof v1cSourceData[0];
                    if (!d) return null;
                    const items = [
                      { key: "paid",      label: "Paid",      color: "#10b981", value: d.paid      },
                      { key: "pending",   label: "Pending",   color: "#f59e0b", value: d.pending   },
                      { key: "failed",    label: "Failed",    color: "#ef4444", value: d.failed    },
                      { key: "tracked",   label: "Planned",   color: "#0168dd", value: d.tracked   },
                      { key: "projected", label: "Projected", color: "#85baf5", value: d.projected },
                    ].filter(i => i.value > 0);
                    const total = items.reduce((s, i) => s + i.value, 0);
                    return (
                      <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs min-w-[160px]">
                        <p className="font-semibold text-[#1a1e35] mb-1.5">{d.week} · {d.dateLabel}</p>
                        {items.map(i => (
                          <div key={i.key} className="flex justify-between gap-4 py-0.5">
                            <span style={{ color: i.color }}>{i.label}</span>
                            <span className="font-medium text-[#1a1e35]">{fmt0(i.value)}</span>
                          </div>
                        ))}
                        {items.length > 1 && <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e8eaf0]"><span className="text-[#8a8fa8]">Total</span><span className="font-semibold text-[#1a1e35]">{fmt0(total)}</span></div>}
                      </div>
                    );
                  }} cursor={{ fill: "#f5f6fa" }} />
                  <Bar dataKey="paid"      name="Paid"      stackId="s" fill="#10b981" radius={[0,0,0,0]} />
                  <Bar dataKey="pending"   name="Pending"   stackId="s" fill="#f59e0b" radius={[0,0,0,0]} />
                  <Bar dataKey="failed"    name="Failed"    stackId="s" fill="#ef4444" radius={[0,0,0,0]} />
                  <Bar dataKey="tracked"   name="Planned"   stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
                  <Bar dataKey="projected" name="Projected" stackId="s" fill="#85baf5" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer key="v1c-bar-a-simple" width="100%" height={160}>
                <BarChart data={mergedSourceData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="2 4" stroke="#e8eaf0" vertical={false} />
                  <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={mergedSourceData} />} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#8a8fa8" }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload as typeof mergedSourceData[0];
                    if (!d) return null;
                    const items = [
                      { key: "factual",   label: "Confirmed", color: "#10b981", value: d.factual   },
                      { key: "tracked",   label: "Planned",   color: "#0168dd", value: d.tracked   },
                      { key: "projected", label: "Projected", color: "#85baf5", value: d.projected },
                    ].filter(i => i.value > 0);
                    const total = items.reduce((s, i) => s + i.value, 0);
                    return (
                      <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs min-w-[160px]">
                        <p className="font-semibold text-[#1a1e35] mb-1.5">{d.week} · {d.dateLabel}</p>
                        {items.map(i => (
                          <div key={i.key} className="flex justify-between gap-4 py-0.5">
                            <span style={{ color: i.color }}>{i.label}</span>
                            <span className="font-medium text-[#1a1e35]">{fmt0(i.value)}</span>
                          </div>
                        ))}
                        {items.length > 1 && <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e8eaf0]"><span className="text-[#8a8fa8]">Total</span><span className="font-semibold text-[#1a1e35]">{fmt0(total)}</span></div>}
                      </div>
                    );
                  }} cursor={{ fill: "#f5f6fa" }} />
                  <Bar dataKey="factual"   name="Confirmed" stackId="s" fill="#10b981" radius={[4,4,0,0]} />
                  <Bar dataKey="tracked"   name="Planned"   stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
                  <Bar dataKey="projected" name="Projected" stackId="s" fill="#85baf5" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          ) : chartView === "b" ? (
            <ResponsiveContainer key="v1c-bar-b" width="100%" height={160}>
              <BarChart data={v1ProviderWeekData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="2 4" stroke="#e8eaf0" vertical={false} />
                <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1ProviderWeekData} />} axisLine={false} tickLine={false} interval={0} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#8a8fa8" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#f5f6fa" }} />
                <Bar dataKey="factual"  name="Confirmed" stackId="s" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="Wise"     name="Wise"      stackId="s" fill="#0ea5a0" radius={[0,0,0,0]} />
                <Bar dataKey="Payoneer" name="Payoneer"  stackId="s" fill="#f59e0b" radius={[0,0,0,0]} />
                <Bar dataKey="Deel"     name="Deel"      stackId="s" fill="#7c3aed" radius={[0,0,0,0]} />
                <Bar dataKey="Export"   name="Export"    stackId="s" fill="#8a8fa8" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer key="v1c-bar-c" width="100%" height={160}>
              <BarChart data={v1cEarningTypeData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="2 4" stroke="#e8eaf0" vertical={false} />
                <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1cEarningTypeData} />} axisLine={false} tickLine={false} interval={0} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#8a8fa8" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload as typeof v1cEarningTypeData[0];
                  if (!d) return null;
                  return (
                    <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs min-w-[180px]">
                      <p className="font-semibold text-[#1a1e35] mb-1.5">{d.week} · {d.dateLabel}</p>
                      {v1cEarningTypes.map(({ key, label, color }) => {
                        const val = d[key as keyof typeof d] as number;
                        const pct = Math.round(val / d.total * 100);
                        return (
                          <div key={key} className="flex justify-between gap-3 py-0.5 text-[11px]">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-sm flex-shrink-0 inline-block" style={{ background: color }} />
                              <span className="text-[#8a8fa8]">{label}</span>
                            </span>
                            <span className="font-medium text-[#1a1e35]">{fmt0(val)} <span className="text-[#8a8fa8]">({pct}%)</span></span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between mt-1 pt-1.5 border-t border-[#e8eaf0] font-semibold text-[11px]">
                        <span className="text-[#8a8fa8]">Total</span>
                        <span className="text-[#1a1e35]">{fmt0(d.total)}</span>
                      </div>
                    </div>
                  );
                }} cursor={{ fill: "#f5f6fa" }} />
                <Bar dataKey="hourly"  name="Hourly pay"     stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
                <Bar dataKey="fixed"   name="Fixed pay"      stackId="s" fill="#0ea5a0" radius={[0,0,0,0]} />
                <Bar dataKey="bonuses" name="Bonuses"        stackId="s" fill="#f59e0b" radius={[0,0,0,0]} />
                <Bar dataKey="pto"     name="PTO & Holidays" stackId="s" fill="#8b5cf6" radius={[0,0,0,0]} />
                <Bar dataKey="adds"    name="Additions"      stackId="s" fill="#f97316" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex items-center justify-between mt-1">
            {chartView === "c" ? (
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {(["stable","variable"] as const).map(group => (
                  <div key={group} className="flex items-center gap-3">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-[#8a8fa8]">
                      {group === "stable" ? "Stable base" : "Variable — Watch"}
                    </span>
                    {v1cEarningTypes.filter(t => t.group === group).map(({ key, label, color }) => (
                      <div key={key} className="flex items-center gap-1.5 text-[11px] text-[#8a8fa8]">
                        <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                        {label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : chartView === "b" ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-[#8a8fa8]">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#10b981" }} />
                  Confirmed
                </div>
                {v1cProviders.map(({ key, letter, color }) => (
                  <div key={key} className="flex items-center gap-1.5 text-[11px] text-[#8a8fa8]">
                    <ProviderLetterBadge letter={letter} color={color} size={12} />
                    {key}
                  </div>
                ))}
              </div>
            ) : (
              showStatusBreakdown ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {([
                    { label: "Paid",    color: "#10b981", desc: "Successfully paid out"                },
                    { label: "Pending", color: "#f59e0b", desc: "Payment created, awaiting processing" },
                    { label: "Failed",  color: "#ef4444", desc: "Payment failed — needs attention"     },
                  ] as const).map(({ label, color, desc }) => (
                    <div key={label} className="relative group flex items-center gap-1.5 text-[11px] text-[#8a8fa8] cursor-default">
                      <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                      {label}
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 pointer-events-none whitespace-nowrap">
                        <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs">
                          <p className="font-semibold mb-0.5" style={{ color }}>{label}</p>
                          <p className="text-[#8a8fa8]">{desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <span className="text-[#c8cad4] text-[10px]">·</span>
                  {([
                    { label: "Planned",   color: "#0168dd", desc: "Upcoming tracked payments"            },
                    { label: "Projected", color: "#85baf5", desc: "Estimated based on historical trends" },
                  ] as const).map(({ label, color, desc }) => (
                    <div key={label} className="relative group flex items-center gap-1.5 text-[11px] text-[#8a8fa8] cursor-default">
                      <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                      {label}
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 pointer-events-none whitespace-nowrap">
                        <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs">
                          <p className="font-semibold mb-0.5" style={{ color }}>{label}</p>
                          <p className="text-[#8a8fa8]">{desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {([
                    { label: "Confirmed", color: "#10b981", desc: "Payments already received"            },
                    { label: "Planned",   color: "#0168dd", desc: "Upcoming tracked payments"            },
                    { label: "Projected", color: "#85baf5", desc: "Estimated based on historical trends" },
                  ] as const).map(({ label, color, desc }) => (
                    <div key={label} className="relative group flex items-center gap-1.5 text-[11px] text-[#8a8fa8] cursor-default">
                      <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                      {label}
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 pointer-events-none whitespace-nowrap">
                        <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs">
                          <p className="font-semibold mb-0.5" style={{ color }}>{label}</p>
                          <p className="text-[#8a8fa8]">{desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <V1cTriageDrawer open={showTriage} onClose={() => setShowTriage(false)} />
      <AddAdjustmentDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={adj => {
          if (editingAdj) {
            setManualAdjustments(prev => prev.map(a => a.id === adj.id ? adj : a));
          } else {
            setManualAdjustments(prev => [...prev, adj]);
          }
        }}
        base={v1AvgMonthly}
        currentProjection={projForDialog}
        initial={editingAdj ?? undefined}
      />
    </div>
  );
}

function Version1C({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8eaf0] bg-[#f9f9fc]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1a1e35]">Predictable Cash Flow</span>
            <span className="text-xs text-[#8a8fa8]">— based on historical payments</span>
          </div>
          <ExportDropdown />
        </div>
        <V1cPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />
      </div>
      <div className="mt-6">
        <p className="text-base font-semibold text-[#1a1e35] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e8eaf0]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1FutureTracked />}
      </div>
    </div>
  );
}

// ─── FUND YOUR ACCOUNTS ────────────────────────────────────────────────────────

type FundingMode = "manual" | "automatic";
type ProviderFundingStatus = "needs-funding" | "funded" | "no-connection" | "unavailable";

type FundingProvider = {
  id: string;
  name: string;
  letter: string;
  color: string;
  status: ProviderFundingStatus;
  balance?: number;
  lastUpdated?: string;
  needed?: number;
  mode: FundingMode;
  leadTimeDays: number;
  bufferType: "none" | "pct" | "dollar";
  bufferValue: number;
};

const fundInitProviders: FundingProvider[] = [
  { id: "wise", name: "Wise", letter: "W", color: "#00B9FF", status: "needs-funding", balance: 14200, needed: 18500, lastUpdated: "2 min ago", mode: "manual", leadTimeDays: 2, bufferType: "none", bufferValue: 0 },
  { id: "payoneer", name: "Payoneer", letter: "P", color: "#F0521E", status: "funded", balance: 27800, needed: 19400, lastUpdated: "5 min ago", mode: "automatic", leadTimeDays: 1, bufferType: "pct", bufferValue: 5 },
  { id: "paypal", name: "PayPal", letter: "Pp", color: "#0070E0", status: "no-connection", mode: "manual", leadTimeDays: 2, bufferType: "none", bufferValue: 0 },
];

function PrefundConfirmDialog({
  provider,
  onClose,
  onConfirm,
}: {
  provider: FundingProvider;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) {
  const defaultAmt = provider.needed !== undefined && provider.balance !== undefined
    ? Math.max(0, provider.needed - provider.balance)
    : 0;
  const [rawAmt, setRawAmt] = useState(String(defaultAmt));
  const parsed = parseFloat(rawAmt.replace(/[^0-9.]/g, ""));
  const isValid = !isNaN(parsed) && parsed > 0;
  const resulting = isValid ? Math.round((provider.balance ?? 0) + parsed) : (provider.balance ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl w-[380px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8eaf0]">
          <span className="text-sm font-semibold text-[#1a1e35]">Fund {provider.name}</span>
          <button onClick={onClose} className="p-1 rounded text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5]"><X size={14} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="bg-[#f9f9fc] rounded-lg p-3 space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-[#8a8fa8]">From</span>
              <span className="text-[#1a1e35] font-medium">Chase ···4892</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a8fa8]">To</span>
              <span className="text-[#1a1e35] font-medium">{provider.name} account</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a8fa8]">Current balance</span>
              <span className="text-[#1a1e35] font-medium">{fmt0(provider.balance ?? 0)}</span>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#8a8fa8] uppercase tracking-widest mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8a8fa8]">$</span>
              <input
                type="text"
                value={rawAmt}
                onChange={e => setRawAmt(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-[#e8eaf0] rounded-lg text-sm font-semibold text-[#1a1e35] focus:outline-none focus:border-[#0168dd]"
              />
            </div>
            {isValid && (
              <p className="text-[11px] text-[#8a8fa8] mt-1">
                Resulting balance: <span className="font-medium text-[#1a1e35]">{fmt0(resulting)}</span>
                {resulting >= (provider.needed ?? 0) && <span className="text-emerald-600 ml-1">· Fully funded ✓</span>}
              </p>
            )}
          </div>
          <p className="text-[11px] text-[#8a8fa8] bg-[#f9f9fc] rounded-lg p-2.5 leading-relaxed">Transfers typically arrive within 1–2 business days. Nothing moves until you confirm.</p>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 border-t border-[#e8eaf0]">
          <button onClick={onClose} className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-[#8a8fa8] border border-[#e8eaf0] hover:bg-[#f0f1f5] transition-colors">Cancel</button>
          <button
            disabled={!isValid}
            onClick={() => { if (isValid) onConfirm(parsed); }}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-[#0168dd] text-white hover:bg-[#0059c2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >Confirm transfer</button>
        </div>
      </div>
    </div>
  );
}

function ProviderSettingsSheet({
  provider,
  onClose,
  onSave,
  variant = "drawer",
}: {
  provider: FundingProvider;
  onClose: () => void;
  onSave: (updates: Partial<FundingProvider>) => void;
  variant?: "drawer" | "dialog";
}) {
  const [mode, setMode] = useState<FundingMode>(provider.mode);
  const [leadTimeDays, setLeadTimeDays] = useState(provider.leadTimeDays);
  const [bufferType, setBufferType] = useState<"none" | "pct" | "dollar">(provider.bufferType);
  const [bufferValue, setBufferValue] = useState(provider.bufferValue);
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderDays, setReminderDays] = useState(2);

  const leadTimeOptions = [
    { label: "Same-day morning", days: 0 },
    { label: "1 day before", days: 1 },
    { label: "2 days before", days: 2 },
    { label: "3 days before", days: 3 },
  ];
  const bufferOptions: { label: string; type: "none" | "pct" | "dollar" }[] = [
    { label: "Exact amount (recommended)", type: "none" },
    { label: "Add % buffer", type: "pct" },
    { label: "Add fixed $ buffer", type: "dollar" },
  ];
  const reminderOptions = [
    { label: "3 days before", days: 3 },
    { label: "2 days before", days: 2 },
    { label: "1 day before", days: 1 },
    { label: "Same-day morning", days: 0 },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex ${variant === "dialog" ? "items-center justify-center bg-black/30 p-4" : "justify-end"}`}>
      {variant === "drawer" && <div className="absolute inset-0 bg-black/20" onClick={onClose} />}
      <div className={`relative bg-white shadow-2xl flex flex-col ${variant === "dialog" ? "w-[460px] max-h-[82vh] rounded-xl overflow-hidden" : "w-[340px] h-full overflow-y-auto"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8eaf0] flex-shrink-0">
          <span className="text-sm font-semibold text-[#1a1e35]">{provider.name} — Funding settings</span>
          <button onClick={onClose} className="p-1 rounded text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5]"><X size={14} /></button>
        </div>
        <div className="flex-1 px-5 py-5 space-y-6 overflow-y-auto">
          {/* Funding mode */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-2">Funding mode</p>
            <div className="flex rounded-lg border border-[#e8eaf0] overflow-hidden">
              {(["manual", "automatic"] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-xs font-semibold capitalize transition-colors ${mode === m ? "bg-[#0168dd] text-white" : "text-[#8a8fa8] hover:bg-[#f9f9fc]"}`}>
                  {m === "manual" ? "Manual" : "Automatic"}
                </button>
              ))}
            </div>
            {mode === "automatic" && (
              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed">Direct debit is a 2-step process and may push payday out by 1–2 days. Approval deadline moves earlier.</p>
              </div>
            )}
          </div>
          {/* Lead time */}
          {mode === "automatic" && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-2">Fund ahead of payroll by</p>
              <div className="space-y-0.5">
                {leadTimeOptions.map(opt => (
                  <label key={opt.days} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#f9f9fc] cursor-pointer">
                    <input type="radio" name="leadTime" checked={leadTimeDays === opt.days} onChange={() => setLeadTimeDays(opt.days)} className="accent-[#0168dd]" />
                    <span className="text-xs text-[#1a1e35]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* Buffer */}
          {mode === "automatic" && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-2">Buffer</p>
              <div className="space-y-0.5">
                {bufferOptions.map(opt => (
                  <label key={opt.type} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#f9f9fc] cursor-pointer">
                    <input type="radio" name="bufferType" checked={bufferType === opt.type} onChange={() => setBufferType(opt.type)} className="accent-[#0168dd]" />
                    <span className="text-xs text-[#1a1e35]">{opt.label}</span>
                  </label>
                ))}
              </div>
              {bufferType !== "none" && (
                <div className="mt-2 flex items-center gap-2 pl-2">
                  <span className="text-xs text-[#8a8fa8]">{bufferType === "pct" ? "%" : "$"}</span>
                  <input
                    type="number"
                    value={bufferValue}
                    onChange={e => setBufferValue(Number(e.target.value))}
                    min={0}
                    className="w-20 px-2 py-1.5 border border-[#e8eaf0] rounded-lg text-xs text-[#1a1e35] focus:outline-none focus:border-[#0168dd]"
                  />
                </div>
              )}
            </div>
          )}
          {/* Reminder email */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8a8fa8]">Funding reminder email</p>
              <button
                onClick={() => setReminderOn(r => !r)}
                className={`w-9 h-5 rounded-full transition-colors flex items-center ${reminderOn ? "bg-[#0168dd]" : "bg-[#d0d3de]"}`}
              >
                <span className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${reminderOn ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>
            {reminderOn && (
              <div className="mt-2 space-y-0.5">
                <p className="text-[11px] text-[#8a8fa8] px-2 mb-1">Send reminder email</p>
                {reminderOptions.map(opt => (
                  <label key={opt.days} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#f9f9fc] cursor-pointer">
                    <input type="radio" name="reminderDays" checked={reminderDays === opt.days} onChange={() => setReminderDays(opt.days)} className="accent-[#0168dd]" />
                    <span className="text-xs text-[#1a1e35]">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 px-5 py-3 border-t border-[#e8eaf0] flex-shrink-0">
          <button onClick={onClose} className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-[#8a8fa8] border border-[#e8eaf0] hover:bg-[#f0f1f5] transition-colors">Cancel</button>
          <button
            onClick={() => { onSave({ mode, leadTimeDays, bufferType, bufferValue }); onClose(); }}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-[#0168dd] text-white hover:bg-[#0059c2] transition-colors"
          >Save</button>
        </div>
      </div>
    </div>
  );
}

function ProviderLogo({ id, size = 32 }: { id: string; size?: number }) {
  if (id === "wise") return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill="#00B9FF"/>
      <path d="M7.5 11L11 21L16 14L21 21L24.5 11H22L21 13.5L16 21L11 13.5L10 11H7.5Z" fill="white"/>
    </svg>
  );
  if (id === "payoneer") return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill="#F05A28"/>
      <path fillRule="evenodd" d="M10 8V24H13V19H17C20.5 19 23 17 23 13.5C23 10 20.5 8 17 8H10ZM13 11H16.5C18.5 11 20 12 20 13.5C20 15 18.5 16 16.5 16H13V11Z" fill="white"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill="#003087"/>
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui,sans-serif">PP</text>
    </svg>
  );
}

function FundingEmailPreviewDialog({
  provider,
  onClose,
}: {
  provider: FundingProvider;
  onClose: () => void;
}) {
  const shortfall = provider.needed !== undefined && provider.balance !== undefined
    ? Math.max(0, provider.needed - provider.balance) : 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-[560px] max-h-[85vh] overflow-hidden flex flex-col">
        {/* Email client chrome */}
        <div className="flex items-start justify-between px-5 py-3.5 border-b border-[#e8eaf0] bg-[#f9f9fc] flex-shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#1a1e35]">Action needed: Fund your {provider.name} account before payroll runs</p>
            <p className="text-[10px] text-[#8a8fa8] mt-1">From: <span className="text-[#1a1e35]">Hubstaff Payments &lt;payments@hubstaff.com&gt;</span></p>
            <p className="text-[10px] text-[#8a8fa8]">To: <span className="text-[#1a1e35]">zishe@company.com</span><span className="mx-1.5 text-[#d0d3de]">·</span><span>Jun 25, 2026, 8:00 AM</span></p>
          </div>
          <button onClick={onClose} className="ml-3 p-1 rounded text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5] flex-shrink-0"><X size={14} /></button>
        </div>
        {/* Email body */}
        <div className="flex-1 overflow-y-auto bg-[#f4f5f7] p-5">
          <div className="bg-white rounded-lg overflow-hidden max-w-[460px] mx-auto shadow-sm border border-[#e8eaf0]">
            {/* Brand header */}
            <div className="bg-[#0168dd] px-6 py-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-[#0168dd] rounded-sm" />
              </div>
              <span className="text-white text-sm font-bold tracking-tight">Hubstaff</span>
            </div>
            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-[#1a1e35]">Hi Zishe,</p>
              <p className="text-sm text-[#1a1e35] leading-relaxed">
                Your payroll runs on <strong>Jun 28, 2026</strong> — in 3 days. Your <strong>{provider.name}</strong> account balance is below what's needed to cover all payments.
              </p>
              {/* Shortfall card */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3.5 space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: provider.color }}>{provider.letter}</div>
                  <p className="text-[11px] font-semibold text-amber-800">{provider.name} account</p>
                </div>
                <div className="space-y-1.5 text-[12px] mt-1">
                  <div className="flex justify-between">
                    <span className="text-[#8a8fa8]">Current balance</span>
                    <span className="font-medium text-[#1a1e35]">{fmt0(provider.balance ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a8fa8]">Needed by Jun 28</span>
                    <span className="font-medium text-[#1a1e35]">{fmt0(provider.needed ?? 0)}</span>
                  </div>
                  <div className="border-t border-amber-200 pt-2 flex justify-between">
                    <span className="font-semibold text-amber-800">Add to cover</span>
                    <span className="font-bold text-amber-700">+{fmt0(shortfall)}</span>
                  </div>
                </div>
              </div>
              {/* CTA */}
              <div className="text-center pt-1">
                <button className="px-6 py-2.5 rounded-lg bg-[#0168dd] text-white text-sm font-semibold hover:bg-[#0059c2] transition-colors">
                  Fund {provider.name} now →
                </button>
              </div>
              <p className="text-[11px] text-[#8a8fa8] leading-relaxed">
                This reminder was sent because you have <strong>Manual</strong> funding mode enabled for {provider.name}. To switch to automatic funding, <span className="text-[#0168dd] cursor-pointer">update your preferences</span>.
              </p>
            </div>
            {/* Footer */}
            <div className="border-t border-[#e8eaf0] px-6 py-4 bg-[#f9f9fc] text-center space-y-1">
              <p className="text-[10px] text-[#8a8fa8]">
                You're receiving this because funding reminders are enabled for your account.
              </p>
              <p className="text-[10px]">
                <span className="text-[#0168dd] cursor-pointer">Manage notification preferences</span>
                <span className="text-[#d0d3de] mx-1">·</span>
                <span className="text-[#0168dd] cursor-pointer">Unsubscribe</span>
              </p>
              <p className="text-[10px] text-[#c0c3d3] mt-1">Hubstaff Inc. · 300 Colonial Center Pkwy, Roswell, GA 30076</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FundYourAccountsPanel() {
  const [providers, setProviders] = useState<FundingProvider[]>(fundInitProviders);
  const [prefundProvider, setPrefundProvider] = useState<FundingProvider | null>(null);
  const [settingsProvider, setSettingsProvider] = useState<FundingProvider | null>(null);
  const [emailProvider, setEmailProvider] = useState<FundingProvider | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [layout, setLayout] = useState<"list" | "cards">("cards");

  const needsFundingRows = providers.filter(p => p.status === "needs-funding");
  const totalShortfall = needsFundingRows.reduce((s, p) => s + Math.max(0, (p.needed ?? 0) - (p.balance ?? 0)), 0);

  const handleRefresh = (id: string) => {
    setRefreshingId(id);
    setTimeout(() => setRefreshingId(null), 1500);
  };

  const handleConfirmPrefund = (p: FundingProvider, amount: number) => {
    setProviders(prev => prev.map(r => {
      if (r.id !== p.id) return r;
      const newBal = Math.round((r.balance ?? 0) + amount);
      return { ...r, balance: newBal, status: newBal >= (r.needed ?? 0) ? "funded" : "needs-funding", lastUpdated: "just now" };
    }));
    setPrefundProvider(null);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Section title – no card wrapper */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-[#1a1e35]">Fund your accounts</p>
            <p className="text-xs text-[#8a8fa8] mt-0.5">
              {totalShortfall > 0
                ? <span>Recommended for this period: <span className="font-medium text-amber-600">{fmt0(totalShortfall)}</span> to add across {needsFundingRows.length} account{needsFundingRows.length !== 1 ? "s" : ""}</span>
                : <span className="text-emerald-600 font-medium">All accounts funded for this period ✓</span>
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0 border border-[#e8eaf0] rounded-md overflow-hidden">
              <button onClick={() => setLayout("list")} title="List view" className={`px-2 py-1 transition-colors ${layout === "list" ? "bg-[#0168dd] text-white" : "text-[#8a8fa8] hover:bg-[#f0f1f5]"}`}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="2" width="16" height="2" rx="1"/><rect x="0" y="7" width="16" height="2" rx="1"/><rect x="0" y="12" width="16" height="2" rx="1"/></svg>
              </button>
              <button onClick={() => setLayout("cards")} title="Card view" className={`px-2 py-1 transition-colors ${layout === "cards" ? "bg-[#0168dd] text-white" : "text-[#8a8fa8] hover:bg-[#f0f1f5]"}`}>
                <Columns size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Provider cards – 3-column grid */}
        {layout === "cards" ? (
          <div className="grid grid-cols-3 gap-3">
            {providers.map(p => {
              const shortfall = p.balance !== undefined && p.needed !== undefined ? p.needed - p.balance : null;
              const pct = p.balance !== undefined && p.needed !== undefined ? Math.min(100, Math.round(p.balance / p.needed * 100)) : 0;
              const isRefreshing = refreshingId === p.id;
              const connected = p.status !== "no-connection" && p.status !== "unavailable";
              return (
                <div key={p.id} className="border border-[#e8eaf0] bg-white rounded-xl p-3.5 flex flex-col gap-2.5">
                  {/* Header: logo + name | go-to / connect action */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <ProviderLogo id={p.id} size={28} />
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => connected ? setEmailProvider(p) : undefined}
                          className={`text-xs font-semibold text-[#1a1e35] leading-tight text-left ${connected ? "hover:text-[#0168dd] hover:underline" : ""}`}
                        >{p.name}</button>
                        {p.status === "no-connection" && (
                          <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide self-start bg-[#f0f1f5] text-[#c0c3d3]">not connected</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {p.status === "no-connection" ? (
                        <button className="px-2 py-1 rounded text-[10px] font-semibold border border-[#0168dd] text-[#0168dd] bg-transparent hover:bg-[#0168dd]/5 transition-colors whitespace-nowrap">Connect {p.name}</button>
                      ) : (
                        <a href="#" onClick={e => e.preventDefault()} className="px-2 py-1 rounded text-[10px] font-semibold border border-[#0168dd] text-[#0168dd] bg-transparent hover:bg-[#0168dd]/5 transition-colors whitespace-nowrap inline-flex items-center gap-1">
                          Go to {p.name}
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                  {/* Balance + shortfall or status */}
                  {p.status === "unavailable" ? (
                    <p className="text-[11px] text-red-500">Balance unavailable — <button className="underline">retry</button></p>
                  ) : connected ? (
                    <>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-[#8a8fa8]">Balance</p>
                          <div className="flex items-center gap-1">
                            <span className={`text-sm font-bold ${isRefreshing ? "text-[#8a8fa8]" : "text-[#1a1e35]"}`}>{isRefreshing ? "…" : fmt0(p.balance!)}</span>
                            <button onClick={() => handleRefresh(p.id)} className="text-[#c0c3d3] hover:text-[#0168dd] transition-colors">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        {p.status === "needs-funding" && shortfall !== null && (
                          <div className="text-right">
                            <p className="text-[10px] text-[#8a8fa8]">Add to cover</p>
                            <p className="text-sm font-bold text-amber-600">+{fmt0(shortfall)}</p>
                          </div>
                        )}
                        {p.status === "funded" && (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 pb-0.5">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Funded
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 bg-[#f0f1f5] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${p.status === "funded" ? "bg-emerald-400" : "bg-amber-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
            <div className="divide-y divide-[#f0f1f5]">
              {providers.map(p => {
                const shortfall = p.balance !== undefined && p.needed !== undefined ? p.needed - p.balance : null;
                const pct = p.balance !== undefined && p.needed !== undefined ? Math.min(100, Math.round(p.balance / p.needed * 100)) : 0;
                const isRefreshing = refreshingId === p.id;
                return (
                  <div key={p.id} className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <ProviderLogo id={p.id} size={32} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => p.status !== "no-connection" ? setEmailProvider(p) : undefined}
                            className={`text-sm font-semibold text-[#1a1e35] ${p.status !== "no-connection" ? "hover:text-[#0168dd] hover:underline cursor-pointer" : "cursor-default"} transition-colors`}
                          >{p.name}</button>
                          {p.status !== "no-connection" && (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${p.mode === "automatic" ? "bg-[#eef3ff] text-[#0168dd]" : "bg-[#f0f1f5] text-[#8a8fa8]"}`}>
                              {p.mode}
                            </span>
                          )}
                        </div>
                        {p.status === "no-connection" ? (
                          <button className="text-xs text-[#0168dd] hover:underline mt-0.5">Connect {p.name} →</button>
                        ) : p.status === "unavailable" ? (
                          <p className="text-xs text-red-500 mt-0.5">Balance unavailable — <button className="underline">retry</button></p>
                        ) : (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`text-xs font-semibold ${isRefreshing ? "text-[#8a8fa8]" : "text-[#1a1e35]"}`}>{isRefreshing ? "Refreshing…" : fmt0(p.balance!)}</span>
                            <span className="text-[10px] text-[#8a8fa8]">balance</span>
                            <button onClick={() => handleRefresh(p.id)} className="ml-0.5 p-0.5 rounded text-[#c0c3d3] hover:text-[#0168dd] transition-colors">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                              </svg>
                            </button>
                            <span className="text-[10px] text-[#d0d3de]">·</span>
                            <span className="text-[10px] text-[#8a8fa8]">{p.lastUpdated}</span>
                          </div>
                        )}
                      </div>
                      {p.status === "funded" && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Funded
                          </span>
                          <button onClick={() => setSettingsProvider(p)} className="p-1 rounded text-[#c0c3d3] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors"><Settings size={12} /></button>
                        </div>
                      )}
                      {p.status === "needs-funding" && shortfall !== null && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right mr-1">
                            <p className="text-[10px] text-[#8a8fa8]">Add to cover</p>
                            <p className="text-sm font-bold text-amber-600">+{fmt0(shortfall)}</p>
                          </div>
                          <button onClick={() => setPrefundProvider(p)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0168dd] text-white hover:bg-[#0059c2] transition-colors whitespace-nowrap">
                            Prefund {p.name}
                          </button>
                          <button onClick={() => setSettingsProvider(p)} className="p-1 rounded text-[#c0c3d3] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors"><Settings size={12} /></button>
                        </div>
                      )}
                    </div>
                    {p.status !== "no-connection" && p.balance !== undefined && p.needed !== undefined && (
                      <div className="mt-2 ml-11 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#f0f1f5] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${p.status === "funded" ? "bg-emerald-400" : "bg-amber-400"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-[#8a8fa8] flex-shrink-0">{fmt0(p.balance)} of {fmt0(p.needed)} needed</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {emailProvider && (
        <FundingEmailPreviewDialog
          provider={emailProvider}
          onClose={() => setEmailProvider(null)}
        />
      )}
      {prefundProvider && (
        <PrefundConfirmDialog
          provider={prefundProvider}
          onClose={() => setPrefundProvider(null)}
          onConfirm={amount => handleConfirmPrefund(prefundProvider, amount)}
        />
      )}
      {settingsProvider && (
        <ProviderSettingsSheet
          provider={settingsProvider}
          onClose={() => setSettingsProvider(null)}
          onSave={updates => setProviders(prev => prev.map(p => p.id === settingsProvider.id ? { ...p, ...updates } : p))}
          variant={layout === "cards" ? "dialog" : "drawer"}
        />
      )}
    </>
  );
}

function Version1D({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8eaf0] bg-[#f9f9fc]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1a1e35]">Predictable Cash Flow</span>
            <span className="text-xs text-[#8a8fa8]">— based on historical payments</span>
          </div>
          <ExportDropdown />
        </div>
        <V1cPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />
      </div>
      <FundYourAccountsPanel />
      <div>
        <p className="text-base font-semibold text-[#1a1e35] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e8eaf0]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1FutureTracked />}
      </div>
    </div>
  );
}

// ─── Version 1E — Flexible Time Range ─────────────────────────────────────────

type V1eRange = "1M" | "3M" | "6M" | "12M";

type V1eBar = { label: string; actual: number; projected: number; isCurrent?: boolean };

const v1e3mBars: V1eBar[] = [
  { label: "May", actual: 53700, projected: 0 },
  { label: "Jun", actual: 32000, projected: 20147, isCurrent: true },
  { label: "Jul", actual: 0,     projected: 57500 },
];
const v1e6mBars: V1eBar[] = [
  { label: "Mar", actual: 49800, projected: 0 },
  { label: "Apr", actual: 56200, projected: 0 },
  { label: "May", actual: 53700, projected: 0 },
  { label: "Jun", actual: 32000, projected: 20147, isCurrent: true },
  { label: "Jul", actual: 0,     projected: 58200 },
  { label: "Aug", actual: 0,     projected: 55800 },
];
const v1e12mBars: V1eBar[] = [
  { label: "Jul '25", actual: 48300, projected: 0 },
  { label: "Aug '25", actual: 51200, projected: 0 },
  { label: "Sep '25", actual: 49800, projected: 0 },
  { label: "Oct '25", actual: 52100, projected: 0 },
  { label: "Nov '25", actual: 50900, projected: 0 },
  { label: "Dec '25", actual: 55600, projected: 0 },
  { label: "Jan '26", actual: 52400, projected: 0 },
  { label: "Feb '26", actual: 54100, projected: 0 },
  { label: "Mar '26", actual: 49800, projected: 0 },
  { label: "Apr '26", actual: 56200, projected: 0 },
  { label: "May '26", actual: 53700, projected: 0 },
  { label: "Jun '26", actual: 32000, projected: 20147, isCurrent: true },
];

const v1e3mYoY  = [{ label:"May", yoy:44200 }, { label:"Jun", yoy:46800 }, { label:"Jul", yoy:48100 }];
const v1e6mYoY  = [
  { label:"Mar", yoy:41200 }, { label:"Apr", yoy:45800 }, { label:"May", yoy:44200 },
  { label:"Jun", yoy:46800 }, { label:"Jul", yoy:48100 }, { label:"Aug", yoy:46400 },
];
const v1e12mYoY = [
  { label:"Jul '25", yoy:42100 }, { label:"Aug '25", yoy:44800 }, { label:"Sep '25", yoy:43200 },
  { label:"Oct '25", yoy:45300 }, { label:"Nov '25", yoy:43900 }, { label:"Dec '25", yoy:48200 },
  { label:"Jan '26", yoy:45600 }, { label:"Feb '26", yoy:47200 }, { label:"Mar '26", yoy:43400 },
  { label:"Apr '26", yoy:48900 }, { label:"May '26", yoy:46700 }, { label:"Jun '26", yoy:43100 },
];

// Segment definitions — the same three lenses V1c offers, reused across ranges.
type V1eSeg = "source" | "channel" | "type";

const v1eChannelSeg = [
  { key: "Wise",     label: "Wise",     color: "#0ea5a0", ratio: 0.46 },
  { key: "Payoneer", label: "Payoneer", color: "#f59e0b", ratio: 0.32 },
  { key: "Deel",     label: "Deel",     color: "#7c3aed", ratio: 0.18 },
  { key: "Export",   label: "Export",   color: "#8a8fa8", ratio: 0.04 },
] as const;

const v1eEarningSeg = [
  { key: "hourly",  label: "Hourly pay",     color: "#0168dd", ratio: 0.46, group: "stable"   },
  { key: "fixed",   label: "Fixed pay",      color: "#0ea5a0", ratio: 0.27, group: "stable"   },
  { key: "bonuses", label: "Bonuses",        color: "#f59e0b", ratio: 0.14, group: "variable" },
  { key: "pto",     label: "PTO & Holidays", color: "#8b5cf6", ratio: 0.08, group: "variable" },
  { key: "adds",    label: "Additions",      color: "#f97316", ratio: 0.05, group: "variable" },
] as const;

// Split a total into segment buckets; last bucket absorbs rounding remainder.
function v1eSplit(total: number, seg: readonly { key: string; ratio: number }[]): Record<string, number> {
  const out: Record<string, number> = {};
  let acc = 0;
  seg.forEach((s, i) => {
    if (i === seg.length - 1) out[s.key] = Math.max(0, total - acc);
    else { const v = Math.round(total * s.ratio); out[s.key] = v; acc += v; }
  });
  return out;
}

const v1eWeekLabels: Record<string, string[]> = {
  Jan: ["Jan 1–7", "Jan 8–14", "Jan 15–21", "Jan 22–31"],
  Feb: ["Feb 1–7", "Feb 8–14", "Feb 15–21", "Feb 22–28"],
  Mar: ["Mar 2–8", "Mar 9–15", "Mar 16–22", "Mar 23–31"],
  Apr: ["Apr 1–7", "Apr 8–14", "Apr 15–21", "Apr 22–30"],
  May: ["May 5–11", "May 12–18", "May 19–25", "May 26–31"],
  Jun: ["Jun 2–8", "Jun 9–15", "Jun 16–22", "Jun 23–30"],
  Jul: ["Jul 1–7", "Jul 8–14", "Jul 15–21", "Jul 22–31"],
  Aug: ["Aug 1–7", "Aug 8–14", "Aug 15–21", "Aug 22–31"],
  Sep: ["Sep 1–7", "Sep 8–14", "Sep 15–21", "Sep 22–30"],
  Oct: ["Oct 1–7", "Oct 8–14", "Oct 15–21", "Oct 22–31"],
  Nov: ["Nov 1–7", "Nov 8–14", "Nov 15–21", "Nov 22–30"],
  Dec: ["Dec 1–7", "Dec 8–14", "Dec 15–21", "Dec 22–31"],
};

const v1eMonthNames: Record<string, string> = {
  Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June",
  Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December",
};
// Full "June 2026"-style label from a "Jun '26" bar label.
function v1eFullMonthLabel(barLabel: string): string {
  const key = barLabel.replace(/ '2[0-9]+$/, "");
  const ym = barLabel.match(/'(\d\d)$/);
  const year = ym ? `20${ym[1]}` : "2026";
  return `${v1eMonthNames[key] ?? key} ${year}`;
}

type V1eWeekRow = {
  week: string; dateLabel: string; total: number;
  paid: number; pending: number; failed: number; tracked: number; projected: number; factual: number;
  chFactual: number; Wise: number; Payoneer: number; Deel: number; Export: number;
  hourly: number; fixed: number; bonuses: number; pto: number; adds: number;
};

// June is the showcase month → use V1c's exact hand-tuned weekly data.
// Channel splits the forward (tracked+projected) portion by provider so every
// segmentation reconciles to the same weekly total; confirmed portion stays green.
const v1eJuneWeekRows: V1eWeekRow[] = v1cSourceData.map((s, i) => {
  const e  = v1cEarningTypeData[i];
  const total   = s.paid + s.pending + s.failed + s.tracked + s.projected;
  const factual = s.paid + s.pending + s.failed;
  const forward = s.tracked + s.projected;
  const ch = v1eSplit(forward, v1eChannelSeg);
  return {
    week: s.week, dateLabel: s.dateLabel, total,
    paid: s.paid, pending: s.pending, failed: s.failed, tracked: s.tracked, projected: s.projected,
    factual,
    chFactual: factual, Wise: ch.Wise, Payoneer: ch.Payoneer, Deel: ch.Deel, Export: ch.Export,
    hourly: e.hourly, fixed: e.fixed, bonuses: e.bonuses, pto: e.pto, adds: e.adds,
  };
});

// Any other month → derive weekly bars from its actual/projected totals.
function v1eBuildWeeks(monthKey: string, actual: number, projected: number): V1eWeekRow[] {
  if (monthKey === "Jun") return v1eJuneWeekRows;
  const shape = [0.22, 0.28, 0.22, 0.28];
  const total = actual + projected;
  const fullyPast   = projected === 0;
  const fullyFuture = actual === 0;
  const labels = v1eWeekLabels[monthKey] ?? ["Week 1", "Week 2", "Week 3", "Week 4"];
  return shape.map((f, i) => {
    const wt = Math.round(total * f);
    const kind: "paid" | "tracked" | "projected" =
      fullyPast ? "paid" : fullyFuture ? (i === 0 ? "tracked" : "projected") : i < 2 ? "paid" : i === 2 ? "tracked" : "projected";
    const ch = v1eSplit(wt, v1eChannelSeg);
    const er = v1eSplit(wt, v1eEarningSeg);
    const isConfirmed = kind === "paid";
    return {
      week: `Week ${i + 1}`, dateLabel: labels[i], total: wt,
      paid: kind === "paid" ? wt : 0, pending: 0, failed: 0,
      tracked: kind === "tracked" ? wt : 0, projected: kind === "projected" ? wt : 0,
      factual: kind === "paid" ? wt : 0,
      // channel: confirmed weeks show one green block; forward weeks split by provider (funding decision)
      chFactual: isConfirmed ? wt : 0,
      Wise: isConfirmed ? 0 : ch.Wise, Payoneer: isConfirmed ? 0 : ch.Payoneer,
      Deel: isConfirmed ? 0 : ch.Deel, Export: isConfirmed ? 0 : ch.Export,
      hourly: er.hourly, fixed: er.fixed, bonuses: er.bonuses, pto: er.pto, adds: er.adds,
    };
  });
}

const v1eRangeCfg: Record<V1eRange, {
  memberPct: number; seasonPct: number; periodLabel: string; todayBar: string;
  bars: V1eBar[]; yoy: { label: string; yoy: number }[];
}> = {
  "1M":  { memberPct: 18, seasonPct: 10, periodLabel: "June 2026",          todayBar: "",        bars: [], yoy: [] },
  "3M":  { memberPct: 14, seasonPct: 1,  periodLabel: "May – Jul 2026",      todayBar: "Jun",     bars: v1e3mBars, yoy: v1e3mYoY  },
  "6M":  { memberPct: 12, seasonPct: 0,  periodLabel: "Mar – Aug 2026",      todayBar: "Jun",     bars: v1e6mBars, yoy: v1e6mYoY  },
  "12M": { memberPct:  9, seasonPct: 0,  periodLabel: "Jul 2025 – Jun 2026", todayBar: "Jun '26", bars: v1e12mBars, yoy: v1e12mYoY },
};

function V1ePredictivePanel({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [range, setRange]           = useState<V1eRange>("1M");
  const [showYoY, setShowYoY]       = useState(false);
  const [drillMonth, setDrillMonth] = useState<string | null>(null);
  const [segTab, setSegTab]         = useState<V1eSeg>("source");
  const [oneMonth, setOneMonth]     = useState<string>("Jun '26"); // selected month for the 1M view
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustment[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAdj, setEditingAdj] = useState<ManualAdjustment | null>(null);

  const cfg  = v1eRangeCfg[range];
  const is1M = range === "1M";
  const isWeekly = is1M || !!drillMonth;

  // Adjustments (range-aware) + manual — mirrors V1c's summary math.
  const memberPct = cfg.memberPct;
  const seasonPct = is1M ? (seasonalityOn ? cfg.seasonPct : 0) : cfg.seasonPct;
  const memberAmt = Math.round(v1AvgMonthly * memberPct / 100);
  const seasonAmt = Math.round(v1AvgMonthly * seasonPct / 100);
  const manualNet = manualAdjustments.reduce((s, a) => s + (a.type === "add" ? a.dollars : -a.dollars), 0);
  const totalAboveBase = memberAmt + seasonAmt + manualNet;
  const adjProj = Math.max(0, Math.round(v1AvgMonthly + totalAboveBase));
  const adjPct = Math.round(totalAboveBase / v1AvgMonthly * 100);
  const adjPctC = Math.round(v1cConfirmed / adjProj * 100);
  const adjPctP = Math.round(v1cPlanned   / adjProj * 100);
  const projForDialog = editingAdj
    ? adjProj - (editingAdj.type === "add" ? editingAdj.dollars : -editingAdj.dollars)
    : adjProj;
  const windowMonths = is1M ? null : parseInt(range);
  const windowTotal  = windowMonths ? adjProj * windowMonths : null;

  const memberNote = range === "12M" ? "growth over last 12 months" : `${v1CurrMembers} this cycle vs avg ${v1AvgMembers}`;

  // Monthly rows — every month split by channel + earning; confidence fades on projections.
  let futureStep = 0;
  const monthlyRows = cfg.bars.map((b, i) => {
    const total = b.actual + b.projected;
    const isFut = b.actual === 0 && b.projected > 0;
    const isCur = !!b.isCurrent;
    let projOpacity = 1;
    if (isCur || isFut) { projOpacity = [0.9, 0.75, 0.62, 0.52][Math.min(futureStep, 3)]; futureStep += 1; }
    return {
      ...b, total, yoy: cfg.yoy[i]?.yoy ?? 0,
      isFut, isCur, projOpacity, barOpacity: isFut ? projOpacity : 1,
      ...v1eSplit(total, v1eChannelSeg),
      ...v1eSplit(total, v1eEarningSeg),
    };
  });

  // Which month drives the weekly view: a drilled month, else the 1M picker selection.
  const activeWeekLabel = drillMonth ?? (is1M ? oneMonth : null);
  const weekMonthKey = activeWeekLabel ? activeWeekLabel.replace(/ '2[0-9]+$/, "") : "Jun";
  const weekBar = activeWeekLabel
    ? (cfg.bars.find(b => b.label === activeWeekLabel) ?? v1e12mBars.find(b => b.label === activeWeekLabel))
    : undefined;
  const weekRows: V1eWeekRow[] = activeWeekLabel
    ? v1eBuildWeeks(weekMonthKey, weekBar?.actual ?? 0, weekBar?.projected ?? 0)
    : v1eJuneWeekRows;
  const weekMonthIsCurrent = weekMonthKey === "Jun";

  // 1M month stepper helpers (steps through the trailing-12-months list).
  const oneMonthIdx = v1e12mBars.findIndex(b => b.label === oneMonth);
  const stepMonth = (dir: -1 | 1) => {
    const next = oneMonthIdx + dir;
    if (next >= 0 && next < v1e12mBars.length) setOneMonth(v1e12mBars[next].label);
  };

  type SegBar = { key: string; label: string; color: string };
  const weekSegBars: SegBar[] =
    segTab === "source"
      ? (showStatusBreakdown
          ? [
              { key: "paid",      label: "Paid",      color: "#10b981" },
              { key: "pending",   label: "Pending",   color: "#f59e0b" },
              { key: "failed",    label: "Failed",    color: "#ef4444" },
              { key: "tracked",   label: "Planned",   color: "#0168dd" },
              { key: "projected", label: "Projected", color: "#85baf5" },
            ]
          : [
              { key: "factual",   label: "Confirmed", color: "#10b981" },
              { key: "tracked",   label: "Planned",   color: "#0168dd" },
              { key: "projected", label: "Projected", color: "#85baf5" },
            ])
      : segTab === "channel"
      ? [{ key: "chFactual", label: "Confirmed", color: "#10b981" }, ...v1eChannelSeg.map(s => ({ key: s.key, label: s.label, color: s.color }))]
      : v1eEarningSeg.map(s => ({ key: s.key, label: s.label, color: s.color }));

  const monthSegBars: SegBar[] =
    segTab === "source"
      ? [{ key: "actual", label: "Actuals", color: "#10b981" }, { key: "projected", label: "Projected", color: "#85baf5" }]
      : segTab === "channel"
      ? v1eChannelSeg.map(s => ({ key: s.key, label: s.label, color: s.color }))
      : v1eEarningSeg.map(s => ({ key: s.key, label: s.label, color: s.color }));

  const activeSegBars = isWeekly ? weekSegBars : monthSegBars;

  const renderTip = (segBars: SegBar[]) => ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    const header = d.dateLabel ?? label;
    const items = segBars.map(sb => ({ ...sb, value: (d[sb.key] ?? 0) as number })).filter(i => i.value > 0);
    const total = items.reduce((s, i) => s + i.value, 0);
    return (
      <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs min-w-[170px]">
        <p className="font-semibold text-[#1a1e35] mb-1.5">{header}</p>
        {items.map(i => (
          <div key={i.key} className="flex justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: i.color }} /><span className="text-[#8a8fa8]">{i.label}</span></span>
            <span className="font-medium text-[#1a1e35]">{fmt0(i.value)}</span>
          </div>
        ))}
        {items.length > 1 && (
          <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e8eaf0]">
            <span className="text-[#8a8fa8]">Total</span>
            <span className="font-semibold text-[#1a1e35]">{fmt0(total)}</span>
          </div>
        )}
      </div>
    );
  };

  const chartCaption = isWeekly
    ? (segTab === "source"  ? `${drillMonth ?? "June"} · actuals vs projected, week by week`
     : segTab === "channel" ? `${drillMonth ?? "June"} · by payment provider, week by week`
     :                        `${drillMonth ?? "June"} · by earning type, week by week`)
    : (segTab === "source"  ? "Monthly actuals vs projected · click a bar for its weekly breakdown"
     : segTab === "channel" ? "Monthly totals by payment provider · click a bar for its weekly breakdown"
     :                        "Monthly totals by earning type · click a bar for its weekly breakdown");

  const chevLeft  = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
  const chevRight = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

  return (
    <>
      {/* ── Top 3-column summary (matches Version 1D) ────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-[#e8eaf0] border-b border-[#e8eaf0]">
        {/* Card 1 — base */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Monthly avg payout</p>
          <p className="text-3xl font-bold text-[#1a1e35] tracking-tight">{fmt0(v1AvgMonthly)}</p>
          <p className="text-[11px] text-[#8a8fa8] mt-0.5">trailing {is1M ? "5" : "12"} months</p>
          <div className="flex items-center gap-x-2 gap-y-1 mt-2 flex-wrap text-[10px] text-[#8a8fa8]">
            <div className="flex items-center gap-1 border-r border-[#e8eaf0] pr-2 mr-1">
              <UserCircle2 size={13} className="text-[#1a1e35]" /><span className="font-semibold text-[#1a1e35]">{v1CurrMembers}</span>
            </div>
            {v1PayTypes.map((pt, i) => (
              <div key={pt.key} className="flex items-center gap-1">
                {i > 0 && <span className="text-[#c8cad4]">·</span>}
                <span className="font-semibold text-[#1a1e35]">{pt.count}</span><span>{pt.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 — adjustments */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">Adjustments</p>
            <button onClick={() => { setEditingAdj(null); setShowAddDialog(true); }}
              className="flex items-center gap-0.5 text-[10px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2 py-0.5 hover:bg-[#0168dd]/5 transition-colors select-none">
              <Plus size={10} /> Add adjustment
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${adjPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>{adjPct >= 0 ? "+" : ""}{adjPct}%</span>
            {adjPct >= 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-400" />}
          </div>
          <div className="mt-2 divide-y divide-[#f0f1f5]">
            {([
              { label: "Member change", pct: memberPct, note: memberNote, positive: true },
              { label: "Seasonality",   pct: seasonPct, note: "May is typically above avg.", positive: true },
            ] as const).map(({ label, pct, note, positive }) => {
              if (label === "Seasonality" && seasonPct === 0) return null;
              return (
                <div key={label} className="flex items-center gap-1.5 text-[11px] py-1.5 min-w-0">
                  <span className={`font-semibold flex-shrink-0 ${positive ? "text-emerald-600" : "text-red-500"}`}>{positive ? "+" : ""}{pct}%</span>
                  <span className="text-[#1a1e35] font-medium flex-shrink-0">{label}</span>
                  <span className="text-[#d0d3de] flex-shrink-0">—</span>
                  <span className="text-[#8a8fa8] truncate">{note}</span>
                </div>
              );
            })}
            {manualAdjustments.map(adj => (
              <div key={adj.id} className="flex items-center gap-1.5 text-[11px] py-1.5 min-w-0">
                <span className={`font-semibold flex-shrink-0 ${adj.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{adj.type === "add" ? "+" : "−"}{adj.unit === "pct" ? `${adj.value}%` : `≈${Math.round(adj.pct)}%`}</span>
                <span className="text-[#1a1e35] font-medium flex-shrink-0">{adj.label}</span>
                <span className="text-[#d0d3de] flex-shrink-0">—</span>
                <span className="text-[#8a8fa8] flex-shrink-0">{adj.unit === "dollar" ? fmt0(Math.round(adj.dollars)) : `≈${fmt0(Math.round(adj.dollars))}`}</span>
                <span className="text-[9px] font-medium bg-[#f0f1f5] text-[#8a8fa8] rounded px-1.5 py-0.5 flex-shrink-0">Added by you</span>
                <button onClick={() => { setEditingAdj(adj); setShowAddDialog(true); }} className="ml-auto flex-shrink-0 p-0.5 rounded text-[#8a8fa8] hover:text-[#0168dd] hover:bg-[#f0f1f5] transition-colors"><Pencil size={11} /></button>
                <button onClick={() => setManualAdjustments(prev => prev.filter(a => a.id !== adj.id))} className="flex-shrink-0 p-0.5 rounded text-[#8a8fa8] hover:text-red-500 hover:bg-red-50 transition-colors"><X size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 — projection */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Recommended projection</p>
          <p className="text-3xl font-bold text-[#0168dd] tracking-tight">{fmt0(adjProj)}</p>
          <V1cBreakdownPopover />
          <div className="relative group mt-3 cursor-default">
            <div className="h-2 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div className="h-full bg-emerald-500" style={{ width: `${adjPctC}%` }} />
                <div className="h-full bg-[#0168dd]" style={{ width: `${Math.max(adjPctP, 0.6)}%` }} />
                <div className="h-full flex-1 bg-[#85baf5]" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-[#8a8fa8] mt-0.5">
              <span>{fmt0(v1AvgMonthly)} avg</span>
              <span>{fmt0(adjProj)} total</span>
            </div>
            <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-20 pointer-events-none">
              <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 w-48">
                {v1cBarHoverRows.map(({ label, color, value, pct }) => {
                  const k = value / 1000;
                  const fmtK = `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
                  return (
                    <div key={label} className="flex items-center justify-between text-[11px] font-semibold mb-1 last:mb-0 text-[#8a8fa8]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                        <span>{label}</span>
                      </div>
                      <span>{fmtK} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {windowTotal && (
            <p className="text-[10px] mt-2">
              <span className="font-medium text-[#1a1e35]">{fmt0(windowTotal)}</span>
              <span className="text-[#8a8fa8]"> {range.toLowerCase()} total · </span>
              <span className="text-[9px] text-[#c0c3d3]">for planning</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Chart controls ───────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-0">
        {/* Row 1 — distribution title (left) + segmentation tabs (right, segmented-pill style) */}
        <div className="flex items-start justify-between mb-3 gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-0.5">
              {isWeekly ? "Week-by-week distribution" : "Month-by-month distribution"}
            </p>
            <p className="text-[11px] text-[#8a8fa8]">{chartCaption}</p>
          </div>
          <div className="flex items-center bg-[#f0f1f5] rounded-md p-0.5 flex-shrink-0">
            {([["source","By source of prediction"],["channel","By cash flow channel"],["type","By earning type"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setSegTab(id)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${segTab === id ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2 — time-range selector + period stepper (left) + YoY toggle (right) */}
        <div className="flex items-center justify-between flex-wrap gap-2 my-4">
          <div className="flex items-center gap-3">
            {/* Range selector — plain-button style */}
            <div className="flex items-center gap-1">
              {(["1M","3M","6M","12M"] as V1eRange[]).map(r => (
                <button key={r} onClick={() => { setRange(r); setDrillMonth(null); setMonthPickerOpen(false); if (r !== "12M") setShowYoY(false); }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${range === r ? "bg-[#eef3ff] text-[#0168dd]" : "text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5]"}`}>
                  {r}
                </button>
              ))}
            </div>
            {/* Period stepper — month is a picker in 1M view */}
            <div className="relative flex items-center gap-1 text-[11px]">
              <button
                onClick={() => { if (is1M && !drillMonth) stepMonth(-1); }}
                disabled={is1M && !drillMonth && oneMonthIdx <= 0}
                className="p-0.5 rounded text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors disabled:opacity-30 disabled:hover:bg-transparent">{chevLeft}</button>
              {drillMonth ? (
                <span className="font-medium text-[#1a1e35] min-w-[140px] text-center">{drillMonth} — weekly</span>
              ) : is1M ? (
                <button onClick={() => setMonthPickerOpen(o => !o)}
                  className="font-medium text-[#1a1e35] min-w-[140px] text-center hover:bg-[#f0f1f5] rounded px-2 py-0.5 flex items-center justify-center gap-1 transition-colors">
                  {v1eFullMonthLabel(oneMonth)}
                  <ChevronDown size={11} className={`text-[#8a8fa8] transition-transform ${monthPickerOpen ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <span className="font-medium text-[#1a1e35] min-w-[140px] text-center">{cfg.periodLabel}</span>
              )}
              <button
                onClick={() => { if (is1M && !drillMonth) stepMonth(1); }}
                disabled={is1M && !drillMonth && oneMonthIdx >= v1e12mBars.length - 1}
                className="p-0.5 rounded text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors disabled:opacity-30 disabled:hover:bg-transparent">{chevRight}</button>

              {monthPickerOpen && is1M && !drillMonth && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMonthPickerOpen(false)} />
                  <div className="absolute top-8 left-7 z-30 bg-white rounded-lg border border-[#e8eaf0] shadow-xl py-1 w-40 max-h-56 overflow-y-auto">
                    {v1e12mBars.map(b => (
                      <button key={b.label} onClick={() => { setOneMonth(b.label); setMonthPickerOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${b.label === oneMonth ? "bg-[#eef3ff] text-[#0168dd] font-medium" : "text-[#1a1e35] hover:bg-[#f5f6fa]"}`}>
                        {v1eFullMonthLabel(b.label)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {/* YoY toggle — only relevant with a full 12 months of history */}
          {range === "12M" && (
            <button onClick={() => setShowYoY(p => !p)} className="flex items-center gap-1.5 text-[10px] select-none cursor-pointer">
              <span className={`relative w-6 h-3.5 rounded-full transition-colors flex-shrink-0 ${showYoY ? "bg-[#0168dd]" : "bg-[#c8cad4]"}`}>
                <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform ${showYoY ? "translate-x-2.5" : "translate-x-0.5"}`} />
              </span>
              <span className="text-[#8a8fa8]">vs last year</span>
            </button>
          )}
        </div>

        {/* Breadcrumb */}
        {drillMonth && (
          <button onClick={() => setDrillMonth(null)}
            className="mt-2 flex items-center gap-1 text-[10px] text-[#0168dd] hover:underline">
            {chevLeft} Back to {range} view
          </button>
        )}
      </div>

      {/* ── Alert banner — only when status breakdown is on ──────────────── */}
      {showStatusBreakdown && (
        <div className="px-5 pt-1">
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-[11px]">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
              3 payments pending · $3.6k from Weeks 1–2 still need processing
            </div>
            <button className="text-[11px] text-[#0168dd] font-semibold flex-shrink-0 hover:underline flex items-center gap-0.5">Review <ChevronRight size={11} /></button>
          </div>
        </div>
      )}

      {/* ── Chart ────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-4">
        {isWeekly ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekRows} barCategoryGap="30%" margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#f0f1f5" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 9, fill: "#8a8fa8" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#8a8fa8" }} tickFormatter={(v: number) => `$${Math.round(v/1000)}k`} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={renderTip(weekSegBars)} cursor={{ fill: "#f5f6fa" }} />
              {weekMonthIsCurrent && (
                <ReferenceLine x={weekRows[1]?.dateLabel} stroke="#0168dd" strokeDasharray="3 3"
                  label={{ value: "Today", position: "insideTopRight", fontSize: 8, fill: "#0168dd" }} />
              )}
              {weekSegBars.map((sb, idx) => (
                <Bar key={sb.key} dataKey={sb.key} stackId="w" fill={sb.color} name={sb.label}
                  radius={idx === weekSegBars.length - 1 ? [3, 3, 0, 0] : undefined} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={monthlyRows} barCategoryGap="28%" margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#f0f1f5" />
              <XAxis dataKey="label" tick={{ fontSize: range === "12M" ? 9 : 10, fill: "#8a8fa8" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#8a8fa8" }} tickFormatter={(v: number) => `$${Math.round(v/1000)}k`} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={renderTip(monthSegBars)} cursor={{ fill: "#f5f6fa" }} />
              <ReferenceLine x={cfg.todayBar} stroke="#0168dd" strokeDasharray="3 3"
                label={{ value: "Today", position: "top", fontSize: 8, fill: "#0168dd" }} />
              {monthSegBars.map((sb, idx) => (
                <Bar key={sb.key} dataKey={sb.key} stackId="m" fill={sb.color} name={sb.label}
                  radius={idx === monthSegBars.length - 1 ? [3, 3, 0, 0] : undefined}
                  cursor="pointer" onClick={(d: any) => d?.label && setDrillMonth(d.label)}>
                  {monthlyRows.map((row, ri) => (
                    <Cell key={ri}
                      fillOpacity={segTab === "source" ? (sb.key === "projected" ? row.projOpacity : 1) : row.barOpacity} />
                  ))}
                </Bar>
              ))}
              {showYoY && range === "12M" && (
                <Line dataKey="yoy" stroke="#c0c3d3" strokeWidth={1.5} strokeDasharray="4 2"
                  dot={{ r: 2, fill: "#c0c3d3", strokeWidth: 0 }} name="Last year" isAnimationActive={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        <div className="flex items-center gap-x-3 gap-y-1 mt-1.5 flex-wrap">
          {activeSegBars.map(sb => (
            <span key={sb.key} className="flex items-center gap-1 text-[10px] text-[#8a8fa8]">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: sb.color }} />
              {sb.label}
            </span>
          ))}
          {showYoY && !isWeekly && range === "12M" && (
            <span className="flex items-center gap-1 text-[10px] text-[#8a8fa8]">
              <span className="inline-block w-4 border-t border-dashed border-[#c0c3d3]" />
              Last year
            </span>
          )}
          {!isWeekly && (range === "6M" || range === "12M") && (
            <span className="text-[9px] text-[#c0c3d3] italic ml-auto">Confidence fades on projected months</span>
          )}
        </div>
      </div>

      <AddAdjustmentDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={adj => {
          if (editingAdj) {
            setManualAdjustments(prev => prev.map(a => a.id === adj.id ? adj : a));
          } else {
            setManualAdjustments(prev => [...prev, adj]);
          }
        }}
        base={v1AvgMonthly}
        currentProjection={projForDialog}
        initial={editingAdj ?? undefined}
      />
    </>
  );
}

function Version1E({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8eaf0] bg-[#f9f9fc]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1a1e35]">Predictable Cash Flow</span>
            <span className="text-xs text-[#8a8fa8]">— based on historical payments</span>
          </div>
          <ExportDropdown />
        </div>
        <V1ePredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />
      </div>
      <FundYourAccountsPanel />
      <div>
        <p className="text-base font-semibold text-[#1a1e35] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e8eaf0]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1FutureTracked />}
      </div>
    </div>
  );
}

// ─── V2 ────────────────────────────────────────────────────────────────────────

function V2StatusBadge({ status }: { status: string }) {
  const s: Record<string,string> = { Projected:"bg-amber-100 text-amber-700", Draft:"bg-[#f0f1f5] text-[#8a8fa8]", Paid:"bg-emerald-100 text-emerald-700", Exported:"bg-blue-100 text-blue-700" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s[status] ?? s.Draft}`}>{status}</span>;
}

function V2ProviderChip({ name }: { name: string }) {
  const color = v2ProviderColors[name] ?? "#8a8fa8";
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded border" style={{ color, borderColor: color+"44", background: color+"11" }}>{name}</span>;
}

const itemStatusStyle: Record<string, { bg: string; text: string; border?: string; dashed?: boolean }> = {
  Confirmed: { bg: "#d1fae5", text: "#065f46" },
  Planned:   { bg: "#e8f2fd", text: "#0168dd" },
  Projected: { bg: "#f5f3ff", text: "#85baf5", border: "#bfdbfe", dashed: true },
};

function ItemStatusBadge({ status }: { status: "Confirmed" | "Planned" | "Projected" }) {
  const s = itemStatusStyle[status];
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.text, border: s.border ? `1px ${s.dashed ? "dashed" : "solid"} ${s.border}` : undefined }}>
      {status}
    </span>
  );
}

function MembersTable({ cycle }: { cycle: typeof v2Cycles[0] }) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (name: string) => setExpanded(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  return (
    <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#e8eaf0]">
        <span className="text-xs font-semibold text-[#1a1e35]">Members <span className="text-[#8a8fa8] font-normal">— {cycle.members} total, {v2WeeklyMembers.length} shown</span></span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#8a8fa8]">
            <span>GROUP BY</span>
            <button className="flex items-center gap-1 border border-[#e8eaf0] rounded px-2 py-1 text-[#1a1e35] hover:bg-[#f5f6fa] transition-colors">Members <ChevronDown size={11} /></button>
          </div>
          <button className="border border-[#e8eaf0] rounded p-1 text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f5f6fa] transition-colors"><Settings size={13} /></button>
          <button className="text-xs text-[#0168dd] flex items-center gap-1 hover:opacity-80"><Download size={12} /> Export</button>
        </div>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#e8eaf0] bg-[#f9f9fc]">
            <th className="py-2.5 px-5 text-left font-semibold text-[#8a8fa8] w-[40%]">Members</th>
            <th className="py-2.5 px-4 text-left font-semibold text-[#8a8fa8]">Hours</th>
            <th className="py-2.5 px-4 text-left font-semibold text-[#8a8fa8]">Pay rate</th>
            <th className="py-2.5 px-4 text-left font-semibold text-[#8a8fa8]">Status</th>
            <th className="py-2.5 px-5 text-right font-semibold text-[#8a8fa8]">Total amount</th>
          </tr>
        </thead>
        <tbody>
          {v2WeeklyMembers.map((m) => {
            const isOpen = expanded.includes(m.name);
            return (
              <tbody key={m.name}>
                <tr className="border-b border-[#e8eaf0] cursor-pointer hover:bg-[#f9f9fc] transition-colors" onClick={() => toggle(m.name)}>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <ChevronRight size={14} className={`text-[#8a8fa8] transition-transform flex-shrink-0 ${isOpen ? "rotate-90" : ""}`} />
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: m.color }}>{m.avatar}</div>
                      <div><p className="font-semibold text-[#1a1e35]">{m.name}</p><p className="text-[10px] text-[#8a8fa8]">{m.email}</p></div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#8a8fa8]">—</td>
                  <td className="py-3 px-4 text-[#8a8fa8]">—</td>
                  <td className="py-3 px-4">
                    {m.items.some(i => i.status === "Projected") ? <ItemStatusBadge status="Projected" /> : m.items.some(i => i.status === "Planned") ? <ItemStatusBadge status="Planned" /> : <ItemStatusBadge status="Confirmed" />}
                  </td>
                  <td className="py-3 px-5 text-right font-semibold text-[#1a1e35]">{fmt2(m.total)}</td>
                </tr>
                {isOpen && m.items.map((item, idx) => (
                  <tr key={idx} className={`border-b border-[#e8eaf0] ${item.status === "Projected" ? "bg-[#f0f7ff]" : "bg-white"} hover:bg-[#f9f9fc] transition-colors`}>
                    <td className="py-2.5 px-5 pl-14"><p className="font-medium text-[#1a1e35]">{item.label}</p><p className="text-[10px] text-[#8a8fa8]">{item.sub}</p></td>
                    <td className="py-2.5 px-4 text-[#1a1e35]">{item.hours}</td>
                    <td className="py-2.5 px-4 text-[#8a8fa8]">{item.rate}</td>
                    <td className="py-2.5 px-4"><ItemStatusBadge status={item.status} /></td>
                    <td className={`py-2.5 px-5 text-right font-medium ${item.status === "Projected" ? "text-[#85baf5]" : item.status === "Planned" ? "text-[#0168dd]" : "text-[#1a1e35]"}`}>
                      {item.status === "Projected" ? "~" : ""}{fmt2(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            );
          })}
          <tbody>
            <tr className="border-t border-dashed border-[#e8eaf0] bg-[#f9f9fc]">
              <td colSpan={5} className="py-2.5 px-5 text-[11px] text-[#8a8fa8]">
                + {cycle.members - v2WeeklyMembers.length} more members · <span className="text-[#0168dd] cursor-pointer hover:underline">View all</span>
              </td>
            </tr>
          </tbody>
        </tbody>
      </table>
    </div>
  );
}

function V2DetailView({ cycleId, onBack }: { cycleId: string; onBack: () => void }) {
  const cycle = v2Cycles.find(c => c.id === cycleId)!;
  const cb = cycle.confirmedBreak;
  const pl = cycle.plannedBreak;
  const pb = cycle.projectedBreak;
  const [buffer, setBuffer] = useState(0);
  const [bufferNote, setBufferNote] = useState("");
  const totalWithBuffer = cycle.total + buffer;
  const confirmedPct = Math.round((cycle.confirmed / totalWithBuffer) * 100);
  const plannedPct   = Math.round((cycle.planned   / totalWithBuffer) * 100);
  const projectedPct = 100 - confirmedPct - plannedPct;
  const provColor = v2ProviderColors[cycle.provider] ?? "#8a8fa8";
  const wiseBalance = 8240;
  const wiseRequired = totalWithBuffer;
  const wiseDiff = wiseBalance - wiseRequired;
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#8a8fa8] hover:text-[#1a1e35] transition-colors"><ArrowLeft size={14} /> Back</button>
          <div className="w-px h-4 bg-[#e8eaf0]" />
          <span className="text-base font-semibold text-[#1a1e35]">{cycle.id}</span>
          <button className="text-[#8a8fa8] hover:text-[#1a1e35]"><Pencil size={13} /></button>
          <V2StatusBadge status="Projected" />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs border border-[#e8eaf0] rounded px-3 py-1.5 text-[#1a1e35] hover:bg-[#f5f6fa] transition-colors"><Download size={12} /> Export payment</button>
          <button className="flex items-center gap-1.5 text-xs bg-[#0168dd] text-white rounded px-3 py-1.5 hover:bg-[#0057bb] transition-colors"><Send size={12} /> Schedule</button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#e8eaf0] px-5 py-4 flex items-center gap-5">
        <div className="flex-shrink-0 min-w-[140px]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">Total projected</p>
          <p className="text-3xl font-bold text-[#1a1e35] tracking-tight mt-0.5">{fmt2(totalWithBuffer)}</p>
          {buffer > 0 && <p className="text-[10px] text-[#8a8fa8] mt-0.5">incl. {fmt2(buffer)} buffer</p>}
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-[10px] mb-1.5">
            <span className="text-emerald-600 font-semibold">Confirmed {fmt2(cycle.confirmed)} ({confirmedPct}%)</span>
            <span className="text-[#0168dd] font-semibold">Planned {fmt2(cycle.planned)} ({plannedPct}%)</span>
            <span className="text-[#85baf5]">~Projected {fmt2(cycle.projected + buffer)} ({projectedPct}%)</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500" style={{ width: `${confirmedPct}%` }} />
            <div className="h-full bg-[#0168dd]" style={{ width: `${plannedPct}%` }} />
            <div className="h-full flex-1" style={{ background: "repeating-linear-gradient(90deg,#85baf5 0px,#85baf5 5px,#bfdbfe 5px,#bfdbfe 9px)" }} />
          </div>
        </div>
        <div className="flex-shrink-0 border-l border-[#e8eaf0] pl-5">
          <p className="text-lg font-bold mb-1" style={{ color: provColor }}>{cycle.provider}</p>
          <div className="space-y-0.5 text-[11px] text-[#8a8fa8]">
            <div className="flex items-center gap-1"><CalendarDays size={11} />{cycle.dateRange}</div>
            <div className="flex items-center gap-1"><Users size={11} />{cycle.members} members · {cycle.cycle}</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e8eaf0]">
          <p className="text-sm font-semibold text-[#1a1e35]">Payment breakdown</p>
          <p className="text-[11px] text-[#8a8fa8] mt-0.5">What makes up this payment and how certain each part is</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-[#e8eaf0]">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Confirmed</span></div>
              <span className="text-base font-bold text-emerald-600">{fmt2(cycle.confirmed)}</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {cb.hourlyTracked > 0 && <div className="flex justify-between items-baseline"><span className="text-[#8a8fa8]">Hourly tracked</span><span className="font-semibold text-[#1a1e35]">{fmt2(cb.hourlyTracked)}</span></div>}
              {cb.overtime > 0 && <div className="flex justify-between items-baseline"><span className="text-[#8a8fa8]">Overtime</span><span className="font-semibold text-[#1a1e35]">{fmt2(cb.overtime)}</span></div>}
              {cb.pastPTO > 0 && <div className="flex justify-between items-baseline"><span className="text-[#8a8fa8]">Past PTO / Holidays</span><span className="font-semibold text-[#1a1e35]">{fmt2(cb.pastPTO)}</span></div>}
            </div>
            <p className="text-[10px] text-[#8a8fa8] mt-4 leading-relaxed">Hours tracked and approved — these amounts are final.</p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#0168dd]" /><span className="text-[10px] font-bold uppercase tracking-widest text-[#0168dd]">Planned</span></div>
              <span className="text-base font-bold text-[#0168dd]">{fmt2(cycle.planned)}</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {pl.fixedPay > 0 && <div className="flex justify-between items-baseline"><span className="text-[#8a8fa8]">Fixed pay</span><span className="font-semibold text-[#1a1e35]">{fmt2(pl.fixedPay)}</span></div>}
              {pl.futurePTO > 0 && <div className="flex justify-between items-baseline"><span className="text-[#8a8fa8]">PTO / Holidays (remaining)</span><span className="font-semibold text-[#1a1e35]">{fmt2(pl.futurePTO)}</span></div>}
              {pl.additions > 0 && <div className="flex justify-between items-baseline"><span className="text-[#8a8fa8]">Scheduled additions</span><span className="font-semibold text-[#1a1e35]">{fmt2(pl.additions)}</span></div>}
            </div>
            <p className="text-[10px] text-[#8a8fa8] mt-4 leading-relaxed">Committed — will be included unless cancelled.</p>
          </div>
          <div className="px-5 py-4 bg-[#f0f7ff]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-[#85baf5]" /><span className="text-[10px] font-bold uppercase tracking-widest text-[#8a8fa8]">Projected</span></div>
              <span className="text-base font-bold text-[#85baf5]">~{fmt2(cycle.projected + buffer)}</span>
            </div>
            <div className="space-y-2.5 text-xs mb-4">
              <div className="flex justify-between items-baseline"><span className="text-[#8a8fa8]">~Remaining hourly (est.)</span><span className="font-semibold text-[#85baf5]">~{fmt2(pb.hourly)}</span></div>
              <p className="text-[10px] text-[#8a8fa8]">Avg daily rate × {cycle.daysLeft} days remaining</p>
            </div>
            <div className="border-t border-dashed border-[#bfdbfe] pt-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">Add buffer</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-[#bfdbfe] rounded-md bg-white overflow-hidden flex-1">
                  <span className="px-2 text-xs text-[#8a8fa8] border-r border-[#bfdbfe] py-1.5">+$</span>
                  <input type="number" min={0} value={buffer || ""} onChange={e => setBuffer(Math.max(0, Number(e.target.value)))} placeholder="0" className="flex-1 px-2 py-1.5 text-xs text-[#1a1e35] outline-none bg-transparent w-0" />
                </div>
                {buffer > 0 && <button onClick={() => { setBuffer(0); setBufferNote(""); }} className="text-[10px] text-[#8a8fa8] hover:text-red-500 transition-colors">✕</button>}
              </div>
              <textarea value={bufferNote} onChange={e => setBufferNote(e.target.value)} placeholder="Reason for buffer (optional)…" rows={2} className="w-full text-xs border border-[#bfdbfe] rounded-md px-2.5 py-1.5 text-[#1a1e35] placeholder-[#93c5fd] outline-none resize-none bg-white focus:border-[#85baf5] transition-colors" />
              {buffer > 0 && <p className="text-[10px] text-[#85baf5]">Total projected bumped to {fmt2(cycle.projected + buffer)}</p>}
            </div>
            <p className="text-[10px] text-[#8a8fa8] mt-3 leading-relaxed">Estimate — updates as members track time.</p>
          </div>
        </div>
      </div>
      {cycle.provider === "Wise" && (
        <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[#e8eaf0]">
            <div className="w-5 h-5 rounded-full bg-[#0168dd] flex items-center justify-center"><span className="text-white text-[9px] font-bold">W</span></div>
            <span className="text-sm font-semibold text-[#1a1e35]">Wise Wallet</span>
            <span className="text-xs text-[#8a8fa8]">— current balance vs payment required</span>
          </div>
          <div className="px-5 py-4 flex items-center gap-8">
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Wallet balance</p><p className="text-2xl font-bold text-[#1a1e35]">{fmt2(wiseBalance)}</p></div>
            <div className="text-2xl text-[#e8eaf0]">→</div>
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Payment required</p><p className="text-2xl font-bold text-[#1a1e35]">{fmt2(wiseRequired)}</p></div>
            <div className="flex-1 border-l border-[#e8eaf0] pl-8">
              {wiseDiff >= 0 ? (
                <div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Surplus</p><p className="text-2xl font-bold text-emerald-600">+{fmt2(wiseDiff)}</p><p className="text-xs text-[#8a8fa8] mt-1">Wallet has sufficient funds</p></div>
              ) : (
                <div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Shortfall</p><p className="text-2xl font-bold text-red-500">−{fmt2(Math.abs(wiseDiff))}</p><p className="text-xs text-[#8a8fa8] mt-1">Additional funds needed before payment</p></div>
              )}
            </div>
            <div>
              {wiseDiff < 0 ? (
                <button className="flex items-center gap-2 bg-[#0168dd] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#0057bb] transition-colors"><span className="text-lg leading-none">+</span>Add {fmt2(Math.abs(wiseDiff))} to Wise</button>
              ) : (
                <button className="flex items-center gap-2 border border-[#e8eaf0] text-[#8a8fa8] text-sm px-4 py-2.5 rounded-lg hover:bg-[#f5f6fa] transition-colors">View wallet</button>
              )}
            </div>
          </div>
        </div>
      )}
      <MembersTable cycle={cycle} />
    </div>
  );
}

function V2FuturePaymentTab({ onView }: { onView: (id: string) => void }) {
  const confirmedPct = Math.round((v2TotalConfirmed / v2TotalAll) * 100);
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-xs text-[#8a8fa8] mb-1">Next payouts across all providers · Jun 2026</p>
            <p className="text-4xl font-bold text-[#1a1e35] tracking-tight">{fmt2(v2TotalAll)}</p>
            <p className="text-xs text-[#8a8fa8] mt-1">{v2Cycles.length} providers · one payout each</p>
          </div>
          <div className="flex items-center gap-6 ml-8">
            <div className="text-right"><p className="text-[10px] text-[#8a8fa8] uppercase tracking-widest">Confirmed</p><p className="text-xl font-bold text-[#1a1e35] mt-0.5">{fmt2(v2TotalConfirmed)}</p><p className="text-[10px] text-[#8a8fa8]">tracked &amp; guaranteed</p></div>
            <div className="text-right"><p className="text-[10px] text-[#8a8fa8] uppercase tracking-widest">Projected</p><p className="text-xl font-bold text-[#85baf5] mt-0.5">{fmt2(v2TotalProjected)}</p><p className="text-[10px] text-[#8a8fa8]">estimated remaining</p></div>
          </div>
        </div>
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-2 bg-[#f0f1f5] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#0168dd] rounded-l-full" style={{ width: `${confirmedPct}%` }} />
              <div className="h-full flex-1 rounded-r-full" style={{ background: "repeating-linear-gradient(90deg,#85baf5 0px,#85baf5 6px,#bfdbfe 6px,#bfdbfe 10px)" }} />
            </div>
            <span className="text-[10px] text-[#8a8fa8] flex-shrink-0">{confirmedPct}% confirmed</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_160px_200px_110px] gap-4 px-5 py-2.5 border-b border-[#e8eaf0] bg-[#f9f9fc]">
          {["Provider · next payout", "Cycle", "Members", "Confirmed → Projected", "Total"].map(h => (
            <p key={h} className={`text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] ${h === "Total" ? "text-right" : ""}`}>{h}</p>
          ))}
        </div>
        {v2Cycles.map((c, idx) => {
          const provColor = v2ProviderColors[c.provider] ?? "#8a8fa8";
          const cPct = Math.round((c.confirmed / c.total) * 100);
          return (
            <div key={c.id} onClick={() => onView(c.id)} className={`grid grid-cols-[1fr_100px_160px_200px_110px] gap-4 px-5 py-4 items-center cursor-pointer hover:bg-[#f9f9fc] transition-colors ${idx < v2Cycles.length - 1 ? "border-b border-[#e8eaf0]" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: provColor + "18" }}><div className="w-3 h-3 rounded-sm" style={{ background: provColor }} /></div>
                <div>
                  <div className="flex items-center gap-2"><span className="text-sm font-bold text-[#1a1e35]">{c.provider}</span><V2StatusBadge status="Projected" /></div>
                  <p className="text-xs text-[#8a8fa8] mt-0.5">{c.dateRange}</p>
                  <p className="text-[10px] text-amber-600">{c.daysLeft} days remaining · {c.pctTracked}% tracked</p>
                </div>
              </div>
              <div><span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.cycleColor + "18", color: c.cycleColor }}>{c.cycle}</span></div>
              <div className="flex items-center gap-1.5 text-xs text-[#1a1e35]"><Users size={12} className="text-[#8a8fa8]" /><span className="font-semibold">{c.members}</span><span className="text-[#8a8fa8]">members</span></div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px]"><span className="font-semibold text-[#1a1e35]">{fmt0(c.confirmed)}</span><span className="text-[#8a8fa8]">+</span><span className="font-semibold text-[#85baf5]">~{fmt0(c.projected)}</span></div>
                <div className="h-1.5 bg-[#f0f1f5] rounded-full overflow-hidden flex">
                  <div className="h-full rounded-l-full" style={{ width: `${cPct}%`, background: provColor }} />
                  <div className="h-full flex-1 rounded-r-full" style={{ background: "repeating-linear-gradient(90deg,#85baf5 0px,#85baf5 4px,#bfdbfe 4px,#bfdbfe 7px)" }} />
                </div>
              </div>
              <div className="text-right flex items-center justify-end gap-2"><p className="text-sm font-bold text-[#1a1e35]">{fmt2(c.total)}</p><ChevronRight size={14} className="text-[#8a8fa8]" /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function V2PaymentList({ rows, showPaidOn }: { rows: any[]; showPaidOn?: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#e8eaf0] bg-[#f9f9fc]">
            {["ID","Name","Date range","Members","Amount","Status",...(showPaidOn?["Paid on"]:[]),"Provider",""].map(h => (
              <th key={h} className="py-2.5 px-4 text-left font-semibold text-[#8a8fa8]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className={`hover:bg-[#f9f9fc] cursor-pointer ${i < rows.length - 1 ? "border-b border-[#e8eaf0]" : ""}`}>
              <td className="py-3 px-4 text-[#0168dd] font-medium">{row.id}</td>
              <td className="py-3 px-4 text-[#1a1e35] font-medium">{row.name}</td>
              <td className="py-3 px-4 text-[#8a8fa8]">{row.range}</td>
              <td className="py-3 px-4"><div className="flex items-center gap-1 text-[#8a8fa8]"><Users size={11} />{row.members}</div></td>
              <td className="py-3 px-4 font-semibold text-[#1a1e35]">{fmt2(row.amount)}</td>
              <td className="py-3 px-4"><V2StatusBadge status={row.status} /></td>
              {showPaidOn && <td className="py-3 px-4 text-[#8a8fa8]">{row.paidOn}</td>}
              <td className="py-3 px-4"><V2ProviderChip name={row.provider} /></td>
              <td className="py-3 px-4 text-[#8a8fa8]"><MoreHorizontal size={14} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Version2() {
  const [mainTab, setMainTab] = useState<"future"|"draft"|"history">("future");
  const [detailId, setDetailId] = useState<string|null>(null);
  const tabs = [
    { id: "future"  as const, label: "Future Payment",     count: v2Cycles.length },
    { id: "draft"   as const, label: "Currently in Draft", count: v2DraftPayments.length },
    { id: "history" as const, label: "Payment History",    count: null },
  ];
  return detailId ? (
    <V2DetailView cycleId={detailId} onBack={() => setDetailId(null)} />
  ) : (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#1a1e35]">Payments</h1>
        <button className="flex items-center gap-1.5 text-xs bg-[#0168dd] text-white rounded px-3 py-1.5 hover:bg-[#0057bb]"><Plus size={13} /> Create payment</button>
      </div>
      <div className="flex items-center gap-0 border-b border-[#e8eaf0] mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${mainTab === t.id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#8a8fa8] hover:text-[#1a1e35]"}`}>
            {t.label}
            {t.count !== null && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${mainTab === t.id ? "bg-[#e8f2fd] text-[#0168dd]" : "bg-[#f0f1f5] text-[#8a8fa8]"}`}>{t.count}</span>}
          </button>
        ))}
      </div>
      {mainTab === "future"  && <V2FuturePaymentTab onView={id => setDetailId(id)} />}
      {mainTab === "draft"   && <V2PaymentList rows={v2DraftPayments} />}
      {mainTab === "history" && <V2PaymentList rows={v2HistoryPayments} showPaidOn />}
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [version, setVersion] = useState<"v1"|"v1c"|"v1d"|"v1e"|"v2">("v1c");
  const [showStatusBreakdown, setShowStatusBreakdown] = useState(true);
  const [seasonalityOn, setSeasonalityOn] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden font-[Inter,sans-serif]">
      <Sidebar active={version} />
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f6fa]">
        <div className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-[#e8eaf0] flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-[#8a8fa8]">
            {(version === "v1" || version === "v1c" || version === "v1d" || version === "v1e") ? (
              <><span className="hover:text-[#0168dd] cursor-pointer">Reports</span><ChevronRight size={12} /><span className="text-[#1a1e35] font-medium">Payments report</span></>
            ) : (
              <><span className="hover:text-[#0168dd] cursor-pointer">Financials</span><ChevronRight size={12} /><span className="text-[#1a1e35] font-medium">Team Payments</span></>
            )}
          </div>
          <div className="flex items-center gap-3">
            {(version === "v1c" || version === "v1d" || version === "v1e") && (
              <div className="flex items-center gap-4 border-r border-[#e8eaf0] pr-4">
                {[
                  { label: "Status breakdown", val: showStatusBreakdown, set: setShowStatusBreakdown },
                  { label: "Seasonality",      val: seasonalityOn,       set: setSeasonalityOn       },
                ].map(({ label, val, set }) => (
                  <button key={label} onClick={() => set(p => !p)} className="flex items-center gap-1.5 text-[11px] text-[#8a8fa8] select-none">
                    <span className={`relative w-7 h-4 rounded-full transition-colors flex-shrink-0 inline-flex ${val ? "bg-[#0168dd]" : "bg-[#c8cad4]"}`}>
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${val ? "translate-x-3.5" : "translate-x-0.5"}`} />
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center bg-[#f0f1f5] rounded-lg p-0.5">
              <button onClick={() => setVersion("v1")}  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1"  ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>Version 1</button>
              <button onClick={() => setVersion("v1c")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1c" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>Version 1C</button>
              <button onClick={() => setVersion("v1d")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1d" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>Version 1D</button>
              <button onClick={() => setVersion("v1e")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1e" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>Version 1E</button>
              <button onClick={() => setVersion("v2")}  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v2"  ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>Version 2</button>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8a8fa8]"><Clock size={13} /><span>0:00:00</span></div>
          </div>
        </div>
        {version === "v1"  && <Version1  />}
        {version === "v1c" && <Version1C showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1d" && <Version1D showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1e" && <Version1E showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v2"  && <Version2  />}
      </div>
    </div>
  );
}
