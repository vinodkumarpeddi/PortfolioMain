"use client";

import type { MutableRefObject } from "react";
import { ShaderLayer, type ShaderDrive } from "@/components/ui/ShaderLayer";

/**
 * The closing image: an eclipse rising behind the statement. The disc is the page's own dark,
 * so the type stays legible across it; the corona is where the light is, flaring with `energy`
 * when the call to action is hovered. `progress` lifts it from below the fold into place.
 */
const ECLIPSE = /* glsl */ `
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
  return v;
}
void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y);
  float rise = smoothstep(0.0, 1.0, uProgress);
  vec2 c = vec2(aspect > 1.2 ? 0.22 * aspect : 0.0, mix(-0.45, 0.34, rise));
  float r = aspect > 1.2 ? 0.27 : 0.2;
  vec2 q = p - c;
  float d = length(q);
  vec2 dir = q / max(d, 0.0001);
  /* corona: angular noise sampled on the unit circle so there is no seam */
  float n = fbm(dir * 2.4 + uTime * 0.12) * 0.7 + fbm(dir * 6.0 - uTime * 0.2) * 0.3;
  float e = uEnergy;
  float spread = 4.2 - e * 1.6;
  float corona = exp(-(d - r) * spread) * (0.45 + 0.75 * n) * step(r, d);
  float rays = pow(max(0.0, fbm(dir * 9.0 + uTime * 0.05)), 2.0) * exp(-(d - r) * 2.2) * step(r, d) * (0.35 + e * 0.5);
  float ring = exp(-abs(d - r) * 60.0) * 1.4;
  float disc = 1.0 - smoothstep(r - 0.003, r + 0.003, d);
  vec3 amber = vec3(0.95, 0.58, 0.18);
  vec3 warm = vec3(1.0, 0.86, 0.6);
  vec3 white = vec3(1.0, 0.96, 0.88);
  vec3 light = amber * corona * (1.0 + e * 0.6) + warm * rays + white * ring;
  light *= (0.35 + 0.65 * rise) * 0.8;
  vec3 dark = vec3(0.02, 0.02, 0.024);
  vec3 col = light * (1.0 - disc) + dark * disc;
  float a = max(disc, clamp(max(light.r, max(light.g, light.b)), 0.0, 1.0));
  o = vec4(min(col, vec3(1.0)), a);
}
`;

export function Eclipse({ drive }: { drive: MutableRefObject<ShaderDrive> }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[120svh] overflow-clip motion-reduce:hidden">
      <ShaderLayer fragment={ECLIPSE} drive={drive} scale={0.6} />
    </div>
  );
}
