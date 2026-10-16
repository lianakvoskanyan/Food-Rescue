"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

type SellerOfferPhotoFieldProps = {
  readOnly?: boolean;
  existingImageUrl?: string | null;
  existingAlt?: string;
  /** Larger block on create pages. */
  prominent?: boolean;
  title?: string;
  hint?: string;
};

export function SellerOfferPhotoField({
  readOnly = false,
  existingImageUrl = null,
  existingAlt = "Current photo",
  prominent = false,
  title = "Bundle photo",
  hint,
}: SellerOfferPhotoFieldProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    if (!file) {
      setPreviewUrl(null);
      setFileName(null);
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
  }

  const displayUrl = previewUrl ?? existingImageUrl;

  return (
    <section
      className={`space-y-3 rounded-2xl border border-dashed border-brand/25 bg-background/60 p-4 sm:p-5 ${
        prominent ? "ring-1 ring-brand/10" : ""
      }`}
      aria-labelledby={`${inputId}-label`}
    >
      <div>
        <h3 id={`${inputId}-label`} className="text-sm font-semibold text-brand-dark">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {hint ??
            (prominent
              ? "Add a photo — it will appear in the catalog after publication."
              : "JPEG, PNG, WebP, or GIF, up to 5 MB.")}
        </p>
      </div>

      {displayUrl ? (
        <div
          className={`relative overflow-hidden rounded-xl border border-brand/10 bg-brand/5 ${
            prominent ? "aspect-[16/10] w-full max-w-xl" : "aspect-[16/10] max-w-md"
          }`}
        >
          <Image
            src={displayUrl}
            alt={previewUrl ? "Preview of selected photo" : existingAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 480px"
            unoptimized={Boolean(previewUrl)}
          />
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center rounded-xl border border-brand/10 bg-surface px-4 text-center text-sm text-muted ${
            prominent ? "min-h-40 max-w-xl py-10" : "min-h-28 max-w-md py-8"
          }`}
        >
          <span className="font-medium text-brand-dark">No photo selected yet</span>
          <span className="mt-1 text-xs">Click &ldquo;Choose file&rdquo; below</span>
        </div>
      )}

      {!readOnly ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Choose file
          </label>
          <input
            id={inputId}
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={onFileChange}
          />
          {fileName ? (
            <span className="truncate text-sm text-muted" title={fileName}>
              {fileName}
            </span>
          ) : existingImageUrl ? (
            <span className="text-xs text-muted">
              The new file will replace the current photo when you save.
            </span>
          ) : (
            <span className="text-xs text-muted">Optional · up to 5 MB</span>
          )}
        </div>
      ) : null}
    </section>
  );
}
