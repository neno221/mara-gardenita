import { ABOUT_ARTWORK } from "@/lib/artwork";
import { artworkFrom } from "@/lib/media";
import { getTestimonials } from "@/lib/payload";
import { AboutPhoto } from "./AboutPhoto";
import { PageMasthead } from "./HeroTop";
import { Section } from "./Section";
import { SiteShell } from "./SiteShell";
import { Testimonials } from "./Testimonials";
import styles from "./AboutView.module.css";

/** Each row fades in a tile at a time, 0.2s apart. */
const STAGGER = [200, 400, 600];

const OPENING_ROW = [
  ABOUT_ARTWORK.laceGown,
  ABOUT_ARTWORK.poppyField,
  ABOUT_ARTWORK.florists,
];

const PAIR = [ABOUT_ARTWORK.goldenField, ABOUT_ARTWORK.veilKiss];

const CLOSING_ROW = [
  ABOUT_ARTWORK.hatBox,
  ABOUT_ARTWORK.brideTulle,
  ABOUT_ARTWORK.lemonCake,
];

/** The dividers between the logos are positional, so the order is the layout. */
const PRESS = ["mimosa", "iris", "orion", "sigma", "pristin", "polaris"];

/**
 * `/about`.
 *
 * The only thing phase 3 moves here is the testimonial carousel, which now reads
 * the collection. The nine photographs, the two prose runs and the six press
 * logos are still written into this file: they belong to the `photoRow`, `prose`
 * and `pressStrip` blocks, and those arrive in phase 4 with the sectioning rule
 * (§2) that keeps all six bodies inside one `<Section>`. Splitting them out
 * before `RenderBlocks` exists would put 152px of padding into every seam.
 */
export async function AboutView() {
  const testimonials = await getTestimonials();

  return (
    <SiteShell>
      <PageMasthead
        subtitle="who we are"
        heading="About Lovio"
        lede="Metus ultricies ut at faucibus. Fames eget imperdiet sit ipsum pellentesque pretium. Adipiscing egestas tellus eu imperdiet pellentesque orci."
      />

      <Section first>
        <div className={styles.gridThree}>
          {OPENING_ROW.map((image, index) => (
            <AboutPhoto key={image.src} image={image} delay={STAGGER[index]} />
          ))}
        </div>

        <div className={styles.prose}>
          <img
            src="/images/ornament-leaves.png"
            width={70}
            loading="lazy"
            alt=""
            className={styles.ornament}
          />
          <h3>Who we are</h3>
          <p>
            Gravida accumsan cras arcu hac vestibulum viverra. Ridiculus ut tincidunt accumsan
            id etiam sed posuere. Cursus tortor imperdiet urna ipsum. Lacus at cras enim arcu
            feugiat ac felis orci nunc. Ac purus ut auctor faucibus. Egestas scelerisque ornare
            posuere sed adipiscing mauris congue viverra sit. <br />
            <br />
            Ac quisque quis id amet, odio mauris faucibus fames. Sagittis semper laoreet fusce
            ac velit vulputate est. Urna tempus in vitae risus sed nascetur aliquet. Faucibus
            nascetur nibh. Cursus purus ut auctor faucibus ornare posuere.
          </p>
        </div>

        <div className={styles.gridPair}>
          {PAIR.map((image, index) => (
            <AboutPhoto key={image.src} image={image} delay={STAGGER[index]} />
          ))}
        </div>

        <div className={styles.prose}>
          <img
            src="/images/ornament-leaves.png"
            width={70}
            loading="lazy"
            alt=""
            className={styles.ornament}
          />
          <h3>Our process</h3>
          <p>
            Feugiat massa in consectetur ac, quis amet nulla. Ac purus massa quis massa et.
            Amet, nisi, neque augue habitasse semper tempor ultricies. Massa sed in elit,
            commodo. Scelerisque turpis aliquam, urna aenean.
            <br />
            <br />
            At vel dui egestas eget et sodales. Dis nisl adipiscing pulvinar sit dolor diam sit
            gravida leo. Ut sed eu, felis sed odio. Scelerisque fringilla sed viverra
            consectetur sagittis, nisl id nunc vestibulum. In viverra diam quis ut nibh lorem
            aliquet sagittis, vehicula. Gravida suscipit malesuada elementum pharetra pharetra.
            Ut et auctor ultrices non.
          </p>
        </div>

        {/* The label rides on the rule, its own background punching the gap. */}
        <div className={styles.pressRule}>
          <div className={styles.pressLabel}>
            Featured in
            <br />
          </div>
        </div>

        <div className={styles.pressGrid}>
          {PRESS.map((name, index) => {
            // Only the logos that open a row carry a divider modifier.
            const divider = styles[`press${index + 1}`];
            return (
              <div key={name} className={divider ? `${styles.press} ${divider}` : styles.press}>
                <img
                  src={`/images/press-${name}.svg`}
                  loading="lazy"
                  alt=""
                  className={styles.pressLogo}
                />
              </div>
            );
          })}
        </div>

        <div className={styles.gridThree}>
          {CLOSING_ROW.map((image, index) => (
            <AboutPhoto key={image.src} image={image} delay={STAGGER[index]} />
          ))}
        </div>
      </Section>

      <Testimonials
        quotes={testimonials.map((item) => ({
          quote: item.quote,
          signature: item.signature,
          portrait: artworkFrom(item.portrait),
        }))}
      />
    </SiteShell>
  );
}
