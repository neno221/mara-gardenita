"use client";

import { useRef } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import styles from "./SiteShell.module.css";

/**
 * Header, the clipping page body, footer. The header watches the body's scroll
 * to fade its hairline in, so the two are wired together here rather than in
 * every page.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <SiteHeader pageRef={pageRef} />
      <div className={styles.page} ref={pageRef}>
        {children}
        <SiteFooter />
      </div>
    </>
  );
}
