"use client";

import { Suspense, useEffect, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Html, Lightformer, PresentationControls, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { HeroState } from "./HeroObject";
import { PaymentScreen } from "@/components/visuals/screens/PaymentScreen";
import { AnalyticsScreen } from "@/components/visuals/screens/AnalyticsScreen";
import { SaasScreen } from "@/components/visuals/screens/SaasScreen";

const W = 3.4;
const D = 2.3;
const LID_H = 2.2;
const SCREEN_PX = { w: 1200, h: 750 };
const SCREENS = [
  { id: "payments", label: "Payment Orchestrator", Comp: PaymentScreen },
  { id: "analytics", label: "Event-Driven Analytics", Comp: AnalyticsScreen },
  { id: "saas", label: "Multi-Tenant SaaS", Comp: SaasScreen },
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

function Keys() {
  const rows = 5;
  const cols = 14;
  const keys: [number, number, number][] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) keys.push([(c - (cols - 1) / 2) * 0.205, 0.075, (r - (rows - 1) / 2) * 0.2 - 0.25]);
  return (
    <group>
      {/* keyboard deck inset */}
      <mesh position={[0, 0.071, -0.25]}>
        <boxGeometry args={[3.0, 0.004, 1.08]} />
        <meshStandardMaterial color="#111114" roughness={0.7} metalness={0.3} />
      </mesh>
      {keys.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.17, 0.02, 0.16]} />
          <meshStandardMaterial color="#17171b" roughness={0.55} metalness={0.25} emissive="#e9a23b" emissiveIntensity={0.03} />
        </mesh>
      ))}
      <mesh position={[0, 0.072, 0.72]}>
        <boxGeometry args={[1.1, 0.005, 0.62]} />
        <meshStandardMaterial color="#1c1c21" roughness={0.3} metalness={0.55} />
      </mesh>
    </group>
  );
}

