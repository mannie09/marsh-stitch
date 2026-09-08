import { KIND_TEXT, Lang, SWIPE_TEXT, TRANSITION_TEXT, getLang } from "./i18n";
import { constrainModalRails } from "./rail";
import {
  CONTENT_W,
  Place,
  Platform,
  Action,
  BACK_TARGET,
  Doc,
  FONTS,
  Frame,
  Group,
  Item,
  Kind,
  Palette,
  PHONE_W,
  SWIPE_DIRS,
  Theme,
  Variant,
  defaultPlatformOf,
  explodeGroup,
  frameOfGroup,
  frameRect,
  frameSizeOf,
  cardImagePosOf,
  cardImageSizeOf,
  groupBounds,
  isPhoneFrame,
  isWideRail,
  normalizeTheme,
  paletteOf,
  railWidth,
  progressThickness,
} from "./tokens";

const VARIANT_TEXT: Record<Lang, Record<Variant, string>> = {
  en: { filled: "filled", tonal: "tonal", elevated: "elevated", outlined: "outlined", text: "text" },
};

const hasText = (s?: string | null) => !!s && s.trim().length > 0;

/** a card's image area in words: what fills it (a picture or the placeholder with its icon),
 *  where it sits (top, a full-height side column, or the whole background) and its stated size */
function cardImage(it: Item, lang: Lang = "en"): string {
  if (it.noImage) return "";
  const url = imageSrc(it);
  const pos = cardImagePosOf(it);
  const size = pos !== "background" && it.imageSize !== undefined ? cardImageSizeOf(it) : undefined;
  const what = url ? `an image from ${url}` : it.src ? "the provided image" : `a placeholder image${it.icon ? ` (${it.icon} icon)` : ""}`;
  const sized = size ? ` (${size}dp ${pos === "top" ? "tall" : "wide"})` : "";
  if (pos === "leading") return `with ${what}${sized} filling the leading side, `;
  if (pos === "trailing") return `with ${what}${sized} filling the trailing side, `;
  if (pos === "background") return `with ${what} as a full-bleed background behind a scrim under the text, `;
  return `with ${what}${sized} on top, `;
}

/** a card's text choices that differ from the automatic ones: where the block sits and its color role */
function cardText(it: Item, lang: Lang = "en"): string {
  const parts: string[] = [];
  const align = it.contentAlign;
  const auto = !it.noImage && cardImagePosOf(it) === "background" ? "end" : "start";
  if (align && align !== auto) {
    const pos = { start: "top", center: "middle", end: "bottom" };
    parts.push(`text aligned to the ${pos[align]}`);
  }
  if (it.textColor) parts.push(`text in ${it.textColor}`);
  if (!parts.length) return "";
  return ` (${parts.join(", ")})`;
}

/** a card's background and corners when the author changed them, as one parenthetical */
function cardLook(it: Item, lang: Lang = "en"): string {
  const parts: string[] = [];
  if (it.fill) parts.push(`on ${it.fill}`);
  if (it.corners) parts.push(boxCorners(it, lang));
  else if (it.radiusTop !== undefined) parts.push(`${it.radiusTop}dp corners`);
  if (!parts.length) return "";
  return ` ${parts.join(", ")}`;
}

