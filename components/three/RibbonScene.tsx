"use client";

import { Suspense, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import type { HeroState } from "./HeroObject";

/**
 * Silk: three wide ribbons of warm light drifting across the section. Each is a flat strip
 * whose centreline, twist and width are evaluated in the vertex shader, so the whole thing is
 * three draw calls of a few thousand triangles. Scroll velocity (stateRef.energy) drives the
 * amplitude and twist speed — the silk whips when the reader moves fast and settles when
 * they stop — and the pointer pushes it aside.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uIndex;
  uniform float uWidth;
  uniform float uBaseY;
  uniform vec2 uMouse;
  uniform float uMouseForce;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;

  vec3 centre(float u, float t) {
    float x = mix(-11.0, 11.0, u);
    float e = 1.0 + uEnergy * 2.2;
    float y = uBaseY
      + sin(u * 6.2831 * 0.9 + t * 0.35 + uIndex * 2.1) * 1.1 * e
      + sin(u * 6.2831 * 2.3 - t * 0.7 + uIndex * 1.3) * 0.32 * e
      + sin(u * 6.2831 * 4.1 + t * 1.1) * 0.08 * (1.0 + uEnergy * 6.0);
    float z = sin(u * 6.2831 * 0.7 + t * 0.28 + uIndex) * 1.6
      + cos(u * 6.2831 * 1.7 - t * 0.5 + uIndex * 0.7) * 0.5;
    return vec3(x, y, z);
  }

  void main() {
    float u = uv.x;
    float v = uv.y - 0.5;
    float t = uTime;
    vec3 c = centre(u, t);
    vec3 c2 = centre(u + 0.002, t);
    vec3 T = normalize(c2 - c);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 B = normalize(cross(T, up));
    vec3 N = normalize(cross(B, T));
    float twist = u * 6.2831 * 1.6 + t * (0.45 + uEnergy * 1.4) + uIndex * 1.7;
    vec3 dir = B * cos(twist) + N * sin(twist);
    /* the strip narrows toward its ends and breathes a little along its length */
    float w = uWidth * (0.75 + 0.25 * sin(u * 6.2831 * 1.3 + t * 0.4)) * smoothstep(0.0, 0.12, u) * smoothstep(1.0, 0.88, u);
    vec3 pos = c + dir * v * w;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vec2 d = mv.xy - uMouse;
    float dist = length(d);
    float force = smoothstep(2.4, 0.0, dist) * uMouseForce;
    mv.xy += normalize(d + 0.0001) * force * 0.9;

    vec3 n = normalize(cross(T, dir));
    vNormal = normalize(normalMatrix * n);
    vView = -mv.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform float uIndex;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 V = normalize(vView);
    if (dot(n, V) < 0.0) n = -n;
    vec3 L1 = normalize(vec3(-0.5, 0.8, 0.6));
    vec3 L2 = normalize(vec3(0.7, -0.3, 0.5));
    float lit = pow(max(dot(n, L1), 0.0), 1.4) * 0.9 + pow(max(dot(n, L2), 0.0), 2.0) * 0.5;
    float rim = pow(1.0 - max(dot(n, V), 0.0), 3.0);
    vec3 deep = vec3(0.52, 0.30, 0.10);
    vec3 amber = vec3(0.914, 0.635, 0.231);
    vec3 warm = vec3(1.0, 0.87, 0.64);
    vec3 col = mix(deep, amber, lit);
    col = mix(col, warm, rim * 0.9);
    col += warm * pow(max(dot(reflect(-L1, n), V), 0.0), 28.0) * 0.7;
    col *= 1.1;
    /* soft edges across the strip, a touch of weave along it */
    float edge = smoothstep(0.0, 0.14, vUv.y) * smoothstep(1.0, 0.86, vUv.y);
    float weave = 0.92 + 0.08 * sin(vUv.x * 420.0 + uIndex);
    gl_FragColor = vec4(col * weave, (0.5 + lit * 0.3 + rim * 0.3) * edge * uOpacity);
  }
`;

function Ribbon({ stateRef, index, width, baseY }: { stateRef: MutableRefObject<HeroState>; index: number; width: number; baseY: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { pointer, viewport } = useThree();
  const clock = useRef(0);
  const mouse = useMemo(() => new THREE.Vector2(99, 99), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: index * 3.1 },
      uEnergy: { value: 0 },
      uIndex: { value: index },
      uWidth: { value: width },
      uBaseY: { value: baseY },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uMouseForce: { value: 0 },
      uOpacity: { value: 0 },
    }),
    [index, width, baseY],
  );
  useFrame((_, dtRaw) => {
    const u = mat.current?.uniforms as typeof uniforms | undefined;
    if (!u) return;
    const dt = Math.min(dtRaw, 0.1);
    const st = stateRef.current;
    const energy = st.energy ?? 0;
    clock.current += dt * (1 + energy * 1.5);
    u.uTime.value = clock.current + index * 3.1;
    u.uEnergy.value = THREE.MathUtils.damp(u.uEnergy.value, energy, 2.5, dt);
    u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, st.opacity, 4, dt);
    mouse.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2);
    u.uMouse.value.lerp(mouse, 1 - Math.exp(-6 * dt));
    u.uMouseForce.value = THREE.MathUtils.damp(u.uMouseForce.value, 0.5, 3, dt);
  });
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[1, 1, 360, 1]} />
      <shaderMaterial ref={mat} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  useFrame((_, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 0.1);
    const wide = viewport.aspect > 1.25;
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, wide ? -0.22 : -0.6, 3, dt);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, wide ? 1 : 0.7, 3, dt));
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
  return (
    <>
      <AutoSize />
      <Rig>
        <Ribbon stateRef={stateRef} index={0} width={1.35} baseY={0.6} />
        <Ribbon stateRef={stateRef} index={1} width={0.9} baseY={-0.9} />
        <Ribbon stateRef={stateRef} index={2} width={0.55} baseY={1.9} />
      </Rig>
    </>
  );
}

export default function RibbonScene({ stateRef, active }: { stateRef: MutableRefObject<HeroState>; active: boolean }) {
  const heavy = typeof window === "undefined" || window.innerWidth >= 1024;
  const [dpr, setDpr] = useState(heavy ? 1.5 : 1.25);
  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 12], fov: 34, near: 0.1, far: 60 }}
      resize={{ scroll: false, debounce: 500 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
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
