import Image from "next/image";
import Link from "next/link";
import { formatStoreAddress } from "@/lib/sanity/format";
import { urlForImage } from "@/lib/sanity/image";
import { siteCardInteractiveClass } from "@/components/ui/site-card";
import type { Store } from "@/lib/sanity/types";

type StoreCardProps = {
  store: Store;
};

export function StoreCard({ store }: StoreCardProps) {
  const imageUrl = store.image
    ? urlForImage(store.image).width(640).height(420).fit("crop").url()
    : null;
  const address = formatStoreAddress(store.address);
  const href = store.slug?.current ? `/stores/${store.slug.current}` : null;

  const content = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-brand/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={store.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No photo
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-xl font-semibold text-brand-dark">
            {store.title}
          </h3>
          {address ? (
            <p className="mt-1 text-sm text-muted">{address}</p>
          ) : null}
        </div>
        {store.description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">
            {store.description}
          </p>
        ) : null}
      </div>
    </>
  );

  const className = `group flex h-full flex-col ${siteCardInteractiveClass}`;

  if (!href) {
    return <article className={className}>{content}</article>;
  }

  return (
    <Link href={href} className={className}>
      <article aria-label={store.title}>{content}</article>
    </Link>
  );
}