/** an image's web address, when it was given as one rather than picked from a file */
const imageSrc = (it: Item) => (it.src && /^https?:\/\//.test(it.src) ? it.src : null);
/** the placeholder's box as "w×h": the author's height, else the kind's aspect ratio */
const viewSize = (it: Item, ratio: number) => {
  const w = it.size ?? CONTENT_W;
  return `${w}×${it.size2 ?? Math.round(w * ratio)}dp`;
};

/** which destination of a bar, rail or tab row is selected, in words */
function selectedText(it: Item, lang: Lang = "en"): string {
  const tabs = it.tabs ?? [];
  const i = Math.min(it.selected ?? 0, Math.max(0, tabs.length - 1));
  const label = tabs[i]?.label?.trim();
  return i === 0 || !label ? "the first one is selected" : `"${label}" is selected`;
}

const qe = (s: string) => `"${s.trim()}"`;
const quote = (lang?: Lang) => qe;
const trimEnd = (s: string) => s.trim().replace(/[。.\s]+$/, "");

/** Rails without either expressive setting preserve their original export. */
function railStateText(it: Item, lang: Lang = "en"): string {
  if (!isWideRail(it)) return "";
  const component = it.railModal ? "ModalWideNavigationRail" : "WideNavigationRail";
  const width = railWidth(it);
  return `; ${component}, ${it.railExpanded ? "expanded" : "collapsed"}, ${width}dp wide; ${it.railModal ? "modal overlay: when expanded, cover the content with a scrim while keeping the layout footprint at 96dp" : "non-modal layout: reserve the current width in the layout"}; toggle expansion with the top menu button`;
}

/* ================= single parts ================= */

function itemEn(it: Item): string {
  const q = qe;
  const v = VARIANT_TEXT.en[it.variant];
  const noun = KIND_TEXT.en[it.kind]?.noun ?? it.kind;
  switch (it.kind) {
    case "button":
      return `a ${v} button ${hasText(it.label) ? q(it.label) : "with no label"}${it.icon ? ` with a ${it.icon} icon` : ""}${it.size ? ` (${it.size}dp wide)` : ""}`;
    case "iconButton":
      return `a ${v} icon button with the ${it.icon ?? "empty"} icon`;
    case "fab":
      return `a ${it.size && it.size >= 96 ? "large " : it.size && it.size <= 40 ? "small " : ""}${v} FAB with the ${it.icon ?? "empty"} icon`;
    case "extendedFab":
      return `a ${v} extended FAB ${q(it.label)}${it.icon ? ` with a ${it.icon} icon` : ""}`;
    case "chip":
      return `a chip ${q(it.label)}${it.checked ? " (selected)" : ""}${it.icon && !it.checked ? ` with a ${it.icon} icon` : ""}`;
    case "topAppBar":
      return `a top app bar titled ${q(it.label)}${it.icon ? ` with a ${it.icon} icon button on the left` : ""}${it.icon2 ? `${it.icon ? " and" : " with"} ${it.icon2} on the right` : ""}`;
    case "bottomNav": {
      const tabs = (it.tabs ?? []).map((t) => `${q(t.label || "unlabeled")} (${t.icon || "no icon"})`);
      return `a navigation bar with ${tabs.length} destinations: ${tabs.join(", ")}; ${selectedText(it, "en")}`;
    }
    case "navRail": {
      const tabs = (it.tabs ?? []).map((t) => `${q(t.label || "unlabeled")} (${t.icon || "no icon"})`);
      return `a navigation rail with ${tabs.length} destinations: ${tabs.join(", ")}; ${selectedText(it, "en")}${railStateText(it, "en")}`;
    }
    case "searchBar":
      return `a search bar with the placeholder ${q(it.label)}${it.icon2 ? ` and a ${it.icon2} icon at the end` : ""}`;
    case "card": {
      const style = it.variant === "elevated" ? "an elevated" : it.variant === "outlined" ? "an outlined" : "a filled";
      return `${style} card${it.size2 ? ` (${it.size2}dp tall)` : ""}${cardLook(it, "en")} ${cardImage(it, "en") || "with "}the headline ${q(it.label)}${hasText(it.supporting) ? ` and the body ${q(it.supporting!)}` : ""}${cardText(it, "en")}`;
    }
    case "listItem":
      return `${q(it.label)}${hasText(it.supporting) ? ` with supporting text ${q(it.supporting!)}` : ""}${it.icon ? `, a leading ${it.icon} icon${it.iconFill === "none" ? " (no background circle)" : it.iconFill ? ` (on a ${it.iconFill} circle)` : ""}` : ""}${it.switch ? `, a trailing switch (initially ${it.checked ? "on" : "off"})` : it.icon2 ? `, a trailing ${it.icon2} icon` : ""}${it.fill && it.fill !== "surfaceContainerLow" ? `, on a ${it.fill} background` : ""}`;
    case "dialog":
      return `a dialog headed ${q(it.label)}${hasText(it.supporting) ? ` with the body ${q(it.supporting!)}` : ""}${it.icon ? ` and a ${it.icon} icon` : ""}, with Cancel and OK text buttons`;
    case "snackbar":
      return `a snackbar ${q(it.label)}${hasText(it.supporting) ? ` with a ${q(it.supporting!)} action` : ""}`;
    case "textField":
      return `${it.variant === "filled" ? "a filled" : "an outlined"} text field labeled ${q(it.label)}${it.icon ? ` with a leading ${it.icon} icon` : ""}${hasText(it.supporting) ? `; supporting text ${q(it.supporting!)}` : ""}`;
    case "select": {
      const opts = (it.tabs ?? []).map((t) => q(t.label || "unlabeled"));
      const initial = it.selected !== undefined && it.tabs?.[it.selected] ? `, initially ${q(it.tabs[it.selected].label)}` : ", initially none";
      return `${it.variant === "filled" ? "a filled" : "an outlined"} dropdown labeled ${q(it.label)} that opens a menu to pick one option (options ${opts.join(", ")}${initial})${it.icon ? `, with a leading ${it.icon} icon` : ""}${hasText(it.supporting) ? `; supporting text ${q(it.supporting!)}` : ""}`;
    }
    case "switch":
      return `a switch ${q(it.label)} (initially ${it.checked ? "on" : "off"}${it.noCheck ? "; no check icon on the handle when on" : ""})`;
    case "checkbox":
      return `a checkbox ${q(it.label)} (initially ${it.checked ? "checked" : "unchecked"})`;
    case "slider":
      return `a slider (initial value ${it.value ?? 40}%)`;
    case "text":
      return `${it.bold ? "bold " : ""}text ${q(it.label)} at ${it.size ?? 28}sp`;
    case "image":
      return `a ${it.size ?? 200}dp square image${imageSrc(it) ? ` (load it from ${imageSrc(it)})` : it.src ? " (use the provided image)" : " placeholder"}`;
    case "camera":
      return `a ${viewSize(it, 4 / 3)} camera preview`;
    case "map":
      return `a ${viewSize(it, 3 / 4)} map`;
    case "divider":
      return "a divider";
    case "box":
      return `a ${it.size ?? PHONE_W}×${it.size2 ?? 220}dp ${it.checked ? "bottom sheet with a drag handle at the top" : "box"} (background ${it.fill ?? "surfaceContainerLow"}, ${boxCorners(it, "en")})`;
    case "loadingIndicator":
      return `the M3 Expressive shape-morphing loading indicator${it.contained ? " (contained)" : ""}`;
    case "linearProgress":
      return `a ${it.wavy ? "wavy " : ""}linear progress indicator (${it.value === undefined ? "indeterminate" : `${it.value}%`}${progressThickness(it) !== 4 ? `, ${progressThickness(it)}dp track thickness` : ""})`;
    case "circularProgress":
      return `a ${it.wavy ? "wavy " : ""}circular progress indicator (${it.value === undefined ? "indeterminate" : `${it.value}%`}${progressThickness(it) !== 4 ? `, ${progressThickness(it)}dp track thickness` : ""})`;
    case "splitButton":
      return `a ${v} split button ${q(it.label)}${it.icon ? ` with a ${it.icon} icon` : ""} and a trailing menu segment with a down arrow`;
    case "fabMenu": {
      const items = (it.tabs ?? []).map((t) => `${q(t.label || "unlabeled")} (${t.icon || "no icon"})`);
      return `a FAB menu opening from a ${v} FAB, drawn open with ${items.length} items stacked above it: ${items.join(", ")}`;
    }
    case "toolbar": {
      const icons = (it.tabs ?? []).map((t) => t.icon || "empty").join(", ");
      return `a ${it.variant === "filled" ? "vibrant (primaryContainer)" : "standard"} floating toolbar with the icon buttons ${icons}`;
    }
    case "tabs": {
      const labels = (it.tabs ?? []).map((t) => q(t.label || "unlabeled"));
      return `a tab row with ${labels.length} tabs: ${labels.join(", ")}; ${selectedText(it, "en")}`;
    }
    case "radio":
      return `a radio button ${q(it.label)} (initially ${it.checked ? "selected" : "unselected"})`;
    case "badge":
      return hasText(it.label) ? `a badge reading ${q(it.label)}` : "a small dot badge";
    default:
      return noun;
  }
}

const itemText = (it: Item, lang: Lang = "en") => itemEn(it);

/** a box's corners in words: the top / bottom pairs, or each corner when they differ */
function boxCorners(it: Item, lang: Lang = "en"): string {
  const c = it.corners;
  const each = c && !(c.tl === c.tr && c.bl === c.br);
  if (each) {
    return `corner radius ${c.tl}dp top-left / ${c.tr}dp top-right / ${c.bl}dp bottom-left / ${c.br}dp bottom-right`;
  }
  const t = c ? c.tl : (it.radiusTop ?? 28);
  const b = c ? c.bl : (it.radiusBottom ?? 28);
  if (t === b) {
    return `${t}dp corners`;
  }
  return `corner radius ${t}dp top / ${b}dp bottom`;
}

/* ================= connected runs ================= */

function groupText(g: Group, lang: Lang = "en"): string {
  if (g.items.length === 1) return itemText(g.items[0], lang);
  const q = qe;
  const kind = g.items[0].kind;
  const vt = VARIANT_TEXT.en;
  const same = g.items.every((it) => it.variant === g.items[0].variant);
  if (kind === "listItem") return `a list of ${g.items.length} items, top to bottom: ${g.items.map(itemEn).join("; ")}`;
  if (kind === "chip") return `a chip group: ${g.items.map((it) => q(it.label) + (it.checked ? " (selected)" : "")).join(", ")}`;
  if (kind === "iconButton") return `a connected group of icon buttons: ${g.items.map((it) => it.icon ?? "empty").join(", ")}`;
  const names = same
    ? g.items.map((it) => q(it.label || "unlabeled")).join(", ")
    : g.items.map((it) => `${q(it.label || "unlabeled")} (${vt[it.variant]})`).join(", ");
  return `a connected button group of ${g.items.length}${same ? ` ${vt[g.items[0].variant]}` : ""} buttons: ${names}`;
}

/** short name for a run when it is referred to again (as a container or a neighbour) */
function groupName(g: Group, lang: Lang = "en"): string {
  const it = g.items[0];
  const noun = KIND_TEXT.en[it.kind]?.noun ?? it.kind;
  const q = qe;
  if (g.items.length > 1) return `the ${noun} group`;
  if (it.kind === "box") return it.checked ? "the bottom sheet" : "the box";
  if (hasText(it.label) && it.kind !== "text") return `the ${q(it.label)} ${noun}`;
  return `the ${noun}`;
}

/* ================= behavior notes ================= */

function actionText(a: Action, frames: Frame[], lang: Lang = "en"): string | null {
  const q = qe;
  if (a.to === BACK_TARGET) {
    return "goes back to the previous screen (playing the entry transition in reverse)";
  }
  const target = frames.find((f) => f.id === a.to);
  if (!target) return null;
  const tr = TRANSITION_TEXT.en[a.transition];
  const name = q(target.name || "screen");
  return `opens the ${name} screen${a.transition !== "none" ? ` with ${tr}` : ""}`;
}

function slotName(it: Item, slot: string, lang: Lang = "en"): string {
  if (slot.startsWith("tab:")) {
    const i = Number(slot.slice(4));
    const tab = it.tabs?.[i];
    const q = qe;
    const label = tab?.label ? q(tab.label) : `#${i + 1}`;
    return `the ${label} destination`;
  }
  const icon = slot === "icon2" ? it.icon2 : it.icon;
  return `the ${icon ?? ""} icon button on the ${slot === "icon2" ? "right" : "left"}`;
}

function notes(g: Group, frames: Frame[], lang: Lang = "en"): string[] {
  const out: string[] = [];
  const q = qe;
  for (const it of g.items) {
    const noun = KIND_TEXT.en[it.kind]?.noun ?? it.kind;
    const name = hasText(it.label) && it.kind !== "text" ? `The ${q(it.label)} ${noun}` : `The ${noun}`;
    const parts: string[] = [];
    if (it.action) {
      const a = actionText(it.action, frames, lang);
      if (a) parts.push(`${a} when tapped`);
    }
    for (const [slot, action] of Object.entries(it.actions ?? {})) {
      if (!action) continue;
      const a = actionText(action, frames, lang);
      if (!a) continue;
      const s = slotName(it, slot, lang);
      out.push(`Tapping ${s} of ${name.replace(/^The /, "the ")} ${a}.`);
    }
    if (it.toggle) {
      const vt = VARIANT_TEXT.en;
      const icon = it.toggle.icon;
      const variant = it.toggle.variant;
      const changes: string[] = [];
      const label = it.toggle.label !== undefined && it.toggle.label !== it.label ? it.toggle.label : undefined;
      if (label !== undefined) changes.push(`the label becomes ${qe(label)}`);
      if (icon) changes.push(`the icon becomes ${icon}`);
      else if (icon === null) changes.push("the icon disappears");
      if (variant) changes.push(`the style becomes ${vt[variant]}`);
      parts.push(`is a toggle button that flips on / off with every tap${changes.length ? ` (when on, ${changes.join(" and ")})` : ""}`);
    }
    if (hasText(it.note)) parts.push(trimEnd(it.note!));
    if (!parts.length) continue;
    out.push(`${name} ${parts.join(". It also ")}.`);
  }
  return out;
}

function swipeNotes(f: Frame, frames: Frame[], lang: Lang = "en"): string[] {
  const out: string[] = [];
  const q = qe;
  const screen = "screen";
  for (const d of SWIPE_DIRS) {
    const to = f.swipe?.[d.key];
    if (!to) continue;
    const a = actionText({ to, transition: d.transition }, frames, lang);
    if (!a) continue;
    const sw = SWIPE_TEXT.en[d.key];
    const name = q(f.name || screen);
    out.push(`The ${name} screen ${a} when ${sw}; the screen follows the finger while dragging.`);
  }
  return out;
}

/* ================= layout: rows and layers ================= */

type Rect = { l: number; t: number; r: number; b: number };
type LNode = { g: Group; bb: Rect; children: LNode[] };

const area = (r: Rect) => Math.max(0, r.r - r.l) * Math.max(0, r.b - r.t);
const contains = (o: Rect, i: Rect, tol = 2) => i.l >= o.l - tol && i.t >= o.t - tol && i.r <= o.r + tol && i.b <= o.b + tol;
const overlapArea = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));

