import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}

export function tryGetImageUrl(
  source: SanityImageSource | null | undefined,
  transform?: (builder: ReturnType<typeof urlForImage>) => ReturnType<typeof urlForImage>,
): string | null {
  if (!source) {
    return null;
  }

  try {
    const chain = transform ? transform(urlForImage(source)) : urlForImage(source);
    return chain.url();
  } catch {
    return null;
  }
}
