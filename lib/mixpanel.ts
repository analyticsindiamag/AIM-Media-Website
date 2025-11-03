"use client";

import mixpanel, { Config } from "mixpanel-browser";

let isInitialized = false;

function getDefaultProps(): Record<string, unknown> {
  // Safe guards for SSR; this file is client-only but keep checks
  if (typeof window === "undefined") return {};

  const url = new URL(window.location.href);
  const utmSource = url.searchParams.get("utm_source") || undefined;
  const utmMedium = url.searchParams.get("utm_medium") || undefined;
  const utmCampaign = url.searchParams.get("utm_campaign") || undefined;
  const utmTerm = url.searchParams.get("utm_term") || undefined;
  const utmContent = url.searchParams.get("utm_content") || undefined;

  const timezone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return undefined;
    }
  })();

  const screen = typeof window !== "undefined" ? window.screen : undefined;
  const navigatorObj = typeof navigator !== "undefined" ? navigator : undefined;

  return {
    page_url: url.href,
    page_path: url.pathname,
    page_query: url.search || undefined,
    page_referrer: document.referrer || undefined,
    language: navigatorObj?.language,
    languages: navigatorObj?.languages?.join(", "),
    user_agent: navigatorObj?.userAgent,
    viewport_width: typeof window !== "undefined" ? window.innerWidth : undefined,
    viewport_height: typeof window !== "undefined" ? window.innerHeight : undefined,
    screen_width: screen?.width,
    screen_height: screen?.height,
    timezone,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_term: utmTerm,
    utm_content: utmContent,
  };
}

export function initMixpanel(customConfig?: Partial<Config>) {
  if (isInitialized) return;
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("NEXT_PUBLIC_MIXPANEL_TOKEN is not set; Mixpanel disabled.");
    }
    return;
  }

  mixpanel.init(token, {
    debug: process.env.NODE_ENV !== "production",
    track_pageview: false, // we'll handle pageviews explicitly
    persistence: "localStorage",
    ignore_dnt: false,
    ...customConfig,
  });
  isInitialized = true;
}

export function identifyUser(distinctId?: string, properties?: Record<string, unknown>) {
  if (!isInitialized) return;
  if (distinctId) {
    mixpanel.identify(distinctId);
  }
  if (properties && Object.keys(properties).length > 0) {
    mixpanel.people.set(properties);
  }
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!isInitialized) return;
  mixpanel.track(eventName, { ...getDefaultProps(), ...(properties || {}) });
}

export function trackPageView(additionalProps?: Record<string, unknown>) {
  trackEvent("Page View", additionalProps);
}

export function getDistinctId(): string | undefined {
  if (!isInitialized) return undefined;
  try {
    return mixpanel.get_distinct_id();
  } catch {
    return undefined;
  }
}

export default {
  initMixpanel,
  identifyUser,
  trackEvent,
  trackPageView,
  getDistinctId,
};