/** Groups keep their canvas order (later = drawn on top). A run that sits fully inside an
 *  earlier, larger one is nested in it, so a box with parts on it reads as one container. */
function layoutTree(groups: Group[], widths: Record<string, number>): LNode[] {
  const nodes: LNode[] = groups.map((g) => ({ g, bb: groupBounds(g, widths), children: [] }));
  const roots: LNode[] = [];
  nodes.forEach((n, i) => {
    let parent: LNode | null = null;
    for (let j = 0; j < i; j++) {
      const c = nodes[j];
      if (c.g.items[0].kind === "topAppBar" || c.g.items[0].kind === "bottomNav") continue;
      if (contains(c.bb, n.bb) && area(c.bb) > area(n.bb) && (!parent || area(c.bb) < area(parent.bb))) parent = c;
    }
    (parent ? parent.children : roots).push(n);
  });
  return roots;
}

/** Siblings whose vertical extents overlap and that sit side by side form one row. */
function rowsOf(nodes: LNode[]): LNode[][] {
  const sorted = [...nodes].sort((a, b) => a.bb.t - b.bb.t || a.bb.l - b.bb.l);
  const out: LNode[][] = [];
  for (const n of sorted) {
    const row = out[out.length - 1];
    if (row) {
      const rt = Math.min(...row.map((r) => r.bb.t));
      const rb = Math.max(...row.map((r) => r.bb.b));
      const cy = (n.bb.t + n.bb.b) / 2;
      const rcy = (rt + rb) / 2;
      const beside = row.every((r) => r.bb.r <= n.bb.l + 2 || r.bb.l >= n.bb.r - 2);
      if (beside && ((cy >= rt && cy <= rb) || (rcy >= n.bb.t && rcy <= n.bb.b))) {
        row.push(n);
        continue;
      }
    }
    out.push([n]);
  }
  for (const r of out) r.sort((a, b) => a.bb.l - b.bb.l);
  return out;
}

