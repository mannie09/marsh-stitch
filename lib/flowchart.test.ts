import { describe, expect, it } from "vitest";
import { buildFlowchart } from "./flowchart";
import type { Doc } from "./tokens";

const sampleDoc = (): Doc => ({
  title: "Corporate Portal",
  brief: "Executive dashboard with approval workflows",
  paletteKey: "purple",
  frame: "phone",
  platform: "android",
  frames: [
    { id: "f1", name: "Dashboard", x: 0, y: 0, w: 1280, h: 800, note: "Executive overview" },
    { id: "f2", name: "Approvals", x: 1350, y: 0, w: 1280, h: 800 },
    { id: "f3", name: "SuccessDialog", x: 700, y: 900, w: 412, h: 892 },
  ],
  groups: [
    {
      id: "g1",
      x: 50,
      y: 100,
      axis: "y",
      items: [
        {
          id: "card_kpi",
          kind: "card",
          label: "Pending Approvals",
          icon: "pending_actions",
          variant: "filled",
          action: { to: "f2", transition: "slide" },
        },
      ],
    },
    {
      id: "g2",
      x: 1400,
      y: 100,
      axis: "y",
      items: [
        {
          id: "btn_approve",
          kind: "button",
          label: "Approve Request",
          icon: "check",
          variant: "filled",
          action: { to: "f3", transition: "fade" },
        },
        {
          id: "btn_back",
          kind: "button",
          label: "Back to Dashboard",
          icon: "arrow_back",
          variant: "outlined",
          action: { to: "back", transition: "slideLeft" },
        },
      ],
    },
  ],
});

describe("buildFlowchart", () => {
  it("generates clean Mermaid flowchart with screens, transitions, and styles", () => {
    const doc = sampleDoc();
    const mermaid = buildFlowchart(doc);

    expect(mermaid).toContain("flowchart TD");
    expect(mermaid).toContain("S_f1");
    expect(mermaid).toContain("S_f2");
    expect(mermaid).toContain("S_f3");
    expect(mermaid).toContain("Dashboard");
    expect(mermaid).toContain("Executive overview");
    expect(mermaid).toContain("Desktop 1280x800");
    expect(mermaid).toContain("Phone 412x892");

    // Click navigation
    expect(mermaid).toContain('S_f1 -->|"Click: Pending Approvals (slide)"| S_f2');
    expect(mermaid).toContain('S_f2 -->|"Click: Approve Request (fade)"| S_f3');
    expect(mermaid).toContain('S_f2 -.->|"Click: Back to Dashboard [Back]"| S_f2');

    // Styling
    expect(mermaid).toContain("class S_f1 homeScreen;");
    expect(mermaid).toContain("class S_f2 desktopScreen;");
    expect(mermaid).toContain("class S_f3 phoneScreen;");
  });

  it("handles empty canvas gracefully", () => {
    const emptyDoc: Doc = {
      title: "",
      brief: "",
      paletteKey: "purple",
      frame: "phone",
      frames: [],
      groups: [],
    };
    const mermaid = buildFlowchart(emptyDoc);
    expect(mermaid).toContain("flowchart TD");
    expect(mermaid).toContain("empty");
  });
});
