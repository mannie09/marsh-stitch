import { Doc } from "./tokens";

export type CorporateTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  icon: string;
  screensCount: number;
  doc: Doc;
};

export const CORPORATE_TEMPLATES: CorporateTemplate[] = [
  {
    id: "executive-dashboard",
    name: "Executive KPI Dashboard",
    category: "Management & Operations",
    badge: "Popular",
    icon: "space_dashboard",
    screensCount: 3,
    description:
      "Enterprise management portal with 96dp Navigation Rail, 4 KPI metric stat cards, operational activity list, and interactive drill-down approval queue.",
    doc: {
      title: "Executive KPI Dashboard",
      brief:
        "High-level enterprise performance cockpit featuring real-time financial stats, operational SLA monitoring, and one-click manager approvals.",
      paletteKey: "purple",
      frame: "phone",
      platform: "web",
      frames: [
        {
          id: "dash_desktop",
          name: "Executive Dashboard",
          x: 0,
          y: 0,
          w: 1280,
          h: 800,
          note: "Main command center with real-time KPI metrics and priority action items.",
        },
        {
          id: "dash_approvals",
          name: "Approval Queue",
          x: 1380,
          y: 0,
          w: 1280,
          h: 800,
          note: "Manager approval workflow with one-click decision actions and audit notes.",
        },
        {
          id: "dash_mobile",
          name: "Mobile Manager View",
          x: 650,
          y: 920,
          w: 412,
          h: 892,
          note: "On-the-go responsive view with fast swipe navigation.",
          swipe: { left: "dash_approvals" },
        },
      ],
      groups: [
        // Top App Bar Desktop
        {
          id: "g_top_bar",
          x: 0,
          y: 0,
          axis: "x",
          items: [
            {
              id: "item_top_bar",
              kind: "topAppBar",
              label: "Marsh Enterprise Portal",
              icon: "grid_view",
              icon2: "notifications",
              variant: "filled",
            },
          ],
        },
        // Navigation Rail Desktop
        {
          id: "g_nav_rail",
          x: 0,
          y: 64,
          axis: "y",
          items: [
            {
              id: "item_nav_rail",
              kind: "navRail",
              label: "Navigation",
              icon: null,
              variant: "filled",
              railExpanded: true,
              tabs: [
                { icon: "dashboard", label: "Overview" },
                { icon: "analytics", label: "Analytics" },
                { icon: "pending_actions", label: "Approvals" },
                { icon: "description", label: "Reports" },
                { icon: "settings", label: "Settings" },
              ],
              selected: 0,
            },
          ],
        },
        // KPI Cards Row
        {
          id: "g_kpi_row",
          x: 136,
          y: 84,
          axis: "x",
          items: [
            {
              id: "kpi_revenue",
              kind: "card",
              label: "Total Revenue\n$2,450,800",
              supporting: "↑ +14.2% vs last quarter",
              icon: "trending_up",
              variant: "filled",
              size: 250,
            },
            {
              id: "kpi_licenses",
              kind: "card",
              label: "Active Accounts\n14,820 Users",
              supporting: "84% enterprise capacity",
              icon: "group",
              variant: "outlined",
              size: 250,
            },
            {
              id: "kpi_approvals",
              kind: "card",
              label: "Pending Approvals\n38 Requests",
              supporting: "⚠️ 6 require urgent review",
              icon: "pending_actions",
              variant: "filled",
              action: { to: "dash_approvals", transition: "slide" },
              note: "Drills down into the detailed approval queue",
              size: 250,
            },
            {
              id: "kpi_sla",
              kind: "card",
              label: "System SLA\n99.94% Uptime",
              supporting: "All microservices healthy",
              icon: "check_circle",
              variant: "elevated",
              size: 250,
            },
          ],
        },
        // Recent Activity List
        {
          id: "g_activity_list",
          x: 136,
          y: 280,
          axis: "y",
          items: [
            {
              id: "act_1",
              kind: "listItem",
              label: "INV-8921 · Cloud Migration Project",
              supporting: "$48,500 · In Progress (Lead: Cloud Ops)",
              icon: "receipt_long",
              variant: "filled",
            },
            {
              id: "act_2",
              kind: "listItem",
              label: "PO-3304 · EMEA Hardware Refresh",
              supporting: "$12,300 · Approved by Director",
              icon: "laptop_mac",
              variant: "filled",
            },
            {
              id: "act_3",
              kind: "listItem",
              label: "REQ-1029 · ISO 27001 Security Audit",
              supporting: "$8,900 · Pending Approval (Due in 2 days)",
              icon: "security",
              variant: "filled",
              action: { to: "dash_approvals", transition: "slide" },
            },
          ],
        },

        // Screen 2: Approval Queue controls
        {
          id: "g_appr_header",
          x: 1380,
          y: 0,
          axis: "x",
          items: [
            {
              id: "appr_top_bar",
              kind: "topAppBar",
              label: "Pending Approvals (38 Requests)",
              icon: "arrow_back",
              icon2: "filter_list",
              variant: "filled",
              action: { to: "dash_desktop", transition: "slideLeft" },
              note: "Returns to Executive Dashboard",
            },
          ],
        },
        {
          id: "g_appr_cards",
          x: 1420,
          y: 90,
          axis: "y",
          items: [
            {
              id: "appr_req_1",
              kind: "card",
              label: "REQ-1029: Production Access Elevation",
              supporting: "Requested by Sarah Jenkins · DevOps · High Urgency",
              icon: "admin_panel_settings",
              variant: "elevated",
            },
            {
              id: "appr_actions_1",
              kind: "button",
              label: "Approve Access",
              icon: "check",
              variant: "filled",
              action: { to: "dash_desktop", transition: "fade" },
              note: "Submits approval and returns to Dashboard",
            },
            {
              id: "appr_actions_reject",
              kind: "button",
              label: "Reject with Notes",
              icon: "close",
              variant: "outlined",
              action: { to: "dash_desktop", transition: "slideLeft" },
            },
          ],
        },

        // Screen 3: Mobile view controls
        {
          id: "g_mob_header",
          x: 650,
          y: 920,
          axis: "x",
          items: [
            {
              id: "mob_bar",
              kind: "topAppBar",
              label: "Marsh Mobile",
              icon: "menu",
              icon2: "account_circle",
              variant: "filled",
            },
          ],
        },
        {
          id: "g_mob_stat",
          x: 666,
          y: 990,
          axis: "y",
          items: [
            {
              id: "mob_card",
              kind: "card",
              label: "Q3 Performance Snapshot",
              supporting: "Revenue: $2.45M · Approvals: 38 pending",
              icon: "insights",
              variant: "filled",
            },
            {
              id: "mob_btn_review",
              kind: "button",
              label: "Review Queue (38)",
              icon: "pending_actions",
              variant: "filled",
              action: { to: "dash_approvals", transition: "slide" },
            },
          ],
        },
        {
          id: "g_mob_nav",
          x: 650,
          y: 1732,
          axis: "x",
          items: [
            {
              id: "mob_bottom_nav",
              kind: "bottomNav",
              label: "Navigation",
              icon: null,
              variant: "filled",
              tabs: [
                { icon: "dashboard", label: "Home" },
                { icon: "pending_actions", label: "Approvals" },
                { icon: "notifications", label: "Alerts" },
              ],
              selected: 0,
            },
          ],
        },
      ],
    },
  },
  {
    id: "expense-reimbursement",
    name: "Expense Reimbursement Flow",
    category: "Finance & HR",
    badge: "3 Screens",
    icon: "receipt_long",
    screensCount: 3,
    description:
      "End-to-end employee expense submission, line-item review, and manager sign-off confirmation workflow.",
    doc: {
      title: "Expense Reimbursement Flow",
      brief:
        "Fast mobile workflow for staff to submit business receipts, review line items, and receive verified payment approval.",
      paletteKey: "green",
      frame: "phone",
      platform: "android",
      frames: [
        { id: "exp_submit", name: "1. Submit Expense", x: 0, y: 0, w: 412, h: 892 },
        { id: "exp_review", name: "2. Review & Sign-Off", x: 490, y: 0, w: 412, h: 892 },
        { id: "exp_done", name: "3. Claim Confirmed", x: 980, y: 0, w: 412, h: 892 },
      ],
      groups: [
        // Screen 1: Form
        {
          id: "g_e1_bar",
          x: 0,
          y: 0,
          axis: "x",
          items: [{ id: "e1_bar", kind: "topAppBar", label: "New Expense Claim", icon: "close", variant: "filled" }],
        },
        {
          id: "g_e1_fields",
          x: 16,
          y: 80,
          axis: "y",
          items: [
            { id: "e1_cat", kind: "select", label: "Category: Travel & Lodging", icon: "flight", variant: "filled" },
            { id: "e1_amount", kind: "textField", label: "Amount ($ USD)", icon: "attach_money", variant: "filled" },
            { id: "e1_merchant", kind: "textField", label: "Merchant: Marriott Downtown", icon: "store", variant: "filled" },
            { id: "e1_tax", kind: "switch", label: "Include VAT / Sales Tax Receipt", icon: null, variant: "filled", checked: true },
            {
              id: "e1_next",
              kind: "button",
              label: "Continue to Review",
              icon: "arrow_forward",
              variant: "filled",
              action: { to: "exp_review", transition: "slide" },
            },
          ],
        },
        // Screen 2: Review
        {
          id: "g_e2_bar",
          x: 490,
          y: 0,
          axis: "x",
          items: [
            {
              id: "e2_bar",
              kind: "topAppBar",
              label: "Verify Submission",
              icon: "arrow_back",
              variant: "filled",
              action: { to: "exp_submit", transition: "slideLeft" },
            },
          ],
        },
        {
          id: "g_e2_summary",
          x: 506,
          y: 80,
          axis: "y",
          items: [
            {
              id: "e2_card",
              kind: "card",
              label: "Total Claim: $428.50 USD",
              supporting: "Category: Travel · Charge to Cost Center #401",
              icon: "receipt",
              variant: "filled",
            },
            {
              id: "e2_note",
              kind: "textField",
              label: "Manager Note / Justification",
              icon: "edit_note",
              variant: "filled",
            },
            {
              id: "e2_submit",
              kind: "button",
              label: "Confirm & Submit Claim",
              icon: "check_circle",
              variant: "filled",
              action: { to: "exp_done", transition: "expand" },
            },
          ],
        },
        // Screen 3: Done
        {
          id: "g_e3_done",
          x: 996,
          y: 200,
          axis: "y",
          items: [
            {
              id: "e3_dialog",
              kind: "dialog",
              label: "Claim Submitted Successfully",
              supporting: "Reference #EXP-8902\nYour claim was forwarded to Accounting.",
              icon: "verified",
              variant: "filled",
            },
            {
              id: "e3_home",
              kind: "button",
              label: "Back to Dashboard",
              icon: "home",
              variant: "filled",
              action: { to: "exp_submit", transition: "fade" },
            },
          ],
        },
      ],
    },
  },
  {
    id: "it-service-desk",
    name: "IT Hardware & Support Request",
    category: "IT Operations",
    badge: "2 Screens",
    icon: "computer",
    screensCount: 2,
    description:
      "Self-service employee equipment ordering catalog and real-time SLA ticket tracking timeline.",
    doc: {
      title: "IT Support & Asset Request",
      brief:
        "Fast self-service catalog for employees to request developer hardware, monitors, and track support tickets.",
      paletteKey: "blue",
      frame: "phone",
      platform: "android",
      frames: [
        { id: "it_catalog", name: "IT Hardware Catalog", x: 0, y: 0, w: 412, h: 892 },
        { id: "it_ticket", name: "Ticket #IT-5542", x: 490, y: 0, w: 412, h: 892 },
      ],
      groups: [
        {
          id: "g_it1_bar",
          x: 0,
          y: 0,
          axis: "x",
          items: [{ id: "it1_bar", kind: "topAppBar", label: "IT Hardware Catalog", icon: "menu", icon2: "search", variant: "filled" }],
        },
        {
          id: "g_it1_items",
          x: 16,
          y: 80,
          axis: "y",
          items: [
            {
              id: "it1_card1",
              kind: "card",
              label: "MacBook Pro 16\" M3 Max",
              supporting: "64GB RAM · 1TB SSD · Standard Developer Tier",
              icon: "laptop_mac",
              variant: "elevated",
            },
            {
              id: "it1_btn1",
              kind: "button",
              label: "Request Laptop Upgrade",
              icon: "shopping_cart",
              variant: "filled",
              action: { to: "it_ticket", transition: "slide" },
            },
            {
              id: "it1_card2",
              kind: "card",
              label: "Dell UltraSharp 32\" 4K",
              supporting: "USB-C Hub · 90W Power Delivery",
              icon: "desktop_windows",
              variant: "outlined",
            },
            {
              id: "it1_btn2",
              kind: "button",
              label: "Request Monitor",
              icon: "add",
              variant: "tonal",
              action: { to: "it_ticket", transition: "slide" },
            },
          ],
        },
        {
          id: "g_it2_bar",
          x: 490,
          y: 0,
          axis: "x",
          items: [
            {
              id: "it2_bar",
              kind: "topAppBar",
              label: "Ticket #IT-5542",
              icon: "arrow_back",
              variant: "filled",
              action: { to: "it_catalog", transition: "slideLeft" },
            },
          ],
        },
        {
          id: "g_it2_status",
          x: 506,
          y: 80,
          axis: "y",
          items: [
            {
              id: "it2_card",
              kind: "card",
              label: "Status: Awaiting IT Manager Approval",
              supporting: "Estimated fulfillment: 2 business days\nAssigned: IT Asset Management",
              icon: "hourglass_top",
              variant: "filled",
            },
            {
              id: "it2_progress",
              kind: "linearProgress",
              label: "Progress",
              icon: null,
              variant: "filled",
              value: 45,
            },
            {
              id: "it2_btn",
              kind: "button",
              label: "Return to Catalog",
              icon: "arrow_back",
              variant: "outlined",
              action: { to: "it_catalog", transition: "slideLeft" },
            },
          ],
        },
      ],
    },
  },
];
