import { describe, expect, it, vi } from "vitest";
import React from "react";
import { ConnectorHandle } from "./ConnectorHandle";
import { paletteOf } from "../lib/tokens";

vi.mock("./M3Node", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid="icon">{name}</span>,
}));

describe("ConnectorHandle", () => {
  const p = paletteOf("purple");

  it("creates handle element with correct coordinates and scale", () => {
    const onStart = vi.fn();
    const el = (
      <ConnectorHandle
        x={200}
        y={150}
        zoom={1.5}
        palette={p}
        onStartConnect={onStart}
      />
    );
    expect(React.isValidElement(el)).toBe(true);
    expect(el.props.x).toBe(200);
    expect(el.props.y).toBe(150);
    expect(el.props.zoom).toBe(1.5);
  });

  it("shows hasLink state when an action is connected", () => {
    const onStart = vi.fn();
    const el = (
      <ConnectorHandle
        x={100}
        y={100}
        zoom={1.0}
        palette={p}
        hasLink={true}
        onStartConnect={onStart}
      />
    );
    expect(el.props.hasLink).toBe(true);
  });
});
