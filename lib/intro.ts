export const INTRO_EVENT = "intro:lift";

declare global {
  interface Window {
    __introPending?: boolean;
  }
}

/**
 * Entrance animations wait for the splash to lift. The boot script in the layout decides
 * before the body parses whether a splash is due and records it on `window.__introPending`
 * — a flag rather than a class, because hydration rewrites the <html> class attribute and
 * a layout effect can catch it pristine. The Preloader clears the flag and fires INTRO_EVENT
 * the moment the crest starts its flight, so the page's own entrance runs underneath it.
 */
export function onIntroDone(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if (!window.__introPending) {
    cb();
    return () => {};
  }
  const handler = () => {
    window.removeEventListener(INTRO_EVENT, handler);
    cb();
  };
  window.addEventListener(INTRO_EVENT, handler);
  return () => window.removeEventListener(INTRO_EVENT, handler);
}

export function liftIntro() {
  window.__introPending = false;
  window.dispatchEvent(new Event(INTRO_EVENT));
}
