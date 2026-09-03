"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { outQuad } from "@/lib/easing";
import { SiteLink } from "./SiteLink";
import { ChevronIcon } from "./ChevronIcon";
import styles from "./SiteHeader.module.css";

type DropdownItem = { label: string; href: string };

const CLOSE_DELAY = 300;

export function NavDropdown({ label, items }: { label: string; items: DropdownItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const listId = useId();

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY);
  };

  useEffect(() => () => cancelClose(), []);

  // Slide + fade the panel and spin the caret, matching the header's timing.
  useEffect(() => {
    const list = listRef.current;
    const icon = iconRef.current;
    if (!list || !icon) return;

    const duration = 0.3;
    if (open) {
      gsap.set(list, { y: 16, opacity: 0 });
      gsap.to(list, { y: 0, opacity: 1, duration, ease: outQuad });
      gsap.to(icon, { rotate: 180, duration, ease: outQuad });
    } else {
      gsap.to(list, { y: 16, opacity: 0, duration, ease: outQuad });
      gsap.to(icon, { rotate: 0, duration, ease: outQuad });
    }
  }, [open]);

  // Pointer-driven on desktop; on touch the toggle button carries the interaction.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const enter = () => {
      cancelClose();
      setOpen(true);
    };
    const leave = () => scheduleClose();
    root.addEventListener("mouseenter", enter);
    root.addEventListener("mouseleave", leave);
    return () => {
      root.removeEventListener("mouseenter", enter);
      root.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div className={styles.dropdown} ref={rootRef}>
      <button
        type="button"
        className={styles.dropdownToggle}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          cancelClose();
          setOpen((value) => !value);
        }}
      >
        <div className={styles.dropdownText}>{label}</div>
        <div className={styles.dropdownIcon} ref={iconRef}>
          <ChevronIcon />
        </div>
      </button>
      <nav
        id={listId}
        ref={listRef}
        className={`${styles.dropdownList} ${open ? styles.dropdownListOpen : ""}`}
      >
        {items.map((item) => (
          <SiteLink
            key={item.href}
            href={item.href}
            className={styles.dropdownLink}
            aria-current={pathname === item.href ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </SiteLink>
        ))}
      </nav>
    </div>
  );
}
