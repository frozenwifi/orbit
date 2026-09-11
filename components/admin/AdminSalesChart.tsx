"use client";

import { useCallback, useEffect, useRef } from "react";
import { adminSalesValues } from "@/data/admin-dashboard";
import { useTheme } from "@/components/providers/ThemeProvider";

interface Point {
  x: number;
  y: number;
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

export function AdminSalesChart({ empty }: { empty: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrame = useRef<number | null>(null);
  const { theme } = useTheme();

  const draw = useCallback((progress = 1) => {
    const canvas = canvasRef.current;
    const shell = canvas?.parentElement;
    if (!canvas || !shell) return;
    const rect = shell.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const styles = getComputedStyle(shell.closest(".admin-shell") ?? document.documentElement);
    const stroke = styles.getPropertyValue("--admin-chart-stroke").trim();
    const fillTop = styles.getPropertyValue("--admin-chart-fill-top").trim();
    const fillBottom = styles.getPropertyValue("--admin-chart-fill-bottom").trim();
    const grid = styles.getPropertyValue("--admin-line-soft").trim();
    const muted = styles.getPropertyValue("--admin-subtle").trim();
    const surface = styles.getPropertyValue("--admin-surface").trim();
    const pad = { left: 60, right: 2, top: 18, bottom: 40 };
    const plotWidth = rect.width - pad.left - pad.right;
    const plotHeight = rect.height - pad.top - pad.bottom;
    const min = 2000;
    const max = 5000;
    const points = adminSalesValues.map((value, index) => ({
      x: pad.left + (index / (adminSalesValues.length - 1)) * plotWidth,
      y: pad.top + (1 - (value - min) / (max - min)) * plotHeight,
    }));

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

    if (empty) return;

    context.save();
    context.beginPath();
    context.rect(pad.left, 0, plotWidth * Math.max(0.01, progress), rect.height);
    context.clip();
    const fill = context.createLinearGradient(0, pad.top, 0, pad.top + plotHeight);
    fill.addColorStop(0, fillTop);
    fill.addColorStop(1, fillBottom);
    traceSmoothPath(context, points);
    context.lineTo(points.at(-1)!.x, pad.top + plotHeight);
    context.lineTo(points[0].x, pad.top + plotHeight);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
    traceSmoothPath(context, points);
    context.strokeStyle = stroke;
    context.lineWidth = theme === "dark" ? 3 : 2;
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
      context.strokeStyle = stroke;
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(focus.x, focus.y + 11);
      context.lineTo(focus.x, pad.top + plotHeight);
      context.stroke();
      context.restore();
      context.beginPath();
      context.arc(focus.x, focus.y, 8, 0, Math.PI * 2);
      context.fillStyle = stroke;
      context.fill();
      context.beginPath();
      context.arc(focus.x, focus.y, 11, 0, Math.PI * 2);
      context.lineWidth = 3;
      context.strokeStyle = surface;
      context.stroke();
    }
  }, [empty, theme]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (empty || reduceMotion) {
      draw(1);
    } else {
      const startedAt = performance.now();
      const animate = (now: number) => {
        const elapsed = Math.min(1, (now - startedAt) / 780);
        draw(1 - Math.pow(1 - elapsed, 3));
        if (elapsed < 1) animationFrame.current = requestAnimationFrame(animate);
      };
      animationFrame.current = requestAnimationFrame(animate);
    }
    const observer = new ResizeObserver(() => draw(1));
    const shell = canvasRef.current?.parentElement;
    if (shell) observer.observe(shell);
    return () => {
      observer.disconnect();
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [draw, empty]);

  return (
    <div className="admin-chart-shell">
      <canvas className="admin-sales-canvas" ref={canvasRef} aria-label={empty ? "No sales data for December 29 to January 4" : "Sales from December 29 to January 4, ranging from $2,200 to $4,700"} />
    </div>
  );
}
