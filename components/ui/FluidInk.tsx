"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

/**
 * Ink that follows the pointer across the whole site: a small stable-fluids solver (Stam) on
 * half-float textures — advect, diverge, relax pressure, subtract the gradient, curl for the
 * swirl — with amber dye injected along the pointer's path. The canvas is screen-blended over
 * the page at a fraction of its resolution and lets the compositor upscale it. It sleeps a few
 * seconds after the last input, once the dye has dissipated, so it costs nothing while idle.
 */

const VERT = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
uniform vec2 uTexel;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vL = vUv - vec2(uTexel.x, 0.0);
  vR = vUv + vec2(uTexel.x, 0.0);
  vT = vUv + vec2(0.0, uTexel.y);
  vB = vUv - vec2(0.0, uTexel.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
out vec4 o;`;

const SPLAT = /* glsl */ `${HEAD}
uniform sampler2D uTarget; uniform float uAspect; uniform vec3 uColor; uniform vec2 uPoint; uniform float uRadius;
void main() {
  vec2 p = vUv - uPoint; p.x *= uAspect;
  vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
  o = vec4(texture(uTarget, vUv).xyz + splat, 1.0);
}`;

const ADVECT = /* glsl */ `${HEAD}
uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 uTexel; uniform float uDt; uniform float uDissipation;
void main() {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexel;
  float decay = 1.0 + uDissipation * uDt;
  o = texture(uSource, coord) / decay;
}`;

const DIVERGENCE = /* glsl */ `${HEAD}
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).x; float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y; float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
  o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const CURL = /* glsl */ `${HEAD}
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).y; float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x; float B = texture(uVelocity, vB).x;
  o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const VORTICITY = /* glsl */ `${HEAD}
uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float uCurlStrength; uniform float uDt;
void main() {
  float L = texture(uCurl, vL).x; float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x; float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * C; force.y *= -1.0;
  vec2 v = texture(uVelocity, vUv).xy + force * uDt;
  o = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}`;

const PRESSURE = /* glsl */ `${HEAD}
uniform sampler2D uPressure; uniform sampler2D uDivergence;
void main() {
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  float div = texture(uDivergence, vUv).x;
  o = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = /* glsl */ `${HEAD}
uniform sampler2D uPressure; uniform sampler2D uVelocity;
void main() {
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  vec2 v = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  o = vec4(v, 0.0, 1.0);
}`;

const DISPLAY = /* glsl */ `${HEAD}
uniform sampler2D uDye;
void main() {
  vec3 c = texture(uDye, vUv).rgb;
  float a = max(c.r, max(c.g, c.b));
  o = vec4(c, a);
}`;

const CLEAR = /* glsl */ `${HEAD}
uniform sampler2D uTexture; uniform float uValue;
void main() { o = uValue * texture(uTexture, vUv); }`;

type Target = { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number; texel: [number, number] };
type Pair = { read: Target; write: Target; swap: () => void };

function makeProgram(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "program");
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i)!;
    uniforms[info.name] = gl.getUniformLocation(p, info.name);
  }
  return { p, u: uniforms };
}

function makeTarget(gl: WebGL2RenderingContext, w: number, h: number, internal: number, format: number, filter: number): Target {
  const tex = gl.createTexture()!;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return { fb, tex, w, h, texel: [1 / w, 1 / h] };
}

function makePair(gl: WebGL2RenderingContext, w: number, h: number, internal: number, format: number, filter: number): Pair {
  const pair = { read: makeTarget(gl, w, h, internal, format, filter), write: makeTarget(gl, w, h, internal, format, filter), swap() {} };
  pair.swap = () => {
    const t = pair.read;
    pair.read = pair.write;
    pair.write = t;
  };
  return pair;
}

