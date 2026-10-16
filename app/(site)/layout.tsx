import { Suspense } from "react";
import {
  SiteFooterLoader,
} from "@/components/layout/site-footer-loader";
import { SiteFooterSkeleton } from "@/components/layout/site-footer";
import {
  SiteHeaderLoader,
} from "@/components/layout/site-header-loader";
import { SiteHeaderSkeleton } from "@/components/layout/site-header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <SiteHeaderLoader />
      </Suspense>
      {children}
      <Suspense fallback={<SiteFooterSkeleton />}>
        <SiteFooterLoader />
      </Suspense>
    </>
  );
}
