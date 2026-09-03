import { responsive, type Artwork } from "./artwork";
import { SIZES } from "./sizes";

export type Service = {
  title: string;
  /** The flower glyph beside the title, drawn 69 x 55. */
  icon: string;
  /** The photograph above the copy, 805 x 1000. */
  photo: Artwork;
  /** The one-line blurb the home page's three-up grid prints. */
  summary: string;
  /** Two paragraphs, set as one block with a blank line between them. */
  copy: [string, string];
};

/** The three exports of one service photograph, 805px at full size. */
const photo = (stem: string) => responsive(stem, [500, 800], 805, SIZES.service);

/** The three services, in the order the page lists them. */
export const SERVICES: Service[] = [
  {
    title: "Weddings",
    icon: "/images/icon-service-weddings.png",
    photo: photo("service-weddings"),
    summary:
      "Adipiscing mauris sed metus dictum eget morbi aliquet. Sit neque tempus eget dictum velit tristique.",
    copy: [
      "Purus quam elit, ligula morbi facilisis. Nisl id nisi, mattis eget elit etiam risus commodo, congue. Vitae placerat tincidunt adipiscing id porta sed. Gravida nulla mi felis gravida odio.",
      "Aliquam morbi in euismod aliquet pretium. Augue bibendum proin tempus non, massa aliquet. Egestas nisi ultrices curabitur.",
    ],
  },
  {
    title: "Event Design",
    icon: "/images/icon-service-event-design.png",
    photo: photo("service-event-design"),
    summary:
      "Lectus sit turpis iaculis eu non sed turpis suscipit facilisi. Lorem morbi non morbi id aliquam. Urna adipiscing odio.",
    copy: [
      "Tincidunt lacus, adipiscing sed dictum turpis gravida arcu. Odio scelerisque commodo eu tincidunt odio pulvinar ullamcorper sit gravida. Nunc dui nunc, nulla sed convallis sed. Dictum venenatis facilisis ac adipiscing",
      "Aliquam suspendisse condimentum lobortis in. Augue vulputate egestas in porta fermentum nunc id arcu ultricies.",
    ],
  },
  {
    title: "Branding",
    icon: "/images/icon-service-branding.png",
    photo: photo("service-branding"),
    summary:
      "Tristique sodales consectetur lectus feugiat molestie. Condimentum eu faucibus dictum adipiscing.",
    copy: [
      "Viverra commodo eget amet ut. Nisl velit scelerisque malesuada commodo ullamcorper integer. Et vestibulum morbi.",
      "Lobortis faucibus tortor sed amet, cras. Fringilla orci cras eget consequat, ut viverra sed. Ornare faucibus nibh eget id euismod viverra ut porttitor. Augue consectetur elit consectetur nisl, et vel. Libero tellus dolor nibh diam.",
    ],
  },
];
