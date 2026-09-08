import { describe, expect, it } from "vitest";
import { buildYaml, toYaml } from "./yaml";
import type { Doc } from "./tokens";

const sampleDoc = (): Doc => ({
  title: "Order Process",
  brief: "A simple order placement and review flow",
  paletteKey: "green",
  frame: "phone",
  platform: "android",
  frames: [
    { id: "f1", name: "Home", x: 0, y: 0, w: 412, h: 892 },
    { id: "f2", name: "Confirmation", x: 500, y: 0, w: 412, h: 892 },
  ],
  groups: [
    {
      id: "g1",
      x: 16,
      y: 100,
      axis: "y",
      items: [
        { id: "input_email", kind: "textField", label: "Customer Email", icon: null, variant: "filled" },
        { id: "toggle_agree", kind: "switch", label: "Agree to terms", icon: null, variant: "filled", checked: true },
        {
          id: "btn_submit",
          kind: "button",
          label: "Place Order",
          icon: null,
          variant: "filled",
          action: { to: "f2", transition: "slide" },
          note: "Submits order and triggers notification",
        },
      ],
    },
  ],
});

describe("toYaml serializer", () => {
  it("serializes primitives, objects, and arrays", () => {
    const input = {
      name: "TestApp",
      count: 42,
      active: true,
      tags: ["alpha", "beta"],
      nested: { key: "value" },
    };
    const yaml = toYaml(input);
    expect(yaml).toContain("name: TestApp");
    expect(yaml).toContain("count: 42");
    expect(yaml).toContain("active: true");
    expect(yaml).toContain("- alpha");
    expect(yaml).toContain("- beta");
    expect(yaml).toContain("key: value");
  });

  it("handles multiline strings using block format", () => {
    const yaml = toYaml({ desc: "line 1\nline 2" });
    expect(yaml).toContain("desc: |");
    expect(yaml).toContain("line 1");
    expect(yaml).toContain("line 2");
  });
});

describe("buildYaml", () => {
  it("generates Power Automate YAML with screens and workflows", () => {
    const doc = sampleDoc();
    const yaml = buildYaml(doc, {});
    expect(yaml).toContain("Marsh-Stitch: Power Automate & Power Apps Declarative YAML");
    expect(yaml).toContain("Order Process");
    expect(yaml).toContain("HomeScreen");
    expect(yaml).toContain("ConfirmationScreen");
    expect(yaml).toContain("type: TextInput");
    expect(yaml).toContain("type: Toggle");
    expect(yaml).toContain("type: Button");
    expect(yaml).toContain("Navigate(ConfirmationScreen, ScreenTransition.SlideRight)");
    expect(yaml).toContain("PowerApps_ButtonTrigger");
    expect(yaml).toContain("Workflow_Home_Place_Order");
  });

  it("generates full UI specification YAML", () => {
    const doc = sampleDoc();
    const yaml = buildYaml(doc, {}, "fullSpec");
    expect(yaml).toContain("Marsh-Stitch Declarative UI Specification");
    expect(yaml).toContain("Order Process");
    expect(yaml).toContain("dimensions:");
    expect(yaml).toContain("textField");
    expect(yaml).toContain("Place Order");
  });
});
