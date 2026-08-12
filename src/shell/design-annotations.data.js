/* Design Annotations data — Predictable Cash Flow (Final UI). */
window.DESIGN_ANNOTATIONS_DATA = {
  pages: [
    { id: 'final', label: 'Payments report', route: '' },
  ],
  annotations: [
    {
      id: 'final-hero',
      page: 'final',
      kind: 'required',
      title: 'Estimated payout is the hero number',
      description: 'The big projected total anchors the page. It must always reconcile with the funding schedule and the chart.',
      target: '#shell-content h1',
      priority: 'high',
    },
    {
      id: 'final-sidebar-active',
      page: 'final',
      kind: 'suggestion',
      title: 'Financials → Payments is the active nav item',
      description: 'The left panel highlights the current section so users keep their bearings.',
      target: '.hs-nav-item.active',
    },
    {
      id: 'final-topbar-timer',
      page: 'final',
      kind: 'suggestion',
      title: 'Top header carries the org context',
      description: 'Timer, notifications, help, apps switcher, and the org badge live in the persistent top bar.',
      target: '.hs-timer',
    },
  ],
};