function Screen({ index }: { index: number }) {
  return (
    <div style={{ width: SCREEN_PX.w, height: SCREEN_PX.h, overflow: "hidden", borderRadius: 8, position: "relative", background: "#0a0a0d" }}>
      {SCREENS.map((s, i) => (
        <div key={s.id} style={{ position: "absolute", inset: 0, opacity: i === index ? 1 : 0, transition: "opacity 700ms cubic-bezier(.16,1,.3,1)", transform: i === index ? "scale(1)" : "scale(0.985)", transitionProperty: "opacity, transform" }}>
          <s.Comp />
        </div>
      ))}
      {/* indicator */}
      <div style={{ position: "absolute", right: 18, top: 60, display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", color: "#a4a29b" }}>
        {SCREENS.map((s, i) => (
          <span key={s.id} style={{ width: i === index ? 22 : 8, height: 4, borderRadius: 999, background: i === index ? "#e9a23b" : "rgba(241,239,233,0.25)", transition: "all 500ms cubic-bezier(.16,1,.3,1)" }} />
        ))}
      </div>
    </div>
  );
}

function Laptop({ stateRef }: { stateRef: MutableRefObject<HeroState> }) {
  const lid = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);
  const screenLight = useRef<THREE.PointLight>(null);
  const { pointer, viewport, size } = useThree();
  const [screen, setScreen] = useState(0);
  const [hovered, setHovered] = useState(false);
  const born = useRef<number | null>(null);

  useEffect(() => {
    if (hovered) return;
    const id = window.setInterval(() => setScreen((s) => (s + 1) % SCREENS.length), 6500);
    return () => window.clearInterval(id);
  }, [hovered]);

  useFrame((state, dt) => {
    const s = stateRef.current;
    if (born.current === null) born.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - born.current;
    const entrance = age > 0.5 ? 1 : 0; // lid opens shortly after mount
    const openDeg = THREE.MathUtils.lerp(6, THREE.MathUtils.lerp(102, 8, s.spread), entrance);
    if (lid.current) lid.current.rotation.x = THREE.MathUtils.damp(lid.current.rotation.x, -THREE.MathUtils.degToRad(openDeg), 3.2, dt);
    if (root.current) {
      const desktop = size.width >= 900;
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, pointer.x * 0.12, 4, dt);
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, 0.28 - pointer.y * 0.1, 4, dt);
      const sc = desktop ? Math.min(1.35, viewport.width / 5.4) : Math.min(1, viewport.width / 3.6);
      root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, sc * (1 - s.spread * 0.15), 4, dt));
      root.current.position.x = desktop ? 0.1 : 0.05;
      root.current.position.y = (desktop ? -0.55 : -viewport.height * 0.26) + s.spread * 0.6;
    }
    if (screenLight.current) screenLight.current.intensity = THREE.MathUtils.damp(screenLight.current.intensity, 2.2 * (1 - s.spread) * entrance, 4, dt);
  });

  return (
    <group ref={root}>
      <PresentationControls
        global={false}
        cursor
        snap
        speed={1.4}
        zoom={1}
        rotation={[0, -0.32, 0]}
        polar={[-0.15, 0.25]}
        azimuth={[-0.8, 0.8]}
        damping={0.25}
      >
        <Float speed={1} rotationIntensity={0.06} floatIntensity={0.25}>
          {/* base */}
          <RoundedBox args={[W, 0.14, D]} radius={0.05} smoothness={4}>
            <meshStandardMaterial color="#1b1b20" roughness={0.32} metalness={0.85} />
          </RoundedBox>
          <Keys />
          {/* light from the screen onto the deck */}
          <pointLight ref={screenLight} position={[0, 0.9, 0.2]} color="#e9a23b" intensity={0} distance={3.2} decay={2} />
          {/* lid, hinged at the back edge */}
          <group position={[0, 0.07, -D / 2]}>
            <group ref={lid} rotation={[-0.1, 0, 0]}>
              <group position={[0, LID_H / 2, 0]}>
                <RoundedBox args={[W, LID_H, 0.09]} radius={0.05} smoothness={4}>
                  <meshStandardMaterial color="#1b1b20" roughness={0.28} metalness={0.9} />
                </RoundedBox>
                <mesh position={[0, 0, 0.047]}>
                  <planeGeometry args={[W - 0.16, LID_H - 0.16]} />
                  <meshBasicMaterial color="#050506" />
                </mesh>
                <mesh
                  position={[0, 0, 0.049]}
                  onClick={(e) => { e.stopPropagation(); setScreen((s) => (s + 1) % SCREENS.length); }}
                  onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                  onPointerOut={() => setHovered(false)}
                >
                  <planeGeometry args={[W - 0.24, LID_H - 0.24]} />
                  <meshBasicMaterial color="#e9a23b" transparent opacity={0.06} toneMapped={false} />
                </mesh>
                <Html transform position={[0, 0, 0.052]} distanceFactor={((W - 0.24) / SCREEN_PX.w) * 400} style={{ width: SCREEN_PX.w, height: SCREEN_PX.h, pointerEvents: "none" }} zIndexRange={[5, 0]}>
                  <Screen index={screen} />
                </Html>
                {/* glare */}
                <mesh position={[0, 0.3, 0.06]}>
                  <planeGeometry args={[W - 0.24, LID_H - 0.24]} />
                  <meshBasicMaterial transparent opacity={0.05} color="#ffffff" depthWrite={false} blending={THREE.AdditiveBlending} />
                </mesh>
                <mesh position={[0, 0.2, -0.05]} rotation={[0, Math.PI, 0]}>
                  <circleGeometry args={[0.09, 24]} />
                  <meshBasicMaterial color="#e9a23b" toneMapped={false} />
                </mesh>
              </group>
            </group>
          </group>
        </Float>
      </PresentationControls>
      <ContactShadows position={[0, -0.12, 0]} opacity={0.55} scale={9} blur={2.6} far={3} color="#000000" />
    </group>
  );
}

function Scene({ stateRef }: { stateRef: MutableRefObject<HeroState> }) {
  return (
    <>
      <AutoSize />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} />
      <pointLight position={[-3, 2, 3]} intensity={2.5} color="#e9a23b" distance={10} decay={2} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[0, 5, -2]} rotation={[-Math.PI / 2.2, 0, 0]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#e9a23b" position={[-6, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[4, 5, 1]} />
        <Lightformer form="rect" intensity={1} color="#c9d0ff" position={[6, 0, -1]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 4, 1]} />
      </Environment>
      <Laptop stateRef={stateRef} />
      <Sparkles count={70} scale={[9, 5, 5]} size={2} speed={0.2} opacity={0.35} color="#e9a23b" />
    </>
  );
}

export default function LaptopScene({ stateRef, active }: { stateRef: MutableRefObject<HeroState>; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.2, 8.5], fov: 32, near: 0.1, far: 60 }}
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
