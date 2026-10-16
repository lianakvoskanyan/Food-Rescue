import "server-only";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

const manageToken =
  process.env.SANITY_API_READ_TOKEN?.trim() ||
  process.env.SANITY_API_WRITE_TOKEN?.trim();

/**
 * Кабинет продавца / admin: черновики и документы сразу после API-create.
 * Публичный каталог использует sanityServerClient (perspective: published).
 * Если read-токен не задан, используется write-токен (только на сервере).
 */
export const sanityManageClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: manageToken,
  perspective: "raw",
  stega: {
    enabled: false,
  },
});
