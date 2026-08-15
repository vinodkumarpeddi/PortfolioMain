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
    const arr: { x: number; z: number; i: number; j: number; d: number; base: number; seed: number; sx: number; sz: number; ry: number }[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = (i - (N - 1) / 2) * (CELL + GAP);
        const z = (j - (N - 1) / 2) * (CELL + GAP);
        const d = Math.hypot(i - (N - 1) / 2, j - (N - 1) / 2) / (N / 2);
        const n = noise2(i * 0.18 + 3, j * 0.18 + 7);
        const base = Math.max(0.08, (0.3 + n * 2.4) * (1 - d * d * 0.85));
        arr.push({ x, z, i, j, d, base, seed: hash2(i, j), sx: (hash2(i + 9, j) - 0.5) * 12, sz: (hash2(i, j + 9) - 0.5) * 12, ry: (hash2(i + 3, j + 5) - 0.5) * 6 });
      }
    }
    return arr;
  }, []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const hit = useMemo(() => new THREE.Vector3(99, 0, 99), []);
  const tmpHit = useMemo(() => new THREE.Vector3(), []);
  const groupRef = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  // blinking "city lights": a few cells flash briefly at random
  const flashesRef = useRef<Float32Array>(new Float32Array(COUNT));
  const nextFlash = useRef(0);
  const shocksRef = useRef<{ x: number; z: number; t: number; a: number }[]>([]);
  const dancerRef = useRef({ x: 0, z: 0, foot: 1.2 });

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    if (born.current === null) born.current = t;
    const age = t - born.current;
    const s = stateRef.current;
    const spread = s.spread;

    // pointer → point on the city plane (local space)
    ray.setFromCamera(pointer, camera);
    if (ray.ray.intersectPlane(plane, tmpHit) && groupRef.current) {
      groupRef.current.worldToLocal(tmpHit);
      hit.lerp(tmpHit, 1 - Math.exp(-6 * dt));
    }
    // random flashes
    if (t > nextFlash.current) {
      nextFlash.current = t + 0.05 + Math.random() * 0.12;
      flashesRef.current[Math.floor(Math.random() * COUNT)] = 1;
    }
    // rhythm: a beat at ~96 bpm that travels across the field, plus slow swells
    const bpm = 52;
    const beatT = t * (bpm / 60);
    // shockwaves
    const shockList = shocksRef.current;
    for (const sh of shockList) sh.t += dt;
    for (let q = shockList.length - 1; q >= 0; q--) if (shockList[q].t >= 3.2) shockList.splice(q, 1);
    // travelling streams along a few rows/columns
    const streamRow = Math.floor((t * 0.14) % N);
    const streamCol = Math.floor((t * 0.11 + 11) % N);
    const streamPos = (t * 4) % (N + 8) - 4;

    let footMax = 0.2;
    for (let k = 0; k < COUNT; k++) {
      const c = cells[k];
      // build-in: radial wave from the centre
      const build = THREE.MathUtils.clamp((age - 0.2 - c.d * 1.4) / 0.9, 0, 1);
      const eb = 1 - Math.pow(1 - build, 3);
      // ambient breathing + radar pulse rings
      const wave = Math.sin(t * 0.38 + c.x * 0.7) * 0.18 + Math.cos(t * 0.29 + c.z * 0.9) * 0.14;
      const ring = Math.max(0, Math.sin(c.d * 7 - t * 0.9));
      const pulse = Math.pow(ring, 6) * 0.9;
      // streams: a bright packet running along one row and one column
      let stream = 0;
      if (c.i === streamRow) stream = Math.max(0, 1 - Math.abs(c.j - streamPos) / 3);
      if (c.j === streamCol) stream = Math.max(stream, Math.max(0, 1 - Math.abs(c.i - ((streamPos * 0.8 + 6) % (N + 8) - 4)) / 3));
      // cursor lift
      const dm = Math.hypot(c.x - hit.x, c.z - hit.z);
      const lift = Math.max(0, 1 - dm / 2.2);
      flashesRef.current[k] = Math.max(0, flashesRef.current[k] - dt * 1.6);
      const flash = flashesRef.current[k];

      // dance: beat bounce travelling diagonally + two slow swells
      const phase = beatT - Math.hypot(c.x - dancerRef.current.x, c.z - dancerRef.current.z) * 0.22;
      const beat = Math.pow(Math.max(0, Math.sin(phase * Math.PI)), 3);
      const swell = Math.sin(t * 0.3 + c.x * 0.5) * Math.cos(t * 0.22 - c.z * 0.6) * 0.32;
      const dance = beat * 0.42 * (0.4 + 0.6 * c.seed) + swell;
      // shockwave rings
      let shock = 0;
      for (const sh of shocksRef.current) {
        const dd = Math.hypot(c.x - sh.x, c.z - sh.z);
        const rr = sh.t * 3.2;
        shock += Math.max(0, 1 - Math.abs(dd - rr) / 0.9) * Math.max(0, 1 - sh.t / 3.2) * sh.a;
      }
      // the city rises to carry the dancer: a lit stage follows their feet
      const dd0 = Math.hypot(c.x - dancerRef.current.x, c.z - dancerRef.current.z);
      const near = Math.max(0, 1 - dd0 / 1.5);
      const stage = near * near * (3 - 2 * near) * 0.5;
      const h = Math.max(0.05, (c.base + wave + dance + pulse * 0.6 + lift * lift * 1.6 + stream * 0.9 + shock * 1.4 + stage) * eb);
      if (dd0 < 0.5 && h > footMax) footMax = h;
      const ex = spread * c.sx;
      const ez = spread * c.sz;
      const ey = spread * (c.seed * 5 + 1);
      dummy.position.set(c.x + ex, h / 2 + ey, c.z + ez);
      dummy.rotation.set(spread * c.ry, spread * c.ry * 0.7, 0);
      dummy.scale.set(CELL, h, CELL);
      dummy.updateMatrix();
      m.setMatrixAt(k, dummy.matrix);

      // colour: mostly dark; peaks, pulses, streams and flashes light up
      const heat = THREE.MathUtils.clamp((h - 0.6) / 2.4, 0, 1) + pulse * 0.5 + lift * 0.8 + stream * 0.9 + flash * 1.1 + beat * 0.35 + shock * 1.3 + near * 0.9;
      color.copy(dark).lerp(amber, THREE.MathUtils.clamp(heat, 0, 1) * 0.85);
      if (heat > 0.9) color.lerp(warm, THREE.MathUtils.clamp((heat - 0.9) * 1.6, 0, 1));
      m.setColorAt(k, color);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    dancerRef.current.foot = THREE.MathUtils.damp(dancerRef.current.foot, footMax, 6, dt);
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
        castShadow
        receiveShadow
        onPointerDown={(e) => {
          e.stopPropagation();
          const p = e.point.clone();
          groupRef.current?.worldToLocal(p);
          const list = shocksRef.current;
          list.push({ x: p.x, z: p.z, t: 0, a: 1 });
          if (list.length > 6) list.shift();
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.55} />
      </instancedMesh>
      <Dancer
        stateRef={stateRef}
        dancerRef={dancerRef}
        onStomp={(x, z, a) => {
          const list = shocksRef.current;
          list.push({ x, z, t: 0, a });
          if (list.length > 6) list.shift();
        }}
      />
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[N * (CELL + GAP) + 1.5, N * (CELL + GAP) + 1.5]} />
        <meshStandardMaterial color="#0c0c10" roughness={0.9} metalness={0.2} />
      </mesh>
    </group>
  );
}


