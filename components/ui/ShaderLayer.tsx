"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * A full-surface fragment shader on a plain WebGL2 context — no scene, no three. The fragment
 * gets time, resolution, the pointer in uv space, and two caller-driven scalars (`progress`,
 * `energy`) through a ref, so scroll-linked values reach the GPU without a React render. It
 * draws at a fraction of device resolution and only while on screen.
 */

export type ShaderDrive = { progress: number; energy: number };

const VERT = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

export function ShaderLayer({ fragment, drive, className, scale = 0.5, fps }: { fragment: string; drive?: MutableRefObject<ShaderDrive>; className?: string; scale?: number; fps?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "high-performance" });
    if (!gl || gl.isContextLost()) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, `#version 300 es\nprecision highp float;\nin vec2 vUv;\nout vec4 o;\nuniform float uTime;\nuniform vec2 uRes;\nuniform vec2 uMouse;\nuniform float uProgress;\nuniform float uEnergy;\n${fragment}`));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "program");
    } catch (e) {
      if (process.env.NODE_ENV !== "production") console.error("[ShaderLayer]", e);
      return;
    }
    gl.useProgram(prog);
    const quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = {
      time: gl.getUniformLocation(prog, "uTime"),
      res: gl.getUniformLocation(prog, "uRes"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
      progress: gl.getUniformLocation(prog, "uProgress"),
      energy: gl.getUniformLocation(prog, "uEnergy"),
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 2) * scale;
    const size = () => {
      const r = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let energy = 0;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = false;
    let raf = 0;
    let last = performance.now();
    let t = 0;
    const minGap = fps ? 1000 / fps - 2 : 0;
    let lastDraw = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - lastDraw < minGap) return;
      lastDraw = now;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      t += dt;
      const k = 1 - Math.exp(-5 * dt);
      mouse.x += (mouse.tx - mouse.x) * k;
      mouse.y += (mouse.ty - mouse.y) * k;
      const d = drive?.current;
      /* callers flip energy like a switch (hover on/off); the surface should swell, not snap */
      energy += ((d?.energy ?? 0) - energy) * (1 - Math.exp(-4 * dt));
      gl.uniform1f(U.time, t);
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform2f(U.mouse, mouse.x, mouse.y);
      gl.uniform1f(U.progress, d?.progress ?? 0);
      gl.uniform1f(U.energy, energy);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    }, { rootMargin: "30% 0px" });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : visible && start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteBuffer(quad);
      gl.deleteProgram(prog);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };
  }, [fragment, drive, reduced, scale, fps]);

  if (reduced) return null;
  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none block h-full w-full", className)} />;
}
