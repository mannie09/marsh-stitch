import { constrainModalRails } from "./rail";
import {
  Doc,
  Frame,
  Group,
  Item,
  Kind,
  explodeGroup,
  frameOfGroup,
  frameSizeOf,
  isPhoneFrame,
  normalizeTheme,
  paletteOf,
} from "./tokens";

/** Serializes a JavaScript value to clean, standard YAML without external dependencies */
export function toYaml(value: unknown, indent = 0): string {
  const spaces = " ".repeat(indent);
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (value.includes("\n")) {
      const lines = value.split("\n").map((l) => spaces + "  " + l).join("\n");
      return "|\n" + lines;
    }
    if (/^[a-zA-Z0-9_./-]+$/.test(value) && !["true", "false", "yes", "no", "null", "on", "off"].includes(value.toLowerCase())) {
      return value;
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          const itemYaml = toYaml(item, indent + 2);
          const lines = itemYaml.split("\n");
          return `${spaces}- ${lines[0].trimStart()}\n${lines.slice(1).join("\n")}`.trimEnd();
        }
        return `${spaces}- ${toYaml(item, indent + 2).trimStart()}`;
      })
      .join("\n");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, v]) => {
        if (typeof v === "object" && v !== null && (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0)) {
          return `${spaces}${k}:\n${toYaml(v, indent + 2)}`;
        }
        return `${spaces}${k}: ${toYaml(v, indent + 2)}`;
      })
      .join("\n");
  }
  return String(value);
}

function sanitizeIdentifier(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^_+|_+$/g, "") || "Item";
}

function powerPlatformType(kind: Kind): string {
  switch (kind) {
    case "button":
    case "fab":
    case "splitButton":
      return "Button";
    case "iconButton":
      return "IconButton";
    case "textField":
      return "TextInput";
    case "searchBar":
      return "SearchInput";
    case "select":
      return "Dropdown";
    case "switch":
      return "Toggle";
    case "checkbox":
      return "Checkbox";
    case "radio":
      return "RadioGroup";
    case "slider":
      return "Slider";
    case "topAppBar":
      return "HeaderBar";
    case "bottomNav":
    case "navRail":
      return "NavigationBar";
    case "tabs":
      return "TabList";
    case "card":
      return "CardContainer";
    case "listItem":
      return "ListRecord";
    case "dialog":
      return "ModalDialog";
    case "snackbar":
      return "NotificationBanner";
    case "image":
      return "ImageControl";
    case "camera":
      return "CameraInput";
    case "map":
      return "MapControl";
    case "text":
      return "Label";
    case "badge":
      return "Badge";
    case "divider":
      return "Divider";
    case "box":
      return "Container";
    case "linearProgress":
    case "circularProgress":
    case "loadingIndicator":
      return "ProgressIndicator";
    default:
      return "Component";
  }
}

/** Formats screen transition into a Power Fx ScreenTransition enum */
function powerFxTransition(transition?: string): string {
  switch (transition) {
    case "slide":
    case "slide-right":
      return "ScreenTransition.SlideRight";
    case "slide-left":
      return "ScreenTransition.SlideLeft";
    case "slide-up":
      return "ScreenTransition.SlideUp";
    case "slide-down":
      return "ScreenTransition.SlideDown";
    case "fade":
      return "ScreenTransition.Fade";
    case "none":
      return "ScreenTransition.None";
    default:
      return "ScreenTransition.Cover";
  }
}

export type YamlMode = "powerAutomate" | "fullSpec";

