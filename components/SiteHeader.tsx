"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import type { HeaderProps } from "@/lib/chrome";
import type { ResolvedLink } from "@/lib/links";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { SiteLink } from "./SiteLink";
import styles from "./SiteHeader.module.css";

const MOBILE_NAV = "(max-width: 991px)";

/**
 * The bar on every page.
 *
 * The four links were written into this file, which made adding a menu entry a
 * code change; they come from the Header global now. The grid is still three
 * columns — links, wordmark, links — so the nav is split at its midpoint, with
 * the odd one out going left.
 */
export function SiteHeader({
  logo,
  logoAlt,
  nav,
  pageRef,
}: HeaderProps & { pageRef: React.RefObject<HTMLDivElement | null> }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const borderRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const split = Math.ceil(nav.length / 2);
  const leading = nav.slice(0, split);
  const trailing = nav.slice(split);

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
        <img {...logo} alt={logoAlt} className={styles.logoMobile} />
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
              {leading.map((item, index) => (
                <NavLink key={item.href} item={item} first={index === 0} onNavigate={closeMenu} />
              ))}
            </div>
            <SiteLink href="/" className={styles.brand} onClick={closeMenu}>
              <img {...logo} alt={logoAlt} className={styles.logo} />
            </SiteLink>
            <div className={`${styles.navGroup} ${styles.navGroupTrailing}`}>
              {trailing.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={closeMenu} />
              ))}
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

/**
 * One entry in the navigation.
 *
 * `first` reproduces a trailing `<br>` that the template's export left inside the
 * opening link and nowhere else. It is not decoration: `.navLink` is an
 * inline-block with a 140% line box, so the extra empty line makes that one link
 * 73.6px tall against its neighbours' 56.8px — and since the nav grid centres on
 * its tallest cell, it is what sets the header's height on every page. Dropping
 * it lifts the whole bar by 13.6px, which is exactly the kind of change decision
 * E's gate exists to refuse.
 */
function NavLink({
  item,
  first,
  onNavigate,
}: {
  item: ResolvedLink;
  first?: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <SiteLink
      href={item.href}
      className={styles.navLink}
      aria-current={pathname === item.href ? "page" : undefined}
      onClick={onNavigate}
    >
      {item.label}
      {first && <br />}
    </SiteLink>
  );
}