/** where a rect sits inside a container, in words */
function zone(bb: Rect, within: Rect, lang: Lang = "en", phone: boolean): string {
  const w = within.r - within.l;
  const h = within.b - within.t;
  const cy = (bb.t + bb.b) / 2 - within.t;
  const cx = (bb.l + bb.r) / 2 - within.l;
  const bw = bb.r - bb.l;
  const vert = cy < h * (phone ? 0.22 : 0.3) ? 0 : cy > h * (phone ? 0.8 : 0.7) ? 2 : 1;
  const horiz = bw >= w * 0.85 ? -1 : cx < w * 0.36 ? 0 : cx > w * 0.64 ? 2 : 1;
  const v = ["Near the top", "In the middle", "Near the bottom"][vert];
  const hh = horiz < 0 ? "" : [", aligned left", ", centered", ", aligned right"][horiz];
  return `${v}${hh}`;
}

function rowText(row: LNode[], where: string, lang: Lang = "en", box: Rect): string {
  if (row.length === 1) {
    const d = groupText(row[0].g, lang);
    return `${where}: ${d}.`;
  }
  const descs = row.map((n) => groupText(n.g, lang));
  const last = row[row.length - 1];
  const fillsRight = last.bb.r >= box.r - 24 && row.slice(0, -1).every((n) => n.bb.r < box.r - 60);
  const stretch = fillsRight ? `; ${groupName(last.g, "en")} stretches to fill the remaining width to the right edge` : "";
  return `${where}, in one row from left to right: ${descs.join(", ")} (keep them on the same line, vertically centered; never stack or wrap them${stretch}).`;
}

function describeNodes(lines: string[], nodes: LNode[], within: Rect | null, widths: Record<string, number>, lang: Lang = "en", depth: number, phone: boolean) {
  const rows = rowsOf(nodes);
  const pad = "  ".repeat(depth);
  const box: Rect = within ?? {
    l: Math.min(...nodes.map((n) => n.bb.l)),
    t: Math.min(...nodes.map((n) => n.bb.t)),
    r: Math.max(...nodes.map((n) => n.bb.r)),
    b: Math.max(...nodes.map((n) => n.bb.b)),
  };
  rows.forEach((row, i) => {
    const first = row[0];
    const rowRect: Rect = {
      l: Math.min(...row.map((n) => n.bb.l)),
      t: Math.min(...row.map((n) => n.bb.t)),
      r: Math.max(...row.map((n) => n.bb.r)),
      b: Math.max(...row.map((n) => n.bb.b)),
    };
    let where: string;
    if (within) where = zone(rowRect, box, lang, phone);
    else where = i === 0 ? "First" : "Below that";
    const overlaps: string[] = [];
    if (row.length === 1) {
      for (const other of nodes) {
        if (other === first || nodes.indexOf(other) > nodes.indexOf(first)) continue;
        const ov = overlapArea(other.bb, first.bb);
        if (ov > 0 && ov >= area(first.bb) * 0.25 && !contains(other.bb, first.bb)) overlaps.push(groupName(other.g, lang));
      }
    }
    let line = rowText(row, where, lang, box);
    if (overlaps.length) {
      const o = overlaps.join(" and ");
      line = `${line.replace(/\.$/, "")} (partly overlapping ${o}, drawn on top).`;
    }
    lines.push(`${pad}- ${line}`);
    for (const n of row) {
      if (!n.children.length) continue;
      const name = groupName(n.g, lang);
      lines.push(
        `${pad}  - Inside ${name}, layered on top of it (the container is the background; positions are relative to it):`,
      );
      describeNodes(lines, n.children, n.bb, widths, lang, depth + 2, false);
    }
  });
}

const RAIL_LEAD: Record<Lang, string> = { en: "Along the left edge: " };

