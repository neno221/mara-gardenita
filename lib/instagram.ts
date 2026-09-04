/**
 * The Instagram feed, as tiles.
 *
 * Its own module because two callers want it and neither owns it: the footer
 * (through `lib/chrome.ts`) and the `instagramFeed` block. That is the point of
 * §9's rule that the widget's content lives in the collection — the two print
 * the same six tiles without either one holding them.
 */
import { artworkFrom } from "./media";
import { getInstagram } from "./payload";
import type { InstagramTileData } from "@/components/InstagramFeed";

/**
 * Decision H's fallback. No tile on the published site carries a caption, so
 * this is the accessible name almost every link gets — which is why it says
 * something rather than being the empty string the markup shipped.
 */
const TILE_LABEL = "View on Instagram";

export async function getInstagramTiles(limit: number): Promise<InstagramTileData[]> {
  const feed = await getInstagram(limit);

  return feed.map((tile) => ({
    id: tile.id,
    href: tile.postUrl,
    label: tile.caption || TILE_LABEL,
    // No `sizes` hint: the published tiles are single-source.
    image: artworkFrom(tile.image),
  }));
}
