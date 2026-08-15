"use client";

import { Suspense, useEffect, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { HeroState } from "./HeroObject";
import { PaymentScreen } from "@/components/visuals/screens/PaymentScreen";
import { AnalyticsScreen } from "@/components/visuals/screens/AnalyticsScreen";
import { SaasScreen } from "@/components/visuals/screens/SaasScreen";
import { ExamScreen } from "@/components/visuals/screens/ExamScreen";
import { GrillBotScreen } from "@/components/visuals/screens/GrillBotScreen";

const PX = { w: 1200, h: 750 };
const PANE_W = 4.6;
const PANE_H = PANE_W * (PX.h / PX.w);

const PANES = [
  { id: "payments", label: "Payment Orchestrator", tag: "Payments · Redis · Postgres", Comp: PaymentScreen },
  { id: "analytics", label: "Event-Driven Analytics", tag: "CQRS · RabbitMQ", Comp: AnalyticsScreen },
  { id: "exam", label: "Exam Seating Management", tag: "MERN · React Native", Comp: ExamScreen },
  { id: "saas", label: "Multi-Tenant SaaS", tag: "RBAC · tenant isolation", Comp: SaasScreen },
  { id: "grillbot", label: "GrillBot", tag: "AI interviews · Gemini", Comp: GrillBotScreen },
];

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

/** One screen in the stack. Slot 0 = front. */
function Pane({ index, slot, total, stateRef, onSelect }: { index: number; slot: number; total: number; stateRef: MutableRefObject<HeroState>; onSelect: () => void }) {
  const p = PANES[index];
  const group = useRef<THREE.Group>(null);
  const dom = useRef<HTMLDivElement>(null);
  const frame = useRef<THREE.MeshBasicMaterial>(null);
  const [hover, setHover] = useState(false);
  useFrame((state, dt) => {
    const s = stateRef.current;
    const t = state.clock.elapsedTime;
    // structured perspective stack: each slot steps back-up-right
    const tx = slot * 0.42 + (hover && slot > 0 ? 0.08 : 0);
    const ty = slot * 0.34 + Math.sin(t * 0.6 + index) * 0.02;
    const tz = -slot * 1.05 - s.spread * 4;
    const sc = 1 - slot * 0.06;
    if (group.current) {
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, tx, 5, dt);
      group.current.position.y = THREE.MathUtils.damp(group.current.position.y, ty, 5, dt);
      group.current.position.z = THREE.MathUtils.damp(group.current.position.z, tz, 5, dt);
      const cs = THREE.MathUtils.damp(group.current.scale.x || 0.001, sc, 5, dt);
      group.current.scale.setScalar(cs);
    }
    const alpha = (slot === 0 ? 1 : Math.max(0.25, 0.75 - slot * 0.15)) * s.opacity * (1 - s.spread * 0.9);
    if (dom.current) {
      const cur = Number(dom.current.style.opacity || 1);
      dom.current.style.opacity = String(THREE.MathUtils.damp(cur, alpha, 8, dt));
      dom.current.style.filter = slot === 0 ? "none" : `blur(${Math.min(2, slot * 0.6).toFixed(2)}px)`;
    }
    if (frame.current) frame.current.opacity = THREE.MathUtils.damp(frame.current.opacity, (slot === 0 ? 0.55 : 0.2) * alpha, 8, dt);
  });
  return (
    <group ref={group} position={[slot * 0.42, slot * 0.34, -slot * 1.05]}>
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[PANE_W + 0.1, PANE_H + 0.1]} />
        <meshBasicMaterial ref={frame} color="#e9a23b" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.015]} onClick={(e) => { e.stopPropagation(); onSelect(); }} onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = slot ? "pointer" : ""; }} onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}>
        <planeGeometry args={[PANE_W + 0.02, PANE_H + 0.02]} />
        <meshBasicMaterial color="#0a0a0d" />
      </mesh>
      <Html transform position={[0, 0, 0]} distanceFactor={(PANE_W / PX.w) * 400} style={{ width: PX.w, height: PX.h, pointerEvents: "none" }} zIndexRange={[total - slot + 2, 0]}>
        <div ref={dom} style={{ width: PX.w, height: PX.h, overflow: "hidden", borderRadius: 16, boxShadow: "0 60px 120px -40px rgba(0,0,0,0.9)" }}>
          <p.Comp />
        </div>
      </Html>
      {slot === 0 && (
        <Html position={[-PANE_W / 2, PANE_H / 2 + 0.24, 0]} zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
          <div key={p.id} style={{ whiteSpace: "nowrap", display: "flex", gap: 10, alignItems: "center", padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(241,239,233,0.16)", background: "rgba(10,10,12,0.75)", backdropFilter: "blur(10px)", animation: "fade-in 500ms var(--ease-out-expo)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", color: "#e9a23b" }}>0{index + 1}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: 500, color: "#f1efe9" }}>{p.label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: "#8a8983", textTransform: "uppercase" }}>{p.tag}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function Rig({ children, stateRef }: { children: React.ReactNode; stateRef: MutableRefObject<HeroState> }) {
  const group = useRef<THREE.Group>(null);
  const { pointer, viewport, size } = useThree();
  useFrame((_, dt) => {
    if (!group.current) return;
    const s = stateRef.current;
    const desktop = size.width >= 900;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.42 + pointer.x * 0.08, 4, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0.06 - pointer.y * 0.06, 4, dt);
    const sc = desktop ? Math.min(1.1, viewport.width / 12.5) : Math.min(0.9, viewport.width / 6.2);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x || 0.001, sc, 4, dt));
    group.current.position.x = desktop ? viewport.width * 0.2 : 0.3;
    group.current.position.y = (desktop ? -0.35 : -viewport.height * 0.24) + s.spread * 0.8;
  });
  return <group ref={group}>{children}</group>;
}

function Scene({ stateRef }: { stateRef: MutableRefObject<HeroState> }) {
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = PANES.length;
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setFront((f) => (f + 1) % n), 5200);
    return () => window.clearInterval(id);
  }, [paused, n]);
  return (
    <>
      <AutoSize />
      <group onPointerOver={() => setPaused(true)} onPointerOut={() => setPaused(false)}>
        <Rig stateRef={stateRef}>
          {PANES.map((_, i) => (
            <Pane key={i} index={i} slot={(i - front + n) % n} total={n} stateRef={stateRef} onSelect={() => setFront(i)} />
          ))}
        </Rig>
      </group>
      <Sparkles count={90} scale={[14, 7, 8]} position={[2, 0, -3]} size={2} speed={0.2} opacity={0.35} color="#e9a23b" />
    </>
  );
}

export default function GalleryScene({ stateRef, active }: { stateRef: MutableRefObject<HeroState>; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 9], fov: 34, near: 0.1, far: 80 }}
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
        <Scene stateRef={stateRef} />
      </Suspense>
    </Canvas>
  );
}