const WIDE_RAIL_STYLE: Record<Lang, string> = {
  en: "M3 Expressive navigation rail: 96dp wide when collapsed, with labels below icons. Expanded width is 220dp, with 56dp-high destinations and horizontal icon/label rows separated by 8dp. Match the existing top app bar with a surfaceContainer background in both modes, whether collapsed or expanded. The selected destination uses a secondaryContainer pill, onSecondaryContainer icon, and a label that prefers secondary. If its contrast against the actual background (surfaceContainer when collapsed, secondaryContainer when expanded) is below 4.5:1, use onSurface / onSecondaryContainer respectively. A top menu button toggles expansion. The non-modal variant sits beside the content; the modal variant overlays it with a scrim when expanded and blocks background interaction. Dismiss with a scrim tap or Escape.",
};

function describeScreen(lines: string[], groups: Group[], frameRect: Rect | null, widths: Record<string, number>, lang: Lang = "en") {
  if (!groups.length) return;
  const rails = groups.filter((g) => g.items.length === 1 && g.items[0].kind === "navRail");
  for (const g of rails) lines.push(`- ${RAIL_LEAD[lang]}${itemText(g.items[0], lang)}.`);
  const rest = rails.length ? groups.filter((g) => !rails.includes(g)) : groups;
  if (!rest.length) return;
  const roots = layoutTree(rest, widths);
  describeNodes(lines, roots, frameRect, widths, lang, 0, true);
}

/* ---------- color palette ---------- */

function paletteLines(p: Palette): string[] {
  const row = (pairs: [string, string][]) => `- ${pairs.map(([k, v]) => `${k} ${v}`).join(" / ")}`;
  return [
    row([
      ["primary", p.primary],
      ["onPrimary", p.onPrimary],
      ["primaryContainer", p.primaryContainer],
      ["onPrimaryContainer", p.onPrimaryContainer],
    ]),
    row([
      ["secondary", p.secondary],
      ["secondaryContainer", p.secondaryContainer],
      ["onSecondaryContainer", p.onSecondaryContainer],
      ["tertiaryContainer", p.tertiaryContainer],
      ["onTertiaryContainer", p.onTertiaryContainer],
    ]),
    row([
      ["surface", p.surface],
      ["surfaceContainerLow", p.surfaceContainerLow],
      ["surfaceContainer", p.surfaceContainer],
      ["surfaceContainerHigh", p.surfaceContainerHigh],
      ["surfaceContainerHighest", p.surfaceContainerHighest],
    ]),
    row([
      ["onSurface", p.onSurface],
      ["onSurfaceVariant", p.onSurfaceVariant],
      ["outline", p.outline],
      ["outlineVariant", p.outlineVariant],
    ]),
    row([
      ["inverseSurface", p.inverseSurface],
      ["inverseOnSurface", p.inverseOnSurface],
      ["inversePrimary", p.inversePrimary],
    ]),
    row([
      ["error", p.error],
      ["onError", p.onError],
      ["errorContainer", p.errorContainer],
      ["onErrorContainer", p.onErrorContainer],
    ]),
  ];
}

/* ---------- per-component style notes ---------- */

