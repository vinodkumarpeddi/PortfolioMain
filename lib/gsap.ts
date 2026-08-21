import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
/* ignoreMobileResize: showing and hiding the mobile URL bar fires a resize, and a refresh
   mid-scroll re-measures every pin and jumps the page under the reader's thumb. */
ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });

gsap.defaults({ ease: "expo.out", duration: 1 });

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const REDUCED = "(prefers-reduced-motion: reduce)";
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const DESKTOP = "(min-width: 1024px)";
export const MOBILE = "(max-width: 1023px)";
