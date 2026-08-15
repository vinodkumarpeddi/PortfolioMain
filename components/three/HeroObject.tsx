"use client";

import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type HeroState = { spread: number; opacity: number };

const COUNT_DESKTOP = 9000;
const COUNT_MOBILE = 4500;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uScatter;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uMouseForce;
  attribute vec3 aKnot;
  attribute vec3 aSphere;
  attribute float aRand;
  varying float vAlpha;
  varying float vRand;

  void main() {
    vec3 p = mix(aKnot, aSphere, uMorph);
    float breathe = sin(uTime * 0.9 + aRand * 6.2831) * 0.035;
    p += normalize(p + 0.0001) * breathe;
    p += normalize(p + 0.0001) * uScatter * (0.5 + aRand * 2.2);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec2 d = mv.xy - uMouse;
    float dist = length(d);
    float force = smoothstep(1.6, 0.0, dist) * uMouseForce;
    mv.xy += normalize(d + 0.0001) * force;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aRand * 0.9) * (7.0 / -mv.z);
    vAlpha = 0.2 + 0.8 * aRand * aRand;
    vRand = aRand;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  varying float vRand;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d);
    vec3 amber = vec3(0.914, 0.635, 0.231);
    vec3 warm = vec3(1.0, 0.93, 0.80);
    vec3 col = mix(amber, warm, smoothstep(0.8, 1.0, vRand));
    gl_FragColor = vec4(col * (0.75 + vRand * 0.45), a * vAlpha * uOpacity);
  }
`;

function ParticleSculpture({ stateRef, ambient, geometry, halo }: { stateRef: MutableRefObject<HeroState>; ambient: boolean; geometry: THREE.BufferGeometry; halo?: boolean }) {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { pointer, viewport, gl } = useThree();


  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uScatter: { value: 0 },
      uSize: { value: (ambient ? 2.6 : 3.1) * (halo ? 2.8 : 1) },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uMouseForce: { value: 0 },
      uOpacity: { value: halo ? 0.05 : 0.6 },
    }),
    [ambient, halo],
  );

  useFrame((state, dt) => {
    const s = stateRef.current;
    const u = mat.current?.uniforms as typeof uniforms | undefined;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uMorph.value = THREE.MathUtils.damp(u.uMorph.value, Math.min(1, s.spread * 1.6), 4, dt);
    u.uScatter.value = THREE.MathUtils.damp(u.uScatter.value, Math.max(0, s.spread - 0.45) * 2.4, 4, dt);
    u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, s.opacity * (halo ? 0.05 : 0.6), 5, dt);
    // pointer in view space (approximation at the sculpture's depth)
    const target = new THREE.Vector2((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2);
    u.uMouse.value.lerp(target, 1 - Math.exp(-6 * dt));
    u.uMouseForce.value = THREE.MathUtils.damp(u.uMouseForce.value, ambient ? 0.25 : 0.55, 3, dt);
    if (points.current) {
      points.current.rotation.y += dt * (ambient ? 0.08 : 0.14);
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.28 + s.spread * 0.6;
    }
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/** R3F's own measurement can miss the first layout (e.g. inside iframes); keep the drawing buffer in sync with the container. */
function AutoSize() {
  const gl = useThree((st) => st.gl);
  const setSize = useThree((st) => st.setSize);
  useEffect(() => {
    const el = gl.domElement.parentElement;
    if (!el) return;
    let w = 0;
    let h = 0;
    const apply = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (Math.round(r.width) !== w || Math.round(r.height) !== h)) {
        w = Math.round(r.width);
        h = Math.round(r.height);
        setSize(r.width, r.height);
      }
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    const t = window.setTimeout(apply, 400);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [gl, setSize]);
  return null;
}

function Rig({ children, ambient }: { children: React.ReactNode; ambient: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer, viewport, size } = useThree();
  useFrame((_, dt) => {
    if (!group.current) return;
    const desktop = size.width >= 900;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.25, 4, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * 0.18, 4, dt);
    const s = ambient ? Math.min(1.1, viewport.width / 7) : desktop ? Math.min(1.35, viewport.width / 6) : Math.min(0.9, viewport.width / 3.1);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 4, dt));
    group.current.position.x = ambient ? 0.2 : desktop ? 0.2 : 0.15;
    group.current.position.y = ambient ? 0 : desktop ? -0.1 : -viewport.height * 0.22;
  });
  return <group ref={group}>{children}</group>;
}

function useSculptureGeometry(count: number) {
  return useMemo(() => {
    const knotGeo = new THREE.TorusKnotGeometry(1.05, 0.36, 420, 72, 2, 3);
    const src = knotGeo.getAttribute("position") as THREE.BufferAttribute;
    const total = src.count;
    const knot = new Float32Array(count * 3);
    const sphere = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    let seed = 1337;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const j = Math.floor(rnd() * total);
      knot[i * 3] = src.getX(j);
      knot[i * 3 + 1] = src.getY(j);
      knot[i * 3 + 2] = src.getZ(j);
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const R = 1.55 + rnd() * 0.08;
      sphere[i * 3] = Math.cos(th) * r * R;
      sphere[i * 3 + 1] = y * R;
      sphere[i * 3 + 2] = Math.sin(th) * r * R;
      rand[i] = rnd();
    }
    knotGeo.dispose();
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(knot, 3));
    g.setAttribute("aKnot", new THREE.BufferAttribute(knot, 3));
    g.setAttribute("aSphere", new THREE.BufferAttribute(sphere, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    return g;
  }, [count]);
}

function Scene({ stateRef, ambient }: { stateRef: MutableRefObject<HeroState>; ambient: boolean }) {
  const { size } = useThree();
  const geometry = useSculptureGeometry(size.width >= 900 ? COUNT_DESKTOP : COUNT_MOBILE);
  return (
    <>
      <AutoSize />
      <Rig ambient={ambient}>
        <ParticleSculpture stateRef={stateRef} ambient={ambient} geometry={geometry} halo />
        <ParticleSculpture stateRef={stateRef} ambient={ambient} geometry={geometry} />
      </Rig>
    </>
  );
}

export default function HeroObject({ stateRef, active, ambient = false }: { stateRef: MutableRefObject<HeroState>; active: boolean; ambient?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8.5], fov: 34, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.setClearColor(new THREE.Color("#000000"), 0);
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <Scene stateRef={stateRef} ambient={ambient} />
      </Suspense>
    </Canvas>
  );
}
