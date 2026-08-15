"use client";

import { Suspense, useEffect, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Html, Lightformer, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { HeroState } from "./HeroObject";
import { PaymentScreen } from "@/components/visuals/screens/PaymentScreen";

const W = 3.4;
const D = 2.3;
const LID_H = 2.2;
const SCREEN_PX = { w: 1200, h: 750 };

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
      {keys.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.17, 0.02, 0.16]} />
          <meshStandardMaterial color="#141418" roughness={0.6} metalness={0.2} />
        </mesh>
      ))}
      {/* trackpad */}
      <mesh position={[0, 0.072, 0.72]}>
        <boxGeometry args={[1.1, 0.005, 0.62]} />
        <meshStandardMaterial color="#1c1c21" roughness={0.35} metalness={0.5} />
      </mesh>
    </group>
  );
}

function Laptop({ stateRef }: { stateRef: MutableRefObject<HeroState> }) {
  const lid = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);
  const { pointer, viewport, size } = useThree();
  useFrame((_, dt) => {
    const s = stateRef.current;
    const openAngle = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(102, 8, s.spread));
    if (lid.current) lid.current.rotation.x = THREE.MathUtils.damp(lid.current.rotation.x, -openAngle, 5, dt);
    if (root.current) {
      const desktop = size.width >= 900;
      const targetY = -0.35 + pointer.x * 0.35;
      const targetX = 0.32 - pointer.y * 0.18;
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, targetY, 4, dt);
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, targetX, 4, dt);
      const sc = desktop ? Math.min(1.35, viewport.width / 5.4) : Math.min(1, viewport.width / 3.6);
      root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, sc * (1 - s.spread * 0.15), 4, dt));
      root.current.position.x = desktop ? 0.1 : 0.05;
      root.current.position.y = (desktop ? -0.55 : -viewport.height * 0.26) + s.spread * 0.6;
    }
  });
  return (
    <group ref={root}>
      <Float speed={1} rotationIntensity={0.08} floatIntensity={0.3}>
        {/* base */}
        <RoundedBox args={[W, 0.14, D]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#1a1a1f" roughness={0.35} metalness={0.8} />
        </RoundedBox>
        <Keys />
        {/* lid, hinged at the back edge */}
        <group position={[0, 0.07, -D / 2]}>
          <group ref={lid} rotation={[-1.7, 0, 0]}>
            <group position={[0, LID_H / 2, 0]}>
              <RoundedBox args={[W, LID_H, 0.09]} radius={0.05} smoothness={4}>
                <meshStandardMaterial color="#1a1a1f" roughness={0.3} metalness={0.85} />
              </RoundedBox>
              {/* screen bezel + glow */}
              <mesh position={[0, 0, 0.047]}>
                <planeGeometry args={[W - 0.16, LID_H - 0.16]} />
                <meshBasicMaterial color="#050506" />
              </mesh>
              <mesh position={[0, 0, 0.049]}>
                <planeGeometry args={[W - 0.24, LID_H - 0.24]} />
                <meshBasicMaterial color="#e9a23b" transparent opacity={0.08} toneMapped={false} />
              </mesh>
              <Html
                transform
                position={[0, 0, 0.052]}
                distanceFactor={((W - 0.24) / SCREEN_PX.w) * 400}
                style={{ width: SCREEN_PX.w, height: SCREEN_PX.h, pointerEvents: "none" }}
                zIndexRange={[5, 0]}
              >
                <div style={{ width: SCREEN_PX.w, height: SCREEN_PX.h, overflow: "hidden", borderRadius: 8 }}>
                  <PaymentScreen />
                </div>
              </Html>
              {/* logo dot on the back */}
              <mesh position={[0, 0.2, -0.05]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[0.09, 24]} />
                <meshBasicMaterial color="#e9a23b" toneMapped={false} />
              </mesh>
            </group>
          </group>
        </group>
      </Float>
    </group>
  );
}

function Scene({ stateRef }: { stateRef: MutableRefObject<HeroState> }) {
  return (
    <>
      <AutoSize />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <pointLight position={[-3, 2, 3]} intensity={3} color="#e9a23b" distance={10} decay={2} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[0, 5, -2]} rotation={[-Math.PI / 2.2, 0, 0]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#e9a23b" position={[-6, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[4, 5, 1]} />
        <Lightformer form="rect" intensity={1} color="#c9d0ff" position={[6, 0, -1]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 4, 1]} />
      </Environment>
      <Laptop stateRef={stateRef} />
      <Sparkles count={70} scale={[9, 5, 5]} size={2} speed={0.2} opacity={0.4} color="#e9a23b" />
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
