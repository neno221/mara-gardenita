"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import type { HeaderProps } from "@/lib/chrome";
import { switchLocalePath, withLocale, type Locale } from "@/lib/i18n";
import type { ResolvedLink } from "@/lib/links";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { SiteLink } from "./SiteLink";
import buttons from "./buttons.module.css";
import styles from "./SiteHeader.module.css";

const MOBILE_NAV = "(max-width: 991px)";

/**
 * The bar on every page.
 *
 * The four links were written into this file, which made adding a menu entry a
 * code change; they come from the Header global now. One row, read left to
 * right: the wordmark, the links, then the global's button — the outlined
 * `.button` every other call to action on the site uses — and last the switch
 * to the other language.
 */
export function SiteHeader({
  locale,
  logo,
  logoAlt,
  nav,
  cta,
  pageRef,
}: HeaderProps & { pageRef: React.RefObject<HTMLDivElement | null> }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const borderRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const pathname = usePathname();
  const home = withLocale("/", locale);
  const other: Locale = locale === "gr" ? "en" : "gr";

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
      <SiteLink href={home} className={styles.brandMobile} onClick={closeMenu}>
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
          <div className={styles.navRow}>
            <SiteLink href={home} className={styles.brand} onClick={closeMenu}>
              <img {...logo} alt={logoAlt} className={styles.logo} />
            </SiteLink>
            <div className={styles.navGroup}>
              {nav.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={closeMenu} />
              ))}
            </div>
            {cta && (
              <SiteLink
                href={cta.href}
                className={`${buttons.button} ${styles.navButton}`}
                onClick={closeMenu}
              >
                {cta.label}
              </SiteLink>
            )}
            {/* After the button, so the bar keeps its order — wordmark, links,
                Contact — and the language switch sits outside it. */}
            <SiteLink
              href={switchLocalePath(pathname, other)}
              className={styles.navLink}
              hrefLang={other === "gr" ? "el" : "en"}
              lang={other === "gr" ? "el" : "en"}
              onClick={closeMenu}
            >
              {other === "gr" ? "GR" : "EN"}
            </SiteLink>
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

/** One entry in the navigation. */
function NavLink({ item, onNavigate }: { item: ResolvedLink; onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <SiteLink
      href={item.href}
      className={styles.navLink}
      aria-current={pathname === item.href ? "page" : undefined}
      onClick={onNavigate}
    >
      {item.label}
    </SiteLink>
  );
}
