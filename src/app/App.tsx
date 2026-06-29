import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
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

function Sidebar({ active }: { active: "v1" | "v1b" | "v1c" | "v2" }) {
  const topNav = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: ClipboardList,   label: "Timesheets" },
    { icon: Activity,        label: "Activity" },
    { icon: Lightbulb,       label: "Insights" },
    { icon: FolderKanban,    label: "Project management" },
    { icon: CalendarDays,    label: "Calendar" },
    { icon: BarChart2,       label: "Reports",  isActive: active === "v1" || active === "v1b" || active === "v1c" },
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

function ProviderLogo({ letter, color, size = 14 }: { letter: string; color: string; size?: number }) {
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
                        ? <ProviderLogo letter={provider.letter} color={color} size={14} />
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
                    <ProviderLogo letter={letter} color={color} size={12} />
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
  const [version, setVersion] = useState<"v1"|"v1b"|"v1c"|"v2">("v1b");
  const [showStatusBreakdown, setShowStatusBreakdown] = useState(true);
  const [seasonalityOn, setSeasonalityOn] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden font-[Inter,sans-serif]">
      <Sidebar active={version} />
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f6fa]">
        <div className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-[#e8eaf0] flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-[#8a8fa8]">
            {(version === "v1" || version === "v1b" || version === "v1c") ? (
              <><span className="hover:text-[#0168dd] cursor-pointer">Reports</span><ChevronRight size={12} /><span className="text-[#1a1e35] font-medium">Payments report</span></>
            ) : (
              <><span className="hover:text-[#0168dd] cursor-pointer">Financials</span><ChevronRight size={12} /><span className="text-[#1a1e35] font-medium">Team Payments</span></>
            )}
          </div>
          <div className="flex items-center gap-3">
            {version === "v1c" && (
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
              <button onClick={() => setVersion("v1b")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1b" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>Version 1B</button>
              <button onClick={() => setVersion("v1c")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1c" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>Version 1C</button>
              <button onClick={() => setVersion("v2")}  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v2"  ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>Version 2</button>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8a8fa8]"><Clock size={13} /><span>0:00:00</span></div>
          </div>
        </div>
        {version === "v1"  && <Version1  />}
        {version === "v1b" && <Version1B />}
        {version === "v1c" && <Version1C showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v2"  && <Version2  />}
      </div>
    </div>
  );
}