/* A voxel figure dancing on the city. Slow groove, spins and jumps every few bars; each landing rolls a wave through the streets. */
const BODY = "#f3b453";
function Limb({ len, w, children }: { len: number; w: number; children?: React.ReactNode }) {
  return (
    <>
      <mesh position={[0, -len / 2, 0]} castShadow>
        <boxGeometry args={[w, len, w]} />
        <meshStandardMaterial color={BODY} emissive={BODY} emissiveIntensity={0.55} roughness={0.35} metalness={0.2} />
      </mesh>
      <group position={[0, -len, 0]}>{children}</group>
    </>
  );
}
function Dancer({ stateRef, dancerRef, onStomp }: { stateRef: MutableRefObject<HeroState>; dancerRef: MutableRefObject<{ x: number; z: number; foot: number }>; onStomp: (x: number, z: number, a: number) => void }) {
  const root = useRef<THREE.Group>(null);
  const hips = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const lArm = useRef<THREE.Group>(null);
  const rArm = useRef<THREE.Group>(null);
  const lFore = useRef<THREE.Group>(null);
  const rFore = useRef<THREE.Group>(null);
  const lLeg = useRef<THREE.Group>(null);
  const rLeg = useRef<THREE.Group>(null);
  const lShin = useRef<THREE.Group>(null);
  const rShin = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const lastBar = useRef(-1);
  const lastStep = useRef(-1);
  const bornRef = useRef<number | null>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bornRef.current === null) bornRef.current = t;
    const age = t - bornRef.current;
    const g = root.current;
    if (!g) return;
    const bpm = 52;
    const b = t * (bpm / 60);
    const sB = Math.sin(b * Math.PI);
    const bounce = Math.abs(sB);
    const half = Math.sin(b * Math.PI * 0.5);
    const bar = Math.floor(b / 8);
    const inBar = b - bar * 8;
    // spin + jump on the last two beats of every second bar
    const p = bar % 2 === 1 && inBar > 6 ? (inBar - 6) / 2 : 0;
    const spin = p > 0 ? (1 - Math.pow(1 - p, 3)) * Math.PI * 2 : 0;
    const jump = p > 0 ? Math.sin(p * Math.PI) * 0.9 : 0;

    // slow wander around the city centre
    const ang = t * 0.09;
    const x = Math.cos(ang) * 2.4 + Math.sin(t * 0.23) * 0.4;
    const z = Math.sin(ang * 1.3) * 2.0 + Math.cos(t * 0.17) * 0.4;
    const d = dancerRef.current;
    const heading = Math.atan2(x - d.x, z - d.z);
    d.x = x;
    d.z = z;
    const s = stateRef.current;
    const appear = THREE.MathUtils.clamp((age - 1.4) / 1.2, 0, 1);
    const fade = 1 - THREE.MathUtils.clamp((s.spread - 0.15) / 0.5, 0, 1);
    const sc = appear * fade;
    g.position.set(x, d.foot + jump - (1 - appear) * 0.6, z);
    g.rotation.y = heading + spin;
    g.scale.setScalar(Math.max(0.0001, sc * 0.85));
    g.visible = sc > 0.001;

    if (hips.current) {
      hips.current.position.y = 0.95 + bounce * 0.1 - 0.05;
      hips.current.rotation.set(0, half * 0.35, sB * 0.1);
    }
    if (torso.current) torso.current.rotation.set(Math.sin(t * 0.5) * 0.06 - 0.05, -half * 0.3, -sB * 0.08);
    if (head.current) head.current.rotation.set(Math.sin(b * Math.PI + 0.6) * 0.12, Math.sin(b * Math.PI * 0.5 + 1) * 0.45, sB * 0.12);
    const swing = sB * 0.9;
    if (lArm.current) lArm.current.rotation.set(half * 0.6, 0, -(0.55 + swing));
    if (rArm.current) rArm.current.rotation.set(-half * 0.6, 0, 0.55 - swing);
    if (lFore.current) lFore.current.rotation.set(-0.5 - Math.max(0, sB) * 0.9, 0, -0.35);
    if (rFore.current) rFore.current.rotation.set(-0.5 - Math.max(0, -sB) * 0.9, 0, 0.35);
    const step = sB * 0.5;
    if (lLeg.current) lLeg.current.rotation.set(step, 0, 0.06);
    if (rLeg.current) rLeg.current.rotation.set(-step, 0, -0.06);
    if (lShin.current) lShin.current.rotation.x = Math.max(0, sB) * 0.9;
    if (rShin.current) rShin.current.rotation.x = Math.max(0, -sB) * 0.9;
    if (light.current) light.current.intensity = (7 + bounce * 4 + jump * 6) * sc;

    // landings: a stomp every two beats, a big one after each jump
    const stepIdx = Math.floor(b / 2);
    if (sc > 0.5 && stepIdx !== lastStep.current) {
      lastStep.current = stepIdx;
      onStomp(x, z, 0.35);
    }
    if (bar !== lastBar.current) {
      if (lastBar.current % 2 === 1 && sc > 0.5) onStomp(x, z, 1.2);
      lastBar.current = bar;
    }
  });

  return (
    <group ref={root}>
      <pointLight ref={light} position={[0, 1.6, 0]} color="#f3b453" intensity={7} distance={6} decay={2} />
      <group ref={hips} position={[0, 0.95, 0]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[0.44, 0.22, 0.26]} />
          <meshStandardMaterial color={BODY} emissive={BODY} emissiveIntensity={0.55} roughness={0.35} metalness={0.2} />
        </mesh>
        <group ref={torso} position={[0, 0.17, 0]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.28]} />
            <meshStandardMaterial color={BODY} emissive={BODY} emissiveIntensity={0.55} roughness={0.35} metalness={0.2} />
          </mesh>
          <group ref={head} position={[0, 0.72, 0]}>
            <mesh position={[0, 0.16, 0]} castShadow>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial color="#fff1d6" emissive="#f3b453" emissiveIntensity={1.4} roughness={0.3} metalness={0.1} />
            </mesh>
          </group>
          <group ref={lArm} position={[-0.32, 0.55, 0]}>
            <Limb len={0.42} w={0.14}>
              <group ref={lFore}>
                <Limb len={0.4} w={0.12} />
              </group>
            </Limb>
          </group>
          <group ref={rArm} position={[0.32, 0.55, 0]}>
            <Limb len={0.42} w={0.14}>
              <group ref={rFore}>
                <Limb len={0.4} w={0.12} />
              </group>
            </Limb>
          </group>
        </group>
        <group ref={lLeg} position={[-0.13, -0.02, 0]}>
          <Limb len={0.48} w={0.16}>
            <group ref={lShin}>
              <Limb len={0.45} w={0.14} />
            </group>
          </Limb>
        </group>
        <group ref={rLeg} position={[0.13, -0.02, 0]}>
          <Limb len={0.48} w={0.16}>
            <group ref={rShin}>
              <Limb len={0.45} w={0.14} />
            </group>
          </Limb>
        </group>
      </group>
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
    const dive = Math.min(1, s.spread * 1.6); // first part of the scroll dives into the streets
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.72 + Math.sin(t * 0.08) * 0.12 + pointer.x * 0.08 + dive * 0.5, 3, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, dive * 0.25, 3, dt);
    const sc = (desktop ? Math.min(1, viewport.width / 12) : Math.min(0.75, viewport.width / 6)) * (1 + dive * 0.9);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x || 0.001, sc, 4, dt));
    group.current.position.x = (desktop ? viewport.width * 0.17 : 0.2) - dive * viewport.width * 0.1;
    group.current.position.z = dive * 5;
    group.current.position.y = (desktop ? -1.7 + Math.sin(t * 0.5) * 0.06 : -viewport.height * 0.34) - dive * 1.2 - Math.max(0, s.spread - 0.6) * 4;
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
