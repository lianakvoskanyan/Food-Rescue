"use client";

import dynamic from "next/dynamic";
import type { StoreMapMarkerData } from "@/lib/stores/map-markers";

function MapLoadingPlaceholder() {
  return (
    <div
      className="flex h-full min-h-[280px] items-center justify-center bg-surface text-sm text-muted"
      role="status"
    >
      Loading map…
    </div>
  );
}

const StoreLeafletMap = dynamic(
  () =>
    import("@/components/maps/store-leaflet-map").then(
      (mod) => mod.StoreLeafletMap,
    ),
  {
    ssr: false,
    loading: () => <MapLoadingPlaceholder />,
  },
);

type StoreMapDynamicProps = {
  markers: StoreMapMarkerData[];
  className?: string;
  heightClassName?: string;
  singleMarkerId?: string;
  interactive?: boolean;
};

export function StoreMapDynamic({
  markers,
  className,
  heightClassName = "h-[min(70vh,520px)]",
  singleMarkerId,
  interactive = true,
}: StoreMapDynamicProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-brand/10 ${heightClassName} ${className ?? ""}`}
    >
      <StoreLeafletMap
        markers={markers}
        singleMarkerId={singleMarkerId}
        interactive={interactive}
      />
    </div>
  );
}
