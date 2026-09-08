"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPrompt } from "@/lib/prompt";
import { Doc, Palette, Platform, defaultPlatformOf } from "@/lib/tokens";
import { Icon } from "./M3Node";
import { Field, IconBtn, Segmented } from "./ui";
import { t, useLang } from "@/lib/i18n";
import { buildYaml, YamlMode } from "@/lib/yaml";
import { buildFlowchart } from "@/lib/flowchart";
import { MermaidViewer } from "./MermaidViewer";
import { saveYaml } from "@/lib/project";

type ExportFormat = "prompt" | "yaml" | "flowchart";

export function PromptPanel({
  doc,
  widths,
  palette: p,
  onDoc,
}: {
  doc: Doc;
  widths: Record<string, number>;
  palette: Palette;
  onDoc: (patch: Partial<Doc>) => void;
}) {
  const lang = useLang();
  const [format, setFormat] = useState<ExportFormat>("prompt");
  const [yamlMode, setYamlMode] = useState<YamlMode>("powerAutomate");

  const generatedPrompt = useMemo(() => buildPrompt(doc, widths, undefined, lang), [doc, widths, lang]);
  const edited = doc.promptEdit !== undefined;
  const promptText = edited ? doc.promptEdit! : generatedPrompt;

  const yamlText = useMemo(() => buildYaml(doc, widths, yamlMode), [doc, widths, yamlMode]);

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedYaml, setCopiedYaml] = useState(false);

  useEffect(() => {
    if (!copiedPrompt) return;
    const timer = setTimeout(() => setCopiedPrompt(false), 1400);
    return () => clearTimeout(timer);
  }, [copiedPrompt]);

  useEffect(() => {
    if (!copiedYaml) return;
    const timer = setTimeout(() => setCopiedYaml(false), 1400);
    return () => clearTimeout(timer);
  }, [copiedYaml]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(true);
    } catch {}
  };

  const copyYaml = async () => {
    try {
      await navigator.clipboard.writeText(yamlText);
      setCopiedYaml(true);
    } catch {}
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 10 }}>
      {/* Format selector: AI Prompt vs YAML vs Flowchart */}
      <Segmented<ExportFormat>
        options={[
          { key: "prompt", icon: "auto_awesome", label: t("formatPrompt", lang), title: "AI Prompt" },
          { key: "yaml", icon: "code", label: t("formatYaml", lang), title: "YAML (Power Automate)" },
          { key: "flowchart", icon: "schema", label: t("formatFlowchart", lang), title: "Mermaid Flowchart" },
        ]}
        value={format}
        onChange={setFormat}
        p={p}
        height={38}
      />

      {format === "prompt" ? (
        <>
          <Field
            value={doc.title}
            onChange={(title) => onDoc({ title })}
            placeholder={t("appName", lang)}
            p={p}
            icon="smartphone"
          />
          <Field
            value={doc.brief}
            onChange={(brief) => onDoc({ brief })}
            placeholder={t("brief", lang)}
            p={p}
            icon="lightbulb"
            multiline
            rows={3}
          />
          <Segmented<Platform>
            options={[
              { key: "android", icon: "android", label: "Android", title: t("targetAndroid", lang) },
              { key: "web", icon: "language", label: "Web", title: t("targetWeb", lang) },
            ]}
            value={doc.platform ?? defaultPlatformOf(doc.frames, doc.frame)}
            onChange={(platform) => onDoc({ platform })}
            p={p}
            height={40}
          />
          <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex" }}>
            <textarea
              className="no-scrollbar"
              value={promptText}
              onChange={(e) => onDoc({ promptEdit: e.target.value })}
              spellCheck={false}
              aria-label={t("prompt", lang)}
              style={{
                flex: 1,
                minHeight: 0,
                width: "100%",
                borderRadius: 18,
                border: "none",
                background: p.surfaceContainerLow,
                padding: edited ? "14px 14px 48px" : 14,
                fontSize: 13,
                lineHeight: 1.75,
                color: p.onSurface,
                fontFamily: "inherit",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {edited && (
              <div style={{ position: "absolute", right: 8, bottom: 8 }}>
                <IconBtn icon="undo" p={p} size={32} onClick={() => onDoc({ promptEdit: undefined })} title={t("promptReset", lang)} />
              </div>
            )}
          </div>
          <button
            onClick={copyPrompt}
            className="m3-press"
            style={{
              height: 48,
              borderRadius: 24,
              border: "none",
              background: copiedPrompt ? p.tertiaryContainer : p.primary,
              color: copiedPrompt ? p.onTertiaryContainer : p.onPrimary,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 160ms, color 160ms",
            }}
          >
            <Icon name={copiedPrompt ? "check" : "content_copy"} size={20} />
            {copiedPrompt ? t("copied", lang) : t("copyPrompt", lang)}
          </button>
        </>
      ) : format === "yaml" ? (
        <>
          <Segmented<YamlMode>
            options={[
              { key: "powerAutomate", icon: "bolt", label: t("yamlPowerAutomate", lang), title: "Power Automate & Power Apps flow trigger / actions schema" },
              { key: "fullSpec", icon: "data_object", label: t("yamlFullSpec", lang), title: "Full Marsh-Stitch component & screen spec" },
            ]}
            value={yamlMode}
            onChange={setYamlMode}
            p={p}
            height={36}
          />
          <div
            style={{
              fontSize: 11,
              color: p.onSurfaceVariant,
              padding: "2px 4px",
              lineHeight: 1.4,
            }}
          >
            {yamlMode === "powerAutomate"
              ? "Compatible with Power Automate flows & Power Apps declarative screens."
              : "Complete Marsh-Stitch component hierarchy and screen layout specification."}
          </div>
          <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex" }}>
            <textarea
              className="no-scrollbar"
              value={yamlText}
              readOnly
              spellCheck={false}
              aria-label="YAML code"
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
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                whiteSpace: "pre",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={copyYaml}
              className="m3-press"
              style={{
                flex: 1,
                height: 48,
                borderRadius: 24,
                border: "none",
                background: copiedYaml ? p.tertiaryContainer : p.primary,
                color: copiedYaml ? p.onTertiaryContainer : p.onPrimary,
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
              <Icon name={copiedYaml ? "check" : "content_copy"} size={18} />
              {copiedYaml ? t("copied", lang) : t("copyYaml", lang)}
            </button>
            <button
              onClick={() => saveYaml(doc, yamlText)}
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
              {t("downloadYaml", lang)}
            </button>
          </div>
        </>
      ) : (
        <MermaidViewer code={buildFlowchart(doc, widths)} palette={p} doc={doc} />
      )}
    </div>
  );
}
