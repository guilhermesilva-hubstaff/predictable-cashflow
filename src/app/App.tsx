import { useState, useEffect, useRef, Fragment, createContext, useContext, type ReactNode } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ComposedChart, ReferenceLine, LabelList,
} from "recharts";
import {
  ArrowLeft, ChevronDown, ChevronRight, Download, Send, Clock,
  Users, CalendarDays, Pencil, LayoutDashboard, ClipboardList,
  Activity, Lightbulb, FolderKanban, BarChart2, UserCircle2,
  Settings, Wallet, MonitorSmartphone, Plus, TrendingUp,
  TrendingDown, MoreHorizontal, Columns, Columns3, X,
  Banknote, Gift, Umbrella, Minus, AlertTriangle, SlidersHorizontal, Info,
  FileSpreadsheet, Filter, ListFilter, ExternalLink, Lock, ArrowDown,
  ArrowRight, Eye, Sparkles, Play, Film, PlayCircle,
} from "lucide-react";
// Hubstaff shell chrome (topbar, sidebar, design annotations, dev mode). Bundled as raw
// source and injected as classic scripts at runtime, so it rides inside the app bundle and
// works on any deploy path — the prototype-hub worker only serves index.html + assets/, not
// extra folders like /hubstaff-template/ (which is why runtime-fetching them 404'd on deploy).
import hubstaffShellSrc from "../shell/hubstaff-shell.js?raw";
import designAnnotationsSrc from "../shell/design-annotations.js?raw";
import designAnnotationsDataSrc from "../shell/design-annotations.data.js?raw";
import devModeSrc from "../shell/dev-mode.js?raw";
import mvpPreview from "../assets/mvpPreview";

const fmt0 = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(Math.abs(n));
const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

// Avg = 117,187 → hero (× 1.28 with 18% headcount + 10% seasonality) = $150,000,
// matching the June fund schedule and the Future "All providers" total.
const v1MonthlyHistory = [
  { month: "Jan", total: 116000, members: 42 },
  { month: "Feb", total: 119000, members: 43 },
  { month: "Mar", total: 115000, members: 44 },
  { month: "Apr", total: 121000, members: 45 },
  { month: "May", total: 114935, members: 47 },
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
  hourly: "#0168dd", fixed: "#3d8ae8", pto: "#85baf5", bonus: "#f59e0b", additions: "#0e9f6e",
};
const v1EarningLabels: Record<string, string> = {
  hourly: "Hourly pay", fixed: "Fixed pay", pto: "PTO & Holidays", bonus: "Bonuses", additions: "Additions",
};

const v1Providers = [
  { name: "Wise",     color: "#0168dd", members: 22, monthly: 24200, weeks: [4100, 7800, 4100, 8200] },
  { name: "Payoneer", color: "#0e9f6e", members: 15, monthly: 16100, weeks: [2700, 4900, 2700, 5800] },
  { name: "Deel",     color: "#f59e0b", members: 8,  monthly: 8600,  weeks: [1400, 2600, 1400, 3200] },
  { name: "Export",   color: "#6b7280", members: 5,  monthly: 3800,  weeks: [900,  1200, 900,  800]  },
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
  { name: "Additions",      value: 2900,  color: "#0e9f6e" },
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
    { name: "alex.schutte@hubstaff.com S", avatar: "AS", color: "#0e9f6e", rate: "No rate set", regular: "8:00:00", overtime: "—", total: "8:00:00", amount: 0 },
    { name: "Alex Yarotsky",               avatar: "AY", color: "#f59e0b", rate: "No rate set", regular: "8:00:00", overtime: "—", total: "8:00:00", amount: 0 },
  ]},
  { date: "Wed, Jun 17, 2026", members: [
    { name: "Adrian Goia",   avatar: "AG", color: "#0168dd", rate: "$18.00/hr", regular: "8:00:00", overtime: "—", total: "8:00:00", amount: 144 },
    { name: "Alex Yarotsky", avatar: "AY", color: "#f59e0b", rate: "No rate set", regular: "4:00:00", overtime: "—", total: "4:00:00", amount: 0 },
  ]},
];

const v1AvatarColors: Record<string, string> = { AG: "#0168dd", MK: "#e5764e", JO: "#2f8af4", AS: "#0e9f6e", AY: "#f59e0b" };
const v1CycleBadge: Record<string, [string,string]> = {
  Weekly:      ["#d1fae5","#0e9f6e"],
  "Bi-weekly": ["#dbeafe","#2563eb"],
  Monthly:     ["#ede9fe","#7c3aed"],
};

const v2Cycles = [
  {
    id: "FP-WISE-001",  provider: "Wise",     cycle: "Monthly",   cycleColor: "#0168dd",
    dateRange: "Jun 1–30, 2026", daysLeft: 8, pctTracked: 77, members: 15,
    confirmed: 12870, planned: 43130, projected: 0, total: 56000,
    confirmedBreak: { hourlyTracked: 12210, overtime: 660, pastPTO: 0 },
    plannedBreak:   { fixedPay: 39700, futurePTO: 1940, additions: 1490, deductions: 0 },
    projectedBreak: { hourly: 0 },
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
    id: "FP-EXP-001",   provider: "Export",   cycle: "Monthly",   cycleColor: "#6b7280",
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
const v2ProviderColors: Record<string, string> = { Wise: "#0168dd", Payoneer: "#0e9f6e", Deel: "#f59e0b", Export: "#6b7280" };

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
    avatar: "AA", color: "#0e9f6e", total: 1080,
    items: [
      { label: "Tracked hours",      sub: "Timesheets", hours: "28:00",  rate: "$22.00/hr", status: "Confirmed" as const, amount: 616 },
      { label: "Scheduled addition", sub: "Adjustment", hours: "—",      rate: "—",         status: "Planned"   as const, amount: 200 },
      { label: "Estimated remaining",sub: "Timesheets", hours: "~12:00", rate: "$22.00/hr", status: "Projected" as const, amount: 264 },
    ],
  },
  {
    name: "Marcus Chen", email: "m.chen@hubstaff.com",
    avatar: "MC", color: "#0e9f6e", total: 1000,
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

// 1L future-payment "By source" roster — 15 members summing to the Wise total ($10,600).
const v1lWiseMembers = [
  ...v2WeeklyMembers,
  ...[
    { name: "Sofia Rossi",  avatar: "SR", color: "#e5764e", total: 620 },
    { name: "Liam OBrien",  avatar: "LO", color: "#0e9f6e", total: 640 },
    { name: "Yuki Tanaka",  avatar: "YT", color: "#8b5cf6", total: 600 },
    { name: "Noah Kim",     avatar: "NK", color: "#0168dd", total: 660 },
    { name: "Emma Novak",   avatar: "EN", color: "#0e9f6e", total: 580 },
    { name: "Diego Santos", avatar: "DS", color: "#f59e0b", total: 700 },
    { name: "Chloe Dubois", avatar: "CD", color: "#e5764e", total: 610 },
    { name: "Omar Haddad",  avatar: "OH", color: "#0e9f6e", total: 645 },
    { name: "Zara Ali",     avatar: "ZA", color: "#8b5cf6", total: 540 },
  ].map(m => {
    const tracked = Math.round(m.total * 0.6);
    const est = m.total - tracked;
    return {
      name: m.name,
      email: `${m.name.toLowerCase().replace(/[^a-z]+/g, ".")}@hubstaff.com`,
      avatar: m.avatar, color: m.color, total: m.total,
      items: [
        { label: "Tracked hours",       sub: "Timesheets", hours: `${Math.round(tracked / 20)}:00`, rate: "$20.00/hr", status: "Confirmed" as const, amount: tracked },
        { label: "Estimated remaining", sub: "Timesheets", hours: `~${Math.round(est / 20)}:00`,     rate: "$20.00/hr", status: "Projected" as const, amount: est },
      ],
    };
  }),
];

// ── 1L future-payment matrix (earning types × certainty) ────────────────────────
// Columns mirror the Payment History earning types. Confirmed = tracked hours
// (final). Planned = scheduled (fixed pay, PTO/holiday, adjustments, deductions).
// Deductions are subtracted from a member's known total. Projected is
// aggregate-only — never per member. Totals reconcile to the FP-WISE-001 cycle:
// Confirmed 5,200 · Planned 600 (200 + 160 + 320 − 80).
const V1L_ETS = ["Hourly", "Overtime", "Fixed pay", "PTO / Holiday", "Additions", "Deductions"] as const;
type V1lEt = typeof V1L_ETS[number];
type V1lRow = Partial<Record<V1lEt, number>>;

// Monthly Wise payment demo. Confirmed = tracked hours (Hourly + Overtime).
// Planned = scheduled (Fixed pay, PTO/Holiday, Additions, Deductions). A person is
// hourly OR salaried, plus scheduled extras. Sums to the authoritative col totals.
const v1lMatrixMembers: { name: string; avatar: string; color: string; confirmed: V1lRow; planned: V1lRow; rate?: number; hours?: number }[] = [
  // Salaried — fixed pay dominant, plus scheduled extras.
  { name: "Marcus Chen",      avatar: "MC", color: "#0e9f6e", confirmed: {},                              planned: { "Fixed pay": 8500, Deductions: 300 } },
  { name: "Aurora Arjomilla", avatar: "AA", color: "#0e9f6e", confirmed: {},                              planned: { "Fixed pay": 6800, "PTO / Holiday": 600, Additions: 400 } },
  { name: "Liam O'Brien",     avatar: "LO", color: "#0e9f6e", confirmed: {},                              planned: { "Fixed pay": 7000, Additions: 600 } },
  { name: "Priya Nair",       avatar: "PN", color: "#e5764e", confirmed: {},                              planned: { "Fixed pay": 6200, "PTO / Holiday": 500 } },
  { name: "Emma Novak",       avatar: "EN", color: "#0e9f6e", confirmed: {},                              planned: { "Fixed pay": 5800, Additions: 500 } },
  { name: "Diego Santos",     avatar: "DS", color: "#f59e0b", confirmed: {},                              planned: { "Fixed pay": 5400 } },
  // Hourly — tracked hours (rate × hours), plus overtime / scheduled extras.
  { name: "Alex Yarotsky",    avatar: "AY", color: "#f59e0b", confirmed: { Hourly: 1600, Overtime: 180 }, planned: { "PTO / Holiday": 320 }, rate: 40, hours: 40 },
  { name: "Jordan Blake",     avatar: "JB", color: "#8b5cf6", confirmed: { Hourly: 1760, Overtime: 220 }, planned: {},                       rate: 40, hours: 44 },
  { name: "Noah Kim",         avatar: "NK", color: "#0168dd", confirmed: { Hourly: 1534 },                planned: { "PTO / Holiday": 280 }, rate: 59, hours: 26 },
  { name: "Full Tseg",        avatar: "FT", color: "#0168dd", confirmed: { Hourly: 1440 },                planned: { Additions: 260 },       rate: 45, hours: 32 },
  { name: "Zara Ali",         avatar: "ZA", color: "#8b5cf6", confirmed: { Hourly: 1326 },                planned: { "PTO / Holiday": 240 }, rate: 51, hours: 26 },
  { name: "Sofia Rossi",      avatar: "SR", color: "#e5764e", confirmed: { Hourly: 1248 },                planned: { Deductions: 150 },      rate: 48, hours: 26 },
  { name: "Omar Haddad",      avatar: "OH", color: "#0e9f6e", confirmed: { Hourly: 1170, Overtime: 120 },  planned: {},                      rate: 45, hours: 26 },
  { name: "Chloe Dubois",     avatar: "CD", color: "#e5764e", confirmed: { Hourly: 1144, Overtime: 140 },  planned: {},                      rate: 44, hours: 26 },
  { name: "Yuki Tanaka",      avatar: "YT", color: "#3d8ae8", confirmed: { Hourly: 988 },                 planned: { Additions: 180 },       rate: 38, hours: 26 },
];

// Authoritative column totals across all 15 members — reconcile to 5,000 / 2,400.
// (1L splits Planned as Additions 500 / Deductions −100; the shared cycle carries
// the same 2,400 as Additions 400 / no deduction, so V2 stays untouched.)
const v1lWiseColTotals: { confirmed: Record<V1lEt, number>; planned: Record<V1lEt, number> } = {
  confirmed: { Hourly: 12210, Overtime: 660, "Fixed pay": 0,     "PTO / Holiday": 0,    Additions: 0,    Deductions: 0   },
  planned:   { Hourly: 0,     Overtime: 0,   "Fixed pay": 39700, "PTO / Holiday": 1940, Additions: 1940, Deductions: 450 },
};

// Column display labels — keys stay stable; "Hourly" reads as pay, not a rate.
const v1lEtLabel: Record<V1lEt, string> = {
  Hourly: "Hourly pay", Overtime: "Overtime", "Fixed pay": "Fixed pay",
  "PTO / Holiday": "PTO / Holiday", Additions: "Additions", Deductions: "Deductions",
};

// ── 1M "Future Tracked So Far" — all providers in one filterable view ────────────
// Each member is tagged with its provider. Totals are summed from the members, so any
// filter (All or one provider) reconciles by construction. Per-provider sums match the
// June fund schedule: Wise 56k + PayPal 44k + Deel 20k + Export 12k + Bitwage 10k = 142k.
type V1mMember = { name: string; avatar: string; color: string; provider: string; confirmed: V1lRow; planned: V1lRow; rate?: number; hours?: number };
const v1mFutureProviderList = [
  { id: "all",     name: "All payout methods" },
  { id: "wise",    name: "Wise" },
  { id: "paypal",  name: "PayPal" },
  { id: "deel",    name: "Deel" },
  { id: "export",  name: "Export" },
  { id: "bitwage", name: "Bitwage" },
  { id: "gusto",   name: "Gusto" },
] as const;
// Each provider runs its own pay cycle; period weights (in $k) match the June fund
// schedule and sum to the provider's month total, so a period's frac scales the roster.
const v1mProviderCycles: Record<string, { cycle: string; periods: { label: string; weight: number }[] }> = {
  all:     { cycle: "Monthly",   periods: [{ label: "June 2026", weight: 1 }] },
  wise:    { cycle: "Weekly",    periods: [{ label: "Jun 2–8", weight: 12 }, { label: "Jun 9–15", weight: 13 }, { label: "Jun 16–22", weight: 15 }, { label: "Jun 23–29", weight: 16 }] },
  paypal:  { cycle: "Weekly",    periods: [{ label: "Jun 2–8", weight: 9 },  { label: "Jun 9–15", weight: 11 }, { label: "Jun 16–22", weight: 13 }, { label: "Jun 23–29", weight: 11 }] },
  deel:    { cycle: "Monthly",   periods: [{ label: "June 2026", weight: 1 }] },
  export:  { cycle: "Monthly",   periods: [{ label: "June 2026", weight: 1 }] },
  bitwage: { cycle: "Monthly",   periods: [{ label: "June 2026", weight: 1 }] },
  gusto:   { cycle: "Monthly",   periods: [{ label: "June 2026", weight: 1 }] },
};
// The pay period a "Next dates to fund" card lands on: current in-progress cycle.
const v1mCurrentPeriod = (providerId: string) => {
  const c = v1mProviderCycles[providerId] ?? v1mProviderCycles.all;
  return c.cycle === "Weekly" ? "Jun 16–22" : c.periods[c.periods.length - 1].label;
};
const v1mFutureMembers: V1mMember[] = [
  ...v1lMatrixMembers.map(m => ({ ...m, provider: "wise" })),
  // PayPal — $44,000
  { name: "Sofia Ramos",  avatar: "SR", color: "#0e9f6e", provider: "paypal", confirmed: {},                              planned: { "Fixed pay": 9500 } },
  { name: "Tom Wells",    avatar: "TW", color: "#0168dd", provider: "paypal", confirmed: {},                              planned: { "Fixed pay": 7800, Deductions: 300 } },
  { name: "Lena Marsh",   avatar: "LM", color: "#8b5cf6", provider: "paypal", confirmed: {},                              planned: { "Fixed pay": 8000, "PTO / Holiday": 600 } },
  { name: "Raj Patel",    avatar: "RP", color: "#f59e0b", provider: "paypal", confirmed: { Hourly: 4800, Overtime: 500 }, planned: {}, rate: 60, hours: 80 },
  { name: "Ivy Chen",     avatar: "IC", color: "#0e9f6e", provider: "paypal", confirmed: { Hourly: 5000 },                planned: {}, rate: 50, hours: 100 },
  { name: "Ben Ortiz",    avatar: "BO", color: "#e5764e", provider: "paypal", confirmed: {},                              planned: { "Fixed pay": 6800, Additions: 1300 } },
  // Deel — $20,000
  { name: "Ana Lopez",    avatar: "AL", color: "#0e9f6e", provider: "deel", confirmed: {},                               planned: { "Fixed pay": 5000 } },
  { name: "Kofi Mensah",  avatar: "KM", color: "#0168dd", provider: "deel", confirmed: {},                               planned: { "Fixed pay": 4500, "PTO / Holiday": 500 } },
  { name: "Yara Haddad",  avatar: "YH", color: "#8b5cf6", provider: "deel", confirmed: { Hourly: 3600, Overtime: 400 },  planned: {}, rate: 45, hours: 80 },
  { name: "Sven Berg",    avatar: "SB", color: "#f59e0b", provider: "deel", confirmed: { Hourly: 3200 },                 planned: {}, rate: 40, hours: 80 },
  { name: "Nina Kaur",    avatar: "NK", color: "#0e9f6e", provider: "deel", confirmed: {},                               planned: { "Fixed pay": 3000, Additions: 200, Deductions: 400 } },
  // Export — $12,000
  { name: "Hiro Sato",    avatar: "HS", color: "#0e9f6e", provider: "export", confirmed: {},                             planned: { "Fixed pay": 4000 } },
  { name: "Mara Vidal",   avatar: "MV", color: "#0168dd", provider: "export", confirmed: {},                             planned: { "Fixed pay": 3500, "PTO / Holiday": 300 } },
  { name: "Owen Reid",    avatar: "OR", color: "#8b5cf6", provider: "export", confirmed: { Hourly: 2400, Overtime: 200 }, planned: {}, rate: 40, hours: 60 },
  { name: "Tess Frost",   avatar: "TF", color: "#f59e0b", provider: "export", confirmed: {},                             planned: { "Fixed pay": 1800, Additions: 100, Deductions: 300 } },
  // Bitwage — $10,000
  { name: "Dario Costa",  avatar: "DC", color: "#0e9f6e", provider: "bitwage", confirmed: {},                            planned: { "Fixed pay": 5000 } },
  { name: "Priya Rao",    avatar: "PR", color: "#0168dd", provider: "bitwage", confirmed: { Hourly: 3000 },               planned: {}, rate: 50, hours: 60 },
  { name: "Luca Bianchi", avatar: "LB", color: "#8b5cf6", provider: "bitwage", confirmed: {},                            planned: { "Fixed pay": 2200, "PTO / Holiday": 200, Deductions: 400 } },
  // Gusto — $8,000
  { name: "Grace Miller", avatar: "GM", color: "#0e9f6e", provider: "gusto", confirmed: {},                             planned: { "Fixed pay": 3500 } },
  { name: "Theo Blanc",   avatar: "TB", color: "#0168dd", provider: "gusto", confirmed: {},                             planned: { "Fixed pay": 2800, "PTO / Holiday": 200 } },
  { name: "Ines Moreau",  avatar: "IM", color: "#8b5cf6", provider: "gusto", confirmed: { Hourly: 1500 },               planned: {}, rate: 50, hours: 30 },
];

// ─── Shared helpers ────────────────────────────────────────────────────────────

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const header = d?.dateLabel ? `${d.week} · ${d.dateLabel}` : label;
  const visible = payload.filter((p: any) => p.value > 0);
  const total = visible.reduce((s: number, p: any) => s + p.value, 0);
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-[#111827] mb-1.5">{header}</p>
      {visible.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 py-0.5">
          <span style={{ color: p.fill ?? p.color }}>{p.name}</span>
          <span className="font-medium text-[#111827]">{fmt0(p.value)}</span>
        </div>
      ))}
      {visible.length > 1 && (
        <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]">
          <span className="text-[#6b7280]">Total</span>
          <span className="font-semibold text-[#111827]">{fmt0(total)}</span>
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
      <text x={0} dy={14} textAnchor="middle" fill="#111827" fontSize={11} fontWeight={600}>{d.week}</text>
      <text x={0} dy={26} textAnchor="middle" fill="#6b7280" fontSize={10}>{d.dateLabel}</text>
    </g>
  );
}

function ChevronLeft({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <ChevronRight size={size} className={`rotate-180 ${className}`} />;
}

function Sidebar({ active }: { active: "v1" | "v1c" | "v1d" | "v1e" | "v1f" | "v1g" | "v1h" | "v1i" | "v1j" | "v1k" | "v1l" | "v1m" | "v1n" | "final" | "mvp" | "v2" }) {
  const topNav = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: ClipboardList,   label: "Timesheets" },
    { icon: Activity,        label: "Activity" },
    { icon: Lightbulb,       label: "Insights" },
    { icon: FolderKanban,    label: "Project management" },
    { icon: CalendarDays,    label: "Calendar" },
    { icon: BarChart2,       label: "Reports",  isActive: active === "v1" || active === "v1c" || active === "v1d" || active === "v1e" || active === "v1f" || active === "v1g" || active === "v1h" || active === "v1i" || active === "v1j" || active === "v1k" || active === "v1l" },
    { icon: UserCircle2,     label: "People" },
  ];
  return (
    <div className="w-[220px] flex-shrink-0 bg-[#111827] flex flex-col h-full">
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
          <button key={t} onClick={() => onTab(t)} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${tab === t ? "bg-[#0168dd] text-white" : "text-[#6b7280] hover:text-[#111827]"}`}>{t}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button className="p-1 text-[#6b7280] hover:text-[#111827]"><ChevronLeft size={14} /></button>
        <button className="p-1 text-[#6b7280] hover:text-[#111827]"><ChevronRight size={14} /></button>
        <div className="flex items-center gap-1.5 border border-[#e5e7eb] rounded px-3 py-1.5 text-xs text-[#111827] bg-white">
          <CalendarDays size={12} className="text-[#6b7280]" />Sun, May 24, 2026 – Wed, Jun 24, 2026
        </div>
        <button className="text-xs border border-[#e5e7eb] rounded px-3 py-1.5 text-[#111827] bg-white hover:bg-[#f9fafb]">Today</button>
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
      <div className="grid grid-cols-4 divide-x divide-[#e5e7eb] border-b border-[#e5e7eb]">
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1 h-[21px] flex items-center">Monthly avg payout</p>
          <p className="text-3xl font-bold text-[#111827] tracking-tight">{fmt0(v1AvgMonthly)}</p>
          <p className="text-[11px] text-[#6b7280] mt-0.5">last 5 months</p>
          <ResponsiveContainer width="100%" height={32} className="mt-2">
            <AreaChart data={v1MonthlyHistory} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" hide /><YAxis hide domain={["auto","auto"]} />
              <Area type="monotone" dataKey="total" stroke="#0168dd" strokeWidth={1.5} fill="#0168dd" fillOpacity={0.1} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1">Headcount change</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${up ? "text-emerald-600" : "text-red-500"}`}>{up ? "+" : ""}{v1DeltaPct.toFixed(0)}%</span>
            {up ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-400" />}
          </div>
          <p className="text-[11px] text-[#6b7280] mt-0.5">{v1CurrMembers} this cycle vs avg {v1AvgMembers}</p>
          <div className="flex gap-2 mt-2">
            {v1PayTypes.map(pt => (
              <div key={pt.key} className="flex items-center gap-1 text-[10px] text-[#6b7280]">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: pt.color }} />{pt.count}
              </div>
            ))}
            <span className="text-[10px] text-[#6b7280]">= {v1CurrMembers}</span>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1 h-[21px] flex items-center">Recommended projection</p>
          <p className="text-3xl font-bold text-[#0168dd] tracking-tight">{fmt0(v1AdjProj)}</p>
          <p className="text-[11px] text-[#6b7280] mt-0.5">avg × ({v1CurrMembers}/{v1AvgMembers} members)</p>
          <div className="mt-3 h-1.5 bg-[#e8f2fd] rounded-full overflow-hidden">
            <div className="h-full bg-[#0168dd] rounded-full" style={{ width: `${Math.min(100, (v1AdjProj / 70000) * 100)}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-[#6b7280] mt-0.5"><span>{fmt0(v1AvgMonthly)} avg</span><span>{fmt0(70000)} cap</span></div>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-2">By pay cycle</p>
          <div className="space-y-2">
            {v1PayTypes.map(pt => (
              <div key={pt.key} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pt.color }} />
                <div className="flex-1 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(pt.count / v1CurrMembers) * 100}%`, background: pt.color }} />
                </div>
                <span className="text-xs font-semibold text-[#111827] w-6 text-right">{pt.count}</span>
                <span className="text-[10px] text-[#6b7280] w-14">{pt.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#e5e7eb] text-xs text-[#6b7280]">
            <Users size={11} /><span>Total: <span className="font-semibold text-[#111827]">{v1CurrMembers} members</span></span>
          </div>
        </div>
      </div>
      <div className="flex divide-x divide-[#e5e7eb]">
        <div className="flex-1 px-5 py-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-0.5">Week-by-week distribution</p>
              <p className="text-[11px] text-[#6b7280]">{mode === "earning" ? "Stacked by earning type" : "Stacked by payment provider"}</p>
            </div>
            <div className="flex items-center bg-[#f3f4f6] rounded-md p-0.5">
              <button onClick={() => setMode("earning")} className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${mode === "earning" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280]"}`}>By earning type</button>
              <button onClick={() => setMode("provider")} className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${mode === "provider" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280]"}`}>By provider</button>
            </div>
          </div>
          {mode === "earning" && (
            <ResponsiveContainer key="v1-earning" width="100%" height={160}>
              <BarChart data={v1EarningWeekData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
                <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1EarningWeekData} />} axisLine={false} tickLine={false} interval={0} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="hourly"    name="Hourly pay"     stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
                <Bar dataKey="fixed"     name="Fixed pay"      stackId="s" fill="#3d8ae8" radius={[0,0,0,0]} />
                <Bar dataKey="pto"       name="PTO & Holidays" stackId="s" fill="#85baf5" radius={[0,0,0,0]} />
                <Bar dataKey="bonus"     name="Bonuses"        stackId="s" fill="#f59e0b" radius={[0,0,0,0]} />
                <Bar dataKey="additions" name="Additions"      stackId="s" fill="#0e9f6e" radius={[0,0,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {mode === "provider" && (
            <ResponsiveContainer key="v1-provider" width="100%" height={160}>
              <BarChart data={v1ProviderWeekData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
                <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1ProviderWeekData} />} axisLine={false} tickLine={false} interval={0} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="Wise"     name="Wise"     stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
                <Bar dataKey="Payoneer" name="Payoneer" stackId="s" fill="#0e9f6e" radius={[0,0,0,0]} />
                <Bar dataKey="Deel"     name="Deel"     stackId="s" fill="#f59e0b" radius={[0,0,0,0]} />
                <Bar dataKey="Export"   name="Export"   stackId="s" fill="#6b7280" radius={[0,0,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
            {legend.map(l => (
              <div key={l.key} className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
                <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />{l.label}
              </div>
            ))}
          </div>
        </div>
        <div className="w-44 flex-shrink-0 px-4 py-4 flex flex-col">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1">{mode === "earning" ? "Monthly mix" : "By provider"}</p>
          <ResponsiveContainer key={`v1-pie-${mode}`} width="100%" height={110}>
            <PieChart>
              <Pie data={activePieData} cx="50%" cy="50%" innerRadius={26} outerRadius={52} dataKey="value" labelLine={false} label={<PieLabel />}>
                {activePieData.map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number, name: string) => [fmt0(v), name]} contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e5e7eb" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1 flex-1">
            {activePieData.map(e => (
              <div key={e.name} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ background: e.color }} />
                  <span className="text-[#6b7280] truncate">{e.name}</span>
                </div>
                <span className="font-semibold text-[#111827] ml-1 flex-shrink-0">{e.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Zone Payment History — the Zone DataTable UI (bordered header, 48px rows, expandable
// rows, pill pagination) applied to the legacy V1PaymentHistory content model: grouped by
// member, each member expands to its payment-type rows (One-time / Automatic / Timesheets)
// with the full Paid on → Bonus → Total Amount breakdown. Data reuses v1TableMembers.
function V1PaymentHistoryZone() {
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<"ME" | "ALL">("ALL");
  const [expanded, setExpanded] = useState<Set<string>>(new Set([v1TableMembers[0]?.name]));
  const toggle = (k: string) => setExpanded(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const rows = v1TableMembers;
  const PAGE = 10;
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = rows.slice(safePage * PAGE, safePage * PAGE + PAGE);
  const rangeFrom = rows.length ? safePage * PAGE + 1 : 0;
  const rangeTo = safePage * PAGE + paged.length;
  const hCls = "px-3 py-2.5 border-r border-[#e5e7eb] bg-[#f9fafb] text-[#1f2937] text-sm font-semibold text-left whitespace-nowrap";
  const hLast = "px-3 py-2.5 border-[#e5e7eb] bg-[#f9fafb] text-[#1f2937] text-sm font-semibold text-left whitespace-nowrap";
  const sub = "px-3 py-2 border-r border-t border-[#e5e7eb] text-left tabular-nums text-[#374151] text-sm whitespace-nowrap";
  const barGray = "text-[#4b5563] bg-transparent hover:bg-[#f3f4f6] border border-[#d1d5db]"; // date-bar buttons — no white fill, blend with the gray-50 canvas
  return (
    <div className="space-y-4">
      {/* Date bar — ME/ALL segmented control · period nav (icon buttons) · date range · Today · Filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex w-fit">
          {(["ME", "ALL"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`h-10 px-5 flex items-center justify-center text-sm transition-colors border border-l-0 first:border-l border-[#d1d5db] first:rounded-l-[6px] last:rounded-r-[6px] ${tab === t ? "bg-[#f0f5ff] text-[#0168dd] font-medium" : "text-[#374151] font-normal hover:bg-[#f9fafb]"}`}>{t}</button>
          ))}
        </div>
        {/* period-nav (arrows) · date+today · filters — 8px within a group, 16px between groups */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button aria-label="Previous period" className={`${ZBTN_BASE} h-10 w-10 ${barGray}`}><ChevronRight size={18} className="rotate-180" /></button>
            <button aria-label="Next period" className={`${ZBTN_BASE} h-10 w-10 ${barGray}`}><ChevronRight size={18} /></button>
          </div>
          <div className="flex items-center gap-2">
            <button data-zone="date_range_picker" className={`relative inline-flex items-center justify-between h-10 pl-4 pr-3 gap-3 text-sm font-normal rounded-[6px] transition-colors select-none min-w-[300px] ${barGray}`}><span className="text-[#374151]">Sun, May 24, 2026 – Wed, Jun 24, 2026</span><CalendarDays size={16} className="text-[#2aa7ff]" /></button>
            <button className={zbtn("ghostGray", "md")}>Today</button>
          </div>
          <button className={zbtn("outlinePrimary", "md")}><ListFilter size={16} /> Filters</button>
        </div>
      </div>
      {/* Summary */}
      <div data-zone="card" className="flex items-stretch bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="flex-1 px-6 py-4 border-r border-[#e5e7eb]">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">Payments</p>
          <p className="text-2xl font-bold text-[#111827] mt-0.5">47</p>
        </div>
        <div className="flex-1 px-6 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">Amount</p>
          <p className="text-2xl font-bold text-[#0e9f6e] mt-0.5">$34,198.00</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        {/* Toolbar — Group by (left) · Columns (icon-only, right) */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e5e7eb]">
          <label className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">Group by</span>
            <span className="relative inline-flex">
              <select data-zone="select" aria-label="Group by" className="appearance-none h-8 rounded-[6px] border border-gray-300 bg-white pl-3 pr-8 text-sm text-gray-700 cursor-pointer focus:outline-none focus:border-[#2aa7ff] focus:ring-1 focus:ring-[#2aa7ff]">
                <option>Members</option>
                <option>Currency</option>
              </select>
              <span className="material-symbols-rounded absolute right-1.5 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" style={{ fontSize: 18 }}>keyboard_arrow_down</span>
            </span>
          </label>
          <button data-zone="dropdown" aria-label="Columns" title="Columns" className={`${ZBTN_BASE} h-8 w-8 ${ZBTN_VARIANT.outlineGray}`}><Columns3 size={16} /></button>
        </div>
        <div className="overflow-x-auto">
          <table data-zone="data_table" className="w-full text-sm border-separate border-spacing-0 min-w-[1120px]">
            <thead>
              <tr>
                <th className={`${hCls} min-w-[280px]`}>Payment type</th>
                <th className={hCls}>Paid on</th>
                <th className={hCls}>Total Hours</th>
                <th className={hCls}>Hourly pay</th>
                <th className={hCls}>Fixed pay</th>
                <th className={hCls}>PTO &amp; Holidays</th>
                <th className={hCls}>Additions</th>
                <th className={hCls}>Deductions</th>
                <th className={hCls}>Bonus</th>
                <th className={hLast}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(m => {
                const open = expanded.has(m.name);
                return (
                  <Fragment key={m.name}>
                    <tr className="group/row h-12 [&>td]:align-middle cursor-pointer" onClick={() => toggle(m.name)}>
                      <td colSpan={9} className={`px-3 py-2 border-r border-t border-[#e5e7eb] ${open ? "bg-[#f9fafb]" : "group-hover/row:bg-[#f9fafb]"}`}>
                        <div className="flex items-center gap-2.5">
                          <ChevronRight size={16} className={`text-[#9ca3af] shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
                          <div data-zone="avatar" className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0" style={{ background: v1AvatarColors[m.avatar] ?? "#6b7280" }}>{m.avatar}</div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 leading-tight">
                              <span className="text-[#111827] text-sm font-semibold">{m.name}</span>
                              <span className="w-[3px] h-[3px] rounded-full bg-[#9ca3af] shrink-0" />
                              <span className="text-[#6b7280] text-sm">{m.cycle}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-[#6b7280] leading-tight mt-0.5"><ProviderLogo id={m.provider.toLowerCase()} size={13} /> {m.provider}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-3 py-2 border-t border-[#e5e7eb] text-left tabular-nums font-semibold text-[#111827] text-sm whitespace-nowrap ${open ? "bg-[#f9fafb]" : "group-hover/row:bg-[#f9fafb]"}`}>{fmt2(m.total)}</td>
                    </tr>
                    {open && m.rows.map((row, i) => (
                      <tr key={i} className="h-12 [&>td]:align-middle">
                        <td className="px-3 py-2 border-r border-t border-[#e5e7eb]"><span className="pl-8 block text-[#374151] text-sm">{row.type}</span></td>
                        <td className="px-3 py-2 border-r border-t border-[#e5e7eb] text-[#6b7280] text-sm whitespace-nowrap">{row.date}</td>
                        <td className="px-3 py-2 border-r border-t border-[#e5e7eb] text-left tabular-nums text-[#6b7280] text-sm whitespace-nowrap">{row.hours}</td>
                        <td className={sub}>{row.hourly ? fmt2(row.hourly) : "$0.00"}</td>
                        <td className={sub}>{row.fixed ? fmt2(row.fixed) : "$0.00"}</td>
                        <td className={sub}>{row.pto ? fmt2(row.pto) : "$0.00"}</td>
                        <td className={sub}>{row.additions ? fmt2(row.additions) : "$0.00"}</td>
                        <td className={sub}>{row.deductions ? fmt2(row.deductions) : "$0.00"}</td>
                        <td className={sub}>{row.bonus ? fmt2(row.bonus) : "$0.00"}</td>
                        <td className="px-3 py-2 border-t border-[#e5e7eb] text-left tabular-nums text-[#374151] text-sm font-medium whitespace-nowrap">{fmt2(row.total)}</td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Zone pagination */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#e5e7eb]">
          <div className="flex items-center gap-3 text-sm text-[#6b7280]">
            <span>Showing {rangeFrom}–{rangeTo} items</span>
            <span data-zone="select" className="inline-flex items-center gap-0.5 border border-[#e5e7eb] rounded-[4px] pl-2.5 pr-1 py-1 text-[#111827] select-none"><span className="font-medium">10</span><span className="material-symbols-rounded" style={{ fontSize: 18 }}>keyboard_arrow_down</span></span>
            <span>Per page</span>
          </div>
          <div className="flex items-center gap-1">
            {safePage > 0 && (<button onClick={() => setPage(p => Math.max(0, p - 1))} className="inline-flex items-center gap-0.5 h-8 pl-1 pr-2.5 rounded-[4px] text-sm text-[#6b7280] hover:text-[#111827] transition-colors"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>chevron_left</span>Previous</button>)}
            {Array.from({ length: pageCount }, (_, i) => (
              <button data-zone="pagination" key={i} onClick={() => setPage(i)} className={`relative h-8 min-w-[32px] px-2 rounded-[4px] text-sm transition-colors ${i === safePage ? "bg-[#eaf6ff] text-[#0168dd] font-medium" : "text-[#6b7280] font-normal hover:bg-[#f9fafb]"}`}>{i + 1}{i === safePage && <span className="absolute left-1/2 -translate-x-1/2 -bottom-[1.5px] w-[18px] h-[3px] rounded-full bg-[#0168dd]" />}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={safePage >= pageCount - 1} className="inline-flex items-center gap-0.5 h-8 pl-2.5 pr-1 rounded-[4px] text-sm text-[#6b7280] hover:text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next<span className="material-symbols-rounded" style={{ fontSize: 18 }}>chevron_right</span></button>
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
      <div data-zone="card" className="flex items-stretch bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="flex-1 px-6 py-4 border-r border-[#e5e7eb]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">Payments</p>
          <p className="text-2xl font-bold text-[#111827] mt-0.5">47</p>
        </div>
        <div className="flex-1 px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">Amount</p>
          <p className="text-2xl font-bold text-[#0e9f6e] mt-0.5">$34,198.00</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#e5e7eb]">
          <button className="flex items-center gap-1 text-xs text-[#111827] font-medium hover:text-[#0168dd]"><span>≡ Group by: Member</span><ChevronDown size={13} /></button>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-xs text-[#0168dd]"><Send size={12} /> Send</button>
            <button className="flex items-center gap-1.5 text-xs text-[#0168dd]"><Clock size={12} /> Schedule</button>
            <button className="flex items-center gap-1.5 text-xs text-[#0168dd]"><Download size={12} /> Export</button>
            <button className="text-[#6b7280]"><Settings size={14} /></button>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              {cols.map(c => <th key={c} className={`py-2 px-3 text-left font-semibold text-[#6b7280] whitespace-nowrap ${c === "Total Amount" ? "text-right" : ""}`}>{c}</th>)}
            </tr>
          </thead>
          {v1TableMembers.map(member => {
            const isOpen = expanded.includes(member.name);
            const [bgC, textC] = v1CycleBadge[member.cycle];
            return (
              <tbody key={member.name}>
                <tr className="border-b border-[#e5e7eb] cursor-pointer hover:bg-[#f9fafb]" onClick={() => toggle(member.name)}>
                  <td colSpan={9} className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <ChevronRight size={14} className={`text-[#6b7280] transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: v1AvatarColors[member.avatar] }}>{member.avatar}</div>
                      <span className="font-semibold text-[#111827]">{member.name}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: bgC, color: textC }}>{member.cycle}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#6b7280]">via <ProviderLogo id={member.provider.toLowerCase()} size={12} /> {member.provider}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#111827]">{fmt2(member.total)}</td>
                </tr>
                {isOpen && member.rows.map((row, i) => (
                  <tr key={i} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                    <td className="py-2 px-3 pl-10 text-[#111827]">{row.type}</td>
                    <td className="py-2 px-3 text-[#6b7280]">{row.date}</td>
                    <td className="py-2 px-3 text-[#6b7280]">{row.hours}</td>
                    <td className="py-2 px-3 text-[#111827]">{row.hourly ? fmt2(row.hourly) : "$0.00"}</td>
                    <td className="py-2 px-3 text-[#111827]">{row.fixed ? fmt2(row.fixed) : "$0.00"}</td>
                    <td className="py-2 px-3 text-[#111827]">{row.pto ? fmt2(row.pto) : "$0.00"}</td>
                    <td className="py-2 px-3 text-[#111827]">{row.additions ? fmt2(row.additions) : "$0.00"}</td>
                    <td className="py-2 px-3 text-[#111827]">{row.deductions ? fmt2(row.deductions) : "$0.00"}</td>
                    <td className="py-2 px-3 text-[#111827]">{row.bonus ? fmt2(row.bonus) : "$0.00"}</td>
                    <td className="py-2 px-3 text-right font-medium text-[#111827]">{fmt2(row.total)}</td>
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
      <div data-zone="card" className="flex items-stretch bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="px-6 py-4 border-r border-[#e5e7eb] flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">Hours</p>
          <p className="text-2xl font-bold text-[#0e9f6e] mt-0.5">248:00:00</p>
        </div>
        <div className="px-6 py-4 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">Amount</p>
          <p className="text-2xl font-bold text-[#0e9f6e] mt-0.5">$1,600.00</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#e5e7eb] px-4 py-4">
        <p className="text-xs font-medium text-[#111827] mb-3">Total amount per day</p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={v1OwedDaily} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs><linearGradient id="v1owedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0168dd" stopOpacity={0.2}/><stop offset="95%" stopColor="#0168dd" stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={28} />
            <Tooltip formatter={(v: number) => [fmt2(v), "Amount"]} contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e5e7eb" }} />
            <Area type="monotone" dataKey="amount" stroke="#0168dd" strokeWidth={1.5} fill="url(#v1owedGrad)" dot={{ fill: "#0168dd", r: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#e5e7eb]">
          <span className="text-xs font-semibold text-[#111827]">Hubstaff <span className="font-normal text-[#6b7280]">Etc · UTC</span></span>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-xs text-[#0168dd]"><Send size={12} /> Send</button>
            <button className="flex items-center gap-1.5 text-xs text-[#0168dd]"><Download size={12} /> Export</button>
            <button className="flex items-center gap-1.5 text-xs text-[#0168dd]"><Columns size={12} /> Columns</button>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              <th className="py-2 px-4 text-left font-semibold text-[#6b7280]">Member</th>
              <th className="py-2 px-4 text-left font-semibold text-[#6b7280]">Current rate</th>
              <th className="py-2 px-4 text-left font-semibold text-[#6b7280]">Regular hours</th>
              <th className="py-2 px-4 text-left font-semibold text-[#6b7280]">Overtime</th>
              <th className="py-2 px-4 text-left font-semibold text-[#6b7280]">Total hours</th>
              <th className="py-2 px-4 text-right font-semibold text-[#6b7280]">Amount</th>
            </tr>
          </thead>
          {v1OwedRows.map(group => (
            <tbody key={group.date}>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <td colSpan={6} className="py-1.5 px-4 text-[11px] font-semibold text-[#6b7280]">{group.date}</td>
              </tr>
              {group.members.map((m, i) => (
                <tr key={`${group.date}-${i}`} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold" style={{ background: m.color }}>{m.avatar}</div>
                      <span className="text-[#111827] font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-[#6b7280]">{m.rate}</td>
                  <td className="py-2.5 px-4 text-[#111827]">{m.regular}</td>
                  <td className="py-2.5 px-4 text-[#6b7280]">{m.overtime}</td>
                  <td className="py-2.5 px-4"><div className="flex items-center gap-1 text-[#111827]"><Clock size={11} className="text-[#6b7280]" />{m.total}</div></td>
                  <td className="py-2.5 px-4 text-right font-medium text-[#111827]">{fmt2(m.amount)}</td>
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
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
          <TrendingUp size={15} className="text-[#0168dd]" />
          <span className="text-sm font-semibold text-[#111827]">Predictable Cash Flow</span>
          <span className="text-xs text-[#6b7280]">— based on historical payments</span>
        </div>
        <V1PredictivePanel />
      </div>
      <div>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
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
  addSeg("factual",   factual,   "#0e9f6e", !tracked && !projected);
  addSeg("tracked",   tracked,   "#0168dd", !projected);
  addSeg("projected", projected, "#85baf5", true);
  return <g>{rects}</g>;
}

function ExportDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 text-xs font-medium text-[#111827] border border-[#e5e7eb] rounded-md px-3 py-1.5 bg-white hover:bg-[#f9fafb] transition-colors select-none">
        <Download size={12} className="text-[#6b7280]" />
        Export
        <ChevronDown size={11} className={`text-[#6b7280] transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1.5 z-30 bg-white rounded-lg border border-[#e5e7eb] shadow-lg w-36 py-1 overflow-hidden">
            {([
              { label: "CSV", ext: "CSV" },
              { label: "PDF", ext: "PDF" },
            ] as const).map(({ label, ext }) => (
              <button key={ext} onClick={() => setOpen(false)} className="w-full text-left px-4 py-2 text-xs text-[#111827] hover:bg-[#f9fafb] transition-colors">
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
    { name: "Wise",     symbol: "W", color: "#0e9f6e" },
    { name: "Payoneer", symbol: "P", color: "#3b82f6" },
    { name: "Deel",     symbol: "D", color: "#7c3aed" },
    { name: "Export",   symbol: "E", color: "#6b7280" },
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
          <div className="absolute top-6 right-0 z-30 bg-white rounded-lg border border-[#e5e7eb] shadow-xl w-56 overflow-hidden">
            <div className="flex border-b border-[#e5e7eb]">
              {(["earning", "provider"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-[10px] font-semibold transition-colors border-b-2 -mb-px ${tab === t ? "text-[#0168dd] border-[#0168dd]" : "text-[#6b7280] border-transparent hover:text-[#111827]"}`}>
                  {t === "earning" ? "By type" : "By provider"}
                </button>
              ))}
            </div>
            <div className="p-3 space-y-0.5">
              {tab === "earning" ? earningItems.map(({ name, Icon, pct, amount }) => (
                <div key={name} className="flex items-center justify-between py-1 text-[11px]">
                  <div className="flex items-center gap-2 min-w-0"><Icon size={12} className="flex-shrink-0 text-[#0168dd]" /><span className="text-[#6b7280] truncate">{name}</span></div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0"><span className="text-[10px] text-[#6b7280]">{pct}%</span><span className="font-semibold text-[#111827]">{fmt0(amount)}</span></div>
                </div>
              )) : providerItems.map(({ name, symbol, color, pct, amount }) => (
                <div key={name} className="flex items-center justify-between py-1 text-[11px]">
                  <div className="flex items-center gap-2 min-w-0"><span className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center flex-shrink-0 text-white leading-none" style={{ background: color }}>{symbol}</span><span className="text-[#6b7280]">{name}</span></div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0"><span className="text-[10px] text-[#6b7280]">{pct}%</span><span className="font-semibold text-[#111827]">{fmt0(amount)}</span></div>
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
      <div className="grid grid-cols-3 divide-x divide-[#e5e7eb] border-b border-[#e5e7eb]">
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1 h-[21px] flex items-center">Monthly avg payout</p>
          <p className="text-3xl font-bold text-[#111827] tracking-tight">{fmt0(v1AvgMonthly)}</p>
          <p className="text-[11px] text-[#6b7280] mt-0.5">last 5 months</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1">Headcount change</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${up ? "text-emerald-600" : "text-red-500"}`}>{up ? "+" : ""}{v1DeltaPct.toFixed(0)}%</span>
            {up ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-400" />}
          </div>
          <p className="text-[11px] text-[#6b7280] mt-0.5">{v1CurrMembers} this cycle vs avg {v1AvgMembers}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            {v1PayTypes.map(pt => (
              <div key={pt.key} className="flex items-center gap-1 text-[10px] text-[#6b7280]">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pt.color }} />
                <span className="font-semibold text-[#111827]">{pt.count}</span><span>{pt.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 text-[10px] text-[#6b7280] border-l border-[#e5e7eb] pl-3 ml-1">
              <Users size={11} /><span className="font-semibold text-[#111827]">{v1CurrMembers}</span>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1 h-[21px] flex items-center">Recommended projection</p>
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
            <div className="flex justify-between text-[10px] text-[#6b7280] mt-0.5">
              <span>{fmt0(v1AvgMonthly)} avg</span>
              <span>{fmt0(v1AdjProj)} total</span>
            </div>
            <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-20 pointer-events-none">
              <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 w-48">
                {([
                  { label: "Confirmed",  color: "#0e9f6e", value: v1bConfirmed, pct: v1bPctC },
                  { label: "Planned",    color: "#0168dd", value: v1bPlanned,   pct: v1bPctP },
                  { label: "~Projected", color: "#85baf5", value: v1bProjected, pct: v1bPctR },
                ] as const).map(({ label, color, value, pct }) => {
                  const k = value / 1000;
                  const fmtK = `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
                  return (
                    <div key={label} className="flex items-center justify-between text-[11px] font-semibold mb-1 last:mb-0 text-[#6b7280]">
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
      <div className="flex divide-x divide-[#e5e7eb]">
        <div className="flex-1 px-5 py-4 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-0.5">Week-by-week distribution</p>
              {chartView === "a" ? (
                <p className="text-[11px] text-[#6b7280]">Past weeks show confirmed · current &amp; future show planned + projected</p>
              ) : (
                <p className="text-[11px] text-[#6b7280]">Amounts owed per payment provider per week</p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <div className="flex items-center bg-[#f3f4f6] rounded-md p-0.5">
                <button
                  onClick={() => setChartView("a")}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${chartView === "a" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280]"}`}
                >
                  By source of prediction
                </button>
                <button
                  onClick={() => setChartView("b")}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${chartView === "b" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280]"}`}
                >
                  By cash flow channel
                </button>
              </div>
            </div>
          </div>

          {chartView === "a" ? (
          <ResponsiveContainer key="v1b-bar-a" width="100%" height={160}>
            <BarChart data={v1bWeeklyData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1bWeeklyData} />} axisLine={false} tickLine={false} interval={0} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  if (!d) return null;
                  const items = [
                    { key: "factual",   label: "Confirmed",      color: "#0e9f6e", value: d.factual   },
                    { key: "tracked",   label: "Planned",        color: "#0168dd", value: d.tracked   },
                    { key: "projected", label: "Projected",      color: "#85baf5", value: d.projected },
                  ].filter(i => i.value > 0);
                  const total = items.reduce((s, i) => s + i.value, 0);
                  return (
                    <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs min-w-[160px]">
                      <p className="font-semibold text-[#111827] mb-1.5">{d.week} · {d.dateLabel}</p>
                      {items.map(i => (
                        <div key={i.key} className="flex justify-between gap-4 py-0.5">
                          <span style={{ color: i.color }}>{i.label}</span>
                          <span className="font-medium text-[#111827]">{fmt0(i.value)}</span>
                        </div>
                      ))}
                      {items.length > 1 && (
                        <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]">
                          <span className="text-[#6b7280]">Total</span>
                          <span className="font-semibold text-[#111827]">{fmt0(total)}</span>
                        </div>
                      )}
                    </div>
                  );
                }}
                cursor={{ fill: "#f9fafb" }}
              />
              <Bar dataKey="factual"   name="Confirmed"  stackId="s" fill="#0e9f6e" radius={[4,4,0,0]} />
              <Bar dataKey="tracked"   name="Planned"    stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
              <Bar dataKey="projected" name="Projected"  stackId="s" fill="#85baf5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          ) : (
          <ResponsiveContainer key="v1b-bar-b" width="100%" height={160}>
            <BarChart data={v1ProviderWeekData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1ProviderWeekData} />} axisLine={false} tickLine={false} interval={0} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="factual"  name="Confirmed"   stackId="s" fill="#0e9f6e" radius={[4,4,0,0]} />
              <Bar dataKey="Wise"     name="Wise"        stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
              <Bar dataKey="Payoneer" name="Payoneer"    stackId="s" fill="#0e9f6e" radius={[0,0,0,0]} />
              <Bar dataKey="Deel"     name="Deel"        stackId="s" fill="#f59e0b" radius={[0,0,0,0]} />
              <Bar dataKey="Export"   name="Export"      stackId="s" fill="#6b7280" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {([
                { label: "Confirmed", color: "#0e9f6e", desc: "Payments already received"            },
                { label: "Planned",   color: "#0168dd", desc: "Upcoming tracked payments"            },
                { label: "Projected", color: "#85baf5", desc: "Estimated based on historical trends" },
              ] as const).map(({ label, color, desc }) => (
                <div key={label} className="relative group flex items-center gap-1.5 text-[11px] text-[#6b7280] cursor-default">
                  <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                  {label}
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 pointer-events-none whitespace-nowrap">
                    <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs">
                      <p className="font-semibold mb-0.5" style={{ color }}>{label}</p>
                      <p className="text-[#6b7280]">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {chartView === "a" && (
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-[#6b7280]">Wk 1–2: <span className="font-semibold text-emerald-600">past</span></span>
                <span className="text-[#6b7280]">Wk 3–4: <span className="font-semibold text-[#0168dd]">upcoming</span></span>
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
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#111827]">Predictable Cash Flow</span>
            <span className="text-xs text-[#6b7280]">— based on historical payments</span>
          </div>
          <ExportDropdown />
        </div>
        <V1bPredictivePanel />
      </div>
      <div className="mt-6">
        <p className="text-base font-semibold text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
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
  { key: "fixed",   label: "Fixed pay",      color: "#0e9f6e", group: "stable"   },
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
      { label: "Confirmed",  color: "#0e9f6e", value: 22600 },
      { label: "Planned",    color: "#0168dd", value:  1600 },
      { label: "~Projected", color: "#85baf5", value: 43947 },
    ],
  },
  {
    key: "channel" as const,
    label: "By cash flow channel",
    rows: [
      { label: "Wise",     color: "#0e9f6e", value: 31350 },
      { label: "Payoneer", color: "#f59e0b", value: 21806 },
      { label: "Deel",     color: "#7c3aed", value: 12266 },
      { label: "Export",   color: "#6b7280", value:  2725 },
    ],
  },
  {
    key: "earning" as const,
    label: "By earning type",
    rows: [
      { label: "Hourly pay",     color: "#0168dd", value: 31548 },
      { label: "Fixed pay",      color: "#0e9f6e", value: 18400 },
      { label: "Bonuses",        color: "#f59e0b", value:  9530 },
      { label: "PTO & Holidays", color: "#8b5cf6", value:  5452 },
      { label: "Additions",      color: "#f97316", value:  3217 },
    ],
  },
];

const v1cProviders = [
  { key: "Wise",     letter: "W", color: "#0e9f6e" },
  { key: "Payoneer", letter: "P", color: "#f59e0b" },
  { key: "Deel",     letter: "D", color: "#7c3aed" },
  { key: "Export",   letter: "E", color: "#6b7280" },
] as const;

function ProviderLetterBadge({ letter, color, size = 14 }: { letter: string; color: string; size?: number }) {
  return (
    <div className="rounded flex items-center justify-center flex-shrink-0 font-bold text-white select-none"
      style={{ width: size, height: size, background: color, fontSize: Math.round(size * 0.6) }}>
      {letter}
    </div>
  );
}

function V1cBreakdownPopover({ dark = false, align = "right" }: { dark?: boolean; align?: "left" | "right" } = {}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"prediction"|"channel"|"earning">("prediction");
  const activeTab = v1cBreakdownTabs.find(t => t.key === tab)!;
  const total = activeTab.rows.reduce((s, r) => s + r.value, 0);
  return (
    <div className="relative mt-1.5">
      <button onClick={() => setOpen(o => !o)} className={`flex items-center gap-1 text-[11px] whitespace-nowrap transition-colors select-none ${dark ? "text-[#111827] hover:text-[#0168dd]" : "text-[#0168dd] hover:text-[#0057bb]"}`}>
        View breakdown <ChevronDown size={11} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className={`absolute top-6 ${align === "left" ? "left-0" : "right-0"} z-30 bg-white rounded-lg border border-[#e5e7eb] shadow-xl w-72 overflow-hidden`}>
            <div className="flex border-b border-[#e5e7eb]">
              {v1cBreakdownTabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2 text-[9px] font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap px-1 ${tab === t.key ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-3">
              {activeTab.rows.map(({ label, color, value }) => {
                const pct = Math.round(value / total * 100);
                const provider = tab === "channel" ? v1cProviders.find(p => p.key === label) : undefined;
                return (
                  <div key={label} className="flex items-center justify-between text-[11px] py-1.5 border-b border-[#f9fafb] last:border-0">
                    <div className="flex items-center gap-2">
                      {provider
                        ? <ProviderLetterBadge letter={provider.letter} color={color} size={14} />
                        : <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />}
                      <span className="text-[#6b7280]">{label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-[10px] text-[#6b7280]">{pct}%</span>
                      <span className="font-semibold text-[#111827] w-16 text-right">{fmt0(value)}</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-2 mt-1 border-t border-[#e5e7eb] text-[11px] font-semibold">
                <span className="text-[#6b7280]">Total</span>
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
    { label: "Headcount change", pct: v1cMemberPct, amt: v1cMemberAmt, color: "#0e9f6e" },
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
          <div className="absolute top-6 right-0 z-30 bg-white rounded-lg border border-[#e5e7eb] shadow-xl w-60 p-3">
            <div className="flex justify-between text-[11px] pb-2 mb-2 border-b border-[#e5e7eb]">
              <span className="text-[#6b7280]">Base avg payout</span>
              <span className="font-semibold text-[#111827]">{fmt0(v1AvgMonthly)}</span>
            </div>
            {drivers.map(({ label, pct, amt, color }) => (
              <div key={label} className="flex justify-between items-center text-[11px] py-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold" style={{ color }}>+{pct}%</span>
                  <span className="text-[#6b7280]">{label}</span>
                </div>
                <span className="font-semibold text-[#111827]">+{fmtK(amt)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-[11px] font-semibold mt-2 pt-2 border-t border-[#e5e7eb]">
              <span className="text-[#111827]">Projected total <span className="font-normal text-[#6b7280]">(+{v1cTotalPct}%)</span></span>
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
  { label: "Confirmed",  color: "#0e9f6e", value: v1cConfirmed, pct: v1cPctC },
  { label: "Planned",    color: "#0168dd", value: v1cPlanned,   pct: v1cPctP },
  { label: "~Projected", color: "#85baf5", value: v1cProjected, pct: v1cPctR },
];

const v1cSourceData = [
  { week: "Week 1", dateLabel: "Jun 2–8",   paid: 6200, pending: 1000, failed: 1200, tracked: 0,    projected: 0     },
  { week: "Week 2", dateLabel: "Jun 9–15",  paid: 12800, pending: 1400, failed: 0,   tracked: 0,    projected: 0     },
  { week: "Week 3", dateLabel: "Jun 16–22", paid: 0,    pending: 0,    failed: 0,   tracked: 1600, projected: 8200  },
  { week: "Week 4", dateLabel: "Jun 23–30", paid: 0,    pending: 0,    failed: 0,   tracked: 0,    projected: v1AvgMonthly - 32400 },  // W1–W3 sum 32,400 → June gross = the base
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <div>
            <p className="text-sm font-semibold text-[#111827]">Payments needing attention</p>
            <p className="text-[11px] text-[#6b7280] mt-0.5">{v1cTriageItemDefs.length} items · {fmt0(v1cTriagePendingAmt)} total</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827] text-base leading-none">×</button>
        </div>
        {/* Confirmation overlay */}
        {confirm && (
          <div className="absolute inset-0 bg-white/95 z-10 flex items-center justify-center p-6">
            <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-5 w-full">
              <p className="text-sm font-semibold text-[#111827] mb-1">
                {confirm.action === "retry" ? "Retry payment?" : "Process payment now?"}
              </p>
              <p className="text-[12px] text-[#6b7280] mb-4">
                {confirm.item.member} · {fmt0(confirm.item.amount)} via {confirm.item.method}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirm(null)} className="flex-1 py-2 text-[12px] border border-[#e5e7eb] rounded-lg text-[#6b7280] hover:bg-[#f9fafb]">Cancel</button>
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
                              <p className="text-[12px] font-semibold text-[#111827] truncate">{item.member}</p>
                              <p className="text-[10px] text-[#6b7280]">{item.week} ({item.dateLabel}) · {item.method}</p>
                            </div>
                          </div>
                          <span className="text-[12px] font-semibold text-[#111827] flex-shrink-0">{fmt0(item.amount)}</span>
                        </div>
                        <p className="text-[11px] text-[#6b7280] mb-2">{item.reason}</p>
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
        <div className="px-5 py-3 border-t border-[#e5e7eb]">
          <a href="#" className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:underline">
            Open in Payment records <ChevronRight size={11} />
          </a>
        </div>
      </div>
    </>
  );
}

// ── Wise Interest disclosure (opt-in APY on balances held in Wise) ─────────────
// Surfaced only in the Final UI, behind the top "Wise interest" version switcher.
// wiseVer: 0 = off, 1–5 = the five treatments. Provided by VersionFinalUI (0 when
// Wise isn't a connected payout method). No rate/%/amount is ever shown — we link out.
const WISE_INTEREST_URL = "https://wise.com/us/interest/";
const WiseVerContext = createContext(0);
// Off-schedule layout version (repurposed the old Wise-interest switcher): 1 = card inside the funding row, 2 = top-level 25% card.
const OffSchedVerContext = createContext<1 | 2>(1);
// "Payments over time" chart control version: 1 = 3/6/12M buttons + month stepper; 2 = single Zone date-range picker (pick any span up to 12 months).
const PmtVerContext = createContext<1 | 2>(1);
// Payments-report off-schedule strategy: 1 = dedicated Off-schedule card (pending + no-period-set live there);
// 2 = no card — pending timesheet approval moves into the fund-by "Not approved" columns, and a yellow banner covers "No pay period set".
const PmtReportVerContext = createContext<1 | 2>(1);
// Spillover (late-approved timesheets) scenario for the funding schedule + alerts. null = off.
const SpilloverContext = createContext<"yellow" | "red" | "mixed" | null>(null);
// Late-approved amounts folded into the imminent ("next") card's method rows in the red state.
const v1SpilloverLate: Record<string, number> = { wise: 1200, paypal: 800 };
const v1SpilloverTotal = 2000;
// Pending timesheet approval per payout method — the SAME $9,000 pool the off-schedule card shows
// (wise 3,700 + paypal 2,100 + deel 800 + export 2,400 = 9,000), so the fund-by "Not approved" column reconciles.
const v1PendingApproval: Record<string, number> = { wise: 3700, paypal: 2100, deel: 800, export: 2400 };
// Members whose timesheets await approval (the "pending" spillover): Wise 700+500, PayPal 800 → $2,000 across 3 members.
const v1SpilloverMembers: { id: string; name: string; role: string; provider: string; amount: number }[] = [
  { id: "sm1", name: "Ana Costa", role: "Design", provider: "wise", amount: 700 },
  { id: "sm2", name: "Bruno Lima", role: "Engineering", provider: "wise", amount: 500 },
  { id: "sm3", name: "Chloe Park", role: "Support", provider: "paypal", amount: 800 },
];
// Mixed "Off-schedule" — "still owed · past periods": people whose timesheets missed the cycle cutoff and need approval.
// Approving a person moves them to "ready to fund" — the Fund-by-today card (they missed the date, so fund today, pay tomorrow).
const v1OwedApproval: { id: string; name: string; provider: string; amount: number; hours: string }[] = [
  { id: "ap1", name: "Ana Costa", provider: "wise", amount: 1500, hours: "46h 20m" },
  { id: "ap2", name: "Bruno Lima", provider: "paypal", amount: 1200, hours: "38h 05m" },
  { id: "ap3", name: "Chloe Park", provider: "payoneer", amount: 1300, hours: "41h 40m" },
  { id: "ap4", name: "Diego Alves", provider: "wise", amount: 1000, hours: "32h 15m" },
  { id: "ap5", name: "Elena Rossi", provider: "paypal", amount: 900, hours: "29h 50m" },
  { id: "ap6", name: "Farah Haddad", provider: "payoneer", amount: 1100, hours: "35h 10m" },
  { id: "ap7", name: "Grace Okoro", provider: "deel", amount: 800, hours: "26h 30m" },
  { id: "ap8", name: "Hiro Tanaka", provider: "wise", amount: 1200, hours: "39h 00m" },
];
const v1OwedTotal = v1OwedApproval.reduce((s, m) => s + m.amount, 0); // $9,000
// Not-scheduled people — member-level breakdown for the details dialog (Wise 2 = $4,000, Export 2 = $2,400).
const v1NotSchedPeople: { id: string; name: string; provider: string; accrued: number }[] = [
  { id: "ns1", name: "Frank Ncube", provider: "wise", accrued: 2200 },
  { id: "ns2", name: "Grace Okoro", provider: "wise", accrued: 1800 },
  { id: "ns3", name: "Hana Suzuki", provider: "export", accrued: 1400 },
  { id: "ns4", name: "Igor Petrov", provider: "export", accrued: 1000 },
];
// "Not scheduled" — members with no pay period: cost accrues, no funding date. Grouped by payout method.
const NotSchedContext = createContext(false);
const v1NotSchedRows: { id: string; label: string; members: number; accrued: number }[] = [
  { id: "wise", label: "Wise", members: 2, accrued: 4000 },
  { id: "export", label: "Export", members: 2, accrued: 2400 },
];
const v1NotSchedMembers = v1NotSchedRows.reduce((s, r) => s + r.members, 0);
const v1NotSchedTotal = v1NotSchedRows.reduce((s, r) => s + r.accrued, 0);

function AddAdjustmentDialog({
  open, onClose, onSave, base, currentProjection, initial, zone = false,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (adj: ManualAdjustment) => void;
  base: number;
  currentProjection: number;
  initial?: ManualAdjustment;
  zone?: boolean;
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

  // Zone-aware field/segmented styling — Final UI (zone) matches the Zone design
  // system: uppercase gray-400 12px labels, rounded-[6px] gray-300 inputs (gray-700
  // 14px text, gray-400 placeholder), and bordered segmented controls like the chart.
  // Non-zone (1G–1N) keeps the original look.
  const lblCls = zone
    ? "text-xs font-medium uppercase text-[#9ca3af] mb-1.5"
    : "text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1.5";
  const fieldCls = (err = false) => zone
    ? `h-10 rounded-[6px] border px-3 text-sm text-[#374151] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 transition-colors ${err ? "border-[#f05252] focus:ring-[#f05252]/25 focus:border-[#f05252]" : "border-[#d1d5db] focus:ring-[#2f8af4]/25 focus:border-[#2f8af4]"}`
    : `border rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 transition-colors ${err ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-[#e5e7eb] focus:ring-[#0168dd]/20 focus:border-[#0168dd]"}`;
  const segWrapCls = zone ? "flex w-fit" : "flex bg-[#f3f4f6] rounded-lg p-0.5 w-fit";
  const segCls = (active: boolean, padZone: string, padPlain: string) => zone
    ? `h-10 ${padZone} flex items-center justify-center whitespace-nowrap text-sm transition-colors border border-l-0 first:border-l border-[#d1d5db] first:rounded-l-[6px] last:rounded-r-[6px] ${active ? "bg-[#f0f5ff] text-[#0168dd] font-medium" : "text-[#374151] font-normal hover:bg-[#f9fafb]"}`
    : `${padPlain} py-1.5 rounded-md text-sm font-semibold transition-all ${active ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div data-zone="dialog" className={`relative bg-white pointer-events-auto ${zone ? "rounded-lg shadow-xl w-[520px] p-5" : "rounded-xl shadow-2xl w-96 p-6"}`}>
          {zone && (
            <button data-zone="icon_button" onClick={onClose} aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-[6px] text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#4b5563] transition-colors">
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>close</span>
            </button>
          )}
          <h2 className={zone ? "text-lg font-semibold text-[#111827] mb-1 pr-8" : "text-lg font-semibold text-[#111827] mb-1"}>
            {initial ? "Edit adjustment" : "Add adjustment"}
          </h2>
          <p className={zone ? "text-sm text-[#6b7280] leading-snug mb-5" : "text-[12px] text-[#6b7280] leading-snug mb-5"}>
            This estimate is built from your payment history, so it can miss one-offs. Nudge it up or down — add a buffer to stay covered, or reduce it for a cost that won't repeat.
          </p>

          {/* Label */}
          <div className="mb-4">
            <p className={lblCls}>Label</p>
            <input data-zone="text_field" type="text" value={label} onChange={e => setLabel(e.target.value)}
              className={`w-full ${fieldCls()}`} />
          </div>

          {/* Type — standalone for 1G–1N; Final UI pairs it with "Apply as" in a 50/50 row below */}
          {!zone && (
            <div className="mb-4">
              <p className={lblCls}>Type</p>
              <div className={segWrapCls}>
                {(["add", "reduce"] as const).map(t => (
                  <button key={t} onClick={() => setAdjType(t)} className={segCls(adjType === t, "px-4", "px-4")}>
                    {t === "add" ? "Add" : "Reduce"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount — Final UI follows the Bulk Payroll adjustments Figma: an
              "Apply as" segmented (Amount / Percentage), a unit-aware value input,
              and a prominent "New value" showing the resulting projection. */}
          {zone ? (
            <>
              {/* Type + Apply as — one row, 50/50, 16px gap */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <p className={lblCls}>Type</p>
                  <div className="flex w-full">
                    {([["add", "Add", "add"], ["reduce", "Reduce", "remove"]] as const).map(([t, text, icon]) => (
                      <button key={t} onClick={() => setAdjType(t)} className={`${segCls(adjType === t, "px-2", "px-2")} flex-1`}>
                        <span className="material-symbols-rounded" style={{ fontSize: 18, marginRight: 4 }}>{icon}</span>{text}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <p className={lblCls}>Apply as</p>
                  <div className="flex w-full">
                    {([["dollar", "Amount", "attach_money"], ["pct", "Percentage", "percent"]] as const).map(([u, text, icon]) => (
                      <button key={u} onClick={() => setUnit(u)} className={`${segCls(unit === u, "px-2", "px-2")} flex-1`}>
                        <span className="material-symbols-rounded" style={{ fontSize: 18, marginRight: 4 }}>{icon}</span>{text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Value — label + input reflect the selected unit */}
              <div className="mb-4">
                <p className={lblCls}>{unit === "dollar" ? "Amount" : "Percentage"}</p>
                <div className="relative">
                  {unit === "dollar" && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af] pointer-events-none">$</span>}
                  <input data-zone="text_field" type="text" inputMode="decimal" value={rawValue}
                    onChange={e => setRawValue(e.target.value)}
                    onBlur={() => setAmountTouched(true)}
                    placeholder={unit === "pct" ? "e.g. 9" : "e.g. 5000"}
                    className={`w-full ${fieldCls(!!amountError)} ${unit === "dollar" ? "pl-7" : "pr-8"}`} />
                  {unit === "pct" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af] pointer-events-none">%</span>}
                </div>
                {amountError
                  ? <p className="text-[11px] text-[#f05252] mt-1.5">{amountError}</p>
                  : isValidAmount && <p className="text-xs text-[#9ca3af] mt-1.5">{unit === "dollar" ? `≈ ${Math.round(pct)}% of your ${fmt0(base)} base` : `= ${fmt0(Math.round(dollars))} of your ${fmt0(base)} base`}</p>}
              </div>

              {/* New value */}
              <div>
                <p className={lblCls}>New value</p>
                <p className="text-2xl font-semibold text-[#111827] leading-tight">
                  {fmt0(isValidAmount ? newProjection : currentProjection)}
                  {isValidAmount && signedDollars !== 0 && (
                    <span className={`ml-2 text-sm font-medium ${signedDollars > 0 ? "text-[#0e9f6e]" : "text-[#f05252]"}`}>
                      {signedDollars > 0 ? "+" : "−"}{fmt0(Math.abs(Math.round(signedDollars)))}
                    </span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-1">
                <p className={lblCls}>Amount</p>
                <div className="flex gap-2">
                  <div className={`${segWrapCls} flex-shrink-0`}>
                    {(["pct", "dollar"] as const).map(u => (
                      <button key={u} onClick={() => setUnit(u)} className={segCls(unit === u, "px-3", "px-2.5")}>
                        {u === "pct" ? "%" : "$"}
                      </button>
                    ))}
                  </div>
                  <input data-zone="text_field" type="text" inputMode="decimal" value={rawValue}
                    onChange={e => setRawValue(e.target.value)}
                    onBlur={() => setAmountTouched(true)}
                    placeholder={unit === "pct" ? "e.g. 9" : "e.g. 5000"}
                    className={`flex-1 ${fieldCls(!!amountError)}`} />
                </div>
                {amountError && <p className="text-[11px] text-red-500 mt-1">{amountError}</p>}
              </div>
              {isValidAmount && (
                <p className="text-[11px] text-[#6b7280] mt-2 leading-snug">
                  {unit === "dollar"
                    ? <>≈{Math.round(pct)}% of your {fmt0(base)} base · new projection <span className="font-semibold text-[#0168dd]">{fmt0(newProjection)}</span></>
                    : <>= {fmt0(Math.round(dollars))} of your {fmt0(base)} base · new projection <span className="font-semibold text-[#0168dd]">{fmt0(newProjection)}</span></>}
                </p>
              )}
            </>
          )}

          {/* Warnings */}
          {showSanityWarn && <p data-zone="alert" className="text-[11px] text-amber-600 mt-1.5">Large adjustment — double-check the amount.</p>}
          {showClampWarn  && <p data-zone="alert" className="text-[11px] text-red-500 mt-1.5">This reduction would bring the projection below $0.</p>}

          {/* Footer */}
          <div className={`flex items-center justify-between ${zone ? "mt-6 pt-5" : "mt-6 pt-4 border-t border-[#e5e7eb]"}`}>
            <button onClick={onClose} className={zone ? zbtn("ghostGray", "md") : "px-4 py-2 text-sm font-medium text-[#6b7280] hover:text-[#111827] transition-colors"}>Cancel</button>
            <button onClick={handleSave} disabled={!isValid}
              className={zone
                ? (isValid ? zbtn("solidPrimary", "md") : `${ZBTN_BASE} ${ZBTN_SIZE.md} ${ZBTN_VARIANT.solidPrimary} opacity-30 cursor-not-allowed`)
                : `px-5 py-2 rounded-lg text-sm font-semibold transition-all ${isValid ? "bg-[#0168dd] text-white hover:bg-[#0057bb]" : "bg-[#e5e7eb] text-[#d1d5db] cursor-not-allowed"}`}>
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
      <div className="grid grid-cols-3 divide-x divide-[#e5e7eb] border-b border-[#e5e7eb]">
        {/* Card 1 — base */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1 h-[21px] flex items-center">Monthly avg payout</p>
          <p className="text-3xl font-bold text-[#111827] tracking-tight">{fmt0(v1AvgMonthly)}</p>
          <p className="text-[11px] text-[#6b7280] mt-0.5">last 5 months</p>
          <div className="flex items-center gap-x-2 gap-y-1 mt-2 flex-wrap text-[10px] text-[#6b7280]">
            <div className="flex items-center gap-1 border-r border-[#e5e7eb] pr-2 mr-1">
              <UserCircle2 size={13} className="text-[#111827]" /><span className="font-semibold text-[#111827]">{v1CurrMembers}</span>
            </div>
            {v1PayTypes.map((pt, i) => (
              <div key={pt.key} className="flex items-center gap-1">
                {i > 0 && <span className="text-[#d1d5db]">·</span>}
                <span className="font-semibold text-[#111827]">{pt.count}</span><span>{pt.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 — adjustments */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] h-[21px] flex items-center">Adjustments</p>
            <button onClick={() => { setEditingAdj(null); setShowAddDialog(true); }}
              className="flex items-center gap-0.5 text-[10px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2 py-0.5 hover:bg-[#0168dd]/5 transition-colors select-none">
              <Plus size={10} /> Add adjustment
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${adjPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>{adjPct >= 0 ? "+" : ""}{adjPct}%</span>
            {adjPct >= 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-400" />}
          </div>
          <div className="mt-2 divide-y divide-[#f3f4f6]">
            {([
              { label: "Headcount change", pct: v1cMemberPct, note: `${v1CurrMembers} this cycle vs avg ${v1AvgMembers}`, positive: true },
              { label: "Seasonality",   pct: v1cSeasonPct, note: "May is typically above avg.",                       positive: true },
            ] as const).map(({ label, pct, note, positive }) => {
              const isSeason = label === "Seasonality";
              if (isSeason && !seasonalityOn) return null;
              return (
                <div key={label} className="flex items-center gap-1.5 text-xs py-1.5 min-w-0">
                  <span className={`font-semibold flex-shrink-0 ${positive ? "text-emerald-600" : "text-red-500"}`}>{positive ? "+" : ""}{pct}%</span>
                  <span className="text-[#111827] font-medium flex-shrink-0">{label}</span>
                  <span className="text-[#d1d5db] flex-shrink-0">—</span>
                  <span className="text-[#6b7280] truncate">{note}</span>
                </div>
              );
            })}
            {manualAdjustments.map(adj => (
              <div key={adj.id} className="flex items-center gap-1.5 text-xs py-1.5 min-w-0">
                <span className={`font-semibold flex-shrink-0 ${adj.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{adj.type === "add" ? "+" : "−"}{adj.unit === "pct" ? `${adj.value}%` : `≈${Math.round(adj.pct)}%`}</span>
                <span className="text-[#111827] font-medium flex-shrink-0">{adj.label}</span>
                <span className="text-[#d1d5db] flex-shrink-0">—</span>
                <span className="text-[#6b7280] flex-shrink-0">{adj.unit === "dollar" ? fmt0(Math.round(adj.dollars)) : `≈${fmt0(Math.round(adj.dollars))}`}</span>
                <span className="text-[9px] font-medium bg-[#f3f4f6] text-[#6b7280] rounded px-1.5 py-0.5 flex-shrink-0">Added by you</span>
                <button onClick={() => { setEditingAdj(adj); setShowAddDialog(true); }} className="ml-auto flex-shrink-0 p-0.5 rounded text-[#6b7280] hover:text-[#0168dd] hover:bg-[#f3f4f6] transition-colors"><Pencil size={11} /></button>
                <button onClick={() => setManualAdjustments(prev => prev.filter(a => a.id !== adj.id))} className="flex-shrink-0 p-0.5 rounded text-[#6b7280] hover:text-red-500 hover:bg-red-50 transition-colors"><X size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 — projection */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1 h-[21px] flex items-center">Recommended projection</p>
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
            <div className="flex justify-between text-[10px] text-[#6b7280] mt-0.5">
              <span>{fmt0(v1AvgMonthly)} avg</span>
              <span>{fmt0(adjProj)} total</span>
            </div>
            <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-20 pointer-events-none">
              <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 w-48">
                {v1cBarHoverRows.map(({ label, color, value, pct }) => {
                  const k = value / 1000;
                  const fmtK = `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
                  return (
                    <div key={label} className="flex items-center justify-between text-[11px] font-semibold mb-1 last:mb-0 text-[#6b7280]">
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
      <div className="flex divide-x divide-[#e5e7eb]">
        <div className="flex-1 px-5 py-4 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-0.5">Week-by-week distribution</p>
              {chartView === "a" ? (
                <p className="text-[11px] text-[#6b7280]">
                  {showStatusBreakdown
                    ? "Past weeks: paid · pending · failed — future: planned + projected"
                    : "Past weeks show confirmed · current & future show planned + projected"}
                </p>
              ) : chartView === "b" ? (
                <p className="text-[11px] text-[#6b7280]">Amounts owed per payment provider per week</p>
              ) : (
                <p className="text-[11px] text-[#6b7280]">Stable base sits at the bottom · variable earnings stack on top</p>
              )}
            </div>
            <div className="flex items-center bg-[#f3f4f6] rounded-md p-0.5 flex-shrink-0 ml-4">
              {([["a","By source of prediction"],["b","By cash flow channel"],["c","By earning type"]] as const).map(([v, lbl]) => (
                <button key={v} onClick={() => setChartView(v)} className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${chartView === v ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280]"}`}>{lbl}</button>
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
                  <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1cSourceData} />} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload as typeof v1cSourceData[0];
                    if (!d) return null;
                    const items = [
                      { key: "paid",      label: "Paid",      color: "#0e9f6e", value: d.paid      },
                      { key: "pending",   label: "Pending",   color: "#f59e0b", value: d.pending   },
                      { key: "failed",    label: "Failed",    color: "#ef4444", value: d.failed    },
                      { key: "tracked",   label: "Planned",   color: "#0168dd", value: d.tracked   },
                      { key: "projected", label: "Projected", color: "#85baf5", value: d.projected },
                    ].filter(i => i.value > 0);
                    const total = items.reduce((s, i) => s + i.value, 0);
                    return (
                      <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs min-w-[160px]">
                        <p className="font-semibold text-[#111827] mb-1.5">{d.week} · {d.dateLabel}</p>
                        {items.map(i => (
                          <div key={i.key} className="flex justify-between gap-4 py-0.5">
                            <span style={{ color: i.color }}>{i.label}</span>
                            <span className="font-medium text-[#111827]">{fmt0(i.value)}</span>
                          </div>
                        ))}
                        {items.length > 1 && <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]"><span className="text-[#6b7280]">Total</span><span className="font-semibold text-[#111827]">{fmt0(total)}</span></div>}
                      </div>
                    );
                  }} cursor={{ fill: "#f9fafb" }} />
                  <Bar dataKey="paid"      name="Paid"      stackId="s" fill="#0e9f6e" radius={[0,0,0,0]} />
                  <Bar dataKey="pending"   name="Pending"   stackId="s" fill="#f59e0b" radius={[0,0,0,0]} />
                  <Bar dataKey="failed"    name="Failed"    stackId="s" fill="#ef4444" radius={[0,0,0,0]} />
                  <Bar dataKey="tracked"   name="Planned"   stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
                  <Bar dataKey="projected" name="Projected" stackId="s" fill="#85baf5" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer key="v1c-bar-a-simple" width="100%" height={160}>
                <BarChart data={mergedSourceData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={mergedSourceData} />} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload as typeof mergedSourceData[0];
                    if (!d) return null;
                    const items = [
                      { key: "factual",   label: "Confirmed", color: "#0e9f6e", value: d.factual   },
                      { key: "tracked",   label: "Planned",   color: "#0168dd", value: d.tracked   },
                      { key: "projected", label: "Projected", color: "#85baf5", value: d.projected },
                    ].filter(i => i.value > 0);
                    const total = items.reduce((s, i) => s + i.value, 0);
                    return (
                      <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs min-w-[160px]">
                        <p className="font-semibold text-[#111827] mb-1.5">{d.week} · {d.dateLabel}</p>
                        {items.map(i => (
                          <div key={i.key} className="flex justify-between gap-4 py-0.5">
                            <span style={{ color: i.color }}>{i.label}</span>
                            <span className="font-medium text-[#111827]">{fmt0(i.value)}</span>
                          </div>
                        ))}
                        {items.length > 1 && <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]"><span className="text-[#6b7280]">Total</span><span className="font-semibold text-[#111827]">{fmt0(total)}</span></div>}
                      </div>
                    );
                  }} cursor={{ fill: "#f9fafb" }} />
                  <Bar dataKey="factual"   name="Confirmed" stackId="s" fill="#0e9f6e" radius={[4,4,0,0]} />
                  <Bar dataKey="tracked"   name="Planned"   stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
                  <Bar dataKey="projected" name="Projected" stackId="s" fill="#85baf5" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          ) : chartView === "b" ? (
            <ResponsiveContainer key="v1c-bar-b" width="100%" height={160}>
              <BarChart data={v1ProviderWeekData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1ProviderWeekData} />} axisLine={false} tickLine={false} interval={0} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="factual"  name="Confirmed" stackId="s" fill="#0e9f6e" radius={[4,4,0,0]} />
                <Bar dataKey="Wise"     name="Wise"      stackId="s" fill="#0e9f6e" radius={[0,0,0,0]} />
                <Bar dataKey="Payoneer" name="Payoneer"  stackId="s" fill="#f59e0b" radius={[0,0,0,0]} />
                <Bar dataKey="Deel"     name="Deel"      stackId="s" fill="#7c3aed" radius={[0,0,0,0]} />
                <Bar dataKey="Export"   name="Export"    stackId="s" fill="#6b7280" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer key="v1c-bar-c" width="100%" height={160}>
              <BarChart data={v1cEarningTypeData} margin={{ top: 4, right: 4, left: 0, bottom: 28 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="week" tick={(p) => <WeekTick {...p} data={v1cEarningTypeData} />} axisLine={false} tickLine={false} interval={0} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload as typeof v1cEarningTypeData[0];
                  if (!d) return null;
                  return (
                    <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs min-w-[180px]">
                      <p className="font-semibold text-[#111827] mb-1.5">{d.week} · {d.dateLabel}</p>
                      {v1cEarningTypes.map(({ key, label, color }) => {
                        const val = d[key as keyof typeof d] as number;
                        const pct = Math.round(val / d.total * 100);
                        return (
                          <div key={key} className="flex justify-between gap-3 py-0.5 text-[11px]">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-sm flex-shrink-0 inline-block" style={{ background: color }} />
                              <span className="text-[#6b7280]">{label}</span>
                            </span>
                            <span className="font-medium text-[#111827]">{fmt0(val)} <span className="text-[#6b7280]">({pct}%)</span></span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between mt-1 pt-1.5 border-t border-[#e5e7eb] font-semibold text-[11px]">
                        <span className="text-[#6b7280]">Total</span>
                        <span className="text-[#111827]">{fmt0(d.total)}</span>
                      </div>
                    </div>
                  );
                }} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="hourly"  name="Hourly pay"     stackId="s" fill="#0168dd" radius={[0,0,0,0]} />
                <Bar dataKey="fixed"   name="Fixed pay"      stackId="s" fill="#0e9f6e" radius={[0,0,0,0]} />
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
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-[#6b7280]">
                      {group === "stable" ? "Stable base" : "Variable — Watch"}
                    </span>
                    {v1cEarningTypes.filter(t => t.group === group).map(({ key, label, color }) => (
                      <div key={key} className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
                        <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                        {label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : chartView === "b" ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#0e9f6e" }} />
                  Confirmed
                </div>
                {v1cProviders.map(({ key, letter, color }) => (
                  <div key={key} className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
                    <ProviderLetterBadge letter={letter} color={color} size={12} />
                    {key}
                  </div>
                ))}
              </div>
            ) : (
              showStatusBreakdown ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {([
                    { label: "Paid",    color: "#0e9f6e", desc: "Successfully paid out"                },
                    { label: "Pending", color: "#f59e0b", desc: "Payment created, awaiting processing" },
                    { label: "Failed",  color: "#ef4444", desc: "Payment failed — needs attention"     },
                  ] as const).map(({ label, color, desc }) => (
                    <div key={label} className="relative group flex items-center gap-1.5 text-[11px] text-[#6b7280] cursor-default">
                      <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                      {label}
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 pointer-events-none whitespace-nowrap">
                        <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs">
                          <p className="font-semibold mb-0.5" style={{ color }}>{label}</p>
                          <p className="text-[#6b7280]">{desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <span className="text-[#d1d5db] text-[10px]">·</span>
                  {([
                    { label: "Planned",   color: "#0168dd", desc: "Upcoming tracked payments"            },
                    { label: "Projected", color: "#85baf5", desc: "Estimated based on historical trends" },
                  ] as const).map(({ label, color, desc }) => (
                    <div key={label} className="relative group flex items-center gap-1.5 text-[11px] text-[#6b7280] cursor-default">
                      <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                      {label}
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 pointer-events-none whitespace-nowrap">
                        <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs">
                          <p className="font-semibold mb-0.5" style={{ color }}>{label}</p>
                          <p className="text-[#6b7280]">{desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {([
                    { label: "Confirmed", color: "#0e9f6e", desc: "Payments already received"            },
                    { label: "Planned",   color: "#0168dd", desc: "Upcoming tracked payments"            },
                    { label: "Projected", color: "#85baf5", desc: "Estimated based on historical trends" },
                  ] as const).map(({ label, color, desc }) => (
                    <div key={label} className="relative group flex items-center gap-1.5 text-[11px] text-[#6b7280] cursor-default">
                      <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                      {label}
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 pointer-events-none whitespace-nowrap">
                        <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs">
                          <p className="font-semibold mb-0.5" style={{ color }}>{label}</p>
                          <p className="text-[#6b7280]">{desc}</p>
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
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#111827]">Predictable Cash Flow</span>
            <span className="text-xs text-[#6b7280]">— based on historical payments</span>
          </div>
          <ExportDropdown />
        </div>
        <V1cPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />
      </div>
      <div className="mt-6">
        <p className="text-base font-semibold text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <span className="text-sm font-semibold text-[#111827]">Fund {provider.name}</span>
          <button onClick={onClose} className="p-1 rounded text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6]"><X size={14} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="bg-[#f9fafb] rounded-lg p-3 space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-[#6b7280]">From</span>
              <span className="text-[#111827] font-medium">Chase ···4892</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b7280]">To</span>
              <span className="text-[#111827] font-medium">{provider.name} account</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b7280]">Current balance</span>
              <span className="text-[#111827] font-medium">{fmt0(provider.balance ?? 0)}</span>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#6b7280] uppercase tracking-widest mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">$</span>
              <input
                type="text"
                value={rawAmt}
                onChange={e => setRawAmt(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-[#e5e7eb] rounded-lg text-sm font-semibold text-[#111827] focus:outline-none focus:border-[#0168dd]"
              />
            </div>
            {isValid && (
              <p className="text-[11px] text-[#6b7280] mt-1">
                Resulting balance: <span className="font-medium text-[#111827]">{fmt0(resulting)}</span>
                {resulting >= (provider.needed ?? 0) && <span className="text-emerald-600 ml-1">· Fully funded ✓</span>}
              </p>
            )}
          </div>
          <p className="text-[11px] text-[#6b7280] bg-[#f9fafb] rounded-lg p-2.5 leading-relaxed">Transfers typically arrive within 1–2 business days. Nothing moves until you confirm.</p>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 border-t border-[#e5e7eb]">
          <button onClick={onClose} className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-[#6b7280] border border-[#e5e7eb] hover:bg-[#f3f4f6] transition-colors">Cancel</button>
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb] flex-shrink-0">
          <span className="text-sm font-semibold text-[#111827]">{provider.name} — Funding settings</span>
          <button onClick={onClose} className="p-1 rounded text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6]"><X size={14} /></button>
        </div>
        <div className="flex-1 px-5 py-5 space-y-6 overflow-y-auto">
          {/* Funding mode */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280] mb-2">Funding mode</p>
            <div className="flex rounded-lg border border-[#e5e7eb] overflow-hidden">
              {(["manual", "automatic"] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-xs font-semibold capitalize transition-colors ${mode === m ? "bg-[#0168dd] text-white" : "text-[#6b7280] hover:bg-[#f9fafb]"}`}>
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
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280] mb-2">Fund ahead of payroll by</p>
              <div className="space-y-0.5">
                {leadTimeOptions.map(opt => (
                  <label key={opt.days} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#f9fafb] cursor-pointer">
                    <input type="radio" name="leadTime" checked={leadTimeDays === opt.days} onChange={() => setLeadTimeDays(opt.days)} className="accent-[#0168dd]" />
                    <span className="text-xs text-[#111827]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* Buffer */}
          {mode === "automatic" && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280] mb-2">Buffer</p>
              <div className="space-y-0.5">
                {bufferOptions.map(opt => (
                  <label key={opt.type} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#f9fafb] cursor-pointer">
                    <input type="radio" name="bufferType" checked={bufferType === opt.type} onChange={() => setBufferType(opt.type)} className="accent-[#0168dd]" />
                    <span className="text-xs text-[#111827]">{opt.label}</span>
                  </label>
                ))}
              </div>
              {bufferType !== "none" && (
                <div className="mt-2 flex items-center gap-2 pl-2">
                  <span className="text-xs text-[#6b7280]">{bufferType === "pct" ? "%" : "$"}</span>
                  <input
                    type="number"
                    value={bufferValue}
                    onChange={e => setBufferValue(Number(e.target.value))}
                    min={0}
                    className="w-20 px-2 py-1.5 border border-[#e5e7eb] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#0168dd]"
                  />
                </div>
              )}
            </div>
          )}
          {/* Reminder email */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280]">Funding reminder email</p>
              <button
                onClick={() => setReminderOn(r => !r)}
                className={`w-9 h-5 rounded-full transition-colors flex items-center ${reminderOn ? "bg-[#0168dd]" : "bg-[#d1d5db]"}`}
              >
                <span className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${reminderOn ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>
            {reminderOn && (
              <div className="mt-2 space-y-0.5">
                <p className="text-[11px] text-[#6b7280] px-2 mb-1">Send reminder email</p>
                {reminderOptions.map(opt => (
                  <label key={opt.days} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#f9fafb] cursor-pointer">
                    <input type="radio" name="reminderDays" checked={reminderDays === opt.days} onChange={() => setReminderDays(opt.days)} className="accent-[#0168dd]" />
                    <span className="text-xs text-[#111827]">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 px-5 py-3 border-t border-[#e5e7eb] flex-shrink-0">
          <button onClick={onClose} className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-[#6b7280] border border-[#e5e7eb] hover:bg-[#f3f4f6] transition-colors">Cancel</button>
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
  // Real Zone brand marks (symbol only, no container) — from the Zone Tokens & Components file.
  if (id === "wise") return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" preserveAspectRatio="xMidYMid meet" style={{ flexShrink: 0 }}>
      <path d="M14.0834 16.0538L3 29.3493H22.7899L25.0136 23.0801H16.5335L21.715 16.9305L21.7317 16.7674L18.3625 10.8142H33.5206L21.7705 44H29.8114L44 4H7.34463L14.0834 16.0538Z" fill="#163300"/>
    </svg>
  );
  if (id === "bitwage") return (
    <svg width={size} height={size} viewBox="0 0 24.0009 31.9999" fill="none" preserveAspectRatio="xMidYMid meet" style={{ flexShrink: 0 }}>
      <path d="M15.9979 8.00305H7.99893V16.002H15.9979V24.0009H7.99893C7.99893 19.5807 4.41616 16.002 0 16.002V24.0009C4.42025 24.0009 7.99893 27.5837 7.99893 31.9999H15.9979L24.0009 24.0009V16.002L15.9979 8.00305Z" fill="#1C1C1C"/>
      <path d="M0 0V8.00302H7.99893C7.99893 3.58277 4.42025 0 0 0Z" fill="#1C1C1C"/>
    </svg>
  );
  if (id === "paypal") return (
    <svg width={size} height={size} viewBox="0 0 35.4656 41.85" fill="none" preserveAspectRatio="xMidYMid meet" style={{ flexShrink: 0 }}>
      <path d="M30.1966 3.15562C28.2588 0.946923 24.7559 0 20.2747 0H7.26888C6.82551 1.64171e-05 6.39668 0.158197 6.0595 0.446103C5.72232 0.734008 5.4989 1.13275 5.42941 1.57065L0.014053 35.9162C-0.0935867 36.5935 0.430844 37.2068 1.11729 37.2068H9.1466L11.1631 24.4164L11.1005 24.8169C11.2442 23.9128 12.0174 23.246 12.933 23.246H16.7485C24.2441 23.246 30.1133 20.2015 31.8277 11.3944C31.8786 11.1339 31.9227 10.8804 31.9608 10.6327C31.7444 10.5181 31.7444 10.5181 31.9608 10.6327C32.4713 7.37749 31.9573 5.1617 30.1966 3.15562Z" fill="#27346A"/>
      <path d="M14.2354 9.46005C14.4549 9.35553 14.695 9.30137 14.9381 9.30151H25.1344C26.3418 9.30151 27.468 9.38009 28.4971 9.54572C28.7851 9.59164 29.0716 9.64645 29.3562 9.7101C29.7595 9.7991 30.1582 9.90804 30.5508 10.0365C31.0567 10.2055 31.5279 10.4022 31.9609 10.6327C32.4713 7.37624 31.9573 5.1617 30.1966 3.15562C28.2577 0.946923 24.7559 0 20.2747 0H7.26777C6.352 0 5.57293 0.666698 5.42941 1.57065L0.0140537 35.9149C-0.093586 36.5933 0.430845 37.2058 1.11618 37.2058H9.1466L13.3302 10.6755C13.3714 10.4147 13.4752 10.1679 13.6329 9.95615C13.7906 9.74442 13.9974 9.57417 14.2354 9.46005Z" fill="#27346A"/>
      <path d="M31.8277 11.3944C30.1133 20.2002 24.2442 23.246 16.7485 23.246H12.9319C12.0163 23.246 11.2429 23.9128 11.1007 24.8169L8.59199 40.7202C8.49826 41.3129 8.95663 41.85 9.5563 41.85H16.3248C16.7125 41.8499 17.0875 41.7115 17.3823 41.4596C17.677 41.2077 17.8723 40.859 17.9329 40.476L17.9988 40.1311L19.2745 32.0462L19.3567 31.5993C19.4172 31.2164 19.6125 30.8676 19.9072 30.6158C20.2019 30.3639 20.5769 30.2255 20.9646 30.2253H21.9776C28.5343 30.2253 33.6683 27.5616 35.1686 19.8577C35.7948 16.6383 35.4708 13.9503 33.8142 12.0623C33.3117 11.4905 32.6878 11.0182 31.9609 10.6327C31.9216 10.8816 31.8787 11.1339 31.8277 11.3944Z" fill="#2790C3"/>
      <path d="M30.1665 9.91731C29.8992 9.83925 29.6293 9.77014 29.3574 9.7101C29.0727 9.6475 28.7862 9.59305 28.4984 9.54683C27.4682 9.38009 26.3429 9.30151 25.1344 9.30151L14.9393 9.30137C14.6959 9.30082 14.4557 9.35546 14.2365 9.46117C13.9982 9.57493 13.7907 9.74436 13.6329 9.95615C13.4752 10.1679 13.372 10.4157 13.3312 10.6766L11.1007 24.8169C11.2432 23.9128 12.0174 23.246 12.9332 23.246H16.7498C24.2454 23.246 30.1144 20.2015 31.8288 11.3944C31.8798 11.1339 31.9227 10.8815 31.962 10.6327C31.5279 10.4035 31.058 10.2055 30.5519 10.0376C30.4242 9.99527 30.2956 9.95517 30.1665 9.91731Z" fill="#1F264F"/>
    </svg>
  );
  if (id === "deel") return (
    <svg width={size} height={size} viewBox="0 0 25.3431 23.9913" fill="none" preserveAspectRatio="xMidYMid meet" style={{ flexShrink: 0 }}>
      <path d="M0 14.5794C0 8.06321 4.15956 5.16756 8.72063 5.16756C12.8834 5.16756 14.6387 7.81245 14.6387 7.81245V0H19.1473V19.253C19.1473 20.8334 19.2017 22.2595 19.312 23.5311H14.6402V21.3702C14.6402 21.3702 12.8513 23.9913 8.7221 23.9913C4.32007 23.9913 0 21.4653 0 14.5794ZM9.87217 20.5319C13.0653 20.5319 15.1298 18.1015 15.1298 14.5794C15.1298 10.9342 13.0638 8.62696 9.87217 8.62696C6.68049 8.62696 4.69086 10.8203 4.69086 14.5794C4.69086 18.3386 6.76428 20.5319 9.87217 20.5319Z" fill="#1B1B1B"/>
      <path d="M21 19.3047H25.3431V23.5162H21V19.3047Z" fill="#1B1B1B"/>
    </svg>
  );
  if (id === "export") return <FileSpreadsheet size={size} className="text-[#111827]" style={{ flexShrink: 0 }} />;
  if (id === "gusto") return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill="#F45D48"/>
      <text x="16" y="22" textAnchor="middle" fontSize="17" fontWeight="700" fill="white" fontFamily="Inter, sans-serif">G</text>
    </svg>
  );
  // Payoneer: pending correct Zone asset (node 9293:73 exported a rainbow ring, not the Payoneer mark).
  if (id === "payoneer") return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill="#F05A28"/>
      <path fillRule="evenodd" d="M10 8V24H13V19H17C20.5 19 23 17 23 13.5C23 10 20.5 8 17 8H10ZM13 11H16.5C18.5 11 20 12 20 13.5C20 15 18.5 16 16.5 16H13V11Z" fill="white"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill="#e5e7eb"/>
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
        <div className="flex items-start justify-between px-5 py-3.5 border-b border-[#e5e7eb] bg-[#f9fafb] flex-shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#111827]">Action needed: Fund your {provider.name} account before payroll runs</p>
            <p className="text-[10px] text-[#6b7280] mt-1">From: <span className="text-[#111827]">Hubstaff Payments &lt;payments@hubstaff.com&gt;</span></p>
            <p className="text-[10px] text-[#6b7280]">To: <span className="text-[#111827]">zishe@company.com</span><span className="mx-1.5 text-[#d1d5db]">·</span><span>Jun 25, 2026, 8:00 AM</span></p>
          </div>
          <button onClick={onClose} className="ml-3 p-1 rounded text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] flex-shrink-0"><X size={14} /></button>
        </div>
        {/* Email body */}
        <div className="flex-1 overflow-y-auto bg-[#f3f4f6] p-5">
          <div className="bg-white rounded-lg overflow-hidden max-w-[460px] mx-auto shadow-sm border border-[#e5e7eb]">
            {/* Brand header */}
            <div className="bg-[#0168dd] px-6 py-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-[#0168dd] rounded-sm" />
              </div>
              <span className="text-white text-sm font-bold tracking-tight">Hubstaff</span>
            </div>
            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-[#111827]">Hi Zishe,</p>
              <p className="text-sm text-[#111827] leading-relaxed">
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
                    <span className="text-[#6b7280]">Current balance</span>
                    <span className="font-medium text-[#111827]">{fmt0(provider.balance ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Needed by Jun 28</span>
                    <span className="font-medium text-[#111827]">{fmt0(provider.needed ?? 0)}</span>
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
              <p className="text-[11px] text-[#6b7280] leading-relaxed">
                This reminder was sent because you have <strong>Manual</strong> funding mode enabled for {provider.name}. To switch to automatic funding, <span className="text-[#0168dd] cursor-pointer">update your preferences</span>.
              </p>
            </div>
            {/* Footer */}
            <div className="border-t border-[#e5e7eb] px-6 py-4 bg-[#f9fafb] text-center space-y-1">
              <p className="text-[10px] text-[#6b7280]">
                You're receiving this because funding reminders are enabled for your account.
              </p>
              <p className="text-[10px]">
                <span className="text-[#0168dd] cursor-pointer">Manage notification preferences</span>
                <span className="text-[#d1d5db] mx-1">·</span>
                <span className="text-[#0168dd] cursor-pointer">Unsubscribe</span>
              </p>
              <p className="text-[10px] text-[#d1d5db] mt-1">Hubstaff Inc. · 300 Colonial Center Pkwy, Roswell, GA 30076</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FundYourAccountsPanel({ showBars = true }: { showBars?: boolean }) {
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
            <p className="text-base font-semibold text-[#111827]">Fund your accounts</p>
            <p className="text-xs text-[#6b7280] mt-0.5">
              {totalShortfall > 0
                ? <span>Recommended for this period: <span className="font-medium text-amber-600">{fmt0(totalShortfall)}</span> to add across {needsFundingRows.length} account{needsFundingRows.length !== 1 ? "s" : ""}</span>
                : <span className="text-emerald-600 font-medium">All accounts funded for this period ✓</span>
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0 border border-[#e5e7eb] rounded-md overflow-hidden">
              <button onClick={() => setLayout("list")} title="List view" className={`px-2 py-1 transition-colors ${layout === "list" ? "bg-[#0168dd] text-white" : "text-[#6b7280] hover:bg-[#f3f4f6]"}`}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="2" width="16" height="2" rx="1"/><rect x="0" y="7" width="16" height="2" rx="1"/><rect x="0" y="12" width="16" height="2" rx="1"/></svg>
              </button>
              <button onClick={() => setLayout("cards")} title="Card view" className={`px-2 py-1 transition-colors ${layout === "cards" ? "bg-[#0168dd] text-white" : "text-[#6b7280] hover:bg-[#f3f4f6]"}`}>
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
                <div key={p.id} className="border border-[#e5e7eb] bg-white rounded-xl p-3.5 flex flex-col gap-2.5">
                  {/* Header: logo + name | go-to / connect action */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <ProviderLogo id={p.id} size={28} />
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => connected ? setEmailProvider(p) : undefined}
                          className={`text-xs font-semibold text-[#111827] leading-tight text-left ${connected ? "hover:text-[#0168dd] hover:underline" : ""}`}
                        >{p.name}</button>
                        {p.status === "no-connection" && (
                          <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide self-start bg-[#f3f4f6] text-[#d1d5db]">not connected</span>
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
                          <p className="text-[10px] text-[#6b7280]">Balance</p>
                          <div className="flex items-center gap-1">
                            <span className={`text-sm font-bold ${isRefreshing ? "text-[#6b7280]" : "text-[#111827]"}`}>{isRefreshing ? "…" : fmt0(p.balance!)}</span>
                            <button onClick={() => handleRefresh(p.id)} className="text-[#d1d5db] hover:text-[#0168dd] transition-colors">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        {p.status === "needs-funding" && shortfall !== null && (
                          <div className="text-right">
                            <p className="text-[10px] text-[#6b7280]">Add to cover</p>
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
                      {showBars && (
                        <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${p.status === "funded" ? "bg-emerald-400" : "bg-amber-400"}`} style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
            <div className="divide-y divide-[#f3f4f6]">
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
                            className={`text-sm font-semibold text-[#111827] ${p.status !== "no-connection" ? "hover:text-[#0168dd] hover:underline cursor-pointer" : "cursor-default"} transition-colors`}
                          >{p.name}</button>
                          {p.status !== "no-connection" && (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${p.mode === "automatic" ? "bg-[#eef3ff] text-[#0168dd]" : "bg-[#f3f4f6] text-[#6b7280]"}`}>
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
                            <span className={`text-xs font-semibold ${isRefreshing ? "text-[#6b7280]" : "text-[#111827]"}`}>{isRefreshing ? "Refreshing…" : fmt0(p.balance!)}</span>
                            <span className="text-[10px] text-[#6b7280]">balance</span>
                            <button onClick={() => handleRefresh(p.id)} className="ml-0.5 p-0.5 rounded text-[#d1d5db] hover:text-[#0168dd] transition-colors">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                              </svg>
                            </button>
                            <span className="text-[10px] text-[#d1d5db]">·</span>
                            <span className="text-[10px] text-[#6b7280]">{p.lastUpdated}</span>
                          </div>
                        )}
                      </div>
                      {p.status === "funded" && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Funded
                          </span>
                          <button onClick={() => setSettingsProvider(p)} className="p-1 rounded text-[#d1d5db] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors"><Settings size={12} /></button>
                        </div>
                      )}
                      {p.status === "needs-funding" && shortfall !== null && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right mr-1">
                            <p className="text-[10px] text-[#6b7280]">Add to cover</p>
                            <p className="text-sm font-bold text-amber-600">+{fmt0(shortfall)}</p>
                          </div>
                          <button onClick={() => setPrefundProvider(p)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0168dd] text-white hover:bg-[#0059c2] transition-colors whitespace-nowrap">
                            Prefund {p.name}
                          </button>
                          <button onClick={() => setSettingsProvider(p)} className="p-1 rounded text-[#d1d5db] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors"><Settings size={12} /></button>
                        </div>
                      )}
                    </div>
                    {showBars && p.status !== "no-connection" && p.balance !== undefined && p.needed !== undefined && (
                      <div className="mt-2 ml-11 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${p.status === "funded" ? "bg-emerald-400" : "bg-amber-400"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-[#6b7280] flex-shrink-0">{fmt0(p.balance)} of {fmt0(p.needed)} needed</span>
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
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#111827]">Predictable Cash Flow</span>
            <span className="text-xs text-[#6b7280]">— based on historical payments</span>
          </div>
          <ExportDropdown />
        </div>
        <V1cPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />
      </div>
      <FundYourAccountsPanel />
      <div>
        <p className="text-base font-semibold text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
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

// Forward-looking: current month (split actual+projected) + N months ahead (fully projected).
const v1e3mBars: V1eBar[] = [
  { label: "Jun", actual: 66600, projected: v1AvgMonthly - 66600, isCurrent: true },
  { label: "Jul", actual: 0,     projected: 121000 },
  { label: "Aug", actual: 0,     projected: 117800 },
];
const v1e6mBars: V1eBar[] = [
  { label: "Jun", actual: 66600, projected: v1AvgMonthly - 66600, isCurrent: true },
  { label: "Jul", actual: 0, projected: 121000 },
  { label: "Aug", actual: 0, projected: 117800 },
  { label: "Sep", actual: 0, projected: 123000 },
  { label: "Oct", actual: 0, projected: 120000 },
  { label: "Nov", actual: 0, projected: 125000 },
];
const v1e12mBars: V1eBar[] = [
  { label: "Jun '26", actual: 66600, projected: v1AvgMonthly - 66600, isCurrent: true },
  { label: "Jul '26", actual: 0, projected: 121000 },
  { label: "Aug '26", actual: 0, projected: 117800 },
  { label: "Sep '26", actual: 0, projected: 123000 },
  { label: "Oct '26", actual: 0, projected: 120000 },
  { label: "Nov '26", actual: 0, projected: 125000 },
  { label: "Dec '26", actual: 0, projected: 129300 },
  { label: "Jan '27", actual: 0, projected: 122000 },
  { label: "Feb '27", actual: 0, projected: 124100 },
  { label: "Mar '27", actual: 0, projected: 127200 },
  { label: "Apr '27", actual: 0, projected: 126200 },
  { label: "May '27", actual: 0, projected: 130300 },
];

// Same month last year (for the 12M YoY side-by-side comparison).
const v1e3mYoY  = [{ label:"Jun", yoy:97600 }, { label:"Jul", yoy:100300 }, { label:"Aug", yoy:98000 }];
const v1e6mYoY  = [
  { label:"Jun", yoy:97600 }, { label:"Jul", yoy:100300 }, { label:"Aug", yoy:98000 },
  { label:"Sep", yoy:102200 }, { label:"Oct", yoy:100500 }, { label:"Nov", yoy:104300 },
];
const v1e12mYoY = [
  { label:"Jun '26", yoy:97600 }, { label:"Jul '26", yoy:100300 }, { label:"Aug '26", yoy:98000 },
  { label:"Sep '26", yoy:102200 }, { label:"Oct '26", yoy:100500 }, { label:"Nov '26", yoy:104300 },
  { label:"Dec '26", yoy:107400 }, { label:"Jan '27", yoy:102600 }, { label:"Feb '27", yoy:104500 },
  { label:"Mar '27", yoy:106300 }, { label:"Apr '27", yoy:105300 }, { label:"May '27", yoy:108400 },
];

// Full month navigation for the single-month picker — PAST (settled), current (split), and near future.
// Lets users select any specific month and look back into history.
const v1eMonthNav: V1eBar[] = [
  { label: "Jul '25", actual: 100700, projected: 0 },
  { label: "Aug '25", actual: 106800, projected: 0 },
  { label: "Sep '25", actual: 103800, projected: 0 },
  { label: "Oct '25", actual: 108600, projected: 0 },
  { label: "Nov '25", actual: 106100, projected: 0 },
  { label: "Dec '25", actual: 115900, projected: 0 },
  { label: "Jan '26", actual: 109000, projected: 0 },
  { label: "Feb '26", actual: 113000, projected: 0 },
  { label: "Mar '26", actual: 104000, projected: 0 },
  { label: "Apr '26", actual: 117000, projected: 0 },
  { label: "May '26", actual: 112000, projected: 0 },
  { label: "Jun '26", actual: 66600, projected: v1AvgMonthly - 66600, isCurrent: true },
  { label: "Jul '26", actual: 0, projected: 121000 },
  { label: "Aug '26", actual: 0, projected: 117800 },
  { label: "Sep '26", actual: 0, projected: 123000 },
  { label: "Oct '26", actual: 0, projected: 120000 },
  { label: "Nov '26", actual: 0, projected: 125000 },
  { label: "Dec '26", actual: 0, projected: 129300 },
];

// ── Continuous month timeline for the Explore chart's start-month navigation (Final UI) ──
// Past = settled actuals · Jun '26 = current (split actual/projected) · future = projected.
// `yoy` = same month one year earlier (used by the "vs last year" comparison bars).
// The 3M/6M/12M control picks the WINDOW LENGTH; `startMonth` picks the left edge, so the
// user can slide the window into the past or future instead of always starting from "now".
const v1eTimeline: (V1eBar & { yoy: number })[] = [
  { label: "Jul '25", actual: 100700, projected: 0, yoy: 92600 },
  { label: "Aug '25", actual: 106800, projected: 0, yoy: 98100 },
  { label: "Sep '25", actual: 103800, projected: 0, yoy: 95500 },
  { label: "Oct '25", actual: 108600, projected: 0, yoy: 99900 },
  { label: "Nov '25", actual: 106100, projected: 0, yoy: 97600 },
  { label: "Dec '25", actual: 115900, projected: 0, yoy: 106600 },
  { label: "Jan '26", actual: 109000, projected: 0, yoy: 100300 },
  { label: "Feb '26", actual: 113000, projected: 0, yoy: 104000 },
  { label: "Mar '26", actual: 104000, projected: 0, yoy: 95700 },
  { label: "Apr '26", actual: 117000, projected: 0, yoy: 107600 },
  { label: "May '26", actual: 112000, projected: 0, yoy: 103000 },
  { label: "Jun '26", actual: 66600, projected: v1AvgMonthly - 66600, isCurrent: true, yoy: 97600 },
  { label: "Jul '26", actual: 0, projected: 121000, yoy: 100300 },
  { label: "Aug '26", actual: 0, projected: 117800, yoy: 98000 },
  { label: "Sep '26", actual: 0, projected: 123000, yoy: 102200 },
  { label: "Oct '26", actual: 0, projected: 120000, yoy: 100500 },
  { label: "Nov '26", actual: 0, projected: 125000, yoy: 104300 },
  { label: "Dec '26", actual: 0, projected: 129300, yoy: 107400 },
  { label: "Jan '27", actual: 0, projected: 122000, yoy: 102600 },
  { label: "Feb '27", actual: 0, projected: 124100, yoy: 104500 },
  { label: "Mar '27", actual: 0, projected: 127200, yoy: 106300 },
  { label: "Apr '27", actual: 0, projected: 126200, yoy: 105300 },
  { label: "May '27", actual: 0, projected: 130300, yoy: 108400 },
];
const v1eCurrentLabel = "Jun '26"; // "today" in the prototype's world
const v1eWinLen: Record<V1eRange, number> = { "1M": 1, "3M": 3, "6M": 6, "12M": 12 };
// "Jun – Aug 2026" / "Jun 2026 – May 2027" from the window's first & last bars.
function v1eRangePeriodLabel(bars: { label: string }[]): string {
  if (!bars.length) return "";
  const shortMon = (l: string) => l.replace(/ '\d\d$/, "");
  const yr = (l: string) => { const m = l.match(/'(\d\d)$/); return m ? `20${m[1]}` : "2026"; };
  const f = bars[0].label, l = bars[bars.length - 1].label;
  if (bars.length === 1) return `${v1eMonthNames[shortMon(f)] ?? shortMon(f)} ${yr(f)}`;
  return yr(f) === yr(l) ? `${shortMon(f)} – ${shortMon(l)} ${yr(l)}` : `${shortMon(f)} ${yr(f)} – ${shortMon(l)} ${yr(l)}`;
}

// Segment definitions — the same three lenses V1c offers, reused across ranges.
type V1eSeg = "source" | "channel" | "type";

const v1eChannelSeg = [
  { key: "Wise",     label: "Wise",     color: "#0e9f6e", ratio: 0.46 },
  { key: "Payoneer", label: "Payoneer", color: "#f59e0b", ratio: 0.32 },
  { key: "Deel",     label: "Deel",     color: "#7c3aed", ratio: 0.18 },
  { key: "Export",   label: "Export",   color: "#6b7280", ratio: 0.04 },
] as const;

const v1eEarningSeg = [
  { key: "hourly",  label: "Hourly pay",     color: "#0168dd", ratio: 0.46, group: "stable"   },
  { key: "fixed",   label: "Fixed pay",      color: "#0e9f6e", ratio: 0.27, group: "stable"   },
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
// Same month, one year earlier: "Jul '25" → "Jul '24".
function v1ePrevYearLabel(barLabel: string): string {
  const m = barLabel.match(/^(.*) '(\d\d)$/);
  if (!m) return `${barLabel} (last yr)`;
  const py = String(Number(m[2]) - 1).padStart(2, "0");
  return `${m[1]} '${py}`;
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
  memberPct: number; seasonPct: number; baseline: number; lookback: string;
  periodLabel: string; todayBar: string;
  bars: V1eBar[]; yoy: { label: string; yoy: number }[];
}> = {
  // baseline = trailing-window monthly average (longer lookback pulls in older, lower months as the team grows)
  // seasonality shrinks as the window widens toward a full year, where it nets out to ~0
  "1M":  { memberPct: 18, seasonPct: 10, baseline: 111000, lookback: "5 months",  periodLabel: "June 2026",           todayBar: "",        bars: [], yoy: [] },
  "3M":  { memberPct: 14, seasonPct: 5,  baseline: 109700, lookback: "6 months",  periodLabel: "Jun – Aug 2026",      todayBar: "Jun",     bars: v1e3mBars, yoy: v1e3mYoY  },
  "6M":  { memberPct: 12, seasonPct: 3,  baseline: 107800, lookback: "9 months",  periodLabel: "Jun – Nov 2026",      todayBar: "Jun",     bars: v1e6mBars, yoy: v1e6mYoY  },
  "12M": { memberPct:  9, seasonPct: 0,  baseline: 105900, lookback: "12 months", periodLabel: "Jun 2026 – May 2027", todayBar: "Jun '26", bars: v1e12mBars, yoy: v1e12mYoY },
};

// Skeleton shown while a range change "re-queries" (data pull is heavy / not instant).
function ChartSkeleton({ bars = 8 }: { bars?: number }) {
  const heights = [62, 84, 55, 90, 70, 48, 82, 66, 88, 58, 76, 52];
  return (
    <div className="h-[180px] flex items-end gap-2 px-1 animate-pulse" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="flex-1 bg-[#f3f4f6] rounded-t" style={{ height: `${heights[i % heights.length]}%` }} />
      ))}
    </div>
  );
}

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
  const [loading, setLoading]       = useState(false); // brief skeleton while a range change "re-queries"

  // Connected range: changing the range re-pulls data for the whole card.
  const applyRange = (r: V1eRange) => {
    setRange(r); setDrillMonth(null); setMonthPickerOpen(false);
    if (r !== "12M") setShowYoY(false);
    setLoading(true); setTimeout(() => setLoading(false), 550);
  };

  const cfg  = v1eRangeCfg[range];
  const baseline = cfg.baseline;   // trailing-window average for the selected range
  const is1M = range === "1M";
  const isWeekly = is1M || !!drillMonth;

  const adjCompare = is1M ? "vs your typical month"
                   : range === "3M" ? "vs your typical 3 months"
                   : range === "6M" ? "vs your typical 6 months"
                   : "vs last year";

  // The whole card is scoped to this period — surface it in the title.
  const headerPeriod = drillMonth ? v1eFullMonthLabel(drillMonth) : is1M ? v1eFullMonthLabel(oneMonth) : cfg.periodLabel;

  // Adjustments (range-aware) + manual — mirrors V1c's summary math.
  const memberPct = cfg.memberPct;
  const seasonPct = is1M ? (seasonalityOn ? cfg.seasonPct : 0) : cfg.seasonPct;
  const memberAmt = Math.round(baseline * memberPct / 100);
  const seasonAmt = Math.round(baseline * seasonPct / 100);
  const manualNet = manualAdjustments.reduce((s, a) => s + (a.type === "add" ? a.dollars : -a.dollars), 0);
  const totalAboveBase = memberAmt + seasonAmt + manualNet;
  const adjProj = Math.max(0, Math.round(baseline + totalAboveBase));
  const adjPct = Math.round(totalAboveBase / baseline * 100);
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
              { key: "paid",      label: "Paid",      color: "#0e9f6e" },
              { key: "pending",   label: "Pending",   color: "#f59e0b" },
              { key: "failed",    label: "Failed",    color: "#ef4444" },
              { key: "tracked",   label: "Planned",   color: "#0168dd" },
              { key: "projected", label: "Projected", color: "#85baf5" },
            ]
          : [
              { key: "factual",   label: "Confirmed", color: "#0e9f6e" },
              { key: "tracked",   label: "Planned",   color: "#0168dd" },
              { key: "projected", label: "Projected", color: "#85baf5" },
            ])
      : segTab === "channel"
      ? [{ key: "chFactual", label: "Confirmed", color: "#0e9f6e" }, ...v1eChannelSeg.map(s => ({ key: s.key, label: s.label, color: s.color }))]
      : v1eEarningSeg.map(s => ({ key: s.key, label: s.label, color: s.color }));

  const monthSegBars: SegBar[] =
    segTab === "source"
      ? [{ key: "actual", label: "Actuals", color: "#0e9f6e" }, { key: "projected", label: "Projected", color: "#85baf5" }]
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
      <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs min-w-[170px]">
        <p className="font-semibold text-[#111827] mb-1.5">{header}</p>
        {items.map(i => (
          <div key={i.key} className="flex justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: i.color }} /><span className="text-[#6b7280]">{i.label}</span></span>
            <span className="font-medium text-[#111827]">{fmt0(i.value)}</span>
          </div>
        ))}
        {items.length > 1 && (
          <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]">
            <span className="text-[#6b7280]">Total</span>
            <span className="font-semibold text-[#111827]">{fmt0(total)}</span>
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
      {/* ── Card header — global range control governs the whole card ─────── */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb] flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#111827]">Predictable Cash Flow</span>
          <span className="text-xs text-[#6b7280]">· <span className="font-semibold text-[#0168dd]">{headerPeriod}</span></span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#f3f4f6] rounded-md p-0.5">
            {(["1M","3M","6M","12M"] as V1eRange[]).map(r => (
              <button key={r} onClick={() => applyRange(r)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${range === r ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="relative flex items-center gap-1 text-[11px]">
            <button onClick={() => { if (is1M && !drillMonth) stepMonth(-1); }}
              disabled={is1M && !drillMonth && oneMonthIdx <= 0}
              className="p-0.5 rounded text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors disabled:opacity-30 disabled:hover:bg-transparent">{chevLeft}</button>
            {drillMonth ? (
              <span className="font-medium text-[#111827] min-w-[130px] text-center">{drillMonth} — weekly</span>
            ) : is1M ? (
              <button onClick={() => setMonthPickerOpen(o => !o)}
                className="text-[11px] font-medium text-[#111827] min-w-[130px] text-center hover:bg-[#f3f4f6] rounded px-2 py-0.5 flex items-center justify-center gap-1 transition-colors">
                {v1eFullMonthLabel(oneMonth)}
                <ChevronDown size={11} className={`text-[#6b7280] transition-transform ${monthPickerOpen ? "rotate-180" : ""}`} />
              </button>
            ) : (
              <span className="font-medium text-[#111827] min-w-[130px] text-center">{cfg.periodLabel}</span>
            )}
            <button onClick={() => { if (is1M && !drillMonth) stepMonth(1); }}
              disabled={is1M && !drillMonth && oneMonthIdx >= v1e12mBars.length - 1}
              className="p-0.5 rounded text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors disabled:opacity-30 disabled:hover:bg-transparent">{chevRight}</button>
            {monthPickerOpen && is1M && !drillMonth && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMonthPickerOpen(false)} />
                <div className="absolute top-8 left-7 z-30 bg-white rounded-lg border border-[#e5e7eb] shadow-xl py-1 w-40 max-h-56 overflow-y-auto">
                  {v1e12mBars.map(b => (
                    <button key={b.label} onClick={() => { setOneMonth(b.label); setMonthPickerOpen(false); setLoading(true); setTimeout(() => setLoading(false), 550); }}
                      className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${b.label === oneMonth ? "bg-[#eef3ff] text-[#0168dd] font-medium" : "text-[#111827] hover:bg-[#f9fafb]"}`}>
                      {v1eFullMonthLabel(b.label)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <ExportDropdown />
        </div>
      </div>

      {/* ── Top 3-column summary (matches Version 1D) ────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-[#e5e7eb] border-b border-[#e5e7eb]">
        {/* Card 1 — base */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1 h-[21px] flex items-center">Monthly avg payout</p>
          <p className="text-[10px] text-[#6b7280] leading-snug">The average of what you actually paid out over the last {cfg.lookback} — the baseline for this forecast.</p>
          <p className="text-3xl font-bold text-[#111827] tracking-tight mt-2">{fmt0(baseline)}</p>
          <div className="flex items-center gap-x-2 gap-y-1 mt-2 flex-wrap text-[10px] text-[#6b7280]">
            <div className="flex items-center gap-1 border-r border-[#e5e7eb] pr-2 mr-1">
              <UserCircle2 size={13} className="text-[#111827]" /><span className="font-semibold text-[#111827]">{v1CurrMembers}</span>
            </div>
            {v1PayTypes.map((pt, i) => (
              <div key={pt.key} className="flex items-center gap-1">
                {i > 0 && <span className="text-[#d1d5db]">·</span>}
                <span className="font-semibold text-[#111827]">{pt.count}</span><span>{pt.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 — adjustments */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] h-[21px] flex items-center">Adjustments</p>
            <button onClick={() => { setEditingAdj(null); setShowAddDialog(true); }}
              className="flex items-center gap-0.5 text-[10px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2 py-0.5 hover:bg-[#0168dd]/5 transition-colors select-none">
              <Plus size={10} /> Add adjustment
            </button>
          </div>
          <p className="text-[10px] text-[#6b7280] leading-snug mb-2">Applied on top of your baseline (member changes, seasonality, and manual adjustments).</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${adjPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>{adjPct >= 0 ? "+" : ""}{adjPct}%</span>
            {adjPct >= 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-400" />}
          </div>
          <p className="text-[10px] text-[#6b7280] mb-1">{adjCompare}</p>
          <div className="mt-2 divide-y divide-[#f3f4f6]">
            {([
              { label: "Headcount change", pct: memberPct, note: memberNote, positive: true },
              { label: "Seasonality",   pct: seasonPct, note: "May is typically above avg.", positive: true },
            ] as const).map(({ label, pct, note, positive }) => {
              if (label === "Seasonality" && seasonPct === 0) return null;
              return (
                <div key={label} className="flex items-center gap-1.5 text-xs py-1.5 min-w-0">
                  <span className={`font-semibold flex-shrink-0 ${positive ? "text-emerald-600" : "text-red-500"}`}>{positive ? "+" : ""}{pct}%</span>
                  <span className="text-[#111827] font-medium flex-shrink-0">{label}</span>
                  <span className="text-[#d1d5db] flex-shrink-0">—</span>
                  <span className="text-[#6b7280] truncate">{note}</span>
                </div>
              );
            })}
            {manualAdjustments.map(adj => (
              <div key={adj.id} className="flex items-center gap-1.5 text-xs py-1.5 min-w-0">
                <span className={`font-semibold flex-shrink-0 ${adj.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{adj.type === "add" ? "+" : "−"}{adj.unit === "pct" ? `${adj.value}%` : `≈${Math.round(adj.pct)}%`}</span>
                <span className="text-[#111827] font-medium flex-shrink-0">{adj.label}</span>
                <span className="text-[#d1d5db] flex-shrink-0">—</span>
                <span className="text-[#6b7280] flex-shrink-0">{adj.unit === "dollar" ? fmt0(Math.round(adj.dollars)) : `≈${fmt0(Math.round(adj.dollars))}`}</span>
                <span className="text-[9px] font-medium bg-[#f3f4f6] text-[#6b7280] rounded px-1.5 py-0.5 flex-shrink-0">Added by you</span>
                <button onClick={() => { setEditingAdj(adj); setShowAddDialog(true); }} className="ml-auto flex-shrink-0 p-0.5 rounded text-[#6b7280] hover:text-[#0168dd] hover:bg-[#f3f4f6] transition-colors"><Pencil size={11} /></button>
                <button onClick={() => setManualAdjustments(prev => prev.filter(a => a.id !== adj.id))} className="flex-shrink-0 p-0.5 rounded text-[#6b7280] hover:text-red-500 hover:bg-red-50 transition-colors"><X size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 — projection */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1 h-[21px] flex items-center">Recommended projection</p>
          <p className="text-[10px] text-[#6b7280] leading-snug">An estimate from your payment history — not a guaranteed figure. Add a buffer, or <a href="#" onClick={e => e.preventDefault()} className="font-medium text-[#4b5563] underline decoration-dotted decoration-[#9ca3af] underline-offset-2 hover:text-[#111827] transition-colors">see how to improve accuracy</a>.</p>
          <p className="text-3xl font-bold text-[#0168dd] tracking-tight mt-2">{fmt0(is1M ? adjProj : (windowTotal ?? adjProj))}</p>
          <V1cBreakdownPopover />
          <div className="relative group mt-3 cursor-default">
            <div className="h-2 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div className="h-full bg-emerald-500" style={{ width: `${adjPctC}%` }} />
                <div className="h-full bg-[#0168dd]" style={{ width: `${Math.max(adjPctP, 0.6)}%` }} />
                <div className="h-full flex-1 bg-[#85baf5]" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-[#6b7280] mt-0.5">
              <span>{fmt0(baseline)}/mo avg</span>
              <span>{fmt0(adjProj)}/mo{is1M ? "" : " avg"}</span>
            </div>
            <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-20 pointer-events-none">
              <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 w-48">
                {v1cBarHoverRows.map(({ label, color, value, pct }) => {
                  const k = value / 1000;
                  const fmtK = `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
                  return (
                    <div key={label} className="flex items-center justify-between text-[11px] font-semibold mb-1 last:mb-0 text-[#6b7280]">
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

      {/* ── Chart controls ───────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-0">
        {/* Row 1 — distribution title (left) + segmentation tabs (right, segmented-pill style) */}
        <div className="flex items-start justify-between mb-3 gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-0.5">
              {isWeekly ? "Week-by-week distribution" : "Month-by-month distribution"}
            </p>
            <p className="text-[11px] text-[#6b7280]">{chartCaption}</p>
          </div>
          <div className="flex items-center bg-[#f3f4f6] rounded-md p-0.5 flex-shrink-0">
            {([["source","Tracked vs. projected"],["channel","Payout method"],["type","Payroll breakdown"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setSegTab(id)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${segTab === id ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart-level control — YoY side-by-side comparison (12M only) */}
        {range === "12M" && (
          <div className="flex items-center justify-end my-3">
            <button onClick={() => setShowYoY(p => !p)} className="flex items-center gap-1.5 text-[10px] select-none cursor-pointer">
              <span className={`relative w-6 h-3.5 rounded-full transition-colors flex-shrink-0 ${showYoY ? "bg-[#0168dd]" : "bg-[#d1d5db]"}`}>
                <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform ${showYoY ? "translate-x-2.5" : "translate-x-0.5"}`} />
              </span>
              <span className="text-[#6b7280]">vs last year</span>
            </button>
          </div>
        )}

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
          <div data-zone="alert" className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-[11px]">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
3 pending ($3.6k) · 1 failed ($1.2k) from Weeks 1–2 need attention
            </div>
            <button className="text-[11px] text-[#0168dd] font-semibold flex-shrink-0 hover:underline flex items-center gap-0.5">Review <ChevronRight size={11} /></button>
          </div>
        </div>
      )}

      {/* ── Chart ────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-4">
        {loading ? (
          <ChartSkeleton bars={isWeekly ? 4 : (cfg.bars.length || 12)} />
        ) : isWeekly ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekRows} barCategoryGap="30%" margin={{ top: 20, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 9, fill: "#6b7280" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(v: number) => `$${Math.round(v/1000)}k`} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={renderTip(weekSegBars)} cursor={{ fill: "#f9fafb" }} />
              {weekMonthIsCurrent && (
                <ReferenceLine x={weekRows[1]?.dateLabel} stroke="#0168dd" strokeDasharray="3 3"
                  label={{ value: "Today", position: "insideTopRight", fontSize: 8, fill: "#0168dd" }} />
              )}
              {weekSegBars.map((sb, idx) => (
                <Bar key={sb.key} dataKey={sb.key} stackId="w" fill={sb.color} name={sb.label}
                  radius={idx === weekSegBars.length - 1 ? [3, 3, 0, 0] : undefined}>
                  {idx === weekSegBars.length - 1 && (
                    <LabelList dataKey="total" position="top" offset={6}
                      formatter={(v: number) => `$${Math.round(v / 1000)}k`}
                      fill="#6b7280" style={{ fontSize: 10, fontWeight: 600 }} />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={monthlyRows} barCategoryGap="28%" margin={{ top: 20, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: range === "12M" ? 9 : 10, fill: "#6b7280" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(v: number) => `$${Math.round(v/1000)}k`} axisLine={false} tickLine={false} width={36} />
              <Tooltip cursor={{ fill: "#f9fafb" }} content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                const items = monthSegBars.map(sb => ({ ...sb, value: (d[sb.key] ?? 0) as number })).filter(i => i.value > 0);
                const total = items.reduce((s, i) => s + i.value, 0);
                return (
                  <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs min-w-[180px]">
                    <p className="font-semibold text-[#111827] mb-1.5">{d.label}</p>
                    {items.map(i => (
                      <div key={i.key} className="flex justify-between gap-4 py-0.5">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: i.color }} /><span className="text-[#6b7280]">{i.label}</span></span>
                        <span className="font-medium text-[#111827]">{fmt0(i.value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]">
                      <span className="text-[#6b7280]">Total</span>
                      <span className="font-semibold text-[#111827]">{fmt0(total)}</span>
                    </div>
                    {showYoY && (d.yoy ?? 0) > 0 && (
                      <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: "#d1d5db" }} /><span className="text-[#6b7280]">Last year · {v1ePrevYearLabel(d.label)}</span></span>
                        <span className="font-medium text-[#111827]">{fmt0(d.yoy)}</span>
                      </div>
                    )}
                  </div>
                );
              }} />
              <ReferenceLine x={cfg.todayBar} stroke="#0168dd" strokeDasharray="3 3"
                label={{ value: "Today", position: "top", fontSize: 8, fill: "#0168dd" }} />
              {monthSegBars.map((sb, idx) => (
                <Bar key={sb.key} dataKey={sb.key} stackId="m" fill={sb.color} name={sb.label}
                  radius={idx === monthSegBars.length - 1 ? [3, 3, 0, 0] : undefined}
                  cursor="pointer" onClick={(d: any) => d?.label && setDrillMonth(d.label)}>
                  {monthlyRows.map((row, ri) => (
                    <Cell key={ri}
                      fillOpacity={segTab === "source" ? (row.isFut ? row.projOpacity : ((sb.key === "projected" || sb.key === "projRemain") ? row.projOpacity : 1)) : row.barOpacity} />
                  ))}
                  {idx === monthSegBars.length - 1 && (
                    <LabelList dataKey="total" position="top" offset={6}
                      formatter={(v: number) => `$${Math.round(v / 1000)}k`}
                      fill="#6b7280" style={{ fontSize: 10, fontWeight: 600 }} />
                  )}
                </Bar>
              ))}
              {showYoY && range === "12M" && (
                <Bar dataKey="yoy" stackId="prev" fill="#d1d5db" name="Last year" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        <div className="flex items-center gap-x-3 gap-y-1 mt-1.5 flex-wrap">
          {activeSegBars.map(sb => (
            <span key={sb.key} className="flex items-center gap-1 text-[10px] text-[#6b7280]">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: sb.color }} />
              {sb.label}
              {v1SegLegendInfo[sb.label] && <InfoTip text={v1SegLegendInfo[sb.label]} />}
            </span>
          ))}
          {showYoY && !isWeekly && range === "12M" && (
            <span className="flex items-center gap-1 text-[10px] text-[#6b7280]">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: "#d1d5db" }} />
              Last year (same month)
            </span>
          )}
          {!isWeekly && (range === "6M" || range === "12M") && (
            <span className="text-[9px] text-[#d1d5db] italic ml-auto">Confidence fades on projected months</span>
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
        base={baseline}
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
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <V1ePredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />
      </div>
      <FundYourAccountsPanel />
      <div>
        <p className="text-base font-semibold text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1FutureTracked />}
      </div>
    </div>
  );
}

// ─── Version 1F — copy of Version 1E ─────────────────────────────────────────

function V1fPredictivePanel({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [range, setRange]           = useState<V1eRange>("1M");
  const [showYoY, setShowYoY]       = useState(false);
  const [drillMonth, setDrillMonth] = useState<string | null>(null);
  const [segTab, setSegTab]         = useState<V1eSeg>("source");
  const [oneMonth, setOneMonth]     = useState<string>("Jun '26"); // selected month for the 1M view
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustment[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAdj, setEditingAdj] = useState<ManualAdjustment | null>(null);

  const [loading, setLoading] = useState(false);

  // Chart-only range: re-pulls the chart; the top summary stays fixed to the current month.
  const applyRange = (r: V1eRange) => {
    setRange(r); setDrillMonth(null); setMonthPickerOpen(false);
    if (r !== "12M") setShowYoY(false);
    setLoading(true); setTimeout(() => setLoading(false), 550);
  };

  const cfg  = v1eRangeCfg[range];
  const is1M = range === "1M";
  const isWeekly = is1M || !!drillMonth;

  // DECOUPLED: the top summary is ALWAYS the current month, independent of the chart's range.
  const memberPct = v1eRangeCfg["1M"].memberPct;
  const seasonPct = seasonalityOn ? v1eRangeCfg["1M"].seasonPct : 0;
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
  const windowTotal = null;   // always current month — no window plan total

  const memberNote = `${v1CurrMembers} this cycle vs avg ${v1AvgMembers}`;

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
    ? (cfg.bars.find(b => b.label === activeWeekLabel) ?? v1eMonthNav.find(b => b.label === activeWeekLabel))
    : undefined;
  const weekRows: V1eWeekRow[] = activeWeekLabel
    ? v1eBuildWeeks(weekMonthKey, weekBar?.actual ?? 0, weekBar?.projected ?? 0)
    : v1eJuneWeekRows;
  const weekMonthIsCurrent = weekMonthKey === "Jun";

  // 1M month stepper helpers (steps through the trailing-12-months list).
  const oneMonthIdx = v1eMonthNav.findIndex(b => b.label === oneMonth);
  const stepMonth = (dir: -1 | 1) => {
    const next = oneMonthIdx + dir;
    if (next >= 0 && next < v1eMonthNav.length) setOneMonth(v1eMonthNav[next].label);
  };

  type SegBar = { key: string; label: string; color: string };
  const weekSegBars: SegBar[] =
    segTab === "source"
      ? (showStatusBreakdown
          ? [
              { key: "paid",      label: "Paid",      color: "#0e9f6e" },
              { key: "pending",   label: "Pending",   color: "#f59e0b" },
              { key: "failed",    label: "Failed",    color: "#ef4444" },
              { key: "tracked",   label: "Planned",   color: "#0168dd" },
              { key: "projected", label: "Projected", color: "#85baf5" },
            ]
          : [
              { key: "factual",   label: "Confirmed", color: "#0e9f6e" },
              { key: "tracked",   label: "Planned",   color: "#0168dd" },
              { key: "projected", label: "Projected", color: "#85baf5" },
            ])
      : segTab === "channel"
      ? [{ key: "chFactual", label: "Confirmed", color: "#0e9f6e" }, ...v1eChannelSeg.map(s => ({ key: s.key, label: s.label, color: s.color }))]
      : v1eEarningSeg.map(s => ({ key: s.key, label: s.label, color: s.color }));

  const monthSegBars: SegBar[] =
    segTab === "source"
      ? [{ key: "actual", label: "Actuals", color: "#0e9f6e" }, { key: "projected", label: "Projected", color: "#85baf5" }]
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
      <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs min-w-[170px]">
        <p className="font-semibold text-[#111827] mb-1.5">{header}</p>
        {items.map(i => (
          <div key={i.key} className="flex justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: i.color }} /><span className="text-[#6b7280]">{i.label}</span></span>
            <span className="font-medium text-[#111827]">{fmt0(i.value)}</span>
          </div>
        ))}
        {items.length > 1 && (
          <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]">
            <span className="text-[#6b7280]">Total</span>
            <span className="font-semibold text-[#111827]">{fmt0(total)}</span>
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
      {/* ══ SUMMARY CARD — fixed to the current month ══════════════════════ */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#111827]">Predictable Cash Flow</span>
            <span className="text-xs text-[#6b7280]">· <span className="font-semibold text-[#0168dd]">{v1eFullMonthLabel("Jun '26")}</span> · this month</span>
          </div>
          <ExportDropdown />
        </div>
      <div className="grid grid-cols-3 divide-x divide-[#e5e7eb]">
        {/* Card 1 — base */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1 h-[21px] flex items-center">Monthly avg payout</p>
          <p className="text-[10px] text-[#6b7280] leading-snug">The average of what you actually paid out over the last 5 months — the baseline for this forecast.</p>
          <p className="text-3xl font-bold text-[#111827] tracking-tight mt-2">{fmt0(v1AvgMonthly)}</p>
          <div className="flex items-center gap-x-2 gap-y-1 mt-2 flex-wrap text-[10px] text-[#6b7280]">
            <div className="flex items-center gap-1 border-r border-[#e5e7eb] pr-2 mr-1">
              <UserCircle2 size={13} className="text-[#111827]" /><span className="font-semibold text-[#111827]">{v1CurrMembers}</span>
            </div>
            {v1PayTypes.map((pt, i) => (
              <div key={pt.key} className="flex items-center gap-1">
                {i > 0 && <span className="text-[#d1d5db]">·</span>}
                <span className="font-semibold text-[#111827]">{pt.count}</span><span>{pt.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 — adjustments */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] h-[21px] flex items-center">Adjustments</p>
            <button onClick={() => { setEditingAdj(null); setShowAddDialog(true); }}
              className="flex items-center gap-0.5 text-[10px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2 py-0.5 hover:bg-[#0168dd]/5 transition-colors select-none">
              <Plus size={10} /> Add adjustment
            </button>
          </div>
          <p className="text-[10px] text-[#6b7280] leading-snug mb-2">Applied on top of your baseline (member changes, seasonality, and manual adjustments).</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${adjPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>{adjPct >= 0 ? "+" : ""}{adjPct}%</span>
            {adjPct >= 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-400" />}
          </div>
          <div className="mt-2 divide-y divide-[#f3f4f6]">
            {([
              { label: "Headcount change", pct: memberPct, note: memberNote, positive: true },
              { label: "Seasonality",   pct: seasonPct, note: "May is typically above avg.", positive: true },
            ] as const).map(({ label, pct, note, positive }) => {
              if (label === "Seasonality" && seasonPct === 0) return null;
              return (
                <div key={label} className="flex items-center gap-1.5 text-xs py-1.5 min-w-0">
                  <span className={`font-semibold flex-shrink-0 ${positive ? "text-emerald-600" : "text-red-500"}`}>{positive ? "+" : ""}{pct}%</span>
                  <span className="text-[#111827] font-medium flex-shrink-0">{label}</span>
                  <span className="text-[#d1d5db] flex-shrink-0">—</span>
                  <span className="text-[#6b7280] truncate">{note}</span>
                </div>
              );
            })}
            {manualAdjustments.map(adj => (
              <div key={adj.id} className="flex items-center gap-1.5 text-xs py-1.5 min-w-0">
                <span className={`font-semibold flex-shrink-0 ${adj.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{adj.type === "add" ? "+" : "−"}{adj.unit === "pct" ? `${adj.value}%` : `≈${Math.round(adj.pct)}%`}</span>
                <span className="text-[#111827] font-medium flex-shrink-0">{adj.label}</span>
                <span className="text-[#d1d5db] flex-shrink-0">—</span>
                <span className="text-[#6b7280] flex-shrink-0">{adj.unit === "dollar" ? fmt0(Math.round(adj.dollars)) : `≈${fmt0(Math.round(adj.dollars))}`}</span>
                <span className="text-[9px] font-medium bg-[#f3f4f6] text-[#6b7280] rounded px-1.5 py-0.5 flex-shrink-0">Added by you</span>
                <button onClick={() => { setEditingAdj(adj); setShowAddDialog(true); }} className="ml-auto flex-shrink-0 p-0.5 rounded text-[#6b7280] hover:text-[#0168dd] hover:bg-[#f3f4f6] transition-colors"><Pencil size={11} /></button>
                <button onClick={() => setManualAdjustments(prev => prev.filter(a => a.id !== adj.id))} className="flex-shrink-0 p-0.5 rounded text-[#6b7280] hover:text-red-500 hover:bg-red-50 transition-colors"><X size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 — projection */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1 h-[21px] flex items-center">Recommended projection</p>
          <p className="text-[10px] text-[#6b7280] leading-snug">An estimate from your payment history — not a guaranteed figure. Add a buffer, or <a href="#" onClick={e => e.preventDefault()} className="font-medium text-[#4b5563] underline decoration-dotted decoration-[#9ca3af] underline-offset-2 hover:text-[#111827] transition-colors">see how to improve accuracy</a>.</p>
          <p className="text-3xl font-bold text-[#0168dd] tracking-tight mt-2">{fmt0(adjProj)}</p>
          <V1cBreakdownPopover />
          <div className="relative group mt-3 cursor-default">
            <div className="h-2 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div className="h-full bg-emerald-500" style={{ width: `${adjPctC}%` }} />
                <div className="h-full bg-[#0168dd]" style={{ width: `${Math.max(adjPctP, 0.6)}%` }} />
                <div className="h-full flex-1 bg-[#85baf5]" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-[#6b7280] mt-0.5">
              <span>{fmt0(v1AvgMonthly)} avg</span>
              <span>{fmt0(adjProj)} total</span>
            </div>
            <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-20 pointer-events-none">
              <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 w-48">
                {v1cBarHoverRows.map(({ label, color, value, pct }) => {
                  const k = value / 1000;
                  const fmtK = `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
                  return (
                    <div key={label} className="flex items-center justify-between text-[11px] font-semibold mb-1 last:mb-0 text-[#6b7280]">
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
              <span className="font-medium text-[#111827]">{fmt0(windowTotal)}</span>
              <span className="text-[#6b7280]"> {range.toLowerCase()} total · </span>
              <span className="text-[9px] text-[#d1d5db]">for planning</span>
            </p>
          )}
        </div>
      </div>

      </div>{/* ══ end SUMMARY CARD ══ */}

      {/* ══ CHART CARD — separate explorer with its own range control ══════ */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb] flex-wrap">
          <div>
            <p className="text-sm font-semibold text-[#111827]">Explore your payments over time</p>
            <p className="text-[11px] text-[#6b7280]">Projected payouts ahead — browsing here doesn't change the numbers above.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#f3f4f6] rounded-md p-0.5">
              {(["1M","3M","6M","12M"] as V1eRange[]).map(r => (
                <button key={r} onClick={() => applyRange(r)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${range === r ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="relative flex items-center gap-1 text-[11px]">
              <button onClick={() => { if (is1M && !drillMonth) stepMonth(-1); }}
                disabled={is1M && !drillMonth && oneMonthIdx <= 0}
                className="p-0.5 rounded text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors disabled:opacity-30 disabled:hover:bg-transparent">{chevLeft}</button>
              {drillMonth ? (
                <span className="font-medium text-[#111827] min-w-[130px] text-center">{drillMonth} — weekly</span>
              ) : is1M ? (
                <button onClick={() => setMonthPickerOpen(o => !o)}
                  className="text-[11px] font-medium text-[#111827] min-w-[130px] text-center hover:bg-[#f3f4f6] rounded px-2 py-0.5 flex items-center justify-center gap-1 transition-colors">
                  {v1eFullMonthLabel(oneMonth)}
                  <ChevronDown size={11} className={`text-[#6b7280] transition-transform ${monthPickerOpen ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <span className="font-medium text-[#111827] min-w-[130px] text-center">{cfg.periodLabel}</span>
              )}
              <button onClick={() => { if (is1M && !drillMonth) stepMonth(1); }}
                disabled={is1M && !drillMonth && oneMonthIdx >= v1eMonthNav.length - 1}
                className="p-0.5 rounded text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors disabled:opacity-30 disabled:hover:bg-transparent">{chevRight}</button>
              {monthPickerOpen && is1M && !drillMonth && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMonthPickerOpen(false)} />
                  <div className="absolute top-8 left-7 z-30 bg-white rounded-lg border border-[#e5e7eb] shadow-xl py-1 w-40 max-h-56 overflow-y-auto">
                    {v1eMonthNav.map(b => (
                      <button key={b.label} onClick={() => { setOneMonth(b.label); setMonthPickerOpen(false); setLoading(true); setTimeout(() => setLoading(false), 550); }}
                        className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${b.label === oneMonth ? "bg-[#eef3ff] text-[#0168dd] font-medium" : "text-[#111827] hover:bg-[#f9fafb]"}`}>
                        {v1eFullMonthLabel(b.label)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      {/* ── Chart controls ───────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-0">
        {/* Row 1 — distribution title (left) + segmentation tabs (right, segmented-pill style) */}
        <div className="flex items-start justify-between mb-3 gap-4">
          <div>
            <p className="text-[11px] text-[#6b7280]">{chartCaption}</p>
          </div>
          <div className="flex items-center bg-[#f3f4f6] rounded-md p-0.5 flex-shrink-0">
            {([["source","Tracked vs. projected"],["channel","Payout method"],["type","Payroll breakdown"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setSegTab(id)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${segTab === id ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart-level control — YoY side-by-side comparison (12M only) */}
        {range === "12M" && (
          <div className="flex items-center justify-end my-3">
            <button onClick={() => setShowYoY(p => !p)} className="flex items-center gap-1.5 text-[10px] select-none cursor-pointer">
              <span className={`relative w-6 h-3.5 rounded-full transition-colors flex-shrink-0 ${showYoY ? "bg-[#0168dd]" : "bg-[#d1d5db]"}`}>
                <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform ${showYoY ? "translate-x-2.5" : "translate-x-0.5"}`} />
              </span>
              <span className="text-[#6b7280]">vs last year</span>
            </button>
          </div>
        )}

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
          <div data-zone="alert" className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-[11px]">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
3 pending ($3.6k) · 1 failed ($1.2k) from Weeks 1–2 need attention
            </div>
            <button className="text-[11px] text-[#0168dd] font-semibold flex-shrink-0 hover:underline flex items-center gap-0.5">Review <ChevronRight size={11} /></button>
          </div>
        </div>
      )}

      {/* ── Chart ────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-4">
        {loading ? (
          <ChartSkeleton bars={isWeekly ? 4 : (cfg.bars.length || 12)} />
        ) : isWeekly ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekRows} barCategoryGap="30%" margin={{ top: 20, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 9, fill: "#6b7280" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(v: number) => `$${Math.round(v/1000)}k`} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={renderTip(weekSegBars)} cursor={{ fill: "#f9fafb" }} />
              {weekMonthIsCurrent && (
                <ReferenceLine x={weekRows[1]?.dateLabel} stroke="#0168dd" strokeDasharray="3 3"
                  label={{ value: "Today", position: "insideTopRight", fontSize: 8, fill: "#0168dd" }} />
              )}
              {weekSegBars.map((sb, idx) => (
                <Bar key={sb.key} dataKey={sb.key} stackId="w" fill={sb.color} name={sb.label}
                  radius={idx === weekSegBars.length - 1 ? [3, 3, 0, 0] : undefined}>
                  {idx === weekSegBars.length - 1 && (
                    <LabelList dataKey="total" position="top" offset={6}
                      formatter={(v: number) => `$${Math.round(v / 1000)}k`}
                      fill="#6b7280" style={{ fontSize: 10, fontWeight: 600 }} />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={monthlyRows} barCategoryGap="28%" margin={{ top: 20, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: range === "12M" ? 9 : 10, fill: "#6b7280" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(v: number) => `$${Math.round(v/1000)}k`} axisLine={false} tickLine={false} width={36} />
              <Tooltip cursor={{ fill: "#f9fafb" }} content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                const items = monthSegBars.map(sb => ({ ...sb, value: (d[sb.key] ?? 0) as number })).filter(i => i.value > 0);
                const total = items.reduce((s, i) => s + i.value, 0);
                return (
                  <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs min-w-[180px]">
                    <p className="font-semibold text-[#111827] mb-1.5">{d.label}</p>
                    {items.map(i => (
                      <div key={i.key} className="flex justify-between gap-4 py-0.5">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: i.color }} /><span className="text-[#6b7280]">{i.label}</span></span>
                        <span className="font-medium text-[#111827]">{fmt0(i.value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]">
                      <span className="text-[#6b7280]">Total</span>
                      <span className="font-semibold text-[#111827]">{fmt0(total)}</span>
                    </div>
                    {showYoY && (d.yoy ?? 0) > 0 && (
                      <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: "#d1d5db" }} /><span className="text-[#6b7280]">Last year · {v1ePrevYearLabel(d.label)}</span></span>
                        <span className="font-medium text-[#111827]">{fmt0(d.yoy)}</span>
                      </div>
                    )}
                  </div>
                );
              }} />
              <ReferenceLine x={cfg.todayBar} stroke="#0168dd" strokeDasharray="3 3"
                label={{ value: "Today", position: "top", fontSize: 8, fill: "#0168dd" }} />
              {monthSegBars.map((sb, idx) => (
                <Bar key={sb.key} dataKey={sb.key} stackId="m" fill={sb.color} name={sb.label}
                  radius={idx === monthSegBars.length - 1 ? [3, 3, 0, 0] : undefined}
                  cursor="pointer" onClick={(d: any) => d?.label && setDrillMonth(d.label)}>
                  {monthlyRows.map((row, ri) => (
                    <Cell key={ri}
                      fillOpacity={segTab === "source" ? (row.isFut ? row.projOpacity : ((sb.key === "projected" || sb.key === "projRemain") ? row.projOpacity : 1)) : row.barOpacity} />
                  ))}
                  {idx === monthSegBars.length - 1 && (
                    <LabelList dataKey="total" position="top" offset={6}
                      formatter={(v: number) => `$${Math.round(v / 1000)}k`}
                      fill="#6b7280" style={{ fontSize: 10, fontWeight: 600 }} />
                  )}
                </Bar>
              ))}
              {showYoY && range === "12M" && (
                <Bar dataKey="yoy" stackId="prev" fill="#d1d5db" name="Last year" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        <div className="flex items-center gap-x-3 gap-y-1 mt-1.5 flex-wrap">
          {activeSegBars.map(sb => (
            <span key={sb.key} className="flex items-center gap-1 text-[10px] text-[#6b7280]">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: sb.color }} />
              {sb.label}
              {v1SegLegendInfo[sb.label] && <InfoTip text={v1SegLegendInfo[sb.label]} />}
            </span>
          ))}
          {showYoY && !isWeekly && range === "12M" && (
            <span className="flex items-center gap-1 text-[10px] text-[#6b7280]">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: "#d1d5db" }} />
              Last year (same month)
            </span>
          )}
          {!isWeekly && (range === "6M" || range === "12M") && (
            <span className="text-[9px] text-[#d1d5db] italic ml-auto">Confidence fades on projected months</span>
          )}
        </div>
      </div>
      </div>{/* ══ end CHART CARD ══ */}

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

function Version1F({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      <V1fPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />
      <FundYourAccountsPanel />
      <div>
        <p className="text-base font-semibold text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1FutureTracked />}
      </div>
    </div>
  );
}

// ─── Version 1G — copy of Version 1F ─────────────────────────────────────────

// Wider, table-based management dialog: the whole build-up (baseline + auto drivers
// + your manual adjustments) in one editable list — add / edit / remove inline.
function V1gManageAdjustmentsDialog({
  open, onClose, base, memberPct, memberAmt, memberNote, seasonPct, seasonAmt,
  manualAdjustments, setManualAdjustments, finalTotal, zone = false,
}: {
  open: boolean;
  onClose: () => void;
  base: number;
  memberPct: number; memberAmt: number; memberNote: string;
  seasonPct: number; seasonAmt: number;
  manualAdjustments: ManualAdjustment[];
  setManualAdjustments: (updater: (prev: ManualAdjustment[]) => ManualAdjustment[]) => void;
  finalTotal: number;
  zone?: boolean;
}) {
  const [draftId, setDraftId] = useState<string | null>(null); // "new" | <id> | null
  const [dLabel, setDLabel] = useState("Buffer");
  const [dType, setDType]   = useState<"add" | "reduce">("add");
  const [dUnit, setDUnit]   = useState<"pct" | "dollar">("pct");
  const [dValue, setDValue] = useState("");

  useEffect(() => { if (!open) setDraftId(null); }, [open]);

  if (!open) return null;

  const startAdd  = () => { setDraftId("new"); setDLabel("Buffer"); setDType("add"); setDUnit("pct"); setDValue(""); };
  const startEdit = (a: ManualAdjustment) => { setDraftId(a.id); setDLabel(a.label); setDType(a.type); setDUnit(a.unit); setDValue(String(a.value)); };
  const cancel    = () => setDraftId(null);

  const parsed = parseFloat(dValue.replace(/[^0-9.]/g, ""));
  const valid  = !isNaN(parsed) && isFinite(parsed) && parsed > 0;
  const draftDollars = valid ? (dUnit === "dollar" ? parsed : base * parsed / 100) : 0;
  const draftPct     = valid ? (dUnit === "dollar" ? parsed / base * 100 : parsed)  : 0;

  const commit = () => {
    if (!valid) return;
    const rec: ManualAdjustment = {
      id: draftId === "new" ? Math.random().toString(36).slice(2) : draftId!,
      label: dLabel || "Adjustment", type: dType, unit: dUnit, value: parsed, dollars: draftDollars, pct: draftPct,
    };
    setManualAdjustments(prev => draftId === "new" ? [...prev, rec] : prev.map(a => a.id === draftId ? rec : a));
    setDraftId(null);
  };
  const remove = (id: string) => setManualAdjustments(prev => prev.filter(a => a.id !== id));

  const editRow = (key: string) => (
    <tr key={key} className="bg-[#f9fafb]">
      <td className="py-2 px-3">
        <input value={dLabel} onChange={e => setDLabel(e.target.value)} placeholder="Label"
          className="w-full border border-[#e5e7eb] rounded-md px-2 py-1 text-[12px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0168dd]/20 focus:border-[#0168dd] transition-colors" />
      </td>
      <td className="py-2 px-3">
        <div data-zone="segmented_controls" className="flex bg-[#f3f4f6] rounded-md p-0.5 w-fit">
          {(["add", "reduce"] as const).map(t => (
            <button key={t} onClick={() => setDType(t)} className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${dType === t ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280]"}`}>{t === "add" ? "Add" : "Reduce"}</button>
          ))}
        </div>
      </td>
      <td className="py-2 px-3">
        <div className="flex gap-1">
          <div className="flex bg-[#f3f4f6] rounded-md p-0.5 flex-shrink-0">
            {(["pct", "dollar"] as const).map(u => (
              <button key={u} onClick={() => setDUnit(u)} className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-all ${dUnit === u ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280]"}`}>{u === "pct" ? "%" : "$"}</button>
            ))}
          </div>
          <input value={dValue} onChange={e => setDValue(e.target.value)} inputMode="decimal" placeholder={dUnit === "pct" ? "e.g. 5" : "e.g. 5000"}
            className="w-16 border border-[#e5e7eb] rounded-md px-2 py-1 text-[12px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0168dd]/20 focus:border-[#0168dd] transition-colors" />
        </div>
      </td>
      <td className="py-2 px-3 text-right text-[12px] font-semibold text-[#111827] whitespace-nowrap">{valid ? `${dType === "add" ? "+" : "−"}${fmt0(draftDollars)}` : "—"}</td>
      <td className="py-2 px-3">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={commit} disabled={!valid} className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${valid ? "bg-[#0168dd] text-white hover:bg-[#0057bb]" : "bg-[#e5e7eb] text-[#d1d5db] cursor-not-allowed"}`}>Save</button>
          <button onClick={cancel} className="px-2 py-1 rounded-md text-[11px] font-medium text-[#6b7280] hover:text-[#111827] transition-colors">Cancel</button>
        </div>
      </td>
    </tr>
  );

  const autoBadge = <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#f3f4f6] text-[#6b7280]">Auto</span>;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-white rounded-xl shadow-2xl w-[600px] max-w-full pointer-events-auto">
          <div className="flex items-start justify-between px-6 pt-5 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Adjustments</h2>
              <p className="text-[11px] text-[#6b7280] mt-0.5 max-w-[440px] leading-snug">How we get from your baseline to the recommended figure. Auto rows come from your payment history; add or remove your own below.</p>
            </div>
            <button data-zone="icon_button" onClick={onClose} className="p-1 rounded-md text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors flex-shrink-0"><X size={16} /></button>
          </div>

          <div className="px-6 py-4">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] border-b border-[#e5e7eb]">
                  <th className="text-left py-2 px-3">Label</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Amount</th>
                  <th className="text-right py-2 px-3">Total</th>
                  <th className="py-2 px-3 w-[92px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                <tr>
                  <td className="py-2.5 px-3 text-[#111827] font-medium">Baseline <span className="text-[#6b7280] font-normal">· monthly avg</span></td>
                  <td className="py-2.5 px-3 text-[#6b7280]">—</td>
                  <td className="py-2.5 px-3 text-[#6b7280]">—</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#111827] whitespace-nowrap">{fmt0(base)}</td>
                  <td className="py-2.5 px-3"></td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-[#111827] font-medium">Headcount change <span className="text-[#6b7280] font-normal">· {memberNote}</span></td>
                  <td className="py-2.5 px-3">{autoBadge}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">+{memberPct}%</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 whitespace-nowrap">+{fmt0(memberAmt)}</td>
                  <td className="py-2.5 px-3"></td>
                </tr>
                {seasonPct !== 0 && (
                  <tr>
                    <td className="py-2.5 px-3 text-[#111827] font-medium">Seasonality <span className="text-[#6b7280] font-normal">· typically above avg</span></td>
                    <td className="py-2.5 px-3">{autoBadge}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-semibold">+{seasonPct}%</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 whitespace-nowrap">+{fmt0(seasonAmt)}</td>
                    <td className="py-2.5 px-3"></td>
                  </tr>
                )}
                {manualAdjustments.map(a => (
                  draftId === a.id ? editRow(a.id) : (
                    <tr key={a.id}>
                      <td className="py-2.5 px-3 text-[#111827] font-medium">{a.label}</td>
                      <td className="py-2.5 px-3"><span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${a.type === "add" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>{a.type === "add" ? "Add" : "Reduce"}</span></td>
                      <td className={`py-2.5 px-3 font-semibold ${a.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{a.type === "add" ? "+" : "−"}{a.unit === "pct" ? `${a.value}%` : fmt0(a.dollars)}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold whitespace-nowrap ${a.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{a.type === "add" ? "+" : "−"}{fmt0(a.dollars)}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => startEdit(a)} className="p-1 rounded text-[#6b7280] hover:text-[#0168dd] hover:bg-[#f3f4f6] transition-colors"><Pencil size={12} /></button>
                          <button onClick={() => remove(a.id)} className="p-1 rounded text-[#6b7280] hover:text-red-500 hover:bg-red-50 transition-colors"><X size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
                {draftId === "new" && editRow("new-draft")}
                {draftId === null && (
                  <tr>
                    <td colSpan={5} className="py-2 px-3">
                      <button onClick={startAdd} className="flex items-center gap-1 text-[12px] font-medium text-[#0168dd] hover:text-[#0057bb] transition-colors select-none">
                        <Plus size={13} /> Add adjustment
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#e5e7eb]">
                  <td className="py-3 px-3 text-[#111827] font-semibold">Estimated to fund</td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-right text-[15px] font-bold text-[#0168dd] whitespace-nowrap">{fmt0(finalTotal)}</td>
                  <td className="py-3 px-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center justify-end px-6 py-4">
            <button onClick={onClose} className={zone ? zbtn("solidPrimary", "md") : "px-5 py-2 rounded-lg text-sm font-semibold bg-[#0168dd] text-white hover:bg-[#0057bb] transition-colors"}>Done</button>
          </div>
        </div>
      </div>
    </>
  );
}

// Narrow "Fund your accounts" card for the 1H side-by-side layout: same content
// as the full panel's card view, stacked vertically, no progress bars.
function V1hFundCard() {
  const providers = fundInitProviders;
  const [emailProvider, setEmailProvider] = useState<FundingProvider | null>(null);
  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] h-full flex flex-col">
      <div className="px-4 h-[55px] flex items-center border-b border-[#e5e7eb] bg-white rounded-t-lg">
        <p className="text-sm font-semibold text-[#111827]">Fund your accounts</p>
      </div>
      <div className="px-4 divide-y divide-[#e5e7eb] flex-1">
        {providers.map(p => {
          const connected = p.status !== "no-connection" && p.status !== "unavailable";
          const shortfall = p.balance !== undefined && p.needed !== undefined ? p.needed - p.balance : null;
          return (
            <div key={p.id} className="py-3.5 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ProviderLogo id={p.id} size={18} />
                  <button
                    onClick={() => connected ? setEmailProvider(p) : undefined}
                    className={`text-xs font-semibold text-[#111827] ${connected ? "hover:text-[#0168dd] hover:underline" : ""} transition-colors`}
                  >{p.name}</button>
                </div>
                {p.status === "no-connection" ? (
                  <button className="px-2.5 py-1.5 rounded-md text-[10px] font-semibold text-[#0168dd] hover:bg-[#0168dd]/5 transition-colors whitespace-nowrap">Connect</button>
                ) : (
                  <a href="#" onClick={e => e.preventDefault()} className="px-2.5 py-1.5 rounded-md text-[10px] font-semibold text-[#0168dd] hover:bg-[#0168dd]/5 transition-colors whitespace-nowrap inline-flex items-center gap-1">
                    Go to {p.name}
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                  </a>
                )}
              </div>
              {connected ? (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-[#6b7280]">Balance</p>
                    <p className="text-sm font-bold text-[#111827]">{fmt0(p.balance!)}</p>
                  </div>
                  {p.status === "needs-funding" && shortfall !== null && (
                    <div className="text-right">
                      <p className="text-[10px] text-[#6b7280]">Add to cover</p>
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
              ) : (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide self-start bg-[#f3f4f6] text-[#d1d5db]">not connected</span>
              )}
            </div>
          );
        })}
      </div>
      {emailProvider && (
        <FundingEmailPreviewDialog
          provider={emailProvider}
          onClose={() => setEmailProvider(null)}
        />
      )}
    </div>
  );
}

// ── 1J — "Add to cover" as a date-card timeline + expandable provider detail ──
// Due = gross going out that day. Add = what's still needed after the account
// balance — a true gap only where the balance is readable (Wise, Bitwage);
// otherwise "fund X" with no fabricated balance (Payoneer, PayPal).
const v1jBalances: Record<string, number | undefined> = {
  wise: 8000,
  bitwage: 4000,
  payoneer: undefined,
  paypal: undefined,
  deel: 6000,
  export: undefined,
  gusto: 3000,
};
type V1jAdd = { kind: "covered" | "add" | "fund"; amount: number };
const v1jAddFor = (id: string, due: number): V1jAdd => {
  const bal = v1jBalances[id];
  if (bal !== undefined) {
    const gap = Math.max(0, due - bal);
    return gap === 0 ? { kind: "covered", amount: 0 } : { kind: "add", amount: gap };
  }
  return { kind: "fund", amount: due };
};

function V1jAddToCoverCard({ onViewSchedule }: { onViewSchedule: () => void }) {
  const [windowDays, setWindowDays] = useState<7 | 15 | 30>(7);
  const [selected, setSelected] = useState<string | null>("Jun 22");

  // Timeline = the most recent completed run + everything due inside the window.
  const funded = v1gFundSchedule.filter(e => e.funded);
  const lastFunded = funded[funded.length - 1];
  const upcoming = v1gFundSchedule.filter(e => !e.funded && e.daysOut > 0 && e.daysOut <= windowDays);
  const visible = [...(lastFunded ? [lastFunded] : []), ...upcoming];
  const sel = selected ? visible.find(e => e.date === selected) : undefined;

  // Header total = the sum of the visible upcoming rows' adds (same window).
  const totalAdd = upcoming.reduce((s, e) => s + e.providers.reduce((x, p) => x + v1jAddFor(p.id, p.amount).amount, 0), 0);

  const check = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
  const paidCheck = <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#0e9f6e"/><polyline points="16.5 9 10.6 14.8 7.5 11.8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

  return (
    <div className="col-span-9 bg-white rounded-lg border border-[#e5e7eb] flex flex-col">
      <div className="px-4 h-[55px] flex items-center justify-between gap-3 border-b border-[#e5e7eb] bg-white rounded-t-lg">
        <div className="flex items-center gap-2.5">
          <p className="text-sm font-semibold text-[#111827]">Add to cover</p>
          <p className="text-[11px] text-[#6b7280]"><span className="text-sm font-bold text-[#111827]">{fmt0(totalAdd)}</span> to add</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#f3f4f6] rounded-md p-0.5">
            {([7, 15, 30] as const).map(d => (
              <button key={d} onClick={() => setWindowDays(d)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${windowDays === d ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>{d}d</button>
            ))}
          </div>
          <button onClick={onViewSchedule} className="text-[11px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2.5 py-1 hover:bg-[#0168dd]/5 transition-colors select-none">View full schedule</button>
        </div>
      </div>

      <div className="px-4 py-4 flex-1">
        {/* Timeline — date cards sitting on a line */}
        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 rounded-full bg-[#d1d5db]" />
          <div className="relative flex gap-8">
            {visible.map(e => {
              const isSel = selected === e.date;
              const projected = e.tag === "projected";
              const total = v1gSum(e);
              return (
                <button key={e.date} onClick={() => setSelected(isSel ? null : e.date)}
                  className={`relative flex-1 min-w-0 text-left rounded-lg px-3 py-2.5 border transition-colors ${isSel ? "border-[#0168dd] bg-[#f0f7ff]" : projected ? "border-dashed border-[#e5e7eb] bg-white" : "border-[#e5e7eb] bg-white hover:border-[#d1d5db]"}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold whitespace-nowrap ${projected ? "text-[#6b7280]" : "text-[#111827]"}`}>{e.dow}, {e.date}</span>
                    {e.tag === "next" && <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-[#e8f2fd] text-[#0168dd]">next</span>}
                    {e.funded && paidCheck}
                  </div>
                  <p className={`text-sm font-bold mt-1 ${e.funded || projected ? "text-[#6b7280]" : "text-[#4b5563]"}`}>{fmt0(total)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail — per-provider anatomy for the selected date */}
        {sel && (
          <div className="mt-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3 py-1">
            <div className="divide-y divide-[#e5e7eb]">
              {sel.providers.map(p => {
                const meta = v1gProviderMeta[p.id];
                const bal = v1jBalances[p.id];
                const res = v1jAddFor(p.id, p.amount);
                return (
                  <div key={p.id} className="py-2 flex items-center gap-2">
                    <ProviderLogo id={p.id} size={18} />
                    <span className="text-xs font-medium text-[#111827] w-20 flex-shrink-0">{meta.name}</span>
                    {sel.funded ? (
                      <>
                        <span className="text-[11px] text-[#6b7280] flex-1 min-w-0"></span>
                        <span className="text-[11px] text-[#6b7280] w-24 text-right flex-shrink-0"><span className="font-semibold text-[#111827]">{fmt0(p.amount)}</span> sent</span>
                        <span className="w-28 text-right flex-shrink-0">
                          <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1 justify-end">{paidCheck} paid</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-[#6b7280] flex-1 min-w-0">{bal !== undefined && <>balance <span className="font-semibold text-[#111827]">{fmt0(bal)}</span></>}</span>
                        <span className="text-[11px] text-[#6b7280] w-24 text-right flex-shrink-0"><span className="font-semibold text-[#111827]">{fmt0(p.amount)}</span> due</span>
                        <span className="w-28 text-right flex-shrink-0">
                          {res.kind === "covered" ? (
                            <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1 justify-end">{check} covered</span>
                          ) : (
                            <span className="text-xs font-bold text-amber-600">fund {fmt0(res.amount)}</span>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 1K — "Next payments": the next two pay runs as self-contained cards ──────
// Static (not clickable): each card is a mini table — Provider | Balance | Due
// | Fund — so the repeated words become column headers. The "next" card gets a
// stronger gray border instead of a blue treatment.
// One fund-by date as a self-contained card: deadline header, payroll caption,
// provider table (Provider · Balance · Due · Fund), total pinned to the bottom.
// Shared by the 1K summary card and its full-schedule dialog so they stay identical.
const v1kDowFull: Record<string, string> = { Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };

// ── Zone button recipes ──────────────────────────────────────────────────
// Faithful to hubstaff-server button.rb (base + size + variant+color), verified
// against the live Zone button docs. Primary = primary-500 (#2aa7ff), hovers use
// primary-600 (#2f8af4) / primary-100 (#eaf6ff); gray uses gray-600/300/100/black.
// Used only under the `zone` flag (Final UI) so 1G–1N keep their original styling.
const ZBTN_BASE = "relative inline-flex items-center justify-center font-normal rounded-[6px] transition-colors select-none";
// Zone's real button sizes (h-8/10/12, verified 32/40/48px in the docs). sm is
// the smallest Zone offers — there is no xs.
const ZBTN_SIZE = { sm: "text-sm h-8 px-3 gap-2", md: "text-sm h-10 px-5 gap-2", lg: "text-base h-12 px-5 gap-2" } as const;
const ZBTN_VARIANT = {
  solidPrimary: "text-white bg-[#2aa7ff] hover:bg-[#2f8af4] border border-[#2aa7ff] hover:border-[#2f8af4]",
  outlinePrimary: "text-[#2aa7ff] bg-transparent hover:bg-[#eaf6ff] border border-[#2aa7ff]",
  ghostPrimary: "text-[#2aa7ff] bg-transparent hover:bg-[#eaf6ff]",
  outlineGray: "text-[#4b5563] bg-transparent hover:bg-[#f3f4f6] border border-[#d1d5db]",
  ghostGray: "text-[#4b5563] bg-transparent hover:bg-[#f3f4f6]",
  solidGray: "text-black bg-[#e5e7eb] hover:bg-[#d1d5db] border border-[#e5e7eb] hover:border-[#d1d5db]",
} as const;
const zbtn = (variant: keyof typeof ZBTN_VARIANT, size: keyof typeof ZBTN_SIZE = "sm", extra = "") =>
  `${ZBTN_BASE} ${ZBTN_SIZE[size]} ${ZBTN_VARIANT[variant]}${extra ? " " + extra : ""}`;

// Zone pill — sizes from the pill docs (sm=py-0 ~20px, md=py-1 ~24px, lg=py-2 ~36px).
// Filled color variants use the *-100 bg / *-800 text pairs. font weight 400.
const ZPILL_BASE = "inline-flex items-center gap-1 select-none font-normal whitespace-nowrap rounded-full";
const ZPILL_SIZE = { sm: "text-xs px-2 py-0", md: "text-xs px-2 py-1", lg: "text-sm px-3 py-2" } as const;
const ZPILL_COLOR = {
  primary: "bg-[#eaf6ff] text-[#0168dd]",
  gray: "bg-[#f3f4f6] text-[#4b5563]",
  green: "bg-[#def7ec] text-[#03543f]",
} as const;
const zpill = (color: keyof typeof ZPILL_COLOR = "primary", size: keyof typeof ZPILL_SIZE = "md", extra = "") =>
  `${ZPILL_BASE} ${ZPILL_SIZE[size]} ${ZPILL_COLOR[color]}${extra ? " " + extra : ""}`;

// ── Zone bar-chart palette ────────────────────────────────────────────────
// The categorical sequence from the Zone bar-chart docs (used for multi-series
// bars: payout method, payroll breakdown). Confirmed/Projected map to the two
// semantic anchors: Projected = Primary/600 (blue), Confirmed = Teal/600 (green-ish).
const ZONE_CHART = [
  "#2F8AF4", // 1  Primary/600
  "#7EDCE2", // 2  Teal/300
  "#8B1DFF", // 3  Purple/500
  "#FFD5A8", // 4  Orange/200
  "#F17EB8", // 5  Pink/400
  "#FDF6B2", // 6  Yellow/100
  "#C1E4FD", // 7  Primary/200
  "#047481", // 8  Teal/600
  "#D1A5FF", // 9  Purple/200
  "#FFAC51", // 10 Orange/400
  "#F8B4D9", // 11 Pink/300
  "#FCE96A", // 12 Yellow/200
];
// Per-swatch opacity from the Zone bar-chart docs (80% / 70%).
const ZONE_CHART_OPACITY = [0.8, 0.7, 0.8, 0.7, 0.8, 0.7, 0.7, 0.8, 0.7, 0.8, 0.7, 0.8];
// Bake an opacity into a hex color as an 8-digit #RRGGBBAA so `fill` carries it.
const withAlpha = (hex: string, o: number) => hex + Math.round(o * 255).toString(16).padStart(2, "0");
// Tracked (was "Confirmed") / Planned / Projected — the certainty ladder.
const ZONE_CHART_CONFIRMED = "#0e9f6e"; const ZONE_CHART_OP_CONFIRMED = 0.8; // Green/500 — labeled "Tracked"
const ZONE_CHART_PLANNED   = "#0168dd"; const ZONE_CHART_OP_PLANNED   = 0.8; // Primary/700 (Blue/700)
const ZONE_CHART_PROJECTED = "#7fcaff"; const ZONE_CHART_OP_PROJECTED = 0.7; // Primary/300 (light blue)
const ZONE_CHART_TRACKED_LABEL = "Tracked";

// Small hover tooltip on an info icon — explains a figure or label in place.
function InfoTip({ text, width = 200 }: { text: string; width?: number }) {
  return (
    <span data-zone="tooltip" className="group relative inline-flex align-middle leading-none">
      <Info size={11} className="text-[#9ca3af] hover:text-[#4b5563] transition-colors cursor-help" />
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block z-30 pointer-events-none" style={{ width }}>
        <span className="block bg-[#111827] text-white text-[11px] font-normal normal-case tracking-normal whitespace-normal leading-snug text-left rounded-md px-2.5 py-1.5 shadow-lg">{text}</span>
      </span>
    </span>
  );
}
const v1InfoText = {
  unknown:   "Hubstaff can't read this account's balance automatically. Check it manually in your provider account to confirm you can cover the amount due.",
  actuals:   "Payroll already paid out this period, from completed runs.",
  projected: "Estimated hourly earnings still to be tracked this period — replaced by Tracked as real hours come in.",
  confirmed: "Confirmed for this period — tracked hours, overtime, and any fixed pay already earned. Won't change.",
  planned:   "Scheduled but not yet earned: upcoming PTO, holidays, and payroll adjustments. Moves to Tracked once earned.",
  projAgg:   "The estimated hourly earnings not yet tracked this period. As hours are tracked, this estimate is replaced by Tracked. Shown in aggregate, not per person.",
};
const v1SegLegendInfo: Record<string, string> = { Actuals: v1InfoText.actuals, Confirmed: v1InfoText.actuals, Tracked: v1InfoText.actuals, Projected: v1InfoText.projected };
const v1SourceLegendInfo: Record<string, string> = { Confirmed: v1InfoText.confirmed, Tracked: v1InfoText.confirmed, Planned: v1InfoText.planned, "~Projected": v1InfoText.projAgg };

// Payout methods you send yourself (manual — no scheduled trigger) vs. ones Hubstaff auto-triggers on a schedule.
const v1gManualProviders = new Set(["bitwage", "gusto", "export"]);
const v1gTriggerTime = "9:00 AM PST"; // scheduled auto-trigger time (adjustable via the pencil)

// Pending-approval popover — lists the members whose timesheets await approval (scope = "all" or a provider id).
// Trigger = the alert's "3 timesheets" link or a yellow pill; each member row links out to that member.
function PendingMembersTrigger({ scope = "all", align = "left", className = "", children }: { scope?: string; align?: "left" | "right"; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (ev: MouseEvent) => { if (ref.current && !ref.current.contains(ev.target as Node)) setOpen(false); };
    const onEsc = (ev: KeyboardEvent) => { if (ev.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [open]);
  const members = v1SpilloverMembers.filter(m => scope === "all" || m.provider === scope);
  const total = members.reduce((s, m) => s + m.amount, 0);
  return (
    <span ref={ref} className="relative inline-flex align-baseline">
      <button type="button" onClick={ev => { ev.preventDefault(); ev.stopPropagation(); setOpen(o => !o); }} className={className}>{children}</button>
      {open && (
        <div className={`absolute z-50 top-full mt-2 ${align === "right" ? "right-0" : "left-0"} w-72 rounded-lg border border-[#e5e7eb] bg-white shadow-xl text-left cursor-default`} onClick={ev => ev.stopPropagation()}>
          <div className={`absolute -top-[5px] ${align === "right" ? "right-4" : "left-4"} w-2.5 h-2.5 rotate-45 bg-white border-l border-t border-[#e5e7eb]`} />
          <div className="px-3 pt-2.5 pb-2">
            <p className="text-[13px] font-semibold text-[#111827]">Pending timesheet approval</p>
            <p className="text-[11px] leading-snug text-[#6b7280] mt-0.5">Approve these hours to include them in this payment.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 border-y border-[#f3f4f6] text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
            <span className="flex-1">Team member</span>
            <span className="w-16">Provider</span>
            <span className="w-14 text-right">Pending</span>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#f3f4f6] transition-colors">
                <span className="flex-1 min-w-0 text-[13px]"><a href="#" onClick={ev => ev.preventDefault()} className="block text-[#111827] underline underline-offset-2 decoration-[#9ca3af] hover:decoration-[#111827] truncate">{m.name}</a></span>
                <span className="w-16 flex items-center gap-1 text-[13px] text-[#6b7280] min-w-0"><ProviderLogo id={m.provider} size={12} /><span className="truncate">{v1gProviderMeta[m.provider]?.name ?? m.provider}</span></span>
                <span className="w-14 text-right text-[13px] tabular-nums text-[#111827] flex-shrink-0">+{fmt0(m.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border-t border-[#e5e7eb] text-[13px] font-semibold">
            <span className="flex-1 text-[#111827]">Total pending</span>
            <span className="w-16" />
            <span className="w-14 text-right tabular-nums text-[#723b13]">+{fmt0(total)}</span>
          </div>
        </div>
      )}
    </span>
  );
}

function V1kFundDateCard({ e, v1l = false, zone = false, condensed = false, mvp = false, sync = false, mergeCls = "", noSpillover = false, onProviderClick }: { e: V1gFundDate; v1l?: boolean; zone?: boolean; condensed?: boolean; mvp?: boolean; sync?: boolean; mergeCls?: string; noSpillover?: boolean; onProviderClick?: (providerId: string) => void }) {
  const wiseVer = useContext(WiseVerContext);
  // Zone typography (from app.hubstaff.com/zone/docs/typography + real staging table):
  // body text = 14px (text-sm), labels = 12px (text-xs), Roboto, gray-900/700/500.
  const zt = {
    name:      zone ? "text-sm" : "text-xs",              // provider name: 14 vs 12
    nameColor: zone ? "text-[#111827]" : "text-[#111827]", // gray-900
    cadence:   zone ? "text-[12px] text-[#6b7280]" : "text-[11px] text-[#6b7280]", // 12/gray-500
    num:       zone ? "text-[12px] text-[#6b7280]" : "text-[12px] text-[#4b5563]", // Balance/Due: gray-500 (lighter than Fund)
    numStrong: zone ? "text-[12px] text-[#111827]" : "text-[12px] text-[#111827]", // Fund/Total: gray-900 (strongest)
    head:      zone ? "text-[11px] text-[#6b7280]" : "text-[9px] text-[#6b7280]",   // headers 11 vs 9
    unknown:   zone ? "text-[12px] text-[#9ca3af]" : "text-[12px] text-[#9ca3af]",  // gray-400
  };
  // Zone gets a touch more breathing room in the table (rows 8→10px, header 6→8px).
  const rowPad = zone ? "py-2" : "py-2";
  const headPad = zone ? "pb-2" : "pb-1.5";
  const isNext = e.tag === "next";
  const spilloverLvlCtx = useContext(SpilloverContext);
  const spilloverLvl = noSpillover ? null : spilloverLvlCtx; // the "Fund by today" card reuses this card but has no pending/late markers
  const reportVer = useContext(PmtReportVerContext);
  const certainty = mvp && !noSpillover; // MVP fund-by shows Not-approved/Approved/Due columns in both off-schedule versions
  const lateFold = spilloverLvl === "red" && isNext; // amounts fold into the imminent card's method rows (red only)
  const lateMark = spilloverLvl != null && isNext;   // late marker shows on affected methods in yellow AND red
  const lateOf = (id: string) => (lateFold ? (v1SpilloverLate[id] ?? 0) : 0);
  const marks = (id: string) => lateMark && v1SpilloverLate[id] != null;
  const markClr = spilloverLvl === "red" ? "text-[#c81e1e]" : "text-[#8e4b10]"; // red in red, amber in yellow
  const yellowPending = spilloverLvl === "yellow" && isNext; // yellow: pending approvals shown as amount pills next to Due/Total (base numbers stay confirmed, not folded)
  const pendingOf = (id: string) => (yellowPending ? (v1SpilloverLate[id] ?? 0) : 0);
  const yellowPill = (amount: number, scope: string, suffix?: string) => (
    <PendingMembersTrigger scope={scope} align="right" className="inline-flex items-center gap-0.5 align-middle rounded-full bg-[#fdf6b2] text-[#723b13] text-[10px] font-medium px-1.5 py-0.5 whitespace-nowrap hover:bg-[#fce96a] transition-colors cursor-pointer">
      <span className="material-symbols-rounded" style={{ fontSize: 11 }}>history</span>+{fmt0(amount)}{suffix ? <span className="font-normal ml-0.5">{suffix}</span> : null}
    </PendingMembersTrigger>
  );
  const projected = e.tag === "projected";
  const check = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
  const fundTotal = e.providers.reduce((s, p) => s + v1jAddFor(p.id, p.amount + lateOf(p.id)).amount, 0);
  const dueTotal = e.providers.reduce((s, p) => s + p.amount + lateOf(p.id), 0);
  // MVP certainty totals: Due = sum of amounts, Not approved yet = pending portion, Approved = the rest.
  const mvpDueTotal = e.providers.reduce((s, p) => s + p.amount, 0);
  const mvpNotApprovedTotal = e.providers.reduce((s, p) => s + Math.min(v1PendingApproval[p.id] ?? 0, p.amount), 0);
  const mvpApprovedTotal = mvpDueTotal - mvpNotApprovedTotal;
  // Sync version keeps the column ALWAYS (dashes when zero) so the table structure never shifts between cards.
  const hasNotApproved = sync ? true : mvpNotApprovedTotal > 0; // otherwise only show the column when this card has pending
  const pendingColLabel = sync ? "Pending timesheets" : "Not approved";
  // Card-level pay periods (the card is grouped by period end date, so periods describe the whole card).
  const cardPeriods: { type: string; dates?: string }[] = (() => {
    const seen = new Map<string, string | undefined>();
    e.providers.forEach(p => (p.periods ?? []).forEach(pd => { if (!seen.has(pd.type)) seen.set(pd.type, pd.dates); }));
    if (seen.size === 0) [...new Set(e.providers.map(p => v1mProviderCycles[p.id]?.cycle ?? "Monthly"))].forEach(c => seen.set(c, undefined));
    return [...seen.entries()].map(([type, dates]) => ({ type, dates }));
  })();
  // Periods sit on the title row's RIGHT side (next to the "Next" pill): "3 periods" when several
  // (hover lists them with dates), or the single type name ("Monthly") when there's just one.
  // Gray pill, same shape as the off-schedule "No funding date" pill; multi-period pills list dates on hover.
  const periodsBadge = sync && cardPeriods.length > 0 ? (
    cardPeriods.length === 1 ? (
      <span className={zpill("gray", "md", "flex-shrink-0")}>{cardPeriods[0].type}</span>
    ) : (
      <span className="relative group inline-flex cursor-help flex-shrink-0">
        <span className={zpill("gray", "md")}>{cardPeriods.length} periods</span>
        <span className="pointer-events-none absolute right-0 top-full mt-1 z-40 hidden group-hover:block bg-[#111827] text-white text-[11px] font-normal rounded-md px-2.5 py-2 shadow-lg whitespace-nowrap text-left">
          <span className="block font-semibold mb-1">This funding includes</span>
          {cardPeriods.map(pd => <span key={pd.type} className="block leading-relaxed">{pd.type}{pd.dates ? <span className="text-[#9ca3af]"> — {pd.dates}</span> : null}</span>)}
        </span>
      </span>
    )
  ) : null;
  const periodsSegment = null;
  const monthDay = (e.fundBy ?? "").split(", ")[1] ?? e.fundBy;
  const shortDay = (e.fundBy ?? "").split(", ")[0];
  const weekday = v1kDowFull[shortDay] ?? "";
  const showTable = !condensed;
  const [showDialog, setShowDialog] = useState(false);

  const providerTable = (
    <table data-zone="table" className="w-full table-fixed">
      <colgroup>
        <col />
        {certainty ? (hasNotApproved ? (<><col className="w-[26%]" /><col className="w-[24%]" /><col className="w-[21%]" /></>) : (<><col className="w-[26%]" /><col className="w-[24%]" /></>)) : mvp ? (<col className="w-[24%]" />) : (<><col className="w-[24%]" /><col className="w-[18%]" /><col className="w-[18%]" /></>)}
      </colgroup>
      <thead>
        <tr className={`${zt.head} font-semibold uppercase tracking-wide`}>
          <th className={`text-left font-semibold ${headPad} border-b border-[#e5e7eb]`}>{certainty ? (<>Payout<br />method</>) : "Payout method"}</th>
          {certainty ? (<>
            {hasNotApproved && <th className={`text-right font-semibold ${headPad} pl-3 border-b border-[#e5e7eb]`}>{pendingColLabel}</th>}
            <th className={`text-right font-semibold ${headPad} pl-3 border-b border-[#e5e7eb]`}>Approved</th>
            <th className={`text-right font-semibold ${headPad} pl-3 border-b border-[#e5e7eb]`}>Due</th>
          </>) : mvp ? (
            <th className={`text-right font-semibold ${headPad} pl-4 border-b border-[#e5e7eb]`}>Due</th>
          ) : (<>
            <th className={`text-right font-semibold ${headPad} pl-4 border-b border-[#e5e7eb]`}>Due</th>
            <th className={`text-right font-semibold ${headPad} pl-4 border-b border-[#e5e7eb]`}>Balance</th>
            <th className={`text-right font-semibold ${headPad} pl-4 border-b border-[#e5e7eb]`}>{e.funded ? "Status" : "Fund"}</th>
          </>)}
        </tr>
      </thead>
      <tbody>
        {e.providers.map(p => {
          const meta = v1gProviderMeta[p.id];
          const bal = v1jBalances[p.id];
          const late = lateOf(p.id);
          const mark = spilloverLvl === "red" && marks(p.id); // name marker: red only (yellow shows a pending pill by the Due)
          const pending = pendingOf(p.id);
          const res = v1jAddFor(p.id, p.amount + late);
          const cadence = v1mProviderCycles[p.id]?.cycle ?? "Monthly";
          // MVP certainty split: Due = amount, Not approved yet = pending-approval portion, Approved = the rest.
          const notApproved = Math.min(v1PendingApproval[p.id] ?? 0, p.amount);
          const approvedAmt = p.amount - notApproved;
          return (
            <tr key={p.id} className={`border-b last:border-0 ${zone ? "border-[#f3f4f6]" : "border-[#f3f4f6]"}`}>
              <td className={`${rowPad} pr-2`}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <ProviderLogo id={p.id} size={16} />
                  {p.id === "export" ? (
                    <span className={`${zt.name} font-medium ${zt.nameColor} truncate`}>{meta.name}</span>
                  ) : (
                    <a href="#" onClick={ev => { ev.preventDefault(); onProviderClick?.(p.id); }} className={`${zt.name} font-medium ${zt.nameColor} underline decoration-[#9ca3af] decoration-[1.5px] underline-offset-2 hover:decoration-[#111827] whitespace-nowrap flex-shrink-0`}>
                      {meta.name}
                    </a>
                  )}
                  {/* Pay period(s) inline next to the name — hidden when the certainty columns show (report V1/V2 MVP). */}
                  {v1l && !certainty && (p.periods && p.periods.length ? (
                    <span className={`${zt.cadence} whitespace-nowrap flex-shrink-0 relative group inline-flex items-center cursor-help`}>
                      <span className="text-[#d1d5db] mx-1">·</span>
                      <span className="underline decoration-dotted decoration-[#9ca3af] underline-offset-2">{p.periods.length > 2 ? `${p.periods.length} periods` : p.periods.map(pd => pd.type).join(" • ")}</span>
                      <span className="pointer-events-none absolute left-3 top-full mt-1 z-40 hidden group-hover:block bg-[#111827] text-white text-[11px] font-normal rounded-md px-2.5 py-2 shadow-lg whitespace-nowrap text-left normal-case">
                        <span className="block font-semibold mb-1">This funding includes</span>
                        {p.periods.map(pd => <span key={pd.type} className="block leading-relaxed">{pd.type}{pd.dates ? <span className="text-[#9ca3af]"> — {pd.dates}</span> : null}</span>)}
                      </span>
                    </span>
                  ) : (
                    <span className={`${zt.cadence} whitespace-nowrap flex-shrink-0`}><span className="text-[#d1d5db] mx-1">·</span>{cadence}</span>
                  ))}
                  {mark && <span title={late > 0 ? `${fmt0(late)} approved after the cycle closed` : "Has timesheets awaiting approval — may be added to this payment"} aria-label="Late-approved timesheets" className={`inline-flex items-center flex-shrink-0 cursor-help ${markClr}`}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>history</span></span>}
                </div>
                {/* v1 — subtle inline Wise-interest link under the Wise row (mvp2: shorter, the whole text is the link) */}
                {sync && p.id === "wise" ? (
                  <a href={WISE_INTEREST_URL} target="_blank" rel="noopener noreferrer" className="mt-0.5 flex items-center gap-1 text-[11px] text-[#0168dd] hover:text-[#0057bb] transition-colors whitespace-nowrap w-fit">
                    <TrendingUp size={12} aria-hidden="true" className="flex-shrink-0" />
                    <span className="font-medium underline underline-offset-2">Earn interest on your balance</span>
                  </a>
                ) : wiseVer === 1 && p.id === "wise" ? (
                  <a href={WISE_INTEREST_URL} target="_blank" rel="noopener noreferrer" className="mt-0.5 flex items-center gap-1 text-[11px] text-[#0168dd] hover:text-[#0057bb] transition-colors whitespace-nowrap w-fit">
                    <TrendingUp size={12} aria-hidden="true" className="flex-shrink-0" />
                    <span>Earn interest on your Wise balance</span>
                    <span className="text-[#93c5fd]" aria-hidden="true">·</span>
                    <span className="font-medium underline underline-offset-2">Learn how</span>
                  </a>
                ) : null}
              </td>
              {certainty ? (<>
                {/* Report V2 — certainty columns: Not approved (only if any) · Approved · Due */}
                {hasNotApproved && <td className={`${rowPad} pl-3 text-right whitespace-nowrap tabular-nums text-[11px] font-semibold ${notApproved > 0 ? "text-[#9f580a]" : "text-[#d1d5db]"}`}>{notApproved > 0 ? fmt0(notApproved) : "—"}</td>}
                <td className={`${rowPad} pl-3 text-right whitespace-nowrap tabular-nums text-[11px] font-semibold text-[#111827]`}>{fmt0(approvedAmt)}</td>
                <td className={`${rowPad} pl-3 text-right whitespace-nowrap tabular-nums text-[11px] font-semibold text-[#4b5563]`}>{fmt0(p.amount)}</td>
              </>) : mvp ? (
                <td className={`${rowPad} pl-4 text-right whitespace-nowrap tabular-nums ${v1l ? zt.num : "text-[11px] font-semibold text-[#4b5563]"}`}><span className="flex items-center gap-1.5 justify-end">{pending > 0 && yellowPill(pending, p.id)}<span>{fmt0(p.amount + late)}</span></span></td>
              ) : (<>
              <td className={`${rowPad} pl-4 text-right whitespace-nowrap tabular-nums ${v1l ? zt.num : "text-[11px] font-semibold text-[#4b5563]"}`}><span className="flex items-center gap-1.5 justify-end">{pending > 0 && yellowPill(pending, p.id)}<span>{fmt0(p.amount + late)}</span></span></td>
              <td className={`${rowPad} pl-4 text-right whitespace-nowrap tabular-nums ${v1l ? zt.num : "text-[11px] font-semibold text-[#4b5563]"}`}>{/* v3 — balance-anchored Wise-interest tag (icon-only, left of the number so the amount stays column-aligned) */}{wiseVer === 3 && p.id === "wise" && bal !== undefined && (<span title="This balance earns interest" aria-label="This balance earns interest" className="mr-1.5 inline-flex items-center align-middle text-[#0e9f6e]"><Gift size={13} aria-hidden="true" /></span>)}{bal !== undefined ? fmt0(bal) : (v1l ? <span className={`inline-flex items-center gap-1 justify-end ${zone ? "text-[#9ca3af]" : "text-[#9ca3af]"}`}>Unknown <InfoTip text={v1InfoText.unknown} /></span> : "—")}</td>
              <td className={`${rowPad} pl-4 text-right whitespace-nowrap`}>
                {e.funded ? (
                  <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 justify-end">{check} paid</span>
                ) : res.kind === "covered" ? (
                  <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 justify-end">{check} covered</span>
                ) : (
                  <span className={v1l ? `${zt.numStrong} tabular-nums` : "text-xs font-bold text-amber-600"}>{fmt0(res.amount)}</span>
                )}
              </td>
              </>)}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div data-zone="card" data-component={zone ? "Fund-by card" : undefined} className={`rounded-lg border bg-white ${zone ? (sync ? "px-5 py-4" : "p-4") : "px-4 py-3"} flex flex-col h-full ${zone ? "border-[#e5e7eb]" : (isNext ? "border-[#d1d5db]" : "border-[#e5e7eb]")}${mergeCls ? " " + mergeCls : ""}`}>
      {zone ? (
        /* Final UI — title + cycle caption stacked on the left, pill on the right */
        <div className="flex justify-between items-start gap-2 mb-4">
          <div className="min-w-0">
            <p>
              <span className="text-base whitespace-nowrap text-[#111827]">Fund by </span>
              <span className={`text-base font-bold whitespace-nowrap ${projected ? "text-[#6b7280]" : "text-[#111827]"}`}>{monthDay}</span>
              <span className="text-base text-[#6b7280] whitespace-nowrap"> · {shortDay}</span>
            </p>
            {e.providers.every(p => v1gManualProviders.has(p.id)) ? (
              <p className={`${zt.cadence} flex items-center gap-x-1.5 flex-wrap`}>
                <span>Cycle ends {monthDay}</span>
                <span className="text-[#d1d5db]">·</span>
                <span>Triggered by you</span>
                {periodsSegment}
              </p>
            ) : (
              <p className={`${zt.cadence} flex items-center gap-x-1.5 flex-wrap`}>
                <span>Cycle ends {monthDay}</span>
                <span className="text-[#d1d5db]">·</span>
                <span>Triggers {e.date}</span>
                {periodsSegment}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {periodsBadge}
            {isNext ? (
              <span className={zpill("primary", "md", "flex-shrink-0")}><span className="material-symbols-rounded leading-none" style={{ fontSize: 16, marginRight: 2 }}>event_upcoming</span> Next</span>
            ) : projected ? (
              <span className="text-[10px] text-[#d1d5db] flex-shrink-0">projected</span>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between gap-2 items-start">
            <p className={condensed ? "whitespace-nowrap min-w-0" : "min-w-0"}>
              {v1l && <span className="text-sm whitespace-nowrap text-[#6b7280]">Fund by </span>}
              <span className={`text-sm font-bold whitespace-nowrap ${projected ? "text-[#6b7280]" : "text-[#111827]"}`}>{monthDay}</span>
              <span className="text-sm text-[#6b7280] whitespace-nowrap">{v1l ? ` · ${shortDay}` : `, ${weekday}`}</span>
              {condensed && isNext && <>{" "}<span className="inline-flex items-center gap-1 align-middle text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e8f2fd] text-[#0168dd]"><CalendarDays size={10} /> next</span></>}
              {condensed && projected && <>{" "}<span className="align-middle text-[10px] text-[#d1d5db]">projected</span></>}
              {!v1l && <>{" "}<span className="whitespace-nowrap"><span className="text-[#d1d5db] mr-1.5">·</span><span className={`text-[11px] ${e.funded ? "text-emerald-600 font-medium" : "text-[#6b7280]"}`}>{e.funded ? "Paid" : "Fund deadline"}</span></span></>}
            </p>
            {condensed ? (
              <button onClick={() => setShowDialog(true)} className="text-[11px] font-medium text-[#0168dd] hover:text-[#0057bb] transition-colors select-none flex-shrink-0">View details</button>
            ) : isNext ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e8f2fd] text-[#0168dd] flex-shrink-0"><CalendarDays size={10} /> next</span>
            ) : projected ? (
              <span className="text-[10px] text-[#d1d5db] flex-shrink-0 mt-0.5">projected</span>
            ) : null}
          </div>
          <p className={zt.cadence}>{v1l ? <>Cycle ends {monthDay} · triggers {e.date}</> : <>Payroll runs {e.date} · paid ~{e.paidOn}</>}</p>
        </>
      )}

      {showTable && <div className={zone ? "" : "mt-3"}>{providerTable}</div>}

      {certainty && !e.funded ? (
        /* Report V2 — Total row aligned under Not approved (if any) · Approved · Due */
        <div className={`${showTable ? "mt-auto" : "mt-4"} pt-2 border-t border-[#e5e7eb]`}>
          <table className="w-full table-fixed">
            <colgroup>{hasNotApproved ? (<><col /><col className="w-[26%]" /><col className="w-[22%]" /><col className="w-[20%]" /></>) : (<><col /><col className="w-[26%]" /><col className="w-[24%]" /></>)}</colgroup>
            <tbody>
              <tr>
                <td className="text-[11px] font-semibold uppercase tracking-wide text-[#111827] align-middle">Total</td>
                {hasNotApproved && <td className={`pl-3 text-right align-middle text-[11px] font-semibold tabular-nums ${mvpNotApprovedTotal > 0 ? "text-[#9f580a]" : "text-[#d1d5db]"}`}>{mvpNotApprovedTotal > 0 ? fmt0(mvpNotApprovedTotal) : "—"}</td>}
                <td className="pl-3 text-right align-middle text-[11px] font-semibold text-[#111827] tabular-nums">{fmt0(mvpApprovedTotal)}</td>
                <td className="pl-3 text-right align-middle text-[11px] font-semibold text-[#111827] tabular-nums">{fmt0(mvpDueTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : !mvp && !e.funded ? (
        <div className={`${showTable ? "mt-auto" : "mt-4"} pt-2 border-t border-[#e5e7eb]`}>
          <table className="w-full table-fixed">
            <colgroup><col /><col className="w-[24%]" /><col className="w-[18%]" /><col className="w-[18%]" /></colgroup>
            <tbody>
              <tr>
                <td className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af] align-middle">Totals</td>
                <td className="text-right align-middle"><span className="flex items-center gap-1.5 justify-end">{yellowPending && yellowPill(v1SpilloverTotal, "all", "pending")}<span className={`${zt.numStrong} font-semibold tabular-nums`}>{fmt0(dueTotal)}</span>{lateFold && <span title={`Includes ${fmt0(v1SpilloverTotal)} approved after the cycle closed`} aria-label="Late-approved timesheets" className={`inline-flex items-center align-middle cursor-help ${markClr}`}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>history</span></span>}</span></td>
                <td />
                <td className="text-right align-middle"><span className={`${zt.numStrong} font-semibold tabular-nums`}>{fmt0(fundTotal)}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`${showTable ? "mt-auto" : "mt-4"} pt-2 border-t border-[#e5e7eb] flex items-center justify-between gap-2`}>
          <span className={v1l ? `${zt.numStrong} font-medium` : "text-[#111827] text-[11px] font-semibold"}>{e.funded ? "Total paid" : "Total due"}{lateFold && <span title={`Includes ${fmt0(v1SpilloverTotal)} approved after the cycle closed`} aria-label="Late-approved timesheets" className={`ml-1 inline-flex items-center align-middle cursor-help ${markClr}`}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>history</span></span>}{condensed && <span className="font-normal text-[#6b7280]"> · {e.providers.length} payment method{e.providers.length > 1 ? "s" : ""}</span>}</span>
          <span className="flex items-center gap-1.5 justify-end">{yellowPending && yellowPill(v1SpilloverTotal, "all", "pending")}<span className={v1l ? `${zt.numStrong} font-semibold tabular-nums` : `text-xs font-bold ${e.funded ? "text-emerald-600" : "text-[#111827]"}`}>{fmt0(dueTotal)}</span></span>
        </div>
      )}

      {showDialog && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <div className="bg-white rounded-xl shadow-2xl w-[420px] max-w-full pointer-events-auto">
              <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[#e5e7eb]">
                <div>
                  <p>
                    <span className="text-sm font-bold text-[#111827]">{monthDay}</span>
                    <span className="text-sm text-[#6b7280]">, {weekday}</span>
                    {isNext && <>{" "}<span className="inline-flex items-center gap-1 align-middle text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e8f2fd] text-[#0168dd]"><CalendarDays size={10} /> next</span></>}
                  </p>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">Cycle ends {monthDay} · triggers {e.date}</p>
                </div>
                <button onClick={() => setShowDialog(false)} className="p-1 rounded-md text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors flex-shrink-0"><X size={16} /></button>
              </div>
              <div className="px-5 py-3">
                {providerTable}
                <div className="mt-2 pt-2 border-t border-[#e5e7eb] flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#111827]">{e.funded ? "Total paid" : "Total to fund"}</span>
                  <span className="text-sm font-bold text-[#111827] tabular-nums">{fmt0(e.funded ? dueTotal : fundTotal)}</span>
                </div>
              </div>
              <div className="flex items-center justify-end px-5 py-3">
                <button onClick={() => setShowDialog(false)} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#0168dd] text-white hover:bg-[#0057bb] transition-colors">Done</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 1K — "Learn more": explains the funding lifecycle, the columns, and caveats.
function V1kLearnMoreDialog({ open, onClose, v1l = false, zone = false }: { open: boolean; onClose: () => void; v1l?: boolean; zone?: boolean }) {
  if (!open) return null;
  const nx = v1gFundSchedule.find(e => e.tag === "next");
  const fundByDay = (nx?.fundBy ?? "").split(", ")[1] ?? "—";
  const triggerDay = nx?.date ?? "—";
  const steps = v1l
    ? [
        { label: "Cycle ends", date: fundByDay, desc: "Your payroll period closes." },
        { label: "Payment triggered", date: triggerDay, desc: "We start the payment." },
      ]
    : [
        { label: "Fund by", date: fundByDay, desc: "Money must be in the account", accent: true },
        { label: "Payroll runs", date: triggerDay, desc: "The payment is triggered" },
        { label: "Paid", date: `~${nx?.paidOn ?? "—"}`, desc: "Employees receive it" },
      ];
  const gapDef = <>What you still need to add <span className="text-[#111827] font-medium">after</span> the balance. “Covered” means the balance already handles it.</>;
  const terms: [string, React.ReactNode][] = [
    ["Balance", "What's in the account right now."],
    ["Due", "The total going out on that date (the gross payment)."],
    ["Fund", gapDef],
    ["Total to fund", "The sum to add across all accounts for that date."],
  ];
  const goodToKnow: React.ReactNode[] = v1l
    ? [
        "Funding transfers can take 1–3 days.",
        "Actual payment timing is an estimate and varies by provider.",
        <>When we can’t read an account’s balance, we show the full payout as the gap to fund — not a confirmed gap.</>,
      ]
    : [
        "Bank transfers can take a few days — fund a little earlier to be safe.",
        "“Paid” is an estimate and varies by provider.",
        "When we can’t read an account’s balance, we show the full payout to fund — not a confirmed gap.",
      ];
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div data-zone="dialog" className="bg-white rounded-xl shadow-2xl w-[520px] max-w-full max-h-[85vh] flex flex-col pointer-events-auto">
          <div className="flex items-start justify-between px-5 py-5 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">How funding works</h2>
            </div>
            <button data-zone="icon_button" onClick={onClose} className="p-1 rounded-md text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors flex-shrink-0"><X size={16} /></button>
          </div>

          <div className="px-5 py-2.5 overflow-y-auto space-y-5">
            {/* Timing lifecycle */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-2">Timing</p>
              <div className="flex items-stretch gap-1.5">
                {steps.map((s, i) => (
                  <Fragment key={s.label}>
                    <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${s.accent ? "text-amber-600" : "text-[#6b7280]"}`}>{s.label}</p>
                      <p className="text-base font-bold text-[#111827] mt-0.5">{s.date}</p>
                      <p className="text-xs text-[#6b7280] mt-1 leading-snug">{s.desc}</p>
                    </div>
                    {i < steps.length - 1 && <div className="flex items-center text-[#9ca3af] flex-shrink-0"><ChevronRight size={14} /></div>}
                  </Fragment>
                ))}
              </div>
            </div>

            {/* Column glossary */}
            <div className="pt-4 border-t border-[#e5e7eb]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-2">What the columns mean</p>
              <ul className="space-y-4 text-sm leading-relaxed">
                {terms.map(([term, def]) => (
                  <li key={term} className="text-[#6b7280]">
                    <span className="font-semibold text-[#111827] block mb-0.5">{term}</span>
                    {def}
                  </li>
                ))}
              </ul>
            </div>

            {/* Caveats */}
            <div className="pt-4 border-t border-[#e5e7eb]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-2">Good to know</p>
              <ul className="space-y-1.5 text-sm text-[#6b7280] leading-snug">
                {goodToKnow.map((t, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#9ca3af]">•</span><span>{t}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end px-5 py-5 flex-shrink-0">
            <button onClick={onClose} className={zone ? zbtn("solidPrimary", "md") : "px-5 py-2 rounded-lg text-sm font-semibold bg-[#0168dd] text-white hover:bg-[#0057bb] transition-colors"}>Got it</button>
          </div>
        </div>
      </div>
    </>
  );
}

// "Not scheduled" — members with no pay period: cost accrues, no funding date. Same card structure as a Fund-by card (title · members / table / total).
function V1kNotSchedCard() {
  return (
    <div data-zone="card" className="rounded-lg border bg-white p-4 flex flex-col h-full border-[#e5e7eb]">
      <div className="flex justify-between items-start gap-2 mb-4">
        <div className="min-w-0">
          <p className="text-base font-bold text-[#111827]">Not scheduled</p>
          <p className="text-[12px] text-[#6b7280] mt-0.5">{v1NotSchedMembers} members with no pay period set</p>
        </div>
        <button title="Set pay periods" aria-label="Set pay periods" className={zbtn("ghostPrimary", "sm", "flex-shrink-0 whitespace-nowrap")}><CalendarDays size={16} /> Set periods</button>
      </div>
      <table data-zone="table" className="w-full">
        <thead>
          <tr className="text-[11px] text-[#6b7280] font-semibold uppercase tracking-wide">
            <th className="text-left font-semibold pb-2 border-b border-[#e5e7eb]">Payout method</th>
            <th className="text-right font-semibold pb-2 pl-4 border-b border-[#e5e7eb]">Accrued</th>
          </tr>
        </thead>
        <tbody>
          {v1NotSchedRows.map((r, i) => {
            const div = i < v1NotSchedRows.length - 1 ? " border-b border-[#f3f4f6]" : "";
            return (
            <tr key={r.id}>
              <td className={"py-2 pr-2" + div}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <ProviderLogo id={r.id} size={16} />
                  <span className="text-sm font-medium text-[#111827] truncate">{r.label}</span>
                  <span className="text-[12px] text-[#6b7280] whitespace-nowrap flex-shrink-0"><span className="text-[#d1d5db] mx-1">·</span>{r.members} members</span>
                </div>
              </td>
              <td className={"py-2 pl-4 text-right whitespace-nowrap tabular-nums text-[12px] text-[#6b7280]" + div}>{fmt0(r.accrued)}</td>
            </tr>
          );})}
        </tbody>
      </table>
      <div className="mt-auto pt-2 border-t border-[#e5e7eb] flex items-center justify-between gap-2">
        <span className="text-[12px] text-[#111827] font-medium">Total accrued</span>
        <span className="text-[12px] text-[#111827] font-semibold tabular-nums">{fmt0(v1NotSchedTotal)}</span>
      </div>
    </div>
  );
}

// "Mixed" spillover — a compact "Off schedule" summary card (3rd in the funding row); details + approval open in a dialog.
function V1kOffScheduleCard({ approvedIds, onApprove, topLevel = false, mvp = false }: { approvedIds: string[]; onApprove: (id: string) => void; topLevel?: boolean; mvp?: boolean }) {
  const [dialog, setDialog] = useState<null | "owed" | "notsched">(null);
  const pending = v1OwedApproval.filter(m => !approvedIds.includes(m.id));
  const pendingTotal = pending.reduce((s, m) => s + m.amount, 0);
  // Same size/shape as the fund-by "Next" pill (zpill md), gray, with the calendar icon inside.
  const noFundingPill = <span className={zpill("gray", "md", "flex-shrink-0")}><span className="material-symbols-rounded leading-none" style={{ fontSize: 16, marginRight: 2 }}>event_busy</span> No funding date</span>;
  // Item content, shared between the two layouts
  // Each group mirrors the Fund-by card: [alert + title] left, ghost action top-right,
  // then a "cycle ends"-style description line that folds the amount in.
  const noPeriodContent = (
    <>
      <div className="flex items-start gap-2">
        <span className="material-symbols-rounded text-[#d97706] flex-shrink-0 mt-0.5" style={{ fontSize: 18 }}>warning</span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#111827]">No pay period set</p>
          <p className="text-[12px] text-[#6b7280] mt-0.5">{v1NotSchedMembers} members can&apos;t predict a date yet</p>
        </div>
      </div>
      <div className="mt-2 pl-[26px] flex items-center justify-between gap-2">
        <p><span className="text-base font-bold text-[#111827] tabular-nums">{fmt0(v1NotSchedTotal)}</span> <span className="text-[12px] text-[#6b7280]">accrued</span></p>
        <button onClick={() => setDialog("notsched")} className={zbtn("ghostPrimary", "sm", "flex-shrink-0 !gap-0.5 !px-2")}>Review <ChevronRight size={14} /></button>
      </div>
    </>
  );
  const stillOwedContent = (
    <>
      <div className="flex items-start gap-2">
        <span className="material-symbols-rounded text-[#d97706] flex-shrink-0 mt-0.5" style={{ fontSize: 18 }}>warning</span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#111827]">Still owed</p>
          <p className="text-[12px] text-[#6b7280] mt-0.5">{pending.length} member{pending.length > 1 ? "s" : ""} from past periods (pending timesheet approval)</p>
        </div>
      </div>
      <div className="mt-2 pl-[26px] flex items-center justify-between gap-2">
        <p><span className="text-base font-bold text-[#111827] tabular-nums">{fmt0(pendingTotal)}</span> <span className="text-[12px] text-[#6b7280]">owed</span></p>
        <button onClick={() => setDialog("owed")} className={zbtn("ghostPrimary", "sm", "flex-shrink-0 !gap-0.5 !px-2")}>Review <ChevronRight size={14} /></button>
      </div>
    </>
  );
  const footerNote = (
    <div className="flex items-start gap-1.5">
      <Info size={13} className="text-[#9ca3af] flex-shrink-0 mt-0.5" />
      <p className="text-[11px] text-[#6b7280] leading-snug">Not in your scheduled funding predictions yet — already counted in your trend and Future tracked so far.</p>
    </div>
  );
  return (
    <>
      {topLevel ? (
        <div data-zone="card" className="bg-white rounded-lg border border-[#e5e7eb] flex flex-col h-full">
          <div className="px-4 flex items-center justify-between gap-3 border-b bg-white rounded-t-lg h-[60px] border-[#e5e7eb]">
            <p className="text-lg font-medium text-[#111827] min-w-0 truncate">Off schedule</p>
            {noFundingPill}
          </div>
          {/* v2 — one container: the two problems are divider-separated rows (no inner cards → narrower content inset) */}
          <div className="px-4 pb-4 flex-1 flex flex-col">
            <div className="py-4">{noPeriodContent}</div>
            {pending.length > 0 && <div className="py-4 border-t border-[#e5e7eb]">{stillOwedContent}</div>}
            <div className="mt-auto pt-3 border-t border-[#e5e7eb]">{footerNote}</div>
          </div>
        </div>
      ) : (
        <div data-zone="card" className="rounded-lg border border-[#e5e7eb] bg-white p-4 flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-base font-bold text-[#111827] min-w-0 truncate">Off schedule</p>
            {noFundingPill}
          </div>
          <div className="py-3 border-t border-[#e5e7eb] mt-2">{noPeriodContent}</div>
          {pending.length > 0 && <div className="py-3 border-t border-[#e5e7eb]">{stillOwedContent}</div>}
          <div className="mt-auto pt-3 border-t border-[#e5e7eb]">{footerNote}</div>
        </div>
      )}
      {dialog && <V1kOffSchedDialog mode={dialog} approvedIds={approvedIds} onApprove={onApprove} onClose={() => setDialog(null)} />}
    </>
  );
}

// The "Fund by today" card appears once people are approved — they missed the cycle, so they fund today and pay tomorrow.
function V1kFundTodayCard({ approvedIds }: { approvedIds: string[] }) {
  const funded = v1OwedApproval.filter(m => approvedIds.includes(m.id));
  const total = funded.reduce((s, m) => s + m.amount, 0);
  return (
    <div data-zone="card" className="rounded-lg border border-[#bcd4f2] bg-[#f5faff] p-4 flex flex-col h-full">
      <div className="flex justify-between items-start gap-2 mb-4">
        <div className="min-w-0">
          <p><span className="text-base text-[#111827]">Fund by </span><span className="text-base font-bold text-[#111827]">today</span><span className="text-base text-[#6b7280]"> · Jun 22</span></p>
          <p className="text-[12px] text-[#6b7280] mt-0.5">Approved today · pays tomorrow</p>
        </div>
        <span className={zpill("primary", "md", "flex-shrink-0")}><span className="material-symbols-rounded leading-none" style={{ fontSize: 16, marginRight: 2 }}>bolt</span> New</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-[11px] text-[#6b7280] font-semibold uppercase tracking-wide">
            <th className="text-left font-semibold pb-2 border-b border-[#e5e7eb]">Payout method</th>
            <th className="text-right font-semibold pb-2 pl-4 border-b border-[#e5e7eb]">Fund</th>
          </tr>
        </thead>
        <tbody>
          {funded.map(m => (
            <tr key={m.id} className="border-b border-[#f3f4f6] last:border-0">
              <td className="py-2"><span className="inline-flex items-center gap-1.5"><ProviderLogo id={m.provider} size={14} /><span className="text-[13px] font-medium text-[#111827]">{m.name}</span><span className="text-[12px] text-[#6b7280]">· {v1gProviderMeta[m.provider]?.name ?? m.provider}</span></span></td>
              <td className="py-2 pl-4 text-right text-[13px] tabular-nums text-[#111827]">{fmt0(m.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-auto pt-2 border-t border-[#e5e7eb] flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#111827]">Total to fund</span>
        <span className="text-[12px] font-semibold text-[#111827] tabular-nums">{fmt0(total)}</span>
      </div>
    </div>
  );
}

// Details dialog behind the Off-schedule card's buttons. "owed" = approval flow; "notsched" = member breakdown.
function V1kOffSchedDialog({ mode, approvedIds = [], onApprove, onClose }: { mode: "owed" | "notsched"; approvedIds?: string[]; onApprove?: (id: string) => void; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h); }, [onClose]);
  if (mode === "owed") {
    const pending = v1OwedApproval.filter(m => !approvedIds.includes(m.id));
    const pendingTotal = pending.reduce((s, m) => s + m.amount, 0);
    const approvedCount = v1OwedApproval.length - pending.length;
    const initials = (n: string) => n.split(" ").map(w => w[0]).join("").slice(0, 2);
    const totalPages = Math.max(1, Math.ceil(pending.length / pageSize));
    const curPage = Math.min(page, totalPages);
    const startIdx = pending.length === 0 ? 0 : (curPage - 1) * pageSize + 1;
    const endIdx = Math.min(curPage * pageSize, pending.length);
    const pageItems = pending.slice((curPage - 1) * pageSize, curPage * pageSize);
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[680px] max-w-full pointer-events-auto max-h-[85vh] flex flex-col">
            {/* Header — bordered title bar (Bulk Payroll adjustments pattern) */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#e5e7eb] flex-shrink-0">
              <p className="text-[18px] font-semibold text-[#111827]">Review missed timesheets <span className="font-normal text-[#6b7280]">({pending.length})</span></p>
              <button onClick={onClose} aria-label="Close" className="p-1 rounded-md text-[#9ca3af] hover:text-[#4b5563] hover:bg-[#f3f4f6] flex-shrink-0"><X size={18} /></button>
            </div>
            <p className="px-5 pt-3 text-[13px] text-[#6b7280] leading-snug flex-shrink-0">The pay date passed before these timesheets were approved, so they dropped off the schedule. Review and approve them to get these people paid.</p>
            {/* Yellow alert — above the table */}
            <div className="mx-5 mt-3 mb-3 rounded-lg border border-[#9f580a] bg-[#fdfdea] text-[#723b13] px-3 py-2 flex items-start gap-2 flex-shrink-0">
              <span className="material-symbols-rounded flex-shrink-0" style={{ fontSize: 16 }}>schedule</span>
              <p className="text-[12px] leading-snug">Once approved, fund <span className="font-semibold">today</span> — this payment triggers <span className="font-semibold">tomorrow</span>.</p>
            </div>
            {approvedCount > 0 && (
              <div className="flex items-center justify-end px-5 pb-2 flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#0e9f6e]"><span className="material-symbols-rounded" style={{ fontSize: 15 }}>check_circle</span>{approvedCount} approved · {fmt0(v1OwedTotal - pendingTotal)} on Fund by today</span>
              </div>
            )}
            {/* Table — Bulk Payroll adjustments styling: bordered container, gray header, avatars, roomy rows; pagination lives inside */}
            <div className="overflow-y-auto flex-1 px-5 pb-5">
              <div className="rounded-lg border border-[#e5e7eb] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f9fafb] text-[12px] font-semibold text-[#1f2937]">
                      <th className="text-left px-4 py-2.5 border-b border-[#e5e7eb]">Team member</th>
                      <th className="text-left px-3 py-2.5 border-b border-[#e5e7eb]">Payout method</th>
                      <th className="text-right px-3 py-2.5 border-b border-[#e5e7eb]">Time logged</th>
                      <th className="text-right px-3 py-2.5 border-b border-[#e5e7eb]">To approve</th>
                      <th className="px-4 py-2.5 border-b border-[#e5e7eb]" />
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map(m => (
                      <tr key={m.id} className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f9fafb] transition-colors">
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2.5">
                            <span className="flex items-center justify-center size-6 rounded-full bg-[#eaf6ff] text-[#0168dd] text-[10px] font-semibold flex-shrink-0">{initials(m.name)}</span>
                            <a href="#" onClick={ev => ev.preventDefault()} className="text-sm font-semibold text-[#111827] hover:underline whitespace-nowrap">{m.name}</a>
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-[#6b7280]"><span className="inline-flex items-center gap-1.5 whitespace-nowrap"><ProviderLogo id={m.provider} size={14} />{v1gProviderMeta[m.provider]?.name ?? m.provider}</span></td>
                        <td className="px-3 py-3 text-right text-sm tabular-nums text-[#6b7280] whitespace-nowrap">{m.hours}</td>
                        <td className="px-3 py-3 text-right text-sm tabular-nums font-medium text-[#111827] whitespace-nowrap">{fmt0(m.amount)}</td>
                        <td className="px-4 py-3 text-right"><button onClick={() => onApprove?.(m.id)} className={zbtn("ghostPrimary", "sm")}>Approve</button></td>
                      </tr>
                    ))}
                    {pending.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-[#6b7280]">All approved — they&apos;re on <span className="font-medium text-[#111827]">Fund by today</span>.</td></tr>
                    )}
                  </tbody>
                  {pending.length > 0 && (
                    <tfoot>
                      <tr className="bg-[#f9fafb]">
                        <td colSpan={3} className="px-4 py-2.5 text-sm font-semibold text-[#111827] border-t border-[#e5e7eb]">Total to approve</td>
                        <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-[#111827] whitespace-nowrap border-t border-[#e5e7eb]">{fmt0(pendingTotal)}</td>
                        <td className="px-4 py-2.5 border-t border-[#e5e7eb]" />
                      </tr>
                    </tfoot>
                  )}
                </table>
                {/* Pagination — injected inside the table container */}
                {pending.length > 0 && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#e5e7eb] bg-white text-[13px] text-[#6b7280]">
                <div className="flex items-center gap-2">
                  <span>Showing {startIdx}-{endIdx} items</span>
                  <span className="relative inline-flex">
                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="appearance-none h-7 rounded-md border border-[#d1d5db] bg-white pl-2.5 pr-7 text-[13px] text-[#111827] cursor-pointer focus:outline-none">
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
                  </span>
                  <span>Per page</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} className={`min-w-7 h-7 px-2 rounded-md text-[13px] font-medium transition-colors ${p === curPage ? "bg-[#eaf6ff] text-[#0168dd]" : "text-[#4b5563] hover:bg-[#f3f4f6]"}`}>{p}</button>
                  ))}
                  <button onClick={() => setPage(Math.min(curPage + 1, totalPages))} disabled={curPage >= totalPages} className="inline-flex items-center gap-0.5 h-7 pl-2 pr-1.5 rounded-md text-[13px] font-medium text-[#4b5563] hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next <ChevronRight size={14} /></button>
                </div>
              </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-white rounded-xl shadow-2xl w-[460px] max-w-full pointer-events-auto max-h-[80vh] flex flex-col">
          <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[#e5e7eb]">
            <div className="min-w-0">
              <p className="text-[18px] font-semibold text-[#111827]">No pay period set</p>
              <p className="text-[13px] text-[#6b7280] mt-0.5">These members aren&apos;t on a pay period, so there&apos;s no funding date yet.</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-1 rounded-md text-[#9ca3af] hover:text-[#4b5563] hover:bg-[#f3f4f6] flex-shrink-0"><X size={18} /></button>
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            <p className="px-5 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">{v1NotSchedMembers} members · {fmt0(v1NotSchedTotal)} accrued</p>
            {v1NotSchedPeople.map(m => (
              <div key={m.id} className="flex items-center justify-between gap-3 px-5 py-2 border-b border-[#f3f4f6] last:border-0">
                <span className="flex items-center gap-2 min-w-0 text-sm"><ProviderLogo id={m.provider} size={16} /><span className="font-medium text-[#111827] truncate">{m.name}</span><span className="text-[#6b7280]">({v1gProviderMeta[m.provider]?.name ?? m.provider})</span></span>
                <span className="text-sm tabular-nums text-[#111827] flex-shrink-0">{fmt0(m.accrued)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-[#e5e7eb]">
            <span className="text-sm"><span className="font-semibold text-[#111827] tabular-nums">{fmt0(v1NotSchedTotal)}</span> <span className="text-[#6b7280]">accrued</span></span>
            <button className="inline-flex items-center h-9 px-4 rounded-md bg-[#0168dd] text-white text-sm font-medium hover:bg-[#0057bb] transition-colors">Set pay periods</button>
          </div>
        </div>
      </div>
    </>
  );
}

function V1kNextPaymentsCard({ onViewSchedule, v1l = false, zone = false, condensed = false, mvp = false, sync = false, estPanel, onProviderClick, approvedIds = [], onApprove = () => {}, offSchedVer = 1, colSpan = "col-span-9" }: { onViewSchedule: () => void; v1l?: boolean; zone?: boolean; condensed?: boolean; mvp?: boolean; sync?: boolean; estPanel?: ReactNode; onProviderClick?: (providerId: string) => void; approvedIds?: string[]; onApprove?: (id: string) => void; offSchedVer?: 1 | 2; colSpan?: string }) {
  const upcoming = v1gFundSchedule.filter(e => !e.funded && e.daysOut > 0).slice(0, 2);
  const wiseVer = useContext(WiseVerContext);
  const notSched = useContext(NotSchedContext);
  const spillover = useContext(SpilloverContext);
  // The "Fund by today" card is a real fund-by card, aggregated by payout method from the approved people.
  const fundTodayEntry: V1gFundDate = (() => {
    const funded = v1OwedApproval.filter(m => approvedIds.includes(m.id));
    const byProv: Record<string, number> = {};
    funded.forEach(m => { byProv[m.provider] = (byProv[m.provider] || 0) + m.amount; });
    return { date: "Jun 23", dow: "Mon", daysOut: 1, tag: "next", fundBy: "today, Jun 22", providers: Object.entries(byProv).map(([id, amount]) => ({ id, amount })) };
  })();
  const [showLearn, setShowLearn] = useState(false);
  const [wiseBannerDismissed, setWiseBannerDismissed] = useState(false); // v2 dismiss (session-only in the prototype)
  const learnMoreBtn = (
    <button onClick={() => setShowLearn(true)} className={zone ? zbtn("ghostGray", "sm") : "inline-flex items-center gap-1 text-[11px] font-medium text-[#4b5563] rounded-md px-2.5 py-1 hover:bg-[#f3f4f6] hover:text-[#111827] transition-colors select-none"}><Info size={zone ? 16 : 12} /> Learn more</button>
  );
  return (
    <div className={`${colSpan} flex flex-col gap-3`}>
      {/* v2 — prominent, dismissible Wise-interest banner above the schedule */}
      {wiseVer === 2 && !wiseBannerDismissed && (
        <div data-zone="alert" className="rounded-lg border border-[#bcd4f2] bg-[#f0f6ff] px-4 py-3 flex items-start gap-3">
          <TrendingUp size={18} aria-hidden="true" className="text-[#0168dd] flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#0168dd]">You're paying with Wise — earn interest on your balance</p>
            <p className="text-[13px] text-[#4b5563] leading-snug mt-0.5">Money you keep in Wise for payouts can earn interest. <a href={WISE_INTEREST_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-[#0168dd] underline underline-offset-2 hover:text-[#0057bb]">See how to opt in</a> <span className="text-[#93c5fd]" aria-hidden="true">·</span> <a href={WISE_INTEREST_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-[#0168dd] underline underline-offset-2 hover:text-[#0057bb]">terms</a>. Availability and rates vary by country.</p>
          </div>
          <button onClick={() => setWiseBannerDismissed(true)} aria-label="Dismiss Wise interest banner" className="flex-shrink-0 p-1 rounded-md text-[#9ca3af] hover:text-[#4b5563] hover:bg-white/60 transition-colors"><X size={16} aria-hidden="true" /></button>
        </div>
      )}
      <div data-zone="card" className="flex-1 bg-white rounded-lg border border-[#e5e7eb] flex flex-col">
        {v1l ? (
          /* 1L — Learn more sits next to the title; no full-schedule link */
          <div className={`px-4 flex items-center gap-3 border-b bg-white rounded-t-lg ${zone ? "h-[60px] border-[#e5e7eb]" : "h-[55px] border-[#e5e7eb]"}`}>
            <p className={zone ? "text-lg font-medium text-[#111827]" : "text-sm font-semibold text-[#111827]"}>Funding schedule</p>
            {learnMoreBtn}
            {/* v4 — green Wise-interest pill using the empty right side of the schedule header */}
            {wiseVer === 4 && (
              <a data-zone="pill" href={WISE_INTEREST_URL} target="_blank" rel="noopener noreferrer" title="Availability and rates vary by country" className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#a7d3b8] bg-[#e6f6ee] px-2.5 py-1 text-[12px] font-medium text-[#0e9f6e] hover:bg-[#d7f0e2] transition-colors">
                <ProviderLogo id="wise" size={14} />
                Earn interest on your balance
                <ExternalLink size={12} aria-hidden="true" className="flex-shrink-0" />
              </a>
            )}
          </div>
        ) : (
          <div className="px-4 h-[55px] flex items-center justify-between gap-3 border-b border-[#e5e7eb] bg-white rounded-t-lg">
            <p className={zone ? "text-lg font-medium text-[#111827]" : "text-sm font-semibold text-[#111827]"}>Funding schedule</p>
            <div className="flex items-center gap-2">
              {learnMoreBtn}
              <button onClick={onViewSchedule} className="text-[11px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2.5 py-1 hover:bg-[#0168dd]/5 transition-colors select-none">View full schedule</button>
            </div>
          </div>
        )}
        <V1kLearnMoreDialog open={showLearn} onClose={() => setShowLearn(false)} v1l={v1l} zone={zone} />
        <div className="px-4 py-4 flex-1 flex flex-col">
          <div className={`grid ${(() => { const base = (notSched || (spillover === "mixed" && offSchedVer === 1)) ? 3 : 2; const n = base + (estPanel ? 1 : 0); return n === 4 ? "grid-cols-4" : n === 3 ? (estPanel ? "grid-cols-[minmax(0,0.88fr)_minmax(0,1fr)_minmax(0,1fr)]" : "grid-cols-3") : "grid-cols-2"; })()} ${estPanel ? "gap-0" : "gap-4"} items-stretch flex-1 auto-rows-fr`}>
            {/* mvp2 — Estimated Payroll lives inside the Funding schedule (first slot) */}
            {estPanel}
            {/* Mixed + approvals: "Fund by today" leads (reuses the fund-by card), replacing the missed Jun 21 slot */}
            {spillover === "mixed" && approvedIds.length > 0 && <V1kFundDateCard e={fundTodayEntry} noSpillover v1l={v1l} zone={zone} condensed={condensed} mvp={mvp} sync={sync} onProviderClick={onProviderClick} />}
            {(spillover === "mixed" && approvedIds.length > 0 ? upcoming.slice(1) : upcoming).map((e, i) => <V1kFundDateCard key={e.date} e={e} v1l={v1l} zone={zone} condensed={condensed} mvp={mvp} sync={sync} mergeCls={estPanel ? (i === 0 ? "rounded-r-none" : "rounded-l-none border-l-0") : ""} onProviderClick={onProviderClick} />)}
            {spillover === "mixed" && offSchedVer === 1 ? <V1kOffScheduleCard approvedIds={approvedIds} onApprove={onApprove} mvp={mvp} /> : (notSched && <V1kNotSchedCard />)}
          </div>
          {/* v3 — one-line tip below the table */}
          {wiseVer === 3 && (
            <div data-zone="alert" className="mt-3 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3.5 py-2.5 flex items-start gap-2">
              <Gift size={15} aria-hidden="true" className="text-[#0e9f6e] flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#4b5563] leading-snug">The balance you keep in Wise can earn interest (USD, EUR, GBP). <a href={WISE_INTEREST_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-[#0168dd] underline underline-offset-2 hover:text-[#0057bb]">See how to opt in</a> <span className="text-[#d1d5db]" aria-hidden="true">·</span> rates vary, terms apply.</p>
            </div>
          )}
        </div>
      </div>
      {/* v5 — persistent, contained opportunity card below the schedule */}
      {wiseVer === 5 && (
        <div data-zone="alert" className="rounded-lg border border-[#a7d3b8] bg-[#e6f6ee] px-4 py-3 flex items-start gap-3">
          <TrendingUp size={18} aria-hidden="true" className="text-[#0e9f6e] flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0e9f6e]">Put your idle Wise balance to work</p>
            <p className="text-[13px] text-[#4b5563] leading-snug mt-0.5">You're paying with Wise — the balance you hold for payouts can earn interest. <a href={WISE_INTEREST_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-[#0168dd] underline underline-offset-2 hover:text-[#0057bb]">See how to set it up</a> <span className="text-[#a7d3b8]" aria-hidden="true">·</span> <a href={WISE_INTEREST_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-[#0168dd] underline underline-offset-2 hover:text-[#0057bb]">terms</a>. Availability varies by country.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Full runway — the same card pattern down a timeline rail, filterable.
function V1kFundingScheduleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fProvider, setFProvider] = useState<"all" | "wise" | "paypal" | "bitwage">("all");
  const [fStatus, setFStatus] = useState<"upcoming" | "unfunded">("upcoming");
  useEffect(() => { if (!open) { setFProvider("all"); setFStatus("upcoming"); } }, [open]);
  if (!open) return null;

  const rows = v1gFundSchedule
    .filter(e => fStatus === "unfunded" ? !e.funded : true)
    .map(e => ({ ...e, providers: e.providers.filter(p => fProvider === "all" || p.id === fProvider) }))
    .filter(e => e.providers.length > 0);
  const anyEst = rows.some(e => e.providers.some(p => !v1gProviderMeta[p.id].balanceReadable));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div data-zone="dialog" className="bg-white rounded-xl shadow-2xl w-[560px] max-w-full max-h-[82vh] flex flex-col pointer-events-auto">
          <div className="px-6 pt-5 pb-3 border-b border-[#e5e7eb] flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">Funding schedule</h2>
                <p className="text-[11px] text-[#6b7280] mt-0.5">When to fund each account · dates reflect payout delay</p>
              </div>
              <button data-zone="icon_button" onClick={onClose} className="p-1 rounded-md text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
            <div className="flex items-start gap-6 mt-3">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#6b7280] mb-1">Account</span>
                <div data-zone="segmented_controls" className="flex bg-[#f3f4f6] rounded-md p-0.5 w-fit">
                  {([["all","All"],["wise","Wise"],["paypal","PayPal"],["bitwage","Bitwage"]] as const).map(([k,label]) => (
                    <button key={k} onClick={() => setFProvider(k)} className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${fProvider===k?"bg-white text-[#0168dd] shadow-sm":"text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#6b7280] mb-1">Status</span>
                <div data-zone="segmented_controls" className="flex bg-[#f3f4f6] rounded-md p-0.5 w-fit">
                  {([["upcoming","All upcoming"],["unfunded","Unfunded only"]] as const).map(([k,label]) => (
                    <button key={k} onClick={() => setFStatus(k)} className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${fStatus===k?"bg-white text-[#0168dd] shadow-sm":"text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {rows.length === 0 ? (
              <p className="text-center text-[12px] text-[#6b7280] py-10">No funding dates match these filters.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-[4px] top-3 bottom-3 w-px bg-[#e5e7eb]" />
                <div className="space-y-4">
                  {rows.map(e => {
                    const dot = e.funded ? "bg-emerald-400" : e.tag === "next" ? "bg-[#0168dd]" : e.tag === "projected" ? "bg-[#d1d5db]" : "bg-amber-400";
                    return (
                      <div key={e.date} className="relative pl-6">
                        <div className={`absolute left-0 top-4 w-[9px] h-[9px] rounded-full ring-2 ring-white ${dot}`} />
                        <V1kFundDateCard e={e} />
                      </div>
                    );
                  })}
                </div>
                {anyEst && <p className="text-[10px] text-[#9ca3af] leading-snug mt-4">PayPal balance is unavailable, so its figure is the payout routed to it, not a confirmed gap.</p>}
              </div>
            )}
          </div>

          <div className="px-6 py-3 flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] text-[#6b7280]">Showing June + next payday · follows your range</span>
            <button className="flex items-center gap-1.5 text-xs font-semibold border border-[#e5e7eb] rounded-lg px-3 py-1.5 text-[#111827] hover:bg-[#f9fafb] transition-colors"><Download size={13} /> Export</button>
          </div>
        </div>
      </div>
    </>
  );
}

// 1I — read-only "How we get there": baseline + adjustment rules → total, in a dialog.
function V1iHowWeGetThereDialog({
  open, onClose, base, memberPct, memberNote, seasonPct, adjPct, total, manualAdjustments,
  scenario = 2, projection = 0, trendPct = 0, trend2Pct = 0, scen1Total = 0,
  initial = false, scen3Tracked = 0, scen3Remaining = 0, scen3Total = 0, zone = false,
}: {
  open: boolean;
  onClose: () => void;
  base: number;
  memberPct: number; memberNote: string;
  seasonPct: number;
  adjPct: number; total: number;
  manualAdjustments: ManualAdjustment[];
  scenario?: 1 | 2;
  projection?: number;
  trendPct?: number;
  trend2Pct?: number;
  scen1Total?: number;
  initial?: boolean;
  scen3Tracked?: number;
  scen3Remaining?: number;
  scen3Total?: number;
  zone?: boolean;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div data-zone="dialog" className="bg-white rounded-xl shadow-2xl w-[640px] max-w-full pointer-events-auto">
          <div className="flex items-start justify-between px-5 py-5">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">How we get there</h2>
            </div>
            <button data-zone="icon_button" onClick={onClose} className="p-1 rounded-md text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors flex-shrink-0"><X size={16} /></button>
          </div>

          {initial ? (
          <div className="px-5 py-2.5 space-y-4">
            {/* Scenario 3 (Initial) — Step 1 locked (needs 3+ months), Step 2 = current pace only */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-2 flex items-center gap-1.5"><Lock size={12} /> Step 1 · From your history <span data-zone="pill" className="normal-case tracking-normal text-[10px] font-semibold text-[#9ca3af] border border-[#e5e7eb] rounded-full px-1.5 py-0.5">Available at 3+ months</span></p>
              <div className="flex items-stretch gap-1.5">
                <div className="flex-1 rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] leading-tight">Monthly avg</p>
                  <p className="text-base font-bold text-[#9ca3af] mt-1.5 leading-none tracking-tight">—</p>
                  <p className="text-xs text-[#9ca3af] mt-1.5 leading-tight">Needs history</p>
                </div>
                <span className="flex items-center text-[#d1d5db] font-semibold text-sm flex-shrink-0 px-0.5">+</span>
                <div className="flex-1 rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] leading-tight">Adjustments</p>
                  <p className="text-base font-bold text-[#9ca3af] mt-1.5 leading-none tracking-tight">—</p>
                  <p className="text-xs text-[#9ca3af] mt-1.5 leading-tight">Headcount + season</p>
                </div>
                <span className="flex items-center text-[#d1d5db] font-semibold text-sm flex-shrink-0 px-0.5">=</span>
                <div className="flex-1 rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] leading-tight">Projection</p>
                  <p className="text-base font-bold text-[#9ca3af] mt-1.5 leading-none tracking-tight">Locked</p>
                  <p className="text-xs text-[#9ca3af] mt-1.5 leading-tight">Not enough data yet</p>
                </div>
              </div>
            </div>

            {/* Connector */}
            <p className="text-sm text-[#6b7280] leading-snug mb-8 flex items-center gap-1.5"><ArrowDown size={14} className="text-[#9ca3af] flex-shrink-0" /> For now, we use only your pace this month.</p>

            {/* Step 2 — this month's pace (active) */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-2">Step 2 · This month's pace</p>
              <div className="flex items-stretch gap-1.5">
                <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] leading-tight">Tracked + planned</p>
                  <p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">{fmt0(scen3Tracked)}</p>
                  <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">So far · 12 of 30 days</p>
                </div>
                <span className="flex items-center text-[#9ca3af] font-semibold text-sm flex-shrink-0 px-0.5">+</span>
                <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] leading-tight">Remaining days</p>
                  <p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">+{fmt0(scen3Remaining)}</p>
                  <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">18 days at current pace</p>
                </div>
                <span className="flex items-center text-[#9ca3af] font-semibold text-sm flex-shrink-0 px-0.5">=</span>
                <div className="flex-1 rounded-lg border border-[#a7d9fc] bg-[#eaf6ff] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0168dd] leading-tight">Est. payroll</p>
                  <p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">{fmt0(scen3Total)}</p>
                  <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">To fund in June</p>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <p className="text-sm text-[#111827] leading-snug">You don't have 3+ months of history yet, so we can't build a projection — this estimate uses only your current pace. Once you reach 3+ months, we'll add headcount &amp; seasonality and use the higher of history vs. pace.</p>
              <p className="text-sm text-[#6b7280] leading-snug mt-1.5">Tip: use Adjust for anything we can't see yet, like a one-off bonus.</p>
            </div>

            {/* Caveat */}
            <p className="text-sm text-[#6b7280] leading-snug border-t border-[#e5e7eb] pt-4 mb-2">{fmt0(scen3Total)} is an early estimate from your current pace — not a guaranteed figure. Add a buffer, or <a href="#" onClick={e => e.preventDefault()} className="font-medium text-[#6b7280] underline decoration-dotted decoration-[#d1d5db] underline-offset-2 hover:text-[#111827] transition-colors">see how to improve accuracy</a>.</p>
          </div>
          ) : (
          <div className="px-5 py-2.5 space-y-4">
            {/* Step 1 — historical projection: monthly avg + adjustments = projection (shared) */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-2">Step 1 · From your history</p>
              <div className="flex items-stretch gap-1.5">
                <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] leading-tight">Monthly avg</p>
                  <p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">{fmt0(base)}</p>
                  <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">Last 5 months</p>
                </div>
                <span className="flex items-center text-[#9ca3af] font-semibold text-sm flex-shrink-0 px-0.5">+</span>
                <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] leading-tight">Adjustments</p>
                  <p className={`text-base font-bold mt-1.5 leading-none tracking-tight ${adjPct >= 0 ? "text-[#0168dd]" : "text-red-500"}`}>{adjPct >= 0 ? "+" : ""}{adjPct}%</p>
                  <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">Headcount + seasonality</p>
                </div>
                <span className="flex items-center text-[#9ca3af] font-semibold text-sm flex-shrink-0 px-0.5">=</span>
                <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] leading-tight">Projection</p>
                  <p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">{fmt0(projection)}</p>
                  <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">Based on historical numbers</p>
                </div>
              </div>
            </div>

            {/* Adjustment detail — explains the +{adjPct}%, same pattern as the historical dialog */}
            <div>
              <p className="text-sm text-[#6b7280] leading-snug"><span className="font-semibold text-[#0168dd]">+{adjPct}%</span> comes from trends in your payment history:</p>
              <div className="mt-2 space-y-1.5 text-sm">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-normal text-[#0168dd] w-[34px] flex-shrink-0">+{memberPct}%</span>
                  <span className="text-[#111827] font-normal flex-shrink-0">Headcount change</span>
                  <span className="text-[#6b7280] truncate">· {memberNote}</span>
                </div>
                {seasonPct !== 0 && (
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-normal text-[#0168dd] w-[34px] flex-shrink-0">+{seasonPct}%</span>
                    <span className="text-[#111827] font-normal flex-shrink-0">Seasonality</span>
                    <span className="text-[#6b7280] truncate">· June is typically above average</span>
                  </div>
                )}
              </div>
            </div>

            {/* Connector */}
            <p className="text-sm text-[#6b7280] leading-snug mb-8">Then we compare it to your pace this month, and use whichever is higher.</p>

            {/* Step 2 — this month's pace: projection + current trend = est. payroll */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-2">Step 2 · This month's pace</p>
              {scenario === 1 ? (
              <div className="flex items-stretch gap-1.5">
                <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] leading-tight">Projection</p>
                  <p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">{fmt0(projection)}</p>
                  <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">Based on historical numbers</p>
                </div>
                <span className="flex items-center text-[#9ca3af] font-semibold text-sm flex-shrink-0 px-0.5">+</span>
                <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] leading-tight">Current trend</p>
                  <p className="text-base font-bold text-[#0168dd] mt-1.5 leading-none tracking-tight">+{trendPct}%</p>
                  <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">Your pace is higher</p>
                </div>
                <span className="flex items-center text-[#9ca3af] font-semibold text-sm flex-shrink-0 px-0.5">=</span>
                <div className="flex-1 rounded-lg border border-[#a7d9fc] bg-[#eaf6ff] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0168dd] leading-tight">Est. payroll</p>
                  <p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">{fmt0(scen1Total)}</p>
                  <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">To fund in June</p>
                </div>
              </div>
              ) : (
              <div className="flex items-stretch gap-1.5">
                <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] leading-tight">Projection</p>
                  <p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">{fmt0(projection)}</p>
                  <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">Higher — we use this</p>
                </div>
                <span className="flex items-center text-[#9ca3af] font-semibold text-xs flex-shrink-0 px-0.5">vs</span>
                <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] leading-tight">Current trend</p>
                  <p className="text-base font-bold text-[#9ca3af] mt-1.5 leading-none tracking-tight">−{trend2Pct}%</p>
                  <p className="text-xs text-[#9ca3af] mt-1.5 leading-tight">Not applied</p>
                </div>
                <span className="flex items-center text-[#9ca3af] font-semibold text-sm flex-shrink-0 px-0.5">→</span>
                <div className="flex-1 rounded-lg border border-[#a7d9fc] bg-[#eaf6ff] px-2.5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0168dd] leading-tight">Est. payroll</p>
                  <p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">{fmt0(total)}</p>
                  <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">To fund in June</p>
                </div>
              </div>
              )}
            </div>

            {/* Why — the reason sits right below the Step 2 cards, per scenario */}
            {scenario === 1 ? (
              <div>
                <p className="text-sm text-[#111827] leading-snug">You're paying more this month than usual for the elapsed period. We recommend adjusting total expected costs for the month accordingly.</p>
                <p className="text-sm text-[#6b7280] leading-snug mt-1.5">If your pace were lower, we'd keep the historical number.</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-[#111827] leading-snug">Your pace this month is trending −{trend2Pct}% below your historical costs — but a slow start doesn't guarantee a lighter month, and under-funding risks a failed payment.</p>
                <p className="text-sm text-[#6b7280] leading-snug mt-1.5">So we keep the higher historical number. It's safer to over-fund and carry the surplus than to come up short.</p>
              </div>
            )}

            {/* Caveat — total + wording mirror the scenario */}
            <p className="text-sm text-[#6b7280] leading-snug border-t border-[#e5e7eb] pt-4 mb-2">{scenario === 1 ? `${fmt0(scen1Total)} is an estimate from your payment history and current pace` : `${fmt0(total)} is an estimate from your payment history`} — not a guaranteed figure. Add a buffer, or <a href="#" onClick={e => e.preventDefault()} className="font-medium text-[#6b7280] underline decoration-dotted decoration-[#d1d5db] underline-offset-2 hover:text-[#111827] transition-colors">see how to improve accuracy</a>.</p>
          </div>
          )}

          <div className="flex items-center justify-end px-5 py-5">
            <button onClick={onClose} className={zone ? zbtn("solidPrimary", "md") : "px-5 py-2 rounded-lg text-sm font-semibold bg-[#0168dd] text-white hover:bg-[#0057bb] transition-colors"}>Done</button>
          </div>
        </div>
      </div>
    </>
  );
}

function V1gPredictivePanel({ showStatusBreakdown, seasonalityOn, sideFund = false, v1i = false, v1j = false, v1k = false, v1l = false, v1m = false, zone = false, condensed = false, state = "filled", variant = "final", onProviderClick }: { showStatusBreakdown: boolean; seasonalityOn: boolean; sideFund?: boolean; v1i?: boolean; v1j?: boolean; v1k?: boolean; v1l?: boolean; v1m?: boolean; zone?: boolean; condensed?: boolean; state?: "filled" | "initial" | "empty"; variant?: "final" | "mvp" | "mvp2"; onProviderClick?: (providerId: string) => void }) {
  const mvpSync = variant === "mvp2"; // "after sync" MVP: est-payroll inside the funding schedule, "Pending timesheets" column, card-level pay periods
  const mvp = variant === "mvp" || mvpSync; // MVP strip: chart → Payroll breakdown + 3M only; funding → Due only
  // Zone theme tokens (real Zone hexes) — applied only when `zone` is set (Final UI).
  // These map the prototype's hand-picked greys to Zone's gray/primary scale.
  const zc = {
    border:    zone ? "border-[#e5e7eb]" : "border-[#e5e7eb]",        // gray-200 (card outline)
    divider:   zone ? "border-[#e5e7eb]" : "border-[#f3f4f6]",        // gray-200 — same as the card outline
    text:      zone ? "text-[#111827]"   : "text-[#111827]",          // gray-900
    muted:     zone ? "text-[#6b7280]"   : "text-[#6b7280]",          // gray-500
    segTrack:  zone ? "bg-[#f3f4f6]"     : "bg-[#f3f4f6]",            // gray-100
    hoverBg:   zone ? "hover:bg-[#f3f4f6]" : "hover:bg-[#f3f4f6]",    // gray-100
    hoverText: zone ? "hover:text-[#111827]" : "hover:text-[#111827]",
    active:    "bg-white text-[#0168dd] shadow-sm",                   // primary-700 (already Zone)
    inactive:  zone ? "text-[#6b7280] hover:text-[#111827]" : "text-[#6b7280] hover:text-[#111827]",
    toggleOff: zone ? "bg-[#d1d5db]"     : "bg-[#d1d5db]",            // gray-300
    toggleOn:  zone ? "bg-[#2aa7ff]"     : "bg-[#0168dd]",            // primary-500
    // Zone SegmentedControls — connected bordered segments; active = indigo-50 / primary-700 / medium.
    segWrap: "flex w-fit",
    // sm size: h-8, 14px, active = medium + primary-700 + indigo-50, inactive = regular + gray-700.
    // overflow-hidden clips the active bg to the rounded end corners (Zone "radio corner").
    seg: (active: boolean) => `h-8 px-3 flex items-center justify-center whitespace-nowrap text-sm overflow-hidden transition-colors border border-l-0 first:border-l border-[#d1d5db] first:rounded-l-[6px] last:rounded-r-[6px] ${active ? "bg-[#f0f5ff] text-[#0168dd] font-medium" : "text-[#374151] font-normal hover:bg-[#f9fafb]"}`,
  };
  const [range, setRange]           = useState<V1eRange>(v1l || v1m ? "3M" : "1M"); // 1L/1M drop the 1M view
  const [startMonth, setStartMonth] = useState<string>(v1eCurrentLabel); // Final UI v1: left edge of the chart window (past ↔ future)
  const [startPickerOpen, setStartPickerOpen] = useState(false);
  const [v2Start, setV2Start]       = useState<string>("Jun '26"); // Final UI v2: date-range picker → window start
  const [v2Len, setV2Len]           = useState<number>(3);         // Final UI v2: window length in months (1–12), default 3
  const [rangePickerOpen, setRangePickerOpen] = useState(false);
  const [rangePendStart, setRangePendStart]   = useState<string | null>(null); // v2 picker: first-clicked month awaiting the second
  const [rangeHover, setRangeHover]           = useState<string | null>(null); // v2 picker: hovered month for range preview
  const [showYoY, setShowYoY]       = useState(false);
  const [drillMonth, setDrillMonth] = useState<string | null>(null);
  const [segTab, setSegTab]         = useState<V1eSeg>(mvp ? "type" : "source"); // MVP defaults to Payroll breakdown
  const [oneMonth, setOneMonth]     = useState<string>("Jun '26"); // selected month for the 1M view
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustment[]>([]);
  const [showManageDialog, setShowManageDialog] = useState(false); // adjustments management dialog
  const [showScheduleDialog, setShowScheduleDialog] = useState(false); // funding schedule dialog
  const [mathOpen, setMathOpen] = useState(false); // inline "+28% adjustments" detail popover
  const [showAutoPop, setShowAutoPop] = useState(false); // 1L auto-adjustments "Details" popover
  const [showMathDialog, setShowMathDialog] = useState(false); // 1I "How we get there" dialog
  const spillover = useContext(SpilloverContext); // late-approved spillover — full-width alert at the top of the report
  const offSchedVer = useContext(OffSchedVerContext); // 1 = off-schedule card in the funding row; 2 = top-level 25% card
  const pmtVer = useContext(PmtVerContext); // 1 = 3/6/12M + month stepper; 2 = date-range picker
  const reportVer = useContext(PmtReportVerContext); // 1 = off-schedule card; 2 = pending in fund-by columns + yellow banner
  const offSchedAsCard = spillover === "mixed" && offSchedVer === 2 && reportVer === 1; // dedicated off-schedule card shown
  const offSchedAsBanner = spillover === "mixed" && reportVer === 2; // no card — yellow banner + fund-by "Not approved" columns
  const [approvedIds, setApprovedIds] = useState<string[]>([]); // Mixed: approved people → Fund-by-today card (lifted so it's shared across the split layout)
  const onApprove = (id: string) => setApprovedIds(a => a.includes(id) ? a : [...a, id]);
  const [spillAlertDismissed, setSpillAlertDismissed] = useState(false); // Zone alert is dismissable; reset when the overlay toggles
  useEffect(() => { setSpillAlertDismissed(false); }, [spillover]);
  const [scenario, setScenario] = useState<1 | 2>(1); // Estimated Payroll: 1 = trending higher (pace wins), 2 = historical only (click "· June 2026" to toggle)
  const [driversOpen, setDriversOpen] = useState(false); // 1J "+X% vs typical" drivers popover
  const [showAddDialog, setShowAddDialog] = useState(false); // 1K single "Add adjustment" dialog (1F-style)
  const [editingAdj, setEditingAdj] = useState<ManualAdjustment | null>(null);
  const [showPaceBanner, setShowPaceBanner] = useState(true); // Initial-state "current pace only" notice — dismissible

  const [loading, setLoading] = useState(false);

  // Chart-only range: re-pulls the chart; the top summary stays fixed to the current month.
  const applyRange = (r: V1eRange) => {
    setRange(r); setDrillMonth(null); setMonthPickerOpen(false);
    if (r === "1M") setShowYoY(false);
    setLoading(true); setTimeout(() => setLoading(false), 550);
  };

  const cfg  = v1eRangeCfg[range];
  const is1M = range === "1M";
  const isWeekly = is1M || !!drillMonth;

  // DECOUPLED: the top summary is ALWAYS the current month, independent of the chart's range.
  const memberPct = v1eRangeCfg["1M"].memberPct;
  const seasonPct = seasonalityOn ? v1eRangeCfg["1M"].seasonPct : 0;
  const memberAmt = Math.round(v1AvgMonthly * memberPct / 100);
  const seasonAmt = Math.round(v1AvgMonthly * seasonPct / 100);
  const manualNet = manualAdjustments.reduce((s, a) => s + (a.type === "add" ? a.dollars : -a.dollars), 0);
  const totalAboveBase = memberAmt + seasonAmt + manualNet;
  const adjProj = Math.max(0, Math.round(v1AvgMonthly + totalAboveBase));
  const adjPct = Math.round(totalAboveBase / v1AvgMonthly * 100);
  // 1L — values for the on-screen "how the number is built" breakdown
  const v1lAutoAmt = memberAmt + seasonAmt;
  const v1lAutoPct = Math.round(v1lAutoAmt / v1AvgMonthly * 100);
  const v1lEstimate = v1AvgMonthly + v1lAutoAmt;
  // Scenario 1 — current pace runs higher than the historical projection, so we fund to the trend.
  const scenTrendPct = 16;
  const scenTrendTotal = Math.round(v1lEstimate * (1 + scenTrendPct / 100)); // 150k → 174k
  const scen1Total = scenTrendTotal + (adjProj - v1lEstimate); // trend + any manual buffer
  // mvp2 ("after sync") — Estimated Payroll lives INSIDE the Funding schedule as an inner card,
  // so the total visually belongs to the scheduled side and clearly excludes off-schedule amounts.
  const estPanelInner = (
    /* Split card: white top (title + total + Adjust) · full-width divider · full-bleed gray bottom
       ("How this adds up" + disclosure). Wider 32px gap to the fund-by cards (grid gap 12 + mr-5). */
    <div data-zone="card" data-component="Estimated payroll inner card" className="rounded-lg border border-[#e5e7eb] bg-white flex flex-col h-full mr-4">
      <div className="px-4 pt-4 pb-4">
        <div className="flex justify-between items-start gap-2 mb-4">
          <p className="min-w-0"><span className="text-base font-bold text-[#111827]">Estimated Payroll</span> <span className="text-base text-[#6b7280] whitespace-nowrap">· June 2026</span></p>
        </div>
        <div className="flex items-center min-w-0 gap-3 flex-wrap">
          <p className="text-2xl font-bold text-[#111827] tracking-tight leading-none">{fmt0(scenario === 1 ? scen1Total : adjProj)}</p>
          <button onClick={() => { setEditingAdj(null); setShowAddDialog(true); }} className={zbtn("outlinePrimary", "sm", "flex-shrink-0")}><SlidersHorizontal size={16} /> Adjust</button>
        </div>
      </div>
      <div className="border-t border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 flex-1 flex flex-col rounded-b-lg">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">How this adds up</p>
            <button data-zone="button" onClick={() => setShowMathDialog(true)} className="inline-flex items-center gap-1 text-[12px] font-medium text-[#6b7280] hover:text-[#111827] transition-colors select-none"><Info size={14} /> Learn more</button>
          </div>
          <div className="flex items-baseline gap-3 text-[12px]">
            <span className="w-28 flex-shrink-0 font-semibold text-[#111827] tabular-nums whitespace-nowrap"><span className="inline-block w-3 text-[#9ca3af] font-normal"> </span>{fmt0(v1AvgMonthly)}</span>
            <span className="text-[#6b7280] min-w-0">Monthly average</span>
          </div>
          {/* Auto adjustments — same drivers popover as the standalone MVP card */}
          <div className="flex items-baseline gap-3 text-[12px]">
            <span className="w-28 flex-shrink-0 font-semibold text-[#111827] tabular-nums whitespace-nowrap"><span className="inline-block w-3 text-[#9ca3af] font-normal">+</span>{fmt0(v1lAutoAmt)} <span className="text-[#0168dd] font-medium">({v1lAutoPct}%)</span></span>
            <span className="relative inline-flex self-center">
              <button onClick={() => setShowAutoPop(o => !o)} className="text-[12px] font-normal text-[#6b7280] underline underline-offset-2 hover:text-[#111827] transition-colors select-none">Auto adjustments</button>
              {showAutoPop && (<>
                <div className="fixed inset-0 z-20" onClick={() => setShowAutoPop(false)} />
                <div data-zone="popover" className="absolute top-6 left-0 z-30 bg-white rounded-lg border border-[#e5e7eb] shadow-xl w-96 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">+{v1lAutoPct}% vs a typical month</p>
                  <div className="mt-1 divide-y divide-[#f3f4f6]">
                    <div className="flex items-center gap-1.5 text-xs py-1.5"><span className="font-semibold flex-shrink-0 text-[#0168dd]">+{memberPct}%</span><span className="text-[#111827] font-medium flex-shrink-0">Headcount change</span><span className="text-[#d1d5db] flex-shrink-0">—</span><span className="text-[#6b7280] whitespace-nowrap">{v1CurrMembers} this cycle vs avg {v1AvgMembers}</span></div>
                    {seasonPct > 0 && <div className="flex items-center gap-1.5 text-xs py-1.5"><span className="font-semibold flex-shrink-0 text-[#0168dd]">+{seasonPct}%</span><span className="text-[#111827] font-medium flex-shrink-0">Seasonality</span><span className="text-[#d1d5db] flex-shrink-0">—</span><span className="text-[#6b7280] whitespace-nowrap">June is typically above average</span></div>}
                  </div>
                </div>
              </>)}
            </span>
          </div>
          <div className="flex items-baseline gap-3 text-[12px] pt-1.5 border-t border-[#e5e7eb]">
            <span className="w-28 flex-shrink-0 font-semibold text-[#111827] tabular-nums whitespace-nowrap"><span className="inline-block w-3 text-[#9ca3af] font-normal">=</span>{fmt0(v1lEstimate)}</span>
            <span className="text-[#6b7280] min-w-0">Projection based on historical numbers</span>
          </div>
          <div className="flex items-baseline gap-3 text-[12px]">
            <span className="w-28 flex-shrink-0 font-semibold text-[#111827] tabular-nums whitespace-nowrap"><span className="inline-block w-3 text-[#9ca3af] font-normal">+</span>{fmt0(scenTrendTotal - v1lEstimate)} <span className="text-[#0168dd] font-medium">({scenTrendPct}%)</span></span>
            <span className="text-[#6b7280] min-w-0">Current trend</span>
          </div>
          <div className="flex items-baseline gap-3 text-[12px] pt-1.5 border-t border-[#e5e7eb]">
            <span className="w-28 flex-shrink-0 font-bold text-[#111827] tabular-nums"><span className="inline-block w-3 text-[#9ca3af] font-normal">=</span>{fmt0(scenario === 1 ? scen1Total : adjProj)}</span>
            <span className="font-bold text-[#111827]">Total to fund</span>
          </div>
        </div>
        <p className="mt-auto pt-3 text-[11px] text-[#6b7280] leading-snug">Estimated from your history and current pace. Gets more accurate as the month fills. Off-schedule amounts are not included.</p>
      </div>
    </div>
  );
  // Scenario 2 — current pace runs LOWER than the historical projection. We show the
  // trend for transparency but do NOT apply it: total = max(projection, trend) = projection.
  const scen2TrendPct = 9; // shown as −9%, struck through, "not applied"
  // Scenario 3 — < 3 months of history (the Initial state). No projection/adjustments;
  // estimate from current pace only: tracked+planned so far + remaining days at that pace.
  const initial = state === "initial";
  const scen3Tracked   = 52000;  // tracked + planned so far · 12 of 30 days
  const scen3Remaining = 80000;  // remaining 18 days at the current run-rate
  const scen3Total     = scen3Tracked + scen3Remaining + manualNet; // + any manual buffer
  // ── Final UI: slide-a-window over the continuous timeline ──────────────────
  // 3M/6M/12M = window length; `startMonth` = the left edge. The user can push the
  // window into the past or the future; the summary above stays fixed to "today".
  const useTimeline = zone && !mvp && !is1M && !initial;
  const v2mode = useTimeline && pmtVer === 2; // v2 = single date-range picker (no 3/6/12M buttons, no chevrons)
  const winLen = v2mode ? Math.min(12, Math.max(1, v2Len)) : v1eWinLen[range]; // v2: picked span (capped 12); v1: 3/6/12
  const maxStartIdx = Math.max(0, v1eTimeline.length - winLen); // latest start that still fits a full window
  const startSource = v2mode ? v2Start : startMonth;
  const startIdxRaw = v1eTimeline.findIndex(b => b.label === startSource);
  const startIdx = Math.min(Math.max(0, startIdxRaw < 0 ? v1eTimeline.findIndex(b => b.isCurrent) : startIdxRaw), maxStartIdx);
  const startLabel = v1eTimeline[startIdx]?.label ?? v1eCurrentLabel; // clamped label actually shown
  const windowBars = v1eTimeline.slice(startIdx, startIdx + winLen);
  const atToday = startLabel === v1eCurrentLabel;
  const loadWin = () => { setLoading(true); setTimeout(() => setLoading(false), 450); };
  const stepStart = (dir: -1 | 1) => {
    const n = startIdx + dir;
    if (n >= 0 && n <= maxStartIdx) { setStartMonth(v1eTimeline[n].label); setStartPickerOpen(false); loadWin(); }
  };
  // v2 date-range picker helpers (month granularity — the chart is monthly).
  const v1eIdx = (label: string) => v1eTimeline.findIndex(b => b.label === label);
  const commitRange = (aLabel: string, bLabel: string) => {
    let lo = v1eIdx(aLabel), hi = v1eIdx(bLabel);
    if (lo > hi) [lo, hi] = [hi, lo];
    hi = Math.min(hi, lo + 11); // cap the span at 12 months
    setV2Start(v1eTimeline[lo].label); setV2Len(hi - lo + 1);
    setRangePickerOpen(false); setRangePendStart(null); setRangeHover(null); loadWin();
  };
  const onRangeCellClick = (label: string) => {
    if (rangePendStart == null) { setRangePendStart(label); setRangeHover(label); }
    else commitRange(rangePendStart, label);
  };
  // Chart data source: windowed timeline for the Final UI, else the legacy forward-anchored config.
  const chartBars: V1eBar[] = useTimeline ? windowBars : cfg.bars;
  const chartYoY = useTimeline ? windowBars.map(b => ({ label: b.label, yoy: b.yoy })) : cfg.yoy;
  const chartPeriodLabel = useTimeline ? v1eRangePeriodLabel(windowBars) : cfg.periodLabel;
  const chartTodayBar = useTimeline ? (windowBars.some(b => b.isCurrent) ? v1eCurrentLabel : null) : cfg.todayBar;

  // Initial state has < 3 months of data → the chart shows only the months we have (Jun + Jul).
  const barsView = initial ? cfg.bars.slice(0, 2) : chartBars;
  const adjPctC = Math.round(v1cConfirmed / adjProj * 100);
  const adjPctP = Math.round(v1cPlanned   / adjProj * 100);

  const memberNote = `${v1CurrMembers} this cycle vs avg ${v1AvgMembers}`;

  // Monthly rows — every month split by channel + earning; confidence fades on projections.
  let futureStep = 0;
  const monthlyRows = barsView.map((b, i) => {
    // Current month's bar total must equal the hero estimate so the chart and the
    // "Estimated payout" number agree; keep actuals-paid, flex the remainder.
    // In the Initial state the hero is the pace-only total (scen3Total), not adjProj.
    const heroTotal = initial ? scen3Total : adjProj;
    const actual = b.actual;
    const projected = b.isCurrent ? Math.max(0, heroTotal - actual) : b.projected;
    const total = actual + projected;
    const isFut = actual === 0 && projected > 0;
    const isCur = !!b.isCurrent;
    let projOpacity = 1;
    if (isCur || isFut) { projOpacity = [0.9, 0.75, 0.62, 0.52][Math.min(futureStep, 3)]; futureStep += 1; }
    // Status split (rendered only in 1M's by-source status view): the paid-out
    // portion breaks into paid/pending/failed; the remainder into planned/projected.
    const pending = isCur ? 3600 : 0;
    const failed  = isCur ? 1200 : 0;
    const paid    = Math.max(0, actual - pending - failed);
    const planned = Math.round(projected * 0.6);
    const projRemain = projected - planned;
    return {
      ...b, actual, projected, total, yoy: chartYoY[i]?.yoy ?? 0,
      paid, pending, failed, planned, projRemain,
      isFut, isCur, projOpacity, barOpacity: isFut ? projOpacity : 1,
      ...v1eSplit(total, v1eChannelSeg),
      ...v1eSplit(total, v1eEarningSeg),
    };
  });

  // Which month drives the weekly view: a drilled month, else the 1M picker selection.
  const activeWeekLabel = drillMonth ?? (is1M ? oneMonth : null);
  const weekMonthKey = activeWeekLabel ? activeWeekLabel.replace(/ '2[0-9]+$/, "") : "Jun";
  const weekBar = activeWeekLabel
    ? (chartBars.find(b => b.label === activeWeekLabel) ?? v1eTimeline.find(b => b.label === activeWeekLabel))
    : undefined;
  const weekRows: V1eWeekRow[] = activeWeekLabel
    ? v1eBuildWeeks(weekMonthKey, weekBar?.actual ?? 0, weekBar?.projected ?? 0)
    : v1eJuneWeekRows;
  const weekMonthIsCurrent = weekMonthKey === "Jun";

  // 1M month stepper helpers (steps through the trailing-12-months list).
  const oneMonthIdx = v1eMonthNav.findIndex(b => b.label === oneMonth);
  const stepMonth = (dir: -1 | 1) => {
    const next = oneMonthIdx + dir;
    if (next >= 0 && next < v1eMonthNav.length) setOneMonth(v1eMonthNav[next].label);
  };

  type SegBar = { key: string; label: string; color: string };
  // Final UI — recolor series to the Zone bar-chart palette, baking each swatch's opacity
  // into the color. Confirmed/Projected/Planned map to their semantic anchors (same blue
  // hue, intensity = certainty); provider/earning-type segments follow the sequence.
  const zoneRecolor = (arr: SegBar[]): SegBar[] => {
    if (!zone) return arr;
    let seq = 0;
    return arr.map(sb => {
      if (sb.label === "Confirmed") return { ...sb, label: ZONE_CHART_TRACKED_LABEL, color: withAlpha(ZONE_CHART_CONFIRMED, ZONE_CHART_OP_CONFIRMED) };
      if (sb.label === "Projected") return { ...sb, color: withAlpha(ZONE_CHART_PROJECTED, ZONE_CHART_OP_PROJECTED) };
      if (sb.label === "Planned")   return { ...sb, color: withAlpha(ZONE_CHART_PLANNED, ZONE_CHART_OP_PLANNED) };
      if (sb.label === "Paid" || sb.label === "Pending" || sb.label === "Failed") return sb; // keep status semantic
      const i = (seq++) % ZONE_CHART.length;
      return { ...sb, color: withAlpha(ZONE_CHART[i], ZONE_CHART_OPACITY[i]) };
    });
  };
  const statusSourceSegs: SegBar[] = [
    { key: "paid",       label: "Paid",      color: "#0e9f6e" },
    { key: "pending",    label: "Pending",   color: "#f59e0b" },
    { key: "failed",     label: "Failed",    color: "#ef4444" },
    { key: "tracked",    label: "Planned",   color: "#0168dd" },
    { key: "projected",  label: "Projected", color: "#85baf5" },
  ];
  const weekSegBars: SegBar[] = zoneRecolor(
    segTab === "source"
      ? (showStatusBreakdown
          ? statusSourceSegs
          : [
              { key: "factual",   label: "Confirmed", color: "#0e9f6e" },
              { key: "tracked",   label: "Planned",   color: "#0168dd" },
              { key: "projected", label: "Projected", color: "#85baf5" },
            ])
      : segTab === "channel"
      ? [{ key: "chFactual", label: "Confirmed", color: "#0e9f6e" }, ...v1eChannelSeg.map(s => ({ key: s.key, label: s.label, color: s.color }))]
      : v1eEarningSeg.map(s => ({ key: s.key, label: s.label, color: s.color })));

  const monthSegBars: SegBar[] = zoneRecolor(
    segTab === "source"
      ? (v1m && showStatusBreakdown
          ? [
              { key: "paid",       label: "Paid",      color: "#0e9f6e" },
              { key: "pending",    label: "Pending",   color: "#f59e0b" },
              { key: "failed",     label: "Failed",    color: "#ef4444" },
              { key: "planned",    label: "Planned",   color: "#0168dd" },
              { key: "projRemain", label: "Projected", color: "#85baf5" },
            ]
          : [{ key: "actual", label: "Confirmed", color: "#0e9f6e" }, { key: "projected", label: "Projected", color: "#85baf5" }])
      : segTab === "channel"
      ? v1eChannelSeg.map(s => ({ key: s.key, label: s.label, color: s.color }))
      : v1eEarningSeg.map(s => ({ key: s.key, label: s.label, color: s.color })));

  const activeSegBars = isWeekly ? weekSegBars : monthSegBars;

  const renderTip = (segBars: SegBar[]) => ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    const header = d.dateLabel ?? label;
    const items = segBars.map(sb => ({ ...sb, value: (d[sb.key] ?? 0) as number })).filter(i => i.value > 0);
    const total = items.reduce((s, i) => s + i.value, 0);
    return (
      <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs min-w-[170px]">
        <p className="font-semibold text-[#111827] mb-1.5">{header}</p>
        {items.map(i => (
          <div key={i.key} className="flex justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: i.color }} /><span className="text-[#6b7280]">{i.label}</span></span>
            <span className="font-medium text-[#111827]">{fmt0(i.value)}</span>
          </div>
        ))}
        {items.length > 1 && (
          <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]">
            <span className="text-[#6b7280]">Total</span>
            <span className="font-semibold text-[#111827]">{fmt0(total)}</span>
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
      {/* Spillover — late-approved timesheets: Zone Alert (Figma 1988-363). Header = icon + bold title; body below; outline CTA + dismiss on the right. Icon/title/body = -800 text; border/button/close = -600 accent. */}
      {spillover === "yellow" && !spillAlertDismissed && (
        <div data-zone="alert" className="relative flex items-center gap-3 rounded-lg border border-[#9f580a] bg-[#fdfdea] text-[#723b13] p-3">
          <div className="flex flex-1 flex-col gap-2 items-start min-w-0">
            <div className="flex items-center gap-2 w-full">
              <span className="material-symbols-rounded flex-shrink-0" style={{ fontSize: 18 }}>history</span>
              <p className="flex-1 min-w-0 font-semibold text-base leading-6"><PendingMembersTrigger scope="all" align="left" className="underline decoration-[#9f580a]/50 decoration-[1.5px] underline-offset-2 hover:decoration-[#9f580a] cursor-pointer">3 timesheets</PendingMembersTrigger> still need approval</p>
            </div>
            <p className="text-sm leading-5"><span className="font-semibold">+{fmt0(v1SpilloverTotal)}</span> to this payment if approved by <span className="font-semibold">Jun 21</span> — otherwise they&apos;ll be paid later.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="inline-flex items-center rounded-md border border-[#9f580a] text-[#9f580a] px-5 py-2.5 text-sm leading-5 hover:bg-[#fdf6b2] transition-colors whitespace-nowrap">Review approvals</button>
            <button onClick={() => setSpillAlertDismissed(true)} aria-label="Dismiss" className="flex items-center justify-center size-5 rounded-full text-[#9f580a] hover:bg-[#fdf6b2] transition-colors flex-shrink-0"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>close</span></button>
          </div>
        </div>
      )}
      {spillover === "red" && !spillAlertDismissed && (
        <div data-zone="alert" className="relative flex items-center gap-3 rounded-lg border border-[#e02424] bg-[#fdf2f2] text-[#9b1c1c] p-3">
          <div className="flex flex-1 flex-col gap-2 items-start min-w-0">
            <div className="flex items-center gap-2 w-full">
              <span className="material-symbols-rounded flex-shrink-0" style={{ fontSize: 18 }}>history</span>
              <p className="flex-1 min-w-0 font-semibold text-base leading-6">Late-approved timesheets need funding</p>
            </div>
            <p className="text-sm leading-5">{fmt0(v1SpilloverTotal)} was approved after the cycle closed — fund by <span className="font-semibold">Jun 21</span> (triggers Jun 22).</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="inline-flex items-center rounded-md border border-[#e02424] text-[#e02424] px-5 py-2.5 text-sm leading-5 hover:bg-[#fde8e8] transition-colors whitespace-nowrap">Fund now</button>
            <button onClick={() => setSpillAlertDismissed(true)} aria-label="Dismiss" className="flex items-center justify-center size-5 rounded-full text-[#e02424] hover:bg-[#fde8e8] transition-colors flex-shrink-0"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>close</span></button>
          </div>
        </div>
      )}
      {/* Report V2 — off-schedule "No pay period set" surfaced as a yellow banner (the card is gone; pending lives in the fund-by columns) */}
      {offSchedAsBanner && (
        <div data-zone="alert" className="flex items-center justify-between gap-3 bg-[#fdfdea] border border-[#fde68a] rounded-lg px-4 py-3">
          <div className="flex items-start gap-2 min-w-0">
            <span className="material-symbols-rounded text-[#d97706] flex-shrink-0 mt-0.5" style={{ fontSize: 18 }}>warning</span>
            <p className="text-[13px] text-[#723b13] leading-snug">
              <span className="font-semibold">No pay period set · {v1NotSchedMembers} members</span> — <span className="font-semibold tabular-nums">{fmt0(v1NotSchedTotal)}</span> accrued that we can&apos;t predict a funding date for yet.
            </p>
          </div>
          <button onClick={ev => ev.preventDefault()} className={zbtn("ghostPrimary", "sm", "flex-shrink-0 !gap-0.5 !px-2")}>Set periods <ChevronRight size={14} /></button>
        </div>
      )}
      {v1j ? (
      /* ══ 1J TOP ROW — Estimated-to-fund as its own narrow card + brief card ══
         mvp2 uses flex so Off-schedule can be a fixed 300px and Funding schedule takes the rest. */
      <div className={mvpSync ? "flex gap-6 items-stretch" : "grid grid-cols-12 gap-6 items-stretch"}>
        {/* Left — Estimated to fund, sized like the old Fund-your-accounts card (mvp2 moves it INSIDE the Funding schedule) */}
        {!mvpSync && (
        <div data-zone="card" data-component={zone ? "Estimated payroll card" : undefined} className={`col-span-3 bg-white rounded-lg border ${zc.border} flex flex-col`}>
          <div className={`px-4 flex items-center border-b bg-white rounded-t-lg ${zone ? "h-[60px] border-[#e5e7eb]" : "h-[55px] border-[#e5e7eb]"}`}>
            <p className={zone ? "text-lg font-medium text-[#111827]" : "text-sm font-semibold text-[#111827]"}>{zone ? "Estimated Payroll" : "Estimated payout"} <button onClick={() => setScenario(s => (s === 1 ? 2 : 1))} title="Toggle scenario (trend vs. historical)" className="text-[#6b7280] font-normal whitespace-nowrap hover:text-[#0168dd] transition-colors cursor-pointer">· June 2026</button></p>
          </div>
          <div className={`px-4 py-4 flex-1 ${v1l ? "flex flex-col" : ""}`}>
            {/* non-1L keeps the explainer at the top; 1L moves it to the bottom */}
            {!v1l && <p className="text-[11px] text-[#6b7280] leading-snug mb-2.5">Estimated from your payment history. Gets more accurate as the month fills with real data.</p>}
            {/* number + trend chip — chip opens the drivers popover */}
            <div className={`flex items-center min-w-0 ${v1l ? "gap-4" : "gap-2"}`}>
              <p className="text-3xl font-bold text-[#111827] tracking-tight leading-none">{fmt0(v1l && initial ? scen3Total : (v1l && scenario === 1 ? scen1Total : adjProj))}</p>
              {v1l ? (
                /* 1L — Adjust sits to the right of the number */
                <button onClick={() => { setEditingAdj(null); setShowAddDialog(true); }} className={zone ? zbtn("outlinePrimary", "sm", "flex-shrink-0") : "flex-shrink-0 flex items-center gap-1 text-[11px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2.5 py-1 hover:bg-[#0168dd]/5 transition-colors select-none"}><SlidersHorizontal size={zone ? 16 : 12} /> Adjust</button>
              ) : (
                <div className="relative flex-shrink-0">
                  <button onClick={() => setDriversOpen(o => !o)} title="See details"
                    className="flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-[#f9fafb] transition-colors select-none">
                    <span className={`text-sm font-semibold ${adjPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>{adjPct >= 0 ? "+" : ""}{adjPct}%</span>
                    {adjPct >= 0 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-500" />}
                    <ChevronDown size={11} className={`text-[#6b7280] transition-transform duration-150 ${driversOpen ? "rotate-180" : ""}`} />
                  </button>
                  {driversOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setDriversOpen(false)} />
                      <div className="absolute top-8 left-0 z-30 bg-white rounded-lg border border-[#e5e7eb] shadow-xl w-72 p-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">{adjPct >= 0 ? "+" : ""}{adjPct}% vs a typical month</p>
                        {/* driver rows — live list, updates when adjustments are added/removed */}
                        <div className="mt-1 divide-y divide-[#f3f4f6]">
                          {([
                            { label: "Headcount change", pct: memberPct, note: memberNote },
                            { label: "Seasonality",   pct: seasonPct, note: "May is typically above avg." },
                          ] as const).map(({ label, pct, note }) => {
                            if (label === "Seasonality" && seasonPct === 0) return null;
                            return (
                              <div key={label} className="flex items-center gap-1.5 text-xs py-1.5 min-w-0">
                                <span className="font-semibold flex-shrink-0 text-emerald-600">+{pct}%</span>
                                <span className="text-[#111827] font-medium flex-shrink-0">{label}</span>
                                <span className="text-[#d1d5db] flex-shrink-0">—</span>
                                <span className="text-[#6b7280] truncate">{note}</span>
                              </div>
                            );
                          })}
                          {manualAdjustments.map(adj => (
                            <div key={adj.id} className="flex items-center gap-1.5 text-xs py-1.5 min-w-0">
                              <span className={`font-semibold flex-shrink-0 ${adj.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{adj.type === "add" ? "+" : "−"}{adj.unit === "pct" ? `${adj.value}%` : `≈${Math.round(adj.pct)}%`}</span>
                              <span className="text-[#111827] font-medium truncate">{adj.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            {v1l && initial && showPaceBanner && (
              <div data-zone="alert" className="mt-3 flex items-center gap-2 rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-1.5">
                <span className="text-[12px] font-medium text-[#374151] leading-snug flex-1">Based on current pace only — not enough history yet</span>
                <button onClick={() => setShowPaceBanner(false)} aria-label="Dismiss" title="Dismiss" className="flex-shrink-0 -my-0.5 -mr-1 p-1 rounded text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors"><X size={14} /></button>
              </div>
            )}
            {!v1l && <V1cBreakdownPopover dark align="right" />}
            {!v1l && (
            /* actions — side by side under View breakdown */
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <button onClick={() => { if (v1k) { setEditingAdj(null); setShowAddDialog(true); } else setShowManageDialog(true); }}
                className="flex items-center gap-1 text-[11px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2.5 py-1 hover:bg-[#0168dd]/5 transition-colors select-none">
                <SlidersHorizontal size={12} /> Adjust
              </button>
              <button onClick={() => setShowMathDialog(true)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#4b5563] border border-[#e5e7eb] rounded-md px-2.5 py-1 hover:bg-[#f9fafb] hover:text-[#111827] transition-colors select-none">
                <Info size={12} /> How we get there
              </button>
            </div>
            )}
            {v1l && !condensed && initial && (
              /* Scenario 3 (Initial) — pace only: tracked+planned + remaining days = total */
              <div className="mt-4 pt-3 border-t border-[#f3f4f6] space-y-2.5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">How this adds up</p>
                  <button data-zone="button" onClick={() => setShowMathDialog(true)} className="inline-flex items-center gap-1 text-[12px] font-medium text-[#6b7280] hover:text-[#111827] transition-colors select-none"><Info size={14} /> Learn more</button>
                </div>
                <div className="flex items-baseline gap-3 text-[12px]">
                  <span className="w-16 flex-shrink-0 font-medium text-[#111827] tabular-nums">{fmt0(scen3Tracked)}</span>
                  <span className="text-[#6b7280]">Tracked + planned so far</span>
                </div>
                <div className="flex items-baseline gap-3 text-[12px]">
                  <span className="w-16 flex-shrink-0 font-medium text-[#111827] tabular-nums">+{fmt0(scen3Remaining)}</span>
                  <span className="text-[#6b7280]">Remaining days at current pace</span>
                </div>
                {manualAdjustments.map(adj => (
                  <div key={adj.id} className="flex items-center gap-3 text-[12px]">
                    <span className={`w-16 flex-shrink-0 font-medium tabular-nums ${adj.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{adj.type === "add" ? "+" : "−"}{adj.unit === "pct" ? `${adj.value}%` : `≈${Math.round(adj.pct)}%`}</span>
                    <span className="text-[#6b7280] truncate flex-1">{adj.label}</span>
                    <span className="flex items-center gap-0.5 flex-shrink-0">
                      <button onClick={() => { setEditingAdj(adj); setShowAddDialog(true); }} title="Edit name or amount" aria-label="Edit name or amount" className={`${ZBTN_BASE} h-5 w-5 ${ZBTN_VARIANT.ghostGray}`}><Pencil size={14} aria-hidden="true" /></button>
                      <button onClick={() => setManualAdjustments(prev => prev.filter(a => a.id !== adj.id))} title="Remove" aria-label="Remove" className={`${ZBTN_BASE} h-5 w-5 ${ZBTN_VARIANT.ghostGray} hover:text-red-600`}><X size={14} aria-hidden="true" /></button>
                    </span>
                  </div>
                ))}
                <div className="flex items-baseline gap-3 text-[13px] pt-1.5 border-t border-[#e5e7eb]">
                  <span className="w-16 flex-shrink-0 font-bold text-[#111827] tabular-nums">{fmt0(scen3Total)}</span>
                  <span className="font-bold text-[#111827]">Total to fund</span>
                </div>
              </div>
            )}
            {v1l && !condensed && !initial && (
              /* 1L — the math, on-screen: base → auto adjustments → estimate → manual → total */
              <div className={`mt-4 pt-3 border-t border-[#f3f4f6] ${zone ? "space-y-2.5" : "space-y-1.5"}`}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className={zone ? "text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]" : "text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]"}>How this adds up</p>
                  <button data-zone="button" onClick={() => setShowMathDialog(true)} className={zone ? "inline-flex items-center gap-1 text-[12px] font-medium text-[#6b7280] hover:text-[#111827] transition-colors select-none" : "inline-flex items-center gap-1 text-[10px] font-medium text-[#4b5563] hover:text-[#111827] transition-colors select-none"}>{zone ? <><Info size={14} /> Learn more</> : <><Info size={11} /> Details</>}</button>
                </div>
                <div className="flex items-baseline gap-3 text-[12px]">
                  <span className="w-28 flex-shrink-0 font-medium text-[#111827] tabular-nums"><span className="inline-block w-3.5" />{fmt0(v1AvgMonthly)}</span>
                  <span className="text-[#6b7280]">Monthly average</span>
                </div>
                <div className="flex items-baseline gap-3 text-[12px]">
                  <span className="w-28 flex-shrink-0 font-medium text-[#111827] tabular-nums"><span className="inline-block w-3.5 text-[#9ca3af] font-normal">+</span>{fmt0(v1lEstimate - v1AvgMonthly)} <span className="text-[#0168dd]">({v1lAutoPct}%)</span></span>
                  <span className="relative inline-flex self-center">
                    <button onClick={() => setShowAutoPop(o => !o)} className="text-[12px] font-normal text-[#6b7280] underline underline-offset-2 hover:text-[#111827] transition-colors select-none">Auto adjustments</button>
                    {showAutoPop && (<>
                      <div className="fixed inset-0 z-20" onClick={() => setShowAutoPop(false)} />
                      <div data-zone="popover" className="absolute top-6 left-0 z-30 bg-white rounded-lg border border-[#e5e7eb] shadow-xl w-96 p-3.5">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">+{v1lAutoPct}% vs a typical month</p>
                        <div className="mt-1 divide-y divide-[#f3f4f6]">
                          <div className="flex items-center gap-1.5 text-xs py-1.5"><span className="font-semibold flex-shrink-0 text-[#0168dd]">+{memberPct}%</span><span className="text-[#111827] font-medium flex-shrink-0">Headcount change</span><span className="text-[#d1d5db] flex-shrink-0">—</span><span className="text-[#6b7280] whitespace-nowrap">{memberNote}</span></div>
                          {seasonPct > 0 && <div className="flex items-center gap-1.5 text-xs py-1.5"><span className="font-semibold flex-shrink-0 text-[#0168dd]">+{seasonPct}%</span><span className="text-[#111827] font-medium flex-shrink-0">Seasonality</span><span className="text-[#d1d5db] flex-shrink-0">—</span><span className="text-[#6b7280] whitespace-nowrap">June is typically above average</span></div>}
                        </div>
                      </div>
                    </>)}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 text-[12px] pt-1.5 border-t border-[#f3f4f6]">
                  <span className="w-28 flex-shrink-0 font-semibold text-[#111827] tabular-nums"><span className="inline-block w-3.5 text-[#9ca3af] font-normal">=</span>{fmt0(v1lEstimate)}</span>
                  <span className="text-[#6b7280]">Projection based on historical numbers</span>
                </div>
                {scenario === 1 ? (
                  <div className="flex items-center gap-3 text-[12px]">
                    <span className="w-28 flex-shrink-0 font-medium text-[#111827] tabular-nums"><span className="inline-block w-3.5 text-[#9ca3af] font-normal">+</span>{fmt0(Math.round(v1lEstimate * scenTrendPct / 100))} <span className="text-[#0168dd]">({scenTrendPct}%)</span></span>
                    <span className="text-[#111827] font-medium">Current trend</span>
                    <span className={zpill("primary", "md", "ml-auto")}>Applied</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-[12px]">
                    <span className="w-28 flex-shrink-0 font-medium text-[#9ca3af] tabular-nums"><span className="inline-block w-3.5" />−{scen2TrendPct}%</span>
                    <span className="text-[#6b7280]">Current trend</span>
                    <span title="You're paying less than usual for the elapsed period, but a slow start doesn't guarantee a lighter month — and under-funding risks a failed payment. So we keep the higher historical number." className={`${zpill("gray", "md", "ml-auto")} cursor-help`}>Not applied <Info size={11} /></span>
                  </div>
                )}
                {manualAdjustments.map(adj => (
                  <div key={adj.id} className="flex items-center gap-3 text-[12px]">
                    <span className={`w-16 flex-shrink-0 font-medium tabular-nums ${adj.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{adj.type === "add" ? "+" : "−"}{adj.unit === "pct" ? `${adj.value}%` : `≈${Math.round(adj.pct)}%`}</span>
                    <span className="text-[#6b7280] truncate flex-1">{adj.label}</span>
                    <span className="flex items-center gap-0.5 flex-shrink-0">
                      <button onClick={() => { setEditingAdj(adj); setShowAddDialog(true); }} title="Edit name or amount" aria-label="Edit name or amount" className={`${ZBTN_BASE} h-5 w-5 ${ZBTN_VARIANT.ghostGray}`}><Pencil size={14} aria-hidden="true" /></button>
                      <button onClick={() => setManualAdjustments(prev => prev.filter(a => a.id !== adj.id))} title="Remove" aria-label="Remove" className={`${ZBTN_BASE} h-5 w-5 ${ZBTN_VARIANT.ghostGray} hover:text-red-600`}><X size={14} aria-hidden="true" /></button>
                    </span>
                  </div>
                ))}
                <div className="flex items-baseline gap-3 text-[13px] pt-1.5 border-t border-[#e5e7eb]">
                  <span className="w-28 flex-shrink-0 font-bold text-[#111827] tabular-nums"><span className="inline-block w-3.5 text-[#9ca3af] font-normal">=</span>{fmt0(scenario === 1 ? scen1Total : adjProj)}</span>
                  <span className="font-bold text-[#111827]">Total to fund</span>
                </div>
              </div>
            )}
            {v1l && (
              <p className="mt-auto pt-3 border-t border-[#f3f4f6] text-[11px] text-[#6b7280] leading-snug">{initial ? "We don't have 3+ months of history yet, so no historical adjustments are applied. This gets more accurate as the month fills. Add a buffer via Adjust." : (scenario === 1 ? "Estimated from your history and current pace. Gets more accurate as the month fills. Add a buffer via Adjust." : "You're trending ~9% below your historical costs — but we recommend planning for the higher figure so you don't underfund. Gets more accurate as the month fills. Add a buffer via Adjust.")}</p>
            )}
          </div>
        </div>
        )}
        {/* Right — Add to cover: date-card timeline + expandable provider detail */}
        {v1k
          ? <V1kNextPaymentsCard onViewSchedule={() => setShowScheduleDialog(true)} v1l={v1l} zone={zone} condensed={condensed} mvp={mvp} sync={mvpSync} estPanel={mvpSync ? estPanelInner : undefined} onProviderClick={onProviderClick} approvedIds={approvedIds} onApprove={onApprove} offSchedVer={offSchedVer} colSpan={mvpSync ? "flex-1 min-w-0" : offSchedAsCard ? "col-span-6" : "col-span-9"} />
          : <V1jAddToCoverCard onViewSchedule={() => setShowScheduleDialog(true)} />}
        {/* V2 — Off-schedule promoted to a top-level 25% card beside Estimated Payroll + Funding schedule */}
        {offSchedAsCard && (
          <div className={mvpSync ? "w-[280px] flex-shrink-0" : "col-span-3"}><V1kOffScheduleCard approvedIds={approvedIds} onApprove={onApprove} topLevel mvp={mvp} /></div>
        )}
      </div>
      ) : (
      <>
      {/* ══ TOP ROW — summary card (9/12 + 3/12 fund card in the side-fund layout) ══ */}
      <div className={sideFund ? "grid grid-cols-12 gap-6 items-stretch" : "contents"}>
      {/* ══ SUMMARY CARD — fixed to the current month ══════════════════════ */}
      <div data-component={zone ? "Funding schedule card" : undefined} className={`bg-white rounded-lg border ${zc.border} ${sideFund ? "col-span-9" : ""}`}>
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e5e7eb] bg-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#111827]">Predictable Cash Flow</span>
            <span className="text-xs text-[#6b7280]">· <span className="font-semibold text-[#0168dd]">{v1eFullMonthLabel("Jun '26")}</span> · this month</span>
          </div>
          <ExportDropdown />
        </div>
      <div className="grid grid-cols-2 divide-x divide-[#e5e7eb]">
        {/* Left — HERO: recommended projection for this month */}
        <div className="px-5 py-4">
          {/* ZONE 1 — the number + composition bar */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1 h-[21px] flex items-center">Estimated payout · June 2026</p>
          {v1i ? (
            <>
              {/* 1I — number + View breakdown (black), then an action row of buttons */}
              <div className="flex items-end gap-2.5 mt-4 min-w-0">
                <p className="text-3xl font-bold text-[#111827] tracking-tight leading-none">{fmt0(adjProj)}</p>
                <V1cBreakdownPopover dark />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <button onClick={() => setShowManageDialog(true)}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2.5 py-1 hover:bg-[#0168dd]/5 transition-colors select-none">
                  <SlidersHorizontal size={12} /> Adjust
                </button>
                <button onClick={() => setShowMathDialog(true)}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#4b5563] border border-[#e5e7eb] rounded-md px-2.5 py-1 hover:bg-[#f9fafb] hover:text-[#111827] transition-colors select-none">
                  <Info size={12} /> How we get there
                </button>
              </div>
            </>
          ) : (
            <>
          <div className="flex items-center justify-between gap-2 mt-4">
            <div className="flex items-end gap-2.5 min-w-0">
              <p className="text-3xl font-bold text-[#0168dd] tracking-tight leading-none">{fmt0(adjProj)}</p>
              <V1cBreakdownPopover />
            </div>
            <button onClick={() => setShowManageDialog(true)}
              className="flex-shrink-0 flex items-center gap-1 text-[11px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2.5 py-1 hover:bg-[#0168dd]/5 transition-colors select-none">
              <SlidersHorizontal size={12} /> Adjust
            </button>
          </div>

          {/* The math, inline — reads as an equation: = baseline + adjustments */}
          <div className="relative mt-2 flex items-center gap-1 text-[11px] flex-wrap">
            <span className="text-[#6b7280]">=</span>
            <span className="font-semibold text-[#111827]">{fmt0(v1AvgMonthly)}</span>
            <span className="text-[#6b7280]">monthly avg</span>
            <span className="text-[#6b7280]">{adjPct >= 0 ? "+" : "−"}</span>
            <button onClick={() => setMathOpen(o => !o)}
              className="inline-flex items-center gap-0.5 text-[11px] border-b border-dotted border-[#d1d5db] hover:border-[#6b7280] transition-colors select-none">
              <span className={`font-semibold ${adjPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>{Math.abs(adjPct)}%</span>
              {adjPct >= 0 ? <TrendingUp size={11} className="text-emerald-600" /> : <TrendingDown size={11} className="text-red-500" />}
              <span className="text-[#6b7280]">adjustments</span>
              <ChevronDown size={10} className={`text-[#6b7280] transition-transform ${mathOpen ? "rotate-180" : ""}`} />
            </button>
            {mathOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMathOpen(false)} />
                <div className="absolute left-0 top-6 z-30 w-64 bg-white rounded-lg border border-[#e5e7eb] shadow-xl p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1.5">Adjustments · {adjPct >= 0 ? "+" : ""}{adjPct}%</p>
                  <div className="divide-y divide-[#f3f4f6]">
                    {([
                      { label: "Headcount change", pct: memberPct, note: memberNote },
                      { label: "Seasonality",   pct: seasonPct, note: "May is typically above avg." },
                    ] as const).map(({ label, pct, note }) => {
                      if (label === "Seasonality" && seasonPct === 0) return null;
                      return (
                        <div key={label} className="flex items-center gap-1.5 text-xs py-1.5 min-w-0">
                          <span className="font-semibold flex-shrink-0 text-emerald-600">+{pct}%</span>
                          <span className="text-[#111827] font-medium flex-shrink-0">{label}</span>
                          <span className="text-[#d1d5db] flex-shrink-0">—</span>
                          <span className="text-[#6b7280] truncate">{note}</span>
                        </div>
                      );
                    })}
                    {manualAdjustments.map(adj => (
                      <div key={adj.id} className="flex items-center gap-1.5 text-xs py-1.5 min-w-0">
                        <span className={`font-semibold flex-shrink-0 ${adj.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{adj.type === "add" ? "+" : "−"}{adj.unit === "pct" ? `${adj.value}%` : `≈${Math.round(adj.pct)}%`}</span>
                        <span className="text-[#111827] font-medium flex-shrink-0">{adj.label}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setMathOpen(false); setShowManageDialog(true); }}
                    className="mt-1.5 w-full text-center text-[11px] font-medium text-[#0168dd] hover:text-[#0057bb] transition-colors select-none py-1 border-t border-[#f3f4f6]">
                    Manage adjustments
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="relative group mt-6 cursor-default">
            <div className="h-2 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div className="h-full bg-emerald-500" style={{ width: `${adjPctC}%` }} />
                <div className="h-full bg-[#0168dd]" style={{ width: `${Math.max(adjPctP, 0.6)}%` }} />
                <div className="h-full flex-1 bg-[#85baf5]" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-[#6b7280] mt-0.5">
              <span>{fmt0(v1AvgMonthly)} avg</span>
              <span>{fmt0(adjProj)} total</span>
            </div>
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 pointer-events-none">
              <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 w-48">
                {v1cBarHoverRows.map(({ label, color, value, pct }) => {
                  const k = value / 1000;
                  const fmtK = `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
                  return (
                    <div key={label} className="flex items-center justify-between text-[11px] font-semibold mb-1 last:mb-0 text-[#6b7280]">
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

          {/* ZONE 3 — caveat */}
          <p className="mt-4 pt-4 border-t border-[#f3f4f6] text-[10px] text-[#9ca3af] leading-snug">{fmt0(adjProj)} is an estimate from your payment history — not a guaranteed figure. Add a buffer, or <a href="#" onClick={e => e.preventDefault()} className="font-medium text-[#6b7280] underline decoration-dotted decoration-[#d1d5db] underline-offset-2 hover:text-[#111827] transition-colors">see how to improve accuracy</a>.</p>
            </>
          )}
        </div>

        {/* Right — Add to cover for the next payday */}
        <V1gAddToCoverColumn onViewSchedule={() => setShowScheduleDialog(true)} collapsible={v1i} />
      </div>

      </div>{/* ══ end SUMMARY CARD ══ */}
      {sideFund && <div className="col-span-3"><V1hFundCard /></div>}
      </div>{/* ══ end TOP ROW ══ */}
      </>
      )}

      {/* ══ CHART CARD — separate explorer with its own range control ══════ */}
      <div data-zone="card" className={`bg-white rounded-lg border ${zc.border} overflow-hidden`}>
        <div className={`flex items-center justify-between gap-3 border-b ${zone ? zc.divider : zc.border} bg-white flex-wrap ${zone ? "px-4 h-[60px]" : "px-5 py-3"}`}>
          <div>
            <p className={zone ? "text-lg font-medium text-[#111827]" : `text-sm font-semibold ${zc.text}`}>{mvp ? "Payroll by earning type" : "Explore your payments over time"}</p>
            {!zone && <p className={`text-[11px] ${zc.muted}`}>Projected payouts ahead — browsing here doesn't change the numbers above.</p>}
          </div>
          <div className={`flex items-center flex-shrink-0 ${zone ? "gap-4" : "gap-3"}`}>
            {/* Final UI — one control row in the header: view segmented · ranges · YoY toggle (last) */}
            {zone && !mvp && (
              <div className={zc.segWrap}>
                {([["source","Tracked vs. projected"],["channel","Payout method"],["type","Payroll breakdown"]] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setSegTab(id)} className={zc.seg(segTab === id)}>{label}</button>
                ))}
              </div>
            )}
            {!mvp && !v2mode && (
            <div className={zone ? zc.segWrap : `flex items-center ${zc.segTrack} rounded-md p-0.5`}>
              {((v1l || v1m ? ["3M","6M","12M"] : ["1M","3M","6M","12M"]) as V1eRange[]).map(r => (
                <button key={r} onClick={() => applyRange(r)}
                  className={zone ? zc.seg(range === r) : `px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${range === r ? zc.active : zc.inactive}`}>
                  {r}
                </button>
              ))}
            </div>
            )}
            {/* v2 — a single Zone date-range picker replaces the 3/6/12M buttons and the chevrons.
                Pick any span up to 12 months; move through time by picking a different range. */}
            {v2mode && !drillMonth && (() => {
              const loIdx = startIdx, hiIdx = startIdx + winLen - 1;
              // preview span while choosing the second endpoint (capped at 12 months)
              let pLo = loIdx, pHi = hiIdx;
              if (rangePendStart != null) {
                let a = v1eIdx(rangePendStart), b = v1eIdx(rangeHover ?? rangePendStart);
                if (a > b) [a, b] = [b, a];
                b = Math.min(b, a + 11);
                pLo = a; pHi = b;
              }
              const cellCls = (i: number) => {
                const inRange = i >= pLo && i <= pHi;
                const isLo = i === pLo, isHi = i === pHi;
                if (isLo || isHi) return "bg-[#2f8af4] text-white hover:cursor-pointer";
                if (inRange) return "bg-gray-200 hover:cursor-pointer";
                return "hover:bg-gray-100 hover:cursor-pointer text-[#111827]";
              };
              const cellRound = (i: number) => `${i === pLo ? "rounded-l-full" : ""} ${i === pHi ? "rounded-r-full" : ""}`;
              const CAL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const presets: [string, number, number][] = [ // [label, startIdxInTimeline, len]
                ["Last 3 months", v1eIdx("Apr '26"), 3],
                ["Last 6 months", v1eIdx("Jan '26"), 6],
                ["Last 12 months", v1eIdx("Jul '25"), 12],
                ["Next 3 months", v1eIdx("Jun '26"), 3],
                ["Next 6 months", v1eIdx("Jun '26"), 6],
                ["This year", v1eIdx("Jan '26"), 12],
              ];
              return (
                <div className="relative flex-shrink-0">
                  <button onClick={() => setRangePickerOpen(o => !o)}
                    className={`h-8 px-2.5 flex items-center gap-1.5 rounded-[6px] border border-[#d1d5db] text-sm font-medium text-[#374151] ${zc.hoverBg} transition-colors whitespace-nowrap`}>
                    <span className="material-symbols-rounded text-[#6b7280]" style={{ fontSize: 16 }}>calendar_month</span>
                    {chartPeriodLabel}
                    <ChevronDown size={13} className={`${zc.muted} transition-transform ${rangePickerOpen ? "rotate-180" : ""}`} />
                  </button>
                  {rangePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => { setRangePickerOpen(false); setRangePendStart(null); }} />
                      <div className="absolute top-9 right-0 z-30 flex gap-0 bg-white rounded-lg shadow-lg ring-1 ring-black/5 overflow-hidden">
                        {/* presets */}
                        <div className="flex flex-col gap-2 px-4 py-4 bg-gradient-to-r from-white to-[#f9fafb] border-r border-[#f3f4f6]">
                          {presets.map(([label, sIdx, len]) => {
                            const active = sIdx === loIdx && len === winLen;
                            return (
                              <button key={label} onClick={() => commitRange(v1eTimeline[sIdx].label, v1eTimeline[Math.min(sIdx + len - 1, v1eTimeline.length - 1)].label)}
                                className={`px-2.5 py-1 text-xs rounded-md border transition-colors whitespace-nowrap text-left ${active ? "bg-[#2f8af4] text-white border-transparent" : "bg-white text-[#374151] border-[#d1d5db] hover:bg-[#f9fafb]"}`}>
                                {label}
                              </button>
                            );
                          })}
                        </div>
                        {/* month calendar — years stacked, padded Jan–Dec, months without data disabled */}
                        <div className="p-4 w-[248px]">
                          <p className="text-sm font-medium text-[#111827] mb-0.5">Select up to 12 months</p>
                          <p className="text-[11px] text-[#6b7280] mb-3 h-4">{rangePendStart != null ? "Pick the end month…" : "Click a start, then an end month"}</p>
                          <div className="flex flex-col gap-3">
                            {["2025", "2026", "2027"].map(yr => {
                              const yy = yr.slice(2);
                              return (
                                <div key={yr}>
                                  <p className="text-xs font-semibold text-[#0168dd] mb-1.5">{yr}</p>
                                  <div className="grid grid-cols-4 gap-y-1">
                                    {CAL_MONTHS.map(mon => {
                                      const label = `${mon} '${yy}`;
                                      const i = v1eIdx(label);
                                      const avail = i >= 0;
                                      return (
                                        <button key={mon} disabled={!avail}
                                          onClick={() => avail && onRangeCellClick(label)}
                                          onMouseEnter={() => { if (avail && rangePendStart != null) setRangeHover(label); }}
                                          className={`h-8 flex items-center justify-center text-[13px] border-none transition-colors ${avail ? `${cellRound(i)} ${cellCls(i)}` : "text-gray-300 cursor-not-allowed"}`}>
                                          {mon}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
            {/* Start-month navigator — the label opens a jump picker; Today snaps back to the current month. */}
            {useTimeline && !v2mode && !drillMonth && (
              <div className="relative flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setStartPickerOpen(o => !o)}
                  className={`h-8 px-2.5 flex items-center gap-1.5 rounded-[6px] border border-[#d1d5db] ${zc.hoverBg} transition-colors whitespace-nowrap`}>
                  <span className="material-symbols-rounded text-[#6b7280]" style={{ fontSize: 16 }}>calendar_month</span>
                  <span className={`text-sm ${zc.muted} font-normal`}>Starting on</span>
                  <span className="text-sm font-medium text-[#374151]">{v1eFullMonthLabel(startLabel)}</span>
                  <ChevronDown size={13} className={`${zc.muted} transition-transform ${startPickerOpen ? "rotate-180" : ""}`} />
                </button>
                {!atToday && (
                  <button onClick={() => { setStartMonth(v1eCurrentLabel); setStartPickerOpen(false); loadWin(); }}
                    className="ml-1 h-8 px-2.5 flex items-center gap-1 rounded-[6px] text-sm font-medium text-[#0168dd] hover:bg-[#f0f5ff] transition-colors whitespace-nowrap">
                    <span className="material-symbols-rounded" style={{ fontSize: 15 }}>today</span>
                    Today
                  </button>
                )}
                {startPickerOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setStartPickerOpen(false)} />
                    <div className="absolute top-9 left-0 z-30 bg-white rounded-lg border border-[#e5e7eb] shadow-xl py-1 w-44 max-h-64 overflow-y-auto">
                      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">Start month</p>
                      {v1eTimeline.slice(0, maxStartIdx + 1).map(b => {
                        const sel = b.label === startLabel;
                        const isCur = b.label === v1eCurrentLabel;
                        return (
                          <button key={b.label} onClick={() => { setStartMonth(b.label); setStartPickerOpen(false); loadWin(); }}
                            className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center justify-between transition-colors ${sel ? "bg-[#f0f5ff] text-[#0168dd] font-medium" : "text-[#111827] hover:bg-[#f9fafb]"}`}>
                            <span>{v1eFullMonthLabel(b.label)}</span>
                            {isCur && <span className={`text-[10px] ${sel ? "text-[#0168dd]" : "text-[#9ca3af]"}`}>Today</span>}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
            {zone && !mvp && !is1M && !drillMonth && (
              /* Zone Toggle — size sm. Track w-8 h-4 rounded-[24px]; 12px white thumb,
                 2px inset, 16px travel, no shadow. role=switch + data-state.
                 Checked fill = primary-700 #0168dd per the Figma tokens (source of truth).
                 NB: the shipped Rails component uses bg-blue-600 #2f8af4 — code/design drift. */
              <button onClick={() => setShowYoY(p => !p)} role="switch" aria-checked={showYoY}
                data-zone="toggle" data-size="sm" data-variant={showYoY ? "on" : "off"}
                className="group flex items-center gap-2 text-[11px] select-none cursor-pointer flex-shrink-0">
                <span data-state={showYoY ? "checked" : "unchecked"}
                  className={`relative w-8 h-4 rounded-[24px] transition-colors flex-shrink-0 inline-flex ${showYoY ? "bg-[#0168dd]" : "bg-[#d1d5db]"}`}>
                  <span className={`absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white transition-transform ${showYoY ? "translate-x-[16px]" : "translate-x-0"}`} />
                </span>
                <span className={zc.muted}>vs last year</span>
              </button>
            )}
            {!zone && <div className="relative flex items-center gap-1 text-[11px]">
              <button onClick={() => { if (is1M && !drillMonth) stepMonth(-1); }}
                disabled={is1M && !drillMonth && oneMonthIdx <= 0}
                className={`p-0.5 rounded ${zc.muted} ${zc.hoverText} ${zc.hoverBg} transition-colors disabled:opacity-30 disabled:hover:bg-transparent`}>{chevLeft}</button>
              {drillMonth ? (
                <span className={`font-medium ${zc.text} min-w-[130px] text-center`}>{drillMonth} — weekly</span>
              ) : is1M ? (
                <button onClick={() => setMonthPickerOpen(o => !o)}
                  className={`text-[11px] font-medium ${zc.text} min-w-[130px] text-center ${zc.hoverBg} rounded px-2 py-0.5 flex items-center justify-center gap-1 transition-colors`}>
                  {v1eFullMonthLabel(oneMonth)}
                  <ChevronDown size={11} className={`${zc.muted} transition-transform ${monthPickerOpen ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <span className={`font-medium ${zc.text} min-w-[130px] text-center`}>{cfg.periodLabel}</span>
              )}
              <button onClick={() => { if (is1M && !drillMonth) stepMonth(1); }}
                disabled={is1M && !drillMonth && oneMonthIdx >= v1eMonthNav.length - 1}
                className={`p-0.5 rounded ${zc.muted} ${zc.hoverText} ${zc.hoverBg} transition-colors disabled:opacity-30 disabled:hover:bg-transparent`}>{chevRight}</button>
              {monthPickerOpen && is1M && !drillMonth && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMonthPickerOpen(false)} />
                  <div className={`absolute top-8 left-7 z-30 bg-white rounded-lg border ${zc.border} shadow-xl py-1 w-40 max-h-56 overflow-y-auto`}>
                    {v1eMonthNav.map(b => (
                      <button key={b.label} onClick={() => { setOneMonth(b.label); setMonthPickerOpen(false); setLoading(true); setTimeout(() => setLoading(false), 550); }}
                        className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${b.label === oneMonth ? "bg-[#eef3ff] text-[#0168dd] font-medium" : `${zc.text} hover:bg-[#f9fafb]`}`}>
                        {v1eFullMonthLabel(b.label)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>}
          </div>
        </div>
      {/* ── Chart controls ───────────────────────────────────────────────── */}
      <div className={`${zone ? "px-4" : "px-5"} pt-4 pb-0`}>
        {/* Row 1 — distribution caption (left) + segmentation tabs (right, segmented-pill style).
            MVP hides it: the card title already reads "Payroll by earning type" and there are no tabs. */}
        {!mvp && (
        <div className="flex items-start justify-between mb-3 gap-4">
          <div>
            <p className={`text-[11px] ${zc.muted}`}>{zone ? `${chartCaption.replace(" · click a bar for its weekly breakdown", "")}${useTimeline && !drillMonth ? ` · ${chartPeriodLabel}` : ""}` : chartCaption}</p>
          </div>
          {!zone && (<div className="flex items-center gap-3 flex-shrink-0">
            <div className={`flex items-center ${zc.segTrack} rounded-md p-0.5`}>
              {([["source","Tracked vs. projected"],["channel","Payout method"],["type","Payroll breakdown"]] as const).map(([id, label]) => (
                <button key={id} onClick={() => setSegTab(id)}
                  className={zone ? zc.seg(segTab === id) : `px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${segTab === id ? zc.active : zc.inactive}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>)}
        </div>
        )}

        {/* Chart-level control — YoY side-by-side comparison (month ranges only). Final UI moves it next to the segmented control above. */}
        {!zone && !is1M && !drillMonth && (
          <div className="flex items-center justify-end my-3">
            <button onClick={() => setShowYoY(p => !p)} className="flex items-center gap-1.5 text-[10px] select-none cursor-pointer">
              <span className={`relative w-7 h-4 rounded-full transition-colors flex-shrink-0 inline-flex ${showYoY ? zc.toggleOn : zc.toggleOff}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${showYoY ? "translate-x-3.5" : "translate-x-0.5"}`} />
              </span>
              <span className={zc.muted}>vs last year</span>
            </button>
          </div>
        )}

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
          <div data-zone="alert" className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-[11px]">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
3 pending ($3.6k) · 1 failed ($1.2k) from Weeks 1–2 need attention
            </div>
            <button className="text-[11px] text-[#0168dd] font-semibold flex-shrink-0 hover:underline flex items-center gap-0.5">Review <ChevronRight size={11} /></button>
          </div>
        </div>
      )}

      {/* ── Chart ────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-4">
        {loading ? (
          <ChartSkeleton bars={isWeekly ? 4 : (chartBars.length || 12)} />
        ) : isWeekly ? (
          <ResponsiveContainer width="100%" height={zone ? 220 : 150}>
            <BarChart data={weekRows} barCategoryGap="30%" maxBarSize={zone ? 80 : undefined} margin={{ top: 20, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke={zone ? "#e5e7eb" : "#f3f4f6"} strokeDasharray={zone ? "5 5" : undefined} />
              <XAxis dataKey="dateLabel" tick={{ fontSize: zone ? 14 : 9, fill: zone ? "#6b7280" : "#6b7280" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: zone ? 14 : 10, fill: zone ? "#6b7280" : "#6b7280" }} tickFormatter={(v: number) => `$${Math.round(v/1000)}k`} axisLine={false} tickLine={false} width={zone ? 40 : 36} />
              <Tooltip content={renderTip(weekSegBars)} cursor={{ fill: "#f9fafb" }} />
              {weekSegBars.map((sb, idx) => (
                <Bar key={sb.key} dataKey={sb.key} stackId="w" fill={sb.color} name={sb.label}
                  stroke={zone ? "#ffffff" : undefined} strokeWidth={zone ? 2 : undefined}
                  radius={zone
                    ? [idx === weekSegBars.length - 1 ? 4 : 0, idx === weekSegBars.length - 1 ? 4 : 0, idx === 0 ? 4 : 0, idx === 0 ? 4 : 0]
                    : (idx === weekSegBars.length - 1 ? [3, 3, 0, 0] : undefined)}>
                  {idx === weekSegBars.length - 1 && (
                    <LabelList dataKey="total" position="top" offset={6}
                      formatter={(v: number) => `$${Math.round(v / 1000)}k`}
                      fill="#6b7280" style={{ fontSize: zone ? 12 : 10, fontWeight: 600 }} />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={zone ? 220 : 150}>
            <ComposedChart data={monthlyRows} barCategoryGap="28%" maxBarSize={zone ? 80 : undefined} margin={{ top: 20, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke={zone ? "#e5e7eb" : "#f3f4f6"} strokeDasharray={zone ? "5 5" : undefined} />
              {/* "Now" anchor — keeps users oriented once the window slides off the current month. */}
              {useTimeline && chartTodayBar && (
                <ReferenceLine x={chartTodayBar} stroke="#0168dd" strokeDasharray="4 4"
                  label={{ value: "Today", position: "top", fontSize: 11, fill: "#0168dd", fontWeight: 600 }} />
              )}
              <XAxis dataKey="label" tick={{ fontSize: zone ? 14 : (range === "12M" ? 9 : 10), fill: zone ? "#6b7280" : "#6b7280" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: zone ? 14 : 10, fill: zone ? "#6b7280" : "#6b7280" }} tickFormatter={(v: number) => `$${Math.round(v/1000)}k`} axisLine={false} tickLine={false} width={zone ? 40 : 36} />
              <Tooltip cursor={{ fill: "#f9fafb" }} content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                const items = monthSegBars.map(sb => ({ ...sb, value: (d[sb.key] ?? 0) as number })).filter(i => i.value > 0);
                const total = items.reduce((s, i) => s + i.value, 0);
                return (
                  <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs min-w-[180px]">
                    <p className="font-semibold text-[#111827] mb-1.5">{d.label}</p>
                    {items.map(i => (
                      <div key={i.key} className="flex justify-between gap-4 py-0.5">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: i.color }} /><span className="text-[#6b7280]">{i.label}</span></span>
                        <span className="font-medium text-[#111827]">{fmt0(i.value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]">
                      <span className="text-[#6b7280]">Total</span>
                      <span className="font-semibold text-[#111827]">{fmt0(total)}</span>
                    </div>
                    {showYoY && (d.yoy ?? 0) > 0 && (
                      <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e5e7eb]">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: "#d1d5db" }} /><span className="text-[#6b7280]">Last year · {v1ePrevYearLabel(d.label)}</span></span>
                        <span className="font-medium text-[#111827]">{fmt0(d.yoy)}</span>
                      </div>
                    )}
                  </div>
                );
              }} />
              {monthSegBars.map((sb, idx) => (
                <Bar key={sb.key} dataKey={sb.key} stackId="m" fill={sb.color} name={sb.label}
                  stroke={zone ? "#ffffff" : undefined} strokeWidth={zone ? 2 : undefined}
                  radius={zone
                    ? [idx === monthSegBars.length - 1 ? 4 : 0, idx === monthSegBars.length - 1 ? 4 : 0, idx === 0 ? 4 : 0, idx === 0 ? 4 : 0]
                    : (idx === monthSegBars.length - 1 ? [3, 3, 0, 0] : undefined)}
                  cursor="pointer" onClick={(d: any) => d?.label && setDrillMonth(d.label)}>
                  {monthlyRows.map((row, ri) => (
                    <Cell key={ri}
                      fillOpacity={segTab === "source" ? (row.isFut ? row.projOpacity : ((sb.key === "projected" || sb.key === "projRemain") ? row.projOpacity : 1)) : row.barOpacity} />
                  ))}
                  {idx === monthSegBars.length - 1 && (
                    <LabelList dataKey="total" position="top" offset={6}
                      formatter={(v: number) => `$${Math.round(v / 1000)}k`}
                      fill="#6b7280" style={{ fontSize: zone ? 12 : 10, fontWeight: 600 }} />
                  )}
                </Bar>
              ))}
              {showYoY && (
                <Bar dataKey="yoy" stackId="prev" fill="#d1d5db" name="Last year" radius={zone ? [4, 4, 0, 0] : [3, 3, 0, 0]} isAnimationActive={false}>
                  <LabelList dataKey="yoy" position="top" offset={6}
                    formatter={(v: number) => v > 0 ? `$${Math.round(v / 1000)}k` : ""}
                    style={{ fontSize: zone ? 12 : 9, fontWeight: 600, fill: "#9ca3af" }} />
                </Bar>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        <div className="flex items-center gap-x-3 gap-y-1 mt-1.5 flex-wrap">
          {activeSegBars.map(sb => (
            <span key={sb.key} className={`flex items-center gap-1.5 ${zone ? "text-[12px] text-[#6b7280]" : "text-[10px] text-[#6b7280]"}`}>
              <span className={`w-2 h-2 flex-shrink-0 ${zone ? "rounded-full" : "rounded-sm"}`} style={{ background: sb.color }} />
              {sb.label}
              {v1SegLegendInfo[sb.label] && <InfoTip text={v1SegLegendInfo[sb.label]} />}
            </span>
          ))}
          {showYoY && !isWeekly && (
            <span className={`flex items-center gap-1.5 ${zone ? "text-[12px] text-[#6b7280]" : "text-[10px] text-[#6b7280]"}`}>
              <span className={`w-2 h-2 flex-shrink-0 ${zone ? "rounded-full" : "rounded-sm"}`} style={{ background: "#d1d5db" }} />
              Last year (same month)
            </span>
          )}
          {!isWeekly && (range === "6M" || range === "12M") && (
            <span className="text-[9px] text-[#d1d5db] italic ml-auto">Confidence fades on projected months</span>
          )}
        </div>
      </div>
      </div>{/* ══ end CHART CARD ══ */}

      <V1gManageAdjustmentsDialog
        open={showManageDialog}
        onClose={() => setShowManageDialog(false)}
        base={v1AvgMonthly}
        memberPct={memberPct} memberAmt={memberAmt} memberNote={memberNote}
        seasonPct={seasonPct} seasonAmt={seasonAmt}
        manualAdjustments={manualAdjustments}
        setManualAdjustments={setManualAdjustments}
        finalTotal={adjProj}
      />
      {v1k
        ? <V1kFundingScheduleDialog open={showScheduleDialog} onClose={() => setShowScheduleDialog(false)} />
        : <V1gFundingScheduleDialog open={showScheduleDialog} onClose={() => setShowScheduleDialog(false)} />}
      {v1k && (
        <AddAdjustmentDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSave={adj => {
            if (editingAdj) setManualAdjustments(prev => prev.map(a => a.id === adj.id ? adj : a));
            else setManualAdjustments(prev => [...prev, adj]);
          }}
          base={v1AvgMonthly}
          currentProjection={editingAdj ? adjProj - (editingAdj.type === "add" ? editingAdj.dollars : -editingAdj.dollars) : adjProj}
          initial={editingAdj ?? undefined}
          zone={zone}
        />
      )}
      <V1iHowWeGetThereDialog
        open={showMathDialog}
        onClose={() => setShowMathDialog(false)}
        base={v1AvgMonthly}
        memberPct={memberPct} memberNote={memberNote}
        seasonPct={seasonPct}
        adjPct={adjPct} total={adjProj}
        manualAdjustments={manualAdjustments}
        scenario={scenario}
        projection={v1lEstimate}
        trendPct={scenTrendPct}
        trend2Pct={scen2TrendPct}
        scen1Total={scen1Total}
        initial={initial}
        scen3Tracked={scen3Tracked}
        scen3Remaining={scen3Remaining}
        scen3Total={scen3Total}
        zone={zone}
      />
    </>
  );
}

// ── 1G funding model — per-payday, per-provider "add to cover" ──────────────
// Balance readable (Wise) → true gap. Not readable (PayPal) → payout routed,
// labelled "est." (fund for payout, not a confirmed gap).
const v1gProviderMeta: Record<string, { name: string; balanceReadable: boolean }> = {
  wise:    { name: "Wise",    balanceReadable: true },
  paypal:  { name: "PayPal",  balanceReadable: false },
  bitwage: { name: "Bitwage", balanceReadable: true },
  deel:    { name: "Deel",    balanceReadable: true },
  export:  { name: "Export",  balanceReadable: false },
  gusto:   { name: "Gusto",   balanceReadable: true },
  payoneer:{ name: "Payoneer", balanceReadable: false },
};
// daysOut = days from today until the FUND-BY date (payout date minus transfer lag),
// so windows are built on when you must fund, not when the payment lands.
// A payout method on a funding date can aggregate MORE than one pay period (e.g. Wise weekly + monthly
// both landing on the same fund date). `periods` lists the contributing pay periods for context.
type V1gPayPeriod = { type: string; dates?: string };
type V1gFundDate = { date: string; dow: string; daysOut: number; tag?: "next" | "projected"; funded?: boolean; fundBy?: string; paidOn?: string; providers: { id: string; amount: number; periods?: V1gPayPeriod[] }[] };
const v1gFundSchedule: V1gFundDate[] = [
  { date: "Jun 8",  dow: "Mon", daysOut: -12, funded: true,    fundBy: "Sun, Jun 7",  paidOn: "Jun 10", providers: [{ id: "wise", amount: 12000 }, { id: "paypal", amount: 9000 }] },
  { date: "Jun 15", dow: "Mon", daysOut: -5, funded: true,     fundBy: "Sun, Jun 14", paidOn: "Jun 17", providers: [{ id: "wise", amount: 13000 }, { id: "paypal", amount: 11000 }] },
  { date: "Jun 22", dow: "Mon", daysOut: 2,  tag: "next",       fundBy: "Sun, Jun 21", paidOn: "Jun 24", providers: [{ id: "wise", amount: 15000, periods: [{ type: "Weekly", dates: "Jun 16 – Jun 22" }, { type: "Bi-weekly", dates: "Jun 9 – Jun 22" }, { type: "Monthly", dates: "Jun 1 – Jun 30" }] }, { id: "paypal", amount: 13000, periods: [{ type: "Weekly", dates: "Jun 16 – Jun 22" }, { type: "Monthly", dates: "Jun 1 – Jun 30" }] }, { id: "deel", amount: 20000 }, { id: "export", amount: 12000 }] },
  { date: "Jun 24", dow: "Wed", daysOut: 4,                      fundBy: "Tue, Jun 23", paidOn: "Jun 26", providers: [{ id: "bitwage", amount: 10000 }, { id: "gusto", amount: 8000 }] },
  { date: "Jun 30", dow: "Tue", daysOut: 10,                     fundBy: "Mon, Jun 29", paidOn: "Jul 2",  providers: [{ id: "wise", amount: 16000 }, { id: "paypal", amount: 11000 }] },
  { date: "Jul 6",  dow: "Mon", daysOut: 16, tag: "projected",   fundBy: "Sun, Jul 5",  paidOn: "Jul 8",  providers: [{ id: "wise", amount: 14500 }, { id: "paypal", amount: 9500 }] },
  { date: "Jul 13", dow: "Mon", daysOut: 23, tag: "projected",   fundBy: "Sun, Jul 12", paidOn: "Jul 15", providers: [{ id: "wise", amount: 15500 }, { id: "paypal", amount: 10000 }] },
];
const v1gSum = (d: V1gFundDate) => d.providers.reduce((s, p) => s + p.amount, 0);

// Right half of the top strip: the next payday's gap, same rhythm as the hero
// (big total → per-provider breakdown → link out).
function V1gPill({ id, amount }: { id: string; amount: number }) {
  const meta = v1gProviderMeta[id];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f9fafb] border border-[#e5e7eb] pl-1 pr-2.5 py-1">
      <ProviderLogo id={id} size={16} />
      <span className="text-[11px] font-medium text-[#111827]">{meta.name}</span>
      {!meta.balanceReadable && <span title="Fund for payout · balance unavailable" className="text-[9px] text-[#6b7280] border-b border-dotted border-[#d1d5db] cursor-help leading-none">est.</span>}
      <span className="text-[11px] font-bold text-[#4b5563]">+{fmt0(amount)}</span>
    </span>
  );
}

function V1gAddToCoverColumn({ onViewSchedule, collapsible = false }: { onViewSchedule: () => void; collapsible?: boolean }) {
  const windowDays = 7;
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (d: string) => setExpanded(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const inWindow = v1gFundSchedule.filter(e => !e.funded && e.daysOut > 0 && e.daysOut <= windowDays);
  const total = inWindow.reduce((s, e) => s + v1gSum(e), 0);
  const nextUnfunded = v1gFundSchedule.find(e => !e.funded && e.daysOut > 0);

  const scheduleButton = (
    <button onClick={onViewSchedule} className="flex-shrink-0 text-[11px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2.5 py-1 hover:bg-[#0168dd]/5 transition-colors select-none w-fit">
      View full schedule
    </button>
  );

  return (
    <div className="px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1 h-[21px] flex items-center">Add to cover · next 7 days</p>

      {inWindow.length === 0 ? (
        <>
          <div className="mt-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0e9f6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="text-base font-bold text-emerald-600">Nothing to fund this week ✓</span>
          </div>
          {nextUnfunded && <p className="text-[11px] text-[#6b7280] mt-1.5">Next payday is {nextUnfunded.dow}, {nextUnfunded.date} — {fmt0(v1gSum(nextUnfunded))} to add.</p>}
          <div className="mt-4">{scheduleButton}</div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 mt-4">
            <div className="flex items-end gap-2 min-w-0">
              <p className="text-3xl font-bold text-[#4b5563] tracking-tight leading-none">{fmt0(total)}</p>
              <span className="text-[11px] text-[#6b7280] mb-0.5">this week</span>
            </div>
            {scheduleButton}
          </div>
          <div className="mt-4 relative">
            <div className="absolute left-[3px] top-2 bottom-2 w-px bg-[#e5e7eb]" />
            <div className="space-y-6">
              {inWindow.map(e => {
                const open = !collapsible || expanded.includes(e.date);
                return (
                <div key={e.date} className="relative pl-5">
                  <div className="absolute left-0 top-[5px] w-2 h-2 rounded-full bg-[#d1d5db] ring-2 ring-white" />
                  {collapsible ? (
                    <button onClick={() => toggle(e.date)} className="flex items-center gap-1.5 w-full text-left select-none">
                      <span className="text-xs font-semibold text-[#111827]">{e.dow}, {e.date}</span>
                      <span className="text-xs text-[#d1d5db]">·</span>
                      <span className="text-xs font-semibold text-[#4b5563]">{fmt0(v1gSum(e))}</span>
                      <ChevronDown size={13} className={`ml-auto text-[#6b7280] transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-[#111827]">{e.dow}, {e.date}</span>
                      <span className="text-xs text-[#d1d5db]">·</span>
                      <span className="text-xs font-semibold text-[#4b5563]">{fmt0(v1gSum(e))}</span>
                    </div>
                  )}
                  {open && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {e.providers.map(p => <V1gPill key={p.id} id={p.id} amount={p.amount} />)}
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Full per-date, per-provider funding runway. Scrollable, filterable by account
// and status; projected dates are dimmed; export in the footer.
function V1gFundingScheduleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fProvider, setFProvider] = useState<"all" | "wise" | "paypal" | "bitwage">("all");
  const [fStatus, setFStatus] = useState<"upcoming" | "unfunded">("upcoming");
  useEffect(() => { if (!open) { setFProvider("all"); setFStatus("upcoming"); } }, [open]);
  if (!open) return null;

  const rows = v1gFundSchedule
    .filter(e => fStatus === "unfunded" ? !e.funded : true)
    .map(e => ({ ...e, providers: e.providers.filter(p => fProvider === "all" || p.id === fProvider) }))
    .filter(e => e.providers.length > 0);
  const anyEst = rows.some(e => e.providers.some(p => !v1gProviderMeta[p.id].balanceReadable));

  const check = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-white rounded-xl shadow-2xl w-[520px] max-w-full max-h-[82vh] flex flex-col pointer-events-auto">
          {/* header + filters (sticky) */}
          <div className="px-6 pt-5 pb-3 border-b border-[#e5e7eb] flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">Funding schedule</h2>
                <p className="text-[11px] text-[#6b7280] mt-0.5">When to fund each account · dates reflect payout delay</p>
              </div>
              <button data-zone="icon_button" onClick={onClose} className="p-1 rounded-md text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
            <div className="flex items-start gap-6 mt-3">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#6b7280] mb-1">Account</span>
                <div data-zone="segmented_controls" className="flex bg-[#f3f4f6] rounded-md p-0.5 w-fit">
                  {([["all", "All"], ["wise", "Wise"], ["paypal", "PayPal"], ["bitwage", "Bitwage"]] as const).map(([k, label]) => (
                    <button key={k} onClick={() => setFProvider(k)} className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${fProvider === k ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#6b7280] mb-1">Status</span>
                <div data-zone="segmented_controls" className="flex bg-[#f3f4f6] rounded-md p-0.5 w-fit">
                  {([["upcoming", "All upcoming"], ["unfunded", "Unfunded only"]] as const).map(([k, label]) => (
                    <button key={k} onClick={() => setFStatus(k)} className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${fStatus === k ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
            {/* Account context — ties the schedule to the Fund-your-accounts data */}
            {fProvider !== "all" && (() => {
              const acct = fundInitProviders.find(p => p.id === fProvider);
              const meta = v1gProviderMeta[fProvider];
              const shortfall = acct && acct.balance !== undefined && acct.needed !== undefined ? acct.needed - acct.balance : null;
              return (
                <div className="mt-3 flex items-center justify-between gap-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <ProviderLogo id={fProvider} size={22} />
                    <div>
                      <p className="text-xs font-semibold text-[#111827]">{meta.name}</p>
                      <p className="text-[10px] text-[#6b7280]">{acct?.balance !== undefined
                        ? <>Balance <span className="font-semibold text-[#111827]">{fmt0(acct.balance)}</span></>
                        : "Balance unavailable"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {acct?.status === "needs-funding" && shortfall !== null && shortfall > 0 && (
                      <div className="text-right">
                        <p className="text-[10px] text-[#6b7280]">Add to cover</p>
                        <p className="text-xs font-bold text-amber-600">+{fmt0(shortfall)}</p>
                      </div>
                    )}
                    {acct?.status === "funded" && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">{check} Funded</span>
                    )}
                    <a href="#" onClick={e => e.preventDefault()} className="px-2.5 py-1.5 rounded-md text-[10px] font-semibold text-[#0168dd] hover:bg-[#0168dd]/5 transition-colors whitespace-nowrap inline-flex items-center gap-1">
                      Go to {meta.name}
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* body — timeline (scrolls) */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {rows.length === 0 ? (
              <p className="text-center text-[12px] text-[#6b7280] py-10">No funding dates match these filters.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-[4px] top-3 bottom-3 w-px bg-[#e5e7eb]" />
                <div className="space-y-6">
                  {rows.map(e => {
                    const total = v1gSum(e);
                    const projected = e.tag === "projected";
                    const dot = e.funded ? "bg-emerald-400" : e.tag === "next" ? "bg-[#0168dd]" : projected ? "bg-[#d1d5db]" : "bg-amber-400";
                    return (
                      <div key={e.date} className="relative pl-6">
                        <div className={`absolute left-0 top-[5px] w-[9px] h-[9px] rounded-full ring-2 ring-white ${dot}`} />
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${projected ? "text-[#6b7280]" : "text-[#111827]"}`}>{e.dow}, {e.date}</span>
                            {e.tag === "next" && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#e8f2fd] text-[#0168dd]">next payday</span>}
                            {projected && <span className="text-[10px] text-[#d1d5db]">· projected</span>}
                            {e.funded && <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">{check} funded</span>}
                          </div>
                          <span className={`text-sm font-bold ${e.funded ? "text-emerald-600" : projected ? "text-[#6b7280]" : "text-[#4b5563]"}`}>{fmt0(total)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {e.providers.map(p => {
                            const meta = v1gProviderMeta[p.id];
                            return (
                              <span key={p.id} className={`inline-flex items-center gap-1.5 rounded-full border pl-1 pr-2.5 py-1 bg-[#f9fafb] ${e.funded ? "border-[#f3f4f6] opacity-70" : "border-[#e5e7eb]"}`}>
                                <ProviderLogo id={p.id} size={16} />
                                <span className="text-[11px] font-medium text-[#111827]">{meta.name}</span>
                                {!meta.balanceReadable && <span className="text-[9px] text-[#d1d5db]">est.</span>}
                                <span className="text-[11px] font-bold text-[#4b5563]">+{fmt0(p.amount)}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {anyEst && (
                  <p className="text-[10px] text-[#9ca3af] leading-snug mt-4">· est. — PayPal balance is unavailable, so the figure is the payout routed to it, not a confirmed gap.</p>
                )}
              </div>
            )}
          </div>

          {/* footer (sticky) */}
          <div className="px-6 py-3 flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] text-[#6b7280]">Showing June + next payday · follows your range</span>
            <button className="flex items-center gap-1.5 text-xs font-semibold border border-[#e5e7eb] rounded-lg px-3 py-1.5 text-[#111827] hover:bg-[#f9fafb] transition-colors"><Download size={13} /> Export</button>
          </div>
        </div>
      </div>
    </>
  );
}

function Version1G({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />
      <FundYourAccountsPanel showBars={false} />
      <div>
        <p className="text-base font-semibold text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1FutureTracked />}
      </div>
    </div>
  );
}

function Version1H({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} sideFund />
      <div>
        <p className="text-base font-semibold text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1FutureTracked />}
      </div>
    </div>
  );
}

// ─── Version 1I — copy of Version 1H ─────────────────────────────────────────

function Version1I({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} sideFund v1i />
      <div>
        <p className="text-base font-semibold text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1FutureTracked />}
      </div>
    </div>
  );
}

function Version1J({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} v1i v1j />
      <div>
        <p className="text-base font-semibold text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1FutureTracked />}
      </div>
    </div>
  );
}

function Version1K({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} v1i v1j v1k />
      <div>
        <p className="text-base font-semibold text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-3 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1FutureTracked />}
      </div>
    </div>
  );
}

// ─── Version 1L — copy of Version 1K (v1l flag reserved for divergence) ──────
function Version1L({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [dense, setDense] = useState(false); // Detailed (default) vs Condensed view
  const [detailProvider, setDetailProvider] = useState<string | null>(null); // secondary "future payment" page

  // Clicking a provider on a fund card opens the in-1L future-payment detail (item E).
  if (detailProvider) return <V1lFutureDetail providerId={detailProvider} onBack={() => setDetailProvider(null)} />;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
        <div className="flex bg-[#f3f4f6] rounded-lg p-0.5">
          {([["detailed","Detailed"],["condensed","Condensed"]] as const).map(([k, label]) => {
            const active = (k === "condensed") === dense;
            return (
              <button key={k} onClick={() => setDense(k === "condensed")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${active ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
            );
          })}
        </div>
      </div>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} v1i v1j v1k v1l condensed={dense} onProviderClick={setDetailProvider} />
      {/* "Future Tracked So Far" tab retired — its detail now lives in the future-payment page (item E) */}
      <div>
        <p className="text-base font-semibold text-[#111827] mb-3">Payment History</p>
        <V1PaymentHistory />
      </div>
    </div>
  );
}

// ─── Version 1M — copy of 1L; future detail moves inline into a filterable tab ──
function Version1M({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const dense = false; // 1M stays Detailed (toggle hidden; condensed code kept for 1L)
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history"); // Payment History / Future Tracked So Far
  const [futureProvider, setFutureProvider] = useState<string>("all"); // provider filter for the Future tab
  const [futurePeriod, setFuturePeriod] = useState<string>("June 2026"); // pay period for the Future tab
  const activityRef = useRef<HTMLDivElement>(null);

  // Clicking a provider on a fund card anchors to the Future Tracked tab, filtered to
  // that provider + the pay period that card funds (a week for weekly providers).
  const openFuture = (providerId: string) => {
    setFutureProvider(providerId);
    setFuturePeriod(v1mCurrentPeriod(providerId));
    setBottomTab("future");
    setTimeout(() => activityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      {/* Detailed/Condensed toggle hidden in 1M (still available in 1L); 1M stays Detailed */}
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} v1i v1j v1k v1l v1m condensed={dense} onProviderClick={openFuture} />
      <div ref={activityRef}>
        <p className="text-base font-semibold text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-6 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1mFutureTracked provider={futureProvider} period={futurePeriod} onProviderChange={setFutureProvider} onPeriodChange={setFuturePeriod} />}
      </div>
    </div>
  );
}

// 1N — an exact copy of 1M (independent wrapper so it can diverge later).
function Version1N({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const dense = false; // 1N stays Detailed, same as 1M
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history"); // Payment History / Future Tracked So Far
  const [futureProvider, setFutureProvider] = useState<string>("all"); // provider filter for the Future tab
  const [futurePeriod, setFuturePeriod] = useState<string>("June 2026"); // pay period for the Future tab
  const activityRef = useRef<HTMLDivElement>(null);

  const openFuture = (providerId: string) => {
    setFutureProvider(providerId);
    setFuturePeriod(v1mCurrentPeriod(providerId));
    setBottomTab("future");
    setTimeout(() => activityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <h1 className="text-xl font-semibold text-[#111827]">Payments report</h1>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} v1i v1j v1k v1l v1m condensed={dense} onProviderClick={openFuture} />
      <div ref={activityRef}>
        <p className="text-base font-semibold text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-6 border-b border-[#e5e7eb]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1mFutureTracked provider={futureProvider} period={futurePeriod} onProviderChange={setFutureProvider} onPeriodChange={setFuturePeriod} grouped />}
      </div>
    </div>
  );
}

// Final UI — exact copy of 1N; the version we'll iterate the final shell/styling on.
// Zone empty-state illustration ("no data") — design-system asset from Figma DD0eEumGwzGfrPbb7q2iak
// node 9343:19846, inlined as a data URI so it survives the Figma asset-URL expiry and deploys cleanly.
const ZONE_EMPTY_ILLUSTRATION = "data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9Ijg2IiBoZWlnaHQ9Ijc0IiB2aWV3Qm94PSIwIDAgODYgNzQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJlbXB0eSI+CjxwYXRoIGlkPSJWZWN0b3IiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTAuMTE3MiAyNi44NzA3QzQuMzA4MjYgMzYuNjY2OCAxLjI4NDU3IDQ5LjQ0NzUgNy4yMzczOSA1OS4wOTc3QzEyLjc4ODkgNjguMDk3MiAyNS41ODQ0IDY2LjQ0MjIgMzUuOTY2MSA2OC43NzQ1QzQ1Ljk4MDcgNzEuMDI0NCA1Ni4wNjQ1IDc3LjA1NzUgNjUuMDY5IDcyLjA5Qzc1LjMwNTcgNjYuNDQyNiA4MS4wOTA3IDU1LjAyMjkgODEuODc3MyA0My40NDY1QzgyLjcxMzUgMzEuMTQwMyA3OS4zNTkzIDE3Ljc2OTUgNjkuMjQyNiAxMC42NjU2QzU5LjY3MjEgMy45NDUxNSA0Ny4wNzU3IDcuOTM0NTggMzUuNzMyNyAxMS4wNDM1QzI1LjU0MjggMTMuODM2MyAxNS40ODQyIDE3LjgxOTggMTAuMTE3MiAyNi44NzA3WiIgZmlsbD0iI0YxRjdGRiIvPgo8ZyBpZD0iYm94IiBmaWx0ZXI9InVybCgjZmlsdGVyMF9kXzBfNDgpIj4KPHBhdGggaWQ9IlBhdGgiIGQ9Ik0xMC42NjAxIDIxLjQ4MTFINzUuNTc1NFY1Mi42NDExQzc1LjU3NTQgNTMuOTg2NCA3NC40ODQ4IDU1LjA3NzEgNzMuMTM5NCA1NS4wNzcxSDEzLjA5NjFDMTEuNzUwNyA1NS4wNzcxIDEwLjY2MDEgNTMuOTg2NCAxMC42NjAxIDUyLjY0MTFWMjEuNDgxMVoiIGZpbGw9IiNCOEM5RTAiLz4KPHBhdGggaWQ9IlBhdGhfMiIgZD0iTTEwLjQ5MzggOS42NzE3NUw0LjE1OTI2IDIzLjYwNzVDMy45MTg0OCAyNC4xMTAzIDMuOTUyNDggMjQuNzAxNSA0LjI0OTMyIDI1LjE3MzVDNC41NDYxNSAyNS42NDU0IDUuMDY0MzMgMjUuOTMyMSA1LjYyMTg1IDI1LjkzMjhIODAuMzc2NEM4MC45NDYxIDI1LjkzMjggODEuNDc0MiAyNS42MzQgODEuNzY3OCAyNS4xNDU3QzgyLjA2MTQgMjQuNjU3NCA4Mi4wNzc2IDI0LjA1MDkgODEuODEwNSAyMy41NDc2TDc1LjYwNyA5LjY3MTc1SDEwLjQ5MzhaIiBmaWxsPSIjRTRFRUZDIi8+CjxwYXRoIGlkPSJQYXRoXzMiIGQ9Ik02Mi40OTA5IDBMNzUuNjA2NSA5LjY3MTc3SDEwLjQ4ODNMMjMuNTMzOSAwSDYyLjQ5MDlaIiBmaWxsPSIjQ0REQkVFIi8+CjxwYXRoIGlkPSJQYXRoXzQiIGQ9Ik0yMy41MzM5IDBWOS42NzE3N0gxMC40ODgzTDIzLjUzMzkgMFoiIGZpbGw9IiNCOEM5RTAiLz4KPHBhdGggaWQ9IlBhdGhfNSIgZD0iTTYyLjQ5MiAwVjkuNjY0NjdMNzUuNjA3NiA5LjY3MTc3TDYyLjQ5MiAwWiIgZmlsbD0iI0I4QzlFMCIvPgo8L2c+CjwvZz4KPGRlZnM+CjxmaWx0ZXIgaWQ9ImZpbHRlcjBfZF8wXzQ4IiB4PSItMi41MzY0N2UtMDkiIHk9IjAiIHdpZHRoPSI4NiIgaGVpZ2h0PSI2My4wNzcxIiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+CjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+CjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIiByZXN1bHQ9ImhhcmRBbHBoYSIvPgo8ZmVPZmZzZXQgZHk9IjQiLz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMiIvPgo8ZmVDb21wb3NpdGUgaW4yPSJoYXJkQWxwaGEiIG9wZXJhdG9yPSJvdXQiLz4KPGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAuMDUgMCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9ImVmZmVjdDFfZHJvcFNoYWRvd18wXzQ4Ii8+CjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iZWZmZWN0MV9kcm9wU2hhZG93XzBfNDgiIHJlc3VsdD0ic2hhcGUiLz4KPC9maWx0ZXI+CjwvZGVmcz4KPC9zdmc+Cg==";

// Cold-start empty state (spec §5.3): no pay rates, pay periods, tracked hours, or history —
// nothing can be projected, so each section guides the two setup prerequisites (set pay rates
// + start tracking time) instead of showing data. No CSV import path (out of MVP scope).
function FinalSectionEmpty({ title, body, children, pad = "py-12" }: { icon?: ReactNode; title: string; body: string; children?: ReactNode; pad?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 ${pad}`}>
      <img src={ZONE_EMPTY_ILLUSTRATION} alt="" className="w-20 h-auto mb-2.5" aria-hidden="true" />
      <p className="text-lg font-medium text-[#111827] leading-[26px] mb-[5px]">{title}</p>
      <p className="text-sm text-[#4b5563] leading-5 max-w-[360px]">{body}</p>
      {children}
    </div>
  );
}

// Sample roster for the V3 empty-state "members missing setup" popovers.
const EMPTY_ROSTER: { name: string; initials: string; color: string }[] = [
  { name: "Marcus Chen", initials: "MC", color: "#0e9f6e" },
  { name: "Aurora Arjomilla", initials: "AA", color: "#0168dd" },
  { name: "Liam O'Brien", initials: "LO", color: "#0e9f6e" },
  { name: "Priya Nair", initials: "PN", color: "#e5764e" },
  { name: "Emma Novak", initials: "EN", color: "#8b5cf6" },
  { name: "Diego Santos", initials: "DS", color: "#f59e0b" },
  { name: "Omar Haddad", initials: "OH", color: "#0e9f6e" },
  { name: "Zara Ali", initials: "ZA", color: "#8b5cf6" },
  { name: "Noah Kim", initials: "NK", color: "#0168dd" },
  { name: "Chloe Dubois", initials: "CD", color: "#e5764e" },
  { name: "Yuki Tanaka", initials: "YT", color: "#8b5cf6" },
  { name: "Sofia Rossi", initials: "SR", color: "#e5764e" },
  { name: "James Okafor", initials: "JO", color: "#2f8af4" },
  { name: "Marta Kowalski", initials: "MK", color: "#f59e0b" },
];

function FinalUIEmptyBody({ ver }: { ver: 1 | 2 | 3 | 4 | 5 }) {
  const [tab, setTab] = useState<"history" | "future">("history");
  const [showExample, setShowExample] = useState(false); // "See an example" preview modal
  const [learnMore, setLearnMore] = useState<null | "rates" | "tracking">(null); // per-step "Learn more" how-to dialog
  const [memberList, setMemberList] = useState<string | null>(null); // V3/V4 "N members with no …" list popover (keyed per step)
  // V3 per-step status: a count of who's still missing (opens a member-list popover), or an "all set up" state at 0.
  const memberStatus = (kind: string, missing: number, noun: string) => (
    missing === 0 ? (
      <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0e9f6e]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg> You&apos;re all set up</p>
    ) : (
      <div className="relative">
        <a href="#" onClick={(e) => { e.preventDefault(); setMemberList(memberList === kind ? null : kind); }} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#c2410c] hover:text-[#9a3412] transition-colors">
          <AlertTriangle size={13} className="flex-shrink-0" aria-hidden="true" /> {missing} members with no {noun}
        </a>
        {memberList === kind && (<>
          <div className="fixed inset-0 z-20" onClick={() => setMemberList(null)} />
          <div className="absolute left-0 top-6 z-30 w-60 bg-white rounded-lg border border-[#e5e7eb] shadow-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-[#f3f4f6]"><p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">No {noun} · {missing}</p></div>
            <div className="max-h-56 overflow-y-auto py-1">
              {EMPTY_ROSTER.map(m => (
                <div key={m.name} className="flex items-center gap-2 px-3 py-1.5">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0" style={{ background: m.color }} aria-hidden="true">{m.initials}</span>
                  <span className="text-[13px] text-[#111827] truncate">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </>)}
      </div>
    )
  );
  // Funding-schedule empty card (header + Zone illustration + get-started guide + step cards).
  // Shared by V1 (col-span-9 in the grid) and V2 (full-width single card).
  const fundingCard = (cls: string, showHeader: boolean, v3 = false) => (
    <div className={`bg-white rounded-lg border border-[#e5e7eb] flex flex-col ${cls}`}>
      {showHeader && (
        <div className="px-4 flex items-center gap-3 border-b bg-white rounded-t-lg h-[60px] border-[#e5e7eb]">
          <p className="text-lg font-medium text-[#111827]">Funding schedule</p>
        </div>
      )}
      <div className="px-6 py-10 flex-1 flex flex-col items-center justify-center text-center">
        <img src={ZONE_EMPTY_ILLUSTRATION} alt="" className="w-20 h-auto mb-2.5" aria-hidden="true" />
        <p className="text-lg font-medium text-[#111827] leading-[26px] mb-[5px]">Set up payroll to see your funding</p>
        <p className="text-sm text-[#4b5563] leading-5 max-w-[460px]">We project your funding from your team&apos;s pay rates and tracked time. Add both, and your estimated payroll, funding schedule, and month-over-month trends fill in automatically — an estimate at first (no history yet) that sharpens each cycle. <a href="#" onClick={(e) => { e.preventDefault(); setShowExample(true); }} className="font-medium text-[#0168dd] underline underline-offset-2 hover:text-[#0057bb]">See an example</a></p>
        <div className="flex items-stretch gap-4 mt-5 w-full max-w-[720px] text-left">
          {/* Zone step card — reproduced from Figma node 81:283 (pixel-perfect) */}
          <div className="flex-1 min-w-0 bg-white border border-[#e5e7eb] rounded-lg p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-rounded flex-shrink-0 text-[#4b5563] leading-none" style={{ fontSize: 24, fontVariationSettings: '"FILL" 0' }} aria-hidden="true">tune</span>
                <p className="text-base font-semibold text-[#111827] leading-6 truncate">1 . Set pay rates</p>
              </div>
              <button onClick={e => e.preventDefault()} className={zbtn("outlinePrimary", "sm", "flex-shrink-0")}>Set pay rates</button>
            </div>
            <p className="text-sm text-[#6b7280] leading-5">So we know what each member earns. <a href="#" onClick={(e) => { e.preventDefault(); setLearnMore("rates"); }} className="font-medium text-[#0168dd] underline underline-offset-2 hover:text-[#0057bb]">Learn more</a></p>
            {v3 && memberStatus("rates", 103, "pay rates")}
          </div>
          <div className="flex-1 min-w-0 bg-white border border-[#e5e7eb] rounded-lg p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-rounded flex-shrink-0 text-[#4b5563] leading-none" style={{ fontSize: 24, fontVariationSettings: '"FILL" 0' }} aria-hidden="true">schedule</span>
                <p className="text-base font-semibold text-[#111827] leading-6 truncate">2 . Tracking Time</p>
              </div>
              <button onClick={e => e.preventDefault()} className={zbtn("outlinePrimary", "sm", "flex-shrink-0")}>Start</button>
            </div>
            <p className="text-sm text-[#6b7280] leading-5">So we can project hours worked. <a href="#" onClick={(e) => { e.preventDefault(); setLearnMore("tracking"); }} className="font-medium text-[#0168dd] underline underline-offset-2 hover:text-[#0057bb]">Learn more</a></p>
            {v3 && memberStatus("tracking", 105, "tracked time")}
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <>
      {(ver === 4 || ver === 5) ? (
      /* Centered, capped width so the welcome reads like a landing page, not a full-bleed app view */
      <div className="max-w-[1140px] mx-auto pt-6">
        {/* Hero — welcome / onboarding. 60px below it → 24px below the Get-set-up card (explicit
            margins instead of a uniform space-y so the two gaps can differ). */}
        <div className={ver === 5 ? "mb-[60px]" : "bg-white rounded-lg border border-[#e5e7eb] p-8 mb-[60px]"}>
          <div className="flex flex-col lg:flex-row gap-10 lg:items-center">
            <div className="flex-1 min-w-0 lg:pt-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0168dd] mb-2.5">Predictable cash flow</p>
              <h2 className="text-[28px] font-bold text-[#111827] tracking-tight leading-[1.15] mb-3">See your payroll cash flow before it&apos;s due</h2>
              <p className="text-base text-[#4b5563] leading-relaxed max-w-[520px]">What’s projected, what’s due and when, and every payment in between. No spreadsheets, no missed payroll.</p>
              <ul className="mt-6 space-y-3.5">
                {([
                  { icon: <ClipboardList size={18} aria-hidden="true" />, title: "Estimated payroll", body: "your month’s cost, projected as it fills in." },
                  { icon: <CalendarDays size={18} aria-hidden="true" />, title: "Funding schedule", body: "what’s due for each payout method, and by when." },
                  { icon: <BarChart2 size={18} aria-hidden="true" />, title: "Payments over time", body: "month-over-month trends, split by earning type." },
                  { icon: <FileSpreadsheet size={18} aria-hidden="true" />, title: "Payment activity", body: "a detailed history and what’s tracked so far." },
                ]).map(f => (
                  <li key={f.title} className="flex items-center gap-3">
                    <span data-zone="icon" className="text-[#0168dd] flex-shrink-0">{f.icon}</span>
                    <p className="text-sm text-[#4b5563] leading-snug"><span className="font-medium text-[#111827]">{f.title}</span> — {f.body}</p>
                  </li>
                ))}
              </ul>
              {/* Secondary CTA — a short video walking through what this page does. Grey/outlined
                  (the real primary action is the "Get set up" steps below). No video wired yet;
                  for now it opens the live interactive preview as a stand-in. */}
              <div className="mt-7">
                <button onClick={() => setShowExample(true)} className={zbtn("outlineGray", "md", "gap-2")} style={{ borderColor: "#4b5563" }}><PlayCircle size={17} /> Watch a demo</button>
              </div>
            </div>
            {/* Sample-data preview — the real screenshot as the hero, framed like a product
                window (clear, full-opacity). No CTA here — it lives on the left, so the image
                can be as large and prominent as possible. */}
            <div className="w-full lg:w-[580px] flex-shrink-0 relative">
              {/* Base — the report window */}
              <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-[0_18px_44px_-12px_rgba(17,24,39,0.24)] overflow-hidden">
                <div className="flex items-center gap-2 h-10 px-4 border-b border-[#e5e7eb] bg-white">
                  <span className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" />
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6b7280]"><Eye size={14} aria-hidden="true" /> Sample data</span>
                </div>
                <img src={mvpPreview} alt="Preview of the Predictable Cash Flow report with sample data" className="block w-full" />
              </div>

              {/* Floating feature callouts — up front with soft shadows for depth (decorative, desktop only, don't block the image click) */}
              <div aria-hidden="true" className="pointer-events-none hidden lg:block absolute -top-5 -right-2 w-[196px] rounded-lg bg-white border border-[#e5e7eb] shadow-[0_12px_30px_-12px_rgba(17,24,39,0.20)] p-3 z-20">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-[#9ca3af]">Total projected</p>
                  <svg viewBox="0 0 88 20" width="53" height="12" fill="none" role="img" aria-label="Wise logo" className="flex-shrink-0"><path fill="#163300" d="M48.9285.2989h5.413L51.6183 19.7263h-5.4131L48.9285.2989Zm-6.8241 0L38.4514 11.4904 36.8573.2989h-3.7858L28.2893 11.4572 27.6917.2989h-5.2472L24.271 19.7263h4.3504L34.0014 7.4389 35.8943 19.7263h4.284L47.2518.2989h-5.1474ZM87.5508 11.59H74.6988c.0665 2.5239 1.5775 4.1844 3.8025 4.1844 1.6771 0 3.0055-.8967 4.035-2.607l4.3382 1.972C85.3833 18.0775 82.2413 19.992 78.3685 19.992 73.0883 19.992 69.5847 16.4386 69.5847 10.7266 69.5847 4.4501 73.7025 0 79.5142 0c5.1145 0 8.3357 3.4538 8.3357 8.8336 0 .8967-.1 1.7933-.299 2.7564Zm-4.8153-3.7194c0-2.2582-1.262-3.6862-3.2877-3.6862-2.0922 0-3.8191 1.4944-4.2841 3.6862h7.5718ZM5.5255 6.1532 0 12.6107h9.8661l1.1086-3.0449H6.747l2.5832-2.9868.0083-.0792L7.6588 3.6085h7.5569l-5.8579 16.1179h4.0087L20.4402.2989H2.166L5.5255 6.1532Zm57.6165-1.9689c1.9095 0 3.5827 1.0269 5.0439 2.7869l.7677-5.4769C67.592.5729 65.7489 0 63.308 0c-4.8485 0-7.5716 2.8394-7.5716 6.4426 0 2.499 1.3948 4.0266 3.6862 5.0146l1.0959.4981c2.0423.8718 2.5904 1.3036 2.5904 2.2251 0 .9547-.9216 1.5608-2.3247 1.5608-2.3164.0083-4.1927-1.1789-5.6041-3.2047l-.7822 5.5803C56.0053 19.3423 58.0657 19.992 60.7842 19.992c4.6077 0 7.4389-2.6568 7.4389-6.343 0-2.5072-1.1125-4.1179-3.9188-5.3798l-1.1954-.5645c-1.6605-.7389-2.225-1.1457-2.225-1.9593 0-.88.7721-1.5609 2.2582-1.5609Z"/></svg>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[16px] font-bold text-[#111827] leading-none tracking-tight">$15,000.00</span>
                  <Info size={10} className="text-[#9ca3af]" />
                </div>
                <div className="flex items-center gap-[2px] mt-2">
                  <span className="h-1.5 rounded-full bg-[#4ea87a]" style={{ flexGrow: 16, flexBasis: 0 }} />
                  <span className="h-1.5 rounded-full bg-[#3b82f6]" style={{ flexGrow: 75, flexBasis: 0 }} />
                  <span className="h-1.5 rounded-full bg-[#9fcdf6]" style={{ flexGrow: 9, flexBasis: 0 }} />
                </div>
                <div className="mt-2 space-y-1">
                  {([["Tracked", "$2,400", "#4ea87a"], ["Planned", "$11,250", "#3b82f6"], ["~Projected", "$1,350", "#9fcdf6"]] as const).map(([l, a, c]) => (
                    <div key={l} className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} /><span className="text-[9px] text-[#6b7280]">{l}</span></span>
                      <span className="text-[9px] font-bold text-[#111827]">{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div aria-hidden="true" className="pointer-events-none hidden lg:block absolute -bottom-[14px] left-[-34px] w-[150px] rounded-lg bg-white border border-[#e5e7eb] shadow-[0_12px_30px_-12px_rgba(17,24,39,0.20)] p-2 z-20">
                <p className="text-[11px] font-bold text-[#111827] leading-none">Jun</p>
                <div className="mt-1 space-y-1">
                  {([["Hourly pay", "$73,500", "#59a1f6"], ["Fixed pay", "$42,000", "#a5e6ec"], ["Bonuses", "$19,500", "#a24aff"], ["PTO & Holidays", "$8,000", "#ffe1bf"], ["Additions", "$7,000", "#e499c2"]] as const).map(([l, a, c]) => (
                    <div key={l} className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 min-w-0"><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} /><span className="text-[9px] text-[#6b7280] truncate">{l}</span></span>
                      <span className="text-[9px] font-bold text-[#111827] flex-shrink-0">{a}</span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-[#e5e7eb] my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#6b7280]">Total</span>
                  <span className="text-[9px] font-bold text-[#111827]">$150,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Get set up — 3-step checklist. Header carries the title (no separate label);
            each step has a subtle "Learn more" that opens V3's how-to dialog. */}
        <div data-zone="card" className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden mb-6">
          <div className="flex items-center justify-between gap-3 px-5 h-[52px] border-b border-[#e5e7eb]">
            <p className="text-base font-medium text-[#111827]">Get set up — How to turn this on</p>
            <span className="text-sm text-[#6b7280]">0 of 3 done</span>
          </div>
          {([
            { n: 1, title: "Set members’ pay rates", body: "Add hourly or fixed pay for your members.", learn: "rates", action: <button onClick={e => e.preventDefault()} className={zbtn("outlinePrimary", "sm")}>Set pay rates</button> },
            { n: 2, title: "Set members’ pay periods", body: "Choose weekly, bi-weekly, twice per month, or monthly.", learn: "rates", action: <button onClick={e => e.preventDefault()} className={zbtn("outlinePrimary", "sm")}>Set pay periods</button> },
            { n: 3, title: "Get members tracking time", body: "So we can project hourly and overtime costs.", learn: "tracking", action: <button onClick={e => e.preventDefault()} className={zbtn("outlinePrimary", "sm")}>Start tracking time</button> },
          ]).map((s, i, arr) => (
            <div key={s.n} className={`flex items-center gap-4 px-5 py-4 ${i < arr.length - 1 ? "border-b border-[#f3f4f6]" : ""}`}>
              <span className="w-7 h-7 rounded-full bg-[#0168dd] flex items-center justify-center text-[13px] font-semibold text-white flex-shrink-0">{s.n}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#111827]">{s.title}</p>
                <p className="text-[13px] text-[#6b7280] leading-snug">{s.body} <a href="#" onClick={(e) => { e.preventDefault(); setLearnMore(s.learn as "rates" | "tracking"); }} className="font-medium text-[#6b7280] underline underline-offset-2 hover:text-[#111827] transition-colors">Learn more</a></p>
              </div>
              <div className="flex-shrink-0">{s.action}</div>
            </div>
          ))}
        </div>

        {/* Value banner */}
        <div data-zone="alert" className="relative border rounded-lg flex items-start gap-2 p-3 bg-[#eaf6ff] border-[#0168dd] text-[#0a4b96]">
          <Sparkles size={18} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm leading-snug">Teams that run payroll on Hubstaff <span className="font-semibold">save hours each cycle</span> and stop worrying about failed payments — because they always know what to fund, and when.</p>
        </div>
      </div>
      ) : (<>
      {ver === 1 ? (<>
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* Estimated Payroll — compact empty */}
        <div className="col-span-3 bg-white rounded-lg border border-[#e5e7eb] flex flex-col">
          <div className="px-4 flex items-center border-b bg-white rounded-t-lg h-[60px] border-[#e5e7eb]">
            <p className="text-lg font-medium text-[#111827]">Estimated Payroll <span className="text-[#6b7280] font-normal whitespace-nowrap">· June 2026</span></p>
          </div>
          <div className="px-4 py-8 flex-1 flex flex-col items-center justify-center text-center">
            <img src={ZONE_EMPTY_ILLUSTRATION} alt="" className="w-20 h-auto mb-2.5" aria-hidden="true" />
            <p className="text-lg font-medium text-[#111827] leading-[26px] mb-[5px]">No estimate yet</p>
            <p className="text-sm text-[#4b5563] leading-5">Add pay rates and track time to project your monthly payroll.</p>
          </div>
        </div>
        {fundingCard("col-span-9", true)}
      </div>
      {/* Explore chart — empty */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#e5e7eb] bg-white px-4 h-[60px]">
          <p className="text-lg font-medium text-[#111827]">Explore your payments over time</p>
        </div>
        <FinalSectionEmpty pad="py-14" icon={<TrendingUp size={20} />} title="No trends yet" body="Your month-over-month payroll trend appears here once you have a few completed pay cycles." />
      </div>
      </>) : ver === 2 ? fundingCard("", false) : fundingCard("", false, true)}
      {/* Payment Activity — two tabs, each empty */}
      <div className="pt-2">
        <p className="text-lg font-medium text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-6 border-b border-[#e5e7eb]">
          <button onClick={() => setTab("history")} className={`px-4 py-2.5 text-sm font-medium uppercase tracking-wide border-b-2 transition-colors -mb-px ${tab === "history" ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>Payment History</button>
          <button onClick={() => setTab("future")} className={`px-4 py-2.5 text-sm font-medium uppercase tracking-wide border-b-2 transition-colors -mb-px ${tab === "future" ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>Future Tracked So Far</button>
        </div>
        <div className="bg-white rounded-lg border border-[#e5e7eb]">
          {tab === "history" ? (
            <FinalSectionEmpty icon={<ClipboardList size={20} />} title="No payments yet" body="Once you run your first payroll, every payment shows up here — with full history by member and earning type." />
          ) : (
            <FinalSectionEmpty icon={<Users size={20} />} title="Nothing tracked yet" body="Set pay rates and start tracking time to see projected amounts by member — before they're paid.">
              <div className="flex items-center gap-2 mt-4">
                <button onClick={e => e.preventDefault()} className={zbtn("solidPrimary", "sm")}>Set pay rates</button>
                <button onClick={e => e.preventDefault()} className={zbtn("outlineGray", "sm")}>Start time tracking</button>
              </div>
            </FinalSectionEmpty>
          )}
        </div>
      </div>
      </>)}
      {/* "See an example" — live, non-interactive preview of the filled page */}
      {showExample && (<>
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowExample(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div data-zone="dialog" className="bg-white rounded-xl shadow-2xl w-[980px] max-w-[95vw] max-h-[88vh] flex flex-col pointer-events-auto overflow-hidden">
            <div className="flex items-start justify-between px-5 py-4 border-b border-[#e5e7eb] flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">Here&apos;s how it&apos;ll look with data</h2>
                <p className="text-[12px] text-[#6b7280] mt-0.5">A preview of your Payments report once pay rates and tracked time start flowing in.</p>
              </div>
              <button onClick={() => setShowExample(false)} aria-label="Close preview" className="p-1 rounded-md text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors flex-shrink-0"><X size={18} aria-hidden="true" /></button>
            </div>
            <div className="flex-1 overflow-auto bg-[#f9fafb]">
              <div className="pointer-events-none select-none origin-top-left" style={{ transform: "scale(0.6)", width: "166.6%" }} aria-hidden="true">
                <VersionFinalUI state="filled" showStatusBreakdown={false} seasonalityOn={true} />
              </div>
            </div>
            <div className="flex items-center justify-end px-5 py-3 border-t border-[#e5e7eb] flex-shrink-0">
              <button onClick={() => setShowExample(false)} className={zbtn("solidPrimary", "md")}>Got it</button>
            </div>
          </div>
        </div>
      </>)}
      {/* Per-step "Learn more" how-to dialog — reuses the breakdown-info dialog chrome */}
      {learnMore && (<>
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setLearnMore(null)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div data-zone="dialog" className="bg-white rounded-xl shadow-2xl w-[520px] max-w-full max-h-[85vh] flex flex-col pointer-events-auto">
            <div className="flex items-start justify-between px-5 py-5 flex-shrink-0">
              <div><h2 className="text-lg font-semibold text-[#111827]">{learnMore === "rates" ? "Set pay rates" : "Start tracking time"}</h2></div>
              <button onClick={() => setLearnMore(null)} aria-label="Close" className="p-1 rounded-md text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors flex-shrink-0"><X size={16} aria-hidden="true" /></button>
            </div>
            <div className="px-5 py-2.5 overflow-y-auto">
              {learnMore === "rates" ? (
                <>
                  <p className="text-sm text-[#4b5563] leading-relaxed mb-4">So we can estimate what you&apos;ll owe each cycle, Hubstaff needs to know how much each person earns and how often you pay them.</p>
                  <ol className="space-y-4 text-sm leading-relaxed">
                    <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#f0f5ff] text-[#0168dd] text-[12px] font-semibold flex items-center justify-center flex-shrink-0">1</span><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Open a member</span>Go to <span className="font-medium text-[#111827]">Team → Members</span> and pick someone you pay.</span></li>
                    <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#f0f5ff] text-[#0168dd] text-[12px] font-semibold flex items-center justify-center flex-shrink-0">2</span><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Set their pay rate</span>Add an hourly rate for tracked work, or a fixed amount per pay period.</span></li>
                    <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#f0f5ff] text-[#0168dd] text-[12px] font-semibold flex items-center justify-center flex-shrink-0">3</span><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Set the pay period</span>Choose weekly, bi-weekly, semi-monthly, or monthly — this drives your funding dates.</span></li>
                  </ol>
                  <p className="text-[12px] text-[#9ca3af] leading-snug mt-4">Repeat for everyone you pay. Rates and pay periods can differ per person.</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#4b5563] leading-relaxed mb-4">Projected hourly pay comes from the time your team actually tracks. Once tracking starts, we fill in the hours-based part of each payout as the cycle runs.</p>
                  <ol className="space-y-4 text-sm leading-relaxed">
                    <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#f0f5ff] text-[#0168dd] text-[12px] font-semibold flex items-center justify-center flex-shrink-0">1</span><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Install Hubstaff</span>Have each member add the desktop, mobile, or web app from <span className="font-medium text-[#111827]">Team → Members</span>.</span></li>
                    <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#f0f5ff] text-[#0168dd] text-[12px] font-semibold flex items-center justify-center flex-shrink-0">2</span><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Track to projects</span>Members start the timer while they work; hours sync automatically.</span></li>
                    <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#f0f5ff] text-[#0168dd] text-[12px] font-semibold flex items-center justify-center flex-shrink-0">3</span><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Watch it fill in</span>As hours land, your estimate and funding schedule update through the cycle.</span></li>
                  </ol>
                  <p className="text-[12px] text-[#9ca3af] leading-snug mt-4">Fixed-pay members don&apos;t need to track — their amount is already known from their rate.</p>
                </>
              )}
            </div>
            <div className="flex items-center justify-end px-5 py-5 flex-shrink-0">
              <button onClick={() => setLearnMore(null)} className={zbtn("solidPrimary", "md")}>Got it</button>
            </div>
          </div>
        </div>
      </>)}
    </>
  );
}

function VersionFinalUI({ showStatusBreakdown, seasonalityOn, state = "filled", variant = "final", spillover = null, notSched = false }: { showStatusBreakdown: boolean; seasonalityOn: boolean; state?: "filled" | "initial" | "empty"; variant?: "final" | "mvp" | "mvp2"; spillover?: "yellow" | "red" | "mixed" | null; notSched?: boolean }) {
  // `state` selects which Final UI variant to render. All three are the same content today
  // (copies) — branch on `state` here as the initial/empty states get built out.
  const dense = false;
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  const [futureProvider, setFutureProvider] = useState<string>("all");
  const [futurePeriod, setFuturePeriod] = useState<string>("June 2026");
  const [ftVer, setFtVer] = useState<"v1" | "v2" | "v3">("v3"); // Future Tracked layout version — V3 is the live direction; V1/V2 kept for reference
  const SHOW_FT_VERSION_TOGGLE = false; // toggle hidden; flip to true to compare V1/V2/V3 again
  const [wiseVer, setWiseVer] = useState<0 | 1 | 2 | 3 | 4 | 5>(1); // Wise Interest disclosure — retired (switcher repurposed for off-schedule version)
  const [offSchedVer, setOffSchedVer] = useState<1 | 2>(2); // Off-schedule layout: 1 = card in the funding row, 2 = top-level 25% card (default)
  const [pmtVer, setPmtVer] = useState<1 | 2>(2); // Payments-over-time chart control: 1 = 3/6/12M + stepper, 2 = date-range picker (default)
  const [reportVer, setReportVer] = useState<1 | 2>(1); // Off-schedule strategy: 1 = off-schedule card, 2 = pending in fund-by columns + yellow banner
  const [emptyVer, setEmptyVer] = useState<1 | 2 | 3 | 4 | 5>(5); // Empty-state layout variant — V5 (welcome, bare hero) is the shipped one; V1–V4 kept in code but hidden from the switcher
  const wiseConnected = v1gFundSchedule.some(e => e.providers.some(p => p.id === "wise")); // only surface when Wise is a connected payout method
  const mvp = variant === "mvp" || variant === "mvp2";
  const bState = state; // spillover + not-scheduled are independent overlays (props), not states
  const effWiseVer = mvp ? 1 : wiseVer; // MVP locks the Wise disclosure to treatment 1 (the inline "earn interest" link); the switcher is hidden
  const activityRef = useRef<HTMLDivElement>(null);

  const openFuture = (providerId: string) => {
    setFutureProvider(providerId);
    setFuturePeriod(v1mCurrentPeriod(providerId));
    setBottomTab("future");
    setTimeout(() => activityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return (
    <SpilloverContext.Provider value={spillover}>
    <NotSchedContext.Provider value={notSched}>
    <WiseVerContext.Provider value={0}>
    <OffSchedVerContext.Provider value={offSchedVer}>
    <PmtVerContext.Provider value={pmtVer}>
    <PmtReportVerContext.Provider value={reportVer}>
    <div data-final-state={state} data-offsched-ver={offSchedVer} data-pmt-ver={pmtVer} className="px-6 pb-5 space-y-6 bg-[#f9fafb] min-h-full" style={{ fontFamily: '"Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      {/* Zone page header — real structure from hubstaff-server (shadow-md, sticky, h2 text-2xl font-light) */}
      <header className="bg-white shadow-md sticky top-12 z-20 -mx-6 px-6">
        <div className="flex justify-between items-center h-8 pt-3 pb-4 box-content">
          <h2 className="text-2xl font-light text-[#111827]">Payments report</h2>
          {bState === "empty" || variant === "mvp2" ? null : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af]">Off-schedule</span>
                <div className="flex items-center bg-[#f3f4f6] rounded-lg p-0.5">
                  {([[1, "V1"], [2, "V2"]] as const).map(([v, label]) => (
                    <button key={v} onClick={() => setOffSchedVer(v)} className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${offSchedVer === v ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af]">Payments over Time</span>
                <div className="flex items-center bg-[#f3f4f6] rounded-lg p-0.5">
                  {([[1, "V1"], [2, "V2"]] as const).map(([v, label]) => (
                    <button key={v} onClick={() => setPmtVer(v)} className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${pmtVer === v ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af]">Off-schedule display</span>
                <div className="flex items-center bg-[#f3f4f6] rounded-lg p-0.5">
                  {([[1, "V1"], [2, "V2"]] as const).map(([v, label]) => (
                    <button key={v} onClick={() => setReportVer(v)} className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${reportVer === v ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      {bState === "empty" ? <FinalUIEmptyBody ver={emptyVer} /> : (<>
      <V1gPredictivePanel key={variant} showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} v1i v1j v1k v1l v1m zone condensed={dense} state={bState} variant={variant} onProviderClick={openFuture} />
      <div ref={activityRef} className="pt-2">
        <p className="text-lg font-medium text-[#111827] mb-3">Payment Activity</p>
        <div className="flex items-center justify-between gap-0 mb-6 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-0">
            {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium uppercase tracking-wide border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
            ))}
          </div>
          {SHOW_FT_VERSION_TOGGLE && bottomTab === "future" && (
            <div className="flex w-fit mb-2">
              {(["v1", "v2", "v3"] as const).map(v => (
                <button key={v} onClick={() => setFtVer(v)} className={`h-7 px-3 flex items-center justify-center text-xs font-semibold uppercase tracking-wide border border-l-0 first:border-l border-[#d1d5db] first:rounded-l-[6px] last:rounded-r-[6px] transition-colors ${ftVer === v ? "bg-[#f0f5ff] text-[#0168dd]" : "text-[#6b7280] hover:bg-[#f9fafb]"}`}>{v.toUpperCase()}</button>
              ))}
            </div>
          )}
        </div>
        {bottomTab === "history" ? <V1PaymentHistoryZone /> : <V1mFutureTracked provider={futureProvider} period={futurePeriod} onProviderChange={setFutureProvider} onPeriodChange={setFuturePeriod} grouped zone ftVer={ftVer} mvp={mvp} />}
      </div>
      </>)}
    </div>
    </PmtReportVerContext.Provider>
    </PmtVerContext.Provider>
    </OffSchedVerContext.Provider>
    </WiseVerContext.Provider>
    </NotSchedContext.Provider>
    </SpilloverContext.Provider>
  );
}

// item E — in-1L "team payment, in advance": how the provider's number was built + who's paid.
function V1lFutureDetail({ providerId, onBack }: { providerId: string; onBack: () => void }) {
  const [showHow, setShowHow] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const toggle = (name: string) => setCollapsed(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });

  const cycle = v2Cycles.find(c => c.id === v2CycleForProvider[providerId]) ?? v2Cycles[0];
  const cb = cycle.confirmedBreak, pl = cycle.plannedBreak, pb = cycle.projectedBreak;
  const total = cycle.total;
  const confirmedPct = Math.round((cycle.confirmed / total) * 100);
  const plannedPct   = Math.round((cycle.planned / total) * 100);
  const projectedPct = 100 - confirmedPct - plannedPct;
  const provColor = v2ProviderColors[cycle.provider] ?? "#6b7280";

  // "How we get there" figures for this pay period.
  const typical = Math.round(total / 1.28 / 100) * 100; // ~$8,300
  const adjPct = 28, hcPct = 18, seasonPct = 10, avgMembers = 12;

  // Matrix — earning types × certainty. Deductions subtract; projected is
  // aggregate-only (never per member).
  const ETS = V1L_ETS;
  const isWise = providerId === "wise" || cycle.provider === "Wise";
  const sumRow = (r: V1lRow) => ETS.reduce((s, e) => s + (e === "Deductions" ? -(r[e] ?? 0) : (r[e] ?? 0)), 0);
  const matrixMembers = v1lMatrixMembers.map(m => {
    const cTotal = sumRow(m.confirmed), pTotal = sumRow(m.planned);
    return { ...m, cTotal, pTotal, known: cTotal + pTotal };
  });
  const anyExpanded = matrixMembers.some(m => !collapsed.has(m.name));
  // Authoritative certainty × earning-type totals (shown in the top card, not the table).
  const confirmedCols: Record<V1lEt, number> = isWise ? v1lWiseColTotals.confirmed
    : { Hourly: cb.hourlyTracked, Overtime: cb.overtime, "Fixed pay": 0, "PTO / Holiday": cb.pastPTO, Additions: 0, Deductions: 0 };
  const plannedCols: Record<V1lEt, number> = isWise ? v1lWiseColTotals.planned
    : { Hourly: 0, Overtime: 0, "Fixed pay": pl.fixedPay, "PTO / Holiday": pl.futurePTO, Additions: pl.additions, Deductions: pl.deductions };
  // Earning-type totals across all certainty (projected folds into hourly). Sums to the total.
  const etTotals: Record<V1lEt, number> = {
    Hourly: confirmedCols.Hourly + cycle.projected,
    Overtime: confirmedCols.Overtime + plannedCols.Overtime,
    "Fixed pay": confirmedCols["Fixed pay"] + plannedCols["Fixed pay"],
    "PTO / Holiday": confirmedCols["PTO / Holiday"] + plannedCols["PTO / Holiday"],
    Additions: confirmedCols.Additions + plannedCols.Additions,
    Deductions: confirmedCols.Deductions + plannedCols.Deductions,
  };
  // Pagination — max 10 members per page.
  const PAGE_SIZE = 10;
  const pageCount = Math.max(1, Math.ceil(matrixMembers.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pagedMembers = matrixMembers.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeFrom = matrixMembers.length ? safePage * PAGE_SIZE + 1 : 0;
  const rangeTo = safePage * PAGE_SIZE + pagedMembers.length;

  const th = "text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]";
  const cell = (v: number | undefined, deduction = false) =>
    !v ? <span className="text-[#d1d5db]">—</span>
       : deduction ? <span className="text-[#c0392b]">−{fmt0(v)}</span> : fmt0(v);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      {/* Header — same pattern as Version 2 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#111827] transition-colors"><ArrowLeft size={14} /> Back</button>
          <div className="w-px h-4 bg-[#e5e7eb]" />
          <ProviderLogo id={providerId} size={20} />
          <span className="text-base font-semibold text-[#111827]">{cycle.provider}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs border border-[#e5e7eb] rounded px-3 py-1.5 text-[#111827] hover:bg-[#f9fafb] transition-colors"><Download size={12} /> Export payment</button>
          <button className="flex items-center gap-1.5 text-xs bg-[#0168dd] text-white rounded px-3 py-1.5 hover:bg-[#0057bb] transition-colors"><ExternalLink size={12} /> Go to {cycle.provider}</button>
        </div>
      </div>
      {/* Summary card — the total, broken down by certainty and by earning type */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] px-5 py-4">
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0 min-w-[150px]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">Total projected</p>
            <p className="text-3xl font-bold text-[#111827] tracking-tight mt-0.5">{fmt2(total)}</p>
            <button onClick={() => setShowHow(true)} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0168dd] hover:text-[#0057bb] transition-colors mt-1"><Info size={11} /> How we get there</button>
          </div>
          <div className="flex-1">
            <div className="flex gap-5 text-[10px] mb-1.5">
              <span className="text-emerald-600 font-semibold">Confirmed {fmt2(cycle.confirmed)} ({confirmedPct}%)</span>
              <span className="text-[#0168dd] font-semibold">Planned {fmt2(cycle.planned)} ({plannedPct}%)</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden flex bg-[#f3f4f6]">
              <div className="h-full bg-emerald-500" style={{ width: `${confirmedPct}%` }} />
              <div className="h-full bg-[#0168dd]" style={{ width: `${plannedPct}%` }} />
            </div>
          </div>
          <div className="flex-shrink-0 border-l border-[#e5e7eb] pl-5">
            <div className="space-y-1 text-[11px] text-[#6b7280]">
              <div className="flex items-center gap-1"><CalendarDays size={11} />{cycle.dateRange}</div>
              <div className="flex items-center gap-1"><Users size={11} />{cycle.members} members · {cycle.cycle}</div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#f3f4f6]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-3">By earning type</p>
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {ETS.map(e => (
              <div key={e} className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-wide text-[#6b7280]">{v1lEtLabel[e]}</span>
                <span className="text-[15px] font-bold tabular-nums text-[#111827] mt-1 leading-none">
                  {etTotals[e] ? (e === "Deductions" ? <span className="text-[#c0392b]">−{fmt0(etTotals[e])}</span> : fmt0(etTotals[e])) : <span className="text-[#d1d5db]">—</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Breakdown — matrix: earning types × Confirmed/Planned per member; projected aggregate-only */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e5e7eb]">
          <p className="text-sm font-semibold text-[#111827]">By member <span className="text-[#6b7280] font-normal">— tracked &amp; planned pay, by earning type</span></p>
          <div className="flex items-center gap-3">
            <button onClick={() => setCollapsed(anyExpanded ? new Set(matrixMembers.map(m => m.name)) : new Set())} className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80">{anyExpanded ? "Collapse all" : "Expand all"}</button>
            <span className="w-px h-3.5 bg-[#e5e7eb]" />
            <button className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80"><Filter size={12} /> Filters</button>
            <button className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80"><Columns size={12} /> Columns</button>
            <button className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80"><Download size={12} /> Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[860px]">
          <thead>
            <tr className="border-b border-[#e5e7eb]">
              <th className={`text-left py-2.5 px-5 ${th}`}>Member</th>
              {ETS.map(e => <th key={e} className={`text-right py-2.5 px-3 whitespace-nowrap ${th}`}>{v1lEtLabel[e]}</th>)}
              <th className={`text-right py-2.5 px-5 whitespace-nowrap ${th}`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {pagedMembers.map(m => {
              const open = !collapsed.has(m.name);
              return (
              <Fragment key={m.name}>
                <tr className="border-t border-[#e5e7eb] hover:bg-[#f9fafb] cursor-pointer" onClick={() => toggle(m.name)}>
                  <td className={`${open ? "pt-3 pb-1" : "py-3"} px-5`}>
                    <div className="flex items-center gap-2">
                      <ChevronRight size={13} className={`text-[#9ca3af] transition-transform flex-shrink-0 ${open ? "rotate-90" : ""}`} />
                      <div data-zone="avatar" className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: m.color }}>{m.avatar}</div>
                      <span className="font-semibold text-[#111827]">{m.name}</span>
                    </div>
                  </td>
                  {ETS.map(e => <td key={e} className={`${open ? "pt-3 pb-1" : "py-3"} px-3`} />)}
                  <td className={`${open ? "pt-3 pb-1" : "py-3"} px-5 text-right font-bold text-[#111827] tabular-nums`}>{fmt0(m.known)}</td>
                </tr>
                {open && (
                <>
                <tr>
                  <td className="py-1 px-5 pl-[46px]"><CertaintyLabel status="Confirmed" /></td>
                  {ETS.map(e => (
                    <td key={e} className="py-1 px-3 text-right tabular-nums text-[#4b5563]">
                      {cell(m.confirmed[e], e === "Deductions")}
                      {e === "Hourly" && m.confirmed.Hourly && m.rate && (
                        <div className="text-[10px] text-[#9ca3af] font-normal tabular-nums">${m.rate}/hr · {m.hours}h</div>
                      )}
                    </td>
                  ))}
                  <td className="py-1 px-5 text-right tabular-nums font-medium text-[#111827]">{cell(m.cTotal)}</td>
                </tr>
                <tr>
                  <td className="py-1 pb-3 px-5 pl-[46px]"><CertaintyLabel status="Planned" /></td>
                  {ETS.map(e => <td key={e} className="py-1 pb-3 px-3 text-right tabular-nums text-[#4b5563]">{cell(m.planned[e], e === "Deductions")}</td>)}
                  <td className="py-1 pb-3 px-5 text-right tabular-nums font-medium text-[#111827]">{cell(m.pTotal)}</td>
                </tr>
                </>
                )}
              </Fragment>
              );
            })}
          </tbody>
        </table>
        </div>
        {/* Pagination — max 10 members per page */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#e5e7eb]">
          <span className="text-[11px] text-[#6b7280]">Showing <span className="font-medium text-[#4b5563]">{rangeFrom}–{rangeTo}</span> of {matrixMembers.length} members</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="flex items-center justify-center w-7 h-7 rounded border border-[#e5e7eb] text-[#4b5563] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={14} /></button>
            {Array.from({ length: pageCount }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`w-7 h-7 rounded text-[11px] font-medium transition-colors ${i === safePage ? "bg-[#0168dd] text-white" : "text-[#4b5563] hover:bg-[#f9fafb] border border-[#e5e7eb]"}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={safePage >= pageCount - 1} className="flex items-center justify-center w-7 h-7 rounded border border-[#e5e7eb] text-[#4b5563] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* "How we get there" — for this pay period */}
      {showHow && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowHow(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <div data-zone="dialog" className="bg-white rounded-xl shadow-2xl w-[480px] max-w-full max-h-[85vh] flex flex-col pointer-events-auto">
              <div className="flex items-start justify-between px-5 py-5 flex-shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">How we get there</h2>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">How your {cycle.dateRange.replace(", 2026", "")} {cycle.provider} payment is built.</p>
                </div>
                <button onClick={() => setShowHow(false)} className="p-1 rounded-md text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors flex-shrink-0"><X size={16} /></button>
              </div>
              <div className="px-5 py-2.5 overflow-y-auto space-y-4">
                {/* the math */}
                <div className="flex items-stretch gap-1.5">
                  <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] leading-tight">Typical pay period</p>
                    <p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">{fmt0(typical)}</p>
                    <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">recent monthly avg</p>
                  </div>
                  <span className="flex items-center text-[#9ca3af] font-semibold text-sm flex-shrink-0 px-0.5">+</span>
                  <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] leading-tight">Adjustments</p>
                    <p className="text-base font-bold text-emerald-600 mt-1.5 leading-none tracking-tight">+{adjPct}%</p>
                    <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">headcount + season</p>
                  </div>
                  <span className="flex items-center text-[#9ca3af] font-semibold text-sm flex-shrink-0 px-0.5">=</span>
                  <div className="flex-1 rounded-lg border border-[#bcd4f2] bg-[#f0f6ff] px-2.5 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#0168dd] leading-tight">Projected</p>
                    <p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">{fmt0(total)}</p>
                    <p className="text-xs text-[#6b7280] mt-1.5 leading-tight">this pay period</p>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-[#6b7280] leading-snug">The <span className="font-semibold text-emerald-600">+{adjPct}%</span> comes from trends in your history:</p>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-baseline gap-2 text-[12px]"><span className="font-semibold text-emerald-600 w-10 flex-shrink-0">+{hcPct}%</span><span className="text-[#111827] font-medium flex-shrink-0">Headcount change</span><span className="text-[#6b7280] truncate">· {cycle.members} this cycle vs avg {avgMembers}</span></div>
                    <div className="flex items-baseline gap-2 text-[12px]"><span className="font-semibold text-emerald-600 w-10 flex-shrink-0">+{seasonPct}%</span><span className="text-[#111827] font-medium flex-shrink-0">Seasonality</span><span className="text-[#6b7280] truncate">· June is typically above average</span></div>
                  </div>
                  <p className="text-xs text-[#6b7280] mt-2 leading-snug">Applied on top of your {fmt0(typical)} typical pay period to reach <span className="font-semibold text-[#111827]">{fmt0(total)}</span>.</p>
                </div>
                {/* certainty terminology */}
                <div className="pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-2">What makes up the {fmt0(total)}</p>
                  <ul className="space-y-2 text-sm leading-snug">
                    <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 flex-shrink-0" /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827]">Tracked {fmt0(cycle.confirmed)}</span> — hours already logged. Final.</span></li>
                    <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#0168dd] flex-shrink-0" /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827]">Planned {fmt0(cycle.planned)}</span> — scheduled (PTO/holidays, adjustments, fixed pay). Committed unless cancelled.</span></li>
                  </ul>
                </div>
                <p className="text-sm text-[#9ca3af] leading-snug">{fmt0(total)} is an estimate from your history — not a guaranteed figure. Add a buffer, or <a href="#" onClick={e => e.preventDefault()} className="font-medium text-[#6b7280] underline decoration-dotted decoration-[#d1d5db] underline-offset-2 hover:text-[#111827] transition-colors">see how to improve accuracy</a>.</p>
              </div>
              <div className="flex items-center justify-end px-5 py-5 flex-shrink-0">
                <button onClick={() => setShowHow(false)} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#0168dd] text-white hover:bg-[#0057bb] transition-colors">Done</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// item E for 1M — "Future Tracked So Far": all providers in one filterable view.
function V1mFutureTracked({ provider, period, onProviderChange, onPeriodChange, grouped = false, zone = false, ftVer = "v1", mvp = false }: { provider: string; period: string; onProviderChange: (id: string) => void; onPeriodChange: (label: string) => void; grouped?: boolean; zone?: boolean; ftVer?: "v1" | "v2" | "v3"; mvp?: boolean }) {
  const [showHow, setShowHow] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [provOpen, setProvOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [loading, setLoading] = useState(true); // brief skeleton so a filter change reads as an action
  const [segLens, setSegLens] = useState<"source" | "type">("source"); // breakdown bar lens
  const [showBreakdownInfo, setShowBreakdownInfo] = useState(false); // full breakdown explanation popover
  const toggle = (name: string) => setCollapsed(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
  // Re-load whenever the provider or pay period changes (incl. anchoring from a fund card).
  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 550); return () => clearTimeout(t); }, [provider, period]);

  const ETS = V1L_ETS;
  const isAll = provider === "all";
  // Pay period selection drives a scale fraction over the provider's monthly roster.
  const cycleInfo = v1mProviderCycles[provider] ?? v1mProviderCycles.all;
  const periods = cycleInfo.periods;
  const activePeriod = periods.find(p => p.label === period) ?? periods.find(p => p.label === v1mCurrentPeriod(provider)) ?? periods[periods.length - 1];
  const weightSum = periods.reduce((s, p) => s + p.weight, 0);
  const frac = isAll ? 1 : activePeriod.weight / weightSum;
  const scaleRow = (r: V1lRow): V1lRow => { const o: V1lRow = {}; ETS.forEach(e => { const v = r[e]; if (v) o[e] = Math.round(v * frac); }); return o; };

  const baseMembers = isAll ? v1mFutureMembers : v1mFutureMembers.filter(m => m.provider === provider);
  const scaled = baseMembers.map(m => frac === 1 ? m : ({ ...m, confirmed: scaleRow(m.confirmed), planned: scaleRow(m.planned), hours: m.hours != null ? Math.round(m.hours * frac) : m.hours }));
  // Tracked-so-far: only part of each member's hourly is logged yet; the rest becomes the
  // aggregate Projected slice (remaining hours). Total = Confirmed + Planned + Projected.
  const PCT_TRACKED = 0.62;
  let projected = 0;
  const members = scaled.map(m => {
    const fullH = m.confirmed.Hourly ?? 0;
    if (!fullH) return m;
    const tracked = Math.round(fullH * PCT_TRACKED);
    projected += fullH - tracked;
    return { ...m, confirmed: { ...m.confirmed, Hourly: tracked }, hours: m.hours != null ? Math.round(m.hours * PCT_TRACKED) : m.hours };
  });
  const sumRow = (r: V1lRow) => ETS.reduce((s, e) => s + (e === "Deductions" ? -(r[e] ?? 0) : (r[e] ?? 0)), 0);
  const rows = members.map(m => { const cTotal = sumRow(m.confirmed), pTotal = sumRow(m.planned); return { ...m, cTotal, pTotal, known: cTotal + pTotal }; });
  const confirmedCols = {} as Record<V1lEt, number>;
  const plannedCols = {} as Record<V1lEt, number>;
  ETS.forEach(e => { confirmedCols[e] = members.reduce((s, m) => s + (m.confirmed[e] ?? 0), 0); plannedCols[e] = members.reduce((s, m) => s + (m.planned[e] ?? 0), 0); });
  const confirmed = ETS.reduce((s, e) => s + (e === "Deductions" ? -confirmedCols[e] : confirmedCols[e]), 0);
  const planned = ETS.reduce((s, e) => s + (e === "Deductions" ? -plannedCols[e] : plannedCols[e]), 0);
  const total = confirmed + planned + projected; // forecast = tracked + scheduled + remaining
  const confirmedPct = total ? Math.round(confirmed / total * 100) : 0;
  const plannedPct = total ? Math.round(planned / total * 100) : 0;
  const projectedPct = Math.max(0, 100 - confirmedPct - plannedPct);
  // "By earning type" is the forecast by type, so Hourly carries the projected (remaining) hours.
  const etTotals = {} as Record<V1lEt, number>;
  ETS.forEach(e => { etTotals[e] = confirmedCols[e] + plannedCols[e] + (e === "Hourly" ? projected : 0); });
  const anyExpanded = rows.some(m => !collapsed.has(m.name));

  // Breakdown-bar lenses (this period's total, not a time series)
  const sourceSegs = [
    { label: zone ? "Tracked" : "Confirmed", value: confirmed, color: zone ? withAlpha("#0e9f6e", 0.8) : "#0e9f6e" },
    { label: "Planned",     value: planned,   color: zone ? withAlpha("#0168dd", 0.8) : "#0168dd" },
    { label: "~Projected",  value: projected, color: zone ? withAlpha("#7fcaff", 0.7) : "#85baf5", striped: !zone },
  ].filter(s => s.value > 0);
  const etSegColor: Record<string, string> = { "Fixed pay": "#6366f1", Hourly: "#0168dd", "PTO / Holiday": "#38bdf8", Additions: "#0e9f6e", Overtime: "#f59e0b" };
  const typeOrder = ["Fixed pay", "Hourly", "PTO / Holiday", "Additions", "Overtime"] as const;
  const typePositives = typeOrder.map(k => ({ label: v1lEtLabel[k], value: etTotals[k] ?? 0, color: etSegColor[k] })).filter(s => s.value > 0);
  const typeGross = typePositives.reduce((s, x) => s + x.value, 0);
  const typeDeductions = etTotals["Deductions"] ?? 0;
  const typeTrack = typeGross + typeDeductions;

  const typical = Math.round(total / 1.28 / 100) * 100;
  const adjPct = 28, hcPct = 18, seasonPct = 10;
  const provName = isAll ? `All payout methods (${v1mFutureProviderList.length - 1})` : (v1mFutureProviderList.find(p => p.id === provider)?.name ?? "");

  const PAGE = 10;
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = rows.slice(safePage * PAGE, safePage * PAGE + PAGE);
  const rangeFrom = rows.length ? safePage * PAGE + 1 : 0;
  const rangeTo = safePage * PAGE + paged.length;

  const th = "text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]";
  const cell = (v: number | undefined, deduction = false) => !v ? <span className="text-[#d1d5db]">—</span> : deduction ? <span className="text-[#c0392b]">−{fmt0(v)}</span> : fmt0(v);
  const selectProvider = (id: string) => { onProviderChange(id); onPeriodChange(v1mCurrentPeriod(id)); setProvOpen(false); setPage(0); };

  return (
    <div className="space-y-4">
      {ftVer === "v1" ? (
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-end gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1.5">Payment method</p>
            <div className="relative">
              <button onClick={() => { setProvOpen(o => !o); setPeriodOpen(false); }} className="flex items-center justify-between gap-2 text-sm border border-[#e5e7eb] rounded-md h-10 px-3.5 bg-white text-[#111827] hover:bg-[#f9fafb] transition-colors min-w-[190px]"><span className="flex items-center gap-2">{!isAll && <ProviderLogo id={provider} size={16} />} {provName}</span> <ChevronDown size={14} className="text-[#6b7280]" /></button>
              {provOpen && (<>
                <div className="fixed inset-0 z-20" onClick={() => setProvOpen(false)} />
                <div className="absolute left-0 mt-1 z-30 bg-white border border-[#e5e7eb] rounded-lg shadow-lg py-1 min-w-[210px]">
                  {v1mFutureProviderList.map(p => <button key={p.id} onClick={() => selectProvider(p.id)} className={`w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:bg-[#f9fafb] ${p.id === provider ? "text-[#0168dd] font-medium" : "text-[#111827]"}`}>{p.id !== "all" ? <ProviderLogo id={p.id} size={14} /> : <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#0168dd,#85baf5)" }} />}{p.name}</button>)}
                </div>
              </>)}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1.5">Pay period</p>
            <div className="relative">
              <button onClick={() => { setPeriodOpen(o => !o); setProvOpen(false); }} className="flex items-center justify-between gap-2 text-sm border border-[#e5e7eb] rounded-md h-10 px-3.5 bg-white text-[#111827] hover:bg-[#f9fafb] transition-colors min-w-[190px]"><span className="flex items-center gap-2">{activePeriod.label}</span> <ChevronDown size={14} className="text-[#6b7280]" /></button>
              {periodOpen && (<>
                <div className="fixed inset-0 z-20" onClick={() => setPeriodOpen(false)} />
                <div className="absolute left-0 mt-1 z-30 bg-white border border-[#e5e7eb] rounded-lg shadow-lg py-1 min-w-[210px]">
                  <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">{cycleInfo.cycle} pay periods</p>
                  {periods.map(p => <button key={p.label} onClick={() => { onPeriodChange(p.label); setPeriodOpen(false); setPage(0); }} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[#f9fafb] ${p.label === activePeriod.label ? "text-[#0168dd] font-medium" : "text-[#111827]"}`}>{p.label}</button>)}
                </div>
              </>)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!mvp && <button className={zone ? zbtn("outlineGray", "md") : "flex items-center gap-1.5 text-xs border border-[#e5e7eb] rounded px-3 py-2 text-[#111827] hover:bg-[#f9fafb] transition-colors"}><Download size={zone ? 16 : 12} /> Export</button>}
          {!isAll && <button className={zone ? zbtn("solidPrimary", "md") : "flex items-center gap-1.5 text-xs bg-[#0168dd] text-white rounded px-3 py-2 hover:bg-[#0057bb] transition-colors"}><ExternalLink size={zone ? 16 : 12} /> Go to {provName}</button>}
        </div>
      </div>
      ) : ftVer === "v2" ? (
      <div className="bg-white rounded-t-lg border border-[#e5e7eb] flex items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-medium text-[#111827]">Projected so far</p>
          <span className="text-lg text-[#9ca3af]">:</span>
          <p className="text-2xl font-bold text-[#111827] tracking-tight">{fmt2(total)}</p>
          <button onClick={() => setShowHow(true)} className={zbtn("ghostGray", "sm", "self-center ml-1")}><Info size={16} /> How we get there</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button data-zone="select" onClick={() => { setProvOpen(o => !o); setPeriodOpen(false); }} className="flex items-center justify-between gap-2 text-sm border border-[#d1d5db] rounded-[6px] h-8 px-3 bg-white text-[#111827] hover:bg-[#f9fafb] transition-colors min-w-[150px]"><span className="flex items-center gap-2">{!isAll && <ProviderLogo id={provider} size={16} />} {provName}</span> <ChevronDown size={14} className="text-[#6b7280]" /></button>
            {provOpen && (<>
              <div className="fixed inset-0 z-20" onClick={() => setProvOpen(false)} />
              <div className="absolute right-0 mt-1 z-30 bg-white border border-[#e5e7eb] rounded-lg shadow-lg py-1 min-w-[210px]">
                {v1mFutureProviderList.map(p => <button key={p.id} onClick={() => selectProvider(p.id)} className={`w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:bg-[#f9fafb] ${p.id === provider ? "text-[#0168dd] font-medium" : "text-[#111827]"}`}>{p.id !== "all" ? <ProviderLogo id={p.id} size={14} /> : <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#0168dd,#85baf5)" }} />}{p.name}</button>)}
              </div>
            </>)}
          </div>
          <div className="relative">
            <button data-zone="select" onClick={() => { setPeriodOpen(o => !o); setProvOpen(false); }} className="flex items-center justify-between gap-2 text-sm border border-[#d1d5db] rounded-[6px] h-8 px-3 bg-white text-[#111827] hover:bg-[#f9fafb] transition-colors min-w-[140px]"><span>{activePeriod.label}</span> <ChevronDown size={14} className="text-[#6b7280]" /></button>
            {periodOpen && (<>
              <div className="fixed inset-0 z-20" onClick={() => setPeriodOpen(false)} />
              <div className="absolute right-0 mt-1 z-30 bg-white border border-[#e5e7eb] rounded-lg shadow-lg py-1 min-w-[210px]">
                <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">{cycleInfo.cycle} pay periods</p>
                {periods.map(p => <button key={p.label} onClick={() => { onPeriodChange(p.label); setPeriodOpen(false); setPage(0); }} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[#f9fafb] ${p.label === activePeriod.label ? "text-[#0168dd] font-medium" : "text-[#111827]"}`}>{p.label}</button>)}
              </div>
            </>)}
          </div>
          {!mvp && <button className={zbtn("outlineGray", "sm")}><Download size={16} /> Export</button>}
        </div>
      </div>
      ) : (
      <div className="bg-white rounded-t-lg border border-[#e5e7eb] flex items-center justify-between gap-3 px-5 h-[60px]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button data-zone="select" onClick={() => { setProvOpen(o => !o); setPeriodOpen(false); }} className="flex items-center justify-between gap-2 text-sm border border-[#d1d5db] rounded-[6px] h-8 px-3 bg-white text-[#111827] hover:bg-[#f9fafb] transition-colors min-w-[150px]"><span className="flex items-center gap-2">{!isAll && <ProviderLogo id={provider} size={16} />} {provName}</span> <ChevronDown size={14} className="text-[#6b7280]" /></button>
            {provOpen && (<>
              <div className="fixed inset-0 z-20" onClick={() => setProvOpen(false)} />
              <div className="absolute left-0 mt-1 z-30 bg-white border border-[#e5e7eb] rounded-lg shadow-lg py-1 min-w-[210px]">
                {v1mFutureProviderList.map(p => <button key={p.id} onClick={() => selectProvider(p.id)} className={`w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:bg-[#f9fafb] ${p.id === provider ? "text-[#0168dd] font-medium" : "text-[#111827]"}`}>{p.id !== "all" ? <ProviderLogo id={p.id} size={14} /> : <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#0168dd,#85baf5)" }} />}{p.name}</button>)}
              </div>
            </>)}
          </div>
          <div className="relative">
            <button data-zone="select" onClick={() => { setPeriodOpen(o => !o); setProvOpen(false); }} className="flex items-center justify-between gap-2 text-sm border border-[#d1d5db] rounded-[6px] h-8 px-3 bg-white text-[#111827] hover:bg-[#f9fafb] transition-colors min-w-[140px]"><span><span className="text-[#6b7280]">Pay period:</span> {activePeriod.label}</span> <ChevronDown size={14} className="text-[#6b7280]" /></button>
            {periodOpen && (<>
              <div className="fixed inset-0 z-20" onClick={() => setPeriodOpen(false)} />
              <div className="absolute left-0 mt-1 z-30 bg-white border border-[#e5e7eb] rounded-lg shadow-lg py-1 min-w-[210px]">
                <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">{cycleInfo.cycle} pay periods</p>
                {periods.map(p => <button key={p.label} onClick={() => { onPeriodChange(p.label); setPeriodOpen(false); setPage(0); }} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[#f9fafb] ${p.label === activePeriod.label ? "text-[#0168dd] font-medium" : "text-[#111827]"}`}>{p.label}</button>)}
              </div>
            </>)}
          </div>
        </div>
        {!mvp && <button className={zbtn("outlineGray", "sm")}><Download size={16} /> Export</button>}
      </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="bg-white rounded-lg border border-[#e5e7eb] px-5 py-4">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 min-w-[150px] space-y-2"><div className="h-2.5 w-24 rounded bg-[#f3f4f6]" /><div className="h-8 w-40 rounded bg-[#e5e7eb]" /><div className="h-2.5 w-28 rounded bg-[#f3f4f6]" /></div>
              <div className="flex-1"><div className="h-2.5 rounded-full bg-[#f3f4f6]" /></div>
              <div className="flex-shrink-0 border-l border-[#e5e7eb] pl-5 space-y-2"><div className="h-2.5 w-20 rounded bg-[#f3f4f6]" /><div className="h-2.5 w-24 rounded bg-[#f3f4f6]" /></div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#f3f4f6] flex flex-wrap gap-x-10 gap-y-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="space-y-1.5"><div className="h-2 w-14 rounded bg-[#f3f4f6]" /><div className="h-4 w-16 rounded bg-[#e5e7eb]" /></div>)}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-[#e5e7eb] px-5 py-5 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-[#f3f4f6] flex-shrink-0" /><div className="h-3 w-40 rounded bg-[#f3f4f6]" /><div className="ml-auto h-3 w-16 rounded bg-[#f3f4f6]" /></div>)}
          </div>
        </div>
      ) : (<>
      {/* Summary card */}
      <div className={`bg-white border border-[#e5e7eb] px-5 py-5 ${ftVer !== "v1" ? "-mt-4 rounded-none border-t-0" : "rounded-lg"}`}>
        <div className="flex items-start gap-6">
          <div className={`flex-shrink-0 ${ftVer !== "v1" ? "hidden" : ""}`}>
            <p className={zone ? "text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]" : "text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]"}>Total projected</p>
            <p className="text-2xl font-bold text-[#111827] tracking-tight mt-0.5">{fmt2(total)}</p>
            <button onClick={() => setShowHow(true)} className={zone ? zbtn("ghostGray", "sm", "mt-1") : "inline-flex items-center gap-1 text-[11px] font-medium text-[#6b7280] hover:text-[#111827] transition-colors mt-1"}><Info size={zone ? 16 : 11} /> How we get there</button>
          </div>
          <div className={`flex-1 min-w-0 ${ftVer !== "v1" ? "" : "border-l border-[#f3f4f6] pl-6"}`}>
            {zone ? (
            /* Breakdown header — label + description stacked (left column), segmented control (right), top-aligned */
            <div className="flex items-start justify-between gap-6 mb-2">
              <div className="flex flex-col gap-1 min-w-0">
                {ftVer === "v3" ? (<>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">Total projected</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-[#111827] tracking-tight leading-none">{fmt2(total)}</p>
                    <button onClick={() => setShowHow(true)} title="How we get there" aria-label="How we get there" className={`${ZBTN_BASE} h-7 w-7 ${ZBTN_VARIANT.ghostGray} self-center`}><Info size={16} /></button>
                  </div>
                </>) : (<>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">Breakdown</p>
                  <p className="text-sm text-[#6b7280] leading-snug">
                    {segLens === "source" ? "Tracked is confirmed, Planned is scheduled, and Projected is the estimated hours still to be tracked." : "What the payout is made of — e.g. fixed and hourly pay, PTO, and more."}{" "}
                    <a href="#" onClick={(e) => { e.preventDefault(); setShowBreakdownInfo(true); }} className="font-medium underline underline-offset-2 hover:text-[#111827] transition-colors select-none">Learn more</a>
                  </p>
                </>)}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {!mvp && (
                <div className="flex w-fit">
                  {([["source","Tracked vs. projected"],["type","Payroll breakdown"]] as const).map(([k, label]) => (
                    <button key={k} onClick={() => setSegLens(k)} className={`h-8 px-3 flex items-center justify-center whitespace-nowrap text-sm overflow-hidden transition-colors border border-l-0 first:border-l border-[#d1d5db] first:rounded-l-[6px] last:rounded-r-[6px] ${segLens === k ? "bg-[#f0f5ff] text-[#0168dd] font-medium" : "text-[#374151] font-normal hover:bg-[#f9fafb]"}`}>{label}</button>
                  ))}
                </div>
                )}
                {ftVer === "v3" && !mvp && (
                  <p className="text-[11px] text-[#6b7280] leading-snug text-right whitespace-nowrap">
                    {segLens === "source" ? "Tracked is confirmed, Planned is scheduled, and Projected is the estimated hours still to be tracked." : "The pay types that make up each payout — hourly, fixed pay, PTO, and more."}{" "}
                    <a href="#" onClick={(e) => { e.preventDefault(); setShowBreakdownInfo(true); }} className="font-medium underline underline-offset-2 hover:text-[#111827] transition-colors select-none">Learn more</a>
                  </p>
                )}
              </div>
            </div>
            ) : (<>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">Breakdown</p>
              <div className="flex bg-[#f3f4f6] rounded-md p-0.5">
                {([["source","Tracked vs. projected"],["type","Payroll breakdown"]] as const).map(([k, label]) => (
                  <button key={k} onClick={() => setSegLens(k)} className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${segLens === k ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>{label}</button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[#6b7280] leading-snug mb-3">
              {segLens === "source" ? "Tracked is confirmed, Planned is scheduled, and Projected is the estimated hours still to be tracked." : "What the payout is made of — e.g. fixed and hourly pay, PTO, and more."}{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setShowBreakdownInfo(true); }} className="font-medium underline underline-offset-2 hover:text-[#111827] transition-colors select-none">Learn more</a>
            </p>
            </>)}
            {segLens === "source" ? (<>
            {/* Certainty bar — ordered most→least certain, with a "confirmed so far" frontier
                that grows rightward as the period fills (Tracked replaces Projected over time). */}
            <div className="relative pt-4">
              <div className="relative h-3 rounded-full overflow-hidden flex bg-[#f3f4f6]">
                {sourceSegs.map((s, i) => <div key={s.label} className="h-full" title={`${s.label} ${fmt0(s.value)}`} style={{ width: `${Math.round(s.value / total * 100)}%`, background: s.striped ? "repeating-linear-gradient(90deg,#85baf5 0px,#85baf5 5px,#bfdbfe 5px,#bfdbfe 9px)" : s.color, marginRight: i < sourceSegs.length - 1 ? 1 : 0 }} />)}
              </div>
              <div className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none" style={{ left: `${Math.min(confirmedPct, 96)}%` }}>
                <span className="text-[9px] font-semibold text-[#0e9f6e] leading-none whitespace-nowrap">{confirmedPct}% confirmed</span>
                <span className="material-symbols-rounded text-[#0e9f6e] leading-none" style={{ fontSize: 12, marginTop: -1 }}>arrow_drop_down</span>
              </div>
            </div>
            <div className="flex items-start justify-between gap-6 mt-3">
              <div className="flex flex-wrap gap-x-6 gap-y-2 flex-1 min-w-0">
                {sourceSegs.map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.striped ? "repeating-linear-gradient(45deg,#85baf5 0,#85baf5 3px,#bfdbfe 3px,#bfdbfe 5px)" : s.color }} />
                    <span className="text-[#6b7280]">{s.label}</span>
                    <span className="font-semibold text-[#111827] tabular-nums">{fmt0(s.value)}</span>
                    {v1SourceLegendInfo[s.label] && <InfoTip text={v1SourceLegendInfo[s.label]} />}
                  </div>
                ))}
              </div>
              {mvp && (
                <p className="text-[11px] text-[#6b7280] leading-snug text-right whitespace-nowrap flex-shrink-0">
                  Tracked is confirmed, Planned is scheduled, and Projected is the estimated hours still to be tracked.{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowBreakdownInfo(true); }} className="font-medium underline underline-offset-2 hover:text-[#111827] transition-colors select-none">Learn more</a>
                </p>
              )}
            </div>
          </>) : (<>
            <div className="h-3 rounded-full overflow-hidden flex bg-[#f3f4f6]">
              {typePositives.map(s => <div key={s.label} className="h-full" title={`${s.label} ${fmt0(s.value)}`} style={{ width: `${s.value / typeTrack * 100}%`, minWidth: 4, background: s.color, marginRight: 1 }} />)}
              {typeDeductions > 0 && <div className="h-full" title={`Deductions −${fmt0(typeDeductions)} (removed from gross)`} style={{ width: `${typeDeductions / typeTrack * 100}%`, minWidth: 4, background: "#ef4444" }} />}
            </div>
            <div className="flex items-start justify-between gap-6 mt-3">
              <div className="flex flex-wrap gap-x-6 gap-y-2 flex-1 min-w-0">
                {typePositives.map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-[#6b7280]">{s.label}</span>
                    <span className="font-semibold text-[#111827] tabular-nums">{fmt0(s.value)}</span>
                  </div>
                ))}
                {typeDeductions > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: "#ef4444" }} />
                    <span className="text-[#6b7280]">Deductions</span>
                    <span className="font-semibold text-[#c0392b] tabular-nums">−{fmt0(typeDeductions)}</span>
                  </div>
                )}
              </div>
            </div>
          </>)}
          </div>
        </div>
      </div>

      {/* By-member matrix */}
      <div className={`bg-white border border-[#e5e7eb] overflow-hidden ${ftVer !== "v1" ? "-mt-4 rounded-b-lg border-t-0" : "rounded-lg"}`}>
        {zone ? (
        /* Zone table toolbar — Filters (bordered, left) · Columns (icon-only, right) */
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <div className="grow md:grow-0">
              <div className="relative">
                <span className="material-symbols-rounded absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{ fontSize: 18 }}>search</span>
                <input data-zone="text_field" type="text" name="q" placeholder="Search" className="w-full md:min-w-56 h-8 rounded-[6px] border border-gray-300 bg-white pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#2aa7ff] focus:ring-1 focus:ring-[#2aa7ff]" />
              </div>
            </div>
            <button className={zbtn("outlineGray", "sm")}><ListFilter size={16} /> Filters</button>
          </div>
          {!mvp && <button data-zone="dropdown" aria-label="Columns" title="Columns" className={`${ZBTN_BASE} h-8 w-8 ${ZBTN_VARIANT.outlineGray}`}><Columns3 size={16} /></button>}
        </div>
        ) : (
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-b border-[#e5e7eb]">
          {!grouped && <>
            <button onClick={() => setCollapsed(anyExpanded ? new Set(rows.map(m => m.name)) : new Set())} className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80">{anyExpanded ? "Collapse all" : "Expand all"}</button>
            <span className="w-px h-3.5 bg-[#e5e7eb]" />
          </>}
          <button className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80"><Filter size={12} /> Filters</button>
          <button className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80"><Columns size={12} /> Columns</button>
        </div>
        )}
        <div className="overflow-x-auto">
        {grouped ? (
        <table data-zone="data_table" className={zone ? "w-full text-sm border-separate border-spacing-0 min-w-[1020px]" : "w-full text-xs min-w-[1020px]"}>
          <thead>
            <tr>
              {zone && !mvp && <th rowSpan={2} className="w-0 px-3 py-2.5 border-r border-[#e5e7eb] bg-[#f9fafb] align-bottom"><input data-zone="checkbox" type="checkbox" className="appearance-none shrink-0 w-3.5 h-3.5 rounded-[4px] border border-[#d1d5db] bg-white align-middle relative cursor-pointer checked:bg-[#2aa7ff] checked:border-[#2aa7ff] after:content-[''] after:absolute after:left-1/2 after:top-[45%] after:-translate-x-1/2 after:-translate-y-1/2 after:w-[4px] after:h-[7px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45" /></th>}
              <th rowSpan={2} className={zone ? "px-3 py-2.5 border-r border-[#e5e7eb] bg-[#f9fafb] text-[#1f2937] text-sm font-semibold text-left align-bottom min-w-[200px]" : `text-left py-2.5 px-5 align-bottom ${th}`}>Member</th>
              <th rowSpan={2} className={zone ? "px-3 py-2.5 border-r border-[#e5e7eb] bg-[#f9fafb] text-[#1f2937] text-sm font-semibold text-left align-bottom whitespace-nowrap" : `text-left py-2.5 px-3 whitespace-nowrap align-bottom ${th}`}>Payment method</th>
              <th colSpan={2} className={zone ? "px-3 py-2.5 border-r border-b border-[#e5e7eb] bg-[#f9fafb] text-[#0e9f6e] text-sm font-semibold text-center" : `text-center py-2 px-3 border-l border-[#e5e7eb] ${th} text-emerald-600`}>Tracked</th>
              <th colSpan={4} className={zone ? "px-3 py-2.5 border-r border-b border-[#e5e7eb] bg-[#f9fafb] text-[#0168dd] text-sm font-semibold text-center" : `text-center py-2 px-3 border-l border-[#e5e7eb] ${th} text-[#0168dd]`}>Planned</th>
              <th rowSpan={2} className={zone ? "px-3 py-2.5 border-[#e5e7eb] bg-[#f9fafb] text-[#1f2937] text-sm font-semibold text-left align-bottom whitespace-nowrap" : `text-right py-2.5 px-5 whitespace-nowrap align-bottom border-l border-[#e5e7eb] ${th}`}>Total</th>
            </tr>
            <tr className={zone ? "" : "border-b border-[#e5e7eb]"}>
              <th className={zone ? "px-3 py-2.5 border-r border-[#e5e7eb] bg-[#f9fafb] text-[#1f2937] text-sm font-semibold text-left whitespace-nowrap" : `text-right py-2 px-3 whitespace-nowrap border-l border-[#e5e7eb] ${th}`}>{v1lEtLabel["Hourly"]}</th>
              <th className={zone ? "px-3 py-2.5 border-r border-[#e5e7eb] bg-[#f9fafb] text-[#1f2937] text-sm font-semibold text-left whitespace-nowrap" : `text-right py-2 px-3 whitespace-nowrap ${th}`}>{v1lEtLabel["Overtime"]}</th>
              <th className={zone ? "px-3 py-2.5 border-r border-[#e5e7eb] bg-[#f9fafb] text-[#1f2937] text-sm font-semibold text-left whitespace-nowrap" : `text-right py-2 px-3 whitespace-nowrap border-l border-[#e5e7eb] ${th}`}>{v1lEtLabel["Fixed pay"]}</th>
              <th className={zone ? "px-3 py-2.5 border-r border-[#e5e7eb] bg-[#f9fafb] text-[#1f2937] text-sm font-semibold text-left whitespace-nowrap" : `text-right py-2 px-3 whitespace-nowrap ${th}`}>{v1lEtLabel["PTO / Holiday"]}</th>
              <th className={zone ? "px-3 py-2.5 border-r border-[#e5e7eb] bg-[#f9fafb] text-[#1f2937] text-sm font-semibold text-left whitespace-nowrap" : `text-right py-2 px-3 whitespace-nowrap ${th}`}>{v1lEtLabel["Additions"]}</th>
              <th className={zone ? "px-3 py-2.5 border-r border-[#e5e7eb] bg-[#f9fafb] text-[#1f2937] text-sm font-semibold text-left whitespace-nowrap" : `text-right py-2 px-3 whitespace-nowrap ${th}`}>{v1lEtLabel["Deductions"]}</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(m => (
              <tr key={m.name} className={zone ? "group/row h-12 [&>td]:align-middle" : "border-t border-[#e5e7eb] hover:bg-[#f9fafb]"}>
                {zone && !mvp && <td className="w-0 px-3 py-2 border-r border-t border-[#e5e7eb] group-hover/row:bg-[#f9fafb] align-middle"><input data-zone="checkbox" type="checkbox" className="appearance-none shrink-0 w-3.5 h-3.5 rounded-[4px] border border-[#d1d5db] bg-white align-middle relative cursor-pointer checked:bg-[#2aa7ff] checked:border-[#2aa7ff] after:content-[''] after:absolute after:left-1/2 after:top-[45%] after:-translate-x-1/2 after:-translate-y-1/2 after:w-[4px] after:h-[7px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45" /></td>}
                <td className={zone ? "px-3 py-2 border-r border-t border-[#e5e7eb] group-hover/row:bg-[#f9fafb]" : "py-3 px-5"}>
                  <div className="flex items-center gap-2">
                    <div data-zone="avatar" className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: m.color }}>{m.avatar}</div>
                    <span className={zone ? "text-[#2aa7ff] text-sm hover:underline cursor-pointer" : "font-semibold text-[#111827]"}>{m.name}</span>
                  </div>
                </td>
                <td className={zone ? "px-3 py-2 border-r border-t border-[#e5e7eb] group-hover/row:bg-[#f9fafb]" : "py-3 px-3"}><span className={zone ? "inline-flex items-center gap-1.5 text-[#4b5563] text-xs whitespace-nowrap" : "inline-flex items-center gap-1.5 text-[#4b5563] whitespace-nowrap"}><ProviderLogo id={m.provider} size={14} />{v1gProviderMeta[m.provider]?.name ?? m.provider}</span></td>
                <td className={zone ? "px-3 py-2 border-r border-t border-[#e5e7eb] text-left tabular-nums text-[#111827] text-sm group-hover/row:bg-[#f9fafb]" : "py-3 px-3 text-right tabular-nums text-[#4b5563] border-l border-[#f3f4f6]"}>
                  {cell(m.confirmed["Hourly"])}
                  {m.confirmed["Hourly"] && m.rate && (<div className={zone ? "text-xs text-[#6b7280] font-normal tabular-nums" : "text-[10px] text-[#9ca3af] font-normal tabular-nums"}>${m.rate}/hr · {m.hours}h</div>)}
                </td>
                <td className={zone ? "px-3 py-2 border-r border-t border-[#e5e7eb] text-left tabular-nums text-[#111827] text-sm group-hover/row:bg-[#f9fafb]" : "py-3 px-3 text-right tabular-nums text-[#4b5563]"}>{cell(m.confirmed["Overtime"])}</td>
                <td className={zone ? "px-3 py-2 border-r border-t border-[#e5e7eb] text-left tabular-nums text-[#111827] text-sm group-hover/row:bg-[#f9fafb]" : "py-3 px-3 text-right tabular-nums text-[#4b5563] border-l border-[#f3f4f6]"}>{cell(m.planned["Fixed pay"])}</td>
                <td className={zone ? "px-3 py-2 border-r border-t border-[#e5e7eb] text-left tabular-nums text-[#111827] text-sm group-hover/row:bg-[#f9fafb]" : "py-3 px-3 text-right tabular-nums text-[#4b5563]"}>{cell(m.planned["PTO / Holiday"])}</td>
                <td className={zone ? "px-3 py-2 border-r border-t border-[#e5e7eb] text-left tabular-nums text-[#111827] text-sm group-hover/row:bg-[#f9fafb]" : "py-3 px-3 text-right tabular-nums text-[#4b5563]"}>{cell(m.planned["Additions"])}</td>
                <td className={zone ? "px-3 py-2 border-r border-t border-[#e5e7eb] text-left tabular-nums text-[#111827] text-sm group-hover/row:bg-[#f9fafb]" : "py-3 px-3 text-right tabular-nums text-[#4b5563]"}>{cell(m.planned["Deductions"], true)}</td>
                <td className={zone ? "px-3 py-2 border-t border-[#e5e7eb] text-left font-semibold text-[#111827] text-sm tabular-nums group-hover/row:bg-[#f9fafb]" : "py-3 px-5 text-right font-bold text-[#111827] tabular-nums border-l border-[#f3f4f6]"}>{fmt0(m.known)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        ) : (
        <table className="w-full text-xs min-w-[1020px]">
          <thead>
            <tr className="border-b border-[#e5e7eb]">
              <th className={`text-left py-2.5 px-5 ${th}`}>Member</th>
              <th className={`text-left py-2.5 px-3 whitespace-nowrap ${th}`}>Payment method</th>
              {ETS.map(e => <th key={e} className={`text-right py-2.5 px-3 whitespace-nowrap ${th}`}>{v1lEtLabel[e]}</th>)}
              <th className={`text-right py-2.5 px-5 whitespace-nowrap ${th}`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(m => {
              const open = !collapsed.has(m.name);
              return (
              <Fragment key={m.name}>
                <tr className="border-t border-[#e5e7eb] hover:bg-[#f9fafb] cursor-pointer" onClick={() => toggle(m.name)}>
                  <td className={`${open ? "pt-3 pb-1" : "py-3"} px-5`}>
                    <div className="flex items-center gap-2">
                      <ChevronRight size={13} className={`text-[#9ca3af] transition-transform flex-shrink-0 ${open ? "rotate-90" : ""}`} />
                      <div data-zone="avatar" className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: m.color }}>{m.avatar}</div>
                      <span className="font-semibold text-[#111827]">{m.name}</span>
                    </div>
                  </td>
                  <td className={`${open ? "pt-3 pb-1" : "py-3"} px-3`}>
                    <span className="inline-flex items-center gap-1.5 text-[#4b5563] whitespace-nowrap"><ProviderLogo id={m.provider} size={14} />{v1gProviderMeta[m.provider]?.name ?? m.provider}</span>
                  </td>
                  {ETS.map(e => <td key={e} className={`${open ? "pt-3 pb-1" : "py-3"} px-3`} />)}
                  <td className={`${open ? "pt-3 pb-1" : "py-3"} px-5 text-right font-bold text-[#111827] tabular-nums`}>{fmt0(m.known)}</td>
                </tr>
                {open && (<>
                <tr>
                  <td className="py-1 px-5 pl-[46px]"><CertaintyLabel status="Confirmed" /></td>
                  <td className="py-1 px-3" />
                  {ETS.map(e => (
                    <td key={e} className="py-1 px-3 text-right tabular-nums text-[#4b5563]">
                      {cell(m.confirmed[e], e === "Deductions")}
                      {e === "Hourly" && m.confirmed.Hourly && m.rate && (<div className="text-[10px] text-[#9ca3af] font-normal tabular-nums">${m.rate}/hr · {m.hours}h</div>)}
                    </td>
                  ))}
                  <td className="py-1 px-5 text-right tabular-nums font-medium text-[#111827]">{cell(m.cTotal)}</td>
                </tr>
                <tr>
                  <td className="py-1 pb-3 px-5 pl-[46px]"><CertaintyLabel status="Planned" /></td>
                  <td className="py-1 pb-3 px-3" />
                  {ETS.map(e => <td key={e} className="py-1 pb-3 px-3 text-right tabular-nums text-[#4b5563]">{cell(m.planned[e], e === "Deductions")}</td>)}
                  <td className="py-1 pb-3 px-5 text-right tabular-nums font-medium text-[#111827]">{cell(m.pTotal)}</td>
                </tr>
                </>)}
              </Fragment>
              );
            })}
          </tbody>
        </table>
        )}
        </div>
        {zone ? (
        /* Zone Pagination — active page = primary-50 box + primary-700 text + bottom accent;
           inactive = plain gray text; text Previous/Next; "N per page" selector. */
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#e5e7eb]">
          <div className="flex items-center gap-3 text-sm text-[#6b7280]">
            <span>Showing {rangeFrom}–{rangeTo} items</span>
            <span data-zone="select" className="inline-flex items-center gap-0.5 border border-[#e5e7eb] rounded-[4px] pl-2.5 pr-1 py-1 text-[#111827] select-none"><span className="font-medium">10</span><span className="material-symbols-rounded" style={{ fontSize: 18 }}>keyboard_arrow_down</span></span>
            <span>Per page</span>
          </div>
          <div className="flex items-center gap-1">
            {safePage > 0 && (
              <button onClick={() => setPage(p => Math.max(0, p - 1))} className="inline-flex items-center gap-0.5 h-8 pl-1 pr-2.5 rounded-[4px] text-sm text-[#6b7280] hover:text-[#111827] transition-colors"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>chevron_left</span>Previous</button>
            )}
            {Array.from({ length: pageCount }, (_, i) => (
              <button data-zone="pagination" key={i} onClick={() => setPage(i)} className={`relative h-8 min-w-[32px] px-2 rounded-[4px] text-sm transition-colors ${i === safePage ? "bg-[#eaf6ff] text-[#0168dd] font-medium" : "text-[#6b7280] font-normal hover:bg-[#f9fafb]"}`}>{i + 1}{i === safePage && <span className="absolute left-1/2 -translate-x-1/2 -bottom-[1.5px] w-[18px] h-[3px] rounded-full bg-[#0168dd]" />}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={safePage >= pageCount - 1} className="inline-flex items-center gap-0.5 h-8 pl-2.5 pr-1 rounded-[4px] text-sm text-[#6b7280] hover:text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next<span className="material-symbols-rounded" style={{ fontSize: 18 }}>chevron_right</span></button>
          </div>
        </div>
        ) : (
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#e5e7eb]">
          <span className="text-[11px] text-[#6b7280]">Showing <span className="font-medium text-[#4b5563]">{rangeFrom}–{rangeTo}</span> of {rows.length} members</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="flex items-center justify-center w-7 h-7 rounded border border-[#e5e7eb] text-[#4b5563] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={14} /></button>
            {Array.from({ length: pageCount }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`w-7 h-7 rounded text-[11px] font-medium transition-colors ${i === safePage ? "bg-[#0168dd] text-white" : "text-[#4b5563] hover:bg-[#f9fafb] border border-[#e5e7eb]"}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={safePage >= pageCount - 1} className="flex items-center justify-center w-7 h-7 rounded border border-[#e5e7eb] text-[#4b5563] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight size={14} /></button>
          </div>
        </div>
        )}
      </div>
      </>)}

      {/* How we get there */}
      {showHow && (<>
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowHow(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div data-zone="dialog" className="bg-white rounded-xl shadow-2xl w-[480px] max-w-full max-h-[85vh] flex flex-col pointer-events-auto">
            <div className="flex items-start justify-between px-5 py-5 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">How we get there</h2>
                <p className="text-sm text-[#6b7280] mt-0.5">How your {activePeriod.label} {isAll ? "projected payout" : provName + " payment"} is built.</p>
              </div>
              <button onClick={() => setShowHow(false)} className="p-1 rounded-md text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
            <div className="px-5 py-2.5 overflow-y-auto space-y-4">
              <div className="flex items-stretch gap-1.5">
                <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2"><p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] leading-tight">Typical period</p><p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">{fmt0(typical)}</p><p className="text-xs text-[#6b7280] mt-1.5 leading-tight">recent monthly avg</p></div>
                <span className="flex items-center text-[#9ca3af] font-semibold text-sm flex-shrink-0 px-0.5">+</span>
                <div className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2"><p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] leading-tight">Adjustments</p><p className="text-base font-bold text-[#0168dd] mt-1.5 leading-none tracking-tight">+{adjPct}%</p><p className="text-xs text-[#6b7280] mt-1.5 leading-tight">Headcount + season</p></div>
                <span className="flex items-center text-[#9ca3af] font-semibold text-sm flex-shrink-0 px-0.5">=</span>
                <div className="flex-1 rounded-lg border border-[#bcd4f2] bg-[#f0f6ff] px-2.5 py-2"><p className="text-xs font-semibold uppercase tracking-wider text-[#0168dd] leading-tight">Projected</p><p className="text-base font-bold text-[#111827] mt-1.5 leading-none tracking-tight">{fmt0(total)}</p><p className="text-xs text-[#6b7280] mt-1.5 leading-tight">this period</p></div>
              </div>
              <div className="pt-4">
                <p className="text-sm text-[#6b7280] leading-snug"><span className="font-semibold text-[#0168dd]">+{adjPct}%</span> comes from trends in your payment history:</p>
                <div className="mt-2 space-y-1.5 text-sm">
                  <div className="flex items-baseline gap-1.5"><span className="font-semibold text-[#0e9f6e] w-[34px] flex-shrink-0">+{hcPct}%</span><span className="text-[#111827] font-medium flex-shrink-0">Headcount change</span><span className="text-[#6b7280] truncate">· {v1CurrMembers} this cycle vs avg {v1AvgMembers}</span></div>
                  <div className="flex items-baseline gap-1.5"><span className="font-semibold text-[#0168dd] w-[34px] flex-shrink-0">+{seasonPct}%</span><span className="text-[#111827] font-medium flex-shrink-0">Seasonality</span><span className="text-[#6b7280] truncate">· June is typically above average</span></div>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-2">What makes up the {fmt0(total)}</p>
                <ul className="space-y-3 text-sm leading-relaxed">
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#0e9f6e] mt-1 flex-shrink-0" /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Tracked {fmt0(confirmed)}</span>Hours already logged, including overtime. Final — it won't change before payout.</span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#0168dd] mt-1 flex-shrink-0" /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Planned {fmt0(planned)}</span>Scheduled and known ahead: fixed pay, approved PTO and holidays, and manual adjustments. Committed unless cancelled.</span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "repeating-linear-gradient(90deg,#85baf5 0,#85baf5 3px,#bfdbfe 3px,#bfdbfe 5px)" }} /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Projected ~{fmt0(projected)}</span>Remaining hours and likely bonuses, estimated from history — the gap to today's forecast.</span></li>
                </ul>
              </div>
              <p className="text-sm text-[#6b7280] leading-snug">{fmt0(total)} is an estimate from your payment history — not a guaranteed figure. Add a buffer, or <a href="#" onClick={e => e.preventDefault()} className="font-medium text-[#6b7280] underline decoration-dotted decoration-[#d1d5db] underline-offset-2 hover:text-[#111827] transition-colors">see how to improve accuracy</a>.</p>
            </div>
            <div className="flex items-center justify-end px-5 py-5 flex-shrink-0">
              <button onClick={() => setShowHow(false)} className={zone ? zbtn("solidPrimary", "md") : "px-5 py-2 rounded-lg text-sm font-semibold bg-[#0168dd] text-white hover:bg-[#0057bb] transition-colors"}>Done</button>
            </div>
          </div>
        </div>
      </>)}

      {/* What the breakdown means — full reference for both lenses */}
      {showBreakdownInfo && (<>
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowBreakdownInfo(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div data-zone="dialog" className="bg-white rounded-xl shadow-2xl w-[640px] max-w-full max-h-[85vh] flex flex-col pointer-events-auto">
            <div className="flex items-start justify-between px-5 py-5 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">{segLens === "source" ? "Tracked vs. projected" : "Payroll breakdown"}</h2>
              </div>
              <button onClick={() => setShowBreakdownInfo(false)} className="p-1 rounded-md text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
            <div className="px-5 py-2.5 overflow-y-auto">
              {segLens === "source" ? (
                <>
                <p className="text-sm text-[#4b5563] leading-relaxed mb-4">Every amount in this period sits at one of three levels of certainty — some is already locked in, some is scheduled and expected, and the rest is still our best estimate. Together they show how much of the total you can rely on today versus what could still move before payout. As the period goes on, estimates turn into confirmed amounts — Tracked grows while Projected shrinks toward zero, so the total stays steady while certainty rises. Here's what each level means:</p>
                <ul className="space-y-4 text-sm leading-relaxed">
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#0e9f6e] mt-1 flex-shrink-0" /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Tracked</span>Money already confirmed for this period — tracked hours, overtime, and any fixed pay Team Payments has marked as earned. It's locked in and keeps growing as more is confirmed. <span className="text-[#9ca3af]">Example: 120 hours logged this cycle, plus a salary that's now earned.</span></span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#0168dd] mt-1 flex-shrink-0" /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Planned</span>Amounts already scheduled but not yet earned — upcoming PTO, holidays, and payroll adjustments. Known ahead of time; each moves into Tracked once Team Payments marks it earned. <span className="text-[#9ca3af]">Example: approved PTO next week, or a −$200 correction.</span></span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "repeating-linear-gradient(90deg,#85baf5 0,#85baf5 3px,#bfdbfe 3px,#bfdbfe 5px)" }} /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">~Projected</span>The estimated remainder of hourly earnings for this period — hours people are likely to track but haven't yet. It exists only because working days are left; as real hours get tracked it shrinks, approaching zero by period end. Shown only as a team-wide aggregate, never per person. <span className="text-[#9ca3af]">Example: the hours still to be logged this month.</span></span></li>
                </ul>
                </>
              ) : (
                <>
                <p className="text-sm text-[#4b5563] leading-relaxed mb-4">This view slices the same total by what the money actually pays for, rather than how certain it is. Each person's payout is built from a mix of earning types — regular pay, time off, and one-off extras — then any deductions are taken back out to reach the net. Here's what each part means:</p>
                <ul className="space-y-4 text-sm leading-relaxed">
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "#6366f1" }} /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Fixed pay</span>Salaried amounts that don't depend on hours worked — paid in full every cycle regardless of time tracked. <span className="text-[#9ca3af]">Example: a $6,000/month retainer.</span></span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "#0168dd" }} /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Hourly pay</span>Tracked hours multiplied by the person's rate. Grows through the period as more time is logged. <span className="text-[#9ca3af]">Example: 80 hours × $45.</span></span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "#38bdf8" }} /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">PTO / Holiday</span>Approved paid time off and company holidays that fall in this period.</span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "#0e9f6e" }} /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Additions</span>One-off extras on top of regular pay — bonuses, reimbursements, or spot rewards.</span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "#f59e0b" }} /><span className="text-[#6b7280]"><span className="font-semibold text-[#111827] block mb-0.5">Overtime</span>Hours worked beyond the standard schedule, usually paid at a higher rate.</span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "#ef4444" }} /><span className="text-[#6b7280]"><span className="font-semibold text-[#c0392b] block mb-0.5">Deductions</span>Amounts taken out of gross pay, such as advances being repaid or corrections. Subtracted from the total and shown in red.</span></li>
                </ul>
                </>
              )}
            </div>
            <div className="flex items-center justify-end px-5 py-5 flex-shrink-0">
              <button onClick={() => setShowBreakdownInfo(false)} className={zone ? zbtn("solidPrimary", "md") : "px-5 py-2 rounded-lg text-sm font-semibold bg-[#0168dd] text-white hover:bg-[#0057bb] transition-colors"}>Done</button>
            </div>
          </div>
        </div>
      </>)}
    </div>
  );
}

// ─── V2 ────────────────────────────────────────────────────────────────────────

function V2StatusBadge({ status }: { status: string }) {
  const s: Record<string,string> = { Projected:"bg-amber-100 text-amber-700", Draft:"bg-[#f3f4f6] text-[#6b7280]", Paid:"bg-emerald-100 text-emerald-700", Exported:"bg-blue-100 text-blue-700" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s[status] ?? s.Draft}`}>{status}</span>;
}

function V2ProviderChip({ name }: { name: string }) {
  const color = v2ProviderColors[name] ?? "#6b7280";
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

// Plain-text certainty label with a small leading dot (used in the 1L matrix).
function CertaintyLabel({ status, strong = false }: { status: "Confirmed" | "Planned" | "Projected"; strong?: boolean }) {
  const c = status === "Confirmed" ? "#0e9f6e" : status === "Planned" ? "#0168dd" : "#85baf5";
  const projected = status === "Projected";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] ${strong ? "font-semibold text-[#111827]" : "font-medium text-[#4b5563]"}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={projected ? { border: `1px dashed ${c}` } : { background: c }} />
      {status === "Confirmed" ? "Tracked" : status}
    </span>
  );
}

function MembersTable({ cycle }: { cycle: typeof v2Cycles[0] }) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (name: string) => setExpanded(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#e5e7eb]">
        <span className="text-xs font-semibold text-[#111827]">Members <span className="text-[#6b7280] font-normal">— {cycle.members} total, {v2WeeklyMembers.length} shown</span></span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
            <span>GROUP BY</span>
            <button className="flex items-center gap-1 border border-[#e5e7eb] rounded px-2 py-1 text-[#111827] hover:bg-[#f9fafb] transition-colors">Members <ChevronDown size={11} /></button>
          </div>
          <button className="border border-[#e5e7eb] rounded p-1 text-[#6b7280] hover:text-[#111827] hover:bg-[#f9fafb] transition-colors"><Settings size={13} /></button>
          <button className="text-xs text-[#0168dd] flex items-center gap-1 hover:opacity-80"><Download size={12} /> Export</button>
        </div>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
            <th className="py-2.5 px-5 text-left font-semibold text-[#6b7280] w-[40%]">Members</th>
            <th className="py-2.5 px-4 text-left font-semibold text-[#6b7280]">Hours</th>
            <th className="py-2.5 px-4 text-left font-semibold text-[#6b7280]">Pay rate</th>
            <th className="py-2.5 px-4 text-left font-semibold text-[#6b7280]">Status</th>
            <th className="py-2.5 px-5 text-right font-semibold text-[#6b7280]">Total amount</th>
          </tr>
        </thead>
        {v2WeeklyMembers.map((m) => {
            const isOpen = expanded.includes(m.name);
            return (
              <tbody key={m.name}>
                <tr className="border-b border-[#e5e7eb] cursor-pointer hover:bg-[#f9fafb] transition-colors" onClick={() => toggle(m.name)}>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <ChevronRight size={14} className={`text-[#6b7280] transition-transform flex-shrink-0 ${isOpen ? "rotate-90" : ""}`} />
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: m.color }}>{m.avatar}</div>
                      <div><p className="font-semibold text-[#111827]">{m.name}</p><p className="text-[10px] text-[#6b7280]">{m.email}</p></div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#6b7280]">—</td>
                  <td className="py-3 px-4 text-[#6b7280]">—</td>
                  <td className="py-3 px-4">
                    {m.items.some(i => i.status === "Projected") ? <ItemStatusBadge status="Projected" /> : m.items.some(i => i.status === "Planned") ? <ItemStatusBadge status="Planned" /> : <ItemStatusBadge status="Confirmed" />}
                  </td>
                  <td className="py-3 px-5 text-right font-semibold text-[#111827]">{fmt2(m.total)}</td>
                </tr>
                {isOpen && m.items.map((item, idx) => (
                  <tr key={idx} className={`border-b border-[#e5e7eb] ${item.status === "Projected" ? "bg-[#f0f7ff]" : "bg-white"} hover:bg-[#f9fafb] transition-colors`}>
                    <td className="py-2.5 px-5 pl-14"><p className="font-medium text-[#111827]">{item.label}</p><p className="text-[10px] text-[#6b7280]">{item.sub}</p></td>
                    <td className="py-2.5 px-4 text-[#111827]">{item.hours}</td>
                    <td className="py-2.5 px-4 text-[#6b7280]">{item.rate}</td>
                    <td className="py-2.5 px-4"><ItemStatusBadge status={item.status} /></td>
                    <td className={`py-2.5 px-5 text-right font-medium ${item.status === "Projected" ? "text-[#85baf5]" : item.status === "Planned" ? "text-[#0168dd]" : "text-[#111827]"}`}>
                      {item.status === "Projected" ? "~" : ""}{fmt2(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            );
          })}
          <tbody>
            <tr className="border-t border-dashed border-[#e5e7eb] bg-[#f9fafb]">
              <td colSpan={5} className="py-2.5 px-5 text-[11px] text-[#6b7280]">
                + {cycle.members - v2WeeklyMembers.length} more members · <span className="text-[#0168dd] cursor-pointer hover:underline">View all</span>
              </td>
            </tr>
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
  const provColor = v2ProviderColors[cycle.provider] ?? "#6b7280";
  const wiseBalance = 48000;
  const wiseRequired = totalWithBuffer;
  const wiseDiff = wiseBalance - wiseRequired;
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#111827] transition-colors"><ArrowLeft size={14} /> Back</button>
          <div className="w-px h-4 bg-[#e5e7eb]" />
          <span className="text-base font-semibold text-[#111827]">{cycle.id}</span>
          <button className="text-[#6b7280] hover:text-[#111827]"><Pencil size={13} /></button>
          <V2StatusBadge status="Projected" />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs border border-[#e5e7eb] rounded px-3 py-1.5 text-[#111827] hover:bg-[#f9fafb] transition-colors"><Download size={12} /> Export payment</button>
          <button className="flex items-center gap-1.5 text-xs bg-[#0168dd] text-white rounded px-3 py-1.5 hover:bg-[#0057bb] transition-colors"><Send size={12} /> Schedule</button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#e5e7eb] px-5 py-4 flex items-center gap-5">
        <div className="flex-shrink-0 min-w-[140px]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">Total projected</p>
          <p className="text-3xl font-bold text-[#111827] tracking-tight mt-0.5">{fmt2(totalWithBuffer)}</p>
          {buffer > 0 && <p className="text-[10px] text-[#6b7280] mt-0.5">incl. {fmt2(buffer)} buffer</p>}
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
        <div className="flex-shrink-0 border-l border-[#e5e7eb] pl-5">
          <p className="text-lg font-bold mb-1" style={{ color: provColor }}>{cycle.provider}</p>
          <div className="space-y-0.5 text-[11px] text-[#6b7280]">
            <div className="flex items-center gap-1"><CalendarDays size={11} />{cycle.dateRange}</div>
            <div className="flex items-center gap-1"><Users size={11} />{cycle.members} members · {cycle.cycle}</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e5e7eb]">
          <p className="text-sm font-semibold text-[#111827]">Payment breakdown</p>
          <p className="text-[11px] text-[#6b7280] mt-0.5">What makes up this payment and how certain each part is</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-[#e5e7eb]">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Confirmed</span></div>
              <span className="text-base font-bold text-emerald-600">{fmt2(cycle.confirmed)}</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {cb.hourlyTracked > 0 && <div className="flex justify-between items-baseline"><span className="text-[#6b7280]">Hourly tracked</span><span className="font-semibold text-[#111827]">{fmt2(cb.hourlyTracked)}</span></div>}
              {cb.overtime > 0 && <div className="flex justify-between items-baseline"><span className="text-[#6b7280]">Overtime</span><span className="font-semibold text-[#111827]">{fmt2(cb.overtime)}</span></div>}
              {cb.pastPTO > 0 && <div className="flex justify-between items-baseline"><span className="text-[#6b7280]">Past PTO / Holidays</span><span className="font-semibold text-[#111827]">{fmt2(cb.pastPTO)}</span></div>}
            </div>
            <p className="text-[10px] text-[#6b7280] mt-4 leading-relaxed">Hours tracked and approved — these amounts are final.</p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#0168dd]" /><span className="text-[10px] font-bold uppercase tracking-widest text-[#0168dd]">Planned</span></div>
              <span className="text-base font-bold text-[#0168dd]">{fmt2(cycle.planned)}</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {pl.fixedPay > 0 && <div className="flex justify-between items-baseline"><span className="text-[#6b7280]">Fixed pay</span><span className="font-semibold text-[#111827]">{fmt2(pl.fixedPay)}</span></div>}
              {pl.futurePTO > 0 && <div className="flex justify-between items-baseline"><span className="text-[#6b7280]">PTO / Holidays (remaining)</span><span className="font-semibold text-[#111827]">{fmt2(pl.futurePTO)}</span></div>}
              {pl.additions > 0 && <div className="flex justify-between items-baseline"><span className="text-[#6b7280]">Scheduled additions</span><span className="font-semibold text-[#111827]">{fmt2(pl.additions)}</span></div>}
            </div>
            <p className="text-[10px] text-[#6b7280] mt-4 leading-relaxed">Committed — will be included unless cancelled.</p>
          </div>
          <div className="px-5 py-4 bg-[#f0f7ff]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-[#85baf5]" /><span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Projected</span></div>
              <span className="text-base font-bold text-[#85baf5]">~{fmt2(cycle.projected + buffer)}</span>
            </div>
            <div className="space-y-2.5 text-xs mb-4">
              <div className="flex justify-between items-baseline"><span className="text-[#6b7280]">~Remaining hourly (est.)</span><span className="font-semibold text-[#85baf5]">~{fmt2(pb.hourly)}</span></div>
              <p className="text-[10px] text-[#6b7280]">Avg daily rate × {cycle.daysLeft} days remaining</p>
            </div>
            <div className="border-t border-dashed border-[#bfdbfe] pt-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">Add buffer</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-[#bfdbfe] rounded-md bg-white overflow-hidden flex-1">
                  <span className="px-2 text-xs text-[#6b7280] border-r border-[#bfdbfe] py-1.5">+$</span>
                  <input type="number" min={0} value={buffer || ""} onChange={e => setBuffer(Math.max(0, Number(e.target.value)))} placeholder="0" className="flex-1 px-2 py-1.5 text-xs text-[#111827] outline-none bg-transparent w-0" />
                </div>
                {buffer > 0 && <button onClick={() => { setBuffer(0); setBufferNote(""); }} className="text-[10px] text-[#6b7280] hover:text-red-500 transition-colors">✕</button>}
              </div>
              <textarea value={bufferNote} onChange={e => setBufferNote(e.target.value)} placeholder="Reason for buffer (optional)…" rows={2} className="w-full text-xs border border-[#bfdbfe] rounded-md px-2.5 py-1.5 text-[#111827] placeholder-[#93c5fd] outline-none resize-none bg-white focus:border-[#85baf5] transition-colors" />
              {buffer > 0 && <p className="text-[10px] text-[#85baf5]">Total projected bumped to {fmt2(cycle.projected + buffer)}</p>}
            </div>
            <p className="text-[10px] text-[#6b7280] mt-3 leading-relaxed">Estimate — updates as members track time.</p>
          </div>
        </div>
      </div>
      {cycle.provider === "Wise" && (
        <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[#e5e7eb]">
            <div className="w-5 h-5 rounded-full bg-[#0168dd] flex items-center justify-center"><span className="text-white text-[9px] font-bold">W</span></div>
            <span className="text-sm font-semibold text-[#111827]">Wise Wallet</span>
            <span className="text-xs text-[#6b7280]">— current balance vs payment required</span>
          </div>
          <div className="px-5 py-4 flex items-center gap-8">
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1">Wallet balance</p><p className="text-2xl font-bold text-[#111827]">{fmt2(wiseBalance)}</p></div>
            <div className="text-2xl text-[#e5e7eb]">→</div>
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1">Payment required</p><p className="text-2xl font-bold text-[#111827]">{fmt2(wiseRequired)}</p></div>
            <div className="flex-1 border-l border-[#e5e7eb] pl-8">
              {wiseDiff >= 0 ? (
                <div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1">Surplus</p><p className="text-2xl font-bold text-emerald-600">+{fmt2(wiseDiff)}</p><p className="text-xs text-[#6b7280] mt-1">Wallet has sufficient funds</p></div>
              ) : (
                <div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1">Shortfall</p><p className="text-2xl font-bold text-red-500">−{fmt2(Math.abs(wiseDiff))}</p><p className="text-xs text-[#6b7280] mt-1">Additional funds needed before payment</p></div>
              )}
            </div>
            <div>
              {wiseDiff < 0 ? (
                <button className="flex items-center gap-2 bg-[#0168dd] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#0057bb] transition-colors"><span className="text-lg leading-none">+</span>Add {fmt2(Math.abs(wiseDiff))} to Wise</button>
              ) : (
                <button className="flex items-center gap-2 border border-[#e5e7eb] text-[#6b7280] text-sm px-4 py-2.5 rounded-lg hover:bg-[#f9fafb] transition-colors">View wallet</button>
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
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-xs text-[#6b7280] mb-1">Next payouts across all providers · Jun 2026</p>
            <p className="text-4xl font-bold text-[#111827] tracking-tight">{fmt2(v2TotalAll)}</p>
            <p className="text-xs text-[#6b7280] mt-1">{v2Cycles.length} providers · one payout each</p>
          </div>
          <div className="flex items-center gap-6 ml-8">
            <div className="text-right"><p className="text-[10px] text-[#6b7280] uppercase tracking-widest">Confirmed</p><p className="text-xl font-bold text-[#111827] mt-0.5">{fmt2(v2TotalConfirmed)}</p><p className="text-[10px] text-[#6b7280]">tracked &amp; guaranteed</p></div>
            <div className="text-right"><p className="text-[10px] text-[#6b7280] uppercase tracking-widest">Projected</p><p className="text-xl font-bold text-[#85baf5] mt-0.5">{fmt2(v2TotalProjected)}</p><p className="text-[10px] text-[#6b7280]">estimated remaining</p></div>
          </div>
        </div>
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-2 bg-[#f3f4f6] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#0168dd] rounded-l-full" style={{ width: `${confirmedPct}%` }} />
              <div className="h-full flex-1 rounded-r-full" style={{ background: "repeating-linear-gradient(90deg,#85baf5 0px,#85baf5 6px,#bfdbfe 6px,#bfdbfe 10px)" }} />
            </div>
            <span className="text-[10px] text-[#6b7280] flex-shrink-0">{confirmedPct}% confirmed</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_160px_200px_110px] gap-4 px-5 py-2.5 border-b border-[#e5e7eb] bg-[#f9fafb]">
          {["Provider · next payout", "Cycle", "Members", "Confirmed → Projected", "Total"].map(h => (
            <p key={h} className={`text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] ${h === "Total" ? "text-right" : ""}`}>{h}</p>
          ))}
        </div>
        {v2Cycles.map((c, idx) => {
          const provColor = v2ProviderColors[c.provider] ?? "#6b7280";
          const cPct = Math.round((c.confirmed / c.total) * 100);
          return (
            <div key={c.id} onClick={() => onView(c.id)} className={`grid grid-cols-[1fr_100px_160px_200px_110px] gap-4 px-5 py-4 items-center cursor-pointer hover:bg-[#f9fafb] transition-colors ${idx < v2Cycles.length - 1 ? "border-b border-[#e5e7eb]" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: provColor + "18" }}><div className="w-3 h-3 rounded-sm" style={{ background: provColor }} /></div>
                <div>
                  <div className="flex items-center gap-2"><span className="text-sm font-bold text-[#111827]">{c.provider}</span><V2StatusBadge status="Projected" /></div>
                  <p className="text-xs text-[#6b7280] mt-0.5">{c.dateRange}</p>
                  <p className="text-[10px] text-amber-600">{c.daysLeft} days remaining · {c.pctTracked}% tracked</p>
                </div>
              </div>
              <div><span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.cycleColor + "18", color: c.cycleColor }}>{c.cycle}</span></div>
              <div className="flex items-center gap-1.5 text-xs text-[#111827]"><Users size={12} className="text-[#6b7280]" /><span className="font-semibold">{c.members}</span><span className="text-[#6b7280]">members</span></div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px]"><span className="font-semibold text-[#111827]">{fmt0(c.confirmed)}</span><span className="text-[#6b7280]">+</span><span className="font-semibold text-[#85baf5]">~{fmt0(c.projected)}</span></div>
                <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden flex">
                  <div className="h-full rounded-l-full" style={{ width: `${cPct}%`, background: provColor }} />
                  <div className="h-full flex-1 rounded-r-full" style={{ background: "repeating-linear-gradient(90deg,#85baf5 0px,#85baf5 4px,#bfdbfe 4px,#bfdbfe 7px)" }} />
                </div>
              </div>
              <div className="text-right flex items-center justify-end gap-2"><p className="text-sm font-bold text-[#111827]">{fmt2(c.total)}</p><ChevronRight size={14} className="text-[#6b7280]" /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function V2PaymentList({ rows, showPaidOn }: { rows: any[]; showPaidOn?: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
            {["ID","Name","Date range","Members","Amount","Status",...(showPaidOn?["Paid on"]:[]),"Provider",""].map(h => (
              <th key={h} className="py-2.5 px-4 text-left font-semibold text-[#6b7280]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className={`hover:bg-[#f9fafb] cursor-pointer ${i < rows.length - 1 ? "border-b border-[#e5e7eb]" : ""}`}>
              <td className="py-3 px-4 text-[#0168dd] font-medium">{row.id}</td>
              <td className="py-3 px-4 text-[#111827] font-medium">{row.name}</td>
              <td className="py-3 px-4 text-[#6b7280]">{row.range}</td>
              <td className="py-3 px-4"><div className="flex items-center gap-1 text-[#6b7280]"><Users size={11} />{row.members}</div></td>
              <td className="py-3 px-4 font-semibold text-[#111827]">{fmt2(row.amount)}</td>
              <td className="py-3 px-4"><V2StatusBadge status={row.status} /></td>
              {showPaidOn && <td className="py-3 px-4 text-[#6b7280]">{row.paidOn}</td>}
              <td className="py-3 px-4"><V2ProviderChip name={row.provider} /></td>
              <td className="py-3 px-4 text-[#6b7280]"><MoreHorizontal size={14} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Version2({ initialDetailId = null, onExitDetail }: { initialDetailId?: string | null; onExitDetail?: () => void } = {}) {
  const [mainTab, setMainTab] = useState<"future"|"draft"|"history">("future");
  const [detailId, setDetailId] = useState<string|null>(initialDetailId);
  const tabs = [
    { id: "future"  as const, label: "Future Payment",     count: v2Cycles.length },
    { id: "draft"   as const, label: "Currently in Draft", count: v2DraftPayments.length },
    { id: "history" as const, label: "Payment History",    count: null },
  ];
  return detailId ? (
    <V2DetailView cycleId={detailId} onBack={() => { if (detailId === initialDetailId && onExitDetail) onExitDetail(); else setDetailId(null); }} />
  ) : (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#111827]">Payments</h1>
        <button className="flex items-center gap-1.5 text-xs bg-[#0168dd] text-white rounded px-3 py-1.5 hover:bg-[#0057bb]"><Plus size={13} /> Create payment</button>
      </div>
      <div className="flex items-center gap-0 border-b border-[#e5e7eb] mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${mainTab === t.id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>
            {t.label}
            {t.count !== null && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${mainTab === t.id ? "bg-[#e8f2fd] text-[#0168dd]" : "bg-[#f3f4f6] text-[#6b7280]"}`}>{t.count}</span>}
          </button>
        ))}
      </div>
      {mainTab === "future"  && <V2FuturePaymentTab onView={id => setDetailId(id)} />}
      {mainTab === "draft"   && <V2PaymentList rows={v2DraftPayments} />}
      {mainTab === "history" && <V2PaymentList rows={v2HistoryPayments} showPaidOn />}
    </div>
  );
}

// Which V2 future-payment cycle a fund-card provider deep-links into.
const v2CycleForProvider: Record<string, string> = {
  wise:     "FP-WISE-001",
  deel:     "FP-DEEL-001",
  payoneer: "FP-PAY-001",
  paypal:   "FP-PAY-001",
  bitwage:  "FP-WISE-001",
  export:   "FP-WISE-001",
};

// ─── Root ──────────────────────────────────────────────────────────────────────

// Version list for the Final UI floating switcher (the template shell has no switcher).
const FINAL_VERSIONS: [string, string][] = [["v1","1"],["v1c","1C"],["v1d","1D"],["v1e","1E"],["v1f","1F"],["v1g","1G"],["v1h","1H"],["v1i","1I"],["v1j","1J"],["v1k","1K"],["v1l","1L"],["v1m","1M"],["v1n","1N"],["final","Final UI"],["mvp","MVP Final UI"],["mvp2","MVP Final UI (after sync)"],["v2","2"]];

// Final UI — wraps the payments report in the real Hubstaff shell template
// (left panel + top header + design annotations), vendored from the design repo
// and served from /public/hubstaff-template. The shell injects fixed chrome into
// <body> and offsets #shell-content; there is no teardown API, so we clean it up
// manually when leaving this version.
function FinalUIShell({ children, version = "final", onVersionChange, finalState, onFinalStateChange, spilloverLvl, onSpilloverChange, notSchedOn, onNotSchedChange }: { children: ReactNode; version?: string; onVersionChange: (v: string) => void; finalState: string; onFinalStateChange: (s: string) => void; spilloverLvl: "off" | "yellow" | "red" | "mixed"; onSpilloverChange: (v: "off" | "yellow" | "red" | "mixed") => void; notSchedOn: boolean; onNotSchedChange: (v: boolean) => void }) {
  useEffect(() => {
    [
      "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600&display=swap",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@18,400,0,0;24,400,0,0&display=swap",
    ].forEach(href => {
      if (document.querySelector(`link[data-hsfont="${href}"]`)) return;
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; l.dataset.hsfont = href;
      document.head.appendChild(l);
    });

    // Inject each vendored shell script inline (classic script — runs synchronously on
    // append). Bundled via ?raw so nothing is fetched from a separate folder at runtime.
    const injectScript = (id: string, source: string) => {
      if (document.querySelector(`script[data-hs="${id}"]`)) return;
      const s = document.createElement("script");
      s.dataset.hs = id;
      s.textContent = source;
      document.body.appendChild(s);
    };

    injectScript("hubstaff-shell", hubstaffShellSrc);
    const HS = (window as any).HubstaffShell;
    if (HS && !document.getElementById("hs-topbar")) HS.init({ activeItem: "payments", logoHref: "#" });
    injectScript("design-annotations", designAnnotationsSrc);
    injectScript("design-annotations-data", designAnnotationsDataSrc);
    const DA = (window as any).DesignAnnotations;
    const data = (window as any).DESIGN_ANNOTATIONS_DATA;
    if (DA && data && !(window as any).__daInited) {
      DA.init({ pages: data.pages, annotations: data.annotations, mount: "#shell-content", topOffset: 52, trigger: ["contextmenu", "button"], taskCenter: { anchor: ".hs-timer", position: "after" } });
      (window as any).__daInited = true;
    }
    // Dev Mode inspector — sits next to the Design tasks control in the top bar.
    injectScript("dev-mode", devModeSrc);
    const DM = (window as any).DevMode;
    if (DM && !(window as any).__dmInited) {
      DM.init({ topOffset: 52, toggleAnchor: ".hs-timer" });
      (window as any).__dmInited = true;
    }

    return () => {
      try { (window as any).DesignAnnotations?.destroy?.(); } catch { /* noop */ }
      try { (window as any).DevMode?.destroy?.(); } catch { /* noop */ }
      (window as any).__daInited = false;
      (window as any).__dmInited = false;
      document.querySelectorAll('[id^="hs-"]').forEach(el => el.remove());
      document.querySelectorAll("style").forEach(st => { if (st.textContent && st.textContent.includes("#hs-sidebar")) st.remove(); });
      document.querySelectorAll('[class^="da-"],[id^="da-"],[class^="dm-"],[id^="dm-"]').forEach(el => el.remove());
      document.body.classList.remove("hs-expanded");
    };
  }, []);

  return (
    <>
      <div id="shell-content">{children}</div>
      <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-1.5 bg-white/95 backdrop-blur border border-[#e5e7eb] rounded-lg shadow-lg px-2.5 py-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-[#6b7280]">Version</span>
        <select value={version} onChange={e => onVersionChange(e.target.value)} className="text-[11px] font-medium text-[#111827] bg-transparent outline-none cursor-pointer">
          {FINAL_VERSIONS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
        </select>
        <span className="w-px h-3.5 bg-[#e5e7eb]" />
        <span className="text-[9px] font-semibold uppercase tracking-widest text-[#6b7280]">State</span>
        <select value={finalState} onChange={e => onFinalStateChange(e.target.value)} className="text-[11px] font-medium text-[#111827] bg-transparent outline-none cursor-pointer">
          <option value="filled">Filled state</option>
          <option value="initial">Initial state</option>
          <option value="empty">Empty state</option>
        </select>
        {version !== "mvp2" && (<>
        <span className="w-px h-3.5 bg-[#e5e7eb]" />
        <span className="text-[9px] font-semibold uppercase tracking-widest text-[#6b7280]">Spillover</span>
        <select value={spilloverLvl} onChange={e => onSpilloverChange(e.target.value as "off" | "yellow" | "red" | "mixed")} className="text-[11px] font-medium text-[#111827] bg-transparent outline-none cursor-pointer">
          <option value="off">Off</option>
          <option value="yellow">Yellow</option>
          <option value="red">Red</option>
          <option value="mixed">Mixed</option>
        </select>
        </>)}
        {version !== "mvp2" && (<>
        <span className="w-px h-3.5 bg-[#e5e7eb]" />
        {(() => { const nsOn = notSchedOn && spilloverLvl !== "mixed"; const nsLocked = spilloverLvl === "mixed"; return (
        <button onClick={() => { if (!nsLocked) onNotSchedChange(!notSchedOn); }} disabled={nsLocked} title={nsLocked ? "Merged into the Mixed spillover card" : "Toggle the Not-scheduled group"} className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest select-none ${nsLocked ? "text-[#d1d5db] cursor-not-allowed" : "text-[#6b7280]"}`}>
          <span className={`relative w-7 h-4 rounded-full transition-colors flex-shrink-0 inline-flex ${nsOn ? "bg-[#0168dd]" : "bg-[#d1d5db]"}`}><span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${nsOn ? "translate-x-3.5" : "translate-x-0.5"}`} /></span>
          Not scheduled
        </button>
        ); })()}
        </>)}
      </div>
    </>
  );
}

export default function App() {
  const [version, setVersion] = useState<"v1"|"v1c"|"v1d"|"v1e"|"v1f"|"v1g"|"v1h"|"v1i"|"v1j"|"v1k"|"v1l"|"v1m"|"v1n"|"final"|"mvp"|"mvp2"|"v2">("mvp2");
  const [showStatusBreakdown, setShowStatusBreakdown] = useState(false);
  const [seasonalityOn, setSeasonalityOn] = useState(true);
  const [finalState, setFinalState] = useState<"filled" | "initial" | "empty">("filled"); // Final UI state variant (filled = the one being built)
  const [spilloverLvl, setSpilloverLvl] = useState<"off" | "yellow" | "red" | "mixed">("mixed"); // default "mixed" so the off-schedule card is part of the design; "mixed" merges the Not-scheduled group into one off-schedule card
  const [notSchedOn, setNotSchedOn] = useState(false); // "Not scheduled" group — independent toggle

  if (version === "final" || version === "mvp" || version === "mvp2") {
    return (
      <FinalUIShell version={version} onVersionChange={(v) => setVersion(v as typeof version)} finalState={finalState} onFinalStateChange={(s) => setFinalState(s as typeof finalState)} spilloverLvl={spilloverLvl} onSpilloverChange={(v) => { setSpilloverLvl(v); if (v === "mixed") setNotSchedOn(false); }} notSchedOn={notSchedOn} onNotSchedChange={setNotSchedOn}>
        <VersionFinalUI showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} state={finalState} variant={version === "final" ? "final" : (version as "mvp" | "mvp2")} spillover={spilloverLvl === "off" ? null : spilloverLvl} notSched={spilloverLvl === "mixed" ? false : notSchedOn} />
      </FinalUIShell>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-[Inter,sans-serif]">
      <Sidebar active={version} />
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f9fafb]">
        <div className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-[#e5e7eb] flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-[#6b7280]">
            {(version === "v1" || version === "v1c" || version === "v1d" || version === "v1e" || version === "v1f" || version === "v1g" || version === "v1h" || version === "v1i" || version === "v1j" || version === "v1k" || version === "v1l" || version === "v1m" || version === "v1n") ? (
              <><span className="hover:text-[#0168dd] cursor-pointer">Reports</span><ChevronRight size={12} /><span className="text-[#111827] font-medium">Payments report</span></>
            ) : (
              <><span className="hover:text-[#0168dd] cursor-pointer">Financials</span><ChevronRight size={12} /><span className="text-[#111827] font-medium">Team Payments</span></>
            )}
          </div>
          <div className="flex items-center gap-3">
            {(version === "v1c" || version === "v1d" || version === "v1e" || version === "v1f" || version === "v1g" || version === "v1h" || version === "v1i" || version === "v1j" || version === "v1k" || version === "v1l" || version === "v1m" || version === "v1n") && (
              <div className="flex items-center gap-4 border-r border-[#e5e7eb] pr-4">
                {[
                  { label: "Status breakdown", val: showStatusBreakdown, set: setShowStatusBreakdown },
                  { label: "Seasonality",      val: seasonalityOn,       set: setSeasonalityOn       },
                ].map(({ label, val, set }) => (
                  <button key={label} onClick={() => set(p => !p)} className="flex items-center gap-1.5 text-[11px] text-[#6b7280] select-none">
                    <span className={`relative w-7 h-4 rounded-full transition-colors flex-shrink-0 inline-flex ${val ? "bg-[#0168dd]" : "bg-[#d1d5db]"}`}>
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${val ? "translate-x-3.5" : "translate-x-0.5"}`} />
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center bg-[#f3f4f6] rounded-lg p-0.5">
              <button onClick={() => setVersion("v1")}  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1"  ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1</button>
              <button onClick={() => setVersion("v1c")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1c" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1C</button>
              <button onClick={() => setVersion("v1d")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1d" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1D</button>
              <button onClick={() => setVersion("v1e")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1e" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1E</button>
              <button onClick={() => setVersion("v1f")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1f" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1F</button>
              <button onClick={() => setVersion("v1g")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1g" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1G</button>
              <button onClick={() => setVersion("v1h")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1h" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1H</button>
              <button onClick={() => setVersion("v1i")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1i" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1I</button>
              <button onClick={() => setVersion("v1j")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1j" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1J</button>
              <button onClick={() => setVersion("v1k")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1k" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1K</button>
              <button onClick={() => setVersion("v1l")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1l" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1L</button>
              <button onClick={() => setVersion("v1m")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1m" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1M</button>
              <button onClick={() => setVersion("v1n")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1n" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>1N</button>
              <button onClick={() => setVersion("final")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${(version as string) === "final" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>Final UI</button>
              <button onClick={() => setVersion("mvp")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${(version as string) === "mvp" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>MVP Final UI</button>
              <button onClick={() => setVersion("v2")}  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v2"  ? "bg-white text-[#0168dd] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}>2</button>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]"><Clock size={13} /><span>0:00:00</span></div>
          </div>
        </div>
        {version === "v1"  && <Version1  />}
        {version === "v1c" && <Version1C showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1d" && <Version1D showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1e" && <Version1E showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1f" && <Version1F showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1g" && <Version1G showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1h" && <Version1H showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1i" && <Version1I showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1j" && <Version1J showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1k" && <Version1K showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1l" && <Version1L showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1m" && <Version1M showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v1n" && <Version1N showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />}
        {version === "v2"  && <Version2 />}
      </div>
    </div>
  );
}