export function buildYaml(doc: Doc, widths: Record<string, number>, mode: YamlMode = "powerAutomate"): string {
  doc = { ...doc, groups: constrainModalRails(doc.groups) };
  const th = normalizeTheme(doc.theme);
  const pal = paletteOf(doc.paletteKey, doc.customPalette, th);
  const phone = doc.frame === "phone";
  const frames = phone ? doc.frames : [];
  const groups = doc.groups.flatMap((g) => explodeGroup(g, widths));

  const byFrame = new Map<string, Group[]>();
  const loose: Group[] = [];
  for (const g of groups) {
    const f = frameOfGroup(g, frames, widths);
    if (f && frames.some((x) => x.id === f.id)) byFrame.set(f.id, [...(byFrame.get(f.id) ?? []), g]);
    else loose.push(g);
  }

  if (mode === "fullSpec") {
    const fullSpecObj = {
      generator: "Marsh-Stitch",
      version: "1.0",
      type: "DeclarativeUISpecification",
      title: doc.title || "Untitled Project",
      brief: doc.brief || "",
      theme: {
        shape: th.shape,
        font: th.font,
        motion: th.motion,
        paletteKey: doc.paletteKey,
      },
      screens: frames.map((f) => {
        const { w, h } = frameSizeOf(f);
        const screenGroups = byFrame.get(f.id) ?? [];
        return {
          id: f.id,
          name: f.name,
          dimensions: { width: w, height: h, type: isPhoneFrame(f) ? "phone" : "desktop" },
          note: f.note || undefined,
          swipeTargets: f.swipe || undefined,
          elements: screenGroups.flatMap((g) =>
            g.items.map((it) => ({
              id: it.id,
              kind: it.kind,
              label: it.label || undefined,
              variant: it.variant,
              icon: it.icon || undefined,
              action: it.action ? { to: it.action.to, transition: it.action.transition } : undefined,
              note: it.note || undefined,
              checked: it.checked,
              value: it.value,
              selected: it.selected,
              tabs: it.tabs?.map((t) => t.label),
            }))
          ),
        };
      }),
    };
    return `# Marsh-Stitch Declarative UI Specification (YAML)\n# Compatible with declarative UI loaders, specs, and generators\n\n` + toYaml(fullSpecObj);
  }

  // Power Automate & Power Apps Schema
  const frameMap = new Map(frames.map((f) => [f.id, f.name]));
  const screenObjects = frames.map((f) => {
    const { w, h } = frameSizeOf(f);
    const screenName = sanitizeIdentifier(f.name) + "Screen";
    const screenGroups = byFrame.get(f.id) ?? [];
    const controls = screenGroups.flatMap((g, gIdx) =>
      g.items.map((it, itIdx) => {
        const type = powerPlatformType(it.kind);
        const name = `${sanitizeIdentifier(it.label || it.kind)}_${gIdx + 1}_${itIdx + 1}`;
        const ctrl: Record<string, unknown> = {
          name,
          type,
          label: it.label || undefined,
          variant: it.variant,
        };

        if (it.icon) ctrl.icon = it.icon;

        // Form fields & inputs
        if (it.kind === "textField" || it.kind === "searchBar") {
          ctrl.variableBinding = `var_${name}`;
          ctrl.placeholder = it.label || "Enter value...";
          ctrl.default = "";
        } else if (it.kind === "switch" || it.kind === "checkbox") {
          ctrl.variableBinding = `var_${name}`;
          ctrl.default = it.checked ?? false;
        } else if (it.kind === "slider") {
          ctrl.variableBinding = `var_${name}`;
          ctrl.value = it.value ?? 50;
          ctrl.min = 0;
          ctrl.max = 100;
        } else if (it.tabs && it.tabs.length > 0) {
          ctrl.items = it.tabs.map((tab) => tab.label);
          ctrl.selected = it.tabs[it.selected ?? 0]?.label;
        }

        // Navigation & Events
        const events: Record<string, string> = {};
        if (it.action) {
          if (it.action.to === "back") {
            events.onSelect = "Back()";
          } else {
            const targetName = frameMap.get(it.action.to);
            if (targetName) {
              events.onSelect = `Navigate(${sanitizeIdentifier(targetName)}Screen, ${powerFxTransition(it.action.transition)})`;
            }
          }
        } else if (["button", "fab", "splitButton"].includes(it.kind)) {
          events.onSelect = `PowerAutomate.Run(${sanitizeIdentifier(f.name)}_${name}_Workflow)`;
        }

        if (Object.keys(events).length > 0) ctrl.events = events;
        if (it.note) ctrl.logicNote = it.note;

        return ctrl;
      })
    );

    return {
      screenName,
      type: "Screen",
      layout: {
        width: w,
        height: h,
        orientation: w < h ? "portrait" : "landscape",
      },
      note: f.note || undefined,
      controls,
    };
  });

  // Synthesize Power Automate Workflows from buttons and forms
  const workflows = frames.flatMap((f) => {
    const screenGroups = byFrame.get(f.id) ?? [];
    const interactiveButtons = screenGroups
      .flatMap((g) => g.items)
      .filter((it) => ["button", "fab", "splitButton"].includes(it.kind));
    const inputs = screenGroups
      .flatMap((g) => g.items)
      .filter((it) => ["textField", "searchBar", "switch", "checkbox", "slider", "select"].includes(it.kind));

    if (interactiveButtons.length === 0 && inputs.length === 0) return [];

    return interactiveButtons.map((btn) => {
      const btnName = sanitizeIdentifier(btn.label || "Action");
      const targetScreen = btn.action && btn.action.to !== "back" ? frameMap.get(btn.action.to) : null;
      return {
        name: `Workflow_${sanitizeIdentifier(f.name)}_${btnName}`,
        trigger: {
          type: "PowerApps_ButtonTrigger",
          source: `${sanitizeIdentifier(f.name)}Screen.${btnName}`,
          parameters: inputs.map((inp) => ({
            name: sanitizeIdentifier(inp.label || inp.kind),
            type: inp.kind === "switch" || inp.kind === "checkbox" ? "boolean" : inp.kind === "slider" ? "number" : "string",
          })),
        },
        actions: [
          {
            step: "1_ValidateInputs",
            type: "Condition",
            rule: "Check that required form parameters are not empty",
          },
          {
            step: "2_ExecuteLogic",
            type: "Process_Data",
            description: btn.note || "Process submitted input data",
          },
          ...(targetScreen
            ? [
                {
                  step: "3_Navigate",
                  type: "PowerApps_Navigate",
                  targetScreen: `${sanitizeIdentifier(targetScreen)}Screen`,
                  transition: powerFxTransition(btn.action?.transition),
                },
              ]
            : [
                {
                  step: "3_Notify",
                  type: "Notification_Alert",
                  message: `${btn.label || "Action"} completed successfully`,
                },
              ]),
        ],
      };
    });
  });

  const powerAutomateSchema = {
    schemaVersion: "1.0",
    generator: "Marsh-Stitch",
    targetPlatform: "Microsoft Power Automate & Power Apps",
    app: {
      name: doc.title || "Marsh-Stitch App",
      description: doc.brief || "Built with Marsh-Stitch Material 3 Expressive designer",
      theme: {
        primaryColor: pal.primary,
        surfaceColor: pal.surface,
        fontFamily: th.font === "system" ? "Segoe UI" : th.font,
      },
    },
    screens: screenObjects,
    workflows: workflows.length > 0 ? workflows : undefined,
  };

  return (
    `# ==========================================================\n` +
    `# Marsh-Stitch: Power Automate & Power Apps Declarative YAML\n` +
    `# Import or paste this YAML structure directly into Power Automate flows,\n` +
    `# Power Apps Studio, or custom low-code workflow pipelines.\n` +
    `# ==========================================================\n\n` +
    toYaml(powerAutomateSchema)
  );
}
