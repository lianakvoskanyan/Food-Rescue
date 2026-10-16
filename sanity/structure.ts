import type { StructureResolver } from "sanity/structure";

const siteSettingsId = "siteSettings";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .id(siteSettingsId)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId(siteSettingsId)
            .title("Site settings"),
        ),
      S.divider(),
      S.documentTypeListItem("store").title("Stores"),
      S.documentTypeListItem("foodOffer").title("Offers"),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("booking").title("Bookings"),
      S.documentTypeListItem("notification").title("Notifications"),
      S.divider(),
      S.documentTypeListItem("userProfile").title("User profiles"),
    ]);
