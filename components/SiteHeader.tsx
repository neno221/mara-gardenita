"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { SiteLink } from "./SiteLink";
import styles from "./SiteHeader.module.css";

const MOBILE_NAV = "(max-width: 991px)";

export function SiteHeader({ pageRef }: { pageRef: React.RefObject<HTMLDivElement | null> }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const borderRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // The hairline under the header fades in over the first sliver of scroll.
  useScrollProgress(pageRef, { smoothing: 94 }, (progress) => {
    const border = borderRef.current;
    if (border) border.style.opacity = String(Math.min(progress / 0.02, 1));
  });

  // Only the collapsed header slides; the desktop bar keeps its untouched transform.
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const query = window.matchMedia(MOBILE_NAV);
    const apply = () => {
      if (!query.matches) {
        // Drop any in-flight slide first, or it would re-apply the offset
        // after the reset and strand the desktop bar off-screen.
        gsap.killTweensOf(menu);
        gsap.set(menu, { clearProps: "transform" });
        setMenuOpen(false);
        return;
      }
      // `y: 0` clears the stylesheet's translate, which GSAP would otherwise
      // read as a pixel offset and stack underneath yPercent. `force3D` holds
      // the panel on its own compositor layer at rest rather than only while
      // the tween runs, so the slide never re-rasterises the panel behind it.
      gsap.to(menu, {
        y: 0,
        yPercent: menuOpen ? 0 : -100,
        duration: 0.4,
        ease: "power1.inOut",
        force3D: true,
        overwrite: true,
      });
    };

    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <header className={styles.navbar}>
      <SiteLink href="/" className={styles.brandMobile} onClick={closeMenu}>
        <img src="/images/logo.svg" alt="Loovio" className={styles.logoMobile} />
      </SiteLink>

      {/* Transparent on desktop; becomes the drop-down panel and its backdrop when collapsed. */}
      <div
        className={`${styles.navOverlay} ${menuOpen ? styles.navOverlayOpen : ""}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <nav className={styles.navMenu} ref={menuRef} aria-label="Primary">
          <div className={styles.navGrid}>
            <div className={`${styles.navGroup} ${styles.navGroupLeading}`}>
              <SiteLink
                href="/portfolio"
                className={styles.navLink}
                aria-current={pathname === "/portfolio" ? "page" : undefined}
                onClick={closeMenu}
              >
                Portfolio
                <br />
              </SiteLink>
              <SiteLink
                href="/about"
                className={styles.navLink}
                aria-current={pathname === "/about" ? "page" : undefined}
                onClick={closeMenu}
              >
                About
              </SiteLink>
            </div>
            <SiteLink href="/" className={styles.brand} onClick={closeMenu}>
              <img src="/images/logo.svg" alt="Loovio" className={styles.logo} />
            </SiteLink>
            <div className={`${styles.navGroup} ${styles.navGroupTrailing}`}>
              <SiteLink
                href="/blog"
                className={styles.navLink}
                aria-current={pathname === "/blog" ? "page" : undefined}
                onClick={closeMenu}
              >
                Journal
              </SiteLink>
              <SiteLink
                href="/services"
                className={styles.navLink}
                aria-current={pathname === "/services" ? "page" : undefined}
                onClick={closeMenu}
              >
                Services
              </SiteLink>
            </div>
          </div>
        </nav>
      </div>

      <button
        type="button"
        className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
        aria-expanded={menuOpen}
        aria-label="Menu"
        onClick={() => setMenuOpen((value) => !value)}
      >
        <img src="/images/icon-menu.svg" alt="" className={styles.menuIcon} />
      </button>

      <div className={styles.borderNav} ref={borderRef} />
    </header>
  );
}
