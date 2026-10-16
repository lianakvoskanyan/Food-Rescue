import "server-only";

import { sanityWriteClient } from "@/lib/sanity/writeClient";
import { SellerServiceError } from "@/lib/seller/errors";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type SanityImageField = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
};

function sanitizeFilename(name: string): string {
  const base = name.replace(/[^\w.\-()+\s]/gi, "").trim() || "offer";
  return base.slice(0, 120);
}

type UploadBlob = Blob & { name?: string; size: number; type?: string };

function isUploadBlob(raw: unknown): raw is UploadBlob {
  return (
    typeof raw === "object" &&
    raw !== null &&
    "arrayBuffer" in raw &&
    typeof (raw as UploadBlob).arrayBuffer === "function" &&
    typeof (raw as UploadBlob).size === "number"
  );
}

export async function parseOfferImageUpload(
  raw: unknown,
): Promise<{ buffer: Buffer; filename: string; contentType: string } | null> {
  if (raw === null || raw === undefined) {
    return null;
  }

  if (typeof raw === "string") {
    return null;
  }

  if (!isUploadBlob(raw)) {
    throw new SellerServiceError("Invalid image file.");
  }

  if (raw.size === 0) {
    return null;
  }

  if (raw.size > MAX_IMAGE_BYTES) {
    throw new SellerServiceError("Image is too large (maximum 5 MB).");
  }

  const contentType = raw.type || "application/octet-stream";
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new SellerServiceError(
      "Only JPEG, PNG, WebP, or GIF images are allowed.",
    );
  }

  const arrayBuffer = await raw.arrayBuffer();
  const name =
    raw instanceof File && raw.name
      ? raw.name
      : typeof raw.name === "string" && raw.name
        ? raw.name
        : "offer.jpg";

  return {
    buffer: Buffer.from(arrayBuffer),
    filename: sanitizeFilename(name),
    contentType,
  };
}

export async function uploadOfferImageField(
  file: { buffer: Buffer; filename: string; contentType: string },
): Promise<SanityImageField> {
  try {
    const asset = await sanityWriteClient.assets.upload("image", file.buffer, {
      filename: file.filename,
      contentType: file.contentType,
    });

    return {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload file to Sanity";
    throw new SellerServiceError(
      `Photo upload failed. Check SANITY_API_WRITE_TOKEN (Editor) and asset permissions. ${message}`,
    );
  }
}
