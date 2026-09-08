import { Doc, frameOfGroup, frameSizeOf, isPhoneFrame } from "./tokens";

function sanitizeLabel(text: string): string {
  return text
    .replace(/["\[\]{}()<>|#;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeId(id: string): string {
  return "S_" + id.replace(/[^a-zA-Z0-9_]/g, "_");
}

/**
 * Generates clean, standard Mermaid.js flowchart syntax from a Marsh-Stitch document.
 * Compatible with GitHub, GitLab, Confluence, Jira, Notion, Azure DevOps, and Obsidian.
 */
export function buildFlowchart(doc: Doc, widths: Record<string, number> = {}): string {
  const frames = doc.frames || [];
  if (frames.length === 0) {
    return "flowchart TD\n    empty[\"(No screens on canvas)\"]\n";
  }

  const lines: string[] = [];
  lines.push("flowchart TD");
  lines.push("    %% Marsh-Stitch Architecture & User Navigation Flow");
  lines.push("    %% Compatible with Confluence, Jira, GitHub, Notion & Mermaid.js\n");

  const screenNodeIds = new Map<string, string>();

  // 1. Declare Screen Nodes
  lines.push("    %% Screens");
  frames.forEach((f, idx) => {
    const { w, h } = frameSizeOf(f);
    const nodeId = sanitizeId(f.id);
    screenNodeIds.set(f.id, nodeId);

    const isPhone = isPhoneFrame(f);
    const deviceIcon = isPhone ? "📱" : "💻";
    const deviceType = isPhone ? "Phone" : "Desktop";
    const name = sanitizeLabel(f.name || `Screen ${idx + 1}`);
    const note = f.note ? `<br/><i>${sanitizeLabel(f.note)}</i>` : "";

    lines.push(
      `    ${nodeId}["${deviceIcon} <b>${name}</b><br/><small>${deviceType} ${w}x${h}</small>${note}"]`
    );
  });
  lines.push("");

  // 2. Navigation Edges from Controls
  lines.push("    %% Screen Transitions & Interactions");
  const edgeSet = new Set<string>();

  for (const group of doc.groups || []) {
    const fromFrame = frameOfGroup(group, frames, widths);
    if (!fromFrame) continue;
    const fromNodeId = screenNodeIds.get(fromFrame.id);
    if (!fromNodeId) continue;

    for (const item of group.items || []) {
      const itemLabel = sanitizeLabel(item.label || item.kind);

      // Single item action
      if (item.action) {
        const { to, transition } = item.action;
        const transLabel = transition ? ` (${transition})` : "";

        if (to === "back") {
          const edgeKey = `${fromNodeId}-back-${itemLabel}`;
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            lines.push(
              `    ${fromNodeId} -.->|"Click: ${itemLabel} [Back]"| ${fromNodeId}`
            );
          }
        } else if (screenNodeIds.has(to)) {
          const targetNodeId = screenNodeIds.get(to)!;
          const edgeKey = `${fromNodeId}->${targetNodeId}:${itemLabel}`;
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            lines.push(
              `    ${fromNodeId} -->|"Click: ${itemLabel}${transLabel}"| ${targetNodeId}`
            );
          }
        }
      }

      // Slot-level actions (e.g. tabs or top app bar icon buttons)
      if (item.actions) {
        for (const [slot, act] of Object.entries(item.actions)) {
          const slotName = slot.startsWith("tab:")
            ? item.tabs?.[parseInt(slot.slice(4), 10)]?.label || slot
            : slot;
          const cleanSlot = sanitizeLabel(slotName);
          const transLabel = act.transition ? ` (${act.transition})` : "";

          if (act.to === "back") {
            const edgeKey = `${fromNodeId}-back-${cleanSlot}`;
            if (!edgeSet.has(edgeKey)) {
              edgeSet.add(edgeKey);
              lines.push(
                `    ${fromNodeId} -.->|"Tap: ${cleanSlot} [Back]"| ${fromNodeId}`
              );
            }
          } else if (screenNodeIds.has(act.to)) {
            const targetNodeId = screenNodeIds.get(act.to)!;
            const edgeKey = `${fromNodeId}->${targetNodeId}:${cleanSlot}`;
            if (!edgeSet.has(edgeKey)) {
              edgeSet.add(edgeKey);
              lines.push(
                `    ${fromNodeId} -->|"Tap: ${cleanSlot}${transLabel}"| ${targetNodeId}`
              );
            }
          }
        }
      }
    }
  }

  // 3. Swipe Gesture Transitions
  lines.push("\n    %% Gestures & Swipe Transitions");
  for (const f of frames) {
    if (!f.swipe) continue;
    const fromNodeId = screenNodeIds.get(f.id);
    if (!fromNodeId) continue;

    for (const [dir, to] of Object.entries(f.swipe)) {
      if (screenNodeIds.has(to)) {
        const targetNodeId = screenNodeIds.get(to)!;
        lines.push(
          `    ${fromNodeId} ==>|"Swipe ${dir}"| ${targetNodeId}`
        );
      }
    }
  }

  // 4. Styling & Theme Classes
  lines.push("\n    %% Visual Hierarchy & Styling");
  lines.push(
    "    classDef homeScreen fill:#EADDFF,stroke:#6750A4,stroke-width:2.5px,color:#21005D,font-weight:bold;"
  );
  lines.push(
    "    classDef desktopScreen fill:#F7F2FA,stroke:#49454F,stroke-width:1.5px,color:#1D1B20;"
  );
  lines.push(
    "    classDef phoneScreen fill:#ECE6F0,stroke:#6750A4,stroke-width:1px,color:#1D192B;"
  );

  // Apply home class to first screen
  const firstId = frames[0] ? screenNodeIds.get(frames[0].id) : null;
  if (firstId) {
    lines.push(`    class ${firstId} homeScreen;`);
  }

  // Apply desktop vs phone styling to others
  frames.slice(1).forEach((f) => {
    const nodeId = screenNodeIds.get(f.id);
    if (nodeId) {
      lines.push(
        `    class ${nodeId} ${isPhoneFrame(f) ? "phoneScreen" : "desktopScreen"};`
      );
    }
  });

  return lines.join("\n");
}