const STYLE_NOTES: Record<Lang, Partial<Record<Kind | "boxSheet", string>>> = {
en: {
    button:
      "Buttons: medium size, 56dp tall, fully rounded (pill). Filled uses primary, tonal uses secondaryContainer, outlined has a 1dp outline border. A connected button group is a row with 3dp gaps where only the inner adjoining corners shrink to 8dp and the outer corners stay round (the M3 Expressive connected button group).",
    iconButton:
      "Icon buttons: 48dp circles in the filled / tonal / outlined / standard style as specified. A connected run of icon buttons is a connected button group.",
    fab: "FAB: 56dp with 16dp corners; large is 96dp with 28dp corners; small is 40dp with 12dp corners. Tonal uses primaryContainer, filled uses primary. Float it 16dp from the screen edge with a level 3 shadow.",
    extendedFab: "Extended FAB: 56dp tall, 16dp corners, icon on the left and label on the right.",
    chip: "Chips: 32dp tall, 8dp corners. The selected state fills with secondaryContainer and shows a leading check icon. A chip group is a row with 8dp gaps that scrolls horizontally when it overflows.",
    topAppBar:
      "Top app bar: 64dp tall on surface, with its background extended behind the status bar (pad the top by the system inset). Title in titleLarge, 48dp icon buttons on each side. The standard tint to surfaceContainer on scroll is fine.",
    bottomNav:
      "Navigation bar: 80dp tall on surfaceContainer, with its background extended down through the gesture navigation area (pad the bottom by the system inset). The active destination shows a secondaryContainer pill indicator (64×32dp), a filled icon and a labelMedium label.",
    navRail:
      "Navigation rail: 80dp wide on surfaceContainer, running the full height of the left edge. Destinations stack from the top; the active one shows a secondaryContainer pill indicator (56×32dp) with a filled icon and a labelMedium label below it. The content sits to the right of the rail.",
    searchBar: "Search bar: 56dp tall, fully rounded, on surfaceContainerHigh, with a leading search icon and the specified trailing icon.",
    card: "Cards: 20dp corners. Place each card's image area where its line says — on top, filling the leading or trailing side, or as a full-bleed background (a scrim fades in from the text's side: dark under light text, light under dark text). Images keep their aspect ratio and are center-cropped to fill their area. Filled uses surfaceContainerHighest, elevated uses surfaceContainerLow with a level 1 shadow, outlined has a 1dp outlineVariant border. Headline in titleMedium, body in bodyMedium. 20dp padding, 4dp between headline and body, 12dp between the image and the text.",
    listItem:
      "List items: 72dp tall, 24dp leading icon (on a 40dp primaryContainer circle unless stated), headline in bodyLarge, supporting text in bodyMedium on onSurfaceVariant, on the specified background role (surfaceContainerLow unless stated). A stacked list is a vertical run with 3dp gaps, 28dp outer corners and 8dp inner corners (the M3 Expressive list treatment).",
    dialog: "Dialogs: 312dp wide, 28dp corners, on surfaceContainerHigh. Headline in headlineSmall, body in bodyMedium, text buttons aligned right at the bottom.",
    snackbar: "Snackbar: 48dp tall, 8dp corners, inverseSurface background with inverseOnSurface text; the action is an inversePrimary text button. Show it 16dp above the bottom edge and dismiss after a few seconds.",
    textField:
      "Text fields: 56dp tall. Outlined has 16dp corners and an outline border; filled sits on surfaceContainerHighest with an underline. On focus the label floats up and the border becomes 2dp primary. Supporting text goes underneath in bodySmall.",
    select:
      "Dropdowns: look like a text field (56dp tall, outlined or filled) with a trailing arrow_drop_down icon. Implement as an exposed dropdown menu: tapping opens a menu below (surfaceContainer, 4dp corners, 48dp items) and the chosen value shows in the field.",
    switch: "Switches: standard M3 size (52×32dp track). On is primary; off is surfaceContainerHighest with an outline border. Label on the left, switch at the trailing edge.",
    checkbox: "Checkboxes: 18dp square with 2dp corners, primary when checked, label on the right in bodyLarge.",
    slider: "Sliders: the M3 Expressive thick track (16dp) with a tall handle (4×44dp). Primary on the left of the handle, secondaryContainer on the right. Dragging changes the value.",
    text: "Text: the specified sp size; headings on onSurface, descriptions on onSurfaceVariant, line height 1.3–1.5× the size. No ripple or press feedback on tap.",
    image: "Images: 20dp corners; a surfaceContainerHighest placeholder when none is provided. Keep the aspect ratio and center-crop.",
    camera: "Camera preview: 20dp corners. Show the device camera feed in this area; while permission is missing, show a camera icon on a dark inverseSurface pane.",
    map: "Map: 20dp corners. Place the map SDK view in this area; while it loads, show a map icon on surfaceContainerHighest.",
    divider: "Dividers: 1dp outlineVariant with 16dp horizontal insets.",
    box: "Boxes: plain containers with the specified background token and corner radii. They are the background for whatever is layered on them and have no behavior of their own.",
    boxSheet:
      "Boxes / bottom sheets: containers with the specified background token and corner radii. Only the ones described with a drag handle are modal bottom sheets that slide up from the bottom; every other box is a plain background container.",
    loadingIndicator:
      "Loading: use the M3 Expressive shape-morphing LoadingIndicator (the rotating polygon that morphs between shapes). The contained variant sits inside a secondaryContainer circle.",
    linearProgress: "Linear progress: use the stated track thickness (4dp unless stated) with round caps, and the M3 Expressive wavy style when specified. Track is secondaryContainer, progress is primary.",
    circularProgress: "Circular progress: use the stated track thickness (4dp unless stated) with round caps, and the M3 Expressive wavy style when specified.",
    splitButton:
      "Split button: the M3 Expressive SplitButton. The leading segment is the main action and the trailing arrow segment opens a menu. The two segments sit 2dp apart with fully rounded outer corners and 8dp inner corners; opening the menu rotates the arrow and rounds the segment.",
    fabMenu:
      "FAB menu: the M3 Expressive FloatingActionButtonMenu. Closed, it is a normal FAB; tapping it reveals the items upward one after another and the FAB icon becomes close. Each item is 56dp tall, fully rounded, right-aligned with an icon and a label.",
    toolbar:
      "Floating toolbar: the M3 Expressive HorizontalFloatingToolbar. 64dp tall, fully rounded, floating 16dp above the bottom edge over the content. Standard uses surfaceContainer, vibrant uses primaryContainer. The icon buttons inside are 48dp.",
    tabs: "Tabs: M3 primary tabs. 48dp tall, labels in titleSmall; the selected tab has primary text and a 3dp label-width indicator with rounded top corners, with an outlineVariant divider underneath. Tapping a tab switches the content.",
    radio: "Radio buttons: 20dp circles. Selected shows a primary ring with a center dot, unselected an onSurfaceVariant ring. Only one in a group can be selected. Label on the right in bodyLarge.",
    badge: "Badges: a 6dp dot without text, a 16dp-tall pill with text. Background error, text onError in labelSmall. Overlay it on the top-right of an icon or item.",
  }
};

const FONT_NOTE: Record<Lang, (name: string) => string> = {
  en: (name: string) => `Use ${name} as the primary font.`,
};

const THEME_NOTES: Record<
  Lang,
  { shape: Record<Theme["shape"], string>; emphasized: string; plainType: string; motion: Record<Theme["motion"], string> }
> = {
en: {
    shape: {
      square: "Keep corners modest: shrink the M3 shape scale throughout (buttons and chips 8–12dp, cards and images 8dp, dialogs about 12dp) and avoid pill shapes.",
      rounded: "Corners follow the M3 Expressive defaults (pill buttons, 20dp cards, 28dp dialogs).",
      full: "Push corners to the maximum: pill-shaped buttons, chips and text fields, 32dp cards and images, about 40dp dialogs and sheets.",
    },
    emphasized: "Headlines, button labels and tabs use the M3 Expressive emphasized typography (the heavier headlineMediumEmphasized and similar styles).",
    plainType: "Typography uses the standard M3 weights.",
    motion: {
      standard: "Motion uses MotionScheme.standard(): smooth transitions and state changes with no bounce.",
      expressive: "Motion uses MotionScheme.expressive(): a light spring bounce on transitions and state changes.",
    },
  }
};

function themeLines(th: Theme, lang: Lang = "en"): string[] {
  const n = THEME_NOTES[lang];
  const font = FONTS.find((f) => f.key === th.font);
  const fontName = font?.key === "system" ? "the device's system font" : (font?.label ?? "Roboto");
  return [`- ${n.shape[th.shape]}`, `- ${FONT_NOTE[lang](fontName)} ${th.emphasized ? n.emphasized : n.plainType}`, `- ${n.motion[th.motion]}`];
}

