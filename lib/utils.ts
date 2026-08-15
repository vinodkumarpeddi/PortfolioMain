export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mapRange = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  outMin + ((clamp(v, Math.min(inMin, inMax), Math.max(inMin, inMax)) - inMin) / (inMax - inMin)) * (outMax - outMin);

export const isBrowser = typeof window !== "undefined";
