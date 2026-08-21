"use client";

import { ShaderLayer } from "@/components/ui/ShaderLayer";

/**
 * The ground under "a map of decisions": a live topographic map. Contour lines of a slowly
 * drifting noise field, every fifth line heavier, and the pointer raising a peak wherever it
 * rests so the lines bunch and flow around it.
 */
const CONTOUR = /* glsl */ `
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * 0.035;
  float h = fbm(p * 1.5 + vec2(t, -t * 0.6));
  h += 0.06 * fbm(p * 4.0 - t * 1.5);
  vec2 m = vec2(uMouse.x * aspect, uMouse.y);
  float dm = length(p - m);
  h += 0.32 * exp(-dm * dm * 5.0);
  float levels = 24.0;
  float hl = h * levels;
  float f = fract(hl);
  float w = fwidth(hl);
  float line = 1.0 - smoothstep(0.0, w * 1.5, min(f, 1.0 - f));
  float hm = hl / 5.0;
  float fm = fract(hm);
  float wm = fwidth(hm);
  float major = 1.0 - smoothstep(0.0, wm * 1.5, min(fm, 1.0 - fm));
  float peak = exp(-dm * dm * 7.0);
  vec3 amber = vec3(0.914, 0.635, 0.231);
  vec3 warm = vec3(1.0, 0.86, 0.62);
  float a = line * 0.24 + major * 0.42;
  a *= 0.55 + 0.7 * h;
  a += peak * (line + major) * 0.5;
  vec3 col = mix(amber, warm, peak * 0.8 + major * 0.2);
  o = vec4(col * a, a);
}
`;

export function ContourMap() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-clip motion-reduce:hidden [mask-image:radial-gradient(75%_70%_at_65%_40%,black_20%,transparent_85%)]">
      <ShaderLayer fragment={CONTOUR} scale={0.6} />
    </div>
  );
}