/** the closing guidance; the lines that depend on the target are written for the chosen platform */
const GENERAL: Record<Lang, (string | ((pl: Platform) => string))[]> = {
en: [
    "Work out what kind of app this is from the purpose of the screens, and implement the features such an app is normally expected to have (create, list, detail, edit, delete, search, settings, whichever apply) even where the sketch does not show them.",
    (pl: Platform) => `Treat the data as real. Persist what the user creates ${pl === "web" ? "in the browser (IndexedDB or similar) so it survives reloads" : "on the device (Room, DataStore or similar) so it survives restarts"}. Do not ship dummy or sample data; show an empty state when there is nothing yet. Validate input, and confirm or report failures and deletions appropriately.`,
    "Fill in behavior the sketch leaves out from the purpose of the screen and the labels of the parts. A button or item with no behavior specified should do what its label implies (save, send, open a detail screen, and so on), never nothing.",
    "The layout only needs to keep the intent (order, grouping, relative placement); sizes and spacing may be adjusted to fit the content. If something would break on a device, prefer working over matching the sketch.",
    (pl: Platform) => `Use the standard components from ${pl === "web" ? "Material Web" : "Jetpack Compose material3 (latest, including the Expressive APIs)"}; do not custom-draw parts the library provides.`,
    "Always reference colors through the scheme roles above (primary, surfaceContainer, …) instead of hard-coded values.",
    "Keep 16dp screen margins and 8–16dp between parts, and use the M3 type styles (titleLarge, bodyMedium, …).",
    "Parts described as \"in one row\" must share a single Row (horizontal container) on the same line; never stack them vertically or wrap them. The row is as tall as its tallest part and the others are vertically centered in it.",
    "Parts described as \"layered inside\" a container are drawn on top of that container (a Box with the container as its background). The overlap is intentional: do not separate or reorder them for layout reasons. Later items in the description are drawn in front of earlier ones.",
    "Give every tappable part ripple plus a slight press-scale. \"Back\" plays the entry transition in reverse, and the system back gesture / button must do the same.",
    "Use Material Symbols Rounded for icons.",
    (pl: Platform) => `Do not verify ${pl === "web" ? "in a browser" : "on an emulator or a device"}. When the implementation is done, ${pl === "web" ? "run the production build and provide its output" : "produce a signed release APK"} as the deliverable.`,
  ]
};

const STYLE_NOTES_WEB: Record<Lang, Partial<Record<Kind, string>>> = {
en: {
    topAppBar: "Top app bar: 64dp tall on surface. Title in titleLarge, 48dp icon buttons on each side. The standard tint to surfaceContainer on scroll is fine.",
    bottomNav: "Navigation bar: 80dp tall on surfaceContainer. The active destination shows a secondaryContainer pill indicator (64×32dp), a filled icon and a labelMedium label.",
  }
};

type Viewport = "phone" | "desktop" | "mixed" | "free";
const viewportOf = (frames: Frame[], phone: boolean): Viewport => {
  if (!phone || frames.length === 0) return "free";
  const phones = frames.filter(isPhoneFrame).length;
  return phones === frames.length ? "phone" : phones === 0 ? "desktop" : "mixed";
};

/** a screen's size, written only when the document mixes sizes */
const sizeLabel = (f: Frame, vp: Viewport, lang: Lang = "en"): string | undefined => {
  if (vp !== "mixed") return undefined;
  const { w, h } = frameSizeOf(f);
  const kind = isPhoneFrame(f) ? "phone" : "desktop";
  return `${kind} ${w}×${h}`;
};

const PH = {
en: {
    screen: "screen",
    intro: (title: string, brief: string) => `Please implement ${title} in the Material 3 Expressive design language.${brief ? ` ${trimEnd(brief)}.` : ""}`,
    titleOnly: (name: string) => `the ${name} screen`,
    titleAll: (n: number) => (n > 1 ? "this app" : "this screen"),
    target: (vp: Viewport, pl: Platform, dark: boolean, both: boolean) =>
      `${
        vp === "phone"
          ? "Target a portrait phone screen (412×892dp)"
          : vp === "desktop"
            ? pl === "web"
              ? "Target a desktop browser viewport (1280×800 reference)"
              : "Target a landscape tablet screen (1280×800dp reference)"
            : vp === "mixed"
              ? `Target both a portrait phone (412×892) and a ${pl === "web" ? "desktop browser viewport" : "landscape tablet"} (1280×800); screens that share a name are one screen at two widths, so build them responsively`
              : "The layout is free-form"
      }, ${both ? "supporting both light and dark mode and following the device's system setting" : `${dark ? "dark" : "light"} mode only`}.`,
    platform: (pl: Platform) => (pl === "web" ? "Build it for the web, as an app that runs in the browser." : "Build it for Android, as a native app."),
    schemeHead: (dark: boolean) => (dark ? "Dark scheme:" : "Light scheme:"),
    sketch:
      "The layout below is a rough sketch that conveys intent, not a finished spec. Do not reproduce it as a static picture; build the complete, usable app that this kind of product is normally expected to be.",
    hColor: "## Colors",
    dynamic: (pl: Platform) =>
      pl === "web"
        ? "Use dynamic color: where the browser or OS exposes the user's accent color, generate the Material 3 scheme from it as the seed, and fall back to the colors below where it is unavailable."
        : "Use dynamic color: on Android 12+ apply the scheme generated from the user's wallpaper (dynamicLightColorScheme / dynamicDarkColorScheme), and fall back to the colors below where it is unavailable.",
    colorIntro: (label: string, fallback: boolean, th: Theme) => {
      const scheme = `Material 3 ${th.bothModes ? "light and dark color schemes" : `${th.dark ? "dark" : "light"} color scheme`}${th.contrast === "high" ? " (high contrast)" : th.contrast === "medium" ? " (medium contrast)" : ""}`;
      return `The ${fallback ? "fallback theme" : "theme"} is ${label}. Set these on the ${scheme} and reference every UI color through its role.`;
    },
    hTheme: "## Shape, type and motion",
    hLayout: "## Layout",
    empty: "Nothing has been placed on the screen yet.",
    screens: (names: string[]) => `There are ${names.length} screens: ${names.join(", ")}.`,
    placement: (place: Place) => (place === "center" ? "The body parts sit together in the vertical center of the screen." : place === "bottom" ? "The body parts sit toward the bottom of the screen, above the navigation bar." : "The body parts are spread over the screen height with equal gaps (a single row sits in the vertical center)."),
    screenHead: (name: string, bg: string | undefined, has: boolean, size?: string) => `The ${name} screen${size || bg ? ` (${[size, bg ? `background ${bg}` : ""].filter(Boolean).join(", ")})` : ""}${has ? ", from top to bottom (overlapping parts are called out as such):" : " is still empty."}`,
    loose: "Parts placed outside the screens (shared parts or references):",
    freeform: "The screen, from top to bottom:",
    hBehavior: "## Behavior and navigation",
    hStyle: "## Component styles",
    styleIntro: "Per-component guidance for the parts in use. The numbers are the M3 Expressive defaults: let the standard components handle whatever they already do, and adjust where the content calls for it.",
    hGeneral: "## General guidance",
  }
};

