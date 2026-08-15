"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor, Sparkles, Trail } from "@react-three/drei";
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

/* r3f resets state.clock.elapsedTime whenever frameloop flips, which would replay the city
   build-in and restart the routine every time the hero scrolled out of view and back. Each
   animated part keeps its own accumulator instead; the dt clamp absorbs the resume frame. */
function useSceneClock() {
  const t = useRef(0);
  return (dt: number) => (t.current += Math.min(dt, 0.1));
}

/* dev-only: ?poseGrid=0:1,3:2.5,... freezes dancers at move:count so poses can be reviewed side by side */
function poseGridSpec() {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search).get("poseGrid");
  if (!q) return null;
  return q.split(",").map((pair) => {
    const [m, c] = pair.split(":");
    return { move: Number(m), inBar: Number(c ?? 2) };
  });
}

/* Static signals are blind on iOS (hardwareConcurrency is always 4, the renderer is "Apple GPU"),
   so form factor only picks the opening preset; PerformanceMonitor does the real work. */
const isHeavyDevice = () => typeof window === "undefined" || window.innerWidth >= 1024;

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
  const clock = useSceneClock();
  const dancerRef = useRef({ x: 0, z: 0, foot: 1.2, flat: 0 });

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const t = clock(dt);
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
      const dc = dancerRef.current;
      const dd0 = Math.hypot(c.x - dc.x, c.z - dc.z);
      const radius = 1.5 + dc.flat * 1.6;
      const near = Math.max(0, 1 - dd0 / radius);
      const stage = near * near * (3 - 2 * near) * (0.5 + dc.flat * 0.5);
      // the streets level off into a stage floor for floor work
      const flatK = dc.flat * near;
      const h = Math.max(0.05, (c.base + wave + dance + pulse * 0.6 + lift * lift * 1.6 + stream * 0.9 + shock * 1.4 + stage) * eb * (1 - flatK) + flatK * 1.5 * eb);
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
        receiveShadow
        raycast={() => null}
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
  hatTilt: number; hatMode: 0 | 1 | 2; // 0 on the head · 1 in the right hand · 2 in the air
};
const TAU = Math.PI * 2;
const spinTo = (a: number, b: number, m: number) => {
  const d = ((((b - a) % TAU) + TAU * 1.5) % TAU) - Math.PI;
  return a + d * m;
};
const l3 = (a: V3, b: V3, m: number): V3 => [a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m, a[2] + (b[2] - a[2]) * m];
const l1 = (a: number, b: number, m: number) => a + (b - a) * m;
function mixPose(a: Pose, b: Pose, m: number): Pose {
  return {
    hipsY: l1(a.hipsY, b.hipsY, m), lean: spinTo(a.lean, b.lean, m), spin: spinTo(a.spin, b.spin, m), rise: l1(a.rise, b.rise, m),
    hatTilt: l1(a.hatTilt, b.hatTilt, m), hatMode: m < 0.5 ? a.hatMode : b.hatMode,
    hips: l3(a.hips, b.hips, m), torso: l3(a.torso, b.torso, m), head: l3(a.head, b.head, m),
    lArm: l3(a.lArm, b.lArm, m), rArm: l3(a.rArm, b.rArm, m), lFore: l3(a.lFore, b.lFore, m), rFore: l3(a.rFore, b.rFore, m),
    lLeg: l3(a.lLeg, b.lLeg, m), rLeg: l3(a.rLeg, b.rLeg, m), lShin: l1(a.lShin, b.lShin, m), rShin: l1(a.rShin, b.rShin, m),
  };
}
const REST: Pose = { hipsY: 0.9, lean: 0, spin: 0, rise: 0, hatTilt: 0, hatMode: 0, hips: [0, 0, 0], torso: [0, 0, 0], head: [0, 0, 0], lArm: [0, 0, -0.12], rArm: [0, 0, 0.12], lFore: [0, 0, 0], rFore: [0, 0, 0], lLeg: [0, 0, 0.04], rLeg: [0, 0, -0.04], lShin: 0, rShin: 0 };
const sm = (x: number) => THREE.MathUtils.smoothstep(x, 0, 1);
// b: beats elapsed · inBar: 0..8 within the current bar
function billieJean(b: number, inBar: number): Pose {
  const sB = Math.sin(b * Math.PI), half = Math.sin(b * Math.PI * 0.5), bounce = Math.abs(sB);
  // hat swept low over the eyes to open, as documented for Billie Jean rather than Smooth Criminal
  const brim = inBar < 2 ? 1 - sm(inBar / 1.6) : 0;
  // legs jump together, then the right leg kicks forward on the downbeat with a thigh slap,
  // and the half turn takes his back to the audience
  const gather = sm((inBar - 4.6) / 0.3) * (1 - sm((inBar - 5) / 0.2));
  const kick = sm((inBar - 5) / 0.22) * (1 - sm((inBar - 6.1) / 0.5));
  const turn = sm((inBar - 6.2) / 0.8);
  return {
    ...REST, spin: turn * Math.PI, hatTilt: brim * 0.9,
    hipsY: 0.88 + bounce * 0.1 - gather * 0.05,
    hips: [-kick * 0.2, half * 0.3, sB * 0.16 * (1 - kick)],
    torso: [-0.06 + kick * 0.18, -half * 0.25, -sB * 0.14 * (1 - kick)],
    head: [sB * 0.1 - brim * 0.35, half * 0.45, sB * 0.1],
    lArm: [half * 0.5, 0, -0.35 - Math.max(0, sB) * 0.5 - turn * 1.3],
    lFore: [-0.5 - Math.max(0, sB) * 0.6 - brim * 1.4, 0, -0.2 - brim * 0.5],
    // the slap: the hand drops to the top of the kicking leg exactly on the kick
    rArm: [-kick * 1.15, 0, 0.35 + Math.max(0, -sB) * 0.5 + turn * 1.3],
    rFore: [-0.5 - Math.max(0, -sB) * 0.6 - brim * 1.6, 0, 0.2 + brim * 0.5],
    lLeg: [0, 0, 0.12 + Math.max(0, sB) * 0.4 * (1 - gather - kick)],
    rLeg: [-kick * 1.75, 0, -0.12 - Math.max(0, -sB) * 0.4 * (1 - gather - kick)],
    lShin: Math.max(0, sB) * 0.5 * (1 - kick), rShin: Math.max(0, -sB) * 0.5 * (1 - kick),
  };
}
function moonwalk(b: number): Pose {
  // body glides back; the planted toe-foot travels forward under it (stationary in the world),
  // the flat foot slides back; they swap on the beat
  const u = b - Math.floor(b);
  const leftSlides = Math.floor(b) % 2 === 0;
  const swap = sm(u / 0.16);
  const slideX = l1(-0.28, 0.42, sm(u));
  const toeX = l1(0.32, -0.45, sm(u));
  const shinFlat = 0.05, shinToe = 1.05;
  const lX = leftSlides ? l1(-0.45, slideX, swap) : l1(0.42, toeX, swap);
  const rX = leftSlides ? l1(0.42, toeX, swap) : l1(-0.45, slideX, swap);
  const lS = leftSlides ? l1(shinToe, shinFlat, swap) : l1(shinFlat, shinToe, swap);
  const rS = leftSlides ? l1(shinFlat, shinToe, swap) : l1(shinToe, shinFlat, swap);
  const sw = leftSlides ? 1 : -1;
  const bob = Math.sin(b * Math.PI * 2) * 0.1;
  return {
    // the head is left behind by the slide and snaps back on the swap — the pop lands on the beat
    ...REST, hipsY: 0.85, hips: [0.08, sw * 0.05 * swap, 0], torso: [0.22, -sw * 0.08, 0],
    head: [-0.08 + bob - (1 - swap) * 0.26, 0, 0],
    lArm: [-sw * 0.35, 0, -0.22], rArm: [sw * 0.35, 0, 0.22], lFore: [-0.35, 0, -0.1], rFore: [-0.35, 0, 0.1],
    lLeg: [lX, 0, 0.05], rLeg: [rX, 0, -0.05], lShin: lS, rShin: rS,
  };
}
function theLean(inBar: number): Pose {
  // 45 degrees, pivoting at the ankles, back straight, feet flat — and every other channel still,
  // held for a beat or two, because the stillness is the effect
  const a = sm(inBar / 1.6) * (1 - sm((inBar - 5.4) / 1.4));
  return {
    ...REST, lean: a * 0.79, hipsY: 0.9, torso: [0, 0, 0], head: [0, 0, 0],
    lArm: [a * 0.35, 0, -0.14], rArm: [a * 0.35, 0, 0.14], lFore: [0, 0, 0], rFore: [0, 0, 0],
    lLeg: [0, 0, 0.05], rLeg: [0, 0, -0.05], lShin: 0, rShin: 0,
  };
}
function spinToes(inBar: number): Pose {
  const wind = Math.sin(THREE.MathUtils.clamp(inBar / 0.9, 0, 1) * Math.PI);
  const sp = sm((inBar - 0.6) / 2.2);
  // spotting: the turn stops in a single frame rather than easing out
  const spin = (inBar < 2.8 ? sp : 1) * Math.PI * 4;
  const toes = sm((inBar - 2.9) / 0.25) * (1 - sm((inBar - 6.4) / 1.2));
  const tuck = 1 - toes;
  return {
    ...REST, spin, rise: toes * 0.17,
    hipsY: 0.9 - wind * 0.22 - toes * 0.1,
    hips: [wind * 0.25 - toes * 0.28, 0, 0],
    torso: [wind * 0.3 + toes * 0.24, wind * 0.6, 0],
    head: [-toes * 0.2, 0, toes * 0.12],
    lArm: [-wind * 0.6, 0, -0.18 - toes * 1.1 - wind * 0.9], lFore: [-wind * 0.6, 0, -toes * 0.4],
    rArm: [-toes * 1.35 - wind * 0.6, 0, 0.18 + toes * 0.75 + wind * 0.9], rFore: [-toes * 1.7 - wind * 0.6, 0, toes * 0.9],
    lLeg: [-wind * 0.7 - toes * 0.5, 0, 0.03 * tuck + toes * 0.12], rLeg: [-wind * 0.7 - toes * 0.5, 0, -0.03 * tuck - toes * 0.12],
    lShin: toes * 0.9 + wind * 1.3, rShin: toes * 0.9 + wind * 1.3,
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
const P0 = (o: Partial<Pose>): Pose => ({ ...REST, ...o });
const ROBOT_KEYS: Pose[] = [
  P0({ head: [0, 0.85, 0], torso: [0, 0.3, 0], lArm: [-1.5, 0, -0.4], lFore: [0, 0, -1.4], rArm: [0, 0, 0.3], rFore: [-1.6, 0, 0] }),
  P0({ head: [0, -0.85, 0], torso: [0, -0.3, 0], lArm: [0, 0, -0.3], lFore: [-1.6, 0, 0], rArm: [-1.5, 0, 0.4], rFore: [0, 0, 1.4] }),
  P0({ head: [0.4, 0, 0], hipsY: 0.8, lArm: [0, 0, -1.6], lFore: [-1.5, 0, 0], rArm: [0, 0, 1.6], rFore: [-1.5, 0, 0], lLeg: [-0.5, 0, 0.1], rLeg: [-0.5, 0, -0.1], lShin: 0.9, rShin: 0.9 }),
  P0({ head: [-0.3, 0, 0.4], hips: [0, 0.5, 0], lArm: [-0.8, 0, -0.2], lFore: [-2.0, 0, 0], rArm: [-0.8, 0, 0.2], rFore: [-2.0, 0, 0] }),
];
function robot(b: number): Pose {
  // pops: snap between key poses every half beat
  const step = Math.floor(b * 2);
  const k = sm((b * 2 - step) / 0.14);
  const prev = ROBOT_KEYS[((step - 1) % 4 + 4) % 4];
  const cur = ROBOT_KEYS[step % 4];
  return mixPose(prev, cur, k);
}
function shimmy(b: number, inBar: number): Pose {
  const fast = Math.sin(b * Math.PI * 4);
  const sB = Math.sin(b * Math.PI);
  const hat = sm((inBar - 6) / 0.5);
  return {
    ...REST, hipsY: 0.87 + Math.abs(fast) * 0.03, hips: [0, sB * 0.15, -fast * 0.05], torso: [0.08, fast * 0.38, 0], head: [0.05, -fast * 0.25, fast * 0.08],
    lArm: [-0.4 + fast * 0.25, 0, -0.55], lFore: [-1.5, 0, -0.5],
    rArm: hat ? l3([0.4 - fast * 0.25, 0, 0.55], [-1.3, 0, 0.9], hat) : [0.4 - fast * 0.25, 0, 0.55],
    rFore: hat ? l3([-1.5, 0, 0.5], [-1.7, 0, 0.9], hat) : [-1.5, 0, 0.5],
    lLeg: [-0.15, 0, 0.12], rLeg: [-0.15, 0, -0.12], lShin: 0.35 + Math.abs(fast) * 0.15, rShin: 0.35 + Math.abs(fast) * 0.15,
  };
}
function spinGlide(b: number, inBar: number): Pose {
  const base = moonwalk(b * 0.5);
  return { ...base, spin: Math.PI * 2 * sm(inBar / 8), torso: [0.15, 0, 0], head: [-0.05, 0, 0] };
}
function kneeDrop(inBar: number): Pose {
  // Thriller's scripted level change: three punches, down to both knees, the low section, then
  // "rise 2-3-4". No split — Jackson was not a splits dancer; that belongs to James Brown.
  const punch = inBar < 1.4 ? Math.sin(inBar / 1.4 * Math.PI * 3) : 0;
  const down = sm((inBar - 1.4) / 0.5) * (1 - sm((inBar - 5.6) / 0.9));
  const rise = sm((inBar - 5.9) / 1.1);
  const low = Math.sin(THREE.MathUtils.clamp((inBar - 2) / 3.4, 0, 1) * Math.PI * 2) * 0.5;
  return {
    ...REST, hipsY: 0.9 - down * 0.45 + rise * 0.02,
    hips: [down * 0.18, low * 0.2, 0], torso: [-down * 0.12 + low * 0.25, -low * 0.25, 0],
    head: [-down * 0.3 + low * 0.3, low * 0.3, 0],
    lArm: [-Math.max(0, punch) * 1.5 - down * 0.4 + rise * 0.2, 0, -0.2 - down * 0.9],
    rArm: [-Math.max(0, -punch) * 1.5 - down * 0.4 + rise * 0.2, 0, 0.2 + down * 0.9],
    lFore: [-0.35 - down * 0.5, 0, -0.15], rFore: [-0.35 - down * 0.5, 0, 0.15],
    lLeg: [-down * 0.15, 0, 0.1 + down * 0.28], rLeg: [-down * 0.15, 0, -0.1 - down * 0.28],
    lShin: down * 2.15, rShin: down * 2.15,
  };
}
function sideGlide(b: number): Pose {
  // faces the viewer and slides sideways: cross-step, feet on toes alternately
  const u = b - Math.floor(b);
  const even = Math.floor(b) % 2 === 0;
  const k = sm(u);
  const cross = even ? l1(-0.5, 0.5, k) : l1(0.5, -0.5, k);
  const sB = Math.sin(b * Math.PI);
  return {
    ...REST, hipsY: 0.86 + Math.abs(sB) * 0.03, hips: [0.05, 0, -cross * 0.12], torso: [0.1, cross * 0.25, cross * 0.08], head: [0, -cross * 0.4, 0],
    lArm: [0, 0, -0.35 - Math.max(0, cross) * 0.5], rArm: [0, 0, 0.35 + Math.max(0, -cross) * 0.5], lFore: [-0.6, 0, -0.2], rFore: [-0.6, 0, 0.2],
    lLeg: [0, 0, 0.1 + cross * 0.45], rLeg: [0, 0, -0.1 + cross * 0.45], lShin: even ? 0.9 * (1 - k) : 0.9 * k, rShin: even ? 0.9 * k : 0.9 * (1 - k),
  };
}
function heelToe(b: number, inBar: number): Pose {
  // knees together, feet pivoting heel-toe, hips isolated left/right; hat hold at the end
  const sB = Math.sin(b * Math.PI), q = Math.sin(b * Math.PI * 2);
  const hat = sm((inBar - 6.5) / 0.4);
  return {
    ...REST, hipsY: 0.88, hips: [0, q * 0.35, sB * 0.22], torso: [0.05, -q * 0.3, -sB * 0.2], head: [0, q * 0.4, sB * 0.1],
    lArm: [0, 0, -0.25 - Math.max(0, sB) * 0.4], lFore: [-0.9, 0, -0.3],
    rArm: l3([0, 0, 0.25 + Math.max(0, -sB) * 0.4], [-1.3, 0, 0.9], hat), rFore: l3([-0.9, 0, 0.3], [-1.7, 0, 0.9], hat),
    lLeg: [0, q * 0.6, 0.02], rLeg: [0, q * 0.6, -0.02], lShin: 0.15, rShin: 0.15,
  };
}
function spinKick(inBar: number): Pose {
  // 0–2 quick turn · 2–3 high kick and hold · 4–6 second turn · 6–8 point + freeze
  const s1 = sm(inBar / 2), s2 = sm((inBar - 4) / 1.6);
  const spin = (1 - Math.pow(1 - s1, 3)) * Math.PI * 2 + (1 - Math.pow(1 - s2, 3)) * Math.PI * 2;
  const kick = sm((inBar - 2) / 0.35) * (1 - sm((inBar - 3.2) / 0.5));
  const point = sm((inBar - 6) / 0.5);
  return {
    ...REST, spin, hipsY: 0.9 - kick * 0.05, hips: [-kick * 0.15, 0, 0], torso: [kick * 0.15 - point * 0.1, point * 0.3, 0], head: [-kick * 0.2, point * 0.4, 0],
    lArm: [0, 0, -0.25 - kick * 1.6 - point * 0.3], rArm: [-point * 1.4, 0, 0.25 + kick * 1.6 + point * 0.4], lFore: [-kick * 0.3, 0, -0.1], rFore: [-point * 0.2, 0, 0.1],
    lLeg: [0, 0, 0.05], rLeg: [-kick * 1.75 - point * 0.35, 0, -0.05], lShin: 0.05, rShin: point * 0.9,
  };
}
function hatShow(b: number, inBar: number): Pose {
  // 0–2 brim down, head bowed (the opening) · 2–3 hat to hand, arm sweeps out · 3–5.4 toss, spin and catch · 5.4–8 tilt and point
  const sB = Math.sin(b * Math.PI);
  // brim flicked back to reveal the eyes — the brim-down open belongs to Billie Jean
  const bow = -(1 - sm((inBar - 1.6) / 0.6)) * 0.55;
  const toHand = sm((inBar - 2) / 0.4) * (1 - sm((inBar - 5.4) / 0.3));
  const sweep = sm((inBar - 2.3) / 0.7) * (1 - sm((inBar - 3) / 0.4));
  const up = sm((inBar - 3) / 0.4) * (1 - sm((inBar - 5.2) / 0.5));
  const point = sm((inBar - 5.8) / 0.6);
  const hatMode: 0 | 1 | 2 = inBar >= 3.1 && inBar < 5.4 ? 2 : inBar >= 2.2 && inBar < 3.1 ? 1 : 0;
  return {
    ...REST, hatTilt: bow + point * 0.35, hatMode,
    hipsY: 0.88 - bow * 0.03, hips: [bow * 0.1, point * 0.25, sB * 0.05 * (1 - bow)], torso: [bow * 0.35 - up * 0.1, -point * 0.2, -point * 0.15],
    head: [bow * 0.55 - up * 0.45 - point * 0.15, point * 0.35, 0],
    lArm: [bow * 0.15, 0, -0.18 - up * 0.6 - point * 0.3], lFore: [-bow * 0.2, 0, -0.1],
    rArm: [-toHand * 1.4 - up * 1.4 - point * 1.5, 0, 0.18 + sweep * 1.5 + up * 0.9 + point * 0.4],
    rFore: [-toHand * 1.5 + up * 1.2 - point * 0.1, 0, sweep * 0.5 + up * 0.5],
    lLeg: [0, 0, 0.06 + point * 0.25], rLeg: [-point * 0.3, 0, -0.06], lShin: 0.05, rShin: point * 0.9,
  };
}
function naatu(b: number): Pose {
  // RRR "Naatu Naatu" (Prem Rakshith): hop on one leg while the free leg takes four positions —
  // across the front, out to the side, back, front — with a head-and-foot swivel on the same curve,
  // arms pumping downward, shoulders rolling, travelling toward camera. Documented as single-level.
  const hop = Math.abs(Math.sin(b * Math.PI * 2));
  const step = Math.floor(b) % 4;
  const u = b - Math.floor(b);
  const e = sm(u);
  // free-leg abduction target per count: cross · side · back · front
  const zTo = [-0.55, 1.15, -0.1, 0.1][step];
  const zFrom = [0.1, -0.55, 1.15, -0.1][step];
  const xTo = [0.1, 0, 0.8, -0.85][step];
  const xFrom = [-0.85, 0.1, 0, 0.8][step];
  const z = l1(zFrom, zTo, e), x = l1(xFrom, xTo, e);
  const pump = Math.max(0, Math.sin(b * Math.PI)); // drives down on odd counts
  const roll = Math.sin(b * Math.PI) * 0.3;
  const swivel = Math.sin(b * Math.PI * 0.5);
  return {
    ...REST, hipsY: 0.86 + hop * 0.07, hips: [0.06, -swivel * 0.14, z * 0.1], torso: [0.09, swivel * 0.2, -roll],
    head: [0.04, swivel * 0.5, roll * 0.5],
    lArm: [pump * 0.55, 0, -0.4 - pump * 0.35], lFore: [-1.15 + pump * 0.5, 0, -0.3],
    rArm: [pump * 0.55, 0, 0.4 + pump * 0.35], rFore: [-1.15 + pump * 0.5, 0, 0.3],
    lLeg: [x, 0, 0.12 + z], rLeg: [-0.12, 0, -0.12], lShin: Math.max(0, -x) * 0.9, rShin: hop * 0.35,
  };
}
function bhangra(b: number): Pose {
  // shoulders bouncing, one arm up one arm bent, hopping with a raised knee, swapping every beat
  const hb = b * 2, hop = Math.abs(Math.sin(hb * Math.PI));
  const even = Math.floor(b) % 2 === 0, k = sm((b - Math.floor(b)) / 0.25);
  const sw = even ? 1 - k : k; // 1 = left arm up / right knee up
  return {
    ...REST, hipsY: 0.85 + hop * 0.14, hips: [0, (sw - 0.5) * 0.4, 0], torso: [-0.1, -(sw - 0.5) * 0.5, (sw - 0.5) * 0.25 + Math.sin(hb * Math.PI * 2) * 0.06],
    head: [-0.15, (sw - 0.5) * 0.5, -(sw - 0.5) * 0.3],
    lArm: [0, 0, l1(-0.4, -2.9, sw)], lFore: [0, 0, l1(-1.5, -0.2, sw)], rArm: [0, 0, l1(2.9, 0.4, sw)], rFore: [0, 0, l1(0.2, 1.5, sw)],
    lLeg: [-l1(1.2, 0, sw), 0, 0.15], rLeg: [-l1(0, 1.2, sw), 0, -0.15], lShin: l1(1.5, 0.15, sw), rShin: l1(0.15, 1.5, sw),
  };
}
function gangnam(b: number, inBar: number): Pose {
  // horse ride: wrists crossed low, knees bouncing, feet stepping side to side; lasso overhead in the second half
  const hb = b * 2, hop = Math.abs(Math.sin(hb * Math.PI));
  const sB = Math.sin(b * Math.PI);
  const lasso = sm((inBar - 4) / 0.5);
  const la = b * Math.PI * 2;
  return {
    ...REST, hipsY: 0.78 + hop * 0.08, hips: [0.1, 0, sB * 0.08], torso: [0.15, sB * 0.15, 0], head: [-0.05, -sB * 0.2, 0],
    lArm: [-0.9, 0, -0.25 + hop * 0.1], lFore: [-1.4, 0, 0.6],
    rArm: lasso ? [-2.6 + Math.sin(la) * 0.3, 0, 0.5 + Math.cos(la) * 0.4] : [-0.9, 0, 0.25 - hop * 0.1], rFore: lasso ? [-0.6, 0, 0.6] : [-1.4, 0, -0.6],
    lLeg: [-0.5, 0, 0.35 + Math.max(0, sB) * 0.3], rLeg: [-0.5, 0, -0.35 - Math.max(0, -sB) * 0.3], lShin: 1.0, rShin: 1.0,
  };
}
function classical(b: number): Pose {
  // aramandi: knees bent outward, feet stamping in double time; hands change mudra on the beat, head slides
  const hb = b * 2, stamp = Math.abs(Math.sin(hb * Math.PI));
  const even = Math.floor(b) % 2 === 0, k = sm((b - Math.floor(b)) / 0.3);
  const sw = even ? 1 - k : k;
  return {
    ...REST, hipsY: 0.72 + stamp * 0.02, hips: [0, 0, 0], torso: [-0.05, 0, (sw - 0.5) * 0.15], head: [0, 0, Math.sin(b * Math.PI) * 0.35],
    lArm: [0, 0, l1(-1.55, -2.5, sw)], lFore: [l1(0, -1.4, sw), 0, l1(0, -0.6, sw)], rArm: [0, 0, l1(2.5, 1.55, sw)], rFore: [l1(-1.4, 0, sw), 0, l1(0.6, 0, sw)],
    lLeg: [-0.4, 0, 0.6], rLeg: [-0.4 - (even ? stamp : 0) * 0.3, 0, -0.6], lShin: 1.15 + (even ? 0 : stamp * 0.3), rShin: 1.15,
  };
}
function salsa(b: number): Pose {
  // quick step forward and back with rolling hips and flowing arms
  const a = b * Math.PI, sB = Math.sin(a), q = Math.sin(a * 2);
  return {
    ...REST, hipsY: 0.87, hips: [0, sB * 0.25, q * 0.18], torso: [0.05, -sB * 0.35, -q * 0.15], head: [0, sB * 0.3, q * 0.08],
    lArm: [-0.4 - sB * 0.6, 0, -0.5 - Math.max(0, q) * 0.5], lFore: [-1.2 + sB * 0.4, 0, -0.4], rArm: [-0.4 + sB * 0.6, 0, 0.5 + Math.max(0, -q) * 0.5], rFore: [-1.2 - sB * 0.4, 0, 0.4],
    lLeg: [sB * 0.55, 0, 0.1], rLeg: [-sB * 0.55, 0, -0.1], lShin: Math.max(0, -sB) * 0.7, rShin: Math.max(0, sB) * 0.7,
  };
}
function backflip(inBar: number): Pose {
  // 0–2 build · 2–3 crouch · 3–4.6 flip · 4.6–8 land, arms out and hold
  const crouch = sm((inBar - 2) / 0.8) * (1 - sm((inBar - 3) / 0.25));
  const air = inBar >= 3 && inBar < 4.6 ? Math.sin(((inBar - 3) / 1.6) * Math.PI) : 0;
  const fl = THREE.MathUtils.clamp((inBar - 3) / 1.6, 0, 1);
  const flip = -(1 - Math.pow(1 - fl, 2)) * TAU * (fl > 0 ? 1 : 0);
  const land = sm((inBar - 4.6) / 0.6);
  const tuck = air;
  return {
    ...REST, rise: air * 1.5, lean: flip, hipsY: 0.9 - crouch * 0.35 - tuck * 0.15, hips: [crouch * 0.3, 0, 0], torso: [crouch * 0.4 + tuck * 0.5 - land * 0.05, 0, 0], head: [-crouch * 0.2 - tuck * 0.3, 0, 0],
    lArm: [-crouch * 0.6 - tuck * 1.6, 0, -0.2 - land * 1.4], rArm: [-crouch * 0.6 - tuck * 1.6, 0, 0.2 + land * 1.4], lFore: [-crouch * 0.6, 0, -0.1], rFore: [-crouch * 0.6, 0, 0.1],
    lLeg: [-crouch * 1.0 - tuck * 1.6, 0, 0.1 + land * 0.15], rLeg: [-crouch * 1.0 - tuck * 1.6, 0, -0.1 - land * 0.15], lShin: crouch * 1.6 + tuck * 2.0 + land * 0.15, rShin: crouch * 1.6 + tuck * 2.0 + land * 0.15,
  };
}
function srivalli(b: number): Pose {
  // Pushpa "Srivalli" (Jani Master, step idealised by Sukumar): a crouched walk that drags a slipper —
  // the foot never leaves the floor — under a left shoulder Pushpa keeps permanently hoisted. The
  // constant shoulder is a character posture, not an animated shrug.
  const c = b / 2, u = c - Math.floor(c);
  const left = Math.floor(c) % 2 === 0;
  const drag = sm(u / 0.72);
  const dragX = l1(0.32, -0.6, drag);
  const sw = left ? 1 : -1;
  const swing = Math.sin(c * Math.PI) * 0.35;
  return {
    ...REST, hipsY: 0.8,
    hips: [0.14, sw * 0.16 * drag, 0.14],
    torso: [0.16, -sw * 0.18 * drag, -0.2],
    head: [0.16, sw * 0.3 * drag, -0.1],
    lArm: [-swing * 0.5, 0, -0.42], lFore: [-0.5, 0, -0.18],
    rArm: [swing * 0.5, 0, 0.3], rFore: [-1.5, 0, 0.55],
    lLeg: left ? [dragX, 0, 0.09] : [0.12, 0, 0.09], rLeg: left ? [0.12, 0, -0.09] : [dragX, 0, -0.09],
    lShin: left ? 0.1 : 0.42, rShin: left ? 0.42 : 0.1,
  };
}
function buttaBomma(b: number): Pose {
  // Ala Vaikunthapurramuloo "Butta Bomma" (Jani Master): the rolling step is a sustained wrist twirl
  // with the head arriving on the beat — arm-led, quiet below the waist. No leg figure is documented.
  const c = b / 2, u = c - Math.floor(c);
  const outward = Math.floor(c) % 2 === 1;
  const twirl = (outward ? 1 - u : u) * Math.PI * 1.9;
  const sB = Math.sin(b * Math.PI);
  const tilt = Math.sin(c * Math.PI);
  return {
    ...REST, hipsY: 0.88, hips: [0, 0, -tilt * 0.12], torso: [-0.06, tilt * 0.12, tilt * 0.1],
    head: [-0.12 - tilt * 0.1, tilt * 0.3, tilt * 0.18],
    lArm: [-1.15, 0, -0.55], lFore: [-0.95, twirl, -0.35],
    rArm: [-1.15, 0, 0.55], rFore: [-0.95, -twirl, 0.35],
    lLeg: [sB * 0.16, 0, 0.1], rLeg: [-sB * 0.16, 0, -0.1], lShin: Math.max(0, sB) * 0.3, rShin: Math.max(0, -sB) * 0.3,
  };
}
function ramuloo(b: number): Pose {
  // Ala Vaikunthapurramuloo "Ramuloo Ramulaa" (Sekhar Master): the half-coat step, which Allu Arjun's
  // daughter nicknamed the dosa step — "you rotate the whole thing round like this, as if making a
  // dosa". So one flat horizontal circle drawn at waist height, the torso following the hand.
  const c = b / 4, turn = (c - Math.floor(c)) * TAU;
  const right = Math.floor(c) % 2 === 0;
  const sw = right ? 1 : -1;
  const reach = Math.sin(turn), side = Math.cos(turn);
  const sway = Math.sin(b * Math.PI) * 0.06;
  const sweepArm: V3 = [-1.15 - reach * 0.35, sw * side * 0.5, sw * (0.85 + side * 0.5)];
  const sweepFore: V3 = [-0.25, 0, sw * 0.15];
  const restArm: V3 = [0, 0, -sw * 0.85];
  const restFore: V3 = [-1.5, 0, -sw * 0.7];
  return {
    ...REST, hipsY: 0.86 + sway, hips: [0.08, sw * side * 0.18, 0], torso: [0.1, sw * side * 0.42, -sw * reach * 0.1],
    head: [0.12, sw * side * 0.55, 0],
    lArm: right ? restArm : sweepArm, lFore: right ? restFore : sweepFore,
    rArm: right ? sweepArm : restArm, rFore: right ? sweepFore : restFore,
    lLeg: [sway * 1.5, 0, 0.12], rLeg: [-sway * 1.5, 0, -0.12], lShin: 0.2, rShin: 0.2,
  };
}
function seetiMaar(bIn: number): Pose {
  const b = bIn * 2;
  // DJ "Seeti Maar" (Sekhar Master): the documented trick is balancing on the outer edge of one foot
  // while the upper body keeps isolating on top of it, then pivoting on that edge.
  const c = b / 2, u = c - Math.floor(c);
  const right = Math.floor(c) % 2 === 0;
  const roll = Math.sin(THREE.MathUtils.clamp(u / 0.75, 0, 1) * Math.PI);
  const snap = sm((u - 0.8) / 0.2);
  const iso = Math.sin(b * Math.PI * 2);
  const sw = right ? 1 : -1;
  const loaded: V3 = [0, sw * roll * 0.45, sw * roll * 0.55];
  const free: V3 = [-roll * 0.45, 0, -sw * (0.15 + roll * 0.35)];
  return {
    ...REST, spin: sw * roll * 0.6, hipsY: 0.87 - roll * 0.04,
    hips: [0.05, -sw * roll * 0.2, sw * roll * 0.14], torso: [0.08, sw * iso * 0.3, -sw * iso * 0.12],
    head: [0, -sw * iso * 0.25 + sw * roll * 0.2, 0],
    lArm: [-0.35 - Math.max(0, iso) * 0.5, 0, -0.5 - snap * 0.2], lFore: [-1.35, 0, -0.4],
    rArm: [-0.35 - Math.max(0, -iso) * 0.5, 0, 0.5 + snap * 0.2], rFore: [-1.35, 0, 0.4],
    lLeg: right ? loaded : free, rLeg: right ? free : loaded,
    lShin: right ? 0.12 : 0.5 + roll * 0.4, rShin: right ? 0.5 + roll * 0.4 : 0.12,
  };
}
function mindBlock(b: number): Pose {
  // salute with the glove, chest out, side steps with a hip pop
  const sB = Math.sin(b * Math.PI), pop = Math.max(0, Math.sin(b * Math.PI * 2)) * 0.15;
  return {
    ...REST, hipsY: 0.88, hips: [-pop, sB * 0.15, sB * 0.1], torso: [-0.15, -sB * 0.15, -sB * 0.1], head: [-0.1, sB * 0.3, 0],
    lArm: [0.3, 0, -0.35], lFore: [-0.2, 0, -0.1], rArm: [-0.55, 0, 1.5], rFore: [-2.3, 0, 1.05],
    lLeg: [0, 0, 0.06 + Math.max(0, sB) * 0.12], rLeg: [0, 0, -0.06 - Math.max(0, -sB) * 0.12], lShin: Math.max(0, sB) * 0.3, rShin: Math.max(0, -sB) * 0.3,
  };
}
/* "My Love Is Gone" (Arya 2) floor transition. Reviewers name the move a reverse worm, whose documented
   mechanics are a wave that travels section by section without skipping parts. He goes down flat, the wave
   runs chest -> hips -> legs three times while the body stays long, then he pushes back up. Kept long
   rather than folded: a folded silhouette reads as a ball from the hero camera, a long one reads as a worm. */
function aryaFloor(_b: number, inBar: number): Pose {
  const t8 = inBar;
  // 0-1 reach up · 1-2 plunge flat · 2-6.4 three waves · 6.4-7.4 push up · 7.4-8 hold
  const reach = Math.sin(THREE.MathUtils.clamp(t8 / 1, 0, 1) * Math.PI);
  const down = sm((t8 - 0.85) / 0.5);
  const up = sm((t8 - 6.4) / 0.55);
  const prone = down * (1 - up);
  const push = Math.sin(THREE.MathUtils.clamp((t8 - 6.4) / 1, 0, 1) * Math.PI);
  const pop = Math.sin(THREE.MathUtils.clamp((t8 - 7) / 1, 0, 1) * Math.PI);
  const w = THREE.MathUtils.clamp((t8 - 2) / 1.45, 0, 3) * Math.PI * 2;
  const active = prone * (t8 > 1.9 && t8 < 6.5 ? 1 : 0);
  // reverse worm: the legs lead and the head is the last segment to whip up
  const legWave = Math.sin(w) * active;
  const hipWave = Math.sin(w - 1.1) * active;
  const chest = Math.sin(w - 2.2) * active;
  const lean = prone * 1.34 + chest * 0.12 - pop * 0.22;
  const arm = -1.5 * prone - chest * 0.3 + -reach * 2.3 * (1 - prone);
  const fore = prone * (-0.3 - Math.max(0, chest) * 0.9) + (1 - prone) * (-reach * 0.5);
  return {
    ...REST,
    lean,
    rise: push * 0.12,
    hipsY: 0.9 - down * 0.04 + hipWave * 0.17 * prone + push * 0.04,
    hips: [hipWave * 0.2 * prone, 0, 0],
    torso: [chest * 0.26 * prone - pop * 0.3, 0, 0],
    head: [reach * 0.18 - prone * 0.12 - chest * 0.3 - pop * 0.25, 0, 0],
    lArm: [arm, 0, -0.22 - reach * 0.5 - pop * 1.5],
    rArm: [arm, 0, 0.22 + reach * 0.5 + pop * 1.5],
    lFore: [fore, 0, -0.12 - reach * 0.9],
    rFore: [fore, 0, 0.12 + reach * 0.9],
    lLeg: [prone * 0.1 - legWave * 0.22 - push * 0.9, 0, 0.06 + prone * 0.08],
    rLeg: [prone * 0.1 - legWave * 0.22 - push * 0.9, 0, -0.06 - prone * 0.08],
    lShin: prone * (0.12 + Math.max(0, legWave) * 0.8) + push * 1.5,
    rShin: prone * (0.12 + Math.max(0, -legWave) * 0.8) + push * 1.5,
  };
}
function jinthaak(b: number): Pose {
  // Telangana folk mass-number vocabulary, in the spirit of "Jinthaak" (Dhamaka, Ravi Teja): deep wide crouch, feet stamping alternately, arms swinging low across the body,
  // head snapping to the stamping side on every beat
  const hb = b * 2, stamp = Math.sin(hb * Math.PI);
  const left = Math.floor(b) % 2 === 0;
  const sw = left ? 1 : -1;
  const swing = Math.sin(b * Math.PI);
  return {
    ...REST, hipsY: 0.66 + Math.abs(stamp) * 0.05, hips: [0.2, sw * 0.22, sw * 0.12], torso: [0.3, -sw * 0.3, -sw * 0.14],
    head: [0.1, sw * 0.5, sw * 0.1],
    lArm: [-0.5 - swing * 0.5, 0, -0.9 + swing * 0.5], lFore: [-1.7, 0, -0.9 + swing * 0.4],
    rArm: [-0.5 + swing * 0.5, 0, 0.9 + swing * 0.5], rFore: [-1.7, 0, 0.9 + swing * 0.4],
    lLeg: [-Math.max(0, stamp) * 0.55, 0, 0.55], rLeg: [-Math.max(0, -stamp) * 0.55, 0, -0.55],
    lShin: 1.15 + Math.max(0, stamp) * 0.5, rShin: 1.15 + Math.max(0, -stamp) * 0.5,
  };
}
function kurchi(_b: number, inBar: number): Pose {
  // Guntur Kaaram "Kurchi Madathapetti" (Sekhar Master): the viral move is a gravity-defying chair
  // spin — a turn taken around a fixed contact point at low level with one leg sweeping wide.
  const reach = sm(inBar / 1.6);
  const spinP = THREE.MathUtils.clamp((inBar - 2) / 2.2, 0, 1);
  const spin = (1 - Math.pow(1 - spinP, 3)) * TAU;
  const land = sm((inBar - 4.6) / 0.6);
  const low = reach * (1 - land);
  const sweep = Math.sin(spinP * Math.PI);
  const snap = sm((inBar - 5.6) / 0.5);
  return {
    ...REST, spin, hipsY: l1(0.9, 0.7, low) + land * 0.14,
    hips: [low * 0.3, 0, -low * 0.28], torso: [low * 0.22 - snap * 0.12, low * 0.3, low * 0.2],
    head: [-low * 0.15 - snap * 0.15, low * 0.4 + snap * 0.3, 0],
    // the contact arm stays planted while the free arm counterbalances the sweep
    lArm: [-low * 1.3, 0, -0.2 - low * 0.5], lFore: [-low * 0.2, 0, -0.1],
    rArm: [-low * 0.4 - snap * 1.2, 0, 0.2 + low * 1.5], rFore: [-low * 0.5, 0, low * 0.6],
    lLeg: [-low * 0.55, 0, 0.1 + sweep * low * 1.25], rLeg: [-low * 0.9, 0, -0.1],
    lShin: low * 0.2, rShin: low * 1.5,
  };
}
function veena(b: number, inBar: number): Pose {
  // Chiranjeevi's cult signature (Indra 2002, reprised in Tagore 2003): he copies the seated posture of
  // a veena player, both arms locked on the imaginary instrument, and in the Tagore version the whole
  // low shape travels across frame while he break-dances.
  const sit = sm(inBar / 0.9);
  const pluck = Math.sin(b * Math.PI * 2);
  const slide = Math.sin(b * Math.PI * 0.5) * 0.35;
  const lift = sm((inBar - 6.8) / 0.6);
  const low = sit * (1 - lift);
  return {
    ...REST, hipsY: l1(0.9, 0.3, low), hips: [low * 0.18, low * 0.35, 0], torso: [-low * 0.12, low * 0.5, 0],
    head: [-low * 0.1 - lift * 0.2, low * 0.35, 0],
    // fretting hand high across the chest, plucking hand low across the lap
    lArm: [-low * 1.1, 0, -0.2 - low * 1.15], lFore: [-low * (1.15 + slide), 0, -0.2 - low * 0.5],
    rArm: [-low * 0.55, 0, 0.2 + low * 0.5], rFore: [-low * (1.6 + pluck * 0.22), 0, low * 0.75],
    lLeg: [-low * 1.35, 0, 0.12 + low * 0.75], rLeg: [-low * 1.35, 0, -0.12 - low * 0.75],
    lShin: low * 2.1, rShin: low * 2.1,
  };
}
function grinder(_b: number, inBar: number): Pose {
  // the floor helicopter (coffee grinder): down on one hand in a low crouch, one leg sweeping a full
  // circle while the tucked leg hops over it — two sweeps per bar, then a push back up
  const enter = sm(inBar / 0.8);
  const exit = sm((inBar - 6.4) / 0.8);
  const down = enter * (1 - exit);
  const turns = THREE.MathUtils.clamp((inBar - 0.8) / 5.4, 0, 1);
  const spin = turns * TAU * 2;
  const sweep = Math.sin(inBar * Math.PI * 0.74);
  const pop = Math.sin(THREE.MathUtils.clamp((inBar - 6.6) / 1.2, 0, 1) * Math.PI);
  return {
    ...REST, spin, hipsY: l1(0.9, 0.34, down), hips: [down * 0.95, 0, -down * 0.35], torso: [down * 0.3 - pop * 0.25, down * 0.5, down * 0.2],
    head: [-down * 0.35 - pop * 0.2, down * 0.4, 0],
    lArm: [-down * 1.35, 0, -0.2 - down * 0.35 - pop * 1.4], lFore: [-down * 0.15, 0, -0.1],
    rArm: [-down * 0.5, 0, 0.2 + down * 1.5 + pop * 1.4], rFore: [-down * 1.5, 0, down * 0.6],
    lLeg: [-down * 0.35, 0, 0.1 + down * (1.15 + sweep * 0.35)], rLeg: [-down * 1.25, 0, -0.1 - down * 0.25],
    lShin: down * 0.15, rShin: down * (1.85 + Math.max(0, -sweep) * 0.3),
  };
}
function topLesi(_b: number, inBar: number): Pose {
  // Iddarammayilatho "Top Lesi Poddi": a wave that carries him from standing onto his knees in one
  // continuous curve — the level change is the move, so the silhouette shrinks smoothly.
  const w = THREE.MathUtils.clamp(inBar / 5.4, 0, 1);
  const seg = (lag: number) => sm((w - lag) / 0.18);
  const head = seg(0), chest = seg(0.16), pelvis = seg(0.32), thigh = seg(0.48), shin = seg(0.62);
  const up = sm((inBar - 6.6) / 1.2);
  const k = 1 - up;
  return {
    ...REST, hipsY: l1(0.9, 0.32, pelvis * k),
    hips: [pelvis * k * 0.3, 0, 0],
    torso: [chest * k * 0.3 - head * k * 0.1, 0, 0],
    head: [head * k * 0.45 - up * 0.3, 0, 0],
    lArm: [-chest * k * 0.9, 0, -0.2 - chest * k * 0.5], rArm: [-chest * k * 0.9, 0, 0.2 + chest * k * 0.5],
    lFore: [-head * k * 0.5, 0, -0.1], rFore: [-head * k * 0.5, 0, 0.1],
    lLeg: [-thigh * k * 0.3, 0, 0.1 + thigh * k * 0.25], rLeg: [-thigh * k * 0.3, 0, -0.1 - thigh * k * 0.25],
    lShin: shin * k * 2.15, rShin: shin * k * 2.15,
  };
}
function blockbuster(b: number, inBar: number): Pose {
  // Sarrainodu "Blockbuster": a deep squat HELD while the upper body keeps working — the value is
  // the stillness of the hips against busy arms.
  const down = sm(inBar / 0.5) * (1 - sm((inBar - 7) / 0.5));
  const hit = Math.sin(b * Math.PI * 2);
  const alt = Math.sin(b * Math.PI);
  return {
    ...REST, hipsY: l1(0.9, 0.46, down),
    hips: [down * 0.12, alt * 0.16, 0], torso: [-down * 0.06, -alt * 0.2, hit * 0.08],
    head: [-down * 0.1, alt * 0.35, hit * 0.12],
    lArm: [-Math.max(0, hit) * 1.5, 0, -0.35 - Math.max(0, hit) * 0.9],
    rArm: [-Math.max(0, -hit) * 1.5, 0, 0.35 + Math.max(0, -hit) * 0.9],
    lFore: [-1.2 + Math.max(0, hit) * 1.0, 0, -0.25], rFore: [-1.2 + Math.max(0, -hit) * 1.0, 0, 0.25],
    lLeg: [-down * 1.35, 0, 0.12 + down * 0.7], rLeg: [-down * 1.35, 0, -0.12 - down * 0.7],
    lShin: down * 1.75, rShin: down * 1.75,
  };
}
function ringaRinga(b: number, inBar: number): Pose {
  // Arya 2 "Ringa Ringa": three registers in one number — standing, deep squat, then dancing while
  // lying on the floor. The footprint flips from a vertical bar to a horizontal one.
  const squat = sm((inBar - 3.4) / 0.5) * (1 - sm((inBar - 4.6) / 0.4));
  const down = sm((inBar - 4.6) / 0.7) * (1 - sm((inBar - 7) / 0.7));
  const hit = Math.sin(b * Math.PI * 2);
  const sB = Math.sin(b * Math.PI);
  const stand = 1 - Math.max(squat, down);
  return {
    ...REST, lean: down * 1.42,
    hipsY: 0.9 - squat * 0.42 - down * 0.5,
    hips: [squat * 0.15 + down * 0.1, sB * 0.2 * stand + down * sB * 0.25, down * hit * 0.2],
    torso: [-squat * 0.05 - down * 0.1, -sB * 0.2 * stand, -down * hit * 0.2],
    head: [-squat * 0.1 - down * 0.2, sB * 0.3 * stand, 0],
    lArm: [-Math.max(0, hit) * 1.2 - down * 1.3, 0, -0.3 - stand * Math.max(0, sB) * 0.7],
    rArm: [-Math.max(0, -hit) * 1.2 - down * 1.3, 0, 0.3 + stand * Math.max(0, -sB) * 0.7],
    lFore: [-0.9 - down * 0.3, 0, -0.2], rFore: [-0.9 - down * 0.3, 0, 0.2],
    lLeg: [-squat * 1.3 + down * (0.1 - Math.max(0, hit) * 0.9), 0, 0.12 + squat * 0.7],
    rLeg: [-squat * 1.3 + down * (0.1 - Math.max(0, -hit) * 0.9), 0, -0.12 - squat * 0.7],
    lShin: squat * 1.7 + down * Math.max(0, hit) * 1.4, rShin: squat * 1.7 + down * Math.max(0, -hit) * 1.4,
  };
}
function suspenders(b: number): Pose {
  // RRR's separate "suspender section": the tempo contrast is the whole point — they tug the
  // suspenders in slow motion while the feet shuffle sideways at lightning speed.
  const tug = Math.sin(b * Math.PI * 0.25); // one full tug per four counts
  const shuffle = Math.sin(b * Math.PI * 8); // feet at 4x the beat
  const lift = Math.abs(shuffle);
  return {
    ...REST, hipsY: 0.87 + lift * 0.02, hips: [0.04, 0, shuffle * 0.05], torso: [0.02, 0, 0], head: [0, 0, 0],
    // hands gripping at the chest, pulling outward and releasing
    lArm: [-1.05, 0, -0.5 - Math.max(0, tug) * 0.55], lFore: [-1.55, 0, -0.35 - Math.max(0, tug) * 0.3],
    rArm: [-1.05, 0, 0.5 + Math.max(0, tug) * 0.55], rFore: [-1.55, 0, 0.35 + Math.max(0, tug) * 0.3],
    lLeg: [0, 0, 0.1 + Math.max(0, shuffle) * 0.3], rLeg: [0, 0, -0.1 - Math.max(0, -shuffle) * 0.3],
    lShin: Math.max(0, shuffle) * 0.55, rShin: Math.max(0, -shuffle) * 0.55,
  };
}
function circleGlide(b: number, inBar: number): Pose {
  // one of Jackson's documented signatures: sliding in circles on shifting weight so he appears
  // to float. Almost pure glide-plus-spin, which is exactly what a blocky rig can sell.
  const sB = Math.sin(b * Math.PI);
  return {
    ...REST, spin: (inBar / 8) * TAU, hipsY: 0.88 + Math.abs(sB) * 0.02,
    hips: [0.05, 0, sB * 0.1], torso: [0.05, -sB * 0.12, -sB * 0.1], head: [0, sB * 0.2, 0],
    lArm: [-sB * 0.3, 0, -0.42], lFore: [-0.75, 0, -0.25], rArm: [sB * 0.3, 0, 0.42], rFore: [-0.75, 0, 0.25],
    // weight shifts foot to foot without either leaving the floor
    lLeg: [sB * 0.3, 0, 0.08], rLeg: [-sB * 0.3, 0, -0.08],
    lShin: Math.max(0, -sB) * 0.5, rShin: Math.max(0, sB) * 0.5,
  };
}
function headRoll(b: number, inBar: number): Pose {
  // the rhythmic punctuation mark — a head roll over a held stance, used before a big hit
  const roll = b * Math.PI;
  const hit = sm((inBar - 6.4) / 0.3);
  return {
    ...REST, hipsY: 0.88 - hit * 0.04,
    hips: [0.04, 0, 0], torso: [Math.sin(roll) * 0.08, Math.cos(roll) * 0.12, Math.sin(roll) * 0.06],
    head: [Math.sin(roll) * 0.42, Math.cos(roll) * 0.55, Math.sin(roll + 1) * 0.3],
    lArm: [0, 0, -0.35 - hit * 1.2], rArm: [0, 0, 0.35 + hit * 1.2],
    lFore: [-0.9 + hit * 0.7, 0, -0.2], rFore: [-0.9 + hit * 0.7, 0, 0.2],
    lLeg: [0, 0, 0.14], rLeg: [0, 0, -0.14], lShin: 0.1, rShin: 0.1,
  };
}
function thrillerWalk(_b: number, inBar: number): Pose {
  // the phrase everyone recognises: "walk R/L/R/L, take-it-back R/L/R/L" — four forward, four back,
  // in the claw hold. Given two bars, per the script's emphasis.
  const step = Math.floor(inBar);
  const u = inBar - step;
  const back = step >= 4;
  const sw = step % 2 === 0 ? 1 : -1;
  const swing = Math.sin(u * Math.PI);
  const dir = back ? -1 : 1;
  return {
    ...REST, hipsY: 0.86 + swing * 0.03,
    hips: [0.08, sw * 0.12, 0], torso: [0.16, -sw * 0.14, 0], head: [0.22, sw * 0.2, sw * 0.08],
    // zombie claw: forearms up and out, fingers spread — held for the whole phrase
    lArm: [-1.35, 0, -0.4], lFore: [1.3, 0, -0.1],
    rArm: [-1.35, 0, 0.4], rFore: [1.3, 0, 0.1],
    lLeg: [sw > 0 ? -dir * swing * 0.6 : dir * swing * 0.25, 0, 0.1],
    rLeg: [sw > 0 ? dir * swing * 0.25 : -dir * swing * 0.6, 0, -0.1],
    lShin: sw > 0 ? swing * 0.5 : 0.15, rShin: sw > 0 ? 0.15 : swing * 0.5,
  };
}
function golimaar(_b: number, inBar: number): Pose {
  // Donga's "Golimaar" recreated Thriller's choreography, so its rise-from-the-grave gives a
  // documented floor-to-standing level change: crawl, knees under, rise, then the zombie freeze.
  const crawl = sm(inBar / 3.4);
  const knees = sm((inBar - 3) / 1.6);
  const up = sm((inBar - 4.6) / 1.6);
  const claw = sm((inBar - 6.2) / 0.9);
  const reach = Math.sin(THREE.MathUtils.clamp(inBar / 3.4, 0, 1) * Math.PI * 2);
  const lean = (1 - up) * 1.15;
  return {
    ...REST, lean,
    hipsY: l1(0.12, 0.9, Math.max(crawl * 0.35, Math.max(knees * 0.6, up))),
    hips: [(1 - up) * 0.3, 0, 0], torso: [(1 - up) * 0.25 - claw * 0.1, 0, 0],
    head: [-(1 - up) * 0.2 - claw * 0.15, 0, 0],
    lArm: [-1.3 - Math.max(0, reach) * 0.4 + claw * 0.05, 0, -0.25 - claw * 0.2],
    rArm: [-1.3 - Math.max(0, -reach) * 0.4 + claw * 0.05, 0, 0.25 + claw * 0.2],
    lFore: [claw * 1.4, 0, -0.1], rFore: [claw * 1.4, 0, 0.1],
    lLeg: [-knees * 0.9 + up * 0.75, 0, 0.1], rLeg: [-knees * 0.9 + up * 0.75, 0, -0.1],
    lShin: knees * 1.9 * (1 - up), rShin: knees * 1.9 * (1 - up),
  };
}
function seatedTravel(b: number, inBar: number): Pose {
  // Race Gurram "Cinema Choopistha Mava": a whole passage held at roughly seated height while the
  // arms and torso work at full amplitude — small and fast, which contrasts with everything else.
  const down = sm(inBar / 0.6) * (1 - sm((inBar - 7.2) / 0.6));
  const drive = Math.sin(b * Math.PI * 2);
  const twist = Math.sin(b * Math.PI * 0.5);
  const sweep = sm((inBar - 4) / 0.6) * (1 - sm((inBar - 6) / 0.5));
  return {
    ...REST, spin: sm((inBar - 6) / 1) * Math.PI,
    hipsY: l1(0.9, 0.5, down),
    hips: [down * 0.35, twist * 0.45 * down, 0], torso: [down * 0.15, -twist * 0.35 * down, drive * 0.1],
    head: [-down * 0.2, twist * 0.4, 0],
    lArm: [-down * 0.5 - Math.max(0, drive) * 0.6, 0, -0.3 - sweep * 1.2], lFore: [-1.1 + sweep * 0.9, 0, -0.2],
    rArm: [-down * 0.5 - Math.max(0, -drive) * 0.6, 0, 0.3 + sweep * 1.2], rFore: [-1.1 + sweep * 0.9, 0, 0.2],
    lLeg: [-down * (1.1 + Math.max(0, drive) * 0.35), 0, 0.12 + down * 0.5],
    rLeg: [-down * (1.1 + Math.max(0, -drive) * 0.35), 0, -0.12 - down * 0.5],
    lShin: down * 1.65, rShin: down * 1.65,
  };
}
function wellRim(b: number): Pose {
  // Sagara Sangamam's drunken rain dance on the rim of a well: the lean oscillates and the recovery
  // is always a beat late, so the balance never quite settles. That lateness is the drunkenness.
  const sway = Math.sin(b * Math.PI * 0.5);
  const late = Math.sin((b - 1) * Math.PI * 0.5);
  const stumble = Math.max(0, Math.sin(b * Math.PI * 0.25)) ** 4;
  return {
    ...REST, lean: late * 0.3 + stumble * 0.2,
    hipsY: 0.88 - stumble * 0.14,
    hips: [stumble * 0.3, sway * 0.25, late * 0.3],
    torso: [-late * 0.15, -sway * 0.2, -late * 0.35],
    head: [-late * 0.2, sway * 0.35, -late * 0.25],
    lArm: [-sway * 0.5, 0, -0.9 - stumble * 0.9], lFore: [-0.5, 0, -0.35],
    rArm: [sway * 0.5, 0, 0.9 + stumble * 0.9], rFore: [-0.5, 0, 0.35],
    lLeg: [-stumble * 0.5, 0, 0.1 + Math.max(0, sway) * 0.25],
    rLeg: [-stumble * 0.5, 0, -0.1 - Math.max(0, -sway) * 0.25],
    lShin: stumble * 0.9 + Math.max(0, sway) * 0.3, rShin: stumble * 0.9 + Math.max(0, -sway) * 0.3,
  };
}
function tarangam(b: number, inBar: number): Pose {
  // Kuchipudi tarangam: dancing on the raised rim of a brass plate, dragging it forward, back and
  // in a circle, with the head locked level throughout — the still head is what the eye measures
  // every other channel against.
  const settle = sm(inBar / 1);
  const beat = Math.sin(b * Math.PI * 2);
  const hop = inBar > 5.6 ? Math.max(0, Math.sin((inBar - 5.6) * Math.PI * 1.4)) : 0;
  const turn = sm((inBar - 3.6) / 1.6) - sm((inBar - 5.4) / 1);
  return {
    ...REST, spin: turn * 0.8, rise: hop * 0.1,
    hipsY: 0.9 - settle * 0.06,
    hips: [0.04, turn * 0.3, 0], torso: [-0.02, -turn * 0.2, 0],
    head: [0, 0, 0], // locked level: a pot of water rides here
    lArm: [0, 0, -1.5], lFore: [-0.9, 0, -0.55],
    rArm: [0, 0, 1.5], rFore: [-0.9, 0, 0.55],
    // both feet balanced on the rim; one beats the rhythm while the other holds
    lLeg: [-Math.max(0, beat) * 0.18, 0, 0.06], rLeg: [-Math.max(0, -beat) * 0.18, 0, -0.06],
    lShin: Math.max(0, beat) * 0.3 + hop * 0.4, rShin: Math.max(0, -beat) * 0.3 + hop * 0.4,
  };
}
function hipThrust(b: number): Pose {
  // documented as synced to a snare or a heavy bass hit, so it snaps on the beat and recovers
  const hit = Math.max(0, Math.sin(b * Math.PI)) ** 3;
  const back = Math.max(0, -Math.sin(b * Math.PI)) ** 3;
  return {
    ...REST, hipsY: 0.88 - hit * 0.05,
    hips: [-hit * 0.5 + back * 0.3, 0, 0], torso: [hit * 0.3 - back * 0.18, 0, 0], head: [-hit * 0.2, 0, 0],
    lArm: [0, 0, -0.32 - hit * 0.3], lFore: [-0.55, 0, -0.3],
    rArm: [0, 0, 0.32 + hit * 0.3], rFore: [-0.55, 0, 0.3],
    lLeg: [-hit * 0.1, 0, 0.16], rLeg: [-hit * 0.1, 0, -0.16], lShin: hit * 0.25, rShin: hit * 0.25,
  };
}
function hipRoll(b: number): Pose {
  const a = b * Math.PI;
  return {
    ...REST, hipsY: 0.87, hips: [Math.sin(a) * 0.22, 0, Math.cos(a) * 0.22], torso: [-Math.sin(a) * 0.15, 0, -Math.cos(a) * 0.15], head: [Math.sin(a) * 0.1, 0, Math.cos(a) * 0.1],
    lArm: [0, 0, -2.4 - Math.cos(a) * 0.3], rArm: [0, 0, 2.4 - Math.cos(a) * 0.3], lFore: [0, 0, -0.5], rFore: [0, 0, 0.5],
    lLeg: [-0.2, 0, 0.3], rLeg: [-0.2, 0, -0.3], lShin: 0.5, rShin: 0.5,
  };
}
type Move = { pose: (b: number, inBar: number) => Pose; from: number; to: number; stepped?: boolean; sparks?: boolean; side?: [number, number]; hat?: boolean; snap?: boolean; face?: number; floor?: boolean };
const MOVES: Move[] = [
  // the show opens with the Arya 2 floor transition, then the Naatu Naatu hook step
  { pose: (b, i) => aryaFloor(b, i), from: -0.6, to: -1.6, sparks: true, face: -1.25, floor: true },
  { pose: (b, i) => aryaFloor(b, i), from: -1.6, to: -2.6, sparks: true, face: -1.25, floor: true },
  { pose: (b) => naatu(b), from: -1.6, to: 0.4 },
  { pose: (b) => naatu(b), from: 0.4, to: 1.4 },
  // the suspender section travels purely sideways
  { pose: (b) => suspenders(b), from: 1.4, to: 1.4, side: [0, 1.5] },
  { pose: (b) => srivalli(b), from: -1.6, to: 0.6, side: [1.5, 0] },
  { pose: (b) => buttaBomma(b), from: 0.6, to: 0.6 },
  { pose: (b) => ramuloo(b), from: 0.6, to: -1.6, side: [0, 1.0] },
  { pose: (b) => seetiMaar(b), from: -1.6, to: -1.6, side: [1.0, 0] },
  { pose: (b) => jinthaak(b), from: -1.6, to: -0.6 },
  { pose: (_b, i) => grinder(_b, i), from: -0.6, to: -1.6, sparks: true, face: -1.1, floor: true },
  { pose: (b, i) => billieJean(b, i), from: -1.6, to: 1.6 },
  { pose: (b) => moonwalk(b), from: 1.6, to: 0, stepped: true },
  { pose: (b) => moonwalk(b), from: 0, to: -1.6, stepped: true },
  { pose: (_b, i) => theLean(i), from: -1.6, to: -1.6 },
  { pose: (_b, i) => spinToes(i), from: -1.6, to: -1.6, sparks: true },
  { pose: (b, i) => hatShow(b, i), from: -1.6, to: -1.6, hat: true },
  { pose: (b) => sideGlide(b), from: -1.6, to: -1.6, side: [0, 1.4] },
  { pose: (b) => robot(b), from: -1.6, to: -1.6, side: [1.4, 1.4], snap: true },
  { pose: (b, i) => heelToe(b, i), from: -1.6, to: -1.6, side: [1.4, 0] },
  { pose: (b) => thriller(b), from: -1.6, to: -1.6 },
  { pose: (b, i) => kickPose(b, i), from: -1.6, to: -1.6 },
  { pose: (_b, i) => spinKick(i), from: -1.6, to: -1.6, sparks: true },
  { pose: (b, i) => hatShow(b, i), from: -1.6, to: -1.6, hat: true },
  { pose: (_b, i) => topLesi(_b, i), from: -1.6, to: -1.6 },
  { pose: (b, i) => blockbuster(b, i), from: -1.6, to: -1.6 },
  { pose: (b, i) => ringaRinga(b, i), from: -1.6, to: -1.6, face: -1.15, floor: true, sparks: true },
  { pose: (_b, i) => golimaar(_b, i), from: -1.6, to: -1.6, face: -1.15, floor: true },
  { pose: (b, i) => seatedTravel(b, i), from: -1.6, to: 0.6 },
  { pose: (b) => wellRim(b), from: 0.6, to: -1.6, side: [0, -1.0] },
  { pose: (b, i) => tarangam(b, i), from: -1.6, to: -1.6, side: [-1.0, 0] },
  { pose: (b, i) => shimmy(b, i), from: -1.6, to: -0.8 },
  { pose: (b) => hipRoll(b), from: -0.8, to: -0.8 },
  { pose: (b) => hipThrust(b), from: -0.8, to: -0.8 },
  { pose: (b, i) => spinGlide(b, i), from: -0.8, to: -1.6, stepped: true, sparks: true },
  { pose: (_b, i) => kneeDrop(i), from: -1.6, to: -1.6, sparks: true },
  { pose: (_b, i) => thrillerWalk(_b, i), from: -1.6, to: 0.4 },
  { pose: (_b, i) => thrillerWalk(_b, i), from: 0.4, to: -1.6 },
  { pose: (b, i) => circleGlide(b, i), from: -1.6, to: -1.6, side: [0, 1.2] },
  { pose: (b, i) => headRoll(b, i), from: -1.6, to: -1.6, side: [1.2, 0] },
  { pose: (b) => bhangra(b), from: -1.6, to: -1.6, side: [0, 1.0] },
  { pose: (b, i) => gangnam(b, i), from: -1.6, to: -1.6, side: [1.0, -1.0] },
  { pose: (b) => classical(b), from: -1.6, to: -1.6, side: [-1.0, 0] },
  { pose: (b, i) => kurchi(b, i), from: -1.6, to: -1.6, side: [0, 0.9] },
  // the Tagore version of the veena step travels sideways at floor level
  { pose: (b, i) => veena(b, i), from: -1.6, to: -1.6, side: [0.9, -0.9] },
  { pose: (b) => mindBlock(b), from: -1.6, to: -1.6, side: [0, -0.8] },
  { pose: (b) => salsa(b), from: -1.6, to: -0.6, side: [-0.8, 0] },
  { pose: (_b, i) => backflip(i), from: -0.6, to: -1.6, sparks: true },
];
const moveAt = (i: number) => MOVES[((i % MOVES.length) + MOVES.length) % MOVES.length];
function movePose(move: number, b: number, inBar: number): Pose {
  return moveAt(move).pose(b, inBar);
}
// forward glide along the facing direction: walks forward during Billie Jean, slides back beat by beat in the moonwalk
function glide(move: number, inBar: number): [number, number] {
  const m = moveAt(move);
  const u = inBar / 8;
  const e = m.stepped ? (Math.floor(u * 8) + sm(u * 8 - Math.floor(u * 8))) / 8 : sm(u);
  const side = m.side ? m.side[0] + (m.side[1] - m.side[0]) * e : moveAt(move - 1).side?.[1] ?? 0;
  return [m.from + (m.to - m.from) * e, side];
}
/* Outfits: swapped every bar with a flash. */
type Outfit = { jacket: string; jacketMetal: number; jacketRough: number; pants: string; shirt: string; tie: string | null; hat: string; band: string; accent: string; sequin?: boolean };
const OUTFITS: Outfit[] = [
  // black tux, red tie, black fedora with a gold band
  { jacket: "#111116", jacketMetal: 0.5, jacketRough: 0.35, pants: "#111116", shirt: "#fbf7ef", tie: "#8a0f1e", hat: "#0a0a0c", band: "#f3b453", accent: "#f3b453" },
  // white suit, blue shirt, white fedora
  { jacket: "#f4f1ea", jacketMetal: 0.2, jacketRough: 0.5, pants: "#f4f1ea", shirt: "#4f8ff7", tie: "#f4f1ea", hat: "#f4f1ea", band: "#111116", accent: "#111116" },
  // red leather with silver zips, black fedora
  { jacket: "#b3111c", jacketMetal: 0.35, jacketRough: 0.4, pants: "#111116", shirt: "#111116", tie: null, hat: "#0a0a0c", band: "#b3111c", accent: "#d9d9e0" },
  // black sequin, silver band
  { jacket: "#0a0a0c", jacketMetal: 0.95, jacketRough: 0.18, pants: "#0a0a0c", shirt: "#0a0a0c", tie: null, hat: "#0a0a0c", band: "#e6e6ec", accent: "#e6e6ec", sequin: true },
  // gold military jacket, black trousers
  { jacket: "#c9a227", jacketMetal: 0.85, jacketRough: 0.28, pants: "#111116", shirt: "#fbf7ef", tie: "#111116", hat: "#0a0a0c", band: "#c9a227", accent: "#111116" },
  // royal blue, white fedora
  { jacket: "#1e40af", jacketMetal: 0.4, jacketRough: 0.4, pants: "#111116", shirt: "#fbf7ef", tie: "#1e40af", hat: "#f4f1ea", band: "#1e40af", accent: "#f3b453" },
  // silver sequin, black fedora
  { jacket: "#e6e6ec", jacketMetal: 0.95, jacketRough: 0.2, pants: "#111116", shirt: "#111116", tie: null, hat: "#0a0a0c", band: "#e6e6ec", accent: "#f3b453", sequin: true },
  // teal, amber tie
  { jacket: "#0f766e", jacketMetal: 0.5, jacketRough: 0.35, pants: "#0a0a0c", shirt: "#fbf7ef", tie: "#f3b453", hat: "#0f766e", band: "#f3b453", accent: "#f3b453" },
];
const mkMat = (color: string, metalness: number, roughness: number) => new THREE.MeshStandardMaterial({ color, metalness, roughness, emissive: new THREE.Color("#000000"), emissiveIntensity: 0 });
// one dancer per page: shared wardrobe materials, retuned every frame
const wardrobe = {
  jacket: mkMat("#111116", 0.5, 0.35), pants: mkMat("#111116", 0.5, 0.35), shirt: mkMat("#fbf7ef", 0.1, 0.6),
  tie: mkMat("#8a0f1e", 0.2, 0.5), hat: mkMat("#0a0a0c", 0.3, 0.5), band: mkMat("#f3b453", 0.3, 0.4), accent: mkMat("#f3b453", 0.8, 0.3),
  tmp: new THREE.Color(),
};
/* Confetti burst: one shared pool, re-armed on costume changes and big landings. */
const BURST_N = 160;
class Burst {
  pos = new Float32Array(BURST_N * 3);
  vel = new Float32Array(BURST_N * 3);
  age = 99;
  geo = new THREE.BufferGeometry();
  mat = new THREE.PointsMaterial({ color: "#ffd9a0", size: 0.09, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  constructor() {
    this.geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
  }
  fire(x: number, y: number, z: number, power: number, up: number) {
    for (let i = 0; i < BURST_N; i++) {
      const a = Math.random() * TAU, r = Math.random();
      this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
      this.vel[i * 3] = Math.cos(a) * r * power;
      this.vel[i * 3 + 1] = (0.6 + Math.random() * 1.6) * up;
      this.vel[i * 3 + 2] = Math.sin(a) * r * power;
    }
    this.age = 0;
    this.mat.visible = true;
    this.geo.attributes.position.needsUpdate = true;
  }
  step(dt: number) {
    if (this.age > 2.2) {
      this.mat.opacity = 0;
      this.mat.visible = false;
      return;
    }
    this.mat.visible = true;
    this.age += dt;
    for (let i = 0; i < BURST_N; i++) {
      this.vel[i * 3 + 1] -= 3.2 * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      if (this.pos[i * 3 + 1] < 0.02) { this.pos[i * 3 + 1] = 0.02; this.vel[i * 3 + 1] *= -0.3; }
    }
    this.geo.attributes.position.needsUpdate = true;
    this.mat.opacity = Math.max(0, 1 - this.age / 2.2);
    this.mat.size = 0.05 + (1 - Math.min(1, this.age / 2.2)) * 0.07;
  }
}
const bursts = [new Burst(), new Burst()];
/* Stage beams: cones aimed at the dancer, swaying. */
const beamGeo = new THREE.ConeGeometry(0.85, 9, 24, 1, true).translate(0, -4.5, 0);
const beamDown = new THREE.Vector3(0, -1, 0);
const beamTmp = new THREE.Vector3();
const beamQ = new THREE.Quaternion();
const BEAMS = [
  { pos: [-4.5, 8, 2] as V3, color: "#f3b453", phase: 0 },
  { pos: [4.8, 8.5, 1] as V3, color: "#fff1d6", phase: 2.1 },
  { pos: [0.5, 9, -4.5] as V3, color: "#ffb86b", phase: 4.2 },
];
const setE = (g: THREE.Group | null, e: V3) => { if (g) g.rotation.set(e[0], e[1], e[2]); };
function Part({ size, pos, color = SUIT, glow = 0, emissive = GLOW, rough = 0.35, metal = 0.5, mat }: { size: V3; pos: V3; color?: string; glow?: number; emissive?: string; rough?: number; metal?: number; mat?: THREE.Material }) {
  return (
    <mesh position={pos} castShadow>
      <boxGeometry args={size} />
      {mat ? <primitive object={mat} attach="material" /> : <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={glow} roughness={rough} metalness={metal} />}
    </mesh>
  );
}
function Limb({ len, w, tip, mat, children }: { len: number; w: number; tip?: "hand" | "glove" | "shoe"; mat?: THREE.Material; children?: React.ReactNode }) {
  return (
    <>
      <Part size={[w, len, w]} pos={[0, -len / 2, 0]} mat={mat} />
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
function Dancer({ stateRef, dancerRef, onStomp, frozen }: { stateRef: MutableRefObject<HeroState>; dancerRef: MutableRefObject<{ x: number; z: number; foot: number; flat: number }>; onStomp: (x: number, z: number, a: number) => void; frozen?: { move: number; inBar: number } }) {
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
  const pool = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const lastStep = useRef(-1);
  const lastBar = useRef(-1);
  const stompAt = useRef(-10);
  const airborne = useRef(false);
  const sparks = useRef<THREE.Group>(null);
  const hat = useRef<THREE.Group>(null);
  const handHat = useRef<THREE.Group>(null);
  const flyHat = useRef<THREE.Group>(null);
  const tie = useRef<THREE.Mesh>(null);
  const beams = useRef<THREE.Group>(null);
  const outfitAt = useRef(-10);
  const lastOutfit = useRef(-1);
  const bornRef = useRef<number | null>(null);
  const smooth = useRef<Pose>({ ...REST });
  const trailMesh = useRef<THREE.Object3D>(null);
  const appearedAt = useRef<number | null>(null);
  const flyState = useRef({ x: 0, y: 0, z: 0, rot: 0 });
  const clock = useSceneClock();

  useFrame((state, dt) => {
    const t = clock(dt);
    if (bornRef.current === null) bornRef.current = t;
    const age = t - (bornRef.current ?? t);
    const g = root.current;
    if (!g) return;
    const bpm = 62;
    // the routine starts once he has appeared, so the opener isn't missed
    const bRun = Math.max(0, age - 2.4) * (bpm / 60);
    const b = frozen ? frozen.move * 8 + frozen.inBar : bRun;
    const bar = frozen ? frozen.move : Math.floor(b / 8);
    const inBar = frozen ? frozen.inBar : b - bar * 8;
    const cur = movePose(bar, b, inBar);
    const m = inBar > 7.4 ? sm((inBar - 7.4) / 0.6) : 0;
    const target = m > 0 ? mixPose(cur, movePose(bar + 1, b, 0), m) : cur;
    // grace: every joint eases toward its target; the robot keeps its snap
    const rate = moveAt(bar).snap ? 40 : 13;
    const P = frozen ? target : mixPose(smooth.current, target, 1 - Math.exp(-dt * rate));
    P.hatMode = target.hatMode;
    smooth.current = P;
    const sB = Math.sin(b * Math.PI);
    const bounce = Math.abs(sB);

    // stage position: slow drift around the centre, facing the viewer, plus the walk/moonwalk glide
    const mv = moveAt(bar);
    const heading = (frozen ? 0.5 : 0.72 + Math.sin(t * 0.21) * 0.3) + (mv.face ?? 0);
    const [gl, gs] = glide(bar, inBar);
    const cx = Math.sin(t * 0.11) * 0.8;
    const cz = Math.cos(t * 0.09) * 0.7;
    const x = frozen ? 0 : cx + Math.sin(heading) * gl + Math.cos(heading) * gs;
    const z = frozen ? 0 : cz + Math.cos(heading) * gl - Math.sin(heading) * gs;
    const d = dancerRef.current;
    d.x = x;
    d.z = z;
    d.flat = THREE.MathUtils.damp(d.flat, mv.floor ? 1 : 0, 5, dt);
    const s = stateRef.current;
    const appear = frozen ? 1 : THREE.MathUtils.clamp((age - 1.4) / 1.2, 0, 1);
    const fade = 1 - THREE.MathUtils.clamp((s.spread - 0.15) / 0.5, 0, 1);
    const sc = appear * fade;

    // waves: a light stomp every two beats, a big one at every bar change
    const stepIdx = Math.floor(b / 2);
    if (sc > 0.5 && stepIdx !== lastStep.current) {
      lastStep.current = stepIdx;
      onStomp(x, z, 0.3);
    }
    if (bar !== lastBar.current) {
      if (lastBar.current >= 0 && sc > 0.5) {
        onStomp(x, z, 1.2);
        stompAt.current = t;
        bursts[0].fire(x, d.foot + 2.4, z, 1.6, 1.0);
      }
      lastBar.current = bar;
    }
    // jump landings hit harder than stomps
    if (P.rise > 0.3) airborne.current = true;
    else if (airborne.current && P.rise < 0.06) {
      airborne.current = false;
      stompAt.current = t;
      if (sc > 0.5) {
        onStomp(x, z, 1.8);
        bursts[1].fire(x, d.foot + 0.1, z, 3.2, 2.2);
        s.energy = 1;
      }
    }
    for (const bu of bursts) bu.step(dt);
    if (sparks.current) sparks.current.visible = !!moveAt(bar).sparks || P.spin > 0.2;
    // the trail portals to the scene root; keep it hidden until its buffer has caught up with the glove
    if (sc > 0.95 && appearedAt.current === null) appearedAt.current = t;
    if (sc < 0.5) appearedAt.current = null;
    if (trailMesh.current) trailMesh.current.visible = appearedAt.current !== null && t - appearedAt.current > 0.9;

    // wardrobe: a new outfit every bar, colours morph in with a flash
    const o = OUTFITS[bar % OUTFITS.length];
    const w = wardrobe;
    const kf = 1 - Math.exp(-dt * 7);
    w.jacket.color.lerp(w.tmp.set(o.jacket), kf);
    w.jacket.metalness = l1(w.jacket.metalness, o.jacketMetal, kf);
    w.jacket.roughness = l1(w.jacket.roughness, o.jacketRough, kf);
    w.pants.color.lerp(w.tmp.set(o.pants), kf);
    w.shirt.color.lerp(w.tmp.set(o.shirt), kf);
    if (o.tie) w.tie.color.lerp(w.tmp.set(o.tie), kf);
    w.hat.color.lerp(w.tmp.set(o.hat), kf);
    w.band.color.lerp(w.tmp.set(o.band), kf);
    w.accent.color.lerp(w.tmp.set(o.accent), kf);
    if (bar !== lastOutfit.current) { lastOutfit.current = bar; outfitAt.current = t; }
    const flash = Math.max(0, 1 - (t - outfitAt.current) / 0.45);
    w.jacket.emissive.copy(w.jacket.color);
    w.jacket.emissiveIntensity = flash * 1.2;
    w.pants.emissive.copy(w.pants.color);
    w.pants.emissiveIntensity = flash * 0.8;
    // sequin outfits shimmer
    if (o.sequin) { w.jacket.emissive.copy(w.jacket.color).lerp(w.tmp.set("#ffffff"), 0.5); w.jacket.emissiveIntensity = Math.max(w.jacket.emissiveIntensity, 0.15 + Math.abs(Math.sin(t * 9)) * 0.2); }
    if (tie.current) tie.current.visible = !!o.tie;
    // the hat: on the head, in the glove, or in the air
    if (hat.current) {
      hat.current.visible = P.hatMode === 0;
      hat.current.rotation.x = 0.16 + P.hatTilt * 0.85;
      hat.current.position.z = P.hatTilt * 0.08;
      hat.current.scale.setScalar(1 - flash * 0.35);
    }
    if (handHat.current) handHat.current.visible = P.hatMode === 1;
    if (flyHat.current) {
      const fh = flyHat.current;
      const fs = flyState.current;
      if (P.hatMode === 2) {
        const mv = moveAt(bar);
        const u = mv.hat ? THREE.MathUtils.clamp((inBar - 3.1) / 2.3, 0, 1) : 0;
        fs.rot += dt * 9;
        fh.visible = true;
        fh.position.set(0, 1.9 + Math.sin(u * Math.PI) * 2.6, 0.15);
        fh.rotation.set(u * TAU * 3, fs.rot, 0.2);
      } else {
        fh.visible = false;
      }
    }
    // beams: sweep and settle on the dancer during freezes and spins
    if (beams.current) {
      const hold = P.spin > 0.2 || moveAt(bar).sparks || moveAt(bar).hat ? 1 : 0;
      beams.current.children.forEach((c, i) => {
        const bm = BEAMS[i];
        const sway = 1 - hold * 0.85;
        beamTmp.set(x + Math.sin(t * 0.7 + bm.phase) * 3.2 * sway - bm.pos[0], d.foot + 1 - bm.pos[1], z + Math.cos(t * 0.55 + bm.phase) * 2.6 * sway - bm.pos[2]).normalize();
        beamQ.setFromUnitVectors(beamDown, beamTmp);
        c.quaternion.slerp(beamQ, 1 - Math.exp(-dt * 3));
        const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = (0.035 + hold * 0.05 + flash * 0.05) * sc;
      });
    }
    const u = THREE.MathUtils.clamp((t - stompAt.current) / 0.35, 0, 1);
    const sq = Math.sin(u * Math.PI) * (1 - u) * 0.22;

    g.position.set(x, (frozen ? 0 : d.foot) + P.rise - (1 - appear) * 0.6, z);
    g.rotation.y = heading + P.spin;
    g.scale.setScalar(Math.max(0.0001, sc * 0.9));
    g.visible = sc > 0.001;
    if (body.current) {
      body.current.rotation.x = P.lean;
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
    if (pool.current) {
      const ps = 1 + bounce * 0.08 + P.rise * 0.5;
      pool.current.scale.set(ps, ps, 1);
      (pool.current.material as THREE.MeshBasicMaterial).opacity = (0.1 + bounce * 0.06 + P.rise * 0.12) * sc;
    }
    if (ring.current) {
      const rs = 1 + bounce * 0.1 + P.rise * 1.5;
      ring.current.scale.set(rs, rs, 1);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (0.3 + bounce * 0.4) * sc;
    }
  });

  return (
    <>
      <group ref={beams}>
        {(isHeavyDevice() ? BEAMS : BEAMS.slice(0, 2)).map((bm) => (
          <mesh key={bm.color + bm.phase} position={bm.pos} geometry={beamGeo}>
            <meshBasicMaterial color={bm.color} transparent opacity={0.04} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
      {bursts.map((bu, i) => (
        <points key={i} geometry={bu.geo} material={bu.mat} frustumCulled={false} />
      ))}
    <group ref={root}>
      <mesh ref={pool} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.15, 32]} />
        <meshBasicMaterial color={GLOW} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ring} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.72, 48]} />
        <meshBasicMaterial color={GLOW} transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <group ref={sparks} visible={false}>
        <Sparkles count={36} scale={[1.7, 2.4, 1.7]} position={[0, 1.2, 0]} size={3.5} speed={1.4} opacity={0.9} color="#ffd9a0" />
      </group>
      <group ref={flyHat} visible={false}>
        <Part size={[0.62, 0.05, 0.64]} pos={[0, 0, 0.02]} mat={wardrobe.hat} />
        <Part size={[0.36, 0.22, 0.36]} pos={[0, 0.13, 0]} mat={wardrobe.hat} />
        <Part size={[0.38, 0.06, 0.38]} pos={[0, 0.06, 0]} mat={wardrobe.band} />
      </group>
      <group ref={body}>
        <group ref={hips} position={[0, 0.9, 0]}>
          <Part size={[0.46, 0.22, 0.28]} pos={[0, 0.06, 0]} mat={wardrobe.pants} />
          <Part size={[0.48, 0.05, 0.3]} pos={[0, 0.16, 0]} mat={wardrobe.accent} />
          <Part size={[0.1, 0.08, 0.03]} pos={[0, 0.16, 0.16]} mat={wardrobe.accent} />
          <group ref={torso} position={[0, 0.17, 0]}>
            <Part size={[0.52, 0.62, 0.3]} pos={[0, 0.31, 0]} mat={wardrobe.jacket} />
            <Part size={[0.16, 0.5, 0.03]} pos={[0, 0.34, 0.155]} mat={wardrobe.shirt} />
            <Part size={[0.18, 0.05, 0.34]} pos={[-0.22, 0.6, 0]} mat={wardrobe.accent} />
            <Part size={[0.18, 0.05, 0.34]} pos={[0.22, 0.6, 0]} mat={wardrobe.accent} />
            <Part size={[0.05, 0.05, 0.03]} pos={[0.13, 0.42, 0.16]} mat={wardrobe.accent} />
            <Part size={[0.05, 0.05, 0.03]} pos={[0.13, 0.28, 0.16]} mat={wardrobe.accent} />
            <Part size={[0.05, 0.05, 0.03]} pos={[0.13, 0.14, 0.16]} mat={wardrobe.accent} />
            <mesh ref={tie} position={[0, 0.34, 0.16]} castShadow>
              <boxGeometry args={[0.05, 0.36, 0.035]} />
              <primitive object={wardrobe.tie} attach="material" />
            </mesh>
            <group ref={head} position={[0, 0.7, 0]}>
              <Part size={[0.34, 0.36, 0.34]} pos={[0, 0.2, 0]} color={SKIN} metal={0.05} rough={0.65} />
              <Part size={[0.26, 0.05, 0.03]} pos={[0, 0.24, 0.165]} color="#1a1210" metal={0} rough={0.8} />
              <Part size={[0.36, 0.1, 0.36]} pos={[0, 0.34, -0.02]} color="#0c0c0e" metal={0.1} rough={0.9} />
              <group ref={hat} rotation={[0.16, 0, 0]} position={[0, 0.39, 0]}>
                <Part size={[0.62, 0.05, 0.64]} pos={[0, 0, 0.02]} mat={wardrobe.hat} />
                <Part size={[0.36, 0.22, 0.36]} pos={[0, 0.13, 0]} mat={wardrobe.hat} />
                <Part size={[0.38, 0.06, 0.38]} pos={[0, 0.06, 0]} mat={wardrobe.band} />
              </group>
            </group>
            <group ref={lArm} position={[-0.33, 0.55, 0]}>
              <Part size={[0.16, 0.07, 0.16]} pos={[0, -0.24, 0]} mat={wardrobe.accent} />
              <Limb len={0.42} w={0.14} mat={wardrobe.jacket}>
                <group ref={lFore}>
                  <Limb len={0.38} w={0.12} tip="hand" mat={wardrobe.jacket} />
                </group>
              </Limb>
            </group>
            <group ref={rArm} position={[0.33, 0.55, 0]}>
              <Limb len={0.42} w={0.14} mat={wardrobe.jacket}>
                <group ref={rFore}>
                  <Limb len={0.38} w={0.12} tip="glove" mat={wardrobe.jacket} />
                  <group ref={handHat} visible={false} position={[0.02, -0.5, 0.05]} rotation={[0.3, 0, -1.2]}>
                    <Part size={[0.62, 0.05, 0.64]} pos={[0, 0, 0.02]} mat={wardrobe.hat} />
                    <Part size={[0.36, 0.22, 0.36]} pos={[0, 0.13, 0]} mat={wardrobe.hat} />
                    <Part size={[0.38, 0.06, 0.38]} pos={[0, 0.06, 0]} mat={wardrobe.band} />
                  </group>
                  {isHeavyDevice() && (
                  <Trail ref={trailMesh as unknown as React.Ref<never>} width={0.5} length={5} decay={2.5} color="#ffe2b0" attenuation={(w) => w * w}>
                    <mesh position={[0, -0.42, 0]}>
                      <boxGeometry args={[0.02, 0.02, 0.02]} />
                      <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
                    </mesh>
                  </Trail>
                  )}
                </group>
              </Limb>
            </group>
          </group>
          <group ref={lLeg} position={[-0.13, -0.02, 0]}>
            <Limb len={0.46} w={0.16} mat={wardrobe.pants}>
              <group ref={lShin}>
                <Limb len={0.42} w={0.14} tip="shoe" mat={wardrobe.pants} />
              </group>
            </Limb>
          </group>
          <group ref={rLeg} position={[0.13, -0.02, 0]}>
            <Limb len={0.46} w={0.16} mat={wardrobe.pants}>
              <group ref={rShin}>
                <Limb len={0.42} w={0.14} tip="shoe" mat={wardrobe.pants} />
              </group>
            </Limb>
          </group>
        </group>
      </group>
    </group>
    </>
  );
}
function Rig({ children, stateRef }: { children: React.ReactNode; stateRef: MutableRefObject<HeroState> }) {
  const group = useRef<THREE.Group>(null);
  const { pointer, viewport, size } = useThree();
  const clock = useSceneClock();
  // phones: tilting the device sways the city
  const tilt = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tilt.current.x = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
      tilt.current.y = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1);
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => window.removeEventListener("deviceorientation", onTilt);
  }, []);
  useFrame((state, dt) => {
    if (!group.current) return;
    const s = stateRef.current;
    const desktop = size.width >= 900;
    const t = clock(dt);
    const dive = Math.min(1, s.spread * 1.6); // first part of the scroll dives into the streets
    const px = desktop ? pointer.x : tilt.current.x;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.72 + Math.sin(t * 0.08) * 0.12 + px * (desktop ? 0.08 : 0.22) + dive * 0.5, 3, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, dive * 0.25 + (desktop ? 0 : tilt.current.y * 0.12), 3, dt);
    const sc = (desktop ? Math.min(1, viewport.width / 12) : Math.min(0.8, viewport.width / 4.8)) * (1 + dive * 0.9);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x || 0.001, sc, 4, dt));
    group.current.position.x = (desktop ? viewport.width * 0.17 : 0.2) - dive * viewport.width * 0.1;
    group.current.position.z = dive * 5;
    const punch = s.energy ?? 0;
    s.energy = punch * Math.max(0, 1 - dt * 5);
    group.current.position.y = (desktop ? -1.7 + Math.sin(t * 0.5) * 0.06 : -viewport.height * 0.47) - dive * 1.2 - Math.max(0, s.spread - 0.6) * 4 - punch * 0.12;
  });
  return <group ref={group}>{children}</group>;
}

