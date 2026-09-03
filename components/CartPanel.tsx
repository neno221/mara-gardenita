"use client";

import { useEffect, useRef } from "react";
import { SiteLink } from "./SiteLink";
import styles from "./CartPanel.module.css";
import buttons from "./buttons.module.css";

export function CartPanel({ onCloseRequest }: { onCloseRequest: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRequest();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCloseRequest]);

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRequest();
      }}
    >
      <div className={styles.container} role="dialog" aria-modal="true" aria-label="Your cart">
        <div className={styles.header}>
          <h4 className={styles.heading}>Your Cart</h4>
          <button
            type="button"
            ref={closeRef}
            className={styles.closeButton}
            aria-label="Close cart"
            onClick={onCloseRequest}
          >
            <img src="/images/icon-close.svg" alt="" className={styles.closeIcon} />
          </button>
        </div>
        <div className={styles.rule} />
        <div className={styles.formWrapper}>
          <div className={styles.emptyState}>
            <div className={styles.emptyText}>There are not items in your cart.</div>
            <SiteLink href="/shop" className={buttons.button}>
              Back To Shop
            </SiteLink>
          </div>
        </div>
      </div>
    </div>
  );
}