export function buildPrompt(doc: Doc, widths: Record<string, number>, onlyFrameId?: string, lang: Lang = getLang()): string {
  doc = { ...doc, groups: constrainModalRails(doc.groups) };
  const th = normalizeTheme(doc.theme);
  const pal = paletteOf(doc.paletteKey, doc.customPalette, th);
  const phone = doc.frame === "phone";
  const platform: Platform = doc.platform ?? defaultPlatformOf(doc.frames, doc.frame);
  const allFrames = phone ? doc.frames : [];
  const only = onlyFrameId ? allFrames.find((f) => f.id === onlyFrameId) : undefined;
  const frames = only ? [only] : allFrames;
  const viewport = viewportOf(frames, phone);
  const groups = doc.groups
    .filter((g) => !only || frameOfGroup(g, allFrames, widths)?.id === only.id)
    .flatMap((g) => explodeGroup(g, widths));
  const lines: string[] = [];
  const q = quote(lang);
  const ph = PH[lang];

  const byFrame = new Map<string, Group[]>();
  const loose: Group[] = [];
  for (const g of groups) {
    const f = frameOfGroup(g, allFrames, widths);
    if (f && frames.some((x) => x.id === f.id)) byFrame.set(f.id, [...(byFrame.get(f.id) ?? []), g]);
    else if (!f) loose.push(g);
  }

  const kindsUsed: Kind[] = [];
  let sheet = false;
  let wideRail = false;
  let legacyRail = false;
  for (const g of groups)
    for (const it of g.items) {
      if (!kindsUsed.includes(it.kind)) kindsUsed.push(it.kind);
      if (it.kind === "box" && it.checked) sheet = true;
      if (it.kind === "navRail") {
        if (isWideRail(it)) wideRail = true;
        else legacyRail = true;
      }
    }
  const styleNotes = kindsUsed
    .map((k) => (k === "navRail" && wideRail ? `${legacyRail ? `${STYLE_NOTES[lang].navRail} ` : ""}${WIDE_RAIL_STYLE[lang]}` : k === "box" && sheet ? STYLE_NOTES[lang].boxSheet : (platform === "web" && STYLE_NOTES_WEB[lang][k]) || STYLE_NOTES[lang][k]))
    .filter((s): s is string => !!s);

  const title = only ? ph.titleOnly(q(only.name || ph.screen)) : doc.title.trim() || ph.titleAll(frames.length);
  lines.push(ph.intro(title, doc.brief.trim()));
  lines.push(ph.target(viewport, platform, th.dark, th.bothModes));
  lines.push(ph.platform(platform));
  lines.push(ph.sketch);

  lines.push("");
  lines.push(ph.hColor);
  if (doc.dynamicColor) lines.push(ph.dynamic(platform));
  lines.push(ph.colorIntro(pal.label, !!doc.dynamicColor, th));
  if (th.bothModes) {
    const light = paletteOf(doc.paletteKey, doc.customPalette, { ...th, dark: false });
    const dark = paletteOf(doc.paletteKey, doc.customPalette, { ...th, dark: true });
    lines.push(ph.schemeHead(false));
    lines.push(...paletteLines(light));
    lines.push(ph.schemeHead(true));
    lines.push(...paletteLines(dark));
  } else {
    lines.push(...paletteLines(pal));
  }

  lines.push("");
  lines.push(ph.hTheme);
  lines.push(...themeLines(th, lang));

  lines.push("");
  lines.push(ph.hLayout);
  if (groups.length === 0) {
    lines.push(ph.empty);
  } else if (frames.length > 0) {
    if (frames.length > 1) lines.push(ph.screens(frames.map((f) => q(f.name || ph.screen))));
    frames.forEach((f, i) => {
      const gs = byFrame.get(f.id) ?? [];
      if (i > 0 || frames.length > 1) lines.push("");
      if (hasText(f.note)) lines.push(`${trimEnd(f.note!)}.`);
      lines.push(ph.screenHead(q(f.name || ph.screen), f.bg && f.bg !== "surface" ? f.bg : undefined, gs.length > 0, sizeLabel(f, viewport, lang)));
      if (gs.length > 0 && f.place && f.place !== "top") lines.push(ph.placement(f.place));
      describeScreen(lines, gs, frameRect(f), widths, lang);
    });
    if (loose.length && !only) {
      lines.push("");
      lines.push(ph.loose);
      describeScreen(lines, loose, null, widths, lang);
    }
  } else {
    lines.push(ph.freeform);
    describeScreen(lines, groups, null, widths, lang);
  }

  const behavior = [...groups.flatMap((g) => notes(g, allFrames, lang)), ...frames.flatMap((f) => swipeNotes(f, allFrames, lang))];
  if (behavior.length) {
    lines.push("");
    lines.push(ph.hBehavior);
    for (const n of behavior) lines.push(`- ${n}`);
  }

  if (styleNotes.length) {
    lines.push("");
    lines.push(ph.hStyle);
    lines.push(ph.styleIntro);
    for (const s of styleNotes) lines.push(`- ${s}`);
  }

  lines.push("");
  lines.push(ph.hGeneral);
  for (const s of GENERAL[lang]) lines.push(`- ${typeof s === "function" ? s(platform) : s}`);
  return lines.join("\n");
}

/** the prompt to hand out: the author's edited text when there is one, otherwise the generated one */
export const effectivePrompt = (doc: Doc, widths: Record<string, number>, lang: Lang = getLang()): string => (doc.promptEdit !== undefined ? doc.promptEdit : buildPrompt(doc, widths, undefined, lang));
