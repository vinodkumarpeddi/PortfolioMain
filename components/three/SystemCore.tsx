"use client";

import { Suspense, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Html, Lightformer, Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export type CoreState = { explode: number; opacity: number };

const ACCENT = "#e9a23b";
const SLAB_W = 3.3;
const SLAB_D = 2.05;
const SLAB_H = 0.13;

const layers = [
  { id: "infra", label: "Infrastructure", sub: "docker · cloud" },
  { id: "data", label: "Data", sub: "postgres · redis" },
  { id: "async", label: "Queue · Workers", sub: "rabbitmq · bullmq" },
  { id: "api", label: "API · Services", sub: "auth · rbac" },
  { id: "client", label: "Client", sub: "web · mobile" },
];

const tmpColor = new THREE.Color();

function Slab({
  index,
  total,
  stateRef,
  hovered,
  onHover,
  compact,
}: {
  index: number;
  total: number;
  stateRef: MutableRefObject<CoreState>;
  hovered: boolean;
  onHover: (i: number | null) => void;
  compact: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const edge = useRef<THREE.Mesh>(null);
  const layer = layers[index];
  const outline = useMemo(() => {
    const w = SLAB_W / 2 + 0.01;
    const d = SLAB_D / 2 + 0.01;
    return [
      [-w, SLAB_H / 2 + 0.002, -d],
      [w, SLAB_H / 2 + 0.002, -d],
      [w, SLAB_H / 2 + 0.002, d],
      [-w, SLAB_H / 2 + 0.002, d],
      [-w, SLAB_H / 2 + 0.002, -d],
    ] as [number, number, number][];
  }, []);

  useFrame((_, dt) => {
    const s = stateRef.current;
    const gap = THREE.MathUtils.lerp(0.5, 1.35, s.explode);
    const y = (index - (total - 1) / 2) * gap;
    if (group.current) {
      group.current.position.y = THREE.MathUtils.damp(group.current.position.y, y, 6, dt);
      const target = hovered ? 1.03 : 1;
      group.current.scale.x = THREE.MathUtils.damp(group.current.scale.x, target, 8, dt);
      group.current.scale.z = THREE.MathUtils.damp(group.current.scale.z, target, 8, dt);
    }
    if (mat.current) {
      mat.current.opacity = THREE.MathUtils.damp(mat.current.opacity, s.opacity, 6, dt);
      const em = hovered ? 0.22 : 0.015;
      mat.current.emissiveIntensity = THREE.MathUtils.damp(mat.current.emissiveIntensity, em, 8, dt);
    }
  });

  return (
    <group ref={group} onPointerOver={(e) => { e.stopPropagation(); onHover(index); }} onPointerOut={() => onHover(null)}>
      <RoundedBox args={[SLAB_W, SLAB_H, SLAB_D]} radius={0.05} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          ref={mat}
          color="#0c0c10"
          roughness={0.34}
          metalness={0.6}
          clearcoat={0.9}
          clearcoatRoughness={0.3}
          envMapIntensity={0.55}
          emissive={ACCENT}
          emissiveIntensity={0.015}
          transparent
          opacity={1}
        />
      </RoundedBox>
      <Line points={outline} color={hovered ? ACCENT : "#f1efe9"} transparent opacity={hovered ? 0.9 : 0.22} lineWidth={1} />
      <mesh ref={edge} position={[0, SLAB_H / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[SLAB_W - 0.3, SLAB_D - 0.3]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={hovered ? 0.05 : 0.0} depthWrite={false} />
      </mesh>
      {!compact && (
        <Html position={[SLAB_W / 2 + 0.25, 0.05, -SLAB_D / 2 + 0.2]} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              opacity: hovered ? 1 : 0.55,
              transform: `translateY(-50%) translateX(${hovered ? 4 : 0}px)`,
              transition: "opacity 300ms cubic-bezier(.2,0,0,1), transform 300ms cubic-bezier(.2,0,0,1)",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ width: 18, height: 1, background: hovered ? ACCENT : "rgba(241,239,233,.3)" }} />
            <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: 500, color: "#f1efe9", letterSpacing: "-0.01em" }}>{layer.label}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "#8a8983", letterSpacing: "0.1em", textTransform: "uppercase" }}>{layer.sub}</span>
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

function Packets({ stateRef, count = 5 }: { stateRef: MutableRefObject<CoreState>; count?: number }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        t: i / count,
        speed: 0.16 + (i % 3) * 0.04,
        rail: i % 2, // 0: down (requests), 1: up (responses)
        x: i % 2 === 0 ? -SLAB_W / 2 + 0.28 : SLAB_W / 2 - 0.28,
        z: i % 2 === 0 ? SLAB_D / 2 - 0.28 : -SLAB_D / 2 + 0.28,
      })),
    [count],
  );

  useFrame((_, dt) => {
    const s = stateRef.current;
    const gap = THREE.MathUtils.lerp(0.5, 1.35, s.explode);
    const span = (layers.length - 1) * gap;
    seeds.forEach((seed, i) => {
      seed.t = (seed.t + dt * seed.speed) % 1;
      const m = refs.current[i];
      if (!m) return;
      const p = seed.rail === 0 ? 1 - seed.t : seed.t;
      m.position.set(seed.x, -span / 2 + p * span, seed.z);
      const fade = Math.sin(seed.t * Math.PI);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = fade * s.opacity;
      m.scale.setScalar(0.7 + fade * 0.5);
    });
  });

  return (
    <>
      {seeds.map((seed, i) => (
        <mesh key={i} ref={(el) => { if (el) refs.current[i] = el; }} position={[seed.x, 0, seed.z]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.9} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function Rails({ stateRef }: { stateRef: MutableRefObject<CoreState> }) {
  const a = useRef<THREE.Group>(null);
  useFrame(() => {
    const s = stateRef.current;
    const gap = THREE.MathUtils.lerp(0.5, 1.35, s.explode);
    const span = (layers.length - 1) * gap + 0.6;
    if (a.current) a.current.scale.y = span;
  });
  const rail = (x: number, z: number) => (
    <mesh position={[x, 0, z]}>
      <cylinderGeometry args={[0.006, 0.006, 1, 6]} />
      <meshBasicMaterial color="#f1efe9" transparent opacity={0.16} />
    </mesh>
  );
  return (
    <group ref={a}>
      {rail(-SLAB_W / 2 + 0.28, SLAB_D / 2 - 0.28)}
      {rail(SLAB_W / 2 - 0.28, -SLAB_D / 2 + 0.28)}
    </group>
  );
}

function Rig({ children, compact }: { children: React.ReactNode; compact: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer, viewport } = useThree();
  useFrame((state, dt) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const baseY = -0.7 + t * 0.07;
    const targetX = 0.62 + pointer.y * -0.08;
    const targetZ = pointer.x * 0.05;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4, dt);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetZ, 4, dt);
    group.current.rotation.y = baseY + pointer.x * 0.18;
    const s = compact ? Math.min(1, viewport.width / 7.5) * 0.85 : Math.min(1.25, viewport.width / 8.2);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 4, dt));
    group.current.position.x = compact ? 0.4 : -0.5;
    group.current.position.y = compact ? 1.1 : 0.15;
  });
  return <group ref={group}>{children}</group>;
}

