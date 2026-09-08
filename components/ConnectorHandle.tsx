"use client";

import React, { useState } from "react";
import { Palette } from "@/lib/tokens";
import { Icon } from "./M3Node";

export interface ConnectorHandleProps {
  /** Center X in world coordinates */
  x: number;
  /** Center Y in world coordinates */
  y: number;
  /** Canvas zoom factor */
  zoom: number;
  /** Current color palette */
  palette: Palette;
  /** Whether a connection is currently being dragged from this handle */
  active?: boolean;
  /** Whether the item already has a target action */
  hasLink?: boolean;
  /** Callback when user starts dragging the handle */
  onStartConnect: (e: React.PointerEvent) => void;
  /** Side of the item to anchor on ("right" | "left") */
  side?: "right" | "left";
  /** Tooltip / title text */
  title?: string;
}

/**
 * A floating connector handle (Figma / Miro style) that renders on the edge
 * of selected tappable canvas elements to allow visual drag-to-connect prototyping.
 */
export function ConnectorHandle({
  x,
  y,
  zoom,
  palette: p,
  active = false,
  hasLink = false,
  onStartConnect,
  side = "right",
  title = "Drag to connect to screen (Figma style)",
}: ConnectorHandleProps) {
  const [hovered, setHovered] = useState(false);

  // Counter-scale so the handle remains comfortably 22-26px on screen regardless of canvas zoom
  const invZoom = 1 / Math.max(0.1, zoom);
  const size = hovered || active ? 26 : 22;
  const offset = 10 * invZoom;

  return (
    <div
      role="button"
      tabIndex={-1}
      title={title}
      aria-label={title}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onStartConnect(e);
      }}
      style={{
        position: "absolute",
        left: side === "right" ? x + offset : x - offset,
        top: y,
        transform: `translate(-50%, -50%) scale(${invZoom})`,
        transformOrigin: "center center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: active ? p.primary : hovered ? p.primary : hasLink ? p.primaryContainer : p.surfaceContainerHighest,
        color: active || hovered ? p.onPrimary : hasLink ? p.onPrimaryContainer : p.primary,
        border: `2px solid ${active || hovered ? p.primary : p.outlineVariant}`,
        boxShadow: active || hovered
          ? `0 0 0 4px ${p.primary}33, 0 4px 12px rgba(0,0,0,0.22)`
          : `0 2px 6px rgba(0,0,0,0.15)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "crosshair",
        zIndex: 100,
        userSelect: "none",
        touchAction: "none",
        transition: "all 140ms cubic-bezier(0.2, 0, 0, 1)",
      }}
    >
      <Icon name={hasLink ? "link" : "add"} size={14} />

      {/* Floating tooltip badge on hover when not actively dragging */}
      {hovered && !active && (
        <div
          style={{
            position: "absolute",
            left: side === "right" ? "100%" : "auto",
            right: side === "left" ? "100%" : "auto",
            marginLeft: side === "right" ? 8 : 0,
            marginRight: side === "left" ? 8 : 0,
            padding: "4px 8px",
            borderRadius: 8,
            background: p.inverseSurface,
            color: p.inverseOnSurface,
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            pointerEvents: "none",
          }}
        >
          Drag to connect
        </div>
      )}
    </div>
  );
}
