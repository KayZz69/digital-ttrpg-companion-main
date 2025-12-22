/**
 * @fileoverview Hook for detecting mobile viewport sizes.
 * Uses a media query listener to reactively track screen width.
 */

import * as React from "react";

/** Breakpoint width (in pixels) below which the device is considered mobile */
const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook that detects whether the viewport is mobile-sized.
 * Updates automatically when the window is resized across the breakpoint.
 *
 * @returns `true` if viewport width is less than 768px, `false` otherwise.
 *          Returns `false` initially during SSR/hydration.
 *
 * @example
 * function MyComponent() {
 *   const isMobile = useIsMobile();
 *   return isMobile ? <MobileLayout /> : <DesktopLayout />;
 * }
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
