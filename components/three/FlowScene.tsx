"use client";

import { Suspense, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import type { HeroState } from "./HeroObject";

/**
 * "How I think" as the behaviour of a flow. Thousands of light streaks run through the scene,
 * and what the flow does changes with the principle on screen: laminar lanes, a re-route
 * around a failure, one stream fanning into many, a vortex that everything passes through,
 * a wall with a single gate, and at last one clean line. Every streak's path is a closed-form
 * function of (seed, time, mode) evaluated in the vertex shader, so the morph is a blend of
 * two paths and the CPU never touches a particle.
 */

const DESKTOP = { strands: 900, tail: 40 };
const MOBILE = { strands: 420, tail: 28 };

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMode;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec2 uMouse;
  uniform float uMouseForce;
  attribute float aSeed;
  attribute float aLane;
  attribute float aT;
  varying float vT;
  varying float vSeed;
  varying float vHot;

  float sstep(float a, float b, float x) { return smoothstep(a, b, x); }

  /* 01 performance: straight lanes, fast, slightly converging */
  vec3 lanes(float p, float lane, float seed) {
    float x = -7.0 + p * 14.0;
    float k = 1.0 - 0.18 * sstep(-3.0, 3.0, x);
    return vec3(x, lane * 2.4 * k, (seed - 0.5) * 3.0 * k);
  }
  /* 02 reliability: the same lanes, bent around a failure in the middle */
  vec3 reroute(float p, float lane, float seed) {
    float x = -7.0 + p * 14.0;
    float y0 = lane * 2.4;
    float z0 = (seed - 0.5) * 3.0;
    float R = 1.9;
    float d2 = x * x + y0 * y0 + z0 * z0 * 0.6;
    float push = R * R / (d2 + 0.35);
    float yy = y0 + sign(y0 + 0.001) * push * 1.1;
    float zz = z0 + z0 * push * 0.6;
    return vec3(x, yy, zz);
  }
  /* 03 scalability: one bundle that opens into many lanes */
  vec3 fan(float p, float lane, float seed) {
    float x = -7.0 + p * 14.0;
    float open = sstep(-2.2, 2.6, x);
    float wob = sin(x * 1.4 + seed * 6.2831) * 0.08 * (1.0 - open);
    return vec3(x, lane * 3.0 * open + wob, (seed - 0.5) * 4.2 * open);
  }
  /* 04 observability: a vortex — every streak orbits the same eye */
  vec3 vortex(float p, float lane, float seed) {
    float r = 0.7 + abs(lane) * 2.6 + seed * 0.4;
    float a = p * 6.2831 * 2.0 + seed * 6.2831;
    float tilt = 0.55;
    vec3 q = vec3(cos(a) * r, sin(a) * r, sin(a * 2.0 + seed * 3.0) * 0.18 * r);
    return vec3(q.x, q.y * cos(tilt) - q.z * sin(tilt), q.y * sin(tilt) + q.z * cos(tilt));
  }
  /* 05 security: lanes meet a wall; they slide along it, except through the one gate */
  vec3 wall(float p, float lane, float seed) {
    float x = -7.0 + p * 14.0;
    float gate = step(0.92, seed) * step(abs(lane), 0.14);
    float y0 = lane * 2.6;
    float z0 = (seed - 0.5) * 3.2;
    float hit = max(0.0, x - 0.2);
    float xb = mix(min(x, 0.2), x, gate);
    float yb = mix(y0 + sign(y0 + 0.001) * hit * 0.9 + sin(hit * 2.0 + seed * 9.0) * 0.1 * hit, y0 * 0.35, gate);
    float zb = mix(z0 + z0 * hit * 0.25, z0 * 0.3, gate);
    return vec3(xb, yb, zb);
  }
  /* 06 simplicity: one line */
  vec3 line(float p, float lane, float seed) {
    float x = -7.0 + p * 14.0;
    return vec3(x, sin(x * 0.45 + 0.6) * 0.55 + lane * 0.05, (seed - 0.5) * 0.12);
  }

  vec3 path(float m, float p, float lane, float seed) {
    if (m < 0.5) return lanes(p, lane, seed);
    if (m < 1.5) return reroute(p, lane, seed);
    if (m < 2.5) return fan(p, lane, seed);
    if (m < 3.5) return vortex(p, lane, seed);
    if (m < 4.5) return wall(p, lane, seed);
    return line(p, lane, seed);
  }

  void main() {
    float m0 = floor(uMode);
    float m1 = min(5.0, m0 + 1.0);
    float f = uMode - m0;
    /* each streak crosses over at its own moment, so the field changes as a wave */
    float s = smoothstep(0.0, 1.0, clamp((f - aSeed * 0.35) / 0.65, 0.0, 1.0));

    float speed0 = (m0 < 0.5 ? 0.34 : (m0 < 3.5 && m0 > 2.5) ? 0.10 : 0.16) * (0.7 + aSeed * 0.6);
    float speed1 = (m1 < 0.5 ? 0.34 : (m1 < 3.5 && m1 > 2.5) ? 0.10 : 0.16) * (0.7 + aSeed * 0.6);
    float speed = mix(speed0, speed1, s);
    float tailLen = mix(0.065, 0.04, step(2.5, uMode) * step(uMode, 3.5)) * (0.8 + aSeed * 0.5);
    float head = fract(uTime * speed + aSeed * 7.31);
    float p = head - aT * tailLen;
    /* the vortex is a closed orbit: its streaks wrap; a lane has a start and an end */
    float mm = mix(m0, m1, s);
    float orbit = step(2.5, mm) * step(mm, 3.5);
    float wrap = mix(step(0.0, p), 1.0, orbit);
    p = fract(p + 1.0);

    vec3 a = path(m0, p, aLane, aSeed);
    vec3 b = path(m1, p, aLane, aSeed);
    vec3 pos = mix(a, b, s);

    /* the ends of a lane fade, so streaks are born and die in the dark rather than popping */
    float edge = mix(sstep(0.0, 0.08, p) * (1.0 - sstep(0.92, 1.0, p)), 1.0, orbit);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vec2 d = mv.xy - uMouse;
    float dist = length(d);
    float force = smoothstep(1.8, 0.0, dist) * uMouseForce;
    mv.xy += normalize(d + 0.0001) * force * 0.6;

    gl_Position = projectionMatrix * mv;
    float taper = pow(1.0 - aT, 0.55);
    gl_PointSize = uSize * uPixelRatio * (0.6 + aSeed * 0.8) * taper * (9.0 / -mv.z);
    vT = aT;
    vSeed = aSeed;
    vHot = edge * wrap * (0.35 + 0.65 * pow(1.0 - aT, 1.4));
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vT;
  varying float vSeed;
  varying float vHot;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.08, d);
    vec3 amber = vec3(0.914, 0.635, 0.231);
    vec3 warm = vec3(1.0, 0.86, 0.62);
    vec3 white = vec3(1.0, 0.97, 0.9);
    vec3 col = mix(amber, warm, vSeed * 0.6);
    col = mix(col, white, pow(1.0 - vT, 6.0) * 0.8);
    gl_FragColor = vec4(col, a * vHot * uOpacity);
  }
