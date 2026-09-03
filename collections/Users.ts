import type { CollectionConfig } from "payload";

/**
 * Email + password auth for the admin panel.
 *
 * The `role` select exists from day one even with a single user: retrofitting
 * access control after content exists is far more painful than declaring it now.
 * The access functions themselves are decision F, which blocks phase 5 — until
 * then every authenticated user has full rights.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
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
      admin: {
        description:
          "Admins may delete Pages and edit the Header and Footer globals; editors may not.",
      },
    },
  ],
};
