"use client";

import { Suspense, useMemo, useRef, type ComponentRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshTransmissionMaterial, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";

export type HeroState = { spread: number; opacity: number };
export type GlassShape = "knot" | "torus" | "gem" | "cubes";

const ACCENT = "#e9a23b";

function GlassMaterial({ matRef, ambient }: { matRef: React.RefObject<ComponentRef<typeof MeshTransmissionMaterial> | null>; ambient: boolean }) {
  return (
    <MeshTransmissionMaterial
      ref={matRef}
      transmission={1}
      thickness={0.9}
      roughness={0.05}
      ior={1.4}
      chromaticAberration={0.1}
      anisotropicBlur={0.2}
      distortion={0.2}
      distortionScale={0.3}
      temporalDistortion={0.06}
      iridescence={1}
      iridescenceIOR={1.3}
      iridescenceThicknessRange={[100, 500]}
      clearcoat={1}
      envMapIntensity={1.8}
      attenuationColor="#ffe9c9"
      attenuationDistance={2.4}
      background={new THREE.Color("#141210")}
      color="#ffffff"
      samples={ambient ? 4 : 6}
      resolution={ambient ? 384 : 640}
      backside={false}
      transparent
      toneMapped
    />
  );
}

/** Refractive glass sculpture — one of several forms. */
function GlassForm({ stateRef, ambient, shape }: { stateRef: MutableRefObject<HeroState>; ambient: boolean; shape: GlassShape }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<ComponentRef<typeof MeshTransmissionMaterial>>(null);
  const cubeMats = useRef<ComponentRef<typeof MeshTransmissionMaterial>[]>([]);
  useFrame((state, dt) => {
    const s = stateRef.current;
    const t = state.clock.elapsedTime;
    if (group.current) {
      const target = (ambient ? 0.85 : 1) * (1 - s.spread * 0.4);
      group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x || 0.001, target, 5, dt));
      group.current.rotation.y += dt * (shape === "cubes" ? 0.1 : 0.18 + s.spread * 0.6);
      group.current.rotation.x = Math.sin(t * 0.2) * (shape === "torus" ? 0.6 : 0.35) + s.spread * 1.2 + (shape === "torus" ? 0.9 : 0);
    }
    if (mat.current) mat.current.opacity = THREE.MathUtils.damp(mat.current.opacity ?? 1, s.opacity, 6, dt);
    cubeMats.current.forEach((m) => {
      if (m) m.opacity = THREE.MathUtils.damp(m.opacity ?? 1, s.opacity, 6, dt);
    });
  });
  if (shape === "cubes") {
    const positions: [number, number, number][] = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) positions.push([x * 1.05, y * 1.05, 0]);
    return (
      <group ref={group}>
        {positions.map((p, i) => (
          <Float key={i} speed={1 + (i % 3) * 0.3} rotationIntensity={0.15} floatIntensity={0.4}>
            <RoundedBox args={[0.8, 0.8, 0.8]} radius={0.12} smoothness={4} position={p}>
              <GlassMaterial matRef={{ current: null } as never} ambient={ambient} />
            </RoundedBox>
          </Float>
        ))}
      </group>
    );
  }
  return (
    <group ref={group}>
      <mesh>
        {shape === "knot" && <torusKnotGeometry args={[1.05, 0.34, 260, 48, 2, 3]} />}
        {shape === "torus" && <torusGeometry args={[1.35, 0.46, 64, 200]} />}
        {shape === "gem" && <icosahedronGeometry args={[1.6, 0]} />}
        <GlassMaterial matRef={mat} ambient={ambient} />
      </mesh>
      {shape === "torus" && (
        <mesh position={[1.35, 0, 0]}>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshBasicMaterial color={ACCENT} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

/** Undulating field of luminous points — a quiet "data terrain" behind the sculpture. */
function Terrain({ stateRef }: { stateRef: MutableRefObject<HeroState> }) {
  const cols = 72;
  const rows = 40;
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(cols * rows * 3);
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        pos[i++] = (x / (cols - 1) - 0.5) * 22;
        pos[i++] = 0;
        pos[i++] = (y / (rows - 1) - 0.5) * 12;
      }
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const mat = useRef<THREE.PointsMaterial>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = stateRef.current;
    const attr = geom.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const amp = 0.35 + s.spread * 0.6;
    for (let i = 0; i < cols * rows; i++) {
      const x = arr[i * 3];
      const z = arr[i * 3 + 2];
      arr[i * 3 + 1] = Math.sin(x * 0.55 + t * 0.7) * Math.cos(z * 0.6 + t * 0.5) * amp + Math.sin((x + z) * 0.25 + t * 0.3) * amp * 0.6;
    }
    attr.needsUpdate = true;
    if (mat.current) mat.current.opacity = 0.42 * s.opacity;
  });
  return (
    <points geometry={geom} position={[0, -2.2, -2.5]} rotation={[0.28, 0, 0]}>
      <pointsMaterial ref={mat} color={ACCENT} size={0.035} sizeAttenuation transparent opacity={0.42} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function Rig({ children, ambient }: { children: React.ReactNode; ambient: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer, viewport, size } = useThree();
  useFrame((_, dt) => {
    if (!group.current) return;
    const desktop = size.width >= 900;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.3, 4, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * 0.2, 4, dt);
    const s = ambient ? Math.min(1.35, viewport.width / 5.2) : desktop ? Math.min(1.25, viewport.width / 6.2) : Math.min(0.9, viewport.width / 5.5);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x || 0.001, s, 4, dt));
    group.current.position.x = ambient ? 0 : desktop ? 0.15 : 0.9;
    group.current.position.y = ambient ? 0 : desktop ? -0.15 : 1.5;
  });
  return <group ref={group}>{children}</group>;
}