`;

function useStreaks(strands: number, tail: number) {
  return useMemo(() => {
    const n = strands * tail;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    const lane = new Float32Array(n);
    const t = new Float32Array(n);
    let state = 97;
    const rnd = () => ((state = (state * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < strands; i++) {
      const sd = rnd();
      /* lanes thicker toward the middle, thinner at the edges */
      const u = rnd() * 2 - 1;
      const ln = Math.sign(u) * Math.pow(Math.abs(u), 1.35);
      for (let k = 0; k < tail; k++) {
        const j = i * tail + k;
        seed[j] = sd;
        lane[j] = ln;
        t[j] = k / (tail - 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aLane", new THREE.BufferAttribute(lane, 1));
    g.setAttribute("aT", new THREE.BufferAttribute(t, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);
    return g;
  }, [strands, tail]);
}

function Streaks({ stateRef, geometry, halo }: { stateRef: MutableRefObject<HeroState>; geometry: THREE.BufferGeometry; halo?: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { pointer, viewport, gl } = useThree();
  const clock = useRef(0);
  const mode = useRef(0);
  const mouse = useMemo(() => new THREE.Vector2(99, 99), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMode: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: halo ? 11.0 : 4.2 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uMouseForce: { value: 0 },
      uOpacity: { value: halo ? 0.08 : 1.0 },
    }),
    [halo],
  );

  useFrame((_, dtRaw) => {
    const u = mat.current?.uniforms as typeof uniforms | undefined;
    if (!u) return;
    const dt = Math.min(dtRaw, 0.1);
    clock.current += dt;
    const st = stateRef.current;
    /* the word for principle i holds for ~70% of its segment; the flow changes over the last 30% */
    const x = Math.min(5.999, Math.max(0, (st.progress ?? 0) * 6));
    const i0 = Math.floor(x);
    const f = x - i0;
    const eased = f < 0.66 ? 0 : Math.min(1, (f - 0.66) / 0.3);
    const target = Math.min(5, i0 + eased * eased * (3 - 2 * eased));
    mode.current = THREE.MathUtils.damp(mode.current, target, 5, dt);
    u.uTime.value = clock.current;
    u.uMode.value = mode.current;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, st.opacity * (halo ? 0.08 : 1.0), 5, dt);
    mouse.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2);
    u.uMouse.value.lerp(mouse, 1 - Math.exp(-6 * dt));
    u.uMouseForce.value = THREE.MathUtils.damp(u.uMouseForce.value, 0.4, 3, dt);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer, viewport } = useThree();
  const clock = useRef(0);
  useFrame((_, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 0.1);
    clock.current += dt;
    const wide = viewport.aspect > 1.25;
    g.position.x = THREE.MathUtils.damp(g.position.x, wide ? 1.6 : 0, 3, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, wide ? 0.2 : 0.6, 3, dt);
    const ry = -0.35 + Math.sin(clock.current * 0.12) * 0.08 + pointer.x * 0.12;
    const rx = 0.18 + Math.cos(clock.current * 0.09) * 0.05 - pointer.y * 0.08;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ry, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rx, 3, dt);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, wide ? 0.78 : 0.4, 3, dt));
  });
  return <group ref={group}>{children}</group>;
}

/** R3F's own measurement can miss the first layout (e.g. inside iframes); keep the drawing buffer in sync with the container. */
function AutoSize() {
  const gl = useThree((st) => st.gl);
  const setSize = useThree((st) => st.setSize);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    const el = gl.domElement.parentElement;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      setSize(r.width, r.height);
      done.current = true;
    }
  });
  return null;
}

function Scene({ stateRef }: { stateRef: MutableRefObject<HeroState> }) {
  const { size } = useThree();
  const preset = size.width >= 1024 ? DESKTOP : MOBILE;
  const geometry = useStreaks(preset.strands, preset.tail);
  return (
    <>
      <AutoSize />
      <Rig>
        <Streaks stateRef={stateRef} geometry={geometry} halo />
        <Streaks stateRef={stateRef} geometry={geometry} />
      </Rig>
    </>
  );
}

export default function FlowScene({ stateRef, active }: { stateRef: MutableRefObject<HeroState>; active: boolean }) {
  const heavy = typeof window === "undefined" || window.innerWidth >= 1024;
  const [dpr, setDpr] = useState(heavy ? 1.5 : 1.25);
  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 11], fov: 32, near: 0.1, far: 60 }}
      resize={{ scroll: false, debounce: 500 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.setClearColor(new THREE.Color("#000000"), 0);
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <PerformanceMonitor
        bounds={(refresh) => [refresh * 0.55, refresh * 0.9]}
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(0.75, Math.round((d - 0.25) * 100) / 100))}
        onIncline={() => setDpr((d) => Math.min(heavy ? 1.5 : 1.25, Math.round((d + 0.25) * 100) / 100))}
        onFallback={() => setDpr(0.75)}
      />
      <Suspense fallback={null}>
        <Scene stateRef={stateRef} />
      </Suspense>
    </Canvas>
  );
}
