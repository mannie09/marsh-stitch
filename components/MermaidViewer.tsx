"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, Doc } from "@/lib/tokens";
import { Icon } from "./M3Node";
import { Segmented } from "./ui";
import { t, useLang } from "@/lib/i18n";

export function MermaidViewer({
  code,
  palette: p,
  doc,
}: {
  code: string;
  palette: Palette;
  doc: Doc;
}) {
  const lang = useLang();
  const [viewMode, setViewMode] = useState<"diagram" | "code">("diagram");
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const renderId = useRef(`mermaid_${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    let active = true;
    async function renderMermaid() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: p.primaryContainer,
            primaryTextColor: p.onPrimaryContainer,
            primaryBorderColor: p.primary,
            lineColor: p.primary,
            fontFamily: "inherit",
          },
          securityLevel: "loose",
        });

        const uniqueId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const { svg } = await mermaid.render(uniqueId, code);
        if (active) {
          setSvgHtml(svg);
          setRenderError(null);
        }
      } catch (err: unknown) {
        if (active) {
          setRenderError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }

    renderMermaid();
    return () => {
      active = false;
    };
  }, [code, p]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {}
  };

  const downloadFile = () => {
    const blob = new Blob([code], { type: "text/vnd.mermaid;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = (doc.title || "flowchart")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, " ")
      .trim();
    a.download = `${name || "marsh-stitch-flow"}.mmd`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10 }}>
      {/* Sub-toggle: Diagram vs Code */}
      <Segmented<"diagram" | "code">
        options={[
          { key: "diagram", icon: "schema", label: "Diagram View", title: "Rendered interactive diagram" },
          { key: "code", icon: "code", label: "Mermaid Code", title: "Raw Mermaid.js syntax" },
        ]}
        value={viewMode}
        onChange={setViewMode}
        p={p}
        height={36}
      />

      <div
        style={{
          fontSize: 11,
          color: p.onSurfaceVariant,
          padding: "0 4px",
          lineHeight: 1.4,
        }}
      >
        Native markdown diagram compatible with Confluence, Jira, GitHub, Notion, and Azure DevOps.
      </div>

      <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex" }}>
        {viewMode === "diagram" && !renderError && svgHtml ? (
          <div
            className="no-scrollbar"
            style={{
              flex: 1,
              width: "100%",
              borderRadius: 18,
              background: p.surfaceContainerLow,
              padding: 16,
              overflow: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxSizing: "border-box",
            }}
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        ) : (
          <textarea
            className="no-scrollbar"
            value={code}
            readOnly
            spellCheck={false}
            aria-label="Mermaid.js Flowchart"
            style={{
              flex: 1,
              minHeight: 0,
              width: "100%",
              borderRadius: 18,
              border: "none",
              background: p.surfaceContainerLow,
              padding: 14,
              fontSize: 12,
              lineHeight: 1.6,
              color: p.onSurface,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              whiteSpace: "pre",
            }}
          />
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={copyCode}
          className="m3-press"
          style={{
            flex: 1,
            height: 48,
            borderRadius: 24,
            border: "none",
            background: copied ? p.tertiaryContainer : p.primary,
            color: copied ? p.onTertiaryContainer : p.onPrimary,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "background 160ms, color 160ms",
          }}
        >
          <Icon name={copied ? "check" : "content_copy"} size={18} />
          {copied ? "Copied" : "Copy Mermaid"}
        </button>
        <button
          onClick={downloadFile}
          className="m3-press"
          style={{
            flex: 1,
            height: 48,
            borderRadius: 24,
            border: "none",
            background: p.secondaryContainer,
            color: p.onSecondaryContainer,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "background 160ms, color 160ms",
          }}
        >
          <Icon name="download" size={18} />
          Download .mmd
        </button>
      </div>
    </div>
  );
}
