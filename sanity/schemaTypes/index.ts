import { booking } from "./booking";
import { category } from "./category";
import { foodOffer } from "./foodOffer";
import { notification } from "./notification";
import { siteSettings } from "./siteSettings";
import { store } from "./store";
import { userProfile } from "./userProfile";

export const schemaTypes = [
  siteSettings,
  category,
  store,
  foodOffer,
  booking,
  notification,
  userProfile,
];
