import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/** Публичный read-only клиент без токена (только опубликованный контент публичного dataset). */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: {
    enabled: false,
  },
});
