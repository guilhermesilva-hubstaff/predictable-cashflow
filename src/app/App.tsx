import { useState, useEffect, useRef, Fragment } from "react";
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
  TrendingDown, MoreHorizontal, Columns, X,
  Banknote, Gift, Umbrella, Minus, AlertTriangle, SlidersHorizontal, Info,
  FileSpreadsheet, Filter, ExternalLink,
} from "lucide-react";

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

// 1L future-payment "By source" roster — 15 members summing to the Wise total ($10,600).
const v1lWiseMembers = [
  ...v2WeeklyMembers,
  ...[
    { name: "Sofia Rossi",  avatar: "SR", color: "#e5764e", total: 620 },
    { name: "Liam OBrien",  avatar: "LO", color: "#0ea5a0", total: 640 },
    { name: "Yuki Tanaka",  avatar: "YT", color: "#8b5cf6", total: 600 },
    { name: "Noah Kim",     avatar: "NK", color: "#0168dd", total: 660 },
    { name: "Emma Novak",   avatar: "EN", color: "#10b981", total: 580 },
    { name: "Diego Santos", avatar: "DS", color: "#f59e0b", total: 700 },
    { name: "Chloe Dubois", avatar: "CD", color: "#e5764e", total: 610 },
    { name: "Omar Haddad",  avatar: "OH", color: "#0ea5a0", total: 645 },
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
  { name: "Marcus Chen",      avatar: "MC", color: "#0ea5a0", confirmed: {},                              planned: { "Fixed pay": 8500, Deductions: 300 } },
  { name: "Aurora Arjomilla", avatar: "AA", color: "#10b981", confirmed: {},                              planned: { "Fixed pay": 6800, "PTO / Holiday": 600, Additions: 400 } },
  { name: "Liam O'Brien",     avatar: "LO", color: "#0ea5a0", confirmed: {},                              planned: { "Fixed pay": 7000, Additions: 600 } },
  { name: "Priya Nair",       avatar: "PN", color: "#e5764e", confirmed: {},                              planned: { "Fixed pay": 6200, "PTO / Holiday": 500 } },
  { name: "Emma Novak",       avatar: "EN", color: "#10b981", confirmed: {},                              planned: { "Fixed pay": 5800, Additions: 500 } },
  { name: "Diego Santos",     avatar: "DS", color: "#f59e0b", confirmed: {},                              planned: { "Fixed pay": 5400 } },
  // Hourly — tracked hours (rate × hours), plus overtime / scheduled extras.
  { name: "Alex Yarotsky",    avatar: "AY", color: "#f59e0b", confirmed: { Hourly: 1600, Overtime: 180 }, planned: { "PTO / Holiday": 320 }, rate: 40, hours: 40 },
  { name: "Jordan Blake",     avatar: "JB", color: "#8b5cf6", confirmed: { Hourly: 1760, Overtime: 220 }, planned: {},                       rate: 40, hours: 44 },
  { name: "Noah Kim",         avatar: "NK", color: "#0168dd", confirmed: { Hourly: 1534 },                planned: { "PTO / Holiday": 280 }, rate: 59, hours: 26 },
  { name: "Full Tseg",        avatar: "FT", color: "#0168dd", confirmed: { Hourly: 1440 },                planned: { Additions: 260 },       rate: 45, hours: 32 },
  { name: "Zara Ali",         avatar: "ZA", color: "#8b5cf6", confirmed: { Hourly: 1326 },                planned: { "PTO / Holiday": 240 }, rate: 51, hours: 26 },
  { name: "Sofia Rossi",      avatar: "SR", color: "#e5764e", confirmed: { Hourly: 1248 },                planned: { Deductions: 150 },      rate: 48, hours: 26 },
  { name: "Omar Haddad",      avatar: "OH", color: "#0ea5a0", confirmed: { Hourly: 1170, Overtime: 120 },  planned: {},                      rate: 45, hours: 26 },
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
  { id: "all",     name: "All providers" },
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
  { name: "Sofia Ramos",  avatar: "SR", color: "#0ea5a0", provider: "paypal", confirmed: {},                              planned: { "Fixed pay": 9500 } },
  { name: "Tom Wells",    avatar: "TW", color: "#0168dd", provider: "paypal", confirmed: {},                              planned: { "Fixed pay": 7800, Deductions: 300 } },
  { name: "Lena Marsh",   avatar: "LM", color: "#8b5cf6", provider: "paypal", confirmed: {},                              planned: { "Fixed pay": 8000, "PTO / Holiday": 600 } },
  { name: "Raj Patel",    avatar: "RP", color: "#f59e0b", provider: "paypal", confirmed: { Hourly: 4800, Overtime: 500 }, planned: {}, rate: 60, hours: 80 },
  { name: "Ivy Chen",     avatar: "IC", color: "#10b981", provider: "paypal", confirmed: { Hourly: 5000 },                planned: {}, rate: 50, hours: 100 },
  { name: "Ben Ortiz",    avatar: "BO", color: "#e5764e", provider: "paypal", confirmed: {},                              planned: { "Fixed pay": 6800, Additions: 1300 } },
  // Deel — $20,000
  { name: "Ana Lopez",    avatar: "AL", color: "#0ea5a0", provider: "deel", confirmed: {},                               planned: { "Fixed pay": 5000 } },
  { name: "Kofi Mensah",  avatar: "KM", color: "#0168dd", provider: "deel", confirmed: {},                               planned: { "Fixed pay": 4500, "PTO / Holiday": 500 } },
  { name: "Yara Haddad",  avatar: "YH", color: "#8b5cf6", provider: "deel", confirmed: { Hourly: 3600, Overtime: 400 },  planned: {}, rate: 45, hours: 80 },
  { name: "Sven Berg",    avatar: "SB", color: "#f59e0b", provider: "deel", confirmed: { Hourly: 3200 },                 planned: {}, rate: 40, hours: 80 },
  { name: "Nina Kaur",    avatar: "NK", color: "#10b981", provider: "deel", confirmed: {},                               planned: { "Fixed pay": 3000, Additions: 200, Deductions: 400 } },
  // Export — $12,000
  { name: "Hiro Sato",    avatar: "HS", color: "#0ea5a0", provider: "export", confirmed: {},                             planned: { "Fixed pay": 4000 } },
  { name: "Mara Vidal",   avatar: "MV", color: "#0168dd", provider: "export", confirmed: {},                             planned: { "Fixed pay": 3500, "PTO / Holiday": 300 } },
  { name: "Owen Reid",    avatar: "OR", color: "#8b5cf6", provider: "export", confirmed: { Hourly: 2400, Overtime: 200 }, planned: {}, rate: 40, hours: 60 },
  { name: "Tess Frost",   avatar: "TF", color: "#f59e0b", provider: "export", confirmed: {},                             planned: { "Fixed pay": 1800, Additions: 100, Deductions: 300 } },
  // Bitwage — $10,000
  { name: "Dario Costa",  avatar: "DC", color: "#0ea5a0", provider: "bitwage", confirmed: {},                            planned: { "Fixed pay": 5000 } },
  { name: "Priya Rao",    avatar: "PR", color: "#0168dd", provider: "bitwage", confirmed: { Hourly: 3000 },               planned: {}, rate: 50, hours: 60 },
  { name: "Luca Bianchi", avatar: "LB", color: "#8b5cf6", provider: "bitwage", confirmed: {},                            planned: { "Fixed pay": 2200, "PTO / Holiday": 200, Deductions: 400 } },
  // Gusto — $8,000
  { name: "Grace Miller", avatar: "GM", color: "#0ea5a0", provider: "gusto", confirmed: {},                             planned: { "Fixed pay": 3500 } },
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

function Sidebar({ active }: { active: "v1" | "v1c" | "v1d" | "v1e" | "v1f" | "v1g" | "v1h" | "v1i" | "v1j" | "v1k" | "v1l" | "v1m" | "v1n" | "v2" }) {
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1 h-[21px] flex items-center">Monthly avg payout</p>
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Headcount change</p>
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1 h-[21px] flex items-center">Recommended projection</p>
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
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#8a8fa8]">via <ProviderLogo id={member.provider.toLowerCase()} size={12} /> {member.provider}</span>
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1 h-[21px] flex items-center">Monthly avg payout</p>
          <p className="text-3xl font-bold text-[#1a1e35] tracking-tight">{fmt0(v1AvgMonthly)}</p>
          <p className="text-[11px] text-[#8a8fa8] mt-0.5">last 5 months</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1">Headcount change</p>
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1 h-[21px] flex items-center">Recommended projection</p>
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

function V1cBreakdownPopover({ dark = false, align = "right" }: { dark?: boolean; align?: "left" | "right" } = {}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"prediction"|"channel"|"earning">("prediction");
  const activeTab = v1cBreakdownTabs.find(t => t.key === tab)!;
  const total = activeTab.rows.reduce((s, r) => s + r.value, 0);
  return (
    <div className="relative mt-1.5">
      <button onClick={() => setOpen(o => !o)} className={`flex items-center gap-1 text-[11px] whitespace-nowrap transition-colors select-none ${dark ? "text-[#1a1e35] hover:text-[#0168dd]" : "text-[#0168dd] hover:text-[#0057bb]"}`}>
        View breakdown <ChevronDown size={11} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className={`absolute top-6 ${align === "left" ? "left-0" : "right-0"} z-30 bg-white rounded-lg border border-[#e8eaf0] shadow-xl w-72 overflow-hidden`}>
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
    { label: "Headcount change", pct: v1cMemberPct, amt: v1cMemberAmt, color: "#10b981" },
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
          <h2 className="text-[15px] font-semibold text-[#1a1e35] mb-1">
            {initial ? "Edit adjustment" : "Add adjustment"}
          </h2>
          <p className="text-[12px] text-[#8a8fa8] leading-snug mb-5">
            This estimate is built from your payment history, so it can miss one-offs. Nudge it up or down — add a buffer to stay covered, or reduce it for a cost that won't repeat.
          </p>

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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1 h-[21px] flex items-center">Monthly avg payout</p>
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
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] h-[21px] flex items-center">Adjustments</p>
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
              { label: "Headcount change", pct: v1cMemberPct, note: `${v1CurrMembers} this cycle vs avg ${v1AvgMembers}`, positive: true },
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1 h-[21px] flex items-center">Recommended projection</p>
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
  if (id === "export") return <FileSpreadsheet size={size} className="text-[#1a1e35]" style={{ flexShrink: 0 }} />;
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
      <rect width="32" height="32" rx="8" fill="#e8eaf0"/>
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
                      {showBars && (
                        <div className="h-1.5 bg-[#f0f1f5] rounded-full overflow-hidden">
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
                    {showBars && p.status !== "no-connection" && p.balance !== undefined && p.needed !== undefined && (
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
        <div key={i} className="flex-1 bg-[#eef0f4] rounded-t" style={{ height: `${heights[i % heights.length]}%` }} />
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
      {/* ── Card header — global range control governs the whole card ─────── */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e8eaf0] bg-[#f9f9fc] flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#1a1e35]">Predictable Cash Flow</span>
          <span className="text-xs text-[#8a8fa8]">· <span className="font-semibold text-[#0168dd]">{headerPeriod}</span></span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#f0f1f5] rounded-md p-0.5">
            {(["1M","3M","6M","12M"] as V1eRange[]).map(r => (
              <button key={r} onClick={() => applyRange(r)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${range === r ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="relative flex items-center gap-1 text-[11px]">
            <button onClick={() => { if (is1M && !drillMonth) stepMonth(-1); }}
              disabled={is1M && !drillMonth && oneMonthIdx <= 0}
              className="p-0.5 rounded text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#eef0f4] transition-colors disabled:opacity-30 disabled:hover:bg-transparent">{chevLeft}</button>
            {drillMonth ? (
              <span className="font-medium text-[#1a1e35] min-w-[130px] text-center">{drillMonth} — weekly</span>
            ) : is1M ? (
              <button onClick={() => setMonthPickerOpen(o => !o)}
                className="text-[11px] font-medium text-[#1a1e35] min-w-[130px] text-center hover:bg-[#eef0f4] rounded px-2 py-0.5 flex items-center justify-center gap-1 transition-colors">
                {v1eFullMonthLabel(oneMonth)}
                <ChevronDown size={11} className={`text-[#8a8fa8] transition-transform ${monthPickerOpen ? "rotate-180" : ""}`} />
              </button>
            ) : (
              <span className="font-medium text-[#1a1e35] min-w-[130px] text-center">{cfg.periodLabel}</span>
            )}
            <button onClick={() => { if (is1M && !drillMonth) stepMonth(1); }}
              disabled={is1M && !drillMonth && oneMonthIdx >= v1e12mBars.length - 1}
              className="p-0.5 rounded text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#eef0f4] transition-colors disabled:opacity-30 disabled:hover:bg-transparent">{chevRight}</button>
            {monthPickerOpen && is1M && !drillMonth && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMonthPickerOpen(false)} />
                <div className="absolute top-8 left-7 z-30 bg-white rounded-lg border border-[#e8eaf0] shadow-xl py-1 w-40 max-h-56 overflow-y-auto">
                  {v1e12mBars.map(b => (
                    <button key={b.label} onClick={() => { setOneMonth(b.label); setMonthPickerOpen(false); setLoading(true); setTimeout(() => setLoading(false), 550); }}
                      className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${b.label === oneMonth ? "bg-[#eef3ff] text-[#0168dd] font-medium" : "text-[#1a1e35] hover:bg-[#f5f6fa]"}`}>
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
      <div className="grid grid-cols-3 divide-x divide-[#e8eaf0] border-b border-[#e8eaf0]">
        {/* Card 1 — base */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1 h-[21px] flex items-center">Monthly avg payout</p>
          <p className="text-[10px] text-[#8a8fa8] leading-snug">The average of what you actually paid out over the last {cfg.lookback} — the baseline for this forecast.</p>
          <p className="text-3xl font-bold text-[#1a1e35] tracking-tight mt-2">{fmt0(baseline)}</p>
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
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] h-[21px] flex items-center">Adjustments</p>
            <button onClick={() => { setEditingAdj(null); setShowAddDialog(true); }}
              className="flex items-center gap-0.5 text-[10px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2 py-0.5 hover:bg-[#0168dd]/5 transition-colors select-none">
              <Plus size={10} /> Add adjustment
            </button>
          </div>
          <p className="text-[10px] text-[#8a8fa8] leading-snug mb-2">Applied on top of your baseline (member changes, seasonality, and manual adjustments).</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${adjPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>{adjPct >= 0 ? "+" : ""}{adjPct}%</span>
            {adjPct >= 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-400" />}
          </div>
          <p className="text-[10px] text-[#8a8fa8] mb-1">{adjCompare}</p>
          <div className="mt-2 divide-y divide-[#f0f1f5]">
            {([
              { label: "Headcount change", pct: memberPct, note: memberNote, positive: true },
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1 h-[21px] flex items-center">Recommended projection</p>
          <p className="text-[10px] text-[#8a8fa8] leading-snug">An estimate from your payment history — not a guaranteed figure. Add a buffer, or <a href="#" onClick={e => e.preventDefault()} className="font-medium text-[#5b607a] underline decoration-dotted decoration-[#b0b4c5] underline-offset-2 hover:text-[#1a1e35] transition-colors">see how to improve accuracy</a>.</p>
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
            <div className="flex justify-between text-[10px] text-[#8a8fa8] mt-0.5">
              <span>{fmt0(baseline)}/mo avg</span>
              <span>{fmt0(adjProj)}/mo{is1M ? "" : " avg"}</span>
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
            {([["source","Confirmed vs. projected"],["channel","Payout method"],["type","Payroll breakdown"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setSegTab(id)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${segTab === id ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart-level control — YoY side-by-side comparison (12M only) */}
        {range === "12M" && (
          <div className="flex items-center justify-end my-3">
            <button onClick={() => setShowYoY(p => !p)} className="flex items-center gap-1.5 text-[10px] select-none cursor-pointer">
              <span className={`relative w-6 h-3.5 rounded-full transition-colors flex-shrink-0 ${showYoY ? "bg-[#0168dd]" : "bg-[#c8cad4]"}`}>
                <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform ${showYoY ? "translate-x-2.5" : "translate-x-0.5"}`} />
              </span>
              <span className="text-[#8a8fa8]">vs last year</span>
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
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-[11px]">
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
                  radius={idx === weekSegBars.length - 1 ? [3, 3, 0, 0] : undefined}>
                  {idx === weekSegBars.length - 1 && (
                    <LabelList dataKey="total" position="top" offset={6}
                      formatter={(v: number) => `$${Math.round(v / 1000)}k`}
                      style={{ fontSize: 10, fontWeight: 600, fill: "#5b607a" }} />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={monthlyRows} barCategoryGap="28%" margin={{ top: 20, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#f0f1f5" />
              <XAxis dataKey="label" tick={{ fontSize: range === "12M" ? 9 : 10, fill: "#8a8fa8" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#8a8fa8" }} tickFormatter={(v: number) => `$${Math.round(v/1000)}k`} axisLine={false} tickLine={false} width={36} />
              <Tooltip cursor={{ fill: "#f5f6fa" }} content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                const items = monthSegBars.map(sb => ({ ...sb, value: (d[sb.key] ?? 0) as number })).filter(i => i.value > 0);
                const total = items.reduce((s, i) => s + i.value, 0);
                return (
                  <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs min-w-[180px]">
                    <p className="font-semibold text-[#1a1e35] mb-1.5">{d.label}</p>
                    {items.map(i => (
                      <div key={i.key} className="flex justify-between gap-4 py-0.5">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: i.color }} /><span className="text-[#8a8fa8]">{i.label}</span></span>
                        <span className="font-medium text-[#1a1e35]">{fmt0(i.value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e8eaf0]">
                      <span className="text-[#8a8fa8]">Total</span>
                      <span className="font-semibold text-[#1a1e35]">{fmt0(total)}</span>
                    </div>
                    {showYoY && (d.yoy ?? 0) > 0 && (
                      <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e8eaf0]">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: "#c8cad4" }} /><span className="text-[#8a8fa8]">Last year · {v1ePrevYearLabel(d.label)}</span></span>
                        <span className="font-medium text-[#1a1e35]">{fmt0(d.yoy)}</span>
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
                      style={{ fontSize: 10, fontWeight: 600, fill: "#5b607a" }} />
                  )}
                </Bar>
              ))}
              {showYoY && range === "12M" && (
                <Bar dataKey="yoy" stackId="prev" fill="#c8cad4" name="Last year" radius={[3, 3, 0, 0]} isAnimationActive={false} />
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
              {v1SegLegendInfo[sb.label] && <InfoTip text={v1SegLegendInfo[sb.label]} />}
            </span>
          ))}
          {showYoY && !isWeekly && range === "12M" && (
            <span className="flex items-center gap-1 text-[10px] text-[#8a8fa8]">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: "#c8cad4" }} />
              Last year (same month)
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
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
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
      {/* ══ SUMMARY CARD — fixed to the current month ══════════════════════ */}
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e8eaf0] bg-[#f9f9fc]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1a1e35]">Predictable Cash Flow</span>
            <span className="text-xs text-[#8a8fa8]">· <span className="font-semibold text-[#0168dd]">{v1eFullMonthLabel("Jun '26")}</span> · this month</span>
          </div>
          <ExportDropdown />
        </div>
      <div className="grid grid-cols-3 divide-x divide-[#e8eaf0]">
        {/* Card 1 — base */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1 h-[21px] flex items-center">Monthly avg payout</p>
          <p className="text-[10px] text-[#8a8fa8] leading-snug">The average of what you actually paid out over the last 5 months — the baseline for this forecast.</p>
          <p className="text-3xl font-bold text-[#1a1e35] tracking-tight mt-2">{fmt0(v1AvgMonthly)}</p>
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
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] h-[21px] flex items-center">Adjustments</p>
            <button onClick={() => { setEditingAdj(null); setShowAddDialog(true); }}
              className="flex items-center gap-0.5 text-[10px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2 py-0.5 hover:bg-[#0168dd]/5 transition-colors select-none">
              <Plus size={10} /> Add adjustment
            </button>
          </div>
          <p className="text-[10px] text-[#8a8fa8] leading-snug mb-2">Applied on top of your baseline (member changes, seasonality, and manual adjustments).</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${adjPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>{adjPct >= 0 ? "+" : ""}{adjPct}%</span>
            {adjPct >= 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-400" />}
          </div>
          <div className="mt-2 divide-y divide-[#f0f1f5]">
            {([
              { label: "Headcount change", pct: memberPct, note: memberNote, positive: true },
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1 h-[21px] flex items-center">Recommended projection</p>
          <p className="text-[10px] text-[#8a8fa8] leading-snug">An estimate from your payment history — not a guaranteed figure. Add a buffer, or <a href="#" onClick={e => e.preventDefault()} className="font-medium text-[#5b607a] underline decoration-dotted decoration-[#b0b4c5] underline-offset-2 hover:text-[#1a1e35] transition-colors">see how to improve accuracy</a>.</p>
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

      </div>{/* ══ end SUMMARY CARD ══ */}

      {/* ══ CHART CARD — separate explorer with its own range control ══════ */}
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e8eaf0] bg-[#f9f9fc] flex-wrap">
          <div>
            <p className="text-sm font-semibold text-[#1a1e35]">Explore your payments over time</p>
            <p className="text-[11px] text-[#8a8fa8]">Projected payouts ahead — browsing here doesn't change the numbers above.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#f0f1f5] rounded-md p-0.5">
              {(["1M","3M","6M","12M"] as V1eRange[]).map(r => (
                <button key={r} onClick={() => applyRange(r)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${range === r ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="relative flex items-center gap-1 text-[11px]">
              <button onClick={() => { if (is1M && !drillMonth) stepMonth(-1); }}
                disabled={is1M && !drillMonth && oneMonthIdx <= 0}
                className="p-0.5 rounded text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#eef0f4] transition-colors disabled:opacity-30 disabled:hover:bg-transparent">{chevLeft}</button>
              {drillMonth ? (
                <span className="font-medium text-[#1a1e35] min-w-[130px] text-center">{drillMonth} — weekly</span>
              ) : is1M ? (
                <button onClick={() => setMonthPickerOpen(o => !o)}
                  className="text-[11px] font-medium text-[#1a1e35] min-w-[130px] text-center hover:bg-[#eef0f4] rounded px-2 py-0.5 flex items-center justify-center gap-1 transition-colors">
                  {v1eFullMonthLabel(oneMonth)}
                  <ChevronDown size={11} className={`text-[#8a8fa8] transition-transform ${monthPickerOpen ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <span className="font-medium text-[#1a1e35] min-w-[130px] text-center">{cfg.periodLabel}</span>
              )}
              <button onClick={() => { if (is1M && !drillMonth) stepMonth(1); }}
                disabled={is1M && !drillMonth && oneMonthIdx >= v1eMonthNav.length - 1}
                className="p-0.5 rounded text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#eef0f4] transition-colors disabled:opacity-30 disabled:hover:bg-transparent">{chevRight}</button>
              {monthPickerOpen && is1M && !drillMonth && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMonthPickerOpen(false)} />
                  <div className="absolute top-8 left-7 z-30 bg-white rounded-lg border border-[#e8eaf0] shadow-xl py-1 w-40 max-h-56 overflow-y-auto">
                    {v1eMonthNav.map(b => (
                      <button key={b.label} onClick={() => { setOneMonth(b.label); setMonthPickerOpen(false); setLoading(true); setTimeout(() => setLoading(false), 550); }}
                        className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${b.label === oneMonth ? "bg-[#eef3ff] text-[#0168dd] font-medium" : "text-[#1a1e35] hover:bg-[#f5f6fa]"}`}>
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
            <p className="text-[11px] text-[#8a8fa8]">{chartCaption}</p>
          </div>
          <div className="flex items-center bg-[#f0f1f5] rounded-md p-0.5 flex-shrink-0">
            {([["source","Confirmed vs. projected"],["channel","Payout method"],["type","Payroll breakdown"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setSegTab(id)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${segTab === id ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart-level control — YoY side-by-side comparison (12M only) */}
        {range === "12M" && (
          <div className="flex items-center justify-end my-3">
            <button onClick={() => setShowYoY(p => !p)} className="flex items-center gap-1.5 text-[10px] select-none cursor-pointer">
              <span className={`relative w-6 h-3.5 rounded-full transition-colors flex-shrink-0 ${showYoY ? "bg-[#0168dd]" : "bg-[#c8cad4]"}`}>
                <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform ${showYoY ? "translate-x-2.5" : "translate-x-0.5"}`} />
              </span>
              <span className="text-[#8a8fa8]">vs last year</span>
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
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-[11px]">
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
                  radius={idx === weekSegBars.length - 1 ? [3, 3, 0, 0] : undefined}>
                  {idx === weekSegBars.length - 1 && (
                    <LabelList dataKey="total" position="top" offset={6}
                      formatter={(v: number) => `$${Math.round(v / 1000)}k`}
                      style={{ fontSize: 10, fontWeight: 600, fill: "#5b607a" }} />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={monthlyRows} barCategoryGap="28%" margin={{ top: 20, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#f0f1f5" />
              <XAxis dataKey="label" tick={{ fontSize: range === "12M" ? 9 : 10, fill: "#8a8fa8" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#8a8fa8" }} tickFormatter={(v: number) => `$${Math.round(v/1000)}k`} axisLine={false} tickLine={false} width={36} />
              <Tooltip cursor={{ fill: "#f5f6fa" }} content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                const items = monthSegBars.map(sb => ({ ...sb, value: (d[sb.key] ?? 0) as number })).filter(i => i.value > 0);
                const total = items.reduce((s, i) => s + i.value, 0);
                return (
                  <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs min-w-[180px]">
                    <p className="font-semibold text-[#1a1e35] mb-1.5">{d.label}</p>
                    {items.map(i => (
                      <div key={i.key} className="flex justify-between gap-4 py-0.5">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: i.color }} /><span className="text-[#8a8fa8]">{i.label}</span></span>
                        <span className="font-medium text-[#1a1e35]">{fmt0(i.value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e8eaf0]">
                      <span className="text-[#8a8fa8]">Total</span>
                      <span className="font-semibold text-[#1a1e35]">{fmt0(total)}</span>
                    </div>
                    {showYoY && (d.yoy ?? 0) > 0 && (
                      <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e8eaf0]">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: "#c8cad4" }} /><span className="text-[#8a8fa8]">Last year · {v1ePrevYearLabel(d.label)}</span></span>
                        <span className="font-medium text-[#1a1e35]">{fmt0(d.yoy)}</span>
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
                      style={{ fontSize: 10, fontWeight: 600, fill: "#5b607a" }} />
                  )}
                </Bar>
              ))}
              {showYoY && range === "12M" && (
                <Bar dataKey="yoy" stackId="prev" fill="#c8cad4" name="Last year" radius={[3, 3, 0, 0]} isAnimationActive={false} />
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
              {v1SegLegendInfo[sb.label] && <InfoTip text={v1SegLegendInfo[sb.label]} />}
            </span>
          ))}
          {showYoY && !isWeekly && range === "12M" && (
            <span className="flex items-center gap-1 text-[10px] text-[#8a8fa8]">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: "#c8cad4" }} />
              Last year (same month)
            </span>
          )}
          {!isWeekly && (range === "6M" || range === "12M") && (
            <span className="text-[9px] text-[#c0c3d3] italic ml-auto">Confidence fades on projected months</span>
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
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <V1fPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />
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

// ─── Version 1G — copy of Version 1F ─────────────────────────────────────────

// Wider, table-based management dialog: the whole build-up (baseline + auto drivers
// + your manual adjustments) in one editable list — add / edit / remove inline.
function V1gManageAdjustmentsDialog({
  open, onClose, base, memberPct, memberAmt, memberNote, seasonPct, seasonAmt,
  manualAdjustments, setManualAdjustments, finalTotal,
}: {
  open: boolean;
  onClose: () => void;
  base: number;
  memberPct: number; memberAmt: number; memberNote: string;
  seasonPct: number; seasonAmt: number;
  manualAdjustments: ManualAdjustment[];
  setManualAdjustments: (updater: (prev: ManualAdjustment[]) => ManualAdjustment[]) => void;
  finalTotal: number;
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
    <tr key={key} className="bg-[#f7f9fc]">
      <td className="py-2 px-3">
        <input value={dLabel} onChange={e => setDLabel(e.target.value)} placeholder="Label"
          className="w-full border border-[#e8eaf0] rounded-md px-2 py-1 text-[12px] text-[#1a1e35] focus:outline-none focus:ring-2 focus:ring-[#0168dd]/20 focus:border-[#0168dd] transition-colors" />
      </td>
      <td className="py-2 px-3">
        <div className="flex bg-[#f0f1f5] rounded-md p-0.5 w-fit">
          {(["add", "reduce"] as const).map(t => (
            <button key={t} onClick={() => setDType(t)} className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${dType === t ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8]"}`}>{t === "add" ? "Add" : "Reduce"}</button>
          ))}
        </div>
      </td>
      <td className="py-2 px-3">
        <div className="flex gap-1">
          <div className="flex bg-[#f0f1f5] rounded-md p-0.5 flex-shrink-0">
            {(["pct", "dollar"] as const).map(u => (
              <button key={u} onClick={() => setDUnit(u)} className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-all ${dUnit === u ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8]"}`}>{u === "pct" ? "%" : "$"}</button>
            ))}
          </div>
          <input value={dValue} onChange={e => setDValue(e.target.value)} inputMode="decimal" placeholder={dUnit === "pct" ? "e.g. 5" : "e.g. 5000"}
            className="w-16 border border-[#e8eaf0] rounded-md px-2 py-1 text-[12px] text-[#1a1e35] focus:outline-none focus:ring-2 focus:ring-[#0168dd]/20 focus:border-[#0168dd] transition-colors" />
        </div>
      </td>
      <td className="py-2 px-3 text-right text-[12px] font-semibold text-[#1a1e35] whitespace-nowrap">{valid ? `${dType === "add" ? "+" : "−"}${fmt0(draftDollars)}` : "—"}</td>
      <td className="py-2 px-3">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={commit} disabled={!valid} className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${valid ? "bg-[#0168dd] text-white hover:bg-[#0057bb]" : "bg-[#e8eaf0] text-[#c8cad4] cursor-not-allowed"}`}>Save</button>
          <button onClick={cancel} className="px-2 py-1 rounded-md text-[11px] font-medium text-[#8a8fa8] hover:text-[#1a1e35] transition-colors">Cancel</button>
        </div>
      </td>
    </tr>
  );

  const autoBadge = <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#f0f1f5] text-[#8a8fa8]">Auto</span>;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-white rounded-xl shadow-2xl w-[600px] max-w-full pointer-events-auto">
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#e8eaf0]">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1a1e35]">Adjustments</h2>
              <p className="text-[11px] text-[#8a8fa8] mt-0.5 max-w-[440px] leading-snug">How we get from your baseline to the recommended figure. Auto rows come from your payment history; add or remove your own below.</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-md text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors flex-shrink-0"><X size={16} /></button>
          </div>

          <div className="px-6 py-4">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] border-b border-[#e8eaf0]">
                  <th className="text-left py-2 px-3">Label</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Amount</th>
                  <th className="text-right py-2 px-3">Total</th>
                  <th className="py-2 px-3 w-[92px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f1f5]">
                <tr>
                  <td className="py-2.5 px-3 text-[#1a1e35] font-medium">Baseline <span className="text-[#8a8fa8] font-normal">· monthly avg</span></td>
                  <td className="py-2.5 px-3 text-[#8a8fa8]">—</td>
                  <td className="py-2.5 px-3 text-[#8a8fa8]">—</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#1a1e35] whitespace-nowrap">{fmt0(base)}</td>
                  <td className="py-2.5 px-3"></td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-[#1a1e35] font-medium">Headcount change <span className="text-[#8a8fa8] font-normal">· {memberNote}</span></td>
                  <td className="py-2.5 px-3">{autoBadge}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">+{memberPct}%</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 whitespace-nowrap">+{fmt0(memberAmt)}</td>
                  <td className="py-2.5 px-3"></td>
                </tr>
                {seasonPct !== 0 && (
                  <tr>
                    <td className="py-2.5 px-3 text-[#1a1e35] font-medium">Seasonality <span className="text-[#8a8fa8] font-normal">· typically above avg</span></td>
                    <td className="py-2.5 px-3">{autoBadge}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-semibold">+{seasonPct}%</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 whitespace-nowrap">+{fmt0(seasonAmt)}</td>
                    <td className="py-2.5 px-3"></td>
                  </tr>
                )}
                {manualAdjustments.map(a => (
                  draftId === a.id ? editRow(a.id) : (
                    <tr key={a.id}>
                      <td className="py-2.5 px-3 text-[#1a1e35] font-medium">{a.label}</td>
                      <td className="py-2.5 px-3"><span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${a.type === "add" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>{a.type === "add" ? "Add" : "Reduce"}</span></td>
                      <td className={`py-2.5 px-3 font-semibold ${a.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{a.type === "add" ? "+" : "−"}{a.unit === "pct" ? `${a.value}%` : fmt0(a.dollars)}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold whitespace-nowrap ${a.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{a.type === "add" ? "+" : "−"}{fmt0(a.dollars)}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => startEdit(a)} className="p-1 rounded text-[#8a8fa8] hover:text-[#0168dd] hover:bg-[#f0f1f5] transition-colors"><Pencil size={12} /></button>
                          <button onClick={() => remove(a.id)} className="p-1 rounded text-[#8a8fa8] hover:text-red-500 hover:bg-red-50 transition-colors"><X size={12} /></button>
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
                <tr className="border-t-2 border-[#e8eaf0]">
                  <td className="py-3 px-3 text-[#1a1e35] font-semibold">Estimated to fund</td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-right text-[15px] font-bold text-[#0168dd] whitespace-nowrap">{fmt0(finalTotal)}</td>
                  <td className="py-3 px-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center justify-end px-6 py-4 border-t border-[#e8eaf0]">
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#0168dd] text-white hover:bg-[#0057bb] transition-colors">Done</button>
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
    <div className="bg-white rounded-lg border border-[#e8eaf0] h-full flex flex-col">
      <div className="px-4 h-[55px] flex items-center border-b border-[#e8eaf0] bg-white rounded-t-lg">
        <p className="text-sm font-semibold text-[#1a1e35]">Fund your accounts</p>
      </div>
      <div className="px-4 divide-y divide-[#e8eaf0] flex-1">
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
                    className={`text-xs font-semibold text-[#1a1e35] ${connected ? "hover:text-[#0168dd] hover:underline" : ""} transition-colors`}
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
                    <p className="text-[10px] text-[#8a8fa8]">Balance</p>
                    <p className="text-sm font-bold text-[#1a1e35]">{fmt0(p.balance!)}</p>
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
              ) : (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide self-start bg-[#f0f1f5] text-[#c0c3d3]">not connected</span>
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
  const paidCheck = <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#10b981"/><polyline points="16.5 9 10.6 14.8 7.5 11.8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

  return (
    <div className="col-span-9 bg-white rounded-lg border border-[#e8eaf0] flex flex-col">
      <div className="px-4 h-[55px] flex items-center justify-between gap-3 border-b border-[#e8eaf0] bg-white rounded-t-lg">
        <div className="flex items-center gap-2.5">
          <p className="text-sm font-semibold text-[#1a1e35]">Add to cover</p>
          <p className="text-[11px] text-[#8a8fa8]"><span className="text-sm font-bold text-[#1a1e35]">{fmt0(totalAdd)}</span> to add</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#f0f1f5] rounded-md p-0.5">
            {([7, 15, 30] as const).map(d => (
              <button key={d} onClick={() => setWindowDays(d)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${windowDays === d ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{d}d</button>
            ))}
          </div>
          <button onClick={onViewSchedule} className="text-[11px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2.5 py-1 hover:bg-[#0168dd]/5 transition-colors select-none">View full schedule</button>
        </div>
      </div>

      <div className="px-4 py-4 flex-1">
        {/* Timeline — date cards sitting on a line */}
        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 rounded-full bg-[#c8cad4]" />
          <div className="relative flex gap-8">
            {visible.map(e => {
              const isSel = selected === e.date;
              const projected = e.tag === "projected";
              const total = v1gSum(e);
              return (
                <button key={e.date} onClick={() => setSelected(isSel ? null : e.date)}
                  className={`relative flex-1 min-w-0 text-left rounded-lg px-3 py-2.5 border transition-colors ${isSel ? "border-[#0168dd] bg-[#f0f7ff]" : projected ? "border-dashed border-[#e2e5ee] bg-white" : "border-[#e8eaf0] bg-white hover:border-[#c8cad4]"}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold whitespace-nowrap ${projected ? "text-[#8a8fa8]" : "text-[#1a1e35]"}`}>{e.dow}, {e.date}</span>
                    {e.tag === "next" && <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-[#e8f2fd] text-[#0168dd]">next</span>}
                    {e.funded && paidCheck}
                  </div>
                  <p className={`text-sm font-bold mt-1 ${e.funded || projected ? "text-[#8a8fa8]" : "text-[#5b607a]"}`}>{fmt0(total)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail — per-provider anatomy for the selected date */}
        {sel && (
          <div className="mt-4 bg-[#f9f9fc] border border-[#e8eaf0] rounded-lg px-3 py-1">
            <div className="divide-y divide-[#e8eaf0]">
              {sel.providers.map(p => {
                const meta = v1gProviderMeta[p.id];
                const bal = v1jBalances[p.id];
                const res = v1jAddFor(p.id, p.amount);
                return (
                  <div key={p.id} className="py-2 flex items-center gap-2">
                    <ProviderLogo id={p.id} size={18} />
                    <span className="text-xs font-medium text-[#1a1e35] w-20 flex-shrink-0">{meta.name}</span>
                    {sel.funded ? (
                      <>
                        <span className="text-[11px] text-[#8a8fa8] flex-1 min-w-0"></span>
                        <span className="text-[11px] text-[#8a8fa8] w-24 text-right flex-shrink-0"><span className="font-semibold text-[#1a1e35]">{fmt0(p.amount)}</span> sent</span>
                        <span className="w-28 text-right flex-shrink-0">
                          <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1 justify-end">{paidCheck} paid</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-[#8a8fa8] flex-1 min-w-0">{bal !== undefined && <>balance <span className="font-semibold text-[#1a1e35]">{fmt0(bal)}</span></>}</span>
                        <span className="text-[11px] text-[#8a8fa8] w-24 text-right flex-shrink-0"><span className="font-semibold text-[#1a1e35]">{fmt0(p.amount)}</span> due</span>
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

// Small hover tooltip on an info icon — explains a figure or label in place.
function InfoTip({ text, width = 200 }: { text: string; width?: number }) {
  return (
    <span className="group relative inline-flex align-middle leading-none">
      <Info size={11} className="text-[#b0b4c4] hover:text-[#5b607a] transition-colors cursor-help" />
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block z-30 pointer-events-none" style={{ width }}>
        <span className="block bg-[#1a1e35] text-white text-[11px] font-normal normal-case tracking-normal whitespace-normal leading-snug text-left rounded-md px-2.5 py-1.5 shadow-lg">{text}</span>
      </span>
    </span>
  );
}
const v1InfoText = {
  unknown:   "Hubstaff can't read this account's balance automatically. Check it manually in your provider account to confirm you can cover the amount due.",
  actuals:   "Payroll already paid out this period, from completed runs.",
  projected: "Our estimate of payouts still ahead, based on your payment history.",
  confirmed: "Locked in — tracked hours and overtime already recorded. Won't change.",
  planned:   "Amounts already scheduled: fixed pay, PTO / holiday, and payroll adjustments.",
  projAgg:   "An estimate of the hours and bonuses still to come — shown in aggregate, not per person.",
};
const v1SegLegendInfo: Record<string, string> = { Actuals: v1InfoText.actuals, Confirmed: v1InfoText.actuals, Projected: v1InfoText.projected };
const v1SourceLegendInfo: Record<string, string> = { Confirmed: v1InfoText.confirmed, Planned: v1InfoText.planned, "~Projected": v1InfoText.projAgg };

function V1kFundDateCard({ e, v1l = false, condensed = false, onProviderClick }: { e: V1gFundDate; v1l?: boolean; condensed?: boolean; onProviderClick?: (providerId: string) => void }) {
  const isNext = e.tag === "next";
  const projected = e.tag === "projected";
  const check = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
  const fundTotal = e.providers.reduce((s, p) => s + v1jAddFor(p.id, p.amount).amount, 0);
  const dueTotal = e.providers.reduce((s, p) => s + p.amount, 0);
  const monthDay = (e.fundBy ?? "").split(", ")[1] ?? e.fundBy;
  const shortDay = (e.fundBy ?? "").split(", ")[0];
  const weekday = v1kDowFull[shortDay] ?? "";
  const showTable = !condensed;
  const [showDialog, setShowDialog] = useState(false);

  const providerTable = (
    <table className="w-full">
      <thead>
        <tr className="text-[9px] font-semibold uppercase tracking-wide text-[#8a8fa8]">
          <th className="text-left font-semibold pb-1.5 border-b border-[#e8eaf0]">Payout method</th>
          <th className="text-right font-semibold pb-1.5 pl-4 border-b border-[#e8eaf0]">Balance</th>
          <th className="text-right font-semibold pb-1.5 pl-4 border-b border-[#e8eaf0]">Due</th>
          <th className="text-right font-semibold pb-1.5 pl-4 border-b border-[#e8eaf0]">{e.funded ? "Status" : "Fund"}</th>
        </tr>
      </thead>
      <tbody>
        {e.providers.map(p => {
          const meta = v1gProviderMeta[p.id];
          const bal = v1jBalances[p.id];
          const res = v1jAddFor(p.id, p.amount);
          const cadence = v1mProviderCycles[p.id]?.cycle ?? "Monthly";
          return (
            <tr key={p.id} className="border-b border-[#f0f1f5] last:border-0">
              <td className="py-2 pr-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ProviderLogo id={p.id} size={16} />
                  {p.id === "export" ? (
                    <span className="text-xs font-medium text-[#1a1e35] truncate">{meta.name}</span>
                  ) : (
                    <a href="#" onClick={ev => { ev.preventDefault(); onProviderClick?.(p.id); }} className="text-xs font-medium text-[#1a1e35] underline decoration-[#9aa0b4] decoration-[1.5px] underline-offset-2 hover:decoration-[#1a1e35] truncate min-w-0">
                      {meta.name}
                    </a>
                  )}
                  {v1l && <span className="text-[11px] text-[#8a8fa8] whitespace-nowrap flex-shrink-0"><span className="text-[#c8cad4] mx-1">·</span>{cadence}</span>}
                </div>
              </td>
              <td className={`py-2 pl-4 text-right whitespace-nowrap tabular-nums ${v1l ? "text-[12px] text-[#5b607a]" : "text-[11px] font-semibold text-[#5b607a]"}`}>{bal !== undefined ? fmt0(bal) : (v1l ? <span className="inline-flex items-center gap-1 justify-end text-[#a8adbf]">Unknown <InfoTip text={v1InfoText.unknown} /></span> : "—")}</td>
              <td className={`py-2 pl-4 text-right whitespace-nowrap tabular-nums ${v1l ? "text-[12px] text-[#5b607a]" : "text-[11px] font-semibold text-[#5b607a]"}`}>{fmt0(p.amount)}</td>
              <td className="py-2 pl-4 text-right whitespace-nowrap">
                {e.funded ? (
                  <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 justify-end">{check} paid</span>
                ) : res.kind === "covered" ? (
                  <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 justify-end">{check} covered</span>
                ) : (
                  <span className={v1l ? "text-[12px] text-[#1a1e35] tabular-nums" : "text-xs font-bold text-amber-600"}>{fmt0(res.amount)}</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className={`rounded-lg border bg-white px-4 py-3 flex flex-col h-full ${isNext ? "border-[#c0c3d3]" : "border-[#e8eaf0]"}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={condensed ? "whitespace-nowrap min-w-0" : "min-w-0"}>
          {v1l && <span className="text-sm text-[#8a8fa8] whitespace-nowrap">Fund by </span>}
          <span className={`text-sm font-bold whitespace-nowrap ${projected ? "text-[#8a8fa8]" : "text-[#1a1e35]"}`}>{monthDay}</span>
          <span className="text-sm text-[#8a8fa8] whitespace-nowrap">{v1l ? ` · ${shortDay}` : `, ${weekday}`}</span>
          {condensed && isNext && <>{" "}<span className="inline-flex items-center gap-1 align-middle text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e8f2fd] text-[#0168dd]"><CalendarDays size={10} /> next</span></>}
          {condensed && projected && <>{" "}<span className="align-middle text-[10px] text-[#c0c3d3]">projected</span></>}
          {!v1l && <>{" "}<span className="whitespace-nowrap"><span className="text-[#c8cad4] mr-1.5">·</span><span className={`text-[11px] ${e.funded ? "text-emerald-600 font-medium" : "text-[#8a8fa8]"}`}>{e.funded ? "Paid" : "Fund deadline"}</span></span></>}
        </p>
        {condensed ? (
          <button onClick={() => setShowDialog(true)} className="text-[11px] font-medium text-[#0168dd] hover:text-[#0057bb] transition-colors select-none flex-shrink-0">View details</button>
        ) : isNext ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e8f2fd] text-[#0168dd] flex-shrink-0"><CalendarDays size={10} /> next</span>
        ) : projected ? (
          <span className="text-[10px] text-[#c0c3d3] flex-shrink-0 mt-0.5">projected</span>
        ) : null}
      </div>
      <p className="text-[11px] text-[#8a8fa8]">{v1l ? <>Cycle ends {monthDay} · triggers {e.date}</> : <>Payroll runs {e.date} · paid ~{e.paidOn}</>}</p>

      {showTable && <div className="mt-3">{providerTable}</div>}

      <div className={`${showTable ? "mt-auto" : "mt-4"} pt-2 border-t border-[#e8eaf0] flex items-center justify-between gap-2`}>
        <span className={`text-[#1a1e35] ${v1l ? "text-[12px] font-medium" : "text-[11px] font-semibold"}`}>{e.funded ? "Total paid" : "Total to fund"}{condensed && <span className="font-normal text-[#8a8fa8]"> · {e.providers.length} payment method{e.providers.length > 1 ? "s" : ""}</span>}</span>
        <span className={v1l ? "text-[12px] font-semibold text-[#1a1e35] tabular-nums" : `text-xs font-bold ${e.funded ? "text-emerald-600" : "text-[#1a1e35]"}`}>{fmt0(e.funded ? dueTotal : fundTotal)}</span>
      </div>

      {showDialog && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <div className="bg-white rounded-xl shadow-2xl w-[420px] max-w-full pointer-events-auto">
              <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[#e8eaf0]">
                <div>
                  <p>
                    <span className="text-sm font-bold text-[#1a1e35]">{monthDay}</span>
                    <span className="text-sm text-[#8a8fa8]">, {weekday}</span>
                    {isNext && <>{" "}<span className="inline-flex items-center gap-1 align-middle text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e8f2fd] text-[#0168dd]"><CalendarDays size={10} /> next</span></>}
                  </p>
                  <p className="text-[11px] text-[#8a8fa8] mt-0.5">Cycle ends {monthDay} · triggers {e.date}</p>
                </div>
                <button onClick={() => setShowDialog(false)} className="p-1 rounded-md text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors flex-shrink-0"><X size={16} /></button>
              </div>
              <div className="px-5 py-3">
                {providerTable}
                <div className="mt-2 pt-2 border-t border-[#e8eaf0] flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#1a1e35]">{e.funded ? "Total paid" : "Total to fund"}</span>
                  <span className="text-sm font-bold text-[#1a1e35] tabular-nums">{fmt0(e.funded ? dueTotal : fundTotal)}</span>
                </div>
              </div>
              <div className="flex items-center justify-end px-5 py-3 border-t border-[#e8eaf0]">
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
function V1kLearnMoreDialog({ open, onClose, v1l = false }: { open: boolean; onClose: () => void; v1l?: boolean }) {
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
  const gapDef = <>What you still need to add <span className="text-[#1a1e35] font-medium">after</span> the balance. “Covered” means the balance already handles it.</>;
  const terms: [string, React.ReactNode][] = v1l
    ? [
        ["Due", "The total going out on that date (the gross payment)."],
        ["Gap to fund", gapDef],
        ["Total gap to fund", "The sum to add across all accounts for that date."],
      ]
    : [
        ["Balance", "What's in the account right now."],
        ["Due", "The total going out on that date (the gross payment)."],
        ["Fund", gapDef],
        ["Total to fund", "The sum to add across all accounts for that date."],
      ];
  const goodToKnow: React.ReactNode[] = v1l
    ? [
        "Funding transfers can take 1–3 days — add money in advance so it lands by the trigger date.",
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
        <div className="bg-white rounded-xl shadow-2xl w-[520px] max-w-full max-h-[85vh] flex flex-col pointer-events-auto">
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#e8eaf0] flex-shrink-0">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1a1e35]">How funding works</h2>
              <p className="text-[11px] text-[#8a8fa8] mt-0.5">A quick guide to the dates and amounts on this card.</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-md text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors flex-shrink-0"><X size={16} /></button>
          </div>

          <div className="px-6 py-4 overflow-y-auto space-y-5">
            {/* Timing lifecycle */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-2">Timing</p>
              {v1l && <p className="text-[11px] text-[#8a8fa8] mb-2.5 leading-snug">For the cycle ending on <span className="font-medium text-[#1a1e35]">{fundByDay}</span>, payments will be triggered on <span className="font-medium text-[#1a1e35]">{triggerDay}</span>.</p>}
              <div className="flex items-stretch gap-1.5">
                {steps.map((s, i) => (
                  <Fragment key={s.label}>
                    <div className="flex-1 rounded-lg border border-[#e8eaf0] bg-[#f9f9fc] px-2.5 py-2">
                      <p className={`text-[9px] font-semibold uppercase tracking-wide ${s.accent ? "text-amber-600" : "text-[#8a8fa8]"}`}>{s.label}</p>
                      <p className="text-sm font-bold text-[#1a1e35] mt-0.5">{s.date}</p>
                      <p className="text-[10px] text-[#8a8fa8] mt-1 leading-snug">{s.desc}</p>
                    </div>
                    {i < steps.length - 1 && <div className="flex items-center text-[#c0c3d3] flex-shrink-0"><ChevronRight size={14} /></div>}
                  </Fragment>
                ))}
              </div>
            </div>

            {/* Column glossary */}
            <div className="pt-4 border-t border-[#f0f1f5]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-2">What the columns mean</p>
              <div className="space-y-2">
                {terms.map(([term, def]) => (
                  <div key={term} className="flex gap-3">
                    <span className={`${v1l ? "w-28" : "w-24"} flex-shrink-0 text-xs font-semibold ${term === "Fund" || term === "Gap to fund" ? "text-amber-600" : "text-[#1a1e35]"}`}>{term}</span>
                    <span className="text-[11px] text-[#8a8fa8] leading-snug">{def}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Caveats */}
            <div className="pt-4 border-t border-[#f0f1f5]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-2">Good to know</p>
              <ul className="space-y-1.5 text-[11px] text-[#8a8fa8] leading-snug">
                {goodToKnow.map((t, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#c0c3d3]">•</span><span>{t}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end px-6 py-4 border-t border-[#e8eaf0] flex-shrink-0">
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#0168dd] text-white hover:bg-[#0057bb] transition-colors">Got it</button>
          </div>
        </div>
      </div>
    </>
  );
}

function V1kNextPaymentsCard({ onViewSchedule, v1l = false, condensed = false, onProviderClick }: { onViewSchedule: () => void; v1l?: boolean; condensed?: boolean; onProviderClick?: (providerId: string) => void }) {
  const upcoming = v1gFundSchedule.filter(e => !e.funded && e.daysOut > 0).slice(0, 2);
  const [showLearn, setShowLearn] = useState(false);
  const learnMoreBtn = (
    <button onClick={() => setShowLearn(true)} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5b607a] rounded-md px-2.5 py-1 hover:bg-[#f0f1f5] hover:text-[#1a1e35] transition-colors select-none"><Info size={12} /> Learn more</button>
  );
  return (
    <div className="col-span-9 bg-white rounded-lg border border-[#e8eaf0] flex flex-col">
      {v1l ? (
        /* 1L — Learn more sits next to the title; no full-schedule link */
        <div className="px-4 h-[55px] flex items-center gap-3 border-b border-[#e8eaf0] bg-white rounded-t-lg">
          <p className="text-sm font-semibold text-[#1a1e35]">Funding schedule</p>
          {learnMoreBtn}
        </div>
      ) : (
        <div className="px-4 h-[55px] flex items-center justify-between gap-3 border-b border-[#e8eaf0] bg-white rounded-t-lg">
          <p className="text-sm font-semibold text-[#1a1e35]">Funding schedule</p>
          <div className="flex items-center gap-2">
            {learnMoreBtn}
            <button onClick={onViewSchedule} className="text-[11px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2.5 py-1 hover:bg-[#0168dd]/5 transition-colors select-none">View full schedule</button>
          </div>
        </div>
      )}
      <V1kLearnMoreDialog open={showLearn} onClose={() => setShowLearn(false)} v1l={v1l} />
      <div className="px-4 py-4 flex-1">
        <div className="grid grid-cols-2 gap-4 items-stretch">
          {upcoming.map(e => <V1kFundDateCard key={e.date} e={e} v1l={v1l} condensed={condensed} onProviderClick={onProviderClick} />)}
        </div>
      </div>
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
        <div className="bg-white rounded-xl shadow-2xl w-[560px] max-w-full max-h-[82vh] flex flex-col pointer-events-auto">
          <div className="px-6 pt-5 pb-3 border-b border-[#e8eaf0] flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1a1e35]">Funding schedule</h2>
                <p className="text-[11px] text-[#8a8fa8] mt-0.5">When to fund each account · dates reflect payout delay</p>
              </div>
              <button onClick={onClose} className="p-1 rounded-md text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
            <div className="flex items-start gap-6 mt-3">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#8a8fa8] mb-1">Account</span>
                <div className="flex bg-[#f0f1f5] rounded-md p-0.5 w-fit">
                  {([["all","All"],["wise","Wise"],["paypal","PayPal"],["bitwage","Bitwage"]] as const).map(([k,label]) => (
                    <button key={k} onClick={() => setFProvider(k)} className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${fProvider===k?"bg-white text-[#0168dd] shadow-sm":"text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#8a8fa8] mb-1">Status</span>
                <div className="flex bg-[#f0f1f5] rounded-md p-0.5 w-fit">
                  {([["upcoming","All upcoming"],["unfunded","Unfunded only"]] as const).map(([k,label]) => (
                    <button key={k} onClick={() => setFStatus(k)} className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${fStatus===k?"bg-white text-[#0168dd] shadow-sm":"text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {rows.length === 0 ? (
              <p className="text-center text-[12px] text-[#8a8fa8] py-10">No funding dates match these filters.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-[4px] top-3 bottom-3 w-px bg-[#e8eaf0]" />
                <div className="space-y-4">
                  {rows.map(e => {
                    const dot = e.funded ? "bg-emerald-400" : e.tag === "next" ? "bg-[#0168dd]" : e.tag === "projected" ? "bg-[#c0c3d3]" : "bg-amber-400";
                    return (
                      <div key={e.date} className="relative pl-6">
                        <div className={`absolute left-0 top-4 w-[9px] h-[9px] rounded-full ring-2 ring-white ${dot}`} />
                        <V1kFundDateCard e={e} />
                      </div>
                    );
                  })}
                </div>
                {anyEst && <p className="text-[10px] text-[#a0a4b8] leading-snug mt-4">PayPal balance is unavailable, so its figure is the payout routed to it, not a confirmed gap.</p>}
              </div>
            )}
          </div>

          <div className="px-6 py-3 border-t border-[#e8eaf0] flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] text-[#8a8fa8]">Showing June + next payday · follows your range</span>
            <button className="flex items-center gap-1.5 text-xs font-semibold border border-[#e8eaf0] rounded-lg px-3 py-1.5 text-[#1a1e35] hover:bg-[#f5f6fa] transition-colors"><Download size={13} /> Export</button>
          </div>
        </div>
      </div>
    </>
  );
}

// 1I — read-only "How we get there": baseline + adjustment rules → total, in a dialog.
function V1iHowWeGetThereDialog({
  open, onClose, base, memberPct, memberNote, seasonPct, adjPct, total, manualAdjustments,
}: {
  open: boolean;
  onClose: () => void;
  base: number;
  memberPct: number; memberNote: string;
  seasonPct: number;
  adjPct: number; total: number;
  manualAdjustments: ManualAdjustment[];
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-white rounded-xl shadow-2xl w-[440px] max-w-full pointer-events-auto">
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#e8eaf0]">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1a1e35]">How we get there</h2>
              <p className="text-[11px] text-[#8a8fa8] mt-0.5">How your June estimate is built from your payment history.</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-md text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors flex-shrink-0"><X size={16} /></button>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* At-a-glance math: monthly average + adjustments = payout */}
            <div className="flex items-stretch gap-1.5">
              <div className="flex-1 rounded-lg border border-[#e8eaf0] bg-[#f9f9fc] px-2.5 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#8a8fa8] leading-tight">Monthly avg</p>
                <p className="text-[15px] font-bold text-[#1a1e35] mt-1.5 leading-none tracking-tight">{fmt0(base)}</p>
                <p className="text-[10px] text-[#a0a4b8] mt-1.5 leading-tight">Last 5 months</p>
              </div>
              <span className="flex items-center text-[#b0b3c5] font-semibold text-sm flex-shrink-0 px-0.5">+</span>
              <div className="flex-1 rounded-lg border border-[#e8eaf0] bg-[#f9f9fc] px-2.5 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#8a8fa8] leading-tight">Adjustments</p>
                <p className={`text-[15px] font-bold mt-1.5 leading-none tracking-tight ${adjPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>{adjPct >= 0 ? "+" : ""}{adjPct}%</p>
                <p className="text-[10px] text-[#a0a4b8] mt-1.5 leading-tight">Headcount + season</p>
              </div>
              <span className="flex items-center text-[#b0b3c5] font-semibold text-sm flex-shrink-0 px-0.5">=</span>
              <div className="flex-1 rounded-lg border border-[#bcd4f2] bg-[#f0f6ff] px-2.5 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#0168dd] leading-tight">Est. payout</p>
                <p className="text-[15px] font-bold text-[#1a1e35] mt-1.5 leading-none tracking-tight">{fmt0(total)}</p>
                <p className="text-[10px] text-[#a0a4b8] mt-1.5 leading-tight">To fund in June</p>
              </div>
            </div>

            {/* Adjustment detail */}
            <div className="pt-4 border-t border-[#f0f1f5]">
              <p className="text-[11px] text-[#8a8fa8] leading-snug">The <span className="font-semibold text-emerald-600">+{adjPct}%</span> comes from trends in your payment history:</p>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-baseline gap-2 text-[12px]">
                  <span className="font-semibold text-emerald-600 w-10 flex-shrink-0">+{memberPct}%</span>
                  <span className="text-[#1a1e35] font-medium flex-shrink-0">Headcount change</span>
                  <span className="text-[#8a8fa8] truncate">· {memberNote}</span>
                </div>
                {seasonPct !== 0 && (
                  <div className="flex items-baseline gap-2 text-[12px]">
                    <span className="font-semibold text-emerald-600 w-10 flex-shrink-0">+{seasonPct}%</span>
                    <span className="text-[#1a1e35] font-medium flex-shrink-0">Seasonality</span>
                    <span className="text-[#8a8fa8] truncate">· May is typically above average</span>
                  </div>
                )}
                {manualAdjustments.map(adj => (
                  <div key={adj.id} className="flex items-baseline gap-2 text-[12px]">
                    <span className={`font-semibold w-10 flex-shrink-0 ${adj.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{adj.type === "add" ? "+" : "−"}{adj.unit === "pct" ? `${adj.value}%` : `≈${Math.round(adj.pct)}%`}</span>
                    <span className="text-[#1a1e35] font-medium truncate">{adj.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#8a8fa8] mt-2 leading-snug">Applied on top of your {fmt0(base)} monthly average to reach <span className="font-semibold text-[#1a1e35]">{fmt0(total)}</span>.</p>
            </div>

            {/* Caveat */}
            <p className="text-[11px] text-[#a0a4b8] leading-snug">{fmt0(total)} is an estimate from your payment history — not a guaranteed figure. Add a buffer, or <a href="#" onClick={e => e.preventDefault()} className="font-medium text-[#8a8fa8] underline decoration-dotted decoration-[#c0c3d3] underline-offset-2 hover:text-[#1a1e35] transition-colors">see how to improve accuracy</a>.</p>
          </div>

          <div className="flex items-center justify-end px-6 py-4 border-t border-[#e8eaf0]">
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#0168dd] text-white hover:bg-[#0057bb] transition-colors">Done</button>
          </div>
        </div>
      </div>
    </>
  );
}

function V1gPredictivePanel({ showStatusBreakdown, seasonalityOn, sideFund = false, v1i = false, v1j = false, v1k = false, v1l = false, v1m = false, condensed = false, onProviderClick }: { showStatusBreakdown: boolean; seasonalityOn: boolean; sideFund?: boolean; v1i?: boolean; v1j?: boolean; v1k?: boolean; v1l?: boolean; v1m?: boolean; condensed?: boolean; onProviderClick?: (providerId: string) => void }) {
  const [range, setRange]           = useState<V1eRange>(v1l || v1m ? "3M" : "1M"); // 1L/1M drop the 1M view
  const [showYoY, setShowYoY]       = useState(false);
  const [drillMonth, setDrillMonth] = useState<string | null>(null);
  const [segTab, setSegTab]         = useState<V1eSeg>("source");
  const [oneMonth, setOneMonth]     = useState<string>("Jun '26"); // selected month for the 1M view
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustment[]>([]);
  const [showManageDialog, setShowManageDialog] = useState(false); // adjustments management dialog
  const [showScheduleDialog, setShowScheduleDialog] = useState(false); // funding schedule dialog
  const [mathOpen, setMathOpen] = useState(false); // inline "+28% adjustments" detail popover
  const [showAutoPop, setShowAutoPop] = useState(false); // 1L auto-adjustments "Details" popover
  const [showMathDialog, setShowMathDialog] = useState(false); // 1I "How we get there" dialog
  const [driversOpen, setDriversOpen] = useState(false); // 1J "+X% vs typical" drivers popover
  const [showAddDialog, setShowAddDialog] = useState(false); // 1K single "Add adjustment" dialog (1F-style)
  const [editingAdj, setEditingAdj] = useState<ManualAdjustment | null>(null);

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
  const adjPctC = Math.round(v1cConfirmed / adjProj * 100);
  const adjPctP = Math.round(v1cPlanned   / adjProj * 100);

  const memberNote = `${v1CurrMembers} this cycle vs avg ${v1AvgMembers}`;

  // Monthly rows — every month split by channel + earning; confidence fades on projections.
  let futureStep = 0;
  const monthlyRows = cfg.bars.map((b, i) => {
    // Current month's bar total must equal the hero estimate (adjProj) so the chart
    // and the "Estimated payout" number agree; keep actuals-paid, flex the remainder.
    const actual = b.actual;
    const projected = b.isCurrent ? Math.max(0, adjProj - actual) : b.projected;
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
      ...b, actual, projected, total, yoy: cfg.yoy[i]?.yoy ?? 0,
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
  const statusSourceSegs: SegBar[] = [
    { key: "paid",       label: "Paid",      color: "#10b981" },
    { key: "pending",    label: "Pending",   color: "#f59e0b" },
    { key: "failed",     label: "Failed",    color: "#ef4444" },
    { key: "tracked",    label: "Planned",   color: "#0168dd" },
    { key: "projected",  label: "Projected", color: "#85baf5" },
  ];
  const weekSegBars: SegBar[] =
    segTab === "source"
      ? (showStatusBreakdown
          ? statusSourceSegs
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
      ? (v1m && showStatusBreakdown
          ? [
              { key: "paid",       label: "Paid",      color: "#10b981" },
              { key: "pending",    label: "Pending",   color: "#f59e0b" },
              { key: "failed",     label: "Failed",    color: "#ef4444" },
              { key: "planned",    label: "Planned",   color: "#0168dd" },
              { key: "projRemain", label: "Projected", color: "#85baf5" },
            ]
          : [{ key: "actual", label: "Confirmed", color: "#10b981" }, { key: "projected", label: "Projected", color: "#85baf5" }])
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
      {v1j ? (
      /* ══ 1J TOP ROW — Estimated-to-fund as its own narrow card + brief card ══ */
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* Left — Estimated to fund, sized like the old Fund-your-accounts card */}
        <div className="col-span-3 bg-white rounded-lg border border-[#e8eaf0] flex flex-col">
          <div className="px-4 h-[55px] flex items-center border-b border-[#e8eaf0] bg-white rounded-t-lg">
            <p className="text-sm font-semibold text-[#1a1e35]">Estimated payout <span className="text-[#8a8fa8] font-normal">· June 2026</span></p>
          </div>
          <div className={`px-4 py-4 flex-1 ${v1l ? "flex flex-col" : ""}`}>
            {/* non-1L keeps the explainer at the top; 1L moves it to the bottom */}
            {!v1l && <p className="text-[11px] text-[#8a8fa8] leading-snug mb-2.5">Estimated from your payment history. Gets more accurate as the month fills with real data.</p>}
            {/* number + trend chip — chip opens the drivers popover */}
            <div className={`flex items-center min-w-0 ${v1l ? "gap-4" : "gap-2"}`}>
              <p className="text-3xl font-bold text-[#1a1e35] tracking-tight leading-none">{fmt0(adjProj)}</p>
              {v1l ? (
                /* 1L — Adjust sits to the right of the number */
                <button onClick={() => { setEditingAdj(null); setShowAddDialog(true); }} className="flex-shrink-0 flex items-center gap-1 text-[11px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2.5 py-1 hover:bg-[#0168dd]/5 transition-colors select-none"><SlidersHorizontal size={12} /> Adjust</button>
              ) : (
                <div className="relative flex-shrink-0">
                  <button onClick={() => setDriversOpen(o => !o)} title="See details"
                    className="flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-[#f5f6fa] transition-colors select-none">
                    <span className={`text-sm font-semibold ${adjPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>{adjPct >= 0 ? "+" : ""}{adjPct}%</span>
                    {adjPct >= 0 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-500" />}
                    <ChevronDown size={11} className={`text-[#8a8fa8] transition-transform duration-150 ${driversOpen ? "rotate-180" : ""}`} />
                  </button>
                  {driversOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setDriversOpen(false)} />
                      <div className="absolute top-8 left-0 z-30 bg-white rounded-lg border border-[#e8eaf0] shadow-xl w-72 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">{adjPct >= 0 ? "+" : ""}{adjPct}% vs a typical month</p>
                        {/* driver rows — live list, updates when adjustments are added/removed */}
                        <div className="mt-1 divide-y divide-[#f0f1f5]">
                          {([
                            { label: "Headcount change", pct: memberPct, note: memberNote },
                            { label: "Seasonality",   pct: seasonPct, note: "May is typically above avg." },
                          ] as const).map(({ label, pct, note }) => {
                            if (label === "Seasonality" && seasonPct === 0) return null;
                            return (
                              <div key={label} className="flex items-center gap-1.5 text-[11px] py-1.5 min-w-0">
                                <span className="font-semibold flex-shrink-0 text-emerald-600">+{pct}%</span>
                                <span className="text-[#1a1e35] font-medium flex-shrink-0">{label}</span>
                                <span className="text-[#d0d3de] flex-shrink-0">—</span>
                                <span className="text-[#8a8fa8] truncate">{note}</span>
                              </div>
                            );
                          })}
                          {manualAdjustments.map(adj => (
                            <div key={adj.id} className="flex items-center gap-1.5 text-[11px] py-1.5 min-w-0">
                              <span className={`font-semibold flex-shrink-0 ${adj.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{adj.type === "add" ? "+" : "−"}{adj.unit === "pct" ? `${adj.value}%` : `≈${Math.round(adj.pct)}%`}</span>
                              <span className="text-[#1a1e35] font-medium truncate">{adj.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            {!v1l && <V1cBreakdownPopover dark align="right" />}
            {!v1l && (
            /* actions — side by side under View breakdown */
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <button onClick={() => { if (v1k) { setEditingAdj(null); setShowAddDialog(true); } else setShowManageDialog(true); }}
                className="flex items-center gap-1 text-[11px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2.5 py-1 hover:bg-[#0168dd]/5 transition-colors select-none">
                <SlidersHorizontal size={12} /> Adjust
              </button>
              <button onClick={() => setShowMathDialog(true)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#5b607a] border border-[#e8eaf0] rounded-md px-2.5 py-1 hover:bg-[#f5f6fa] hover:text-[#1a1e35] transition-colors select-none">
                <Info size={12} /> How we get there
              </button>
            </div>
            )}
            {v1l && !condensed && (
              /* 1L — the math, on-screen: base → auto adjustments → estimate → manual → total */
              <div className="mt-4 pt-3 border-t border-[#f0f1f5] space-y-1.5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">How this adds up</p>
                  <button onClick={() => setShowMathDialog(true)} className="inline-flex items-center gap-1 text-[10px] font-medium text-[#5b607a] hover:text-[#1a1e35] transition-colors select-none"><Info size={11} /> Details</button>
                </div>
                <div className="flex items-baseline gap-3 text-[12px]">
                  <span className="w-16 flex-shrink-0 font-medium text-[#1a1e35] tabular-nums">{fmt0(v1AvgMonthly)}</span>
                  <span className="text-[#8a8fa8]">Monthly average</span>
                </div>
                <div className="flex items-baseline gap-3 text-[12px]">
                  <span className="w-16 flex-shrink-0 font-medium text-emerald-600 tabular-nums">+{v1lAutoPct}%</span>
                  <span className="flex items-baseline gap-2">
                    <span className="text-[#8a8fa8]">Auto adjustments</span>
                    <span className="relative inline-flex self-center">
                      <button onClick={() => setShowAutoPop(o => !o)} className="text-[12px] font-medium text-[#8a8fa8] underline underline-offset-2 hover:text-[#1a1e35] transition-colors select-none">Details</button>
                      {showAutoPop && (<>
                        <div className="fixed inset-0 z-20" onClick={() => setShowAutoPop(false)} />
                        <div className="absolute top-6 left-0 z-30 bg-white rounded-lg border border-[#e8eaf0] shadow-xl w-64 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">+{v1lAutoPct}% vs a typical month</p>
                          <div className="mt-1 divide-y divide-[#f0f1f5]">
                            <div className="flex items-center gap-1.5 text-[11px] py-1.5 min-w-0"><span className="font-semibold flex-shrink-0 text-emerald-600">+{memberPct}%</span><span className="text-[#1a1e35] font-medium flex-shrink-0">Headcount change</span><span className="text-[#d0d3de] flex-shrink-0">—</span><span className="text-[#8a8fa8] truncate">{memberNote}</span></div>
                            {seasonPct > 0 && <div className="flex items-center gap-1.5 text-[11px] py-1.5 min-w-0"><span className="font-semibold flex-shrink-0 text-emerald-600">+{seasonPct}%</span><span className="text-[#1a1e35] font-medium flex-shrink-0">Seasonality</span><span className="text-[#d0d3de] flex-shrink-0">—</span><span className="text-[#8a8fa8] truncate">May is typically above avg.</span></div>}
                          </div>
                        </div>
                      </>)}
                    </span>
                  </span>
                </div>
                <div className="flex items-baseline gap-3 text-[12px] pt-1.5 border-t border-[#f0f1f5]">
                  <span className="w-16 flex-shrink-0 font-semibold text-[#1a1e35] tabular-nums">{fmt0(v1lEstimate)}</span>
                </div>
                {manualAdjustments.map(adj => (
                  <div key={adj.id} className="flex items-baseline gap-3 text-[12px]">
                    <span className={`w-16 flex-shrink-0 font-medium tabular-nums ${adj.type === "add" ? "text-emerald-600" : "text-red-500"}`}>{adj.type === "add" ? "+" : "−"}{adj.unit === "pct" ? `${adj.value}%` : `≈${Math.round(adj.pct)}%`}</span>
                    <span className="text-[#8a8fa8] truncate">{adj.label}</span>
                  </div>
                ))}
                {manualAdjustments.length > 0 && (
                  <div className="flex items-baseline gap-3 text-[13px] pt-1.5 border-t border-[#e8eaf0]">
                    <span className="w-16 flex-shrink-0 font-bold text-[#1a1e35] tabular-nums">{fmt0(adjProj)}</span>
                    <span className="font-bold text-[#1a1e35]">Total to fund</span>
                  </div>
                )}
              </div>
            )}
            {v1l && (
              <p className="mt-auto pt-3 border-t border-[#f0f1f5] text-[11px] text-[#8a8fa8] leading-snug">Estimated from your payment history. Gets more accurate as the month fills with real data.</p>
            )}
          </div>
        </div>
        {/* Right — Add to cover: date-card timeline + expandable provider detail */}
        {v1k
          ? <V1kNextPaymentsCard onViewSchedule={() => setShowScheduleDialog(true)} v1l={v1l} condensed={condensed} onProviderClick={onProviderClick} />
          : <V1jAddToCoverCard onViewSchedule={() => setShowScheduleDialog(true)} />}
      </div>
      ) : (
      <>
      {/* ══ TOP ROW — summary card (9/12 + 3/12 fund card in the side-fund layout) ══ */}
      <div className={sideFund ? "grid grid-cols-12 gap-6 items-stretch" : "contents"}>
      {/* ══ SUMMARY CARD — fixed to the current month ══════════════════════ */}
      <div className={`bg-white rounded-lg border border-[#e8eaf0] ${sideFund ? "col-span-9" : ""}`}>
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e8eaf0] bg-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1a1e35]">Predictable Cash Flow</span>
            <span className="text-xs text-[#8a8fa8]">· <span className="font-semibold text-[#0168dd]">{v1eFullMonthLabel("Jun '26")}</span> · this month</span>
          </div>
          <ExportDropdown />
        </div>
      <div className="grid grid-cols-2 divide-x divide-[#e8eaf0]">
        {/* Left — HERO: recommended projection for this month */}
        <div className="px-5 py-4">
          {/* ZONE 1 — the number + composition bar */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1 h-[21px] flex items-center">Estimated payout · June 2026</p>
          {v1i ? (
            <>
              {/* 1I — number + View breakdown (black), then an action row of buttons */}
              <div className="flex items-end gap-2.5 mt-4 min-w-0">
                <p className="text-3xl font-bold text-[#1a1e35] tracking-tight leading-none">{fmt0(adjProj)}</p>
                <V1cBreakdownPopover dark />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <button onClick={() => setShowManageDialog(true)}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#0168dd] border border-[#0168dd]/40 rounded-md px-2.5 py-1 hover:bg-[#0168dd]/5 transition-colors select-none">
                  <SlidersHorizontal size={12} /> Adjust
                </button>
                <button onClick={() => setShowMathDialog(true)}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#5b607a] border border-[#e8eaf0] rounded-md px-2.5 py-1 hover:bg-[#f5f6fa] hover:text-[#1a1e35] transition-colors select-none">
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
            <span className="text-[#8a8fa8]">=</span>
            <span className="font-semibold text-[#1a1e35]">{fmt0(v1AvgMonthly)}</span>
            <span className="text-[#8a8fa8]">monthly avg</span>
            <span className="text-[#8a8fa8]">{adjPct >= 0 ? "+" : "−"}</span>
            <button onClick={() => setMathOpen(o => !o)}
              className="inline-flex items-center gap-0.5 text-[11px] border-b border-dotted border-[#c0c3d3] hover:border-[#8a8fa8] transition-colors select-none">
              <span className={`font-semibold ${adjPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>{Math.abs(adjPct)}%</span>
              {adjPct >= 0 ? <TrendingUp size={11} className="text-emerald-600" /> : <TrendingDown size={11} className="text-red-500" />}
              <span className="text-[#8a8fa8]">adjustments</span>
              <ChevronDown size={10} className={`text-[#8a8fa8] transition-transform ${mathOpen ? "rotate-180" : ""}`} />
            </button>
            {mathOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMathOpen(false)} />
                <div className="absolute left-0 top-6 z-30 w-64 bg-white rounded-lg border border-[#e8eaf0] shadow-xl p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1.5">Adjustments · {adjPct >= 0 ? "+" : ""}{adjPct}%</p>
                  <div className="divide-y divide-[#f0f1f5]">
                    {([
                      { label: "Headcount change", pct: memberPct, note: memberNote },
                      { label: "Seasonality",   pct: seasonPct, note: "May is typically above avg." },
                    ] as const).map(({ label, pct, note }) => {
                      if (label === "Seasonality" && seasonPct === 0) return null;
                      return (
                        <div key={label} className="flex items-center gap-1.5 text-[11px] py-1.5 min-w-0">
                          <span className="font-semibold flex-shrink-0 text-emerald-600">+{pct}%</span>
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
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setMathOpen(false); setShowManageDialog(true); }}
                    className="mt-1.5 w-full text-center text-[11px] font-medium text-[#0168dd] hover:text-[#0057bb] transition-colors select-none py-1 border-t border-[#f0f1f5]">
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
            <div className="flex justify-between text-[10px] text-[#8a8fa8] mt-0.5">
              <span>{fmt0(v1AvgMonthly)} avg</span>
              <span>{fmt0(adjProj)} total</span>
            </div>
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 pointer-events-none">
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

          {/* ZONE 3 — caveat */}
          <p className="mt-4 pt-4 border-t border-[#f0f1f5] text-[10px] text-[#a0a4b8] leading-snug">{fmt0(adjProj)} is an estimate from your payment history — not a guaranteed figure. Add a buffer, or <a href="#" onClick={e => e.preventDefault()} className="font-medium text-[#8a8fa8] underline decoration-dotted decoration-[#c0c3d3] underline-offset-2 hover:text-[#1a1e35] transition-colors">see how to improve accuracy</a>.</p>
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
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e8eaf0] bg-white flex-wrap">
          <div>
            <p className="text-sm font-semibold text-[#1a1e35]">Explore your payments over time</p>
            <p className="text-[11px] text-[#8a8fa8]">Projected payouts ahead — browsing here doesn't change the numbers above.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#f0f1f5] rounded-md p-0.5">
              {((v1l || v1m ? ["3M","6M","12M"] : ["1M","3M","6M","12M"]) as V1eRange[]).map(r => (
                <button key={r} onClick={() => applyRange(r)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${range === r ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="relative flex items-center gap-1 text-[11px]">
              <button onClick={() => { if (is1M && !drillMonth) stepMonth(-1); }}
                disabled={is1M && !drillMonth && oneMonthIdx <= 0}
                className="p-0.5 rounded text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#eef0f4] transition-colors disabled:opacity-30 disabled:hover:bg-transparent">{chevLeft}</button>
              {drillMonth ? (
                <span className="font-medium text-[#1a1e35] min-w-[130px] text-center">{drillMonth} — weekly</span>
              ) : is1M ? (
                <button onClick={() => setMonthPickerOpen(o => !o)}
                  className="text-[11px] font-medium text-[#1a1e35] min-w-[130px] text-center hover:bg-[#eef0f4] rounded px-2 py-0.5 flex items-center justify-center gap-1 transition-colors">
                  {v1eFullMonthLabel(oneMonth)}
                  <ChevronDown size={11} className={`text-[#8a8fa8] transition-transform ${monthPickerOpen ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <span className="font-medium text-[#1a1e35] min-w-[130px] text-center">{cfg.periodLabel}</span>
              )}
              <button onClick={() => { if (is1M && !drillMonth) stepMonth(1); }}
                disabled={is1M && !drillMonth && oneMonthIdx >= v1eMonthNav.length - 1}
                className="p-0.5 rounded text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#eef0f4] transition-colors disabled:opacity-30 disabled:hover:bg-transparent">{chevRight}</button>
              {monthPickerOpen && is1M && !drillMonth && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMonthPickerOpen(false)} />
                  <div className="absolute top-8 left-7 z-30 bg-white rounded-lg border border-[#e8eaf0] shadow-xl py-1 w-40 max-h-56 overflow-y-auto">
                    {v1eMonthNav.map(b => (
                      <button key={b.label} onClick={() => { setOneMonth(b.label); setMonthPickerOpen(false); setLoading(true); setTimeout(() => setLoading(false), 550); }}
                        className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${b.label === oneMonth ? "bg-[#eef3ff] text-[#0168dd] font-medium" : "text-[#1a1e35] hover:bg-[#f5f6fa]"}`}>
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
            <p className="text-[11px] text-[#8a8fa8]">{chartCaption}</p>
          </div>
          <div className="flex items-center bg-[#f0f1f5] rounded-md p-0.5 flex-shrink-0">
            {([["source","Confirmed vs. projected"],["channel","Payout method"],["type","Payroll breakdown"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setSegTab(id)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${segTab === id ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart-level control — YoY side-by-side comparison (month ranges only) */}
        {!is1M && !drillMonth && (
          <div className="flex items-center justify-end my-3">
            <button onClick={() => setShowYoY(p => !p)} className="flex items-center gap-1.5 text-[10px] select-none cursor-pointer">
              <span className={`relative w-7 h-4 rounded-full transition-colors flex-shrink-0 inline-flex ${showYoY ? "bg-[#0168dd]" : "bg-[#c8cad4]"}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${showYoY ? "translate-x-3.5" : "translate-x-0.5"}`} />
              </span>
              <span className="text-[#8a8fa8]">vs last year</span>
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
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-[11px]">
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
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={weekRows} barCategoryGap="30%" margin={{ top: 20, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#f0f1f5" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 9, fill: "#8a8fa8" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#8a8fa8" }} tickFormatter={(v: number) => `$${Math.round(v/1000)}k`} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={renderTip(weekSegBars)} cursor={{ fill: "#f5f6fa" }} />
              {weekSegBars.map((sb, idx) => (
                <Bar key={sb.key} dataKey={sb.key} stackId="w" fill={sb.color} name={sb.label}
                  radius={idx === weekSegBars.length - 1 ? [3, 3, 0, 0] : undefined}>
                  {idx === weekSegBars.length - 1 && (
                    <LabelList dataKey="total" position="top" offset={6}
                      formatter={(v: number) => `$${Math.round(v / 1000)}k`}
                      style={{ fontSize: 10, fontWeight: 600, fill: "#5b607a" }} />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={monthlyRows} barCategoryGap="28%" margin={{ top: 20, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#f0f1f5" />
              <XAxis dataKey="label" tick={{ fontSize: range === "12M" ? 9 : 10, fill: "#8a8fa8" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#8a8fa8" }} tickFormatter={(v: number) => `$${Math.round(v/1000)}k`} axisLine={false} tickLine={false} width={36} />
              <Tooltip cursor={{ fill: "#f5f6fa" }} content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                const items = monthSegBars.map(sb => ({ ...sb, value: (d[sb.key] ?? 0) as number })).filter(i => i.value > 0);
                const total = items.reduce((s, i) => s + i.value, 0);
                return (
                  <div className="bg-white border border-[#e8eaf0] rounded-lg shadow-lg p-3 text-xs min-w-[180px]">
                    <p className="font-semibold text-[#1a1e35] mb-1.5">{d.label}</p>
                    {items.map(i => (
                      <div key={i.key} className="flex justify-between gap-4 py-0.5">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: i.color }} /><span className="text-[#8a8fa8]">{i.label}</span></span>
                        <span className="font-medium text-[#1a1e35]">{fmt0(i.value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e8eaf0]">
                      <span className="text-[#8a8fa8]">Total</span>
                      <span className="font-semibold text-[#1a1e35]">{fmt0(total)}</span>
                    </div>
                    {showYoY && (d.yoy ?? 0) > 0 && (
                      <div className="flex justify-between gap-4 py-0.5 mt-1 pt-1.5 border-t border-[#e8eaf0]">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: "#c8cad4" }} /><span className="text-[#8a8fa8]">Last year · {v1ePrevYearLabel(d.label)}</span></span>
                        <span className="font-medium text-[#1a1e35]">{fmt0(d.yoy)}</span>
                      </div>
                    )}
                  </div>
                );
              }} />
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
                      style={{ fontSize: 10, fontWeight: 600, fill: "#5b607a" }} />
                  )}
                </Bar>
              ))}
              {showYoY && (
                <Bar dataKey="yoy" stackId="prev" fill="#c8cad4" name="Last year" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  <LabelList dataKey="yoy" position="top" offset={6}
                    formatter={(v: number) => v > 0 ? `$${Math.round(v / 1000)}k` : ""}
                    style={{ fontSize: 9, fontWeight: 600, fill: "#a0a4b8" }} />
                </Bar>
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
              {v1SegLegendInfo[sb.label] && <InfoTip text={v1SegLegendInfo[sb.label]} />}
            </span>
          ))}
          {showYoY && !isWeekly && (
            <span className="flex items-center gap-1 text-[10px] text-[#8a8fa8]">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: "#c8cad4" }} />
              Last year (same month)
            </span>
          )}
          {!isWeekly && (range === "6M" || range === "12M") && (
            <span className="text-[9px] text-[#c0c3d3] italic ml-auto">Confidence fades on projected months</span>
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
};
// daysOut = days from today until the FUND-BY date (payout date minus transfer lag),
// so windows are built on when you must fund, not when the payment lands.
type V1gFundDate = { date: string; dow: string; daysOut: number; tag?: "next" | "projected"; funded?: boolean; fundBy?: string; paidOn?: string; providers: { id: string; amount: number }[] };
const v1gFundSchedule: V1gFundDate[] = [
  { date: "Jun 8",  dow: "Mon", daysOut: -12, funded: true,    fundBy: "Sun, Jun 7",  paidOn: "Jun 10", providers: [{ id: "wise", amount: 12000 }, { id: "paypal", amount: 9000 }] },
  { date: "Jun 15", dow: "Mon", daysOut: -5, funded: true,     fundBy: "Sun, Jun 14", paidOn: "Jun 17", providers: [{ id: "wise", amount: 13000 }, { id: "paypal", amount: 11000 }] },
  { date: "Jun 22", dow: "Mon", daysOut: 2,  tag: "next",       fundBy: "Sun, Jun 21", paidOn: "Jun 24", providers: [{ id: "wise", amount: 15000 }, { id: "paypal", amount: 13000 }, { id: "deel", amount: 20000 }, { id: "export", amount: 12000 }] },
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
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f9f9fc] border border-[#e8eaf0] pl-1 pr-2.5 py-1">
      <ProviderLogo id={id} size={16} />
      <span className="text-[11px] font-medium text-[#1a1e35]">{meta.name}</span>
      {!meta.balanceReadable && <span title="Fund for payout · balance unavailable" className="text-[9px] text-[#8a8fa8] border-b border-dotted border-[#c0c3d3] cursor-help leading-none">est.</span>}
      <span className="text-[11px] font-bold text-[#5b607a]">+{fmt0(amount)}</span>
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
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1 h-[21px] flex items-center">Add to cover · next 7 days</p>

      {inWindow.length === 0 ? (
        <>
          <div className="mt-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="text-base font-bold text-emerald-600">Nothing to fund this week ✓</span>
          </div>
          {nextUnfunded && <p className="text-[11px] text-[#8a8fa8] mt-1.5">Next payday is {nextUnfunded.dow}, {nextUnfunded.date} — {fmt0(v1gSum(nextUnfunded))} to add.</p>}
          <div className="mt-4">{scheduleButton}</div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 mt-4">
            <div className="flex items-end gap-2 min-w-0">
              <p className="text-3xl font-bold text-[#5b607a] tracking-tight leading-none">{fmt0(total)}</p>
              <span className="text-[11px] text-[#8a8fa8] mb-0.5">this week</span>
            </div>
            {scheduleButton}
          </div>
          <div className="mt-4 relative">
            <div className="absolute left-[3px] top-2 bottom-2 w-px bg-[#e8eaf0]" />
            <div className="space-y-6">
              {inWindow.map(e => {
                const open = !collapsible || expanded.includes(e.date);
                return (
                <div key={e.date} className="relative pl-5">
                  <div className="absolute left-0 top-[5px] w-2 h-2 rounded-full bg-[#c0c3d3] ring-2 ring-white" />
                  {collapsible ? (
                    <button onClick={() => toggle(e.date)} className="flex items-center gap-1.5 w-full text-left select-none">
                      <span className="text-xs font-semibold text-[#1a1e35]">{e.dow}, {e.date}</span>
                      <span className="text-xs text-[#d0d3de]">·</span>
                      <span className="text-xs font-semibold text-[#5b607a]">{fmt0(v1gSum(e))}</span>
                      <ChevronDown size={13} className={`ml-auto text-[#8a8fa8] transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-[#1a1e35]">{e.dow}, {e.date}</span>
                      <span className="text-xs text-[#d0d3de]">·</span>
                      <span className="text-xs font-semibold text-[#5b607a]">{fmt0(v1gSum(e))}</span>
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
          <div className="px-6 pt-5 pb-3 border-b border-[#e8eaf0] flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1a1e35]">Funding schedule</h2>
                <p className="text-[11px] text-[#8a8fa8] mt-0.5">When to fund each account · dates reflect payout delay</p>
              </div>
              <button onClick={onClose} className="p-1 rounded-md text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
            <div className="flex items-start gap-6 mt-3">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#8a8fa8] mb-1">Account</span>
                <div className="flex bg-[#f0f1f5] rounded-md p-0.5 w-fit">
                  {([["all", "All"], ["wise", "Wise"], ["paypal", "PayPal"], ["bitwage", "Bitwage"]] as const).map(([k, label]) => (
                    <button key={k} onClick={() => setFProvider(k)} className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${fProvider === k ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#8a8fa8] mb-1">Status</span>
                <div className="flex bg-[#f0f1f5] rounded-md p-0.5 w-fit">
                  {([["upcoming", "All upcoming"], ["unfunded", "Unfunded only"]] as const).map(([k, label]) => (
                    <button key={k} onClick={() => setFStatus(k)} className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${fStatus === k ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
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
                <div className="mt-3 flex items-center justify-between gap-3 bg-[#f9f9fc] border border-[#e8eaf0] rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <ProviderLogo id={fProvider} size={22} />
                    <div>
                      <p className="text-xs font-semibold text-[#1a1e35]">{meta.name}</p>
                      <p className="text-[10px] text-[#8a8fa8]">{acct?.balance !== undefined
                        ? <>Balance <span className="font-semibold text-[#1a1e35]">{fmt0(acct.balance)}</span></>
                        : "Balance unavailable"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {acct?.status === "needs-funding" && shortfall !== null && shortfall > 0 && (
                      <div className="text-right">
                        <p className="text-[10px] text-[#8a8fa8]">Add to cover</p>
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
              <p className="text-center text-[12px] text-[#8a8fa8] py-10">No funding dates match these filters.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-[4px] top-3 bottom-3 w-px bg-[#e8eaf0]" />
                <div className="space-y-6">
                  {rows.map(e => {
                    const total = v1gSum(e);
                    const projected = e.tag === "projected";
                    const dot = e.funded ? "bg-emerald-400" : e.tag === "next" ? "bg-[#0168dd]" : projected ? "bg-[#c0c3d3]" : "bg-amber-400";
                    return (
                      <div key={e.date} className="relative pl-6">
                        <div className={`absolute left-0 top-[5px] w-[9px] h-[9px] rounded-full ring-2 ring-white ${dot}`} />
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${projected ? "text-[#8a8fa8]" : "text-[#1a1e35]"}`}>{e.dow}, {e.date}</span>
                            {e.tag === "next" && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#e8f2fd] text-[#0168dd]">next payday</span>}
                            {projected && <span className="text-[10px] text-[#c0c3d3]">· projected</span>}
                            {e.funded && <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">{check} funded</span>}
                          </div>
                          <span className={`text-sm font-bold ${e.funded ? "text-emerald-600" : projected ? "text-[#8a8fa8]" : "text-[#5b607a]"}`}>{fmt0(total)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {e.providers.map(p => {
                            const meta = v1gProviderMeta[p.id];
                            return (
                              <span key={p.id} className={`inline-flex items-center gap-1.5 rounded-full border pl-1 pr-2.5 py-1 bg-[#f9f9fc] ${e.funded ? "border-[#eef0f4] opacity-70" : "border-[#e8eaf0]"}`}>
                                <ProviderLogo id={p.id} size={16} />
                                <span className="text-[11px] font-medium text-[#1a1e35]">{meta.name}</span>
                                {!meta.balanceReadable && <span className="text-[9px] text-[#c0c3d3]">est.</span>}
                                <span className="text-[11px] font-bold text-[#5b607a]">+{fmt0(p.amount)}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {anyEst && (
                  <p className="text-[10px] text-[#a0a4b8] leading-snug mt-4">· est. — PayPal balance is unavailable, so the figure is the payout routed to it, not a confirmed gap.</p>
                )}
              </div>
            )}
          </div>

          {/* footer (sticky) */}
          <div className="px-6 py-3 border-t border-[#e8eaf0] flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] text-[#8a8fa8]">Showing June + next payday · follows your range</span>
            <button className="flex items-center gap-1.5 text-xs font-semibold border border-[#e8eaf0] rounded-lg px-3 py-1.5 text-[#1a1e35] hover:bg-[#f5f6fa] transition-colors"><Download size={13} /> Export</button>
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
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} />
      <FundYourAccountsPanel showBars={false} />
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

function Version1H({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} sideFund />
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

// ─── Version 1I — copy of Version 1H ─────────────────────────────────────────

function Version1I({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} sideFund v1i />
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

function Version1J({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} v1i v1j />
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

function Version1K({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [bottomTab, setBottomTab] = useState<"history"|"future">("history");
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} v1i v1j v1k />
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

// ─── Version 1L — copy of Version 1K (v1l flag reserved for divergence) ──────
function Version1L({ showStatusBreakdown, seasonalityOn }: { showStatusBreakdown: boolean; seasonalityOn: boolean }) {
  const [dense, setDense] = useState(false); // Detailed (default) vs Condensed view
  const [detailProvider, setDetailProvider] = useState<string | null>(null); // secondary "future payment" page

  // Clicking a provider on a fund card opens the in-1L future-payment detail (item E).
  if (detailProvider) return <V1lFutureDetail providerId={detailProvider} onBack={() => setDetailProvider(null)} />;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
        <div className="flex bg-[#f0f1f5] rounded-lg p-0.5">
          {([["detailed","Detailed"],["condensed","Condensed"]] as const).map(([k, label]) => {
            const active = (k === "condensed") === dense;
            return (
              <button key={k} onClick={() => setDense(k === "condensed")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${active ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
            );
          })}
        </div>
      </div>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} v1i v1j v1k v1l condensed={dense} onProviderClick={setDetailProvider} />
      {/* "Future Tracked So Far" tab retired — its detail now lives in the future-payment page (item E) */}
      <div>
        <p className="text-base font-semibold text-[#1a1e35] mb-3">Payment History</p>
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
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      {/* Detailed/Condensed toggle hidden in 1M (still available in 1L); 1M stays Detailed */}
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} v1i v1j v1k v1l v1m condensed={dense} onProviderClick={openFuture} />
      <div ref={activityRef}>
        <p className="text-base font-semibold text-[#1a1e35] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-6 border-b border-[#e8eaf0]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
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
      <h1 className="text-xl font-semibold text-[#1a1e35]">Payments report</h1>
      <V1gPredictivePanel showStatusBreakdown={showStatusBreakdown} seasonalityOn={seasonalityOn} v1i v1j v1k v1l v1m condensed={dense} onProviderClick={openFuture} />
      <div ref={activityRef}>
        <p className="text-base font-semibold text-[#1a1e35] mb-3">Payment Activity</p>
        <div className="flex items-center gap-0 mb-6 border-b border-[#e8eaf0]">
          {([["history","Payment History"],["future","Future Tracked So Far"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setBottomTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${bottomTab === id ? "border-[#0168dd] text-[#0168dd]" : "border-transparent text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
          ))}
        </div>
        {bottomTab === "history" ? <V1PaymentHistory /> : <V1mFutureTracked provider={futureProvider} period={futurePeriod} onProviderChange={setFutureProvider} onPeriodChange={setFuturePeriod} grouped />}
      </div>
    </div>
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
  const provColor = v2ProviderColors[cycle.provider] ?? "#8a8fa8";

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

  const th = "text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]";
  const cell = (v: number | undefined, deduction = false) =>
    !v ? <span className="text-[#d0d3de]">—</span>
       : deduction ? <span className="text-[#c0392b]">−{fmt0(v)}</span> : fmt0(v);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      {/* Header — same pattern as Version 2 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#8a8fa8] hover:text-[#1a1e35] transition-colors"><ArrowLeft size={14} /> Back</button>
          <div className="w-px h-4 bg-[#e8eaf0]" />
          <ProviderLogo id={providerId} size={20} />
          <span className="text-base font-semibold text-[#1a1e35]">{cycle.provider}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs border border-[#e8eaf0] rounded px-3 py-1.5 text-[#1a1e35] hover:bg-[#f5f6fa] transition-colors"><Download size={12} /> Export payment</button>
          <button className="flex items-center gap-1.5 text-xs bg-[#0168dd] text-white rounded px-3 py-1.5 hover:bg-[#0057bb] transition-colors"><ExternalLink size={12} /> Go to {cycle.provider}</button>
        </div>
      </div>
      {/* Summary card — the total, broken down by certainty and by earning type */}
      <div className="bg-white rounded-lg border border-[#e8eaf0] px-5 py-4">
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0 min-w-[150px]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">Total projected</p>
            <p className="text-3xl font-bold text-[#1a1e35] tracking-tight mt-0.5">{fmt2(total)}</p>
            <button onClick={() => setShowHow(true)} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0168dd] hover:text-[#0057bb] transition-colors mt-1"><Info size={11} /> How we get there</button>
          </div>
          <div className="flex-1">
            <div className="flex gap-5 text-[10px] mb-1.5">
              <span className="text-emerald-600 font-semibold">Confirmed {fmt2(cycle.confirmed)} ({confirmedPct}%)</span>
              <span className="text-[#0168dd] font-semibold">Planned {fmt2(cycle.planned)} ({plannedPct}%)</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden flex bg-[#eef0f5]">
              <div className="h-full bg-emerald-500" style={{ width: `${confirmedPct}%` }} />
              <div className="h-full bg-[#0168dd]" style={{ width: `${plannedPct}%` }} />
            </div>
          </div>
          <div className="flex-shrink-0 border-l border-[#e8eaf0] pl-5">
            <div className="space-y-1 text-[11px] text-[#8a8fa8]">
              <div className="flex items-center gap-1"><CalendarDays size={11} />{cycle.dateRange}</div>
              <div className="flex items-center gap-1"><Users size={11} />{cycle.members} members · {cycle.cycle}</div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#f0f1f5]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-3">By earning type</p>
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {ETS.map(e => (
              <div key={e} className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-wide text-[#8a8fa8]">{v1lEtLabel[e]}</span>
                <span className="text-[15px] font-bold tabular-nums text-[#1a1e35] mt-1 leading-none">
                  {etTotals[e] ? (e === "Deductions" ? <span className="text-[#c0392b]">−{fmt0(etTotals[e])}</span> : fmt0(etTotals[e])) : <span className="text-[#d0d3de]">—</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Breakdown — matrix: earning types × Confirmed/Planned per member; projected aggregate-only */}
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e8eaf0]">
          <p className="text-sm font-semibold text-[#1a1e35]">By member <span className="text-[#8a8fa8] font-normal">— confirmed &amp; planned pay, by earning type</span></p>
          <div className="flex items-center gap-3">
            <button onClick={() => setCollapsed(anyExpanded ? new Set(matrixMembers.map(m => m.name)) : new Set())} className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80">{anyExpanded ? "Collapse all" : "Expand all"}</button>
            <span className="w-px h-3.5 bg-[#e8eaf0]" />
            <button className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80"><Filter size={12} /> Filters</button>
            <button className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80"><Columns size={12} /> Columns</button>
            <button className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80"><Download size={12} /> Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[860px]">
          <thead>
            <tr className="border-b border-[#e8eaf0]">
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
                <tr className="border-t border-[#e8eaf0] hover:bg-[#fafbfd] cursor-pointer" onClick={() => toggle(m.name)}>
                  <td className={`${open ? "pt-3 pb-1" : "py-3"} px-5`}>
                    <div className="flex items-center gap-2">
                      <ChevronRight size={13} className={`text-[#b0b3c5] transition-transform flex-shrink-0 ${open ? "rotate-90" : ""}`} />
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: m.color }}>{m.avatar}</div>
                      <span className="font-semibold text-[#1a1e35]">{m.name}</span>
                    </div>
                  </td>
                  {ETS.map(e => <td key={e} className={`${open ? "pt-3 pb-1" : "py-3"} px-3`} />)}
                  <td className={`${open ? "pt-3 pb-1" : "py-3"} px-5 text-right font-bold text-[#1a1e35] tabular-nums`}>{fmt0(m.known)}</td>
                </tr>
                {open && (
                <>
                <tr>
                  <td className="py-1 px-5 pl-[46px]"><CertaintyLabel status="Confirmed" /></td>
                  {ETS.map(e => (
                    <td key={e} className="py-1 px-3 text-right tabular-nums text-[#5b607a]">
                      {cell(m.confirmed[e], e === "Deductions")}
                      {e === "Hourly" && m.confirmed.Hourly && m.rate && (
                        <div className="text-[10px] text-[#a0a4b8] font-normal tabular-nums">${m.rate}/hr · {m.hours}h</div>
                      )}
                    </td>
                  ))}
                  <td className="py-1 px-5 text-right tabular-nums font-medium text-[#1a1e35]">{cell(m.cTotal)}</td>
                </tr>
                <tr>
                  <td className="py-1 pb-3 px-5 pl-[46px]"><CertaintyLabel status="Planned" /></td>
                  {ETS.map(e => <td key={e} className="py-1 pb-3 px-3 text-right tabular-nums text-[#5b607a]">{cell(m.planned[e], e === "Deductions")}</td>)}
                  <td className="py-1 pb-3 px-5 text-right tabular-nums font-medium text-[#1a1e35]">{cell(m.pTotal)}</td>
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
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#e8eaf0]">
          <span className="text-[11px] text-[#8a8fa8]">Showing <span className="font-medium text-[#5b607a]">{rangeFrom}–{rangeTo}</span> of {matrixMembers.length} members</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="flex items-center justify-center w-7 h-7 rounded border border-[#e8eaf0] text-[#5b607a] hover:bg-[#f5f6fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={14} /></button>
            {Array.from({ length: pageCount }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`w-7 h-7 rounded text-[11px] font-medium transition-colors ${i === safePage ? "bg-[#0168dd] text-white" : "text-[#5b607a] hover:bg-[#f5f6fa] border border-[#e8eaf0]"}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={safePage >= pageCount - 1} className="flex items-center justify-center w-7 h-7 rounded border border-[#e8eaf0] text-[#5b607a] hover:bg-[#f5f6fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* "How we get there" — for this pay period */}
      {showHow && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowHow(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <div className="bg-white rounded-xl shadow-2xl w-[480px] max-w-full max-h-[85vh] flex flex-col pointer-events-auto">
              <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#e8eaf0] flex-shrink-0">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#1a1e35]">How we get there</h2>
                  <p className="text-[11px] text-[#8a8fa8] mt-0.5">How your {cycle.dateRange.replace(", 2026", "")} {cycle.provider} payment is built.</p>
                </div>
                <button onClick={() => setShowHow(false)} className="p-1 rounded-md text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors flex-shrink-0"><X size={16} /></button>
              </div>
              <div className="px-6 py-4 overflow-y-auto space-y-4">
                {/* the math */}
                <div className="flex items-stretch gap-1.5">
                  <div className="flex-1 rounded-lg border border-[#e8eaf0] bg-[#f9f9fc] px-2.5 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#8a8fa8] leading-tight">Typical pay period</p>
                    <p className="text-[15px] font-bold text-[#1a1e35] mt-1.5 leading-none tracking-tight">{fmt0(typical)}</p>
                    <p className="text-[10px] text-[#a0a4b8] mt-1.5 leading-tight">recent monthly avg</p>
                  </div>
                  <span className="flex items-center text-[#b0b3c5] font-semibold text-sm flex-shrink-0 px-0.5">+</span>
                  <div className="flex-1 rounded-lg border border-[#e8eaf0] bg-[#f9f9fc] px-2.5 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#8a8fa8] leading-tight">Adjustments</p>
                    <p className="text-[15px] font-bold text-emerald-600 mt-1.5 leading-none tracking-tight">+{adjPct}%</p>
                    <p className="text-[10px] text-[#a0a4b8] mt-1.5 leading-tight">headcount + season</p>
                  </div>
                  <span className="flex items-center text-[#b0b3c5] font-semibold text-sm flex-shrink-0 px-0.5">=</span>
                  <div className="flex-1 rounded-lg border border-[#bcd4f2] bg-[#f0f6ff] px-2.5 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#0168dd] leading-tight">Projected</p>
                    <p className="text-[15px] font-bold text-[#1a1e35] mt-1.5 leading-none tracking-tight">{fmt0(total)}</p>
                    <p className="text-[10px] text-[#a0a4b8] mt-1.5 leading-tight">this pay period</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#f0f1f5]">
                  <p className="text-[11px] text-[#8a8fa8] leading-snug">The <span className="font-semibold text-emerald-600">+{adjPct}%</span> comes from trends in your history:</p>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-baseline gap-2 text-[12px]"><span className="font-semibold text-emerald-600 w-10 flex-shrink-0">+{hcPct}%</span><span className="text-[#1a1e35] font-medium flex-shrink-0">Headcount change</span><span className="text-[#8a8fa8] truncate">· {cycle.members} this cycle vs avg {avgMembers}</span></div>
                    <div className="flex items-baseline gap-2 text-[12px]"><span className="font-semibold text-emerald-600 w-10 flex-shrink-0">+{seasonPct}%</span><span className="text-[#1a1e35] font-medium flex-shrink-0">Seasonality</span><span className="text-[#8a8fa8] truncate">· June is typically above average</span></div>
                  </div>
                  <p className="text-[11px] text-[#8a8fa8] mt-2 leading-snug">Applied on top of your {fmt0(typical)} typical pay period to reach <span className="font-semibold text-[#1a1e35]">{fmt0(total)}</span>.</p>
                </div>
                {/* certainty terminology */}
                <div className="pt-4 border-t border-[#f0f1f5]">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-2">What makes up the {fmt0(total)}</p>
                  <ul className="space-y-2 text-[11px] leading-snug">
                    <li className="flex gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 mt-0.5 flex-shrink-0" /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35]">Confirmed {fmt0(cycle.confirmed)}</span> — hours already tracked. Final.</span></li>
                    <li className="flex gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#0168dd] mt-0.5 flex-shrink-0" /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35]">Planned {fmt0(cycle.planned)}</span> — scheduled (PTO/holidays, adjustments, fixed pay). Committed unless cancelled.</span></li>
                  </ul>
                </div>
                <p className="text-[11px] text-[#a0a4b8] leading-snug">{fmt0(total)} is an estimate from your history — not a guaranteed figure. Add a buffer, or <a href="#" onClick={e => e.preventDefault()} className="font-medium text-[#8a8fa8] underline decoration-dotted decoration-[#c0c3d3] underline-offset-2 hover:text-[#1a1e35] transition-colors">see how to improve accuracy</a>.</p>
              </div>
              <div className="flex items-center justify-end px-6 py-4 border-t border-[#e8eaf0] flex-shrink-0">
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
function V1mFutureTracked({ provider, period, onProviderChange, onPeriodChange, grouped = false }: { provider: string; period: string; onProviderChange: (id: string) => void; onPeriodChange: (label: string) => void; grouped?: boolean }) {
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
    { label: "Confirmed",   value: confirmed, color: "#10b981" },
    { label: "Planned",     value: planned,   color: "#0168dd" },
    { label: "~Projected",  value: projected, color: "#85baf5", striped: true },
  ].filter(s => s.value > 0);
  const etSegColor: Record<string, string> = { "Fixed pay": "#6366f1", Hourly: "#0168dd", "PTO / Holiday": "#38bdf8", Additions: "#10b981", Overtime: "#f59e0b" };
  const typeOrder = ["Fixed pay", "Hourly", "PTO / Holiday", "Additions", "Overtime"] as const;
  const typePositives = typeOrder.map(k => ({ label: v1lEtLabel[k], value: etTotals[k] ?? 0, color: etSegColor[k] })).filter(s => s.value > 0);
  const typeGross = typePositives.reduce((s, x) => s + x.value, 0);
  const typeDeductions = etTotals["Deductions"] ?? 0;
  const typeTrack = typeGross + typeDeductions;

  const typical = Math.round(total / 1.28 / 100) * 100;
  const adjPct = 28, hcPct = 18, seasonPct = 10;
  const provName = v1mFutureProviderList.find(p => p.id === provider)?.name ?? "All providers";

  const PAGE = 10;
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = rows.slice(safePage * PAGE, safePage * PAGE + PAGE);
  const rangeFrom = rows.length ? safePage * PAGE + 1 : 0;
  const rangeTo = safePage * PAGE + paged.length;

  const th = "text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]";
  const cell = (v: number | undefined, deduction = false) => !v ? <span className="text-[#d0d3de]">—</span> : deduction ? <span className="text-[#c0392b]">−{fmt0(v)}</span> : fmt0(v);
  const selectProvider = (id: string) => { onProviderChange(id); onPeriodChange(v1mCurrentPeriod(id)); setProvOpen(false); setPage(0); };

  return (
    <div className="space-y-4">
      {/* Controls — labelled pay-period + payment-method selectors */}
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-end gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1.5">Period</p>
            <div className="relative">
              <button onClick={() => { setPeriodOpen(o => !o); setProvOpen(false); }} className="flex items-center justify-between gap-2 text-sm border border-[#e8eaf0] rounded-md px-3.5 py-2 bg-white text-[#1a1e35] hover:bg-[#f5f6fa] transition-colors min-w-[190px]"><span className="flex items-center gap-2"><CalendarDays size={14} className="text-[#8a8fa8]" /> {activePeriod.label}</span> <ChevronDown size={14} className="text-[#8a8fa8]" /></button>
              {periodOpen && (<>
                <div className="fixed inset-0 z-20" onClick={() => setPeriodOpen(false)} />
                <div className="absolute left-0 mt-1 z-30 bg-white border border-[#e8eaf0] rounded-lg shadow-lg py-1 min-w-[210px]">
                  <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">{cycleInfo.cycle} pay periods</p>
                  {periods.map(p => <button key={p.label} onClick={() => { onPeriodChange(p.label); setPeriodOpen(false); setPage(0); }} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[#f5f6fa] ${p.label === activePeriod.label ? "text-[#0168dd] font-medium" : "text-[#1a1e35]"}`}>{p.label}</button>)}
                </div>
              </>)}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-1.5">Payment method</p>
            <div className="relative">
              <button onClick={() => { setProvOpen(o => !o); setPeriodOpen(false); }} className="flex items-center justify-between gap-2 text-sm border border-[#e8eaf0] rounded-md px-3.5 py-2 bg-white text-[#1a1e35] hover:bg-[#f5f6fa] transition-colors min-w-[190px]"><span className="flex items-center gap-2">{!isAll && <ProviderLogo id={provider} size={16} />} {provName}</span> <ChevronDown size={14} className="text-[#8a8fa8]" /></button>
              {provOpen && (<>
                <div className="fixed inset-0 z-20" onClick={() => setProvOpen(false)} />
                <div className="absolute left-0 mt-1 z-30 bg-white border border-[#e8eaf0] rounded-lg shadow-lg py-1 min-w-[210px]">
                  {v1mFutureProviderList.map(p => <button key={p.id} onClick={() => selectProvider(p.id)} className={`w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:bg-[#f5f6fa] ${p.id === provider ? "text-[#0168dd] font-medium" : "text-[#1a1e35]"}`}>{p.id !== "all" ? <ProviderLogo id={p.id} size={14} /> : <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#0168dd,#85baf5)" }} />}{p.name}</button>)}
                </div>
              </>)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs border border-[#e8eaf0] rounded px-3 py-2 text-[#1a1e35] hover:bg-[#f5f6fa] transition-colors"><Download size={12} /> Export</button>
          {!isAll && <button className="flex items-center gap-1.5 text-xs bg-[#0168dd] text-white rounded px-3 py-2 hover:bg-[#0057bb] transition-colors"><ExternalLink size={12} /> Go to {provName}</button>}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="bg-white rounded-lg border border-[#e8eaf0] px-5 py-4">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 min-w-[150px] space-y-2"><div className="h-2.5 w-24 rounded bg-[#eef0f5]" /><div className="h-8 w-40 rounded bg-[#e8eaf0]" /><div className="h-2.5 w-28 rounded bg-[#eef0f5]" /></div>
              <div className="flex-1"><div className="h-2.5 rounded-full bg-[#eef0f5]" /></div>
              <div className="flex-shrink-0 border-l border-[#e8eaf0] pl-5 space-y-2"><div className="h-2.5 w-20 rounded bg-[#eef0f5]" /><div className="h-2.5 w-24 rounded bg-[#eef0f5]" /></div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#f0f1f5] flex flex-wrap gap-x-10 gap-y-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="space-y-1.5"><div className="h-2 w-14 rounded bg-[#eef0f5]" /><div className="h-4 w-16 rounded bg-[#e8eaf0]" /></div>)}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-[#e8eaf0] px-5 py-5 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-[#eef0f5] flex-shrink-0" /><div className="h-3 w-40 rounded bg-[#eef0f5]" /><div className="ml-auto h-3 w-16 rounded bg-[#eef0f5]" /></div>)}
          </div>
        </div>
      ) : (<>
      {/* Summary card */}
      <div className="bg-white rounded-lg border border-[#e8eaf0] px-5 py-4">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">Total projected</p>
            <p className="text-2xl font-bold text-[#1a1e35] tracking-tight mt-0.5">{fmt2(total)}</p>
            <button onClick={() => setShowHow(true)} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8a8fa8] hover:text-[#1a1e35] transition-colors mt-1"><Info size={11} /> How we get there</button>
          </div>
          <div className="flex-1 min-w-0 border-l border-[#f0f1f5] pl-6">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8]">Breakdown</p>
              <div className="flex bg-[#f0f1f5] rounded-md p-0.5">
                {([["source","Confirmed vs. projected"],["type","Payroll breakdown"]] as const).map(([k, label]) => (
                  <button key={k} onClick={() => setSegLens(k)} className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${segLens === k ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>{label}</button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[#8a8fa8] leading-snug mb-3">
              {segLens === "source" ? "How certain each amount is — confirmed and planned are already committed, while projected is still an estimate." : "What the payout is made of — fixed and hourly pay, PTO, additions and overtime, minus any deductions."}{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setShowBreakdownInfo(true); }} className="font-medium underline underline-offset-2 hover:text-[#1a1e35] transition-colors select-none">Learn more</a>
            </p>
            {segLens === "source" ? (<>
            <div className="relative h-3 rounded-full overflow-hidden flex bg-[#eef0f5]">
              {sourceSegs.map((s, i) => <div key={s.label} className="h-full" title={`${s.label} ${fmt0(s.value)}`} style={{ width: `${Math.round(s.value / total * 100)}%`, background: s.striped ? "repeating-linear-gradient(90deg,#85baf5 0px,#85baf5 5px,#bfdbfe 5px,#bfdbfe 9px)" : s.color, marginRight: i < sourceSegs.length - 1 ? 1 : 0 }} />)}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
              {sourceSegs.map(s => (
                <div key={s.label} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.striped ? "repeating-linear-gradient(45deg,#85baf5 0,#85baf5 3px,#bfdbfe 3px,#bfdbfe 5px)" : s.color }} />
                  <span className="text-[#8a8fa8]">{s.label}</span>
                  <span className="font-semibold text-[#1a1e35] tabular-nums">{fmt0(s.value)}</span>
                  {v1SourceLegendInfo[s.label] && <InfoTip text={v1SourceLegendInfo[s.label]} />}
                </div>
              ))}
            </div>
          </>) : (<>
            <div className="h-3 rounded-full overflow-hidden flex bg-[#eef0f5]">
              {typePositives.map(s => <div key={s.label} className="h-full" title={`${s.label} ${fmt0(s.value)}`} style={{ width: `${s.value / typeTrack * 100}%`, minWidth: 4, background: s.color, marginRight: 1 }} />)}
              {typeDeductions > 0 && <div className="h-full" title={`Deductions −${fmt0(typeDeductions)} (removed from gross)`} style={{ width: `${typeDeductions / typeTrack * 100}%`, minWidth: 4, background: "repeating-linear-gradient(45deg,#ef4444 0,#ef4444 3px,#fca5a5 3px,#fca5a5 6px)" }} />}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
              {typePositives.map(s => (
                <div key={s.label} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-[#8a8fa8]">{s.label}</span>
                  <span className="font-semibold text-[#1a1e35] tabular-nums">{fmt0(s.value)}</span>
                </div>
              ))}
              {typeDeductions > 0 && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: "repeating-linear-gradient(45deg,#ef4444 0,#ef4444 3px,#fca5a5 3px,#fca5a5 6px)" }} />
                  <span className="text-[#8a8fa8]">Deductions</span>
                  <span className="font-semibold text-[#c0392b] tabular-nums">−{fmt0(typeDeductions)}</span>
                </div>
              )}
            </div>
          </>)}
          </div>
        </div>
      </div>

      {/* By-member matrix */}
      <div className="bg-white rounded-lg border border-[#e8eaf0] overflow-hidden">
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-b border-[#e8eaf0]">
          {!grouped && <>
            <button onClick={() => setCollapsed(anyExpanded ? new Set(rows.map(m => m.name)) : new Set())} className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80">{anyExpanded ? "Collapse all" : "Expand all"}</button>
            <span className="w-px h-3.5 bg-[#e8eaf0]" />
          </>}
          <button className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80"><Filter size={12} /> Filters</button>
          <button className="flex items-center gap-1 text-[11px] text-[#0168dd] hover:opacity-80"><Columns size={12} /> Columns</button>
        </div>
        <div className="overflow-x-auto">
        {grouped ? (
        <table className="w-full text-xs min-w-[1020px]">
          <thead>
            <tr>
              <th rowSpan={2} className={`text-left py-2.5 px-5 align-bottom ${th}`}>Member</th>
              <th rowSpan={2} className={`text-left py-2.5 px-3 whitespace-nowrap align-bottom ${th}`}>Payment method</th>
              <th colSpan={2} className={`text-center py-2 px-3 border-l border-[#e8eaf0] ${th} text-emerald-600`}>Confirmed</th>
              <th colSpan={4} className={`text-center py-2 px-3 border-l border-[#e8eaf0] ${th} text-[#0168dd]`}>Planned</th>
              <th rowSpan={2} className={`text-right py-2.5 px-5 whitespace-nowrap align-bottom border-l border-[#e8eaf0] ${th}`}>Total</th>
            </tr>
            <tr className="border-b border-[#e8eaf0]">
              <th className={`text-right py-2 px-3 whitespace-nowrap border-l border-[#e8eaf0] ${th}`}>{v1lEtLabel["Hourly"]}</th>
              <th className={`text-right py-2 px-3 whitespace-nowrap ${th}`}>{v1lEtLabel["Overtime"]}</th>
              <th className={`text-right py-2 px-3 whitespace-nowrap border-l border-[#e8eaf0] ${th}`}>{v1lEtLabel["Fixed pay"]}</th>
              <th className={`text-right py-2 px-3 whitespace-nowrap ${th}`}>{v1lEtLabel["PTO / Holiday"]}</th>
              <th className={`text-right py-2 px-3 whitespace-nowrap ${th}`}>{v1lEtLabel["Additions"]}</th>
              <th className={`text-right py-2 px-3 whitespace-nowrap ${th}`}>{v1lEtLabel["Deductions"]}</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(m => (
              <tr key={m.name} className="border-t border-[#e8eaf0] hover:bg-[#fafbfd]">
                <td className="py-3 px-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: m.color }}>{m.avatar}</div>
                    <span className="font-semibold text-[#1a1e35]">{m.name}</span>
                  </div>
                </td>
                <td className="py-3 px-3"><span className="inline-flex items-center gap-1.5 text-[#5b607a] whitespace-nowrap"><ProviderLogo id={m.provider} size={14} />{v1gProviderMeta[m.provider]?.name ?? m.provider}</span></td>
                <td className="py-3 px-3 text-right tabular-nums text-[#5b607a] border-l border-[#f0f1f5]">
                  {cell(m.confirmed["Hourly"])}
                  {m.confirmed["Hourly"] && m.rate && (<div className="text-[10px] text-[#a0a4b8] font-normal tabular-nums">${m.rate}/hr · {m.hours}h</div>)}
                </td>
                <td className="py-3 px-3 text-right tabular-nums text-[#5b607a]">{cell(m.confirmed["Overtime"])}</td>
                <td className="py-3 px-3 text-right tabular-nums text-[#5b607a] border-l border-[#f0f1f5]">{cell(m.planned["Fixed pay"])}</td>
                <td className="py-3 px-3 text-right tabular-nums text-[#5b607a]">{cell(m.planned["PTO / Holiday"])}</td>
                <td className="py-3 px-3 text-right tabular-nums text-[#5b607a]">{cell(m.planned["Additions"])}</td>
                <td className="py-3 px-3 text-right tabular-nums text-[#5b607a]">{cell(m.planned["Deductions"], true)}</td>
                <td className="py-3 px-5 text-right font-bold text-[#1a1e35] tabular-nums border-l border-[#f0f1f5]">{fmt0(m.known)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        ) : (
        <table className="w-full text-xs min-w-[1020px]">
          <thead>
            <tr className="border-b border-[#e8eaf0]">
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
                <tr className="border-t border-[#e8eaf0] hover:bg-[#fafbfd] cursor-pointer" onClick={() => toggle(m.name)}>
                  <td className={`${open ? "pt-3 pb-1" : "py-3"} px-5`}>
                    <div className="flex items-center gap-2">
                      <ChevronRight size={13} className={`text-[#b0b3c5] transition-transform flex-shrink-0 ${open ? "rotate-90" : ""}`} />
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: m.color }}>{m.avatar}</div>
                      <span className="font-semibold text-[#1a1e35]">{m.name}</span>
                    </div>
                  </td>
                  <td className={`${open ? "pt-3 pb-1" : "py-3"} px-3`}>
                    <span className="inline-flex items-center gap-1.5 text-[#5b607a] whitespace-nowrap"><ProviderLogo id={m.provider} size={14} />{v1gProviderMeta[m.provider]?.name ?? m.provider}</span>
                  </td>
                  {ETS.map(e => <td key={e} className={`${open ? "pt-3 pb-1" : "py-3"} px-3`} />)}
                  <td className={`${open ? "pt-3 pb-1" : "py-3"} px-5 text-right font-bold text-[#1a1e35] tabular-nums`}>{fmt0(m.known)}</td>
                </tr>
                {open && (<>
                <tr>
                  <td className="py-1 px-5 pl-[46px]"><CertaintyLabel status="Confirmed" /></td>
                  <td className="py-1 px-3" />
                  {ETS.map(e => (
                    <td key={e} className="py-1 px-3 text-right tabular-nums text-[#5b607a]">
                      {cell(m.confirmed[e], e === "Deductions")}
                      {e === "Hourly" && m.confirmed.Hourly && m.rate && (<div className="text-[10px] text-[#a0a4b8] font-normal tabular-nums">${m.rate}/hr · {m.hours}h</div>)}
                    </td>
                  ))}
                  <td className="py-1 px-5 text-right tabular-nums font-medium text-[#1a1e35]">{cell(m.cTotal)}</td>
                </tr>
                <tr>
                  <td className="py-1 pb-3 px-5 pl-[46px]"><CertaintyLabel status="Planned" /></td>
                  <td className="py-1 pb-3 px-3" />
                  {ETS.map(e => <td key={e} className="py-1 pb-3 px-3 text-right tabular-nums text-[#5b607a]">{cell(m.planned[e], e === "Deductions")}</td>)}
                  <td className="py-1 pb-3 px-5 text-right tabular-nums font-medium text-[#1a1e35]">{cell(m.pTotal)}</td>
                </tr>
                </>)}
              </Fragment>
              );
            })}
          </tbody>
        </table>
        )}
        </div>
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#e8eaf0]">
          <span className="text-[11px] text-[#8a8fa8]">Showing <span className="font-medium text-[#5b607a]">{rangeFrom}–{rangeTo}</span> of {rows.length} members</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="flex items-center justify-center w-7 h-7 rounded border border-[#e8eaf0] text-[#5b607a] hover:bg-[#f5f6fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={14} /></button>
            {Array.from({ length: pageCount }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`w-7 h-7 rounded text-[11px] font-medium transition-colors ${i === safePage ? "bg-[#0168dd] text-white" : "text-[#5b607a] hover:bg-[#f5f6fa] border border-[#e8eaf0]"}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={safePage >= pageCount - 1} className="flex items-center justify-center w-7 h-7 rounded border border-[#e8eaf0] text-[#5b607a] hover:bg-[#f5f6fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
      </>)}

      {/* How we get there */}
      {showHow && (<>
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowHow(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[480px] max-w-full max-h-[85vh] flex flex-col pointer-events-auto">
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#e8eaf0] flex-shrink-0">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1a1e35]">How we get there</h2>
                <p className="text-[11px] text-[#8a8fa8] mt-0.5">How your {activePeriod.label} {isAll ? "projected payout" : provName + " payment"} is built.</p>
              </div>
              <button onClick={() => setShowHow(false)} className="p-1 rounded-md text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
            <div className="px-6 py-4 overflow-y-auto space-y-4">
              <div className="flex items-stretch gap-1.5">
                <div className="flex-1 rounded-lg border border-[#e8eaf0] bg-[#f9f9fc] px-2.5 py-2"><p className="text-[9px] font-semibold uppercase tracking-wider text-[#8a8fa8] leading-tight">Typical period</p><p className="text-[15px] font-bold text-[#1a1e35] mt-1.5 leading-none tracking-tight">{fmt0(typical)}</p><p className="text-[10px] text-[#a0a4b8] mt-1.5 leading-tight">recent monthly avg</p></div>
                <span className="flex items-center text-[#b0b3c5] font-semibold text-sm flex-shrink-0 px-0.5">+</span>
                <div className="flex-1 rounded-lg border border-[#e8eaf0] bg-[#f9f9fc] px-2.5 py-2"><p className="text-[9px] font-semibold uppercase tracking-wider text-[#8a8fa8] leading-tight">Adjustments</p><p className="text-[15px] font-bold text-emerald-600 mt-1.5 leading-none tracking-tight">+{adjPct}%</p><p className="text-[10px] text-[#a0a4b8] mt-1.5 leading-tight">headcount + season</p></div>
                <span className="flex items-center text-[#b0b3c5] font-semibold text-sm flex-shrink-0 px-0.5">=</span>
                <div className="flex-1 rounded-lg border border-[#bcd4f2] bg-[#f0f6ff] px-2.5 py-2"><p className="text-[9px] font-semibold uppercase tracking-wider text-[#0168dd] leading-tight">Projected</p><p className="text-[15px] font-bold text-[#1a1e35] mt-1.5 leading-none tracking-tight">{fmt0(total)}</p><p className="text-[10px] text-[#a0a4b8] mt-1.5 leading-tight">this period</p></div>
              </div>
              <div className="pt-4 border-t border-[#f0f1f5]">
                <p className="text-[11px] text-[#8a8fa8] leading-snug">The <span className="font-semibold text-emerald-600">+{adjPct}%</span> comes from trends in your history:</p>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-baseline gap-2 text-[12px]"><span className="font-semibold text-emerald-600 w-10 flex-shrink-0">+{hcPct}%</span><span className="text-[#1a1e35] font-medium flex-shrink-0">Headcount change</span></div>
                  <div className="flex items-baseline gap-2 text-[12px]"><span className="font-semibold text-emerald-600 w-10 flex-shrink-0">+{seasonPct}%</span><span className="text-[#1a1e35] font-medium flex-shrink-0">Seasonality</span><span className="text-[#8a8fa8] truncate">· June is typically above average</span></div>
                </div>
              </div>
              <div className="pt-4 border-t border-[#f0f1f5]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8fa8] mb-2">What makes up the {fmt0(total)}</p>
                <ul className="space-y-2 text-[11px] leading-snug">
                  <li className="flex gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 mt-0.5 flex-shrink-0" /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35]">Confirmed {fmt0(confirmed)}</span> — hours already tracked. Final.</span></li>
                  <li className="flex gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#0168dd] mt-0.5 flex-shrink-0" /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35]">Planned {fmt0(planned)}</span> — scheduled (PTO/holidays, adjustments, fixed pay). Committed unless cancelled.</span></li>
                  <li className="flex gap-2"><span className="w-2.5 h-2.5 rounded-sm mt-0.5 flex-shrink-0" style={{ background: "repeating-linear-gradient(90deg,#85baf5 0px,#85baf5 3px,#bfdbfe 3px,#bfdbfe 5px)" }} /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35]">Projected ~{fmt0(projected)}</span> — remaining hours + bonuses, estimated from history. The gap to the forecast.</span></li>
                </ul>
              </div>
              <p className="text-[11px] text-[#a0a4b8] leading-snug">{fmt0(total)} is an estimate from your history — not a guaranteed figure.</p>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-[#e8eaf0] flex-shrink-0">
              <button onClick={() => setShowHow(false)} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#0168dd] text-white hover:bg-[#0057bb] transition-colors">Done</button>
            </div>
          </div>
        </div>
      </>)}

      {/* What the breakdown means — full reference for both lenses */}
      {showBreakdownInfo && (<>
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowBreakdownInfo(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[460px] max-w-full max-h-[85vh] flex flex-col pointer-events-auto">
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#e8eaf0] flex-shrink-0">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1a1e35]">{segLens === "source" ? "Confirmed vs. projected" : "Payroll breakdown"}</h2>
              </div>
              <button onClick={() => setShowBreakdownInfo(false)} className="p-1 rounded-md text-[#8a8fa8] hover:text-[#1a1e35] hover:bg-[#f0f1f5] transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
            <div className="px-6 py-4 overflow-y-auto">
              {segLens === "source" ? (
                <>
                <p className="text-[12px] text-[#5b607a] leading-relaxed mb-4">Every amount in this period sits at one of three levels of certainty — some is already locked in, some is scheduled and expected, and the rest is still our best estimate. Together they show how much of the total you can rely on today versus what could still move before payout. Here's what each level means:</p>
                <ul className="space-y-4 text-[11px] leading-relaxed">
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] mt-1 flex-shrink-0" /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35] block mb-0.5">Confirmed</span>Time already tracked and recorded, including overtime. It's final and won't change before payout — the part you can count on. <span className="text-[#a0a4b8]">Example: 120 hours logged this cycle at $50/hr.</span></span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#0168dd] mt-1 flex-shrink-0" /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35] block mb-0.5">Planned</span>Amounts scheduled and known ahead of time: fixed salaries, approved PTO and holidays, and manual payroll adjustments. Committed unless someone cancels them. <span className="text-[#a0a4b8]">Example: a $5,000 monthly salary, approved PTO, or a −$200 correction.</span></span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "repeating-linear-gradient(90deg,#85baf5 0,#85baf5 3px,#bfdbfe 3px,#bfdbfe 5px)" }} /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35] block mb-0.5">~Projected</span>Our estimate of what's still to come this period — hours not yet logged, plus likely bonuses. Shown only as a team-wide aggregate, never assigned to a person, because it hasn't happened yet. <span className="text-[#a0a4b8]">Example: the hours left in the month.</span></span></li>
                </ul>
                </>
              ) : (
                <>
                <p className="text-[12px] text-[#5b607a] leading-relaxed mb-4">This view slices the same total by what the money actually pays for, rather than how certain it is. Each person's payout is built from a mix of earning types — regular pay, time off, and one-off extras — then any deductions are taken back out to reach the net. Here's what each part means:</p>
                <ul className="space-y-4 text-[11px] leading-relaxed">
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "#6366f1" }} /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35] block mb-0.5">Fixed pay</span>Salaried amounts that don't depend on hours worked — paid in full every cycle regardless of time tracked. <span className="text-[#a0a4b8]">Example: a $6,000/month retainer.</span></span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "#0168dd" }} /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35] block mb-0.5">Hourly pay</span>Tracked hours multiplied by the person's rate. Grows through the period as more time is logged. <span className="text-[#a0a4b8]">Example: 80 hours × $45.</span></span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "#38bdf8" }} /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35] block mb-0.5">PTO / Holiday</span>Approved paid time off and company holidays that fall in this period.</span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "#10b981" }} /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35] block mb-0.5">Additions</span>One-off extras on top of regular pay — bonuses, reimbursements, or spot rewards.</span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "#f59e0b" }} /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#1a1e35] block mb-0.5">Overtime</span>Hours worked beyond the standard schedule, usually paid at a higher rate.</span></li>
                  <li className="flex gap-2.5"><span className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0" style={{ background: "repeating-linear-gradient(45deg,#ef4444 0,#ef4444 3px,#fca5a5 3px,#fca5a5 6px)" }} /><span className="text-[#8a8fa8]"><span className="font-semibold text-[#c0392b] block mb-0.5">Deductions</span>Amounts taken out of gross pay, such as advances being repaid or corrections. Subtracted from the total and shown in red.</span></li>
                </ul>
                </>
              )}
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-[#e8eaf0] flex-shrink-0">
              <button onClick={() => setShowBreakdownInfo(false)} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#0168dd] text-white hover:bg-[#0057bb] transition-colors">Done</button>
            </div>
          </div>
        </div>
      </>)}
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

// Plain-text certainty label with a small leading dot (used in the 1L matrix).
function CertaintyLabel({ status, strong = false }: { status: "Confirmed" | "Planned" | "Projected"; strong?: boolean }) {
  const c = status === "Confirmed" ? "#10b981" : status === "Planned" ? "#0168dd" : "#85baf5";
  const projected = status === "Projected";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] ${strong ? "font-semibold text-[#1a1e35]" : "font-medium text-[#5b607a]"}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={projected ? { border: `1px dashed ${c}` } : { background: c }} />
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
  const wiseBalance = 48000;
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

export default function App() {
  const [version, setVersion] = useState<"v1"|"v1c"|"v1d"|"v1e"|"v1f"|"v1g"|"v1h"|"v1i"|"v1j"|"v1k"|"v1l"|"v1m"|"v1n"|"v2">("v1n");
  const [showStatusBreakdown, setShowStatusBreakdown] = useState(false);
  const [seasonalityOn, setSeasonalityOn] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden font-[Inter,sans-serif]">
      <Sidebar active={version} />
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f6fa]">
        <div className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-[#e8eaf0] flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-[#8a8fa8]">
            {(version === "v1" || version === "v1c" || version === "v1d" || version === "v1e" || version === "v1f" || version === "v1g" || version === "v1h" || version === "v1i" || version === "v1j" || version === "v1k" || version === "v1l" || version === "v1m" || version === "v1n") ? (
              <><span className="hover:text-[#0168dd] cursor-pointer">Reports</span><ChevronRight size={12} /><span className="text-[#1a1e35] font-medium">Payments report</span></>
            ) : (
              <><span className="hover:text-[#0168dd] cursor-pointer">Financials</span><ChevronRight size={12} /><span className="text-[#1a1e35] font-medium">Team Payments</span></>
            )}
          </div>
          <div className="flex items-center gap-3">
            {(version === "v1c" || version === "v1d" || version === "v1e" || version === "v1f" || version === "v1g" || version === "v1h" || version === "v1i" || version === "v1j" || version === "v1k" || version === "v1l" || version === "v1m" || version === "v1n") && (
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
              <button onClick={() => setVersion("v1")}  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1"  ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1</button>
              <button onClick={() => setVersion("v1c")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1c" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1C</button>
              <button onClick={() => setVersion("v1d")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1d" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1D</button>
              <button onClick={() => setVersion("v1e")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1e" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1E</button>
              <button onClick={() => setVersion("v1f")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1f" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1F</button>
              <button onClick={() => setVersion("v1g")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1g" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1G</button>
              <button onClick={() => setVersion("v1h")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1h" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1H</button>
              <button onClick={() => setVersion("v1i")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1i" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1I</button>
              <button onClick={() => setVersion("v1j")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1j" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1J</button>
              <button onClick={() => setVersion("v1k")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1k" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1K</button>
              <button onClick={() => setVersion("v1l")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1l" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1L</button>
              <button onClick={() => setVersion("v1m")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1m" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1M</button>
              <button onClick={() => setVersion("v1n")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v1n" ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>1N</button>
              <button onClick={() => setVersion("v2")}  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${version === "v2"  ? "bg-white text-[#0168dd] shadow-sm" : "text-[#8a8fa8] hover:text-[#1a1e35]"}`}>2</button>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8a8fa8]"><Clock size={13} /><span>0:00:00</span></div>
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