function Scene({ stateRef, compact }: { stateRef: MutableRefObject<CoreState>; compact: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 7, 4]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-5, 2, -3]} intensity={0.4} color="#c9d0ff" />
      <pointLight position={[-2.5, 1.5, 3]} intensity={2.5} color={ACCENT} distance={9} decay={2} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={1.1} color="#ffffff" position={[0, 6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#f1efe9" position={[-6, 2, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 1.5, 1]} />
        <Lightformer form="rect" intensity={0.8} color={ACCENT} position={[5, 1, -3]} rotation={[0, -Math.PI / 2.4, 0]} scale={[3, 0.6, 1]} />
        <Lightformer form="ring" intensity={0.6} color="#ffffff" position={[3, 5, 5]} scale={2} />
      </Environment>
      <Rig compact={compact}>
        <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.25}>
          {layers.map((_, i) => (
            <Slab key={i} index={i} total={layers.length} stateRef={stateRef} hovered={hovered === i} onHover={setHovered} compact={compact} />
          ))}
          <Rails stateRef={stateRef} />
          <Packets stateRef={stateRef} />
        </Float>
      </Rig>
    </>
  );
}

export default function SystemCore({ stateRef, active, compact = false, className }: { stateRef: MutableRefObject<CoreState>; active: boolean; compact?: boolean; className?: string }) {
  return (
    <Canvas
      className={className}
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.4, 9.5], fov: 30, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        tmpColor.set("#000000");
        gl.setClearColor(tmpColor, 0);
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <Scene stateRef={stateRef} compact={compact} />
      </Suspense>
    </Canvas>
  );
}
