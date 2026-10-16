import "server-only";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

const readToken = process.env.SANITY_API_READ_TOKEN?.trim();

/** Серверный клиент; токен только из env на сервере, не попадает в бандл браузера. */
export const sanityServerClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: readToken,
  perspective: "published",
  stega: {
    enabled: false,
  },
});
