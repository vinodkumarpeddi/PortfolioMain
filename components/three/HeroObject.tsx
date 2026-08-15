"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type HeroState = { spread: number; opacity: number; energy?: number };
export type HeroVariant = "hero" | "ambient" | "orbit" | "backdrop";
export type OrbitConfig = { count: number; activeRef: MutableRefObject<number>; labels?: string[]; onSelect?: (i: number) => void };

function makeRng(seed: number) {
  let state = seed;
  return () => ((state = (state * 16807) % 2147483647) / 2147483647);
}

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
  uniform vec3 uLight;
  varying float vAlpha;
  varying float vRand;
  varying float vLit;

  void main() {
    vec3 p = mix(aKnot, aSphere, uMorph);
    vec3 n = normalize(mat3(modelViewMatrix) * normalize(p));
    float facing = smoothstep(-0.35, 0.55, n.z);           // far side fades
    float lit = 0.35 + 0.65 * smoothstep(-0.2, 0.9, dot(n, normalize(uLight)));
    vLit = facing * lit;
    float breathe = sin(uTime * 0.9 + aRand * 6.2831) * 0.035;
    p += normalize(p + 0.0001) * breathe;
    p += normalize(p + 0.0001) * uScatter * (0.5 + aRand * 2.2);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec2 d = mv.xy - uMouse;
    float dist = length(d);
    float force = smoothstep(1.4, 0.0, dist) * uMouseForce;
    mv.xy -= normalize(d + 0.0001) * force * 0.35 * aRand;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aRand * 0.9) * (7.0 / -mv.z);
    vAlpha = (0.2 + 0.8 * aRand * aRand) * vLit;
    vRand = aRand;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  varying float vRand;
  varying float vLit;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d);
    vec3 amber = vec3(0.914, 0.635, 0.231);
    vec3 warm = vec3(1.0, 0.93, 0.80);
    vec3 col = mix(amber, warm, smoothstep(0.8, 1.0, vRand) * vLit);
    gl_FragColor = vec4(col * (0.7 + vRand * 0.5), a * vAlpha * uOpacity);
  }
