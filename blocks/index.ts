import type { Block } from "payload";

import { ContactDetails } from "./ContactDetails";
import { Hero } from "./Hero";
import { InstagramFeed } from "./InstagramFeed";
import { Masthead } from "./Masthead";
import { PhotoRow } from "./PhotoRow";
import { PortfolioGrid } from "./PortfolioGrid";
import { PortfolioList } from "./PortfolioList";
import { PressStrip } from "./PressStrip";
import { Prose } from "./Prose";
import { ServiceGrid } from "./ServiceGrid";
import { ServicePanels } from "./ServicePanels";
import { StorySplit } from "./StorySplit";
import { Testimonials } from "./Testimonials";

/**
 * The block library (spec §6): twelve blocks, every one available on every
 * Pages document.
 *
 * That last clause is what makes sections reusable rather than merely
 * componentised — `testimonials` appears on two pages, `masthead` on four,
 * `photoRow` three times on one page, and `storySplit` twice with mirrored
 * sides, all without a developer.
 *
 * Ordered as a page reads rather than alphabetically: the openers, then the
 * bands that carry a collection, then the bodies. It is the order the admin's
 * "add block" drawer prints, so it is the order an editor builds in.
 */
export const blocks: Block[] = [
  Hero,
  Masthead,
  StorySplit,
  ServiceGrid,
  ServicePanels,
  PortfolioGrid,
  PortfolioList,
  Testimonials,
  PhotoRow,
  Prose,
  ContactDetails,
  PressStrip,
  InstagramFeed,
];
