"use client";

import { Palette, Doc } from "@/lib/tokens";
import { CORPORATE_TEMPLATES, CorporateTemplate } from "@/lib/templates";
import { Icon } from "./M3Node";
import { IconBtn } from "./ui";

export function TemplatesModal({
  palette: p,
  onClose,
  onSelect,
}: {
  palette: Palette;
  onClose: () => void;
  onSelect: (doc: Doc) => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "rgba(0,0,0,0.48)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="no-scrollbar"
        style={{
          width: "min(840px, 95vw)",
          maxHeight: "88vh",
          overflowY: "auto",
          borderRadius: 28,
          background: p.surfaceContainerHigh,
          color: p.onSurface,
          padding: "24px 28px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: p.primaryContainer,
                color: p.onPrimaryContainer,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Icon name="space_dashboard" size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Corporate Template Packs</h2>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: p.onSurfaceVariant }}>
                Production-ready enterprise multi-screen workflows and executive cockpits.
              </p>
            </div>
          </div>
          <IconBtn icon="close" p={p} onClick={onClose} size={40} title="Close" />
        </div>

        {/* Templates Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {CORPORATE_TEMPLATES.map((tmpl: CorporateTemplate) => (
            <div
              key={tmpl.id}
              style={{
                background: p.surfaceContainerLow,
                borderRadius: 20,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                border: `1px solid ${p.outlineVariant}44`,
                boxSizing: "border-box",
                transition: "transform 140ms ease, box-shadow 140ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: p.secondaryContainer,
                    color: p.onSecondaryContainer,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon name={tmpl.icon} size={22} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 10,
                    background: p.tertiaryContainer,
                    color: p.onTertiaryContainer,
                  }}
                >
                  {tmpl.badge}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: p.primary, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {tmpl.category}
                </div>
                <h3 style={{ margin: "4px 0 6px", fontSize: 16, fontWeight: 700 }}>{tmpl.name}</h3>
                <p style={{ margin: 0, fontSize: 12, color: p.onSurfaceVariant, lineHeight: 1.5 }}>
                  {tmpl.description}
                </p>
              </div>

              <div style={{ marginTop: "auto", paddingTop: 8 }}>
                <button
                  onClick={() => onSelect(tmpl.doc)}
                  className="m3-press"
                  style={{
                    width: "100%",
                    height: 42,
                    borderRadius: 21,
                    border: "none",
                    background: p.primary,
                    color: p.onPrimary,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Icon name="check" size={18} />
                  Load Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