function Scene({ stateRef, ambient, shape, terrain }: { stateRef: MutableRefObject<HeroState>; ambient: boolean; shape: GlassShape; terrain: boolean }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 6, 4]} intensity={1.2} />
      <pointLight position={[-4, -2, 3]} intensity={5} color={ACCENT} distance={12} decay={2} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 5, -3]} rotation={[-Math.PI / 2.2, 0, 0]} scale={[10, 3, 1]} />
        <Lightformer form="ring" intensity={0.5} color="#fff5e6" position={[0, 0, -8]} scale={14} />
        <Lightformer form="rect" intensity={2.4} color={ACCENT} position={[-6, 0, 2]} rotation={[0, Math.PI / 2, 0]} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#a9b6ff" position={[6, -1, -1]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 5, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[2, 4, 6]} scale={3} />
        <Lightformer form="rect" intensity={1} color="#ffd9a3" position={[0, -5, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 3, 1]} />
      </Environment>
      <Rig ambient={ambient}>
        <Float speed={ambient ? 0.8 : 1.1} rotationIntensity={0.25} floatIntensity={0.6}>
          <GlassForm stateRef={stateRef} ambient={ambient} shape={shape} />
        </Float>
        {terrain && <Terrain stateRef={stateRef} />}
        <Sparkles count={ambient ? 50 : 120} scale={[9, 6, 6]} size={2.4} speed={0.25} opacity={0.5} color={ACCENT} />
        <Sparkles count={ambient ? 30 : 80} scale={[10, 7, 7]} size={1.2} speed={0.15} opacity={0.35} color="#f1efe9" />
      </Rig>
    </>
  );
}

export default function HeroObject({ stateRef, active, ambient = false, shape = "knot", terrain = !ambient }: { stateRef: MutableRefObject<HeroState>; active: boolean; ambient?: boolean; shape?: GlassShape; terrain?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 8.5], fov: 34, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        gl.setClearColor(new THREE.Color("#000000"), 0);
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <Scene stateRef={stateRef} ambient={ambient} shape={shape} terrain={terrain} />
      </Suspense>
    </Canvas>
  );
}
