import type { SanityImageSource } from "@sanity/image-url";
import { tryGetImageUrl } from "@/lib/sanity/image";

export function getStoreMapMarkerImageUrl(
  image: SanityImageSource | null | undefined,
): string | null {
  return tryGetImageUrl(image, (builder) =>
    builder.width(88).height(88).fit("crop").auto("format"),
  );
}

export function getStoreMapPopupImageUrl(
  image: SanityImageSource | null | undefined,
): string | null {
  return tryGetImageUrl(image, (builder) =>
    builder.width(560).height(280).fit("crop").auto("format"),
  );
}

export function getOfferMapPopupThumbUrl(
  image: SanityImageSource | null | undefined,
): string | null {
  return tryGetImageUrl(image, (builder) =>
    builder.width(112).height(112).fit("crop").auto("format"),
  );
}
