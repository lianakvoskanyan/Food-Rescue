"use client";

import { useMemo, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import type { StoreMapMarkerData } from "@/lib/stores/map-markers";

const StoreLeafletMap = dynamic(
  () =>
    import("@/components/maps/store-leaflet-map").then(
      (mod) => mod.StoreLeafletMap,
    ),
  {
    ssr: false,
  },
);

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

type StoreMapDynamicProps = {
  markers: StoreMapMarkerData[];
  className?: string;
  heightClassName?: string;
  singleMarkerId?: string;
  interactive?: boolean;
};

function subscribeNoop() {
  return () => {};
}

function useIsClientMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function StoreMapDynamic({
  markers,
  className,
  heightClassName = "h-[min(70vh,520px)]",
  singleMarkerId,
  interactive = true,
}: StoreMapDynamicProps) {
  const mounted = useIsClientMounted();

  const mapInstanceKey = useMemo(
    () =>
      markers
        .map((marker) => `${marker.storeId}:${marker.lat},${marker.lng}`)
        .join("|") || "no-markers",
    [markers],
  );

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-brand/10 ${heightClassName} ${className ?? ""}`}
    >
      {!mounted ? (
        <MapLoadingPlaceholder />
      ) : (
        <StoreLeafletMap
          key={mapInstanceKey}
          markers={markers}
          singleMarkerId={singleMarkerId}
          interactive={interactive}
        />
      )}
    </div>
  );
}
