import "server-only";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim();

export function isSanityWriteConfigured(): boolean {
  return Boolean(writeToken);
}

/** Server-only client for creating/updating user profiles. */
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: writeToken,
});