`;

function ParticleSculpture({ stateRef, ambient, geometry, halo }: { stateRef: MutableRefObject<HeroState>; ambient: boolean; geometry: THREE.BufferGeometry; halo?: boolean }) {
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
      uLight: { value: new THREE.Vector3(-0.6, 0.7, 0.8) },
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
    u.uMorph.value = THREE.MathUtils.damp(u.uMorph.value, Math.min(1, s.spread * 1.2), 4, dt);
    u.uScatter.value = THREE.MathUtils.damp(u.uScatter.value, Math.max(0, s.spread - 0.45) * 2.4, 4, dt);
    u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, s.opacity * (halo ? 0.05 : 0.6), 5, dt);
    // pointer in view space (approximation at the sculpture's depth)
    const target = new THREE.Vector2((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2);
    u.uMouse.value.lerp(target, 1 - Math.exp(-6 * dt));
    u.uMouseForce.value = THREE.MathUtils.damp(u.uMouseForce.value, ambient ? 0.15 : 0.35, 3, dt);

  });

  return (
    <points geometry={geometry} frustumCulled={false}>
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

/** Milestone markers on a tilted orbit ring; the active one rotates to the front and pulses. */
function OrbitMarkers({ orbit, stateRef }: { orbit: OrbitConfig; stateRef: MutableRefObject<HeroState> }) {
  const ring = useRef<THREE.Group>(null);
  const [hover, setHover] = useState<number | null>(null);
  const pulses = useRef<THREE.Mesh[]>([]);
  const cores = useRef<THREE.Mesh[]>([]);
  const R = 2.55;
  const step = (Math.PI * 2) / orbit.count;
  const ringGeo = useMemo(() => new THREE.TorusGeometry(R, 0.006, 8, 220), []);
  useFrame((state, dt) => {
    const active = orbit.activeRef.current;
    if (ring.current) {
      // marker i sits at angle i*step around Y; rotate the ring so the active one faces +Z (camera)
      const target = -active * step + Math.PI / 2;
      let cur = ring.current.rotation.y;
      // shortest path
      let d = target - cur;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      cur = THREE.MathUtils.damp(cur, cur + d, 4, dt);
      ring.current.rotation.y = cur;
    }
    const t = state.clock.elapsedTime;
    for (let i = 0; i < orbit.count; i++) {
      const isActive = i === active;
      const core = cores.current[i];
      const pulse = pulses.current[i];
      if (core) {
        const target = isActive ? 0.075 : hover === i ? 0.06 : 0.04;
        core.scale.setScalar(THREE.MathUtils.damp(core.scale.x || 0.001, target, 6, dt));
        (core.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.damp((core.material as THREE.MeshBasicMaterial).opacity, (isActive ? 1 : 0.55) * stateRef.current.opacity, 6, dt);
      }
      if (pulse) {
        const ph = (t * 0.6 + i * 0.3) % 1;
        pulse.scale.setScalar(isActive ? 0.08 + ph * 0.5 : 0.0001);
        (pulse.material as THREE.MeshBasicMaterial).opacity = isActive ? (1 - ph) * 0.7 * stateRef.current.opacity : 0;
      }
    }
  });
  return (
    <group rotation={[0.55, 0, 0.35]}>
      <group ref={ring}>
        <mesh geometry={ringGeo} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#f1efe9" transparent opacity={0.16} depthWrite={false} />
        </mesh>
        {Array.from({ length: orbit.count }).map((_, i) => {
          const a = i * step;
          const pos: [number, number, number] = [Math.cos(a) * R, 0, Math.sin(a) * R];
          return (
            <group key={i} position={pos}>
              <mesh
                ref={(el) => { if (el) cores.current[i] = el; }}
                onClick={(e) => { e.stopPropagation(); orbit.onSelect?.(i); }}
                onPointerOver={(e) => { e.stopPropagation(); setHover(i); document.body.style.cursor = "pointer"; }}
                onPointerOut={() => { setHover(null); document.body.style.cursor = ""; }}
              >
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color="#ffd18a" transparent opacity={0.6} toneMapped={false} depthWrite={false} />
              </mesh>
              {/* generous hit area */}
              <mesh onClick={(e) => { e.stopPropagation(); orbit.onSelect?.(i); }} onPointerOver={(e) => { e.stopPropagation(); setHover(i); }} onPointerOut={() => setHover(null)} visible={false}>
                <sphereGeometry args={[0.22, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
              {orbit.labels && (hover === i || orbit.activeRef.current === i) && (
                <Html position={[0, 0.16, 0]} center zIndexRange={[6, 0]} style={{ pointerEvents: "none" }}>
                  <div style={{ whiteSpace: "nowrap", padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(233,162,59,0.45)", background: "rgba(10,10,12,0.8)", backdropFilter: "blur(8px)", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f1efe9" }}>
                    {orbit.labels[i]}
                  </div>
                </Html>
              )}
              <mesh ref={(el) => { if (el) pulses.current[i] = el; }} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.85, 1, 48]} />
                <meshBasicMaterial color="#e9a23b" transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

function Spin({ children, speed }: { children: React.ReactNode; speed: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * speed;
  });
  return <group ref={g}>{children}</group>;
}

function Rig({ children, variant }: { children: React.ReactNode; variant: HeroVariant }) {
  const group = useRef<THREE.Group>(null);
  const { pointer, viewport, size } = useThree();
  useFrame((_, dt) => {
    if (!group.current) return;
    const desktop = size.width >= 900;
    const px = variant === "backdrop" ? 0.12 : 0.25;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * px, 4, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * px * 0.7, 4, dt);
    let s = 1;
    let x = 0;
    let y = 0;
    if (variant === "hero") {
      s = desktop ? Math.min(1.35, viewport.width / 6) : Math.min(0.9, viewport.width / 3.1);
      x = desktop ? 0.2 : 0.15;
      y = desktop ? -0.1 : -viewport.height * 0.22;
    } else if (variant === "ambient") {
      s = Math.min(1.1, viewport.width / 7);
      x = 0.2;
    } else if (variant === "orbit") {
      s = Math.min(1.05, viewport.width / 6.4, viewport.height / 6.4);
    } else {
      s = Math.min(1.5, viewport.width / 6.5, viewport.height / 5.2);
      y = -viewport.height * 0.08;
    }
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 4, dt));
    group.current.position.x = x;
    group.current.position.y = y;
  });
  return <group ref={group}>{children}</group>;
}

function hash3(x: number, y: number, z: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return n - Math.floor(n);
}
function smooth(t: number) {
  return t * t * (3 - 2 * t);
}
/** Cheap 3D value noise in [0,1]. */
function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const c000 = hash3(xi, yi, zi), c100 = hash3(xi + 1, yi, zi), c010 = hash3(xi, yi + 1, zi), c110 = hash3(xi + 1, yi + 1, zi);
  const c001 = hash3(xi, yi, zi + 1), c101 = hash3(xi + 1, yi, zi + 1), c011 = hash3(xi, yi + 1, zi + 1), c111 = hash3(xi + 1, yi + 1, zi + 1);
  const x00 = lerp(c000, c100, xf), x10 = lerp(c010, c110, xf), x01 = lerp(c001, c101, xf), x11 = lerp(c011, c111, xf);
  return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf);
}
function fbm(x: number, y: number, z: number) {
  return 0.55 * noise3(x, y, z) + 0.3 * noise3(x * 2.1 + 5, y * 2.1 + 5, z * 2.1 + 5) + 0.15 * noise3(x * 4.3 + 9, y * 4.3 + 9, z * 4.3 + 9);
}

/**
 * Points on a sphere: dense "land" clusters where a noise field is high,
 * plus a sparse "ocean" layer that keeps the silhouette readable.
 */
function useSculptureGeometry(count: number) {
  return useMemo(() => {
    const knot: number[] = [];
    const sphere: number[] = [];
    const rand: number[] = [];
    const rnd = makeRng(1337);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const candidates = count * 3;
    for (let i = 0; i < candidates && knot.length / 3 < count; i++) {
      const y = 1 - (i / (candidates - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const nx = Math.cos(th) * r, ny = y, nz = Math.sin(th) * r;
      const land = fbm(nx * 1.6 + 3.1, ny * 1.6 + 1.7, nz * 1.6 + 8.2);
      const isLand = land > 0.5;
      const keep = isLand ? true : rnd() < 0.18;
      if (!keep) continue;
      const R = 1.7 + (rnd() - 0.5) * (isLand ? 0.04 : 0.02);
      const j = isLand ? 0.035 : 0.01;
      const jx = nx + (rnd() - 0.5) * j, jy = ny + (rnd() - 0.5) * j, jz = nz + (rnd() - 0.5) * j;
      const jl = Math.hypot(jx, jy, jz) || 1;
      knot.push((jx / jl) * R, (jy / jl) * R, (jz / jl) * R);
      const R2 = R * (1.35 + rnd() * 0.9);
      sphere.push(nx * R2, ny * R2, nz * R2);
      // land is brighter (rand drives brightness/size in the shader)
      const city = isLand && rnd() < 0.06;
      rand.push(city ? 0.9 + rnd() * 0.1 : isLand ? 0.4 + rnd() * 0.45 : rnd() * 0.3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(knot, 3));
    g.setAttribute("aKnot", new THREE.Float32BufferAttribute(knot, 3));
    g.setAttribute("aSphere", new THREE.Float32BufferAttribute(sphere, 3));
    g.setAttribute("aRand", new THREE.Float32BufferAttribute(rand, 1));
    return g;
  }, [count]);
}

/** Soft atmospheric rim. */
function Atmosphere({ stateRef }: { stateRef: MutableRefObject<HeroState> }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uOpacity: { value: 1 } }), []);
  useFrame((_, dt) => {
    const u = mat.current?.uniforms as typeof uniforms | undefined;
    if (u) u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, stateRef.current.opacity * (1 - stateRef.current.spread) * (1 + (stateRef.current.energy ?? 0) * 0.8), 5, dt);
  });
  return (
    <mesh scale={1.06}>
      <sphereGeometry args={[1.7, 48, 48]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        uniforms={uniforms}
        vertexShader={`varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`}
        fragmentShader={`uniform float uOpacity; varying vec3 vN; varying vec3 vV; void main(){ float rim = pow(1.0 - abs(dot(vN, vV)), 3.0); gl_FragColor = vec4(vec3(0.914,0.635,0.231) * rim, rim * 0.55 * uOpacity); }`}
      />
    </mesh>
  );
}

/** Faint latitude/longitude lines. */
function Graticule({ stateRef }: { stateRef: MutableRefObject<HeroState> }) {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    const R = 1.7;
    const push = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    const seg = 96;
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (lat * Math.PI) / 180;
      for (let i = 0; i < seg; i++) {
        const t0 = (i / seg) * Math.PI * 2;
        const t1 = ((i + 1) / seg) * Math.PI * 2;
        push(new THREE.Vector3(Math.cos(phi) * Math.cos(t0) * R, Math.sin(phi) * R, Math.cos(phi) * Math.sin(t0) * R), new THREE.Vector3(Math.cos(phi) * Math.cos(t1) * R, Math.sin(phi) * R, Math.cos(phi) * Math.sin(t1) * R));
      }
    }
    for (let lon = 0; lon < 180; lon += 30) {
      const th = (lon * Math.PI) / 180;
      for (let i = 0; i < seg; i++) {
        const p0 = (i / seg) * Math.PI * 2;
        const p1 = ((i + 1) / seg) * Math.PI * 2;
        push(new THREE.Vector3(Math.cos(p0) * Math.cos(th) * R, Math.sin(p0) * R, Math.cos(p0) * Math.sin(th) * R), new THREE.Vector3(Math.cos(p1) * Math.cos(th) * R, Math.sin(p1) * R, Math.cos(p1) * Math.sin(th) * R));
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  const mat = useRef<THREE.LineBasicMaterial>(null);
  useFrame((_, dt) => {
    if (mat.current) mat.current.opacity = THREE.MathUtils.damp(mat.current.opacity, 0.07 * stateRef.current.opacity * (1 - stateRef.current.spread), 5, dt);
  });
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial ref={mat} color="#f1efe9" transparent opacity={0.12} depthWrite={false} />
    </lineSegments>
  );
}

/** Great-circle arcs between surface points, each with a travelling packet; they cycle in and out. */
function Arcs({ stateRef, count = 12 }: { stateRef: MutableRefObject<HeroState>; count?: number }) {
  const R = 1.72;
  const arcs = useMemo(() => {
    const rnd = makeRng(4242);
    const onSphere = () => {
      const u = rnd() * 2 - 1;
      const t = rnd() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      return new THREE.Vector3(Math.cos(t) * r * R, u * R, Math.sin(t) * r * R);
    };
    return Array.from({ length: count }, (_, i) => {
      const a = onSphere();
      let b = onSphere();
      while (a.distanceTo(b) < 1.4) b = onSphere();
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * (1.25 + rnd() * 0.35));
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const pts = curve.getPoints(64);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const material = new THREE.LineBasicMaterial({ color: "#e9a23b", transparent: true, opacity: 0, depthWrite: false });
      const line = new THREE.Line(geo, material);
      return { curve, line, material, phase: i / count, speed: 0.11 + rnd() * 0.06 };
    });
  }, [count]);
  const beads = useRef<THREE.Mesh[]>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const TRAIL = 4;
  const clock = useRef(0);
  useFrame((_, dt) => {
    const s = stateRef.current;
    const energy = s.energy ?? 0;
    clock.current += dt * (1 + energy * 2.2);
    const t = clock.current;
    arcs.forEach((arc, i) => {
      const p = (t * arc.speed + arc.phase) % 1; // 0..1 lifecycle
      const vis = Math.sin(p * Math.PI); // fade in/out
      arc.material.opacity = vis * (0.5 + energy * 0.4) * s.opacity * (1 - s.spread);
      for (let k = 0; k < TRAIL; k++) {
        const b = beads.current[i * TRAIL + k];
        if (!b) continue;
        const bt = Math.min(1, Math.max(0, (p - 0.1) / 0.8 - k * 0.025));
        arc.curve.getPoint(bt, tmp);
        b.position.copy(tmp);
        const f = 1 - k / TRAIL;
        b.scale.setScalar((0.012 + vis * 0.018) * f);
        (b.material as THREE.MeshBasicMaterial).opacity = vis * s.opacity * (1 - s.spread) * f;
      }
    });
  });
  return (
    <group>
      {arcs.map((arc, i) => (
        <group key={i}>
          <primitive object={arc.line} />
          {Array.from({ length: TRAIL }).map((_, k) => (
            <mesh key={k} ref={(el) => { if (el) beads.current[i * TRAIL + k] = el; }}>
              <sphereGeometry args={[1, 10, 10]} />
              <meshBasicMaterial color="#ffd18a" transparent opacity={0} toneMapped={false} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Scene({ stateRef, variant, orbit }: { stateRef: MutableRefObject<HeroState>; variant: HeroVariant; orbit?: OrbitConfig }) {
  const { size } = useThree();
  const ambient = variant !== "hero";
  const geometry = useSculptureGeometry(size.width >= 900 ? COUNT_DESKTOP : COUNT_MOBILE);
  return (
    <>
      <AutoSize />
      <Rig variant={variant}>
        <group rotation={[0.42, 0, -0.2]}>
          <Spin speed={variant === "hero" ? 0.09 : 0.05}>
            <ParticleSculpture stateRef={stateRef} ambient={ambient} geometry={geometry} halo />
            <ParticleSculpture stateRef={stateRef} ambient={ambient} geometry={geometry} />
            <Graticule stateRef={stateRef} />
            <Arcs stateRef={stateRef} count={variant === "hero" || variant === "backdrop" ? 12 : 6} />
          </Spin>
          <Atmosphere stateRef={stateRef} />
        </group>
        {orbit && <OrbitMarkers orbit={orbit} stateRef={stateRef} />}
      </Rig>
    </>
  );
}

export default function HeroObject({ stateRef, active, variant = "hero", orbit }: { stateRef: MutableRefObject<HeroState>; active: boolean; variant?: HeroVariant; orbit?: OrbitConfig }) {
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
        <Scene stateRef={stateRef} variant={variant} orbit={orbit} />
      </Suspense>
    </Canvas>
  );
}
