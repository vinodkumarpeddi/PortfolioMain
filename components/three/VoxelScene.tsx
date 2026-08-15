"use client";

import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { HeroState } from "./HeroObject";

const N = 34; // grid size
const CELL = 0.32;
const GAP = 0.06;
const COUNT = N * N;

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

/* cheap 2D value noise */
function hash2(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function noise2(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

const dummy = new THREE.Object3D();
const color = new THREE.Color();
const dark = new THREE.Color("#15151a");
const amber = new THREE.Color("#e9a23b");
const warm = new THREE.Color("#ffd18a");

function City({ stateRef }: { stateRef: MutableRefObject<HeroState> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { pointer, camera } = useThree();
  const cells = useMemo(() => {
    const arr: { x: number; z: number; base: number; seed: number; sx: number; sz: number; ry: number }[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = (i - (N - 1) / 2) * (CELL + GAP);
        const z = (j - (N - 1) / 2) * (CELL + GAP);
        const d = Math.hypot(i - (N - 1) / 2, j - (N - 1) / 2) / (N / 2);
        const n = noise2(i * 0.18 + 3, j * 0.18 + 7);
        const base = Math.max(0.08, (0.35 + n * 2.6) * (1 - d * d * 0.85));
        arr.push({ x, z, base, seed: hash2(i, j), sx: (hash2(i + 9, j) - 0.5) * 12, sz: (hash2(i, j + 9) - 0.5) * 12, ry: (hash2(i + 3, j + 5) - 0.5) * 6 });
      }
    }
    return arr;
  }, []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const hit = useMemo(() => new THREE.Vector3(99, 0, 99), []);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const s = stateRef.current;
    const spread = s.spread;
    // pointer → point on the city plane (in local space)
    ray.setFromCamera(pointer, camera);
    const p = new THREE.Vector3();
    if (ray.ray.intersectPlane(plane, p) && groupRef.current) {
      groupRef.current.worldToLocal(p);
      hit.lerp(p, 1 - Math.exp(-6 * dt));
    }
    for (let k = 0; k < COUNT; k++) {
      const c = cells[k];
      const wave = Math.sin(t * 0.9 + c.x * 0.9) * 0.18 + Math.cos(t * 0.7 + c.z * 1.1) * 0.14;
      const dm = Math.hypot(c.x - hit.x, c.z - hit.z);
      const lift = Math.max(0, 1 - dm / 2.2);
      const h = Math.max(0.05, c.base + wave + lift * lift * 1.6);
      const ex = spread * c.sx;
      const ez = spread * c.sz;
      const ey = spread * (c.seed * 5 + 1);
      dummy.position.set(c.x + ex, h / 2 + ey, c.z + ez);
      dummy.rotation.set(spread * c.ry, spread * c.ry * 0.7, 0);
      dummy.scale.set(CELL, h, CELL);
      dummy.updateMatrix();
      m.setMatrixAt(k, dummy.matrix);
      const heat = THREE.MathUtils.clamp((h - 0.6) / 2.4, 0, 1) + lift * 0.8;
      color.copy(dark).lerp(amber, THREE.MathUtils.clamp(heat, 0, 1) * 0.85);
      if (heat > 0.9) color.lerp(warm, (heat - 0.9) * 2);
      m.setColorAt(k, color);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.55} />
      </instancedMesh>
      {/* base plate */}
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[N * (CELL + GAP) + 1.5, N * (CELL + GAP) + 1.5]} />
        <meshStandardMaterial color="#0c0c10" roughness={0.9} metalness={0.2} />
      </mesh>
    </group>
  );
}

function Rig({ children, stateRef }: { children: React.ReactNode; stateRef: MutableRefObject<HeroState> }) {
  const group = useRef<THREE.Group>(null);
  const { pointer, viewport, size } = useThree();
  useFrame((state, dt) => {
    if (!group.current) return;
    const s = stateRef.current;
    const desktop = size.width >= 900;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.75 + t * 0.03 + pointer.x * 0.08, 3, dt);
    const sc = desktop ? Math.min(1, viewport.width / 12) : Math.min(0.75, viewport.width / 6);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x || 0.001, sc, 4, dt));
    group.current.position.x = desktop ? viewport.width * 0.17 : 0.2;
    group.current.position.y = (desktop ? -1.7 : -viewport.height * 0.34) - s.spread * 1.5;
  });
  return <group ref={group}>{children}</group>;
}

function Scene({ stateRef }: { stateRef: MutableRefObject<HeroState> }) {
  return (
    <>
      <AutoSize />
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 10, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 4, 4]} intensity={4} color="#e9a23b" distance={20} decay={2} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 6, -3]} rotation={[-Math.PI / 2.2, 0, 0]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#e9a23b" position={[-6, 2, 2]} rotation={[0, Math.PI / 2, 0]} scale={[4, 6, 1]} />
      </Environment>
      <Rig stateRef={stateRef}>
        <City stateRef={stateRef} />
      </Rig>
      <Sparkles count={120} scale={[16, 6, 12]} position={[2, 1, -2]} size={2} speed={0.2} opacity={0.35} color="#e9a23b" />
      <fog attach="fog" args={["#0a0a0c", 12, 30]} />
    </>
  );
}

export default function VoxelScene({ stateRef, active }: { stateRef: MutableRefObject<HeroState>; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows
      camera={{ position: [0, 5.5, 12], fov: 30, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.setClearColor(new THREE.Color("#000000"), 0);
        camera.lookAt(0, 0.5, 0);
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <Scene stateRef={stateRef} />
      </Suspense>
    </Canvas>
  );
}
