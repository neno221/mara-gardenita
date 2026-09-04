import type { CollectionConfig } from "payload";
import { adminFieldOnly, admins, selfOrAdmin } from "../access";

/**
 * Email + password auth for the admin panel.
 *
 * The `role` select has existed since phase 1 even with a single user, because
 * retrofitting access control after content exists is far more painful than
 * declaring it early. Phase 5 is where it is finally read (spec §12).
 *
 * The field-level guard on `role` is the one that makes the rest hold: without it
 * an editor updating their own profile can promote themselves to admin, and every
 * other rule becomes decorative.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,

  access: {
    read: selfOrAdmin,
    create: admins,
    update: selfOrAdmin,
    delete: admins,
    // Payload gates the admin panel on this. Both roles get in; what they can do
    // once inside is the per-collection access above.
    admin: ({ req: { user } }) => Boolean(user),
  },

  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role"],
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      access: { update: adminFieldOnly },
      admin: {
        description:
          "Admins may delete Pages and edit the Header and Footer globals; editors may not.",
      },
    },
  ],
};
