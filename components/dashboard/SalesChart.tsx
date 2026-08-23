"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { salesLabels, salesValues } from "@/data/dashboard";
import { useTheme } from "@/components/providers/ThemeProvider";

interface Point {
  x: number;
  y: number;
}

interface TooltipState {
  left: number;
  top: number;
  value: string;
  date: string;
}

const xAxisLabels = ["Dec 29", "Dec 30", "Dec 31", "Jan 1", "Jan 2", "Jan 3", "Jan 4"] as const;

function traceSmoothPath(context: CanvasRenderingContext2D, points: Point[]) {
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = points[index + 2] ?? next;
    context.bezierCurveTo(
      current.x + (next.x - previous.x) / 6,
      current.y + (next.y - previous.y) / 6,
      next.x - (afterNext.x - current.x) / 6,
      next.y - (afterNext.y - current.y) / 6,
      next.x,
      next.y,
    );
  }
}

export function SalesChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const animationFrame = useRef<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ left: 0, top: 0, value: "$2,342", date: "Dec 31, 2024" });
  const { theme } = useTheme();

  const draw = useCallback((progress = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const shell = canvas.parentElement;
    if (!shell) return;
    const rect = shell.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const styles = getComputedStyle(document.body);
    const accent = styles.getPropertyValue("--accent").trim();
    const muted = styles.getPropertyValue("--subtle").trim();
    const grid = styles.getPropertyValue("--line-soft").trim();
    const surface = styles.getPropertyValue("--surface").trim();
    const pad = { left: 60, right: 2, top: 18, bottom: 40 };
    const plotWidth = rect.width - pad.left - pad.right;
    const plotHeight = rect.height - pad.top - pad.bottom;
    const min = 2000;
    const max = 5000;
    const points = salesValues.map((value, index) => ({
      x: pad.left + (index / (salesValues.length - 1)) * plotWidth,
      y: pad.top + (1 - (value - min) / (max - min)) * plotHeight,
    }));
    pointsRef.current = points;

    context.clearRect(0, 0, rect.width, rect.height);
    context.font = '12px Inter, "Segoe UI", Arial, sans-serif';
    context.textBaseline = "middle";
    context.strokeStyle = grid;
    context.fillStyle = muted;
    context.lineWidth = 1;
    [5000, 4000, 3000, 2000].forEach((label) => {
      const y = pad.top + (1 - (label - min) / (max - min)) * plotHeight;
      context.beginPath();
      context.moveTo(pad.left, y + 0.5);
      context.lineTo(rect.width - pad.right, y + 0.5);
      context.stroke();
      context.textAlign = "left";
      context.fillText(String(label), 0, y);
    });

    xAxisLabels.forEach((label, index) => {
      if (rect.width < 430 && index % 2 === 1) return;
      const x = pad.left + (index / (xAxisLabels.length - 1)) * plotWidth;
      context.textAlign = index === 0 ? "left" : index === xAxisLabels.length - 1 ? "right" : "center";
      context.fillText(label, x, rect.height - 12);
    });

    context.save();
    context.beginPath();
    context.rect(pad.left, 0, plotWidth * Math.max(0.01, progress), rect.height);
    context.clip();
    const fill = context.createLinearGradient(0, pad.top, 0, pad.top + plotHeight);
    fill.addColorStop(0, theme === "dark" ? "rgba(46,193,255,.70)" : "rgba(183,231,255,.66)");
    fill.addColorStop(1, theme === "dark" ? "rgba(46,193,255,.03)" : "rgba(239,249,255,.08)");
    traceSmoothPath(context, points);
    context.lineTo(points.at(-1)!.x, pad.top + plotHeight);
    context.lineTo(points[0].x, pad.top + plotHeight);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
    traceSmoothPath(context, points);
    context.strokeStyle = accent;
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
    context.restore();

    const focusThreshold = 1 / 3;
    const focus = {
      x: pad.left + plotWidth * focusThreshold,
      y: pad.top + (1 - (2850 - min) / (max - min)) * plotHeight,
    };
    if (progress > focusThreshold) {
      context.save();
      context.setLineDash([5, 6]);
      context.strokeStyle = accent;
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(focus.x, focus.y + 11);
      context.lineTo(focus.x, pad.top + plotHeight);
      context.stroke();
      context.restore();
      context.beginPath();
      context.arc(focus.x, focus.y, 9, 0, Math.PI * 2);
      context.fillStyle = surface;
      context.fill();
      context.lineWidth = 3;
      context.strokeStyle = accent;
      context.stroke();
    }
    if (progress > 0.92) setTooltip({ left: focus.x, top: focus.y - 64, value: "$2,342", date: "Dec 31, 2024" });
  }, [theme]);

  useEffect(() => {
    const startedAt = performance.now();
    const animate = (now: number) => {
      const elapsed = Math.min(1, (now - startedAt) / 900);
      draw(1 - Math.pow(1 - elapsed, 3));
      if (elapsed < 1) animationFrame.current = requestAnimationFrame(animate);
    };
    animationFrame.current = requestAnimationFrame(animate);
    const observer = new ResizeObserver(() => draw(1));
    const shell = canvasRef.current?.parentElement;
    if (shell) observer.observe(shell);
    return () => {
      observer.disconnect();
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [draw]);

  return (
    <div className="chart-shell">
      <canvas
        className="sales-canvas"
        ref={canvasRef}
        aria-label="Sales from December 29 to January 4, ranging from $2,200 to $4,700"
        onMouseMove={(event) => {
          const canvas = canvasRef.current;
          const points = pointsRef.current;
          if (!canvas || !points.length) return;
          const bounds = canvas.getBoundingClientRect();
          const x = event.clientX - bounds.left;
          const nearest = points.reduce((best, point, index) => Math.abs(point.x - x) < Math.abs(points[best].x - x) ? index : best, 0);
          setTooltip({ left: points[nearest].x, top: points[nearest].y, value: `$${salesValues[nearest].toLocaleString("en-US")}`, date: `${salesLabels[nearest]}, 2024` });
        }}
        onMouseLeave={() => draw(1)}
      />
      <div className="chart-tooltip visible" role="status" style={{ left: tooltip.left, top: tooltip.top }}>
        <strong>{tooltip.value}</strong><span>{tooltip.date}</span>
      </div>
    </div>
  );
}
