"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initMixpanel, trackPageView } from "@/lib/mixpanel";

type Props = {
  children: React.ReactNode;
};

export function MixpanelProvider({ children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Init once on mount
  useEffect(() => {
    initMixpanel();
    // Track first load
    trackPageView();
  }, []);

  // Track client-side navigation changes
  useEffect(() => {
    if (!pathname) return;
    // include current query string for UTM/etc
    const query = searchParams?.toString();
    trackPageView({
      page_path: pathname,
      page_query: query ? `?${query}` : undefined,
    });
  }, [pathname, searchParams]);

  return children as React.ReactElement;
}

export default MixpanelProvider;