export function FluidInk() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: "high-performance" });
    if (!gl || gl.isContextLost() || !gl.getExtension("EXT_color_buffer_float")) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return;

    const coarse = matchMedia("(pointer: coarse)").matches;
    const SIM = coarse ? 72 : 128;
    const DYE = coarse ? 288 : 640;
    const PRESSURE_ITERS = coarse ? 14 : 20;
    const CURL_STRENGTH = 22;
    const VELOCITY_DISSIPATION = 0.55;
    const DENSITY_DISSIPATION = 1.35;
    const SPLAT_RADIUS = coarse ? 0.0035 : 0.0022;
    const SPLAT_FORCE = 5200;

    gl.getExtension("OES_texture_float_linear");
    gl.clearColor(0, 0, 0, 0);

    const quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    let programs;
    try {
      programs = {
        splat: makeProgram(gl, VERT, SPLAT),
        advect: makeProgram(gl, VERT, ADVECT),
        divergence: makeProgram(gl, VERT, DIVERGENCE),
        curl: makeProgram(gl, VERT, CURL),
        vorticity: makeProgram(gl, VERT, VORTICITY),
        pressure: makeProgram(gl, VERT, PRESSURE),
        gradient: makeProgram(gl, VERT, GRADIENT),
        display: makeProgram(gl, VERT, DISPLAY),
        clear: makeProgram(gl, VERT, CLEAR),
      };
    } catch {
      return;
    }
    const P = programs;

    let aspect = 1;
    let velocity: Pair, dye: Pair, pressure: Pair, divergence: Target, curl: Target;
    const alloc = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      aspect = w / h;
      const simW = Math.round(SIM * Math.max(1, aspect));
      const simH = Math.round(SIM * Math.max(1, 1 / aspect));
      const dyeW = Math.round(DYE * Math.max(1, aspect));
      const dyeH = Math.round(DYE * Math.max(1, 1 / aspect));
      canvas.width = dyeW;
      canvas.height = dyeH;
      velocity = makePair(gl, simW, simH, gl.RG16F, gl.RG, gl.LINEAR);
      pressure = makePair(gl, simW, simH, gl.R16F, gl.RED, gl.NEAREST);
      divergence = makeTarget(gl, simW, simH, gl.R16F, gl.RED, gl.NEAREST);
      curl = makeTarget(gl, simW, simH, gl.R16F, gl.RED, gl.NEAREST);
      dye = makePair(gl, dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR);
    };
    alloc();

    const blit = (target: Target | null) => {
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
        gl.viewport(0, 0, target.w, target.h);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const run = (prog: { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> }, texel: [number, number]) => {
      gl.useProgram(prog.p);
      gl.uniform2f(prog.u.uTexel, texel[0], texel[1]);
      return prog.u;
    };
    const bind = (tex: WebGLTexture, unit: number) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      return unit;
    };

    type Splat = { x: number; y: number; dx: number; dy: number; r: number; g: number; b: number };
    const pending: Splat[] = [];
    let last = { x: 0, y: 0, t: 0, has: false };
    let lastInput = 0;
    let awake = false;
    let raf = 0;
    let prev = performance.now();

    const ink = (seed: number) => {
      /* amber, leaning gold or ember from splat to splat */
      const hue = 0.085 + seed * 0.05;
      const s = 0.85;
      const v = 0.42;
      const i = Math.floor(hue * 6);
      const f = hue * 6 - i;
      const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
      const rgb = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
      return { r: rgb[0] * 0.22, g: rgb[1] * 0.22, b: rgb[2] * 0.22 };
    };

    const onMove = (cx: number, cy: number) => {
      const now = performance.now();
      const x = cx / window.innerWidth;
      const y = 1 - cy / window.innerHeight;
      if (last.has) {
        const dx = (x - last.x) * SPLAT_FORCE;
        const dy = (y - last.y) * SPLAT_FORCE;
        if (Math.abs(dx) + Math.abs(dy) > 2) {
          pending.push({ x, y, dx, dy, ...ink((now * 0.0004) % 1) });
          lastInput = now;
          wake();
        }
      }
      last = { x, y, t: now, has: true };
    };
    const onPointer = (e: PointerEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    const onLeave = () => {
      last.has = false;
    };

    const step = (dt: number) => {
      const v = velocity;
      /* inject */
      for (const s of pending) {
        let u = run(P.splat, v.read.texel);
        gl.uniform1i(u.uTarget, bind(v.read.tex, 0));
        gl.uniform1f(u.uAspect, aspect);
        gl.uniform2f(u.uPoint, s.x, s.y);
        gl.uniform3f(u.uColor, s.dx, s.dy, 0);
        gl.uniform1f(u.uRadius, SPLAT_RADIUS);
        blit(v.write);
        v.swap();
        u = run(P.splat, dye.read.texel);
        gl.uniform1i(u.uTarget, bind(dye.read.tex, 0));
        gl.uniform2f(u.uPoint, s.x, s.y);
        gl.uniform3f(u.uColor, s.r, s.g, s.b);
        gl.uniform1f(u.uRadius, SPLAT_RADIUS);
        blit(dye.write);
        dye.swap();
      }
      pending.length = 0;

      let u = run(P.curl, v.read.texel);
      gl.uniform1i(u.uVelocity, bind(v.read.tex, 0));
      blit(curl);

      u = run(P.vorticity, v.read.texel);
      gl.uniform1i(u.uVelocity, bind(v.read.tex, 0));
      gl.uniform1i(u.uCurl, bind(curl.tex, 1));
      gl.uniform1f(u.uCurlStrength, CURL_STRENGTH);
      gl.uniform1f(u.uDt, dt);
      blit(v.write);
      v.swap();

      u = run(P.divergence, v.read.texel);
      gl.uniform1i(u.uVelocity, bind(v.read.tex, 0));
      blit(divergence);

      u = run(P.clear, pressure.read.texel);
      gl.uniform1i(u.uTexture, bind(pressure.read.tex, 0));
      gl.uniform1f(u.uValue, 0.8);
      blit(pressure.write);
      pressure.swap();

      u = run(P.pressure, v.read.texel);
      gl.uniform1i(u.uDivergence, bind(divergence.tex, 0));
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        gl.uniform1i(u.uPressure, bind(pressure.read.tex, 1));
        blit(pressure.write);
        pressure.swap();
      }

      u = run(P.gradient, v.read.texel);
      gl.uniform1i(u.uPressure, bind(pressure.read.tex, 0));
      gl.uniform1i(u.uVelocity, bind(v.read.tex, 1));
      blit(v.write);
      v.swap();

      u = run(P.advect, v.read.texel);
      gl.uniform2f(u.uTexel, v.read.texel[0], v.read.texel[1]);
      gl.uniform1i(u.uVelocity, bind(v.read.tex, 0));
      gl.uniform1i(u.uSource, bind(v.read.tex, 0));
      gl.uniform1f(u.uDt, dt);
      gl.uniform1f(u.uDissipation, VELOCITY_DISSIPATION);
      blit(v.write);
      v.swap();

      u = run(P.advect, dye.read.texel);
      gl.uniform2f(u.uTexel, v.read.texel[0], v.read.texel[1]);
      gl.uniform1i(u.uVelocity, bind(v.read.tex, 0));
      gl.uniform1i(u.uSource, bind(dye.read.tex, 1));
      gl.uniform1f(u.uDt, dt);
      gl.uniform1f(u.uDissipation, DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();

      u = run(P.display, dye.read.texel);
      gl.uniform1i(u.uDye, bind(dye.read.tex, 0));
      blit(null);
    };

    const frame = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 1 / 30);
      prev = now;
      step(dt);
      /* sleep once the last stroke has had time to dissipate */
      if (now - lastInput > 5000) {
        awake = false;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT);
        /* the dye buffers carry a faint residue: drop it so the next stroke starts clean */
        for (const pair of [dye, velocity, pressure]) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, pair.read.fb);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.bindFramebuffer(gl.FRAMEBUFFER, pair.write.fb);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (awake || document.hidden) return;
      awake = true;
      prev = performance.now();
      raf = requestAnimationFrame(frame);
    };

    let resizeT = 0;
    const onResize = () => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        awake = false;
        alloc();
      }, 250);
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        awake = false;
      }
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeT);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      /* release rather than lose the context: a remount (StrictMode, HMR) gets the same
         context back from the canvas, and a lost one composites as an opaque sheet */
      for (const t of [velocity.read, velocity.write, dye.read, dye.write, pressure.read, pressure.write, divergence, curl]) {
        gl.deleteFramebuffer(t.fb);
        gl.deleteTexture(t.tex);
      }
      for (const prog of Object.values(P)) gl.deleteProgram(prog.p);
      gl.deleteBuffer(quad);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };
  }, [reduced]);

  if (reduced) return null;

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[58] h-full w-full [mix-blend-mode:screen] motion-reduce:hidden" />;
}
