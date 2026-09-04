import { artworkFrom, type Upload } from "@/lib/media";
import { SIZES } from "@/lib/sizes";
import { AboutPhoto } from "./AboutPhoto";
import styles from "./PhotoRow.module.css";

type PhotoRowProps = {
  photos: Upload[];
  /** Milliseconds between each tile's fade-in. */
  stagger: number;
};

/**
 * A row of framed photographs that drift inside their windows.
 *
 * Lifted out of `AboutView`, where it was two hardcoded grids and a
 * `STAGGER = [200, 400, 600]` table. The table was `(index + 1) * 200`.
 *
 * **The count picks both the grid and the `sizes` hint.** `.gridPair` and
 * `.gridThree` differ in more than a column — their gaps differ at every
 * breakpoint — and the published pair is also the only row that shipped
 * responsive sources. Under `lib/media.ts`'s first invariant a caller states
 * that intent rather than inferring it from the pixels, and the row is the
 * caller: a `sizes` hint is a promise about slot width, and the slot is exactly
 * what the count determines. Two across was published with alternates and a
 * `fullWidth` hint; three across was published single-source, which invariant 2
 * would collapse to a bare `src` even if a hint were passed.
 */
export function PhotoRow({ photos, stagger }: PhotoRowProps) {
  const pair = photos.length === 2;

  return (
    <div className={pair ? styles.gridPair : styles.gridThree}>
      {photos.map((photo, index) => {
        const image = artworkFrom(photo, pair ? SIZES.fullWidth : undefined);
        return <AboutPhoto key={image.src} image={image} delay={(index + 1) * stagger} />;
      })}
    </div>
  );
}