function PoseGrid({ stateRef, spec }: { stateRef: MutableRefObject<HeroState>; spec: { move: number; inBar: number }[] }) {
  const dancerRef = useRef({ x: 0, z: 0, foot: 0, flat: 0 });
  const cols = Math.ceil(Math.sqrt(spec.length));
  return (
    <group position={[0, -1.5, 0]} scale={0.62}>
      {spec.map((f, i) => (
        <group key={i} position={[(i % cols) * 2.6 - ((cols - 1) * 2.6) / 2, 0, Math.floor(i / cols) * 3 - 2]}>
          <Dancer stateRef={stateRef} dancerRef={dancerRef} onStomp={() => {}} frozen={f} />
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1a1a20" />
      </mesh>
    </group>
  );
}

function Scene({ stateRef }: { stateRef: MutableRefObject<HeroState> }) {
  return (
    <>
      <AutoSize />
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 10, 4]} intensity={1.6} castShadow={isHeavyDevice()} shadow-mapSize={[512, 512]} />
      <pointLight position={[-4, 4, 4]} intensity={4} color="#e9a23b" distance={20} decay={2} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 6, -3]} rotation={[-Math.PI / 2.2, 0, 0]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#e9a23b" position={[-6, 2, 2]} rotation={[0, Math.PI / 2, 0]} scale={[4, 6, 1]} />
      </Environment>
      {poseGridSpec() ? (
        <PoseGrid stateRef={stateRef} spec={poseGridSpec()!} />
      ) : (
        <Rig stateRef={stateRef}>
          <City stateRef={stateRef} />
        </Rig>
      )}
      {!poseGridSpec() && <Sparkles count={120} scale={[16, 6, 12]} position={[2, 1, -2]} size={2} speed={0.2} opacity={0.35} color="#e9a23b" />}
      <fog attach="fog" args={["#0a0a0c", 12, 30]} />
    </>
  );
}

export default function VoxelScene({ stateRef, active }: { stateRef: MutableRefObject<HeroState>; active: boolean }) {
  const heavy = isHeavyDevice();
  const [dpr, setDpr] = useState(heavy ? 1.5 : 1.15);
  return (
    <Canvas
      dpr={dpr}
      shadows={heavy ? "percentage" : false}
      camera={{ position: [0, 5.5, 12], fov: 30, near: 0.1, far: 80 }}
      resize={{ scroll: false, debounce: 500 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.setClearColor(new THREE.Color("#0a0a0c"), 1);
        camera.lookAt(0, 0.5, 0);
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <PerformanceMonitor
        bounds={(refresh) => [refresh * 0.55, refresh * 0.9]}
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(0.75, Math.round((d - 0.25) * 100) / 100))}
        onIncline={() => setDpr((d) => Math.min(heavy ? 1.5 : 1.15, Math.round((d + 0.25) * 100) / 100))}
        onFallback={() => setDpr(0.75)}
      />
      <Suspense fallback={null}>
        <Scene stateRef={stateRef} />
      </Suspense>
    </Canvas>
  );
}
