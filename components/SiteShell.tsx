"use client";

import { useRef } from "react";
import type { ChromeProps } from "@/lib/chrome";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import styles from "./SiteShell.module.css";

/**
 * Header, the clipping page body, footer. The header watches the body's scroll
 * to fade its hairline in, so the two are wired together here rather than in
 * every page.
 *
 * That wiring is why the chrome arrives as props. This component holds the ref
 * the header reads, which makes it a client component, which means it cannot
 * fetch the two globals itself — so the route reads them through `getChrome()`
 * and passes finished props across the boundary.
 */
export function SiteShell({
  header,
  footer,
  children,
}: ChromeProps & { children: React.ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <SiteHeader {...header} pageRef={pageRef} />
      <div className={styles.page} ref={pageRef}>
        {children}
        <SiteFooter {...footer} />
      </div>
    </>
  );
}
