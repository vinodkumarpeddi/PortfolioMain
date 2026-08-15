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


/* A voxel dancer on the city, in the spirit of the King of Pop: fedora, one white glove, black suit, white socks.
   Five moves cycle bar by bar (Billie Jean side-steps, moonwalk, the lean, spin into toe-stand, Thriller arms),
   blended at bar boundaries; stomps and bar changes roll waves through the streets. */
const SUIT = "#111116";
const SKIN = "#f1d9b8";
const WHITE = "#fbf7ef";
const GLOW = "#f3b453";
type V3 = [number, number, number];
type Pose = {
  hipsY: number; lean: number; spin: number; rise: number;
  hips: V3; torso: V3; head: V3; lArm: V3; rArm: V3; lFore: V3; rFore: V3; lLeg: V3; rLeg: V3; lShin: number; rShin: number;
};
const l3 = (a: V3, b: V3, m: number): V3 => [a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m, a[2] + (b[2] - a[2]) * m];
const l1 = (a: number, b: number, m: number) => a + (b - a) * m;
function mixPose(a: Pose, b: Pose, m: number): Pose {
  return {
    hipsY: l1(a.hipsY, b.hipsY, m), lean: l1(a.lean, b.lean, m), spin: l1(a.spin, b.spin, m), rise: l1(a.rise, b.rise, m),
    hips: l3(a.hips, b.hips, m), torso: l3(a.torso, b.torso, m), head: l3(a.head, b.head, m),
    lArm: l3(a.lArm, b.lArm, m), rArm: l3(a.rArm, b.rArm, m), lFore: l3(a.lFore, b.lFore, m), rFore: l3(a.rFore, b.rFore, m),
    lLeg: l3(a.lLeg, b.lLeg, m), rLeg: l3(a.rLeg, b.rLeg, m), lShin: l1(a.lShin, b.lShin, m), rShin: l1(a.rShin, b.rShin, m),
  };
}
const REST: Pose = { hipsY: 0.9, lean: 0, spin: 0, rise: 0, hips: [0, 0, 0], torso: [0, 0, 0], head: [0, 0, 0], lArm: [0, 0, -0.12], rArm: [0, 0, 0.12], lFore: [0, 0, 0], rFore: [0, 0, 0], lLeg: [0, 0, 0.04], rLeg: [0, 0, -0.04], lShin: 0, rShin: 0 };
const sm = (x: number) => THREE.MathUtils.smoothstep(x, 0, 1);
// b: beats elapsed · inBar: 0..8 within the current bar
function billieJean(b: number, inBar: number): Pose {
  const sB = Math.sin(b * Math.PI), half = Math.sin(b * Math.PI * 0.5), bounce = Math.abs(sB);
  const hat = inBar < 4 ? 1 : 0;
  return {
    ...REST, hipsY: 0.88 + bounce * 0.1, hips: [0, half * 0.3, sB * 0.16], torso: [-0.06, -half * 0.25, -sB * 0.14],
    head: [sB * 0.1, half * 0.45, sB * 0.1],
    lArm: [half * 0.5, 0, -0.35 - Math.max(0, sB) * 0.5], lFore: [-0.5 - Math.max(0, sB) * 0.6, 0, -0.2],
    rArm: hat ? [-1.3, 0, 0.9] : [-half * 0.5, 0, 0.35 + Math.max(0, -sB) * 0.5],
    rFore: hat ? [-1.7, 0, 0.9] : [-0.5 - Math.max(0, -sB) * 0.6, 0, 0.2],
    lLeg: [0, 0, 0.12 + Math.max(0, sB) * 0.4], rLeg: [0, 0, -0.12 - Math.max(0, -sB) * 0.4],
    lShin: Math.max(0, sB) * 0.5, rShin: Math.max(0, -sB) * 0.5,
  };
}
function moonwalk(b: number): Pose {
  // each beat one foot slides flat backwards while the other stands bent on its toes; they swap on the beat
  const u = b - Math.floor(b);
  const leftSlides = Math.floor(b) % 2 === 0;
  const swap = sm(u / 0.18);
  const slideX = l1(-0.3, 0.5, sm(u));
  const bentX = -0.4, bentShin = 1.15;
  const lX = leftSlides ? l1(bentX, slideX, swap) : l1(0.5, bentX, swap);
  const rX = leftSlides ? l1(0.5, bentX, swap) : l1(bentX, slideX, swap);
  const lS = leftSlides ? l1(bentShin, 0.05, swap) : l1(0.05, bentShin, swap);
  const rS = leftSlides ? l1(0.05, bentShin, swap) : l1(bentShin, 0.05, swap);
  const sw = leftSlides ? 1 : -1;
  const bob = Math.sin(b * Math.PI * 2) * 0.12;
  return {
    ...REST, hipsY: 0.84, hips: [0.1, sw * 0.06 * swap, 0], torso: [0.24, -sw * 0.1, 0], head: [-0.1 + bob, 0, 0],
    lArm: [-sw * 0.4, 0, -0.22], rArm: [sw * 0.4, 0, 0.22], lFore: [-0.35, 0, -0.1], rFore: [-0.35, 0, 0.1],
    lLeg: [lX, 0, 0.05], rLeg: [rX, 0, -0.05], lShin: lS, rShin: rS,
  };
}
function theLean(inBar: number): Pose {
  const a = sm(inBar / 2) * (1 - sm((inBar - 5) / 2.5));
  return {
    ...REST, lean: a * 0.7, hipsY: 0.9, torso: [-a * 0.1, 0, 0], head: [-a * 0.55, 0, 0],
    lArm: [a * 0.35, 0, -0.14], rArm: [a * 0.35, 0, 0.14], lFore: [0, 0, 0], rFore: [0, 0, 0],
    lLeg: [0, 0, 0.05], rLeg: [0, 0, -0.05], lShin: 0, rShin: 0,
  };
}
function spinToes(inBar: number): Pose {
  const wind = Math.sin(THREE.MathUtils.clamp(inBar / 0.9, 0, 1) * Math.PI);
  const sp = sm((inBar - 0.6) / 2.6);
  const spin = (1 - Math.pow(1 - sp, 3)) * Math.PI * 4;
  const toes = sm((inBar - 3) / 0.7) * (1 - sm((inBar - 6.4) / 1.2));
  const tuck = 1 - toes;
  return {
    ...REST, spin, rise: toes * 0.17, hipsY: 0.9 - wind * 0.22 + toes * 0.02, hips: [wind * 0.25, 0, 0], torso: [wind * 0.3 - toes * 0.08, wind * 0.6, 0], head: [-toes * 0.25, 0, toes * 0.15],
    lArm: [-wind * 0.6, 0, -0.18 - toes * 1.1 - wind * 0.9], lFore: [-wind * 0.6, 0, -toes * 0.4],
    rArm: [-toes * 1.35 - wind * 0.6, 0, 0.18 + toes * 0.75 + wind * 0.9], rFore: [-toes * 1.7 - wind * 0.6, 0, toes * 0.9],
    lLeg: [-wind * 0.7, 0, 0.03 * tuck], rLeg: [-wind * 0.7, 0, -0.03 * tuck], lShin: toes * 0.1 + wind * 1.3, rShin: toes * 0.1 + wind * 1.3,
  };
}
function thriller(b: number): Pose {
  const sB = Math.sin(b * Math.PI), bounce = Math.abs(sB);
  return {
    ...REST, hipsY: 0.85 + bounce * 0.05, hips: [0.05, 0, sB * 0.1], torso: [0.3, sB * 0.1, 0], head: [0.25, sB * 0.35, 0.2],
    lArm: [-1.45 + sB * 0.35, 0, -0.35], rArm: [-1.45 - sB * 0.35, 0, 0.35], lFore: [1.35, 0, 0], rFore: [1.35, 0, 0],
    lLeg: [0, 0, 0.18 + Math.max(0, sB) * 0.45], rLeg: [0, 0, -0.18 - Math.max(0, -sB) * 0.45],
    lShin: Math.max(0, sB) * 0.5, rShin: Math.max(0, -sB) * 0.5,
  };
}
function kickPose(b: number, inBar: number): Pose {
  const sB = Math.sin(b * Math.PI);
  // 0–2 high kick · 2–4 knees together, hands to the hat · 4–6 hip thrusts · 6–8 toe-point freeze
  const kick = Math.sin(THREE.MathUtils.clamp(inBar / 2, 0, 1) * Math.PI);
  const hat = sm((inBar - 2) / 0.6) * (1 - sm((inBar - 3.6) / 0.6));
  const thrust = inBar >= 4 && inBar < 6 ? Math.max(0, Math.sin((inBar - 4) * Math.PI * 2)) : 0;
  const freeze = sm((inBar - 6) / 0.5);
  return {
    ...REST, hipsY: 0.9 - hat * 0.06 - thrust * 0.04, hips: [-thrust * 0.45 - hat * 0.15, 0, sB * 0.06 * (1 - freeze)],
    torso: [hat * 0.2 + thrust * 0.2 - freeze * 0.1, freeze * 0.4, 0], head: [-hat * 0.3 - freeze * 0.2, freeze * 0.4, hat * 0.1],
    lArm: [-kick * 0.6, 0, -0.3 - kick * 1.4 + hat * 0.9 - freeze * 0.4], lFore: [-hat * 1.9, 0, -0.2 - freeze * 0.2],
    rArm: [-kick * 0.6 - hat * 1.3, 0, 0.3 + kick * 1.4 + hat * 0.9 + freeze * 2.4], rFore: [-hat * 1.7, 0, 0.2 + hat * 0.9 + freeze * 0.3],
    lLeg: [0, 0, 0.05 + hat * 0.06], rLeg: [-kick * 1.7 - freeze * 0.35, 0, -0.05 - hat * 0.06], lShin: 0, rShin: freeze * 0.9,
  };
}
type Move = { pose: (b: number, inBar: number) => Pose; from: number; to: number; stepped?: boolean };
const MOVES: Move[] = [
  { pose: (b, i) => billieJean(b, i), from: -1.2, to: 0.9 },
  { pose: (b) => moonwalk(b), from: 0.9, to: -0.15, stepped: true },
  { pose: (b) => moonwalk(b), from: -0.15, to: -1.2, stepped: true },
  { pose: (_b, i) => theLean(i), from: -1.2, to: -1.2 },
  { pose: (_b, i) => spinToes(i), from: -1.2, to: -1.2 },
  { pose: (b) => thriller(b), from: -1.2, to: -1.2 },
  { pose: (b, i) => kickPose(b, i), from: -1.2, to: -1.2 },
];
const moveAt = (i: number) => MOVES[((i % MOVES.length) + MOVES.length) % MOVES.length];
function movePose(move: number, b: number, inBar: number): Pose {
  return moveAt(move).pose(b, inBar);
}
// forward glide along the facing direction: walks forward during Billie Jean, slides back beat by beat in the moonwalk
function glide(move: number, inBar: number) {
  const m = moveAt(move);
  const u = inBar / 8;
  const e = m.stepped ? (Math.floor(u * 8) + sm(u * 8 - Math.floor(u * 8))) / 8 : sm(u);
  return m.from + (m.to - m.from) * e;
}
const setE = (g: THREE.Group | null, e: V3) => { if (g) g.rotation.set(e[0], e[1], e[2]); };
function Part({ size, pos, color = SUIT, glow = 0, emissive = GLOW, rough = 0.35, metal = 0.5 }: { size: V3; pos: V3; color?: string; glow?: number; emissive?: string; rough?: number; metal?: number }) {
  return (
    <mesh position={pos} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={glow} roughness={rough} metalness={metal} />
    </mesh>
  );
}
function Limb({ len, w, tip, children }: { len: number; w: number; tip?: "hand" | "glove" | "shoe"; children?: React.ReactNode }) {
  return (
    <>
      <Part size={[w, len, w]} pos={[0, -len / 2, 0]} />
      {tip === "hand" && <Part size={[w * 1.05, w * 0.8, w * 1.05]} pos={[0, -len - w * 0.3, 0]} color={SKIN} metal={0.1} rough={0.6} />}
      {tip === "glove" && <Part size={[w * 1.2, w * 0.95, w * 1.2]} pos={[0, -len - w * 0.35, 0]} color={WHITE} emissive={WHITE} glow={0.9} metal={0.2} rough={0.3} />}
      {tip === "shoe" && (
        <>
          <Part size={[w * 1.1, 0.1, w * 1.1]} pos={[0, -len + 0.06, 0]} color={WHITE} emissive={WHITE} glow={0.35} metal={0.1} rough={0.6} />
          <Part size={[w * 1.2, w * 0.6, w * 2.0]} pos={[0, -len - w * 0.15, w * 0.4]} color="#08080a" metal={0.8} rough={0.25} />
        </>
      )}
      <group position={[0, -len, 0]}>{children}</group>
    </>
  );
}
function Dancer({ stateRef, dancerRef, onStomp }: { stateRef: MutableRefObject<HeroState>; dancerRef: MutableRefObject<{ x: number; z: number; foot: number }>; onStomp: (x: number, z: number, a: number) => void }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
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
  const spot = useRef<THREE.PointLight>(null);
  const ring = useRef<THREE.Mesh>(null);
  const lastStep = useRef(-1);
  const lastBar = useRef(-1);
  const stompAt = useRef(-10);
  const bornRef = useRef<number | null>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bornRef.current === null) bornRef.current = t;
    const age = t - bornRef.current;
    const g = root.current;
    if (!g) return;
    const bpm = 58;
    const b = t * (bpm / 60);
    const bar = Math.floor(b / 8);
    const inBar = b - bar * 8;
    const cur = movePose(bar, b, inBar);
    const m = inBar > 7.2 ? sm((inBar - 7.2) / 0.8) : 0;
    const P = m > 0 ? mixPose(cur, movePose(bar + 1, b, 0), m) : cur;
    const sB = Math.sin(b * Math.PI);
    const bounce = Math.abs(sB);

    // stage position: slow drift around the centre, facing the viewer, plus the walk/moonwalk glide
    const heading = 0.72 + Math.sin(t * 0.21) * 0.3;
    const gl = glide(bar, inBar);
    const cx = Math.sin(t * 0.11) * 1.1;
    const cz = Math.cos(t * 0.09) * 0.9;
    const x = cx + Math.sin(heading) * gl;
    const z = cz + Math.cos(heading) * gl;
    const d = dancerRef.current;
    d.x = x;
    d.z = z;
    const s = stateRef.current;
    const appear = THREE.MathUtils.clamp((age - 1.4) / 1.2, 0, 1);
    const fade = 1 - THREE.MathUtils.clamp((s.spread - 0.15) / 0.5, 0, 1);
    const sc = appear * fade;

    // waves: a light stomp every two beats, a big one at every bar change
    const stepIdx = Math.floor(b / 2);
    if (sc > 0.5 && stepIdx !== lastStep.current) {
      lastStep.current = stepIdx;
      onStomp(x, z, 0.3);
    }
    if (bar !== lastBar.current) {
      if (lastBar.current >= 0 && sc > 0.5) { onStomp(x, z, 1.2); stompAt.current = t; }
      lastBar.current = bar;
    }
    const u = THREE.MathUtils.clamp((t - stompAt.current) / 0.35, 0, 1);
    const sq = Math.sin(u * Math.PI) * (1 - u) * 0.22;

    g.position.set(x, d.foot + P.rise - (1 - appear) * 0.6, z);
    g.rotation.y = heading + P.spin;
    g.scale.setScalar(Math.max(0.0001, sc * 0.9));
    g.visible = sc > 0.001;
    if (body.current) {
      body.current.rotation.x = -P.lean;
      body.current.scale.set(1 + sq * 0.6, 1 - sq, 1 + sq * 0.6);
    }
    if (hips.current) { hips.current.position.y = P.hipsY; setE(hips.current, P.hips); }
    setE(torso.current, P.torso);
    setE(head.current, P.head);
    setE(lArm.current, P.lArm); setE(rArm.current, P.rArm);
    setE(lFore.current, P.lFore); setE(rFore.current, P.rFore);
    setE(lLeg.current, P.lLeg); setE(rLeg.current, P.rLeg);
    if (lShin.current) lShin.current.rotation.x = P.lShin;
    if (rShin.current) rShin.current.rotation.x = P.rShin;
    if (light.current) light.current.intensity = (2.5 + bounce * 1.5 + P.rise * 8) * sc;
    if (spot.current) spot.current.intensity = (3.5 + bounce * 1.5) * sc;
    if (ring.current) {
      const rs = 1 + bounce * 0.1 + P.rise * 1.5;
      ring.current.scale.set(rs, rs, 1);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (0.3 + bounce * 0.4) * sc;
    }
  });

  return (
    <group ref={root}>
      <pointLight ref={light} position={[0, 1.2, 0.8]} color={GLOW} intensity={3} distance={3.2} decay={2} />
      <pointLight ref={spot} position={[0, 2.6, 0.7]} color="#fff4e0" intensity={4} distance={3.4} decay={2} />
      <mesh ref={ring} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.72, 48]} />
        <meshBasicMaterial color={GLOW} transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <group ref={body}>
        <group ref={hips} position={[0, 0.9, 0]}>
          <Part size={[0.46, 0.22, 0.28]} pos={[0, 0.06, 0]} />
          <group ref={torso} position={[0, 0.17, 0]}>
            <Part size={[0.52, 0.62, 0.3]} pos={[0, 0.31, 0]} />
            <Part size={[0.16, 0.5, 0.03]} pos={[0, 0.34, 0.155]} color={WHITE} emissive={WHITE} glow={0.25} metal={0.1} rough={0.6} />
            <Part size={[0.05, 0.36, 0.035]} pos={[0, 0.34, 0.16]} color="#8a0f1e" metal={0.2} rough={0.5} />
            <group ref={head} position={[0, 0.7, 0]}>
              <Part size={[0.34, 0.36, 0.34]} pos={[0, 0.2, 0]} color={SKIN} metal={0.05} rough={0.65} />
              <Part size={[0.26, 0.05, 0.03]} pos={[0, 0.24, 0.165]} color="#1a1210" metal={0} rough={0.8} />
              <Part size={[0.36, 0.1, 0.36]} pos={[0, 0.34, -0.02]} color="#0c0c0e" metal={0.1} rough={0.9} />
              <group rotation={[0.16, 0, 0]} position={[0, 0.39, 0]}>
                <Part size={[0.62, 0.05, 0.64]} pos={[0, 0, 0.02]} color="#0a0a0c" metal={0.3} rough={0.5} />
                <Part size={[0.36, 0.22, 0.36]} pos={[0, 0.13, 0]} color="#0a0a0c" metal={0.3} rough={0.5} />
                <Part size={[0.38, 0.06, 0.38]} pos={[0, 0.06, 0]} color={GLOW} emissive={GLOW} glow={0.6} metal={0.3} rough={0.4} />
              </group>
            </group>
            <group ref={lArm} position={[-0.33, 0.55, 0]}>
              <Limb len={0.42} w={0.14}>
                <group ref={lFore}>
                  <Limb len={0.38} w={0.12} tip="hand" />
                </group>
              </Limb>
            </group>
            <group ref={rArm} position={[0.33, 0.55, 0]}>
              <Limb len={0.42} w={0.14}>
                <group ref={rFore}>
                  <Limb len={0.38} w={0.12} tip="glove" />
                </group>
              </Limb>
            </group>
          </group>
          <group ref={lLeg} position={[-0.13, -0.02, 0]}>
            <Limb len={0.46} w={0.16}>
              <group ref={lShin}>
                <Limb len={0.42} w={0.14} tip="shoe" />
              </group>
            </Limb>
          </group>
          <group ref={rLeg} position={[0.13, -0.02, 0]}>
            <Limb len={0.46} w={0.16}>
              <group ref={rShin}>
                <Limb len={0.42} w={0.14} tip="shoe" />
              </group>
            </Limb>
          </group>
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
