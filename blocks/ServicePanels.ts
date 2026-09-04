import type { Block } from "payload";

/**
 * The `/services` triptych: each panel a photograph, a glyph, a title and two
 * paragraphs.
 *
 * The three booleans are properties of a *position*, not of a service. The
 * second panel hangs below the other two, the third spans both columns, and the
 * petals drift behind the second — none of which follows from what the service
 * document says about itself. That is why the panel is a row here with a
 * relationship inside, rather than a bare list of services: it lets an editor
 * add a fourth service and place it, which is the thing `ServicesView`'s
 * hand-placed triptych made impossible.
 *
 * Banding `own`.
 */
export const ServicePanels: Block = {
  slug: "servicePanels",
  interfaceName: "ServicePanelsBlock",
  labels: { singular: "Service panels", plural: "Service panels" },
  fields: [
    {
      name: "panels",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Panel", plural: "Panels" },
      admin: { description: "One panel per service, in grid order." },
      fields: [
        {
          name: "service",
          type: "relationship",
          relationTo: "services",
          required: true,
        },
        {
          type: "row",
          fields: [
            {
              name: "dropped",
              type: "checkbox",
              admin: { width: "33%", description: "Hangs below its neighbours." },
            },
            {
              name: "wide",
              type: "checkbox",
              admin: { width: "33%", description: "Spans both columns." },
            },
            {
              name: "petals",
              type: "checkbox",
              admin: { width: "33%", description: "A cut-out drifts behind it." },
            },
          ],
        },
      ],
    },
  ],
};
