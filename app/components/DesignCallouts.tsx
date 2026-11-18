"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import * as THREE from "three";

export type CalloutItem = {
  key: string;
  /** Key in `designStudio.anchors`. */
  anchor: string;
  label: string;
  /** leader: dot + line + label column · pin: numbered dot (label when active) · tag: pill at the anchor. */
  kind: "leader" | "pin" | "tag";
  index?: number;
  active?: boolean;
  /**
   * Fixed position as % of the callout layer (0–100).
   * When set, skips 3D projection — used while the Stage 01 studio still covers the jacket.
   */
  screen?: { x: number; y: number };
};

export type CalloutHandle = {
  /** Re-project anchors to screen space; call once per rendered frame. */
  update: (
    camera: THREE.Camera,
    width: number,
    height: number,
    anchors: Record<string, THREE.Object3D>,
    fade: number,
  ) => void;
};

type ItemEls = {
  dot?: HTMLDivElement | null;
  label?: HTMLDivElement | null;
  line?: SVGPolylineElement | null;
};

const LABEL_GAP = 30;
const _v = new THREE.Vector3();

/**
 * Screen-space annotation layer for the Stage 01 design studio. Positions are written
 * straight to the DOM every frame (no React re-render) from the 3D anchor objects.
 */
export function DesignCallouts({
  items,
  ref,
}: {
  items: CalloutItem[];
  ref?: Ref<CalloutHandle>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const elsRef = useRef(new Map<string, ItemEls>());

  const els = (key: string) => {
    let e = elsRef.current.get(key);
    if (!e) {
      e = {};
      elsRef.current.set(key, e);
    }
    return e;
  };

  useImperativeHandle(
    ref,
    () => ({
      update: (camera, width, height, anchors, fade) => {
        const root = rootRef.current;
        if (!root) return;
        root.style.opacity = fade.toFixed(3);
        if (fade <= 0.001) return;

        const projected = new Map<string, { x: number; y: number; ok: boolean }>();
        items.forEach((item) => {
          if (item.screen) {
            projected.set(item.key, {
              x: (item.screen.x / 100) * width,
              y: (item.screen.y / 100) * height,
              ok: true,
            });
            return;
          }
          const anchor = anchors[item.anchor];
          if (!anchor) {
            projected.set(item.key, { x: 0, y: 0, ok: false });
            return;
          }
          anchor.getWorldPosition(_v).project(camera);
          projected.set(item.key, {
            x: (_v.x * 0.5 + 0.5) * width,
            y: (-_v.y * 0.5 + 0.5) * height,
            ok: _v.z < 1 && anchor.parent !== null && isVisible(anchor),
          });
        });

        // Leader labels share a column to the right of the right-most annotated point.
        const leaders = items.filter(
          (i) => i.kind === "leader" || (i.kind === "pin" && i.active),
        );
        let maxX = 0;
        leaders.forEach((i) => {
          const p = projected.get(i.key);
          if (p?.ok) maxX = Math.max(maxX, p.x);
        });
        const columnX = Math.min(Math.max(maxX + 56, width * 0.72), width - 220);
        let lastY = -Infinity;
        const labelY = new Map<string, number>();
        [...leaders]
          .sort((a, b) => (projected.get(a.key)?.y ?? 0) - (projected.get(b.key)?.y ?? 0))
          .forEach((i) => {
            const y = Math.max(projected.get(i.key)?.y ?? 0, lastY + LABEL_GAP);
            labelY.set(i.key, y);
            lastY = y;
          });

        items.forEach((item) => {
          const p = projected.get(item.key);
          const e = elsRef.current.get(item.key);
          if (!p || !e) return;
          const show = p.ok ? "1" : "0";
          if (e.dot) {
            e.dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
            e.dot.style.opacity = show;
          }
          const ly = labelY.get(item.key);
          if (ly !== undefined) {
            if (e.label) {
              e.label.style.transform = `translate3d(${columnX}px, ${ly}px, 0) translate(0, -50%)`;
              e.label.style.opacity = show;
            }
            if (e.line) {
              e.line.setAttribute(
                "points",
                `${p.x},${p.y} ${columnX - 26},${ly} ${columnX - 6},${ly}`,
              );
              e.line.style.opacity = show;
            }
          } else if (item.kind === "tag" && e.label) {
            e.label.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
            e.label.style.opacity = show;
          }
        });
      },
    }),
    [items],
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      style={{ opacity: 0 }}
    >
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        {items
          .filter((i) => i.kind === "leader" || (i.kind === "pin" && i.active))
          .map((i) => (
            <polyline
              key={i.key}
              ref={(el) => {
                els(i.key).line = el;
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              className="text-chrome/70 transition-opacity duration-200"
              style={{ opacity: 0 }}
            />
          ))}
      </svg>

      {items.map((i) => (
        <div key={i.key}>
          {i.kind !== "tag" ? (
            <div
              ref={(el) => {
                els(i.key).dot = el;
              }}
              className={`absolute left-0 top-0 flex items-center justify-center rounded-full bg-brand font-mono font-bold text-white shadow-[0_0_0_3px_rgba(9,17,34,0.55)] transition-[width,height,opacity] duration-200 ${
                i.kind === "pin"
                  ? i.active
                    ? "h-6 w-6 text-[11px]"
                    : "h-5 w-5 text-[10px]"
                  : "h-2.5 w-2.5"
              }`}
              style={{ opacity: 0 }}
            >
              {i.kind === "pin" ? i.index : null}
            </div>
          ) : null}
          {i.kind !== "pin" || i.active ? (
            <div
              ref={(el) => {
                els(i.key).label = el;
              }}
              className={
                i.kind === "tag"
                  ? "absolute left-0 top-0 whitespace-nowrap rounded-full bg-brand/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-lg"
                  : "absolute left-0 top-0 whitespace-nowrap rounded-md border border-border bg-surface-deep/85 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-chrome shadow-lg backdrop-blur-sm"
              }
              style={{ opacity: 0 }}
            >
              {i.label}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function isVisible(obj: THREE.Object3D): boolean {
  let o: THREE.Object3D | null = obj;
  while (o) {
    if (!o.visible) return false;
    o = o.parent;
  }
  return true;
}
